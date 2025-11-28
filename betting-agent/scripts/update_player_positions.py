#!/usr/bin/env python3
"""
Update player positions from NBA API.

This script fetches position data for players who don't have it set,
using the NBA commonallplayers endpoint.
"""

import asyncio
import asyncpg
import requests
import time
from typing import Optional

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'nba_stats',
    'user': 'chapirou'
}

# NBA API headers (required to avoid 403)
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Accept': '*/*'
}


def fetch_all_players_from_nba() -> dict:
    """
    Fetch all players from NBA API with their positions.
    Uses commonallplayers endpoint.

    Returns:
        dict: player_id -> position mapping
    """
    url = "https://stats.nba.com/stats/commonallplayers"
    params = {
        'LeagueID': '00',
        'Season': '2024-25',
        'IsOnlyCurrentSeason': 0
    }

    print("Fetching all players from NBA API...")
    response = requests.get(url, headers=HEADERS, params=params, timeout=30)
    response.raise_for_status()

    data = response.json()

    # Parse response
    headers = data['resultSets'][0]['headers']
    rows = data['resultSets'][0]['rowSet']

    # Find column indexes
    player_id_idx = headers.index('PERSON_ID')

    # commonallplayers doesn't have position, we need to use a different endpoint
    # Let's try playerindex instead
    print(f"Found {len(rows)} players, but need position data from different endpoint...")

    return None


def fetch_player_index() -> dict:
    """
    Fetch player index which includes position data.
    """
    url = "https://stats.nba.com/stats/playerindex"
    params = {
        'LeagueID': '00',
        'Season': '2024-25',
        'Historical': 1,
        'Active': ''
    }

    print("Fetching player index from NBA API...")
    response = requests.get(url, headers=HEADERS, params=params, timeout=30)
    response.raise_for_status()

    data = response.json()

    # Parse response
    headers = data['resultSets'][0]['headers']
    rows = data['resultSets'][0]['rowSet']

    print(f"Headers: {headers}")

    # Find column indexes
    player_id_idx = headers.index('PERSON_ID')
    position_idx = headers.index('POSITION') if 'POSITION' in headers else None

    if position_idx is None:
        print("Position not in playerindex, checking headers...")
        print(headers)
        return {}

    # Build mapping
    position_map = {}
    for row in rows:
        player_id = row[player_id_idx]
        position = row[position_idx]
        if position:
            position_map[player_id] = position

    print(f"Found positions for {len(position_map)} players")
    return position_map


def fetch_player_info(player_id: int) -> Optional[str]:
    """
    Fetch individual player info to get position.
    This is slower but more reliable.
    """
    url = "https://stats.nba.com/stats/commonplayerinfo"
    params = {
        'PlayerID': player_id
    }

    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        headers = data['resultSets'][0]['headers']
        row = data['resultSets'][0]['rowSet'][0] if data['resultSets'][0]['rowSet'] else None

        if row:
            position_idx = headers.index('POSITION') if 'POSITION' in headers else None
            if position_idx is not None:
                position = row[position_idx]
                # Clean up position (e.g., "Guard" -> "G", "Center" -> "C")
                if position:
                    position = position.strip()
                    # Map full names to abbreviations
                    position_map = {
                        'Guard': 'G',
                        'Forward': 'F',
                        'Center': 'C',
                        'Guard-Forward': 'G-F',
                        'Forward-Guard': 'F-G',
                        'Forward-Center': 'F-C',
                        'Center-Forward': 'C-F'
                    }
                    # Check if it's a full name
                    if position in position_map:
                        return position_map[position]
                    # Otherwise return first position if hyphenated
                    if '-' in position:
                        return position.split('-')[0]
                    return position
        return None
    except Exception as e:
        print(f"  Error fetching player {player_id}: {e}")
        return None


async def get_players_without_position(conn) -> list:
    """Get all players who played this season but don't have position set."""
    rows = await conn.fetch("""
        SELECT DISTINCT p.player_id, p.full_name
        FROM players p
        JOIN player_game_stats pgs ON p.player_id = pgs.player_id
        JOIN games g ON pgs.game_id = g.game_id
        WHERE g.season = '2025-26'
          AND (p.position IS NULL OR p.position = '')
        ORDER BY p.full_name
    """)
    return [(row['player_id'], row['full_name']) for row in rows]


async def update_player_position(conn, player_id: int, position: str):
    """Update player position in database."""
    # Normalize position to standard abbreviations
    position_normalized = normalize_position(position)

    await conn.execute("""
        UPDATE players
        SET position = $1, updated_at = NOW()
        WHERE player_id = $2
    """, position_normalized, player_id)


def normalize_position(position: str) -> str:
    """
    Normalize position to standard abbreviations: PG, SG, SF, PF, C
    """
    if not position:
        return None

    position = position.upper().strip()

    # Direct mappings
    direct_map = {
        'POINT GUARD': 'PG',
        'SHOOTING GUARD': 'SG',
        'SMALL FORWARD': 'SF',
        'POWER FORWARD': 'PF',
        'CENTER': 'C',
        'GUARD': 'SG',  # Default guard to SG
        'FORWARD': 'SF',  # Default forward to SF
        'G': 'SG',
        'F': 'SF',
    }

    if position in direct_map:
        return direct_map[position]

    # Already correct format
    if position in ['PG', 'SG', 'SF', 'PF', 'C']:
        return position

    # Handle hyphenated positions (e.g., "G-F" or "Guard-Forward")
    if '-' in position:
        first_pos = position.split('-')[0].strip()
        if first_pos in direct_map:
            return direct_map[first_pos]
        if first_pos in ['PG', 'SG', 'SF', 'PF', 'C']:
            return first_pos

    # Fallback: try to match partial
    if 'GUARD' in position:
        if 'POINT' in position:
            return 'PG'
        return 'SG'
    if 'FORWARD' in position:
        if 'SMALL' in position:
            return 'SF'
        if 'POWER' in position:
            return 'PF'
        return 'SF'
    if 'CENTER' in position:
        return 'C'

    print(f"  Warning: Unknown position format '{position}'")
    return None


async def main():
    """Main function to update player positions."""
    conn = await asyncpg.connect(**DB_CONFIG)

    try:
        # Get players without position
        players = await get_players_without_position(conn)
        print(f"\nFound {len(players)} players without position data")

        if not players:
            print("All players have positions set!")
            return

        # Try bulk fetch first via playerindex
        print("\nAttempting bulk fetch via playerindex...")
        position_map = fetch_player_index()

        # Track progress
        updated = 0
        not_found = []

        # Update from bulk data first
        if position_map:
            print(f"\nUpdating from bulk data ({len(position_map)} positions available)...")
            for player_id, full_name in players:
                if player_id in position_map:
                    position = position_map[player_id]
                    normalized = normalize_position(position)
                    if normalized:
                        await update_player_position(conn, player_id, normalized)
                        print(f"  ✓ {full_name}: {normalized}")
                        updated += 1
                else:
                    not_found.append((player_id, full_name))
        else:
            not_found = players

        # For remaining players, fetch individually (slower)
        if not_found:
            print(f"\nFetching {len(not_found)} remaining players individually...")
            for i, (player_id, full_name) in enumerate(not_found):
                print(f"  [{i+1}/{len(not_found)}] {full_name}...", end=" ")

                position = fetch_player_info(player_id)
                if position:
                    normalized = normalize_position(position)
                    if normalized:
                        await update_player_position(conn, player_id, normalized)
                        print(f"✓ {normalized}")
                        updated += 1
                    else:
                        print(f"? (raw: {position})")
                else:
                    print("✗ not found")

                # Rate limiting
                time.sleep(0.5)

        print(f"\n{'='*50}")
        print(f"Updated {updated} players")

        # Verify
        remaining = await get_players_without_position(conn)
        print(f"Remaining without position: {len(remaining)}")

    finally:
        await conn.close()


if __name__ == '__main__':
    asyncio.run(main())
