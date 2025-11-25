# JSON Structure Mapping for Betting Markets

This document provides a comprehensive mapping of the JSON structure from betting data API responses to different betting markets.

## ⚠️ IMPORTANT: Multiple API Endpoints

Pinnacle uses **different JSON structures** depending on the endpoint. There are two main structures:

### 1. Compact Events List Endpoint (NEW)

**URL Pattern**: `/sports-service/sv/compact/events?lg=487&sp=4&hle=true`

**Purpose**: Fetch list of upcoming NBA games with basic market data

**Root Structure**:
```json
{
  "e": null,                    // ❌ Empty in this endpoint
  "hle": [                      // ✅ Events are HERE
    [
      4,                        // Sport ID (Basketball)
      "Basketball",             // Sport name
      [                         // Leagues array
        [
          487,                  // League ID (NBA)
          "NBA",                // League name
          [                     // ✅ NBA Events array
            [/* event 1 */],
            [/* event 2 */],
            ...
          ]
        ]
      ]
    ]
  ]
}
```

**Access Path**: `data['hle'][0][2][0][2]` → Array of NBA events

**Event Structure**: Same as detailed endpoint (see below), with indices [0-8] matching

**Use Case**: Daily ETL scraping to find all upcoming games

---

### 2. Event-Specific Endpoint (ORIGINAL)

**URL Pattern**: `/sports-service/sv/compact/events?me={event_id}`

**Purpose**: Fetch detailed markets for a specific event

## Root Structure (Event-Specific Endpoint)

```json
{
  "u": null,
  "l": null,
  "n": null,
  "e": [category, league_id, status, [event_data]],
  "pt": 0,
  "ps": null,
  "d": null,
  ...
}
```

**Key Fields:**
- `e[0]`: Category/Type (e.g., 4 for basketball)
- `e[1]`: League ID (e.g., 487 for NBA)
- `e[2]`: Status indicator
- `e[3]`: **Main event data array** (see below)

---

## Event Data Structure (e[3])

### Event Metadata Positions

```
e[3][0]  = Event ID (e.g., 1617585501)
e[3][1]  = Home Team Name (e.g., "Indiana Pacers")
e[3][2]  = Away Team Name (e.g., "Oklahoma City Thunder")
e[3][3]  = Number of market lines (e.g., 11)
e[3][4]  = Start Time (Unix timestamp in milliseconds, e.g., 1761262200000)
e[3][5]  = Status/metadata
e[3][6]  = Status/metadata
e[3][7]  = Status/metadata
e[3][8]  = **Markets Object** (contains all betting markets by period)
e[3][9+] = Additional metadata
```

### Example:
```json
e[3] = [
  1617585501,                    // Event ID
  "Indiana Pacers",              // Home Team
  "Oklahoma City Thunder",       // Away Team
  11,                            // Number of lines
  1761262200000,                 // Start time
  0, 1, 80,                      // Status metadata
  { "0": [...], "1": [...], "3": [...], "4": [...] },  // Markets by period
  ...
]
```

---

## Markets Object Structure (e[3][8])

The markets are organized by **period keys** as object properties:

```json
e[3][8] = {
  "0": [/* Full Game markets */],
  "1": [/* 1st Half markets */],
  "3": [/* Quarter/Period markets */],
  "4": [/* Other period markets */]
}
```

### Period Keys

| Key | Period | Description |
|-----|--------|-------------|
| `"0"` | Full Game | Main game markets (ML, HDP, OU) |
| `"1"` | 1st Half | First half markets |
| `"3"` | TBD | Additional period (quarters, etc.) |
| `"4"` | TBD | Additional period |

**Note:** In HTML, these correspond to `data-period="0"`, `data-period="1"`, etc.

---

## Internal Structure for Each Period

Each period key (e.g., `e[3][8]["0"]`) contains an array with this structure:

```
e[3][8][period][0] = Nested array: [[team totals for home], [team totals for away]]
e[3][8][period][1] = Special markets & player props array
e[3][8][period][2] = Handicap/Spread alternative lines array
e[3][8][period][3] = Game totals (combined score) alternative lines array
e[3][8][period][4] = Moneyline odds array
e[3][8][period][5] = Additional metadata
e[3][8][period][6+] = More metadata (status, limits, etc.)
```

**Updated Structure (Verified 2025-11-23):**
- Index [0] contains a **nested structure** with team totals for both teams
- Index [2] contains spreads/handicaps
- Index [3] contains game totals (combined score)
- Index [4] contains moneyline odds

---

## Detailed Field Formats

### 1. Handicap/Spread Lines (Index [2])

Array of arrays, where each inner array represents an alternative handicap line:

```json
[
  [-7.0, 7.0, "7.0", "2.070", "1.833", 0, 1, 51821960162, 1, 10000.00, 1],
  [-7.5, 7.5, "7.5", "1.980", "1.925", 0, 0, 3316014498, 0, 2000.00, 1],
  ...
]
```

**Field positions:**
```
[0] = Away team handicap (negative)
[1] = Home team handicap (positive)
[2] = Display handicap value (string)
[3] = Away team odds (string)
[4] = Home team odds (string)
[5] = Unknown (usually 0)
[6] = Is alternative line (0 or 1)
[7] = Odds ID
[8] = Unknown (usually 0 or 1)
[9] = Maximum bet amount
[10] = Unknown (usually 1 or 2)
```

**Example from HTML:**
```html
<div class="hdp">
  <span>7.0</span>
</div>
<div class="odds">
  <a data-oddsid="51821960162">2.070</a>
  <a data-oddsid="51821960162">1.833</a>
</div>
```

### 2. Special Markets & Player Props (Index [1])

Array of objects containing special markets and player props:

```json
[
  {
    "liveEvent": false,
    "li": 487,                           // League ID
    "ln": "NBA",                         // League Name
    "se": [                              // Selections/Markets array
      {
        "st": "O",                       // Status
        "si": 1618101872,                // Selection ID
        "m": 0.0,
        "x": 250.0,
        "xc": 250.0,
        "n": "Shai Gilgeous-Alexander (Points)",  // Market name
        "on": "Shai Gilgeous-Alexander (Points)", // Original name
        "d": 1761262200000,              // Date
        "e": "Oklahoma City Thunder vs Indiana Pacers",  // Event
        "ei": 1617585501,                // Event ID
        "l": [                           // Lines/Outcomes
          {
            "i": 1618101873,             // Line ID
            "l": 5439372392,             // Line identifier
            "n": "Over",                 // Outcome name
            "p": 1.925,                  // Price/Odds
            "h": 32.5,                   // Handicap/Line value
            "c": null,
            "rn": 530                    // Runner number
          },
          {
            "i": 1618101874,
            "l": 5439372393,
            "n": "Under",
            "p": 1.813,
            "h": 32.5,
            "c": null,
            "rn": 531
          }
        ],
        "cg": "Player Props",            // Category group
        "ocg": "Player Props",           // Original category
        "un": "Points",                  // Unit type
        "oun": "Points",                 // Original unit
        "pe": 0,                         // Period
        "bt": "OVER_UNDER"               // Bet type
      }
    ],
    "levn": "Oklahoma City Thunder vs Indiana Pacers",
    "parentId": 1617585501,
    "lt": 1761262200000,
    "cg": "Player Props",
    "ile": false,
    "ocg": "Player Props"
  }
]
```

**Common bet types (bt):**
- `"OVER_UNDER"` - Over/Under markets
- `"MULTI_WAY_HEAD_TO_HEAD"` - Multiple outcome markets
- `"HEAD_TO_HEAD"` - Two-way markets

**Common units (un):**
- `"Points"` - Player points
- `"Rebounds"` - Player rebounds
- `"Assists"` - Player assists
- `"ThreePointFieldGoals"` - 3-pointers made
- `"PointsReboundsAssist"` - Combined stats (PRA)
- `"DoubleDouble"` - Double-double achievement

### 3. Over/Under Lines (Index [0] and [3])

**IMPORTANT DISTINCTION: Team Totals vs Game Totals**

There are **TWO types** of totals markets:

1. **Team Totals** (individual team score) - Located at `e[3][8][period][0]`
2. **Game Totals** (combined score of both teams) - Located at `e[3][8][period][3]`

#### 3a. Team Totals (Index [0])

**Nested array structure** containing totals for each team:

```json
e[3][8]["0"][0] = [
  [  // Home team totals (e.g., Denver Nuggets)
    ["125.5", 125.5, "1.854", "2.000", 3359822193, 0, 2000.0, 2],
    ...
  ],
  [  // Away team totals (e.g., Sacramento Kings)
    ["114.5", 114.5, "1.943", "1.909", 3359822193, 0, 2000.0, 2],
    ...
  ]
]
```

**Structure:**
```
e[3][8][period][0][0] = Home team totals array
e[3][8][period][0][1] = Away team totals array
```

**Field positions (same for both teams):**
```
[0] = Total line (string)
[1] = Total line (number)
[2] = Over odds (string)
[3] = Under odds (string)
[4] = Odds ID
[5] = Is alternative line (0 or 1)
[6] = Maximum bet amount
[7] = Unknown (usually 1 or 2)
```

**Example - Denver Nuggets Team Total:**
```
["125.5", 125.5, "1.854", "2.000", ...]
```
- Denver Over 125.5 @ 1.854
- Denver Under 125.5 @ 2.000

**Example - Sacramento Kings Team Total:**
```
["114.5", 114.5, "1.943", "1.909", ...]
```
- Sacramento Over 114.5 @ 1.943
- Sacramento Under 114.5 @ 1.909

#### 3b. Game Totals (Index [3])

**Array of arrays** for alternative game totals (combined score):

```json
e[3][8]["0"][3] = [
  ["238.0", 238.0, "1.719", "2.200", 52650299301, ...],
  ["243.0", 243.0, "2.200", "1.719", 52650299337, ...],
  ...
]
```

**Field positions:**
```
[0] = Total line (string)
[1] = Total line (number)
[2] = Over odds (string)
[3] = Under odds (string)
[4] = Odds ID
[5] = Is alternative line (0 or 1)
[6] = Maximum bet amount
[7] = Unknown (usually 1 or 2)
```

**Example from HTML:**
```html
<div class="hdp">
  <span>238.0</span>
  <span>u</span>
</div>
<div class="odds">
  <a data-oddsid="52650299301">1.719</a>
  <a data-oddsid="52650299301">2.200</a>
</div>
```

**Key Difference:**
- **Team Totals**: Bet on one team's score only (e.g., "Will Denver score over 125.5 points?")
- **Game Totals**: Bet on combined score of both teams (e.g., "Will total points be over 238.0?")

### 4. Moneyline Odds (Index [4])

Array with moneyline odds:

```json
["1.327", "3.620", null, 3316014498, 0, 6000.00, 1]
```

**Field positions:**
```
[0] = Away team moneyline odds (string)
[1] = Home team moneyline odds (string)
[2] = Draw odds (null for basketball)
[3] = Odds ID
[4] = Unknown (usually 0)
[5] = Maximum bet amount
[6] = Unknown (usually 1)
```

**Example from HTML:**
```html
<td class="col-1x2">
  <a data-oddsid="3316014498">3.620</a>
  <a data-oddsid="3316014498">1.327</a>
</td>
```

---

## Multiple Bookmaker Lines

The HTML shows multiple rows per game with different bookmaker lines (indicated by row ID suffixes `_0`, `_1`, etc.):

```html
<tr id="e1617585501_1">  <!-- Bookmaker 1 -->
<tr id="e1617585501_0">  <!-- Bookmaker 2 (main line) -->
<tr id="e1617585501_1">  <!-- Bookmaker 3 -->
```

In the JSON, these correspond to:
- **Main line** (suffix `_0`): Usually at index [0] of each market type array
- **Alternative lines** (suffix `_1`): Additional entries in the arrays with `isAlt = 1`

**Bookmaker identification:**
- Each odds entry has an `odds_id` field (e.g., `51821960162`, `3316014498`)
- The `odds_id` maps to a specific bookmaker
- Multiple bookmakers provide different lines for the same market

---

## Player Props Locations

**IMPORTANT:** Player props are NOT limited to one location. They appear in MULTIPLE places:

1. **Full Game Props**: `e[3][8]["0"][1]`
2. **1st Half Props**: `e[3][8]["1"][1]`
3. **Other Period Props**: `e[3][8]["3"][1]`, `e[3][8]["4"][1]`, etc.

Each period can have its own player props (e.g., "1st Half Points", "Full Game Points").

### Accessing Player Props

To get all full game player props:

```javascript
const fullGameProps = e[3][8]["0"][1]; // Array of prop objects
fullGameProps.forEach(propGroup => {
  propGroup.se.forEach(prop => {
    console.log(prop.n);  // e.g., "Shai Gilgeous-Alexander (Points)"
    prop.l.forEach(outcome => {
      console.log(`${outcome.n}: ${outcome.p} @ ${outcome.h}`);
      // e.g., "Over: 1.925 @ 32.5"
    });
  });
});
```

---

## Complete Example: Full Game Markets

For event `1617585501` (Indiana Pacers vs Oklahoma City Thunder):

### Full Game Handicap (Period 0)
```javascript
// Path: e[3][8]["0"][0]
// Handicap 7.0 line from bookmaker 51821960162
[-7.0, 7.0, "7.0", "2.070", "1.833", 0, 1, 51821960162, 1, 10000.00, 1]

// Interpretation:
// Away (OKC): -7.0 @ 2.070
// Home (IND): +7.0 @ 1.833
// Odds ID: 51821960162
// Max bet: 10000.00
```

### Full Game Total (Period 0)
```javascript
// Path: e[3][8]["0"][2]
// Total 232.5 line from bookmaker 51821960172
["232.5", 232.5, "1.990", "1.892", 51821960172, 1, 5000.00, 1]

// Interpretation:
// Over 232.5 @ 1.990
// Under 232.5 @ 1.892
// Odds ID: 51821960172
// Max bet: 5000.00
```

### Full Game Moneyline (Period 0)
```javascript
// Path: e[3][8]["0"][3]
// Moneyline from bookmaker 3316014498
["1.327", "3.620", null, 3316014498, 0, 6000.00, 1]

// Interpretation:
// Away (OKC): 1.327
// Home (IND): 3.620
// Odds ID: 3316014498
// Max bet: 6000.00
```

### Full Game Player Prop (Period 0)
```javascript
// Path: e[3][8]["0"][1][n].se[m]
// Shai Gilgeous-Alexander Points Over/Under 32.5
{
  "n": "Shai Gilgeous-Alexander (Points)",
  "l": [
    { "n": "Over", "p": 1.925, "h": 32.5 },
    { "n": "Under", "p": 1.813, "h": 32.5 }
  ],
  "un": "Points",
  "bt": "OVER_UNDER"
}
```

---

## HTML to JSON Mapping Reference

| HTML Element | JSON Path | Field |
|--------------|-----------|-------|
| `data-eid="1617585501"` | `e[3][0]` | Event ID |
| `data-home-team` | `e[3][1]` | Home Team |
| `data-away-team` | `e[3][2]` | Away Team |
| `data-period="0"` | `e[3][8]["0"]` | Full Game markets |
| `data-period="1"` | `e[3][8]["1"]` | 1st Half markets |
| `data-oddsid="51821960162"` | Array field `[7]` | Odds ID |
| `<span>7.0</span>` (HDP) | Handicap array `[2]` | Display value |
| `<span>2.070</span>` (odds) | Handicap array `[3]` or `[4]` | Odds |

---

## Quick Reference Paths

### Compact Events List Endpoint

```javascript
// Extract all NBA events
const nbaEvents = data['hle'][0][2][0][2];  // Array of events

// Iterate through events
nbaEvents.forEach(event => {
  const eventId = event[0];
  const homeTeam = event[1];
  const awayTeam = event[2];
  const numMarkets = event[3];
  const startTime = new Date(event[4]);  // Timestamp in ms
  const markets = event[8];              // Markets object

  // Access markets (same structure as event-specific endpoint)
  const handicaps = markets["0"][0];     // Full game spreads
  const totals = markets["0"][1];        // Full game totals
  const moneyline = markets["0"][2];     // Full game moneyline
});
```

### Event-Specific Endpoint

```javascript
// Event metadata (from e[3])
const eventId = e[3][0];
const homeTeam = e[3][1];
const awayTeam = e[3][2];
const startTime = e[3][4];

// Full game markets
const homeTeamTotals = e[3][8]["0"][0][0];      // Home team totals (nested)
const awayTeamTotals = e[3][8]["0"][0][1];      // Away team totals (nested)
const fullGameProps = e[3][8]["0"][1];           // Player props
const fullGameHandicaps = e[3][8]["0"][2];       // Spreads/handicaps
const fullGameTotals = e[3][8]["0"][3];          // Game totals (combined score)
const fullGameMoneyline = e[3][8]["0"][4];       // Moneyline

// 1st half markets
const halfHomeTeamTotals = e[3][8]["1"][0][0];   // Home team totals
const halfAwayTeamTotals = e[3][8]["1"][0][1];   // Away team totals
const halfProps = e[3][8]["1"][1];               // Player props
const halfHandicaps = e[3][8]["1"][2];           // Spreads
const halfTotals = e[3][8]["1"][3];              // Game totals
const halfMoneyline = e[3][8]["1"][4];           // Moneyline

// Main line (bookmaker with _0 suffix)
const mainHandicap = fullGameHandicaps.find(h => h[6] === 0);
const mainTotal = fullGameTotals.find(t => t[5] === 0);
const mainHomeTeamTotal = homeTeamTotals.find(t => t[5] === 0);
const mainAwayTeamTotal = awayTeamTotals.find(t => t[5] === 0);
```

---

## Notes

- **String vs Number**: Odds are often stored as strings (`"1.925"`) but can be parsed as numbers
- **Timestamps**: All timestamps are Unix milliseconds (divide by 1000 for seconds)
- **Null values**: Some fields may be `null` (e.g., draw odds in basketball)
- **Alternative lines**: Identified by the "is alternative" flag (usually index `[6]` for handicaps, `[5]` for totals)
- **Bookmaker IDs**: The `odds_id` field uniquely identifies the bookmaker/line provider

---

## Database Stored Format (betting_events.raw_data)

**⚠️ IMPORTANT:** The `raw_data` JSONB stored in `betting_events` table uses a **simplified structure** compared to the full API response. The structure below has been **verified on 2025-11-25** against live Pinnacle data.

### Stored Structure Overview

```json
{
  "markets": {
    "0": [...],  // Full Game markets
    "1": [...],  // 1st Half markets
    "3": [...],  // Quarter markets
    "4": [...]   // Other period markets
  }
}
```

### Full Game Markets (`markets->"0"`)

```
markets["0"][0] = Spread/Handicap array
markets["0"][1] = Game Totals array (combined score)
markets["0"][2] = Moneyline array
```

---

### ✅ VERIFIED: Spread/Handicap (`markets->"0"->0->0`)

Main spread line is at index [0] of the spreads array:

```json
[-10.5, 10.5, "10.5", "1.952", "1.934", 0, 1, 3362711127, 0, 3000.0, 1]
```

| Index | Field | Example | Notes |
|-------|-------|---------|-------|
| [0] | **Favorite spread** | -10.5 | Negative = favorite (ATL in ATL@WAS) |
| [1] | **Underdog spread** | +10.5 | Positive = underdog (WAS) |
| [2] | Display value | "10.5" | String for display |
| [3] | **Favorite odds** | "1.952" | Odds for -10.5 |
| [4] | **Underdog odds** | "1.934" | Odds for +10.5 |
| [5] | Unknown | 0 | - |
| [6] | Is alternative | 1 | 0=main, 1=alt |
| [7] | Odds ID | 3362711127 | - |
| [8] | Unknown | 0 | - |
| [9] | Max bet | 3000.0 | - |
| [10] | Unknown | 1 | - |

**⚠️ NOTE:** Favorite/Underdog follows the **AWAY team** as reference:
- If Away team is favorite: [0]=Away spread (negative), [1]=Home spread (positive)
- If Home team is favorite: [0]=Away spread (positive), [1]=Home spread (negative)

---

### ✅ VERIFIED: Game Totals (`markets->"0"->1->0`)

Main total line is at index [0] of the totals array:

```json
["238.0", 238.0, "1.952", "1.900", 3362711127, 0, 2000.0, 1]
```

| Index | Field | Example | Notes |
|-------|-------|---------|-------|
| [0] | Line (string) | "238.0" | For display |
| [1] | **Line (number)** | 238.0 | Use this for calculations |
| [2] | **Over odds** | "1.952" | Decimal odds |
| [3] | **Under odds** | "1.900" | Decimal odds |
| [4] | Odds ID | 3362711127 | - |
| [5] | Is alternative | 0 | 0=main, 1=alt |
| [6] | Max bet | 2000.0 | - |
| [7] | Unknown | 1 | - |

---

### ✅ VERIFIED: Moneyline (`markets->"0"->2`)

```json
["1.210", "4.720", null, 3362711127, 0, 2000.0, 1]
```

| Index | Field | Example | Notes |
|-------|-------|---------|-------|
| [0] | **Away team ML** | "1.210" | ATL in ATL@WAS |
| [1] | **Home team ML** | "4.720" | WAS in ATL@WAS |
| [2] | Draw odds | null | Always null for basketball |
| [3] | Odds ID | 3362711127 | - |
| [4] | Unknown | 0 | - |
| [5] | Max bet | 2000.0 | - |
| [6] | Unknown | 1 | - |

---

### PostgreSQL Query Examples

```sql
-- Extract all main markets from raw_data
SELECT
    at.abbreviation || ' @ ' || ht.abbreviation as matchup,

    -- Spread (favorite negative, underdog positive)
    (be.raw_data->'markets'->'0'->0->0->>0)::numeric as favorite_spread,
    (be.raw_data->'markets'->'0'->0->0->>1)::numeric as underdog_spread,
    be.raw_data->'markets'->'0'->0->0->>3 as favorite_spread_odds,
    be.raw_data->'markets'->'0'->0->0->>4 as underdog_spread_odds,

    -- Totals (Over/Under)
    (be.raw_data->'markets'->'0'->1->0->>1)::numeric as total_line,
    be.raw_data->'markets'->'0'->1->0->>2 as over_odds,
    be.raw_data->'markets'->'0'->1->0->>3 as under_odds,

    -- Moneyline (Away/Home)
    be.raw_data->'markets'->'0'->2->>0 as away_ml,
    be.raw_data->'markets'->'0'->2->>1 as home_ml

FROM betting_events be
JOIN games g ON be.game_id = g.game_id
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
WHERE g.game_date = CURRENT_DATE;
```

---

**Document Version:** 5.0
**Last Updated:** 2025-11-25
**Verified Against:** Multiple endpoints (Compact events list + Event-specific) + Database stored format

**Version 5.0 Changes:**
- ✅ Added "Database Stored Format" section for `betting_events.raw_data` JSONB
- ✅ VERIFIED mappings against live Pinnacle data (2025-11-25):
  - Spread: [0]=favorite, [1]=underdog, [3]=fav odds, [4]=dog odds
  - Totals: [1]=line, [2]=over odds, [3]=under odds
  - Moneyline: [0]=away ML, [1]=home ML
- Added PostgreSQL query examples for extracting markets

**Version 4.0 Changes:**
- 🔴 CRITICAL: Added documentation for Compact Events List endpoint (`/compact/events?lg=487&sp=4&hle=true`)
- Documented correct JSON path for event list: `data['hle'][0][2][0][2]` (not `data['e'][3]`)
- Added Quick Reference section for both endpoint types
- Clarified that `e` is `null` in compact endpoint, events are in `hle`

**Version 3.0 Changes:**
- Added critical distinction between Team Totals and Game Totals
- Corrected index mapping: [0]=Team Totals (nested), [2]=Spreads, [3]=Game Totals, [4]=Moneyline
- Added comprehensive examples for both team totals (Denver 125.5, Sacramento 114.5)
- Updated Quick Reference Paths with correct array indices
