# Player Stats Bento Grid - Implementation Plan

**Status**: ✅ COMPLETED
**Created**: 2025-12-27
**Completed**: 2025-12-27
**Section Position**: After Hero (Section 01), becomes Section 02

---

## Overview

Add a bento-style grid displaying traditional season statistics with league-wide rankings for each stat. Mobile-first responsive design with asymmetric card layouts creating visual hierarchy.

---

## Stats to Display

### Primary (Large Cards)
| Stat | Label | Format | Ranking Note |
|------|-------|--------|--------------|
| PPG | Points Per Game | X.X | Higher is better |
| RPG | Rebounds Per Game | X.X | Higher is better |
| APG | Assists Per Game | X.X | Higher is better |

### Secondary (Medium Cards)
| Stat | Label | Format | Ranking Note |
|------|-------|--------|--------------|
| SPG | Steals | X.X | Higher is better |
| BPG | Blocks | X.X | Higher is better |
| FG% | Field Goal % | XX.X% | Higher is better |
| 3P% | Three Point % | XX.X% | Higher is better |
| FT% | Free Throw % | XX.X% | Higher is better |

### Tertiary (Small Cards)
| Stat | Label | Format | Ranking Note |
|------|-------|--------|--------------|
| MPG | Minutes Per Game | XX.X | Higher is better |
| TOV | Turnovers | X.X | **Lower is better** |

---

## ASCII Wireframes

### Mobile Layout (375px viewport)

```
╔═══════════════════════════════════════════════════════════════╗
║                    ███╗   ███╗ ██████╗  ██████╗██╗  ██╗       ║
║                    ████╗ ████║██╔═══██╗██╔════╝██║ ██╔╝       ║
║                    ██╔████╔██║██║   ██║██║     █████╔╝        ║
║                    ██║╚██╔╝██║██║   ██║██║     ██╔═██╗        ║
║                    ██║ ╚═╝ ██║╚██████╔╝╚██████╗██║  ██╗       ║
║                    ╚═╝     ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝       ║
║                         MOBILE - 375px                        ║
╚═══════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────┐
│ 02 ─────────────────────────────────│
│ TRADITIONAL STATS    Season 2025-26 │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  PPG                            │ │
│ │  ┌─────────────────────────┐    │ │
│ │  │        20.4             │    │ │
│ │  └─────────────────────────┘    │ │
│ │  #8 in NBA                      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌───────────────┐ ┌───────────────┐ │
│ │ RPG           │ │ APG           │ │
│ │    5.3        │ │    7.0        │ │
│ │ #45           │ │ #12           │ │
│ └───────────────┘ └───────────────┘ │
│                                     │
│ ┌───────────────┐ ┌───────────────┐ │
│ │ STL           │ │ BLK           │ │
│ │    1.2        │ │    0.5        │ │
│ │ #28           │ │ #89           │ │
│ └───────────────┘ └───────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ SHOOTING                        │ │
│ │ ┌─────────┐┌─────────┐┌───────┐ │ │
│ │ │  FG%    ││  3P%    ││  FT%  │ │ │
│ │ │ 48.2%   ││ 35.1%   ││ 75.3% │ │ │
│ │ │  #34    ││  #67    ││  #82  │ │ │
│ │ └─────────┘└─────────┘└───────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌───────────────┐ ┌───────────────┐ │
│ │ MPG           │ │ TOV           │ │
│ │    33.2       │ │    3.1        │ │
│ │ #15           │ │ #142 (best)   │ │
│ └───────────────┘ └───────────────┘ │
└─────────────────────────────────────┘
```

**Mobile Grid Structure:**
- Base: 2 columns
- PPG: `col-span-2` (full width hero)
- RPG/APG: `col-span-1` each
- STL/BLK: `col-span-1` each
- Shooting: `col-span-2` (combined card with 3 sub-stats)
- MPG/TOV: `col-span-1` each

---

### Desktop Layout (1280px+ viewport)

```
╔════════════════════════════════════════════════════════════════════════════════════════════════════╗
║              ███╗   ███╗ ██████╗  ██████╗██╗  ██╗██╗   ██╗██████╗                                   ║
║              ████╗ ████║██╔═══██╗██╔════╝██║ ██╔╝██║   ██║██╔══██╗                                  ║
║              ██╔████╔██║██║   ██║██║     █████╔╝ ██║   ██║██████╔╝                                  ║
║              ██║╚██╔╝██║██║   ██║██║     ██╔═██╗ ██║   ██║██╔═══╝                                   ║
║              ██║ ╚═╝ ██║╚██████╔╝╚██████╗██║  ██╗╚██████╔╝██║                                       ║
║              ╚═╝     ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝                                       ║
║                                        DESKTOP - 1280px+                                           ║
╚════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 02 ─────────────────────────────────────────────────────────────────────────────────────────────── │
│ TRADITIONAL STATS                                                            Season 2025-26       │
│                                                                                                    │
│ ┌──────────────────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────┐ │
│ │                              │ │                  │ │                  │ │                    │ │
│ │   POINTS PER GAME            │ │   REBOUNDS       │ │   ASSISTS        │ │   STEALS           │ │
│ │                              │ │                  │ │                  │ │                    │ │
│ │          20.4                │ │      5.3         │ │      7.0         │ │      1.2           │ │
│ │                              │ │                  │ │                  │ │                    │ │
│ │   #8 in NBA                  │ │   #45 in NBA     │ │   #12 in NBA     │ │   #28 in NBA       │ │
│ │                              │ │                  │ │                  │ │                    │ │
│ ├──────────────────────────────┤ └──────────────────┘ └──────────────────┘ ├────────────────────┤ │
│ │                              │                                           │                    │ │
│ │   MINUTES PER GAME           │  ┌──────────────────────────────────────┐ │   BLOCKS           │ │
│ │          33.2                │  │       SHOOTING EFFICIENCY            │ │                    │ │
│ │   #15 in NBA                 │  │                                      │ │      0.5           │ │
│ │                              │  │   FG%       3P%        FT%           │ │                    │ │
│ └──────────────────────────────┘  │  48.2%     35.1%      75.3%          │ │   #89 in NBA       │ │
│                                   │   #34       #67        #82           │ │                    │ │
│ ┌──────────────────────────────┐  │                                      │ └────────────────────┘ │
│ │ TURNOVERS                    │  └──────────────────────────────────────┘                        │
│ │    3.1 per game              │                                                                  │
│ │    #142 (lower is better)    │                                                                  │
│ └──────────────────────────────┘                                                                  │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Desktop Grid Structure:**
- Base: 4 columns
- Row 1: PPG (span-1, row-span-2), RPG (span-1), APG (span-1), STL (span-1, row-span-2)
- Row 2: MPG (span-1), Shooting (span-2), BLK (span-1)
- Row 3: TOV (span-1)

---

## Component Architecture

### Files to Create/Modify

```
frontend/src/components/player/
├── PlayerStatsBento.tsx      # NEW - Main bento grid container
├── StatCard.tsx              # NEW - Reusable stat card component
├── PlayerPresenceCalendar.tsx
└── index.ts                  # UPDATE - Add exports

frontend/src/lib/
└── queries.ts                # UPDATE - Add stats with rankings query

frontend/src/app/(dashboard)/players/[playerId]/
└── page.tsx                  # UPDATE - Add bento section after hero
```

### StatCard Component Props

```typescript
interface StatCardProps {
  label: string           // "Points Per Game"
  shortLabel: string      // "PPG"
  value: number           // 20.4
  rank: number            // 8
  totalPlayers?: number   // 450
  size: 'hero' | 'large' | 'medium' | 'small'
  suffix?: string         // "%" for percentages
  lowerIsBetter?: boolean // true for TOV
  className?: string      // Additional tailwind classes
}
```

### Visual Specifications

| Size | Value Font | Label Font | Rank Style |
|------|------------|------------|------------|
| hero | text-5xl lg:text-7xl font-bold | text-xs uppercase tracking-wider | Emerald badge if top-10 |
| large | text-4xl lg:text-5xl font-bold | text-xs uppercase | Gray badge |
| medium | text-3xl font-bold | text-[10px] uppercase | Small gray text |
| small | text-2xl font-mono | text-[10px] uppercase | Small gray text |

### Card Styling

```css
/* Base card */
.stat-card {
  @apply bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4;
}

/* Hero card (PPG) */
.stat-card-hero {
  @apply bg-gradient-to-br from-zinc-900 to-zinc-950
         border-zinc-700 p-6 lg:p-8;
}

/* Rank badge - Top 10 */
.rank-badge-top {
  @apply text-emerald-400 font-medium;
}

/* Rank badge - Normal */
.rank-badge {
  @apply text-zinc-500 text-sm;
}
```

---

## Database Query

```sql
-- Get player stats with league-wide rankings
WITH player_season_stats AS (
  SELECT
    pgs.player_id,
    COUNT(pgs.game_id) as games_played,
    ROUND(AVG(pgs.points)::numeric, 1) as ppg,
    ROUND(AVG(pgs.rebounds)::numeric, 1) as rpg,
    ROUND(AVG(pgs.assists)::numeric, 1) as apg,
    ROUND(AVG(pgs.steals)::numeric, 1) as spg,
    ROUND(AVG(pgs.blocks)::numeric, 1) as bpg,
    ROUND((SUM(pgs.field_goals_made)::float /
           NULLIF(SUM(pgs.field_goals_attempted), 0) * 100)::numeric, 1) as fg_pct,
    ROUND((SUM(pgs.three_pointers_made)::float /
           NULLIF(SUM(pgs.three_pointers_attempted), 0) * 100)::numeric, 1) as three_pct,
    ROUND((SUM(pgs.free_throws_made)::float /
           NULLIF(SUM(pgs.free_throws_attempted), 0) * 100)::numeric, 1) as ft_pct,
    ROUND(AVG(pgs.minutes)::numeric, 1) as mpg,
    ROUND(AVG(pgs.turnovers)::numeric, 1) as tov
  FROM player_game_stats pgs
  JOIN games g ON pgs.game_id = g.game_id
  WHERE g.season = $2
  GROUP BY pgs.player_id
  HAVING COUNT(pgs.game_id) >= 5  -- Minimum games for ranking
),
ranked_stats AS (
  SELECT
    *,
    RANK() OVER (ORDER BY ppg DESC) as ppg_rank,
    RANK() OVER (ORDER BY rpg DESC) as rpg_rank,
    RANK() OVER (ORDER BY apg DESC) as apg_rank,
    RANK() OVER (ORDER BY spg DESC) as spg_rank,
    RANK() OVER (ORDER BY bpg DESC) as bpg_rank,
    RANK() OVER (ORDER BY fg_pct DESC NULLS LAST) as fg_pct_rank,
    RANK() OVER (ORDER BY three_pct DESC NULLS LAST) as three_pct_rank,
    RANK() OVER (ORDER BY ft_pct DESC NULLS LAST) as ft_pct_rank,
    RANK() OVER (ORDER BY mpg DESC) as mpg_rank,
    RANK() OVER (ORDER BY tov ASC) as tov_rank,  -- Lower is better
    COUNT(*) OVER () as total_players
  FROM player_season_stats
)
SELECT * FROM ranked_stats WHERE player_id = $1;
```

---

## Implementation Steps

### Phase 1: Database Query
1. Add `getPlayerStatsWithRankings()` function to `queries.ts`
2. Test query returns correct data and rankings

### Phase 2: Components
1. Create `StatCard.tsx` component
2. Create `PlayerStatsBento.tsx` container
3. Export from `index.ts`

### Phase 3: Integration
1. Update player detail page to fetch ranked stats
2. Add bento section after hero (Section 02)
3. Rename calendar to Section 03

### Phase 4: Styling & Polish
1. Add responsive breakpoints
2. Fine-tune spacing and typography
3. Add hover states and transitions
4. Test on mobile devices

---

## Section Numbering Update

| Current | New | Component |
|---------|-----|-----------|
| 01 | 01 | Hero (Player Name, Team, Position) |
| - | **02** | **Traditional Stats Bento (NEW)** |
| 01.5 | 03 | Game Presence Calendar |
| - | **04** | **Gamelogs Table (NEW)** |
| 02 | 05 | The Pulse (Quick Stats) |
| 03 | 06 | Statistical Breakdown |
| 04 | 07 | Recent Games |

---

## Gamelogs Table (Section 04)

### Overview
Traditional stats table showing game-by-game performance. Positioned directly after the Game Presence Calendar for logical flow: calendar provides visual overview → table provides detailed breakdown.

### Columns

| Column | Label | Format | Notes |
|--------|-------|--------|-------|
| DATE | Date | MMM DD | e.g., "Dec 23" |
| OPP | Opponent | @XXX / vs XXX | Away/Home indicator |
| RESULT | Result | W/L Score | e.g., "W 112-108" |
| MIN | Minutes | XX | Integer |
| PTS | Points | XX | Integer |
| REB | Rebounds | XX | Total (OREB+DREB) |
| AST | Assists | XX | Integer |
| STL | Steals | X | Integer |
| BLK | Blocks | X | Integer |
| TOV | Turnovers | X | Integer |
| FG | Field Goals | X-XX | Made-Attempted |
| 3P | Three Pointers | X-XX | Made-Attempted |
| FT | Free Throws | X-XX | Made-Attempted |
| +/- | Plus/Minus | ±XX | Colored (green/red) |

### Mobile Layout (375px)

```
╔═══════════════════════════════════════════════════════════════╗
║                    ███╗   ███╗ ██████╗  ██████╗██╗  ██╗       ║
║                    ████╗ ████║██╔═══██╗██╔════╝██║ ██╔╝       ║
║                    ██╔████╔██║██║   ██║██║     █████╔╝        ║
║                    ██║╚██╔╝██║██║   ██║██║     ██╔═██╗        ║
║                    ██║ ╚═╝ ██║╚██████╔╝╚██████╗██║  ██╗       ║
║                    ╚═╝     ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝       ║
║                         MOBILE - 375px                        ║
╚═══════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────┐
│ 04 ─────────────────────────────────│
│ GAME LOG                 2025-26    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Horizontal scroll →             │ │
│ ├────┬─────┬───┬───┬───┬───┬─────┤ │
│ │DATE│ OPP │PTS│REB│AST│+/-│ ... │ │
│ ├────┼─────┼───┼───┼───┼───┼─────┤ │
│ │D23 │@PHX │ 23│  5│  8│ -3│     │ │
│ │D20 │@LAC │ 36│  4│  5│ -8│     │ │
│ │D18 │vsUTA│ 28│  6│  9│+12│     │ │
│ │D15 │vsPHX│ 26│  7│  6│ +5│     │ │
│ │D10 │@SAS │ 19│  4│  7│ -6│     │ │
│ │D07 │vsPHI│ 29│  5│  8│+15│     │ │
│ │D05 │ DNP │ - │ - │ - │ - │     │ │
│ │D04 │vsTOR│  8│  3│  4│ +2│     │ │
│ │... │ ... │...│...│...│...│     │ │
│ └────┴─────┴───┴───┴───┴───┴─────┘ │
│                                     │
│ Showing 10 of 29 games    [See All] │
└─────────────────────────────────────┘
```

**Mobile Behavior:**
- Horizontal scroll for full stats
- Fixed first 2 columns (DATE, OPP)
- Sticky header row
- DNP games shown with dash values
- "See All" expands to full list

### Desktop Layout (1280px+)

```
╔════════════════════════════════════════════════════════════════════════════════════════════════════╗
║              ███╗   ███╗ ██████╗  ██████╗██╗  ██╗██╗   ██╗██████╗                                   ║
║              ████╗ ████║██╔═══██╗██╔════╝██║ ██╔╝██║   ██║██╔══██╗                                  ║
║              ██╔████╔██║██║   ██║██║     █████╔╝ ██║   ██║██████╔╝                                  ║
║              ██║╚██╔╝██║██║   ██║██║     ██╔═██╗ ██║   ██║██╔═══╝                                   ║
║              ██║ ╚═╝ ██║╚██████╔╝╚██████╗██║  ██╗╚██████╔╝██║                                       ║
║              ╚═╝     ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝                                       ║
║                                        DESKTOP - 1280px+                                           ║
╚════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 04 ─────────────────────────────────────────────────────────────────────────────────────────────── │
│ GAME LOG                                                                        Season 2025-26     │
│                                                                                                    │
│ ┌────────┬─────────┬───────────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬───────┬───────┬───────┐ │
│ │  DATE  │   OPP   │  RESULT   │ MIN │ PTS │ REB │ AST │ STL │ BLK │ TOV │  FG   │  3P   │  +/-  │ │
│ ├────────┼─────────┼───────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼───────┼───────┼───────┤ │
│ │ Dec 23 │  @PHX   │ L 108-117 │  35 │  23 │   5 │   8 │   1 │   0 │   4 │  8-18 │  2-6  │   -3  │ │
│ │ Dec 20 │  @LAC   │ L 112-116 │  38 │  36 │   4 │   5 │   2 │   1 │   3 │ 12-22 │  4-9  │   -8  │ │
│ │ Dec 18 │  vsUTA  │ W 124-112 │  32 │  28 │   6 │   9 │   0 │   0 │   2 │ 10-17 │  3-7  │  +12  │ │
│ │ Dec 15 │  vsPHX  │ W 115-110 │  34 │  26 │   7 │   6 │   1 │   1 │   3 │  9-19 │  2-5  │   +5  │ │
│ │ Dec 10 │  @SAS   │ L 105-111 │  36 │  19 │   4 │   7 │   0 │   0 │   4 │  7-16 │  1-4  │   -6  │ │
│ │ Dec 07 │  vsPHI  │ W 118-103 │  30 │  29 │   5 │   8 │   2 │   0 │   1 │ 11-18 │  3-6  │  +15  │ │
│ │ Dec 05 │  @BOS   │    DNP    │  -  │  -  │  -  │  -  │  -  │  -  │  -  │   -   │   -   │   -   │ │
│ │ Dec 04 │  vsTOR  │ W 110-108 │  28 │   8 │   3 │   4 │   1 │   0 │   2 │  3-10 │  1-4  │   +2  │ │
│ │ Dec 01 │  @PHX   │ L 98-105  │  33 │  10 │   4 │   5 │   0 │   0 │   3 │  4-14 │  0-3  │   -7  │ │
│ │ Nov 30 │  vsNOP  │    DNP    │  -  │  -  │  -  │  -  │  -  │  -  │  -  │   -   │   -   │   -   │ │
│ └────────┴─────────┴───────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴───────┴───────┴───────┘ │
│                                                                                                    │
│                                                              Showing 10 of 29 games    [View All]  │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
frontend/src/components/player/
├── PlayerGamelogsTable.tsx   # NEW - Main gamelogs table
├── PlayerStatsBento.tsx
├── StatCard.tsx
├── PlayerPresenceCalendar.tsx
└── index.ts                  # UPDATE - Add export
```

### PlayerGamelogsTable Props

```typescript
interface GamelogEntry {
  game_id: string
  game_date: string
  opponent: string
  is_home: boolean
  result: 'W' | 'L'
  team_score: number
  opponent_score: number
  played: boolean
  minutes?: number
  points?: number
  rebounds?: number
  assists?: number
  steals?: number
  blocks?: number
  turnovers?: number
  fg_made?: number
  fg_attempted?: number
  three_made?: number
  three_attempted?: number
  ft_made?: number
  ft_attempted?: number
  plus_minus?: number
}

interface PlayerGamelogsTableProps {
  gamelogs: GamelogEntry[]
  initialLimit?: number      // Default: 10
  showAllDefault?: boolean   // Default: false
}
```

### Visual Specifications

| Element | Style |
|---------|-------|
| Header row | `bg-zinc-900 text-zinc-400 text-xs uppercase` |
| Data rows | `bg-zinc-950 hover:bg-zinc-900/50 border-b border-zinc-800` |
| DNP rows | `text-zinc-600 italic` |
| +/- positive | `text-emerald-400` |
| +/- negative | `text-red-400` |
| Win result | `text-emerald-400` |
| Loss result | `text-red-400` |
| Font | `font-mono text-sm` for numbers |

### Database Query

```sql
SELECT
  g.game_id,
  g.game_date,
  CASE WHEN g.home_team_id = pt.team_id THEN false ELSE true END as is_away,
  opp.abbreviation as opponent,
  CASE
    WHEN g.home_team_id = pt.team_id THEN g.home_team_score
    ELSE g.away_team_score
  END as team_score,
  CASE
    WHEN g.home_team_id = pt.team_id THEN g.away_team_score
    ELSE g.home_team_score
  END as opponent_score,
  CASE WHEN pgs.player_id IS NOT NULL THEN true ELSE false END as played,
  pgs.minutes,
  pgs.points,
  pgs.rebounds,
  pgs.assists,
  pgs.steals,
  pgs.blocks,
  pgs.turnovers,
  pgs.field_goals_made,
  pgs.field_goals_attempted,
  pgs.three_pointers_made,
  pgs.three_pointers_attempted,
  pgs.free_throws_made,
  pgs.free_throws_attempted,
  pgs.plus_minus
FROM (
  SELECT DISTINCT pgs.team_id
  FROM player_game_stats pgs
  JOIN games g ON pgs.game_id = g.game_id
  WHERE pgs.player_id = $1 AND g.season = $2
  ORDER BY pgs.team_id DESC LIMIT 1
) pt
CROSS JOIN games g
LEFT JOIN player_game_stats pgs ON g.game_id = pgs.game_id AND pgs.player_id = $1
JOIN teams opp ON opp.team_id = CASE
  WHEN g.home_team_id = pt.team_id THEN g.away_team_id
  ELSE g.home_team_id
END
WHERE g.season = $2
  AND (g.home_team_id = pt.team_id OR g.away_team_id = pt.team_id)
  AND g.game_date <= CURRENT_DATE
ORDER BY g.game_date DESC;
```

### Implementation Steps

**Phase 5: Gamelogs Table**
1. Add `getPlayerGamelogs()` function to `queries.ts`
2. Create `PlayerGamelogsTable.tsx` component
3. Add horizontal scroll with sticky columns (mobile)
4. Add expand/collapse functionality
5. Style DNP rows and +/- coloring
6. Export from `index.ts`
7. Integrate into player detail page after calendar

---

## Validation Checklist

### Bento Grid (Section 02)
- [ ] Mobile wireframe approved
- [ ] Desktop wireframe approved
- [ ] Stats selection approved (PPG, RPG, APG, etc.)
- [ ] Ranking display format approved (#X in NBA)

### Gamelogs Table (Section 04)
- [ ] Mobile wireframe approved (horizontal scroll, sticky columns)
- [ ] Desktop wireframe approved (full table layout)
- [ ] Columns selection approved (14 columns)
- [ ] DNP display format approved (dash values, italic)
- [ ] +/- coloring approved (green/red)

### General
- [x] Component architecture approved
- [x] Section ordering approved (02: Bento → 03: Calendar → 05: Gamelogs)

---

## Implementation Complete

### Files Created
- `frontend/src/components/player/StatCard.tsx` - Reusable stat card with 4 sizes (hero, large, medium, small)
- `frontend/src/components/player/PlayerStatsBento.tsx` - Bento grid container for traditional stats
- `frontend/src/components/player/PlayerGamelogsTable.tsx` - Horizontal scroll game log table

### Files Modified
- `frontend/src/components/player/index.ts` - Added exports for new components and types
- `frontend/src/lib/queries.ts` - Added `getPlayerStatsWithRankings()` and `getPlayerGamelogs()` functions
- `frontend/src/app/(dashboard)/players/[playerId]/page.tsx` - Integrated new components:
  - Section 02: PlayerStatsBento (replaced "The Pulse")
  - Section 05: PlayerGamelogsTable (replaced old game log)

### Features Implemented
- **Bento Grid**: Asymmetric layout with PPG hero card, shooting efficiency combined card
- **League-Wide Rankings**: PostgreSQL RANK() OVER window functions for all stats
- **Top-10 Highlighting**: Emerald accent color for players ranked in top 10
- **Lower-Is-Better**: TOV ranking inverted (lower rank = better)
- **Horizontal Scroll Table**: Mobile-friendly with sticky DATE and OPP columns
- **DNP Handling**: Graceful display of games not played
- **+/- Coloring**: Emerald for positive, red for negative
- **View All Toggle**: Expand/collapse for game list

### Build Verification
- TypeScript compilation: ✅ Passed
- Static page generation: ✅ 75/75 pages generated
- No errors in build output
