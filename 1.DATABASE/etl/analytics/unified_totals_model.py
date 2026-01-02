#!/usr/bin/env python3
"""
Unified NBA Totals Prediction Model

Incorporates ALL validated factors from comprehensive research:
1. Back-to-back adjustments (away B2B: -2.7, both B2B: -3.4)
2. Pace tier matchups (+/-3.0 for same-pace matchups)
3. Season timing (early season: -2.0, February: +1.5)
4. Scoring extremes (crash continuation: -4.0)
5. Location transition effects

Outputs:
- Expected total
- Edge vs closing line
- Confidence level
- Bet recommendation

Based on 11 seasons of data (11,452+ games) and 2022-23 backtest validation.
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from dataclasses import dataclass
from typing import Optional, List, Dict
from enum import Enum


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
    STRONG_UNDER = "STRONG_UNDER"  # Golden spot


@dataclass
class Adjustment:
    """Individual adjustment with metadata"""
    name: str
    value: float
    confidence: Confidence
    description: str


@dataclass
class GameAnalysis:
    """Complete analysis for a single game"""
    game_id: str
    matchup: str
    game_date: datetime

    # Base calculation
    home_team: str
    away_team: str
    home_ppg: float
    away_ppg: float
    base_expected: float

    # Adjustments
    adjustments: List[Adjustment]
    total_adjustment: float
    enhanced_expected: float

    # Comparison to line
    closing_line: Optional[float]
    edge: Optional[float]

    # Factors detected
    home_b2b: bool
    away_b2b: bool
    home_pace_tier: int  # 1=fast, 2=medium, 3=slow
    away_pace_tier: int
    is_early_season: bool
    after_season_high: bool
    after_season_low: bool
    after_low_crash: bool

    # Recommendation
    signal: BetSignal
    confidence: Confidence
    reasoning: str


class UnifiedTotalsModel:
    """
    The unified model incorporating all validated factors.
    """

    # Validated adjustments from research
    ADJUSTMENTS = {
        'away_b2b': -2.7,
        'both_b2b': -3.4,
        'home_b2b': 0.0,  # REMOVED - was losing signal
        'both_fast': 3.0,
        'both_slow': -3.0,
        'early_season': -2.0,
        'february': 1.5,
        'after_high_to_away': -1.5,
        'after_low_crash': -4.0,
        'after_low_persist': -1.5,
        'after_high_momentum': 1.5,
    }

    # Edge thresholds from backtest
    EDGE_SWEET_SPOT_MIN = 4.0
    EDGE_SWEET_SPOT_MAX = 6.0
    EDGE_MAX_RELIABLE = 6.0

    # Pace thresholds
    FAST_PACE_THRESHOLD = 235
    SLOW_PACE_THRESHOLD = 225

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
        return result['season_id'] if result else '2024-25'

    def calculate_days_rest(self, cur, team_id: int, game_date: datetime, season: str) -> Optional[int]:
        """Calculate days rest for a team before a game"""
        cur.execute("""
            SELECT game_date
            FROM games
            WHERE (home_team_id = %s OR away_team_id = %s)
            AND season = %s
            AND game_date < %s
            AND home_team_score IS NOT NULL
            ORDER BY game_date DESC
            LIMIT 1
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
        """
        Calculate team's pace tier (1=fast, 2=medium, 3=slow)
        """
        cur.execute("""
            SELECT
                AVG(CASE WHEN home_team_id = %s THEN home_team_score + away_team_score
                         ELSE home_team_score + away_team_score END) as avg_total
            FROM games
            WHERE (home_team_id = %s OR away_team_id = %s)
            AND season = %s
            AND game_date < %s
            AND home_team_score IS NOT NULL
        """, (team_id, team_id, team_id, season, before_date))
        result = cur.fetchone()
        if not result or not result['avg_total']:
            return 2  # Default to medium

        avg = float(result['avg_total'])
        if avg >= self.FAST_PACE_THRESHOLD:
            return 1  # Fast
        elif avg <= self.SLOW_PACE_THRESHOLD:
            return 3  # Slow
        return 2  # Medium

    def get_team_season_ppg(self, cur, team_id: int, before_date: datetime, season: str) -> Optional[float]:
        """Get team's average points scored up to given date"""
        cur.execute("""
            SELECT
                AVG(CASE WHEN home_team_id = %s THEN home_team_score ELSE away_team_score END) as ppg
            FROM games
            WHERE (home_team_id = %s OR away_team_id = %s)
            AND season = %s
            AND game_date < %s
            AND home_team_score IS NOT NULL
        """, (team_id, team_id, team_id, season, before_date))
        result = cur.fetchone()
        return float(result['ppg']) if result and result['ppg'] else None

    def get_team_season_extremes(self, cur, team_id: int, before_date: datetime, season: str) -> Dict:
        """Get team's season high and low scores before given date"""
        cur.execute("""
            SELECT
                MAX(CASE WHEN home_team_id = %s THEN home_team_score ELSE away_team_score END) as season_high,
                MIN(CASE WHEN home_team_id = %s THEN home_team_score ELSE away_team_score END) as season_low
            FROM games
            WHERE (home_team_id = %s OR away_team_id = %s)
            AND season = %s
            AND game_date < %s
            AND home_team_score IS NOT NULL
        """, (team_id, team_id, team_id, team_id, season, before_date))
        result = cur.fetchone()
        return {
            'high': result['season_high'] if result else None,
            'low': result['season_low'] if result else None
        }

    def get_last_game_score(self, cur, team_id: int, before_date: datetime, season: str) -> Optional[Dict]:
        """Get team's most recent game score"""
        cur.execute("""
            SELECT
                game_date,
                CASE WHEN home_team_id = %s THEN home_team_score ELSE away_team_score END as points,
                CASE WHEN home_team_id = %s THEN 'home' ELSE 'away' END as location
            FROM games
            WHERE (home_team_id = %s OR away_team_id = %s)
            AND season = %s
            AND game_date < %s
            AND home_team_score IS NOT NULL
            ORDER BY game_date DESC
            LIMIT 1
        """, (team_id, team_id, team_id, team_id, season, before_date))
        result = cur.fetchone()
        if result:
            return {
                'date': result['game_date'],
                'points': result['points'],
                'location': result['location']
            }
        return None

    def is_early_season(self, game_date: datetime, season: str) -> bool:
        """Check if game is in first 3 weeks of season"""
        # Approximate season start dates
        year = int(season.split('-')[0])
        season_start = datetime(year, 10, 18).date()
        if isinstance(game_date, datetime):
            game_date = game_date.date()
        return (game_date - season_start).days <= 21

    def is_february(self, game_date: datetime) -> bool:
        """Check if game is in February (pre-ASB high scoring period)"""
        if isinstance(game_date, datetime):
            return game_date.month == 2
        return False

    def analyze_game(self, game_id: str = None,
                     home_team_id: int = None,
                     away_team_id: int = None,
                     game_date: datetime = None,
                     closing_line: float = None,
                     season: str = None) -> GameAnalysis:
        """
        Complete analysis for a single game.
        Can be called with game_id (lookup) or with team IDs and date (prediction).
        """
        conn = self.get_db_connection()
        cur = conn.cursor()

        if not season:
            season = self.get_current_season()

        # If game_id provided, lookup game details
        if game_id:
            cur.execute("""
                SELECT g.*,
                       ht.abbreviation as home_team,
                       at.abbreviation as away_team
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
            # Get team abbreviations
            cur.execute("SELECT abbreviation FROM teams WHERE team_id = %s", (home_team_id,))
            home_abbr = cur.fetchone()['abbreviation']
            cur.execute("SELECT abbreviation FROM teams WHERE team_id = %s", (away_team_id,))
            away_abbr = cur.fetchone()['abbreviation']

        # Calculate base expected
        home_ppg = self.get_team_season_ppg(cur, home_team_id, game_date, season)
        away_ppg = self.get_team_season_ppg(cur, away_team_id, game_date, season)

        if not home_ppg or not away_ppg:
            cur.close()
            conn.close()
            return None

        base_expected = home_ppg + away_ppg
        adjustments = []

        # Factor 1: Back-to-back
        home_rest = self.calculate_days_rest(cur, home_team_id, game_date, season)
        away_rest = self.calculate_days_rest(cur, away_team_id, game_date, season)

        home_b2b = home_rest == 0 if home_rest is not None else False
        away_b2b = away_rest == 0 if away_rest is not None else False

        if home_b2b and away_b2b:
            adjustments.append(Adjustment(
                name='both_b2b',
                value=self.ADJUSTMENTS['both_b2b'],
                confidence=Confidence.HIGH,
                description='Both teams on back-to-back'
            ))
        elif away_b2b and not home_b2b:
            adjustments.append(Adjustment(
                name='away_b2b',
                value=self.ADJUSTMENTS['away_b2b'],
                confidence=Confidence.HIGH,
                description='Away team on back-to-back, home rested'
            ))
        # Note: home_b2b alone is NOT applied (losing signal)

        # Factor 2: Pace tier matchup
        home_pace = self.get_team_pace_tier(cur, home_team_id, game_date, season)
        away_pace = self.get_team_pace_tier(cur, away_team_id, game_date, season)

        if home_pace == 1 and away_pace == 1:
            adjustments.append(Adjustment(
                name='both_fast',
                value=self.ADJUSTMENTS['both_fast'],
                confidence=Confidence.HIGH,
                description='Both teams play fast pace'
            ))
        elif home_pace == 3 and away_pace == 3:
            adjustments.append(Adjustment(
                name='both_slow',
                value=self.ADJUSTMENTS['both_slow'],
                confidence=Confidence.HIGH,
                description='Both teams play slow pace'
            ))

        # Factor 3: Season timing
        early_season = self.is_early_season(game_date, season)
        if early_season:
            adjustments.append(Adjustment(
                name='early_season',
                value=self.ADJUSTMENTS['early_season'],
                confidence=Confidence.MEDIUM,
                description='First 3 weeks of season (teams still gelling)'
            ))
        elif self.is_february(game_date):
            adjustments.append(Adjustment(
                name='february',
                value=self.ADJUSTMENTS['february'],
                confidence=Confidence.LOW,
                description='February (pre-ASB, historically higher scoring)'
            ))

        # Factor 4: Scoring extremes
        home_extremes = self.get_team_season_extremes(cur, home_team_id, game_date, season)
        away_extremes = self.get_team_season_extremes(cur, away_team_id, game_date, season)
        home_last = self.get_last_game_score(cur, home_team_id, game_date, season)
        away_last = self.get_last_game_score(cur, away_team_id, game_date, season)

        after_season_high = False
        after_season_low = False
        after_low_crash = False

        # Check home team extremes
        if home_last and home_extremes['high']:
            if home_last['points'] >= home_extremes['high']:
                after_season_high = True
                # Location transition: high at home, playing at home = momentum
                # But we're the home team, so just momentum
                adjustments.append(Adjustment(
                    name='home_after_high',
                    value=self.ADJUSTMENTS['after_high_momentum'],
                    confidence=Confidence.MEDIUM,
                    description=f"Home team ({home_abbr}) coming off season high"
                ))

            if home_last['points'] <= home_extremes['low']:
                after_season_low = True
                margin_under = home_extremes['low'] - home_last['points']
                if margin_under >= 10:
                    after_low_crash = True
                    adjustments.append(Adjustment(
                        name='home_low_crash',
                        value=self.ADJUSTMENTS['after_low_crash'],
                        confidence=Confidence.HIGH,
                        description=f"Home team ({home_abbr}) crashed {margin_under} below season low"
                    ))
                else:
                    adjustments.append(Adjustment(
                        name='home_low_persist',
                        value=self.ADJUSTMENTS['after_low_persist'],
                        confidence=Confidence.MEDIUM,
                        description=f"Home team ({home_abbr}) coming off season low"
                    ))

        # Check away team extremes
        if away_last and away_extremes['high']:
            if away_last['points'] >= away_extremes['high']:
                after_season_high = True
                # High at previous location, now on road = potential regression
                adjustments.append(Adjustment(
                    name='away_after_high_to_road',
                    value=self.ADJUSTMENTS['after_high_to_away'],
                    confidence=Confidence.MEDIUM,
                    description=f"Away team ({away_abbr}) coming off season high, now on road"
                ))

            if away_last['points'] <= away_extremes['low']:
                after_season_low = True
                margin_under = away_extremes['low'] - away_last['points']
                if margin_under >= 10:
                    after_low_crash = True
                    adjustments.append(Adjustment(
                        name='away_low_crash',
                        value=self.ADJUSTMENTS['after_low_crash'],
                        confidence=Confidence.HIGH,
                        description=f"Away team ({away_abbr}) crashed {margin_under} below season low"
                    ))
                else:
                    adjustments.append(Adjustment(
                        name='away_low_persist',
                        value=self.ADJUSTMENTS['after_low_persist'],
                        confidence=Confidence.MEDIUM,
                        description=f"Away team ({away_abbr}) coming off season low"
                    ))

        cur.close()
        conn.close()

        # Calculate totals
        total_adjustment = sum(adj.value for adj in adjustments)
        enhanced_expected = base_expected + total_adjustment

        # Calculate edge if line provided
        edge = enhanced_expected - closing_line if closing_line else None

        # Determine signal and confidence
        signal, confidence, reasoning = self._determine_signal(
            adjustments, edge, away_b2b, home_pace, away_pace
        )

        return GameAnalysis(
            game_id=game_id or f"{away_abbr}@{home_abbr}",
            matchup=f"{away_abbr} @ {home_abbr}",
            game_date=game_date,
            home_team=home_abbr,
            away_team=away_abbr,
            home_ppg=home_ppg,
            away_ppg=away_ppg,
            base_expected=base_expected,
            adjustments=adjustments,
            total_adjustment=total_adjustment,
            enhanced_expected=enhanced_expected,
            closing_line=closing_line,
            edge=edge,
            home_b2b=home_b2b,
            away_b2b=away_b2b,
            home_pace_tier=home_pace,
            away_pace_tier=away_pace,
            is_early_season=early_season,
            after_season_high=after_season_high,
            after_season_low=after_season_low,
            after_low_crash=after_low_crash,
            signal=signal,
            confidence=confidence,
            reasoning=reasoning
        )

    def _determine_signal(self, adjustments: List[Adjustment], edge: Optional[float],
                          away_b2b: bool, home_pace: int, away_pace: int) -> tuple:
        """
        Determine betting signal based on adjustments and edge.
        """
        adjustment_names = [adj.name for adj in adjustments]

        # GOLDEN SPOT: away_b2b + both_slow
        if away_b2b and home_pace == 3 and away_pace == 3:
            return (
                BetSignal.STRONG_UNDER,
                Confidence.HIGH,
                "GOLDEN SPOT: Away B2B + Both Slow Pace = +2.8% ROI historically"
            )

        # Check edge if available
        if edge is not None:
            abs_edge = abs(edge)

            # Edge too large = model unreliable
            if abs_edge > self.EDGE_MAX_RELIABLE:
                return (
                    BetSignal.NO_BET,
                    Confidence.LOW,
                    f"Edge too large ({edge:+.1f} pts) - model unreliable at extremes"
                )

            # Edge in sweet spot
            if self.EDGE_SWEET_SPOT_MIN <= abs_edge <= self.EDGE_SWEET_SPOT_MAX:
                if edge > 0:
                    return (
                        BetSignal.BET_OVER,
                        Confidence.MEDIUM,
                        f"Edge in sweet spot ({edge:+.1f} pts) - historically profitable range"
                    )
                else:
                    return (
                        BetSignal.BET_UNDER,
                        Confidence.MEDIUM,
                        f"Edge in sweet spot ({edge:+.1f} pts) - historically profitable range"
                    )

            # Edge too small
            if abs_edge < self.EDGE_SWEET_SPOT_MIN:
                direction = "OVER" if edge > 0 else "UNDER"
                return (
                    BetSignal.NO_BET,
                    Confidence.NONE,
                    f"Edge too small ({edge:+.1f} pts) - insufficient to overcome vig"
                )

        # No line comparison - use adjustment direction
        if len(adjustments) == 0:
            return (
                BetSignal.NO_BET,
                Confidence.NONE,
                "No situational adjustments detected"
            )

        total_adj = sum(adj.value for adj in adjustments)
        if total_adj < -3:
            return (
                BetSignal.LEAN_UNDER,
                Confidence.LOW,
                f"Multiple UNDER factors ({total_adj:+.1f} pts total adjustment)"
            )
        elif total_adj > 3:
            return (
                BetSignal.LEAN_OVER,
                Confidence.LOW,
                f"Multiple OVER factors ({total_adj:+.1f} pts total adjustment)"
            )

        return (
            BetSignal.NO_BET,
            Confidence.NONE,
            "No strong directional signal"
        )

    def print_analysis(self, analysis: GameAnalysis):
        """Pretty print game analysis"""
        print("=" * 70)
        print(f"GAME ANALYSIS: {analysis.matchup}")
        print(f"Date: {analysis.game_date}")
        print("=" * 70)

        print(f"\n📊 BASE CALCULATION:")
        print(f"   {analysis.home_team} PPG: {analysis.home_ppg:.1f}")
        print(f"   {analysis.away_team} PPG: {analysis.away_ppg:.1f}")
        print(f"   Base Expected: {analysis.base_expected:.1f}")

        print(f"\n🔧 SITUATIONAL ADJUSTMENTS:")
        if analysis.adjustments:
            for adj in analysis.adjustments:
                conf_emoji = {"HIGH": "🟢", "MEDIUM": "🟡", "LOW": "🟠", "NONE": "⚪"}.get(adj.confidence.value, "⚪")
                print(f"   {conf_emoji} {adj.name}: {adj.value:+.1f} pts")
                print(f"      └─ {adj.description}")
        else:
            print("   (No adjustments detected)")

        print(f"\n📈 ENHANCED PREDICTION:")
        print(f"   Total Adjustment: {analysis.total_adjustment:+.1f} pts")
        print(f"   Enhanced Expected: {analysis.enhanced_expected:.1f}")

        if analysis.closing_line:
            print(f"\n💰 VS CLOSING LINE:")
            print(f"   Closing Line: {analysis.closing_line:.1f}")
            print(f"   Edge: {analysis.edge:+.1f} pts")

        print(f"\n🎯 RECOMMENDATION:")
        signal_emoji = {
            "NO_BET": "⛔", "LEAN_OVER": "↗️", "LEAN_UNDER": "↘️",
            "BET_OVER": "✅ OVER", "BET_UNDER": "✅ UNDER", "STRONG_UNDER": "🔥 STRONG UNDER"
        }.get(analysis.signal.value, "❓")
        print(f"   Signal: {signal_emoji}")
        print(f"   Confidence: {analysis.confidence.value}")
        print(f"   Reasoning: {analysis.reasoning}")

        print("\n" + "=" * 70)


def main():
    """Example usage"""
    model = UnifiedTotalsModel()

    print("\n" + "=" * 70)
    print("UNIFIED NBA TOTALS MODEL - DEMONSTRATION")
    print("=" * 70)

    # Analyze upcoming games or recent games
    conn = model.get_db_connection()
    cur = conn.cursor()

    season = model.get_current_season()
    print(f"\nCurrent Season: {season}")

    # Get recent games
    cur.execute("""
        SELECT g.game_id, g.game_date,
               ht.abbreviation as home, at.abbreviation as away,
               g.home_team_score + g.away_team_score as actual_total
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE g.season = %s
        AND g.home_team_score IS NOT NULL
        ORDER BY g.game_date DESC
        LIMIT 5
    """, (season,))

    recent_games = cur.fetchall()
    cur.close()
    conn.close()

    print(f"\nAnalyzing {len(recent_games)} recent games...\n")

    for game in recent_games:
        analysis = model.analyze_game(game_id=game['game_id'])
        if analysis:
            model.print_analysis(analysis)
            if game['actual_total']:
                print(f"   ACTUAL RESULT: {game['actual_total']} pts")
                diff = game['actual_total'] - analysis.enhanced_expected
                print(f"   Model Error: {diff:+.1f} pts")
            print()


if __name__ == '__main__':
    main()
