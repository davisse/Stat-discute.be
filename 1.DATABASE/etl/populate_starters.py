#!/usr/bin/env python3
"""
Populate START_POSITION for Player Game Stats

Uses minutes-based estimation: Top 5 players by minutes per team per game
are considered starters. This approach is used when NBA boxscore API
doesn't have official starter data available.

Position estimation based on player's registered position.
"""

import os
import sys
import psycopg2
from datetime import datetime
from dotenv import load_dotenv

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

def get_current_season():
    """Get the current season from database"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT season_id FROM seasons WHERE is_current = true")
    result = cur.fetchone()
    cur.close()
    conn.close()
    return result[0] if result else '2025-26'

def estimate_starters_by_minutes():
    """
    Estimate starters based on minutes played.
    Top 5 players by minutes per team per game are considered starters.
    Use player's registered position for start_position.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    current_season = get_current_season()
    print(f"Processing season: {current_season}")

    # Get games that need starter estimation
    cur.execute("""
        SELECT DISTINCT g.game_id
        FROM games g
        JOIN player_game_stats pgs ON g.game_id = pgs.game_id
        WHERE g.season = %s
          AND g.game_status = 'Final'
          AND NOT EXISTS (
              SELECT 1 FROM player_game_stats pgs2
              WHERE pgs2.game_id = g.game_id
              AND pgs2.start_position IS NOT NULL
              AND pgs2.start_position != ''
          )
        ORDER BY g.game_id
    """, (current_season,))

    games = [row[0] for row in cur.fetchall()]
    print(f"Found {len(games)} games without starter data\n")

    if not games:
        print("All games already have starter data!")
        cur.close()
        conn.close()
        return True

    total_starters_set = 0

    for idx, game_id in enumerate(games, 1):
        if idx % 25 == 0 or idx == 1:
            print(f"Processing game {idx}/{len(games)}...")

        # For each team in this game, get top 5 players by minutes
        cur.execute("""
            WITH ranked_players AS (
                SELECT
                    pgs.game_id,
                    pgs.player_id,
                    pgs.team_id,
                    pgs.minutes,
                    p.position,
                    ROW_NUMBER() OVER (
                        PARTITION BY pgs.game_id, pgs.team_id
                        ORDER BY pgs.minutes DESC
                    ) as rank
                FROM player_game_stats pgs
                JOIN players p ON pgs.player_id = p.player_id
                WHERE pgs.game_id = %s
                  AND pgs.minutes > 0
            )
            SELECT game_id, player_id, team_id, position
            FROM ranked_players
            WHERE rank <= 5
        """, (game_id,))

        starters = cur.fetchall()

        for game_id, player_id, team_id, position in starters:
            # Map position to start_position format (F, G, C, F-G, etc.)
            # NBA uses single letters: G, F, C
            # Default to 'F' (forward) if position is unknown - this ensures is_starter flag works
            start_pos = 'F'  # Default for players without position data
            if position:
                pos_upper = position.upper()
                if 'CENTER' in pos_upper or pos_upper == 'C':
                    start_pos = 'C'
                elif 'FORWARD' in pos_upper or pos_upper in ('F', 'SF', 'PF', 'F-C', 'C-F'):
                    start_pos = 'F'
                elif 'GUARD' in pos_upper or pos_upper in ('G', 'SG', 'PG', 'G-F', 'F-G'):
                    start_pos = 'G'
                elif '-' in pos_upper:
                    # Handle combo positions like G-F, F-G, F-C
                    start_pos = pos_upper.split('-')[0][0]
                else:
                    # Default to first letter
                    start_pos = pos_upper[0] if pos_upper else 'F'

            cur.execute("""
                UPDATE player_game_stats
                SET start_position = %s
                WHERE game_id = %s AND player_id = %s
            """, (start_pos, game_id, player_id))

            total_starters_set += 1

        # Commit every 50 games
        if idx % 50 == 0:
            conn.commit()

    conn.commit()
    cur.close()
    conn.close()

    return total_starters_set

def populate_starters():
    """Main function to populate starter data for all games"""
    print("=" * 80)
    print("POPULATING START_POSITION USING MINUTES-BASED ESTIMATION")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    total_starters = estimate_starters_by_minutes()

    print(f"\nTotal starter records set: {total_starters}")

    # Verify results
    conn = get_db_connection()
    cur = conn.cursor()

    current_season = get_current_season()

    cur.execute("""
        SELECT
            COUNT(DISTINCT pgs.game_id) as games_with_starters,
            SUM(CASE WHEN pgs.start_position IS NOT NULL AND pgs.start_position != '' THEN 1 ELSE 0 END) as starters,
            SUM(CASE WHEN pgs.is_starter THEN 1 ELSE 0 END) as is_starter_true
        FROM player_game_stats pgs
        JOIN games g ON pgs.game_id = g.game_id
        WHERE g.season = %s
    """, (current_season,))

    games_with_starters, total_starter_records, is_starter_count = cur.fetchone()

    print(f"\n" + "=" * 80)
    print(f"VERIFICATION")
    print("=" * 80)
    print(f"  Games with starter data: {games_with_starters}")
    print(f"  Total starter records: {total_starter_records}")
    print(f"  is_starter = true count: {is_starter_count}")

    # Show sample starter data
    cur.execute("""
        SELECT p.full_name, pgs.start_position, t.abbreviation, g.game_date, pgs.minutes, pgs.points
        FROM player_game_stats pgs
        JOIN players p ON pgs.player_id = p.player_id
        JOIN teams t ON pgs.team_id = t.team_id
        JOIN games g ON pgs.game_id = g.game_id
        WHERE g.season = %s
          AND pgs.start_position IS NOT NULL
          AND pgs.start_position != ''
        ORDER BY g.game_date DESC, t.abbreviation, pgs.minutes DESC
        LIMIT 15
    """, (current_season,))

    print(f"\nSample Starters (most recent games):")
    print("-" * 70)
    for row in cur.fetchall():
        print(f"  {row[0]:25} ({row[1]}) - {row[2]:3} | {row[3]} | {row[4]:2} min | {row[5]:2} pts")

    cur.close()
    conn.close()

    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    return total_starters > 0

if __name__ == '__main__':
    success = populate_starters()
    sys.exit(0 if success else 1)
