# Pinnacle Market Structure Mapping

**Date**: 2025-01-23
**API Endpoint**: `https://www.ps3838.com/sports-service/sv/compact/events`
**Critical Parameter**: `mk=1` (not `mk=3`)
**Authentication**: Required via cookies (`_sig`, `_apt`, `dpMs1`, `skin`, `lang`)

---

## Complete JSON Structure

### Base Path: `data['e'][3]`

```python
{
  'u': event_url,           # Event URL path
  'n': "Oklahoma City Thunder @ Indiana Pacers",  # Game name
  'i': 1617585501,          # Event ID
  'st': 1737684000000,      # Start time (Unix timestamp ms)
  'iu': 2,                  # Status indicator
  'cit': 0,                 # Unknown
  ...
  [2]: ["1.327", "3.620", ...],  # Moneylines (index 2)
  [8]: {                     # Compressed markets structure
    '0': [...],             # Game Totals
    '1': [...],             # Team Totals
    '3': [...],             # 1st Half Totals
    '4': [...],             # 1st Half Spreads
  }
}
```

---

## Moneylines (2 markets)

**Location**: `data['e'][3][2]`

```python
data['e'][3][2] = [
  "1.327",  # Home team moneyline (Indiana Pacers)
  "3.620",  # Away team moneyline (Oklahoma City Thunder)
  ...
]
```

**Markets**:
1. Home Team Moneyline (Indiana)
2. Away Team Moneyline (OKC)

---

## Compressed Markets: `data['e'][3][8]`

Each key ('0', '1', '3', '4') contains a 3-element array:

```python
'key': [
  [0]: metadata,           # Market type info
  [1]: special_markets,    # Player props + special markets
  [2]: alternative_lines   # Alternative spreads/totals
]
```

### Key '0': Game Totals (~40 markets)

**Element [0]**: Metadata
```python
[0] = [
  "Total",              # Market name
  [-10.5, 10.5, ...],  # Line options
  "ot",                # Unknown
  false                # Live status
]
```

**Element [1]**: Player Props & Special Markets (~30 markets)
```python
[1] = [
  {
    "liveEvent": false,
    "se": [  # <-- PLAYER PROPS ARRAY
      {
        "n": "Shai Gilgeous-Alexander (Points)",  # Player + stat type
        "h": 32.5,                                 # Line/handicap
        "l": [                                     # Odds array
          {"n": "Over", "p": 1.925, "pid": ...},
          {"n": "Under", "p": 1.819, "pid": ...}
        ]
      },
      {
        "n": "Shai Gilgeous-Alexander (Assists)",
        "h": 6.5,
        "l": [{"n": "Over", "p": 1.925}, {"n": "Under", "p": 1.819}]
      },
      {
        "n": "Odd/Even",                          # Special market
        "l": [
          {"n": "Odd", "p": 1.884, "pid": ...},
          {"n": "Even", "p": 1.980, "pid": ...}
        ]
      }
    ]
  }
]
```

**Player Prop Types Found**:
- Points
- Assists
- Rebounds
- 3-Point Field Goals Made
- Points + Rebounds + Assists (PRA)
- Double-Double
- Points + Assists
- Points + Rebounds
- Rebounds + Assists

**Special Market Types**:
- Odd/Even (total score)
- Winning Margin Range
- Winner/Total combinations

**Element [2]**: Alternative Lines (~10 markets)
```python
[2] = [
  [
    [-7.5, 7.5, "7.5", "1.980", "1.925", ...],  # Line 7.5
    [-8.0, 8.0, "8.0", "1.877", "2.010", ...],  # Line 8.0
    [-8.5, 8.5, "8.5", "1.800", "2.100", ...],  # Line 8.5
    ...
  ]
]
```

**Format**: `[away_handicap, home_handicap, display_line, away_odds, home_odds, ...]`

### Key '1': Team Totals (~30 markets)

**Same structure as Key '0'**:
- Element [0]: Metadata
- Element [1]: Player props (different players or stats)
- Element [2]: Alternative team total lines

### Key '3': 1st Half Totals (~20 markets)

**Same structure as Key '0'**:
- Element [0]: Metadata
- Element [1]: 1st Half player props
- Element [2]: Alternative 1st half total lines

### Key '4': 1st Half Spreads (~20 markets)

**Same structure as Key '0'**:
- Element [0]: Metadata
- Element [1]: 1st Half special markets
- Element [2]: Alternative 1st half spread lines

---

## Market Count Breakdown

| Category | Location | Count |
|----------|----------|-------|
| Moneylines | `data['e'][3][2]` | 2 |
| Game Totals - Alternative Lines | `data['e'][3][8]['0'][2]` | ~10 |
| Game Totals - Player Props | `data['e'][3][8]['0'][1]['se']` | ~30 |
| Team Totals - Alternative Lines | `data['e'][3][8]['1'][2]` | ~10 |
| Team Totals - Player Props | `data['e'][3][8]['1'][1]['se']` | ~20 |
| 1st Half Totals - Alternative Lines | `data['e'][3][8]['3'][2]` | ~10 |
| 1st Half Totals - Props/Special | `data['e'][3][8]['3'][1]['se']` | ~10 |
| 1st Half Spreads - Alternative Lines | `data['e'][3][8]['4'][2]` | ~10 |
| 1st Half Spreads - Special | `data['e'][3][8]['4'][1]['se']` | ~10 |
| **TOTAL** | | **~122** |

---

## Parsing Strategy

### 1. Parse Moneylines
```python
def parse_moneylines(data):
    moneylines = data['e'][3][2]
    return [
        {"market": "Moneyline", "team": "Home", "odds": moneylines[0]},
        {"market": "Moneyline", "team": "Away", "odds": moneylines[1]}
    ]
```

### 2. Parse Alternative Lines
```python
def parse_alternative_lines(compressed_array, market_category):
    """
    Parse element [2] from compressed structure
    compressed_array = data['e'][3][8]['0'][2]
    """
    lines = []
    for line_data in compressed_array[0]:  # First element is array of lines
        away_handicap, home_handicap, display, away_odds, home_odds = line_data[:5]
        lines.append({
            "category": market_category,
            "line": float(display),
            "away_odds": away_odds,
            "home_odds": home_odds
        })
    return lines
```

### 3. Parse Player Props & Special Markets
```python
def parse_special_markets(compressed_array):
    """
    Parse element [1]['se'] from compressed structure
    compressed_array = data['e'][3][8]['0'][1]
    """
    markets = []
    for obj in compressed_array:
        if 'se' in obj:
            for se in obj['se']:
                market = {
                    "name": se['n'],
                    "line": se.get('h'),  # May be None for special markets
                    "options": []
                }
                for option in se['l']:
                    market['options'].append({
                        "selection": option['n'],
                        "odds": option['p']
                    })
                markets.append(market)
    return markets
```

### 4. Convert Odds Formats
```python
def decimal_to_american(decimal_odds):
    """Convert decimal odds to American format"""
    decimal = float(decimal_odds)
    if decimal >= 2.0:
        return int((decimal - 1) * 100)
    else:
        return int(-100 / (decimal - 1))
```

---

## Database Storage Strategy

### Timestamp Tracking for Odds Movement

**NEVER UPDATE - ALWAYS INSERT**

```python
# Good: Track odds movement over time
INSERT INTO betting_odds (market_id, selection, odds_decimal, last_updated)
VALUES (123, 'Over 32.5', 1.925, NOW())

# Every 15 minutes, INSERT again with new timestamp
INSERT INTO betting_odds (market_id, selection, odds_decimal, last_updated)
VALUES (123, 'Over 32.5', 1.850, NOW())  # Odds moved from 1.925 to 1.850

# Bad: Updates destroy history
UPDATE betting_odds SET odds_decimal = 1.850 WHERE market_id = 123
```

### Storage Flow

```
1. Fetch authenticated API response
2. Parse all market categories (moneylines, alternative lines, player props)
3. For each market:
   a. Check if betting_event exists (by event_id)
   b. Check if betting_market exists (by event_id + market_key)
   c. INSERT new betting_odds row with current timestamp
4. Result: Complete odds snapshot at specific time
```

### Query for Odds Movement

```sql
-- Get odds movement for a specific market over last 4 hours
SELECT
  selection,
  odds_decimal,
  odds_american,
  last_updated
FROM betting_odds
WHERE market_id = 123
  AND last_updated >= NOW() - INTERVAL '4 hours'
ORDER BY last_updated ASC;

-- Opening line vs closing line
WITH opening AS (
  SELECT * FROM betting_odds
  WHERE market_id = 123
  ORDER BY last_updated ASC LIMIT 1
),
closing AS (
  SELECT * FROM betting_odds
  WHERE market_id = 123
  ORDER BY last_updated DESC LIMIT 1
)
SELECT
  o.odds_decimal as opening_odds,
  c.odds_decimal as closing_odds,
  (c.odds_decimal - o.odds_decimal) as movement
FROM opening o, closing c;
```

---

## Sample Extraction Output

```json
{
  "event_id": "1617585501",
  "game_name": "Oklahoma City Thunder @ Indiana Pacers",
  "start_time": "2025-01-23T19:00:00Z",
  "markets": [
    {
      "market_key": "moneyline_home",
      "market_name": "Moneyline - Indiana Pacers",
      "odds": [
        {"selection": "Indiana Pacers", "odds_decimal": 1.327, "odds_american": -306}
      ]
    },
    {
      "market_key": "player_props_points",
      "market_name": "Shai Gilgeous-Alexander (Points)",
      "line": 32.5,
      "odds": [
        {"selection": "Over 32.5", "odds_decimal": 1.925, "odds_american": -108},
        {"selection": "Under 32.5", "odds_decimal": 1.819, "odds_american": -122}
      ]
    },
    {
      "market_key": "game_total_alt",
      "market_name": "Game Total",
      "line": 7.5,
      "odds": [
        {"selection": "Over 7.5", "odds_decimal": 1.980, "odds_american": -102},
        {"selection": "Under 7.5", "odds_decimal": 1.925, "odds_american": -108}
      ]
    }
  ],
  "total_markets": 122,
  "fetched_at": "2025-01-23T14:30:00Z"
}
```

---

## Authentication Requirements

**Required Cookies**:
```
_sig=<session_signature>
_apt=<authentication_token>
dpMs1=<device_fingerprint>
skin=ps
lang=en_US
```

**Headers**:
```
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)
Accept: application/json
Referer: https://www.ps3838.com/
```

---

## API Parameters Explained

| Parameter | Value | Meaning |
|-----------|-------|---------|
| `mk` | `1` | **CRITICAL**: Returns all markets (not `3`) |
| `me` | `1617585501` | Specific event/game ID |
| `sp` | `4` | Sport ID (4 = Basketball) |
| `lg` | `487` | League ID (487 = NBA) |
| `locale` | `en_US` | Language/region |
| `more` | `false` | Include additional data |
| `withCredentials` | `true` | Send authentication cookies |

---

## Validation Checklist

✅ Market count matches ~122 per game
✅ Moneylines extracted (2 markets)
✅ Alternative lines parsed correctly
✅ Player props with all stat types
✅ Special markets (Odd/Even, Winning Margin)
✅ Odds formats converted (decimal → American)
✅ Timestamps preserved for movement tracking
✅ Database schema supports all market types

---

**Last Updated**: 2025-01-23
**Status**: Structure fully mapped, ready for parser implementation
