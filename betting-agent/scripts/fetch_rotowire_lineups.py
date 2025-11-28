#!/usr/bin/env python3
"""
Fetch daily NBA lineups from RotoWire.

This script scrapes RotoWire's NBA lineups page to get game-specific
player positions (PG, SG, SF, PF, C) which are more accurate than
static NBA API position classifications.

RotoWire HTML Structure (discovered via Playwright inspection):
- .lineup - main container for each team's lineup card
- .lineup__abbr - team abbreviation (CLE, ATL, etc.)
- .lineup__pos - position label (PG, SG, SF, PF, C)
- Next sibling of .lineup__pos contains player name
"""

import asyncio
import asyncpg
import requests
from bs4 import BeautifulSoup
from datetime import datetime, date
from typing import Optional
import re
import json

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'nba_stats',
    'user': 'chapirou'
}

# Request headers to avoid 403
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://www.rotowire.com/',
}

ROTOWIRE_URL = "https://www.rotowire.com/basketball/nba-lineups.php"


def fetch_rotowire_page() -> str:
    """Fetch RotoWire NBA lineups page HTML."""
    print(f"Fetching RotoWire lineups from {ROTOWIRE_URL}...")
    response = requests.get(ROTOWIRE_URL, headers=HEADERS, timeout=30)
    response.raise_for_status()
    print(f"  Received {len(response.text)} bytes")
    return response.text


def parse_lineups(html: str) -> list[dict]:
    """
    Parse RotoWire HTML to extract lineup data.

    Returns list of dicts with:
    {
        'team_abbr': 'ATL',
        'positions': {
            'PG': 'Dyson Daniels',
            'SG': 'N. Alexander-Walker',
            'SF': 'Z. Risacher',
            'PF': 'Jalen Johnson',
            'C': 'K. Porzingis'
        }
    }
    """
    soup = BeautifulSoup(html, 'html.parser')
    lineups = []

    # Find all lineup containers with class 'lineup'
    lineup_containers = soup.find_all('div', class_='lineup')
    print(f"  Found {len(lineup_containers)} lineup containers")

    for container in lineup_containers:
        # Get team abbreviation from lineup__abbr or lineup__team
        abbr_elem = container.find(class_='lineup__abbr')
        team_elem = container.find(class_='lineup__team')

        team_abbr = None
        if abbr_elem:
            team_abbr = abbr_elem.get_text(strip=True)
        elif team_elem:
            team_abbr = team_elem.get_text(strip=True)

        if not team_abbr or len(team_abbr) != 3:
            continue

        # Get positions and players
        # The structure is: within each lineup, find all li elements containing lineup__pos
        positions = {}

        # Find all position elements within this lineup container
        pos_elements = container.find_all(class_='lineup__pos')

        for pos_elem in pos_elements:
            pos_text = pos_elem.get_text(strip=True)

            # Only process actual basketball positions
            if pos_text not in ['PG', 'SG', 'SF', 'PF', 'C']:
                continue

            # Already have this position
            if pos_text in positions:
                continue

            # Find the player name - look for <a> tag in the same list item or parent
            # The structure is typically: <li>...<span class="lineup__pos">PG</span>...<a>Player Name</a>...</li>
            parent_li = pos_elem.find_parent('li')
            if parent_li:
                player_link = parent_li.find('a')
                if player_link:
                    player_name = player_link.get_text(strip=True)
                    if player_name:
                        positions[pos_text] = player_name
                        continue

            # Fallback: try parent element
            parent = pos_elem.parent
            if parent:
                player_link = parent.find('a')
                if player_link:
                    player_name = player_link.get_text(strip=True)
                    if player_name:
                        positions[pos_text] = player_name

        # Only add if we found at least some positions
        if positions:
            lineups.append({
                'team_abbr': team_abbr,
                'positions': positions
            })
            print(f"    {team_abbr}: {len(positions)} positions")

    return lineups


def normalize_player_name(name: str) -> str:
    """
    Normalize player name for matching against database.
    RotoWire uses abbreviated names like 'D. Garland' or 'K. Porzingis'.

    Returns a normalized form for fuzzy matching.
    """
    if not name:
        return ""

    # Remove any injury indicators or special characters
    name = re.sub(r'\s*\([^)]*\)\s*', '', name)  # Remove parenthetical notes
    name = re.sub(r'\s*\*+\s*', '', name)  # Remove asterisks
    name = name.strip()

    return name


async def get_player_id_by_name(conn, player_name: str, team_abbr: str) -> Optional[int]:
    """
    Find player_id by matching name against database.
    Handles abbreviated names like 'D. Garland' -> 'Darius Garland'.
    """
    normalized = normalize_player_name(player_name)
    if not normalized:
        return None

    # First try exact match on full_name
    row = await conn.fetchrow("""
        SELECT p.player_id, p.full_name
        FROM players p
        JOIN player_game_stats pgs ON p.player_id = pgs.player_id
        JOIN games g ON pgs.game_id = g.game_id
        JOIN teams t ON pgs.team_id = t.team_id
        WHERE g.season = '2025-26'
          AND t.abbreviation = $1
          AND p.full_name ILIKE $2
        LIMIT 1
    """, team_abbr, normalized)

    if row:
        return row['player_id']

    # Try matching abbreviated first name pattern (e.g., "D. Garland" -> "% Garland")
    if '. ' in normalized:
        parts = normalized.split('. ', 1)
        if len(parts) == 2:
            first_initial = parts[0]
            last_name = parts[1]

            # Match first initial + last name
            row = await conn.fetchrow("""
                SELECT p.player_id, p.full_name
                FROM players p
                JOIN player_game_stats pgs ON p.player_id = pgs.player_id
                JOIN games g ON pgs.game_id = g.game_id
                JOIN teams t ON pgs.team_id = t.team_id
                WHERE g.season = '2025-26'
                  AND t.abbreviation = $1
                  AND p.full_name ILIKE $2
                  AND p.full_name ILIKE $3
                GROUP BY p.player_id, p.full_name
                LIMIT 1
            """, team_abbr, f"{first_initial}%", f"% {last_name}")

            if row:
                return row['player_id']

    # Try last name only match (for unique last names on team)
    last_name = normalized.split()[-1] if ' ' in normalized else normalized
    rows = await conn.fetch("""
        SELECT DISTINCT p.player_id, p.full_name
        FROM players p
        JOIN player_game_stats pgs ON p.player_id = pgs.player_id
        JOIN games g ON pgs.game_id = g.game_id
        JOIN teams t ON pgs.team_id = t.team_id
        WHERE g.season = '2025-26'
          AND t.abbreviation = $1
          AND p.full_name ILIKE $2
    """, team_abbr, f"% {last_name}")

    if len(rows) == 1:
        return rows[0]['player_id']

    return None


async def save_lineup_positions(conn, lineups: list[dict], game_date: date) -> dict:
    """
    Save lineup positions to database.
    Returns stats about what was saved.
    """
    stats = {
        'teams_processed': 0,
        'players_matched': 0,
        'players_not_found': [],
        'positions_saved': 0
    }

    for lineup in lineups:
        team_abbr = lineup['team_abbr']
        positions = lineup['positions']
        stats['teams_processed'] += 1

        print(f"\n  {team_abbr}:")

        for position, player_name in positions.items():
            player_id = await get_player_id_by_name(conn, player_name, team_abbr)

            if player_id:
                # Update or insert into game_lineup_positions table
                await conn.execute("""
                    INSERT INTO game_lineup_positions
                        (game_date, team_abbr, player_id, position, player_name, source, created_at)
                    VALUES ($1, $2, $3, $4, $5, 'rotowire', NOW())
                    ON CONFLICT (game_date, team_abbr, player_id)
                    DO UPDATE SET position = $4, player_name = $5, updated_at = NOW()
                """, game_date, team_abbr, player_id, position, player_name)

                print(f"    {position}: {player_name} -> player_id={player_id}")
                stats['players_matched'] += 1
                stats['positions_saved'] += 1
            else:
                print(f"    {position}: {player_name} -> NOT FOUND")
                stats['players_not_found'].append(f"{team_abbr}: {player_name}")

    return stats


async def ensure_lineup_table_exists(conn):
    """Create game_lineup_positions table if it doesn't exist."""
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS game_lineup_positions (
            id SERIAL PRIMARY KEY,
            game_date DATE NOT NULL,
            team_abbr VARCHAR(3) NOT NULL,
            player_id BIGINT NOT NULL,
            position VARCHAR(2) NOT NULL CHECK (position IN ('PG', 'SG', 'SF', 'PF', 'C')),
            player_name VARCHAR(100),
            source VARCHAR(50) DEFAULT 'rotowire',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP,
            UNIQUE(game_date, team_abbr, player_id)
        );

        CREATE INDEX IF NOT EXISTS idx_lineup_date ON game_lineup_positions(game_date);
        CREATE INDEX IF NOT EXISTS idx_lineup_team ON game_lineup_positions(team_abbr);
        CREATE INDEX IF NOT EXISTS idx_lineup_player ON game_lineup_positions(player_id);
    """)
    print("  Ensured game_lineup_positions table exists")


async def main():
    """Main function to fetch and store RotoWire lineup data."""
    print("=" * 60)
    print("RotoWire NBA Lineup Fetcher")
    print("=" * 60)

    # Fetch HTML
    html = fetch_rotowire_page()

    # Parse lineups
    lineups = parse_lineups(html)
    print(f"\nParsed {len(lineups)} team lineups:")

    for lineup in lineups:
        print(f"  {lineup['team_abbr']}: {list(lineup['positions'].keys())}")

    # Connect to database
    conn = await asyncpg.connect(**DB_CONFIG)

    try:
        # Ensure table exists
        await ensure_lineup_table_exists(conn)

        # Save to database
        today = date.today()
        print(f"\nSaving lineups for {today}...")

        stats = await save_lineup_positions(conn, lineups, today)

        print(f"\n{'=' * 60}")
        print("Summary:")
        print(f"  Teams processed: {stats['teams_processed']}")
        print(f"  Players matched: {stats['players_matched']}")
        print(f"  Positions saved: {stats['positions_saved']}")

        if stats['players_not_found']:
            print(f"\n  Players not found ({len(stats['players_not_found'])}):")
            for p in stats['players_not_found'][:10]:
                print(f"    - {p}")
            if len(stats['players_not_found']) > 10:
                print(f"    ... and {len(stats['players_not_found']) - 10} more")

    finally:
        await conn.close()


def export_lineups_json(output_path: str = None):
    """Export current RotoWire lineups to JSON (for debugging/testing)."""
    html = fetch_rotowire_page()
    lineups = parse_lineups(html)

    output = {
        'fetched_at': datetime.now().isoformat(),
        'source': ROTOWIRE_URL,
        'lineups': lineups
    }

    if output_path:
        with open(output_path, 'w') as f:
            json.dump(output, f, indent=2)
        print(f"Exported to {output_path}")
    else:
        print(json.dumps(output, indent=2))

    return output


if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == '--export-json':
        output_path = sys.argv[2] if len(sys.argv) > 2 else None
        export_lineups_json(output_path)
    else:
        asyncio.run(main())
