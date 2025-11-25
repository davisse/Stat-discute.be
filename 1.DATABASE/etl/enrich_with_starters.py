#!/usr/bin/env python3
"""
Enrich player_game_stats with starter position data from boxscoretraditionalv2 endpoint.

This script:
1. Identifies completed games missing starter data
2. Fetches boxscore details from NBA API
3. Updates start_position column for all players in each game
4. Validates 10 starters per game (5 per team)

Usage:
    python3 enrich_with_starters.py                    # Process all games
    python3 enrich_with_starters.py --game-id 0022500280  # Single game
    python3 enrich_with_starters.py --limit 10         # Test on 10 games
"""

import os
import sys
import time
import requests
import psycopg2
from datetime import datetime
from typing import List, Dict, Optional

# Database connection
DB_CONFIG = {
    'dbname': os.getenv('DB_NAME', 'nba_stats'),
    'user': os.getenv('DB_USER', 'chapirou'),
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432')
}

# NBA API configuration
NBA_API_BASE = 'https://stats.nba.com/stats/boxscoretraditionalv2'
NBA_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Accept': '*/*'
}

# Rate limiting: 0.6 seconds between requests (~100 req/min)
REQUEST_DELAY = 0.6
MAX_RETRIES = 3
RETRY_DELAYS = [1, 2, 4, 8]  # Exponential backoff in seconds


def get_database_connection():
    """Create database connection."""
    return psycopg2.connect(**DB_CONFIG)


def get_games_needing_enrichment(season: str = '2025-26', limit: Optional[int] = None) -> List[tuple]:
    """
    Get games that need starter data enrichment.

    Returns list of (game_id, game_date) tuples for completed games
    where at least one player_game_stats record has NULL start_position.
    """
    conn = get_database_connection()
    cur = conn.cursor()

    query = """
        SELECT DISTINCT g.game_id, g.game_date
        FROM games g
        WHERE g.season = %s
          AND g.home_team_score IS NOT NULL  -- Game completed
          AND EXISTS (
              SELECT 1 FROM player_game_stats pgs
              WHERE pgs.game_id = g.game_id
                AND pgs.start_position IS NULL
          )
        ORDER BY g.game_date ASC
    """

    if limit:
        query += f" LIMIT {limit}"

    cur.execute(query, (season,))
    games = cur.fetchall()

    cur.close()
    conn.close()

    return games


def fetch_boxscore_traditional(game_id: str, retry_count: int = 0) -> Optional[Dict]:
    """
    Fetch box score from NBA API with retry logic.

    Returns dict with player_id -> start_position mapping, or None on failure.
    """
    url = NBA_API_BASE
    params = {'GameID': game_id}

    try:
        response = requests.get(url, params=params, headers=NBA_HEADERS, timeout=30)
        response.raise_for_status()
        data = response.json()

        # Extract PlayerStats result set (index 0)
        result_sets = data.get('resultSets', [])
        if not result_sets:
            print(f"  ⚠️  No result sets for game {game_id}")
            return None

        player_stats = result_sets[0]
        headers = player_stats.get('headers', [])
        rows = player_stats.get('rowSet', [])

        # Find START_POSITION column index
        try:
            start_pos_idx = headers.index('START_POSITION')
            player_id_idx = headers.index('PLAYER_ID')
        except ValueError as e:
            print(f"  ❌ Missing required column: {e}")
            return None

        # Build player_id -> start_position mapping
        starter_data = {}
        for row in rows:
            player_id = row[player_id_idx]
            start_position = row[start_pos_idx]
            # Convert empty string to None (NBA API returns '' for bench players)
            if start_position == '':
                start_position = None
            starter_data[player_id] = start_position  # None for bench players

        return starter_data

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:  # Rate limit
            if retry_count < MAX_RETRIES:
                delay = RETRY_DELAYS[retry_count]
                print(f"  ⏳ Rate limited, retrying in {delay}s (attempt {retry_count + 1}/{MAX_RETRIES})")
                time.sleep(delay)
                return fetch_boxscore_traditional(game_id, retry_count + 1)
            else:
                print(f"  ❌ Max retries exceeded for game {game_id}")
                return None
        else:
            print(f"  ❌ HTTP error for game {game_id}: {e}")
            return None

    except Exception as e:
        print(f"  ❌ Error fetching game {game_id}: {e}")
        return None


def update_starter_data(game_id: str, starter_data: Dict[int, Optional[str]]) -> int:
    """
    Update start_position for all players in a game.

    Returns number of rows updated.
    """
    conn = get_database_connection()
    cur = conn.cursor()

    try:
        # Build batch update using unnest arrays
        player_ids = list(starter_data.keys())
        positions = [starter_data[pid] for pid in player_ids]

        query = """
            UPDATE player_game_stats
            SET start_position = data.position
            FROM (
                SELECT unnest(%s::BIGINT[]) as player_id,
                       unnest(%s::VARCHAR[]) as position
            ) as data
            WHERE player_game_stats.game_id = %s
              AND player_game_stats.player_id = data.player_id
        """

        cur.execute(query, (player_ids, positions, game_id))
        updated_count = cur.rowcount

        conn.commit()
        cur.close()
        conn.close()

        return updated_count

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        print(f"  ❌ Database error for game {game_id}: {e}")
        return 0


def validate_game_starters(game_id: str) -> bool:
    """
    Validate that game has exactly 10 starters (5 per team).

    Returns True if valid, False otherwise.
    """
    conn = get_database_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT COUNT(*)
        FROM player_game_stats
        WHERE game_id = %s AND is_starter = TRUE
    """, (game_id,))

    starter_count = cur.fetchone()[0]

    cur.close()
    conn.close()

    if starter_count != 10:
        print(f"  ⚠️  Expected 10 starters, found {starter_count}")
        return False

    return True


def main():
    """Main execution function."""
    import argparse

    parser = argparse.ArgumentParser(description='Enrich player_game_stats with starter data')
    parser.add_argument('--season', default='2025-26', help='Season to process (default: 2025-26)')
    parser.add_argument('--game-id', help='Process single game by ID')
    parser.add_argument('--limit', type=int, help='Limit number of games to process')
    parser.add_argument('--dry-run', action='store_true', help='Fetch data without updating database')

    args = parser.parse_args()

    print("=" * 80)
    print("🏀 NBA Starter Data Enrichment")
    print("=" * 80)

    # Get games to process
    if args.game_id:
        games = [(args.game_id, None)]
        print(f"Processing single game: {args.game_id}\n")
    else:
        games = get_games_needing_enrichment(args.season, args.limit)
        print(f"Found {len(games)} games needing enrichment for season {args.season}\n")

    if not games:
        print("✅ All games already have starter data")
        return

    # Process each game
    success_count = 0
    error_count = 0

    for idx, (game_id, game_date) in enumerate(games, 1):
        print(f"[{idx}/{len(games)}] {game_id} ({game_date or 'unknown date'})")

        # Fetch starter data from API
        starter_data = fetch_boxscore_traditional(game_id)

        if starter_data is None:
            error_count += 1
            continue

        starters = sum(1 for pos in starter_data.values() if pos is not None)
        print(f"  📊 Found {starters} starters, {len(starter_data) - starters} bench players")

        # Update database
        if not args.dry_run:
            updated = update_starter_data(game_id, starter_data)

            if updated > 0:
                # Validate
                if validate_game_starters(game_id):
                    print(f"  ✅ Updated {updated} players, validation passed")
                    success_count += 1
                else:
                    print(f"  ⚠️  Updated {updated} players, validation failed")
                    error_count += 1
            else:
                error_count += 1
        else:
            print(f"  🔍 Dry run: Would update {len(starter_data)} players")
            success_count += 1

        # Rate limiting
        if idx < len(games):
            time.sleep(REQUEST_DELAY)

    # Summary
    print("\n" + "=" * 80)
    print("ENRICHMENT COMPLETE")
    print("=" * 80)
    print(f"✅ Success: {success_count} games")
    print(f"❌ Errors:  {error_count} games")
    print("=" * 80)


if __name__ == '__main__':
    main()
