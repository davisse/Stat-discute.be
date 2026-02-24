#!/usr/bin/env python3
"""
DraftKings Sportsbook Scraper
Fetches NBA odds and player props from DraftKings API endpoints.

Note: DraftKings sportsbook is geo-restricted to US states where sports betting is legal.
This script may require a US VPN/proxy to function.

Endpoints discovered:
- Sportsbook events: https://sportsbook.draftkings.com/sites/US-SB/api/v5/eventgroups/{league_id}
- League IDs: NBA=42648, NFL=88808, NHL=42133

Usage:
    python draftkings_scraper.py
    python draftkings_scraper.py --dry-run
    python draftkings_scraper.py --debug
"""

import json
import time
import random
import logging
import argparse
import os
import sys
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Add parent directory for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =============================================================================
# CONFIGURATION
# =============================================================================

# DraftKings API Configuration
DRAFTKINGS_CONFIG = {
    # Sportsbook API (geo-restricted)
    'sportsbook_base': 'https://sportsbook.draftkings.com',
    'sportsbook_api': 'https://sportsbook.draftkings.com/sites/US-SB/api/v5/eventgroups',

    # Alternative endpoints (less restricted)
    'sportsbook_eu': 'https://sportsbook.draftkings.com/sites/US-NJ-SB/api/v5/eventgroups',

    # League IDs
    'leagues': {
        'NBA': 42648,
        'NFL': 88808,
        'NHL': 42133,
        'MLB': 84240,
        'NCAAB': 42649,
        'NCAAF': 87637,
    },

    # Rate limiting
    'min_request_interval': 2.0,
    'max_jitter': 1.0,
}

# User agents for rotation
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0",
]


class DraftKingsScraper:
    """
    Scraper for DraftKings Sportsbook odds and player props.
    """

    def __init__(self, use_proxy: bool = False, proxy_url: str = None):
        """
        Initialize the scraper.

        Args:
            use_proxy: Whether to use a proxy (required for non-US access)
            proxy_url: Proxy URL if use_proxy is True
        """
        self.session = self._create_session()
        self.last_request_time = 0
        self.use_proxy = use_proxy
        self.proxy_url = proxy_url

        if use_proxy and proxy_url:
            self.session.proxies = {
                'http': proxy_url,
                'https': proxy_url
            }
            logger.info(f"🌐 Using proxy: {proxy_url}")

    def _create_session(self) -> requests.Session:
        """Create a requests session with retry logic."""
        session = requests.Session()

        # Configure retries
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)

        return session

    def _get_headers(self) -> Dict[str, str]:
        """Get browser-like headers with random user agent."""
        return {
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Origin': 'https://sportsbook.draftkings.com',
            'Referer': 'https://sportsbook.draftkings.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Connection': 'keep-alive',
        }

    def _rate_limit(self):
        """Enforce rate limiting between requests."""
        elapsed = time.time() - self.last_request_time
        min_interval = DRAFTKINGS_CONFIG['min_request_interval']
        jitter = random.uniform(0, DRAFTKINGS_CONFIG['max_jitter'])

        if elapsed < min_interval:
            sleep_time = min_interval - elapsed + jitter
            logger.debug(f"Rate limiting: sleeping {sleep_time:.2f}s")
            time.sleep(sleep_time)

        self.last_request_time = time.time()

    def _make_request(self, url: str, params: Dict = None) -> Optional[Dict]:
        """
        Make an HTTP request with error handling.

        Args:
            url: URL to fetch
            params: Query parameters

        Returns:
            JSON response or None on error
        """
        self._rate_limit()

        try:
            response = self.session.get(
                url,
                params=params,
                headers=self._get_headers(),
                timeout=30
            )

            # Check for geo-blocking
            if response.status_code == 403:
                logger.error("❌ Access Denied - DraftKings is geo-restricted to US")
                logger.error("   Solutions:")
                logger.error("   1. Use a US VPN/proxy")
                logger.error("   2. Run from a US server")
                logger.error("   3. Use The Odds API (paid) instead")
                return None

            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Request failed: {e}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON decode error: {e}")
            return None

    def get_nba_events(self) -> Optional[Dict]:
        """
        Fetch NBA events from DraftKings sportsbook.

        Returns:
            Events data or None
        """
        league_id = DRAFTKINGS_CONFIG['leagues']['NBA']

        # Try main US endpoint first
        urls_to_try = [
            f"{DRAFTKINGS_CONFIG['sportsbook_api']}/{league_id}",
            f"{DRAFTKINGS_CONFIG['sportsbook_eu']}/{league_id}",
        ]

        for url in urls_to_try:
            logger.info(f"📡 Trying endpoint: {url}")

            params = {
                'format': 'json',
            }

            data = self._make_request(url, params)
            if data:
                logger.info(f"✅ Successfully fetched NBA events")
                return data

        logger.error("❌ All endpoints failed")
        return None

    def parse_events(self, data: Dict) -> List[Dict]:
        """
        Parse events from DraftKings response.

        Args:
            data: Raw API response

        Returns:
            List of parsed events
        """
        events = []

        try:
            # DraftKings structure: eventGroup -> offerCategories -> offers
            event_group = data.get('eventGroup', {})
            offer_categories = event_group.get('offerCategories', [])

            # Get events list
            raw_events = event_group.get('events', [])

            for event in raw_events:
                parsed = {
                    'event_id': event.get('eventId'),
                    'name': event.get('name'),
                    'start_time': event.get('startDate'),
                    'home_team': None,
                    'away_team': None,
                    'markets': []
                }

                # Parse team names from event name (e.g., "Utah Jazz @ Cleveland Cavaliers")
                name = event.get('name', '')
                if ' @ ' in name:
                    parts = name.split(' @ ')
                    parsed['away_team'] = parts[0].strip()
                    parsed['home_team'] = parts[1].strip()
                elif ' vs ' in name:
                    parts = name.split(' vs ')
                    parsed['home_team'] = parts[0].strip()
                    parsed['away_team'] = parts[1].strip()

                events.append(parsed)

            # Parse offer categories for odds
            for category in offer_categories:
                category_name = category.get('name', '')

                for subcategory in category.get('offerSubcategoryDescriptors', []):
                    subcategory_name = subcategory.get('name', '')

                    for offer in subcategory.get('offerSubcategory', {}).get('offers', []):
                        for offer_list in offer:
                            self._parse_offer(offer_list, events, category_name, subcategory_name)

            logger.info(f"📊 Parsed {len(events)} events")
            return events

        except Exception as e:
            logger.error(f"❌ Error parsing events: {e}")
            return []

    def _parse_offer(self, offer: Dict, events: List[Dict], category: str, subcategory: str):
        """
        Parse a single offer (market) and attach to appropriate event.

        Args:
            offer: Offer data
            events: List of events to attach market to
            category: Category name
            subcategory: Subcategory name
        """
        try:
            event_id = offer.get('eventId')
            label = offer.get('label', '')

            # Find matching event
            event = next((e for e in events if e['event_id'] == event_id), None)
            if not event:
                return

            market = {
                'category': category,
                'subcategory': subcategory,
                'label': label,
                'outcomes': []
            }

            for outcome in offer.get('outcomes', []):
                market['outcomes'].append({
                    'label': outcome.get('label'),
                    'odds_american': outcome.get('oddsAmerican'),
                    'odds_decimal': outcome.get('oddsDecimal'),
                    'line': outcome.get('line'),
                    'participant': outcome.get('participant'),
                })

            event['markets'].append(market)

        except Exception as e:
            logger.debug(f"Error parsing offer: {e}")

    def get_player_props(self, event_id: int) -> List[Dict]:
        """
        Fetch player props for a specific event.

        Args:
            event_id: DraftKings event ID

        Returns:
            List of player prop markets
        """
        # Player props are typically in a separate subcategory
        # This would require additional API calls to specific prop endpoints

        url = f"{DRAFTKINGS_CONFIG['sportsbook_base']}/sites/US-SB/api/v5/eventgroups/42648/categories/1215/subcategories/{event_id}"

        data = self._make_request(url)
        if not data:
            return []

        props = []
        try:
            # Parse player props structure
            for offer_category in data.get('offerCategories', []):
                for subcategory in offer_category.get('offerSubcategoryDescriptors', []):
                    for offer in subcategory.get('offerSubcategory', {}).get('offers', []):
                        for prop in offer:
                            player_name = prop.get('label', '')

                            for outcome in prop.get('outcomes', []):
                                props.append({
                                    'player': player_name,
                                    'market': subcategory.get('name'),
                                    'selection': outcome.get('label'),
                                    'line': outcome.get('line'),
                                    'odds_american': outcome.get('oddsAmerican'),
                                    'odds_decimal': outcome.get('oddsDecimal'),
                                })

            logger.info(f"📊 Found {len(props)} player props for event {event_id}")

        except Exception as e:
            logger.error(f"❌ Error parsing player props: {e}")

        return props

    def format_output(self, events: List[Dict]) -> str:
        """
        Format events for display.

        Args:
            events: List of parsed events

        Returns:
            Formatted string output
        """
        output = []
        output.append("\n" + "=" * 60)
        output.append("🏀 DraftKings NBA Odds")
        output.append("=" * 60 + "\n")

        for event in events:
            output.append(f"\n📅 {event['away_team']} @ {event['home_team']}")
            output.append(f"   Start: {event['start_time']}")

            # Group markets by category
            markets_by_cat = {}
            for market in event['markets']:
                cat = market['category']
                if cat not in markets_by_cat:
                    markets_by_cat[cat] = []
                markets_by_cat[cat].append(market)

            for cat, markets in markets_by_cat.items():
                output.append(f"\n   {cat}:")
                for market in markets[:5]:  # Limit to 5 per category
                    label = market.get('label', 'N/A')
                    output.append(f"      {label}:")
                    for outcome in market.get('outcomes', []):
                        sel = outcome.get('label', 'N/A')
                        odds = outcome.get('odds_american', 'N/A')
                        line = outcome.get('line', '')
                        line_str = f" ({line})" if line else ""
                        output.append(f"         {sel}{line_str}: {odds}")

        return "\n".join(output)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Scrape DraftKings NBA odds')
    parser.add_argument('--dry-run', action='store_true', help='Parse without saving to database')
    parser.add_argument('--debug', action='store_true', help='Enable debug logging')
    parser.add_argument('--proxy', type=str, help='Proxy URL for US access (e.g., http://user:pass@proxy:port)')
    parser.add_argument('--output', type=str, help='Output file for JSON data')
    args = parser.parse_args()

    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)

    logger.info("=" * 60)
    logger.info("🏀 DraftKings NBA Odds Scraper")
    logger.info("=" * 60)

    # Create scraper
    scraper = DraftKingsScraper(
        use_proxy=bool(args.proxy),
        proxy_url=args.proxy
    )

    # Fetch NBA events
    logger.info("\n📡 Fetching NBA events...")
    data = scraper.get_nba_events()

    if not data:
        logger.error("\n❌ Failed to fetch data from DraftKings")
        logger.error("\n💡 DraftKings is geo-restricted to US states.")
        logger.error("   Options:")
        logger.error("   1. Use --proxy with a US proxy")
        logger.error("   2. Run from a US-based server")
        logger.error("   3. Use The Odds API (https://the-odds-api.com)")
        logger.error("   4. Continue using Pinnacle (ps3838.com)")
        return 1

    # Parse events
    events = scraper.parse_events(data)

    if not events:
        logger.warning("⚠️ No events found")
        return 1

    # Display formatted output
    print(scraper.format_output(events))

    # Save to file if requested
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(events, f, indent=2)
        logger.info(f"\n💾 Saved to {args.output}")

    # Save raw response for debugging
    if args.debug:
        debug_file = Path(__file__).parent / 'draftkings_debug.json'
        with open(debug_file, 'w') as f:
            json.dump(data, f, indent=2)
        logger.info(f"🔍 Debug data saved to {debug_file}")

    logger.info("\n✅ Done!")
    return 0


if __name__ == '__main__':
    sys.exit(main())
