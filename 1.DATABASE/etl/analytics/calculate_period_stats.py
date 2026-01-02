#!/usr/bin/env python3
"""
Calculate Period Statistics (Quarter & Half Averages)

Populates:
- team_period_averages: Q1/Q2/Q3/Q4 averages by team
- team_half_averages: 1H/2H averages by team

Run after fetch_period_scores.py in daily workflow.
"""

import os
import sys
import psycopg2
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))


def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )


def calculate_team_period_averages(conn, season: str = '2025-26') -> int:
    """
    Calculate team averages for each period (Q1, Q2, Q3, Q4, OT)
    Split by HOME/AWAY/ALL location.
    """
    cur = conn.cursor()

    # Clear existing data for this season
    cur.execute("DELETE FROM team_period_averages WHERE season = %s", (season,))

    # Insert period averages with location splits
    cur.execute("""
        WITH period_data AS (
            SELECT
                ps.team_id,
                ps.period_number,
                ps.period_type,
                ps.points as team_points,
                opp_ps.points as opp_points,
                CASE
                    WHEN g.home_team_id = ps.team_id THEN 'HOME'
                    ELSE 'AWAY'
                END as location
            FROM period_scores ps
            JOIN games g ON ps.game_id = g.game_id
            JOIN period_scores opp_ps ON ps.game_id = opp_ps.game_id
                AND opp_ps.team_id != ps.team_id
                AND opp_ps.period_number = ps.period_number
                AND opp_ps.period_type = ps.period_type
            WHERE g.season = %s
        ),
        -- Calculate for each location type
        location_stats AS (
            -- HOME stats
            SELECT
                team_id, period_number, period_type, 'HOME' as location,
                COUNT(*) as games_played,
                ROUND(AVG(team_points), 2) as avg_points,
                ROUND(AVG(opp_points), 2) as avg_allowed,
                ROUND(SUM(CASE WHEN team_points > opp_points THEN 1 ELSE 0 END)::numeric / COUNT(*), 3) as period_win_pct
            FROM period_data
            WHERE location = 'HOME'
            GROUP BY team_id, period_number, period_type

            UNION ALL

            -- AWAY stats
            SELECT
                team_id, period_number, period_type, 'AWAY' as location,
                COUNT(*) as games_played,
                ROUND(AVG(team_points), 2) as avg_points,
                ROUND(AVG(opp_points), 2) as avg_allowed,
                ROUND(SUM(CASE WHEN team_points > opp_points THEN 1 ELSE 0 END)::numeric / COUNT(*), 3) as period_win_pct
            FROM period_data
            WHERE location = 'AWAY'
            GROUP BY team_id, period_number, period_type

            UNION ALL

            -- ALL (combined)
            SELECT
                team_id, period_number, period_type, 'ALL' as location,
                COUNT(*) as games_played,
                ROUND(AVG(team_points), 2) as avg_points,
                ROUND(AVG(opp_points), 2) as avg_allowed,
                ROUND(SUM(CASE WHEN team_points > opp_points THEN 1 ELSE 0 END)::numeric / COUNT(*), 3) as period_win_pct
            FROM period_data
            GROUP BY team_id, period_number, period_type
        )
        INSERT INTO team_period_averages
            (team_id, season, period_number, period_type, location, games_played, avg_points, avg_allowed, period_win_pct)
        SELECT
            team_id, %s as season, period_number, period_type, location,
            games_played, avg_points, avg_allowed, period_win_pct
        FROM location_stats
    """, (season, season))

    rows_inserted = cur.rowcount
    conn.commit()
    cur.close()

    return rows_inserted


def calculate_team_half_averages(conn, season: str = '2025-26') -> int:
    """
    Calculate team averages for each half (1H, 2H)
    Split by HOME/AWAY/ALL location.
    """
    cur = conn.cursor()

    # Clear existing data for this season
    cur.execute("DELETE FROM team_half_averages WHERE season = %s", (season,))

    # Insert half averages with location splits
    cur.execute("""
        WITH half_data AS (
            SELECT
                ps.game_id,
                ps.team_id,
                CASE WHEN ps.period_number <= 2 THEN 1 ELSE 2 END as half,
                SUM(ps.points) as team_points,
                CASE
                    WHEN g.home_team_id = ps.team_id THEN 'HOME'
                    ELSE 'AWAY'
                END as location
            FROM period_scores ps
            JOIN games g ON ps.game_id = g.game_id
            WHERE g.season = %s
              AND ps.period_type = 'Q'  -- Only regular quarters, not OT
            GROUP BY ps.game_id, ps.team_id, half, g.home_team_id
        ),
        half_with_opp AS (
            SELECT
                hd.game_id,
                hd.team_id,
                hd.half,
                hd.location,
                hd.team_points,
                opp.team_points as opp_points,
                hd.team_points + opp.team_points as total_points
            FROM half_data hd
            JOIN half_data opp ON hd.game_id = opp.game_id
                AND hd.team_id != opp.team_id
                AND hd.half = opp.half
        ),
        -- Calculate for each location type
        location_stats AS (
            -- HOME stats
            SELECT
                team_id, half, 'HOME' as location,
                COUNT(*) as games_played,
                ROUND(AVG(team_points), 2) as avg_points,
                ROUND(AVG(total_points), 2) as avg_total,
                ROUND(AVG(team_points - opp_points), 2) as avg_margin
            FROM half_with_opp
            WHERE location = 'HOME'
            GROUP BY team_id, half

            UNION ALL

            -- AWAY stats
            SELECT
                team_id, half, 'AWAY' as location,
                COUNT(*) as games_played,
                ROUND(AVG(team_points), 2) as avg_points,
                ROUND(AVG(total_points), 2) as avg_total,
                ROUND(AVG(team_points - opp_points), 2) as avg_margin
            FROM half_with_opp
            WHERE location = 'AWAY'
            GROUP BY team_id, half

            UNION ALL

            -- ALL (combined)
            SELECT
                team_id, half, 'ALL' as location,
                COUNT(*) as games_played,
                ROUND(AVG(team_points), 2) as avg_points,
                ROUND(AVG(total_points), 2) as avg_total,
                ROUND(AVG(team_points - opp_points), 2) as avg_margin
            FROM half_with_opp
            GROUP BY team_id, half
        )
        INSERT INTO team_half_averages
            (team_id, season, half, location, games_played, avg_points, avg_total, avg_margin)
        SELECT
            team_id, %s as season, half, location,
            games_played, avg_points, avg_total, avg_margin
        FROM location_stats
    """, (season, season))

    rows_inserted = cur.rowcount
    conn.commit()
    cur.close()

    return rows_inserted


def print_sample_data(conn, season: str = '2025-26'):
    """Print sample data to verify calculations"""
    cur = conn.cursor()

    print("\n📊 Sample Team Period Averages (Q1, ALL location):")
    cur.execute("""
        SELECT t.abbreviation, tpa.avg_points, tpa.avg_allowed, tpa.period_win_pct, tpa.games_played
        FROM team_period_averages tpa
        JOIN teams t ON tpa.team_id = t.team_id
        WHERE tpa.season = %s
          AND tpa.period_number = 1
          AND tpa.period_type = 'Q'
          AND tpa.location = 'ALL'
        ORDER BY tpa.avg_points DESC
        LIMIT 10
    """, (season,))

    print(f"{'Team':<6} {'Q1 Avg':<8} {'Q1 Allowed':<12} {'Win%':<8} {'Games':<6}")
    print("-" * 50)
    for row in cur.fetchall():
        print(f"{row[0]:<6} {float(row[1]):<8.1f} {float(row[2]):<12.1f} {float(row[3]):<8.3f} {row[4]:<6}")

    print("\n📊 Sample Team Half Averages (1H, ALL location):")
    cur.execute("""
        SELECT t.abbreviation, tha.avg_points, tha.avg_total, tha.avg_margin, tha.games_played
        FROM team_half_averages tha
        JOIN teams t ON tha.team_id = t.team_id
        WHERE tha.season = %s
          AND tha.half = 1
          AND tha.location = 'ALL'
        ORDER BY tha.avg_points DESC
        LIMIT 10
    """, (season,))

    print(f"{'Team':<6} {'1H Avg':<8} {'1H Total':<10} {'Margin':<8} {'Games':<6}")
    print("-" * 50)
    for row in cur.fetchall():
        print(f"{row[0]:<6} {float(row[1]):<8.1f} {float(row[2]):<10.1f} {float(row[3]):<+8.1f} {row[4]:<6}")

    cur.close()


def main():
    """Main execution function"""
    import argparse

    parser = argparse.ArgumentParser(description='Calculate period statistics')
    parser.add_argument('--season', default='2025-26', help='NBA season (default: 2025-26)')
    args = parser.parse_args()

    print("=" * 80)
    print("📊 CALCULATING PERIOD STATISTICS")
    print("=" * 80)
    print(f"Season: {args.season}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        conn = get_db_connection()
        print("✅ Connected to database\n")

        # Check if period_scores has data
        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(DISTINCT ps.game_id)
            FROM period_scores ps
            JOIN games g ON ps.game_id = g.game_id
            WHERE g.season = %s
        """, (args.season,))
        games_with_periods = cur.fetchone()[0]
        cur.close()

        if games_with_periods == 0:
            print("⚠️  No period_scores data found. Run fetch_period_scores.py first!")
            conn.close()
            return

        print(f"📋 Found period data for {games_with_periods} games\n")

        # Calculate team_period_averages
        print("🔄 Calculating team_period_averages...")
        period_rows = calculate_team_period_averages(conn, args.season)
        print(f"   ✅ Inserted {period_rows} rows into team_period_averages")

        # Calculate team_half_averages
        print("\n🔄 Calculating team_half_averages...")
        half_rows = calculate_team_half_averages(conn, args.season)
        print(f"   ✅ Inserted {half_rows} rows into team_half_averages")

        # Print sample data
        print_sample_data(conn, args.season)

        conn.close()

        print("\n" + "=" * 80)
        print(f"✅ Period statistics calculation complete!")
        print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)

    except Exception as e:
        print(f"❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
