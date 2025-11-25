# Pinnacle NBA Betting Data Scraper - Implementation Plan

**Date Created**: 2025-01-23
**Status**: ⏳ PENDING IMPLEMENTATION
**Parent Plan**: betting-dashboard-implementation-plan.md (Phase 3-4 modification)

---

## 📋 Overview

This plan details the implementation of a Pinnacle sports betting odds scraper for NBA games. This replaces the generic "Respectful Betting Scraper" outlined in Phase 4 of the parent betting dashboard plan.

**Key Decision**: User has chosen to proceed with Pinnacle scraping despite feasibility assessment recommendation to use The Odds API.

---

## ✅ Database Schema Analysis (COMPLETE)

**Status**: Schema already exists in `migration 005_betting_intelligence.sql`

The existing schema is **perfectly suited** for Pinnacle data:

### betting_events table
- `event_id VARCHAR(20)` → Store Pinnacle event ID (e.g., "1617585501")
- `game_id VARCHAR(10)` → Link to our games table
- `bookmaker VARCHAR(50) DEFAULT 'pinnacle'` → Already configured
- `event_start_time TIMESTAMP` → Match start time
- `raw_data JSONB` → Store full Pinnacle API response for debugging
- `last_updated TIMESTAMP` → Track when event was last synced

### betting_markets table
- `market_id SERIAL PRIMARY KEY`
- `event_id VARCHAR(20)` → Links to betting_events
- `market_key VARCHAR(50)` → Store market type: "moneyline", "spread", "total", "1h_moneyline", "1h_spread", "1h_total"
- `market_name VARCHAR(100)` → Human-readable: "Money Line", "Spread", "Total Points"
- `last_updated TIMESTAMP` → Track market sync time

### betting_odds table
- `odds_id SERIAL PRIMARY KEY`
- `market_id INTEGER` → Links to betting_markets
- `selection VARCHAR(100)` → Team name or "over"/"under"
- `odds_decimal NUMERIC(6,2)` → Pinnacle uses decimal format (e.g., 1.335, 3.570)
- `odds_american INTEGER` → We'll convert decimal → American (e.g., -335, +357)
- `handicap NUMERIC(5,1)` → For spreads (e.g., -7.5, +7.5) and totals (e.g., 233.5)
- `last_updated TIMESTAMP` → **CRITICAL**: Tracks exact retrieval time for odds movement analysis

**No schema changes needed** - existing structure supports all requirements.

---

## 🎯 NBA Betting Markets to Scrape

### Primary Markets (Always Available)

**1. Moneyline** (straight winner bet)
- Market Key: `moneyline`
- API Parameter: `mk=1`
- Example: Lakers -335 (bet $335 to win $100), Clippers +357 (bet $100 to win $357)
- Storage: odds_decimal + odds_american (converted)

**2. Spread/Handicap** (point margin bet)
- Market Key: `spread`
- API Parameter: `mk=3` (included in all markets)
- Example: Lakers -7.5 @ 1.952 (must win by 8+ points)
- Storage: handicap field stores -7.5 or +7.5, odds in odds_decimal

**3. Total/Over-Under** (combined score)
- Market Key: `total`
- API Parameter: `mk=3` (included in all markets)
- Example: Over 233.5 @ 1.909, Under 233.5 @ 1.995
- Storage: handicap=233.5, selection="over" or "under"

### Secondary Markets (1st Half)

**4. 1st Half Moneyline**
- Market Key: `1h_moneyline`
- Same structure as moneyline, but for first 2 quarters only

**5. 1st Half Spread**
- Market Key: `1h_spread`
- Typically half the full game spread (e.g., -4 for 1H if -7.5 full game)

**6. 1st Half Total**
- Market Key: `1h_total`
- Typically around 110-120 points for NBA first half

---

## 🔗 Pinnacle API Endpoints

### URL 1: Events List (Moneyline)
```
https://www.ps3838.com/sports-service/sv/compact/events?btg=1&c=&cl=3&d=&ec=&ev=&g=&hle=false&ic=false&ice=false&inl=false&l=3&lang=&lg=487&lv=&me=0&mk=1&more=false&o=1&ot=1&pa=0&pimo=0%2C1%2C2&pn=-1&pv=1&sp=4&tm=0&v=0&locale=en_US&_=1761240557960&withCredentials=true
```

**Key Parameters**:
- `lg=487` → NBA league
- `sp=4` → Basketball sport
- `mk=1` → Moneyline market only
- `locale=en_US` → English US

**Purpose**: Get list of all NBA games for today with basic moneyline odds

**Response Contains**:
- Event IDs (used for URL 2)
- Team names
- Start times
- Moneyline odds (decimal format)

### URL 2: Detailed Markets per Event
```
https://www.ps3838.com/sports-service/sv/compact/events?btg=1&c=Others&cl=3&d=&ec=&ev=&g=&hle=true&ic=false&ice=false&inl=false&l=2&lang=&lg=&lv=&me=1617585501&mk=3&more=true&o=0&ot=1&pa=0&pimo=0%2C1%2C2&pn=-1&pv=1&sp=&tm=0&v=0&locale=en_US&_=1761240944813&withCredentials=true
```

**Key Parameters**:
- `me=1617585501` → Event ID from URL 1
- `mk=3` → All markets (spread, total, 1H markets, etc.)
- `more=true` → Include additional market details

**Purpose**: Get all betting markets for a specific game

**Response Contains**:
- Moneyline odds
- Spread odds with handicaps
- Total odds with over/under lines
- 1st half variants of above
- Alternative lines (multiple spread/total options)

---

## 🏗️ Implementation Architecture

### File Structure

**New Files to Create**:

```
/1.DATABASE/etl/betting/
  ├── fetch_pinnacle_odds.py       # Main scraper script
  ├── utils.py                      # Helper functions
  ├── pinnacle_config.py            # Configuration constants
  └── requirements.txt              # Python dependencies
```

### Core Functions

**`fetch_pinnacle_odds.py`**:
- `fetch_events()` → Call URL 1, parse events list
- `fetch_event_markets(event_id)` → Call URL 2, parse detailed markets
- `store_betting_event()` → Insert/update betting_events table
- `store_market_odds()` → Insert betting_markets + betting_odds
- `match_pinnacle_to_game()` → Link Pinnacle event to our games table
- `main()` → Orchestrate full scraping workflow

**`utils.py`**:
- `decimal_to_american(decimal_odds)` → Convert 1.335 to -335
- `american_to_decimal(american_odds)` → Reverse conversion
- `parse_team_name(pinnacle_name)` → Normalize team names
- `validate_odds(odds_value)` → Ensure odds are reasonable (1.01 to 50.0)
- `calculate_implied_probability(odds)` → For analytics

**`pinnacle_config.py`**:
- API endpoint base URLs
- Request headers (User-Agent, Accept, etc.)
- Market type mappings (mk values)
- Rate limiting constants (3-5 seconds)
- Database connection parameters

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Fetch Events List                                   │
│ URL 1 (lg=487, mk=1) → Get all NBA games for today         │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────────┐
        │ Parse JSON Response:              │
        │ - Extract event_ids               │
        │ - Extract team names              │
        │ - Extract start times             │
        │ - Extract moneyline odds          │
        └───────────┬───────────────────────┘
                    ↓
    ┌───────────────────────────────────────────┐
    │ Match to Games Table:                     │
    │ - Compare team names + date               │
    │ - Find game_id in our database            │
    │ - Store mapping: event_id → game_id      │
    └───────────┬───────────────────────────────┘
                ↓
┌───────────────────────────────────────────────────┐
│ INSERT betting_events:                            │
│ - event_id, game_id, bookmaker='pinnacle'        │
│ - event_start_time, last_updated=NOW()           │
└───────────────────────┬───────────────────────────┘
                        ↓
        ┌───────────────────────────────────┐
        │ For Each Event ID:                │
        │ Loop through all events from URL 1│
        └───────────┬───────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Fetch Detailed Markets                              │
│ URL 2 (me=event_id, mk=3) → Get all markets for game       │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────────┐
        │ Parse JSON Response:              │
        │ - Moneyline odds (both teams)     │
        │ - Spread with handicaps           │
        │ - Total with over/under           │
        │ - 1H moneyline, spread, total     │
        └───────────┬───────────────────────┘
                    ↓
    ┌───────────────────────────────────────────┐
    │ Convert Odds Format:                      │
    │ - Decimal → American (1.335 → -335)      │
    │ - Store both formats in database          │
    └───────────┬───────────────────────────────┘
                ↓
┌───────────────────────────────────────────────────┐
│ INSERT betting_markets:                           │
│ - For each market type (moneyline, spread, etc.) │
│ - market_key, market_name, last_updated=NOW()    │
└───────────────────────┬───────────────────────────┘
                        ↓
┌───────────────────────────────────────────────────┐
│ INSERT betting_odds (MULTIPLE ROWS):              │
│ - For each selection (team A, team B, over, under)│
│ - odds_decimal, odds_american, handicap          │
│ - last_updated=NOW() ← TRACKS RETRIEVAL TIME     │
└───────────────────────────────────────────────────┘
```

**Key Insight**: `last_updated` timestamp on EVERY odds insert creates complete history of line movement throughout the day.

---

## ⏱️ Odds Movement Tracking Strategy

### Why Timestamps Matter

**Line Movement** = odds changes between opening and closing
- Opening line: First odds posted (usually night before or morning of game)
- Closing line: Final odds before game starts
- Movement reveals where "sharp money" (professional bettors) is going

### How We Track It

**Every 15 minutes**, scraper runs and:
1. Fetches current odds from Pinnacle
2. Inserts NEW rows in betting_odds (never updates existing)
3. Timestamps each insert with `last_updated=NOW()`

**Example Timeline**:
```sql
-- 9:00 AM: Opening line
Lakers -7.5 @ 1.952 (last_updated: 2025-01-24 09:00:00)

-- 2:00 PM: Sharp money on Lakers, line moves
Lakers -8.0 @ 1.943 (last_updated: 2025-01-24 14:00:00)

-- 6:45 PM: Public money on underdog, line bounces back
Lakers -7.5 @ 1.952 (last_updated: 2025-01-24 18:45:00)
```

### Queries We Can Build

**Opening vs Closing Line**:
```sql
WITH odds_timeline AS (
  SELECT
    market_id,
    selection,
    handicap,
    odds_decimal,
    last_updated,
    ROW_NUMBER() OVER (PARTITION BY market_id, selection ORDER BY last_updated ASC) as rn_first,
    ROW_NUMBER() OVER (PARTITION BY market_id, selection ORDER BY last_updated DESC) as rn_last
  FROM betting_odds
  WHERE market_id = 123
)
SELECT
  opening.selection,
  opening.handicap as opening_handicap,
  opening.odds_decimal as opening_odds,
  opening.last_updated as opening_time,
  closing.handicap as closing_handicap,
  closing.odds_decimal as closing_odds,
  closing.last_updated as closing_time,
  (closing.handicap - opening.handicap) as line_movement
FROM
  (SELECT * FROM odds_timeline WHERE rn_first = 1) opening
JOIN
  (SELECT * FROM odds_timeline WHERE rn_last = 1) closing
ON opening.market_id = closing.market_id
   AND opening.selection = closing.selection;
```

**Line Movement Chart**:
```sql
SELECT
  last_updated as timestamp,
  handicap,
  odds_decimal
FROM betting_odds
WHERE market_id = 123 AND selection = 'Los Angeles Lakers'
ORDER BY last_updated;
```

This data is **gold** for betting analytics and strategy development.

---

## 🔧 Implementation Phases

### Phase A: Core Scraper (2-3 hours)

**Deliverables**:
- [ ] Create `/1.DATABASE/etl/betting/` directory
- [ ] Write `pinnacle_config.py` with API endpoints and headers
- [ ] Write `fetch_pinnacle_odds.py` skeleton
- [ ] Implement `fetch_events()` function (URL 1)
- [ ] Implement `fetch_event_markets()` function (URL 2)
- [ ] Add rate limiting (3-5 seconds between requests)
- [ ] Test API calls and inspect JSON responses
- [ ] Add error handling for network failures

**Success Criteria**:
- Can successfully fetch events list from URL 1
- Can successfully fetch detailed markets from URL 2
- Rate limiting works (confirmed via logs)
- JSON responses are parseable

---

### Phase B: Data Parsing & Transformation (2-3 hours)

**Deliverables**:
- [ ] Write `utils.py` with conversion functions
- [ ] Implement `decimal_to_american()` odds conversion
- [ ] Implement team name normalization
- [ ] Parse moneyline data from JSON
- [ ] Parse spread data (extract handicap + odds)
- [ ] Parse total data (extract over/under + odds)
- [ ] Parse 1st half markets
- [ ] Add data validation (odds range checks)
- [ ] Test parsing with sample responses

**Success Criteria**:
- All market types parse correctly
- Odds conversion works (test: 1.335 → -335, 3.570 → +357)
- Handicaps extracted correctly (test: -7.5, +7.5)
- Data validation catches bad values

---

### Phase C: Database Integration (2-3 hours)

**Deliverables**:
- [ ] Implement `match_pinnacle_to_game()` function
- [ ] Implement `store_betting_event()` function
- [ ] Implement `store_market_odds()` function
- [ ] Handle duplicate events (UPDATE vs INSERT)
- [ ] Always INSERT new odds rows (never UPDATE existing)
- [ ] Add database error handling
- [ ] Test end-to-end flow with sample data
- [ ] Verify timestamps are stored correctly

**Game Matching Logic**:
```python
def match_pinnacle_to_game(home_team, away_team, start_time):
    """
    Match Pinnacle event to our games table.

    Strategy:
    1. Normalize team names (LAL → Los Angeles Lakers)
    2. Query games table for date range (±2 hours of start_time)
    3. Match on home_team_id + away_team_id
    4. Return game_id or None if no match
    """
```

**Success Criteria**:
- Events link correctly to games table
- Markets and odds insert successfully
- Timestamps stored with timezone awareness
- Can handle duplicate scrapes (idempotent)

---

### Phase D: Scheduling & Monitoring (1-2 hours)

**Deliverables**:
- [ ] Create cron job configuration
- [ ] Set schedule: every 15 minutes on game days
- [ ] Add comprehensive logging (INFO, ERROR levels)
- [ ] Add monitoring queries (last scrape time, odds count)
- [ ] Create alerting for failures
- [ ] Document how to run manually
- [ ] Test scheduled execution

**Cron Job Example**:
```bash
# Run every 15 minutes from 9 AM to 11 PM on game days
*/15 9-23 * * * cd /path/to/etl && python3 betting/fetch_pinnacle_odds.py >> /var/log/pinnacle_scraper.log 2>&1
```

**Success Criteria**:
- Scraper runs automatically on schedule
- Logs are readable and informative
- Failures are logged with stack traces
- Can manually trigger scrape for testing

---

## 📝 Code Snippets

### Odds Conversion Utilities

```python
def decimal_to_american(decimal_odds: float) -> int:
    """
    Convert decimal odds to American format.

    Examples:
        1.335 → -335 (favorite)
        3.570 → +357 (underdog)
        2.000 → +100 (even money)
    """
    if decimal_odds >= 2.0:
        # Underdog: positive American odds
        return int((decimal_odds - 1) * 100)
    else:
        # Favorite: negative American odds
        return int(-100 / (decimal_odds - 1))

def american_to_decimal(american_odds: int) -> float:
    """
    Convert American odds to decimal format.

    Examples:
        -335 → 1.335
        +357 → 3.570
        +100 → 2.000
    """
    if american_odds > 0:
        return 1 + (american_odds / 100)
    else:
        return 1 + (100 / abs(american_odds))
```

### Rate Limiting Implementation

```python
import time
import requests
from datetime import datetime

RATE_LIMIT_SECONDS = 3  # Minimum delay between requests

last_request_time = None

def fetch_with_rate_limit(url: str, headers: dict) -> dict:
    """
    Fetch URL with automatic rate limiting.
    """
    global last_request_time

    # Enforce rate limit
    if last_request_time is not None:
        elapsed = (datetime.now() - last_request_time).total_seconds()
        if elapsed < RATE_LIMIT_SECONDS:
            sleep_time = RATE_LIMIT_SECONDS - elapsed
            time.sleep(sleep_time)

    # Make request
    response = requests.get(url, headers=headers, timeout=10)
    last_request_time = datetime.now()

    return response.json()
```

### Game Matching Logic

```python
def match_pinnacle_to_game(home_team: str, away_team: str, start_time: datetime) -> str:
    """
    Match Pinnacle event to our games table.

    Returns game_id or None if no match found.
    """
    # Normalize team names
    home_abbr = normalize_team_name(home_team)
    away_abbr = normalize_team_name(away_team)

    # Query games table (±2 hours window)
    query = """
        SELECT g.game_id
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE ht.abbreviation = %s
          AND at.abbreviation = %s
          AND g.game_date_est BETWEEN %s AND %s
        LIMIT 1
    """

    start_window = start_time - timedelta(hours=2)
    end_window = start_time + timedelta(hours=2)

    result = execute_query(query, (home_abbr, away_abbr, start_window, end_window))

    return result[0]['game_id'] if result else None
```

---

## ⚠️ Risk Mitigation

Despite user preference to proceed, we'll implement responsible practices:

### Rate Limiting
- **Minimum 3 seconds** between requests
- **Maximum 5 seconds** if server slow to respond
- Exponential backoff on errors (3s → 6s → 12s → 24s)

### Respectful Behavior
- **Proper User-Agent**: "NBA Stats Research Bot v1.0 (contact@example.com)"
- **Accept headers**: Standard browser headers
- **No authentication**: Guest mode only (accept delayed odds)
- **Stop on 429**: If rate limited, stop for 5 minutes

### Error Handling
- **Network failures**: Retry 3 times with exponential backoff
- **Parse errors**: Log raw response, continue to next event
- **Database errors**: Rollback transaction, log error, continue
- **Missing games**: Log unmatched events, don't fail entire scrape

### Data Quality
- **Odds validation**: Ensure 1.01 ≤ odds ≤ 50.0
- **Handicap validation**: Reasonable ranges (-30 to +30 for spreads)
- **Duplicate detection**: Check last_updated before inserting
- **Monitoring**: Alert if no odds scraped for 2+ hours on game day

---

## 📈 Success Metrics

### Technical Metrics
- [ ] **Uptime**: Scraper runs successfully 95%+ of scheduled times
- [ ] **Coverage**: 90%+ of NBA games matched and scraped
- [ ] **Latency**: Each scrape completes in <5 minutes
- [ ] **Error Rate**: <5% of API calls fail

### Data Quality Metrics
- [ ] **Completeness**: All 6 market types captured for each game
- [ ] **Accuracy**: Odds values pass validation checks
- [ ] **Timeliness**: Latest odds <20 minutes old during game days
- [ ] **History**: 20+ data points per game (every 15 min × 5 hours pre-game)

### Business Metrics
- [ ] **Line Movement Data**: Can track opening to closing line changes
- [ ] **Historical Archive**: 7+ days of odds history retained
- [ ] **Query Performance**: Odds retrieval queries <100ms
- [ ] **Analytics Ready**: Data supports betting dashboard features

---

## 🗓️ Timeline Estimate

| Phase | Description | Time Estimate |
|-------|-------------|---------------|
| **Phase A** | Core scraper (API calls) | 2-3 hours |
| **Phase B** | Data parsing & transformation | 2-3 hours |
| **Phase C** | Database integration | 2-3 hours |
| **Phase D** | Scheduling & monitoring | 1-2 hours |
| **Total** | End-to-end implementation | **7-11 hours** |

**Recommended Approach**: Implement in order (A → B → C → D), testing each phase before moving to next.

---

## 🚀 Next Steps After Implementation

Once scraper is running, we can build:

1. **Betting Dashboard Frontend** (Phase 6 of parent plan)
   - Display today's games with live odds
   - Show line movement charts
   - Highlight value betting opportunities

2. **Custom Analytics** (Phase 5 of parent plan)
   - "Player X without Player Y" performance analysis
   - Compare our statistical predictions vs bookmaker lines
   - Expected value (EV) calculations

3. **Alerting System**
   - Notify when line moves significantly (>1.5 points for spreads)
   - Alert on reverse line movement (sharp money indicator)
   - Notify when closing line differs from opening by 10%+

---

## 📚 References

**Pinnacle API Endpoints** (provided by user):
- URL 1: https://www.ps3838.com/sports-service/sv/compact/events?lg=487&mk=1&sp=4...
- URL 2: https://www.ps3838.com/sports-service/sv/compact/events?me={event_id}&mk=3&more=true...

**Related Documentation**:
- Feasibility Assessment: `/claudedocs/pinnacle-api-feasibility-assessment.md`
- Database Schema: `/1.DATABASE/migrations/005_betting_intelligence.sql`
- Parent Plan: `/3.ACTIVE_PLANS/betting-dashboard-implementation-plan.md`

---

**Plan Status**: ✅ VALIDATED - Ready for implementation
**Next Action**: Begin Phase A (Core Scraper) implementation
**Expected Completion**: 7-11 hours of focused development
