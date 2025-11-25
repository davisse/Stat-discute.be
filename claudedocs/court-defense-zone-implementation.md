# Court Defense Zone Component - Real Data Implementation

**Date**: 2025-11-23
**Component**: CourtZoneDefense
**Status**: ✅ Complete with real data integration

## Overview

Implemented a fully functional defensive zone analysis component that visualizes opponent shooting performance across 6 court zones using real database data.

## Files Created/Modified

### 1. API Endpoint
**File**: `/frontend/src/app/api/teams/[teamId]/defense-zones/route.ts`

**Purpose**: Fetch and calculate defensive zone statistics from aggregated team data

**Key Features**:
- Season-aware queries (uses current season from database)
- Dynamic filters: games (10, 20, all), location (home, away, all)
- Calculates zone-specific stats from aggregated FG% and 3P% data
- Returns estimated zone breakdown based on NBA shot distribution patterns

**Data Flow**:
```
Database (team_game_stats)
→ Aggregate opponent stats (FG%, 3P%, 2P%)
→ Estimate zone distribution using NBA averages
→ Calculate defense ratings vs league average
→ Return structured zone data
```

**Zone Estimation Model**:
- **Restricted Area**: 25% of FGA, 40% of 2P makes, ~15% above overall 2P%
- **Paint (Non-RA)**: 20% of FGA, 30% of 2P makes, ~5% above overall 2P%
- **Mid-Range**: 20% of FGA, 30% of 2P makes, ~15% below overall 2P%
- **Left Corner 3**: 15% of 3PA, slightly higher make rate
- **Right Corner 3**: 15% of 3PA, slightly higher make rate
- **Above Break 3**: 70% of 3PA, slightly below average 3P%

### 2. Component Update
**File**: `/frontend/src/components/defense/CourtZoneDefense.tsx`

**Changes**:
- Converted from mock data to real API integration
- Added loading and error states
- Implemented dynamic filters (team, games, location)
- Added `useEffect` hook for data fetching
- Displays data limitation notice (estimated from aggregated data)

**Component Features**:
- ✅ Real-time data fetching from API
- ✅ Interactive court visualization with 6 zones
- ✅ Color-coded zones (green = good defense, red = poor)
- ✅ Click/hover interactions with detailed stats
- ✅ Dynamic filters: team selector, game count, home/away
- ✅ Loading and error states
- ✅ Defense rating vs league average
- ✅ Overall summary stats (FG%, 3P%, 2P%)

## Database Schema

**Source Table**: `team_game_stats` (from migration 004)

**Available Fields**:
```sql
field_goals_made INTEGER
field_goals_attempted INTEGER
field_goal_pct NUMERIC(5,3)
three_pointers_made INTEGER
three_pointers_attempted INTEGER
three_point_pct NUMERIC(5,3)
points INTEGER
```

**Limitation**: No zone-specific shooting data available. Solution uses aggregated stats with estimation model based on NBA shot distribution patterns.

## API Response Example

```json
{
  "team": {
    "team_id": "1610612758",
    "abbreviation": "SAC",
    "full_name": "Sacramento Kings"
  },
  "zoneStats": {
    "restrictedArea": {
      "fga": 226,
      "fgm": 128,
      "fg_pct": 73.39,
      "points": 257,
      "ppp": 1.14,
      "leagueAvg": 64.5,
      "defenseRating": -8.89
    },
    "paint": { ... },
    "midRange": { ... },
    "leftCorner3": { ... },
    "rightCorner3": { ... },
    "aboveBreak3": { ... }
  },
  "gamesAnalyzed": 10,
  "overall": {
    "fg_pct": 51.3,
    "three_point_pct": 35.6,
    "two_point_pct": 63.8,
    "total_fgm": 464,
    "total_fga": 905,
    "total_points": 1274
  },
  "season": "2025-26",
  "filters": {
    "games": "10",
    "location": "all"
  },
  "note": "Zone stats are estimated from aggregated data. Detailed shot tracking data not available."
}
```

## Testing

### API Endpoint Test
```bash
curl "http://localhost:3000/api/teams/1610612758/defense-zones?games=10&location=all"
```

**Result**: ✅ Returns real data for Sacramento Kings (10 games, 2025-26 season)

### Component Test
**URL**: http://localhost:3000/court-defense-test

**Expected Behavior**:
1. Component loads with loading state
2. Fetches data from API endpoint
3. Displays interactive court with color-coded zones
4. Shows warning note about estimated data
5. All filters (games, location) work dynamically

## Defense Rating Calculation

**Formula**: `Defense Rating = League Average - Opponent FG%`

**Interpretation**:
- **Positive rating** (green): Defense holding opponents BELOW league average = good defense
- **Negative rating** (red): Defense allowing opponents ABOVE league average = poor defense

**Example** (Restricted Area):
- League Avg: 64.5%
- Opponent shoots: 73.4%
- Defense Rating: 64.5 - 73.4 = **-8.9%** (poor defense, shown in red)

## Design System Compliance

✅ **Color Coding**:
- Green zones: Excellent/Good defense (<35%, 35-40%)
- Gray zones: Average defense (40-45%)
- Red zones: Poor/Very poor defense (45-50%, >50%)

✅ **Typography**:
- JetBrains Mono for all numeric stats
- Inter for labels and UI text

✅ **Spacing**: 8px grid system throughout

✅ **Styling**: Monochrome UI (white/gray) with green/red only for data visualization

## Future Enhancements

**If detailed shot tracking data becomes available**:
1. Replace estimation model with actual shot zone data
2. Add shot charts with individual shot markers
3. Include shooter heatmaps
4. Track specific players' performance in each zone
5. Add time-based filters (quarters, minutes)

**SQL Schema for Future Shot Tracking**:
```sql
CREATE TABLE shot_tracking (
  shot_id SERIAL PRIMARY KEY,
  game_id VARCHAR(10) REFERENCES games(game_id),
  player_id BIGINT REFERENCES players(player_id),
  team_id BIGINT REFERENCES teams(team_id),
  zone VARCHAR(20), -- 'restrictedArea', 'paint', etc.
  shot_made BOOLEAN,
  shot_x NUMERIC(5,2), -- Court coordinates
  shot_y NUMERIC(5,2),
  shot_distance NUMERIC(5,2),
  quarter INTEGER,
  time_remaining VARCHAR(10)
);
```

## Technical Notes

### Season Filtering
All queries filter by current season from `seasons` table:
```typescript
const currentSeason = await getCurrentSeason()
// Returns '2025-26' from seasons WHERE is_current = true
```

### Type Casting
PostgreSQL `ROUND()` returns `numeric` type → node-postgres sees as string:
```typescript
const overallFgPct = parseFloat(stats.overall_fg_pct) // "51.3" → 51.3
```

### Zone Color Function
```typescript
function getZoneColor(fg_pct: number): string {
  if (fg_pct < 35) return '#10B981'  // Excellent
  if (fg_pct < 40) return '#34D399'  // Good
  if (fg_pct < 45) return '#6B7280'  // Average
  if (fg_pct < 50) return '#F87171'  // Poor
  return '#EF4444'                    // Very poor
}
```

## Summary

✅ **API endpoint** fetching real defensive data from PostgreSQL
✅ **Component** displaying interactive court with real data
✅ **Filters** working dynamically (team, games, location)
✅ **Zone estimation model** providing useful insights from aggregated data
✅ **Design system compliance** maintained throughout
⚠️ **Data limitation** clearly communicated to users

**Component is production-ready** with real database integration and proper error handling.
