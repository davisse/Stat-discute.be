#!/usr/bin/env python3
"""
Pinnacle Session Manager
Manages authenticated sessions with Pinnacle Sports (ps3838.com) with persistence and auto-refresh.

Features:
- Session cookie persistence across runs
- Automatic session validation and refresh
- Rate limiting and retry logic
- Support for both compact events list and event-specific endpoints

Usage:
    from pinnacle_session import PinnacleSession

    # Create session manager
    session = PinnacleSession()

    # Get upcoming NBA games
    events = session.get_upcoming_events()

    # Get detailed markets for specific event
    markets = session.get_event_markets(event_id)
"""

import json
import time
import random
import logging
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configure logging
logger = logging.getLogger(__name__)

# User-Agent rotation pool (realistic browser signatures)
USER_AGENTS = [
    # Chrome on macOS
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    # Chrome on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    # Firefox on macOS
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0",
    # Firefox on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
    # Safari on macOS
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
    # Edge on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
]


class PinnacleSession:
    """
    Manages authenticated session with Pinnacle Sports API.

    Handles:
    - Cookie persistence and loading
    - Session validation and expiration
    - Rate limiting
    - Retry logic with exponential backoff
    """

    # API Configuration
    BASE_URL = "https://www.ps3838.com"
    API_BASE = f"{BASE_URL}/sports-service/sv/compact/events"

    # Rate limiting - INCREASED to avoid Cloudflare 1015 errors
    MIN_REQUEST_INTERVAL = 10.0  # Minimum seconds between requests (was 3.0)
    MAX_JITTER = 5.0  # Random jitter added to interval (0-5 seconds)
    MAX_RETRIES = 3
    RETRY_BACKOFF_BASE = 3  # Increased from 2
    CLOUDFLARE_BACKOFF = 300  # 5 minutes wait on Cloudflare 1015 error

    # Session expiration (conservative estimate)
    SESSION_LIFETIME_HOURS = 3

    # Browser-like headers to avoid fingerprinting detection
    BROWSER_HEADERS = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    }

    def __init__(self, session_file: str = 'pinnacle_session.json', proxy: Optional[str] = None):
        """
        Initialize session manager.

        Args:
            session_file: Path to session persistence file
            proxy: Optional HTTP/HTTPS proxy URL (e.g., 'http://user:pass@host:port')
                   Can also be set via PINNACLE_PROXY environment variable
        """
        self.session_file = Path(session_file)
        self.session = requests.Session()
        self.auth_data = None
        self.last_request_time = None
        self.cloudflare_blocked_until = None  # Track Cloudflare rate limit cooldown

        # Configure proxy if provided
        self.proxy = proxy or os.environ.get('PINNACLE_PROXY')
        if self.proxy:
            self.session.proxies = {
                'http': self.proxy,
                'https': self.proxy,
            }
            logger.info(f"🔀 Proxy configured: {self.proxy.split('@')[-1] if '@' in self.proxy else self.proxy}")

        # Configure retry strategy with increased backoff
        retry_strategy = Retry(
            total=self.MAX_RETRIES,
            backoff_factor=self.RETRY_BACKOFF_BASE,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "POST"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

        # Apply browser-like headers to avoid fingerprinting
        self.session.headers.update(self.BROWSER_HEADERS)

        # Set initial random User-Agent
        self._rotate_user_agent()

        # Try to load existing session
        self.load_session()

    def _rotate_user_agent(self):
        """Rotate to a random User-Agent to avoid fingerprinting."""
        ua = random.choice(USER_AGENTS)
        self.session.headers['User-Agent'] = ua
        logger.debug(f"User-Agent rotated: {ua[:50]}...")

    def load_session(self) -> bool:
        """
        Load saved session from file.

        Returns:
            True if session loaded and valid, False otherwise
        """
        if not self.session_file.exists():
            logger.info(f"No session file found: {self.session_file}")
            return False

        try:
            with open(self.session_file, 'r') as f:
                self.auth_data = json.load(f)

            # Restore cookies
            cookies = self.auth_data.get('cookies', {})
            for name, value in cookies.items():
                self.session.cookies.set(name, value)

            # Restore headers
            headers = self.auth_data.get('headers', {})
            self.session.headers.update(headers)

            # Check if session is expired
            login_time_str = self.auth_data.get('login_time')
            if not login_time_str:
                logger.warning("Session file missing login_time")
                return False

            login_time = datetime.fromisoformat(login_time_str)
            age_hours = (datetime.now() - login_time).total_seconds() / 3600

            if age_hours > self.SESSION_LIFETIME_HOURS:
                logger.warning(f"Session expired ({age_hours:.1f}h old)")
                return False

            logger.info(f"✅ Session loaded successfully ({age_hours:.1f}h old)")
            return True

        except (json.JSONDecodeError, KeyError, ValueError) as e:
            logger.error(f"Failed to load session: {e}")
            return False

    def save_session(self):
        """Save current session to file."""
        self.auth_data = {
            'login_time': datetime.now().isoformat(),
            'cookies': dict(self.session.cookies),
            'headers': dict(self.session.headers),
        }

        # Create parent directory if needed
        self.session_file.parent.mkdir(parents=True, exist_ok=True)

        with open(self.session_file, 'w') as f:
            json.dump(self.auth_data, f, indent=2)

        # Set restrictive permissions (Unix only)
        try:
            self.session_file.chmod(0o600)
        except Exception as e:
            logger.warning(f"Could not set file permissions: {e}")

        logger.info(f"✅ Session saved to {self.session_file}")

    def update_from_curl_session(self, headers: Dict[str, str], cookies: Dict[str, str]):
        """
        Update session from cURL-extracted headers and cookies.

        Args:
            headers: Dictionary of HTTP headers
            cookies: Dictionary of cookies

        Example:
            session = PinnacleSession()
            session.update_from_curl_session(
                headers={'X-Custid': '...', 'X-U': '...'},
                cookies={'auth': 'true', 'custid': '...'}
            )
            session.save_session()
        """
        # Update cookies
        for name, value in cookies.items():
            self.session.cookies.set(name, value)

        # Update headers
        self.session.headers.update(headers)

        # Save immediately
        self.save_session()
        logger.info("✅ Session updated from external source")

    def _enforce_rate_limit(self):
        """
        Enforce minimum time between requests with random jitter.
        Also respects Cloudflare cooldown period if we were rate limited.
        """
        # Check if we're in Cloudflare cooldown
        if self.cloudflare_blocked_until:
            remaining = self.cloudflare_blocked_until - time.time()
            if remaining > 0:
                logger.warning(f"⏳ Cloudflare cooldown active, waiting {remaining:.0f}s...")
                time.sleep(remaining)
            self.cloudflare_blocked_until = None

        # Enforce minimum interval with random jitter
        if self.last_request_time is not None:
            elapsed = time.time() - self.last_request_time
            min_wait = self.MIN_REQUEST_INTERVAL + random.uniform(0, self.MAX_JITTER)
            if elapsed < min_wait:
                sleep_time = min_wait - elapsed
                logger.debug(f"Rate limiting: sleeping {sleep_time:.1f}s (with jitter)")
                time.sleep(sleep_time)

    def _make_request(self, url: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """
        Make rate-limited request with retry logic and anti-fingerprinting measures.

        Args:
            url: URL to fetch
            params: Optional query parameters

        Returns:
            Parsed JSON response or None on failure
        """
        self._enforce_rate_limit()

        # Rotate User-Agent before each request to avoid fingerprinting
        self._rotate_user_agent()

        try:
            logger.debug(f"Fetching: {url}")
            response = self.session.get(url, params=params, timeout=15)
            self.last_request_time = time.time()

            # Check for Cloudflare 1015 error in response body (returns 403 with HTML)
            if response.status_code == 403:
                if 'Error 1015' in response.text or 'rate limited' in response.text.lower():
                    logger.error(f"🚫 Cloudflare Error 1015 - Rate limited! Entering {self.CLOUDFLARE_BACKOFF}s cooldown")
                    self.cloudflare_blocked_until = time.time() + self.CLOUDFLARE_BACKOFF
                    return None
                else:
                    logger.error("❌ 403 Forbidden - Access denied (not rate limit)")
                    return None

            if response.status_code == 200:
                try:
                    return response.json()
                except json.JSONDecodeError:
                    # Sometimes Cloudflare returns HTML even with 200 status
                    if 'cloudflare' in response.text.lower() or 'Error 1015' in response.text:
                        logger.error(f"🚫 Cloudflare protection detected in response body")
                        self.cloudflare_blocked_until = time.time() + self.CLOUDFLARE_BACKOFF
                    else:
                        logger.error(f"JSON parse error, response: {response.text[:200]}")
                    return None

            elif response.status_code == 401:
                logger.error("❌ 401 Unauthorized - Session expired")
                return None
            elif response.status_code == 429:
                logger.warning("⚠️ 429 Rate limited by server - waiting 2 minutes")
                time.sleep(120)  # Wait 2 minutes (increased from 1)
                return None
            elif response.status_code == 503:
                logger.warning("⚠️ 503 Service unavailable (possibly Cloudflare challenge)")
                self.cloudflare_blocked_until = time.time() + 60  # Wait 1 minute
                return None
            else:
                logger.warning(f"HTTP {response.status_code}: {response.text[:200]}")
                return None

        except requests.exceptions.Timeout:
            logger.warning("⏱️ Request timeout (15s)")
            return None
        except requests.exceptions.ProxyError as e:
            logger.error(f"❌ Proxy error: {e}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Request failed: {e}")
            return None

    def get_upcoming_events(self, league_id: int = 487, sport_id: int = 4) -> List[Dict[str, Any]]:
        """
        Fetch upcoming NBA games from compact events list endpoint.

        Args:
            league_id: League ID (default 487 for NBA)
            sport_id: Sport ID (default 4 for Basketball)

        Returns:
            List of event dictionaries with structure:
            {
                'event_id': int,
                'home_team': str,
                'away_team': str,
                'num_markets': int,
                'start_time': datetime,
                'markets': dict,  # Full markets object
                'game_name': str,
            }
        """
        params = {
            'btg': '1',
            'cl': '1',          # Changed from 3
            'g': 'QQ==',
            'hle': 'false',     # Changed from true - get all events
            'ic': 'false',
            'ice': 'false',
            'inl': 'false',
            'l': '1',           # Changed from 3
            'lg': str(league_id),
            'sp': str(sport_id),
            'tm': '0',          # Upcoming games
            'o': '1',
            'ot': '1',
            'pimo': '0,1,2',
            'pn': '-1',
            'pv': '1',
            'v': '0',
            'locale': 'en_US',
            'withCredentials': 'true',
            '_': str(int(time.time() * 1000)),  # Cache buster
        }

        logger.info(f"📋 Fetching upcoming events (league={league_id}, sport={sport_id})")
        response = self._make_request(self.API_BASE, params)

        if not response:
            return []

        # Extract events from compact endpoint structure
        # Response has 'l' (live) and 'n' (upcoming) arrays
        try:
            events = []

            # Try 'n' array first (upcoming/new events)
            if 'n' in response and response['n']:
                logger.debug("Checking 'n' array for upcoming events")
                nba_events = response['n'][0][2][0][2]
                logger.info(f"✅ Found {len(nba_events)} upcoming events in 'n' array")

                for event in nba_events:
                    if not isinstance(event, list) or len(event) < 9:
                        continue

                    events.append({
                        'event_id': event[0],
                        'home_team': event[1],
                        'away_team': event[2],
                        'num_markets': event[3],
                        'start_time': datetime.fromtimestamp(event[4] / 1000),
                        'markets': event[8],
                        'game_name': f"{event[2]} @ {event[1]}",
                    })

            # Also check 'l' array (live events) if needed
            if 'l' in response and response['l']:
                logger.debug("Checking 'l' array for live events")
                try:
                    live_events = response['l'][0][2][0][2]
                    logger.info(f"✅ Found {len(live_events)} live events in 'l' array")

                    for event in live_events:
                        if not isinstance(event, list) or len(event) < 9:
                            continue

                        events.append({
                            'event_id': event[0],
                            'home_team': event[1],
                            'away_team': event[2],
                            'num_markets': event[3],
                            'start_time': datetime.fromtimestamp(event[4] / 1000),
                            'markets': event[8],
                            'game_name': f"{event[2]} @ {event[1]}",
                        })
                except (KeyError, IndexError, TypeError) as e:
                    logger.debug(f"Could not parse 'l' array (live events): {e}")

            logger.info(f"✅ Total events found: {len(events)}")
            return events

        except (KeyError, IndexError, TypeError) as e:
            logger.error(f"Failed to parse events: {e}")
            logger.debug(f"Response structure: {list(response.keys())}")
            return []

    def get_event_markets(self, event_id: str, include_props: bool = True) -> Optional[Dict[str, Any]]:
        """
        Fetch detailed markets for specific event.

        Args:
            event_id: Pinnacle event ID
            include_props: If True, fetch all markets including player props (default: True)

        Returns:
            Markets data dictionary or None
        """
        # Base parameters for all markets
        params = {
            'btg': '1',
            'cl': '3',
            'hle': 'true',
            'ic': 'false',
            'ice': 'false',
            'inl': 'false',
            'l': '2',
            'me': str(event_id),
            'more': 'true',
            'o': '0',
            'ot': '1',
            'pimo': '0,1,2',
            'pn': '-1',
            'pv': '1',
            'tm': '0',
            'v': '0',
            'locale': 'en_US',
            'withCredentials': 'true',
        }

        if include_props:
            # Fetch ALL market categories including player props
            # mk=0 gets all market types, c parameter removed to get all categories
            params['mk'] = '0'
        else:
            # Just main lines
            params['mk'] = '3'
            params['c'] = 'Others'

        logger.info(f"📈 Fetching {'ALL' if include_props else 'main'} markets for event {event_id}")
        response = self._make_request(self.API_BASE, params)

        if not response:
            return None

        logger.info(f"✅ Markets fetched for event {event_id}")
        return response

    def validate_session(self) -> bool:
        """
        Validate that current session is working.

        Returns:
            True if session can make successful requests
        """
        logger.info("🔍 Validating session...")
        events = self.get_upcoming_events()
        is_valid = len(events) > 0

        if is_valid:
            logger.info(f"✅ Session valid ({len(events)} events found)")
        else:
            logger.error("❌ Session invalid (no events returned)")

        return is_valid


def main():
    """Example usage and testing."""
    import sys

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Create session
    session = PinnacleSession()

    # Validate
    if not session.validate_session():
        logger.error("Session validation failed. Please update with valid credentials.")
        logger.info("Example: session.update_from_curl_session(headers={...}, cookies={...})")
        sys.exit(1)

    # Fetch upcoming events
    events = session.get_upcoming_events()

    print(f"\n{'='*60}")
    print(f"📋 Found {len(events)} upcoming NBA games")
    print(f"{'='*60}\n")

    for i, event in enumerate(events, 1):
        print(f"{i}. {event['game_name']}")
        print(f"   Event ID: {event['event_id']}")
        print(f"   Start: {event['start_time']}")
        print(f"   Markets: {event['num_markets']}")
        print()


if __name__ == '__main__':
    main()
