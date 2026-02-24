"""
Pinnacle Sports Betting Configuration
Configuration for ps3838.com NBA odds scraping.
"""

import os
from datetime import datetime

# API Endpoints
BASE_URL = "https://www.ps3838.com"
API_BASE = f"{BASE_URL}/sports-service/sv/compact/events"

# Endpoint URLs
EVENTS_LIST_URL = (
    f"{API_BASE}?btg=1&c=&cl=100&d=&ec=&ev=&g=&hle=false&ic=false&ice=false"
    "&inl=false&l=100&lang=&lg=487&lv=&me=0&mk=1&more=false&o=0&ot=1&pa=0"
    "&pimo=0%2C1%2C2&pn=-1&pv=1&sp=4&tm=0&v=0&locale=en_US"
    "&withCredentials=true"
)

def get_event_markets_url(event_id: str) -> str:
    """Generate URL for specific event markets."""
    return (
        f"{API_BASE}?btg=1&c=Others&cl=3&d=&ec=&ev=&g=&hle=true&ic=false"
        f"&ice=false&inl=false&l=2&lang=&lg=&lv=&me={event_id}&mk=3"
        "&more=true&o=0&ot=1&pa=0&pimo=0%2C1%2C2&pn=-1&pv=1&sp=&tm=0"
        "&v=0&locale=en_US&withCredentials=true"
    )

# Request Configuration
HEADERS = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'fr-FR,fr;q=0.9',
    'Priority': 'u=1, i',
    'Referer': 'https://www.ps3838.com/en/sports/basketball',
    'Sec-Ch-Ua': '"Not=A?Brand";v="24", "Chromium";v="140"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'X-App-Data': 'dpMs1=rb4iGmltP4X4okKDTjuL;directusToken=TwEdnphtyxsfMpXoJkCkWaPsL2KJJ3lo'
}

# Cookies for authentication
COOKIES = {
    'dpMs1': 'rb4iGmltP4X4okKDTjuL',
    '_sig': 'Tcy1PV1prWXpVME9UVmxabUkwT0RjMU9BOjN0cHJIbEpkVjFaQmdQMGtGNXNHZXdabjc6NzYxNDcwOTEyOjc2MTI0NjMwOToyLjExLjA6OUNDRUE5b0lYRA%3D%3D',
    '_apt': '9CCEA9oIXD',
    'skin': 'ps3838',
    'lang': 'en_US',
    'adformfrpid': '8777387959265887000'
}

# Rate Limiting
RATE_LIMIT_SECONDS = 3  # Minimum seconds between requests
MAX_RATE_LIMIT_SECONDS = 5  # Maximum if server is slow
REQUEST_TIMEOUT = 10  # Seconds before timing out a request

# Retry Configuration
MAX_RETRIES = 3
RETRY_BACKOFF_BASE = 3  # Base seconds for exponential backoff (3, 6, 12, 24)

# Database Configuration
DB_CONFIG = {
    'host': os.getenv('DATABASE_HOST', 'localhost'),
    'port': os.getenv('DATABASE_PORT', '5432'),
    'database': os.getenv('DATABASE_NAME', 'nba_stats'),
    'user': os.getenv('DATABASE_USER', 'chapirou'),
    'password': os.getenv('DATABASE_PASSWORD', ''),
}

# Market Type Mappings
MARKET_KEYS = {
    'moneyline': 'moneyline',
    'spread': 'spread',
    'total': 'total',
    '1h_moneyline': '1h_moneyline',
    '1h_spread': '1h_spread',
    '1h_total': '1h_total',
}

# NBA Team Name Mappings (Pinnacle → Our Database)
TEAM_NAME_MAPPING = {
    # Los Angeles Teams
    'L.A. Lakers': 'LAL',
    'Los Angeles Lakers': 'LAL',
    'LA Lakers': 'LAL',
    'L.A. Clippers': 'LAC',
    'Los Angeles Clippers': 'LAC',
    'LA Clippers': 'LAC',

    # New York Teams
    'New York Knicks': 'NYK',
    'Brooklyn Nets': 'BKN',

    # Texas Teams
    'Dallas Mavericks': 'DAL',
    'Houston Rockets': 'HOU',
    'San Antonio Spurs': 'SAS',

    # California Teams
    'Golden State Warriors': 'GSW',
    'Sacramento Kings': 'SAC',

    # Florida Teams
    'Miami Heat': 'MIA',
    'Orlando Magic': 'ORL',

    # Other Teams
    'Boston Celtics': 'BOS',
    'Philadelphia 76ers': 'PHI',
    'Toronto Raptors': 'TOR',
    'Milwaukee Bucks': 'MIL',
    'Indiana Pacers': 'IND',
    'Detroit Pistons': 'DET',
    'Chicago Bulls': 'CHI',
    'Cleveland Cavaliers': 'CLE',
    'Atlanta Hawks': 'ATL',
    'Charlotte Hornets': 'CHA',
    'Washington Wizards': 'WAS',
    'Denver Nuggets': 'DEN',
    'Minnesota Timberwolves': 'MIN',
    'Oklahoma City Thunder': 'OKC',
    'Portland Trail Blazers': 'POR',
    'Utah Jazz': 'UTA',
    'Phoenix Suns': 'PHX',
    'Memphis Grizzlies': 'MEM',
    'New Orleans Pelicans': 'NOP',
}

# Data Validation
ODDS_MIN = 1.01
ODDS_MAX = 50.0
HANDICAP_MIN = -30.0
HANDICAP_MAX = 300.0  # Increased for totals (can be 200+ points)

# Monitoring & Alerting
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.getenv('LOG_FILE', '/var/log/pinnacle_scraper.log')
ALERT_EMAIL = os.getenv('ALERT_EMAIL', '')
NO_DATA_ALERT_HOURS = 2  # Alert if no data scraped for this many hours on game day

# Schedule Configuration
SCRAPE_INTERVAL_MINUTES = 15  # How often to scrape
SCRAPE_START_HOUR = 9  # Start scraping at 9 AM
SCRAPE_END_HOUR = 23  # Stop scraping at 11 PM

def get_timestamp():
    """Get current timestamp for logging."""
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def is_game_day():
    """Check if today is likely to have NBA games (simple heuristic)."""
    # NBA typically plays October through June
    # Most games Tuesday through Sunday
    from datetime import datetime
    today = datetime.now()
    month = today.month
    weekday = today.weekday()  # Monday=0, Sunday=6

    # NBA season months
    if month < 6 or month > 9:  # June or earlier, October or later
        # Skip Mondays during regular season (fewer games)
        return weekday != 0
    return False

# Success Metrics Thresholds
UPTIME_TARGET = 0.95  # 95% successful runs
COVERAGE_TARGET = 0.90  # 90% of games matched
ERROR_RATE_MAX = 0.05  # <5% API call failures
COMPLETENESS_TARGET = 6  # All 6 market types per game