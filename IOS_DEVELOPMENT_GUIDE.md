# Stat Discute - iOS Development Integration Guide

**Version**: 1.0.0
**Last Updated**: 2025-11-30
**Purpose**: Comprehensive documentation for building an iOS application that integrates with the Stat Discute NBA betting analytics platform.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Database Schema & Data Models](#3-database-schema--data-models)
4. [API Reference](#4-api-reference)
5. [Data Contracts (TypeScript → Swift)](#5-data-contracts-typescript--swift)
6. [ETL Pipeline & Data Freshness](#6-etl-pipeline--data-freshness)
7. [Offline Sync Strategy](#7-offline-sync-strategy)
8. [iOS Implementation Patterns](#8-ios-implementation-patterns)
9. [Authentication & Security](#9-authentication--security)
10. [Betting Agent Integration](#10-betting-agent-integration)
11. [Performance Considerations](#11-performance-considerations)
12. [Appendix](#12-appendix)

---

## 1. Project Overview

### 1.1 Platform Description

**Stat Discute** is an NBA statistics and betting analytics platform comprising:

| Component | Technology | Description |
|-----------|------------|-------------|
| **Database** | PostgreSQL 18 | 28+ normalized tables with 155+ indexes |
| **Web Frontend** | Next.js 16 + React 19 | Server Components + Tailwind v4 |
| **Python ETL** | nba_api + psycopg2 | NBA.com data collection pipeline |
| **Betting Agent** | LangGraph + FastAPI | Monte Carlo simulation + AI analysis |
| **API Layer** | Next.js API Routes + FastAPI | RESTful endpoints |

### 1.2 Current Season

- **Season ID**: `2025-26`
- **Season Detection**: Automatic via `seasons.is_current = true`
- **All queries MUST filter by season** to avoid multi-year data contamination

### 1.3 Data Sources

| Source | Type | Update Frequency |
|--------|------|------------------|
| NBA.com Stats API | Official box scores, player stats | Post-game (hourly) |
| Pinnacle (ps3838.com) | Betting odds, lines, props | Real-time (15 min) |
| Local PostgreSQL | All historical + computed data | Continuous |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             iOS Application                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   SwiftUI   │  │  Core Data  │  │  Networking │  │  Keychain   │    │
│  │    Views    │  │   (Cache)   │  │   (Alamofire)│  │   (Auth)    │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │                │            │
│         └────────────────┴────────────────┴────────────────┘            │
│                                   │                                      │
└───────────────────────────────────┼──────────────────────────────────────┘
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Backend Services                                │
│                                                                          │
│  ┌─────────────────────────┐    ┌─────────────────────────┐            │
│  │   Next.js API (Port 3000)    │   FastAPI (Port 8001)   │            │
│  │                          │    │                         │            │
│  │  /api/players           │    │  /api/monte-carlo/*     │            │
│  │  /api/teams             │    │  /api/tonight/totals    │            │
│  │  /api/games             │    │  /health                │            │
│  │  /api/betting/*         │    │                         │            │
│  │  /api/auth/*            │    │                         │            │
│  └───────────┬─────────────┘    └───────────┬─────────────┘            │
│              │                              │                           │
│              └──────────────┬───────────────┘                           │
│                             │                                           │
│              ┌──────────────▼───────────────┐                           │
│              │    PostgreSQL 18 (nba_stats) │                           │
│              │    28 tables + 155 indexes   │                           │
│              └──────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Base URLs

| Environment | Next.js API | FastAPI (Betting Agent) |
|-------------|-------------|-------------------------|
| **Local** | `http://localhost:3000` | `http://localhost:8001` |
| **Production** | `http://34.140.155.16:3000` | `http://34.140.155.16:8001` |

---

## 3. Database Schema & Data Models

### 3.1 Core Tables (iOS-Relevant)

#### Teams Table
```sql
CREATE TABLE teams (
    team_id BIGINT PRIMARY KEY,        -- NBA official team ID
    full_name VARCHAR(100) NOT NULL,   -- "Los Angeles Lakers"
    abbreviation VARCHAR(3) NOT NULL,  -- "LAL"
    nickname VARCHAR(50) NOT NULL,     -- "Lakers"
    city VARCHAR(50) NOT NULL,         -- "Los Angeles"
    state VARCHAR(50),                 -- "California"
    year_founded INTEGER,
    created_at TIMESTAMP
);
-- 30 NBA teams
```

#### Players Table
```sql
CREATE TABLE players (
    player_id BIGINT PRIMARY KEY,      -- NBA official player ID
    full_name VARCHAR(100) NOT NULL,   -- "LeBron James"
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
);
```

#### Games Table
```sql
CREATE TABLE games (
    game_id VARCHAR(10) PRIMARY KEY,   -- e.g., "0022500123"
    game_date DATE NOT NULL,
    season VARCHAR(7) NOT NULL,        -- "2025-26" ⚠️ ALWAYS FILTER BY THIS
    home_team_id BIGINT REFERENCES teams(team_id),
    away_team_id BIGINT REFERENCES teams(team_id),
    home_team_score INTEGER,
    away_team_score INTEGER,
    game_status VARCHAR(20)            -- "Scheduled" | "In Progress" | "Final"
);
```

#### Player Game Stats Table
```sql
CREATE TABLE player_game_stats (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) REFERENCES games(game_id),
    player_id BIGINT REFERENCES players(player_id),
    team_id BIGINT REFERENCES teams(team_id),
    minutes INTEGER,
    points INTEGER,
    rebounds INTEGER,
    assists INTEGER,
    steals INTEGER,
    blocks INTEGER,
    turnovers INTEGER,
    fg_made INTEGER,
    fg_attempted INTEGER,
    fg_pct NUMERIC(5,3),               -- 0.000 to 1.000
    fg3_made INTEGER,
    fg3_attempted INTEGER,
    fg3_pct NUMERIC(5,3),
    ft_made INTEGER,
    ft_attempted INTEGER,
    ft_pct NUMERIC(5,3),
    start_position VARCHAR(5),          -- "G", "F", "C", NULL for bench
    is_starter BOOLEAN,                 -- computed: start_position IS NOT NULL
    UNIQUE(game_id, player_id)
);
```

### 3.2 Betting Tables

#### Betting Lines Table
```sql
CREATE TABLE betting_lines (
    line_id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) REFERENCES games(game_id),
    bookmaker VARCHAR(50) NOT NULL,     -- "pinnacle", "draftkings"

    -- Moneyline (American odds: -110, +150)
    home_moneyline INTEGER,
    away_moneyline INTEGER,

    -- Spread (e.g., -5.5)
    spread NUMERIC(4,1),
    home_spread_odds INTEGER,
    away_spread_odds INTEGER,

    -- Total (Over/Under)
    total NUMERIC(5,1),                 -- e.g., 225.5
    over_odds INTEGER,
    under_odds INTEGER,

    recorded_at TIMESTAMP,
    is_opening_line BOOLEAN,
    is_closing_line BOOLEAN
);
```

#### ATS Performance Table
```sql
CREATE TABLE ats_performance (
    id SERIAL PRIMARY KEY,
    team_id BIGINT REFERENCES teams(team_id),
    season_id VARCHAR(7) REFERENCES seasons(season_id),

    -- Against The Spread
    ats_wins INTEGER,
    ats_losses INTEGER,
    ats_pushes INTEGER,
    ats_win_pct NUMERIC(5,3),

    -- Home/Away splits
    home_ats_wins INTEGER,
    away_ats_wins INTEGER,

    -- Over/Under
    over_record INTEGER,
    under_record INTEGER,

    UNIQUE(team_id, season_id)
);
```

### 3.3 ID Types Reference

| Entity | ID Type | Format | Example |
|--------|---------|--------|---------|
| Team | BIGINT | NBA official | `1610612747` (Lakers) |
| Player | BIGINT | NBA official | `2544` (LeBron James) |
| Game | VARCHAR(10) | NBA format | `"0022500123"` |
| Season | VARCHAR(7) | Year range | `"2025-26"` |

---

## 4. API Reference

### 4.1 Next.js API Endpoints

#### GET `/api/players`
Returns players with season averages.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `top` | boolean | false | If true, returns top performers only |

**Response (200):**
```json
[
  {
    "player_id": 2544,
    "full_name": "LeBron James",
    "team_abbreviation": "LAL",
    "games_played": 25,
    "minutes_avg": 35.2,
    "points_avg": 25.4,
    "rebounds_avg": 7.8,
    "assists_avg": 8.1,
    "steals_avg": 1.2,
    "blocks_avg": 0.5,
    "turnovers_avg": 3.2,
    "fg_pct": 0.523,
    "fg3_pct": 0.412,
    "ft_pct": 0.751
  }
]
```

#### GET `/api/teams`
Returns team standings and stats.

**Response (200):**
```json
[
  {
    "team_id": 1610612747,
    "full_name": "Los Angeles Lakers",
    "abbreviation": "LAL",
    "wins": 15,
    "losses": 10,
    "win_pct": 0.600,
    "points_avg": 115.2,
    "points_allowed_avg": 110.5,
    "point_diff": 4.7
  }
]
```

#### GET `/api/games`
Returns recent completed games.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Number of games to return |

**Response (200):**
```json
[
  {
    "game_id": "0022500123",
    "game_date": "2025-11-29",
    "home_team": "Los Angeles Lakers",
    "home_abbreviation": "LAL",
    "away_team": "Golden State Warriors",
    "away_abbreviation": "GSW",
    "home_score": 118,
    "away_score": 112,
    "game_status": "Final"
  }
]
```

#### GET `/api/betting/odds`
Returns betting odds for upcoming games.

**Query Parameters:**
| Param | Type | Options | Description |
|-------|------|---------|-------------|
| `source` | string | `database`, `live`, `file`, `mock`, `auto` | Data source |

**Response (200):**
```json
{
  "games": [
    {
      "gameId": "1617585501",
      "homeTeam": "Indiana Pacers",
      "awayTeam": "Oklahoma City Thunder",
      "startTime": "2025-11-30T00:00:00Z",
      "homeOdds": {
        "spread": "+7.0",
        "spreadOdds": "1.833",
        "moneyline": "3.620",
        "total": "232.5",
        "overOdds": "1.990",
        "underOdds": "1.892"
      },
      "awayOdds": {
        "spread": "-7.0",
        "spreadOdds": "2.070",
        "moneyline": "1.327",
        "total": "232.5",
        "overOdds": "1.990",
        "underOdds": "1.892"
      },
      "playerProps": [
        {
          "playerId": "1",
          "playerName": "Shai Gilgeous-Alexander",
          "market": "Points",
          "line": 32.5,
          "overOdds": "1.925",
          "underOdds": "1.813"
        }
      ]
    }
  ],
  "source": "database",
  "timestamp": "2025-11-30T12:00:00Z"
}
```

### 4.2 FastAPI Endpoints (Betting Agent)

Base URL: `http://localhost:8001` (local) or `http://34.140.155.16:8001` (prod)

#### GET `/health`
Health check endpoint.

**Response (200):**
```json
{
  "status": "healthy",
  "service": "nba-betting-agent"
}
```

#### GET `/api/tonight/totals`
Returns tonight's games with Monte Carlo analysis.

**Response (200):**
```json
{
  "success": true,
  "n_games": 3,
  "n_simulations": 10000,
  "games": [
    {
      "game_id": "0022500123",
      "game_date": "2025-11-30",
      "home_team_id": 1610612747,
      "home_abbr": "LAL",
      "home_team": "Los Angeles Lakers",
      "away_team_id": 1610612744,
      "away_abbr": "GSW",
      "away_team": "Golden State Warriors",
      "home_ppg": 115.2,
      "home_opp_ppg": 110.5,
      "home_std": 10.5,
      "away_ppg": 118.3,
      "away_opp_ppg": 112.1,
      "away_std": 11.2,
      "projected": 226.8,
      "line": 225.5,
      "over_odds": 1.91,
      "under_odds": 1.91,
      "monte_carlo": {
        "p_over": 0.542,
        "p_under": 0.458,
        "mean_total": 226.8,
        "median_total": 226.0,
        "std_total": 15.2,
        "percentiles": {
          "5": 202.0,
          "25": 216.0,
          "50": 226.0,
          "75": 237.0,
          "95": 252.0
        },
        "ci_95_over": [0.52, 0.56],
        "ci_95_under": [0.44, 0.48],
        "ot_games_pct": 0.06
      },
      "ev_metrics": {
        "ev_over": 3.2,
        "ev_under": -3.8,
        "edge_over": 4.2,
        "edge_under": -4.8,
        "kelly_over": 2.1,
        "kelly_under": 0.0,
        "recommended_bet": "OVER"
      },
      "verdict": "LEAN_OVER",
      "edge": 1.3
    }
  ],
  "methodology": {
    "projection": "(Home PPG + Away OppPPG) / 2 + (Away PPG + Home OppPPG) / 2",
    "simulation": "Correlated bivariate normal with 10K iterations",
    "overtime": "6% probability, +12 points average",
    "correlation": "0.5 score correlation between teams"
  }
}
```

#### POST `/api/monte-carlo/simulate`
Run Monte Carlo simulation for custom inputs.

**Request Body:**
```json
{
  "home_projection": 112.5,
  "away_projection": 108.3,
  "home_std_dev": 10.0,
  "away_std_dev": 10.0,
  "total_line": 220.5,
  "over_odds": 1.91,
  "under_odds": 1.91,
  "n_sims": 10000,
  "include_scenarios": true,
  "include_sensitivity": true
}
```

**Response (200):**
```json
{
  "success": true,
  "result": {
    "p_over": 0.48,
    "p_under": 0.52,
    "mean_total": 220.8,
    "scenarios": {...},
    "sensitivity": {...}
  }
}
```

### 4.3 Authentication Endpoints

#### POST `/api/auth/login`
User authentication.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "bettor123"
  },
  "token": "jwt-token-here"
}
```

#### POST `/api/auth/signup`
New user registration.

#### GET `/api/auth/session`
Validate current session.

#### POST `/api/auth/logout`
End session.

---

## 5. Data Contracts (TypeScript → Swift)

### 5.1 Core Models

#### PlayerStats
```swift
// TypeScript Interface
interface PlayerStats {
  player_id: number
  full_name: string
  team_abbreviation: string
  games_played: number
  minutes_avg: number
  points_avg: number
  rebounds_avg: number
  assists_avg: number
  steals_avg: number
  blocks_avg: number
  turnovers_avg: number
  fg_pct: number
  fg3_pct: number
  ft_pct: number
}

// Swift Equivalent
struct PlayerStats: Codable, Identifiable {
    let playerId: Int
    let fullName: String
    let teamAbbreviation: String
    let gamesPlayed: Int
    let minutesAvg: Double
    let pointsAvg: Double
    let reboundsAvg: Double
    let assistsAvg: Double
    let stealsAvg: Double
    let blocksAvg: Double
    let turnoversAvg: Double
    let fgPct: Double
    let fg3Pct: Double
    let ftPct: Double

    var id: Int { playerId }

    enum CodingKeys: String, CodingKey {
        case playerId = "player_id"
        case fullName = "full_name"
        case teamAbbreviation = "team_abbreviation"
        case gamesPlayed = "games_played"
        case minutesAvg = "minutes_avg"
        case pointsAvg = "points_avg"
        case reboundsAvg = "rebounds_avg"
        case assistsAvg = "assists_avg"
        case stealsAvg = "steals_avg"
        case blocksAvg = "blocks_avg"
        case turnoversAvg = "turnovers_avg"
        case fgPct = "fg_pct"
        case fg3Pct = "fg3_pct"
        case ftPct = "ft_pct"
    }
}
```

#### Game
```swift
struct Game: Codable, Identifiable {
    let gameId: String
    let gameDate: String
    let homeTeam: String
    let homeAbbreviation: String
    let awayTeam: String
    let awayAbbreviation: String
    let homeScore: Int?
    let awayScore: Int?
    let gameStatus: String

    var id: String { gameId }

    enum CodingKeys: String, CodingKey {
        case gameId = "game_id"
        case gameDate = "game_date"
        case homeTeam = "home_team"
        case homeAbbreviation = "home_abbreviation"
        case awayTeam = "away_team"
        case awayAbbreviation = "away_abbreviation"
        case homeScore = "home_score"
        case awayScore = "away_score"
        case gameStatus = "game_status"
    }
}
```

#### BettingOdds
```swift
struct GameOdds: Codable {
    let spread: String
    let spreadOdds: String
    let moneyline: String
    let total: String
    let overOdds: String
    let underOdds: String
}

struct PlayerProp: Codable, Identifiable {
    let playerId: String
    let playerName: String
    let market: String
    let line: Double
    let overOdds: String
    let underOdds: String

    var id: String { "\(playerId)_\(market)" }
}

struct BettingGame: Codable, Identifiable {
    let gameId: String
    let homeTeam: String
    let awayTeam: String
    let startTime: String
    let homeOdds: GameOdds
    let awayOdds: GameOdds
    let playerProps: [PlayerProp]?

    var id: String { gameId }
}

struct BettingOddsResponse: Codable {
    let games: [BettingGame]
    let source: String
    let timestamp: String
}
```

#### MonteCarloResult
```swift
struct MonteCarloResult: Codable {
    let pOver: Double
    let pUnder: Double
    let meanTotal: Double
    let medianTotal: Double
    let stdTotal: Double
    let percentiles: [String: Double]
    let ci95Over: [Double]
    let ci95Under: [Double]
    let otGamesPct: Double

    enum CodingKeys: String, CodingKey {
        case pOver = "p_over"
        case pUnder = "p_under"
        case meanTotal = "mean_total"
        case medianTotal = "median_total"
        case stdTotal = "std_total"
        case percentiles
        case ci95Over = "ci_95_over"
        case ci95Under = "ci_95_under"
        case otGamesPct = "ot_games_pct"
    }
}

struct EVMetrics: Codable {
    let evOver: Double
    let evUnder: Double
    let edgeOver: Double
    let edgeUnder: Double
    let kellyOver: Double
    let kellyUnder: Double
    let recommendedBet: String

    enum CodingKeys: String, CodingKey {
        case evOver = "ev_over"
        case evUnder = "ev_under"
        case edgeOver = "edge_over"
        case edgeUnder = "edge_under"
        case kellyOver = "kelly_over"
        case kellyUnder = "kelly_under"
        case recommendedBet = "recommended_bet"
    }
}

struct TotalsAnalysisGame: Codable, Identifiable {
    let gameId: String
    let gameDate: String
    let homeTeamId: Int
    let homeAbbr: String
    let homeTeam: String
    let awayTeamId: Int
    let awayAbbr: String
    let awayTeam: String
    let homePpg: Double
    let homeOppPpg: Double
    let homeStd: Double
    let awayPpg: Double
    let awayOppPpg: Double
    let awayStd: Double
    let projected: Double
    let line: Double?
    let overOdds: Double
    let underOdds: Double
    let monteCarlo: MonteCarloResult?
    let evMetrics: EVMetrics?
    let verdict: String
    let edge: Double?

    var id: String { gameId }

    enum CodingKeys: String, CodingKey {
        case gameId = "game_id"
        case gameDate = "game_date"
        case homeTeamId = "home_team_id"
        case homeAbbr = "home_abbr"
        case homeTeam = "home_team"
        case awayTeamId = "away_team_id"
        case awayAbbr = "away_abbr"
        case awayTeam = "away_team"
        case homePpg = "home_ppg"
        case homeOppPpg = "home_opp_ppg"
        case homeStd = "home_std"
        case awayPpg = "away_ppg"
        case awayOppPpg = "away_opp_ppg"
        case awayStd = "away_std"
        case projected
        case line
        case overOdds = "over_odds"
        case underOdds = "under_odds"
        case monteCarlo = "monte_carlo"
        case evMetrics = "ev_metrics"
        case verdict
        case edge
    }
}
```

---

## 6. ETL Pipeline & Data Freshness

### 6.1 Data Collection Scripts

| Script | Purpose | Frequency | Source |
|--------|---------|-----------|--------|
| `sync_teams.py` | 30 NBA teams | Once/season | nba_api |
| `sync_season_2025_26.py` | Games/schedule | Daily at 5 AM | nba_api |
| `fetch_player_stats_direct.py` | Box scores | Hourly (game days) | NBA Stats API |
| `run_all_analytics.py` | Derived stats | Daily at 2 AM | Local compute |
| `fetch_pinnacle_odds.py` | Betting lines | Every 15 min | Pinnacle |

### 6.2 NBA API Headers (Required)

When making direct requests to `stats.nba.com`:

```swift
let nbaHeaders: [String: String] = [
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0",
    "Referer": "https://www.nba.com/",
    "Origin": "https://www.nba.com",
    "Accept": "*/*"
]
```

**⚠️ Without these headers, NBA API returns 403 Forbidden.**

### 6.3 Data Freshness Indicators

| Data Type | Max Age | Refresh Trigger |
|-----------|---------|-----------------|
| Team standings | 24 hours | Daily schedule |
| Player season averages | 24 hours | Post-game |
| Box scores | 1 hour | Game completion |
| Betting lines | 15 minutes | Continuous |
| Monte Carlo analysis | 5 minutes | On-demand |

### 6.4 ETL Error Handling

The ETL pipeline implements graceful degradation:

```python
# Priority order for data sources
sources = [
    nba_api,        # Primary (fresh)
    local_db,       # Secondary (cached)
    cached_data,    # Tertiary (stale but available)
]
```

---

## 7. Offline Sync Strategy

### 7.1 Recommended Core Data Schema

```swift
// Core Data Entities

@Entity
class CDTeam {
    @Attribute(.unique) var teamId: Int64
    var fullName: String
    var abbreviation: String
    var nickname: String
    var city: String
    var lastUpdated: Date
}

@Entity
class CDPlayer {
    @Attribute(.unique) var playerId: Int64
    var fullName: String
    var isActive: Bool
    var lastUpdated: Date

    // Cached season averages
    var pointsAvg: Double?
    var reboundsAvg: Double?
    var assistsAvg: Double?
}

@Entity
class CDGame {
    @Attribute(.unique) var gameId: String
    var gameDate: Date
    var season: String
    var homeTeamId: Int64
    var awayTeamId: Int64
    var homeScore: Int32?
    var awayScore: Int32?
    var gameStatus: String
    var lastUpdated: Date
}

@Entity
class CDPlayerGameStats {
    @Attribute(.unique) var compositeKey: String  // "gameId_playerId"
    var gameId: String
    var playerId: Int64
    var points: Int16
    var rebounds: Int16
    var assists: Int16
    var minutes: Int16
    var lastUpdated: Date
}
```

### 7.2 Sync Strategy

```swift
class SyncManager {
    enum SyncPriority: Int {
        case critical = 0   // Today's games, live odds
        case high = 1       // Player averages, standings
        case medium = 2     // Historical games
        case low = 3        // Reference data (teams)
    }

    struct SyncPolicy {
        let entity: String
        let maxAge: TimeInterval
        let priority: SyncPriority
        let endpoint: String
    }

    static let policies: [SyncPolicy] = [
        SyncPolicy(entity: "games_today", maxAge: 300, priority: .critical, endpoint: "/api/games"),
        SyncPolicy(entity: "betting_odds", maxAge: 900, priority: .critical, endpoint: "/api/betting/odds"),
        SyncPolicy(entity: "player_stats", maxAge: 3600, priority: .high, endpoint: "/api/players"),
        SyncPolicy(entity: "team_standings", maxAge: 86400, priority: .high, endpoint: "/api/teams"),
        SyncPolicy(entity: "teams", maxAge: 604800, priority: .low, endpoint: "/api/teams")
    ]
}
```

### 7.3 Conflict Resolution

```swift
enum ConflictResolution {
    case serverWins      // Always use server data
    case latestWins      // Compare timestamps
    case mergeChanges    // Merge non-conflicting fields
}

extension CDGame {
    func resolve(with serverGame: Game, strategy: ConflictResolution) {
        switch strategy {
        case .serverWins:
            self.update(from: serverGame)
        case .latestWins:
            if serverGame.lastUpdated > self.lastUpdated {
                self.update(from: serverGame)
            }
        case .mergeChanges:
            // Merge non-null server values
            if let score = serverGame.homeScore { self.homeScore = score }
            if let score = serverGame.awayScore { self.awayScore = score }
        }
    }
}
```

---

## 8. iOS Implementation Patterns

### 8.1 Network Layer

```swift
import Foundation

class APIClient {
    static let shared = APIClient()

    private let baseURL = URL(string: "http://34.140.155.16:3000")!
    private let bettingAgentURL = URL(string: "http://34.140.155.16:8001")!
    private let decoder: JSONDecoder

    private init() {
        decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
    }

    enum Endpoint {
        case players(top: Bool = false)
        case teams
        case games(limit: Int = 20)
        case bettingOdds(source: String = "auto")
        case tonightTotals
        case monteCarlo

        var path: String {
            switch self {
            case .players(let top):
                return "/api/players\(top ? "?top=true" : "")"
            case .teams:
                return "/api/teams"
            case .games(let limit):
                return "/api/games?limit=\(limit)"
            case .bettingOdds(let source):
                return "/api/betting/odds?source=\(source)"
            case .tonightTotals:
                return "/api/tonight/totals"
            case .monteCarlo:
                return "/api/monte-carlo/simulate"
            }
        }

        var useBettingAgent: Bool {
            switch self {
            case .tonightTotals, .monteCarlo:
                return true
            default:
                return false
            }
        }
    }

    func fetch<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        let baseURL = endpoint.useBettingAgent ? bettingAgentURL : self.baseURL
        let url = baseURL.appendingPathComponent(endpoint.path)

        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.invalidResponse
        }

        return try decoder.decode(T.self, from: data)
    }

    func post<T: Decodable, B: Encodable>(_ endpoint: Endpoint, body: B) async throws -> T {
        let baseURL = endpoint.useBettingAgent ? bettingAgentURL : self.baseURL
        let url = baseURL.appendingPathComponent(endpoint.path)

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.invalidResponse
        }

        return try decoder.decode(T.self, from: data)
    }
}

enum APIError: Error {
    case invalidResponse
    case decodingError
    case networkError
}
```

### 8.2 ViewModel Pattern

```swift
import SwiftUI
import Combine

@MainActor
class TotalsAnalysisViewModel: ObservableObject {
    @Published var games: [TotalsAnalysisGame] = []
    @Published var isLoading = false
    @Published var error: Error?

    func loadTonightGames() async {
        isLoading = true
        error = nil

        do {
            let response: TotalsAnalysisResponse = try await APIClient.shared.fetch(.tonightTotals)
            games = response.games
        } catch {
            self.error = error
        }

        isLoading = false
    }

    var recommendations: [TotalsAnalysisGame] {
        games.filter { game in
            guard let edge = game.edge else { return false }
            return abs(edge) > 2.0 && game.verdict != "NEUTRAL"
        }
    }
}
```

### 8.3 SwiftUI Views

```swift
struct TotalsAnalysisView: View {
    @StateObject private var viewModel = TotalsAnalysisViewModel()

    var body: some View {
        NavigationStack {
            List {
                Section("Recommendations") {
                    ForEach(viewModel.recommendations) { game in
                        GameAnalysisRow(game: game)
                    }
                }

                Section("All Games") {
                    ForEach(viewModel.games) { game in
                        GameAnalysisRow(game: game)
                    }
                }
            }
            .navigationTitle("Tonight's Totals")
            .refreshable {
                await viewModel.loadTonightGames()
            }
            .task {
                await viewModel.loadTonightGames()
            }
        }
    }
}

struct GameAnalysisRow: View {
    let game: TotalsAnalysisGame

    var verdictColor: Color {
        switch game.verdict {
        case "STRONG_OVER", "LEAN_OVER":
            return .green
        case "STRONG_UNDER", "LEAN_UNDER":
            return .red
        default:
            return .gray
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("\(game.awayAbbr) @ \(game.homeAbbr)")
                    .font(.headline)
                Spacer()
                Text(game.verdict)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(verdictColor.opacity(0.2))
                    .foregroundColor(verdictColor)
                    .cornerRadius(4)
            }

            if let line = game.line, let monteCarlo = game.monteCarlo {
                HStack {
                    VStack(alignment: .leading) {
                        Text("Line: \(line, specifier: "%.1f")")
                            .font(.caption)
                        Text("Projected: \(game.projected, specifier: "%.1f")")
                            .font(.caption)
                    }

                    Spacer()

                    VStack(alignment: .trailing) {
                        Text("Over: \(monteCarlo.pOver * 100, specifier: "%.0f")%")
                            .font(.caption)
                        Text("Under: \(monteCarlo.pUnder * 100, specifier: "%.0f")%")
                            .font(.caption)
                    }
                }

                if let evMetrics = game.evMetrics {
                    Text("Edge: \(evMetrics.edgeOver > 0 ? "+" : "")\(evMetrics.edgeOver, specifier: "%.1f")%")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}
```

---

## 9. Authentication & Security

### 9.1 JWT Token Management

```swift
class AuthManager {
    static let shared = AuthManager()
    private let keychain = Keychain(service: "com.statdiscute.ios")

    private let tokenKey = "auth_token"
    private let refreshTokenKey = "refresh_token"

    var isAuthenticated: Bool {
        token != nil && !isTokenExpired
    }

    var token: String? {
        get { keychain[tokenKey] }
        set { keychain[tokenKey] = newValue }
    }

    var isTokenExpired: Bool {
        guard let token = token,
              let payload = decodeJWT(token),
              let exp = payload["exp"] as? TimeInterval else {
            return true
        }
        return Date().timeIntervalSince1970 > exp
    }

    func login(email: String, password: String) async throws -> User {
        let response: LoginResponse = try await APIClient.shared.post(
            .login,
            body: LoginRequest(email: email, password: password)
        )

        token = response.token
        return response.user
    }

    func logout() async {
        try? await APIClient.shared.post(.logout, body: EmptyBody())
        token = nil
    }
}
```

### 9.2 Secure Storage

```swift
// Use Keychain for sensitive data
import KeychainSwift

extension Keychain {
    static let auth = Keychain(service: "com.statdiscute.auth")
    static let betting = Keychain(service: "com.statdiscute.betting")
}

// Store betting preferences securely
struct BettingPreferences: Codable {
    var defaultBankroll: Double
    var maxBetPercentage: Double
    var preferredOddsFormat: OddsFormat
}

extension BettingPreferences {
    func save() {
        let data = try? JSONEncoder().encode(self)
        Keychain.betting["preferences"] = data?.base64EncodedString()
    }

    static func load() -> BettingPreferences? {
        guard let base64 = Keychain.betting["preferences"],
              let data = Data(base64Encoded: base64) else { return nil }
        return try? JSONDecoder().decode(BettingPreferences.self, from: data)
    }
}
```

---

## 10. Betting Agent Integration

### 10.1 Monte Carlo Simulation Client

```swift
struct MonteCarloRequest: Codable {
    let homeProjection: Double
    let awayProjection: Double
    let homeStdDev: Double
    let awayStdDev: Double
    let totalLine: Double
    let overOdds: Double
    let underOdds: Double
    let nSims: Int
    let includeScenarios: Bool
    let includeSensitivity: Bool

    enum CodingKeys: String, CodingKey {
        case homeProjection = "home_projection"
        case awayProjection = "away_projection"
        case homeStdDev = "home_std_dev"
        case awayStdDev = "away_std_dev"
        case totalLine = "total_line"
        case overOdds = "over_odds"
        case underOdds = "under_odds"
        case nSims = "n_sims"
        case includeScenarios = "include_scenarios"
        case includeSensitivity = "include_sensitivity"
    }
}

class BettingAnalysisService {
    func runMonteCarloSimulation(
        homeProjection: Double,
        awayProjection: Double,
        totalLine: Double,
        overOdds: Double = 1.91,
        underOdds: Double = 1.91
    ) async throws -> MonteCarloResult {

        let request = MonteCarloRequest(
            homeProjection: homeProjection,
            awayProjection: awayProjection,
            homeStdDev: 10.0,
            awayStdDev: 10.0,
            totalLine: totalLine,
            overOdds: overOdds,
            underOdds: underOdds,
            nSims: 10000,
            includeScenarios: true,
            includeSensitivity: true
        )

        let response: MonteCarloResponse = try await APIClient.shared.post(
            .monteCarlo,
            body: request
        )

        return response.result
    }
}
```

### 10.2 Verdict Interpretation

```swift
enum BettingVerdict: String, Codable {
    case strongOver = "STRONG_OVER"
    case leanOver = "LEAN_OVER"
    case neutral = "NEUTRAL"
    case leanUnder = "LEAN_UNDER"
    case strongUnder = "STRONG_UNDER"
    case noLine = "NO_LINE"

    var description: String {
        switch self {
        case .strongOver: return "Strong Over (+8%+ edge)"
        case .leanOver: return "Lean Over (+3-8% edge)"
        case .neutral: return "No Edge"
        case .leanUnder: return "Lean Under (+3-8% edge)"
        case .strongUnder: return "Strong Under (+8%+ edge)"
        case .noLine: return "No Line Available"
        }
    }

    var color: Color {
        switch self {
        case .strongOver: return .green
        case .leanOver: return .green.opacity(0.7)
        case .neutral: return .gray
        case .leanUnder: return .red.opacity(0.7)
        case .strongUnder: return .red
        case .noLine: return .secondary
        }
    }

    var isActionable: Bool {
        switch self {
        case .strongOver, .leanOver, .strongUnder, .leanUnder:
            return true
        default:
            return false
        }
    }
}
```

---

## 11. Performance Considerations

### 11.1 Caching Strategy

```swift
class CacheManager {
    static let shared = CacheManager()

    private let memoryCache = NSCache<NSString, AnyObject>()
    private let fileManager = FileManager.default

    struct CachePolicy {
        let ttl: TimeInterval
        let useMemory: Bool
        let useDisk: Bool
    }

    static let policies: [String: CachePolicy] = [
        "players": CachePolicy(ttl: 3600, useMemory: true, useDisk: true),
        "teams": CachePolicy(ttl: 86400, useMemory: true, useDisk: true),
        "games": CachePolicy(ttl: 300, useMemory: true, useDisk: false),
        "odds": CachePolicy(ttl: 60, useMemory: true, useDisk: false)
    ]

    func get<T: Codable>(_ key: String) -> T? {
        // Check memory cache first
        if let cached = memoryCache.object(forKey: key as NSString) as? CacheEntry<T>,
           !cached.isExpired {
            return cached.value
        }

        // Check disk cache
        guard let policy = Self.policies[key], policy.useDisk else { return nil }
        // ... disk cache implementation
        return nil
    }

    func set<T: Codable>(_ value: T, for key: String) {
        guard let policy = Self.policies[key] else { return }

        let entry = CacheEntry(value: value, ttl: policy.ttl)

        if policy.useMemory {
            memoryCache.setObject(entry as AnyObject, forKey: key as NSString)
        }

        if policy.useDisk {
            // ... disk cache implementation
        }
    }
}

struct CacheEntry<T> {
    let value: T
    let timestamp: Date
    let ttl: TimeInterval

    init(value: T, ttl: TimeInterval) {
        self.value = value
        self.timestamp = Date()
        self.ttl = ttl
    }

    var isExpired: Bool {
        Date().timeIntervalSince(timestamp) > ttl
    }
}
```

### 11.2 Image Loading (Team Logos)

```swift
// Team logo URLs follow NBA CDN pattern
extension Team {
    var logoURL: URL? {
        URL(string: "https://cdn.nba.com/logos/nba/\(teamId)/global/L/logo.svg")
    }

    var smallLogoURL: URL? {
        URL(string: "https://cdn.nba.com/logos/nba/\(teamId)/global/S/logo.svg")
    }
}

// Use AsyncImage with caching
struct TeamLogo: View {
    let teamId: Int
    var size: CGFloat = 40

    var body: some View {
        AsyncImage(url: Team.logoURL(for: teamId)) { phase in
            switch phase {
            case .empty:
                ProgressView()
            case .success(let image):
                image.resizable().scaledToFit()
            case .failure:
                Image(systemName: "basketball")
            @unknown default:
                EmptyView()
            }
        }
        .frame(width: size, height: size)
    }
}
```

### 11.3 Pagination

```swift
struct PaginatedResponse<T: Codable>: Codable {
    let items: [T]
    let page: Int
    let pageSize: Int
    let totalItems: Int
    let totalPages: Int

    var hasNextPage: Bool {
        page < totalPages
    }
}

class PaginatedLoader<T: Codable>: ObservableObject {
    @Published var items: [T] = []
    @Published var isLoading = false
    @Published var hasMore = true

    private var currentPage = 0
    private let pageSize = 20
    private let endpoint: APIClient.Endpoint

    init(endpoint: APIClient.Endpoint) {
        self.endpoint = endpoint
    }

    func loadMore() async {
        guard !isLoading && hasMore else { return }

        isLoading = true
        currentPage += 1

        do {
            let response: PaginatedResponse<T> = try await APIClient.shared.fetch(endpoint)
            items.append(contentsOf: response.items)
            hasMore = response.hasNextPage
        } catch {
            currentPage -= 1
        }

        isLoading = false
    }

    func refresh() async {
        items = []
        currentPage = 0
        hasMore = true
        await loadMore()
    }
}
```

---

## 12. Appendix

### 12.1 Odds Format Conversion

```swift
enum OddsFormat {
    case decimal     // 1.91
    case american    // -110
    case fractional  // 10/11
}

struct OddsConverter {
    static func americanToDecimal(_ american: Int) -> Double {
        if american >= 100 {
            return 1 + (Double(american) / 100)
        } else {
            return 1 + (100 / abs(Double(american)))
        }
    }

    static func decimalToAmerican(_ decimal: Double) -> Int {
        if decimal >= 2.0 {
            return Int((decimal - 1) * 100)
        } else {
            return Int(-100 / (decimal - 1))
        }
    }

    static func decimalToFractional(_ decimal: Double) -> String {
        let numerator = Int((decimal - 1) * 100)
        return "\(numerator)/100"
    }

    static func impliedProbability(decimal: Double) -> Double {
        1 / decimal
    }

    static func calculateEV(probability: Double, decimalOdds: Double) -> Double {
        (probability * (decimalOdds - 1)) - ((1 - probability) * 1)
    }

    static func kellyFraction(probability: Double, decimalOdds: Double) -> Double {
        let edge = (probability * decimalOdds) - 1
        let fraction = edge / (decimalOdds - 1)
        return max(0, fraction) // Never recommend negative bet
    }
}
```

### 12.2 Basketball Statistics Formulas

```swift
struct BasketballStats {
    /// True Shooting Percentage
    static func trueShootingPct(points: Int, fga: Int, fta: Int) -> Double {
        guard fga + (0.44 * Double(fta)) > 0 else { return 0 }
        return Double(points) / (2 * (Double(fga) + 0.44 * Double(fta)))
    }

    /// Effective Field Goal Percentage
    static func effectiveFGPct(fgm: Int, fg3m: Int, fga: Int) -> Double {
        guard fga > 0 else { return 0 }
        return Double(fgm + (fg3m / 2)) / Double(fga)
    }

    /// Four Factors (Dean Oliver)
    struct FourFactors {
        let efgPct: Double      // 40% weight
        let tovPct: Double      // 25% weight
        let orbPct: Double      // 20% weight
        let ftRate: Double      // 15% weight

        var compositeScore: Double {
            (efgPct * 0.40) + ((1 - tovPct) * 0.25) + (orbPct * 0.20) + (ftRate * 0.15)
        }
    }

    /// Estimated Possessions
    static func possessions(fga: Int, fta: Int, orb: Int, tov: Int) -> Double {
        Double(fga) + (0.44 * Double(fta)) - Double(orb) + Double(tov)
    }

    /// Pace (possessions per 48 minutes)
    static func pace(possessions: Double, minutes: Double) -> Double {
        guard minutes > 0 else { return 0 }
        return (possessions / minutes) * 48
    }
}
```

### 12.3 Error Codes Reference

| HTTP Code | Error Type | Description | iOS Handling |
|-----------|------------|-------------|--------------|
| 400 | Bad Request | Invalid parameters | Show validation error |
| 401 | Unauthorized | Invalid/expired token | Trigger re-auth |
| 403 | Forbidden | Insufficient permissions | Show access denied |
| 404 | Not Found | Resource doesn't exist | Show not found |
| 429 | Rate Limited | Too many requests | Implement backoff |
| 500 | Server Error | Backend failure | Retry with backoff |
| 502/503 | Service Unavailable | Backend down | Show maintenance |

### 12.4 Environment Configuration

```swift
enum AppEnvironment {
    case development
    case staging
    case production

    static var current: AppEnvironment {
        #if DEBUG
        return .development
        #else
        return .production
        #endif
    }

    var apiBaseURL: URL {
        switch self {
        case .development:
            return URL(string: "http://localhost:3000")!
        case .staging:
            return URL(string: "http://34.140.155.16:3000")!
        case .production:
            return URL(string: "https://api.statdiscute.be")!
        }
    }

    var bettingAgentURL: URL {
        switch self {
        case .development:
            return URL(string: "http://localhost:8001")!
        case .staging, .production:
            return URL(string: "http://34.140.155.16:8001")!
        }
    }
}
```

---

## Quick Reference

### Critical Season Filter Rule

**⚠️ EVERY query joining the `games` table MUST include:**
```sql
WHERE g.season = '2025-26'
```

Without this filter, queries return mixed multi-year data, corrupting averages and analytics.

### API Endpoints Summary

| Endpoint | Method | Base | Description |
|----------|--------|------|-------------|
| `/api/players` | GET | Next.js | Player season averages |
| `/api/teams` | GET | Next.js | Team standings |
| `/api/games` | GET | Next.js | Recent games |
| `/api/betting/odds` | GET | Next.js | Live betting odds |
| `/api/tonight/totals` | GET | FastAPI | Monte Carlo analysis |
| `/api/monte-carlo/simulate` | POST | FastAPI | Custom simulation |
| `/api/auth/login` | POST | Next.js | Authentication |

### Swift Model Naming Convention

| Database Column | Swift Property |
|----------------|----------------|
| `player_id` | `playerId` |
| `full_name` | `fullName` |
| `points_avg` | `pointsAvg` |
| `fg_pct` | `fgPct` |
| `game_status` | `gameStatus` |

Use `CodingKeys` with `snake_case` mapping or `keyDecodingStrategy = .convertFromSnakeCase`.

---

**Document Status**: Ready for iOS Development
**Next Steps**: Set up Xcode project, configure networking layer, implement Core Data models
