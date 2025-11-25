#!/usr/bin/env python3
"""
Populate Individual Player ORTG and DRTG

Formulas:
- Individual ORTG = (PTS / Individual Possessions) * 100
  where Individual Possessions = FGA + (0.44 * FTA) + TOV
- Individual DRTG = Team DRTG (approximation without on/off data)
- Net Rating = ORTG - DRTG
"""

import os
import sys
import psycopg2
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

def calculate_individual_ortg(points, fga, fta, tov):
    """
    Individual Offensive Rating (simplified)
    ORTG = (Points / Individual Possessions) * 100
    Individual Possessions = FGA + 0.44 * FTA + TOV
    """
    possessions = fga + (0.44 * fta) + tov
    if possessions == 0:
        return None
    return (points / possessions) * 100

def populate_ortg_drtg():
    """Populate ORTG, DRTG, and Net Rating for all player advanced stats"""
    print("=" * 80)
    print("📊 POPULATING ORTG, DRTG, AND NET RATING FOR PLAYERS")
    print("=" * 80)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Count records without ORTG
        cur.execute("SELECT COUNT(*) FROM player_advanced_stats WHERE offensive_rating IS NULL")
        null_count = cur.fetchone()[0]
        print(f"📋 Found {null_count} records without ORTG/DRTG\n")

        if null_count == 0:
            print("✅ All player advanced stats already have ORTG/DRTG")
            cur.close()
            conn.close()
            return True

        # Update ORTG, DRTG, and Net Rating using a single query
        # Join with player_game_stats for individual stats and team_game_stats for team DRTG
        print("🔄 Calculating and updating ORTG, DRTG, Net Rating...")

        cur.execute("""
            WITH player_calculations AS (
                SELECT
                    pas.game_id,
                    pas.player_id,
                    -- Individual ORTG = (Points / Individual Possessions) * 100
                    CASE
                        WHEN (pgs.fg_attempted + 0.44 * pgs.ft_attempted + pgs.turnovers) > 0
                        THEN ROUND((pgs.points::numeric / (pgs.fg_attempted + 0.44 * pgs.ft_attempted + pgs.turnovers)) * 100, 2)
                        ELSE NULL
                    END as ortg,
                    -- Team DRTG for this game (approximation)
                    tgs.defensive_rating as drtg
                FROM player_advanced_stats pas
                JOIN player_game_stats pgs
                    ON pas.game_id = pgs.game_id
                    AND pas.player_id = pgs.player_id
                JOIN team_game_stats tgs
                    ON pas.game_id = tgs.game_id
                    AND pas.team_id = tgs.team_id
                WHERE pas.offensive_rating IS NULL
                  AND pgs.minutes > 0
            )
            UPDATE player_advanced_stats pas
            SET
                offensive_rating = pc.ortg,
                defensive_rating = pc.drtg,
                net_rating = CASE
                    WHEN pc.ortg IS NOT NULL AND pc.drtg IS NOT NULL
                    THEN ROUND(pc.ortg - pc.drtg, 2)
                    ELSE NULL
                END
            FROM player_calculations pc
            WHERE pas.game_id = pc.game_id
              AND pas.player_id = pc.player_id
        """)

        updated_count = cur.rowcount
        conn.commit()

        print(f"✅ Updated {updated_count} records")

        # Verify the update
        cur.execute("""
            SELECT
                COUNT(*) as total,
                COUNT(offensive_rating) as with_ortg,
                COUNT(defensive_rating) as with_drtg,
                COUNT(net_rating) as with_net,
                ROUND(AVG(offensive_rating), 1) as avg_ortg,
                ROUND(AVG(defensive_rating), 1) as avg_drtg,
                ROUND(AVG(net_rating), 1) as avg_net
            FROM player_advanced_stats
        """)
        stats = cur.fetchone()

        print(f"\n📊 Summary:")
        print(f"  • Total records: {stats[0]}")
        print(f"  • With ORTG: {stats[1]}")
        print(f"  • With DRTG: {stats[2]}")
        print(f"  • With Net Rating: {stats[3]}")
        print(f"  • Avg ORTG: {stats[4]}")
        print(f"  • Avg DRTG: {stats[5]}")
        print(f"  • Avg Net Rating: {stats[6]}")

        # Show some example data
        cur.execute("""
            SELECT
                p.full_name,
                t.abbreviation,
                pas.offensive_rating,
                pas.defensive_rating,
                pas.net_rating,
                pgs.points,
                pgs.fg_attempted,
                pgs.ft_attempted,
                pgs.turnovers
            FROM player_advanced_stats pas
            JOIN players p ON pas.player_id = p.player_id
            JOIN teams t ON pas.team_id = t.team_id
            JOIN player_game_stats pgs ON pas.game_id = pgs.game_id AND pas.player_id = pgs.player_id
            WHERE pas.offensive_rating IS NOT NULL
            ORDER BY pas.offensive_rating DESC
            LIMIT 10
        """)

        print(f"\n🏆 Top 10 ORTG Performances:")
        print("-" * 80)
        for row in cur.fetchall():
            name, team, ortg, drtg, net, pts, fga, fta, tov = row
            print(f"  {name} ({team}): ORTG={ortg}, DRTG={drtg}, Net={net} (PTS={pts}, FGA={fga}, FTA={fta}, TOV={tov})")

        cur.close()
        conn.close()

        print("\n✅ ORTG/DRTG population completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = populate_ortg_drtg()
    sys.exit(0 if success else 1)
