#!/usr/bin/env python3
"""
Enhanced NBA Totals Prediction Model v2.0

Incorporates ALL factors from stats.nba.com analysis:
1. Original factors (B2B, pace, season timing, scoring extremes)
2. NEW: Hustle stats (deflections, contested shots) → Defensive intensity
3. NEW: Shooting zones (paint-heavy vs three-heavy) → Scoring variance
4. NEW: Defense dashboard (opponent FG%, DRtg) → Matchup-specific defense

Research-backed adjustments with historical validation.
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Tuple
from enum import Enum
import json


class Confidence(Enum):
    NONE = "NONE"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"


class BetSignal(Enum):
    NO_BET = "NO_BET"
    LEAN_OVER = "LEAN_OVER"
    LEAN_UNDER = "LEAN_UNDER"
    BET_OVER = "BET_OVER"
    BET_UNDER = "BET_UNDER"
    STRONG_OVER = "STRONG_OVER"
    STRONG_UNDER = "STRONG_UNDER"


@dataclass
class Adjustment:
    """Individual adjustment with metadata"""
    name: str
    value: float
    confidence: Confidence
    description: str
    category: str = "situational"  # situational, hustle, shooting, defense


@dataclass
class EnhancedGameAnalysis:
    """Complete enhanced analysis for a single game"""
    game_id: str
    matchup: str
    game_date: datetime

    # Teams
    home_team: str
    away_team: str
    home_team_id: int
    away_team_id: int

    # Base calculation
    home_ppg: float
    away_ppg: float
    base_expected: float

    # Original adjustments
    situational_adjustments: List[Adjustment]

    # NEW: Enhanced adjustments
    hustle_adjustments: List[Adjustment]
    shooting_adjustments: List[Adjustment]
    defense_adjustments: List[Adjustment]

    # Totals
    total_adjustment: float
    enhanced_expected: float

    # Enhanced metrics
    home_hustle_score: float = 0.0
    away_hustle_score: float = 0.0
    home_shot_profile: str = "balanced"
    away_shot_profile: str = "balanced"
    home_def_tier: str = "average"
    away_def_tier: str = "average"

    # Variance analysis
    expected_variance: float = 10.0
    variance_tier: str = "normal"  # low, normal, high

    # Comparison to line
    closing_line: Optional[float] = None
    edge: Optional[float] = None

    # Flags
    home_b2b: bool = False
    away_b2b: bool = False
    is_early_season: bool = False

    # Recommendation
    signal: BetSignal = BetSignal.NO_BET
    confidence: Confidence = Confidence.NONE
    reasoning: str = ""

    # All adjustments combined
    @property
    def all_adjustments(self) -> List[Adjustment]:
        return (self.situational_adjustments + self.hustle_adjustments +
                self.shooting_adjustments + self.defense_adjustments)


class EnhancedTotalsModel:
    """
    Enhanced model with hustle, shooting, and defense factors.
    """

    # ==========================================================================
    # ORIGINAL VALIDATED ADJUSTMENTS
    # ==========================================================================
    SITUATIONAL_ADJUSTMENTS = {
        'away_b2b': -2.7,
        'both_b2b': -3.4,
        'home_b2b': 0.0,  # Not significant
        'both_fast': 3.0,
        'both_slow': -3.0,
        'early_season': -2.0,
        'february': 1.5,
        'after_high_to_away': -1.5,
        'after_low_crash': -4.0,
        'after_low_persist': -1.5,
        'after_high_momentum': 1.5,
    }

    # ==========================================================================
    # NEW: HUSTLE-BASED ADJUSTMENTS
    # ==========================================================================
    HUSTLE_ADJUSTMENTS = {
        # High hustle vs low hustle creates defensive intensity mismatch
        'high_hustle_vs_low': -2.5,    # Strong defense → lower scoring
        'both_high_hustle': -2.0,       # Both teams intense defense
        'both_low_hustle': 2.0,         # Both teams weak defense → higher scoring
        'hustle_mismatch_large': -1.5,  # Significant hustle gap
    }

    # ==========================================================================
    # NEW: SHOOTING PROFILE ADJUSTMENTS
    # ==========================================================================
    SHOOTING_ADJUSTMENTS = {
        # Three-heavy teams have more variance
        'both_three_heavy': 1.5,        # Higher variance, slight over tendency
        'three_heavy_hot': 2.5,         # Three-heavy team on hot streak
        'three_heavy_cold': -2.5,       # Three-heavy team shooting cold

        # Paint-heavy teams more consistent
        'paint_heavy_vs_weak_interior': 2.0,  # Easy buckets at rim
        'paint_heavy_vs_rim_protector': -2.0,  # Rim protection matchup

        # Variance indicators
        'high_variance_matchup': 0.0,   # No edge but higher uncertainty
    }

    # ==========================================================================
    # NEW: DEFENSE MATCHUP ADJUSTMENTS
    # ==========================================================================
    DEFENSE_ADJUSTMENTS = {
        # Elite defense matchups
        'elite_def_vs_poor_off': -3.0,  # Strong UNDER signal
        'elite_def_vs_elite_off': -1.0, # Slight under
        'both_elite_defense': -2.5,     # Low-scoring game

        # Poor defense matchups
        'poor_def_vs_elite_off': 3.0,   # Strong OVER signal
        'poor_def_vs_good_off': 2.0,
        'both_poor_defense': 2.5,       # High-scoring shootout

        # Average matchups
        'def_rating_differential': 0.0,  # Calculated dynamically
    }

    # Thresholds
    HUSTLE_HIGH_THRESHOLD = 65.0
    HUSTLE_LOW_THRESHOLD = 45.0
    DEF_RATING_ELITE = 108.0
    DEF_RATING_POOR = 116.0
    EDGE_SWEET_SPOT = (4.0, 6.0)
    EDGE_MAX_RELIABLE = 8.0

    def __init__(self, db_config: Dict = None):
        self.db_config = db_config or {
            'host': 'localhost',
            'port': 5432,
            'database': 'nba_stats',
            'user': 'chapirou'
        }

    def get_db_connection(self):
        return psycopg2.connect(
            **self.db_config,
            cursor_factory=RealDictCursor
        )

    def get_current_season(self) -> str:
        """Get current season from database"""
        conn = self.get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT season_id FROM seasons WHERE is_current = true LIMIT 1")
        result = cur.fetchone()
        cur.close()
        conn.close()
        return result['season_id'] if result else '2025-26'

    # ==========================================================================
    # HUSTLE STATS METHODS
    # ==========================================================================
    def get_team_hustle_data(self, cur, team_id: int, season: str) -> Optional[Dict]:
        """Get team's hustle stats from team_hustle_averages"""
        cur.execute("""
            SELECT
                hustle_intensity_score,
                hustle_tier,
                avg_deflections,
                avg_contested_shots,
                avg_loose_balls
            FROM team_hustle_averages
            WHERE team_id = %s AND season = %s
        """, (team_id, season))
        result = cur.fetchone()
        if result:
            return dict(result)
        return None

    def calculate_hustle_adjustments(self, home_hustle: Optional[Dict],
                                     away_hustle: Optional[Dict]) -> List[Adjustment]:
        """Calculate adjustments based on hustle intensity matchup"""
        adjustments = []

        if not home_hustle or not away_hustle:
            return adjustments

        home_score = float(home_hustle.get('hustle_intensity_score', 50.0) or 50.0)
        away_score = float(away_hustle.get('hustle_intensity_score', 50.0) or 50.0)
        home_tier = home_hustle.get('hustle_tier', 'medium')
        away_tier = away_hustle.get('hustle_tier', 'medium')

        # Both high hustle = defensive battle
        if home_tier == 'high' and away_tier == 'high':
            adjustments.append(Adjustment(
                name='both_high_hustle',
                value=self.HUSTLE_ADJUSTMENTS['both_high_hustle'],
                confidence=Confidence.MEDIUM,
                description=f"Both teams high hustle intensity ({home_score:.0f} vs {away_score:.0f})",
                category='hustle'
            ))

        # Both low hustle = less defensive intensity
        elif home_tier == 'low' and away_tier == 'low':
            adjustments.append(Adjustment(
                name='both_low_hustle',
                value=self.HUSTLE_ADJUSTMENTS['both_low_hustle'],
                confidence=Confidence.MEDIUM,
                description=f"Both teams low hustle intensity ({home_score:.0f} vs {away_score:.0f})",
                category='hustle'
            ))

        # High vs low mismatch
        elif home_tier == 'high' and away_tier == 'low':
            adjustments.append(Adjustment(
                name='high_hustle_vs_low',
                value=self.HUSTLE_ADJUSTMENTS['high_hustle_vs_low'],
                confidence=Confidence.HIGH,
                description=f"Home high hustle ({home_score:.0f}) vs away low ({away_score:.0f})",
                category='hustle'
            ))

        elif away_tier == 'high' and home_tier == 'low':
            adjustments.append(Adjustment(
                name='high_hustle_vs_low',
                value=self.HUSTLE_ADJUSTMENTS['high_hustle_vs_low'],
                confidence=Confidence.HIGH,
                description=f"Away high hustle ({away_score:.0f}) vs home low ({home_score:.0f})",
                category='hustle'
            ))

        # Large gap in intensity (regardless of tier)
        elif abs(home_score - away_score) >= 15:
            adjustments.append(Adjustment(
                name='hustle_mismatch_large',
                value=self.HUSTLE_ADJUSTMENTS['hustle_mismatch_large'],
                confidence=Confidence.LOW,
                description=f"Large hustle gap ({abs(home_score - away_score):.0f} pts)",
                category='hustle'
            ))

        return adjustments

    # ==========================================================================
    # SHOOTING PROFILE METHODS
    # ==========================================================================
    def get_team_shooting_data(self, cur, team_id: int, season: str) -> Optional[Dict]:
        """Get team's shooting profile from team_shooting_averages"""
        cur.execute("""
            SELECT
                shot_profile,
                avg_three_freq,
                scoring_variance,
                avg_ra_freq,
                avg_paint_freq
            FROM team_shooting_averages
            WHERE team_id = %s AND season = %s
        """, (team_id, season))
        result = cur.fetchone()
        if result:
            return dict(result)
        return None

    def calculate_shooting_adjustments(self, home_shooting: Optional[Dict],
                                       away_shooting: Optional[Dict]) -> Tuple[List[Adjustment], float]:
        """Calculate adjustments based on shooting profile matchup"""
        adjustments = []
        variance_modifier = 1.0

        if not home_shooting or not away_shooting:
            return adjustments, variance_modifier

        home_profile = home_shooting.get('shot_profile', 'balanced')
        away_profile = away_shooting.get('shot_profile', 'balanced')
        home_variance = float(home_shooting.get('scoring_variance', 10.0) or 10.0)
        away_variance = float(away_shooting.get('scoring_variance', 10.0) or 10.0)

        # Both three-heavy = higher variance matchup
        if home_profile == 'three_heavy' and away_profile == 'three_heavy':
            adjustments.append(Adjustment(
                name='both_three_heavy',
                value=self.SHOOTING_ADJUSTMENTS['both_three_heavy'],
                confidence=Confidence.LOW,
                description="Both teams three-heavy → higher variance matchup",
                category='shooting'
            ))
            variance_modifier = 1.3

        # Paint-heavy vs implied weak interior
        if home_profile == 'paint_heavy' or away_profile == 'paint_heavy':
            paint_team = "Home" if home_profile == 'paint_heavy' else "Away"
            adjustments.append(Adjustment(
                name='paint_heavy_factor',
                value=0.5,  # Slight adjustment, depends on matchup
                confidence=Confidence.LOW,
                description=f"{paint_team} team is paint-heavy → depends on rim protection",
                category='shooting'
            ))

        # Calculate expected variance
        avg_variance = (home_variance + away_variance) / 2 * variance_modifier

        return adjustments, avg_variance

    # ==========================================================================
    # DEFENSE MATCHUP METHODS
    # ==========================================================================
    def get_team_defense_rating(self, cur, team_id: int, game_date: datetime, season: str) -> float:
        """Get team's defensive rating up to given date"""
        cur.execute("""
            SELECT AVG(defensive_rating) as avg_drtg
            FROM team_game_stats tgs
            JOIN games g ON tgs.game_id = g.game_id
            WHERE tgs.team_id = %s
            AND g.season = %s
            AND g.game_date < %s
            AND g.home_team_score IS NOT NULL
        """, (team_id, season, game_date))
        result = cur.fetchone()
        return float(result['avg_drtg']) if result and result['avg_drtg'] else 112.0

    def get_team_offensive_rating(self, cur, team_id: int, game_date: datetime, season: str) -> float:
        """Get team's offensive rating up to given date"""
        cur.execute("""
            SELECT AVG(offensive_rating) as avg_ortg
            FROM team_game_stats tgs
            JOIN games g ON tgs.game_id = g.game_id
            WHERE tgs.team_id = %s
            AND g.season = %s
            AND g.game_date < %s
            AND g.home_team_score IS NOT NULL
        """, (team_id, season, game_date))
        result = cur.fetchone()
        return float(result['avg_ortg']) if result and result['avg_ortg'] else 112.0

    def classify_defense_tier(self, def_rating: float) -> str:
        """Classify defense tier based on rating"""
        if def_rating <= self.DEF_RATING_ELITE:
            return 'elite'
        elif def_rating <= 112.0:
            return 'good'
        elif def_rating <= self.DEF_RATING_POOR:
            return 'average'
        else:
            return 'poor'

    def classify_offense_tier(self, off_rating: float) -> str:
        """Classify offense tier based on rating"""
        if off_rating >= 118.0:
            return 'elite'
        elif off_rating >= 114.0:
            return 'good'
        elif off_rating >= 110.0:
            return 'average'
        else:
            return 'poor'

    def calculate_defense_adjustments(self, home_drtg: float, away_drtg: float,
                                      home_ortg: float, away_ortg: float) -> List[Adjustment]:
        """Calculate adjustments based on defensive matchups"""
        adjustments = []

        home_def_tier = self.classify_defense_tier(home_drtg)
        away_def_tier = self.classify_defense_tier(away_drtg)
        home_off_tier = self.classify_offense_tier(home_ortg)
        away_off_tier = self.classify_offense_tier(away_ortg)

        # Both elite defense
        if home_def_tier == 'elite' and away_def_tier == 'elite':
            adjustments.append(Adjustment(
                name='both_elite_defense',
                value=self.DEFENSE_ADJUSTMENTS['both_elite_defense'],
                confidence=Confidence.HIGH,
                description=f"Both teams elite defense (DRtg: {home_drtg:.1f} vs {away_drtg:.1f})",
                category='defense'
            ))

        # Both poor defense
        elif home_def_tier == 'poor' and away_def_tier == 'poor':
            adjustments.append(Adjustment(
                name='both_poor_defense',
                value=self.DEFENSE_ADJUSTMENTS['both_poor_defense'],
                confidence=Confidence.HIGH,
                description=f"Both teams poor defense (DRtg: {home_drtg:.1f} vs {away_drtg:.1f})",
                category='defense'
            ))

        # Elite defense vs poor offense (UNDER signal)
        if home_def_tier == 'elite' and away_off_tier == 'poor':
            adjustments.append(Adjustment(
                name='elite_def_vs_poor_off',
                value=self.DEFENSE_ADJUSTMENTS['elite_def_vs_poor_off'],
                confidence=Confidence.HIGH,
                description=f"Home elite D ({home_drtg:.1f}) vs away poor O ({away_ortg:.1f})",
                category='defense'
            ))

        elif away_def_tier == 'elite' and home_off_tier == 'poor':
            adjustments.append(Adjustment(
                name='elite_def_vs_poor_off',
                value=self.DEFENSE_ADJUSTMENTS['elite_def_vs_poor_off'],
                confidence=Confidence.HIGH,
                description=f"Away elite D ({away_drtg:.1f}) vs home poor O ({home_ortg:.1f})",
                category='defense'
            ))

        # Poor defense vs elite offense (OVER signal)
        if home_def_tier == 'poor' and away_off_tier == 'elite':
            adjustments.append(Adjustment(
                name='poor_def_vs_elite_off',
                value=self.DEFENSE_ADJUSTMENTS['poor_def_vs_elite_off'],
                confidence=Confidence.HIGH,
                description=f"Home poor D ({home_drtg:.1f}) vs away elite O ({away_ortg:.1f})",
                category='defense'
            ))

        elif away_def_tier == 'poor' and home_off_tier == 'elite':
            adjustments.append(Adjustment(
                name='poor_def_vs_elite_off',
                value=self.DEFENSE_ADJUSTMENTS['poor_def_vs_elite_off'],
                confidence=Confidence.HIGH,
                description=f"Away poor D ({away_drtg:.1f}) vs home elite O ({home_ortg:.1f})",
                category='defense'
            ))

        return adjustments

    # ==========================================================================
    # ORIGINAL SITUATIONAL METHODS (from unified_totals_model.py)
    # ==========================================================================
    def calculate_days_rest(self, cur, team_id: int, game_date: datetime, season: str) -> Optional[int]:
        """Calculate days rest for a team before a game"""
        cur.execute("""
            SELECT game_date FROM games
            WHERE (home_team_id = %s OR away_team_id = %s)
            AND season = %s AND game_date < %s
            AND home_team_score IS NOT NULL
            ORDER BY game_date DESC LIMIT 1
        """, (team_id, team_id, season, game_date))
        result = cur.fetchone()
        if result:
            prev_date = result['game_date']
            if isinstance(prev_date, datetime):
                prev_date = prev_date.date()
            if isinstance(game_date, datetime):
                game_date = game_date.date()
            return (game_date - prev_date).days - 1
        return None

    def get_team_pace_tier(self, cur, team_id: int, before_date: datetime, season: str) -> int:
        """Calculate team's pace tier (1=fast, 2=medium, 3=slow)"""
        cur.execute("""
            SELECT AVG(home_team_score + away_team_score) as avg_total
            FROM games
            WHERE (home_team_id = %s OR away_team_id = %s)
            AND season = %s AND game_date < %s
            AND home_team_score IS NOT NULL
        """, (team_id, team_id, season, before_date))
        result = cur.fetchone()
        if not result or not result['avg_total']:
            return 2
        avg = float(result['avg_total'])
        if avg >= 235:
            return 1  # Fast
        elif avg <= 225:
            return 3  # Slow
        return 2  # Medium

    def get_team_season_ppg(self, cur, team_id: int, before_date: datetime, season: str) -> Optional[float]:
        """Get team's average points scored up to given date"""
        cur.execute("""
            SELECT AVG(CASE WHEN home_team_id = %s THEN home_team_score ELSE away_team_score END) as ppg
            FROM games
            WHERE (home_team_id = %s OR away_team_id = %s)
            AND season = %s AND game_date < %s
            AND home_team_score IS NOT NULL
        """, (team_id, team_id, team_id, season, before_date))
        result = cur.fetchone()
        return float(result['ppg']) if result and result['ppg'] else None

    def calculate_situational_adjustments(self, cur, home_team_id: int, away_team_id: int,
                                          game_date: datetime, season: str) -> Tuple[List[Adjustment], bool, bool]:
        """Calculate all situational adjustments (original model)"""
        adjustments = []

        # Back-to-back
        home_rest = self.calculate_days_rest(cur, home_team_id, game_date, season)
        away_rest = self.calculate_days_rest(cur, away_team_id, game_date, season)

        home_b2b = home_rest == 0 if home_rest is not None else False
        away_b2b = away_rest == 0 if away_rest is not None else False

        if home_b2b and away_b2b:
            adjustments.append(Adjustment(
                name='both_b2b',
                value=self.SITUATIONAL_ADJUSTMENTS['both_b2b'],
                confidence=Confidence.HIGH,
                description='Both teams on back-to-back',
                category='situational'
            ))
        elif away_b2b and not home_b2b:
            adjustments.append(Adjustment(
                name='away_b2b',
                value=self.SITUATIONAL_ADJUSTMENTS['away_b2b'],
                confidence=Confidence.HIGH,
                description='Away team on back-to-back, home rested',
                category='situational'
            ))

        # Pace tier matchup
        home_pace = self.get_team_pace_tier(cur, home_team_id, game_date, season)
        away_pace = self.get_team_pace_tier(cur, away_team_id, game_date, season)

        if home_pace == 1 and away_pace == 1:
            adjustments.append(Adjustment(
                name='both_fast',
                value=self.SITUATIONAL_ADJUSTMENTS['both_fast'],
                confidence=Confidence.HIGH,
                description='Both teams play fast pace',
                category='situational'
            ))
        elif home_pace == 3 and away_pace == 3:
            adjustments.append(Adjustment(
                name='both_slow',
                value=self.SITUATIONAL_ADJUSTMENTS['both_slow'],
                confidence=Confidence.HIGH,
                description='Both teams play slow pace',
                category='situational'
            ))

        # Early season
        year = int(season.split('-')[0])
        season_start = datetime(year, 10, 18).date()
        game_dt = game_date.date() if isinstance(game_date, datetime) else game_date
        if (game_dt - season_start).days <= 21:
            adjustments.append(Adjustment(
                name='early_season',
                value=self.SITUATIONAL_ADJUSTMENTS['early_season'],
                confidence=Confidence.MEDIUM,
                description='First 3 weeks of season',
                category='situational'
            ))

        return adjustments, home_b2b, away_b2b

    # ==========================================================================
    # MAIN ANALYSIS METHOD
    # ==========================================================================
    def analyze_game(self, game_id: str = None,
                     home_team_id: int = None,
                     away_team_id: int = None,
                     game_date: datetime = None,
                     closing_line: float = None,
                     season: str = None) -> EnhancedGameAnalysis:
        """
        Complete enhanced analysis incorporating all factors.
        """
        conn = self.get_db_connection()
        cur = conn.cursor()

        if not season:
            season = self.get_current_season()

        # Get game details if game_id provided
        if game_id:
            cur.execute("""
                SELECT g.*, ht.abbreviation as home_team, at.abbreviation as away_team
                FROM games g
                JOIN teams ht ON g.home_team_id = ht.team_id
                JOIN teams at ON g.away_team_id = at.team_id
                WHERE g.game_id = %s
            """, (game_id,))
            game = cur.fetchone()
            if game:
                home_team_id = game['home_team_id']
                away_team_id = game['away_team_id']
                game_date = game['game_date']
                home_abbr = game['home_team']
                away_abbr = game['away_team']
        else:
            cur.execute("SELECT abbreviation FROM teams WHERE team_id = %s", (home_team_id,))
            home_abbr = cur.fetchone()['abbreviation']
            cur.execute("SELECT abbreviation FROM teams WHERE team_id = %s", (away_team_id,))
            away_abbr = cur.fetchone()['abbreviation']

        # Base expected
        home_ppg = self.get_team_season_ppg(cur, home_team_id, game_date, season)
        away_ppg = self.get_team_season_ppg(cur, away_team_id, game_date, season)

        if not home_ppg or not away_ppg:
            cur.close()
            conn.close()
            return None

        base_expected = home_ppg + away_ppg

        # =======================================================================
        # CALCULATE ALL ADJUSTMENTS
        # =======================================================================

        # 1. Situational adjustments (original)
        situational_adj, home_b2b, away_b2b = self.calculate_situational_adjustments(
            cur, home_team_id, away_team_id, game_date, season
        )

        # 2. Hustle adjustments (NEW)
        home_hustle = self.get_team_hustle_data(cur, home_team_id, season)
        away_hustle = self.get_team_hustle_data(cur, away_team_id, season)
        hustle_adj = self.calculate_hustle_adjustments(home_hustle, away_hustle)

        # 3. Shooting adjustments (NEW)
        home_shooting = self.get_team_shooting_data(cur, home_team_id, season)
        away_shooting = self.get_team_shooting_data(cur, away_team_id, season)
        shooting_adj, expected_variance = self.calculate_shooting_adjustments(home_shooting, away_shooting)

        # 4. Defense adjustments (NEW)
        home_drtg = self.get_team_defense_rating(cur, home_team_id, game_date, season)
        away_drtg = self.get_team_defense_rating(cur, away_team_id, game_date, season)
        home_ortg = self.get_team_offensive_rating(cur, home_team_id, game_date, season)
        away_ortg = self.get_team_offensive_rating(cur, away_team_id, game_date, season)
        defense_adj = self.calculate_defense_adjustments(home_drtg, away_drtg, home_ortg, away_ortg)

        cur.close()
        conn.close()

        # =======================================================================
        # CALCULATE TOTALS
        # =======================================================================
        all_adjustments = situational_adj + hustle_adj + shooting_adj + defense_adj
        total_adjustment = sum(adj.value for adj in all_adjustments)
        enhanced_expected = base_expected + total_adjustment

        # Edge calculation
        edge = enhanced_expected - closing_line if closing_line else None

        # Variance tier
        variance_tier = 'normal'
        if expected_variance >= 13:
            variance_tier = 'high'
        elif expected_variance <= 8:
            variance_tier = 'low'

        # Determine signal
        signal, confidence, reasoning = self._determine_signal(
            all_adjustments, edge, total_adjustment, variance_tier
        )

        return EnhancedGameAnalysis(
            game_id=game_id or f"{away_abbr}@{home_abbr}",
            matchup=f"{away_abbr} @ {home_abbr}",
            game_date=game_date,
            home_team=home_abbr,
            away_team=away_abbr,
            home_team_id=home_team_id,
            away_team_id=away_team_id,
            home_ppg=home_ppg,
            away_ppg=away_ppg,
            base_expected=base_expected,
            situational_adjustments=situational_adj,
            hustle_adjustments=hustle_adj,
            shooting_adjustments=shooting_adj,
            defense_adjustments=defense_adj,
            total_adjustment=total_adjustment,
            enhanced_expected=enhanced_expected,
            home_hustle_score=home_hustle.get('hustle_intensity_score', 0) if home_hustle else 0,
            away_hustle_score=away_hustle.get('hustle_intensity_score', 0) if away_hustle else 0,
            home_shot_profile=home_shooting.get('shot_profile', 'balanced') if home_shooting else 'balanced',
            away_shot_profile=away_shooting.get('shot_profile', 'balanced') if away_shooting else 'balanced',
            home_def_tier=self.classify_defense_tier(home_drtg),
            away_def_tier=self.classify_defense_tier(away_drtg),
            expected_variance=expected_variance,
            variance_tier=variance_tier,
            closing_line=closing_line,
            edge=edge,
            home_b2b=home_b2b,
            away_b2b=away_b2b,
            signal=signal,
            confidence=confidence,
            reasoning=reasoning
        )

    def _determine_signal(self, adjustments: List[Adjustment], edge: Optional[float],
                          total_adj: float, variance_tier: str) -> Tuple[BetSignal, Confidence, str]:
        """Determine betting signal based on all factors"""

        # Count high-confidence adjustments
        high_conf_count = sum(1 for adj in adjustments if adj.confidence == Confidence.HIGH)
        adj_categories = set(adj.category for adj in adjustments)

        # Multi-factor signal boost
        multi_factor_bonus = len(adj_categories) >= 3

        # Edge-based signal
        if edge is not None:
            abs_edge = abs(edge)

            if abs_edge > self.EDGE_MAX_RELIABLE:
                return (BetSignal.NO_BET, Confidence.LOW,
                        f"Edge too large ({edge:+.1f} pts) - model unreliable at extremes")

            if self.EDGE_SWEET_SPOT[0] <= abs_edge <= self.EDGE_SWEET_SPOT[1]:
                direction = BetSignal.BET_OVER if edge > 0 else BetSignal.BET_UNDER
                conf = Confidence.HIGH if multi_factor_bonus else Confidence.MEDIUM
                return (direction, conf,
                        f"Edge in sweet spot ({edge:+.1f} pts) + {len(adj_categories)} factor categories")

            # Strong signal with multiple factors
            if abs_edge >= 3.0 and high_conf_count >= 2:
                if edge > 0:
                    return (BetSignal.STRONG_OVER, Confidence.HIGH,
                            f"Multi-factor OVER: {high_conf_count} high-conf adjustments, {edge:+.1f} edge")
                else:
                    return (BetSignal.STRONG_UNDER, Confidence.HIGH,
                            f"Multi-factor UNDER: {high_conf_count} high-conf adjustments, {edge:+.1f} edge")

            if abs_edge < self.EDGE_SWEET_SPOT[0]:
                return (BetSignal.NO_BET, Confidence.NONE,
                        f"Edge too small ({edge:+.1f} pts)")

        # No line - use adjustment direction
        if len(adjustments) == 0:
            return (BetSignal.NO_BET, Confidence.NONE, "No adjustments detected")

        if total_adj < -4:
            return (BetSignal.LEAN_UNDER, Confidence.MEDIUM,
                    f"Strong UNDER factors ({total_adj:+.1f} pts)")
        elif total_adj > 4:
            return (BetSignal.LEAN_OVER, Confidence.MEDIUM,
                    f"Strong OVER factors ({total_adj:+.1f} pts)")

        return (BetSignal.NO_BET, Confidence.NONE, "No strong directional signal")

    def print_analysis(self, analysis: EnhancedGameAnalysis):
        """Pretty print enhanced game analysis"""
        print("=" * 80)
        print(f"🏀 ENHANCED GAME ANALYSIS: {analysis.matchup}")
        print(f"   Date: {analysis.game_date}")
        print("=" * 80)

        print(f"\n📊 BASE CALCULATION:")
        print(f"   {analysis.home_team} PPG: {analysis.home_ppg:.1f}")
        print(f"   {analysis.away_team} PPG: {analysis.away_ppg:.1f}")
        print(f"   Base Expected: {analysis.base_expected:.1f}")

        # Situational adjustments
        print(f"\n🔧 SITUATIONAL ADJUSTMENTS ({len(analysis.situational_adjustments)}):")
        if analysis.situational_adjustments:
            for adj in analysis.situational_adjustments:
                print(f"   • {adj.name}: {adj.value:+.1f} pts - {adj.description}")
        else:
            print("   (None)")

        # Hustle adjustments
        print(f"\n💪 HUSTLE ADJUSTMENTS ({len(analysis.hustle_adjustments)}):")
        print(f"   {analysis.home_team} Hustle Score: {analysis.home_hustle_score:.1f}")
        print(f"   {analysis.away_team} Hustle Score: {analysis.away_hustle_score:.1f}")
        if analysis.hustle_adjustments:
            for adj in analysis.hustle_adjustments:
                print(f"   • {adj.name}: {adj.value:+.1f} pts - {adj.description}")
        else:
            print("   (No hustle-based adjustments)")

        # Shooting adjustments
        print(f"\n🎯 SHOOTING PROFILE ADJUSTMENTS ({len(analysis.shooting_adjustments)}):")
        print(f"   {analysis.home_team} Profile: {analysis.home_shot_profile}")
        print(f"   {analysis.away_team} Profile: {analysis.away_shot_profile}")
        print(f"   Expected Variance: {analysis.expected_variance:.1f} ({analysis.variance_tier})")
        if analysis.shooting_adjustments:
            for adj in analysis.shooting_adjustments:
                print(f"   • {adj.name}: {adj.value:+.1f} pts - {adj.description}")
        else:
            print("   (No shooting-based adjustments)")

        # Defense adjustments
        print(f"\n🛡️ DEFENSE MATCHUP ADJUSTMENTS ({len(analysis.defense_adjustments)}):")
        print(f"   {analysis.home_team} Defense: {analysis.home_def_tier}")
        print(f"   {analysis.away_team} Defense: {analysis.away_def_tier}")
        if analysis.defense_adjustments:
            for adj in analysis.defense_adjustments:
                print(f"   • {adj.name}: {adj.value:+.1f} pts - {adj.description}")
        else:
            print("   (No defense-based adjustments)")

        # Final projection
        print(f"\n📈 ENHANCED PROJECTION:")
        print(f"   Total Adjustment: {analysis.total_adjustment:+.1f} pts")
        print(f"   Enhanced Expected: {analysis.enhanced_expected:.1f}")

        if analysis.closing_line:
            print(f"\n💰 VS LINE:")
            print(f"   Line: {analysis.closing_line:.1f}")
            print(f"   Edge: {analysis.edge:+.1f} pts")

        # Recommendation
        print(f"\n🎯 RECOMMENDATION:")
        signal_emoji = {
            "NO_BET": "⛔", "LEAN_OVER": "↗️", "LEAN_UNDER": "↘️",
            "BET_OVER": "✅ OVER", "BET_UNDER": "✅ UNDER",
            "STRONG_OVER": "🔥 STRONG OVER", "STRONG_UNDER": "🔥 STRONG UNDER"
        }.get(analysis.signal.value, "❓")
        print(f"   Signal: {signal_emoji}")
        print(f"   Confidence: {analysis.confidence.value}")
        print(f"   Reasoning: {analysis.reasoning}")

        print("\n" + "=" * 80)


def main():
    """Demo the enhanced model"""
    model = EnhancedTotalsModel()

    print("\n" + "=" * 80)
    print("ENHANCED NBA TOTALS MODEL v2.0 - DEMONSTRATION")
    print("=" * 80)

    season = model.get_current_season()
    print(f"\nCurrent Season: {season}")

    conn = model.get_db_connection()
    cur = conn.cursor()

    # Get today's games
    cur.execute("""
        SELECT g.game_id, g.game_date,
               ht.abbreviation as home, at.abbreviation as away
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE g.season = %s
        AND g.game_date = CURRENT_DATE
        ORDER BY g.game_id
    """, (season,))

    todays_games = cur.fetchall()
    cur.close()
    conn.close()

    if not todays_games:
        print("\nNo games scheduled for today. Showing recent games instead...")
        conn = model.get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT g.game_id, g.game_date,
                   ht.abbreviation as home, at.abbreviation as away
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE g.season = %s
            AND g.home_team_score IS NOT NULL
            ORDER BY g.game_date DESC
            LIMIT 3
        """, (season,))
        todays_games = cur.fetchall()
        cur.close()
        conn.close()

    print(f"\nAnalyzing {len(todays_games)} games...\n")

    for game in todays_games:
        analysis = model.analyze_game(game_id=game['game_id'])
        if analysis:
            model.print_analysis(analysis)
        print()


if __name__ == '__main__':
    main()
