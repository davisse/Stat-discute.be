"""Narrative node - Researches soft factors (news, injuries, sentiment)"""
import asyncio
import re
from datetime import datetime, timedelta
from typing import Optional
import httpx

from src.models.state import AgentState
from src.tools.db_tool import DatabaseTool


class NarrativeNode:
    """
    The Narrative Researcher finds qualitative factors.

    Responsibilities:
    - Search for injury updates via web search
    - Find motivational factors (revenge games, playoff implications)
    - Analyze coach/player quotes for sentiment
    - Detect rest/travel situations (back-to-back games)
    - Calculate injury impact scores
    """

    # Injury impact weights by position
    POSITION_WEIGHTS = {
        "PG": 1.0,    # Point guards are critical for offense
        "SG": 0.85,
        "SF": 0.80,
        "PF": 0.75,
        "C": 0.90,    # Centers important for defense/rebounding
    }

    # Star player impact multiplier (based on usage rate)
    STAR_THRESHOLD = 25.0  # Usage rate > 25% = star player
    STAR_MULTIPLIER = 1.5

    def __init__(self):
        self.db_tool = DatabaseTool()
        self.http_client = httpx.AsyncClient(timeout=10.0)

    async def __call__(self, state: AgentState) -> AgentState:
        """Execute narrative research"""
        news_data = list(state.get("news_data", []))
        errors = list(state.get("errors", []))
        game_data = state.get("game_data") or {}

        team1 = game_data.get("team1", {})
        team2 = game_data.get("team2", {})
        team1_name = team1.get("full_name") or team1.get("abbreviation", "")
        team2_name = team2.get("full_name") or team2.get("abbreviation", "")

        # Collect all narrative data in parallel
        try:
            results = await asyncio.gather(
                self._search_injury_news(team1_name, team2_name),
                self._detect_back_to_back(game_data),
                self._check_rest_advantage(game_data),
                self._search_motivation_factors(team1_name, team2_name),
                return_exceptions=True
            )

            injury_news, b2b_info, rest_info, motivation_news = results

            # Process injury news
            if isinstance(injury_news, list):
                for item in injury_news:
                    item["category"] = "injury"
                news_data.extend(injury_news)

            # Add back-to-back info as a news item
            if isinstance(b2b_info, dict) and b2b_info.get("has_b2b"):
                news_data.append({
                    "headline": f"{b2b_info['team']} playing back-to-back games",
                    "source": "schedule_analysis",
                    "timestamp": datetime.now().isoformat(),
                    "relevance_score": 0.9,
                    "sentiment": "NEGATIVE",
                    "category": "fatigue",
                    "impact": b2b_info.get("impact", -3.0),
                    "entities": [b2b_info["team"]],
                })

            # Add rest advantage info
            if isinstance(rest_info, dict) and rest_info.get("has_advantage"):
                news_data.append({
                    "headline": f"{rest_info['team']} has {rest_info['days_rest']} days rest advantage",
                    "source": "schedule_analysis",
                    "timestamp": datetime.now().isoformat(),
                    "relevance_score": 0.8,
                    "sentiment": "POSITIVE",
                    "category": "rest",
                    "impact": rest_info.get("impact", 2.0),
                    "entities": [rest_info["team"]],
                })

            # Add motivation factors
            if isinstance(motivation_news, list):
                for item in motivation_news:
                    item["category"] = "motivation"
                news_data.extend(motivation_news)

        except Exception as e:
            errors.append(f"Narrative research error: {str(e)}")

        # Calculate narrative adjustment
        narrative_adjustment = self._calculate_narrative_adjustment(news_data, game_data)

        return {
            **state,
            "current_node": "narrative",
            "news_data": news_data,
            "narrative_adjustment": narrative_adjustment,
            "errors": errors,
        }

    async def _search_injury_news(self, team1: str, team2: str) -> list[dict]:
        """Search for recent injury news for both teams"""
        news_items = []

        if not team1 and not team2:
            return news_items

        # Try to fetch injury data from ESPN or other sources
        try:
            # Search for injury-related terms
            search_terms = []
            if team1:
                search_terms.append(f"{team1} NBA injury report")
            if team2:
                search_terms.append(f"{team2} NBA injury report")

            for term in search_terms:
                items = await self._web_search(term, max_results=3)
                news_items.extend(items)

        except Exception as e:
            # Graceful degradation - return empty if search fails
            pass

        return news_items[:5]  # Limit to 5 items

    async def _web_search(self, query: str, max_results: int = 3) -> list[dict]:
        """
        Perform web search for NBA news.

        Uses DuckDuckGo instant answer API as fallback since it doesn't require API key.
        """
        items = []

        try:
            # DuckDuckGo instant answer API (no API key required)
            url = "https://api.duckduckgo.com/"
            params = {
                "q": query,
                "format": "json",
                "no_html": 1,
                "skip_disambig": 1,
            }

            response = await self.http_client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()

                # Extract related topics
                for topic in data.get("RelatedTopics", [])[:max_results]:
                    if isinstance(topic, dict) and "Text" in topic:
                        items.append({
                            "headline": topic.get("Text", "")[:200],
                            "source": "web_search",
                            "url": topic.get("FirstURL", ""),
                            "timestamp": datetime.now().isoformat(),
                            "relevance_score": 0.6,
                            "sentiment": self._analyze_sentiment(topic.get("Text", "")),
                            "entities": self._extract_entities(topic.get("Text", "")),
                        })

        except Exception:
            pass

        return items

    async def _detect_back_to_back(self, game_data: dict) -> dict:
        """
        Detect if either team is playing on a back-to-back.

        Returns:
            {
                "has_b2b": bool,
                "team": str,  # Team on B2B
                "impact": float,  # Point adjustment
            }
        """
        result = {"has_b2b": False, "team": "", "impact": 0.0}

        team1 = game_data.get("team1", {})
        team2 = game_data.get("team2", {})
        game_date = game_data.get("game_date")

        if not game_date:
            return result

        # Parse game date
        if isinstance(game_date, str):
            try:
                game_date = datetime.fromisoformat(game_date.replace("Z", "+00:00"))
            except ValueError:
                return result

        yesterday = (game_date - timedelta(days=1)).strftime("%Y-%m-%d")

        # Check team1 for B2B
        team1_id = team1.get("team_id")
        team2_id = team2.get("team_id")

        if team1_id:
            b2b_query = """
                SELECT COUNT(*) as games FROM games
                WHERE (home_team_id = $1 OR away_team_id = $1)
                AND game_date::date = $2::date
            """
            try:
                b2b_result = await self.db_tool.execute(b2b_query, [team1_id, yesterday])
                if b2b_result and b2b_result[0].get("games", 0) > 0:
                    result = {
                        "has_b2b": True,
                        "team": team1.get("abbreviation", "Team1"),
                        "impact": -3.0,  # B2B typically worth ~3 points
                    }
                    return result
            except Exception:
                pass

        if team2_id:
            try:
                b2b_result = await self.db_tool.execute(b2b_query, [team2_id, yesterday])
                if b2b_result and b2b_result[0].get("games", 0) > 0:
                    result = {
                        "has_b2b": True,
                        "team": team2.get("abbreviation", "Team2"),
                        "impact": -3.0,
                    }
            except Exception:
                pass

        return result

    async def _check_rest_advantage(self, game_data: dict) -> dict:
        """
        Check for rest advantage (3+ days rest vs opponent).
        """
        result = {"has_advantage": False, "team": "", "days_rest": 0, "impact": 0.0}

        team1 = game_data.get("team1", {})
        team2 = game_data.get("team2", {})
        game_date = game_data.get("game_date")

        if not game_date:
            return result

        # Parse game date
        if isinstance(game_date, str):
            try:
                game_date = datetime.fromisoformat(game_date.replace("Z", "+00:00"))
            except ValueError:
                return result

        # Query to find last game for a team
        last_game_query = """
            SELECT game_date FROM games
            WHERE (home_team_id = $1 OR away_team_id = $1)
            AND game_date < $2
            ORDER BY game_date DESC
            LIMIT 1
        """

        team1_rest = None
        team2_rest = None

        team1_id = team1.get("team_id")
        team2_id = team2.get("team_id")

        try:
            if team1_id:
                result1 = await self.db_tool.execute(
                    last_game_query, [team1_id, game_date.strftime("%Y-%m-%d")]
                )
                if result1:
                    last_date = result1[0].get("game_date")
                    if last_date:
                        if isinstance(last_date, str):
                            last_date = datetime.fromisoformat(last_date)
                        team1_rest = (game_date.date() - last_date.date()).days

            if team2_id:
                result2 = await self.db_tool.execute(
                    last_game_query, [team2_id, game_date.strftime("%Y-%m-%d")]
                )
                if result2:
                    last_date = result2[0].get("game_date")
                    if last_date:
                        if isinstance(last_date, str):
                            last_date = datetime.fromisoformat(last_date)
                        team2_rest = (game_date.date() - last_date.date()).days
        except Exception:
            pass

        # Check for significant rest advantage (2+ days difference)
        if team1_rest is not None and team2_rest is not None:
            diff = team1_rest - team2_rest
            if diff >= 2:
                result = {
                    "has_advantage": True,
                    "team": team1.get("abbreviation", "Team1"),
                    "days_rest": team1_rest,
                    "opponent_rest": team2_rest,
                    "impact": min(diff * 1.0, 3.0),  # Cap at 3 points
                }
            elif diff <= -2:
                result = {
                    "has_advantage": True,
                    "team": team2.get("abbreviation", "Team2"),
                    "days_rest": team2_rest,
                    "opponent_rest": team1_rest,
                    "impact": min(abs(diff) * 1.0, 3.0),
                }

        return result

    async def _search_motivation_factors(self, team1: str, team2: str) -> list[dict]:
        """
        Search for motivation factors like revenge games, playoff implications.
        """
        items = []

        # Search for recent matchup/rivalry news
        if team1 and team2:
            search_query = f"{team1} vs {team2} NBA preview"
            items = await self._web_search(search_query, max_results=2)

        return items

    def _analyze_sentiment(self, text: str) -> str:
        """
        Simple rule-based sentiment analysis for injury/news text.
        """
        text_lower = text.lower()

        # Negative indicators (injuries, suspensions, etc.)
        negative_patterns = [
            "out", "injured", "injury", "miss", "ruled out", "doubtful",
            "questionable", "sidelined", "surgery", "torn", "sprain",
            "fracture", "concussion", "illness", "suspended", "rest",
            "load management", "dnp", "will not play"
        ]

        # Positive indicators (returns, good health)
        positive_patterns = [
            "return", "cleared", "healthy", "available", "upgraded",
            "will play", "expected to play", "probable", "back in lineup",
            "recovered", "ready"
        ]

        neg_count = sum(1 for p in negative_patterns if p in text_lower)
        pos_count = sum(1 for p in positive_patterns if p in text_lower)

        if neg_count > pos_count:
            return "NEGATIVE"
        elif pos_count > neg_count:
            return "POSITIVE"
        return "NEUTRAL"

    def _extract_entities(self, text: str) -> list[str]:
        """Extract team and player names from text."""
        entities = []

        # NBA team patterns
        team_patterns = [
            r"Lakers", r"Celtics", r"Warriors", r"Heat", r"Bulls",
            r"Nets", r"Knicks", r"76ers", r"Sixers", r"Bucks",
            r"Suns", r"Clippers", r"Mavericks", r"Nuggets", r"Thunder",
            r"Grizzlies", r"Timberwolves", r"Pelicans", r"Spurs", r"Kings",
            r"Trail Blazers", r"Jazz", r"Rockets", r"Hawks", r"Hornets",
            r"Wizards", r"Magic", r"Pacers", r"Pistons", r"Cavaliers", r"Raptors"
        ]

        for pattern in team_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                entities.append(pattern)

        return entities[:5]  # Limit entities

    def _calculate_narrative_adjustment(self, news_data: list, game_data: dict) -> dict:
        """
        Calculate point adjustment based on narrative factors.

        Returns:
            {
                "team1_adjustment": float,  # Points to add/subtract for team1
                "team2_adjustment": float,
                "factors": list[str],       # Reasons for adjustments
            }
        """
        team1 = game_data.get("team1", {})
        team2 = game_data.get("team2", {})
        team1_abbrev = team1.get("abbreviation", "")
        team2_abbrev = team2.get("abbreviation", "")

        team1_adj = 0.0
        team2_adj = 0.0
        factors = []

        for item in news_data:
            category = item.get("category", "")
            sentiment = item.get("sentiment", "NEUTRAL")
            impact = item.get("impact", 0.0)
            entities = item.get("entities", [])

            # Determine which team this affects
            affects_team1 = any(team1_abbrev.lower() in e.lower() for e in entities) if team1_abbrev else False
            affects_team2 = any(team2_abbrev.lower() in e.lower() for e in entities) if team2_abbrev else False

            # For fatigue/B2B
            if category == "fatigue":
                if affects_team1 or team1_abbrev in item.get("headline", ""):
                    team1_adj += impact  # Negative impact
                    factors.append(f"{team1_abbrev} on B2B ({impact:+.1f})")
                elif affects_team2 or team2_abbrev in item.get("headline", ""):
                    team2_adj += impact
                    factors.append(f"{team2_abbrev} on B2B ({impact:+.1f})")

            # For rest advantage
            elif category == "rest":
                if affects_team1 or team1_abbrev in item.get("headline", ""):
                    team1_adj += impact  # Positive impact
                    factors.append(f"{team1_abbrev} rest advantage ({impact:+.1f})")
                elif affects_team2 or team2_abbrev in item.get("headline", ""):
                    team2_adj += impact
                    factors.append(f"{team2_abbrev} rest advantage ({impact:+.1f})")

            # For injuries (estimated impact based on sentiment)
            elif category == "injury":
                injury_impact = -2.0 if sentiment == "NEGATIVE" else 1.0 if sentiment == "POSITIVE" else 0.0
                if affects_team1:
                    team1_adj += injury_impact
                    if injury_impact != 0:
                        factors.append(f"{team1_abbrev} injury news ({injury_impact:+.1f})")
                elif affects_team2:
                    team2_adj += injury_impact
                    if injury_impact != 0:
                        factors.append(f"{team2_abbrev} injury news ({injury_impact:+.1f})")

        return {
            "team1_adjustment": round(team1_adj, 1),
            "team2_adjustment": round(team2_adj, 1),
            "net_adjustment": round(team1_adj - team2_adj, 1),  # Positive = team1 favored more
            "factors": factors,
        }

    async def close(self):
        """Close HTTP client"""
        await self.http_client.aclose()


# Functional interface for LangGraph
async def narrative_node(state: AgentState) -> AgentState:
    """Narrative node function for LangGraph"""
    node = NarrativeNode()
    try:
        return await node(state)
    finally:
        await node.close()
