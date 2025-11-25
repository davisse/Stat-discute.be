# Head-to-Head Matchup Analyzer - Database Queries Implementation

**Date**: 2025-11-25
**File**: `/frontend/src/lib/queries.ts`
**Lines Added**: 3177-3378 (202 lines)

## Summary

Added three new query functions to support the Head-to-Head Matchup Analyzer component:

1. **getTeamsList()** - Get all teams for dropdown selection
2. **getTeamDetailedStats()** - Get comprehensive team statistics with recent form
3. **getHeadToHeadHistory()** - Get head-to-head game history between two teams

## Implementation Details

### 1. getTeamsList()

**Purpose**: Populate team selection dropdowns
**Returns**: Array of `{team_id, abbreviation, full_name}`
**Location**: Lines 3177-3187

```typescript
export async function getTeamsList(): Promise<{
  team_id: number,
  abbreviation: string,
  full_name: string
}[]>
```

**Query Strategy**:
- Simple SELECT from `teams` table
- Ordered alphabetically by `full_name`
- No season filtering needed (teams table is static)

---

### 2. getTeamDetailedStats()

**Purpose**: Get comprehensive team statistics including season averages and recent form
**Returns**: `TeamDetailedStats` interface or `null`
**Location**: Lines 3189-3334

```typescript
export interface TeamDetailedStats {
  team_id: number
  abbreviation: string
  full_name: string
  pace: number
  ppg: number
  opp_ppg: number
  ortg: number           // Offensive rating
  drtg: number           // Defensive rating
  avg_total: number      // Average game total
  stddev_total: number   // Standard deviation of totals
  min_total: number      // Lowest game total
  max_total: number      // Highest game total
  l3_ppg: number         // Last 3 games PPG
  l3_total: number       // Last 3 games total average
  l5_ppg: number         // Last 5 games PPG
  l5_total: number       // Last 5 games total average
  l10_ppg: number        // Last 10 games PPG
  l10_total: number      // Last 10 games total average
  games_played: number
}
```

**Query Strategy**:
- **Multi-CTE approach** for organized data processing:
  1. `team_games` - Get all games with row numbers (window function)
  2. `overall_stats` - Calculate season-long averages
  3. `recent_l3` - Last 3 games averages
  4. `recent_l5` - Last 5 games averages
  5. `recent_l10` - Last 10 games averages
  6. Final SELECT with LEFT JOINs and COALESCE for fallbacks

- **Window Function**: `ROW_NUMBER() OVER (PARTITION BY t.team_id ORDER BY g.game_date DESC)`
  - Orders games from most recent to oldest
  - Enables filtering by `rn <= N` for recent form

- **Season Filtering**: `WHERE g.season = $1` (current season from `getCurrentSeason()`)
- **Game Status**: `AND g.game_status = 'Final'` (only completed games)
- **Type Safety**: All numeric values use `parseFloat()` or `parseInt()` for PostgreSQL numeric type conversion

**Statistical Calculations**:
- **Pace**: Average possessions per game
- **ORTG/DRTG**: Offensive/Defensive rating from `team_game_stats`
- **STDDEV**: Standard deviation of game totals (volatility indicator)
- **Recent Form**: Uses window functions to partition last N games

---

### 3. getHeadToHeadHistory()

**Purpose**: Get historical matchups between two specific teams
**Returns**: Array of game results
**Location**: Lines 3336-3378

```typescript
export async function getHeadToHeadHistory(
  teamAId: number,
  teamBId: number
): Promise<{
  game_date: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  total: number
}[]>
```

**Query Strategy**:
- Joins `games` with `teams` (twice for home/away team names)
- Filters by current season and completed games
- **Bidirectional matching**: Handles both team orderings:
  ```sql
  WHERE (
    (g.home_team_id = $2 AND g.away_team_id = $3) OR
    (g.home_team_id = $3 AND g.away_team_id = $2)
  )
  ```
- Orders by `game_date DESC` (most recent first)
- Limits to 20 games (prevents huge result sets)

**Return Values**:
- Uses team abbreviations (e.g., "LAL", "BOS") for compact display
- Calculates total: `home_score + away_score`
- Type conversion: `parseInt()` for scores

---

## Following Project Patterns

### Season-Aware Queries ✅
All queries follow the **critical season filtering pattern**:
```typescript
const currentSeason = await getCurrentSeason()
// ... WHERE g.season = $1 ...
```

### PostgreSQL Numeric Type Handling ✅
All `ROUND()` results properly converted:
```typescript
pace: parseFloat(row.pace),        // numeric → string → number
games_played: parseInt(row.games_played)  // bigint → string → number
```

### Parameterized Queries ✅
All user inputs use parameter placeholders:
```sql
WHERE t.team_id = $2
WHERE g.season = $1
```

### Window Functions ✅
Follows existing patterns in `queries.ts`:
```sql
ROW_NUMBER() OVER (PARTITION BY t.team_id ORDER BY g.game_date DESC) as rn
```

### CTE Organization ✅
Complex queries use CTEs for clarity (matches `getTeamPaceRankings()` pattern)

---

## Database Tables Used

| Table | Purpose | Join Conditions |
|-------|---------|-----------------|
| `teams` | Team metadata | `team_id` primary key |
| `games` | Game schedule/scores | `season`, `game_status`, `home_team_id`, `away_team_id` |
| `team_game_stats` | Team box scores | `game_id`, `team_id` |
| `seasons` | Current season flag | `is_current = true` |

---

## Data Validation

### Edge Cases Handled:
1. **No games played**: Returns `null` for `getTeamDetailedStats()`
2. **Insufficient recent games**: COALESCE falls back to season averages
   - If team has <3 games, `l3_*` uses season averages
3. **No H2H history**: Returns empty array `[]`
4. **Type safety**: All numeric conversions prevent NaN issues

### Performance Considerations:
- **Indexes utilized** (from migration 007):
  - `games(season, game_status)` - filters final games by season
  - `games(home_team_id, away_team_id)` - H2H lookups
  - `team_game_stats(game_id, team_id)` - join optimization
- **Row limits**: H2H capped at 20 games to prevent large result sets
- **Window function efficiency**: Partition by team_id for optimal performance

---

## Example Usage

```typescript
// Get teams for dropdown
const teams = await getTeamsList()
// Returns: [{team_id: 1610612738, abbreviation: 'BOS', full_name: 'Boston Celtics'}, ...]

// Get detailed stats for a team
const stats = await getTeamDetailedStats(1610612738)
// Returns: {pace: 98.5, ppg: 112.3, l3_ppg: 115.2, ...}

// Get head-to-head history
const h2h = await getHeadToHeadHistory(1610612738, 1610612747)
// Returns: [{game_date: '2025-11-15', home_team: 'BOS', away_team: 'LAL', ...}]
```

---

## Testing Checklist

- [x] TypeScript interfaces exported
- [x] Season filtering applied to all queries
- [x] Parameterized queries (SQL injection protection)
- [x] Type conversions for PostgreSQL numeric types
- [x] Window functions syntax correct
- [x] CTE structure valid
- [x] NULL handling with COALESCE
- [x] Edge case returns (empty arrays, null values)
- [ ] Integration test with Next.js API route
- [ ] Database query execution verification

---

## Next Steps

1. **Create API routes** in `frontend/src/app/api/`:
   - `/api/teams` → calls `getTeamsList()`
   - `/api/teams/[id]/stats` → calls `getTeamDetailedStats()`
   - `/api/teams/h2h` → calls `getHeadToHeadHistory()`

2. **Build React component** consuming these APIs

3. **Test with real data**:
   ```bash
   psql nba_stats -c "SELECT team_id FROM teams LIMIT 2"
   # Use those IDs to test queries
   ```
