#!/usr/bin/env python3
"""
NBA Injury Report Scraper - Multi-Source
Primary: Basketball-Reference (most reliable, simple structure)
Fallback: CBS Sports, ESPN

Usage:
    python fetch_injuries.py                  # Fetch and display all
    python fetch_injuries.py --save           # Save to database
    python fetch_injuries.py --team MIL DEN   # Filter specific teams
    python fetch_injuries.py --json           # JSON output

Returns:
    Player name, team, injury description, status (OUT/GTD/PROBABLE), update date
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

# Database configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': os.environ.get('DB_PORT', '5432'),
    'dbname': os.environ.get('DB_NAME', 'nba_stats'),
    'user': os.environ.get('DB_USER', 'chapirou'),
    'password': os.environ.get('DB_PASSWORD', '')
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

# Team abbreviation normalization
TEAM_ABBR_MAP = {
    'ATL': 'ATL', 'BOS': 'BOS', 'BRK': 'BKN', 'BKN': 'BKN', 'CHA': 'CHA', 'CHO': 'CHA',
    'CHI': 'CHI', 'CLE': 'CLE', 'DAL': 'DAL', 'DEN': 'DEN', 'DET': 'DET',
    'GSW': 'GSW', 'GS': 'GSW', 'HOU': 'HOU', 'IND': 'IND', 'LAC': 'LAC',
    'LAL': 'LAL', 'MEM': 'MEM', 'MIA': 'MIA', 'MIL': 'MIL', 'MIN': 'MIN',
    'NOP': 'NOP', 'NO': 'NOP', 'NOH': 'NOP', 'NYK': 'NYK', 'NY': 'NYK',
    'OKC': 'OKC', 'ORL': 'ORL', 'PHI': 'PHI', 'PHO': 'PHX', 'PHX': 'PHX',
    'POR': 'POR', 'SAC': 'SAC', 'SAS': 'SAS', 'SA': 'SAS', 'TOR': 'TOR',
    'UTA': 'UTA', 'WAS': 'WAS', 'WSH': 'WAS'
}

# Team full name to abbreviation
TEAM_NAME_MAP = {
    'Atlanta Hawks': 'ATL', 'Boston Celtics': 'BOS', 'Brooklyn Nets': 'BKN',
    'Charlotte Hornets': 'CHA', 'Chicago Bulls': 'CHI', 'Cleveland Cavaliers': 'CLE',
    'Dallas Mavericks': 'DAL', 'Denver Nuggets': 'DEN', 'Detroit Pistons': 'DET',
    'Golden State Warriors': 'GSW', 'Houston Rockets': 'HOU', 'Indiana Pacers': 'IND',
    'Los Angeles Clippers': 'LAC', 'LA Clippers': 'LAC', 'Los Angeles Lakers': 'LAL',
    'LA Lakers': 'LAL', 'Memphis Grizzlies': 'MEM', 'Miami Heat': 'MIA',
    'Milwaukee Bucks': 'MIL', 'Minnesota Timberwolves': 'MIN', 'New Orleans Pelicans': 'NOP',
    'New York Knicks': 'NYK', 'Oklahoma City Thunder': 'OKC', 'Orlando Magic': 'ORL',
    'Philadelphia 76ers': 'PHI', 'Phoenix Suns': 'PHX', 'Portland Trail Blazers': 'POR',
    'Sacramento Kings': 'SAC', 'San Antonio Spurs': 'SAS', 'Toronto Raptors': 'TOR',
    'Utah Jazz': 'UTA', 'Washington Wizards': 'WAS'
}


def normalize_team(team_text):
    """Normalize team name/abbreviation to standard abbreviation"""
    team_text = team_text.strip()

    # Check if it's already an abbreviation
    if team_text.upper() in TEAM_ABBR_MAP:
        return TEAM_ABBR_MAP[team_text.upper()]

    # Check full team names
    if team_text in TEAM_NAME_MAP:
        return TEAM_NAME_MAP[team_text]

    # Try partial match
    for name, abbr in TEAM_NAME_MAP.items():
        if name.lower() in team_text.lower() or team_text.lower() in name.lower():
            return abbr

    return team_text.upper()[:3]  # Fallback to first 3 chars


def parse_status(description):
    """Extract injury status from description text"""
    desc_lower = description.lower()

    if 'out for' in desc_lower or 'out indefinitely' in desc_lower or 'ruled out' in desc_lower:
        return 'OUT'
    elif 'out' in desc_lower and ('season' in desc_lower or 'week' in desc_lower or 'month' in desc_lower):
        return 'OUT'
    elif 'game time decision' in desc_lower or 'gtd' in desc_lower:
        return 'GTD'
    elif 'day-to-day' in desc_lower or 'day to day' in desc_lower or 'dtd' in desc_lower:
        return 'GTD'
    elif 'questionable' in desc_lower:
        return 'GTD'
    elif 'doubtful' in desc_lower:
        return 'DOUBTFUL'
    elif 'probable' in desc_lower:
        return 'PROBABLE'
    elif 'out' in desc_lower:
        return 'OUT'

    return 'UNKNOWN'


def parse_injury_type(description):
    """Extract injury type from description"""
    # Common patterns: "left knee", "right ankle", "back", etc.
    injury_patterns = [
        r'(left|right)?\s*(knee|ankle|foot|hamstring|calf|quad|groin|back|shoulder|wrist|finger|thumb|hip|neck|head|illness|rest|personal)',
        r'(acl|mcl|achilles|concussion|illness|covid|load management)',
    ]

    for pattern in injury_patterns:
        match = re.search(pattern, description.lower())
        if match:
            return match.group(0).strip().title()

    return None


def fetch_basketball_reference():
    """Fetch injuries from Basketball-Reference"""
    print("🏥 Fetching from Basketball-Reference...")

    url = "https://www.basketball-reference.com/friv/injuries.cgi"
    response = requests.get(url, headers=HEADERS, timeout=30)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')
    injuries = []

    # Find the injuries table
    table = soup.find('table', {'id': 'injuries'}) or soup.find('table')

    if not table:
        print("  Warning: Could not find injuries table")
        return injuries

    # Parse rows from tbody
    tbody = table.find('tbody')
    rows = tbody.find_all('tr') if tbody else table.find_all('tr')

    for row in rows:
        # Basketball-Reference uses <th> for player column, <td> for others
        player_cell = row.find('th', {'data-stat': 'player'})
        team_cell = row.find('td', {'data-stat': 'team_name'})
        date_cell = row.find('td', {'data-stat': 'date_update'})
        note_cell = row.find('td', {'data-stat': 'note'})

        # Skip if missing required cells
        if not all([player_cell, team_cell, date_cell, note_cell]):
            continue

        try:
            # Extract player name
            player_link = player_cell.find('a')
            player_name = player_link.get_text(strip=True) if player_link else player_cell.get_text(strip=True)

            # Extract team (full name like "Denver Nuggets")
            team_link = team_cell.find('a')
            team_text = team_link.get_text(strip=True) if team_link else team_cell.get_text(strip=True)
            team_abbr = normalize_team(team_text)

            # Extract update date
            update_date = date_cell.get_text(strip=True)

            # Extract description
            description = note_cell.get_text(strip=True)

            # Parse status and injury type
            status = parse_status(description)
            injury_type = parse_injury_type(description)

            injuries.append({
                'player_name': player_name,
                'team_abbr': team_abbr,
                'update_date': update_date,
                'description': description,
                'status': status,
                'injury_type': injury_type,
                'source': 'Basketball-Reference',
                'scraped_at': datetime.now()
            })

        except Exception as e:
            print(f"  Warning: Error parsing row: {e}")
            continue

    print(f"  ✅ Found {len(injuries)} injury records")
    return injuries


def display_injuries(injuries, team_filter=None):
    """Display injuries in formatted table"""
    if team_filter:
        team_filter = [t.upper() for t in team_filter]
        injuries = [i for i in injuries if i.get('team_abbr') in team_filter]

    if not injuries:
        print("\n  No injuries found for specified teams")
        return

    # Group by team
    by_team = {}
    for inj in injuries:
        team = inj.get('team_abbr', 'UNK')
        if team not in by_team:
            by_team[team] = []
        by_team[team].append(inj)

    print("\n" + "="*80)
    print(f"🏥 NBA INJURY REPORT - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("="*80)

    status_order = {'OUT': 0, 'DOUBTFUL': 1, 'GTD': 2, 'PROBABLE': 3, 'UNKNOWN': 4}

    for team in sorted(by_team.keys()):
        team_injuries = sorted(by_team[team], key=lambda x: status_order.get(x.get('status', 'UNKNOWN'), 5))

        # Count by status
        out_count = sum(1 for i in team_injuries if i.get('status') == 'OUT')
        gtd_count = sum(1 for i in team_injuries if i.get('status') in ['GTD', 'DOUBTFUL'])

        print(f"\n📋 {team} ({len(team_injuries)} players: {out_count} OUT, {gtd_count} GTD)")
        print("-"*70)

        for inj in team_injuries:
            status = inj.get('status', 'UNK')
            emoji = {'OUT': '🔴', 'GTD': '🟡', 'DOUBTFUL': '🟠', 'PROBABLE': '🟢'}.get(status, '⚪')

            player = inj.get('player_name', 'Unknown')[:22].ljust(22)
            injury = (inj.get('injury_type') or 'Unknown')[:15].ljust(15)
            updated = inj.get('update_date', '')[:10]

            print(f"  {emoji} {status:8} │ {player} │ {injury} │ {updated}")

    print("\n" + "="*80)
    total_out = sum(1 for i in injuries if i.get('status') == 'OUT')
    total_gtd = sum(1 for i in injuries if i.get('status') in ['GTD', 'DOUBTFUL'])
    print(f"Total: {len(injuries)} players ({total_out} OUT, {total_gtd} GTD)")
    print(f"Source: Basketball-Reference | Updated: {datetime.now().strftime('%H:%M:%S')}")


def save_to_database(injuries):
    """Save injuries to database"""
    if not injuries:
        print("  No injuries to save")
        return

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    try:
        # Create/update table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS injury_reports (
                report_id SERIAL PRIMARY KEY,
                player_name TEXT NOT NULL,
                team_abbr VARCHAR(3),
                team_id BIGINT REFERENCES teams(team_id),
                injury_type TEXT,
                status VARCHAR(20),
                description TEXT,
                update_date TEXT,
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
                inj.get('injury_type'),
                inj.get('status'),
                inj.get('description'),
                inj.get('update_date'),
                inj.get('source'),
                inj.get('scraped_at'),
                today
            ))

        # Upsert
        execute_values(cur, """
            INSERT INTO injury_reports
            (player_name, team_abbr, team_id, injury_type, status, description,
             update_date, source, scraped_at, report_date)
            VALUES %s
            ON CONFLICT (player_name, team_abbr, report_date)
            DO UPDATE SET
                injury_type = EXCLUDED.injury_type,
                status = EXCLUDED.status,
                description = EXCLUDED.description,
                update_date = EXCLUDED.update_date,
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


def main():
    parser = argparse.ArgumentParser(description='Fetch NBA injury reports')
    parser.add_argument('--save', action='store_true', help='Save to database')
    parser.add_argument('--team', nargs='+', type=str, help='Filter by team abbreviations (e.g., MIL DEN)')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    args = parser.parse_args()

    try:
        # Fetch injuries
        injuries = fetch_basketball_reference()

        if args.json:
            output = [{
                'player': i.get('player_name'),
                'team': i.get('team_abbr'),
                'status': i.get('status'),
                'injury': i.get('injury_type'),
                'description': i.get('description'),
                'updated': i.get('update_date')
            } for i in injuries]
            print(json.dumps(output, indent=2, default=str))
        else:
            display_injuries(injuries, args.team)

        if args.save:
            save_to_database(injuries)

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
