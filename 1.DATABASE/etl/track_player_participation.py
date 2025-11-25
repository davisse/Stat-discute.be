#!/usr/bin/env python3
"""
Track player participation and absences for each game.
Populates player_game_participation table.

This script:
1. Identifies players who played (from player_game_stats)
2. Identifies players who were absent (roster - participants)
3. Inserts participation records with is_active flag

Usage:
    python3 track_player_participation.py [season]

Example:
    python3 track_player_participation.py 2025-26
"""

import os
import sys
import psycopg2
from psycopg2.extras import execute_batch
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'config', '.env'))

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'nba_stats'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '')
}


def get_db_connection():
    """Create database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        sys.exit(1)


def sync_participation_from_box_scores(season):
    """
    Sync player participation from existing player_game_stats.

    Logic:
    - If player has stats in player_game_stats → is_active = TRUE
    - Mark all players who played in each game

    Args:
        season (str): Season ID (e.g., '2025-26')
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    print(f"📊 Syncing player participation from box scores for season {season}...")

    try:
        # Get all player-game combinations from player_game_stats for this season
        cursor.execute("""
            SELECT DISTINCT
                pgs.game_id,
                pgs.player_id,
                pgs.team_id,
                pgs.minutes
            FROM player_game_stats pgs
            JOIN games g ON pgs.game_id = g.game_id
            WHERE g.season = %s
            ORDER BY pgs.game_id
        """, (season,))

        participants = cursor.fetchall()
        print(f"   Found {len(participants)} player-game participation records")

        if not participants:
            print(f"   ⚠️  No player game stats found for season {season}")
            cursor.close()
            conn.close()
            return

        # Prepare batch insert data
        insert_data = []
        for game_id, player_id, team_id, minutes in participants:
            insert_data.append((
                game_id,
                player_id,
                team_id,
                True,  # is_active
                None,  # inactive_reason (NULL for active players)
                minutes or 0
            ))

        # Batch insert with ON CONFLICT handling
        execute_batch(cursor, """
            INSERT INTO player_game_participation
            (game_id, player_id, team_id, is_active, inactive_reason, minutes_played)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (game_id, player_id)
            DO UPDATE SET
                is_active = EXCLUDED.is_active,
                minutes_played = EXCLUDED.minutes_played,
                updated_at = CURRENT_TIMESTAMP
        """, insert_data, page_size=500)

        conn.commit()
        print(f"   ✅ Inserted/updated {len(insert_data)} participation records")

    except Exception as e:
        conn.rollback()
        print(f"   ❌ Error syncing participation: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


def identify_absences_from_roster(season):
    """
    Identify player absences by comparing roster to actual participants.

    Logic:
    - For each team game, get expected roster
    - Compare with actual participants (is_active = TRUE)
    - Mark missing players as absent (is_active = FALSE)

    Note: This is a simplified version. Full implementation would:
    - Fetch team rosters from NBA API
    - Track trades/signings mid-season
    - Get injury reports for inactive_reason

    For now, we only mark players who played (from box scores).
    Absence detection requires additional NBA API integration.

    Args:
        season (str): Season ID (e.g., '2025-26')
    """
    print(f"⚠️  Absence detection from roster not yet fully implemented")
    print(f"   Currently only tracking players who played (from box scores)")
    print(f"   To track absences, integrate:")
    print(f"   - NBA API: CommonTeamRoster endpoint")
    print(f"   - NBA API: LeagueGameLog for injury reports")
    print(f"   - Handle trades/roster changes mid-season")


def get_participation_stats(season):
    """
    Get statistics about participation tracking.

    Args:
        season (str): Season ID (e.g., '2025-26')
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Total participation records
        cursor.execute("""
            SELECT
                COUNT(*) as total_records,
                SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN NOT is_active THEN 1 ELSE 0 END) as absent_count
            FROM player_game_participation pgp
            JOIN games g ON pgp.game_id = g.game_id
            WHERE g.season = %s
        """, (season,))

        total, active, absent = cursor.fetchone()

        print(f"\n📈 Participation Stats for {season}:")
        print(f"   Total records: {total}")
        print(f"   Active (played): {active}")
        print(f"   Absent: {absent}")

        # Games with participation data
        cursor.execute("""
            SELECT COUNT(DISTINCT pgp.game_id) as games_tracked
            FROM player_game_participation pgp
            JOIN games g ON pgp.game_id = g.game_id
            WHERE g.season = %s
        """, (season,))

        games_tracked = cursor.fetchone()[0]
        print(f"   Games tracked: {games_tracked}")

        # Sample of recent participations
        cursor.execute("""
            SELECT
                g.game_date,
                g.home_team_abbr,
                g.away_team_abbr,
                COUNT(*) as participants
            FROM player_game_participation pgp
            JOIN games g ON pgp.game_id = g.game_id
            WHERE g.season = %s AND pgp.is_active = TRUE
            GROUP BY g.game_id, g.game_date, g.home_team_abbr, g.away_team_abbr
            ORDER BY g.game_date DESC
            LIMIT 5
        """, (season,))

        recent_games = cursor.fetchall()
        if recent_games:
            print(f"\n   Recent games tracked:")
            for game_date, home, away, participants in recent_games:
                print(f"   - {game_date}: {away} @ {home} ({participants} players)")

    except Exception as e:
        print(f"   ❌ Error getting stats: {e}")
    finally:
        cursor.close()
        conn.close()


def main():
    """Main execution"""
    # Get season from command line or use default
    season = sys.argv[1] if len(sys.argv) > 1 else '2025-26'

    print(f"🏀 Player Participation Tracker")
    print(f"=" * 50)
    print(f"Season: {season}")
    print(f"Database: {DB_CONFIG['database']} @ {DB_CONFIG['host']}")
    print()

    # Step 1: Sync participation from box scores
    sync_participation_from_box_scores(season)

    # Step 2: Identify absences (placeholder for future implementation)
    print()
    identify_absences_from_roster(season)

    # Step 3: Show stats
    print()
    get_participation_stats(season)

    print(f"\n✅ Participation tracking completed for {season}")


if __name__ == '__main__':
    main()
