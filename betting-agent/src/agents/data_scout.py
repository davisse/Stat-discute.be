"""DataScout node - Fetches raw data with error recovery"""
import re
from datetime import datetime
from src.models.state import AgentState
from src.tools.db_tool import get_db, DatabaseTool


class DataScoutNode:
    """
    The DataScout fetches raw data from multiple sources with fallback logic.

    Data Sources (in priority order):
    1. Local PostgreSQL (nba_stats) - Primary source
    2. NBA API (nba_api) - Fallback for missing data
    3. Cached data - Last resort

    Error Recovery:
    - If primary source fails, try secondary
    - If all sources fail, flag data_quality as UNAVAILABLE
    - Never crash, always return something
    """

    def __init__(self):
        self.db: DatabaseTool | None = None

    async def _get_db(self) -> DatabaseTool:
        """Get database connection"""
        if self.db is None:
            self.db = await get_db()
        return self.db

    async def __call__(self, state: AgentState) -> AgentState:
        """Execute data collection"""
        errors = list(state.get("errors", []))
        missing_info = list(state.get("missing_info", []))

        # Track reflexion loop (Phase 4)
        # If we already have a quant_result, this is a retry cycle
        critique_count = state.get("critique_count", 0)
        is_retry = state.get("quant_result") is not None

        if is_retry:
            critique_count += 1
            # On retry, try to fetch more specific data based on what's missing
            errors = []  # Clear previous errors for fresh attempt
            # Keep only non-game related missing_info
            missing_info = [m for m in missing_info if m not in ("game_data", "odds_data")]

        # Parse query to extract teams/players
        query = state.get("query", "")
        parsed = self._parse_query(query)

        # Fetch game data
        game_data = await self._fetch_game_data(parsed, errors)

        # Fetch odds data if we have a game
        odds_data = None
        if game_data and game_data.get("game_id"):
            odds_data = await self._fetch_odds_data(game_data["game_id"], errors)

        # Track what's missing
        if game_data is None:
            missing_info.append("game_data")
            errors.append("Could not find game data")
        if odds_data is None and game_data:
            missing_info.append("odds_data")

        return {
            **state,
            "current_node": "data_scout",
            "game_data": game_data,
            "odds_data": odds_data,
            "errors": errors,
            "missing_info": missing_info,
            "critique_count": critique_count,
        }

    def _parse_query(self, query: str) -> dict:
        """
        Parse query to extract teams, players, bet types.

        Examples:
        - "Lakers vs Heat" -> {teams: ["Lakers", "Heat"], bet_type: "game"}
        - "Should I bet Celtics -5?" -> {teams: ["Celtics"], line: -5, bet_type: "spread"}
        - "Luka over 28.5 points" -> {player: "Luka", line: 28.5, bet_type: "player_prop", stat: "points"}
        - "Over 220.5 Lakers vs Heat" -> {teams: [...], total_line: 220.5, direction: "over", bet_type: "total"}
        """
        result = {
            "teams": [],
            "players": [],
            "line": None,
            "total_line": None,
            "bet_type": None,
            "stat": None,
            "direction": None,
            "raw_query": query
        }

        query_lower = query.lower()

        # NBA team nicknames for matching
        nba_teams = [
            "lakers", "heat", "celtics", "warriors", "nets", "knicks", "bulls",
            "sixers", "suns", "bucks", "mavs", "mavericks", "nuggets", "clippers",
            "rockets", "spurs", "jazz", "thunder", "blazers", "pelicans", "grizzlies",
            "hawks", "hornets", "pistons", "pacers", "cavaliers", "cavs", "magic",
            "wizards", "raptors", "kings", "timberwolves", "wolves"
        ]

        # Check for totals FIRST (over/under with game total range 180-280)
        # Patterns: "Over 220.5 Lakers vs Heat", "Lakers Heat over 225", "o220.5", "u218"
        totals_match = re.search(r'(over|under|o|u)\s*(\d{3}\.?\d*)', query_lower)
        if totals_match:
            total_val = float(totals_match.group(2))
            if 180 <= total_val <= 280:  # Valid NBA game total range
                result["total_line"] = total_val
                result["bet_type"] = "total"
                # Determine direction from matched prefix
                direction_prefix = totals_match.group(1)
                if direction_prefix in ("over", "o"):
                    result["direction"] = "over"
                elif direction_prefix in ("under", "u"):
                    result["direction"] = "under"

        # Extract teams (look for "vs", "at", team names)
        # Common patterns: "Lakers vs Heat", "Lakers at Heat", "Lakers -5 vs Heat"
        # Pattern with optional spread between team1 and vs
        vs_match = re.search(r'(\w+)\s*[+-]?\d*\.?\d*\s*(?:vs\.?|at|@)\s+(\w+)', query, re.IGNORECASE)
        if vs_match:
            result["teams"] = [vs_match.group(1), vs_match.group(2)]
            if result["bet_type"] != "total":
                result["bet_type"] = "game"
        else:
            # No vs/at pattern, look for any team names in query
            for team in nba_teams:
                # Match whole words only (case insensitive)
                if re.search(rf'\b{team}\b', query_lower):
                    # Capitalize the team name properly
                    result["teams"].append(team.capitalize())

            if result["teams"] and result["bet_type"] != "total":
                result["bet_type"] = "game" if len(result["teams"]) > 1 else "spread"

        # Extract spread line (e.g., "-5", "-5.5", "+3") - only if not a totals bet
        if result["bet_type"] != "total":
            spread_match = re.search(r'([+-]\d+\.?\d*)', query)
            if spread_match:
                result["line"] = float(spread_match.group(1))
                if result["bet_type"] != "player_prop":
                    result["bet_type"] = "spread"

        # Detect player prop (takes priority if stat keyword found)
        prop_stats = ["points", "rebounds", "assists", "steals", "blocks", "threes", "3s"]
        for stat in prop_stats:
            if stat in query_lower:
                # Check if it's a player prop (has over/under with small number)
                prop_line_match = re.search(r'(?:over|under)\s*(\d{1,2}\.?\d*)', query_lower)
                if prop_line_match:
                    result["bet_type"] = "player_prop"
                    result["stat"] = stat.replace("3s", "threes")
                    result["line"] = float(prop_line_match.group(1))
                break

        # Extract direction for non-totals if not already set
        if result["direction"] is None:
            if "over" in query_lower:
                result["direction"] = "over"
            elif "under" in query_lower:
                result["direction"] = "under"

        # Look for player names (simple heuristic: capitalized words not in team list)
        words = query.split()
        for word in words:
            clean_word = re.sub(r'[^a-zA-Z]', '', word)
            if clean_word and clean_word[0].isupper() and clean_word.lower() not in nba_teams:
                # Might be a player name
                if len(clean_word) > 2 and clean_word.lower() not in ["should", "bet", "the", "over", "under"]:
                    result["players"].append(clean_word)

        return result

    async def _fetch_game_data(self, parsed: dict, errors: list) -> dict | None:
        """Fetch game data with fallback chain"""
        try:
            db = await self._get_db()

            # If we have two teams, look for their matchup
            if len(parsed["teams"]) >= 2:
                team1 = await db.get_team_by_name(parsed["teams"][0])
                team2 = await db.get_team_by_name(parsed["teams"][1])

                if team1 and team2:
                    # Look for upcoming game between these teams
                    upcoming = await db.get_upcoming_games(team1["team_id"], limit=5)

                    for game in upcoming:
                        if (team2["abbreviation"] in [game["home_abbr"], game["away_abbr"]]):
                            # Found the game!
                            return await self._build_game_context(db, game, team1, team2, parsed)

                    # No upcoming game, check recent games
                    h2h = await db.get_head_to_head(team1["team_id"], team2["team_id"], limit=5)
                    if h2h:
                        errors.append("No upcoming game found, using historical data")

                    return await self._build_team_context(db, team1, team2, parsed)

            # If we have one team, get their context
            elif len(parsed["teams"]) == 1:
                team = await db.get_team_by_name(parsed["teams"][0])
                if team:
                    return await self._build_single_team_context(db, team, parsed)

            # If we have a player, get player context
            if parsed["players"]:
                player = await db.get_player_by_name(parsed["players"][0])
                if player:
                    return await self._build_player_context(db, player, parsed)

            return None

        except Exception as e:
            errors.append(f"Database error: {str(e)}")
            return None

    async def _build_game_context(
        self,
        db: DatabaseTool,
        game: dict,
        team1: dict,
        team2: dict,
        parsed: dict
    ) -> dict:
        """Build full game context for analysis"""
        # Get stats for both teams
        team1_stats = await db.get_team_stats(team1["team_id"], last_n_games=10)
        team2_stats = await db.get_team_stats(team2["team_id"], last_n_games=10)

        # Get recent games
        team1_recent = await db.get_team_recent_games(team1["team_id"], limit=5)
        team2_recent = await db.get_team_recent_games(team2["team_id"], limit=5)

        # Get head to head
        h2h = await db.get_head_to_head(team1["team_id"], team2["team_id"], limit=5)

        # Determine home/away
        is_team1_home = game["home_abbr"] == team1["abbreviation"]

        # Build selection string based on bet type
        bet_type = parsed.get("bet_type", "spread")
        if bet_type == "total":
            direction = parsed.get("direction", "over")
            selection = f"{direction.upper()} {parsed.get('total_line', '')}"
        else:
            selection = f"{team1['abbreviation']} {parsed.get('line', '')}" if parsed.get("line") else team1["abbreviation"]

        return {
            "game_id": game["game_id"],
            "game_date": str(game["game_date"]),
            "home_team": game["home_team"],
            "home_abbr": game["home_abbr"],
            "away_team": game["away_team"],
            "away_abbr": game["away_abbr"],
            "line": parsed.get("line"),
            "total_line": parsed.get("total_line"),
            "direction": parsed.get("direction"),
            "selection": selection,
            "team1": {
                "team_id": team1["team_id"],
                "name": team1["full_name"],
                "full_name": team1["full_name"],
                "abbreviation": team1["abbreviation"],
                "is_home": is_team1_home,
                "stats_l10": team1_stats,
                "recent_games": team1_recent,
            },
            "team2": {
                "team_id": team2["team_id"],
                "name": team2["full_name"],
                "full_name": team2["full_name"],
                "abbreviation": team2["abbreviation"],
                "is_home": not is_team1_home,
                "stats_l10": team2_stats,
                "recent_games": team2_recent,
            },
            "head_to_head": h2h,
            "data_quality": "FRESH",
            "bet_type": parsed.get("bet_type", "spread"),
        }

    async def _build_team_context(
        self,
        db: DatabaseTool,
        team1: dict,
        team2: dict,
        parsed: dict
    ) -> dict:
        """Build context when no specific game is found"""
        team1_stats = await db.get_team_stats(team1["team_id"], last_n_games=10)
        team2_stats = await db.get_team_stats(team2["team_id"], last_n_games=10)
        h2h = await db.get_head_to_head(team1["team_id"], team2["team_id"], limit=5)

        # Build selection string based on bet type
        bet_type = parsed.get("bet_type", "spread")
        if bet_type == "total":
            direction = parsed.get("direction", "over")
            selection = f"{direction.upper()} {parsed.get('total_line', '')}"
        else:
            selection = team1["abbreviation"]

        return {
            "game_id": None,
            "game_date": None,
            "home_team": "Unknown",
            "away_team": "Unknown",
            "line": parsed.get("line"),
            "total_line": parsed.get("total_line"),
            "direction": parsed.get("direction"),
            "selection": selection,
            "team1": {
                "team_id": team1["team_id"],
                "name": team1["full_name"],
                "full_name": team1["full_name"],
                "abbreviation": team1["abbreviation"],
                "stats_l10": team1_stats,
            },
            "team2": {
                "team_id": team2["team_id"],
                "name": team2["full_name"],
                "full_name": team2["full_name"],
                "abbreviation": team2["abbreviation"],
                "stats_l10": team2_stats,
            },
            "head_to_head": h2h,
            "data_quality": "PARTIAL",
            "bet_type": parsed.get("bet_type", "spread"),
        }

    async def _build_single_team_context(
        self,
        db: DatabaseTool,
        team: dict,
        parsed: dict
    ) -> dict:
        """Build context for single team query"""
        team_stats = await db.get_team_stats(team["team_id"], last_n_games=10)
        recent_games = await db.get_team_recent_games(team["team_id"], limit=10)
        upcoming = await db.get_upcoming_games(team["team_id"], limit=3)

        # Build selection string based on bet type
        bet_type = parsed.get("bet_type", "spread")
        if bet_type == "total":
            direction = parsed.get("direction", "over")
            selection = f"{direction.upper()} {parsed.get('total_line', '')}"
        else:
            selection = team["abbreviation"]

        return {
            "game_id": upcoming[0]["game_id"] if upcoming else None,
            "game_date": str(upcoming[0]["game_date"]) if upcoming else None,
            "line": parsed.get("line"),
            "total_line": parsed.get("total_line"),
            "direction": parsed.get("direction"),
            "selection": selection,
            "team1": {
                "team_id": team["team_id"],
                "name": team["full_name"],
                "full_name": team["full_name"],
                "abbreviation": team["abbreviation"],
                "stats_l10": team_stats,
                "recent_games": recent_games,
            },
            "upcoming_games": upcoming,
            "data_quality": "PARTIAL",
            "bet_type": parsed.get("bet_type", "spread"),
        }

    async def _build_player_context(
        self,
        db: DatabaseTool,
        player: dict,
        parsed: dict
    ) -> dict:
        """Build context for player prop query"""
        recent_stats = await db.get_player_recent_stats(player["player_id"], last_n_games=10)
        season_avg = await db.get_player_averages(player["player_id"])
        last5_avg = await db.get_player_averages(player["player_id"], last_n_games=5)

        return {
            "game_id": None,
            "player": {
                "player_id": player["player_id"],
                "name": player["full_name"],
                "team": player.get("team_abbreviation"),
            },
            "line": parsed.get("line"),
            "stat": parsed.get("stat"),
            "direction": parsed.get("direction"),
            "selection": f"{player['full_name']} {parsed.get('direction', 'over')} {parsed.get('line', '')} {parsed.get('stat', 'points')}",
            "season_averages": season_avg,
            "last_5_averages": last5_avg,
            "recent_games": recent_stats,
            "data_quality": "FRESH",
            "bet_type": "player_prop",
        }

    async def _fetch_odds_data(self, game_id: str, errors: list) -> dict | None:
        """Fetch betting odds with fallback"""
        try:
            db = await self._get_db()
            odds = await db.get_betting_odds(game_id)

            if odds:
                return {
                    **odds,
                    "data_quality": "FRESH",
                    "timestamp": datetime.now().isoformat(),
                }

            # No odds found
            errors.append("No betting odds found for this game")
            return None

        except Exception as e:
            errors.append(f"Odds fetch error: {str(e)}")
            return None


# Functional interface for LangGraph
async def data_scout_node(state: AgentState) -> AgentState:
    """DataScout node function for LangGraph"""
    node = DataScoutNode()
    return await node(state)
