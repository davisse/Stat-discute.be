# Team Stats Page Documentation

## Overview

The Team Stats Page (`/teams/[teamId]`) provides comprehensive statistics and visualizations for individual NBA teams. It combines real-time performance data, season-long trends, and a GitHub-style game calendar.

**Location**: `frontend/src/app/(dashboard)/teams/[teamId]/page.tsx`

---

## Architecture

### Component Hierarchy

```
TeamPage (page.tsx)
├── AppLayout (layout wrapper)
├── Back Navigation Link
├── Loading State
├── Error State
└── Content (when loaded)
    ├── Team Header (name + logo watermark)
    ├── Stats Grid
    │   ├── Main Stats Row (6 columns)
    │   │   ├── PPG StatCard
    │   │   ├── OPP PPG StatCard
    │   │   ├── PACE StatCard
    │   │   ├── ORTG StatCard
    │   │   ├── DRTG StatCard
    │   │   └── MATCHS StatCard
    │   └── Secondary Row (2 columns)
    │       ├── Totals Section
    │       └── Recent Form Section (L3/L5/L10)
    ├── TeamRankingDualChart
    │   ├── TeamPPGRankingChart
    │   └── TeamOppPPGRankingChart
    └── TeamPresenceCalendar
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                       │
│  tables: teams, games, team_game_stats, player_game_stats       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    lib/queries.ts                                │
│  - getTeamDetailedStats(teamId)                                 │
│  - getTeamGameHistory(teamId)                                   │
│  - getAllTeamsRanking()                                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Route Handlers                            │
│  - /api/teams/[teamId]/stats  → getTeamDetailedStats()         │
│  - /api/teams/[teamId]/games  → getTeamGameHistory()           │
│  - /api/teams/ranking         → getAllTeamsRanking()           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    React Components                              │
│  - TeamPage (client component, fetches via useEffect)           │
│  - TeamRankingDualChart → TeamPPGRankingChart                   │
│  - TeamPresenceCalendar                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### 1. GET `/api/teams/[teamId]/stats`

**Purpose**: Fetch comprehensive team statistics

**Location**: `frontend/src/app/api/teams/[teamId]/stats/route.ts`

**Response Interface**:
```typescript
interface TeamStats {
  team_id: number
  abbreviation: string
  full_name: string
  pace: string           // Possessions per 48 minutes
  ppg: string            // Points per game
  opp_ppg: string        // Opponent points per game
  ortg: string           // Offensive rating (pts/100 possessions)
  drtg: string           // Defensive rating (pts/100 possessions)
  avg_total: string      // Average game total
  stddev_total: string   // Standard deviation of totals
  min_total: number      // Minimum game total
  max_total: number      // Maximum game total
  l3_ppg: string         // Last 3 games PPG
  l3_total: string       // Last 3 games total
  l5_ppg: string         // Last 5 games PPG
  l5_total: string       // Last 5 games total
  l10_ppg: string        // Last 10 games PPG
  l10_total: string      // Last 10 games total
  games_played: number   // Total games played
  over_rate: string      // Percentage of games over 220.5
}
```

**Database Query**: `getTeamDetailedStats()` at `lib/queries.ts:3328-3451`

Uses CTEs to calculate:
- Base game stats from `team_game_stats`
- Pace calculation: `(possessions / minutes_played) * 48`
- Offensive/Defensive ratings
- Recent form (L3/L5/L10) using `ROW_NUMBER()` window function

### 2. GET `/api/teams/[teamId]/games`

**Purpose**: Fetch team game history for calendar visualization

**Location**: `frontend/src/app/api/teams/[teamId]/games/route.ts`

**Response Interface**:
```typescript
interface TeamGameDay {
  game_id: string
  game_date: string          // ISO date: "2025-12-25"
  opponent: string           // Team abbreviation: "LAL"
  is_home: boolean           // true = home game
  team_pts: number | null    // Points scored (null if scheduled)
  opp_pts: number | null     // Opponent points (null if scheduled)
  result: 'W' | 'L' | 'Scheduled'
  point_diff: number | null  // Point differential
  game_status: 'Final' | 'Scheduled'
}
```

**Database Query**: `getTeamGameHistory()` at `lib/queries.ts:4715-4756`

Includes games:
- All completed games for current season
- Scheduled games within next 7 days

### 3. GET `/api/teams/ranking`

**Purpose**: Fetch all teams for ranking charts

**Location**: `frontend/src/app/api/teams/ranking/route.ts`

**Response Interface**:
```typescript
interface TeamRankingData {
  team_id: number
  abbreviation: string
  ppg: number       // Points per game
  opp_ppg: number   // Opponent points per game
}
```

**Database Query**: `getAllTeamsRanking()` at `lib/queries.ts:4667-4700`

---

## Components

### TeamPresenceCalendar

**Location**: `frontend/src/components/teams/TeamPresenceCalendar.tsx`

**Purpose**: GitHub-style calendar displaying team's season game history

**Props**:
```typescript
interface TeamPresenceCalendarProps {
  games: TeamGameDay[]
  seasonStart: string    // e.g. '2025-10-22'
  seasonEnd: string      // e.g. '2026-04-13'
  teamAbbr: string       // e.g. 'ATL', 'LAL'
  fullSize?: boolean     // Enable full viewport mode
  className?: string
}
```

**Visual States**:

| State | Color/Style | Description |
|-------|-------------|-------------|
| Win (blowout) | `bg-emerald-400` | Point diff ≥ 20 |
| Win (comfortable) | `bg-emerald-500` | Point diff ≥ 15 |
| Win (solid) | `bg-emerald-600` | Point diff ≥ 10 |
| Win (close) | `bg-emerald-700` | Point diff ≥ 5 |
| Win (tight) | `bg-emerald-800` | Point diff < 5 |
| Loss (blowout) | `bg-red-400` | Point diff ≥ 20 |
| Loss (comfortable) | `bg-red-500` | Point diff ≥ 15 |
| Loss (solid) | `bg-red-600` | Point diff ≥ 10 |
| Loss (close) | `bg-red-700` | Point diff ≥ 5 |
| Loss (tight) | `bg-red-800` | Point diff < 5 |
| Scheduled | Hatched pattern | White border + diagonal stripes |
| Off day | `bg-zinc-900/50` | No game on this date |
| Out of season | `bg-transparent` | Before/after season |

**Scheduled Game Styling**:
```typescript
{
  border: '1px solid rgba(255, 255, 255, 0.6)',
  background: `repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.15) 2px,
    rgba(255, 255, 255, 0.15) 4px
  )`
}
```

**Key Features**:
- Week-based grid (Sun-Sat columns)
- Dynamic square sizing based on container width
- Responsive day labels (S/M/T/W/T/F/S on mobile, full names on desktop)
- Tooltip on hover showing game details
- Footer with season statistics (record, home/away split, avg point diff)

### TeamRankingDualChart

**Location**: `frontend/src/components/teams/TeamRankingDualChart.tsx`

**Purpose**: Container for dual PPG ranking charts

**Props**:
```typescript
interface TeamRankingDualChartProps {
  data: TeamRankingData[]
  selectedTeamId: number
}
```

**Layout**: Grid with 2 columns on large screens, 1 column on mobile

### TeamPPGRankingChart

**Location**: `frontend/src/components/teams/TeamPPGRankingChart.tsx`

**Purpose**: Horizontal bar chart ranking all 30 teams by PPG

**Features**:
- Selected team highlighted in white
- Other teams in zinc-600
- Team abbreviations as labels
- Value displayed at bar end

### TeamOppPPGRankingChart

**Location**: `frontend/src/components/teams/TeamOppPPGRankingChart.tsx`

**Purpose**: Horizontal bar chart ranking all 30 teams by opponent PPG (defensive efficiency)

---

## Database Queries

### getTeamDetailedStats()

**Location**: `lib/queries.ts:3328-3451`

**SQL Structure**:
```sql
WITH game_stats AS (
  -- Base stats from team_game_stats + games
  SELECT team_id, pts, opp_pts, possessions, minutes_played, ...
  FROM team_game_stats tgs
  JOIN games g ON tgs.game_id = g.game_id
  WHERE g.season = $2 AND (g.home_team_id = $1 OR g.away_team_id = $1)
),
recent_games AS (
  -- Last N games using ROW_NUMBER()
  SELECT *, ROW_NUMBER() OVER (ORDER BY game_date DESC) as rn
  FROM game_stats
),
team_totals AS (
  -- Aggregate stats
  SELECT
    AVG(pts) as ppg,
    AVG(opp_pts) as opp_ppg,
    AVG((possessions / minutes_played) * 48) as pace,
    AVG((pts / possessions) * 100) as ortg,
    AVG((opp_pts / possessions) * 100) as drtg,
    ...
)
SELECT * FROM team_totals
```

### getTeamGameHistory()

**Location**: `lib/queries.ts:4715-4756`

**SQL Structure**:
```sql
SELECT
  g.game_id,
  g.game_date::text,
  CASE WHEN g.home_team_id = $1 THEN at.abbreviation
       ELSE ht.abbreviation END as opponent,
  CASE WHEN g.home_team_id = $1 THEN true ELSE false END as is_home,
  -- Scores (null for scheduled games)
  g.home_team_score, g.away_team_score,
  -- Result determination
  CASE
    WHEN g.game_status = 'Scheduled' THEN 'Scheduled'
    WHEN g.home_team_id = $1 AND g.home_team_score > g.away_team_score THEN 'W'
    WHEN g.away_team_id = $1 AND g.away_team_score > g.home_team_score THEN 'W'
    ELSE 'L'
  END as result,
  g.game_status
FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
WHERE g.season = $2
  AND (g.home_team_id = $1 OR g.away_team_id = $1)
  AND (
    g.game_status = 'Final'
    OR (g.game_status = 'Scheduled' AND g.game_date <= CURRENT_DATE + INTERVAL '7 days')
  )
ORDER BY g.game_date ASC
```

---

## State Management

The page uses React `useState` hooks for:

```typescript
const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
const [allTeamsRanking, setAllTeamsRanking] = useState<TeamRankingData[]>([])
const [teamGames, setTeamGames] = useState<TeamGameDay[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

Data fetching occurs in `useEffect` triggered by `teamId` changes.

---

## Styling Conventions

### Design Tokens

- **Background**: `bg-zinc-900/50` with `border border-zinc-800`
- **Border Radius**: `rounded-lg` (8px)
- **Text Colors**:
  - Primary: `text-white`
  - Secondary: `text-zinc-400`, `text-zinc-500`
  - Labels: `text-[10px] uppercase tracking-wider text-zinc-500`
- **Font Families**:
  - Stats: `font-mono`
  - Labels: System font (Inter)

### Team Logo Watermark

```tsx
<div
  className="absolute -right-8 top-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-20"
  style={{
    backgroundImage: `url(https://cdn.nba.com/logos/nba/${teamStats.team_id}/primary/L/logo.svg)`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    filter: 'brightness(1.2)',
  }}
/>
```

---

## Usage Example

```tsx
// Navigate to team page
<Link href={`/teams/${team.team_id}`}>
  {team.full_name}
</Link>

// Direct URL
/teams/1610612737  // Atlanta Hawks
/teams/1610612747  // Los Angeles Lakers
```

---

## Related Files

| File | Purpose |
|------|---------|
| `app/(dashboard)/teams/page.tsx` | Teams list page |
| `components/teams/index.ts` | Component exports |
| `lib/queries.ts` | Database query functions |
| `lib/db.ts` | PostgreSQL connection pool |

---

## Season Configuration

The calendar uses hardcoded season dates:

```typescript
seasonStart="2025-10-22"  // NBA season start
seasonEnd="2026-04-13"    // NBA regular season end
```

These should be updated annually or made dynamic via database `seasons` table.
