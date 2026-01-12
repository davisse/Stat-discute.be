#!/usr/bin/env python3
"""
RotoWire NBA Lineups Scraper
Fetches projected starting lineups and injury statuses from RotoWire

Usage:
    python fetch_rotowire_lineups.py              # Fetch today's lineups
    python fetch_rotowire_lineups.py --save       # Fetch and save to database
    python fetch_rotowire_lineups.py --team MIL   # Filter by team

RotoWire provides:
- Projected starting 5 for each game
- Player injury status (OUT, GTD, etc.)
- Game time and opponent info
"""

import requests
from bs4 import BeautifulSoup
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import argparse
import json
import re
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Database configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': os.environ.get('DB_PORT', '5432'),
    'dbname': os.environ.get('DB_NAME', 'nba_stats'),
    'user': os.environ.get('DB_USER', 'chapirou'),
    'password': os.environ.get('DB_PASSWORD', '')
}

# RotoWire URLs
ROTOWIRE_LINEUPS_URL = "https://www.rotowire.com/basketball/nba-lineups.php"
ROTOWIRE_INJURY_URL = "https://www.rotowire.com/basketball/injury-report.php"

# Team abbreviation mapping
TEAM_MAPPING = {
    'ATL': 'ATL', 'BOS': 'BOS', 'BKN': 'BKN', 'BRK': 'BKN', 'CHA': 'CHA',
    'CHI': 'CHI', 'CLE': 'CLE', 'DAL': 'DAL', 'DEN': 'DEN', 'DET': 'DET',
    'GSW': 'GSW', 'GS': 'GSW', 'HOU': 'HOU', 'IND': 'IND', 'LAC': 'LAC',
    'LAL': 'LAL', 'MEM': 'MEM', 'MIA': 'MIA', 'MIL': 'MIL', 'MIN': 'MIN',
    'NOP': 'NOP', 'NO': 'NOP', 'NYK': 'NYK', 'NY': 'NYK', 'OKC': 'OKC',
    'ORL': 'ORL', 'PHI': 'PHI', 'PHX': 'PHX', 'PHO': 'PHX', 'POR': 'POR',
    'SAC': 'SAC', 'SAS': 'SAS', 'SA': 'SAS', 'TOR': 'TOR', 'UTA': 'UTA',
    'WAS': 'WAS'
}

TEAM_NAMES = {
    'Hawks': 'ATL', 'Celtics': 'BOS', 'Nets': 'BKN', 'Hornets': 'CHA',
    'Bulls': 'CHI', 'Cavaliers': 'CLE', 'Mavericks': 'DAL', 'Nuggets': 'DEN',
    'Pistons': 'DET', 'Warriors': 'GSW', 'Rockets': 'HOU', 'Pacers': 'IND',
    'Clippers': 'LAC', 'Lakers': 'LAL', 'Grizzlies': 'MEM', 'Heat': 'MIA',
    'Bucks': 'MIL', 'Timberwolves': 'MIN', 'Pelicans': 'NOP', 'Knicks': 'NYK',
    'Thunder': 'OKC', 'Magic': 'ORL', '76ers': 'PHI', 'Suns': 'PHX',
    'Trail Blazers': 'POR', 'Blazers': 'POR', 'Kings': 'SAC', 'Spurs': 'SAS',
    'Raptors': 'TOR', 'Jazz': 'UTA', 'Wizards': 'WAS'
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://www.rotowire.com/',
}


def fetch_rotowire_lineups():
    """Fetch projected lineups from RotoWire

    Finds all NBA game lineup boxes (div.lineup.is-nba) and parses
    team info, starters, and injury statuses.
    """
    print(f"📋 Fetching RotoWire lineups...")

    response = requests.get(ROTOWIRE_LINEUPS_URL, headers=HEADERS, timeout=30)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')
    games = []

    # Find all NBA game lineup boxes (class="lineup is-nba")
    lineup_boxes = soup.find_all('div', class_='lineup')
    # Filter to only NBA games (has is-nba class)
    nba_boxes = [box for box in lineup_boxes if 'is-nba' in box.get('class', [])]

    print(f"  Found {len(nba_boxes)} NBA game boxes (from {len(lineup_boxes)} total)")

    for box in nba_boxes:
        game_data = parse_lineup_box(box)
        if game_data:
            games.append(game_data)
            print(f"    ✓ Parsed: {game_data['away_team']} @ {game_data['home_team']}")

    print(f"  Successfully parsed {len(games)} games")
    return games


def parse_lineup_box(box):
    """Parse a single game lineup box from RotoWire

    RotoWire 2025-26 HTML structure:
    - div.lineup.is-nba (game container)
      - div.lineup__time (game time)
      - div.lineup__abbr (appears twice: 1st=away, 2nd=home)
      - ul.lineup__list (appears twice: 1st=away, 2nd=home)
        - li.lineup__player
          - div.lineup__pos (position)
          - a (player name link)
          - span.lineup__inj (injury status: Out, Ques, Prob, GTD)
    """
    try:
        game = {
            'game_time': None,
            'away_team': None,
            'home_team': None,
            'away_lineup': [],
            'home_lineup': [],
            'away_injuries': [],
            'home_injuries': [],
            'scraped_at': datetime.now()
        }

        # Get game time from div.lineup__time
        time_elem = box.find('div', class_='lineup__time')
        if time_elem:
            game['game_time'] = time_elem.get_text(strip=True)

        # Get team abbreviations from div.lineup__abbr (first=away, second=home)
        team_abbrs = box.find_all('div', class_='lineup__abbr')
        if len(team_abbrs) >= 2:
            away_abbr = team_abbrs[0].get_text(strip=True).upper()
            home_abbr = team_abbrs[1].get_text(strip=True).upper()
            game['away_team'] = TEAM_MAPPING.get(away_abbr, away_abbr)
            game['home_team'] = TEAM_MAPPING.get(home_abbr, home_abbr)

        # Get player lineups from ul.lineup__list (first=away, second=home)
        lineup_lists = box.find_all('ul', class_='lineup__list')
        if len(lineup_lists) >= 2:
            # Parse away team lineup (first list)
            away_players = lineup_lists[0].find_all('li', class_='lineup__player')
            for player_elem in away_players:
                player = parse_player_element(player_elem)
                if player:
                    if player['status'] == 'OUT':
                        game['away_injuries'].append(player)
                    else:
                        game['away_lineup'].append(player)

            # Parse home team lineup (second list)
            home_players = lineup_lists[1].find_all('li', class_='lineup__player')
            for player_elem in home_players:
                player = parse_player_element(player_elem)
                if player:
                    if player['status'] == 'OUT':
                        game['home_injuries'].append(player)
                    else:
                        game['home_lineup'].append(player)

        # Only return if we have valid data
        if game['away_team'] and game['home_team']:
            return game

        return None

    except Exception as e:
        print(f"  Warning: Error parsing lineup box: {e}")
        import traceback
        traceback.print_exc()
        return None


def parse_player_element(elem):
    """Parse a player element from RotoWire lineup list

    Structure:
    li.lineup__player
      - div.lineup__pos (position: PG, SG, SF, PF, C)
      - a (player name link)
      - span.lineup__inj (injury status: Out, Ques, Prob, GTD)
    """
    try:
        player = {
            'name': None,
            'position': None,
            'status': 'CONFIRMED',  # Default to confirmed starter
            'injury': None
        }

        # Get position from div.lineup__pos
        pos_elem = elem.find('div', class_='lineup__pos')
        if pos_elem:
            player['position'] = pos_elem.get_text(strip=True)

        # Get player name from <a> tag
        name_link = elem.find('a')
        if name_link:
            player['name'] = name_link.get_text(strip=True)

        # Get injury status from span.lineup__inj
        inj_elem = elem.find('span', class_='lineup__inj')
        if inj_elem:
            status_text = inj_elem.get_text(strip=True).upper()
            if 'OUT' in status_text:
                player['status'] = 'OUT'
                player['injury'] = 'Out'
            elif 'QUES' in status_text or 'Q' == status_text:
                player['status'] = 'GTD'
                player['injury'] = 'Questionable'
            elif 'PROB' in status_text or 'P' == status_text:
                player['status'] = 'PROBABLE'
                player['injury'] = 'Probable'
            elif 'GTD' in status_text or 'DTD' in status_text:
                player['status'] = 'GTD'
                player['injury'] = 'Game-Time Decision'
            elif 'DOUB' in status_text or 'D' == status_text:
                player['status'] = 'DOUBTFUL'
                player['injury'] = 'Doubtful'
            else:
                player['status'] = 'GTD'
                player['injury'] = status_text

        return player if player['name'] else None

    except Exception as e:
        print(f"  Warning: Error parsing player element: {e}")
        return None


def display_lineups(games, team_filter=None):
    """Display lineups in formatted output"""
    if team_filter:
        team_filter = team_filter.upper()
        games = [g for g in games if
                 g.get('away_team') == team_filter or g.get('home_team') == team_filter]

    if not games:
        print("  No games found")
        return

    print("\n" + "="*80)
    print("📋 NBA PROJECTED LINEUPS - " + datetime.now().strftime("%Y-%m-%d"))
    print("="*80)

    for game in games:
        away = game.get('away_team', '???')
        home = game.get('home_team', '???')
        time = game.get('game_time', 'TBD')

        print(f"\n🏀 {away} @ {home} - {time}")
        print("-"*60)

        # Away team lineup
        print(f"\n  {away} Starters:")
        for i, player in enumerate(game.get('away_lineup', [])[:5], 1):
            status_emoji = get_status_emoji(player.get('status', 'ACTIVE'))
            pos = player.get('position', '?')[:2].ljust(2)
            name = player.get('name', 'Unknown')[:25].ljust(25)
            print(f"    {i}. [{pos}] {name} {status_emoji}")

        # Away injuries
        if game.get('away_injuries'):
            print(f"  🏥 {away} Injuries:")
            for inj in game['away_injuries']:
                print(f"    🔴 {inj['name']} - {inj.get('injury', 'Unknown')} ({inj.get('status', 'OUT')})")

        # Home team lineup
        print(f"\n  {home} Starters:")
        for i, player in enumerate(game.get('home_lineup', [])[:5], 1):
            status_emoji = get_status_emoji(player.get('status', 'ACTIVE'))
            pos = player.get('position', '?')[:2].ljust(2)
            name = player.get('name', 'Unknown')[:25].ljust(25)
            print(f"    {i}. [{pos}] {name} {status_emoji}")

        # Home injuries
        if game.get('home_injuries'):
            print(f"  🏥 {home} Injuries:")
            for inj in game['home_injuries']:
                print(f"    🔴 {inj['name']} - {inj.get('injury', 'Unknown')} ({inj.get('status', 'OUT')})")

    print("\n" + "="*80)
    print(f"Total: {len(games)} games")
    print(f"Source: RotoWire | Scraped: {datetime.now().strftime('%H:%M:%S')}")


def get_status_emoji(status):
    """Get emoji for injury status"""
    return {
        'OUT': '🔴',
        'GTD': '🟡',
        'DOUBTFUL': '🟠',
        'PROBABLE': '🟢',
        'CONFIRMED': '✅',
        'ACTIVE': '✅'
    }.get(status, '⚪')


def save_to_database(games):
    """Save lineups to database"""
    if not games:
        print("  No games to save")
        return

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    try:
        # Create table if not exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS projected_lineups (
                lineup_id SERIAL PRIMARY KEY,
                game_date DATE DEFAULT CURRENT_DATE,
                game_time TEXT,
                away_team VARCHAR(3),
                home_team VARCHAR(3),
                away_lineup JSONB,
                home_lineup JSONB,
                away_injuries JSONB,
                home_injuries JSONB,
                source VARCHAR(50) DEFAULT 'RotoWire',
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(away_team, home_team, game_date)
            );

            CREATE INDEX IF NOT EXISTS idx_lineups_date ON projected_lineups(game_date);
            CREATE INDEX IF NOT EXISTS idx_lineups_teams ON projected_lineups(away_team, home_team);
        """)

        # Prepare data
        today = datetime.now().date()
        insert_data = []
        for game in games:
            insert_data.append((
                today,
                game.get('game_time'),
                game.get('away_team'),
                game.get('home_team'),
                json.dumps(game.get('away_lineup', [])),
                json.dumps(game.get('home_lineup', [])),
                json.dumps(game.get('away_injuries', [])),
                json.dumps(game.get('home_injuries', [])),
                'RotoWire',
                game.get('scraped_at', datetime.now())
            ))

        # Upsert
        execute_values(cur, """
            INSERT INTO projected_lineups
            (game_date, game_time, away_team, home_team, away_lineup, home_lineup,
             away_injuries, home_injuries, source, scraped_at)
            VALUES %s
            ON CONFLICT (away_team, home_team, game_date)
            DO UPDATE SET
                game_time = EXCLUDED.game_time,
                away_lineup = EXCLUDED.away_lineup,
                home_lineup = EXCLUDED.home_lineup,
                away_injuries = EXCLUDED.away_injuries,
                home_injuries = EXCLUDED.home_injuries,
                scraped_at = EXCLUDED.scraped_at
        """, insert_data)

        conn.commit()
        print(f"  ✅ Saved {len(insert_data)} game lineups to database")

    except Exception as e:
        conn.rollback()
        print(f"  ❌ Error saving to database: {e}")
        raise
    finally:
        cur.close()
        conn.close()


def main():
    parser = argparse.ArgumentParser(description='Fetch RotoWire NBA lineups')
    parser.add_argument('--save', action='store_true', help='Save to database')
    parser.add_argument('--team', type=str, help='Filter by team abbreviation')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    args = parser.parse_args()

    try:
        games = fetch_rotowire_lineups()

        if args.json:
            print(json.dumps(games, indent=2, default=str))
        else:
            display_lineups(games, args.team)

        if args.save:
            save_to_database(games)

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
