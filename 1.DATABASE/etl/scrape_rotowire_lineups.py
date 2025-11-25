#!/usr/bin/env python3
"""
RotoWire NBA Daily Lineups Scraper

Scrapes starting lineups, injury status, and betting odds from RotoWire.
Critical data source for fantasy basketball, DFS, and betting analytics.

Usage:
    python3 scrape_rotowire_lineups.py [--date today|tomorrow]

Data scraped:
    - Starting lineups (5 positions per team)
    - Injury status (Prob, Ques, Doubt, Out)
    - Betting odds (moneyline, spread, O/U)
    - Referee assignments
    - Team records

Recommended schedule:
    - 8 AM ET: Morning lineups
    - 2 PM ET: Afternoon updates
    - 5 PM ET: Final pre-game confirmations
"""

import sys
import os
import re
from datetime import datetime, date
from typing import Dict, List, Optional, Tuple
import json
import argparse

import requests
from bs4 import BeautifulSoup
import psycopg2
from psycopg2.extras import execute_values

# Add parent directory to path for config imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'nba_stats'),
    'user': os.getenv('DB_USER', 'chapirou'),
    'password': os.getenv('DB_PASSWORD', '')
}

# RotoWire URLs
BASE_URL = 'https://www.rotowire.com/basketball/nba-lineups.php'
TODAY_URL = BASE_URL
TOMORROW_URL = f'{BASE_URL}?date=tomorrow'


class RotoWireLineupsScraper:
    """Scraper for RotoWire NBA daily lineups page."""

    def __init__(self, db_config: Dict):
        """Initialize scraper with database connection."""
        self.db_config = db_config
        self.conn = None
        self.cursor = None
        self.session = requests.Session()

        # Headers to avoid bot detection
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': 'https://www.rotowire.com/',
        })

    def connect_db(self):
        """Establish database connection."""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.cursor = self.conn.cursor()
            print("✅ Database connected")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            sys.exit(1)

    def close_db(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("Database connection closed")

    def fetch_page(self, url: str) -> str:
        """Fetch HTML content from URL."""
        try:
            # First visit homepage to establish session and get cookies
            print(f"🔗 Establishing session with RotoWire...")
            homepage_response = self.session.get('https://www.rotowire.com/', timeout=30)
            print(f"  Cookies received: {len(self.session.cookies)} cookies")

            # Now fetch the target page
            print(f"🌐 Fetching lineups page: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()

            print(f"✅ Fetched page: {url}")
            print(f"🔍 Response length: {len(response.text)} chars")
            return response.text
        except Exception as e:
            print(f"❌ Failed to fetch page: {e}")
            return None

    def parse_team_abbreviation(self, soup_element) -> Optional[str]:
        """Extract team abbreviation from logo/link element."""
        try:
            # Try to find team abbreviation from link or img alt text
            link = soup_element.find('a')
            if link and 'href' in link.attrs:
                # Extract from URL like "/basketball/nba-depth-charts/heat-depth-chart-mia"
                match = re.search(r'-([A-Z]{3})$', link['href'].upper())
                if match:
                    return match.group(1)

            # Try from StaticText
            text = soup_element.get_text(strip=True)
            if len(text) == 3 and text.isupper():
                return text

            return None
        except Exception as e:
            print(f"⚠️ Error parsing team abbreviation: {e}")
            return None

    def parse_record(self, text: str) -> Optional[str]:
        """Extract record from text like 'Heat (10-6)'."""
        match = re.search(r'\((\d+-\d+)\)', text)
        return match.group(1) if match else None

    def parse_player_info(self, player_element) -> Optional[Dict]:
        """Extract player name and RotoWire ID from link element."""
        try:
            link = player_element.find('a')
            if not link:
                return None

            # Extract player name
            player_name = link.get_text(strip=True)

            # Extract RotoWire player ID from URL
            # Example: /basketball/player/davion-mitchell-5354 -> 5354
            href = link.get('href', '')
            match = re.search(r'/player/[^/]+-(\d+)', href)
            rotowire_id = match.group(1) if match else None

            return {
                'name': player_name,
                'rotowire_id': rotowire_id,
                'url': href
            }
        except Exception as e:
            print(f"⚠️ Error parsing player info: {e}")
            return None

    def parse_injury_status(self, status_text: str) -> Optional[str]:
        """Normalize injury status text."""
        status_map = {
            'prob': 'Prob',
            'probable': 'Prob',
            'ques': 'Ques',
            'questionable': 'Ques',
            'doubt': 'Doubt',
            'doubtful': 'Doubt',
            'out': 'Out'
        }
        status_lower = status_text.lower().strip()
        return status_map.get(status_lower, status_text)

    def parse_betting_line(self, line_text: str) -> Tuple[Optional[str], Optional[float]]:
        """Parse betting line like 'MIA -118' -> ('MIA', -118)."""
        match = re.search(r'([A-Z]{3})\s+([-+]?\d+)', line_text)
        if match:
            return match.group(1), float(match.group(2))
        return None, None

    def parse_spread(self, spread_text: str) -> Tuple[Optional[str], Optional[float]]:
        """Parse spread like 'MIA -1.5' -> ('MIA', -1.5)."""
        match = re.search(r'([A-Z]{3})\s+([-+]?\d+\.?\d*)', spread_text)
        if match:
            return match.group(1), float(match.group(2))
        return None, None

    def parse_over_under(self, ou_text: str) -> Optional[float]:
        """Parse over/under like '240.5 Pts' -> 240.5."""
        match = re.search(r'(\d+\.?\d*)\s*Pts', ou_text)
        return float(match.group(1)) if match else None

    def parse_game_date(self, html: str) -> str:
        """Extract game date from page."""
        # Look for text like "Starting lineups for November 23, 2025"
        soup = BeautifulSoup(html, 'html.parser')
        date_text = soup.find(string=re.compile(r'Starting lineups for'))

        if date_text:
            match = re.search(r'for\s+([A-Za-z]+\s+\d+,\s+\d{4})', date_text)
            if match:
                date_str = match.group(1)
                parsed_date = datetime.strptime(date_str, '%B %d, %Y').date()
                return parsed_date.isoformat()

        # Default to today if not found
        return date.today().isoformat()

    def scrape_lineups(self, url: str) -> List[Dict]:
        """
        Main scraping function.

        Returns list of game dictionaries with lineups, injury status, and odds.
        """
        html = self.fetch_page(url)
        if not html:
            return []

        soup = BeautifulSoup(html, 'html.parser')
        game_date = self.parse_game_date(html)

        games = []

        # Find all lineup containers (use lambda to match multiple classes)
        lineup_divs = soup.find_all('div', class_=lambda x: x and 'lineup' in x.split() and 'is-nba' in x.split())

        print(f"\n🔍 DEBUG: HTML length = {len(html)} characters")
        print(f"🔍 DEBUG: Found {len(lineup_divs)} lineup divs")
        print(f"\n📊 Found {len(lineup_divs)} games on {game_date}")

        for lineup_div in lineup_divs:
            try:
                game_data = self._parse_game(lineup_div, game_date)
                if game_data:
                    games.append(game_data)
                    print(f"  ✅ {game_data['away_team']} @ {game_data['home_team']} - {game_data['game_time']}")
            except Exception as e:
                print(f"  ⚠️ Error parsing game: {e}")
                continue

        return games

    def _parse_game(self, lineup_div, game_date: str) -> Optional[Dict]:
        """Parse individual game lineup container."""
        game_data = {
            'game_date': game_date,
            'game_time': None,
            'home_team': None,
            'away_team': None,
            'home_record': None,
            'away_record': None,
            'home_lineup': {},
            'away_lineup': {},
            'home_injuries': [],
            'away_injuries': [],
            'betting': {},
            'referees': []
        }

        # Extract game time
        time_elem = lineup_div.find('div', class_='lineup__time')
        if time_elem:
            game_data['game_time'] = time_elem.get_text(strip=True)

        # Extract teams using the new structure
        # Away team has class "lineup__team is-visit"
        away_team_elem = lineup_div.find('a', class_=lambda x: x and 'lineup__team' in x.split() and 'is-visit' in x.split())
        # Home team has class "lineup__team is-home"
        home_team_elem = lineup_div.find('a', class_=lambda x: x and 'lineup__team' in x.split() and 'is-home' in x.split())

        if away_team_elem:
            away_abbr_elem = away_team_elem.find('div', class_='lineup__abbr')
            game_data['away_team'] = away_abbr_elem.get_text(strip=True) if away_abbr_elem else None

        if home_team_elem:
            home_abbr_elem = home_team_elem.find('div', class_='lineup__abbr')
            game_data['home_team'] = home_abbr_elem.get_text(strip=True) if home_abbr_elem else None

        # Extract team records from lineup__wl spans
        wl_spans = lineup_div.find_all('span', class_='lineup__wl')
        if len(wl_spans) >= 2:
            game_data['away_record'] = self.parse_record(wl_spans[0].get_text(strip=True))
            game_data['home_record'] = self.parse_record(wl_spans[1].get_text(strip=True))

        # Parse betting odds
        self._parse_betting_odds(lineup_div, game_data)

        # Parse referees
        self._parse_referees(lineup_div, game_data)

        # Parse lineups (this is the complex part)
        self._parse_team_lineups(lineup_div, game_data)

        return game_data if game_data['home_team'] else None

    def _extract_team_from_link(self, link_elem) -> Optional[str]:
        """Extract team abbreviation from depth chart link."""
        href = link_elem.get('href', '')
        # Extract from URL like "/basketball/nba-depth-charts/heat-depth-chart-mia"
        match = re.search(r'-([a-z]{3})$', href.lower())
        if match:
            return match.group(1).upper()
        return None

    def _parse_betting_odds(self, lineup_div, game_data: Dict):
        """Extract betting information from lineup__odds-item divs."""
        try:
            # Find the lineup__odds container
            odds_container = lineup_div.find('div', class_='lineup__odds')
            if not odds_container:
                return

            odds_items = odds_container.find_all('div', class_='lineup__odds-item')

            for item in odds_items:
                item_text = item.get_text(strip=True)

                # Moneyline (LINE)
                if 'LINE' in item_text:
                    # Look for visible span (not with class="hide")
                    spans = item.find_all('span')
                    for span in spans:
                        if 'hide' not in span.get('class', []):
                            line_text = span.get_text(strip=True)
                            match = re.search(r'([A-Z]{3})\s+([-+]?\d+)', line_text)
                            if match:
                                game_data['betting']['line_team'] = match.group(1)
                                game_data['betting']['line_value'] = float(match.group(2))
                                break

                # Spread (SPREAD)
                elif 'SPREAD' in item_text:
                    spans = item.find_all('span')
                    for span in spans:
                        if 'hide' not in span.get('class', []):
                            spread_text = span.get_text(strip=True)
                            match = re.search(r'([A-Z]{3})\s+([-+]?\d+\.?\d*)', spread_text)
                            if match:
                                game_data['betting']['spread_team'] = match.group(1)
                                game_data['betting']['spread_value'] = float(match.group(2))
                                break

                # Over/Under (O/U)
                elif 'O/U' in item_text:
                    spans = item.find_all('span')
                    for span in spans:
                        if 'hide' not in span.get('class', []):
                            ou_text = span.get_text(strip=True)
                            match = re.search(r'(\d+\.?\d*)\s*Pts', ou_text)
                            if match:
                                game_data['betting']['over_under'] = float(match.group(1))
                                break
        except Exception as e:
            print(f"    ⚠️ Error parsing betting odds: {e}")

    def _parse_referees(self, lineup_div, game_data: Dict):
        """Extract referee names."""
        try:
            ref_label = lineup_div.find('b', string=re.compile(r'Referees:'))
            if ref_label:
                ref_container = ref_label.parent
                if ref_container:
                    ref_links = ref_container.find_all('a', href=re.compile(r'/basketball/ref\.php'))
                    game_data['referees'] = [link.get_text(strip=True) for link in ref_links]
        except Exception as e:
            print(f"    ⚠️ Error parsing referees: {e}")

    def _parse_team_lineups(self, lineup_div, game_data: Dict):
        """Parse starting lineups for both teams."""
        # This is complex because the HTML structure varies
        # Look for "Expected Lineup" or "Confirmed Lineup" sections

        # First, determine lineup status (confirmed or expected)
        lineup_status = 'expected'  # default
        status_elem = lineup_div.find('li', class_='lineup__status')
        if status_elem:
            classes = status_elem.get('class', [])
            if 'is-confirmed' in classes:
                lineup_status = 'confirmed'
            elif 'is-expected' in classes:
                lineup_status = 'expected'

        # Look for lineup sections (can be "Expected Lineup" or "Confirmed Lineup")
        lineup_sections = lineup_div.find_all(string=re.compile(r'(Expected|Confirmed) Lineup'))

        # Typically 2 sections: away team first, home team second
        if len(lineup_sections) >= 2:
            # Parse away team lineup (first section)
            away_section = lineup_sections[0].find_parent().find_parent()
            game_data['away_lineup'] = self._parse_lineup_section(away_section)
            game_data['away_lineup_status'] = lineup_status

            # Parse home team lineup (second section)
            home_section = lineup_sections[1].find_parent().find_parent()
            game_data['home_lineup'] = self._parse_lineup_section(home_section)
            game_data['home_lineup_status'] = lineup_status

    def _parse_lineup_section(self, section) -> Dict:
        """Parse a single team's lineup section (finds lineup__player li elements)."""
        lineup = {}

        try:
            # Find all player list items within this section
            player_items = section.find_all('li', class_=lambda x: x and 'lineup__player' in x.split())

            for player_item in player_items:
                # Get position
                pos_elem = player_item.find('div', class_='lineup__pos')
                if not pos_elem:
                    continue

                position = pos_elem.get_text(strip=True)

                # Only process starting 5 positions
                if position not in ['PG', 'SG', 'SF', 'PF', 'C']:
                    continue

                # Get player link
                player_link = player_item.find('a', href=re.compile(r'/basketball/player/'))
                if not player_link:
                    continue

                # Extract player info
                player_name = player_link.get('title', player_link.get_text(strip=True))
                href = player_link.get('href', '')
                match = re.search(r'/player/[^/]+-(\d+)', href)
                rotowire_id = match.group(1) if match else None

                # Determine injury status from title attribute and class
                status = None
                title = player_item.get('title', '')
                classes = player_item.get('class', [])

                # Map title to status
                if 'Very Unlikely To Play' in title or 'is-pct-play-0' in classes:
                    status = 'Out'
                elif 'Toss Up To Play' in title or 'is-pct-play-50' in classes:
                    status = 'Ques'
                elif 'Probable' in title or 'is-pct-play-75' in classes:
                    status = 'Prob'
                elif 'Doubtful' in title or 'is-pct-play-25' in classes:
                    status = 'Doubt'
                # is-pct-play-100 means healthy, status = None

                # Skip players marked as "Out" - they are not actually starting
                # The actual replacement starter will be listed separately
                if status == 'Out':
                    continue

                lineup[position] = {
                    'name': player_name,
                    'rotowire_id': rotowire_id,
                    'url': href,
                    'status': status
                }

        except Exception as e:
            print(f"      ⚠️ Error parsing lineup section: {e}")

        return lineup

    def get_team_id(self, team_abbr: str) -> Optional[int]:
        """Look up team_id from abbreviation."""
        try:
            self.cursor.execute(
                "SELECT team_id FROM teams WHERE abbreviation = %s",
                (team_abbr,)
            )
            result = self.cursor.fetchone()
            return result[0] if result else None
        except Exception as e:
            print(f"⚠️ Error looking up team {team_abbr}: {e}")
            return None

    def get_or_create_player_mapping(self, player_name: str, rotowire_id: str) -> Optional[int]:
        """
        Get player_id from RotoWire mapping, or attempt fuzzy match.
        Returns player_id or None.
        """
        if not rotowire_id:
            return None

        try:
            # Check existing mapping
            self.cursor.execute(
                "SELECT player_id FROM player_rotowire_mapping WHERE rotowire_player_id = %s",
                (rotowire_id,)
            )
            result = self.cursor.fetchone()
            if result:
                return result[0]

            # Try fuzzy match on player name
            # This is a simple approach - you may want more sophisticated matching
            self.cursor.execute(
                "SELECT player_id FROM players WHERE LOWER(full_name) = LOWER(%s) LIMIT 1",
                (player_name,)
            )
            result = self.cursor.fetchone()
            if result:
                player_id = result[0]
                # Create mapping for future lookups
                self.cursor.execute(
                    """INSERT INTO player_rotowire_mapping (player_id, rotowire_player_id, rotowire_display_name)
                       VALUES (%s, %s, %s)
                       ON CONFLICT (rotowire_player_id) DO UPDATE SET last_seen = CURRENT_TIMESTAMP""",
                    (player_id, rotowire_id, player_name)
                )
                return player_id

            # No match found - log for manual review
            print(f"    ⚠️ No player match for: {player_name} (RotoWire ID: {rotowire_id})")
            return None

        except Exception as e:
            print(f"⚠️ Error in player mapping: {e}")
            return None

    def save_game(self, game: Dict) -> bool:
        """
        Save a single game to database.

        Returns:
            True if game was inserted successfully
            False if game was skipped (duplicate or error)
        """
        try:
            # Get team IDs
            home_team_id = self.get_team_id(game['home_team'])
            away_team_id = self.get_team_id(game['away_team'])

            if not home_team_id or not away_team_id:
                print(f"  ⚠️ Team not found: {game['away_team']} @ {game['home_team']}")
                return False

            scraped_at = datetime.now()

            # Insert into nba_daily_lineups
            self.cursor.execute("""
                INSERT INTO nba_daily_lineups (
                    game_date, game_time, home_team_id, away_team_id,
                    home_team_record, away_team_record,
                    home_ml, away_ml, spread_team, spread_value, over_under,
                    referees, scraped_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (game_date, home_team_id, away_team_id, scraped_at) DO NOTHING
                RETURNING lineup_id
            """, (
                game['game_date'],
                game['game_time'],
                home_team_id,
                away_team_id,
                game['home_record'],
                game['away_record'],
                game['betting'].get('line_value') if game['betting'].get('line_team') == game['home_team'] else None,
                game['betting'].get('line_value') if game['betting'].get('line_team') == game['away_team'] else None,
                game['betting'].get('spread_team'),
                game['betting'].get('spread_value'),
                game['betting'].get('over_under'),
                game['referees'],
                scraped_at
            ))

            result = self.cursor.fetchone()
            if not result:
                # Duplicate - already exists
                return False

            lineup_id = result[0]

            # Save lineup snapshots for both teams
            home_status = game.get('home_lineup_status', 'expected')
            away_status = game.get('away_lineup_status', 'expected')
            self._save_lineup_snapshot(lineup_id, home_team_id, game['home_lineup'], True, scraped_at, home_status)
            self._save_lineup_snapshot(lineup_id, away_team_id, game['away_lineup'], False, scraped_at, away_status)

            return True

        except Exception as e:
            print(f"  ❌ Error saving game {game.get('away_team', '?')} @ {game.get('home_team', '?')}: {e}")
            return False

    def save_to_database(self, games: List[Dict]):
        """Save scraped lineups to database."""
        if not games:
            print("⚠️ No games to save")
            return

        saved_count = 0

        for game in games:
            if self.save_game(game):
                saved_count += 1
                self.conn.commit()
            else:
                self.conn.rollback()

        print(f"\n✅ Saved {saved_count}/{len(games)} games to database")

    def _save_lineup_snapshot(self, lineup_id: int, team_id: int, lineup: Dict, is_home: bool, scraped_at: datetime, lineup_status: str = 'expected'):
        """Save a single team's lineup snapshot."""
        positions = ['PG', 'SG', 'SF', 'PF', 'C']
        player_ids = {}
        statuses = {}
        rotowire_ids = {}

        for pos in positions:
            if pos in lineup:
                player_info = lineup[pos]
                player_id = self.get_or_create_player_mapping(
                    player_info['name'],
                    player_info['rotowire_id']
                )
                player_ids[pos.lower()] = player_id
                statuses[pos.lower()] = player_info.get('status')
                rotowire_ids[pos.lower()] = player_info.get('rotowire_id')
            else:
                player_ids[pos.lower()] = None
                statuses[pos.lower()] = None
                rotowire_ids[pos.lower()] = None

        self.cursor.execute("""
            INSERT INTO nba_lineup_snapshots (
                lineup_id, team_id, is_home_team,
                pg_player_id, pg_status, pg_rotowire_id,
                sg_player_id, sg_status, sg_rotowire_id,
                sf_player_id, sf_status, sf_rotowire_id,
                pf_player_id, pf_status, pf_rotowire_id,
                c_player_id, c_status, c_rotowire_id,
                scraped_at, lineup_status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            lineup_id, team_id, is_home,
            player_ids['pg'], statuses['pg'], rotowire_ids['pg'],
            player_ids['sg'], statuses['sg'], rotowire_ids['sg'],
            player_ids['sf'], statuses['sf'], rotowire_ids['sf'],
            player_ids['pf'], statuses['pf'], rotowire_ids['pf'],
            player_ids['c'], statuses['c'], rotowire_ids['c'],
            scraped_at, lineup_status
        ))


def main():
    """Main execution function."""
    parser = argparse.ArgumentParser(description='Scrape NBA daily lineups from RotoWire')
    parser.add_argument('--date', choices=['today', 'tomorrow'], default='today',
                       help='Which date to scrape (default: today)')
    parser.add_argument('--output', help='Optional: save to JSON file instead of database')
    parser.add_argument('--dry-run', action='store_true', help='Parse but do not save to database')

    args = parser.parse_args()

    # Select URL based on date
    url = TOMORROW_URL if args.date == 'tomorrow' else TODAY_URL

    print(f"\n{'='*60}")
    print(f"  RotoWire NBA Daily Lineups Scraper")
    print(f"  Date: {args.date.upper()}")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    scraper = RotoWireLineupsScraper(DB_CONFIG)

    try:
        # Scrape lineups
        games = scraper.scrape_lineups(url)

        if not games:
            print("❌ No games found")
            return

        # Output to JSON if requested
        if args.output:
            with open(args.output, 'w') as f:
                json.dump({
                    'scraped_at': datetime.now().isoformat(),
                    'source': url,
                    'games': games
                }, f, indent=2)
            print(f"\n✅ Saved to {args.output}")

        # Save to database unless dry-run
        if not args.dry_run:
            scraper.connect_db()
            scraper.save_to_database(games)
            scraper.close_db()
        else:
            print("\n🔍 DRY RUN - Not saving to database")
            print(f"   Found {len(games)} games")

        print(f"\n{'='*60}")
        print("  ✅ Scraping completed successfully")
        print(f"{'='*60}\n")

    except KeyboardInterrupt:
        print("\n\n⚠️ Interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if scraper.conn:
            scraper.close_db()


if __name__ == '__main__':
    main()
