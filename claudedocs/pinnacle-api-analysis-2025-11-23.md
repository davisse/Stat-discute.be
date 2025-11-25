# Pinnacle API Analysis - Session 2025-11-23

## Executive Summary

Successfully authenticated access to Pinnacle (ps3838.com) NBA odds API with complete cookie/header replication. Identified critical discrepancies between documented and actual JSON structure.

## Key Findings

### 1. Authentication Working ✅

**Status**: Session cookies from cURL request are valid and functional

**Evidence**:
- HTTP 200 OK responses
- Complete NBA event data retrieved (8 games)
- Market data (spreads, totals, moneylines) fully accessible

**Cookie Expiration**: Session cookies appear short-lived (estimated 1-4 hours based on login timestamp `202511222348`)

### 2. JSON Structure Correction 🔴

**Current Documentation** (`4.BETTING/json_structure_mapping.md`):
```javascript
// INCORRECT
data['e'][3] → Event data
```

**Actual Structure**:
```javascript
// CORRECT
data['hle'][0][2][0][2] → Array of NBA events
```

**Full Path Breakdown**:
```
data
├── 'e': null                           ❌ Empty in this endpoint
├── 'hle': [                            ✅ Highlight events array
│   [
│     4,                                // Sport ID (Basketball)
│     "Basketball",                     // Sport name
│     [                                 // Leagues array
│       [
│         487,                          // League ID (NBA)
│         "NBA",                        // League name
│         [                             // ✅ Events array HERE
│           [
│             1619689340,               // [0] Event ID
│             "Philadelphia 76ers",     // [1] Home team
│             "Miami Heat",             // [2] Away team
│             11,                       // [3] Number of markets
│             1763921400000,            // [4] Start timestamp (ms)
│             0, 0, 17,                 // [5-7] Status flags
│             {                         // [8] Markets object
│               "0": [                  // Period 0 (Full Game)
│                 [...],                // [0] Handicaps/spreads
│                 [...],                // [1] Totals
│                 [...],                // [2] Moneyline
│                 ...
│               ]
│             },
│             ...                       // [9+] Additional metadata
│           ],
│           ...                         // More events
│         ]
│       ]
│     ]
│   ]
│ ]
```

### 3. Time Filter Parameter (`tm`) 🟡

**Tested Values**:
```bash
tm=0  → Returns 8 events (Nov 23-24)
tm=1  → Returns 8 events (identical to tm=0)
```

**Conclusion**: `tm` parameter does **NOT** filter by specific dates

**Hypothesis**:
- `tm=0` or `tm=1` both return "upcoming games" (next 24-48 hours)
- Actual date filtering may use different parameter (e.g., `d=YYYY-MM-DD`)
- The `hle=true` parameter (hide live events) filters to pre-game only

### 4. Market Data Structure

**Full Game Markets** (`event[8]["0"]`):

```javascript
{
  "0": [              // Full game period
    [                 // Index [0]: Handicaps/Spreads array
      [
        -1.5,         // [0] Away handicap
        1.5,          // [1] Home handicap
        "1.5",        // [2] Display value
        "1.990",      // [3] Away odds
        "1.892",      // [4] Home odds
        1,            // [5] Is alternative line (1=yes, 0=no)
        0,            // [6] Unknown
        52652263794,  // [7] Odds ID
        1,            // [8] Status
        3000.0,       // [9] Max bet
        1             // [10] Unknown
      ],
      ...             // More handicap lines
    ],
    [                 // Index [1]: Totals array
      [
        "240.5",      // [0] Total line (string)
        240.5,        // [1] Total line (number)
        "1.970",      // [2] Over odds
        "1.884",      // [3] Under odds
        52652263793,  // [4] Odds ID
        1,            // [5] Is alternative (1=yes)
        1000.0,       // [6] Max bet
        1             // [7] Status
      ],
      ...
    ],
    [                 // Index [2]: Moneyline array
      "1.990",        // [0] Away ML odds
      "1.900",        // [1] Home ML odds
      null,           // [2] Draw (null for basketball)
      3359891617,     // [3] Odds ID
      0,              // [4] Is alternative
      1500.0,         // [5] Max bet
      1               // [6] Status
    ],
    ...               // More metadata
  ]
}
```

## Recommendations

### Immediate Actions

#### 1. Update `json_structure_mapping.md`

Add section:
```markdown
## API Endpoint Variations

### Compact Events List Endpoint

**URL**: `/sports-service/sv/compact/events?lg=487&sp=4&hle=true`

**Structure**:
```javascript
data['hle'][0][2][0][2] → NBA events array
```

**Differences from event-specific endpoint**:
- Event list in `hle` instead of `e`
- Nested within sport/league hierarchy
- Same event structure once accessed
```

#### 2. Update `pinnacle_config.py`

Add authentication headers:
```python
HEADERS = {
    # Existing headers
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://www.ps3838.com/en/sports/basketball',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15...',

    # ADD THESE CRITICAL HEADERS
    'X-Browser-Session-Id': '',  # From session
    'X-Custid': '',               # From session
    'X-U': '',                    # From session
    'X-Lcu': '',                  # From session
    'X-SLID': '',                 # From session
    'X-App-Data': '',             # From session
}

# ADD THESE CRITICAL COOKIES
AUTH_COOKIES = {
    'auth': 'true',               # Required
    'custid': '',                 # From login
    'u': '',                      # Auth token
    'lcu': '',                    # Last customer update
    'BrowserSessionId': '',       # Session UUID
    'SLID': '',                   # Session local ID
    'pctag': '',                  # Page context tag
    # ... existing cookies
}
```

#### 3. Create Session Manager

```python
# File: 1.DATABASE/etl/betting/pinnacle_session.py

import requests
import json
from datetime import datetime, timedelta
from typing import Optional, Dict

class PinnacleSession:
    """
    Manages authenticated session with Pinnacle.
    Handles cookie persistence and automatic refresh.
    """

    def __init__(self, session_file='pinnacle_session.json'):
        self.session_file = session_file
        self.session = requests.Session()
        self.auth_data = None
        self.load_session()

    def load_session(self) -> bool:
        """Load saved session from file."""
        try:
            with open(self.session_file, 'r') as f:
                self.auth_data = json.load(f)

            # Restore cookies
            for name, value in self.auth_data.get('cookies', {}).items():
                self.session.cookies.set(name, value)

            # Check if expired
            login_time = datetime.fromisoformat(self.auth_data['login_time'])
            if datetime.now() - login_time > timedelta(hours=4):
                return False  # Session expired

            return True
        except (FileNotFoundError, json.JSONDecodeError):
            return False

    def save_session(self):
        """Save current session to file."""
        self.auth_data = {
            'login_time': datetime.now().isoformat(),
            'cookies': dict(self.session.cookies),
        }
        with open(self.session_file, 'w') as f:
            json.dump(self.auth_data, f, indent=2)

    def get_upcoming_events(self) -> list:
        """
        Fetch upcoming NBA events.

        Returns:
            List of event dictionaries
        """
        url = 'https://www.ps3838.com/sports-service/sv/compact/events'
        params = {
            'lg': '487',      # NBA
            'sp': '4',        # Basketball
            'hle': 'true',    # Pre-game only
            'tm': '0',        # Upcoming
            'locale': 'en_US',
        }

        response = self.session.get(url, params=params)
        response.raise_for_status()

        data = response.json()

        # Extract events from correct path
        events = []
        try:
            nba_events = data['hle'][0][2][0][2]
            for event in nba_events:
                events.append({
                    'event_id': event[0],
                    'home_team': event[1],
                    'away_team': event[2],
                    'start_time': datetime.fromtimestamp(event[4] / 1000),
                    'markets': event[8],  # Full markets object
                })
        except (KeyError, IndexError) as e:
            raise ValueError(f"Unexpected JSON structure: {e}")

        return events
```

#### 4. Update `parsers.py`

Add function for compact events endpoint:
```python
def extract_all_nba_games_compact(response: Dict) -> List[Dict]:
    """
    Extract NBA games from compact events endpoint.

    Args:
        response: JSON response from /compact/events endpoint

    Returns:
        List of event dictionaries
    """
    try:
        # Path: hle[0][2][0][2]
        nba_events = response['hle'][0][2][0][2]

        games = []
        for event in nba_events:
            if not isinstance(event, list) or len(event) < 9:
                continue

            games.append({
                'event_id': str(event[0]),
                'home_team': event[1],
                'away_team': event[2],
                'num_markets': event[3],
                'start_time': datetime.fromtimestamp(event[4] / 1000),
                'markets': event[8],
                'game_name': f"{event[2]} @ {event[1]}",
            })

        return games

    except (KeyError, IndexError, TypeError) as e:
        logger.error(f"Failed to extract NBA games: {e}")
        return []
```

### Long-Term Solutions

#### 1. Implement Automatic Login

**Challenge**: Reverse-engineer Pinnacle's login flow

**Steps**:
1. Capture login POST request with browser DevTools
2. Identify authentication endpoint and payload format
3. Implement programmatic login
4. Store and rotate credentials securely

**Code Stub**:
```python
def login(username: str, password: str) -> bool:
    """
    Perform login to Pinnacle and capture auth cookies.

    TODO: Reverse engineer login endpoint
    """
    login_url = "https://www.ps3838.com/api/login"  # TBD
    payload = {
        'username': username,
        'password': password,
        # ... other required fields
    }

    response = self.session.post(login_url, json=payload)

    if response.status_code == 200:
        self.save_session()
        return True

    return False
```

#### 2. Session Refresh Strategy

```python
def ensure_authenticated(self):
    """Ensure session is valid, refresh if needed."""
    if not self.load_session():
        # Session expired or missing
        if os.getenv('PINNACLE_USERNAME') and os.getenv('PINNACLE_PASSWORD'):
            return self.login(
                os.getenv('PINNACLE_USERNAME'),
                os.getenv('PINNACLE_PASSWORD')
            )
        else:
            raise Exception("Session expired and no credentials available")
    return True
```

#### 3. Rate Limiting & Error Handling

```python
from functools import wraps
import time

def retry_with_backoff(max_retries=3, backoff_base=2):
    """Decorator for exponential backoff retry."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except requests.exceptions.RequestException as e:
                    if attempt == max_retries - 1:
                        raise
                    wait_time = backoff_base ** attempt
                    time.sleep(wait_time)
        return wrapper
    return decorator

@retry_with_backoff()
def fetch_with_rate_limit(self, url, **kwargs):
    """Fetch URL with automatic retry and rate limiting."""
    time.sleep(3)  # Minimum 3s between requests
    return self.session.get(url, **kwargs)
```

## Testing Protocol

### Manual Test (Using Current Session)

```bash
# 1. Test current session (valid ~2-4 hours)
python3 1.DATABASE/etl/betting/test_authenticated_request.py

# 2. Verify data structure
cat pinnacle_response_tm0.json | jq '.hle[0][2][0][2][0]'

# 3. Extract specific market
cat pinnacle_response_tm0.json | jq '.hle[0][2][0][2][0][8]["0"]'
```

### Automated Integration Test

```bash
# Create test script
python3 1.DATABASE/etl/betting/test_session_manager.py --dry-run

# Expected output:
# ✅ Session loaded successfully
# ✅ Found 8 NBA events
# ✅ All events have valid timestamps
# ✅ All events have market data
```

## Next Steps

### Phase 1: Immediate (Today)
1. ✅ Validate authentication with test script
2. ⏳ Update `json_structure_mapping.md` with correct paths
3. ⏳ Create `pinnacle_session.py` session manager
4. ⏳ Update `parsers.py` with `extract_all_nba_games_compact()`

### Phase 2: Short-term (This Week)
1. Integrate session manager into `fetch_pinnacle_odds.py`
2. Test full ETL pipeline with new structure
3. Implement cookie rotation strategy
4. Add monitoring for session expiration

### Phase 3: Long-term (Next Week)
1. Reverse-engineer login flow
2. Implement programmatic authentication
3. Add automated session refresh
4. Set up scheduled daily runs

## Security Considerations

### Credentials Management
```bash
# Store in environment variables (never commit)
export PINNACLE_USERNAME="your_username"
export PINNACLE_PASSWORD="your_password"

# Use .env file (git-ignored)
echo "PINNACLE_USERNAME=your_username" >> 1.DATABASE/etl/betting/.env
echo "PINNACLE_PASSWORD=your_password" >> 1.DATABASE/etl/betting/.env
```

### Session File Permissions
```bash
# Protect session file
chmod 600 pinnacle_session.json

# Add to .gitignore
echo "pinnacle_session.json" >> .gitignore
```

## Files Modified/Created

### Created
- ✅ `/1.DATABASE/etl/betting/test_authenticated_request.py` - Test script
- ⏳ `/1.DATABASE/etl/betting/pinnacle_session.py` - Session manager
- ✅ `/claudedocs/pinnacle-api-analysis-2025-11-23.md` - This document

### To Modify
- ⏳ `/4.BETTING/json_structure_mapping.md` - Add compact endpoint docs
- ⏳ `/1.DATABASE/etl/betting/pinnacle_config.py` - Add auth headers/cookies
- ⏳ `/1.DATABASE/etl/betting/parsers.py` - Add compact endpoint parser
- ⏳ `/1.DATABASE/etl/betting/fetch_pinnacle_odds.py` - Use session manager

## Performance Metrics

### Current Test Results
```
Request Latency: ~500ms
Response Size: 27KB (8 events)
Success Rate: 100% (with valid session)
Session Lifetime: ~2-4 hours (estimated)
```

### Target Metrics
```
Daily Success Rate: >95%
Game Coverage: >90% of NBA schedule
Session Failures: <5% (with auto-refresh)
Average Latency: <1s per request
```

---

**Document Version**: 1.0
**Date**: 2025-11-23 04:55 UTC
**Author**: Claude Code Analysis
**Status**: ✅ Authentication validated, structure documented
