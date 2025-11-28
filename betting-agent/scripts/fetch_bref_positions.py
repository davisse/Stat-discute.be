#!/usr/bin/env python3
"""
Fetch accurate player positions from Basketball Reference roster pages.

Basketball Reference provides granular positions (PG, SG, SF, PF, C) which
are more accurate than NBA API's generic positions (Guard, Forward, Center).
"""

import asyncio
import asyncpg
import requests
from bs4 import BeautifulSoup
import time
from pathlib import Path
import json

# NBA team codes for Basketball Reference URLs
NBA_TEAMS = [
    'ATL', 'BOS', 'BRK', 'CHO', 'CHI', 'CLE', 'DAL', 'DEN', 'DET', 'GSW',
    'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'MIL', 'MIN', 'NOP', 'NYK',
    'OKC', 'ORL', 'PHI', 'PHO', 'POR', 'SAC', 'SAS', 'TOR', 'UTA', 'WAS'
]

# Map BREF codes to our database abbreviations
BREF_TO_DB_MAP = {
    'BRK': 'BKN',  # Brooklyn
    'CHO': 'CHA',  # Charlotte
    'PHO': 'PHX',  # Phoenix
}

async def get_db_connection():
    """Get database connection."""
    return await asyncpg.connect(
        host='localhost',
        database='nba_stats',
        user='chapirou'
    )


def fetch_team_roster(team_code: str, season: int = 2025) -> list[dict]:
    """Fetch roster from Basketball Reference for a team."""
    url = f"https://www.basketball-reference.com/teams/{team_code}/{season}.html"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0'
    }

    try:
        resp = requests.get(url, headers=headers, timeout=30)
        if resp.status_code != 200:
            print(f"  ❌ Failed to fetch {team_code}: HTTP {resp.status_code}")
            return []

        soup = BeautifulSoup(resp.text, 'html.parser')
        roster_table = soup.find('table', {'id': 'roster'})

        if not roster_table:
            print(f"  ⚠️ No roster table found for {team_code}")
            return []

        players = []
        rows = roster_table.find('tbody').find_all('tr')

        for row in rows:
            cols = row.find_all('td')
            if cols and len(cols) >= 2:
                player_name = cols[0].text.strip()
                position = cols[1].text.strip()

                # Clean up name (remove special chars, normalize)
                player_name = player_name.replace('\xa0', ' ').strip()

                # Normalize position (some players have multiple positions like "SG-SF")
                # Take the primary position
                if '-' in position:
                    position = position.split('-')[0]

                # Map team code to our DB abbreviation
                db_team = BREF_TO_DB_MAP.get(team_code, team_code)

                players.append({
                    'name': player_name,
                    'position': position.upper(),
                    'team': db_team
                })

        return players

    except Exception as e:
        print(f"  ❌ Error fetching {team_code}: {e}")
        return []


async def update_player_positions(conn, players: list[dict]) -> tuple[int, int]:
    """Update player positions in database.

    Returns: (updated_count, not_found_count)
    """
    updated = 0
    not_found = 0

    for player in players:
        # Try to match by name (case-insensitive, with fuzzy matching)
        name = player['name']
        position = player['position']
        team = player['team']

        # First try exact match
        result = await conn.fetchrow("""
            UPDATE players p
            SET position = $1
            FROM (
                SELECT player_id FROM players
                WHERE LOWER(full_name) = LOWER($2)
                   OR LOWER(full_name) LIKE LOWER($3)
                LIMIT 1
            ) matched
            WHERE p.player_id = matched.player_id
            RETURNING p.player_id, p.full_name
        """, position, name, f'%{name}%')

        if result:
            updated += 1
        else:
            not_found += 1
            # Try additional matching strategies
            # Remove suffixes like Jr., III, etc.
            clean_name = name.replace(' Jr.', '').replace(' III', '').replace(' II', '').strip()
            if clean_name != name:
                result = await conn.fetchrow("""
                    UPDATE players p
                    SET position = $1
                    FROM (
                        SELECT player_id FROM players
                        WHERE LOWER(full_name) LIKE LOWER($2)
                        LIMIT 1
                    ) matched
                    WHERE p.player_id = matched.player_id
                    RETURNING p.player_id
                """, position, f'%{clean_name}%')

                if result:
                    updated += 1
                    not_found -= 1

    return updated, not_found


async def main():
    """Main function to fetch and update all player positions."""
    print("=" * 60)
    print("Basketball Reference Position Sync")
    print("=" * 60)

    conn = await get_db_connection()

    # Check current position distribution
    print("\n📊 Current position distribution:")
    current = await conn.fetch("""
        SELECT position, COUNT(*) as count
        FROM players
        WHERE position IS NOT NULL
        GROUP BY position
        ORDER BY count DESC
    """)
    for row in current:
        print(f"   {row['position']}: {row['count']}")

    # Fetch all team rosters
    print(f"\n🏀 Fetching rosters from {len(NBA_TEAMS)} teams...")
    all_players = []

    for i, team in enumerate(NBA_TEAMS):
        print(f"   [{i+1}/{len(NBA_TEAMS)}] Fetching {team}...", end=" ")
        players = fetch_team_roster(team)
        print(f"✅ {len(players)} players")
        all_players.extend(players)

        # Rate limit - Basketball Reference blocks aggressive scraping
        time.sleep(3.5)  # 3.5 seconds between requests

    print(f"\n📥 Total players fetched: {len(all_players)}")

    # Save raw data for debugging
    data_dir = Path(__file__).parent.parent / 'data'
    data_dir.mkdir(exist_ok=True)
    with open(data_dir / 'bref_positions.json', 'w') as f:
        json.dump(all_players, f, indent=2)
    print(f"   Saved to data/bref_positions.json")

    # Count positions
    pos_counts = {}
    for p in all_players:
        pos = p['position']
        pos_counts[pos] = pos_counts.get(pos, 0) + 1
    print(f"\n📊 Position distribution from BREF:")
    for pos, count in sorted(pos_counts.items()):
        print(f"   {pos}: {count}")

    # Update database
    print(f"\n💾 Updating player positions in database...")
    updated, not_found = await update_player_positions(conn, all_players)
    print(f"   ✅ Updated: {updated}")
    print(f"   ⚠️ Not found: {not_found}")

    # Check new position distribution
    print("\n📊 New position distribution:")
    new_dist = await conn.fetch("""
        SELECT position, COUNT(*) as count
        FROM players
        WHERE position IS NOT NULL
        GROUP BY position
        ORDER BY count DESC
    """)
    for row in new_dist:
        print(f"   {row['position']}: {row['count']}")

    await conn.close()
    print("\n✅ Done!")


if __name__ == '__main__':
    asyncio.run(main())
