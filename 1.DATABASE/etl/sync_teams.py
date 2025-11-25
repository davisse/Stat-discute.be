#!/usr/bin/env python3
"""
Sync NBA Teams to Database
POC Script - Fetches all 30 NBA teams and inserts into database
"""

import os
import sys
import psycopg2
from nba_api.stats.static import teams
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'config', '.env'))

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )

def sync_teams():
    """Fetch all NBA teams and insert into database"""
    print("=" * 70)
    print("🏀 NBA TEAMS SYNC")
    print("=" * 70)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        # Fetch teams from NBA API
        print("📡 Fetching teams from NBA API...")
        all_teams = teams.get_teams()
        print(f"✅ Fetched {len(all_teams)} teams\n")

        # Connect to database
        print("🔌 Connecting to database...")
        conn = get_db_connection()
        cur = conn.cursor()
        print("✅ Connected\n")

        # Insert teams
        print("💾 Inserting teams into database...")
        inserted = 0
        updated = 0

        for team in all_teams:
            cur.execute("""
                INSERT INTO teams (team_id, full_name, abbreviation, nickname, city, state, year_founded)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (team_id) DO UPDATE
                SET full_name = EXCLUDED.full_name,
                    abbreviation = EXCLUDED.abbreviation,
                    nickname = EXCLUDED.nickname,
                    city = EXCLUDED.city,
                    state = EXCLUDED.state,
                    year_founded = EXCLUDED.year_founded,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING (xmax = 0) AS inserted
            """, (
                team['id'],
                team['full_name'],
                team['abbreviation'],
                team['nickname'],
                team['city'],
                team['state'],
                team['year_founded']
            ))

            result = cur.fetchone()
            if result and result[0]:
                inserted += 1
            else:
                updated += 1

            # Print progress
            print(f"  ✓ {team['abbreviation']}: {team['full_name']}")

        conn.commit()

        print(f"\n📊 Summary:")
        print(f"  • Teams inserted: {inserted}")
        print(f"  • Teams updated: {updated}")
        print(f"  • Total teams: {len(all_teams)}")

        # Verify data
        cur.execute("SELECT COUNT(*) FROM teams")
        count = cur.fetchone()[0]
        print(f"\n✅ Database verification: {count} teams in database")

        cur.close()
        conn.close()

        print("\n" + "=" * 70)
        print("✅ TEAMS SYNC COMPLETED SUCCESSFULLY")
        print("=" * 70)
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("=" * 70)
        return False

if __name__ == '__main__':
    success = sync_teams()
    sys.exit(0 if success else 1)
