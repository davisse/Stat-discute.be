#!/usr/bin/env python3
"""
Sync NBA Seasons
Populate seasons table with historical and current season data
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

def generate_seasons():
    """
    Generate NBA seasons from 2020 to current + 1
    NBA season format: YYYY-YY (e.g., 2024-25)
    Regular season typically: October to April
    NOTE: Only creating Regular Season entries since season_id is primary key
    """
    current_year = datetime.now().year
    current_month = datetime.now().month

    # If we're past October, current season is this year, otherwise it's last year
    if current_month >= 10:
        current_season_start = current_year
    else:
        current_season_start = current_year - 1

    seasons = []

    # Generate seasons from 2020-21 to current + 1
    for year in range(2020, current_season_start + 2):
        next_year = year + 1
        season_id = f"{year}-{str(next_year)[-2:]}"

        # Regular Season only (season_id is primary key, can't have duplicates)
        seasons.append({
            'season_id': season_id,
            'season_year': year,
            'season_type': 'Regular Season',
            'start_date': date(year, 10, 1),
            'end_date': date(next_year, 6, 30),  # Includes playoffs
            'is_current': (year == current_season_start)
        })

    return seasons

def sync_seasons():
    """Insert or update seasons in database"""
    print("=" * 80)
    print("🗓️  SYNCING NBA SEASONS")
    print("=" * 80)

    try:
        # Generate seasons
        seasons = generate_seasons()
        print(f"✅ Generated {len(seasons)} season records")

        # Connect to database
        conn = get_db_connection()
        cur = conn.cursor()

        inserted = 0
        updated = 0

        for season in seasons:
            cur.execute("""
                INSERT INTO seasons (season_id, season_year, season_type, start_date, end_date, is_current)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (season_id)
                DO UPDATE
                SET start_date = EXCLUDED.start_date,
                    end_date = EXCLUDED.end_date,
                    is_current = EXCLUDED.is_current,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING (xmax = 0) AS inserted
            """, (
                season['season_id'],
                season['season_year'],
                season['season_type'],
                season['start_date'],
                season['end_date'],
                season['is_current']
            ))

            result = cur.fetchone()
            if result and result[0]:
                inserted += 1
            else:
                updated += 1

        conn.commit()

        print(f"\n📊 Seasons Sync Summary:")
        print(f"  • Seasons inserted: {inserted}")
        print(f"  • Seasons updated: {updated}")
        print(f"  • Total seasons: {len(seasons)}")

        # Verify current season
        cur.execute("""
            SELECT season_id, season_type
            FROM seasons
            WHERE is_current = true
            ORDER BY season_id, season_type
        """)

        current_seasons = cur.fetchall()
        print(f"\n✅ Current season(s):")
        for season_id, season_type in current_seasons:
            print(f"  • {season_id} {season_type}")

        cur.close()
        conn.close()

        print("\n✅ Seasons sync completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = sync_seasons()
    sys.exit(0 if success else 1)
