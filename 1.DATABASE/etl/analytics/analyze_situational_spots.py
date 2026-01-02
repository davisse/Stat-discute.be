#!/usr/bin/env python3
"""
Comprehensive NBA Situational Spots Analysis - Multi-Season (2014-2025)

Analyzes 11 seasons of data to find PERSISTENT betting patterns that
repeat year after year, indicating true market inefficiencies.

Factors Analyzed:
1. Back-to-back games (both teams, one team, neither team on B2B)
2. Rest differential (days rest difference between teams)
3. Denver altitude advantage
4. Early season variance (first 3 weeks)
5. Season timing patterns
6. Division games
7. High-scoring vs low-scoring team matchups
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from collections import defaultdict
import statistics

def get_db_connection():
    return psycopg2.connect(
        host='localhost',
        port=5432,
        database='nba_stats',
        user='chapirou',
        cursor_factory=RealDictCursor
    )


def calculate_days_rest(cur, team_id, game_date, season):
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
        return (game_date - prev_date).days - 1  # -1 because same day = 0 days rest
    return None  # First game of season


def analyze_back_to_back_patterns():
    """
    Analyze scoring patterns in back-to-back situations
    """
    print("\n" + "="*80)
    print("BACK-TO-BACK GAME ANALYSIS (2014-2025)")
    print("="*80)

    conn = get_db_connection()
    cur = conn.cursor()

    # Get all games with scores
    cur.execute("""
        SELECT
            g.game_id,
            g.game_date,
            g.season,
            g.home_team_id,
            g.away_team_id,
            g.home_team_score,
            g.away_team_score,
            (g.home_team_score + g.away_team_score) as total
        FROM games g
        WHERE g.home_team_score IS NOT NULL
        AND g.season NOT IN ('2019-20', '2020-21')  -- Exclude COVID seasons
        ORDER BY g.game_date
    """)

    games = cur.fetchall()
    print(f"Analyzing {len(games)} games...\n")

    # Track patterns by season
    patterns_by_season = defaultdict(lambda: {
        'both_b2b': [],      # Both teams on back-to-back
        'home_b2b_only': [], # Only home team on B2B
        'away_b2b_only': [], # Only away team on B2B
        'neither_b2b': [],   # Neither team on B2B
        'home_rested_away_b2b': [],  # Home rested (2+), away on B2B
        'away_rested_home_b2b': [],  # Away rested (2+), home on B2B
    })

    for game in games:
        season = game['season']
        home_rest = calculate_days_rest(cur, game['home_team_id'], game['game_date'], season)
        away_rest = calculate_days_rest(cur, game['away_team_id'], game['game_date'], season)

        if home_rest is None or away_rest is None:
            continue  # Skip first games of season

        total = game['total']

        home_b2b = home_rest == 0
        away_b2b = away_rest == 0

        if home_b2b and away_b2b:
            patterns_by_season[season]['both_b2b'].append(total)
        elif home_b2b and not away_b2b:
            patterns_by_season[season]['home_b2b_only'].append(total)
            if away_rest >= 2:
                patterns_by_season[season]['away_rested_home_b2b'].append(total)
        elif away_b2b and not home_b2b:
            patterns_by_season[season]['away_b2b_only'].append(total)
            if home_rest >= 2:
                patterns_by_season[season]['home_rested_away_b2b'].append(total)
        else:
            patterns_by_season[season]['neither_b2b'].append(total)

    cur.close()
    conn.close()

    # Aggregate results
    print("BACK-TO-BACK IMPACT ON GAME TOTALS")
    print("-"*80)
    print(f"{'Situation':<35} {'Games':>8} {'Avg Total':>12} {'vs Neither':>12}")
    print("-"*80)

    all_patterns = defaultdict(list)
    for season, patterns in patterns_by_season.items():
        for pattern, totals in patterns.items():
            all_patterns[pattern].extend(totals)

    baseline = statistics.mean(all_patterns['neither_b2b']) if all_patterns['neither_b2b'] else 0

    for pattern in ['neither_b2b', 'home_b2b_only', 'away_b2b_only', 'both_b2b',
                    'home_rested_away_b2b', 'away_rested_home_b2b']:
        totals = all_patterns[pattern]
        if totals:
            avg = statistics.mean(totals)
            diff = avg - baseline
            label = pattern.replace('_', ' ').title()
            print(f"{label:<35} {len(totals):>8} {avg:>12.1f} {diff:>+12.1f}")

    # Season-by-season consistency check
    print("\n" + "-"*80)
    print("SEASON-BY-SEASON CONSISTENCY (Away B2B vs Home Rested)")
    print("-"*80)
    print(f"{'Season':<10} {'Games':>8} {'Avg Total':>12} {'vs Baseline':>12}")
    print("-"*80)

    consistent_seasons = 0
    for season in sorted(patterns_by_season.keys()):
        totals = patterns_by_season[season]['home_rested_away_b2b']
        baseline_totals = patterns_by_season[season]['neither_b2b']
        if totals and baseline_totals:
            avg = statistics.mean(totals)
            base = statistics.mean(baseline_totals)
            diff = avg - base
            print(f"{season:<10} {len(totals):>8} {avg:>12.1f} {diff:>+12.1f}")
            if diff < -2:  # Under tendency
                consistent_seasons += 1

    print(f"\nSeasons showing UNDER tendency: {consistent_seasons}/{len(patterns_by_season)} ({consistent_seasons/len(patterns_by_season)*100:.0f}%)")

    return all_patterns


def analyze_denver_altitude():
    """
    Analyze Denver's altitude advantage - visitors playing at altitude
    """
    print("\n" + "="*80)
    print("DENVER ALTITUDE ANALYSIS (2014-2025)")
    print("="*80)

    conn = get_db_connection()
    cur = conn.cursor()

    # Get Denver team_id
    cur.execute("SELECT team_id FROM teams WHERE abbreviation = 'DEN'")
    denver_id = cur.fetchone()['team_id']

    # Denver home games vs away games
    cur.execute("""
        SELECT
            g.season,
            g.game_date,
            g.home_team_score,
            g.away_team_score,
            (g.home_team_score + g.away_team_score) as total,
            CASE WHEN g.home_team_id = %s THEN 'home' ELSE 'away' END as denver_location,
            at.abbreviation as opponent
        FROM games g
        JOIN teams at ON (
            CASE WHEN g.home_team_id = %s THEN g.away_team_id ELSE g.home_team_id END = at.team_id
        )
        WHERE (g.home_team_id = %s OR g.away_team_id = %s)
        AND g.home_team_score IS NOT NULL
        AND g.season NOT IN ('2019-20', '2020-21')
        ORDER BY g.season, g.game_date
    """, (denver_id, denver_id, denver_id, denver_id))

    games = cur.fetchall()

    # Analyze by season
    denver_home = defaultdict(list)
    denver_away = defaultdict(list)
    all_other_games = defaultdict(list)

    for game in games:
        season = game['season']
        if game['denver_location'] == 'home':
            denver_home[season].append(game['total'])
        else:
            denver_away[season].append(game['total'])

    # Get all other games for baseline
    cur.execute("""
        SELECT season, (home_team_score + away_team_score) as total
        FROM games
        WHERE home_team_id != %s AND away_team_id != %s
        AND home_team_score IS NOT NULL
        AND season NOT IN ('2019-20', '2020-21')
    """, (denver_id, denver_id))

    for row in cur.fetchall():
        all_other_games[row['season']].append(row['total'])

    cur.close()
    conn.close()

    print("-"*80)
    print(f"{'Season':<10} {'DEN Home':>12} {'DEN Away':>12} {'League Avg':>12} {'Home Diff':>12}")
    print("-"*80)

    all_home = []
    all_away = []

    for season in sorted(denver_home.keys()):
        home_avg = statistics.mean(denver_home[season]) if denver_home[season] else 0
        away_avg = statistics.mean(denver_away[season]) if denver_away[season] else 0
        league_avg = statistics.mean(all_other_games[season]) if all_other_games[season] else 0
        diff = home_avg - league_avg

        all_home.extend(denver_home[season])
        all_away.extend(denver_away[season])

        print(f"{season:<10} {home_avg:>12.1f} {away_avg:>12.1f} {league_avg:>12.1f} {diff:>+12.1f}")

    print("-"*80)
    all_league = [t for totals in all_other_games.values() for t in totals]
    print(f"{'TOTAL':<10} {statistics.mean(all_home):>12.1f} {statistics.mean(all_away):>12.1f} {statistics.mean(all_league):>12.1f} {statistics.mean(all_home) - statistics.mean(all_league):>+12.1f}")

    # First game at Denver for road teams (altitude adjustment)
    print("\n" + "-"*80)
    print("ROAD TEAM'S FIRST GAME AT DENVER (Altitude Adjustment)")
    print("-"*80)

    conn = get_db_connection()
    cur = conn.cursor()

    # This would require tracking sequences - simplified version
    cur.execute("""
        WITH denver_home AS (
            SELECT
                g.game_id,
                g.game_date,
                g.season,
                g.away_team_id as visitor_id,
                g.home_team_score + g.away_team_score as total,
                ROW_NUMBER() OVER (
                    PARTITION BY g.season, g.away_team_id
                    ORDER BY g.game_date
                ) as visit_num
            FROM games g
            WHERE g.home_team_id = %s
            AND g.home_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21')
        )
        SELECT
            visit_num,
            COUNT(*) as games,
            ROUND(AVG(total)::numeric, 1) as avg_total
        FROM denver_home
        WHERE visit_num <= 3
        GROUP BY visit_num
        ORDER BY visit_num
    """, (denver_id,))

    print(f"{'Visit #':<10} {'Games':>8} {'Avg Total':>12}")
    for row in cur.fetchall():
        print(f"Visit {row['visit_num']:<5} {row['games']:>8} {row['avg_total']:>12}")

    cur.close()
    conn.close()


def analyze_season_timing():
    """
    Analyze scoring patterns by time of season
    """
    print("\n" + "="*80)
    print("SEASON TIMING ANALYSIS (2014-2025)")
    print("="*80)

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        WITH game_periods AS (
            SELECT
                season,
                home_team_score + away_team_score as total,
                CASE
                    WHEN EXTRACT(MONTH FROM game_date) IN (10, 11) THEN 'Early (Oct-Nov)'
                    WHEN EXTRACT(MONTH FROM game_date) = 12 THEN 'December'
                    WHEN EXTRACT(MONTH FROM game_date) = 1 THEN 'January'
                    WHEN EXTRACT(MONTH FROM game_date) = 2 THEN 'February (Pre-ASB)'
                    WHEN EXTRACT(MONTH FROM game_date) IN (3, 4) THEN 'Late (Mar-Apr)'
                    ELSE 'Other'
                END as period,
                CASE
                    WHEN EXTRACT(MONTH FROM game_date) IN (10, 11) THEN 1
                    WHEN EXTRACT(MONTH FROM game_date) = 12 THEN 2
                    WHEN EXTRACT(MONTH FROM game_date) = 1 THEN 3
                    WHEN EXTRACT(MONTH FROM game_date) = 2 THEN 4
                    WHEN EXTRACT(MONTH FROM game_date) IN (3, 4) THEN 5
                    ELSE 6
                END as period_order
            FROM games
            WHERE home_team_score IS NOT NULL
            AND season NOT IN ('2019-20', '2020-21')
        )
        SELECT
            season,
            period,
            COUNT(*) as games,
            ROUND(AVG(total)::numeric, 1) as avg_total,
            ROUND(STDDEV(total)::numeric, 1) as std_total
        FROM game_periods
        GROUP BY season, period, period_order
        ORDER BY season, period_order
    """)

    results = cur.fetchall()

    # Aggregate by period
    by_period = defaultdict(list)
    for row in results:
        by_period[row['period']].append({
            'season': row['season'],
            'games': row['games'],
            'avg': float(row['avg_total']),
            'std': float(row['std_total']) if row['std_total'] else 0
        })

    print("-"*80)
    print(f"{'Period':<20} {'Games':>8} {'Avg Total':>12} {'Std Dev':>12}")
    print("-"*80)

    for period in ['Early (Oct-Nov)', 'December', 'January', 'February (Pre-ASB)', 'Late (Mar-Apr)']:
        if period in by_period:
            data = by_period[period]
            total_games = sum(d['games'] for d in data)
            weighted_avg = sum(d['avg'] * d['games'] for d in data) / total_games
            avg_std = statistics.mean(d['std'] for d in data)
            print(f"{period:<20} {total_games:>8} {weighted_avg:>12.1f} {avg_std:>12.1f}")

    cur.close()
    conn.close()

    # First 3 weeks analysis
    print("\n" + "-"*80)
    print("FIRST 3 WEEKS VS REST OF SEASON")
    print("-"*80)

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        WITH season_starts AS (
            SELECT season, MIN(game_date) as first_game
            FROM games
            WHERE home_team_score IS NOT NULL
            GROUP BY season
        ),
        game_timing AS (
            SELECT
                g.season,
                g.home_team_score + g.away_team_score as total,
                CASE
                    WHEN g.game_date <= ss.first_game + INTERVAL '21 days' THEN 'First 3 Weeks'
                    ELSE 'Rest of Season'
                END as timing
            FROM games g
            JOIN season_starts ss ON g.season = ss.season
            WHERE g.home_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21', '2025-26')
        )
        SELECT
            timing,
            COUNT(*) as games,
            ROUND(AVG(total)::numeric, 1) as avg_total,
            ROUND(STDDEV(total)::numeric, 1) as std_dev
        FROM game_timing
        GROUP BY timing
    """)

    print(f"{'Period':<20} {'Games':>8} {'Avg Total':>12} {'Std Dev':>12}")
    print("-"*60)
    for row in cur.fetchall():
        print(f"{row['timing']:<20} {row['games']:>8} {row['avg_total']:>12} {row['std_dev']:>12}")

    cur.close()
    conn.close()


def analyze_high_low_scoring_matchups():
    """
    Analyze when high-scoring teams face low-scoring teams
    """
    print("\n" + "="*80)
    print("HIGH/LOW SCORING TEAM MATCHUPS (2014-2025)")
    print("="*80)

    conn = get_db_connection()
    cur = conn.cursor()

    # Calculate rolling team averages and classify matchups
    cur.execute("""
        WITH team_season_avg AS (
            -- Calculate each team's season average total contribution
            SELECT
                t.team_id,
                g.season,
                t.abbreviation,
                AVG(CASE
                    WHEN t.team_id = g.home_team_id THEN g.home_team_score
                    ELSE g.away_team_score
                END) as avg_points_scored,
                AVG(CASE
                    WHEN t.team_id = g.home_team_id THEN g.away_team_score
                    ELSE g.home_team_score
                END) as avg_points_allowed
            FROM games g
            JOIN teams t ON t.team_id = g.home_team_id OR t.team_id = g.away_team_id
            WHERE g.home_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21')
            GROUP BY t.team_id, g.season, t.abbreviation
        ),
        team_rankings AS (
            SELECT
                *,
                avg_points_scored + avg_points_allowed as pace_proxy,
                NTILE(3) OVER (PARTITION BY season ORDER BY avg_points_scored + avg_points_allowed DESC) as pace_tier
            FROM team_season_avg
        ),
        game_matchups AS (
            SELECT
                g.game_id,
                g.season,
                g.home_team_score + g.away_team_score as total,
                ht.pace_tier as home_pace_tier,
                at.pace_tier as away_pace_tier,
                ht.pace_proxy as home_pace,
                at.pace_proxy as away_pace
            FROM games g
            JOIN team_rankings ht ON g.home_team_id = ht.team_id AND g.season = ht.season
            JOIN team_rankings at ON g.away_team_id = at.team_id AND g.season = at.season
            WHERE g.home_team_score IS NOT NULL
        )
        SELECT
            CASE
                WHEN home_pace_tier = 1 AND away_pace_tier = 1 THEN 'Both Fast (Top Third)'
                WHEN home_pace_tier = 3 AND away_pace_tier = 3 THEN 'Both Slow (Bottom Third)'
                WHEN (home_pace_tier = 1 AND away_pace_tier = 3) OR
                     (home_pace_tier = 3 AND away_pace_tier = 1) THEN 'Fast vs Slow'
                ELSE 'Mixed'
            END as matchup_type,
            COUNT(*) as games,
            ROUND(AVG(total)::numeric, 1) as avg_total,
            ROUND(STDDEV(total)::numeric, 1) as std_dev
        FROM game_matchups
        GROUP BY matchup_type
        ORDER BY avg_total DESC
    """)

    print("-"*80)
    print(f"{'Matchup Type':<25} {'Games':>8} {'Avg Total':>12} {'Std Dev':>12}")
    print("-"*80)

    for row in cur.fetchall():
        print(f"{row['matchup_type']:<25} {row['games']:>8} {row['avg_total']:>12} {row['std_dev']:>12}")

    cur.close()
    conn.close()


def analyze_division_games():
    """
    Analyze scoring in division games vs non-division
    """
    print("\n" + "="*80)
    print("DIVISION GAMES ANALYSIS (2014-2025)")
    print("="*80)

    conn = get_db_connection()
    cur = conn.cursor()

    # Division mapping
    divisions = {
        'ATL': 'Southeast', 'CHA': 'Southeast', 'MIA': 'Southeast', 'ORL': 'Southeast', 'WAS': 'Southeast',
        'BOS': 'Atlantic', 'BKN': 'Atlantic', 'NYK': 'Atlantic', 'PHI': 'Atlantic', 'TOR': 'Atlantic',
        'CHI': 'Central', 'CLE': 'Central', 'DET': 'Central', 'IND': 'Central', 'MIL': 'Central',
        'DAL': 'Southwest', 'HOU': 'Southwest', 'MEM': 'Southwest', 'NOP': 'Southwest', 'SAS': 'Southwest',
        'DEN': 'Northwest', 'MIN': 'Northwest', 'OKC': 'Northwest', 'POR': 'Northwest', 'UTA': 'Northwest',
        'GSW': 'Pacific', 'LAC': 'Pacific', 'LAL': 'Pacific', 'PHX': 'Pacific', 'SAC': 'Pacific',
    }

    cur.execute("""
        SELECT
            g.season,
            g.home_team_score + g.away_team_score as total,
            ht.abbreviation as home_team,
            at.abbreviation as away_team
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE g.home_team_score IS NOT NULL
        AND g.season NOT IN ('2019-20', '2020-21')
    """)

    division_games = []
    non_division_games = []

    for row in cur.fetchall():
        home_div = divisions.get(row['home_team'])
        away_div = divisions.get(row['away_team'])
        if home_div and away_div:
            if home_div == away_div:
                division_games.append(row['total'])
            else:
                non_division_games.append(row['total'])

    cur.close()
    conn.close()

    print("-"*80)
    print(f"{'Game Type':<25} {'Games':>8} {'Avg Total':>12} {'Difference':>12}")
    print("-"*80)

    div_avg = statistics.mean(division_games)
    non_div_avg = statistics.mean(non_division_games)

    print(f"{'Division Games':<25} {len(division_games):>8} {div_avg:>12.1f} {div_avg - non_div_avg:>+12.1f}")
    print(f"{'Non-Division Games':<25} {len(non_division_games):>8} {non_div_avg:>12.1f} {'--':>12}")


def analyze_team_specific_spots():
    """
    Find team-specific situational spots
    """
    print("\n" + "="*80)
    print("TEAM-SPECIFIC SITUATIONAL SPOTS (2014-2025)")
    print("="*80)

    conn = get_db_connection()
    cur = conn.cursor()

    # Teams with notable home/away differentials
    cur.execute("""
        SELECT
            t.abbreviation,
            COUNT(CASE WHEN t.team_id = g.home_team_id THEN 1 END) as home_games,
            ROUND(AVG(CASE WHEN t.team_id = g.home_team_id
                THEN g.home_team_score + g.away_team_score END)::numeric, 1) as home_avg_total,
            COUNT(CASE WHEN t.team_id = g.away_team_id THEN 1 END) as away_games,
            ROUND(AVG(CASE WHEN t.team_id = g.away_team_id
                THEN g.home_team_score + g.away_team_score END)::numeric, 1) as away_avg_total,
            ROUND((AVG(CASE WHEN t.team_id = g.home_team_id
                THEN g.home_team_score + g.away_team_score END) -
                AVG(CASE WHEN t.team_id = g.away_team_id
                THEN g.home_team_score + g.away_team_score END))::numeric, 1) as home_away_diff
        FROM teams t
        JOIN games g ON t.team_id = g.home_team_id OR t.team_id = g.away_team_id
        WHERE g.home_team_score IS NOT NULL
        AND g.season NOT IN ('2019-20', '2020-21')
        GROUP BY t.abbreviation
        HAVING COUNT(*) > 500
        ORDER BY home_away_diff DESC
    """)

    print("BIGGEST HOME/AWAY TOTAL DIFFERENTIALS")
    print("-"*80)
    print(f"{'Team':<6} {'Home Games':>10} {'Home Avg':>10} {'Away Games':>10} {'Away Avg':>10} {'Diff':>8}")
    print("-"*80)

    for row in cur.fetchall():
        print(f"{row['abbreviation']:<6} {row['home_games']:>10} {row['home_avg_total']:>10} {row['away_games']:>10} {row['away_avg_total']:>10} {row['home_away_diff']:>+8}")

    cur.close()
    conn.close()


def find_golden_spots():
    """
    Identify the most persistent, profitable betting spots
    """
    print("\n" + "="*80)
    print("GOLDEN BETTING SPOTS - MULTI-SEASON VALIDATION")
    print("="*80)

    conn = get_db_connection()
    cur = conn.cursor()

    print("\n1. REST ADVANTAGE SPOT (Rested Home vs B2B Visitor)")
    print("-"*80)

    # This spot: Home team with 2+ days rest vs Visitor on back-to-back
    # Expectation: Under should hit more often as visitor is fatigued
    cur.execute("""
        WITH game_rest AS (
            SELECT
                g.game_id,
                g.game_date,
                g.season,
                g.home_team_id,
                g.away_team_id,
                g.home_team_score + g.away_team_score as total,
                LAG(g.game_date) OVER (
                    PARTITION BY g.home_team_id, g.season
                    ORDER BY g.game_date
                ) as home_prev_game,
                (SELECT MAX(g2.game_date) FROM games g2
                 WHERE g2.season = g.season
                 AND (g2.home_team_id = g.away_team_id OR g2.away_team_id = g.away_team_id)
                 AND g2.game_date < g.game_date) as away_prev_game
            FROM games g
            WHERE g.home_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21', '2025-26')
        )
        SELECT
            season,
            COUNT(*) as games,
            ROUND(AVG(total)::numeric, 1) as avg_total
        FROM game_rest
        WHERE game_date - home_prev_game >= 3  -- Home has 2+ days rest
        AND game_date - away_prev_game = 1  -- Away on B2B
        GROUP BY season
        ORDER BY season
    """)

    results = cur.fetchall()
    print(f"{'Season':<10} {'Games':>8} {'Avg Total':>12}")
    print("-"*40)
    for row in results:
        print(f"{row['season']:<10} {row['games']:>8} {row['avg_total']:>12}")

    # Aggregate
    if results:
        total_games = sum(r['games'] for r in results)
        weighted_avg = sum(float(r['avg_total']) * r['games'] for r in results) / total_games
        print("-"*40)
        print(f"{'TOTAL':<10} {total_games:>8} {weighted_avg:>12.1f}")

    print("\n2. DENVER HOME vs SEA-LEVEL TEAMS (First Visit)")
    print("-"*80)

    # Get Denver's team_id
    cur.execute("SELECT team_id FROM teams WHERE abbreviation = 'DEN'")
    denver_id = cur.fetchone()['team_id']

    # Sea-level teams (East Coast + Florida)
    sea_level_teams = ['BOS', 'BKN', 'NYK', 'PHI', 'MIA', 'ORL']
    cur.execute("""
        SELECT team_id FROM teams WHERE abbreviation = ANY(%s)
    """, (sea_level_teams,))
    sea_level_ids = [r['team_id'] for r in cur.fetchall()]

    cur.execute("""
        SELECT
            g.season,
            COUNT(*) as games,
            ROUND(AVG(g.home_team_score + g.away_team_score)::numeric, 1) as avg_total
        FROM games g
        WHERE g.home_team_id = %s
        AND g.away_team_id = ANY(%s)
        AND g.home_team_score IS NOT NULL
        AND g.season NOT IN ('2019-20', '2020-21', '2025-26')
        GROUP BY g.season
        ORDER BY g.season
    """, (denver_id, sea_level_ids))

    results = cur.fetchall()
    print(f"{'Season':<10} {'Games':>8} {'Avg Total':>12}")
    print("-"*40)
    for row in results:
        print(f"{row['season']:<10} {row['games']:>8} {row['avg_total']:>12}")

    print("\n3. BOTH TEAMS ON BACK-TO-BACK")
    print("-"*80)

    cur.execute("""
        WITH b2b_games AS (
            SELECT
                g.game_id,
                g.game_date,
                g.season,
                g.home_team_score + g.away_team_score as total,
                (SELECT MAX(g2.game_date) FROM games g2
                 WHERE g2.season = g.season
                 AND (g2.home_team_id = g.home_team_id OR g2.away_team_id = g.home_team_id)
                 AND g2.game_date < g.game_date) as home_prev,
                (SELECT MAX(g2.game_date) FROM games g2
                 WHERE g2.season = g.season
                 AND (g2.home_team_id = g.away_team_id OR g2.away_team_id = g.away_team_id)
                 AND g2.game_date < g.game_date) as away_prev
            FROM games g
            WHERE g.home_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21', '2025-26')
        )
        SELECT
            season,
            COUNT(*) as games,
            ROUND(AVG(total)::numeric, 1) as avg_total
        FROM b2b_games
        WHERE game_date - home_prev = 1
        AND game_date - away_prev = 1
        GROUP BY season
        ORDER BY season
    """)

    results = cur.fetchall()
    print(f"{'Season':<10} {'Games':>8} {'Avg Total':>12}")
    print("-"*40)
    for row in results:
        print(f"{row['season']:<10} {row['games']:>8} {row['avg_total']:>12}")

    cur.close()
    conn.close()


def main():
    """Run all analyses"""
    print("="*80)
    print("NBA SITUATIONAL SPOTS ANALYSIS - MULTI-SEASON (2014-2025)")
    print("Finding PERSISTENT patterns across 11 seasons of data")
    print("="*80)

    analyze_back_to_back_patterns()
    analyze_denver_altitude()
    analyze_season_timing()
    analyze_high_low_scoring_matchups()
    analyze_division_games()
    analyze_team_specific_spots()
    find_golden_spots()

    print("\n" + "="*80)
    print("ANALYSIS COMPLETE")
    print("="*80)


if __name__ == '__main__':
    main()
