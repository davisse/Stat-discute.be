#!/usr/bin/env python3
"""
Generate Situational Trends
Analyze O/U results by game situation to identify profitable betting patterns
"""

import os
import sys
import json
import psycopg2
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))

# Constants
DENVER_TEAM_ID = 1610612743  # Denver Nuggets
MIN_SAMPLE_SIZE = 20  # Minimum games for statistical significance
PROFITABLE_THRESHOLD_UPPER = 0.55  # > 55% hit rate
PROFITABLE_THRESHOLD_LOWER = 0.45  # < 45% hit rate


def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )


def analyze_both_b2b_games(cur, season: Optional[str] = None) -> Dict:
    """
    Analyze games where both teams are on back-to-back
    Expected: UNDER tendency due to fatigue
    """
    season_filter = f"AND g.season = '{season}'" if season else ""

    query = f"""
        WITH team_rest AS (
            SELECT
                g.game_id,
                g.home_team_id,
                g.away_team_id,
                g.game_date,
                -- Days since last home team game
                (g.game_date - LAG(g.game_date) OVER (
                    PARTITION BY CASE WHEN g.home_team_id = team_id THEN g.home_team_id END
                    ORDER BY g.game_date
                )) as home_rest_days,
                -- Days since last away team game
                (g.game_date - LAG(g.game_date) OVER (
                    PARTITION BY CASE WHEN g.away_team_id = team_id THEN g.away_team_id END
                    ORDER BY g.game_date
                )) as away_rest_days
            FROM games g
            CROSS JOIN (SELECT DISTINCT team_id FROM teams) t
            WHERE g.game_status = 'Final'
            {season_filter}
        )
        SELECT
            COUNT(*) as total_games,
            SUM(CASE WHEN gor.game_total_result = 'OVER' THEN 1 ELSE 0 END) as overs,
            SUM(CASE WHEN gor.game_total_result = 'UNDER' THEN 1 ELSE 0 END) as unders,
            SUM(CASE WHEN gor.game_total_result = 'PUSH' THEN 1 ELSE 0 END) as pushes,
            AVG(gor.game_total_margin) as avg_margin,
            AVG(gor.actual_total) as avg_actual_total,
            AVG(gor.game_total_line) as avg_line
        FROM team_rest tr
        JOIN games g ON tr.game_id = g.game_id
        JOIN game_ou_results gor ON g.game_id = gor.game_id
        WHERE tr.home_rest_days = 1
        AND tr.away_rest_days = 1
    """

    cur.execute(query)
    result = cur.fetchone()

    if not result or result[0] == 0:
        return {'error': 'No data found'}

    total, overs, unders, pushes, avg_margin, avg_actual, avg_line = result

    over_pct = overs / (overs + unders) if (overs + unders) > 0 else 0
    under_pct = unders / (overs + unders) if (overs + unders) > 0 else 0

    return {
        'situation': 'both_b2b',
        'description': 'Both teams on back-to-back',
        'total_games': total,
        'overs': overs,
        'unders': unders,
        'pushes': pushes,
        'over_pct': round(over_pct, 3),
        'under_pct': round(under_pct, 3),
        'avg_margin': round(float(avg_margin), 1),
        'avg_actual_total': round(float(avg_actual), 1),
        'avg_line': round(float(avg_line), 1),
        'expected_trend': 'UNDER',
        'is_profitable': under_pct >= PROFITABLE_THRESHOLD_UPPER,
        'is_significant': total >= MIN_SAMPLE_SIZE
    }


def analyze_division_games(cur, season: Optional[str] = None) -> Dict:
    """
    Analyze division rivalry games
    Expected: UNDER tendency due to familiarity
    """
    season_filter = f"AND g.season = '{season}'" if season else ""

    query = f"""
        SELECT
            COUNT(*) as total_games,
            SUM(CASE WHEN gor.game_total_result = 'OVER' THEN 1 ELSE 0 END) as overs,
            SUM(CASE WHEN gor.game_total_result = 'UNDER' THEN 1 ELSE 0 END) as unders,
            SUM(CASE WHEN gor.game_total_result = 'PUSH' THEN 1 ELSE 0 END) as pushes,
            AVG(gor.game_total_margin) as avg_margin,
            AVG(gor.actual_total) as avg_actual_total,
            AVG(gor.game_total_line) as avg_line
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        JOIN game_ou_results gor ON g.game_id = gor.game_id
        WHERE ht.division = at.division
        AND g.game_status = 'Final'
        {season_filter}
    """

    cur.execute(query)
    result = cur.fetchone()

    if not result or result[0] == 0:
        return {'error': 'No data found'}

    total, overs, unders, pushes, avg_margin, avg_actual, avg_line = result

    over_pct = overs / (overs + unders) if (overs + unders) > 0 else 0
    under_pct = unders / (overs + unders) if (overs + unders) > 0 else 0

    return {
        'situation': 'division_rivalry',
        'description': 'Division game',
        'total_games': total,
        'overs': overs,
        'unders': unders,
        'pushes': pushes,
        'over_pct': round(over_pct, 3),
        'under_pct': round(under_pct, 3),
        'avg_margin': round(float(avg_margin), 1),
        'avg_actual_total': round(float(avg_actual), 1),
        'avg_line': round(float(avg_line), 1),
        'expected_trend': 'UNDER',
        'is_profitable': under_pct >= PROFITABLE_THRESHOLD_UPPER,
        'is_significant': total >= MIN_SAMPLE_SIZE
    }


def analyze_high_pace_matchups(cur, season: Optional[str] = None) -> Dict:
    """
    Analyze games where both teams are top-10 in pace
    Expected: OVER tendency due to more possessions
    """
    season_filter = f"AND g.season = '{season}'" if season else ""

    query = f"""
        WITH team_pace_ranks AS (
            SELECT
                tgs.team_id,
                g.season,
                AVG(tgs.pace) as avg_pace,
                RANK() OVER (PARTITION BY g.season ORDER BY AVG(tgs.pace) DESC) as pace_rank
            FROM team_game_stats tgs
            JOIN games g ON tgs.game_id = g.game_id
            WHERE g.game_status = 'Final'
            {season_filter}
            GROUP BY tgs.team_id, g.season
        )
        SELECT
            COUNT(*) as total_games,
            SUM(CASE WHEN gor.game_total_result = 'OVER' THEN 1 ELSE 0 END) as overs,
            SUM(CASE WHEN gor.game_total_result = 'UNDER' THEN 1 ELSE 0 END) as unders,
            SUM(CASE WHEN gor.game_total_result = 'PUSH' THEN 1 ELSE 0 END) as pushes,
            AVG(gor.game_total_margin) as avg_margin,
            AVG(gor.actual_total) as avg_actual_total,
            AVG(gor.game_total_line) as avg_line
        FROM games g
        JOIN team_pace_ranks hpr ON g.home_team_id = hpr.team_id AND g.season = hpr.season
        JOIN team_pace_ranks apr ON g.away_team_id = apr.team_id AND g.season = apr.season
        JOIN game_ou_results gor ON g.game_id = gor.game_id
        WHERE hpr.pace_rank <= 10
        AND apr.pace_rank <= 10
        AND g.game_status = 'Final'
    """

    cur.execute(query)
    result = cur.fetchone()

    if not result or result[0] == 0:
        return {'error': 'No data found'}

    total, overs, unders, pushes, avg_margin, avg_actual, avg_line = result

    over_pct = overs / (overs + unders) if (overs + unders) > 0 else 0
    under_pct = unders / (overs + unders) if (overs + unders) > 0 else 0

    return {
        'situation': 'high_pace_matchup',
        'description': 'Both teams top-10 pace',
        'total_games': total,
        'overs': overs,
        'unders': unders,
        'pushes': pushes,
        'over_pct': round(over_pct, 3),
        'under_pct': round(under_pct, 3),
        'avg_margin': round(float(avg_margin), 1),
        'avg_actual_total': round(float(avg_actual), 1),
        'avg_line': round(float(avg_line), 1),
        'expected_trend': 'OVER',
        'is_profitable': over_pct >= PROFITABLE_THRESHOLD_UPPER,
        'is_significant': total >= MIN_SAMPLE_SIZE
    }


def analyze_elite_defense_matchups(cur, season: Optional[str] = None) -> Dict:
    """
    Analyze games with at least one top-5 defensive team
    Expected: UNDER tendency due to elite defense
    """
    season_filter = f"AND g.season = '{season}'" if season else ""

    query = f"""
        WITH team_drtg_ranks AS (
            SELECT
                tgs.team_id,
                g.season,
                AVG(tgs.defensive_rating) as avg_drtg,
                RANK() OVER (PARTITION BY g.season ORDER BY AVG(tgs.defensive_rating) ASC) as drtg_rank
            FROM team_game_stats tgs
            JOIN games g ON tgs.game_id = g.game_id
            WHERE g.game_status = 'Final'
            {season_filter}
            GROUP BY tgs.team_id, g.season
        )
        SELECT
            COUNT(*) as total_games,
            SUM(CASE WHEN gor.game_total_result = 'OVER' THEN 1 ELSE 0 END) as overs,
            SUM(CASE WHEN gor.game_total_result = 'UNDER' THEN 1 ELSE 0 END) as unders,
            SUM(CASE WHEN gor.game_total_result = 'PUSH' THEN 1 ELSE 0 END) as pushes,
            AVG(gor.game_total_margin) as avg_margin,
            AVG(gor.actual_total) as avg_actual_total,
            AVG(gor.game_total_line) as avg_line
        FROM games g
        JOIN team_drtg_ranks hdr ON g.home_team_id = hdr.team_id AND g.season = hdr.season
        JOIN team_drtg_ranks adr ON g.away_team_id = adr.team_id AND g.season = adr.season
        JOIN game_ou_results gor ON g.game_id = gor.game_id
        WHERE (hdr.drtg_rank <= 5 OR adr.drtg_rank <= 5)
        AND g.game_status = 'Final'
    """

    cur.execute(query)
    result = cur.fetchone()

    if not result or result[0] == 0:
        return {'error': 'No data found'}

    total, overs, unders, pushes, avg_margin, avg_actual, avg_line = result

    over_pct = overs / (overs + unders) if (overs + unders) > 0 else 0
    under_pct = unders / (overs + unders) if (overs + unders) > 0 else 0

    return {
        'situation': 'elite_defense',
        'description': 'At least one top-5 defensive team',
        'total_games': total,
        'overs': overs,
        'unders': unders,
        'pushes': pushes,
        'over_pct': round(over_pct, 3),
        'under_pct': round(under_pct, 3),
        'avg_margin': round(float(avg_margin), 1),
        'avg_actual_total': round(float(avg_actual), 1),
        'avg_line': round(float(avg_line), 1),
        'expected_trend': 'UNDER',
        'is_profitable': under_pct >= PROFITABLE_THRESHOLD_UPPER,
        'is_significant': total >= MIN_SAMPLE_SIZE
    }


def analyze_altitude_games(cur, season: Optional[str] = None) -> Dict:
    """
    Analyze games in Denver (altitude factor)
    Expected: OVER tendency
    """
    season_filter = f"AND g.season = '{season}'" if season else ""

    query = f"""
        SELECT
            COUNT(*) as total_games,
            SUM(CASE WHEN gor.game_total_result = 'OVER' THEN 1 ELSE 0 END) as overs,
            SUM(CASE WHEN gor.game_total_result = 'UNDER' THEN 1 ELSE 0 END) as unders,
            SUM(CASE WHEN gor.game_total_result = 'PUSH' THEN 1 ELSE 0 END) as pushes,
            AVG(gor.game_total_margin) as avg_margin,
            AVG(gor.actual_total) as avg_actual_total,
            AVG(gor.game_total_line) as avg_line
        FROM games g
        JOIN game_ou_results gor ON g.game_id = gor.game_id
        WHERE g.home_team_id = {DENVER_TEAM_ID}
        AND g.game_status = 'Final'
        {season_filter}
    """

    cur.execute(query)
    result = cur.fetchone()

    if not result or result[0] == 0:
        return {'error': 'No data found'}

    total, overs, unders, pushes, avg_margin, avg_actual, avg_line = result

    over_pct = overs / (overs + unders) if (overs + unders) > 0 else 0
    under_pct = unders / (overs + unders) if (overs + unders) > 0 else 0

    return {
        'situation': 'altitude_game',
        'description': 'Game in Denver',
        'total_games': total,
        'overs': overs,
        'unders': unders,
        'pushes': pushes,
        'over_pct': round(over_pct, 3),
        'under_pct': round(under_pct, 3),
        'avg_margin': round(float(avg_margin), 1),
        'avg_actual_total': round(float(avg_actual), 1),
        'avg_line': round(float(avg_line), 1),
        'expected_trend': 'OVER',
        'is_profitable': over_pct >= PROFITABLE_THRESHOLD_UPPER,
        'is_significant': total >= MIN_SAMPLE_SIZE
    }


def analyze_road_after_loss(cur, season: Optional[str] = None) -> Dict:
    """
    Analyze road team coming off a loss
    Expected: OVER tendency due to urgency/faster pace
    """
    season_filter = f"AND g.season = '{season}'" if season else ""

    query = f"""
        WITH last_game_results AS (
            SELECT
                g.game_id,
                g.away_team_id,
                g.game_date,
                LAG(CASE
                    WHEN g.home_team_id = g.away_team_id THEN
                        CASE WHEN g.home_team_score > g.away_team_score THEN 'W' ELSE 'L' END
                    ELSE
                        CASE WHEN g.away_team_score > g.home_team_score THEN 'W' ELSE 'L' END
                END) OVER (PARTITION BY g.away_team_id ORDER BY g.game_date) as last_result
            FROM games g
            WHERE g.game_status = 'Final'
            {season_filter}
        )
        SELECT
            COUNT(*) as total_games,
            SUM(CASE WHEN gor.game_total_result = 'OVER' THEN 1 ELSE 0 END) as overs,
            SUM(CASE WHEN gor.game_total_result = 'UNDER' THEN 1 ELSE 0 END) as unders,
            SUM(CASE WHEN gor.game_total_result = 'PUSH' THEN 1 ELSE 0 END) as pushes,
            AVG(gor.game_total_margin) as avg_margin,
            AVG(gor.actual_total) as avg_actual_total,
            AVG(gor.game_total_line) as avg_line
        FROM last_game_results lgr
        JOIN games g ON lgr.game_id = g.game_id
        JOIN game_ou_results gor ON g.game_id = gor.game_id
        WHERE lgr.last_result = 'L'
    """

    cur.execute(query)
    result = cur.fetchone()

    if not result or result[0] == 0:
        return {'error': 'No data found'}

    total, overs, unders, pushes, avg_margin, avg_actual, avg_line = result

    over_pct = overs / (overs + unders) if (overs + unders) > 0 else 0
    under_pct = unders / (overs + unders) if (overs + unders) > 0 else 0

    return {
        'situation': 'road_after_loss',
        'description': 'Road team coming off loss',
        'total_games': total,
        'overs': overs,
        'unders': unders,
        'pushes': pushes,
        'over_pct': round(over_pct, 3),
        'under_pct': round(under_pct, 3),
        'avg_margin': round(float(avg_margin), 1),
        'avg_actual_total': round(float(avg_actual), 1),
        'avg_line': round(float(avg_line), 1),
        'expected_trend': 'OVER',
        'is_profitable': over_pct >= PROFITABLE_THRESHOLD_UPPER,
        'is_significant': total >= MIN_SAMPLE_SIZE
    }


def generate_all_situational_trends(season: Optional[str] = None):
    """
    Generate all situational trend analyses
    """
    print("=" * 80)
    print("📈 GENERATING SITUATIONAL TRENDS")
    print("=" * 80)
    if season:
        print(f"Season: {season}\n")

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        analyses = []

        # Run all analyses
        print("1. Analyzing both teams on back-to-back...")
        analyses.append(analyze_both_b2b_games(cur, season))

        print("2. Analyzing division rivalry games...")
        analyses.append(analyze_division_games(cur, season))

        print("3. Analyzing high-pace matchups...")
        analyses.append(analyze_high_pace_matchups(cur, season))

        print("4. Analyzing elite defense matchups...")
        analyses.append(analyze_elite_defense_matchups(cur, season))

        print("5. Analyzing altitude games (Denver)...")
        analyses.append(analyze_altitude_games(cur, season))

        print("6. Analyzing road team after loss...")
        analyses.append(analyze_road_after_loss(cur, season))

        # Filter out errors
        valid_analyses = [a for a in analyses if 'error' not in a]

        print("\n" + "=" * 80)
        print("📊 SITUATIONAL TRENDS SUMMARY")
        print("=" * 80)

        for analysis in valid_analyses:
            print(f"\n{analysis['description']}")
            print(f"  Games: {analysis['total_games']} | Expected: {analysis['expected_trend']}")
            print(f"  Over: {analysis['over_pct']:.1%} | Under: {analysis['under_pct']:.1%}")
            print(f"  Avg Margin: {analysis['avg_margin']:+.1f}")

            if analysis['is_significant']:
                if analysis['is_profitable']:
                    direction = "OVER" if analysis['expected_trend'] == 'OVER' and analysis['over_pct'] >= PROFITABLE_THRESHOLD_UPPER else "UNDER"
                    print(f"  ✅ PROFITABLE: {direction} hits at {max(analysis['over_pct'], analysis['under_pct']):.1%}")
                else:
                    print(f"  ⚠️  Not profitable (hit rate below threshold)")
            else:
                print(f"  ⚠️  Sample size too small (< {MIN_SAMPLE_SIZE} games)")

        # Identify most profitable situations
        profitable = [a for a in valid_analyses if a['is_profitable'] and a['is_significant']]

        if profitable:
            print("\n" + "=" * 80)
            print("💰 MOST PROFITABLE SITUATIONS")
            print("=" * 80)
            for trend in sorted(profitable, key=lambda x: max(x['over_pct'], x['under_pct']), reverse=True):
                direction = "OVER" if trend['over_pct'] > trend['under_pct'] else "UNDER"
                hit_rate = max(trend['over_pct'], trend['under_pct'])
                print(f"\n  {trend['description']}")
                print(f"    Bet: {direction} | Hit Rate: {hit_rate:.1%} | Avg Margin: {trend['avg_margin']:+.1f}")
                print(f"    Sample: {trend['total_games']} games")

        cur.close()
        conn.close()

        print("\n✅ Situational trends analysis completed successfully!")

        return {
            'season': season or 'all',
            'trends': valid_analyses,
            'profitable_situations': profitable,
            'generated_at': datetime.now().isoformat()
        }

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == '__main__':
    # Allow optional season filter as command-line argument
    season = sys.argv[1] if len(sys.argv) > 1 else None
    results = generate_all_situational_trends(season)

    if results:
        # Save to JSON file
        output_file = os.path.join(
            os.path.dirname(__file__),
            '..',
            '..',
            'data',
            f'situational_trends_{results["season"]}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        )
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n💾 Saved to: {output_file}")

    sys.exit(0 if results else 1)
