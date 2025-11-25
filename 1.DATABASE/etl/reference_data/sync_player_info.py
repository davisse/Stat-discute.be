#!/usr/bin/env python3
"""
Sync Player Info - Fetch and update player positions, heights, weights, etc.
Uses NBA API commonplayerinfo endpoint

Usage:
    python3 sync_player_info.py [--all] [--active-only]

Options:
    --all: Update all players in database
    --active-only: Only update active players (default)
"""

import os
import sys
import psycopg2
from datetime import datetime
from dotenv import load_dotenv
import time
import argparse
from nba_api.stats.endpoints import commonplayerinfo
from nba_api.stats.static import players as nba_players

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

def fetch_player_info(player_id):
    """Fetch detailed player info from NBA API using nba_api library"""

    try:
        # Use nba_api library
        player_info_obj = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
        player_info_df = player_info_obj.get_data_frames()[0]

        if player_info_df.empty:
            return None

        # Convert first row to dictionary
        player_data = player_info_df.iloc[0].to_dict()

        return player_data

    except Exception as e:
        print(f"   ⚠️  Error fetching player {player_id}: {str(e)[:100]}")
        return None

def update_player_info(conn, player_id, player_data):
    """Update player info in database"""

    try:
        cur = conn.cursor()

        # Extract fields from API response
        position = player_data.get('POSITION')
        height = player_data.get('HEIGHT')
        weight = player_data.get('WEIGHT')
        jersey = player_data.get('JERSEY')
        draft_year = player_data.get('DRAFT_YEAR')
        draft_round = player_data.get('DRAFT_ROUND')
        draft_number = player_data.get('DRAFT_NUMBER')
        birthdate = player_data.get('BIRTHDATE')
        team_id = player_data.get('TEAM_ID')

        # Convert empty strings to None
        position = position if position else None
        height = height if height else None
        weight = int(weight) if weight and str(weight).isdigit() else None
        jersey = jersey if jersey else None
        draft_year = int(draft_year) if draft_year and str(draft_year).isdigit() else None
        draft_round = int(draft_round) if draft_round and str(draft_round).isdigit() else None
        draft_number = int(draft_number) if draft_number and str(draft_number).isdigit() else None
        team_id = int(team_id) if team_id and str(team_id).isdigit() and int(team_id) > 0 else None

        # Parse birthdate (format: "YYYY-MM-DDTHH:MM:SS")
        birth_date = None
        if birthdate:
            try:
                birth_date = datetime.fromisoformat(birthdate.replace('T', ' ')).date()
            except:
                pass

        # Update player record
        cur.execute("""
            UPDATE players
            SET position = %s,
                height = %s,
                weight = %s,
                jersey_number = %s,
                draft_year = %s,
                draft_round = %s,
                draft_number = %s,
                birth_date = %s,
                current_team_id = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE player_id = %s
        """, (
            position, height, weight, jersey,
            draft_year, draft_round, draft_number,
            birth_date, team_id, player_id
        ))

        cur.close()
        return True

    except Exception as e:
        print(f"   ⚠️  DB error updating player {player_id}: {str(e)[:100]}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Sync player position and info data')
    parser.add_argument('--all', action='store_true', help='Update all players (not just active)')
    parser.add_argument('--active-only', action='store_true', default=True, help='Only update active players')
    args = parser.parse_args()

    print("=" * 80)
    print("🏀 NBA Player Info Sync")
    print("=" * 80)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get players to update
        if args.all:
            print("📋 Fetching ALL players from database...")
            cur.execute("SELECT player_id, full_name FROM players ORDER BY player_id")
        else:
            print("📋 Fetching ACTIVE players from database...")
            cur.execute("""
                SELECT DISTINCT p.player_id, p.full_name
                FROM players p
                WHERE p.is_active = true
                ORDER BY p.player_id
            """)

        players = cur.fetchall()
        total_players = len(players)

        print(f"✅ Found {total_players} players to update\n")

        updated = 0
        skipped = 0
        errors = 0

        for idx, (player_id, player_name) in enumerate(players, 1):
            # Progress indicator
            if idx % 10 == 0:
                print(f"Progress: {idx}/{total_players} ({(idx/total_players)*100:.1f}%) - Updated: {updated}, Errors: {errors}")

            # Fetch player info from API
            player_data = fetch_player_info(player_id)

            if not player_data:
                skipped += 1
                continue

            # Update database
            success = update_player_info(conn, player_id, player_data)

            if success:
                updated += 1
                position = player_data.get('POSITION', 'N/A')
                if idx <= 5 or idx % 50 == 0:  # Show first 5 and every 50th
                    print(f"   ✅ {player_name}: {position}")
            else:
                errors += 1

            # Commit every 25 players
            if idx % 25 == 0:
                conn.commit()

            # Rate limiting - be nice to NBA API
            time.sleep(0.6)  # ~100 requests per minute

        # Final commit
        conn.commit()

        print("\n" + "=" * 80)
        print("📊 Sync Summary:")
        print("=" * 80)
        print(f"   • Total players processed: {total_players}")
        print(f"   • Successfully updated: {updated}")
        print(f"   • Skipped (no data): {skipped}")
        print(f"   • Errors: {errors}")

        # Verify results
        cur.execute("""
            SELECT
                COUNT(*) as total,
                COUNT(position) as with_position,
                COUNT(height) as with_height,
                COUNT(weight) as with_weight
            FROM players
            WHERE is_active = true
        """)

        total, with_pos, with_height, with_weight = cur.fetchone()

        print(f"\n📈 Active Players Data Coverage:")
        print(f"   • Total active: {total}")
        print(f"   • With position: {with_pos} ({(with_pos/total)*100:.1f}%)")
        print(f"   • With height: {with_height} ({(with_height/total)*100:.1f}%)")
        print(f"   • With weight: {with_weight} ({(with_weight/total)*100:.1f}%)")

        # Show position distribution
        print(f"\n📍 Position Distribution:")
        cur.execute("""
            SELECT position, COUNT(*) as count
            FROM players
            WHERE is_active = true AND position IS NOT NULL
            GROUP BY position
            ORDER BY count DESC
        """)

        positions = cur.fetchall()
        for pos, count in positions:
            print(f"   • {pos}: {count} players")

        cur.close()
        conn.close()

        print("\n✅ Player info sync complete!")

    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
