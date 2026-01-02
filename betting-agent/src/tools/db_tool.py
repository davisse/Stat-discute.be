"""Database tool for connecting to nba_stats PostgreSQL"""
import os
from typing import Any
from dataclasses import dataclass
import asyncpg
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


@dataclass
class QueryResult:
    """Result of a database query"""
    data: list[dict]
    row_count: int
    success: bool
    error: str | None = None
    source: str = "postgresql"


class DatabaseTool:
    """
    Async PostgreSQL connection tool for nba_stats database.

    Uses asyncpg for high-performance async queries.
    Implements connection pooling for efficiency.
    """

    def __init__(self):
        self.pool: asyncpg.Pool | None = None
        self.config = {
            "host": os.getenv("DB_HOST", "localhost"),
            "port": int(os.getenv("DB_PORT", "5432")),
            "database": os.getenv("DB_NAME", "nba_stats"),
            "user": os.getenv("DB_USER", "chapirou"),
            "password": os.getenv("DB_PASSWORD", ""),
        }

    async def connect(self) -> None:
        """Initialize connection pool"""
        if self.pool is None:
            self.pool = await asyncpg.create_pool(
                **self.config,
                min_size=2,
                max_size=10,
                command_timeout=30,
            )

    async def close(self) -> None:
        """Close connection pool"""
        if self.pool:
            await self.pool.close()
            self.pool = None

    async def execute(self, query: str, params: list | None = None) -> QueryResult:
        """Execute a query and return results"""
        if self.pool is None:
            await self.connect()

        try:
            async with self.pool.acquire() as conn:
                if params:
                    rows = await conn.fetch(query, *params)
                else:
                    rows = await conn.fetch(query)

                data = [dict(row) for row in rows]
                return QueryResult(
                    data=data,
                    row_count=len(data),
                    success=True,
                    source="postgresql"
                )
        except Exception as e:
            return QueryResult(
                data=[],
                row_count=0,
                success=False,
                error=str(e),
                source="postgresql"
            )

    async def get_current_season(self) -> str:
        """Get current NBA season"""
        result = await self.execute("""
            SELECT season_id FROM seasons WHERE is_current = true LIMIT 1
        """)
        if result.success and result.data:
            return result.data[0]["season_id"]
        return "2025-26"  # Fallback

    async def get_team_by_name(self, name: str) -> dict | None:
        """Find team by name or abbreviation"""
        result = await self.execute("""
            SELECT team_id, full_name, abbreviation, city, nickname
            FROM teams
            WHERE LOWER(full_name) LIKE LOWER($1)
               OR LOWER(abbreviation) = LOWER($2)
               OR LOWER(nickname) LIKE LOWER($1)
               OR LOWER(city) LIKE LOWER($1)
            LIMIT 1
        """, [f"%{name}%", name])
        return result.data[0] if result.data else None

    async def get_upcoming_games(self, team_id: int | None = None, limit: int = 10) -> list[dict]:
        """Get upcoming games (games with no score yet)"""
        season = await self.get_current_season()

        if team_id:
            result = await self.execute("""
                SELECT g.game_id, g.game_date,
                       ht.full_name as home_team, ht.abbreviation as home_abbr,
                       at.full_name as away_team, at.abbreviation as away_abbr
                FROM games g
                JOIN teams ht ON g.home_team_id = ht.team_id
                JOIN teams at ON g.away_team_id = at.team_id
                WHERE g.season = $1
                  AND g.home_team_score IS NULL
                  AND (g.home_team_id = $2 OR g.away_team_id = $2)
                ORDER BY g.game_date
                LIMIT $3
            """, [season, team_id, limit])
        else:
            result = await self.execute("""
                SELECT g.game_id, g.game_date,
                       ht.full_name as home_team, ht.abbreviation as home_abbr,
                       at.full_name as away_team, at.abbreviation as away_abbr
                FROM games g
                JOIN teams ht ON g.home_team_id = ht.team_id
                JOIN teams at ON g.away_team_id = at.team_id
                WHERE g.season = $1
                  AND g.home_team_score IS NULL
                ORDER BY g.game_date
                LIMIT $2
            """, [season, limit])

        return result.data

    async def get_team_recent_games(self, team_id: int, limit: int = 10) -> list[dict]:
        """Get recent completed games for a team"""
        season = await self.get_current_season()

        result = await self.execute("""
            SELECT g.game_id, g.game_date,
                   ht.abbreviation as home_team, at.abbreviation as away_team,
                   g.home_team_score, g.away_team_score,
                   CASE
                       WHEN g.home_team_id = $2 THEN 'HOME'
                       ELSE 'AWAY'
                   END as location,
                   CASE
                       WHEN (g.home_team_id = $2 AND g.home_team_score > g.away_team_score)
                         OR (g.away_team_id = $2 AND g.away_team_score > g.home_team_score)
                       THEN 'W'
                       ELSE 'L'
                   END as result
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE g.season = $1
              AND g.home_team_score IS NOT NULL
              AND (g.home_team_id = $2 OR g.away_team_id = $2)
            ORDER BY g.game_date DESC
            LIMIT $3
        """, [season, team_id, limit])

        return result.data

    async def get_team_stats(self, team_id: int, last_n_games: int = 10) -> dict:
        """Get team statistics over last N games"""
        season = await self.get_current_season()

        result = await self.execute("""
            WITH team_games AS (
                SELECT g.game_id, g.game_date,
                       CASE WHEN g.home_team_id = $2 THEN g.home_team_score ELSE g.away_team_score END as team_score,
                       CASE WHEN g.home_team_id = $2 THEN g.away_team_score ELSE g.home_team_score END as opp_score,
                       CASE WHEN g.home_team_id = $2 THEN 'HOME' ELSE 'AWAY' END as location
                FROM games g
                WHERE g.season = $1
                  AND g.home_team_score IS NOT NULL
                  AND (g.home_team_id = $2 OR g.away_team_id = $2)
                ORDER BY g.game_date DESC
                LIMIT $3
            )
            SELECT
                COUNT(*) as games,
                SUM(CASE WHEN team_score > opp_score THEN 1 ELSE 0 END) as wins,
                ROUND(AVG(team_score), 1) as ppg,
                ROUND(AVG(opp_score), 1) as opp_ppg,
                ROUND(AVG(team_score - opp_score), 1) as avg_margin,
                ROUND(AVG(team_score + opp_score), 1) as avg_total,
                SUM(CASE WHEN location = 'HOME' THEN 1 ELSE 0 END) as home_games,
                SUM(CASE WHEN location = 'AWAY' THEN 1 ELSE 0 END) as away_games
            FROM team_games
        """, [season, team_id, last_n_games])

        return result.data[0] if result.data else {}

    async def get_player_by_name(self, name: str) -> dict | None:
        """Find player by name with accent-insensitive matching.

        Uses PostgreSQL unaccent() to handle Jokic = Jokić, etc.
        Priority:
        1. Exact full name match (unaccent, case-insensitive)
        2. Last name / partial match (if multi-word name)
        3. General LIKE search
        """
        # Try exact match first with unaccent (Jokic = Jokić)
        result = await self.execute("""
            SELECT p.player_id, p.full_name, p.first_name, p.last_name,
                   t.abbreviation as team_abbreviation, t.full_name as team_name
            FROM players p
            LEFT JOIN player_game_stats pgs ON p.player_id = pgs.player_id
            LEFT JOIN teams t ON pgs.team_id = t.team_id
            WHERE LOWER(unaccent(p.full_name)) = LOWER(unaccent($1))
            GROUP BY p.player_id, p.full_name, p.first_name, p.last_name,
                     t.abbreviation, t.full_name
            ORDER BY COUNT(pgs.game_id) DESC
            LIMIT 1
        """, [name])

        if result.data:
            return result.data[0]

        # Try matching last name if multi-word name provided
        name_parts = name.strip().split()
        if len(name_parts) >= 2:
            last_name = name_parts[-1]  # e.g., "Jokic" from "Nikola Jokic"
            result = await self.execute("""
                SELECT p.player_id, p.full_name, p.first_name, p.last_name,
                       t.abbreviation as team_abbreviation, t.full_name as team_name
                FROM players p
                LEFT JOIN player_game_stats pgs ON p.player_id = pgs.player_id
                LEFT JOIN teams t ON pgs.team_id = t.team_id
                WHERE unaccent(p.full_name) ILIKE unaccent($1)
                GROUP BY p.player_id, p.full_name, p.first_name, p.last_name,
                         t.abbreviation, t.full_name
                ORDER BY COUNT(pgs.game_id) DESC
                LIMIT 1
            """, [f"%{last_name}%"])

            if result.data:
                return result.data[0]

        # Fall back to general LIKE search with unaccent
        result = await self.execute("""
            SELECT p.player_id, p.full_name, p.first_name, p.last_name,
                   t.abbreviation as team_abbreviation, t.full_name as team_name
            FROM players p
            LEFT JOIN player_game_stats pgs ON p.player_id = pgs.player_id
            LEFT JOIN teams t ON pgs.team_id = t.team_id
            WHERE unaccent(p.full_name) ILIKE unaccent($1)
            GROUP BY p.player_id, p.full_name, p.first_name, p.last_name,
                     t.abbreviation, t.full_name
            ORDER BY COUNT(pgs.game_id) DESC
            LIMIT 1
        """, [f"%{name}%"])
        return result.data[0] if result.data else None

    async def get_player_recent_stats(self, player_id: int, last_n_games: int = 10) -> list[dict]:
        """Get player's recent game stats"""
        season = await self.get_current_season()

        result = await self.execute("""
            SELECT pgs.game_id, g.game_date,
                   t.abbreviation as team,
                   opp.abbreviation as opponent,
                   pgs.minutes, pgs.points, pgs.rebounds, pgs.assists,
                   pgs.steals, pgs.blocks, pgs.turnovers,
                   pgs.fg_made, pgs.fg_attempted, pgs.fg_pct,
                   pgs.fg3_made, pgs.fg3_attempted, pgs.fg3_pct,
                   pgs.ft_made, pgs.ft_attempted, pgs.ft_pct,
                   CASE WHEN g.home_team_id = pgs.team_id THEN 'HOME' ELSE 'AWAY' END as location
            FROM player_game_stats pgs
            JOIN games g ON pgs.game_id = g.game_id
            JOIN teams t ON pgs.team_id = t.team_id
            JOIN teams opp ON (
                CASE WHEN g.home_team_id = pgs.team_id
                     THEN g.away_team_id
                     ELSE g.home_team_id
                END = opp.team_id
            )
            WHERE pgs.player_id = $1
              AND g.season = $2
            ORDER BY g.game_date DESC
            LIMIT $3
        """, [player_id, season, last_n_games])

        return result.data

    async def get_player_averages(self, player_id: int, last_n_games: int | None = None) -> dict:
        """Get player's season averages or last N games averages"""
        season = await self.get_current_season()

        if last_n_games:
            result = await self.execute("""
                WITH recent_games AS (
                    SELECT pgs.*
                    FROM player_game_stats pgs
                    JOIN games g ON pgs.game_id = g.game_id
                    WHERE pgs.player_id = $1
                      AND g.season = $2
                    ORDER BY g.game_date DESC
                    LIMIT $3
                )
                SELECT
                    COUNT(*) as games,
                    ROUND(AVG(minutes), 1) as minutes_avg,
                    ROUND(AVG(points), 1) as points_avg,
                    ROUND(AVG(rebounds), 1) as rebounds_avg,
                    ROUND(AVG(assists), 1) as assists_avg,
                    ROUND(AVG(steals), 1) as steals_avg,
                    ROUND(AVG(blocks), 1) as blocks_avg,
                    ROUND(AVG(turnovers), 1) as turnovers_avg,
                    ROUND(AVG(fg3_made), 1) as fg3_made_avg,
                    ROUND(AVG(fg_pct), 3) as fg_pct,
                    ROUND(AVG(fg3_pct), 3) as fg3_pct,
                    ROUND(AVG(ft_pct), 3) as ft_pct,
                    ROUND(SUM(points)::numeric / NULLIF(2 * (SUM(fg_attempted) + 0.44 * SUM(ft_attempted)), 0), 3) as ts_pct
                FROM recent_games
            """, [player_id, season, last_n_games])
        else:
            result = await self.execute("""
                SELECT
                    COUNT(*) as games,
                    ROUND(AVG(pgs.minutes), 1) as minutes_avg,
                    ROUND(AVG(pgs.points), 1) as points_avg,
                    ROUND(AVG(pgs.rebounds), 1) as rebounds_avg,
                    ROUND(AVG(pgs.assists), 1) as assists_avg,
                    ROUND(AVG(pgs.steals), 1) as steals_avg,
                    ROUND(AVG(pgs.blocks), 1) as blocks_avg,
                    ROUND(AVG(pgs.turnovers), 1) as turnovers_avg,
                    ROUND(AVG(pgs.fg3_made), 1) as fg3_made_avg,
                    ROUND(AVG(pgs.fg_pct), 3) as fg_pct,
                    ROUND(AVG(pgs.fg3_pct), 3) as fg3_pct,
                    ROUND(AVG(pgs.ft_pct), 3) as ft_pct,
                    ROUND(SUM(pgs.points)::numeric / NULLIF(2 * (SUM(pgs.fg_attempted) + 0.44 * SUM(pgs.ft_attempted)), 0), 3) as ts_pct
                FROM player_game_stats pgs
                JOIN games g ON pgs.game_id = g.game_id
                WHERE pgs.player_id = $1
                  AND g.season = $2
            """, [player_id, season])

        return result.data[0] if result.data else {}

    async def get_head_to_head(self, team1_id: int, team2_id: int, limit: int = 10) -> list[dict]:
        """Get head-to-head history between two teams"""
        result = await self.execute("""
            SELECT g.game_id, g.game_date, g.season,
                   ht.abbreviation as home_team, at.abbreviation as away_team,
                   g.home_team_score, g.away_team_score
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE ((g.home_team_id = $1 AND g.away_team_id = $2)
                OR (g.home_team_id = $2 AND g.away_team_id = $1))
              AND g.home_team_score IS NOT NULL
            ORDER BY g.game_date DESC
            LIMIT $3
        """, [team1_id, team2_id, limit])

        return result.data

    async def get_team_totals_context(self, team_id: int, last_n_games: int = 10) -> dict:
        """
        Get comprehensive totals context for a team.

        Returns:
        - Actual pace data (possessions per game)
        - Home/Away totals splits
        - Historical variance (std_dev)
        - Recent totals trend
        """
        season = await self.get_current_season()

        # Get totals data with venue splits and variance
        result = await self.execute("""
            WITH team_games AS (
                SELECT
                    g.game_id,
                    g.game_date,
                    CASE WHEN g.home_team_id = $2 THEN g.home_team_score ELSE g.away_team_score END as team_score,
                    CASE WHEN g.home_team_id = $2 THEN g.away_team_score ELSE g.home_team_score END as opp_score,
                    (COALESCE(g.home_team_score, 0) + COALESCE(g.away_team_score, 0)) as game_total,
                    CASE WHEN g.home_team_id = $2 THEN 'HOME' ELSE 'AWAY' END as venue,
                    tgs.pace,
                    tgs.possessions,
                    tgs.offensive_rating,
                    tgs.defensive_rating
                FROM games g
                LEFT JOIN team_game_stats tgs ON g.game_id = tgs.game_id AND tgs.team_id = $2
                WHERE g.season = $1
                  AND g.home_team_score IS NOT NULL
                  AND (g.home_team_id = $2 OR g.away_team_id = $2)
                ORDER BY g.game_date DESC
                LIMIT $3
            )
            SELECT
                -- Overall totals stats
                COUNT(*) as games,
                ROUND(AVG(game_total), 1) as avg_total,
                ROUND(STDDEV(game_total), 1) as total_std_dev,
                ROUND(AVG(team_score), 1) as avg_team_score,
                ROUND(AVG(opp_score), 1) as avg_opp_score,

                -- Pace and efficiency
                ROUND(AVG(pace), 1) as avg_pace,
                ROUND(AVG(possessions), 1) as avg_possessions,
                ROUND(AVG(offensive_rating), 1) as avg_off_rating,
                ROUND(AVG(defensive_rating), 1) as avg_def_rating,

                -- Home splits
                COUNT(*) FILTER (WHERE venue = 'HOME') as home_games,
                ROUND(AVG(game_total) FILTER (WHERE venue = 'HOME'), 1) as home_avg_total,
                ROUND(STDDEV(game_total) FILTER (WHERE venue = 'HOME'), 1) as home_std_dev,
                ROUND(AVG(pace) FILTER (WHERE venue = 'HOME'), 1) as home_avg_pace,

                -- Away splits
                COUNT(*) FILTER (WHERE venue = 'AWAY') as away_games,
                ROUND(AVG(game_total) FILTER (WHERE venue = 'AWAY'), 1) as away_avg_total,
                ROUND(STDDEV(game_total) FILTER (WHERE venue = 'AWAY'), 1) as away_std_dev,
                ROUND(AVG(pace) FILTER (WHERE venue = 'AWAY'), 1) as away_avg_pace
            FROM team_games
        """, [season, team_id, last_n_games])

        return result.data[0] if result.data else {}

    async def get_team_rest_days(self, team_id: int, target_date: str = None) -> dict:
        """
        Get rest days for a team before a specific date (or next game).

        Returns:
        - rest_days: Days since last game
        - is_back_to_back: True if 0 rest days
        - last_game_date: Date of last game
        """
        from datetime import datetime, date as date_type
        season = await self.get_current_season()

        if target_date:
            # Convert string to date object for asyncpg
            if isinstance(target_date, str):
                target_date_obj = datetime.strptime(target_date, "%Y-%m-%d").date()
            elif isinstance(target_date, date_type):
                target_date_obj = target_date
            else:
                target_date_obj = None

            if target_date_obj:
                # Calculate rest days before a specific date
                result = await self.execute("""
                    SELECT
                        g.game_date as last_game_date,
                        ($3::date - g.game_date::date) as rest_days
                    FROM games g
                    WHERE g.season = $1
                      AND (g.home_team_id = $2 OR g.away_team_id = $2)
                      AND g.home_team_score IS NOT NULL
                      AND g.game_date::date < $3::date
                    ORDER BY g.game_date DESC
                    LIMIT 1
                """, [season, team_id, target_date_obj])
            else:
                return {"rest_days": None, "is_back_to_back": False, "last_game_date": None}
        else:
            # Get rest days before next upcoming game
            result = await self.execute("""
                WITH last_game AS (
                    SELECT game_date
                    FROM games
                    WHERE season = $1
                      AND (home_team_id = $2 OR away_team_id = $2)
                      AND home_team_score IS NOT NULL
                    ORDER BY game_date DESC
                    LIMIT 1
                ),
                next_game AS (
                    SELECT game_date
                    FROM games
                    WHERE season = $1
                      AND (home_team_id = $2 OR away_team_id = $2)
                      AND home_team_score IS NULL
                    ORDER BY game_date ASC
                    LIMIT 1
                )
                SELECT
                    lg.game_date as last_game_date,
                    ng.game_date as next_game_date,
                    (ng.game_date::date - lg.game_date::date) as rest_days
                FROM last_game lg, next_game ng
            """, [season, team_id])

        if result.data:
            row = result.data[0]
            rest_days = row.get("rest_days")
            if rest_days is not None:
                return {
                    "rest_days": int(rest_days),
                    "is_back_to_back": int(rest_days) <= 1,
                    "last_game_date": str(row.get("last_game_date")),
                    "next_game_date": str(row.get("next_game_date")) if row.get("next_game_date") else None
                }
        return {"rest_days": None, "is_back_to_back": False, "last_game_date": None}

    async def get_team_efficiency_multi_timeframe(self, team_id: int) -> dict:
        """
        Get team efficiency stats across multiple timeframes for weighted blending.

        Returns ORtg, DRtg, Pace for:
        - Season (full season baseline)
        - L15 (medium-term trend)
        - L10 (recent form)
        - L5 (current momentum)

        Blending weights: Season 20%, L15 25%, L10 30%, L5 25%
        """
        season = await self.get_current_season()

        result = await self.execute("""
            WITH team_games AS (
                SELECT
                    tgs.game_id,
                    g.game_date,
                    tgs.offensive_rating as ortg,
                    tgs.defensive_rating as drtg,
                    tgs.pace,
                    CASE WHEN g.home_team_id = $2 THEN g.home_team_score ELSE g.away_team_score END as team_score,
                    CASE WHEN g.home_team_id = $2 THEN g.away_team_score ELSE g.home_team_score END as opp_score,
                    (g.home_team_score + g.away_team_score) as game_total,
                    ROW_NUMBER() OVER (ORDER BY g.game_date DESC) as game_num
                FROM team_game_stats tgs
                JOIN games g ON tgs.game_id = g.game_id
                WHERE tgs.team_id = $2
                  AND g.season = $1
                  AND g.home_team_score IS NOT NULL
            )
            SELECT
                -- Season averages
                COUNT(*) as season_games,
                ROUND(AVG(ortg), 1) as season_ortg,
                ROUND(AVG(drtg), 1) as season_drtg,
                ROUND(AVG(pace), 1) as season_pace,
                ROUND(AVG(team_score), 1) as season_ppg,
                ROUND(AVG(opp_score), 1) as season_opp_ppg,
                ROUND(AVG(game_total), 1) as season_avg_total,
                ROUND(STDDEV(game_total), 1) as season_std_dev,

                -- L15 averages
                COUNT(*) FILTER (WHERE game_num <= 15) as l15_games,
                ROUND(AVG(ortg) FILTER (WHERE game_num <= 15), 1) as l15_ortg,
                ROUND(AVG(drtg) FILTER (WHERE game_num <= 15), 1) as l15_drtg,
                ROUND(AVG(pace) FILTER (WHERE game_num <= 15), 1) as l15_pace,
                ROUND(AVG(team_score) FILTER (WHERE game_num <= 15), 1) as l15_ppg,
                ROUND(AVG(opp_score) FILTER (WHERE game_num <= 15), 1) as l15_opp_ppg,
                ROUND(AVG(game_total) FILTER (WHERE game_num <= 15), 1) as l15_avg_total,

                -- L10 averages
                COUNT(*) FILTER (WHERE game_num <= 10) as l10_games,
                ROUND(AVG(ortg) FILTER (WHERE game_num <= 10), 1) as l10_ortg,
                ROUND(AVG(drtg) FILTER (WHERE game_num <= 10), 1) as l10_drtg,
                ROUND(AVG(pace) FILTER (WHERE game_num <= 10), 1) as l10_pace,
                ROUND(AVG(team_score) FILTER (WHERE game_num <= 10), 1) as l10_ppg,
                ROUND(AVG(opp_score) FILTER (WHERE game_num <= 10), 1) as l10_opp_ppg,
                ROUND(AVG(game_total) FILTER (WHERE game_num <= 10), 1) as l10_avg_total,

                -- L5 averages (most recent)
                COUNT(*) FILTER (WHERE game_num <= 5) as l5_games,
                ROUND(AVG(ortg) FILTER (WHERE game_num <= 5), 1) as l5_ortg,
                ROUND(AVG(drtg) FILTER (WHERE game_num <= 5), 1) as l5_drtg,
                ROUND(AVG(pace) FILTER (WHERE game_num <= 5), 1) as l5_pace,
                ROUND(AVG(team_score) FILTER (WHERE game_num <= 5), 1) as l5_ppg,
                ROUND(AVG(opp_score) FILTER (WHERE game_num <= 5), 1) as l5_opp_ppg,
                ROUND(AVG(game_total) FILTER (WHERE game_num <= 5), 1) as l5_avg_total
            FROM team_games
        """, [season, team_id])

        if not result.data or not result.data[0]:
            return {}

        row = result.data[0]

        # Calculate blended stats: Season 20%, L15 25%, L10 30%, L5 25%
        def blend(season_val, l15_val, l10_val, l5_val):
            """Blend values with fallbacks for missing data"""
            vals = []
            weights = []
            if season_val:
                vals.append(float(season_val))
                weights.append(0.20)
            if l15_val:
                vals.append(float(l15_val))
                weights.append(0.25)
            if l10_val:
                vals.append(float(l10_val))
                weights.append(0.30)
            if l5_val:
                vals.append(float(l5_val))
                weights.append(0.25)

            if not vals:
                return None

            # Normalize weights
            total_weight = sum(weights)
            return round(sum(v * w for v, w in zip(vals, weights)) / total_weight, 1)

        return {
            # Raw timeframe data
            "season": {
                "games": row.get("season_games"),
                "ortg": row.get("season_ortg"),
                "drtg": row.get("season_drtg"),
                "pace": row.get("season_pace"),
                "ppg": row.get("season_ppg"),
                "opp_ppg": row.get("season_opp_ppg"),
                "avg_total": row.get("season_avg_total"),
                "std_dev": row.get("season_std_dev"),
            },
            "l15": {
                "games": row.get("l15_games"),
                "ortg": row.get("l15_ortg"),
                "drtg": row.get("l15_drtg"),
                "pace": row.get("l15_pace"),
                "ppg": row.get("l15_ppg"),
                "opp_ppg": row.get("l15_opp_ppg"),
                "avg_total": row.get("l15_avg_total"),
            },
            "l10": {
                "games": row.get("l10_games"),
                "ortg": row.get("l10_ortg"),
                "drtg": row.get("l10_drtg"),
                "pace": row.get("l10_pace"),
                "ppg": row.get("l10_ppg"),
                "opp_ppg": row.get("l10_opp_ppg"),
                "avg_total": row.get("l10_avg_total"),
            },
            "l5": {
                "games": row.get("l5_games"),
                "ortg": row.get("l5_ortg"),
                "drtg": row.get("l5_drtg"),
                "pace": row.get("l5_pace"),
                "ppg": row.get("l5_ppg"),
                "opp_ppg": row.get("l5_opp_ppg"),
                "avg_total": row.get("l5_avg_total"),
            },
            # Blended values (weighted average)
            "blended": {
                "ortg": blend(row.get("season_ortg"), row.get("l15_ortg"), row.get("l10_ortg"), row.get("l5_ortg")),
                "drtg": blend(row.get("season_drtg"), row.get("l15_drtg"), row.get("l10_drtg"), row.get("l5_drtg")),
                "pace": blend(row.get("season_pace"), row.get("l15_pace"), row.get("l10_pace"), row.get("l5_pace")),
                "ppg": blend(row.get("season_ppg"), row.get("l15_ppg"), row.get("l10_ppg"), row.get("l5_ppg")),
                "opp_ppg": blend(row.get("season_opp_ppg"), row.get("l15_opp_ppg"), row.get("l10_opp_ppg"), row.get("l5_opp_ppg")),
            },
        }

    async def get_opponent_adjusted_stats(self, team_id: int, last_n_games: int = 15) -> dict:
        """
        Calculate opponent-strength-adjusted offensive and defensive ratings.

        Adjusts each game's performance based on opponent's season efficiency:
        - Adjusted_Score = Actual_Score * (League_Avg_DRtg / Opponent_DRtg)
        - Adjusted_Allowed = Actual_Allowed * (League_Avg_ORtg / Opponent_ORtg)

        This normalizes stats against quality of competition.
        """
        season = await self.get_current_season()

        result = await self.execute("""
            WITH league_avg AS (
                -- Calculate league average efficiency
                SELECT
                    ROUND(AVG(offensive_rating), 1) as league_ortg,
                    ROUND(AVG(defensive_rating), 1) as league_drtg
                FROM team_game_stats tgs
                JOIN games g ON tgs.game_id = g.game_id
                WHERE g.season = $1 AND g.home_team_score IS NOT NULL
            ),
            team_season_avg AS (
                -- Get each team's season average efficiency
                SELECT
                    tgs.team_id,
                    ROUND(AVG(tgs.offensive_rating), 1) as team_ortg,
                    ROUND(AVG(tgs.defensive_rating), 1) as team_drtg
                FROM team_game_stats tgs
                JOIN games g ON tgs.game_id = g.game_id
                WHERE g.season = $1 AND g.home_team_score IS NOT NULL
                GROUP BY tgs.team_id
            ),
            team_games AS (
                -- Get target team's games with opponent info
                SELECT
                    g.game_id,
                    g.game_date,
                    CASE WHEN g.home_team_id = $2 THEN g.home_team_score ELSE g.away_team_score END as team_score,
                    CASE WHEN g.home_team_id = $2 THEN g.away_team_score ELSE g.home_team_score END as opp_score,
                    CASE WHEN g.home_team_id = $2 THEN g.away_team_id ELSE g.home_team_id END as opp_team_id,
                    (g.home_team_score + g.away_team_score) as game_total,
                    ROW_NUMBER() OVER (ORDER BY g.game_date DESC) as game_num
                FROM games g
                WHERE g.season = $1
                  AND (g.home_team_id = $2 OR g.away_team_id = $2)
                  AND g.home_team_score IS NOT NULL
            )
            SELECT
                COUNT(*) as games,
                -- Raw averages
                ROUND(AVG(tg.team_score), 1) as raw_ppg,
                ROUND(AVG(tg.opp_score), 1) as raw_opp_ppg,
                ROUND(AVG(tg.game_total), 1) as raw_avg_total,

                -- Opponent-adjusted averages
                -- Adjusted scoring = actual * (league_drtg / opp_drtg)
                -- If opponent has bad defense (high drtg), we deflate the score
                ROUND(AVG(
                    tg.team_score * la.league_drtg / NULLIF(opp_avg.team_drtg, 0)
                ), 1) as adj_ppg,

                -- Adjusted defense = actual * (league_ortg / opp_ortg)
                -- If opponent has bad offense (low ortg), we inflate allowed points
                ROUND(AVG(
                    tg.opp_score * la.league_ortg / NULLIF(opp_avg.team_ortg, 0)
                ), 1) as adj_opp_ppg,

                -- Strength of schedule (avg opponent efficiency)
                ROUND(AVG(opp_avg.team_ortg), 1) as sos_opp_ortg,
                ROUND(AVG(opp_avg.team_drtg), 1) as sos_opp_drtg,

                -- League averages for reference
                (SELECT league_ortg FROM league_avg) as league_ortg,
                (SELECT league_drtg FROM league_avg) as league_drtg
            FROM team_games tg
            JOIN team_season_avg opp_avg ON tg.opp_team_id = opp_avg.team_id
            CROSS JOIN league_avg la
            WHERE tg.game_num <= $3
        """, [season, team_id, last_n_games])

        if not result.data or not result.data[0]:
            return {}

        row = result.data[0]
        raw_ppg = float(row.get("raw_ppg", 0) or 0)
        adj_ppg = float(row.get("adj_ppg", 0) or 0)
        raw_opp = float(row.get("raw_opp_ppg", 0) or 0)
        adj_opp = float(row.get("adj_opp_ppg", 0) or 0)

        return {
            "games": row.get("games"),
            "raw_ppg": raw_ppg,
            "raw_opp_ppg": raw_opp,
            "adj_ppg": adj_ppg,
            "adj_opp_ppg": adj_opp,
            "ppg_adjustment": round(adj_ppg - raw_ppg, 1) if adj_ppg and raw_ppg else 0,
            "opp_ppg_adjustment": round(adj_opp - raw_opp, 1) if adj_opp and raw_opp else 0,
            "sos_opp_ortg": row.get("sos_opp_ortg"),  # Strength of schedule - offense faced
            "sos_opp_drtg": row.get("sos_opp_drtg"),  # Strength of schedule - defense faced
            "league_ortg": row.get("league_ortg"),
            "league_drtg": row.get("league_drtg"),
        }

    async def get_h2h_totals(self, team1_id: int, team2_id: int, limit: int = 10) -> dict:
        """
        Get head-to-head totals history between two teams.

        Returns:
        - Average total in H2H matchups
        - Over/Under record at various lines
        - Recent trend
        """
        result = await self.execute("""
            SELECT
                g.game_id,
                g.game_date,
                g.season,
                (g.home_team_score + g.away_team_score) as game_total,
                g.home_team_score,
                g.away_team_score
            FROM games g
            WHERE ((g.home_team_id = $1 AND g.away_team_id = $2)
                OR (g.home_team_id = $2 AND g.away_team_id = $1))
              AND g.home_team_score IS NOT NULL
            ORDER BY g.game_date DESC
            LIMIT $3
        """, [team1_id, team2_id, limit])

        if not result.data:
            return {}

        totals = [float(row["game_total"]) for row in result.data]
        avg_total = sum(totals) / len(totals)

        from statistics import stdev
        std_dev = stdev(totals) if len(totals) > 1 else 12.0

        return {
            "games": len(totals),
            "avg_total": round(avg_total, 1),
            "std_dev": round(std_dev, 1),
            "min_total": min(totals),
            "max_total": max(totals),
            "recent_totals": totals[:5],
            # Calculate O/U at common lines
            "over_230_rate": round(sum(1 for t in totals if t > 230) / len(totals), 3),
            "over_235_rate": round(sum(1 for t in totals if t > 235) / len(totals), 3),
            "over_240_rate": round(sum(1 for t in totals if t > 240) / len(totals), 3),
            "over_245_rate": round(sum(1 for t in totals if t > 245) / len(totals), 3),
        }

    async def get_schedule_density(self, team_id: int, target_date: str = None) -> dict:
        """
        Get schedule density (fatigue indicators) for a team.

        Returns:
        - Games in last 7 days
        - Games in last 14 days
        - Rest pattern quality
        """
        from datetime import datetime, timedelta

        season = await self.get_current_season()

        if target_date:
            if isinstance(target_date, str):
                target = datetime.strptime(target_date, "%Y-%m-%d").date()
            else:
                target = target_date
        else:
            target = datetime.now().date()

        date_7_ago = target - timedelta(days=7)
        date_14_ago = target - timedelta(days=14)

        result = await self.execute("""
            SELECT
                COUNT(*) FILTER (WHERE g.game_date >= $3) as games_last_7,
                COUNT(*) FILTER (WHERE g.game_date >= $4) as games_last_14,
                COUNT(*) as total_games,
                MAX(g.game_date) as last_game_date
            FROM games g
            WHERE g.season = $1
              AND (g.home_team_id = $2 OR g.away_team_id = $2)
              AND g.home_team_score IS NOT NULL
              AND g.game_date < $5
        """, [season, team_id, date_7_ago, date_14_ago, target])

        if not result.data or not result.data[0]:
            return {}

        row = result.data[0]
        games_7 = row.get("games_last_7", 0) or 0
        games_14 = row.get("games_last_14", 0) or 0

        # Fatigue score: higher = more tired
        # Normal: 3-4 games per week
        fatigue_score = 0
        if games_7 >= 4:
            fatigue_score += (games_7 - 3) * 2  # Penalty for heavy schedule
        if games_14 >= 8:
            fatigue_score += (games_14 - 7)

        return {
            "games_last_7": games_7,
            "games_last_14": games_14,
            "fatigue_score": fatigue_score,
            "schedule_density": "heavy" if games_7 >= 4 else "normal" if games_7 >= 2 else "light",
            "last_game_date": str(row.get("last_game_date")) if row.get("last_game_date") else None,
        }

    async def get_team_ou_record(self, team_id: int, line: float = None, tolerance: float = 5.0, last_n_games: int = 20) -> dict:
        """
        Get team's Over/Under record, optionally at specific line ranges.

        Args:
            team_id: Team to analyze
            line: Center of line range (e.g., 240)
            tolerance: +/- range for line matching (e.g., 5.0 means 235-245)
            last_n_games: Number of recent games to analyze

        Returns:
            - total_games, overs, unders, pushes
            - over_rate, under_rate
            - avg_total_vs_line (how much over/under the line typically)
        """
        season = await self.get_current_season()

        # Get recent games with totals
        result = await self.execute("""
            WITH team_games AS (
                SELECT
                    g.game_id,
                    g.game_date,
                    (COALESCE(g.home_team_score, 0) + COALESCE(g.away_team_score, 0)) as actual_total
                FROM games g
                WHERE g.season = $1
                  AND (g.home_team_id = $2 OR g.away_team_id = $2)
                  AND g.home_team_score IS NOT NULL
                ORDER BY g.game_date DESC
                LIMIT $3
            )
            SELECT
                COUNT(*) as total_games,
                ROUND(AVG(actual_total), 1) as avg_total,
                ROUND(STDDEV(actual_total), 1) as std_dev,
                MIN(actual_total) as min_total,
                MAX(actual_total) as max_total,
                actual_total
            FROM team_games
            GROUP BY actual_total
            ORDER BY actual_total
        """, [season, team_id, last_n_games])

        if not result.data:
            return {}

        # Reconstruct the list of totals from grouped data
        totals = []
        for row in result.data:
            totals.append(float(row["actual_total"]))

        # Calculate O/U stats at the specific line if provided
        if line:
            overs = sum(1 for t in totals if t > line)
            unders = sum(1 for t in totals if t < line)
            pushes = sum(1 for t in totals if t == line)
            total_games = len(totals)
            avg_total = sum(totals) / total_games if total_games > 0 else 0

            return {
                "line": line,
                "total_games": total_games,
                "overs": overs,
                "unders": unders,
                "pushes": pushes,
                "over_rate": round(overs / total_games, 3) if total_games > 0 else 0,
                "under_rate": round(unders / total_games, 3) if total_games > 0 else 0,
                "avg_total": round(avg_total, 1),
                "avg_vs_line": round(avg_total - line, 1),  # Positive = typically goes over
                "recent_totals": totals[:5]  # Last 5 for trend
            }
        else:
            # General O/U stats without specific line
            avg_total = sum(totals) / len(totals) if totals else 0
            from statistics import stdev
            std_dev = stdev(totals) if len(totals) > 1 else 12.0

            return {
                "total_games": len(totals),
                "avg_total": round(avg_total, 1),
                "std_dev": round(std_dev, 1),
                "min_total": min(totals) if totals else 0,
                "max_total": max(totals) if totals else 0,
                "recent_totals": totals[:5]
            }

    async def get_betting_odds(self, game_id: str) -> dict | None:
        """Get betting odds for a game from betting_events → betting_markets → betting_odds"""
        # Get all odds for this game, organized by market type
        result = await self.execute("""
            WITH latest_odds AS (
                SELECT DISTINCT ON (bm.market_id, bo.selection)
                       bm.market_id, bm.market_type, bm.market_key,
                       bo.selection, bo.odds_decimal, bo.handicap, bo.recorded_at
                FROM betting_events be
                JOIN betting_markets bm ON be.event_id = bm.event_id
                JOIN betting_odds bo ON bm.market_id = bo.market_id
                WHERE be.game_id = $1
                  AND bo.is_available = true
                ORDER BY bm.market_id, bo.selection, bo.recorded_at DESC
            )
            SELECT market_type, market_key, selection, odds_decimal, handicap
            FROM latest_odds
            WHERE market_type IN ('spread', 'total', 'moneyline')
            ORDER BY market_type, handicap
        """, [game_id])

        if not result.data:
            return None

        # Organize by market type
        odds = {"spread": None, "total": None, "moneyline": None}

        for row in result.data:
            market_type = row.get("market_type", "").lower()
            market_key = row.get("market_key", "")
            selection = row.get("selection", "")
            odds_decimal = float(row["odds_decimal"]) if row.get("odds_decimal") else None
            handicap = float(row["handicap"]) if row.get("handicap") else None

            if market_type == "spread" and odds["spread"] is None:
                # First spread market found (primary line)
                # Determine home/away from selection (contains team name with spread)
                if handicap is not None and handicap < 0:
                    # This is the favorite
                    odds["spread"] = {
                        "line": handicap,
                        "favorite_odds": odds_decimal,
                        "underdog_odds": None
                    }
                elif handicap is not None and handicap > 0 and odds["spread"]:
                    # This is the underdog
                    odds["spread"]["underdog_odds"] = odds_decimal

            elif market_type == "spread" and odds["spread"] is not None:
                # Fill in the other side
                if handicap is not None and handicap > 0 and odds["spread"].get("underdog_odds") is None:
                    odds["spread"]["underdog_odds"] = odds_decimal
                elif handicap is not None and handicap < 0 and odds["spread"].get("favorite_odds") is None:
                    odds["spread"]["favorite_odds"] = odds_decimal

            elif market_type == "total":
                # Look for game total (market_key starts with 0_game_total_)
                if market_key.startswith("0_game_total_") and odds["total"] is None:
                    # Initialize total with the line
                    odds["total"] = {
                        "line": handicap,
                        "over_odds": None,
                        "under_odds": None
                    }

                if odds["total"] is not None and handicap == odds["total"]["line"]:
                    # Match the selection to over/under
                    if "Over" in selection:
                        odds["total"]["over_odds"] = odds_decimal
                    elif "Under" in selection:
                        odds["total"]["under_odds"] = odds_decimal

            elif market_type == "moneyline" and odds["moneyline"] is None:
                # Moneyline - first one found
                odds["moneyline"] = {
                    "selection": selection,
                    "odds": odds_decimal
                }

        return odds


    async def get_team_volatility(self, team_id: int, last_n_games: int = 15) -> dict:
        """
        Calculate team's scoring volatility (consistency measure).

        Returns:
        - scoring_std: Standard deviation of team's scoring
        - total_std: Standard deviation of game totals
        - volatility_rating: 'high', 'medium', or 'low'
        - consistency_score: 0-100 (higher = more consistent)
        """
        season = await self.get_current_season()

        result = await self.execute("""
            WITH team_games AS (
                SELECT
                    CASE WHEN g.home_team_id = $2 THEN g.home_team_score ELSE g.away_team_score END as team_score,
                    CASE WHEN g.home_team_id = $2 THEN g.away_team_score ELSE g.home_team_score END as opp_score,
                    (g.home_team_score + g.away_team_score) as game_total,
                    ROW_NUMBER() OVER (ORDER BY g.game_date DESC) as game_num
                FROM games g
                WHERE g.season = $1
                  AND (g.home_team_id = $2 OR g.away_team_id = $2)
                  AND g.home_team_score IS NOT NULL
            )
            SELECT
                COUNT(*) as games,
                ROUND(AVG(team_score), 1) as avg_score,
                ROUND(STDDEV(team_score), 1) as scoring_std,
                ROUND(AVG(opp_score), 1) as avg_opp_score,
                ROUND(STDDEV(opp_score), 1) as opp_scoring_std,
                ROUND(AVG(game_total), 1) as avg_total,
                ROUND(STDDEV(game_total), 1) as total_std,
                ROUND(MIN(game_total), 0) as min_total,
                ROUND(MAX(game_total), 0) as max_total,
                ROUND(MAX(game_total) - MIN(game_total), 0) as total_range
            FROM team_games
            WHERE game_num <= $3
        """, [season, team_id, last_n_games])

        if not result.data or not result.data[0].get("games"):
            return {
                "games": 0,
                "scoring_std": 12.0,
                "total_std": 20.0,
                "volatility_rating": "unknown",
                "consistency_score": 50,
            }

        row = result.data[0]
        total_std = float(row.get("total_std") or 20.0)
        scoring_std = float(row.get("scoring_std") or 12.0)

        # Volatility rating based on total std dev
        # NBA average is ~18-20 points
        if total_std > 25:
            volatility_rating = "high"
            consistency_score = 30
        elif total_std > 20:
            volatility_rating = "medium-high"
            consistency_score = 45
        elif total_std > 15:
            volatility_rating = "medium"
            consistency_score = 60
        elif total_std > 10:
            volatility_rating = "medium-low"
            consistency_score = 75
        else:
            volatility_rating = "low"
            consistency_score = 90

        return {
            "games": row.get("games"),
            "avg_score": row.get("avg_score"),
            "scoring_std": scoring_std,
            "avg_opp_score": row.get("avg_opp_score"),
            "opp_scoring_std": float(row.get("opp_scoring_std") or 12.0),
            "avg_total": row.get("avg_total"),
            "total_std": total_std,
            "min_total": row.get("min_total"),
            "max_total": row.get("max_total"),
            "total_range": row.get("total_range"),
            "volatility_rating": volatility_rating,
            "consistency_score": consistency_score,
        }

    async def get_pace_matchup_data(self, team1_id: int, team2_id: int) -> dict:
        """
        Get pace data for matchup analysis.

        Returns pace stats for both teams and projected matchup pace.
        """
        season = await self.get_current_season()

        result = await self.execute("""
            WITH team_pace AS (
                SELECT
                    tgs.team_id,
                    ROUND(AVG(tgs.pace), 1) as avg_pace,
                    ROUND(STDDEV(tgs.pace), 1) as pace_std,
                    ROUND(MIN(tgs.pace), 1) as min_pace,
                    ROUND(MAX(tgs.pace), 1) as max_pace
                FROM team_game_stats tgs
                JOIN games g ON tgs.game_id = g.game_id
                WHERE g.season = $1
                  AND g.home_team_score IS NOT NULL
                  AND tgs.team_id IN ($2, $3)
                GROUP BY tgs.team_id
            )
            SELECT
                t1.avg_pace as t1_pace,
                t1.pace_std as t1_pace_std,
                t2.avg_pace as t2_pace,
                t2.pace_std as t2_pace_std,
                ROUND((t1.avg_pace + t2.avg_pace) / 2, 1) as matchup_pace,
                -- Pace differential from league average (~100)
                ROUND(((t1.avg_pace + t2.avg_pace) / 2) - 100, 1) as pace_diff_from_avg
            FROM team_pace t1, team_pace t2
            WHERE t1.team_id = $2 AND t2.team_id = $3
        """, [season, team1_id, team2_id])

        if not result.data:
            return {
                "t1_pace": 100.0,
                "t2_pace": 100.0,
                "matchup_pace": 100.0,
                "pace_diff_from_avg": 0.0,
                "pace_adjustment": 0.0,
            }

        row = result.data[0]
        matchup_pace = float(row.get("matchup_pace") or 100.0)
        pace_diff = float(row.get("pace_diff_from_avg") or 0.0)

        # Each point of pace difference ≈ 2.2 points of total
        # (100 possessions at league avg ~1.1 pts/poss)
        pace_adjustment = pace_diff * 2.2

        return {
            "t1_pace": row.get("t1_pace"),
            "t1_pace_std": row.get("t1_pace_std"),
            "t2_pace": row.get("t2_pace"),
            "t2_pace_std": row.get("t2_pace_std"),
            "matchup_pace": matchup_pace,
            "pace_diff_from_avg": pace_diff,
            "pace_adjustment": round(pace_adjustment, 1),
        }


    # ============================================================
    # PLAYER PROP METHODS
    # ============================================================

    async def get_player_prop_odds(self, player_name: str, prop_type: str, game_id: str = None) -> dict | None:
        """
        Get current prop odds for a player from betting_markets/betting_odds.

        Args:
            player_name: Player's name (partial match supported)
            prop_type: 'points', 'rebounds', 'assists', '3pm', 'pra', etc.
            game_id: Optional game_id to filter by specific game

        Returns:
            {line, over_odds, under_odds, market_id, player_name_matched}
        """
        # Map prop_type to market name patterns
        prop_patterns = {
            "points": "Points)",
            "rebounds": "Rebounds)",
            "assists": "Assists)",
            "3pm": "3 Point FG)",
            "threes": "3 Point FG)",
            "steals": "Steals)",
            "blocks": "Blocks)",
            "turnovers": "Turnovers)",
            "pra": "Pts+Rebs+Asts)",
            "points_rebounds": "Pts+Rebs)",
            "points_assists": "Pts+Asts)",
            "rebounds_assists": "Rebs+Asts)",
        }

        pattern = prop_patterns.get(prop_type.lower(), f"{prop_type})")

        if game_id:
            result = await self.execute("""
                SELECT DISTINCT ON (bm.market_id)
                       bm.market_id, bm.market_name,
                       bo_over.handicap as line,
                       bo_over.odds_decimal as over_odds,
                       bo_under.odds_decimal as under_odds
                FROM betting_events be
                JOIN betting_markets bm ON be.event_id = bm.event_id
                JOIN betting_odds bo_over ON bm.market_id = bo_over.market_id AND bo_over.selection = 'Over'
                JOIN betting_odds bo_under ON bm.market_id = bo_under.market_id AND bo_under.selection = 'Under'
                    AND bo_over.handicap = bo_under.handicap
                WHERE be.game_id = $1
                  AND bm.market_type = 'player_prop'
                  AND LOWER(bm.market_name) LIKE LOWER($2)
                  AND bm.market_name LIKE $3
                  AND bo_over.is_available = true
                ORDER BY bm.market_id, bo_over.recorded_at DESC
                LIMIT 1
            """, [game_id, f"%{player_name}%", f"%{pattern}"])
        else:
            # Get from most recent event
            result = await self.execute("""
                SELECT DISTINCT ON (bm.market_id)
                       bm.market_id, bm.market_name, be.game_id,
                       bo_over.handicap as line,
                       bo_over.odds_decimal as over_odds,
                       bo_under.odds_decimal as under_odds
                FROM betting_events be
                JOIN betting_markets bm ON be.event_id = bm.event_id
                JOIN betting_odds bo_over ON bm.market_id = bo_over.market_id AND bo_over.selection = 'Over'
                JOIN betting_odds bo_under ON bm.market_id = bo_under.market_id AND bo_under.selection = 'Under'
                    AND bo_over.handicap = bo_under.handicap
                JOIN games g ON be.game_id = g.game_id
                WHERE bm.market_type = 'player_prop'
                  AND LOWER(bm.market_name) LIKE LOWER($1)
                  AND bm.market_name LIKE $2
                  AND bo_over.is_available = true
                  AND g.home_team_score IS NULL
                ORDER BY bm.market_id, g.game_date, bo_over.recorded_at DESC
                LIMIT 1
            """, [f"%{player_name}%", f"%{pattern}"])

        if not result.data:
            return None

        row = result.data[0]
        return {
            "market_id": row.get("market_id"),
            "market_name": row.get("market_name"),
            "game_id": row.get("game_id"),
            "line": float(row.get("line")) if row.get("line") else None,
            "over_odds": float(row.get("over_odds")) if row.get("over_odds") else None,
            "under_odds": float(row.get("under_odds")) if row.get("under_odds") else None,
        }

    async def get_player_stat_std_dev(self, player_id: int, stat: str, last_n_games: int = 10) -> dict:
        """
        Calculate standard deviation for a player stat over recent games.

        Args:
            player_id: Player ID
            stat: 'points', 'rebounds', 'assists', 'fg3_made', 'steals', 'blocks', 'turnovers'
            last_n_games: Number of games to analyze

        Returns:
            {avg, std_dev, min, max, games, values}
        """
        season = await self.get_current_season()

        # Map stat names to column names
        stat_columns = {
            "points": "points",
            "rebounds": "rebounds",
            "assists": "assists",
            "3pm": "fg3_made",
            "threes": "fg3_made",
            "fg3_made": "fg3_made",
            "steals": "steals",
            "blocks": "blocks",
            "turnovers": "turnovers",
            "minutes": "minutes",
        }

        col = stat_columns.get(stat.lower(), "points")

        result = await self.execute(f"""
            WITH recent_games AS (
                SELECT pgs.{col} as stat_value, pgs.minutes, g.game_date
                FROM player_game_stats pgs
                JOIN games g ON pgs.game_id = g.game_id
                WHERE pgs.player_id = $1
                  AND g.season = $2
                  AND pgs.minutes > 0
                ORDER BY g.game_date DESC
                LIMIT $3
            )
            SELECT
                COUNT(*) as games,
                ROUND(AVG(stat_value)::numeric, 1) as avg,
                ROUND(STDDEV(stat_value)::numeric, 1) as std_dev,
                MIN(stat_value) as min_val,
                MAX(stat_value) as max_val,
                ROUND(AVG(minutes)::numeric, 1) as avg_minutes,
                ROUND(STDDEV(minutes)::numeric, 1) as minutes_std,
                ARRAY_AGG(stat_value ORDER BY game_date DESC) as values
            FROM recent_games
        """, [player_id, season, last_n_games])

        if not result.data or not result.data[0].get("games"):
            return {
                "games": 0,
                "avg": 0,
                "std_dev": 5.0,  # Default
                "min_val": 0,
                "max_val": 0,
                "avg_minutes": 0,
                "minutes_std": 5.0,
                "values": [],
            }

        row = result.data[0]
        return {
            "games": row.get("games", 0),
            "avg": float(row.get("avg") or 0),
            "std_dev": float(row.get("std_dev") or 5.0),
            "min_val": row.get("min_val", 0),
            "max_val": row.get("max_val", 0),
            "avg_minutes": float(row.get("avg_minutes") or 0),
            "minutes_std": float(row.get("minutes_std") or 5.0),
            "values": row.get("values", []),
        }

    async def get_player_vs_opponent(self, player_id: int, opponent_team_id: int, limit: int = 10) -> dict:
        """
        Get player's historical performance vs a specific opponent.

        Returns stats from all games against the opponent team.
        """
        result = await self.execute("""
            SELECT
                COUNT(*) as games,
                ROUND(AVG(pgs.points)::numeric, 1) as avg_points,
                ROUND(AVG(pgs.rebounds)::numeric, 1) as avg_rebounds,
                ROUND(AVG(pgs.assists)::numeric, 1) as avg_assists,
                ROUND(AVG(pgs.fg3_made)::numeric, 1) as avg_3pm,
                ROUND(AVG(pgs.steals)::numeric, 1) as avg_steals,
                ROUND(AVG(pgs.blocks)::numeric, 1) as avg_blocks,
                ROUND(AVG(pgs.minutes)::numeric, 1) as avg_minutes,
                ROUND(AVG(pgs.points + pgs.rebounds + pgs.assists)::numeric, 1) as avg_pra
            FROM player_game_stats pgs
            JOIN games g ON pgs.game_id = g.game_id
            WHERE pgs.player_id = $1
              AND (
                  (g.home_team_id = $2 AND g.away_team_id = pgs.team_id)
                  OR (g.away_team_id = $2 AND g.home_team_id = pgs.team_id)
              )
              AND g.home_team_score IS NOT NULL
            ORDER BY g.game_date DESC
            LIMIT $3
        """, [player_id, opponent_team_id, limit])

        if not result.data or not result.data[0].get("games"):
            return {"games": 0}

        return result.data[0]

    async def get_team_defensive_vs_position(self, team_id: int, last_n_games: int = 15) -> dict:
        """
        Get team's defensive stats - how many points they allow per game
        and to specific positions (if defensive_stats_by_position exists).

        Returns:
            {ppg_allowed, opp_fg_pct, opp_3p_pct, pace, defensive_rating}
        """
        season = await self.get_current_season()

        result = await self.execute("""
            WITH team_games AS (
                SELECT
                    CASE WHEN g.home_team_id = $2 THEN g.away_team_score ELSE g.home_team_score END as opp_score,
                    tgs.defensive_rating,
                    tgs.pace,
                    ROW_NUMBER() OVER (ORDER BY g.game_date DESC) as game_num
                FROM games g
                JOIN team_game_stats tgs ON g.game_id = tgs.game_id AND tgs.team_id = $2
                WHERE g.season = $1
                  AND (g.home_team_id = $2 OR g.away_team_id = $2)
                  AND g.home_team_score IS NOT NULL
            )
            SELECT
                COUNT(*) as games,
                ROUND(AVG(opp_score)::numeric, 1) as ppg_allowed,
                ROUND(AVG(defensive_rating)::numeric, 1) as def_rating,
                ROUND(AVG(pace)::numeric, 1) as pace,
                -- Defensive ranking proxy (lower = better defense)
                RANK() OVER (ORDER BY AVG(opp_score)) as def_rank_approx
            FROM team_games
            WHERE game_num <= $3
            GROUP BY 1=1
        """, [season, team_id, last_n_games])

        if not result.data or not result.data[0]:
            return {
                "games": 0,
                "ppg_allowed": 115.0,  # League average approx
                "def_rating": 115.0,
                "pace": 100.0,
                "defensive_quality": "average",
            }

        row = result.data[0]
        ppg_allowed = float(row.get("ppg_allowed") or 115.0)
        def_rating = float(row.get("def_rating") or 115.0)

        # Classify defensive quality
        if def_rating < 108:
            quality = "elite"
        elif def_rating < 112:
            quality = "good"
        elif def_rating < 116:
            quality = "average"
        elif def_rating < 120:
            quality = "poor"
        else:
            quality = "bad"

        return {
            "games": row.get("games"),
            "ppg_allowed": ppg_allowed,
            "def_rating": def_rating,
            "pace": float(row.get("pace") or 100.0),
            "defensive_quality": quality,
            # Factor for adjusting player projections
            # > 1.0 means bad defense (boost projections)
            # < 1.0 means good defense (reduce projections)
            "projection_factor": round(ppg_allowed / 115.0, 3),
        }

    async def get_player_team_id(self, player_id: int) -> int | None:
        """Get the current team ID for a player based on most recent game."""
        season = await self.get_current_season()

        result = await self.execute("""
            SELECT pgs.team_id
            FROM player_game_stats pgs
            JOIN games g ON pgs.game_id = g.game_id
            WHERE pgs.player_id = $1
              AND g.season = $2
            ORDER BY g.game_date DESC
            LIMIT 1
        """, [player_id, season])

        return result.data[0]["team_id"] if result.data else None

    async def get_player_upcoming_game(self, player_id: int) -> dict | None:
        """Get the next upcoming game for a player's team."""
        team_id = await self.get_player_team_id(player_id)
        if not team_id:
            return None

        season = await self.get_current_season()

        result = await self.execute("""
            SELECT g.game_id, g.game_date,
                   ht.full_name as home_team, ht.abbreviation as home_abbr, ht.team_id as home_team_id,
                   at.full_name as away_team, at.abbreviation as away_abbr, at.team_id as away_team_id,
                   CASE WHEN g.home_team_id = $2 THEN 'HOME' ELSE 'AWAY' END as location,
                   CASE WHEN g.home_team_id = $2 THEN at.team_id ELSE ht.team_id END as opponent_id,
                   CASE WHEN g.home_team_id = $2 THEN at.abbreviation ELSE ht.abbreviation END as opponent_abbr
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE g.season = $1
              AND g.home_team_score IS NULL
              AND (g.home_team_id = $2 OR g.away_team_id = $2)
            ORDER BY g.game_date
            LIMIT 1
        """, [season, team_id])

        return result.data[0] if result.data else None

    # ============================================================
    # QUARTER/PERIOD ANALYSIS METHODS
    # ============================================================

    async def get_team_quarter_stats(
        self,
        team_id: int,
        period: int = 1,
        location: str = "ALL"
    ) -> dict:
        """
        Get team's quarter statistics for betting analysis.

        Args:
            team_id: Team ID
            period: Period number (1=Q1, 2=Q2, 3=Q3, 4=Q4)
            location: 'HOME', 'AWAY', or 'ALL'

        Returns:
            {avg_points, avg_allowed, period_win_pct, games_played, differential}
        """
        season = await self.get_current_season()

        result = await self.execute("""
            SELECT
                tpa.avg_points,
                tpa.avg_allowed,
                tpa.period_win_pct,
                tpa.games_played,
                ROUND(tpa.avg_points - tpa.avg_allowed, 2) as differential
            FROM team_period_averages tpa
            WHERE tpa.team_id = $1
              AND tpa.season = $2
              AND tpa.period_number = $3
              AND tpa.period_type = 'Q'
              AND tpa.location = $4
        """, [team_id, season, period, location.upper()])

        if not result.data or not result.data[0]:
            return {
                "avg_points": 0,
                "avg_allowed": 0,
                "period_win_pct": 0.5,
                "games_played": 0,
                "differential": 0,
                "data_available": False
            }

        row = result.data[0]
        return {
            "avg_points": float(row.get("avg_points") or 0),
            "avg_allowed": float(row.get("avg_allowed") or 0),
            "period_win_pct": float(row.get("period_win_pct") or 0.5),
            "games_played": row.get("games_played", 0),
            "differential": float(row.get("differential") or 0),
            "data_available": True
        }

    async def get_team_first_half_stats(
        self,
        team_id: int,
        location: str = "ALL"
    ) -> dict:
        """
        Get team's first half (1H) statistics for betting analysis.

        Args:
            team_id: Team ID
            location: 'HOME', 'AWAY', or 'ALL'

        Returns:
            {avg_points, avg_total, avg_margin, games_played}
        """
        season = await self.get_current_season()

        result = await self.execute("""
            SELECT
                tha.avg_points,
                tha.avg_total,
                tha.avg_margin,
                tha.games_played
            FROM team_half_averages tha
            WHERE tha.team_id = $1
              AND tha.season = $2
              AND tha.half = 1
              AND tha.location = $3
        """, [team_id, season, location.upper()])

        if not result.data or not result.data[0]:
            return {
                "avg_points": 0,
                "avg_total": 0,
                "avg_margin": 0,
                "games_played": 0,
                "data_available": False
            }

        row = result.data[0]
        return {
            "avg_points": float(row.get("avg_points") or 0),
            "avg_total": float(row.get("avg_total") or 0),
            "avg_margin": float(row.get("avg_margin") or 0),
            "games_played": row.get("games_played", 0),
            "data_available": True
        }

    async def get_game_quarter_scores(self, game_id: str) -> dict | None:
        """
        Get quarter-by-quarter scores for a specific game.

        Returns all period scores plus game advanced stats
        (paint points, fastbreak, lead changes, etc.)
        """
        # Get period scores
        result = await self.execute("""
            SELECT
                ps.team_id,
                t.abbreviation,
                ps.period_number,
                ps.period_type,
                ps.points
            FROM period_scores ps
            JOIN teams t ON ps.team_id = t.team_id
            WHERE ps.game_id = $1
            ORDER BY ps.team_id, ps.period_number
        """, [game_id])

        if not result.data:
            return None

        # Organize by team
        teams_data: dict = {}
        for row in result.data:
            team_id = row["team_id"]
            if team_id not in teams_data:
                teams_data[team_id] = {
                    "team_id": team_id,
                    "abbreviation": row["abbreviation"],
                    "quarters": {},
                    "overtime": {}
                }

            period_num = row["period_number"]
            period_type = row["period_type"]
            points = row["points"]

            if period_type == "Q":
                teams_data[team_id]["quarters"][f"Q{period_num}"] = points
            else:
                teams_data[team_id]["overtime"][f"OT{period_num}"] = points

        # Get game advanced stats
        adv_result = await self.execute("""
            SELECT
                home_pts_paint, home_pts_2nd_chance, home_pts_fastbreak,
                home_pts_off_turnovers, home_largest_lead,
                away_pts_paint, away_pts_2nd_chance, away_pts_fastbreak,
                away_pts_off_turnovers, away_largest_lead,
                lead_changes, times_tied
            FROM game_advanced_stats
            WHERE game_id = $1
        """, [game_id])

        advanced_stats = adv_result.data[0] if adv_result.data else None

        return {
            "game_id": game_id,
            "teams": list(teams_data.values()),
            "advanced_stats": advanced_stats
        }

    async def get_q1_matchup_projection(
        self,
        home_team_id: int,
        away_team_id: int
    ) -> dict:
        """
        Project Q1 total for a matchup based on both teams' Q1 averages.

        Uses team Q1 scoring at home/away and Q1 allowed at home/away
        to calculate projected Q1 total.
        """
        # Get home team Q1 stats at home
        home_q1 = await self.get_team_quarter_stats(home_team_id, period=1, location="HOME")
        # Get away team Q1 stats on road
        away_q1 = await self.get_team_quarter_stats(away_team_id, period=1, location="AWAY")

        if not home_q1.get("data_available") or not away_q1.get("data_available"):
            # Fall back to ALL location stats
            home_q1 = await self.get_team_quarter_stats(home_team_id, period=1, location="ALL")
            away_q1 = await self.get_team_quarter_stats(away_team_id, period=1, location="ALL")

        # Calculate projected Q1 scores
        # Home team projection: avg of their scoring and what away allows
        home_proj = (home_q1["avg_points"] + away_q1["avg_allowed"]) / 2
        # Away team projection: avg of their scoring and what home allows
        away_proj = (away_q1["avg_points"] + home_q1["avg_allowed"]) / 2

        projected_total = home_proj + away_proj

        return {
            "home_team_id": home_team_id,
            "away_team_id": away_team_id,
            "home_projected_q1": round(home_proj, 1),
            "away_projected_q1": round(away_proj, 1),
            "projected_q1_total": round(projected_total, 1),
            "home_q1_stats": home_q1,
            "away_q1_stats": away_q1,
            "data_quality": "full" if home_q1.get("data_available") and away_q1.get("data_available") else "partial"
        }

    async def get_1h_matchup_projection(
        self,
        home_team_id: int,
        away_team_id: int
    ) -> dict:
        """
        Project first half (1H) total for a matchup.

        Uses team 1H totals at home/away to calculate projected 1H total.
        """
        # Get home team 1H stats at home
        home_1h = await self.get_team_first_half_stats(home_team_id, location="HOME")
        # Get away team 1H stats on road
        away_1h = await self.get_team_first_half_stats(away_team_id, location="AWAY")

        if not home_1h.get("data_available") or not away_1h.get("data_available"):
            # Fall back to ALL location stats
            home_1h = await self.get_team_first_half_stats(home_team_id, location="ALL")
            away_1h = await self.get_team_first_half_stats(away_team_id, location="ALL")

        # Calculate projected 1H total
        # Average of both teams' avg_total (which is combined score at half)
        projected_total = (home_1h["avg_total"] + away_1h["avg_total"]) / 2

        return {
            "home_team_id": home_team_id,
            "away_team_id": away_team_id,
            "home_1h_avg_points": home_1h["avg_points"],
            "away_1h_avg_points": away_1h["avg_points"],
            "projected_1h_total": round(projected_total, 1),
            "home_1h_stats": home_1h,
            "away_1h_stats": away_1h,
            "data_quality": "full" if home_1h.get("data_available") and away_1h.get("data_available") else "partial"
        }

    async def get_team_all_quarter_trends(
        self,
        team_id: int,
        location: str = "ALL"
    ) -> dict:
        """
        Get all quarter trends for a team (Q1, Q2, Q3, Q4).

        Returns comprehensive period analysis for betting decisions.
        """
        season = await self.get_current_season()

        result = await self.execute("""
            SELECT
                tpa.period_number,
                tpa.avg_points,
                tpa.avg_allowed,
                tpa.period_win_pct,
                tpa.games_played,
                ROUND(tpa.avg_points - tpa.avg_allowed, 2) as differential
            FROM team_period_averages tpa
            WHERE tpa.team_id = $1
              AND tpa.season = $2
              AND tpa.period_type = 'Q'
              AND tpa.location = $3
            ORDER BY tpa.period_number
        """, [team_id, season, location.upper()])

        if not result.data:
            return {"quarters": {}, "data_available": False}

        quarters = {}
        for row in result.data:
            period_num = row["period_number"]
            quarters[f"Q{period_num}"] = {
                "avg_points": float(row.get("avg_points") or 0),
                "avg_allowed": float(row.get("avg_allowed") or 0),
                "period_win_pct": float(row.get("period_win_pct") or 0.5),
                "games_played": row.get("games_played", 0),
                "differential": float(row.get("differential") or 0)
            }

        # Calculate strongest/weakest quarters
        if quarters:
            best_q = max(quarters.keys(), key=lambda q: quarters[q]["differential"])
            worst_q = min(quarters.keys(), key=lambda q: quarters[q]["differential"])
        else:
            best_q = worst_q = None

        return {
            "quarters": quarters,
            "best_quarter": best_q,
            "worst_quarter": worst_q,
            "data_available": True
        }


# Singleton instance
_db_tool: DatabaseTool | None = None


async def get_db() -> DatabaseTool:
    """Get or create database tool instance"""
    global _db_tool
    if _db_tool is None:
        _db_tool = DatabaseTool()
        await _db_tool.connect()
    return _db_tool
