#!/usr/bin/env python3
"""
Full Season Backtest for V4 Totals Model

Runs the improved totals model (with bias correction, volatility, pace matchup)
on all completed games of the 2025-26 season, skipping the first 10 games
per team to ensure enough historical data.

Metrics tracked:
- MAE (Mean Absolute Error)
- RMSE (Root Mean Square Error)
- Bias (systematic over/under projection)
- Win rate betting UNDER at projection
- Win rate by signal strength
- Calibration by confidence level
"""
import asyncio
import sys
import os
from datetime import datetime
from statistics import mean, stdev
import math

# Add project to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.tools.db_tool import DatabaseTool
from src.tools.monte_carlo import monte_carlo_totals_simulation


class TotalsBacktester:
    """Backtest the v4 totals projection model"""

    def __init__(self):
        self.db = DatabaseTool()

    async def run_backtest(self, skip_first_n: int = 10):
        """
        Run full season backtest.

        Args:
            skip_first_n: Number of early-season games to skip per team
        """
        await self.db.connect()

        print("=" * 70)
        print("FULL SEASON BACKTEST - V4 TOTALS MODEL")
        print("=" * 70)
        print(f"Skipping first {skip_first_n} games per team for data quality")
        print()

        # Get all completed games with totals
        games = await self._get_backtest_games(skip_first_n)

        print(f"Found {len(games)} games for backtesting")
        print("-" * 70)

        results = []

        for i, game in enumerate(games, 1):
            try:
                result = await self._analyze_game(game)
                if result:
                    results.append(result)

                    # Progress update every 20 games
                    if i % 20 == 0:
                        print(f"Processed {i}/{len(games)} games...")

            except Exception as e:
                print(f"Error on game {game['game_id']}: {e}")
                continue

        print(f"\nCompleted: {len(results)} games analyzed")
        print()

        # Calculate and display metrics
        await self._display_metrics(results)

        await self.db.close()

        return results

    async def _get_backtest_games(self, skip_first_n: int) -> list[dict]:
        """Get all eligible games for backtesting"""
        season = await self.db.get_current_season()

        # Build query with repeated season parameter
        result = await self.db.execute("""
            WITH all_team_games AS (
                -- Get all games for each team (home or away)
                SELECT team_id, game_id, game_date
                FROM (
                    SELECT home_team_id as team_id, game_id, game_date
                    FROM games WHERE season = $1 AND home_team_score IS NOT NULL
                    UNION ALL
                    SELECT away_team_id as team_id, game_id, game_date
                    FROM games WHERE season = $2 AND home_team_score IS NOT NULL
                ) subq
            ),
            team_game_nums AS (
                -- Assign game number per team (total games, not just home or away)
                SELECT team_id, game_id, game_date,
                       ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY game_date) as game_num
                FROM all_team_games
            ),
            home_nums AS (
                SELECT tgn.game_id, tgn.game_num as home_team_game_num
                FROM team_game_nums tgn
                JOIN games g ON tgn.game_id = g.game_id AND tgn.team_id = g.home_team_id
                WHERE g.season = $3
            ),
            away_nums AS (
                SELECT tgn.game_id, tgn.game_num as away_team_game_num
                FROM team_game_nums tgn
                JOIN games g ON tgn.game_id = g.game_id AND tgn.team_id = g.away_team_id
                WHERE g.season = $4
            )
            SELECT
                g.game_id,
                g.game_date,
                g.home_team_id,
                g.away_team_id,
                g.home_team_score,
                g.away_team_score,
                (g.home_team_score + g.away_team_score) as actual_total,
                ht.abbreviation as home_abbr,
                at.abbreviation as away_abbr,
                ht.full_name as home_team,
                at.full_name as away_team,
                hn.home_team_game_num,
                an.away_team_game_num
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            JOIN home_nums hn ON g.game_id = hn.game_id
            JOIN away_nums an ON g.game_id = an.game_id
            WHERE g.season = $5
              AND g.home_team_score IS NOT NULL
              AND hn.home_team_game_num > $6
              AND an.away_team_game_num > $7
            ORDER BY g.game_date
        """, [season, season, season, season, season, skip_first_n, skip_first_n])

        return result.data

    async def _analyze_game(self, game: dict) -> dict | None:
        """Analyze a single game using V4 model"""
        game_id = game["game_id"]
        game_date = str(game["game_date"])
        home_id = game["home_team_id"]
        away_id = game["away_team_id"]
        actual_total = float(game["actual_total"])

        # Get multi-timeframe efficiency data
        home_multi = await self.db.get_team_efficiency_multi_timeframe(home_id)
        away_multi = await self.db.get_team_efficiency_multi_timeframe(away_id)

        if not home_multi or not away_multi:
            return None

        # Get blended stats
        home_blended = home_multi.get("blended", {})
        away_blended = away_multi.get("blended", {})

        home_ortg = self._safe_float(home_blended.get("ortg", 110))
        home_drtg = self._safe_float(home_blended.get("drtg", 110))
        home_pace = self._safe_float(home_blended.get("pace", 100))

        away_ortg = self._safe_float(away_blended.get("ortg", 110))
        away_drtg = self._safe_float(away_blended.get("drtg", 110))
        away_pace = self._safe_float(away_blended.get("pace", 100))

        # LAYER 2: Efficiency-based projection
        matchup_pace = (home_pace + away_pace) / 2
        home_expected = ((home_ortg + away_drtg) / 2) * matchup_pace / 100
        away_expected = ((away_ortg + home_drtg) / 2) * matchup_pace / 100
        base_total = home_expected + away_expected

        # LAYER 3: Opponent strength adjustment
        home_opp_adj = await self.db.get_opponent_adjusted_stats(home_id, last_n_games=15)
        away_opp_adj = await self.db.get_opponent_adjusted_stats(away_id, last_n_games=15)

        opp_strength_adj = 0
        if home_opp_adj and away_opp_adj:
            h_ppg_adj = self._safe_float(home_opp_adj.get("ppg_adjustment", 0))
            h_opp_adj = self._safe_float(home_opp_adj.get("opp_ppg_adjustment", 0))
            a_ppg_adj = self._safe_float(away_opp_adj.get("ppg_adjustment", 0))
            a_opp_adj = self._safe_float(away_opp_adj.get("opp_ppg_adjustment", 0))
            opp_strength_adj = (h_ppg_adj + h_opp_adj + a_ppg_adj + a_opp_adj) / 2

        # LAYER 4: Rest days
        home_rest = await self.db.get_team_rest_days(home_id, game_date)
        away_rest = await self.db.get_team_rest_days(away_id, game_date)

        rest_adjustment = 0
        if home_rest.get("is_back_to_back"):
            rest_adjustment -= 3.0
        if away_rest.get("is_back_to_back"):
            rest_adjustment -= 3.0
        if home_rest.get("rest_days") == 1:
            rest_adjustment -= 1.5
        if away_rest.get("rest_days") == 1:
            rest_adjustment -= 1.5
        h_rest = home_rest.get("rest_days")
        a_rest = away_rest.get("rest_days")
        if h_rest is not None and a_rest is not None and h_rest >= 3 and a_rest >= 3:
            rest_adjustment += 2.0

        # LAYER 4b: Schedule density
        home_density = await self.db.get_schedule_density(home_id, game_date)
        away_density = await self.db.get_schedule_density(away_id, game_date)
        fatigue_adj = 0
        if home_density and away_density:
            h_fatigue = home_density.get("fatigue_score", 0)
            a_fatigue = away_density.get("fatigue_score", 0)
            fatigue_adj = -(h_fatigue + a_fatigue) * 0.5

        # LAYER 5: Venue splits
        home_totals = await self.db.get_team_totals_context(home_id, last_n_games=15)
        away_totals = await self.db.get_team_totals_context(away_id, last_n_games=15)

        venue_adjustment = 0
        if home_totals and away_totals:
            h_venue_avg = self._safe_float(home_totals.get("home_avg_total", 0))
            a_venue_avg = self._safe_float(away_totals.get("away_avg_total", 0))
            h_overall = self._safe_float(home_totals.get("avg_total", 0))
            a_overall = self._safe_float(away_totals.get("avg_total", 0))

            if h_venue_avg > 0 and a_venue_avg > 0 and h_overall > 0 and a_overall > 0:
                h_venue_adj = h_venue_avg - h_overall
                a_venue_adj = a_venue_avg - a_overall
                venue_adjustment = (h_venue_adj + a_venue_adj) / 2

        # LAYER 6: H2H history
        h2h = await self.db.get_h2h_totals(home_id, away_id, limit=10)
        h2h_adjustment = 0
        if h2h and h2h.get("games", 0) >= 3:
            h2h_avg = self._safe_float(h2h.get("avg_total", 0))
            if h2h_avg > 0:
                # Use projected total as reference line
                h2h_vs_base = h2h_avg - base_total
                h2h_adjustment = h2h_vs_base * 0.15

        # LAYER 7: Historical O/U trend at line
        # Using base_total as proxy for line since we don't have actual betting lines
        historical_trend_adj = 0
        home_ou = await self.db.get_team_ou_record(home_id, line=base_total, last_n_games=20)
        away_ou = await self.db.get_team_ou_record(away_id, line=base_total, last_n_games=20)
        if home_ou and away_ou:
            h_under = self._safe_float(home_ou.get("under_rate", 0.5))
            a_under = self._safe_float(away_ou.get("under_rate", 0.5))
            combined_under = (h_under + a_under) / 2
            if combined_under > 0.65:
                historical_trend_adj = -2.0
            elif combined_under > 0.55:
                historical_trend_adj = -1.0
            elif combined_under < 0.35:
                historical_trend_adj = 2.0
            elif combined_under < 0.45:
                historical_trend_adj = 1.0

        # LAYER 8: Pace matchup adjustment
        pace_matchup = await self.db.get_pace_matchup_data(home_id, away_id)
        pace_adj = pace_matchup.get("pace_adjustment", 0.0) if pace_matchup else 0.0

        # BIAS CORRECTION (from v3 backtest: -3.8 points under-projection)
        BIAS_CORRECTION = 4.0

        # Final projection
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

        # Get variance for Monte Carlo
        h_std = self._safe_float(home_totals.get("total_std_dev", 12.0)) if home_totals else 12.0
        a_std = self._safe_float(away_totals.get("total_std_dev", 12.0)) if away_totals else 12.0

        # Run Monte Carlo (using base_total as "line" since we don't have actual lines)
        mc_result = monte_carlo_totals_simulation(
            t1_projection=home_expected + (projected_total - base_total) / 2,
            t2_projection=away_expected + (projected_total - base_total) / 2,
            t1_std_dev=h_std,
            t2_std_dev=a_std,
            total_line=base_total,  # Use base as "line" for probability
            n_sims=5000,
            correlation=0.5,
        )

        error = projected_total - actual_total

        return {
            "game_id": game_id,
            "game_date": game_date,
            "matchup": f"{game['away_abbr']} @ {game['home_abbr']}",
            "actual_total": actual_total,
            "projected_total": round(projected_total, 1),
            "base_total": round(base_total, 1),
            "error": round(error, 1),
            "abs_error": abs(error),
            "mc_p_under": mc_result["p_under"],
            "mc_p_over": mc_result["p_over"],
            "mc_mean": mc_result["mean_total"],
            "mc_ci_95": [mc_result["percentiles"]["p5"], mc_result["percentiles"]["p95"]],
            "adjustments": {
                "opp_strength": round(opp_strength_adj, 1),
                "rest": round(rest_adjustment, 1),
                "fatigue": round(fatigue_adj, 1),
                "venue": round(venue_adjustment, 1),
                "h2h": round(h2h_adjustment, 1),
                "historical_trend": round(historical_trend_adj, 1),
                "pace": round(pace_adj, 1),
                "bias": BIAS_CORRECTION,
            }
        }

    async def _display_metrics(self, results: list[dict]):
        """Calculate and display backtest metrics"""
        if not results:
            print("No results to analyze")
            return

        errors = [r["error"] for r in results]
        abs_errors = [r["abs_error"] for r in results]

        # Core metrics
        mae = mean(abs_errors)
        rmse = math.sqrt(mean([e**2 for e in errors]))
        bias = mean(errors)

        print("=" * 70)
        print("BACKTEST RESULTS - V4 TOTALS MODEL")
        print("=" * 70)
        print(f"Games Analyzed: {len(results)}")
        print()

        print("ACCURACY METRICS")
        print("-" * 40)
        print(f"  MAE (Mean Absolute Error):  {mae:.1f} points")
        print(f"  RMSE:                       {rmse:.1f} points")
        print(f"  Bias:                       {bias:+.1f} points")
        print(f"  (Positive = over-projecting, Negative = under-projecting)")
        print()

        # Error distribution
        errors_5 = sum(1 for e in abs_errors if e <= 5)
        errors_10 = sum(1 for e in abs_errors if e <= 10)
        errors_15 = sum(1 for e in abs_errors if e <= 15)
        errors_20 = sum(1 for e in abs_errors if e <= 20)

        print("ERROR DISTRIBUTION")
        print("-" * 40)
        print(f"  Within 5 pts:   {errors_5:3d} ({errors_5/len(results)*100:.1f}%)")
        print(f"  Within 10 pts:  {errors_10:3d} ({errors_10/len(results)*100:.1f}%)")
        print(f"  Within 15 pts:  {errors_15:3d} ({errors_15/len(results)*100:.1f}%)")
        print(f"  Within 20 pts:  {errors_20:3d} ({errors_20/len(results)*100:.1f}%)")
        print()

        # Betting simulation: bet UNDER when projection is below actual line
        # Since we don't have real lines, use base_total as proxy
        under_wins = 0
        under_bets = 0
        over_wins = 0
        over_bets = 0

        for r in results:
            proj = r["projected_total"]
            actual = r["actual_total"]
            base = r["base_total"]

            # If projection is below base (our "line"), bet UNDER
            if proj < base - 1:
                under_bets += 1
                if actual < base:
                    under_wins += 1
            # If projection is above base, bet OVER
            elif proj > base + 1:
                over_bets += 1
                if actual > base:
                    over_wins += 1

        print("BETTING SIMULATION (vs Base Total as Line)")
        print("-" * 40)
        if under_bets > 0:
            print(f"  UNDER bets: {under_wins}/{under_bets} = {under_wins/under_bets*100:.1f}%")
        if over_bets > 0:
            print(f"  OVER bets:  {over_wins}/{over_bets} = {over_wins/over_bets*100:.1f}%")
        print()

        # Signal strength analysis
        print("SIGNAL STRENGTH ANALYSIS")
        print("-" * 40)

        # Strong UNDER signals (projection < base - 5)
        strong_under = [r for r in results if r["projected_total"] < r["base_total"] - 5]
        if strong_under:
            strong_under_wins = sum(1 for r in strong_under if r["actual_total"] < r["base_total"])
            print(f"  Strong UNDER (proj < base-5): {strong_under_wins}/{len(strong_under)} = {strong_under_wins/len(strong_under)*100:.1f}%")

        # Strong OVER signals (projection > base + 5)
        strong_over = [r for r in results if r["projected_total"] > r["base_total"] + 5]
        if strong_over:
            strong_over_wins = sum(1 for r in strong_over if r["actual_total"] > r["base_total"])
            print(f"  Strong OVER (proj > base+5):  {strong_over_wins}/{len(strong_over)} = {strong_over_wins/len(strong_over)*100:.1f}%")

        # Very strong signals
        very_strong_under = [r for r in results if r["projected_total"] < r["base_total"] - 10]
        if very_strong_under:
            vs_under_wins = sum(1 for r in very_strong_under if r["actual_total"] < r["base_total"])
            print(f"  Very Strong UNDER (proj < base-10): {vs_under_wins}/{len(very_strong_under)} = {vs_under_wins/len(very_strong_under)*100:.1f}%")

        very_strong_over = [r for r in results if r["projected_total"] > r["base_total"] + 10]
        if very_strong_over:
            vs_over_wins = sum(1 for r in very_strong_over if r["actual_total"] > r["base_total"])
            print(f"  Very Strong OVER (proj > base+10):  {vs_over_wins}/{len(very_strong_over)} = {vs_over_wins/len(very_strong_over)*100:.1f}%")

        print()

        # Monte Carlo probability calibration
        print("MONTE CARLO PROBABILITY CALIBRATION")
        print("-" * 40)

        # Group by MC probability buckets
        buckets = {
            "p_under > 0.7": {"wins": 0, "total": 0},
            "0.6 < p_under <= 0.7": {"wins": 0, "total": 0},
            "0.5 < p_under <= 0.6": {"wins": 0, "total": 0},
            "p_under <= 0.5": {"wins": 0, "total": 0},
        }

        for r in results:
            p_under = r["mc_p_under"]
            actual_under = r["actual_total"] < r["base_total"]

            if p_under > 0.7:
                buckets["p_under > 0.7"]["total"] += 1
                if actual_under:
                    buckets["p_under > 0.7"]["wins"] += 1
            elif p_under > 0.6:
                buckets["0.6 < p_under <= 0.7"]["total"] += 1
                if actual_under:
                    buckets["0.6 < p_under <= 0.7"]["wins"] += 1
            elif p_under > 0.5:
                buckets["0.5 < p_under <= 0.6"]["total"] += 1
                if actual_under:
                    buckets["0.5 < p_under <= 0.6"]["wins"] += 1
            else:
                buckets["p_under <= 0.5"]["total"] += 1
                if actual_under:
                    buckets["p_under <= 0.5"]["wins"] += 1

        for bucket, stats in buckets.items():
            if stats["total"] > 0:
                pct = stats["wins"] / stats["total"] * 100
                print(f"  {bucket}: {stats['wins']}/{stats['total']} = {pct:.1f}% actual under")

        print()

        # Confidence interval coverage
        print("CONFIDENCE INTERVAL COVERAGE")
        print("-" * 40)

        in_90_ci = sum(1 for r in results if r["mc_ci_95"][0] <= r["actual_total"] <= r["mc_ci_95"][1])
        print(f"  95% CI Coverage: {in_90_ci}/{len(results)} = {in_90_ci/len(results)*100:.1f}%")
        print(f"  (Expected: ~95%, indicates calibration)")
        print()

        # Adjustment impact analysis
        print("ADJUSTMENT IMPACT SUMMARY")
        print("-" * 40)

        adj_types = ["opp_strength", "rest", "fatigue", "venue", "h2h", "historical_trend", "pace", "bias"]
        for adj in adj_types:
            vals = [r["adjustments"][adj] for r in results]
            avg_val = mean(vals)
            nonzero = sum(1 for v in vals if v != 0)
            print(f"  {adj:18s}: avg={avg_val:+.1f}, applied in {nonzero} games")

        print()
        print("=" * 70)

        # Show worst predictions
        print("\nWORST PREDICTIONS (for model improvement)")
        print("-" * 40)
        sorted_by_error = sorted(results, key=lambda x: x["abs_error"], reverse=True)[:10]
        for r in sorted_by_error:
            print(f"  {r['game_date']} {r['matchup']:15s}: Proj={r['projected_total']:.0f}, Actual={r['actual_total']:.0f}, Error={r['error']:+.0f}")

    def _safe_float(self, value) -> float:
        """Safely convert to float"""
        if value is None:
            return 0.0
        try:
            return float(value)
        except (ValueError, TypeError):
            return 0.0


async def main():
    """Run the backtest"""
    backtest = TotalsBacktester()
    await backtest.run_backtest(skip_first_n=10)


if __name__ == "__main__":
    asyncio.run(main())
