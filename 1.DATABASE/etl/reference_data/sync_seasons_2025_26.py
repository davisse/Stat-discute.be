#!/usr/bin/env python3
"""
Sync NBA Seasons - Update for 2025-26
Set 2025-26 as the current active season
"""

import os
import sys
import psycopg2
from datetime import datetime, date
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

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

def update_seasons_for_2025_26():
    """Update seasons table to set 2025-26 as current"""
    print("=" * 80)
    print("🗓️  UPDATING SEASONS FOR 2025-26")
    print("=" * 80)
    print(f"Current date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Setting 2025-26 as the current active season\n")

    try:
        # Connect to database
        conn = get_db_connection()
        cur = conn.cursor()

        # Step 1: Set all seasons to not current
        print("📝 Step 1: Marking all seasons as not current...")
        cur.execute("""
            UPDATE seasons
            SET is_current = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE is_current = true
        """)
        rows_updated = cur.rowcount
        print(f"   ✅ Updated {rows_updated} season(s) to not current")

        # Step 2: Check if 2025-26 exists
        cur.execute("""
            SELECT season_id, season_year, start_date, end_date, is_current
            FROM seasons
            WHERE season_id = '2025-26'
        """)
        existing_season = cur.fetchone()

        if existing_season:
            print(f"\n📝 Step 2: Found existing 2025-26 season record")
            print(f"   • Season ID: {existing_season[0]}")
            print(f"   • Year: {existing_season[1]}")
            print(f"   • Current flag: {existing_season[4]}")

            # Update existing season
            cur.execute("""
                UPDATE seasons
                SET is_current = true,
                    start_date = %s,
                    end_date = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE season_id = '2025-26'
            """, (
                date(2025, 10, 20),  # NBA season typically starts around Oct 20
                date(2026, 6, 30)     # Through playoffs
            ))
            print("   ✅ Updated 2025-26 to current season")
        else:
            print(f"\n📝 Step 2: Creating new 2025-26 season record")

            # Insert new season
            cur.execute("""
                INSERT INTO seasons (season_id, season_year, season_type, start_date, end_date, is_current)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                '2025-26',
                2025,
                'Regular Season',
                date(2025, 10, 20),
                date(2026, 6, 30),
                True
            ))
            print("   ✅ Created 2025-26 as current season")

        # Commit changes
        conn.commit()

        # Step 3: Verify the update
        print(f"\n📝 Step 3: Verifying season status...")
        cur.execute("""
            SELECT season_id, season_type, start_date, end_date, is_current
            FROM seasons
            WHERE is_current = true OR season_id IN ('2024-25', '2025-26')
            ORDER BY season_id DESC
        """)

        seasons = cur.fetchall()
        print("\n📊 Season Status:")
        print("   Season    | Type           | Start      | End        | Current")
        print("   " + "-" * 65)
        for season in seasons:
            current_flag = "✅ CURRENT" if season[4] else "   "
            print(f"   {season[0]:<9} | {season[1]:<14} | {season[2]} | {season[3]} | {current_flag}")

        # Show summary
        cur.execute("""
            SELECT COUNT(*)
            FROM seasons
            WHERE is_current = true
        """)
        current_count = cur.fetchone()[0]

        if current_count == 1:
            print(f"\n✅ SUCCESS: 2025-26 is now the only current season")
        else:
            print(f"\n⚠️  WARNING: {current_count} seasons marked as current (should be 1)")

        # Check for games in new season
        cur.execute("""
            SELECT COUNT(*)
            FROM games
            WHERE season = '2025-26'
        """)
        game_count = cur.fetchone()[0]

        if game_count > 0:
            print(f"📊 Found {game_count} existing games for 2025-26 season")
        else:
            print(f"📊 No games loaded yet for 2025-26 season (expected for new season)")

        cur.close()
        conn.close()

        print("\n✅ Season update completed successfully!")
        print("   Next step: Run sync_season_2025_26.py to fetch games")
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = update_seasons_for_2025_26()
    sys.exit(0 if success else 1)