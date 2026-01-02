#!/usr/bin/env python3
"""
Backtest NBA Totals Betting - 2022-23 Season

Simplified version using game scores directly (since we don't have team_game_stats for 2022-23).

Methods adapted for available data:
1. Season Points Average (using game scores)
2. Location-Adjusted Points (home vs away)
3. Recent Form (Last 5 Games)
4. Combined Team Average

Compares expected totals against closing lines to evaluate edge detection accuracy.
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


def get_team_season_ppg(cur, team_id, before_date, season='2022-23'):
    """Method 1: Season PPG average up to given date"""
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


def get_team_location_ppg(cur, team_id, is_home, before_date, season='2022-23'):
    """Method 2: Location-adjusted PPG (home or away only)"""
    if is_home:
        cur.execute("""
            SELECT AVG(home_team_score) as ppg
            FROM games
            WHERE home_team_id = %s
            AND season = %s
            AND game_date < %s
            AND home_team_score IS NOT NULL
        """, (team_id, season, before_date))
    else:
        cur.execute("""
            SELECT AVG(away_team_score) as ppg
            FROM games
            WHERE away_team_id = %s
            AND season = %s
            AND game_date < %s
            AND away_team_score IS NOT NULL
        """, (team_id, season, before_date))

    result = cur.fetchone()
    return float(result['ppg']) if result and result['ppg'] else None


def get_team_last_n_ppg(cur, team_id, before_date, n=5, season='2022-23'):
    """Method 3: Last N games PPG (recent form)"""
    cur.execute("""
        SELECT
            CASE WHEN home_team_id = %s THEN home_team_score ELSE away_team_score END as points
        FROM games
        WHERE (home_team_id = %s OR away_team_id = %s)
        AND season = %s
        AND game_date < %s
        AND home_team_score IS NOT NULL
        ORDER BY game_date DESC
        LIMIT %s
    """, (team_id, team_id, team_id, season, before_date, n))
    results = cur.fetchall()
    if len(results) >= 3:  # Need at least 3 games
        return sum(r['points'] for r in results) / len(results)
    return None


def get_team_points_allowed(cur, team_id, before_date, season='2022-23'):
    """Get average points allowed by team"""
    cur.execute("""
        SELECT
            AVG(CASE WHEN home_team_id = %s THEN away_team_score ELSE home_team_score END) as ppg_allowed
        FROM games
        WHERE (home_team_id = %s OR away_team_id = %s)
        AND season = %s
        AND game_date < %s
        AND home_team_score IS NOT NULL
    """, (team_id, team_id, team_id, season, before_date))
    result = cur.fetchone()
    return float(result['ppg_allowed']) if result and result['ppg_allowed'] else None


def run_backtest():
    """Run full backtest on 2022-23 season"""
    conn = get_db_connection()
    cur = conn.cursor()

    # Get all games with betting lines
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
    print(f"Analyzing {len(games)} games with closing lines\n")

    # Stats tracking
    results = {
        'strong_over': {'wins': 0, 'losses': 0, 'pushes': 0},
        'moderate_over': {'wins': 0, 'losses': 0, 'pushes': 0},
        'no_edge': {'wins': 0, 'losses': 0, 'pushes': 0},
        'moderate_under': {'wins': 0, 'losses': 0, 'pushes': 0},
        'strong_under': {'wins': 0, 'losses': 0, 'pushes': 0},
    }

    # Method agreement tracking
    method_agreement = {4: {'wins': 0, 'losses': 0, 'pushes': 0},
                        3: {'wins': 0, 'losses': 0, 'pushes': 0},
                        2: {'wins': 0, 'losses': 0, 'pushes': 0}}

    games_analyzed = 0
    skipped = 0

    # Detailed game log for analysis
    game_log = []

    for game in games:
        game_date = game['game_date']
        home_id = game['home_team_id']
        away_id = game['away_team_id']
        home = game['home_team']
        away = game['away_team']
        closing_line = float(game['closing_line'])
        actual_total = game['actual_total']

        # Skip first 2 weeks to have enough data
        if game_date < datetime(2022, 11, 1).date():
            skipped += 1
            continue

        # Calculate all 4 methods
        methods = {}

        # Method 1: Season PPG
        home_ppg = get_team_season_ppg(cur, home_id, game_date)
        away_ppg = get_team_season_ppg(cur, away_id, game_date)
        if home_ppg and away_ppg:
            methods['season_ppg'] = home_ppg + away_ppg

        # Method 2: Location PPG
        home_loc_ppg = get_team_location_ppg(cur, home_id, True, game_date)
        away_loc_ppg = get_team_location_ppg(cur, away_id, False, game_date)
        if home_loc_ppg and away_loc_ppg:
            methods['location_ppg'] = home_loc_ppg + away_loc_ppg

        # Method 3: Last 5 Games
        home_last5 = get_team_last_n_ppg(cur, home_id, game_date, 5)
        away_last5 = get_team_last_n_ppg(cur, away_id, game_date, 5)
        if home_last5 and away_last5:
            methods['last_5'] = home_last5 + away_last5

        # Method 4: Offense + Defense matchup
        home_off = get_team_season_ppg(cur, home_id, game_date)
        away_off = get_team_season_ppg(cur, away_id, game_date)
        home_def = get_team_points_allowed(cur, home_id, game_date)
        away_def = get_team_points_allowed(cur, away_id, game_date)
        if home_off and away_off and home_def and away_def:
            # Home expected = avg of home offense and away defense
            home_expected = (home_off + away_def) / 2
            away_expected = (away_off + home_def) / 2
            methods['matchup'] = home_expected + away_expected

        if len(methods) < 2:
            skipped += 1
            continue

        games_analyzed += 1

        # Calculate average expected total
        expected_total = sum(methods.values()) / len(methods)
        edge = expected_total - closing_line

        # Count method agreement on direction
        over_count = sum(1 for v in methods.values() if v > closing_line)
        under_count = sum(1 for v in methods.values() if v < closing_line)
        agreement_count = max(over_count, under_count)

        # Determine actual result
        if actual_total > closing_line:
            actual_result = 'over'
        elif actual_total < closing_line:
            actual_result = 'under'
        else:
            actual_result = 'push'

        # Classify edge signal
        if edge > 5:
            category = 'strong_over'
            predicted = 'over'
        elif edge > 2:
            category = 'moderate_over'
            predicted = 'over'
        elif edge < -5:
            category = 'strong_under'
            predicted = 'under'
        elif edge < -2:
            category = 'moderate_under'
            predicted = 'under'
        else:
            category = 'no_edge'
            predicted = None

        # Track results
        if actual_result == 'push':
            results[category]['pushes'] += 1
        elif predicted and actual_result == predicted:
            results[category]['wins'] += 1
        elif predicted and actual_result != predicted:
            results[category]['losses'] += 1
        else:
            results[category]['pushes'] += 1

        # Track method agreement
        if agreement_count >= 2:
            key = min(agreement_count, 4)
            if actual_result == 'push':
                method_agreement[key]['pushes'] += 1
            elif (over_count > under_count and actual_result == 'over') or \
                 (under_count > over_count and actual_result == 'under'):
                method_agreement[key]['wins'] += 1
            else:
                method_agreement[key]['losses'] += 1

        # Log for strong signals
        if abs(edge) > 5:
            game_log.append({
                'date': str(game_date),
                'matchup': f"{away} @ {home}",
                'line': closing_line,
                'expected': round(expected_total, 1),
                'edge': round(edge, 1),
                'actual': actual_total,
                'result': actual_result,
                'correct': (predicted == actual_result)
            })

    cur.close()
    conn.close()

    # Print results
    print("=" * 70)
    print("BACKTEST RESULTS - 2022-23 NBA SEASON (TOTALS)")
    print("=" * 70)
    print(f"\nGames analyzed: {games_analyzed}")
    print(f"Games skipped (insufficient data): {skipped}")
    print()

    print("EDGE-BASED SIGNALS (Expected Total vs Closing Line)")
    print("-" * 70)
    print(f"{'Category':<20} {'Wins':>8} {'Losses':>8} {'Pushes':>8} {'Win Rate':>12} {'ROI':>10}")
    print("-" * 70)

    total_bets = 0
    total_profit = 0

    for category, data in results.items():
        total = data['wins'] + data['losses']
        if total > 0:
            win_rate = data['wins'] / total * 100
            # Assuming -110 odds (1.91 decimal), calculate ROI
            profit = data['wins'] * 0.91 - data['losses']
            roi = profit / total * 100 if total > 0 else 0
            total_bets += total
            total_profit += profit
            print(f"{category:<20} {data['wins']:>8} {data['losses']:>8} {data['pushes']:>8} {win_rate:>11.1f}% {roi:>9.1f}%")
        else:
            print(f"{category:<20} {data['wins']:>8} {data['losses']:>8} {data['pushes']:>8} {'N/A':>12} {'N/A':>10}")

    print("-" * 70)
    if total_bets > 0:
        overall_win_rate = sum(r['wins'] for r in results.values()) / total_bets * 100
        overall_roi = total_profit / total_bets * 100
        print(f"{'OVERALL':<20} {sum(r['wins'] for r in results.values()):>8} {sum(r['losses'] for r in results.values()):>8} {sum(r['pushes'] for r in results.values()):>8} {overall_win_rate:>11.1f}% {overall_roi:>9.1f}%")
    print()

    print("METHOD AGREEMENT (Methods Agreeing on Direction)")
    print("-" * 70)
    print(f"{'Agreement':<20} {'Wins':>8} {'Losses':>8} {'Pushes':>8} {'Win Rate':>12}")
    print("-" * 70)

    for agreement in [4, 3, 2]:
        data = method_agreement[agreement]
        total = data['wins'] + data['losses']
        if total > 0:
            win_rate = data['wins'] / total * 100
            print(f"{agreement}/4 methods agree  {data['wins']:>8} {data['losses']:>8} {data['pushes']:>8} {win_rate:>11.1f}%")

    print()

    # Show strong signal examples
    if game_log:
        print("SAMPLE STRONG SIGNALS (|Edge| > 5 pts)")
        print("-" * 70)
        correct = sum(1 for g in game_log if g['correct'])
        print(f"Strong signals: {len(game_log)} | Correct: {correct} | Accuracy: {correct/len(game_log)*100:.1f}%")
        print()
        print(f"{'Date':<12} {'Matchup':<15} {'Line':>8} {'Expected':>9} {'Edge':>7} {'Actual':>7} {'Result':>8}")
        print("-" * 70)
        for g in game_log[:15]:
            mark = "✓" if g['correct'] else "✗"
            print(f"{g['date']:<12} {g['matchup']:<15} {g['line']:>8.1f} {g['expected']:>9.1f} {g['edge']:>+7.1f} {g['actual']:>7} {g['result']:>8} {mark}")

    print()
    print("INTERPRETATION:")
    print("-" * 70)
    print("- Strong signals (>5 pts edge) should show highest win rates")
    print("- 52.4%+ win rate needed to break even at -110 odds")
    print("- Method agreement correlates with confidence level")
    print("- ROI > 0% indicates profitable strategy")


if __name__ == '__main__':
    run_backtest()
