#!/usr/bin/env python3
"""Detailed single game analysis using V4 model."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.tools.db_tool import DatabaseTool
from src.tools.monte_carlo import monte_carlo_totals_simulation, calculate_ev_metrics


async def analyze_game(team1: str, team2: str):
    """Run detailed V4 analysis on a specific game."""
    db = DatabaseTool()
    await db.connect()

    # Get the game
    result = await db.execute("""
        SELECT
            g.game_id, g.game_date,
            g.home_team_id, g.away_team_id,
            ht.abbreviation as home_abbr, ht.full_name as home_team,
            at.abbreviation as away_abbr, at.full_name as away_team,
            (SELECT bo.handicap FROM betting_odds bo
             JOIN betting_markets bm ON bo.market_id = bm.market_id
             JOIN betting_events be ON bm.event_id = be.event_id
             WHERE be.game_id = g.game_id
               AND bm.market_type = 'total'
               AND bm.market_key LIKE '0_game_total_%'
             ORDER BY bo.recorded_at DESC LIMIT 1) as total_line,
            (SELECT bo.odds_decimal FROM betting_odds bo
             JOIN betting_markets bm ON bo.market_id = bm.market_id
             JOIN betting_events be ON bm.event_id = be.event_id
             WHERE be.game_id = g.game_id
               AND bm.market_type = 'total'
               AND bm.market_key LIKE '0_game_total_%'
               AND bo.selection LIKE 'Over%%'
             ORDER BY bo.recorded_at DESC LIMIT 1) as over_odds,
            (SELECT bo.odds_decimal FROM betting_odds bo
             JOIN betting_markets bm ON bo.market_id = bm.market_id
             JOIN betting_events be ON bm.event_id = be.event_id
             WHERE be.game_id = g.game_id
               AND bm.market_type = 'total'
               AND bm.market_key LIKE '0_game_total_%'
               AND bo.selection LIKE 'Under%%'
             ORDER BY bo.recorded_at DESC LIMIT 1) as under_odds
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE g.game_date >= CURRENT_DATE
          AND g.game_date < CURRENT_DATE + INTERVAL '1 day'
          AND (ht.abbreviation IN ($1, $2) OR at.abbreviation IN ($1, $2))
    """, [team1.upper(), team2.upper()])

    if not result.data:
        print(f"No {team1} vs {team2} game found for today")
        await db.close()
        return

    game = result.data[0]
    home_id = game["home_team_id"]
    away_id = game["away_team_id"]
    total_line = float(game["total_line"])
    game_date = str(game["game_date"])
    over_odds = float(game["over_odds"]) if game["over_odds"] else 1.91
    under_odds = float(game["under_odds"]) if game["under_odds"] else 1.91

    print("=" * 80)
    print(f"DETAILED ANALYSIS: {game['away_abbr']} @ {game['home_abbr']}")
    print(f"Date: {game_date}")
    print(f"Line: {total_line} | Over {over_odds:.2f} | Under {under_odds:.2f}")
    print("=" * 80)
    print()

    def sf(v):
        return float(v) if v else 0.0

    # LAYER 1 & 2: Multi-timeframe efficiency
    print("LAYER 1-2: EFFICIENCY-BASED PROJECTION")
    print("-" * 60)

    home_multi = await db.get_team_efficiency_multi_timeframe(home_id)
    away_multi = await db.get_team_efficiency_multi_timeframe(away_id)

    for tf in ["season", "last_15", "last_10", "last_5"]:
        h = home_multi.get(tf, {})
        a = away_multi.get(tf, {})
        print(f"  {tf.upper():10} | {game['home_abbr']}: O{sf(h.get('ortg')):.1f} D{sf(h.get('drtg')):.1f} P{sf(h.get('pace')):.1f} | {game['away_abbr']}: O{sf(a.get('ortg')):.1f} D{sf(a.get('drtg')):.1f} P{sf(a.get('pace')):.1f}")

    hb = home_multi.get("blended", {})
    ab = away_multi.get("blended", {})
    print(f"  {'BLENDED':10} | {game['home_abbr']}: O{sf(hb.get('ortg')):.1f} D{sf(hb.get('drtg')):.1f} P{sf(hb.get('pace')):.1f} | {game['away_abbr']}: O{sf(ab.get('ortg')):.1f} D{sf(ab.get('drtg')):.1f} P{sf(ab.get('pace')):.1f}")

    home_ortg = sf(hb.get("ortg", 110))
    home_drtg = sf(hb.get("drtg", 110))
    home_pace = sf(hb.get("pace", 100))
    away_ortg = sf(ab.get("ortg", 110))
    away_drtg = sf(ab.get("drtg", 110))
    away_pace = sf(ab.get("pace", 100))

    matchup_pace = (home_pace + away_pace) / 2
    home_expected = ((home_ortg + away_drtg) / 2) * matchup_pace / 100
    away_expected = ((away_ortg + home_drtg) / 2) * matchup_pace / 100
    base_total = home_expected + away_expected

    print()
    print(f"  Matchup Pace: {matchup_pace:.1f}")
    print(f"  {game['home_abbr']} Expected: ({home_ortg:.1f} + {away_drtg:.1f})/2 x {matchup_pace:.1f}/100 = {home_expected:.1f}")
    print(f"  {game['away_abbr']} Expected: ({away_ortg:.1f} + {home_drtg:.1f})/2 x {matchup_pace:.1f}/100 = {away_expected:.1f}")
    print(f"  => BASE TOTAL: {base_total:.1f}")
    print()

    # LAYER 3: Opponent strength adjustment
    print("LAYER 3: OPPONENT STRENGTH ADJUSTMENT")
    print("-" * 60)

    home_opp_adj = await db.get_opponent_adjusted_stats(home_id, last_n_games=15)
    away_opp_adj = await db.get_opponent_adjusted_stats(away_id, last_n_games=15)

    opp_strength_adj = 0
    if home_opp_adj and away_opp_adj:
        h_ppg_adj = sf(home_opp_adj.get("ppg_adjustment", 0))
        h_opp_adj = sf(home_opp_adj.get("opp_ppg_adjustment", 0))
        a_ppg_adj = sf(away_opp_adj.get("ppg_adjustment", 0))
        a_opp_adj = sf(away_opp_adj.get("opp_ppg_adjustment", 0))
        opp_strength_adj = (h_ppg_adj + h_opp_adj + a_ppg_adj + a_opp_adj) / 2

        print(f"  {game['home_abbr']}: PPG adj {h_ppg_adj:+.1f}, OPP PPG adj {h_opp_adj:+.1f}")
        print(f"  {game['away_abbr']}: PPG adj {a_ppg_adj:+.1f}, OPP PPG adj {a_opp_adj:+.1f}")
    print(f"  => OPP STRENGTH ADJ: {opp_strength_adj:+.1f}")
    print()

    # LAYER 4: Rest days
    print("LAYER 4: REST DAYS")
    print("-" * 60)

    home_rest = await db.get_team_rest_days(home_id, game_date)
    away_rest = await db.get_team_rest_days(away_id, game_date)

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

    print(f"  {game['home_abbr']}: {h_rest} rest days, B2B: {home_rest.get('is_back_to_back')}")
    print(f"  {game['away_abbr']}: {a_rest} rest days, B2B: {away_rest.get('is_back_to_back')}")
    print(f"  => REST ADJ: {rest_adjustment:+.1f}")
    print()

    # LAYER 4b: Schedule density
    print("LAYER 4b: SCHEDULE DENSITY")
    print("-" * 60)

    home_density = await db.get_schedule_density(home_id, game_date)
    away_density = await db.get_schedule_density(away_id, game_date)
    fatigue_adj = 0
    if home_density and away_density:
        h_fatigue = home_density.get("fatigue_score", 0)
        a_fatigue = away_density.get("fatigue_score", 0)
        fatigue_adj = -(h_fatigue + a_fatigue) * 0.5
        print(f"  {game['home_abbr']}: Fatigue score {h_fatigue:.2f}")
        print(f"  {game['away_abbr']}: Fatigue score {a_fatigue:.2f}")
    print(f"  => FATIGUE ADJ: {fatigue_adj:+.1f}")
    print()

    # LAYER 5: Venue splits
    print("LAYER 5: VENUE SPLITS")
    print("-" * 60)

    home_totals = await db.get_team_totals_context(home_id, last_n_games=15)
    away_totals = await db.get_team_totals_context(away_id, last_n_games=15)

    venue_adjustment = 0
    if home_totals and away_totals:
        h_venue_avg = sf(home_totals.get("home_avg_total", 0))
        a_venue_avg = sf(away_totals.get("away_avg_total", 0))
        h_overall = sf(home_totals.get("avg_total", 0))
        a_overall = sf(away_totals.get("avg_total", 0))

        if h_venue_avg > 0 and a_venue_avg > 0 and h_overall > 0 and a_overall > 0:
            h_venue_adj = h_venue_avg - h_overall
            a_venue_adj = a_venue_avg - a_overall
            venue_adjustment = (h_venue_adj + a_venue_adj) / 2

            print(f"  {game['home_abbr']} at home: {h_venue_avg:.1f} avg (overall {h_overall:.1f}, diff {h_venue_adj:+.1f})")
            print(f"  {game['away_abbr']} on road: {a_venue_avg:.1f} avg (overall {a_overall:.1f}, diff {a_venue_adj:+.1f})")
    print(f"  => VENUE ADJ: {venue_adjustment:+.1f}")
    print()

    # LAYER 6: H2H history
    print("LAYER 6: HEAD-TO-HEAD HISTORY")
    print("-" * 60)

    h2h = await db.get_h2h_totals(home_id, away_id, limit=10)
    h2h_adjustment = 0
    if h2h and h2h.get("games", 0) >= 3:
        h2h_avg = sf(h2h.get("avg_total", 0))
        if h2h_avg > 0:
            h2h_vs_base = h2h_avg - base_total
            h2h_adjustment = h2h_vs_base * 0.15
            print(f"  Last {h2h.get('games')} H2H games: avg total {h2h_avg:.1f}")
            print(f"  vs Base {base_total:.1f}: diff {h2h_vs_base:+.1f}")
    else:
        print(f"  Not enough H2H history (need 3 games)")
    print(f"  => H2H ADJ: {h2h_adjustment:+.1f}")
    print()

    # LAYER 7: Historical O/U trend
    print("LAYER 7: HISTORICAL O/U TREND")
    print("-" * 60)

    historical_trend_adj = 0
    home_ou = await db.get_team_ou_record(home_id, line=total_line, last_n_games=20)
    away_ou = await db.get_team_ou_record(away_id, line=total_line, last_n_games=20)
    if home_ou and away_ou:
        h_under = sf(home_ou.get("under_rate", 0.5))
        a_under = sf(away_ou.get("under_rate", 0.5))
        combined_under = (h_under + a_under) / 2

        print(f"  {game['home_abbr']} UNDER rate (L20): {h_under*100:.1f}%")
        print(f"  {game['away_abbr']} UNDER rate (L20): {a_under*100:.1f}%")
        print(f"  Combined UNDER rate: {combined_under*100:.1f}%")

        if combined_under > 0.65:
            historical_trend_adj = -2.0
        elif combined_under > 0.55:
            historical_trend_adj = -1.0
        elif combined_under < 0.35:
            historical_trend_adj = 2.0
        elif combined_under < 0.45:
            historical_trend_adj = 1.0
    print(f"  => TREND ADJ: {historical_trend_adj:+.1f}")
    print()

    # LAYER 8: Pace matchup
    print("LAYER 8: PACE MATCHUP")
    print("-" * 60)

    pace_matchup = await db.get_pace_matchup_data(home_id, away_id)
    pace_adj = pace_matchup.get("pace_adjustment", 0.0) if pace_matchup else 0.0
    if pace_matchup:
        print(f"  League avg pace: 100.0 (baseline)")
        print(f"  {game['home_abbr']} pace: {sf(pace_matchup.get('t1_pace')):.1f}")
        print(f"  {game['away_abbr']} pace: {sf(pace_matchup.get('t2_pace')):.1f}")
        print(f"  Matchup pace: {sf(pace_matchup.get('matchup_pace')):.1f}")
        print(f"  Pace diff from avg: {sf(pace_matchup.get('pace_diff_from_avg')):.1f} × 2.2 = {pace_adj:+.1f}")
    print(f"  => PACE ADJ: {pace_adj:+.1f}")
    print()

    # LAYER 8b: Volatility
    print("LAYER 8b: TEAM VOLATILITY")
    print("-" * 60)

    home_vol = await db.get_team_volatility(home_id, last_n_games=15)
    away_vol = await db.get_team_volatility(away_id, last_n_games=15)

    h_std = sf(home_totals.get("total_std_dev", 12.0)) if home_totals else 12.0
    a_std = sf(away_totals.get("total_std_dev", 12.0)) if away_totals else 12.0

    if home_vol:
        print(f"  {game['home_abbr']}: std {sf(home_vol.get('total_std')):.1f}, volatility: {home_vol.get('volatility_rating')}")
        if home_vol.get("volatility_rating") == "high":
            h_std *= 1.15
    if away_vol:
        print(f"  {game['away_abbr']}: std {sf(away_vol.get('total_std')):.1f}, volatility: {away_vol.get('volatility_rating')}")
        if away_vol.get("volatility_rating") == "high":
            a_std *= 1.15

    print(f"  Adjusted std devs: {game['home_abbr']} {h_std:.1f}, {game['away_abbr']} {a_std:.1f}")
    print()

    # BIAS CORRECTION
    BIAS_CORRECTION = 4.0

    # FINAL PROJECTION
    print("=" * 80)
    print("FINAL PROJECTION")
    print("=" * 80)

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

    print(f"  Base Total:         {base_total:>7.1f}")
    print(f"  + Opp Strength:     {opp_strength_adj:>+7.1f}")
    print(f"  + Rest:             {rest_adjustment:>+7.1f}")
    print(f"  + Fatigue:          {fatigue_adj:>+7.1f}")
    print(f"  + Venue:            {venue_adjustment:>+7.1f}")
    print(f"  + H2H:              {h2h_adjustment:>+7.1f}")
    print(f"  + Trend:            {historical_trend_adj:>+7.1f}")
    print(f"  + Pace:             {pace_adj:>+7.1f}")
    print(f"  + Bias Correction:  {BIAS_CORRECTION:>+7.1f}")
    print(f"  ---------------------------------")
    print(f"  PROJECTED TOTAL:    {projected_total:>7.1f}")
    print(f"  LINE:               {total_line:>7.1f}")
    print(f"  MARGIN:             {projected_total - total_line:>+7.1f}")
    print()

    # Monte Carlo
    print("MONTE CARLO SIMULATION (10,000 sims)")
    print("-" * 60)

    mc_result = monte_carlo_totals_simulation(
        t1_projection=home_expected + (projected_total - base_total) / 2,
        t2_projection=away_expected + (projected_total - base_total) / 2,
        t1_std_dev=h_std,
        t2_std_dev=a_std,
        total_line=total_line,
        n_sims=10000,
        correlation=0.5,
    )

    print(f"  Mean Total: {mc_result['mean_total']:.1f}")
    print(f"  P(OVER):  {mc_result['p_over']*100:.1f}%")
    print(f"  P(UNDER): {mc_result['p_under']*100:.1f}%")
    print(f"  5th percentile: {mc_result['percentiles']['p5']:.1f}")
    print(f"  95th percentile: {mc_result['percentiles']['p95']:.1f}")
    print()

    # EV metrics
    print("EXPECTED VALUE & KELLY")
    print("-" * 60)

    ev_metrics = calculate_ev_metrics(
        p_over=mc_result["p_over"],
        p_under=mc_result["p_under"],
        over_odds=over_odds,
        under_odds=under_odds,
    )

    print(f"  EV OVER:  {ev_metrics['ev_over']:+.4f}")
    print(f"  EV UNDER: {ev_metrics['ev_under']:+.4f}")
    print(f"  Edge OVER:  {ev_metrics['edge_over']*100:+.2f}%")
    print(f"  Edge UNDER: {ev_metrics['edge_under']*100:+.2f}%")
    print(f"  Kelly OVER:  {ev_metrics['kelly_over_fractional']*100:.3f}%")
    print(f"  Kelly UNDER: {ev_metrics['kelly_under_fractional']*100:.3f}%")
    print()

    print("=" * 80)
    print(f"RECOMMENDATION: {ev_metrics['recommended_bet']}")
    print("=" * 80)

    await db.close()


async def main():
    if len(sys.argv) >= 3:
        team1 = sys.argv[1]
        team2 = sys.argv[2]
    else:
        team1 = "CLE"
        team2 = "ATL"

    await analyze_game(team1, team2)


if __name__ == "__main__":
    asyncio.run(main())
