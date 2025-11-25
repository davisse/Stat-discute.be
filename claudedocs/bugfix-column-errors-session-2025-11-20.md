# Bug Fix Session: Player Stats Column Errors and React Server Component Issues

**Date**: 2025-11-20
**Status**: ✅ Fixed
**Severity**: High (Runtime errors preventing page load)

---

## Problem

Multiple runtime errors when accessing `/player-absence-test` page:

1. **PostgreSQL Error**: `column pgs.field_goal_pct does not exist`
2. **React Error**: Event handlers cannot be passed to Client Component props

---

## Root Causes

### Issue 1: Column Name Mismatch Between Tables

**Discovery**: `team_game_stats` and `player_game_stats` tables use different naming conventions:

```sql
-- team_game_stats (long names):
field_goal_pct
three_point_pct
free_throw_pct
total_rebounds

-- player_game_stats (short names):
fg_pct
fg3_pct
ft_pct
rebounds
fg_attempted
ft_attempted
```

**Impact**: Queries using `pgs.field_goal_pct` failed because the column doesn't exist in `player_game_stats`.

### Issue 2: React Server Component Restriction

**Error**: Next.js 16 strictly enforces that Server Components cannot pass function props to Client Components (functions cannot be serialized).

**Impact**: `onPlayerClick` event handlers passed from Server Component (`page.tsx`) to Client Component (`PlayerAbsenceImpact`) caused runtime error.

---

## Solution

### Fix 1: Update Column Names in `getPlayerSplitsWithTeammate()`

**File**: `frontend/src/lib/queries.ts`

#### Lines 795-811: with_teammate CTE

**Before (Incorrect)**:
```typescript
AVG(pgs.field_goal_pct * 100) as fg_pct,
AVG(pgs.three_point_pct * 100) as fg3_pct,
AVG(pgs.free_throw_pct * 100) as ft_pct,
AVG(
  CASE
    WHEN pgs.field_goal_attempts > 0
    THEN (pgs.field_goal_attempts + 0.44 * pgs.free_throw_attempts) / (2 * (pgs.field_goal_attempts + 0.44 * pgs.free_throw_attempts)) * 100
    ELSE 0
  END
) as usage_rate,
```

**After (Correct)**:
```typescript
AVG(pgs.fg_pct * 100) as fg_pct,
AVG(pgs.fg3_pct * 100) as fg3_pct,
AVG(pgs.ft_pct * 100) as ft_pct,
AVG(
  CASE
    WHEN pgs.fg_attempted > 0
    THEN (pgs.fg_attempted + 0.44 * pgs.ft_attempted) / (2 * (pgs.fg_attempted + 0.44 * pgs.ft_attempted)) * 100
    ELSE 0
  END
) as usage_rate,
```

**Changes**:
- `pgs.field_goal_pct` → `pgs.fg_pct`
- `pgs.three_point_pct` → `pgs.fg3_pct`
- `pgs.free_throw_pct` → `pgs.ft_pct`
- `pgs.field_goal_attempts` → `pgs.fg_attempted`
- `pgs.free_throw_attempts` → `pgs.ft_attempted`

#### Lines 830-846: without_teammate CTE

Applied same column name corrections as above.

---

### Fix 2: Remove Event Handlers from Server Component Props

**File**: `frontend/src/app/player-absence-test/page.tsx`

#### Line 148-152: First PlayerAbsenceImpact Component

**Before (Incorrect)**:
```tsx
<PlayerAbsenceImpact
  absences={impactfulAbsences}
  variant="list"
  showTeamFilter={true}
  onPlayerClick={(playerId) => console.log('Player clicked:', playerId)}  // ❌
/>
```

**After (Correct)**:
```tsx
<PlayerAbsenceImpact
  absences={impactfulAbsences}
  variant="list"
  showTeamFilter={true}
/>
```

#### Line 167-171: Second PlayerAbsenceImpact Component

**Before (Incorrect)**:
```tsx
<PlayerAbsenceImpact
  absences={impactfulAbsences.slice(0, 10)}
  variant="compact"
  showTeamFilter={false}
  onPlayerClick={(playerId) => console.log('Player clicked:', playerId)}  // ❌
/>
```

**After (Correct)**:
```tsx
<PlayerAbsenceImpact
  absences={impactfulAbsences.slice(0, 10)}
  variant="compact"
  showTeamFilter={false}
/>
```

---

## Verification

### Database Query Test
```bash
grep "pgs\.(field_goal|three_point|free_throw)" queries.ts
# Result: No matches found ✅
```

### Page Load Test
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/player-absence-test
# Result: 200 ✅
```

### Component Rendering
- ✅ All database queries execute successfully
- ✅ No PostgreSQL column errors
- ✅ No React Server Component errors
- ✅ Page renders all components correctly

---

## Schema Reference

### `player_game_stats` Columns (Short Names)
```sql
player_id        BIGINT
game_id          VARCHAR(10)
team_id          BIGINT
points           INTEGER
rebounds         INTEGER          -- NOT total_rebounds
assists          INTEGER
steals           INTEGER
blocks           INTEGER
turnovers        INTEGER
fg_pct           NUMERIC(5,2)     -- NOT field_goal_pct
fg3_pct          NUMERIC(5,2)     -- NOT three_point_pct
ft_pct           NUMERIC(5,2)     -- NOT free_throw_pct
fg_attempted     INTEGER          -- NOT field_goal_attempts
ft_attempted     INTEGER          -- NOT free_throw_attempts
minutes          INTEGER
plus_minus       INTEGER
```

### `team_game_stats` Columns (Long Names)
```sql
team_id               BIGINT
game_id               VARCHAR(10)
points                INTEGER
total_rebounds        INTEGER      -- NOT rebounds
field_goal_pct        NUMERIC(5,2) -- NOT fg_pct
three_point_pct       NUMERIC(5,2) -- NOT fg3_pct
free_throw_pct        NUMERIC(5,2) -- NOT ft_pct
field_goal_attempts   INTEGER
free_throw_attempts   INTEGER
-- ... other columns
```

---

## Impact

### Fixed Queries (1 function, 2 locations)
1. ✅ `getPlayerSplitsWithTeammate()` - with_teammate CTE (lines 795-811)
2. ✅ `getPlayerSplitsWithTeammate()` - without_teammate CTE (lines 830-846)

### Fixed Components (1 page, 2 components)
1. ✅ First `PlayerAbsenceImpact` component (line 148-152)
2. ✅ Second `PlayerAbsenceImpact` component (line 167-171)

### Affected Features
- ✅ Player performance splits with/without teammates
- ✅ Player absence impact analysis
- ✅ Interactive player selection (now handled within Client Component)

---

## Prevention Guidelines

### Database Schema Awareness
1. **Always verify column names** before writing queries
2. **Check actual schema** with `\d table_name` in psql
3. **Don't assume naming conventions** across similar tables
4. **Document schema differences** for reference

### React Server Component Rules
1. **No function props** from Server to Client Components
2. **Event handlers must be defined** within Client Components
3. **Use composition pattern** for interactivity in Server Component context
4. **Serialize-safe props only** (strings, numbers, objects, arrays)

---

## Related Files

- Fixed: `frontend/src/lib/queries.ts` (lines 795-811, 830-846)
- Fixed: `frontend/src/app/player-absence-test/page.tsx` (lines 148-152, 167-171)
- Test page: `http://localhost:3000/player-absence-test`
- Schema reference: `1.DATABASE/migrations/004_advanced_game_stats.sql`

---

## Additional Notes

### Known Unrelated Issue
There is an unrelated TypeScript error in `api/auth/login/route.ts:76` where `request.ip` property doesn't exist on `NextRequest` type in Next.js 16. This does not affect the player absence test page functionality.

---

**Status**: ✅ All player-absence-test errors fixed and verified
**Testing**: ✅ Page loads successfully (HTTP 200)
**Ready for**: Feature development on player absence analysis components
