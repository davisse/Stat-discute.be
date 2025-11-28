#!/usr/bin/env python3
"""
Analyze today's NBA games totals using V4 model.

Runs the full quant analyst on each game and outputs recommendations.
"""
import asyncio
import sys
import os
from datetime import datetime

# Add project to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.tools.db_tool import DatabaseTool
from src.tools.monte_carlo import monte_carlo_totals_simulation, calculate_ev_metrics


class TodaysTotalsAnalyzer:
    """Analyze today's games for totals betting"""

    def __init__(self):
        self.db = DatabaseTool()

    async def run(self):
        """Run analysis on today's games"""
        await self.db.connect()

        print("=" * 80)
        print("🏀 TODAY'S NBA TOTALS ANALYSIS - V4 MODEL")
        print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        print("=" * 80)
        print()

        # Get today's games with odds
        games = await self._get_todays_games()

        if not games:
            print("No games found for today")
            await self.db.close()
            return

        print(f"Found {len(games)} games to analyze")
        print("-" * 80)
        print()

        results = []
        for game in games:
            result = await self._analyze_game(game)
            if result:
                results.append(result)
                self._print_game_analysis(result)

        # Print summary
        self._print_summary(results)

        await self.db.close()

    async def _get_todays_games(self) -> list[dict]:
        """Get today's games with betting lines"""
        result = await self.db.execute("""
            SELECT
                g.game_id,
                g.game_date,
                g.home_team_id,
                g.away_team_id,
                ht.abbreviation as home_abbr,
                ht.full_name as home_team,
                at.abbreviation as away_abbr,
                at.full_name as away_team,
                be.event_id,
                (SELECT bo.handicap FROM betting_odds bo
                 JOIN betting_markets bm ON bo.market_id = bm.market_id
                 WHERE bm.event_id = be.event_id
                   AND bm.market_type = 'total'
                   AND bm.market_key LIKE '0_game_total_%'
                 ORDER BY bo.recorded_at DESC LIMIT 1) as total_line,
                (SELECT bo.odds_decimal FROM betting_odds bo
                 JOIN betting_markets bm ON bo.market_id = bm.market_id
                 WHERE bm.event_id = be.event_id
                   AND bm.market_type = 'total'
                   AND bm.market_key LIKE '0_game_total_%'
                   AND bo.selection LIKE 'Over%'
                 ORDER BY bo.recorded_at DESC LIMIT 1) as over_odds,
                (SELECT bo.odds_decimal FROM betting_odds bo
                 JOIN betting_markets bm ON bo.market_id = bm.market_id
                 WHERE bm.event_id = be.event_id
                   AND bm.market_type = 'total'
                   AND bm.market_key LIKE '0_game_total_%'
                   AND bo.selection LIKE 'Under%'
                 ORDER BY bo.recorded_at DESC LIMIT 1) as under_odds
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            JOIN betting_events be ON g.game_id = be.game_id
            WHERE g.game_date >= CURRENT_DATE
              AND g.game_date < CURRENT_DATE + INTERVAL '1 day'
            ORDER BY g.game_date
        """)
        return result.data

    async def _analyze_game(self, game: dict) -> dict | None:
        """Run V4 analysis on a single game"""
        home_id = game["home_team_id"]
        away_id = game["away_team_id"]
        total_line = float(game["total_line"]) if game["total_line"] else None
        game_date = str(game["game_date"])

        if not total_line:
            return None

        over_odds = float(game["over_odds"]) if game["over_odds"] else 1.91
        under_odds = float(game["under_odds"]) if game["under_odds"] else 1.91

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
                h2h_vs_base = h2h_avg - base_total
                h2h_adjustment = h2h_vs_base * 0.15

        # LAYER 7: Historical O/U trend
        historical_trend_adj = 0
        home_ou = await self.db.get_team_ou_record(home_id, line=total_line, last_n_games=20)
        away_ou = await self.db.get_team_ou_record(away_id, line=total_line, last_n_games=20)
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

        # LAYER 8b: Team volatility
        home_vol = await self.db.get_team_volatility(home_id, last_n_games=15)
        away_vol = await self.db.get_team_volatility(away_id, last_n_games=15)

        # BIAS CORRECTION
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

        # Adjust variance based on volatility
        if home_vol and home_vol.get("volatility_rating") == "high":
            h_std *= 1.15
        if away_vol and away_vol.get("volatility_rating") == "high":
            a_std *= 1.15

        # Run Monte Carlo simulation
        mc_result = monte_carlo_totals_simulation(
            t1_projection=home_expected + (projected_total - base_total) / 2,
            t2_projection=away_expected + (projected_total - base_total) / 2,
            t1_std_dev=h_std,
            t2_std_dev=a_std,
            total_line=total_line,
            n_sims=10000,
            correlation=0.5,
        )

        # Calculate EV metrics
        ev_metrics = calculate_ev_metrics(
            p_over=mc_result["p_over"],
            p_under=mc_result["p_under"],
            over_odds=over_odds,
            under_odds=under_odds,
        )

        margin = projected_total - total_line

        return {
            "game_id": game["game_id"],
            "matchup": f"{game['away_abbr']} @ {game['home_abbr']}",
            "away_team": game["away_abbr"],
            "home_team": game["home_abbr"],
            "total_line": total_line,
            "over_odds": over_odds,
            "under_odds": under_odds,
            "projected_total": round(projected_total, 1),
            "base_total": round(base_total, 1),
            "margin": round(margin, 1),
            "mc_p_over": mc_result["p_over"],
            "mc_p_under": mc_result["p_under"],
            "mc_mean": mc_result["mean_total"],
            "mc_percentiles": mc_result["percentiles"],
            "ev_over": ev_metrics["ev_over"],
            "ev_under": ev_metrics["ev_under"],
            "edge_over": ev_metrics["edge_over"],
            "edge_under": ev_metrics["edge_under"],
            "kelly_over": ev_metrics["kelly_over_fractional"],
            "kelly_under": ev_metrics["kelly_under_fractional"],
            "recommendation": ev_metrics["recommended_bet"],
            "adjustments": {
                "opp_strength": round(opp_strength_adj, 1),
                "rest": round(rest_adjustment, 1),
                "fatigue": round(fatigue_adj, 1),
                "venue": round(venue_adjustment, 1),
                "h2h": round(h2h_adjustment, 1),
                "historical_trend": round(historical_trend_adj, 1),
                "pace": round(pace_adj, 1),
                "bias": BIAS_CORRECTION,
            },
            "rest_info": {
                "home_rest": home_rest.get("rest_days"),
                "away_rest": away_rest.get("rest_days"),
                "home_b2b": home_rest.get("is_back_to_back"),
                "away_b2b": away_rest.get("is_back_to_back"),
            },
            "volatility": {
                "home": home_vol.get("volatility_rating") if home_vol else "unknown",
                "away": away_vol.get("volatility_rating") if away_vol else "unknown",
            }
        }

    def _print_game_analysis(self, result: dict):
        """Print analysis for a single game"""
        rec = result["recommendation"]

        # Determine recommendation emoji and color
        if "STRONG" in rec:
            emoji = "🔥"
        elif "BET" in rec and "NO" not in rec:
            emoji = "✅"
        elif "LEAN" in rec:
            emoji = "📊"
        else:
            emoji = "⏸️"

        print(f"{'─' * 80}")
        print(f"{emoji} {result['matchup']} | Line: {result['total_line']} | Proj: {result['projected_total']}")
        print(f"{'─' * 80}")

        margin = result["margin"]
        direction = "OVER" if margin > 0 else "UNDER"

        print(f"  📈 Projection: {result['projected_total']:.1f} ({margin:+.1f} vs line)")
        print(f"  🎲 MC Probabilities: Over {result['mc_p_over']*100:.1f}% | Under {result['mc_p_under']*100:.1f}%")
        print(f"  💰 EV: Over {result['ev_over']:+.3f} | Under {result['ev_under']:+.3f}")
        print(f"  📊 Edge: Over {result['edge_over']*100:+.1f}% | Under {result['edge_under']*100:+.1f}%")

        if result["kelly_over"] > 0 or result["kelly_under"] > 0:
            print(f"  🎯 Kelly: Over {result['kelly_over']*100:.2f}% | Under {result['kelly_under']*100:.2f}%")

        print()
        print(f"  📋 Recommendation: {rec}")

        # Print key factors
        adj = result["adjustments"]
        factors = []
        if abs(adj["rest"]) >= 1.5:
            factors.append(f"Rest {adj['rest']:+.1f}")
        if abs(adj["pace"]) >= 2:
            factors.append(f"Pace {adj['pace']:+.1f}")
        if abs(adj["h2h"]) >= 1:
            factors.append(f"H2H {adj['h2h']:+.1f}")
        if abs(adj["historical_trend"]) >= 1:
            factors.append(f"Trend {adj['historical_trend']:+.1f}")

        if factors:
            print(f"  📌 Key factors: {', '.join(factors)}")

        # Rest info
        rest = result["rest_info"]
        rest_notes = []
        if rest["home_b2b"]:
            rest_notes.append(f"{result['home_team']} B2B")
        if rest["away_b2b"]:
            rest_notes.append(f"{result['away_team']} B2B")
        if rest_notes:
            print(f"  ⚠️  {', '.join(rest_notes)}")

        print()

    def _print_summary(self, results: list[dict]):
        """Print summary of all recommendations"""
        print("=" * 80)
        print("📊 SUMMARY - ACTIONABLE BETS")
        print("=" * 80)

        strong_bets = [r for r in results if "STRONG" in r["recommendation"]]
        regular_bets = [r for r in results if "BET" in r["recommendation"] and "STRONG" not in r["recommendation"] and "NO" not in r["recommendation"]]
        leans = [r for r in results if "LEAN" in r["recommendation"]]

        if strong_bets:
            print("\n🔥 STRONG BETS:")
            for r in strong_bets:
                direction = "OVER" if "OVER" in r["recommendation"] else "UNDER"
                print(f"   {r['matchup']:15} {direction} {r['total_line']} (Proj: {r['projected_total']}, Edge: {max(r['edge_over'], r['edge_under'])*100:.1f}%)")

        if regular_bets:
            print("\n✅ BETS:")
            for r in regular_bets:
                direction = "OVER" if "OVER" in r["recommendation"] else "UNDER"
                print(f"   {r['matchup']:15} {direction} {r['total_line']} (Proj: {r['projected_total']}, Edge: {max(r['edge_over'], r['edge_under'])*100:.1f}%)")

        if leans:
            print("\n📊 LEANS (smaller edge):")
            for r in leans:
                direction = "OVER" if "OVER" in r["recommendation"] else "UNDER"
                print(f"   {r['matchup']:15} {direction} {r['total_line']} (Proj: {r['projected_total']})")

        no_bets = [r for r in results if "NO_BET" in r["recommendation"]]
        if no_bets:
            print(f"\n⏸️  NO BET: {len(no_bets)} games")

        print("\n" + "=" * 80)

        # Print quick reference table
        print("\n📋 QUICK REFERENCE:")
        print(f"{'Game':<16} {'Line':>6} {'Proj':>6} {'Margin':>7} {'P(U)':>6} {'P(O)':>6} {'Rec':<15}")
        print("-" * 80)
        for r in sorted(results, key=lambda x: abs(x["margin"]), reverse=True):
            print(f"{r['matchup']:<16} {r['total_line']:>6.1f} {r['projected_total']:>6.1f} {r['margin']:>+7.1f} {r['mc_p_under']*100:>5.1f}% {r['mc_p_over']*100:>5.1f}% {r['recommendation']:<15}")

    def _safe_float(self, value) -> float:
        """Safely convert to float"""
        if value is None:
            return 0.0
        try:
            return float(value)
        except (ValueError, TypeError):
            return 0.0


async def main():
    analyzer = TodaysTotalsAnalyzer()
    await analyzer.run()


if __name__ == "__main__":
    asyncio.run(main())
