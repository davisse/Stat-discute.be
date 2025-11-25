# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JavaScript client library for interacting with an NBA Statistics API. The library provides a clean interface for fetching NBA team data, schedules, game details, and statistics with built-in caching and French localization helpers.

**Primary file**: `nba-client.js` - Complete client implementation with ES6 module, browser, and Node.js compatibility

## Python Backend Dependencies

This project includes a Python backend API (not in this repository) that serves the NBA data. The JavaScript client communicates with this backend.

### Installation

```bash
# Standard installation
python3 -m pip install -r requirements.txt

# System-wide installation (macOS/Linux with externally-managed environments)
python3 -m pip install -r requirements.txt --break-system-packages
```

**Note**: The `--break-system-packages` flag is only supported in pip 22.1+ and may not work with older Python installations.

### Core Dependencies

- **nba_api==1.4.1** - Official NBA statistics API wrapper
- **flask>=3.0.0** - Web framework for REST API
- **flask-cors>=4.0.0** - CORS support for web clients
- **pandas>=2.0.0** - Data processing and analysis
- **numpy>=1.24.0** - Numerical computing (required by pandas and nba_api)
- **requests>=2.31.0** - HTTP library
- **openpyxl>=3.1.0** - Excel export support (optional)
- **python-dotenv>=1.0.0** - Environment variable management (optional)

### Known Dependency Conflicts

The `nba_api` package pins `certifi<2024.0.0` which conflicts with:
- **selenium>=4.36.0** (requires certifi>=2025.6.15)
- **opencv-python/opencv-contrib-python** (requires numpy>=2.0)

**Resolution strategies**:

1. **Use a virtual environment** (recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # macOS/Linux
   # or: venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

2. **System-wide installation**: Conflicts won't affect NBA API functionality if you don't use Selenium/OpenCV in the same context

3. **Accept the warnings**: The NBA API will function correctly despite the warnings

### Virtual Environment Setup (Recommended)

```bash
# Create virtual environment
python3 -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Deactivate when done
deactivate
```

### Testing the Installation

Run the test script to verify everything is working:

```bash
python3 test_nba_api.py
```

This script tests:
- All dependency imports (nba_api, flask, pandas, numpy, requests)
- NBA teams endpoint functionality
- Real game data retrieval (Lakers 2023-24 season)
- Pandas data processing capabilities

**Expected output**: `✅ All tests passed! NBA API is ready to use.`

**Note**: You may see a `NotOpenSSLWarning` from urllib3 - this is harmless and doesn't affect functionality.

## Architecture

### Core Client Structure

The `NBAScheduleClient` class is organized into functional domains:

- **Cache Management** (lines 13-63): 5-minute TTL cache with manual clear capability
- **Teams API** (lines 65-86): Team listing and lookup by abbreviation
- **Schedule API** (lines 88-156): Today's games, season schedules, team schedules, date ranges, weekly/monthly views
- **Game Details** (lines 158-167): Individual game information retrieval
- **Statistics** (lines 169-179): Team stats aggregation
- **Helpers** (lines 181-241): Date formatting (French), home/away detection, opponent extraction

### API Response Format

All API endpoints follow a consistent structure:
```javascript
{
  "success": true,
  "count": number,
  "data": array | object,
  "team": { ... },      // For team-specific endpoints
  "season": "YYYY-YY",  // For season-specific endpoints
  "stats": { ... }      // For stats endpoints
}
```

### Cache Behavior

- **Cached**: Teams, season schedules, team schedules, date ranges (5-minute TTL)
- **Not cached**: Today's games (always fresh data via `useCache = false`)
- Cache keys use full URL including query parameters

### Module Compatibility

The client exports in three ways (lines 340-353):
1. ES6 module: `export { NBAScheduleClient }`
2. Browser global: `window.NBAScheduleClient`
3. Node.js: `module.exports = { NBAScheduleClient }`

## Data Structures

### Team Object
```javascript
{
  id: 1610612747,
  full_name: "Los Angeles Lakers",
  abbreviation: "LAL",
  nickname: "Lakers",
  city: "Los Angeles",
  state: "California",
  year_founded: 1947
}
```

### Game Object (from schedule)
```javascript
{
  SEASON_ID: "22024",
  TEAM_ID: 1610612747,
  GAME_ID: "0022400001",
  GAME_DATE: "2024-10-22",
  MATCHUP: "LAL vs. GSW",  // "vs." = home, "@" = away
  WL: "W",                   // "W" or "L"
  PTS: 110,
  // Plus 20+ basketball statistics (see data_examples.json for complete list)
}
```

### Matchup String Patterns
- **Home game**: `"LAL vs. GSW"` (team abbreviation before "vs.")
- **Away game**: `"LAL @ PHX"` (team abbreviation before "@")

These patterns are parsed by helper methods `getHomeAway()` and `getOpponent()`.

## Key Statistical Abbreviations

Reference `data_examples.json` lines 279-303 for complete definitions:
- **Scoring**: PTS, FGM/FGA/FG_PCT, FG3M/FG3A/FG3_PCT, FTM/FTA/FT_PCT
- **Rebounds**: OREB, DREB, REB
- **Other**: AST, STL, BLK, TOV, PF, PLUS_MINUS

## Advanced Metrics

The `data_examples.json` file (lines 355-366) documents formulas for calculating:
- Possessions (estimated)
- Offensive/Defensive efficiency
- True shooting percentage
- Effective FG percentage
- Turnover percentage
- Rebound percentage

These formulas can be implemented as additional helper methods if needed.

## Usage Patterns

### Basic Client Initialization
```javascript
const client = new NBAScheduleClient('http://localhost:5000');
```

### Common Operations

**Get today's games** (no cache):
```javascript
const today = await client.getTodaysGames();
```

**Get team schedule** (cached):
```javascript
const schedule = await client.getTeamSchedule('LAL', '2024-25');
```

**Get games in date range**:
```javascript
const games = await client.getScheduleByRange('2024-10-01', '2024-10-31');
```

**Helper utilities**:
```javascript
client.formatDate('2024-10-23');  // "mercredi 23 octobre 2024"
client.getHomeAway('LAL vs. GSW', 'LAL');  // "home"
client.getOpponent('LAL @ PHX', 'LAL');    // "PHX"
```

## Integration Points

### Chart.js Integration
Function `createPerformanceChart()` (lines 296-337) demonstrates Chart.js integration for visualizing team performance with:
- Points per game as line chart
- Win/loss color-coding (green/red)
- French date labels

### Sports Betting Use Cases
The `data_examples.json` file (lines 306-352) documents common betting analysis patterns:
- Home vs away performance comparison
- Points trend analysis (moving averages)
- Head-to-head statistics
- Over/under predictions
- Game pace analysis

## Extension Suggestions

The `data_examples.json` file (lines 368-391) suggests additional endpoints that could be added:
- Head-to-head comparison endpoint
- Trends analysis (last 5/10/20 games)
- Home/away split statistics
- Over/under predictions
- Betting odds integration (requires external API)

## Date Handling

All dates use ISO format (`YYYY-MM-DD`) for consistency. The client provides French localization helpers but stores/transmits dates in ISO format.

Week calculation (lines 133-143):
- Week starts on Sunday (`.getDay()` returns 0)
- Week ends 6 days later

Month calculation (lines 150-155):
- First day: `new Date(year, month, 1)`
- Last day: `new Date(year, month + 1, 0)`

## Database Design

A comprehensive PostgreSQL database schema has been designed for NBA sports betting analytics in the `database/` directory.

### Database Overview

- **42 Core Tables** organized in 7 functional categories
- **104 Strategic Indexes** for optimal query performance
- **5 Materialized Views** for pre-computed betting insights
- **Sub-100ms queries** for 95% of betting scenarios
- **~100GB storage** per season (with full shot chart and play-by-play data)

### Documentation Files

| File | Purpose |
|------|---------|
| `database/README.md` | Overview, quick start, ETL strategy, implementation roadmap |
| `database/DATABASE_DESIGN.md` | Complete schema for core tables (1-25) |
| `database/BETTING_ANALYTICS_SCHEMA.md` | Betting tables (26-42), materialized views, formulas |
| `database/BETTING_QUERIES.md` | 8 production-ready SQL queries for betting scenarios |

### Schema Categories

1. **Core Reference Data** (8 tables): teams, players, seasons, venues, coaches
2. **Game & Schedule** (5 tables): games (central fact table), playoffs, lineups, travel
3. **Performance Statistics** (9 tables): traditional/advanced stats, four factors, shot charts
4. **Roster & Availability** (3 tables): rosters, injury reports, matchup ratings
5. **Betting Intelligence** (10 tables): trends, head-to-head, predictions, situational stats
6. **Betting Analytics** (4 tables): streaks, player impact, over/under, ATS performance
7. **System Operations** (3 tables): standings, ETL logs, rate limits

### Key Betting Features

- **Four Factors Analysis**: Dean Oliver's predictive metrics (eFG%, TOV%, OREB%, FTR)
- **Rest Advantage**: Back-to-back game impact, days rest differential
- **Injury Impact**: Quantified win% change with/without key players
- **ATS Performance**: Against The Spread tracking by situation
- **Line Movement**: Sharp money indicators, public betting percentages
- **Head-to-Head**: Historical matchup performance and trends

### ETL Schedule

| Data Type | Frequency | Time (ET) |
|-----------|-----------|-----------|
| Reference data | Daily | 3:00 AM |
| Schedule/standings | Daily | 5:00 AM |
| Injury reports | Hourly | Game days |
| Betting lines | Every 5-15 min | Game days |
| Box scores | Post-game +15 min | After games |
| Aggregations | Daily | 2:00 AM |
| Materialized views | Daily | 2:30 AM |

### Quick Access Queries

**Today's Games Dashboard** (<50ms):
```sql
SELECT * FROM mv_betting_edge_signals WHERE game_date = CURRENT_DATE;
```

Returns: Recent form, head-to-head, home/away splits, rest advantage, injuries, betting lines

**Four Factors Matchup** (<100ms):
- Analyzes offensive vs defensive four factors
- Calculates factor advantages
- Predicts winner based on factors won (3+ factors = 80% win rate)

**Against The Spread Analysis** (<30ms):
- ATS performance by situation (home/away/favorite/underdog)
- Average margin vs spread
- Betting edge rating

See `database/BETTING_QUERIES.md` for complete SQL and 5 additional betting queries.

### Database Technology

- **PostgreSQL 14+**: Advanced analytics, partitioning, materialized views
- **Partitioning**: Large tables partitioned by season for performance
- **Caching**: Redis for 5-15 minute query result caching
- **Connection Pooling**: PgBouncer for high concurrency
- **Monitoring**: Prometheus + Grafana for observability
