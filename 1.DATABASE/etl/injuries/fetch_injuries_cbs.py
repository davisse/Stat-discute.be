#!/usr/bin/env python3
"""
NBA Injury Report Scraper - CBS Sports
Fetches current injury status for all NBA teams from CBS Sports

Usage:
    python fetch_injuries_cbs.py              # Fetch and display
    python fetch_injuries_cbs.py --save       # Fetch and save to database
    python fetch_injuries_cbs.py --team MIL   # Fetch specific team
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

# Add parent directory to path for config
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Database configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': os.environ.get('DB_PORT', '5432'),
    'dbname': os.environ.get('DB_NAME', 'nba_stats'),
    'user': os.environ.get('DB_USER', 'chapirou'),
    'password': os.environ.get('DB_PASSWORD', '')
}

# CBS Sports URL
CBS_INJURIES_URL = "https://www.cbssports.com/nba/injuries/"

# Team abbreviation mapping (CBS name -> our abbreviation)
TEAM_MAPPING = {
    'Atlanta Hawks': 'ATL',
    'Boston Celtics': 'BOS',
    'Brooklyn Nets': 'BKN',
    'Charlotte Hornets': 'CHA',
    'Chicago Bulls': 'CHI',
    'Cleveland Cavaliers': 'CLE',
    'Dallas Mavericks': 'DAL',
    'Denver Nuggets': 'DEN',
    'Detroit Pistons': 'DET',
    'Golden State Warriors': 'GSW',
    'Houston Rockets': 'HOU',
    'Indiana Pacers': 'IND',
    'LA Clippers': 'LAC',
    'Los Angeles Clippers': 'LAC',
    'Los Angeles Lakers': 'LAL',
    'LA Lakers': 'LAL',
    'Memphis Grizzlies': 'MEM',
    'Miami Heat': 'MIA',
    'Milwaukee Bucks': 'MIL',
    'Minnesota Timberwolves': 'MIN',
    'New Orleans Pelicans': 'NOP',
    'New York Knicks': 'NYK',
    'Oklahoma City Thunder': 'OKC',
    'Orlando Magic': 'ORL',
    'Philadelphia 76ers': 'PHI',
    'Phoenix Suns': 'PHX',
    'Portland Trail Blazers': 'POR',
    'Sacramento Kings': 'SAC',
    'San Antonio Spurs': 'SAS',
    'Toronto Raptors': 'TOR',
    'Utah Jazz': 'UTA',
    'Washington Wizards': 'WAS'
}

# Status normalization
STATUS_MAPPING = {
    'out': 'OUT',
    'day-to-day': 'GTD',
    'd2d': 'GTD',
    'dtd': 'GTD',
    'questionable': 'GTD',
    'doubtful': 'DOUBTFUL',
    'probable': 'PROBABLE',
    'game time decision': 'GTD',
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://www.cbssports.com/nba/',
}


def fetch_cbs_injuries():
    """Fetch injury data from CBS Sports"""
    print(f"🏥 Fetching injuries from CBS Sports...")

    response = requests.get(CBS_INJURIES_URL, headers=HEADERS, timeout=30)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')
    injuries = []

    # Find all team sections
    team_sections = soup.find_all('div', class_='TeamInjuries')

    if not team_sections:
        # Alternative: look for table structure
        team_sections = soup.find_all('section', class_='TableBaseWrapper')

    if not team_sections:
        # Try another approach - find team headers
        print("  Trying alternative parsing method...")
        injuries = parse_alternative_structure(soup)
        return injuries

    for section in team_sections:
        # Get team name
        team_header = section.find(['h3', 'h4', 'span'], class_=lambda x: x and 'team' in x.lower()) if section else None
        if not team_header:
            team_header = section.find_previous(['h3', 'h4'])

        team_name = team_header.get_text(strip=True) if team_header else "Unknown"
        team_abbr = TEAM_MAPPING.get(team_name, None)

        if not team_abbr:
            # Try to extract from URL or other attributes
            team_link = section.find('a', href=re.compile(r'/nba/teams/\w+'))
            if team_link:
                team_slug = team_link['href'].split('/')[-2]
                team_abbr = find_team_by_slug(team_slug)

        # Find player rows
        rows = section.find_all('tr')
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 3:
                player_name = cells[0].get_text(strip=True)
                if player_name and player_name != 'Player' and player_name != 'NAME':
                    injury_data = parse_injury_row(cells, team_abbr, team_name)
                    if injury_data:
                        injuries.append(injury_data)

    print(f"  Found {len(injuries)} injury records")
    return injuries


def parse_alternative_structure(soup):
    """Alternative parsing for different page structure"""
    injuries = []

    # Look for all tables with injury data
    tables = soup.find_all('table')

    current_team = None
    current_abbr = None

    for element in soup.find_all(['h3', 'h4', 'tr', 'div']):
        # Check if this is a team header
        if element.name in ['h3', 'h4', 'div']:
            text = element.get_text(strip=True)
            for team_name, abbr in TEAM_MAPPING.items():
                if team_name.lower() in text.lower():
                    current_team = team_name
                    current_abbr = abbr
                    break

        # Check if this is a player row
        elif element.name == 'tr' and current_abbr:
            cells = element.find_all(['td', 'th'])
            if len(cells) >= 3:
                player_name = cells[0].get_text(strip=True)
                if player_name and player_name not in ['Player', 'NAME', 'Name', '']:
                    injury_data = parse_injury_row(cells, current_abbr, current_team)
                    if injury_data:
                        injuries.append(injury_data)

    return injuries


def parse_injury_row(cells, team_abbr, team_name):
    """Parse a single injury row"""
    try:
        # Standard CBS format: Name, Position, Updated, Injury, Status
        player_name = cells[0].get_text(strip=True)

        # Skip header rows
        if player_name.upper() in ['PLAYER', 'NAME', '']:
            return None

        position = cells[1].get_text(strip=True) if len(cells) > 1 else ''
        updated = cells[2].get_text(strip=True) if len(cells) > 2 else ''
        injury_type = cells[3].get_text(strip=True) if len(cells) > 3 else ''
        status_raw = cells[4].get_text(strip=True) if len(cells) > 4 else ''

        # Normalize status
        status = normalize_status(status_raw)

        # Parse expected return date if available
        return_date = extract_return_date(status_raw)

        return {
            'player_name': player_name,
            'team_abbr': team_abbr,
            'team_name': team_name,
            'position': position,
            'injury_type': injury_type,
            'status': status,
            'status_raw': status_raw,
            'return_date': return_date,
            'updated': updated,
            'source': 'CBS Sports',
            'scraped_at': datetime.now()
        }
    except Exception as e:
        print(f"  Warning: Error parsing row: {e}")
        return None


def normalize_status(status_raw):
    """Normalize injury status to standard values"""
    status_lower = status_raw.lower()

    for key, value in STATUS_MAPPING.items():
        if key in status_lower:
            return value

    if 'out' in status_lower:
        return 'OUT'
    elif 'week' in status_lower or 'month' in status_lower:
        return 'OUT'

    return 'UNKNOWN'


def extract_return_date(status_text):
    """Extract expected return date from status text"""
    # Pattern: "Expected to be out until at least Jan 13"
    patterns = [
        r'until (?:at least )?(\w+ \d+)',
        r'return[s]? (\w+ \d+)',
        r'out (\d+[-–]\d+ (?:weeks?|days?))',
    ]

    for pattern in patterns:
        match = re.search(pattern, status_text, re.IGNORECASE)
        if match:
            return match.group(1)

    return None


def find_team_by_slug(slug):
    """Find team abbreviation by URL slug"""
    slug_mapping = {
        'hawks': 'ATL', 'celtics': 'BOS', 'nets': 'BKN', 'hornets': 'CHA',
        'bulls': 'CHI', 'cavaliers': 'CLE', 'cavs': 'CLE', 'mavericks': 'DAL',
        'mavs': 'DAL', 'nuggets': 'DEN', 'pistons': 'DET', 'warriors': 'GSW',
        'rockets': 'HOU', 'pacers': 'IND', 'clippers': 'LAC', 'lakers': 'LAL',
        'grizzlies': 'MEM', 'heat': 'MIA', 'bucks': 'MIL', 'timberwolves': 'MIN',
        'wolves': 'MIN', 'pelicans': 'NOP', 'knicks': 'NYK', 'thunder': 'OKC',
        'magic': 'ORL', '76ers': 'PHI', 'sixers': 'PHI', 'suns': 'PHX',
        'blazers': 'POR', 'trailblazers': 'POR', 'kings': 'SAC', 'spurs': 'SAS',
        'raptors': 'TOR', 'jazz': 'UTA', 'wizards': 'WAS'
    }
    return slug_mapping.get(slug.lower())


def fetch_espn_injuries():
    """Fetch injury data from ESPN (JSON embedded in page)"""
    print(f"🏥 Fetching injuries from ESPN...")

    url = "https://www.espn.com/nba/injuries"
    response = requests.get(url, headers=HEADERS, timeout=30)
    response.raise_for_status()

    injuries = []
    soup = BeautifulSoup(response.text, 'html.parser')

    # Find all team sections
    team_sections = soup.find_all('div', class_='Table__Title')

    for team_section in team_sections:
        team_name = team_section.get_text(strip=True)
        team_abbr = TEAM_MAPPING.get(team_name)

        # Find the table following this header
        table = team_section.find_next('table')
        if not table:
            continue

        rows = table.find_all('tr')[1:]  # Skip header
        for row in rows:
            cells = row.find_all('td')
            if len(cells) >= 3:
                player_name = cells[0].get_text(strip=True)
                status = cells[1].get_text(strip=True) if len(cells) > 1 else ''
                comment = cells[2].get_text(strip=True) if len(cells) > 2 else ''

                injuries.append({
                    'player_name': player_name,
                    'team_abbr': team_abbr,
                    'team_name': team_name,
                    'status': normalize_status(status),
                    'status_raw': status,
                    'injury_type': comment,
                    'source': 'ESPN',
                    'scraped_at': datetime.now()
                })

    print(f"  Found {len(injuries)} injury records")
    return injuries


def save_to_database(injuries):
    """Save injuries to database"""
    if not injuries:
        print("  No injuries to save")
        return

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    try:
        # Create table if not exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS injury_reports (
                report_id SERIAL PRIMARY KEY,
                player_name TEXT NOT NULL,
                team_abbr VARCHAR(3),
                team_id BIGINT REFERENCES teams(team_id),
                position VARCHAR(5),
                injury_type TEXT,
                status VARCHAR(20),
                status_raw TEXT,
                return_date TEXT,
                updated TEXT,
                source VARCHAR(50),
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                report_date DATE DEFAULT CURRENT_DATE,
                UNIQUE(player_name, team_abbr, report_date)
            );

            CREATE INDEX IF NOT EXISTS idx_injury_reports_team ON injury_reports(team_abbr);
            CREATE INDEX IF NOT EXISTS idx_injury_reports_date ON injury_reports(report_date);
            CREATE INDEX IF NOT EXISTS idx_injury_reports_status ON injury_reports(status);
        """)

        # Get team_id mapping
        cur.execute("SELECT abbreviation, team_id FROM teams")
        team_ids = {row[0]: row[1] for row in cur.fetchall()}

        # Prepare data
        today = datetime.now().date()
        insert_data = []
        for inj in injuries:
            team_id = team_ids.get(inj.get('team_abbr'))
            insert_data.append((
                inj.get('player_name'),
                inj.get('team_abbr'),
                team_id,
                inj.get('position'),
                inj.get('injury_type'),
                inj.get('status'),
                inj.get('status_raw'),
                inj.get('return_date'),
                inj.get('updated'),
                inj.get('source'),
                inj.get('scraped_at'),
                today
            ))

        # Upsert data
        execute_values(cur, """
            INSERT INTO injury_reports
            (player_name, team_abbr, team_id, position, injury_type, status,
             status_raw, return_date, updated, source, scraped_at, report_date)
            VALUES %s
            ON CONFLICT (player_name, team_abbr, report_date)
            DO UPDATE SET
                position = EXCLUDED.position,
                injury_type = EXCLUDED.injury_type,
                status = EXCLUDED.status,
                status_raw = EXCLUDED.status_raw,
                return_date = EXCLUDED.return_date,
                updated = EXCLUDED.updated,
                source = EXCLUDED.source,
                scraped_at = EXCLUDED.scraped_at
        """, insert_data)

        conn.commit()
        print(f"  ✅ Saved {len(insert_data)} injury records to database")

    except Exception as e:
        conn.rollback()
        print(f"  ❌ Error saving to database: {e}")
        raise
    finally:
        cur.close()
        conn.close()


def display_injuries(injuries, team_filter=None):
    """Display injuries in formatted table"""
    if team_filter:
        injuries = [i for i in injuries if i.get('team_abbr') == team_filter.upper()]

    if not injuries:
        print("  No injuries found")
        return

    # Group by team
    by_team = {}
    for inj in injuries:
        team = inj.get('team_abbr', 'UNK')
        if team not in by_team:
            by_team[team] = []
        by_team[team].append(inj)

    # Display
    print("\n" + "="*80)
    print("🏥 NBA INJURY REPORT")
    print("="*80)

    for team in sorted(by_team.keys()):
        team_injuries = by_team[team]
        print(f"\n📋 {team} ({len(team_injuries)} injured)")
        print("-"*60)

        for inj in sorted(team_injuries, key=lambda x: x.get('status', 'Z')):
            status = inj.get('status', 'UNK')
            status_emoji = {'OUT': '🔴', 'GTD': '🟡', 'DOUBTFUL': '🟠', 'PROBABLE': '🟢'}.get(status, '⚪')

            player = inj.get('player_name', 'Unknown')[:25].ljust(25)
            injury = (inj.get('injury_type') or 'Unknown')[:20].ljust(20)

            print(f"  {status_emoji} {status:10} | {player} | {injury}")

    print("\n" + "="*80)
    print(f"Total: {len(injuries)} players injured")
    print(f"Scraped at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


def main():
    parser = argparse.ArgumentParser(description='Fetch NBA injury reports')
    parser.add_argument('--save', action='store_true', help='Save to database')
    parser.add_argument('--team', type=str, help='Filter by team abbreviation (e.g., MIL)')
    parser.add_argument('--source', type=str, default='cbs', choices=['cbs', 'espn', 'all'],
                       help='Data source (default: cbs)')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    args = parser.parse_args()

    injuries = []

    if args.source in ['cbs', 'all']:
        try:
            injuries.extend(fetch_cbs_injuries())
        except Exception as e:
            print(f"  ⚠️ CBS fetch error: {e}")

    if args.source in ['espn', 'all']:
        try:
            injuries.extend(fetch_espn_injuries())
        except Exception as e:
            print(f"  ⚠️ ESPN fetch error: {e}")

    if args.json:
        # JSON output
        output = [{
            'player': i.get('player_name'),
            'team': i.get('team_abbr'),
            'status': i.get('status'),
            'injury': i.get('injury_type'),
            'return': i.get('return_date')
        } for i in injuries]
        print(json.dumps(output, indent=2, default=str))
    else:
        display_injuries(injuries, args.team)

    if args.save:
        save_to_database(injuries)


if __name__ == "__main__":
    main()
