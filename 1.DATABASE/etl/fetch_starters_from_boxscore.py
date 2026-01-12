#!/usr/bin/env python3
"""
Fetch Starter Information from NBA Boxscore API

Uses boxscoretraditionalv2 endpoint to get accurate START_POSITION data
instead of estimating from minutes played.

START_POSITION values from NBA API:
- 'F' = Forward (starter)
- 'G' = Guard (starter)
- 'C' = Center (starter)
- '' (empty) = Bench player
"""

import os
import sys
import time
import requests
import psycopg2
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'config', '.env'))

# NBA API Configuration
NBA_API_URL = "https://stats.nba.com/stats/boxscoretraditionalv2"
NBA_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Accept': '*/*'
}

# Rate limiting
REQUEST_DELAY = 0.6  # seconds between requests to avoid rate limiting


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


def get_games_missing_starters(season: str, limit: int = None):
    """
    Get list of game_ids that don't have proper starter data.
    A game is considered missing starter data if no players have start_position set.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    query = """
        SELECT DISTINCT g.game_id, g.game_date
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
        ORDER BY g.game_date DESC
    """

    if limit:
        query += f" LIMIT {limit}"

    cur.execute(query, (season,))
    games = cur.fetchall()

    cur.close()
    conn.close()

    return games


def get_all_games_for_season(season: str):
    """Get all finished games for a season"""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT DISTINCT g.game_id, g.game_date
        FROM games g
        WHERE g.season = %s
          AND g.game_status = 'Final'
        ORDER BY g.game_date DESC
    """, (season,))

    games = cur.fetchall()
    cur.close()
    conn.close()

    return games


def fetch_boxscore(game_id: str):
    """
    Fetch boxscore data from NBA API for a specific game.
    Returns player stats with START_POSITION.
    """
    params = {
        'GameID': game_id,
        'StartPeriod': 0,
        'EndPeriod': 10,
        'StartRange': 0,
        'EndRange': 28800,
        'RangeType': 0
    }

    try:
        response = requests.get(
            NBA_API_URL,
            params=params,
            headers=NBA_HEADERS,
            timeout=30
        )
        response.raise_for_status()

        data = response.json()

        # Find PlayerStats resultSet
        for rs in data.get('resultSets', []):
            if rs.get('name') == 'PlayerStats':
                headers = rs.get('headers', [])
                rows = rs.get('rowSet', [])

                # Convert to list of dicts
                players = []
                for row in rows:
                    player_dict = dict(zip(headers, row))
                    players.append(player_dict)

                return players

        return None

    except requests.exceptions.RequestException as e:
        print(f"    API error for {game_id}: {e}")
        return None
    except Exception as e:
        print(f"    Unexpected error for {game_id}: {e}")
        return None


def update_starter_info(game_id: str, players: list):
    """
    Update player_game_stats with starter information from boxscore.
    """
    if not players:
        return 0, 0

    conn = get_db_connection()
    cur = conn.cursor()

    updated = 0
    starters_found = 0

    for player in players:
        player_id = player.get('PLAYER_ID')
        start_position = player.get('START_POSITION', '')

        # Determine if starter (non-empty start_position)
        is_starter = bool(start_position and start_position.strip())

        if is_starter:
            starters_found += 1

        try:
            cur.execute("""
                UPDATE player_game_stats
                SET start_position = %s,
                    is_starter = %s
                WHERE game_id = %s AND player_id = %s
            """, (start_position if start_position else None, is_starter, game_id, player_id))

            if cur.rowcount > 0:
                updated += 1

        except Exception as e:
            print(f"    Error updating player {player_id}: {e}")

    conn.commit()
    cur.close()
    conn.close()

    return updated, starters_found


def run_fetch_starters(season: str = None, force_all: bool = False, limit: int = None):
    """
    Main function to fetch and update starter information.

    Args:
        season: Season to process (default: current season)
        force_all: If True, process all games even if they have starter data
        limit: Limit number of games to process (for testing)
    """
    if not season:
        season = get_current_season()

    print("=" * 60)
    print("NBA Starter Data Fetcher (boxscoretraditionalv2)")
    print("=" * 60)
    print(f"Season: {season}")
    print(f"Mode: {'All games' if force_all else 'Missing starters only'}")
    if limit:
        print(f"Limit: {limit} games")
    print()

    # Get games to process
    if force_all:
        games = get_all_games_for_season(season)
    else:
        games = get_games_missing_starters(season, limit)

    if not games:
        print("No games to process!")
        return

    print(f"Found {len(games)} games to process")
    print("-" * 60)

    total_updated = 0
    total_starters = 0
    errors = 0

    for idx, (game_id, game_date) in enumerate(games, 1):
        print(f"[{idx}/{len(games)}] {game_id} ({game_date})...", end=" ")

        # Fetch boxscore from NBA API
        players = fetch_boxscore(game_id)

        if players is None:
            print("SKIP (API error)")
            errors += 1
            time.sleep(REQUEST_DELAY)
            continue

        if not players:
            print("SKIP (no player data)")
            errors += 1
            time.sleep(REQUEST_DELAY)
            continue

        # Update database
        updated, starters = update_starter_info(game_id, players)
        total_updated += updated
        total_starters += starters

        print(f"OK ({starters} starters, {updated} rows updated)")

        # Rate limiting
        time.sleep(REQUEST_DELAY)

    print()
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Games processed: {len(games) - errors}")
    print(f"Games with errors: {errors}")
    print(f"Total starters found: {total_starters}")
    print(f"Total rows updated: {total_updated}")


def show_stats():
    """Show current starter data statistics"""
    conn = get_db_connection()
    cur = conn.cursor()

    season = get_current_season()

    print(f"\nStarter Data Statistics for {season}")
    print("-" * 50)

    # Count by is_starter
    cur.execute("""
        SELECT
            is_starter,
            COUNT(*) as count
        FROM player_game_stats pgs
        JOIN games g ON pgs.game_id = g.game_id
        WHERE g.season = %s
        GROUP BY is_starter
    """, (season,))

    print("\nBy is_starter:")
    for row in cur.fetchall():
        status = "Starter" if row[0] else "Bench"
        print(f"  {status}: {row[1]:,}")

    # Count games with/without starter data
    cur.execute("""
        SELECT
            CASE
                WHEN starter_count = 10 THEN 'Complete (10 starters)'
                WHEN starter_count > 0 THEN 'Partial (' || starter_count || ' starters)'
                ELSE 'Missing (0 starters)'
            END as status,
            COUNT(*) as games
        FROM (
            SELECT
                g.game_id,
                SUM(CASE WHEN pgs.start_position IS NOT NULL AND pgs.start_position != '' THEN 1 ELSE 0 END) as starter_count
            FROM games g
            JOIN player_game_stats pgs ON g.game_id = pgs.game_id
            WHERE g.season = %s
            GROUP BY g.game_id
        ) sub
        GROUP BY status
        ORDER BY status
    """, (season,))

    print("\nGames by starter data status:")
    for row in cur.fetchall():
        print(f"  {row[0]}: {row[1]}")

    cur.close()
    conn.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Fetch NBA starter data from boxscore API')
    parser.add_argument('--season', type=str, help='Season to process (e.g., 2025-26)')
    parser.add_argument('--force-all', action='store_true', help='Process all games, not just missing')
    parser.add_argument('--limit', type=int, help='Limit number of games to process')
    parser.add_argument('--stats', action='store_true', help='Show current statistics only')

    args = parser.parse_args()

    if args.stats:
        show_stats()
    else:
        run_fetch_starters(
            season=args.season,
            force_all=args.force_all,
            limit=args.limit
        )
        print()
        show_stats()
