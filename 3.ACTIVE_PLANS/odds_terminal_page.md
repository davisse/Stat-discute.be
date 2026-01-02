# Odds Terminal Page - Implementation Plan

**Status**: ✅ COMPLETED
**Created**: 2024-12-14
**Purpose**: ASCII-style betting odds visualization page with real-time movement tracking

---

## Overview

Create a new "Odds Terminal" page that displays betting odds in an ASCII/terminal aesthetic, tracking line movements for moneylines, totals, and player props with visual indicators for sharp money signals.

## Design Principles

- **Typography**: JetBrains Mono (monospace) for all data and ASCII art
- **Background**: Dark (#0a0a0a) with terminal aesthetic
- **Colors**:
  - White (#ffffff) for primary text
  - Green (#22c55e) for positive/steam
  - Red (#ef4444) for negative/drift
  - Amber (#f59e0b) for warnings/thresholds
  - Gray (#737373) for secondary text
- **Layout**: Tab-based navigation (Moneylines, Totals, Props, Insights)
- **Responsive**: Horizontal scroll for ASCII art on mobile

---

## Features

### 1. Moneyline Evolution
- Open vs Current odds comparison
- Movement direction (↗ drift, ↘ steam)
- ASCII bar visualization
- "Biggest Movers" summary

### 2. Totals Evolution
- Line movement tracking (open → current)
- Points dropped visualization (█░ bars)
- Over/Under juice indicators
- Summary statistics (all under/over trend)

### 3. Player Props
- Props by category tabs (Points, 3PM, Assists, Rebounds, Double-Double)
- Line movement detection
- Juice analysis with lean indicators
- Implied probabilities for yes/no props

### 4. Insights Panel
- Sharp signals aggregation
- Key takeaways per category
- Summary dashboard

---

## Technical Architecture

### File Structure

```
frontend/src/
├── app/
│   ├── betting/
│   │   └── odds-terminal/
│   │       └── page.tsx              # Main page (Server Component)
│   └── api/
│       └── betting/
│           └── odds-terminal/
│               └── route.ts          # API endpoint
├── components/
│   └── betting/
│       ├── OddsTerminal.tsx          # Main client component
│       ├── OddsTerminalHeader.tsx    # Header with refresh
│       ├── OddsTerminalTabs.tsx      # Tab navigation
│       ├── ASCIIMoneylines.tsx       # Moneyline visualization
│       ├── ASCIITotals.tsx           # Totals visualization
│       ├── ASCIIPlayerProps.tsx      # Props visualization
│       ├── ASCIIInsights.tsx         # Insights panel
│       └── ASCIIBar.tsx              # Reusable ASCII bar
└── lib/
    └── queries.ts                    # Add new query functions
```

### Data Types

```typescript
// Types for Odds Terminal
interface MoneylineData {
  gameId: string;
  game: string;
  gameDate: string;
  awayTeam: {
    abbr: string;
    name: string;
    openOdds: number;
    currentOdds: number;
    movement: number;
  };
  homeTeam: {
    abbr: string;
    name: string;
    openOdds: number;
    currentOdds: number;
    movement: number;
  };
  readings: number;
}

interface TotalsData {
  gameId: string;
  game: string;
  openLine: number;
  currentLine: number;
  movement: number;
  overOdds: number;
  underOdds: number;
}

interface PlayerPropData {
  playerName: string;
  game: string;
  propType: 'points' | '3pm' | 'assists' | 'rebounds' | 'double_double';
  line: number;
  openLine: number | null;
  movement: number;
  overOdds: number;
  underOdds: number;
}

interface OddsTerminalResponse {
  fetchedAt: string;
  gamesCount: number;
  marketsCount: number;
  propsCount: number;
  moneylines: MoneylineData[];
  totals: TotalsData[];
  playerProps: PlayerPropData[];
  insights: {
    biggestMLMovers: { team: string; movement: number; direction: 'steam' | 'drift' }[];
    totalsTrend: 'all_under' | 'all_over' | 'mixed';
    totalPointsDropped: number;
    propsWithMovement: number;
  };
}
```

### SQL Queries

#### Moneylines with History
```sql
WITH ml_history AS (
    SELECT g.game_id, g.game_date, t1.full_name as away_name, t2.full_name as home_name,
           t1.abbreviation as away, t2.abbreviation as home,
           bo.selection, bo.odds_decimal, bo.recorded_at,
           ROW_NUMBER() OVER (PARTITION BY g.game_id, bo.selection ORDER BY bo.recorded_at ASC) as first_rn,
           ROW_NUMBER() OVER (PARTITION BY g.game_id, bo.selection ORDER BY bo.recorded_at DESC) as last_rn
    FROM betting_events be
    JOIN games g ON be.game_id = g.game_id
    JOIN teams t1 ON g.away_team_id = t1.team_id
    JOIN teams t2 ON g.home_team_id = t2.team_id
    JOIN betting_markets bm ON be.event_id = bm.event_id
    JOIN betting_odds bo ON bm.market_id = bo.market_id
    WHERE g.game_date >= CURRENT_DATE
      AND bm.market_name = 'Game Moneyline'
)
SELECT game_id, game_date, away, home, away_name, home_name,
       MAX(CASE WHEN selection = away_name AND first_rn = 1 THEN odds_decimal END) as away_open,
       MAX(CASE WHEN selection = away_name AND last_rn = 1 THEN odds_decimal END) as away_current,
       MAX(CASE WHEN selection = home_name AND first_rn = 1 THEN odds_decimal END) as home_open,
       MAX(CASE WHEN selection = home_name AND last_rn = 1 THEN odds_decimal END) as home_current,
       COUNT(DISTINCT recorded_at) as readings
FROM ml_history
GROUP BY game_id, game_date, away, home, away_name, home_name
ORDER BY game_date, game_id;
```

#### Totals with History
```sql
WITH totals_history AS (
    SELECT g.game_id, t1.abbreviation as away, t2.abbreviation as home,
           CAST(SUBSTRING(bm.market_name FROM 'Game Game Total ([0-9.]+)') AS NUMERIC) as total_line,
           bo.selection, bo.odds_decimal, bo.recorded_at
    FROM betting_events be
    JOIN games g ON be.game_id = g.game_id
    JOIN teams t1 ON g.away_team_id = t1.team_id
    JOIN teams t2 ON g.home_team_id = t2.team_id
    JOIN betting_markets bm ON be.event_id = bm.event_id
    JOIN betting_odds bo ON bm.market_id = bo.market_id
    WHERE g.game_date >= CURRENT_DATE
      AND bm.market_name LIKE 'Game Game Total%'
),
pivoted AS (
    SELECT game_id, away, home, total_line, recorded_at,
           MAX(CASE WHEN selection LIKE 'Over%' THEN odds_decimal END) as over_odds,
           MAX(CASE WHEN selection LIKE 'Under%' THEN odds_decimal END) as under_odds
    FROM totals_history
    GROUP BY game_id, away, home, total_line, recorded_at
),
main_lines AS (
    SELECT *,
           ABS(over_odds - under_odds) as juice_diff,
           ROW_NUMBER() OVER (PARTITION BY game_id, recorded_at ORDER BY ABS(over_odds - under_odds)) as line_rank
    FROM pivoted
    WHERE over_odds IS NOT NULL AND under_odds IS NOT NULL
)
SELECT game_id, away, home,
       (SELECT total_line FROM main_lines m2 WHERE m2.game_id = main_lines.game_id AND m2.line_rank = 1 ORDER BY recorded_at ASC LIMIT 1) as open_line,
       (SELECT total_line FROM main_lines m2 WHERE m2.game_id = main_lines.game_id AND m2.line_rank = 1 ORDER BY recorded_at DESC LIMIT 1) as current_line,
       (SELECT over_odds FROM main_lines m2 WHERE m2.game_id = main_lines.game_id AND m2.line_rank = 1 ORDER BY recorded_at DESC LIMIT 1) as over_odds,
       (SELECT under_odds FROM main_lines m2 WHERE m2.game_id = main_lines.game_id AND m2.line_rank = 1 ORDER BY recorded_at DESC LIMIT 1) as under_odds
FROM main_lines
WHERE line_rank = 1
GROUP BY game_id, away, home
ORDER BY (current_line - open_line) ASC;
```

#### Player Props with History
```sql
WITH prop_history AS (
    SELECT pp.player_name, pp.prop_type, pp.line, pp.over_odds_decimal, pp.under_odds_decimal,
           pp.recorded_at, t1.abbreviation as away, t2.abbreviation as home
    FROM player_props pp
    JOIN games g ON pp.game_id = g.game_id
    JOIN teams t1 ON g.away_team_id = t1.team_id
    JOIN teams t2 ON g.home_team_id = t2.team_id
    WHERE g.game_date >= CURRENT_DATE
)
SELECT player_name, prop_type, away || '@' || home as game,
       (SELECT line FROM prop_history p2 WHERE p2.player_name = prop_history.player_name AND p2.prop_type = prop_history.prop_type ORDER BY recorded_at ASC LIMIT 1) as open_line,
       (SELECT line FROM prop_history p2 WHERE p2.player_name = prop_history.player_name AND p2.prop_type = prop_history.prop_type ORDER BY recorded_at DESC LIMIT 1) as current_line,
       (SELECT over_odds_decimal FROM prop_history p2 WHERE p2.player_name = prop_history.player_name AND p2.prop_type = prop_history.prop_type ORDER BY recorded_at DESC LIMIT 1) as over_odds,
       (SELECT under_odds_decimal FROM prop_history p2 WHERE p2.player_name = prop_history.player_name AND p2.prop_type = prop_history.prop_type ORDER BY recorded_at DESC LIMIT 1) as under_odds
FROM prop_history
GROUP BY player_name, prop_type, away, home
ORDER BY prop_type, player_name;
```

---

## Implementation Phases

### Phase 1: API Layer ✅
- [x] Create `/api/betting/odds-terminal/route.ts`
- [x] SQL queries inline (moneylines, totals, props, counts)
- [x] Test API endpoint with curl

### Phase 2: Components ✅
- [x] Create `components/betting/odds-terminal/` directory
- [x] Build `ASCIIBar.tsx` - Reusable progress bar component
- [x] Build `ASCIIMoneylines.tsx` - Moneyline evolution display
- [x] Build `ASCIITotals.tsx` - Totals evolution display
- [x] Build `ASCIIPlayerProps.tsx` - Props by category with tabs
- [x] Build `ASCIIInsights.tsx` - Sharp signals panel with ASCII art
- [x] Build `OddsTerminal.tsx` - Main orchestrator component with tabs

### Phase 3: Page Integration ✅
- [x] Create `/betting/odds-terminal/page.tsx`
- [x] Wrap with AppLayout
- [x] Add to navigation in `lib/navigation.ts`
- [x] Implement client-side refresh functionality
- [x] Add loading states

### Phase 4: Enhancements ✅
- [x] Add auto-refresh toggle (60s intervals)
- [x] Keyboard shortcuts (R for refresh, 1-4 for tabs)
- [ ] Add game filter dropdown (future)
- [ ] Add export to clipboard feature (future)
- [ ] Mobile responsiveness improvements (future)

---

## Component Specifications

### ASCIIBar Component

```typescript
interface ASCIIBarProps {
  openValue: number;
  currentValue: number;
  minValue?: number;
  maxValue?: number;
  width?: number; // characters
  showValues?: boolean;
  direction?: 'horizontal' | 'vertical';
}

// Renders: 1.84 ●━━━━━━━━━━━━━━━━━━━▶ 1.62
```

### OddsTerminalTabs Component

```typescript
type TabType = 'moneylines' | 'totals' | 'props' | 'insights';

interface OddsTerminalTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    games: number;
    props: number;
    signals: number;
  };
}
```

---

## CSS Classes (Tailwind)

```css
/* Terminal container */
.terminal-container {
  @apply bg-[#0a0a0a] font-mono text-white rounded-lg border border-gray-800;
}

/* ASCII border using box-drawing characters */
.ascii-box {
  @apply whitespace-pre overflow-x-auto;
}

/* Movement indicators */
.movement-steam { @apply text-green-500; } /* ↘ getting shorter */
.movement-drift { @apply text-red-500; }   /* ↗ getting longer */
.movement-none { @apply text-gray-500; }   /* = no change */

/* Tab styles */
.terminal-tab {
  @apply px-4 py-2 border-b-2 border-transparent hover:border-gray-600;
}
.terminal-tab-active {
  @apply border-white text-white;
}
```

---

## Testing Checklist

- [ ] Moneylines display correctly with movement
- [ ] Totals show proper line drops
- [ ] Props categorized correctly
- [ ] Insights panel shows accurate summaries
- [ ] Refresh button updates data
- [ ] Auto-refresh works at intervals
- [ ] Mobile horizontal scroll works
- [ ] Empty state handled (no games)
- [ ] Error state handled (API failure)
- [ ] Loading state displays properly

---

## Navigation Update

Add to `AppLayout.tsx` navItems:

```typescript
{ name: 'Odds Terminal', href: '/betting/odds-terminal' }
```

---

## Future Enhancements (Backlog)

1. **Historical View**: Show odds movement over past 24h/48h/week
2. **Alerts**: Notify when specific lines move X points
3. **Comparison Mode**: Side-by-side with other books
4. **Export**: Download as CSV/JSON
5. **Favorites**: Pin specific games/props to top
6. **Dark/Light Terminal**: Toggle between themes

---

## References

- Existing DynamicChart component: `frontend/src/components/chat/DynamicChart.tsx`
- Quarter analysis page pattern: `frontend/src/app/analysis/quarters/page.tsx`
- Design tokens: `frontend/src/lib/design-tokens.ts`
- AppLayout wrapper: `frontend/src/components/layout/AppLayout.tsx`
