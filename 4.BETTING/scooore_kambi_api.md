# Scooore.be / Kambi API Documentation

## Overview

**Scooore.be** is a Belgian sportsbook operated by the Belgian National Lottery. It uses **Kambi** as its betting platform provider. The Kambi API is publicly accessible and returns JSON data.

## API Configuration

| Parameter | Value |
|-----------|-------|
| **Base URL** | `https://eu1.offering-api.kambicdn.com/offering/v2018/bnlbe` |
| **Operator ID** | `bnlbe` (Scooore Belgium) |
| **Market** | `BE` (Belgium) |
| **Language** | `fr_BE` (French Belgium) |

## Key Endpoints

### 1. NBA Matches with Odds
```
GET /listView/basketball/nba/all/all/matches.json
```

**Parameters:**
- `channel_id=1`
- `client_id=200`
- `lang=fr_BE`
- `market=BE`
- `useCombined=true`
- `useCombinedLive=true`

**Full URL:**
```
https://eu1.offering-api.kambicdn.com/offering/v2018/bnlbe/listView/basketball/nba/all/all/matches.json?channel_id=1&client_id=200&lang=fr_BE&market=BE&useCombined=true&useCombinedLive=true
```

### 2. Event Details (All Markets)
```
GET /betoffer/event/{event_id}.json
```

Returns all betting markets for a specific event including player props.

### 3. Live Events
```
GET /event/live/open.json
```

Returns currently live events across all sports.

### 4. Sports/Groups Structure
```
GET /group.json
```

Returns the full sports hierarchy and navigation structure.

### 5. Category Layout
```
GET /category/combined_layout,list_view/sport/BASKETBALL
```

Returns layout configuration for basketball category.

## JSON Response Structure

### Root Level
```json
{
  "events": [...],           // Array of event objects
  "terms": [...],            // Category/filter terms
  "activeTermIds": [...],    // Currently active filters
  "soonMode": false,
  "categoryGroups": [...],
  "activeCategories": [...],
  "activeEventTypes": [...],
  "eventTypes": [...],
  "defaultEventType": "..."
}
```

### Event Object Structure
Each item in `events` array contains:
```json
{
  "event": {
    "id": 1024647954,                          // Unique event ID
    "name": "Detroit Pistons - Orlando Magic", // Display name
    "englishName": "Detroit Pistons - Orlando Magic",
    "homeName": "Detroit Pistons",             // Home team
    "awayName": "Orlando Magic",               // Away team
    "start": "2025-11-29T00:30:00Z",          // Start time (UTC)
    "group": "NBA",                            // League name
    "groupId": 1000093652,                     // League ID
    "sport": "BASKETBALL",
    "state": "NOT_STARTED",                    // NOT_STARTED, STARTED, FINISHED
    "nonLiveBoCount": 314,                     // Number of bet offers available
    "tags": ["STREAMED_WEB", "OFFERED_LIVE", "BET_BUILDER", "MATCH"],
    "extraInfo": "NBA Cup"                     // Additional context
  },
  "betOffers": [...]                           // Array of betting markets
}
```

### BetOffer Structure
```json
{
  "id": 2581508648,
  "closed": "2025-11-29T00:30:00Z",
  "criterion": {
    "id": 1001159732,
    "label": "Prolongations incluses",              // French label
    "englishLabel": "Moneyline - Including Overtime",
    "lifetime": "FULL_TIME_OVERTIME"
  },
  "betOfferType": {
    "id": 2,                    // Market type ID (see below)
    "name": "Match",
    "englishName": "Match"
  },
  "eventId": 1024647954,
  "outcomes": [...],           // Array of selections
  "tags": ["OFFERED_PREMATCH", "BET_BUILDER", "MAIN"],
  "cashOutStatus": "ENABLED"
}
```

### Outcome (Selection) Structure
```json
{
  "id": 3968796242,
  "label": "Detroit Pistons",
  "englishLabel": "Detroit Pistons",
  "odds": 1670,                    // Raw odds (divide by 1000)
  "oddsFractional": "4/6",         // Fractional odds
  "oddsAmerican": "-150",          // American odds
  "participant": "Detroit Pistons",
  "participantId": 1000000217,
  "type": "OT_ONE",                // OT_ONE = home, OT_TWO = away
  "status": "OPEN",                // OPEN, SUSPENDED
  "line": -5500,                   // Spread/total line (divide by 1000)
  "changedDate": "2025-11-28T10:11:05Z",
  "cashOutStatus": "ENABLED"
}
```

## Market Type IDs

| ID | Market Type | Description |
|----|-------------|-------------|
| **1** | Point Spread | Handicap betting (spread) |
| **2** | Moneyline | Match winner (head-to-head) |
| **6** | Total Points | Over/Under betting |

## Odds Format Conversion

### Raw to Decimal
Kambi stores odds as integers multiplied by 1000:
```python
decimal_odds = raw_odds / 1000.0
# Example: 1670 -> 1.67
```

### Raw to Line
Lines (spreads/totals) are also stored as integers × 1000:
```python
line = raw_line / 1000.0
# Example: -5500 -> -5.5 spread
# Example: 238000 -> 238.0 total
```

## French Labels Mapping

| French | English |
|--------|---------|
| Prolongations incluses | Including Overtime |
| Plus de | Over |
| Moins de | Under |
| Match | Moneyline |
| Handicap | Point Spread |
| Total de points | Total Points |

## Example cURL Request
```bash
curl -s "https://eu1.offering-api.kambicdn.com/offering/v2018/bnlbe/listView/basketball/nba/all/all/matches.json?channel_id=1&client_id=200&lang=fr_BE&market=BE&useCombined=true&useCombinedLive=true" \
  -H "Accept: application/json" \
  -H "Origin: https://www.scooore.be" \
  -H "Referer: https://www.scooore.be/"
```

## Other Sports Endpoints

Replace `basketball/nba` with:
- `football/belgium/jupiler_pro_league` - Belgian football
- `ice_hockey/nhl` - NHL
- `american_football/nfl` - NFL
- `tennis` - All tennis

## Regional Variations

Different Kambi operators have different base paths:
- `bnlbe` - Scooore Belgium
- `888se` - 888 Sweden
- `unibet` - Unibet
- `betsson` - Betsson

The API structure is identical across operators.

## Rate Limiting

No strict rate limiting observed, but recommended:
- Max 60 requests/minute
- 1-2 second delay between requests
- Cache responses for 30-60 seconds

## Scraper Location

Python scraper: `1.DATABASE/etl/betting/fetch_scooore_odds.py`

### Usage
```bash
# Display odds
python3 fetch_scooore_odds.py

# Save to JSON
python3 fetch_scooore_odds.py --save --format json

# Save to CSV
python3 fetch_scooore_odds.py --save --format csv

# Quiet mode (no display)
python3 fetch_scooore_odds.py --save --quiet
```

## Data Output Location

Saved files: `1.DATABASE/data/odds/scooore_nba_YYYYMMDD_HHMMSS.json`

## Integration Notes

1. **Odds are always decimal** - Convert American odds if needed
2. **All times are UTC** - Convert to local timezone for display
3. **Event IDs are stable** - Can be used for tracking/updates
4. **Status field** - Check `status: "OPEN"` before using odds
5. **Cash out available** - Check `cashOutStatus: "ENABLED"`
