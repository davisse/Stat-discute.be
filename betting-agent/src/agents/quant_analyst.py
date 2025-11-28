"""QuantAnalyst node - Code-verified mathematical analysis"""
from decimal import Decimal
from src.models.state import AgentState
from src.tools.db_tool import get_db
from src.tools.monte_carlo import (
    monte_carlo_totals_simulation,
    scenario_analysis,
    sensitivity_analysis,
    calculate_ev_metrics,
)


class QuantAnalystNode:
    """
    The QuantAnalyst performs mathematical analysis using code execution.

    Key Principle: ALL MATH IN CODE, NEVER LINGUISTIC

    Responsibilities:
    - Calculate edge using verified Python code
    - Analyze Four Factors for team comparison
    - Calculate implied probability from odds
    - Generate win probability projections
    """

    def __init__(self):
        self.db = None

    async def _get_db(self):
        """Get database connection"""
        if self.db is None:
            self.db = await get_db()
        return self.db

    async def __call__(self, state: AgentState) -> AgentState:
        """Execute quantitative analysis"""
        errors = list(state.get("errors", []))
        game_data = state.get("game_data")

        if not game_data:
            errors.append("No game data for analysis")
            return {
                **state,
                "current_node": "quant_analyst",
                "quant_result": None,
                "errors": errors,
            }

        # Route based on bet type
        bet_type = game_data.get("bet_type", "spread")

        if bet_type == "total":
            quant_result = await self._calculate_totals_edge(game_data, state.get("odds_data"))
        else:
            quant_result = await self._calculate_edge(game_data, state.get("odds_data"))

        # Add Four Factors comparison if we have two teams
        if game_data.get("team1") and game_data.get("team2"):
            four_factors = await self._analyze_four_factors(game_data)
            quant_result["four_factors"] = four_factors

        # Add historical ATS if available
        ats_data = await self._get_ats_performance(game_data)
        if ats_data:
            quant_result["ats_history"] = ats_data

        return {
            **state,
            "current_node": "quant_analyst",
            "quant_result": quant_result,
            "errors": errors,
        }

    async def _calculate_edge(self, game_data: dict, odds_data: dict | None) -> dict:
        """
        Calculate betting edge using verified math.

        Edge = Our probability - Implied probability - Vig

        Process:
        1. Project game margin from L10 stats
        2. Convert to win probability
        3. Compare to implied odds
        4. Calculate edge
        """
        result = {
            "edge": 0.0,
            "projected_margin": None,
            "our_probability": None,
            "implied_probability": None,
            "kelly_fraction": 0.0,
            "recommendation": "NO_BET",
            "confidence_factors": [],
            "calculation_method": "l10_margin_projection",
        }

        # Extract team stats
        team1 = game_data.get("team1", {})
        team2 = game_data.get("team2", {})
        line = game_data.get("line")

        # Get L10 stats for both teams
        t1_stats = team1.get("stats_l10", {})
        t2_stats = team2.get("stats_l10", {})

        if not t1_stats or not t2_stats:
            result["confidence_factors"].append("insufficient_stats")
            return result

        # Project margin using average margins
        t1_margin = self._safe_float(t1_stats.get("avg_margin", 0))
        t2_margin = self._safe_float(t2_stats.get("avg_margin", 0))

        # Home court advantage (~3 points in NBA)
        hca = 3.0
        is_team1_home = team1.get("is_home", False)
        home_adjustment = hca if is_team1_home else -hca

        # Projected margin for team1
        projected_margin = (t1_margin - t2_margin) / 2 + home_adjustment
        result["projected_margin"] = round(projected_margin, 1)
        result["confidence_factors"].append("l10_margin_diff")

        if is_team1_home:
            result["confidence_factors"].append("home_court_advantage")

        # Calculate win probability from projected margin
        # Using logistic approximation: P(win) = 1 / (1 + e^(-margin/10))
        our_prob = self._margin_to_probability(projected_margin)
        result["our_probability"] = round(our_prob, 4)

        # If we have a line, calculate spread edge
        if line is not None:
            cover_margin = projected_margin - float(line)

            # Probability of covering spread
            cover_prob = self._margin_to_probability(cover_margin)
            result["cover_probability"] = round(cover_prob, 4)

            # Implied probability from spread (typically -110 both sides = 52.4%)
            implied_prob = 0.524  # Standard vig

            # Get actual odds if available
            if odds_data and odds_data.get("spread"):
                spread_odds = odds_data["spread"]
                home_odds = spread_odds.get("home_odds")
                if home_odds:
                    implied_prob = self._odds_to_probability(home_odds)

            result["implied_probability"] = round(implied_prob, 4)

            # Calculate edge
            vig = 0.05  # Standard 5% vig
            edge = cover_prob - implied_prob - vig
            result["edge"] = round(edge, 4)

            # Kelly criterion (quarter Kelly for safety)
            if edge > 0 and implied_prob > 0:
                kelly = (edge * cover_prob) / implied_prob
                kelly = min(kelly * 0.25, 0.05)  # Cap at 5% of bankroll
                result["kelly_fraction"] = round(kelly, 4)
                result["confidence_factors"].append("positive_edge")

            # Determine recommendation
            if edge >= 0.03:
                result["recommendation"] = "BET"
                result["confidence_factors"].append("strong_edge")
            elif edge >= 0.01:
                result["recommendation"] = "LEAN_BET"
                result["confidence_factors"].append("marginal_edge")
            elif edge <= -0.03:
                result["recommendation"] = "FADE"
                result["confidence_factors"].append("negative_edge")
            else:
                result["recommendation"] = "NO_BET"

        else:
            # No line - just provide moneyline analysis
            result["recommendation"] = "NEED_LINE"
            result["confidence_factors"].append("no_line_provided")

        return result

    async def _calculate_totals_edge(self, game_data: dict, odds_data: dict | None) -> dict:
        """
        Calculate edge for totals (over/under) betting with COMPREHENSIVE inputs (v3).

        Enhanced inputs (10 data sources):
        1. Multi-timeframe stats (Season, L15, L10, L5 with weighted blending)
        2. Efficiency-based projection (ORtg/DRtg per 100 possessions)
        3. Opponent-adjusted stats (strength of schedule normalization)
        4. Actual pace data (real possessions, not derived)
        5. Rest days / back-to-back detection
        6. Schedule density (games in last 7/14 days)
        7. Home/Away venue splits
        8. Head-to-head totals history
        9. O/U record at similar lines
        10. Historical variance (actual std_dev)

        Process:
        1. Calculate efficiency-based projection using blended timeframe stats
        2. Apply opponent strength adjustment
        3. Apply situational adjustments (rest, venue, H2H, trends)
        4. Calculate variance-adjusted probability
        5. Compare to betting line and calculate edge
        """
        result = {
            "edge": 0.0,
            "projected_total": None,
            "direction": game_data.get("direction", "over"),
            "total_line": game_data.get("total_line"),
            "our_probability": None,
            "implied_probability": None,
            "kelly_fraction": 0.0,
            "recommendation": "NO_BET",
            "confidence_factors": [],
            "calculation_method": "enhanced_totals_v3",
            "inputs_used": [],
            "projection_breakdown": {},
        }

        team1 = game_data.get("team1", {})
        team2 = game_data.get("team2", {})
        total_line = game_data.get("total_line")
        direction = game_data.get("direction", "over")
        game_date = game_data.get("game_date")

        t1_id = team1.get("team_id")
        t2_id = team2.get("team_id")

        if not t1_id or not t2_id:
            result["confidence_factors"].append("missing_team_ids")
            return result

        db = await self._get_db()

        # ============================================================
        # LAYER 1: MULTI-TIMEFRAME EFFICIENCY DATA
        # ============================================================
        t1_multi = await db.get_team_efficiency_multi_timeframe(t1_id)
        t2_multi = await db.get_team_efficiency_multi_timeframe(t2_id)

        if not t1_multi or not t2_multi:
            # Fallback to basic L10 stats
            t1_stats = team1.get("stats_l10", {})
            t2_stats = team2.get("stats_l10", {})
            if not t1_stats or not t2_stats:
                result["confidence_factors"].append("insufficient_stats")
                return result
            # Use basic projection
            t1_ppg = self._safe_float(t1_stats.get("ppg", 0))
            t2_ppg = self._safe_float(t2_stats.get("ppg", 0))
            t1_opp_ppg = self._safe_float(t1_stats.get("opp_ppg", 0))
            t2_opp_ppg = self._safe_float(t2_stats.get("opp_ppg", 0))
            base_total = (t1_ppg + t2_opp_ppg) / 2 + (t2_ppg + t1_opp_ppg) / 2
            result["inputs_used"].append("l10_fallback")
        else:
            result["inputs_used"].append("multi_timeframe")

            # Get blended efficiency stats
            t1_blended = t1_multi.get("blended", {})
            t2_blended = t2_multi.get("blended", {})

            t1_ortg = self._safe_float(t1_blended.get("ortg", 110))
            t1_drtg = self._safe_float(t1_blended.get("drtg", 110))
            t1_pace = self._safe_float(t1_blended.get("pace", 100))

            t2_ortg = self._safe_float(t2_blended.get("ortg", 110))
            t2_drtg = self._safe_float(t2_blended.get("drtg", 110))
            t2_pace = self._safe_float(t2_blended.get("pace", 100))

            # Store timeframe breakdown
            result["timeframes"] = {
                "t1_season": t1_multi.get("season", {}),
                "t1_l10": t1_multi.get("l10", {}),
                "t1_l5": t1_multi.get("l5", {}),
                "t2_season": t2_multi.get("season", {}),
                "t2_l10": t2_multi.get("l10", {}),
                "t2_l5": t2_multi.get("l5", {}),
            }

            # ============================================================
            # LAYER 2: EFFICIENCY-BASED PROJECTION
            # ============================================================
            # Expected score = (Team_ORtg + Opp_DRtg) / 2 * Matchup_Pace / 100
            matchup_pace = (t1_pace + t2_pace) / 2

            t1_expected = ((t1_ortg + t2_drtg) / 2) * matchup_pace / 100
            t2_expected = ((t2_ortg + t1_drtg) / 2) * matchup_pace / 100
            base_total = t1_expected + t2_expected

            result["inputs_used"].append("efficiency_based")
            result["t1_ortg"] = round(t1_ortg, 1)
            result["t1_drtg"] = round(t1_drtg, 1)
            result["t2_ortg"] = round(t2_ortg, 1)
            result["t2_drtg"] = round(t2_drtg, 1)
            result["matchup_pace"] = round(matchup_pace, 1)

        result["projection_breakdown"]["base_total"] = round(base_total, 1)
        result["projection_breakdown"]["t1_expected"] = round(t1_expected if 't1_expected' in dir() else base_total/2, 1)
        result["projection_breakdown"]["t2_expected"] = round(t2_expected if 't2_expected' in dir() else base_total/2, 1)

        # ============================================================
        # LAYER 3: OPPONENT STRENGTH ADJUSTMENT
        # ============================================================
        t1_opp_adj = await db.get_opponent_adjusted_stats(t1_id, last_n_games=15)
        t2_opp_adj = await db.get_opponent_adjusted_stats(t2_id, last_n_games=15)

        opp_strength_adj = 0
        if t1_opp_adj and t2_opp_adj:
            # Get the adjustment factors (difference between raw and adjusted)
            t1_ppg_adj = self._safe_float(t1_opp_adj.get("ppg_adjustment", 0))
            t1_opp_adj_val = self._safe_float(t1_opp_adj.get("opp_ppg_adjustment", 0))
            t2_ppg_adj = self._safe_float(t2_opp_adj.get("ppg_adjustment", 0))
            t2_opp_adj_val = self._safe_float(t2_opp_adj.get("opp_ppg_adjustment", 0))

            # Combined adjustment: how much to shift based on SOS
            # Positive = teams faced weaker opponents, inflate projection
            # Negative = teams faced stronger opponents, deflate projection
            opp_strength_adj = (t1_ppg_adj + t1_opp_adj_val + t2_ppg_adj + t2_opp_adj_val) / 2

            result["inputs_used"].append("opponent_adjusted")
            result["t1_sos"] = {
                "raw_ppg": t1_opp_adj.get("raw_ppg"),
                "adj_ppg": t1_opp_adj.get("adj_ppg"),
                "adjustment": t1_ppg_adj,
            }
            result["t2_sos"] = {
                "raw_ppg": t2_opp_adj.get("raw_ppg"),
                "adj_ppg": t2_opp_adj.get("adj_ppg"),
                "adjustment": t2_ppg_adj,
            }

        result["projection_breakdown"]["opp_strength_adj"] = round(opp_strength_adj, 1)

        # ============================================================
        # LAYER 4: REST & SCHEDULE DENSITY
        # ============================================================
        t1_rest = await db.get_team_rest_days(t1_id, game_date) if game_date else {}
        t2_rest = await db.get_team_rest_days(t2_id, game_date) if game_date else {}
        t1_density = await db.get_schedule_density(t1_id, game_date) if game_date else {}
        t2_density = await db.get_schedule_density(t2_id, game_date) if game_date else {}

        rest_adjustment = 0
        t1_rest_days = t1_rest.get("rest_days")
        t2_rest_days = t2_rest.get("rest_days")

        if t1_rest_days is not None and t2_rest_days is not None:
            result["inputs_used"].append("rest_days")
            result["t1_rest_days"] = t1_rest_days
            result["t2_rest_days"] = t2_rest_days

            # Back-to-back penalty
            if t1_rest.get("is_back_to_back"):
                rest_adjustment -= 3.0
                result["confidence_factors"].append("t1_back_to_back")
            if t2_rest.get("is_back_to_back"):
                rest_adjustment -= 3.0
                result["confidence_factors"].append("t2_back_to_back")

            # 1 day rest penalty
            if t1_rest_days == 1:
                rest_adjustment -= 1.5
            if t2_rest_days == 1:
                rest_adjustment -= 1.5

            # Well-rested bonus (3+ days)
            if t1_rest_days >= 3 and t2_rest_days >= 3:
                rest_adjustment += 2.0
                result["confidence_factors"].append("both_well_rested")

        # Schedule density fatigue
        fatigue_adj = 0
        if t1_density and t2_density:
            result["inputs_used"].append("schedule_density")
            t1_fatigue = t1_density.get("fatigue_score", 0)
            t2_fatigue = t2_density.get("fatigue_score", 0)
            fatigue_adj = -(t1_fatigue + t2_fatigue) * 0.5  # Each fatigue point = -0.5 total
            result["t1_games_last_7"] = t1_density.get("games_last_7")
            result["t2_games_last_7"] = t2_density.get("games_last_7")

        result["projection_breakdown"]["rest_adjustment"] = round(rest_adjustment, 1)
        result["projection_breakdown"]["fatigue_adjustment"] = round(fatigue_adj, 1)

        # ============================================================
        # LAYER 5: VENUE SPLITS
        # ============================================================
        t1_totals = await db.get_team_totals_context(t1_id, last_n_games=15)
        t2_totals = await db.get_team_totals_context(t2_id, last_n_games=15)

        is_team1_home = team1.get("is_home", False)
        t1_venue = "home" if is_team1_home else "away"
        t2_venue = "away" if is_team1_home else "home"

        venue_adjustment = 0
        if t1_totals and t2_totals:
            t1_venue_avg = self._safe_float(t1_totals.get(f"{t1_venue}_avg_total", 0))
            t2_venue_avg = self._safe_float(t2_totals.get(f"{t2_venue}_avg_total", 0))
            t1_overall_avg = self._safe_float(t1_totals.get("avg_total", 0))
            t2_overall_avg = self._safe_float(t2_totals.get("avg_total", 0))

            if t1_venue_avg > 0 and t2_venue_avg > 0 and t1_overall_avg > 0 and t2_overall_avg > 0:
                t1_venue_adj = t1_venue_avg - t1_overall_avg
                t2_venue_adj = t2_venue_avg - t2_overall_avg
                venue_adjustment = (t1_venue_adj + t2_venue_adj) / 2
                result["inputs_used"].append("venue_splits")
                result["t1_venue_avg"] = round(t1_venue_avg, 1)
                result["t2_venue_avg"] = round(t2_venue_avg, 1)

        result["projection_breakdown"]["venue_adjustment"] = round(venue_adjustment, 1)

        # ============================================================
        # LAYER 6: HEAD-TO-HEAD HISTORY
        # ============================================================
        h2h_totals = await db.get_h2h_totals(t1_id, t2_id, limit=10)

        h2h_adjustment = 0
        if h2h_totals and h2h_totals.get("games", 0) >= 3:
            h2h_avg = self._safe_float(h2h_totals.get("avg_total", 0))
            if h2h_avg > 0 and total_line:
                # Compare H2H average to current line
                h2h_vs_line = h2h_avg - float(total_line)
                # Subtle adjustment based on H2H trend
                h2h_adjustment = h2h_vs_line * 0.15  # 15% weight on H2H
                result["inputs_used"].append("h2h_history")
                result["h2h_avg_total"] = round(h2h_avg, 1)
                result["h2h_games"] = h2h_totals.get("games")

        result["projection_breakdown"]["h2h_adjustment"] = round(h2h_adjustment, 1)

        # ============================================================
        # LAYER 7: O/U RECORD AT LINE
        # ============================================================
        historical_trend_adj = 0
        if total_line:
            t1_ou = await db.get_team_ou_record(t1_id, line=float(total_line), last_n_games=20)
            t2_ou = await db.get_team_ou_record(t2_id, line=float(total_line), last_n_games=20)

            if t1_ou and t2_ou:
                t1_under_rate = self._safe_float(t1_ou.get("under_rate", 0.5))
                t2_under_rate = self._safe_float(t2_ou.get("under_rate", 0.5))
                combined_under_rate = (t1_under_rate + t2_under_rate) / 2

                if combined_under_rate > 0.65:
                    historical_trend_adj = -2.0
                elif combined_under_rate > 0.55:
                    historical_trend_adj = -1.0
                elif combined_under_rate < 0.35:
                    historical_trend_adj = 2.0
                elif combined_under_rate < 0.45:
                    historical_trend_adj = 1.0

                result["inputs_used"].append("ou_record_at_line")
                result["t1_under_rate"] = round(t1_under_rate, 3)
                result["t2_under_rate"] = round(t2_under_rate, 3)

        result["projection_breakdown"]["historical_trend_adj"] = round(historical_trend_adj, 1)

        # ============================================================
        # LAYER 8: TEAM VOLATILITY & PACE MATCHUP
        # ============================================================
        t1_volatility = await db.get_team_volatility(t1_id, last_n_games=15)
        t2_volatility = await db.get_team_volatility(t2_id, last_n_games=15)
        pace_matchup = await db.get_pace_matchup_data(t1_id, t2_id)

        # Volatility-weighted variance for Monte Carlo
        if t1_volatility and t2_volatility:
            result["inputs_used"].append("team_volatility")
            result["t1_volatility"] = {
                "rating": t1_volatility.get("volatility_rating"),
                "total_std": t1_volatility.get("total_std"),
                "consistency": t1_volatility.get("consistency_score"),
            }
            result["t2_volatility"] = {
                "rating": t2_volatility.get("volatility_rating"),
                "total_std": t2_volatility.get("total_std"),
                "consistency": t2_volatility.get("consistency_score"),
            }

        # Pace matchup adjustment
        pace_adj = 0.0
        if pace_matchup:
            result["inputs_used"].append("pace_matchup")
            pace_adj = pace_matchup.get("pace_adjustment", 0.0)
            result["pace_matchup"] = pace_matchup

        result["projection_breakdown"]["pace_adjustment"] = round(pace_adj, 1)

        # ============================================================
        # FINAL PROJECTION (with bias correction)
        # ============================================================
        # Bias correction: backtest showed model under-projects by ~4 points
        BIAS_CORRECTION = 4.0

        projected_total = (
            base_total
            + opp_strength_adj
            + rest_adjustment
            + fatigue_adj
            + venue_adjustment
            + h2h_adjustment
            + historical_trend_adj
            + pace_adj
            + BIAS_CORRECTION
        )
        result["projected_total"] = round(projected_total, 1)
        result["projection_breakdown"]["bias_correction"] = BIAS_CORRECTION
        result["confidence_factors"].append("comprehensive_v4_projection")

        # ============================================================
        # VARIANCE & PROBABILITY CALCULATION
        # ============================================================
        # Use actual variance from data
        t1_std = self._safe_float(t1_totals.get("total_std_dev", 0)) if t1_totals else 0
        t2_std = self._safe_float(t2_totals.get("total_std_dev", 0)) if t2_totals else 0
        season_std = self._safe_float(t1_multi.get("season", {}).get("std_dev", 0)) if t1_multi else 0

        if t1_std > 0 and t2_std > 0:
            result["inputs_used"].append("actual_variance")
        elif season_std > 0:
            t1_std = season_std
            t2_std = season_std
        else:
            t1_std = 12.0  # Default
            t2_std = 12.0

        # Adjust variance for sample size
        games_count = min(
            t1_multi.get("season", {}).get("games", 20) if t1_multi else 20,
            t2_multi.get("season", {}).get("games", 20) if t2_multi else 20
        )
        if games_count < 15:
            uncertainty_penalty = (15 - games_count) * 0.3
            t1_std += uncertainty_penalty
            t2_std += uncertainty_penalty

        result["t1_std_dev"] = round(t1_std, 1)
        result["t2_std_dev"] = round(t2_std, 1)

        if total_line is not None:
            total_line = float(total_line)
            margin = projected_total - total_line
            result["margin_from_line"] = round(margin, 1)

            # ============================================================
            # MONTE CARLO SIMULATION (PRIMARY PROBABILITY METHOD)
            # ============================================================
            # Get team expected scores from projection breakdown
            t1_expected = result["projection_breakdown"].get("t1_expected", projected_total / 2)
            t2_expected = result["projection_breakdown"].get("t2_expected", projected_total / 2)

            # Run Monte Carlo simulation (10,000 runs)
            mc_result = monte_carlo_totals_simulation(
                t1_projection=t1_expected,
                t2_projection=t2_expected,
                t1_std_dev=t1_std,
                t2_std_dev=t2_std,
                total_line=total_line,
                n_sims=10000,
                correlation=0.5,
            )

            result["monte_carlo"] = mc_result
            result["inputs_used"].append("monte_carlo_simulation")

            # Use MC probability as primary
            if direction == "under":
                hit_prob = mc_result["p_under"]
            else:
                hit_prob = mc_result["p_over"]

            result["our_probability"] = round(hit_prob, 4)
            result["our_probability_method"] = "monte_carlo"
            result["mc_confidence_interval"] = mc_result["ci_95_under"] if direction == "under" else mc_result["ci_95_over"]

            # Z-score for reference (backup method)
            import math
            std_dev = (t1_std + t2_std) / 2
            z_margin = margin if direction == "over" else -margin
            z_score = z_margin / std_dev if std_dev > 0 else 0
            z_prob = 0.5 + 0.5 * math.erf(z_score / math.sqrt(2))
            z_prob = max(0.05, min(0.95, z_prob))
            result["z_score"] = round(z_score, 2)
            result["z_score_probability"] = round(z_prob, 4)

            # Get odds for EV calculation
            over_odds = 1.91  # Default -110
            under_odds = 1.91
            if odds_data and odds_data.get("total"):
                totals_odds = odds_data["total"]
                if totals_odds.get("over_odds"):
                    over_odds = self._american_to_decimal(totals_odds["over_odds"])
                if totals_odds.get("under_odds"):
                    under_odds = self._american_to_decimal(totals_odds["under_odds"])

            # Calculate EV metrics using MC probabilities
            ev_metrics = calculate_ev_metrics(
                p_over=mc_result["p_over"],
                p_under=mc_result["p_under"],
                over_odds=over_odds,
                under_odds=under_odds,
            )
            result["ev_metrics"] = ev_metrics

            # Use EV-based edge
            if direction == "under":
                edge = ev_metrics["edge_under"]
                implied_prob = ev_metrics["implied_under"]
                kelly = ev_metrics["kelly_under_fractional"]
            else:
                edge = ev_metrics["edge_over"]
                implied_prob = ev_metrics["implied_over"]
                kelly = ev_metrics["kelly_over_fractional"]

            result["implied_probability"] = round(implied_prob, 4)
            result["edge"] = round(edge, 4)
            result["kelly_fraction"] = round(kelly, 4)

            if edge > 0:
                result["confidence_factors"].append("positive_edge")

            # Scenario analysis (quick version with fewer sims)
            scenarios = scenario_analysis(
                t1_projection=t1_expected,
                t2_projection=t2_expected,
                t1_std_dev=t1_std,
                t2_std_dev=t2_std,
                total_line=total_line,
                n_sims=3000,
            )
            result["scenarios"] = scenarios

            # Extract scenario range for confidence assessment
            scenario_spread = scenarios["_summary"]["p_under_spread"]
            if scenario_spread > 0.15:
                result["confidence_factors"].append("high_scenario_variance")
            elif scenario_spread < 0.08:
                result["confidence_factors"].append("stable_across_scenarios")

            # Confidence level based on inputs AND scenario stability
            inputs_count = len(result["inputs_used"])
            if inputs_count >= 9 and scenario_spread < 0.10:
                result["confidence_factors"].append("maximum_confidence")
                result["confidence_level"] = "HIGH"
            elif inputs_count >= 7:
                result["confidence_factors"].append("high_confidence_inputs")
                result["confidence_level"] = "MEDIUM-HIGH"
            elif inputs_count >= 5:
                result["confidence_factors"].append("medium_confidence_inputs")
                result["confidence_level"] = "MEDIUM"
            else:
                result["confidence_factors"].append("low_confidence_inputs")
                result["confidence_level"] = "LOW"

            # Recommendation based on EV metrics
            result["recommendation"] = ev_metrics["recommended_bet"]
            if "STRONG" in ev_metrics["recommended_bet"]:
                result["confidence_factors"].append("very_strong_edge")
            elif "BET" in ev_metrics["recommended_bet"] and "NO" not in ev_metrics["recommended_bet"]:
                result["confidence_factors"].append("strong_edge")
            elif "LEAN" in ev_metrics["recommended_bet"]:
                result["confidence_factors"].append("marginal_edge")
        else:
            result["recommendation"] = "NEED_LINE"
            result["confidence_factors"].append("no_total_line_provided")

        return result

    async def _analyze_four_factors(self, game_data: dict) -> dict:
        """
        Analyze Dean Oliver's Four Factors for both teams.

        Four Factors (with weights):
        1. Shooting (40%): eFG% = (FGM + 0.5 * 3PM) / FGA
        2. Turnovers (25%): TOV% = TOV / (FGA + 0.44 * FTA + TOV)
        3. Rebounding (20%): OREB% = OREB / (OREB + Opp DREB)
        4. Free Throws (15%): FT Rate = FT / FGA
        """
        team1 = game_data.get("team1", {})
        team2 = game_data.get("team2", {})

        result = {
            "team1_name": team1.get("abbreviation", "T1"),
            "team2_name": team2.get("abbreviation", "T2"),
            "factors": {},
            "edge_breakdown": {},
            "total_edge": 0.0,
        }

        # Get detailed stats from database
        try:
            db = await self._get_db()
            # Would need detailed box score aggregates
            # For now, use available L10 stats
            t1_stats = team1.get("stats_l10", {})
            t2_stats = team2.get("stats_l10", {})

            # Offensive/Defensive ratings from PPG
            t1_ppg = self._safe_float(t1_stats.get("ppg", 0))
            t2_ppg = self._safe_float(t2_stats.get("ppg", 0))
            t1_opp_ppg = self._safe_float(t1_stats.get("opp_ppg", 0))
            t2_opp_ppg = self._safe_float(t2_stats.get("opp_ppg", 0))

            result["factors"] = {
                "team1_offense": t1_ppg,
                "team1_defense": t1_opp_ppg,
                "team2_offense": t2_ppg,
                "team2_defense": t2_opp_ppg,
            }

            # Net rating comparison
            t1_net = t1_ppg - t1_opp_ppg
            t2_net = t2_ppg - t2_opp_ppg
            result["edge_breakdown"]["net_rating_diff"] = round(t1_net - t2_net, 1)

        except Exception as e:
            result["error"] = str(e)

        return result

    async def _get_ats_performance(self, game_data: dict) -> dict | None:
        """Get historical against-the-spread performance."""
        try:
            db = await self._get_db()
            team1 = game_data.get("team1", {})

            if not team1.get("abbreviation"):
                return None

            # Query ATS history (if table exists)
            result = await db.execute("""
                SELECT
                    COUNT(*) as total_games,
                    SUM(CASE WHEN covered THEN 1 ELSE 0 END) as covers,
                    ROUND(AVG(CASE WHEN covered THEN 1 ELSE 0 END)::numeric, 3) as ats_pct
                FROM ats_performance
                WHERE team_abbreviation = $1
                AND games_back <= 20
            """, [team1.get("abbreviation")])

            if result.success and result.data:
                row = result.data[0]
                if row.get("total_games", 0) > 0:
                    return {
                        "total_games": row["total_games"],
                        "covers": row["covers"],
                        "ats_percentage": float(row.get("ats_pct", 0.5)),
                    }

        except Exception:
            # ATS table might not exist yet
            pass

        return None

    def _safe_float(self, value) -> float:
        """Safely convert value to float"""
        if value is None:
            return 0.0
        if isinstance(value, Decimal):
            return float(value)
        try:
            return float(value)
        except (ValueError, TypeError):
            return 0.0

    def _margin_to_probability(self, margin: float) -> float:
        """
        Convert point margin to win probability.

        Uses logistic function calibrated to NBA data:
        - 0 point margin = 50% win probability
        - Each point ≈ 3% change in probability
        """
        import math
        # Logistic function with NBA calibration
        prob = 1 / (1 + math.exp(-margin / 10))
        return max(0.05, min(0.95, prob))

    def _odds_to_probability(self, odds: float) -> float:
        """
        Convert decimal odds to implied probability.

        Decimal odds: 1.91 (standard -110) → 52.4%
        """
        if odds <= 1:
            return 0.5
        return 1 / odds

    def _american_to_decimal(self, american_odds: float) -> float:
        """
        Convert American odds to decimal odds.

        American odds:
        - Negative (favorite): -110 → 1.91
        - Positive (underdog): +150 → 2.50
        """
        if american_odds is None:
            return 1.91  # Default -110
        if american_odds >= 100:
            return (american_odds / 100) + 1
        elif american_odds <= -100:
            return (100 / abs(american_odds)) + 1
        else:
            return 1.91  # Invalid odds, default


# Functional interface for LangGraph
async def quant_analyst_node(state: AgentState) -> AgentState:
    """QuantAnalyst node function for LangGraph"""
    node = QuantAnalystNode()
    return await node(state)
