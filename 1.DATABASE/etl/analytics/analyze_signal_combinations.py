#!/usr/bin/env python3
"""
Granular Signal Combination Analysis

Analyzes specific adjustment combinations to find profitable betting spots.
Focuses on:
1. Where do models agree vs disagree?
2. Which specific combinations hit more often?
3. Are there profitable niches within the data?
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from collections import defaultdict


def get_db_connection():
    return psycopg2.connect(
        host='localhost',
        port=5432,
        database='nba_stats',
        user='chapirou',
        cursor_factory=RealDictCursor
    )


def calculate_days_rest(cur, team_id, game_date, season='2022-23'):
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


def get_team_pace_tier(cur, team_id, before_date, season='2022-23'):
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
        return 2
    avg = float(result['avg_total'])
    if avg >= 235:
        return 1
    elif avg <= 225:
        return 3
    return 2


def get_team_season_ppg(cur, team_id, before_date, season='2022-23'):
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


def is_early_season(game_date):
    season_start = datetime(2022, 10, 18).date()
    if isinstance(game_date, datetime):
        game_date = game_date.date()
    return (game_date - season_start).days <= 21


def analyze_combinations():
    """Analyze specific signal combinations"""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            g.game_id,
            g.game_date,
            g.home_team_id,
            g.away_team_id,
            ht.abbreviation as home_team,
            at.abbreviation as away_team,
            g.home_team_score,
            g.away_team_score,
            (g.home_team_score + g.away_team_score) as actual_total,
            bo.handicap as closing_line
        FROM betting_events be
        JOIN games g ON be.game_id = g.game_id
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        JOIN betting_markets bm ON be.event_id = bm.event_id AND bm.market_key = '0_game_total'
        JOIN betting_odds bo ON bm.market_id = bo.market_id AND bo.selection = 'Over'
        WHERE g.season = '2022-23'
        AND be.bookmaker = 'sportsbookreviewsonline'
        ORDER BY g.game_date
    """)

    games = cur.fetchall()
    print(f"Analyzing {len(games)} games\n")

    # Track by combination
    combo_results = defaultdict(lambda: {'over_wins': 0, 'under_wins': 0, 'over_losses': 0, 'under_losses': 0, 'edge_sum': 0})

    # Track by edge size relative to line movement
    edge_buckets = defaultdict(lambda: {'wins': 0, 'losses': 0})

    # Track where simple and enhanced disagree
    disagreement_results = {'simple_correct': 0, 'enhanced_correct': 0, 'both_correct': 0, 'both_wrong': 0}

    for game in games:
        game_date = game['game_date']
        home_id = game['home_team_id']
        away_id = game['away_team_id']
        closing_line = float(game['closing_line'])
        actual_total = game['actual_total']

        if game_date < datetime(2022, 11, 1).date():
            continue

        home_ppg = get_team_season_ppg(cur, home_id, game_date)
        away_ppg = get_team_season_ppg(cur, away_id, game_date)

        if not home_ppg or not away_ppg:
            continue

        # Calculate adjustments
        adjustments = []

        home_rest = calculate_days_rest(cur, home_id, game_date)
        away_rest = calculate_days_rest(cur, away_id, game_date)

        b2b_adj = 0
        if home_rest is not None and away_rest is not None:
            home_b2b = home_rest == 0
            away_b2b = away_rest == 0

            if home_b2b and away_b2b:
                adjustments.append('both_b2b')
                b2b_adj = -3.4
            elif away_b2b and not home_b2b:
                adjustments.append('away_b2b')
                b2b_adj = -2.7
            elif home_b2b and not away_b2b:
                adjustments.append('home_b2b')
                b2b_adj = 0.5

        home_pace = get_team_pace_tier(cur, home_id, game_date)
        away_pace = get_team_pace_tier(cur, away_id, game_date)

        pace_adj = 0
        if home_pace == 1 and away_pace == 1:
            adjustments.append('both_fast')
            pace_adj = 3.0
        elif home_pace == 3 and away_pace == 3:
            adjustments.append('both_slow')
            pace_adj = -3.0

        early_adj = 0
        if is_early_season(game_date):
            adjustments.append('early_season')
            early_adj = -2.0

        # Calculate edges
        simple_expected = home_ppg + away_ppg
        simple_edge = simple_expected - closing_line

        total_adj = b2b_adj + pace_adj + early_adj
        enhanced_expected = simple_expected + total_adj
        enhanced_edge = enhanced_expected - closing_line

        # Result
        if actual_total > closing_line:
            result = 'over'
        elif actual_total < closing_line:
            result = 'under'
        else:
            continue

        # Simple prediction
        if simple_edge > 2:
            simple_pred = 'over'
        elif simple_edge < -2:
            simple_pred = 'under'
        else:
            simple_pred = None

        # Enhanced prediction
        if enhanced_edge > 2:
            enhanced_pred = 'over'
        elif enhanced_edge < -2:
            enhanced_pred = 'under'
        else:
            enhanced_pred = None

        # Track combination results
        combo_key = tuple(sorted(adjustments)) if adjustments else ('no_adjustment',)

        if enhanced_pred:
            if enhanced_pred == 'over':
                if result == 'over':
                    combo_results[combo_key]['over_wins'] += 1
                else:
                    combo_results[combo_key]['over_losses'] += 1
            else:
                if result == 'under':
                    combo_results[combo_key]['under_wins'] += 1
                else:
                    combo_results[combo_key]['under_losses'] += 1
            combo_results[combo_key]['edge_sum'] += abs(enhanced_edge)

        # Track disagreements
        if simple_pred and enhanced_pred and simple_pred != enhanced_pred:
            simple_correct = simple_pred == result
            enhanced_correct = enhanced_pred == result
            if simple_correct and not enhanced_correct:
                disagreement_results['simple_correct'] += 1
            elif enhanced_correct and not simple_correct:
                disagreement_results['enhanced_correct'] += 1
            elif simple_correct and enhanced_correct:
                disagreement_results['both_correct'] += 1
            else:
                disagreement_results['both_wrong'] += 1

        # Track by edge bucket
        edge_bucket = int(abs(enhanced_edge))
        if enhanced_pred:
            if enhanced_pred == result:
                edge_buckets[edge_bucket]['wins'] += 1
            else:
                edge_buckets[edge_bucket]['losses'] += 1

    cur.close()
    conn.close()

    # Print results
    print("=" * 80)
    print("SIGNAL COMBINATION ANALYSIS")
    print("=" * 80)

    print("\nRESULTS BY ADJUSTMENT COMBINATION:")
    print("-" * 80)
    print(f"{'Combination':<40} {'O Win':>6} {'O Loss':>6} {'U Win':>6} {'U Loss':>6} {'Win%':>7} {'ROI':>7}")
    print("-" * 80)

    for combo, data in sorted(combo_results.items(), key=lambda x: -(x[1]['over_wins'] + x[1]['under_wins'])):
        total_bets = data['over_wins'] + data['over_losses'] + data['under_wins'] + data['under_losses']
        if total_bets < 5:
            continue
        total_wins = data['over_wins'] + data['under_wins']
        win_rate = total_wins / total_bets * 100 if total_bets > 0 else 0
        profit = total_wins * 0.91 - (total_bets - total_wins)
        roi = profit / total_bets * 100 if total_bets > 0 else 0

        combo_str = '+'.join(combo)[:38]
        print(f"{combo_str:<40} {data['over_wins']:>6} {data['over_losses']:>6} {data['under_wins']:>6} {data['under_losses']:>6} {win_rate:>6.1f}% {roi:>+6.1f}%")

    print("\n" + "=" * 80)
    print("RESULTS BY EDGE SIZE (Enhanced Model)")
    print("=" * 80)
    print(f"{'Edge Range':<20} {'Wins':>8} {'Losses':>8} {'Total':>8} {'Win%':>8} {'ROI':>8}")
    print("-" * 60)

    for edge in sorted(edge_buckets.keys()):
        data = edge_buckets[edge]
        total = data['wins'] + data['losses']
        if total < 10:
            continue
        win_rate = data['wins'] / total * 100
        profit = data['wins'] * 0.91 - data['losses']
        roi = profit / total * 100
        print(f"{edge}-{edge+1} pts       {data['wins']:>8} {data['losses']:>8} {total:>8} {win_rate:>7.1f}% {roi:>+7.1f}%")

    print("\n" + "=" * 80)
    print("MODEL DISAGREEMENT ANALYSIS")
    print("=" * 80)
    print("When simple and enhanced models predict different outcomes:")
    print(f"  Simple model correct: {disagreement_results['simple_correct']}")
    print(f"  Enhanced model correct: {disagreement_results['enhanced_correct']}")
    print(f"  Both correct (push moved result): N/A")
    print(f"  Both wrong: {disagreement_results['both_wrong']}")

    total_disagree = disagreement_results['simple_correct'] + disagreement_results['enhanced_correct'] + disagreement_results['both_wrong']
    if total_disagree > 0:
        print(f"\nIn disagreements, enhanced model is correct: {disagreement_results['enhanced_correct']}/{total_disagree} ({disagreement_results['enhanced_correct']/total_disagree*100:.1f}%)")

    print("\n" + "=" * 80)
    print("KEY INSIGHTS:")
    print("-" * 80)
    print("1. Look for combinations with >52.4% win rate (break-even)")
    print("2. Larger edges don't necessarily mean higher accuracy")
    print("3. When models disagree, which tends to be right?")
    print("4. Profitable combinations may exist in niche situations")


if __name__ == '__main__':
    analyze_combinations()
