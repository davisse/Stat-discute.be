#!/usr/bin/env python3
"""
Feature Engineering Pipeline for NBA Totals ML Model (Enhanced v2)

Generates ~150 features across 7 categories:
1. Team Performance (60 features): Rolling stats L3/L5/L10/L15/Season, pace, ratings
2. Home/Away Splits (20 features): Location-specific performance
3. Rest & Schedule (12 features): B2B, rest days, travel, timezone
4. Matchup (20 features): Combined pace, rating differentials, defense tiers
5. Trends (18 features): Scoring slopes, O/U streaks, after-win/loss
6. Context (15 features): Season timing, day of week, line movement
7. Environment (5 features): Denver altitude, travel distance
"""

import os
import sys
from dataclasses import dataclass, field
from datetime import datetime, timedelta, date
from typing import Optional, Dict, List, Tuple, Union
import psycopg2


def _normalize_date(d: Union[str, date, datetime]) -> date:
    """Convert string/date/datetime to date object"""
    if isinstance(d, datetime):
        return d.date()
    elif isinstance(d, date):
        return d
    else:
        return datetime.strptime(d, '%Y-%m-%d').date()
from dotenv import load_dotenv
import numpy as np

# Load environment
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))


@dataclass
class GameFeatures:
    """Container for all features for a single game"""
    game_id: str
    game_date: str
    home_team_id: int
    away_team_id: int

    # Target variable (for training only)
    closing_line: Optional[float] = None
    actual_total: Optional[int] = None
    result: Optional[str] = None  # 'OVER', 'UNDER', 'PUSH'

    # Features dict
    features: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, float]:
        """Return features dictionary for use in ML pipeline"""
        return self.features.copy()


class FeatureEngineer:
    """
    Generate features for NBA totals prediction

    Design principles:
    - All features computed only using data available BEFORE the game
    - No look-ahead bias: only use games played before game_date
    - Handle missing data gracefully with sensible defaults
    """

    # League averages for normalization
    LEAGUE_AVG_PPG = 112.0
    LEAGUE_AVG_PACE = 100.0
    LEAGUE_AVG_ORTG = 112.0
    LEAGUE_AVG_DRTG = 112.0
    LEAGUE_AVG_TOTAL = 224.0

    # Denver Nuggets team ID (for altitude adjustment)
    DENVER_TEAM_ID = 1610612743

    # Team locations for travel distance calculation (lat, lon, timezone offset from ET)
    TEAM_LOCATIONS = {
        1610612737: (33.757, -84.396, 0),    # ATL - Atlanta
        1610612738: (42.366, -71.062, 0),    # BOS - Boston
        1610612751: (40.683, -73.976, 0),    # BKN - Brooklyn
        1610612766: (35.225, -80.839, 0),    # CHA - Charlotte
        1610612741: (41.881, -87.674, -1),   # CHI - Chicago
        1610612739: (41.497, -81.688, 0),    # CLE - Cleveland
        1610612742: (32.791, -96.810, -1),   # DAL - Dallas
        1610612743: (39.749, -105.008, -2),  # DEN - Denver
        1610612765: (42.341, -83.055, 0),    # DET - Detroit
        1610612744: (37.768, -122.388, -3),  # GSW - Golden State
        1610612745: (29.751, -95.362, -1),   # HOU - Houston
        1610612754: (39.764, -86.156, 0),    # IND - Indianapolis
        1610612746: (34.043, -118.267, -3),  # LAC - LA Clippers
        1610612747: (34.043, -118.267, -3),  # LAL - LA Lakers
        1610612763: (35.138, -90.051, -1),   # MEM - Memphis
        1610612748: (25.781, -80.188, 0),    # MIA - Miami
        1610612749: (43.045, -87.917, -1),   # MIL - Milwaukee
        1610612750: (44.980, -93.276, -1),   # MIN - Minnesota
        1610612740: (29.949, -90.082, -1),   # NOP - New Orleans
        1610612752: (40.751, -73.994, 0),    # NYK - New York
        1610612760: (35.463, -97.515, -1),   # OKC - Oklahoma City
        1610612753: (28.539, -81.384, 0),    # ORL - Orlando
        1610612755: (39.901, -75.172, 0),    # PHI - Philadelphia
        1610612756: (33.446, -112.071, -2),  # PHX - Phoenix
        1610612757: (45.532, -122.667, -3),  # POR - Portland
        1610612758: (38.580, -121.500, -3),  # SAC - Sacramento
        1610612759: (29.427, -98.438, -1),   # SAS - San Antonio
        1610612761: (43.643, -79.379, 0),    # TOR - Toronto
        1610612762: (40.768, -111.901, -2),  # UTA - Utah
        1610612764: (38.898, -77.021, 0),    # WAS - Washington
    }

    def __init__(self, db_connection=None):
        """Initialize with optional database connection"""
        self.conn = db_connection
        self.cur = None
        if self.conn:
            self.cur = self.conn.cursor()

    def connect(self):
        """Create database connection if not provided"""
        if not self.conn:
            self.conn = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '5432'),
                database=os.getenv('DB_NAME', 'nba_stats'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', '')
            )
            self.cur = self.conn.cursor()

    def close(self):
        """Close database connection"""
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()

    def generate_features(self, game_id: str, game_date: str,
                         home_team_id: int, away_team_id: int,
                         season: str) -> GameFeatures:
        """
        Generate all features for a single game

        Args:
            game_id: NBA game ID
            game_date: Date string (YYYY-MM-DD)
            home_team_id: Home team ID
            away_team_id: Away team ID
            season: Season string (e.g., '2024-25')

        Returns:
            GameFeatures object with all computed features
        """
        self.connect()

        game_features = GameFeatures(
            game_id=game_id,
            game_date=game_date,
            home_team_id=home_team_id,
            away_team_id=away_team_id
        )

        features = {}

        # Category 1: Team Performance Features (60) - now with L3 and L15
        home_perf = self._get_team_performance_features(
            home_team_id, game_date, season, prefix='home'
        )
        away_perf = self._get_team_performance_features(
            away_team_id, game_date, season, prefix='away'
        )
        features.update(home_perf)
        features.update(away_perf)

        # Category 2: Home/Away Splits (20) - NEW
        home_splits = self._get_home_away_splits(
            home_team_id, game_date, season, prefix='home', is_home=True
        )
        away_splits = self._get_home_away_splits(
            away_team_id, game_date, season, prefix='away', is_home=False
        )
        features.update(home_splits)
        features.update(away_splits)

        # Category 3: Rest & Schedule Features (12)
        rest_features = self._get_rest_schedule_features(
            home_team_id, away_team_id, game_date, season
        )
        features.update(rest_features)

        # Category 4: Matchup Features (20) - now with defense tiers
        matchup_features = self._get_matchup_features(
            home_team_id, away_team_id, game_date, season,
            home_perf, away_perf
        )
        features.update(matchup_features)

        # Category 5: Trend Features (18) - now with after-win/loss
        trend_features = self._get_trend_features(
            home_team_id, away_team_id, game_date, season
        )
        features.update(trend_features)

        # Category 6: Context Features (15) - enhanced line movement
        context_features = self._get_context_features(
            game_id, game_date, season
        )
        features.update(context_features)

        # Category 7: Environment Features (5) - NEW
        env_features = self._get_environment_features(
            home_team_id, away_team_id, game_date, season
        )
        features.update(env_features)

        game_features.features = features

        # Get target variable if available
        target = self._get_target(game_id)
        if target:
            game_features.closing_line = target['closing_line']
            game_features.actual_total = target['actual_total']
            game_features.result = target['result']

        return game_features

    def _get_team_performance_features(self, team_id: int, before_date: str,
                                        season: str, prefix: str) -> Dict[str, float]:
        """
        Team performance features (30 per team = 60 total)

        Rolling windows: L3, L5, L10, L15, Season
        Metrics: PPG, pace, ORtg, DRtg, eFG%, TOV%
        """
        features = {}

        # Get rolling stats for different windows (now including L3 and L15)
        for window, suffix in [(3, '_l3'), (5, '_l5'), (10, '_l10'), (15, '_l15'), (None, '_season')]:
            stats = self._get_team_rolling_stats(team_id, before_date, season, window)

            # Scoring
            features[f'{prefix}_ppg{suffix}'] = stats.get('ppg', self.LEAGUE_AVG_PPG)
            features[f'{prefix}_opp_ppg{suffix}'] = stats.get('opp_ppg', self.LEAGUE_AVG_PPG)

            # Pace & Efficiency
            features[f'{prefix}_pace{suffix}'] = stats.get('pace', self.LEAGUE_AVG_PACE)
            features[f'{prefix}_ortg{suffix}'] = stats.get('ortg', self.LEAGUE_AVG_ORTG)
            features[f'{prefix}_drtg{suffix}'] = stats.get('drtg', self.LEAGUE_AVG_DRTG)

            # Four Factors
            features[f'{prefix}_efg{suffix}'] = stats.get('efg_pct', 0.50)
            features[f'{prefix}_tov{suffix}'] = stats.get('tov_pct', 0.14)

        # Game count for reliability weighting
        features[f'{prefix}_games_played'] = self._get_games_played(team_id, before_date, season)

        # Volatility (std dev of scoring)
        features[f'{prefix}_scoring_std'] = self._get_scoring_volatility(team_id, before_date, season)

        # Recent form vs season average (momentum indicator)
        features[f'{prefix}_ppg_momentum'] = (
            features[f'{prefix}_ppg_l5'] - features[f'{prefix}_ppg_season']
        )
        features[f'{prefix}_drtg_momentum'] = (
            features[f'{prefix}_drtg_l5'] - features[f'{prefix}_drtg_season']
        )

        return features

    def _get_team_rolling_stats(self, team_id: int, before_date: str,
                                 season: str, window: Optional[int]) -> Dict[str, float]:
        """Get rolling average stats for a team"""
        limit_clause = f"LIMIT {window}" if window else ""

        self.cur.execute(f"""
            WITH team_games AS (
                SELECT
                    g.game_id,
                    g.game_date,
                    CASE WHEN g.home_team_id = %s THEN g.home_team_score
                         ELSE g.away_team_score END as team_score,
                    CASE WHEN g.home_team_id = %s THEN g.away_team_score
                         ELSE g.home_team_score END as opp_score,
                    tgs.pace,
                    tgs.offensive_rating,
                    tgs.defensive_rating,
                    tgs.effective_fg_pct,
                    tgs.turnover_pct
                FROM games g
                LEFT JOIN team_game_stats tgs ON g.game_id = tgs.game_id AND tgs.team_id = %s
                WHERE g.season = %s
                  AND g.game_status = 'Final'
                  AND g.game_date < %s
                  AND (g.home_team_id = %s OR g.away_team_id = %s)
                ORDER BY g.game_date DESC
                {limit_clause}
            )
            SELECT
                AVG(team_score) as ppg,
                AVG(opp_score) as opp_ppg,
                AVG(pace) as pace,
                AVG(offensive_rating) as ortg,
                AVG(defensive_rating) as drtg,
                AVG(effective_fg_pct) as efg_pct,
                AVG(turnover_pct) as tov_pct,
                COUNT(*) as games
            FROM team_games
        """, (team_id, team_id, team_id, season, before_date, team_id, team_id))

        result = self.cur.fetchone()
        if not result or result[7] == 0:  # No games
            return {}

        return {
            'ppg': float(result[0]) if result[0] else self.LEAGUE_AVG_PPG,
            'opp_ppg': float(result[1]) if result[1] else self.LEAGUE_AVG_PPG,
            'pace': float(result[2]) if result[2] else self.LEAGUE_AVG_PACE,
            'ortg': float(result[3]) if result[3] else self.LEAGUE_AVG_ORTG,
            'drtg': float(result[4]) if result[4] else self.LEAGUE_AVG_DRTG,
            'efg_pct': float(result[5]) if result[5] else 0.50,
            'tov_pct': float(result[6]) if result[6] else 0.14,
            'games': int(result[7])
        }

    def _get_games_played(self, team_id: int, before_date: str, season: str) -> int:
        """Get number of games played before date"""
        self.cur.execute("""
            SELECT COUNT(*)
            FROM games g
            WHERE g.season = %s
              AND g.game_status = 'Final'
              AND g.game_date < %s
              AND (g.home_team_id = %s OR g.away_team_id = %s)
        """, (season, before_date, team_id, team_id))
        result = self.cur.fetchone()
        return result[0] if result else 0

    def _get_scoring_volatility(self, team_id: int, before_date: str, season: str) -> float:
        """Calculate standard deviation of team scoring (last 10 games)"""
        self.cur.execute("""
            SELECT STDDEV(team_score)
            FROM (
                SELECT
                    CASE WHEN g.home_team_id = %s THEN g.home_team_score
                         ELSE g.away_team_score END as team_score
                FROM games g
                WHERE g.season = %s
                  AND g.game_status = 'Final'
                  AND g.game_date < %s
                  AND (g.home_team_id = %s OR g.away_team_id = %s)
                ORDER BY g.game_date DESC
                LIMIT 10
            ) subq
        """, (team_id, season, before_date, team_id, team_id))
        result = self.cur.fetchone()
        return float(result[0]) if result and result[0] else 10.0

    def _get_home_away_splits(self, team_id: int, before_date: str,
                               season: str, prefix: str, is_home: bool) -> Dict[str, float]:
        """
        Home/Away split features (10 per team = 20 total)

        Get team's performance specifically at home or on the road
        """
        features = {}
        location = 'home' if is_home else 'road'

        # Query for home-only or away-only games
        if is_home:
            condition = "g.home_team_id = %s"
            score_col = "g.home_team_score"
            opp_score_col = "g.away_team_score"
        else:
            condition = "g.away_team_id = %s"
            score_col = "g.away_team_score"
            opp_score_col = "g.home_team_score"

        self.cur.execute(f"""
            WITH location_games AS (
                SELECT
                    g.game_id,
                    g.game_date,
                    {score_col} as team_score,
                    {opp_score_col} as opp_score,
                    tgs.pace,
                    tgs.offensive_rating,
                    tgs.defensive_rating
                FROM games g
                LEFT JOIN team_game_stats tgs ON g.game_id = tgs.game_id AND tgs.team_id = %s
                WHERE g.season = %s
                  AND g.game_status = 'Final'
                  AND g.game_date < %s
                  AND {condition}
                ORDER BY g.game_date DESC
                LIMIT 10
            )
            SELECT
                AVG(team_score) as ppg,
                AVG(opp_score) as opp_ppg,
                AVG(pace) as pace,
                AVG(offensive_rating) as ortg,
                AVG(defensive_rating) as drtg,
                COUNT(*) as games
            FROM location_games
        """, (team_id, season, before_date, team_id))

        result = self.cur.fetchone()

        if result and result[5] > 0:
            features[f'{prefix}_{location}_ppg'] = float(result[0]) if result[0] else self.LEAGUE_AVG_PPG
            features[f'{prefix}_{location}_opp_ppg'] = float(result[1]) if result[1] else self.LEAGUE_AVG_PPG
            features[f'{prefix}_{location}_pace'] = float(result[2]) if result[2] else self.LEAGUE_AVG_PACE
            features[f'{prefix}_{location}_ortg'] = float(result[3]) if result[3] else self.LEAGUE_AVG_ORTG
            features[f'{prefix}_{location}_drtg'] = float(result[4]) if result[4] else self.LEAGUE_AVG_DRTG
            features[f'{prefix}_{location}_games'] = float(result[5])
        else:
            # Default to league averages if no location-specific data
            features[f'{prefix}_{location}_ppg'] = self.LEAGUE_AVG_PPG
            features[f'{prefix}_{location}_opp_ppg'] = self.LEAGUE_AVG_PPG
            features[f'{prefix}_{location}_pace'] = self.LEAGUE_AVG_PACE
            features[f'{prefix}_{location}_ortg'] = self.LEAGUE_AVG_ORTG
            features[f'{prefix}_{location}_drtg'] = self.LEAGUE_AVG_DRTG
            features[f'{prefix}_{location}_games'] = 0.0

        # Home/Away differential (how much better/worse at this location)
        overall_ppg = self._get_team_rolling_stats(team_id, before_date, season, None).get('ppg', self.LEAGUE_AVG_PPG)
        features[f'{prefix}_{location}_ppg_diff'] = features[f'{prefix}_{location}_ppg'] - overall_ppg

        # Win rate at this location
        features[f'{prefix}_{location}_win_pct'] = self._get_location_win_pct(team_id, before_date, season, is_home)

        return features

    def _get_location_win_pct(self, team_id: int, before_date: str,
                               season: str, is_home: bool) -> float:
        """Get win percentage at home or on the road"""
        if is_home:
            self.cur.execute("""
                SELECT
                    COUNT(*) FILTER (WHERE home_team_score > away_team_score)::float /
                    NULLIF(COUNT(*), 0) as win_pct
                FROM games
                WHERE season = %s
                  AND game_status = 'Final'
                  AND game_date < %s
                  AND home_team_id = %s
            """, (season, before_date, team_id))
        else:
            self.cur.execute("""
                SELECT
                    COUNT(*) FILTER (WHERE away_team_score > home_team_score)::float /
                    NULLIF(COUNT(*), 0) as win_pct
                FROM games
                WHERE season = %s
                  AND game_status = 'Final'
                  AND game_date < %s
                  AND away_team_id = %s
            """, (season, before_date, team_id))

        result = self.cur.fetchone()
        return float(result[0]) if result and result[0] else 0.5

    def _get_rest_schedule_features(self, home_team_id: int, away_team_id: int,
                                     game_date: str, season: str) -> Dict[str, float]:
        """
        Rest and schedule features (10 total)

        - Rest days for each team
        - Back-to-back flags
        - Games in last 7 days
        """
        features = {}

        for team_id, prefix in [(home_team_id, 'home'), (away_team_id, 'away')]:
            # Days since last game
            rest = self._get_rest_days(team_id, game_date, season)
            features[f'{prefix}_rest_days'] = rest

            # Back-to-back flag
            features[f'{prefix}_is_b2b'] = 1.0 if rest == 1 else 0.0

            # Second of B2B (more impactful)
            features[f'{prefix}_is_2nd_b2b'] = 1.0 if rest == 1 else 0.0

            # Games in last 7 days
            games_l7 = self._get_games_in_window(team_id, game_date, season, 7)
            features[f'{prefix}_games_l7'] = float(games_l7)

        # Combined rest differential
        features['rest_diff'] = features['home_rest_days'] - features['away_rest_days']

        # Both teams on B2B (usually lower scoring)
        features['both_b2b'] = 1.0 if features['home_is_b2b'] and features['away_is_b2b'] else 0.0

        return features

    def _get_rest_days(self, team_id: int, game_date: str, season: str) -> int:
        """Get days since team's last game"""
        self.cur.execute("""
            SELECT game_date
            FROM games
            WHERE season = %s
              AND game_status = 'Final'
              AND game_date < %s
              AND (home_team_id = %s OR away_team_id = %s)
            ORDER BY game_date DESC
            LIMIT 1
        """, (season, game_date, team_id, team_id))

        result = self.cur.fetchone()
        if not result:
            return 3  # Default: assume normal rest

        last_game = result[0]
        current = _normalize_date(game_date)
        last_game = _normalize_date(last_game)

        return (current - last_game).days

    def _get_games_in_window(self, team_id: int, game_date: str,
                              season: str, days: int) -> int:
        """Get number of games in the last N days"""
        self.cur.execute("""
            SELECT COUNT(*)
            FROM games
            WHERE season = %s
              AND game_status = 'Final'
              AND game_date < %s
              AND game_date >= %s::date - interval '%s days'
              AND (home_team_id = %s OR away_team_id = %s)
        """, (season, game_date, game_date, days, team_id, team_id))

        result = self.cur.fetchone()
        return result[0] if result else 0

    def _get_matchup_features(self, home_team_id: int, away_team_id: int,
                               game_date: str, season: str,
                               home_perf: Dict, away_perf: Dict) -> Dict[str, float]:
        """
        Matchup-specific features (20 total)

        - Combined pace, ratings
        - Differential metrics
        - Matchup-based projections
        - Opponent defense tier analysis
        """
        features = {}

        # Combined metrics
        features['combined_pace'] = (
            home_perf.get('home_pace_season', 100) +
            away_perf.get('away_pace_season', 100)
        ) / 2

        features['combined_ppg'] = (
            home_perf.get('home_ppg_season', 112) +
            away_perf.get('away_ppg_season', 112)
        )

        features['combined_ortg'] = (
            home_perf.get('home_ortg_season', 112) +
            away_perf.get('away_ortg_season', 112)
        ) / 2

        features['combined_drtg'] = (
            home_perf.get('home_drtg_season', 112) +
            away_perf.get('away_drtg_season', 112)
        ) / 2

        # Differential metrics
        features['pace_diff'] = (
            home_perf.get('home_pace_season', 100) -
            away_perf.get('away_pace_season', 100)
        )

        features['ortg_diff'] = (
            home_perf.get('home_ortg_season', 112) -
            away_perf.get('away_ortg_season', 112)
        )

        features['drtg_diff'] = (
            home_perf.get('home_drtg_season', 112) -
            away_perf.get('away_drtg_season', 112)
        )

        # Matchup projection
        # Home expected = (Home ORtg + Away DRtg) / 2 * Pace factor
        home_expected = (
            home_perf.get('home_ortg_season', 112) +
            away_perf.get('away_drtg_season', 112)
        ) / 2

        away_expected = (
            away_perf.get('away_ortg_season', 112) +
            home_perf.get('home_drtg_season', 112)
        ) / 2

        pace_factor = features['combined_pace'] / 100.0

        features['projected_home_score'] = home_expected * pace_factor
        features['projected_away_score'] = away_expected * pace_factor
        features['projected_total'] = features['projected_home_score'] + features['projected_away_score']

        # Offensive vs Defensive matchup quality
        # High ORtg vs Low DRtg = high scoring potential
        features['home_vs_away_def'] = (
            home_perf.get('home_ortg_season', 112) -
            away_perf.get('away_drtg_season', 112)
        )

        features['away_vs_home_def'] = (
            away_perf.get('away_ortg_season', 112) -
            home_perf.get('home_drtg_season', 112)
        )

        # Efficiency spread (how different are the teams)
        features['net_rating_diff'] = (
            (home_perf.get('home_ortg_season', 112) - home_perf.get('home_drtg_season', 112)) -
            (away_perf.get('away_ortg_season', 112) - away_perf.get('away_drtg_season', 112))
        )

        # Opponent Defense Tier Analysis
        # Classify opponent's defense into tiers based on DRtg
        home_opp_drtg = away_perf.get('away_drtg_season', self.LEAGUE_AVG_DRTG)  # Home team faces away defense
        away_opp_drtg = home_perf.get('home_drtg_season', self.LEAGUE_AVG_DRTG)  # Away team faces home defense

        # Get league defense ranking for each opponent (requires knowing all teams)
        home_opp_def_tier = self._get_defense_tier(home_opp_drtg)
        away_opp_def_tier = self._get_defense_tier(away_opp_drtg)

        features['home_vs_elite_def'] = 1.0 if home_opp_def_tier == 'elite' else 0.0
        features['home_vs_good_def'] = 1.0 if home_opp_def_tier == 'good' else 0.0
        features['home_vs_poor_def'] = 1.0 if home_opp_def_tier == 'poor' else 0.0

        features['away_vs_elite_def'] = 1.0 if away_opp_def_tier == 'elite' else 0.0
        features['away_vs_good_def'] = 1.0 if away_opp_def_tier == 'good' else 0.0
        features['away_vs_poor_def'] = 1.0 if away_opp_def_tier == 'poor' else 0.0

        # Combined defense tier indicator
        features['both_vs_poor_def'] = 1.0 if (
            home_opp_def_tier == 'poor' and away_opp_def_tier == 'poor'
        ) else 0.0

        return features

    def _get_defense_tier(self, drtg: float) -> str:
        """
        Classify defense quality based on defensive rating.
        Lower DRtg = better defense.
        Elite: < 108, Good: 108-112, Average: 112-116, Poor: > 116
        """
        if drtg < 108:
            return 'elite'
        elif drtg < 112:
            return 'good'
        elif drtg < 116:
            return 'average'
        else:
            return 'poor'

    def _get_trend_features(self, home_team_id: int, away_team_id: int,
                             game_date: str, season: str) -> Dict[str, float]:
        """
        Trend features (18 total)

        - Scoring trends (slope of last 5-10 games)
        - Win/loss streaks
        - O/U streaks
        - After-extreme game flags
        - After-win/loss performance splits (NEW)
        """
        features = {}

        for team_id, prefix in [(home_team_id, 'home'), (away_team_id, 'away')]:
            # Scoring trend (regression slope over last 10 games)
            slope = self._calculate_scoring_trend(team_id, game_date, season)
            features[f'{prefix}_scoring_trend'] = slope

            # Win streak
            streak = self._get_win_streak(team_id, game_date, season)
            features[f'{prefix}_win_streak'] = float(streak)

            # O/U streak (consecutive overs or unders)
            ou_streak = self._get_ou_streak(team_id, game_date, season)
            features[f'{prefix}_ou_streak'] = float(ou_streak)

            # Coming off extreme game
            extreme = self._check_extreme_game(team_id, game_date, season)
            features[f'{prefix}_after_high'] = extreme['after_high']
            features[f'{prefix}_after_low'] = extreme['after_low']

            # After-win/loss performance (NEW)
            after_wl = self._get_after_result_performance(team_id, game_date, season)
            features[f'{prefix}_ppg_after_win'] = after_wl['ppg_after_win']
            features[f'{prefix}_ppg_after_loss'] = after_wl['ppg_after_loss']
            features[f'{prefix}_is_after_win'] = after_wl['is_after_win']
            features[f'{prefix}_is_after_loss'] = after_wl['is_after_loss']

        # Combined trends
        features['combined_scoring_trend'] = (
            features['home_scoring_trend'] + features['away_scoring_trend']
        )

        # Both on win streak (confidence indicator)
        features['both_winning'] = 1.0 if (
            features['home_win_streak'] > 0 and features['away_win_streak'] > 0
        ) else 0.0

        # Both on over streak (momentum indicator)
        features['both_over_streak'] = 1.0 if (
            features['home_ou_streak'] > 0 and features['away_ou_streak'] > 0
        ) else 0.0

        # Both coming off a loss (potential bounce-back scenario)
        features['both_after_loss'] = 1.0 if (
            features['home_is_after_loss'] == 1.0 and features['away_is_after_loss'] == 1.0
        ) else 0.0

        return features

    def _calculate_scoring_trend(self, team_id: int, game_date: str, season: str) -> float:
        """Calculate scoring trend (linear regression slope) over last 10 games"""
        self.cur.execute("""
            SELECT team_score
            FROM (
                SELECT
                    CASE WHEN g.home_team_id = %s THEN g.home_team_score
                         ELSE g.away_team_score END as team_score,
                    g.game_date
                FROM games g
                WHERE g.season = %s
                  AND g.game_status = 'Final'
                  AND g.game_date < %s
                  AND (g.home_team_id = %s OR g.away_team_id = %s)
                ORDER BY g.game_date DESC
                LIMIT 10
            ) subq
            ORDER BY game_date ASC
        """, (team_id, season, game_date, team_id, team_id))

        scores = [float(r[0]) for r in self.cur.fetchall()]
        if len(scores) < 3:
            return 0.0

        # Simple linear regression slope
        x = np.arange(len(scores))
        slope = np.polyfit(x, scores, 1)[0]
        return float(slope)

    def _get_win_streak(self, team_id: int, game_date: str, season: str) -> int:
        """Get current win/loss streak (positive = wins, negative = losses)"""
        self.cur.execute("""
            SELECT
                CASE WHEN g.home_team_id = %s THEN
                    CASE WHEN g.home_team_score > g.away_team_score THEN 1 ELSE -1 END
                ELSE
                    CASE WHEN g.away_team_score > g.home_team_score THEN 1 ELSE -1 END
                END as result
            FROM games g
            WHERE g.season = %s
              AND g.game_status = 'Final'
              AND g.game_date < %s
              AND (g.home_team_id = %s OR g.away_team_id = %s)
            ORDER BY g.game_date DESC
            LIMIT 10
        """, (team_id, season, game_date, team_id, team_id))

        results = [r[0] for r in self.cur.fetchall()]
        if not results:
            return 0

        streak = 0
        first_result = results[0]
        for r in results:
            if r == first_result:
                streak += first_result
            else:
                break

        return streak

    def _get_ou_streak(self, team_id: int, game_date: str, season: str) -> int:
        """Get over/under streak (positive = overs, negative = unders)"""
        self.cur.execute("""
            SELECT gor.game_total_result
            FROM game_ou_results gor
            JOIN games g ON gor.game_id = g.game_id
            WHERE g.season = %s
              AND g.game_date < %s
              AND (g.home_team_id = %s OR g.away_team_id = %s)
            ORDER BY g.game_date DESC
            LIMIT 10
        """, (season, game_date, team_id, team_id))

        results = self.cur.fetchall()
        if not results:
            return 0

        streak = 0
        first_result = results[0][0]
        if first_result == 'PUSH':
            return 0

        direction = 1 if first_result == 'OVER' else -1

        for r in results:
            if r[0] == first_result:
                streak += direction
            elif r[0] != 'PUSH':
                break

        return streak

    def _check_extreme_game(self, team_id: int, game_date: str, season: str) -> Dict[str, float]:
        """Check if team is coming off an extreme scoring game"""
        self.cur.execute("""
            SELECT
                g.home_team_score + g.away_team_score as total,
                gor.game_total_line
            FROM games g
            LEFT JOIN game_ou_results gor ON g.game_id = gor.game_id
            WHERE g.season = %s
              AND g.game_status = 'Final'
              AND g.game_date < %s
              AND (g.home_team_id = %s OR g.away_team_id = %s)
            ORDER BY g.game_date DESC
            LIMIT 1
        """, (season, game_date, team_id, team_id))

        result = self.cur.fetchone()
        if not result or not result[0]:
            return {'after_high': 0.0, 'after_low': 0.0}

        total = result[0]
        line = result[1] if result[1] else 224

        margin = total - line

        return {
            'after_high': 1.0 if margin >= 15 else 0.0,  # Went 15+ over line
            'after_low': 1.0 if margin <= -15 else 0.0   # Went 15+ under line
        }

    def _get_after_result_performance(self, team_id: int, game_date: str,
                                        season: str) -> Dict[str, float]:
        """
        Get team's scoring performance after wins vs after losses.
        Also determine if the most recent game was a win or loss.
        """
        # Get last game result
        self.cur.execute("""
            SELECT
                CASE WHEN g.home_team_id = %s THEN
                    CASE WHEN g.home_team_score > g.away_team_score THEN 'W' ELSE 'L' END
                ELSE
                    CASE WHEN g.away_team_score > g.home_team_score THEN 'W' ELSE 'L' END
                END as result
            FROM games g
            WHERE g.season = %s
              AND g.game_status = 'Final'
              AND g.game_date < %s
              AND (g.home_team_id = %s OR g.away_team_id = %s)
            ORDER BY g.game_date DESC
            LIMIT 1
        """, (team_id, season, game_date, team_id, team_id))

        last_result = self.cur.fetchone()
        is_after_win = 1.0 if last_result and last_result[0] == 'W' else 0.0
        is_after_loss = 1.0 if last_result and last_result[0] == 'L' else 0.0

        # Get average scoring after wins (last 15 games after a win)
        self.cur.execute("""
            WITH game_results AS (
                SELECT
                    g.game_id,
                    g.game_date,
                    CASE WHEN g.home_team_id = %s THEN g.home_team_score
                         ELSE g.away_team_score END as team_score,
                    CASE WHEN g.home_team_id = %s THEN
                        CASE WHEN g.home_team_score > g.away_team_score THEN 'W' ELSE 'L' END
                    ELSE
                        CASE WHEN g.away_team_score > g.home_team_score THEN 'W' ELSE 'L' END
                    END as result,
                    LAG(
                        CASE WHEN g.home_team_id = %s THEN
                            CASE WHEN g.home_team_score > g.away_team_score THEN 'W' ELSE 'L' END
                        ELSE
                            CASE WHEN g.away_team_score > g.home_team_score THEN 'W' ELSE 'L' END
                        END
                    ) OVER (ORDER BY g.game_date) as prev_result
                FROM games g
                WHERE g.season = %s
                  AND g.game_status = 'Final'
                  AND g.game_date < %s
                  AND (g.home_team_id = %s OR g.away_team_id = %s)
                ORDER BY g.game_date DESC
            )
            SELECT
                AVG(CASE WHEN prev_result = 'W' THEN team_score END) as ppg_after_win,
                AVG(CASE WHEN prev_result = 'L' THEN team_score END) as ppg_after_loss
            FROM game_results
            WHERE prev_result IS NOT NULL
        """, (team_id, team_id, team_id, season, game_date, team_id, team_id))

        result = self.cur.fetchone()

        return {
            'ppg_after_win': float(result[0]) if result and result[0] else self.LEAGUE_AVG_PPG,
            'ppg_after_loss': float(result[1]) if result and result[1] else self.LEAGUE_AVG_PPG,
            'is_after_win': is_after_win,
            'is_after_loss': is_after_loss
        }

    def _get_context_features(self, game_id: str, game_date: str,
                               season: str) -> Dict[str, float]:
        """
        Context features (10 total)

        - Day of week
        - Month/season timing
        - Line info
        """
        features = {}

        # Parse date (handle both string and date objects)
        dt = _normalize_date(game_date)

        # Day of week (0=Monday, 6=Sunday)
        features['day_of_week'] = float(dt.weekday())

        # Is weekend
        features['is_weekend'] = 1.0 if dt.weekday() >= 5 else 0.0

        # Month (for seasonal effects)
        features['month'] = float(dt.month)

        # Season progress (0=start, 1=end)
        # NBA season: Oct-Apr (roughly 180 days)
        season_start_year = int(season.split('-')[0])
        season_start = date(season_start_year, 10, 15)
        season_end = date(season_start_year + 1, 4, 15)

        if dt < season_start:
            features['season_progress'] = 0.0
        elif dt > season_end:
            features['season_progress'] = 1.0
        else:
            total_days = (season_end - season_start).days
            elapsed = (dt - season_start).days
            features['season_progress'] = elapsed / total_days

        # Is early season (first 20 games ~ first month)
        features['is_early_season'] = 1.0 if features['season_progress'] < 0.15 else 0.0

        # Is late season (playoff push)
        features['is_late_season'] = 1.0 if features['season_progress'] > 0.85 else 0.0

        # Line information (enhanced)
        line_info = self._get_line_info(game_id)
        features['opening_line'] = line_info.get('opening', self.LEAGUE_AVG_TOTAL)
        features['closing_line'] = line_info.get('closing', self.LEAGUE_AVG_TOTAL)
        features['line_movement'] = features['closing_line'] - features['opening_line']
        features['line_vs_avg'] = features['closing_line'] - self.LEAGUE_AVG_TOTAL

        # Enhanced line movement features
        features['line_movement_abs'] = abs(features['line_movement'])
        features['line_moved_up'] = 1.0 if features['line_movement'] > 0.5 else 0.0
        features['line_moved_down'] = 1.0 if features['line_movement'] < -0.5 else 0.0
        features['line_big_move'] = 1.0 if abs(features['line_movement']) >= 2.0 else 0.0

        return features

    def _get_line_info(self, game_id: str) -> Dict[str, float]:
        """Get opening and closing lines for a game"""
        # Try betting_odds first
        self.cur.execute("""
            SELECT bo.handicap, bo.is_closing_line
            FROM betting_odds bo
            JOIN betting_markets bm ON bo.market_id = bm.market_id
            JOIN betting_events be ON bm.event_id = be.event_id
            WHERE be.game_id = %s
              AND bm.market_type = 'total'
              AND bo.selection = 'Over'
              AND bo.handicap IS NOT NULL
            ORDER BY bo.is_closing_line ASC, bo.recorded_at ASC
        """, (game_id,))

        results = self.cur.fetchall()

        opening = None
        closing = None

        for r in results:
            if not r[1]:  # Not closing line
                if opening is None:
                    opening = float(r[0])
            else:
                closing = float(r[0])

        if closing is None and opening is not None:
            closing = opening

        # Try betting_lines as fallback
        if closing is None:
            self.cur.execute("""
                SELECT total FROM betting_lines
                WHERE game_id = %s AND total IS NOT NULL
                ORDER BY recorded_at DESC
                LIMIT 1
            """, (game_id,))
            result = self.cur.fetchone()
            if result:
                closing = float(result[0])
                if opening is None:
                    opening = closing

        return {
            'opening': opening if opening else self.LEAGUE_AVG_TOTAL,
            'closing': closing if closing else self.LEAGUE_AVG_TOTAL
        }

    def _get_target(self, game_id: str) -> Optional[Dict]:
        """Get target variable (closing line, actual total, result)"""
        self.cur.execute("""
            SELECT
                gor.game_total_line,
                gor.actual_total,
                gor.game_total_result
            FROM game_ou_results gor
            WHERE gor.game_id = %s
        """, (game_id,))

        result = self.cur.fetchone()
        if not result:
            # Try to calculate from game scores
            self.cur.execute("""
                SELECT
                    gcl.game_total_line,
                    g.home_team_score + g.away_team_score as actual_total
                FROM games g
                LEFT JOIN game_closing_lines gcl ON g.game_id = gcl.game_id
                WHERE g.game_id = %s
                  AND g.game_status = 'Final'
            """, (game_id,))
            result = self.cur.fetchone()
            if not result or not result[1]:
                return None

            closing = float(result[0]) if result[0] else None
            actual = int(result[1])

            if closing:
                if actual > closing:
                    result_str = 'OVER'
                elif actual < closing:
                    result_str = 'UNDER'
                else:
                    result_str = 'PUSH'
            else:
                result_str = None

            return {
                'closing_line': closing,
                'actual_total': actual,
                'result': result_str
            }

        return {
            'closing_line': float(result[0]) if result[0] else None,
            'actual_total': int(result[1]) if result[1] else None,
            'result': result[2]
        }

    def _get_environment_features(self, home_team_id: int, away_team_id: int,
                                    game_date: str, season: str) -> Dict[str, float]:
        """
        Environment features (5 total)

        - Denver altitude effect (games at high altitude tend to score higher)
        - Travel distance for away team
        - Timezone change impact
        """
        import math
        features = {}

        # Denver altitude flag (Mile High = higher scoring games)
        features['is_denver_game'] = 1.0 if home_team_id == self.DENVER_TEAM_ID else 0.0

        # Calculate travel distance for away team
        away_loc = self.TEAM_LOCATIONS.get(away_team_id)
        home_loc = self.TEAM_LOCATIONS.get(home_team_id)

        if away_loc and home_loc:
            # Haversine distance calculation (in miles)
            lat1, lon1, tz1 = away_loc
            lat2, lon2, tz2 = home_loc

            # Convert to radians
            lat1, lon1 = math.radians(lat1), math.radians(lon1)
            lat2, lon2 = math.radians(lat2), math.radians(lon2)

            dlat = lat2 - lat1
            dlon = lon2 - lon1

            a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            distance_miles = 3956 * c  # Earth radius in miles

            features['travel_distance'] = distance_miles / 1000  # Normalize to thousands of miles
            features['is_cross_country'] = 1.0 if distance_miles > 1500 else 0.0

            # Timezone change (impact on circadian rhythm)
            tz_change = abs(tz2 - tz1)
            features['timezone_change'] = float(tz_change)
            features['is_coast_to_coast'] = 1.0 if tz_change >= 3 else 0.0
        else:
            features['travel_distance'] = 0.5  # Default to moderate travel
            features['is_cross_country'] = 0.0
            features['timezone_change'] = 0.0
            features['is_coast_to_coast'] = 0.0

        return features

    def get_feature_names(self) -> List[str]:
        """Return list of all feature names in order (~150 features)"""
        # This should match the order features are generated
        names = []

        # Category 1: Team Performance Features (per team) - L3, L5, L10, L15, Season
        for prefix in ['home', 'away']:
            for suffix in ['_l3', '_l5', '_l10', '_l15', '_season']:
                names.extend([
                    f'{prefix}_ppg{suffix}',
                    f'{prefix}_opp_ppg{suffix}',
                    f'{prefix}_pace{suffix}',
                    f'{prefix}_ortg{suffix}',
                    f'{prefix}_drtg{suffix}',
                    f'{prefix}_efg{suffix}',
                    f'{prefix}_tov{suffix}',
                ])
            names.extend([
                f'{prefix}_games_played',
                f'{prefix}_scoring_std',
                f'{prefix}_ppg_momentum',
                f'{prefix}_drtg_momentum',
            ])

        # Category 2: Home/Away Splits (per team)
        for prefix in ['home', 'away']:
            location = 'home' if prefix == 'home' else 'road'
            names.extend([
                f'{prefix}_{location}_ppg',
                f'{prefix}_{location}_opp_ppg',
                f'{prefix}_{location}_pace',
                f'{prefix}_{location}_ortg',
                f'{prefix}_{location}_drtg',
                f'{prefix}_{location}_games',
                f'{prefix}_{location}_ppg_diff',
                f'{prefix}_{location}_win_pct',
            ])

        # Category 3: Rest & Schedule Features
        for prefix in ['home', 'away']:
            names.extend([
                f'{prefix}_rest_days',
                f'{prefix}_is_b2b',
                f'{prefix}_is_2nd_b2b',
                f'{prefix}_games_l7',
            ])
        names.extend(['rest_diff', 'both_b2b'])

        # Category 4: Matchup Features (including defense tiers)
        names.extend([
            'combined_pace', 'combined_ppg', 'combined_ortg', 'combined_drtg',
            'pace_diff', 'ortg_diff', 'drtg_diff',
            'projected_home_score', 'projected_away_score', 'projected_total',
            'home_vs_away_def', 'away_vs_home_def', 'net_rating_diff',
            # Defense tier features
            'home_vs_elite_def', 'home_vs_good_def', 'home_vs_poor_def',
            'away_vs_elite_def', 'away_vs_good_def', 'away_vs_poor_def',
            'both_vs_poor_def',
        ])

        # Category 5: Trend Features (including after-win/loss)
        for prefix in ['home', 'away']:
            names.extend([
                f'{prefix}_scoring_trend',
                f'{prefix}_win_streak',
                f'{prefix}_ou_streak',
                f'{prefix}_after_high',
                f'{prefix}_after_low',
                # After-win/loss performance
                f'{prefix}_ppg_after_win',
                f'{prefix}_ppg_after_loss',
                f'{prefix}_is_after_win',
                f'{prefix}_is_after_loss',
            ])
        names.extend([
            'combined_scoring_trend', 'both_winning', 'both_over_streak',
            'both_after_loss',
        ])

        # Category 6: Context Features (enhanced line movement)
        names.extend([
            'day_of_week', 'is_weekend', 'month', 'season_progress',
            'is_early_season', 'is_late_season',
            'opening_line', 'closing_line', 'line_movement', 'line_vs_avg',
            # Enhanced line movement
            'line_movement_abs', 'line_moved_up', 'line_moved_down', 'line_big_move',
        ])

        # Category 7: Environment Features
        names.extend([
            'is_denver_game',
            'travel_distance', 'is_cross_country',
            'timezone_change', 'is_coast_to_coast',
        ])

        return names


def main():
    """Test feature engineering"""
    print("=" * 70)
    print("FEATURE ENGINEERING TEST")
    print("=" * 70)

    engineer = FeatureEngineer()

    try:
        engineer.connect()

        # Get a sample game
        engineer.cur.execute("""
            SELECT g.game_id, g.game_date::text, g.home_team_id, g.away_team_id, g.season,
                   ht.abbreviation, at.abbreviation
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE g.season = '2022-23'
              AND g.game_status = 'Final'
            ORDER BY g.game_date
            OFFSET 50
            LIMIT 1
        """)

        sample = engineer.cur.fetchone()
        if not sample:
            print("No sample game found")
            return

        game_id, game_date, home_id, away_id, season, home_abbr, away_abbr = sample
        print(f"\nSample Game: {away_abbr} @ {home_abbr} on {game_date}")
        print(f"Game ID: {game_id}")

        # Generate features
        print("\nGenerating features...")
        game_features = engineer.generate_features(
            game_id, game_date, home_id, away_id, season
        )

        print(f"\nGenerated {len(game_features.features)} features")

        # Print sample features
        print("\nSample features:")
        sample_keys = [
            'home_ppg_season', 'away_ppg_season',
            'combined_pace', 'projected_total',
            'home_rest_days', 'away_rest_days',
            'home_scoring_trend', 'closing_line'
        ]

        for key in sample_keys:
            value = game_features.features.get(key, 'N/A')
            if isinstance(value, float):
                print(f"  {key}: {value:.2f}")
            else:
                print(f"  {key}: {value}")

        # Print target
        if game_features.closing_line:
            print(f"\nTarget:")
            print(f"  Closing Line: {game_features.closing_line}")
            print(f"  Actual Total: {game_features.actual_total}")
            print(f"  Result: {game_features.result}")

        # Print feature names
        print(f"\nAll feature names ({len(engineer.get_feature_names())}):")
        for i, name in enumerate(engineer.get_feature_names()[:20]):
            print(f"  {i+1}. {name}")
        print("  ...")

    finally:
        engineer.close()

    print("\n" + "=" * 70)
    print("Feature engineering test completed!")
    print("=" * 70)


if __name__ == '__main__':
    main()
