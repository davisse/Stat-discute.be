# Stat Discute iOS - Master Implementation Plan

**Version:** 1.0 | **Status:** Approved for Development | **Date:** November 30, 2025

---

## Executive Summary

This document is the **single source of truth** for building the Stat Discute iOS application. It references all design documentation, maps the existing PostgreSQL database to iOS features, defines the API layer, and provides a complete 16-week implementation roadmap.

**Project Goal:** Build a production-ready iOS app that provides NBA betting analytics to users, leveraging the existing database infrastructure with 28 tables and 155+ indexes.

---

## Document Index

### Reference Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| **IOS_DESIGN_RESEARCH_2025.md** | iOS 26 design guidelines, Liquid Glass, Human Interface | `claudedocs/IOS_DESIGN_RESEARCH_2025.md` |
| **IOS_WIREFRAME_MOCKUP.md** | Initial wireframe concepts | `claudedocs/IOS_WIREFRAME_MOCKUP.md` |
| **IOS_WIREFRAME_PROFESSIONAL.md** | Complete design specification (1,649 lines) | `claudedocs/IOS_WIREFRAME_PROFESSIONAL.md` |
| **IMPLEMENTATION_PLAN.md** | Database schema and ETL pipeline | `1.DATABASE/IMPLEMENTATION_PLAN.md` |
| **CLAUDE.md** | Project conventions and architecture | `CLAUDE.md` |

### Quick Reference

```
Design Specifications     → IOS_WIREFRAME_PROFESSIONAL.md
User Personas            → IOS_WIREFRAME_PROFESSIONAL.md (Part 1)
Visual Specifications    → IOS_WIREFRAME_PROFESSIONAL.md (Part 3)
Screen Layouts           → IOS_WIREFRAME_PROFESSIONAL.md (Part 4)
Accessibility            → IOS_WIREFRAME_PROFESSIONAL.md (Part 7)
Database Schema          → 1.DATABASE/migrations/001-012
API Patterns             → frontend/src/lib/queries.ts
```

---

# Part 1: Database to iOS Feature Mapping

## 1.1 Current Database Schema

The PostgreSQL 18 database contains **28 core tables** with **155+ indexes**. Key tables for iOS:

### Core Data Tables

| Table | Records | iOS Usage |
|-------|---------|-----------|
| `teams` | 30 | Team display, logos, abbreviations |
| `players` | ~600 active | Player props, stats display |
| `games` | ~1,200/season | Today's games, game details |
| `player_game_stats` | ~15,000/season | Player performance, props analysis |
| `seasons` | 5+ | Season filtering (is_current flag) |

### Betting Intelligence Tables

| Table | Purpose | iOS Feature |
|-------|---------|-------------|
| `betting_events` | Game betting markets | TotalsAnalysisView |
| `betting_lines` | Spread, ML, O/U lines | All betting screens |
| `betting_odds` | Historical odds | Line movement charts |
| `ats_performance` | Against the spread records | Team analysis |
| `game_predictions` | Model predictions | Verdict display |
| `betting_trends` | Historical trends | Trend indicators |

### User Data Tables

| Table | Purpose | iOS Feature |
|-------|---------|-------------|
| `user_bets` | Bet tracking | MyBetsView |
| `user_bet_stats` | Performance view | Dashboard metrics |

## 1.2 Feature-to-Table Mapping

### TodayView (Home Screen)

**Data Sources:**
```sql
-- Primary query pattern
SELECT g.*, bl.*, gp.*
FROM games g
LEFT JOIN betting_lines bl ON g.game_id = bl.game_id
LEFT JOIN game_predictions gp ON g.game_id = gp.game_id
WHERE g.game_date = CURRENT_DATE
  AND g.season = (SELECT season_id FROM seasons WHERE is_current = true)
ORDER BY g.game_datetime;
```

**Tables Used:**
- `games` → Game schedule, scores, status
- `teams` → Team names, abbreviations
- `betting_lines` → Current spread, total, moneyline
- `game_predictions` → Win probability, edge indicator

### TotalsAnalysisView

**Data Sources:**
```sql
-- Historical data for Monte Carlo simulation
SELECT
  (g.home_team_score + g.away_team_score) as total,
  tgs_home.pace as home_pace,
  tgs_away.pace as away_pace
FROM games g
JOIN team_game_stats tgs_home ON g.game_id = tgs_home.game_id
  AND g.home_team_id = tgs_home.team_id
JOIN team_game_stats tgs_away ON g.game_id = tgs_away.game_id
  AND g.away_team_id = tgs_away.team_id
WHERE g.season = $1 AND g.game_status = 'Final'
ORDER BY g.game_date DESC
LIMIT 50;
```

**Tables Used:**
- `games` → Historical game totals
- `team_game_stats` → Pace, offensive/defensive ratings
- `betting_lines` → Current total line
- Monte Carlo computed server-side (10,000 simulations)

### PlayerPropsView

**Data Sources:**
```sql
-- Player props with starter filtering
SELECT
  p.player_id, p.full_name, t.abbreviation,
  pgs.start_position, pgs.is_starter,
  AVG(pgs.points) as points_avg,
  AVG(pgs.assists) as assists_avg,
  AVG(pgs.rebounds) as rebounds_avg
FROM players p
JOIN player_game_stats pgs ON p.player_id = pgs.player_id
JOIN games g ON pgs.game_id = g.game_id
JOIN teams t ON pgs.team_id = t.team_id
WHERE g.season = $1
  AND pgs.is_starter = true  -- Critical: starter-only filtering
GROUP BY p.player_id, p.full_name, t.abbreviation
HAVING COUNT(*) >= 5;
```

**Tables Used:**
- `players` → Player info
- `player_game_stats` → Performance data, `is_starter` field
- `games` → Season filtering
- `teams` → Team abbreviations

### MyBetsView

**Data Sources:**
```sql
-- User's bets with statistics
SELECT * FROM user_bets WHERE bet_date >= $1 ORDER BY bet_date DESC;
SELECT * FROM user_bet_stats;  -- Aggregate view
```

**Tables Used:**
- `user_bets` → Individual bet records
- `user_bet_stats` → Calculated performance metrics (wins, losses, ROI)
- `games` → Game results for bet resolution

---

# Part 2: API Layer Design

## 2.1 API Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        iOS Application                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ TodayVM  │  │ TotalsVM │  │ PropsVM  │  │  BetsVM  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │             │             │               │
│       └─────────────┴──────┬──────┴─────────────┘               │
│                            │                                     │
│                     ┌──────┴──────┐                             │
│                     │  APIClient  │                             │
│                     └──────┬──────┘                             │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTPS / WSS
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                     ┌──────┴──────┐                             │
│                     │   Cloudflare │  ← CDN + SSL + DDoS        │
│                     │     CDN      │                             │
│                     └──────┬──────┘                             │
│                            │                                     │
│              ┌─────────────┴─────────────┐                      │
│              │                           │                      │
│       ┌──────┴──────┐             ┌──────┴──────┐              │
│       │  REST API   │             │  WebSocket  │              │
│       │  (FastAPI)  │             │   Server    │              │
│       └──────┬──────┘             └──────┬──────┘              │
│              │                           │                      │
│              └─────────────┬─────────────┘                      │
│                            │                                     │
│                     ┌──────┴──────┐                             │
│                     │ PostgreSQL  │                             │
│                     │     18      │                             │
│                     └─────────────┘                             │
│                        GCE Instance                             │
└─────────────────────────────────────────────────────────────────┘
```

## 2.2 API Endpoints Specification

### Base URL
```
Production: https://api.statdiscute.be/v1
Development: http://localhost:8000/v1
```

### Authentication

```yaml
# JWT Authentication
POST /v1/auth/apple
  Request:
    identityToken: string  # Apple Sign In token
    authorizationCode: string
  Response:
    accessToken: string    # JWT, 15 min expiry
    refreshToken: string   # 30 day expiry
    userId: string

POST /v1/auth/refresh
  Request:
    refreshToken: string
  Response:
    accessToken: string
    refreshToken: string

DELETE /v1/auth/logout
  Headers:
    Authorization: Bearer {accessToken}
```

### Games Endpoints

```yaml
GET /v1/games/today
  Description: Get today's games with betting lines
  Response:
    success: boolean
    data:
      games: Game[]
      generatedAt: ISO8601
    meta:
      season: "2025-26"
      cacheTTL: 300

GET /v1/games/{gameId}
  Description: Get full game details
  Response:
    success: boolean
    data:
      game: Game
      homeTeam: TeamDetails
      awayTeam: TeamDetails
      bettingLine: BettingLine
      prediction: GamePrediction

GET /v1/games/{gameId}/totals-analysis
  Description: Monte Carlo totals analysis
  Response:
    success: boolean
    data:
      gameId: string
      currentTotal: number
      analysis:
        simulatedMean: number
        simulatedStdDev: number
        overProbability: number
        underProbability: number
        expectedValue: number
        kellyStake: number
        verdict: "STRONG_OVER" | "LEAN_OVER" | "HOLD" | "LEAN_UNDER" | "STRONG_UNDER"
        confidence: "low" | "medium" | "high" | "very_high"
      factors:
        homePace: number
        awayPace: number
        homeOffRtg: number
        awayOffRtg: number
        recentTrend: string
      simulationCount: 10000
```

### Player Props Endpoints

```yaml
GET /v1/player-props/tonight
  Query Params:
    gameId?: string      # Filter by specific game
    startersOnly?: bool  # Default: true
  Response:
    success: boolean
    data:
      games: Game[]
      players: PlayerProp[]
      defenseRankings: DefenseRanking[]
      generatedAt: ISO8601

GET /v1/players/{playerId}/stats
  Query Params:
    season?: string
    startersOnly?: bool
    limit?: number
  Response:
    success: boolean
    data:
      player: Player
      seasonAverages: Stats
      recentGames: GameStats[]
      starterStats: Stats
      benchStats: Stats
```

### User Bets Endpoints (Authenticated)

```yaml
GET /v1/bets
  Headers:
    Authorization: Bearer {accessToken}
  Query Params:
    limit?: number  # Default: 50
    offset?: number
    result?: "win" | "loss" | "push" | "pending"
  Response:
    success: boolean
    data:
      bets: UserBet[]
      pagination:
        total: number
        limit: number
        offset: number

POST /v1/bets
  Headers:
    Authorization: Bearer {accessToken}
  Request:
    gameId: string
    betType: "total_over" | "total_under" | "spread" | "moneyline"
    selection: string
    lineValue: number
    oddsDecimal: number
    stakeUnits: number
    confidenceRating?: number
    notes?: string
  Response:
    success: boolean
    data:
      bet: UserBet

PATCH /v1/bets/{betId}
  Headers:
    Authorization: Bearer {accessToken}
  Request:
    result?: "win" | "loss" | "push"
    actualTotal?: number
    profitLoss?: number
  Response:
    success: boolean
    data:
      bet: UserBet

GET /v1/bets/stats
  Headers:
    Authorization: Bearer {accessToken}
  Response:
    success: boolean
    data:
      totalBets: number
      wins: number
      losses: number
      pushes: number
      pending: number
      winPercentage: number
      totalProfitLoss: number
      roi: number
      currentStreak: number
      bestStreak: number
```

### WebSocket Endpoints

```yaml
WS /v1/live/scores
  Description: Real-time game score updates
  Messages:
    # Subscribe
    → { "type": "subscribe", "gameIds": ["0022400123"] }

    # Score update
    ← { "type": "score_update", "gameId": "0022400123", "homeScore": 87, "awayScore": 82, "quarter": 3, "clock": "5:42" }

    # Game status change
    ← { "type": "status_change", "gameId": "0022400123", "status": "Final" }

WS /v1/live/odds
  Description: Real-time odds movement
  Messages:
    # Subscribe
    → { "type": "subscribe", "gameIds": ["0022400123"] }

    # Odds update
    ← { "type": "odds_update", "gameId": "0022400123", "total": 224.5, "spread": -3.5, "timestamp": "2025-11-30T19:30:00Z" }
```

## 2.3 Response Envelope

All API responses follow this structure:

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    generatedAt: string;
    season: string;
    cacheTTL?: number;
    pagination?: {
      total: number;
      limit: number;
      offset: number;
    };
  };
}
```

## 2.4 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `AUTH_EXPIRED` | 401 | Token expired, refresh needed |
| `AUTH_INVALID` | 401 | Invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

# Part 3: iOS Data Models

## 3.1 Core Models (SwiftData)

```swift
// Team.swift
import SwiftData

@Model
final class Team: Identifiable {
    @Attribute(.unique) var teamId: Int64
    var fullName: String
    var abbreviation: String
    var nickname: String
    var city: String
    var yearFounded: Int?

    var displayName: String { abbreviation }

    init(teamId: Int64, fullName: String, abbreviation: String, nickname: String, city: String) {
        self.teamId = teamId
        self.fullName = fullName
        self.abbreviation = abbreviation
        self.nickname = nickname
        self.city = city
    }
}
```

```swift
// Game.swift
import SwiftData

@Model
final class Game: Identifiable {
    @Attribute(.unique) var gameId: String
    var gameDate: Date
    var gameDateTime: Date?
    var season: String
    var homeTeamId: Int64
    var awayTeamId: Int64
    var homeScore: Int?
    var awayScore: Int?
    var status: String // "Scheduled", "Live", "Final"
    var quarter: Int?
    var clock: String?

    // Relationships (transient for API response)
    @Transient var homeTeam: Team?
    @Transient var awayTeam: Team?
    @Transient var bettingLine: BettingLine?
    @Transient var prediction: GamePrediction?

    var isLive: Bool { status == "Live" }
    var isFinal: Bool { status == "Final" }
    var total: Int? {
        guard let home = homeScore, let away = awayScore else { return nil }
        return home + away
    }
}
```

```swift
// UserBet.swift
import SwiftData

@Model
final class UserBet: Identifiable {
    @Attribute(.unique) var betId: Int
    var betDate: Date
    var gameId: String
    var homeTeamAbbr: String
    var awayTeamAbbr: String
    var gameDateTime: Date

    var betType: String // "total_over", "total_under", "spread", "moneyline"
    var selection: String
    var lineValue: Decimal
    var oddsDecimal: Decimal
    var oddsAmerican: Int?
    var stakeUnits: Decimal

    var result: String? // "win", "loss", "push", "pending"
    var actualTotal: Decimal?
    var profitLoss: Decimal?

    var confidenceRating: Int?
    var notes: String?

    var isPending: Bool { result == nil || result == "pending" }
    var isWin: Bool { result == "win" }
    var isLoss: Bool { result == "loss" }
}
```

## 3.2 API Response Models (Codable)

```swift
// BettingLine.swift
struct BettingLine: Codable, Equatable {
    let spread: Decimal
    let homeSpreadOdds: Decimal
    let awaySpreadOdds: Decimal
    let total: Decimal
    let overOdds: Decimal
    let underOdds: Decimal
    let homeMoneyline: Int
    let awayMoneyline: Int
    let recordedAt: Date
    let isOpening: Bool
    let isClosing: Bool
}
```

```swift
// TotalsAnalysis.swift
struct TotalsAnalysis: Codable {
    let gameId: String
    let currentTotal: Decimal
    let analysis: MonteCarloResult
    let factors: TotalsFactors
    let simulationCount: Int

    struct MonteCarloResult: Codable {
        let simulatedMean: Decimal
        let simulatedStdDev: Decimal
        let overProbability: Decimal
        let underProbability: Decimal
        let expectedValue: Decimal
        let kellyStake: Decimal
        let verdict: Verdict
        let confidence: Confidence
    }

    struct TotalsFactors: Codable {
        let homePace: Decimal
        let awayPace: Decimal
        let homeOffRtg: Decimal
        let awayOffRtg: Decimal
        let homeDefRtg: Decimal
        let awayDefRtg: Decimal
        let recentTrend: String
    }

    enum Verdict: String, Codable {
        case strongOver = "STRONG_OVER"
        case leanOver = "LEAN_OVER"
        case hold = "HOLD"
        case leanUnder = "LEAN_UNDER"
        case strongUnder = "STRONG_UNDER"
    }

    enum Confidence: String, Codable {
        case low, medium, high, veryHigh = "very_high"
    }
}
```

```swift
// PlayerProp.swift
struct PlayerProp: Codable, Identifiable {
    let playerId: Int64
    let playerName: String
    let teamAbbreviation: String
    let position: String
    let isStarter: Bool
    let gameId: String

    // Season averages
    let pointsAvg: Decimal
    let assistsAvg: Decimal
    let reboundsAvg: Decimal
    let gamesPlayed: Int

    // Prop lines (optional - may not have lines for all players)
    let pointsLine: Decimal?
    let pointsOverOdds: Decimal?
    let pointsUnderOdds: Decimal?

    // Edge analysis
    let edgeVerdict: String
    let edgePoints: Decimal
    let defenseRank: Int?

    var id: Int64 { playerId }
}
```

```swift
// BetStats.swift
struct BetStats: Codable {
    let totalBets: Int
    let wins: Int
    let losses: Int
    let pushes: Int
    let pending: Int
    let winPercentage: Decimal
    let totalProfitLoss: Decimal
    let totalWinnings: Decimal
    let totalLosses: Decimal
    let roi: Decimal
    let currentStreak: Int
    let streakType: String? // "W" or "L"
}
```

---

# Part 4: iOS Project Structure

## 4.1 Complete Xcode Project Organization

```
StatDiscute/
├── StatDiscute.xcodeproj
├── StatDiscute/
│   │
│   ├── App/
│   │   ├── StatDiscuteApp.swift           # @main entry point
│   │   ├── AppDelegate.swift              # Push notifications, lifecycle
│   │   └── ContentView.swift              # Root view with tab bar
│   │
│   ├── Features/
│   │   │
│   │   ├── Today/
│   │   │   ├── TodayView.swift            # Main today screen
│   │   │   ├── TodayViewModel.swift       # Business logic
│   │   │   ├── TodayRepository.swift      # Data fetching
│   │   │   └── Components/
│   │   │       ├── GameCard.swift         # Individual game card
│   │   │       ├── GameCarousel.swift     # Horizontal scroll
│   │   │       ├── LiveScoreBadge.swift   # Real-time indicator
│   │   │       └── QuickVerdictPill.swift # OVER/UNDER pill
│   │   │
│   │   ├── TotalsAnalysis/
│   │   │   ├── TotalsAnalysisView.swift   # Full analysis screen
│   │   │   ├── TotalsAnalysisViewModel.swift
│   │   │   ├── TotalsRepository.swift
│   │   │   └── Components/
│   │   │       ├── MonteCarloChart.swift  # Swift Charts implementation
│   │   │       ├── ProbabilityBar.swift   # OVER/UNDER probability
│   │   │       ├── VerdictBadge.swift     # Large verdict display
│   │   │       ├── KeyFactorsStack.swift  # Factor breakdown
│   │   │       └── EVDisplay.swift        # Expected value + Kelly
│   │   │
│   │   ├── PlayerProps/
│   │   │   ├── PlayerPropsView.swift      # Props list screen
│   │   │   ├── PlayerPropsViewModel.swift
│   │   │   ├── PropsRepository.swift
│   │   │   └── Components/
│   │   │       ├── PropsTable.swift       # Data table
│   │   │       ├── PlayerRow.swift        # Individual player row
│   │   │       ├── EdgeIndicator.swift    # Edge visualization
│   │   │       ├── StarterToggle.swift    # Filter toggle
│   │   │       └── PlayerDetailSheet.swift
│   │   │
│   │   ├── MyBets/
│   │   │   ├── MyBetsView.swift           # Bets dashboard
│   │   │   ├── MyBetsViewModel.swift
│   │   │   ├── BetsRepository.swift
│   │   │   └── Components/
│   │   │       ├── BetsDashboard.swift    # Stats overview
│   │   │       ├── PerformanceChart.swift # Win/loss chart
│   │   │       ├── BetHistoryList.swift   # Bet history
│   │   │       ├── BetRow.swift           # Individual bet
│   │   │       ├── AddBetSheet.swift      # Add new bet form
│   │   │       └── BetDetailSheet.swift   # Bet details
│   │   │
│   │   └── Settings/
│   │       ├── SettingsView.swift
│   │       ├── SettingsViewModel.swift
│   │       └── Components/
│   │           ├── AccountSection.swift
│   │           ├── NotificationSettings.swift
│   │           └── AppearanceSettings.swift
│   │
│   ├── Core/
│   │   │
│   │   ├── Navigation/
│   │   │   ├── AppTabBar.swift            # Custom floating tab bar
│   │   │   ├── TabItem.swift              # Tab enum
│   │   │   ├── Router.swift               # Navigation router
│   │   │   └── DeepLinkHandler.swift      # URL handling
│   │   │
│   │   ├── DesignSystem/
│   │   │   ├── Colors.swift               # Color definitions
│   │   │   ├── Typography.swift           # Font styles
│   │   │   ├── Spacing.swift              # 8pt grid
│   │   │   ├── Shadows.swift              # Shadow definitions
│   │   │   └── Components/
│   │   │       ├── GlassCard.swift        # Glass morphism card
│   │   │       ├── StatRow.swift          # Key-value stat row
│   │   │       ├── LoadingView.swift      # Skeleton loader
│   │   │       ├── ErrorView.swift        # Error state
│   │   │       ├── EmptyStateView.swift   # Empty state
│   │   │       └── RefreshableView.swift  # Pull to refresh
│   │   │
│   │   ├── Networking/
│   │   │   ├── APIClient.swift            # URLSession wrapper
│   │   │   ├── APIEndpoints.swift         # Endpoint definitions
│   │   │   ├── APIError.swift             # Error types
│   │   │   ├── NetworkMonitor.swift       # Connectivity check
│   │   │   ├── WebSocketManager.swift     # Live data connection
│   │   │   └── AuthInterceptor.swift      # JWT token handling
│   │   │
│   │   └── Persistence/
│   │       ├── SwiftDataContainer.swift   # Model container
│   │       ├── CacheManager.swift         # Response caching
│   │       └── KeychainManager.swift      # Secure storage
│   │
│   ├── Domain/
│   │   │
│   │   ├── Models/
│   │   │   ├── Team.swift
│   │   │   ├── Game.swift
│   │   │   ├── Player.swift
│   │   │   ├── BettingLine.swift
│   │   │   ├── TotalsAnalysis.swift
│   │   │   ├── PlayerProp.swift
│   │   │   ├── UserBet.swift
│   │   │   └── BetStats.swift
│   │   │
│   │   ├── Enums/
│   │   │   ├── BetType.swift
│   │   │   ├── BetResult.swift
│   │   │   ├── Verdict.swift
│   │   │   └── GameStatus.swift
│   │   │
│   │   └── UseCases/
│   │       ├── GetTodaysGamesUseCase.swift
│   │       ├── GetTotalsAnalysisUseCase.swift
│   │       ├── GetPlayerPropsUseCase.swift
│   │       ├── TrackBetUseCase.swift
│   │       └── GetBetStatsUseCase.swift
│   │
│   ├── Extensions/
│   │   ├── View+Styling.swift
│   │   ├── View+Haptics.swift
│   │   ├── Decimal+Betting.swift          # Odds formatting
│   │   ├── Date+Formatting.swift
│   │   ├── Color+Design.swift
│   │   └── String+Localization.swift
│   │
│   └── Resources/
│       ├── Assets.xcassets/
│       │   ├── AppIcon.appiconset/
│       │   ├── Colors/
│       │   └── Images/
│       ├── Localizable.strings
│       ├── Info.plist
│       └── LaunchScreen.storyboard
│
├── StatDiscuteWidgets/
│   ├── StatDiscuteWidgets.swift           # Widget bundle
│   ├── TodaysGamesWidget.swift            # Games widget
│   ├── BetTrackerWidget.swift             # Bet performance widget
│   ├── WidgetModels.swift                 # Shared models
│   └── Assets.xcassets/
│
├── StatDiscuteLiveActivity/
│   ├── GameLiveActivity.swift             # Live Activity definition
│   ├── LiveActivityManager.swift          # Start/stop/update
│   └── LiveActivityAttributes.swift       # Data attributes
│
├── StatDiscuteIntents/
│   ├── AppIntents.swift                   # iOS 17+ App Intents
│   ├── SiriShortcuts.swift                # Siri integration
│   └── IntentHandler.swift
│
└── StatDiscuteTests/
    ├── Features/
    │   ├── TodayViewModelTests.swift
    │   ├── TotalsViewModelTests.swift
    │   └── BetsViewModelTests.swift
    ├── Networking/
    │   └── APIClientTests.swift
    └── Snapshots/
        └── ScreenSnapshotTests.swift
```

## 4.2 Package Dependencies

```swift
// Package.swift (Swift Package Manager)
dependencies: [
    // Networking (optional - URLSession is sufficient)
    // .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0"),

    // Secure Storage
    .package(url: "https://github.com/kishikawakatsumi/KeychainAccess.git", from: "4.2.2"),

    // Code Quality
    .package(url: "https://github.com/realm/SwiftLint.git", from: "0.54.0"),

    // Testing
    .package(url: "https://github.com/pointfreeco/swift-snapshot-testing.git", from: "1.15.0"),
    .package(url: "https://github.com/nalexn/ViewInspector.git", from: "0.9.0"),
]
```

---

# Part 5: Implementation Roadmap

## 5.1 Timeline Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           16-WEEK IMPLEMENTATION PLAN                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 1: API Layer              ████████                     Weeks 1-2     │
│  PHASE 2: iOS Foundation         ████████████████             Weeks 3-5     │
│  PHASE 3: Core Features          ████████████████             Weeks 6-8     │
│  PHASE 4: Advanced Features      ████████████                 Weeks 9-10    │
│  PHASE 5: Widgets & Extensions   ████████████                 Weeks 11-12   │
│  PHASE 6: Testing & Polish       ████████████                 Weeks 13-14   │
│  PHASE 7: Beta & Submission      ████████████                 Weeks 15-16   │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════    │
│  │ Week 1-2  │ Week 3-5  │ Week 6-8  │ Week 9-10 │Week 11-12│Week 13-16│    │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Phase 1: API Layer (Weeks 1-2)

### Week 1: Core API Development

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Set up FastAPI project structure | `api/` directory with boilerplate |
| 2 | Implement database connection pool | `database.py` with async psycopg |
| 3 | Create `/v1/games/today` endpoint | Working endpoint with tests |
| 4 | Create `/v1/games/{id}` endpoint | Game detail endpoint |
| 5 | Implement JWT authentication | `auth/` module with Apple Sign In |

### Week 2: Advanced Endpoints

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Create `/v1/games/{id}/totals-analysis` | Monte Carlo integration |
| 2 | Create `/v1/player-props/tonight` | Props endpoint |
| 3 | Implement `/v1/bets` CRUD | User bets endpoints |
| 4 | Set up WebSocket for live scores | `ws/` module |
| 5 | Deploy to GCE + Configure CDN | Production API live |

**Dependencies:** Existing PostgreSQL database, existing ETL pipeline
**Blockers:** None
**Exit Criteria:**
- [ ] All endpoints return correct data
- [ ] JWT authentication working
- [ ] API documentation generated (OpenAPI)
- [ ] <500ms response time (95th percentile)

## 5.3 Phase 2: iOS Foundation (Weeks 3-5)

### Week 3: Project Setup

| Task | File/Component | Reference |
|------|----------------|-----------|
| Create Xcode project | `StatDiscute.xcodeproj` | - |
| Set up project structure | See 4.1 | - |
| Implement DesignSystem/Colors | `Colors.swift` | Professional wireframe Part 3 |
| Implement DesignSystem/Typography | `Typography.swift` | Professional wireframe Part 3 |
| Create GlassCard component | `GlassCard.swift` | Professional wireframe Part 4 |
| Create VerdictBadge component | `VerdictBadge.swift` | Professional wireframe Part 4 |
| Create ProbabilityBar component | `ProbabilityBar.swift` | Professional wireframe Part 4 |

### Week 4: Networking & Persistence

| Task | File/Component | Notes |
|------|----------------|-------|
| Implement APIClient | `APIClient.swift` | async/await, URLSession |
| Implement APIEndpoints | `APIEndpoints.swift` | Type-safe endpoints |
| Set up SwiftData | `SwiftDataContainer.swift` | Team, Game, UserBet models |
| Implement KeychainManager | `KeychainManager.swift` | JWT storage |
| Create NetworkMonitor | `NetworkMonitor.swift` | NWPathMonitor |
| Implement CacheManager | `CacheManager.swift` | Response caching |

### Week 5: Navigation & Auth

| Task | File/Component | Notes |
|------|----------------|-------|
| Create AppTabBar | `AppTabBar.swift` | Floating pill style |
| Implement Router | `Router.swift` | NavigationStack paths |
| Set up DeepLinkHandler | `DeepLinkHandler.swift` | URL scheme handling |
| Implement Apple Sign In | `AuthView.swift` | ASAuthorizationController |
| Create skeleton loading states | `LoadingView.swift` | Shimmer animation |

**Dependencies:** Phase 1 complete (API available)
**Exit Criteria:**
- [ ] Design system matches wireframe specs
- [ ] API client can fetch all endpoints
- [ ] Authentication flow working
- [ ] Tab navigation functional

## 5.4 Phase 3: Core Features (Weeks 6-8)

### Week 6: TodayView

| Task | Component | Reference |
|------|-----------|-----------|
| Implement TodayView | `TodayView.swift` | Wireframe Part 4.1 |
| Create TodayViewModel | `TodayViewModel.swift` | - |
| Build GameCard | `GameCard.swift` | Wireframe Part 4.1 |
| Build GameCarousel | `GameCarousel.swift` | Horizontal scroll |
| Add pull-to-refresh | `RefreshableView` | - |
| Implement navigation to detail | Router integration | - |

### Week 7: TotalsAnalysisView

| Task | Component | Reference |
|------|-----------|-----------|
| Implement TotalsAnalysisView | `TotalsAnalysisView.swift` | Wireframe Part 4.2 |
| Create MonteCarloChart | `MonteCarloChart.swift` | Swift Charts |
| Build probability bars | `ProbabilityBar.swift` | Already created |
| Create key factors display | `KeyFactorsStack.swift` | - |
| Add EV + Kelly display | `EVDisplay.swift` | - |

### Week 8: MyBetsView

| Task | Component | Reference |
|------|-----------|-----------|
| Implement MyBetsView | `MyBetsView.swift` | Wireframe Part 4.3 |
| Create BetsDashboard | `BetsDashboard.swift` | Stats cards |
| Build PerformanceChart | `PerformanceChart.swift` | Swift Charts |
| Create BetHistoryList | `BetHistoryList.swift` | Scrollable list |
| Implement AddBetSheet | `AddBetSheet.swift` | Form sheet |

**Dependencies:** Phase 2 complete
**Exit Criteria:**
- [ ] All 3 main screens functional
- [ ] Data loading and caching working
- [ ] Add bet flow complete
- [ ] Charts rendering correctly

## 5.5 Phase 4: Advanced Features (Weeks 9-10)

### Week 9: PlayerProps

| Task | Component | Notes |
|------|-----------|-------|
| Implement PlayerPropsView | `PlayerPropsView.swift` | Data table |
| Create PropsTable | `PropsTable.swift` | Sortable columns |
| Build PlayerRow | `PlayerRow.swift` | Expandable |
| Add starter filter toggle | `StarterToggle.swift` | Toggle switch |
| Create PlayerDetailSheet | `PlayerDetailSheet.swift` | Modal detail |

### Week 10: Live Features

| Task | Component | Notes |
|------|-----------|-------|
| Implement WebSocketManager | `WebSocketManager.swift` | URLSessionWebSocketTask |
| Create LiveScoreBadge | `LiveScoreBadge.swift` | Pulsing indicator |
| Set up push notifications | AppDelegate | APNs registration |
| Implement background refresh | BGAppRefreshTask | 15-min intervals |
| Add Live Activities | `GameLiveActivity.swift` | Dynamic Island |

**Dependencies:** Phase 3 complete
**Exit Criteria:**
- [ ] Player props screen functional
- [ ] Live scores updating in real-time
- [ ] Push notifications configured
- [ ] Live Activities working

## 5.6 Phase 5: Widgets & Extensions (Weeks 11-12)

### Week 11: Widgets

| Task | Component | Size |
|------|-----------|------|
| Create widget bundle | `StatDiscuteWidgets.swift` | - |
| Build Small widget | `TodaysGamesWidget.swift` | Next game only |
| Build Medium widget | `TodaysGamesWidget.swift` | 2-3 games |
| Build Large widget | `BetTrackerWidget.swift` | Full dashboard |
| Implement timeline | `getTimeline()` | 15-min refresh |

### Week 12: Siri & Deep Links

| Task | Component | Notes |
|------|-----------|-------|
| Create App Intents | `AppIntents.swift` | iOS 17+ |
| Implement Siri shortcuts | `SiriShortcuts.swift` | "Show my bets" |
| Complete deep linking | `DeepLinkHandler.swift` | All routes |
| Add Spotlight indexing | `CSSearchableItem` | Index games |
| Create share extension | Share target | Share game analysis |

**Dependencies:** Phase 4 complete
**Exit Criteria:**
- [ ] All 3 widget sizes working
- [ ] Siri shortcuts functional
- [ ] Deep links handling all routes
- [ ] Spotlight returning results

## 5.7 Phase 6: Testing & Polish (Weeks 13-14)

### Week 13: Testing

| Task | Coverage Target | Tool |
|------|-----------------|------|
| Unit tests - ViewModels | 80%+ | XCTest |
| Unit tests - Repositories | 80%+ | XCTest |
| Unit tests - UseCases | 80%+ | XCTest |
| UI tests - Critical paths | 5+ flows | XCUITest |
| Snapshot tests | Key screens | swift-snapshot-testing |
| Accessibility audit | All screens | Accessibility Inspector |

### Week 14: Polish

| Task | Target | Notes |
|------|--------|-------|
| VoiceOver audit | WCAG AA | Test all screens |
| Dynamic Type testing | All sizes | xSmall to AX5 |
| Performance optimization | 60fps | Instruments |
| Memory leak detection | 0 leaks | Instruments |
| Animation polish | Smooth | Review timings |
| Haptic feedback | Consistent | Test on device |

**Dependencies:** All features implemented
**Exit Criteria:**
- [ ] 80%+ code coverage
- [ ] 0 memory leaks
- [ ] 60fps on all screens
- [ ] All accessibility tests pass

## 5.8 Phase 7: Beta & Submission (Weeks 15-16)

### Week 15: Beta

| Task | Notes |
|------|-------|
| Internal TestFlight | Team testing |
| Gather feedback | Issue tracking |
| Bug fixes | Priority fixes |
| App Store Connect setup | Bundle ID, certificates |
| Create screenshots | 6.7", 6.5", 5.5" |
| Create preview video | 30s max |

### Week 16: Submission

| Task | Notes |
|------|-------|
| Final bug fixes | Beta feedback |
| App Store description | Keywords optimization |
| Privacy policy | Required |
| Submit for review | Allow 2-5 days |
| Prepare for launch | Marketing, support |

**Exit Criteria:**
- [ ] App approved by Apple
- [ ] All critical bugs fixed
- [ ] Marketing materials ready
- [ ] Support documentation complete

---

# Part 6: Technical Specifications

## 6.1 System Requirements

| Requirement | Value |
|-------------|-------|
| **Minimum iOS** | 17.0 |
| **Recommended iOS** | 18.0+ |
| **Xcode** | 16.0+ |
| **Swift** | 6.0 |
| **Device** | iPhone only (v1.0) |
| **Architecture** | arm64 |

## 6.2 Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Cold launch | <1.5s | <3.0s |
| Warm launch | <0.5s | <1.0s |
| API response | <500ms | <2.0s |
| Frame rate | 60fps | 45fps |
| Memory | <150MB | <300MB |
| Battery | <5%/hr | <10%/hr |
| App size | <50MB | <100MB |

## 6.3 Third-Party Dependencies

| Dependency | Purpose | Version | License |
|------------|---------|---------|---------|
| KeychainAccess | Secure storage | 4.2.2 | MIT |
| SwiftLint | Code quality | 0.54.0 | MIT |
| swift-snapshot-testing | UI testing | 1.15.0 | MIT |
| ViewInspector | SwiftUI testing | 0.9.0 | MIT |

**Native Frameworks Used:**
- SwiftUI (UI)
- SwiftData (Persistence)
- Swift Charts (Charts)
- WidgetKit (Widgets)
- ActivityKit (Live Activities)
- AppIntents (Siri)
- BackgroundTasks (Background refresh)
- Network (Connectivity)

## 6.4 Security Considerations

| Concern | Mitigation |
|---------|------------|
| Token storage | Keychain with kSecAttrAccessibleWhenUnlockedThisDeviceOnly |
| API communication | TLS 1.3, certificate pinning |
| User data | No server-side storage without consent |
| Sensitive logs | Production builds strip debug logs |
| Jailbreak detection | Optional warning (not blocking) |

## 6.5 Analytics & Monitoring

| Service | Purpose | Events |
|---------|---------|--------|
| Firebase Analytics | Usage tracking | Screen views, actions |
| Firebase Crashlytics | Crash reporting | Crashes, ANRs |
| Custom API | Performance | API latency, errors |

**Key Events to Track:**
- `screen_view`: {screen_name, session_id}
- `bet_added`: {bet_type, confidence}
- `analysis_viewed`: {game_id, verdict}
- `widget_interaction`: {widget_size, action}

---

# Part 7: Risk Assessment

## 7.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API instability | Medium | High | Offline-first architecture, caching |
| WebSocket disconnections | High | Medium | Auto-reconnect, polling fallback |
| iOS version fragmentation | Low | Medium | Target iOS 17+, progressive enhancement |
| Performance on older devices | Medium | Medium | Profile on iPhone 11, optimize |

## 7.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| App Store rejection (gambling) | Medium | Critical | Position as analysis tool, no real money |
| NBA data API changes | Low | High | Abstract data layer, monitor for changes |
| User adoption | Medium | High | Focus on UX, viral features |

## 7.3 App Store Compliance

**Potential Rejection Reasons & Mitigations:**

1. **Guideline 4.2.2 - Gambling**
   - Risk: App rejected for gambling content
   - Mitigation:
     - No real money transactions
     - Position as "sports analytics" not "betting"
     - Educational disclaimers
     - No direct links to sportsbooks

2. **Guideline 5.1.1 - Data Collection**
   - Risk: Inadequate privacy disclosure
   - Mitigation:
     - Comprehensive privacy policy
     - App Tracking Transparency compliance
     - Clear data collection disclosure

3. **Guideline 4.3 - Spam**
   - Risk: App seen as duplicating existing apps
   - Mitigation:
     - Unique Monte Carlo analysis feature
     - Proprietary edge calculations
     - Clear differentiation in description

---

# Part 8: Cost Estimates

## 8.1 Infrastructure Costs (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| GCE Instance (API) | $50-100 | e2-medium |
| Cloud SQL (PostgreSQL) | $50 | db-f1-micro |
| Cloudflare (CDN) | $20 | Pro plan |
| Firebase | $0 | Free tier |
| **Total** | **$120-170** | |

## 8.2 Development Costs

| Resource | Duration | Rate | Total |
|----------|----------|------|-------|
| iOS Developer | 16 weeks | - | - |
| API Developer | 2 weeks | - | - |
| QA Testing | 2 weeks | - | - |
| Design Review | Ongoing | - | - |

## 8.3 Ongoing Costs

| Item | Annual Cost |
|------|-------------|
| Apple Developer Account | $99 |
| Infrastructure | ~$1,800 |
| Analytics (if beyond free tier) | ~$0-500 |
| **Total Annual** | **~$2,000-2,400** |

---

# Part 9: Success Criteria

## 9.1 Launch Criteria

- [ ] All Phase 1-7 deliverables complete
- [ ] 80%+ unit test coverage
- [ ] 0 critical/high bugs
- [ ] 0 memory leaks
- [ ] 60fps on all screens
- [ ] <1.5s cold launch
- [ ] Accessibility audit pass
- [ ] App Store approved

## 9.2 Post-Launch Metrics (30 Days)

| Metric | Target |
|--------|--------|
| Downloads | 500+ |
| Daily Active Users | 100+ |
| Crash-free rate | >99.5% |
| App Store rating | 4.0+ |
| Session duration | >2 min |

## 9.3 Post-Launch Metrics (90 Days)

| Metric | Target |
|--------|--------|
| Monthly Active Users | 2,000+ |
| Retention (D7) | >30% |
| Retention (D30) | >15% |
| App Store rating | 4.5+ |
| Feature requests addressed | 5+ |

---

# Appendices

## Appendix A: API Response Examples

### GET /v1/games/today Response

```json
{
  "success": true,
  "data": {
    "games": [
      {
        "gameId": "0022400123",
        "gameDate": "2025-11-30",
        "gameDateTime": "2025-11-30T19:30:00Z",
        "season": "2025-26",
        "homeTeam": {
          "teamId": 1610612738,
          "abbreviation": "BOS",
          "fullName": "Boston Celtics"
        },
        "awayTeam": {
          "teamId": 1610612747,
          "abbreviation": "LAL",
          "fullName": "Los Angeles Lakers"
        },
        "homeScore": null,
        "awayScore": null,
        "status": "Scheduled",
        "bettingLine": {
          "spread": -7.5,
          "homeSpreadOdds": 1.91,
          "awaySpreadOdds": 1.91,
          "total": 224.5,
          "overOdds": 1.91,
          "underOdds": 1.91,
          "homeMoneyline": -280,
          "awayMoneyline": 230
        },
        "prediction": {
          "verdict": "LEAN_UNDER",
          "confidence": "medium",
          "overProbability": 0.42,
          "underProbability": 0.58
        }
      }
    ],
    "generatedAt": "2025-11-30T15:00:00Z"
  },
  "meta": {
    "season": "2025-26",
    "cacheTTL": 300
  }
}
```

## Appendix B: Database Query Patterns

See `frontend/src/lib/queries.ts` for existing query patterns. All iOS API endpoints should follow the same season-aware filtering:

```sql
-- Always filter by current season
WHERE g.season = (SELECT season_id FROM seasons WHERE is_current = true)
```

## Appendix C: Design Reference

For complete visual specifications, see:
- `claudedocs/IOS_WIREFRAME_PROFESSIONAL.md` Part 3 (Visual Specifications)
- `claudedocs/IOS_WIREFRAME_PROFESSIONAL.md` Part 4 (Screen Specifications)
- `claudedocs/IOS_WIREFRAME_PROFESSIONAL.md` Part 7 (Accessibility)

---

**Document End**

*This master implementation plan provides the complete roadmap for building the Stat Discute iOS application. All referenced documents should be consulted for detailed specifications.*

---

**Approval Signatures**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Project Lead | | | |
| iOS Developer | | | |
| Backend Developer | | | |
| QA Lead | | | |

---

**Version History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | Claude | Initial document |
