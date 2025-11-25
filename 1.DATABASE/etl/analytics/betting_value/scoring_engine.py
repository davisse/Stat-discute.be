#!/usr/bin/env python3
"""
Betting Value Scoring Engine - Pure Business Logic

Pure functions with no side effects - 100% testable
Implements multi-factor scoring algorithm for betting value identification
"""

from dataclasses import dataclass
from enum import Enum
from typing import List, Tuple, Optional


class ValueTier(Enum):
    """Value classification tiers"""
    EXCEPTIONAL = "Exceptional"  # 90-100
    STRONG = "Strong"            # 75-89
    GOOD = "Good"                # 60-74
    SLIGHT = "Slight"            # 45-59
    NONE = "None"                # 0-44


class BetType(Enum):
    """Recommended bet types"""
    SPREAD = "spread"
    TOTAL_OVER = "total_over"
    TOTAL_UNDER = "total_under"
    MONEYLINE = "moneyline"
    PLAYER_PROP = "player_prop"


@dataclass
class ScoreBreakdown:
    """Detailed score breakdown for transparency"""
    positional_matchup: float  # 0-25
    betting_trends: float      # 0-20
    advanced_stats: float      # 0-20
    recent_form: float         # 0-15
    rest_schedule: float       # 0-10
    line_value: float          # 0-10
    total: float               # 0-100

    def to_dict(self):
        return {
            'positional_matchup': self.positional_matchup,
            'betting_trends': self.betting_trends,
            'advanced_stats': self.advanced_stats,
            'recent_form': self.recent_form,
            'rest_schedule': self.rest_schedule,
            'line_value': self.line_value,
            'total': self.total
        }


@dataclass
class ValueRecommendation:
    """Betting recommendation with rationale"""
    game_id: str
    recommended_bet: BetType
    recommended_side: str
    value_tier: ValueTier
    total_score: float
    score_breakdown: ScoreBreakdown
    confidence: str
    rationale: List[str]


class ScoringEngine:
    """
    Pure scoring logic - no database access, no side effects
    All methods are static for maximum testability
    """

    @staticmethod
    def score_positional_matchups(matchups: List[dict]) -> Tuple[float, List[str]]:
        """
        Score positional matchup advantage (0-25 points)

        Args:
            matchups: List of dicts with keys:
                - player_name: str
                - position: str
                - season_avg_points: float
                - opponent_rank_vs_position: int (1-30)
                - opponent_ppg_allowed: float
                - league_avg_ppg_allowed: float

        Returns:
            (score, rationale_list)
        """
        score = 0.0
        rationale = []

        for matchup in matchups[:5]:  # Top 5 players
            rank = matchup['opponent_rank_vs_position']
            player_name = matchup['player_name']
            position = matchup['position']
            opponent_allowed = matchup['opponent_ppg_allowed']
            league_avg = matchup['league_avg_ppg_allowed']

            # Rank-based scoring
            if rank >= 26:  # Bottom 5 defenses
                points = 5.0
                rationale.append(
                    f"{player_name} ({position}) vs #{rank} defense "
                    f"(allows {opponent_allowed:.1f} PPG, league avg {league_avg:.1f})"
                )
            elif rank >= 21:  # 21-25
                points = 3.0
                if rank >= 23:
                    rationale.append(
                        f"{player_name} favorable vs #{rank} defense"
                    )
            elif rank <= 5:  # Top 5 defenses
                points = -5.0
                rationale.append(
                    f"⚠️ {player_name} faces elite #{rank} defense"
                )
            elif rank <= 10:  # 6-10
                points = -3.0
            else:
                points = 0.0

            score += points

        # Normalize to 0-25
        score = max(0, min(25, score + 12.5))

        return score, rationale

    @staticmethod
    def score_betting_trends(
        home_ats_pct: float,
        away_ats_pct: float
    ) -> Tuple[float, List[str]]:
        """
        Score based on ATS performance (0-20 points)

        Args:
            home_ats_pct: Home team ATS cover % (0-1)
            away_ats_pct: Away team ATS cover % (0-1)

        Returns:
            (score, rationale_list)
        """
        score = 0.0
        rationale = []

        # Home team ATS
        if home_ats_pct >= 0.60:
            score += 10.0
            rationale.append(f"Home team covering {home_ats_pct:.0%} recently")
        elif home_ats_pct >= 0.55:
            score += 5.0
        elif home_ats_pct <= 0.40:
            score -= 10.0
            rationale.append(f"⚠️ Home team only covering {home_ats_pct:.0%}")
        elif home_ats_pct <= 0.45:
            score -= 5.0

        # Away team ATS (inverse scoring for spreads)
        if away_ats_pct <= 0.40:
            score += 10.0
        elif away_ats_pct <= 0.45:
            score += 5.0
        elif away_ats_pct >= 0.60:
            score -= 10.0
            rationale.append(f"Away team covering {away_ats_pct:.0%}")
        elif away_ats_pct >= 0.55:
            score -= 5.0

        # Normalize to 0-20
        score = max(0, min(20, score + 10))

        return score, rationale

    @staticmethod
    def score_advanced_stats(
        home_pace: float,
        away_pace: float,
        home_efg: float,
        away_efg: float,
        home_tov_pct: float,
        away_tov_pct: float
    ) -> Tuple[float, List[str]]:
        """
        Score based on advanced stats (0-20 points)

        Args:
            *_pace: Possessions per 48 minutes
            *_efg: Effective FG%
            *_tov_pct: Turnover %

        Returns:
            (score, rationale_list)
        """
        score = 0.0
        rationale = []

        # Pace differential (for totals)
        pace_diff = abs(home_pace - away_pace)
        if pace_diff > 5.0:
            score += 8.0
            faster = "Home" if home_pace > away_pace else "Away"
            rationale.append(
                f"Significant pace differential ({pace_diff:.1f}), {faster} plays faster"
            )
        elif pace_diff > 3.0:
            score += 4.0

        # Shooting efficiency edge
        efg_diff = home_efg - away_efg
        if abs(efg_diff) > 0.05:
            score += 6.0
            better = "Home" if efg_diff > 0 else "Away"
            rationale.append(f"{better} team +{abs(efg_diff):.1%} eFG% advantage")

        # Turnover advantage
        tov_diff = away_tov_pct - home_tov_pct  # Lower is better
        if abs(tov_diff) > 0.03:
            score += 6.0
            better = "Home" if tov_diff > 0 else "Away"
            rationale.append(f"{better} team protects ball better")

        # Normalize to 0-20
        score = max(0, min(20, score))

        return score, rationale

    @staticmethod
    def score_recent_form(
        home_form: dict,
        away_form: dict
    ) -> Tuple[float, List[str]]:
        """
        Score based on recent momentum with point differential analysis (0-15 points)

        Args:
            home_form: Dict with keys: wins, losses, avg_point_diff, blowout_wins,
                      close_wins, blowout_losses, close_losses, momentum_trend
            away_form: Same structure as home_form

        Returns:
            (score, rationale_list)
        """
        score = 0.0
        rationale = []

        # Extract values (handle both dict and int for backward compatibility)
        if isinstance(home_form, dict):
            home_wins = home_form['wins']
            home_losses = home_form['losses']
            home_point_diff = home_form['avg_point_diff']
            home_blowout_wins = home_form['blowout_wins']
            home_close_losses = home_form['close_losses']
            home_momentum = home_form['momentum_trend']
        else:
            # Backward compatibility: int input
            home_wins = home_form
            home_losses = 5 - home_wins
            home_point_diff = 0.0
            home_blowout_wins = 0
            home_close_losses = 0
            home_momentum = 'neutral'

        if isinstance(away_form, dict):
            away_wins = away_form['wins']
            away_losses = away_form['losses']
            away_point_diff = away_form['avg_point_diff']
            away_blowout_wins = away_form['blowout_wins']
            away_close_losses = away_form['close_losses']
            away_momentum = away_form['momentum_trend']
        else:
            # Backward compatibility: int input
            away_wins = away_form
            away_losses = 5 - away_wins
            away_point_diff = 0.0
            away_blowout_wins = 0
            away_close_losses = 0
            away_momentum = 'neutral'

        # Home team form scoring (base: W-L record)
        if home_wins >= 4:
            score += 6.0
            rationale.append(f"Home team hot: {home_wins}-{home_losses} last 5")
        elif home_wins == 3:
            score += 3.0
        elif home_wins <= 1:
            score -= 6.0
            rationale.append(f"⚠️ Home struggling: {home_wins}-{home_losses} last 5")
        elif home_wins == 2:
            score -= 3.0

        # Point differential bonus for home team
        if home_point_diff > 10:
            score += 2.0
            rationale.append(f"Home dominating by avg +{home_point_diff:.1f} pts")
        elif home_point_diff > 5:
            score += 1.0
        elif home_point_diff < -10:
            score -= 2.0
        elif home_point_diff < -5:
            score -= 1.0

        # Quality of wins/losses for home team
        if home_blowout_wins >= 2:
            score += 1.0
            rationale.append(f"Home has {home_blowout_wins} blowout wins")
        if home_close_losses >= 2:
            score += 0.5  # Close losses show competitiveness

        # Momentum trend for home team
        if home_momentum == 'improving':
            score += 1.0
            rationale.append("Home team momentum improving")
        elif home_momentum == 'declining':
            score -= 1.0
            rationale.append("⚠️ Home team momentum declining")

        # Away team form scoring (inverse impact)
        if away_wins <= 1:
            score += 6.0
            rationale.append(f"Away team cold: {away_wins}-{away_losses}")
        elif away_wins >= 4:
            score -= 6.0

        # Point differential impact for away team (inverse)
        if away_point_diff < -10:
            score += 2.0
        elif away_point_diff < -5:
            score += 1.0
        elif away_point_diff > 10:
            score -= 2.0
        elif away_point_diff > 5:
            score -= 1.0

        # Away team momentum (inverse)
        if away_momentum == 'declining':
            score += 1.0
        elif away_momentum == 'improving':
            score -= 1.0

        # Normalize to 0-15
        score = max(0, min(15, score + 7.5))

        return score, rationale

    @staticmethod
    def score_rest_schedule(
        home_days_rest: int,
        away_days_rest: int,
        away_is_back_to_back: bool,
        away_travel_distance_miles: float = 0.0
    ) -> Tuple[float, List[str]]:
        """
        Score rest and travel advantage (0-10 points)

        Travel Categories:
        - Local: <500 miles (no penalty)
        - Regional: 500-1500 miles (-1 pt on back-to-back)
        - Cross-country: >1500 miles (-2 pts on back-to-back)

        Args:
            home_days_rest: Days since last game
            away_days_rest: Days since last game
            away_is_back_to_back: True if away on back-to-back
            away_travel_distance_miles: Distance traveled by away team

        Returns:
            (score, rationale_list)
        """
        score = 0.0
        rationale = []

        rest_diff = home_days_rest - away_days_rest

        # Base rest advantage scoring
        if away_is_back_to_back and home_days_rest >= 2:
            score = 10.0
            rationale.append("🔥 Home rested vs away on back-to-back")

            # Apply travel distance penalty for back-to-back scenarios
            if away_travel_distance_miles > 1500:
                score = min(10.0, score + 2.0)  # Extra +2 bonus for home
                rationale.append(f"✈️ Away traveled {away_travel_distance_miles:.0f} mi (cross-country back-to-back)")
            elif away_travel_distance_miles > 500:
                score = min(10.0, score + 1.0)  # Extra +1 bonus for home
                rationale.append(f"✈️ Away traveled {away_travel_distance_miles:.0f} mi (regional back-to-back)")

        elif rest_diff >= 2:
            score = 8.0
            rationale.append(f"Home +{rest_diff} days rest advantage")
        elif rest_diff == 1:
            score = 6.0
        elif rest_diff == 0:
            score = 5.0  # Equal rest

            # Minor travel fatigue for long trips even with equal rest
            if away_travel_distance_miles > 2000:
                score = 6.0
                rationale.append(f"✈️ Away long travel ({away_travel_distance_miles:.0f} mi)")

        elif rest_diff == -1:
            score = 3.0
        else:  # rest_diff <= -2
            score = 0.0
            rationale.append("⚠️ Home at rest disadvantage")

        return score, rationale

    @staticmethod
    def score_line_value(
        opening_line: Optional[float] = None,
        current_line: Optional[float] = None
    ) -> Tuple[float, List[str]]:
        """
        Score line movement value (0-10 points)

        Args:
            opening_line: Opening spread
            current_line: Current spread

        Returns:
            (score, rationale_list)
        """
        score = 5.0  # Neutral default
        rationale = []

        if opening_line is not None and current_line is not None:
            line_movement = current_line - opening_line

            if abs(line_movement) > 2.0:
                score = 8.0
                rationale.append(f"Line moved {abs(line_movement):.1f} points")
            elif abs(line_movement) > 1.0:
                score = 6.0

        return score, rationale

    @classmethod
    def calculate_total_value(
        cls,
        game_id: str,
        home_team: str,
        away_team: str,
        # Positional matchups
        matchups: List[dict],
        # Betting trends
        home_ats_pct: float,
        away_ats_pct: float,
        # Advanced stats
        home_pace: float,
        away_pace: float,
        home_efg: float,
        away_efg: float,
        home_tov_pct: float,
        away_tov_pct: float,
        # Recent form
        home_wins_last_5: int,
        away_wins_last_5: int,
        # Rest and travel
        home_days_rest: int,
        away_days_rest: int,
        away_is_back_to_back: bool,
        away_travel_distance_miles: float = 0.0,
        # Line
        opening_line: Optional[float] = None,
        current_line: Optional[float] = None
    ) -> ValueRecommendation:
        """
        Calculate total value score - PURE FUNCTION

        All inputs are primitives or simple data structures
        No database access, no side effects, fully testable

        Returns:
            ValueRecommendation with full breakdown
        """
        # Calculate each factor
        matchup_score, matchup_rationale = cls.score_positional_matchups(matchups)
        trend_score, trend_rationale = cls.score_betting_trends(home_ats_pct, away_ats_pct)
        stats_score, stats_rationale = cls.score_advanced_stats(
            home_pace, away_pace, home_efg, away_efg, home_tov_pct, away_tov_pct
        )
        form_score, form_rationale = cls.score_recent_form(
            home_wins_last_5, away_wins_last_5
        )
        rest_score, rest_rationale = cls.score_rest_schedule(
            home_days_rest, away_days_rest, away_is_back_to_back, away_travel_distance_miles
        )
        line_score, line_rationale = cls.score_line_value(opening_line, current_line)

        # Create breakdown
        total = (
            matchup_score + trend_score + stats_score +
            form_score + rest_score + line_score
        )

        breakdown = ScoreBreakdown(
            positional_matchup=matchup_score,
            betting_trends=trend_score,
            advanced_stats=stats_score,
            recent_form=form_score,
            rest_schedule=rest_score,
            line_value=line_score,
            total=total
        )

        # Determine value tier
        if total >= 90:
            value_tier = ValueTier.EXCEPTIONAL
            confidence = "High"
        elif total >= 75:
            value_tier = ValueTier.STRONG
            confidence = "High"
        elif total >= 60:
            value_tier = ValueTier.GOOD
            confidence = "Moderate"
        elif total >= 45:
            value_tier = ValueTier.SLIGHT
            confidence = "Low"
        else:
            value_tier = ValueTier.NONE
            confidence = "None"

        # Determine recommended bet
        if total >= 60:
            recommended_bet = BetType.SPREAD
            # Home team favored if score > 50 (neutral point)
            recommended_side = home_team if total > 50 else away_team
        else:
            recommended_bet = BetType.SPREAD
            recommended_side = "No recommendation"

        # Combine rationale
        all_rationale = (
            matchup_rationale + trend_rationale + stats_rationale +
            form_rationale + rest_rationale + line_rationale
        )

        return ValueRecommendation(
            game_id=game_id,
            recommended_bet=recommended_bet,
            recommended_side=recommended_side,
            value_tier=value_tier,
            total_score=total,
            score_breakdown=breakdown,
            confidence=confidence,
            rationale=all_rationale
        )


# Example usage
if __name__ == '__main__':
    # Test with mock data
    test_matchups = [
        {
            'player_name': 'Giannis Antetokounmpo',
            'position': 'PF',
            'season_avg_points': 30.0,
            'opponent_rank_vs_position': 28,
            'opponent_ppg_allowed': 24.8,
            'league_avg_ppg_allowed': 21.8
        }
    ]

    recommendation = ScoringEngine.calculate_total_value(
        game_id='0022500123',
        home_team='MIL',
        away_team='PHI',
        matchups=test_matchups,
        home_ats_pct=0.70,
        away_ats_pct=0.30,
        home_pace=100.0,
        away_pace=95.0,
        home_efg=0.55,
        away_efg=0.50,
        home_tov_pct=0.12,
        away_tov_pct=0.15,
        home_wins_last_5=4,
        away_wins_last_5=1,
        home_days_rest=2,
        away_days_rest=0,
        away_is_back_to_back=True
    )

    print(f"Total Score: {recommendation.total_score:.1f}")
    print(f"Value Tier: {recommendation.value_tier.value}")
    print(f"Recommendation: {recommendation.recommended_bet.value} on {recommendation.recommended_side}")
    print(f"\nRationale:")
    for r in recommendation.rationale:
        print(f"  - {r}")
