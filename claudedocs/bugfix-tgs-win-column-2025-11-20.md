# Bug Fix: team_game_stats.win Column Does Not Exist

**Date**: 2025-11-20
**Status**: ✅ Fixed
**Severity**: High (Runtime error preventing page load)

---

## Problem

Runtime error when accessing `/player-absence-test` page:
```
column tgs.win does not exist
```

**Root Cause**: The `team_game_stats` table does not have a `win` boolean column. The schema only includes game statistics (points, rebounds, etc.) but not the win/loss result.

---

## Solution

Calculate wins/losses dynamically by comparing scores from the `games` table:

### Win Logic
A team wins if:
- **(Home team)** `home_team_score > away_team_score`
- **(Away team)** `away_team_score > home_team_score`

### SQL Pattern
```sql
CASE
  WHEN (g.home_team_id = team_id AND g.home_team_score > g.away_team_score) OR
       (g.away_team_id = team_id AND g.away_team_score > g.home_team_score)
  THEN 1  -- Win
  ELSE 0  -- Loss
END
```

---

## Files Modified

### `frontend/src/lib/queries.ts`

#### Fixed Query 1: `getTeamSplitsWithPlayer()` - Lines 609-681

**Before (Incorrect)**:
```sql
SUM(CASE WHEN tgs.team_id = $1 AND tgs.win = true THEN 1 ELSE 0 END) as wins
```

**After (Correct)**:
```sql
SUM(CASE
  WHEN tgs.team_id = $1 AND (
    (g.home_team_id = $1 AND g.home_team_score > g.away_team_score) OR
    (g.away_team_id = $1 AND g.away_team_score > g.home_team_score)
  ) THEN 1
  ELSE 0
END) as wins
```

#### Fixed Query 2: `getMostImpactfulAbsences()` - Lines 938-981

**Changes**:
1. **absence_impact CTE** (Lines 945-954): Calculate wins/losses for games player missed
2. **team_baseline CTE** (Lines 970-974): Calculate team's overall win percentage

**Before (Incorrect)**:
```sql
SUM(CASE WHEN tgs.win = true THEN 1 ELSE 0 END) as wins_without
```

**After (Correct)**:
```sql
SUM(CASE
  WHEN (g.home_team_id = pgp.team_id AND g.home_team_score > g.away_team_score) OR
       (g.away_team_id = pgp.team_id AND g.away_team_score > g.home_team_score)
  THEN 1 ELSE 0
END) as wins_without
```

#### Fixed Query 3: `getPlayerAbsenceTimeline()` - Lines 1024-1029

**Before (Incorrect)**:
```sql
CASE
  WHEN tgs.win = true THEN 'W'
  ELSE 'L'
END as team_result
```

**After (Correct)**:
```sql
CASE
  WHEN (g.home_team_id = pgp.team_id AND g.home_team_score > g.away_team_score) OR
       (g.away_team_id = pgp.team_id AND g.away_team_score > g.home_team_score)
  THEN 'W'
  ELSE 'L'
END as team_result
```

---

## Verification

### Test Query
```sql
SELECT
  COUNT(*) as test_count,
  SUM(CASE
    WHEN (g.home_team_id = tgs.team_id AND g.home_team_score > g.away_team_score) OR
         (g.away_team_id = tgs.team_id AND g.away_team_score > g.home_team_score)
    THEN 1 ELSE 0
  END) as wins
FROM team_game_stats tgs
JOIN games g ON tgs.game_id = g.game_id
WHERE g.season = '2025-26' AND g.game_status = 'Final';
```

**Result**:
```
test_count | wins
-----------+------
       398 |  199
```

**Validation**: ✅ Correct
- 398 total records = 199 games × 2 teams
- 199 wins = exactly 1 winner per game

---

## Impact

### Fixed Queries (4 total)
1. ✅ `getTeamSplitsWithPlayer()` - 2 occurrences (with_player CTE, without_player CTE)
2. ✅ `getMostImpactfulAbsences()` - 2 occurrences (absence_impact CTE, team_baseline CTE)
3. ✅ `getPlayerAbsenceTimeline()` - 1 occurrence (team_result calculation)

### Affected Components
- ✅ `PlayerAbsenceImpact` - Now displays correct win/loss records
- ✅ `TeamPerformanceWithoutPlayer` - Now shows accurate team splits
- ✅ `PlayerPerformanceWithoutTeammate` - Impact metrics now correct

---

## Database Schema Reference

### `games` table (relevant columns)
```sql
game_id           VARCHAR(10) PRIMARY KEY
home_team_id      BIGINT REFERENCES teams(team_id)
away_team_id      BIGINT REFERENCES teams(team_id)
home_team_score   INTEGER
away_team_score   INTEGER
game_status       VARCHAR(20) DEFAULT 'Scheduled'
```

### `team_game_stats` table (relevant columns)
```sql
id        INTEGER PRIMARY KEY
game_id   VARCHAR(10) REFERENCES games(game_id)
team_id   BIGINT REFERENCES teams(team_id)
points    INTEGER
-- NOTE: No 'win' column!
```

---

## Prevention

To prevent similar issues in the future:

1. **Schema Documentation**: Always verify column existence in schema before writing queries
2. **Migration Review**: Check existing migrations to understand table structure
3. **Test Queries**: Run SQL queries in psql before adding to TypeScript
4. **Type Safety**: Use Kysely or Prisma for compile-time SQL validation

---

## Related Files

- Fixed: `frontend/src/lib/queries.ts`
- Test page: `frontend/src/app/player-absence-test/page.tsx`
- Components using queries:
  - `frontend/src/components/player-props/PlayerAbsenceImpact.tsx`
  - `frontend/src/components/player-props/TeamPerformanceWithoutPlayer.tsx`
  - `frontend/src/components/player-props/PlayerPerformanceWithoutTeammate.tsx`

---

## Additional Fix: pgs.total_rebounds Column

**Date**: 2025-11-20 (same session)
**Error**: `column pgs.total_rebounds does not exist`

**Root Cause**: Schema mismatch between tables:
- `team_game_stats` has `total_rebounds` column ✅
- `player_game_stats` has only `rebounds` column ❌

**Files Modified**: `frontend/src/lib/queries.ts`
- Line 793: `getPlayerSplitsWithTeammate()` - with_teammate CTE
- Line 828: `getPlayerSplitsWithTeammate()` - without_teammate CTE

**Before (Incorrect)**:
```sql
AVG(pgs.total_rebounds) as rebounds_avg  -- ❌ Column doesn't exist
```

**After (Correct)**:
```sql
AVG(pgs.rebounds) as rebounds_avg  -- ✅ Correct column name
```

**Verification**:
```sql
SELECT COUNT(*) as test_count, AVG(pgs.rebounds) as avg_rebounds
FROM player_game_stats pgs
JOIN games g ON pgs.game_id = g.game_id
WHERE g.season = '2025-26';

-- Result: test_count=4950, avg_rebounds=3.94 ✅
```

---

**Status**: ✅ All column errors fixed and verified
**Testing**: ✅ SQL logic validated with real database
**Ready for**: Frontend testing at `http://localhost:3000/player-absence-test`
