# Starter Data Implementation Plan

**Created**: 2025-11-23
**Status**: Planning Complete - Awaiting Validation
**Objective**: Add starter/bench tracking to enable accurate betting prop analysis

## Executive Summary

This plan adds starter position tracking to the nba_stats database by enriching existing player_game_stats records with START_POSITION data from the NBA API's boxscoretraditionalv2 endpoint.

**Key Benefits**:
- Filter player statistics to starter-only games (e.g., LaMelo Ball as starter: 21.2 PPG vs overall 19.8 PPG)
- Position-based matchup analysis (PG vs PG, C vs C)
- Rotation pattern tracking (starter/bench role changes)
- More accurate betting prop comparisons

**Total Implementation Time**: ~90 minutes
**API Calls Required**: 242 historical + ~8-12 daily

---

## Phase 1: Database Schema (10 minutes)

### 1.1 Create Migration File

**File**: `1.DATABASE/migrations/009_add_starter_info.sql`

```sql
-- ================================================================
-- Migration 009: Add Starter Position Tracking
-- ================================================================
-- Purpose: Enable starter vs bench analysis for betting props
-- Date: 2025-11-23
-- ================================================================

-- Add starter tracking columns to player_game_stats
ALTER TABLE player_game_stats
ADD COLUMN start_position VARCHAR(5),
ADD COLUMN is_starter BOOLEAN GENERATED ALWAYS AS (start_position IS NOT NULL) STORED;

-- Add indexes for efficient starter filtering
CREATE INDEX idx_player_game_stats_is_starter
ON player_game_stats(is_starter)
WHERE is_starter = TRUE;

CREATE INDEX idx_player_game_stats_start_position
ON player_game_stats(start_position)
WHERE start_position IS NOT NULL;

-- Add column comments for documentation
COMMENT ON COLUMN player_game_stats.start_position IS
'Starting position from NBA API boxscoretraditionalv2: F, G, C, F-C, G-F, or NULL for bench players';

COMMENT ON COLUMN player_game_stats.is_starter IS
'Computed column: TRUE if start_position IS NOT NULL (player started), FALSE if bench player';

-- Validation query
SELECT
    'Expected: 10 starters per game (5 per team)' as check_type,
    g.game_id,
    g.game_date,
    COUNT(*) FILTER (WHERE pgs.is_starter = TRUE) as starters_count
FROM games g
JOIN player_game_stats pgs ON g.game_id = pgs.game_id
WHERE g.season = '2025-26'
  AND g.home_team_score IS NOT NULL
GROUP BY g.game_id, g.game_date
HAVING COUNT(*) FILTER (WHERE pgs.is_starter = TRUE) != 10
ORDER BY g.game_date DESC
LIMIT 10;
```

### 1.2 Apply Migration

```bash
psql nba_stats < 1.DATABASE/migrations/009_add_starter_info.sql
```

### 1.3 Verify Schema Changes

```sql
-- Check columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'player_game_stats'
  AND column_name IN ('start_position', 'is_starter');

-- Check indexes created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'player_game_stats'
  AND indexname LIKE '%starter%';
```

---

## Phase 2: ETL Script Development (30-45 minutes)

### 2.1 Create Enrichment Script

**File**: `1.DATABASE/etl/enrich_with_starters.py`

```python
#!/usr/bin/env python3
"""
Enrich player_game_stats with starter position data from boxscoretraditionalv2 endpoint.

This script:
1. Identifies completed games missing starter data
2. Fetches boxscore details from NBA API
3. Updates start_position column for all players in each game
4. Validates 10 starters per game (5 per team)

Usage:
    python3 enrich_with_starters.py                    # Process all games
    python3 enrich_with_starters.py --game-id 0022500280  # Single game
    python3 enrich_with_starters.py --limit 10         # Test on 10 games
"""

import os
import sys
import time
import requests
import psycopg2
from datetime import datetime
from typing import List, Dict, Optional

# Database connection
DB_CONFIG = {
    'dbname': os.getenv('DB_NAME', 'nba_stats'),
    'user': os.getenv('DB_USER', 'chapirou'),
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432')
}

# NBA API configuration
NBA_API_BASE = 'https://stats.nba.com/stats/boxscoretraditionalv2'
NBA_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Accept': '*/*'
}

# Rate limiting: 0.6 seconds between requests (~100 req/min)
REQUEST_DELAY = 0.6
MAX_RETRIES = 3
RETRY_DELAYS = [1, 2, 4, 8]  # Exponential backoff in seconds


def get_database_connection():
    """Create database connection."""
    return psycopg2.connect(**DB_CONFIG)


def get_games_needing_enrichment(season: str = '2025-26', limit: Optional[int] = None) -> List[tuple]:
    """
    Get games that need starter data enrichment.

    Returns list of (game_id, game_date) tuples for completed games
    where at least one player_game_stats record has NULL start_position.
    """
    conn = get_database_connection()
    cur = conn.cursor()

    query = """
        SELECT DISTINCT g.game_id, g.game_date
        FROM games g
        WHERE g.season = %s
          AND g.home_team_score IS NOT NULL  -- Game completed
          AND EXISTS (
              SELECT 1 FROM player_game_stats pgs
              WHERE pgs.game_id = g.game_id
                AND pgs.start_position IS NULL
          )
        ORDER BY g.game_date ASC
    """

    if limit:
        query += f" LIMIT {limit}"

    cur.execute(query, (season,))
    games = cur.fetchall()

    cur.close()
    conn.close()

    return games


def fetch_boxscore_traditional(game_id: str, retry_count: int = 0) -> Optional[Dict]:
    """
    Fetch box score from NBA API with retry logic.

    Returns dict with player_id -> start_position mapping, or None on failure.
    """
    url = NBA_API_BASE
    params = {'GameID': game_id}

    try:
        response = requests.get(url, params=params, headers=NBA_HEADERS, timeout=30)
        response.raise_for_status()
        data = response.json()

        # Extract PlayerStats result set (index 0)
        result_sets = data.get('resultSets', [])
        if not result_sets:
            print(f"  ⚠️  No result sets for game {game_id}")
            return None

        player_stats = result_sets[0]
        headers = player_stats.get('headers', [])
        rows = player_stats.get('rowSet', [])

        # Find START_POSITION column index (should be index 8)
        try:
            start_pos_idx = headers.index('START_POSITION')
            player_id_idx = headers.index('PLAYER_ID')
        except ValueError as e:
            print(f"  ❌ Missing required column: {e}")
            return None

        # Build player_id -> start_position mapping
        starter_data = {}
        for row in rows:
            player_id = row[player_id_idx]
            start_position = row[start_pos_idx]
            starter_data[player_id] = start_position  # None for bench players

        return starter_data

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:  # Rate limit
            if retry_count < MAX_RETRIES:
                delay = RETRY_DELAYS[retry_count]
                print(f"  ⏳ Rate limited, retrying in {delay}s (attempt {retry_count + 1}/{MAX_RETRIES})")
                time.sleep(delay)
                return fetch_boxscore_traditional(game_id, retry_count + 1)
            else:
                print(f"  ❌ Max retries exceeded for game {game_id}")
                return None
        else:
            print(f"  ❌ HTTP error for game {game_id}: {e}")
            return None

    except Exception as e:
        print(f"  ❌ Error fetching game {game_id}: {e}")
        return None


def update_starter_data(game_id: str, starter_data: Dict[int, Optional[str]]) -> int:
    """
    Update start_position for all players in a game.

    Returns number of rows updated.
    """
    conn = get_database_connection()
    cur = conn.cursor()

    try:
        # Build batch update using CASE statement
        player_ids = list(starter_data.keys())

        # Build CASE WHEN clause for start_position
        case_when = " WHEN player_id = %s THEN %s"
        case_parts = []
        params = []

        for player_id, position in starter_data.items():
            case_parts.append(case_when)
            params.extend([player_id, position])

        # Final query
        query = f"""
            UPDATE player_game_stats
            SET start_position = CASE
                {''.join(case_parts)}
            END
            WHERE game_id = %s
              AND player_id = ANY(%s)
        """

        params.extend([game_id, player_ids])

        cur.execute(query, params)
        updated_count = cur.rowcount

        conn.commit()
        cur.close()
        conn.close()

        return updated_count

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        print(f"  ❌ Database error for game {game_id}: {e}")
        return 0


def validate_game_starters(game_id: str) -> bool:
    """
    Validate that game has exactly 10 starters (5 per team).

    Returns True if valid, False otherwise.
    """
    conn = get_database_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT COUNT(*)
        FROM player_game_stats
        WHERE game_id = %s AND is_starter = TRUE
    """, (game_id,))

    starter_count = cur.fetchone()[0]

    cur.close()
    conn.close()

    if starter_count != 10:
        print(f"  ⚠️  Expected 10 starters, found {starter_count}")
        return False

    return True


def main():
    """Main execution function."""
    import argparse

    parser = argparse.ArgumentParser(description='Enrich player_game_stats with starter data')
    parser.add_argument('--season', default='2025-26', help='Season to process (default: 2025-26)')
    parser.add_argument('--game-id', help='Process single game by ID')
    parser.add_argument('--limit', type=int, help='Limit number of games to process')
    parser.add_argument('--dry-run', action='store_true', help='Fetch data without updating database')

    args = parser.parse_args()

    print("=" * 80)
    print("🏀 NBA Starter Data Enrichment")
    print("=" * 80)

    # Get games to process
    if args.game_id:
        games = [(args.game_id, None)]
        print(f"Processing single game: {args.game_id}\n")
    else:
        games = get_games_needing_enrichment(args.season, args.limit)
        print(f"Found {len(games)} games needing enrichment for season {args.season}\n")

    if not games:
        print("✅ All games already have starter data")
        return

    # Process each game
    success_count = 0
    error_count = 0

    for idx, (game_id, game_date) in enumerate(games, 1):
        print(f"[{idx}/{len(games)}] {game_id} ({game_date or 'unknown date'})")

        # Fetch starter data from API
        starter_data = fetch_boxscore_traditional(game_id)

        if starter_data is None:
            error_count += 1
            continue

        starters = sum(1 for pos in starter_data.values() if pos is not None)
        print(f"  📊 Found {starters} starters, {len(starter_data) - starters} bench players")

        # Update database
        if not args.dry_run:
            updated = update_starter_data(game_id, starter_data)

            if updated > 0:
                # Validate
                if validate_game_starters(game_id):
                    print(f"  ✅ Updated {updated} players, validation passed")
                    success_count += 1
                else:
                    print(f"  ⚠️  Updated {updated} players, validation failed")
                    error_count += 1
            else:
                error_count += 1
        else:
            print(f"  🔍 Dry run: Would update {len(starter_data)} players")
            success_count += 1

        # Rate limiting
        if idx < len(games):
            time.sleep(REQUEST_DELAY)

    # Summary
    print("\n" + "=" * 80)
    print("ENRICHMENT COMPLETE")
    print("=" * 80)
    print(f"✅ Success: {success_count} games")
    print(f"❌ Errors:  {error_count} games")
    print("=" * 80)


if __name__ == '__main__':
    main()
```

### 2.2 Test on Single Game

```bash
# Test on known game (POR @ OKC)
python3 1.DATABASE/etl/enrich_with_starters.py --game-id 0022500280

# Expected output:
# 🏀 NBA Starter Data Enrichment
# Processing single game: 0022500280
# [1/1] 0022500280 (2025-11-23)
#   📊 Found 10 starters, 14 bench players
#   ✅ Updated 24 players, validation passed
```

### 2.3 Test on Limited Set

```bash
# Test on first 5 games
python3 1.DATABASE/etl/enrich_with_starters.py --limit 5
```

---

## Phase 3: Historical Enrichment (20 minutes)

### 3.1 Run Full Historical Enrichment

```bash
# Process all 242 games from 2025-26 season
python3 1.DATABASE/etl/enrich_with_starters.py

# Expected runtime: ~4 minutes (242 games × 0.6s delay = 145s + API time)
```

### 3.2 Validation Queries

```sql
-- Check overall enrichment status
SELECT
    COUNT(*) as total_games,
    COUNT(*) FILTER (WHERE has_starters) as enriched_games,
    COUNT(*) FILTER (WHERE NOT has_starters) as missing_starters
FROM (
    SELECT
        g.game_id,
        BOOL_AND(pgs.start_position IS NOT NULL) as has_starters
    FROM games g
    JOIN player_game_stats pgs ON g.game_id = pgs.game_id
    WHERE g.season = '2025-26'
      AND g.home_team_score IS NOT NULL
    GROUP BY g.game_id
) enrichment_status;

-- Verify 10 starters per game
SELECT
    game_id,
    game_date,
    COUNT(*) FILTER (WHERE is_starter) as starter_count,
    COUNT(*) as total_players
FROM player_game_stats pgs
JOIN games g ON pgs.game_id = g.game_id
WHERE g.season = '2025-26'
  AND g.home_team_score IS NOT NULL
GROUP BY game_id, game_date
HAVING COUNT(*) FILTER (WHERE is_starter) != 10
ORDER BY game_date DESC;

-- Check LaMelo Ball starter status
SELECT
    g.game_date,
    g.game_id,
    pgs.start_position,
    pgs.is_starter,
    pgs.minutes,
    pgs.points
FROM player_game_stats pgs
JOIN players p ON pgs.player_id = p.player_id
JOIN games g ON pgs.game_id = g.game_id
WHERE p.full_name = 'LaMelo Ball'
  AND g.season = '2025-26'
ORDER BY g.game_date DESC
LIMIT 10;

-- Position distribution
SELECT
    start_position,
    COUNT(*) as player_games,
    ROUND(AVG(points), 1) as avg_points,
    ROUND(AVG(minutes), 1) as avg_minutes
FROM player_game_stats pgs
JOIN games g ON pgs.game_id = g.game_id
WHERE g.season = '2025-26'
  AND start_position IS NOT NULL
GROUP BY start_position
ORDER BY player_games DESC;
```

### 3.3 Verify Starter vs Bench Performance

```sql
-- LaMelo Ball: Starter vs Overall stats
SELECT
    'Starter Only' as role,
    COUNT(*) as games,
    ROUND(AVG(points), 1) as ppg,
    ROUND(AVG(assists), 1) as apg,
    ROUND(AVG(rebounds), 1) as rpg,
    ROUND(AVG(minutes), 1) as mpg
FROM player_game_stats pgs
JOIN players p ON pgs.player_id = p.player_id
JOIN games g ON pgs.game_id = g.game_id
WHERE p.full_name = 'LaMelo Ball'
  AND g.season = '2025-26'
  AND pgs.is_starter = TRUE

UNION ALL

SELECT
    'All Games' as role,
    COUNT(*) as games,
    ROUND(AVG(points), 1) as ppg,
    ROUND(AVG(assists), 1) as apg,
    ROUND(AVG(rebounds), 1) as rpg,
    ROUND(AVG(minutes), 1) as mpg
FROM player_game_stats pgs
JOIN players p ON pgs.player_id = p.player_id
JOIN games g ON pgs.game_id = g.game_id
WHERE p.full_name = 'LaMelo Ball'
  AND g.season = '2025-26';
```

---

## Phase 4: Integration & Documentation (15 minutes)

### 4.1 Update Daily ETL Workflow

**File**: `1.DATABASE/scripts/daily_etl.sh` (create or update)

```bash
#!/bin/bash
# Daily NBA data collection and enrichment workflow

set -e  # Exit on error

echo "=========================================="
echo "NBA Daily ETL Pipeline"
echo "=========================================="
echo "Started: $(date)"

# 1. Fetch games and scores
echo "\n[1/4] Fetching games and scores..."
python3 /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/sync_season_2025_26.py

# 2. Fetch player box scores (includes new games)
echo "\n[2/4] Fetching player statistics..."
python3 /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/fetch_player_stats_direct.py

# 3. Enrich with starter data (only processes games missing starter info)
echo "\n[3/4] Enriching with starter data..."
python3 /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/enrich_with_starters.py

# 4. Calculate analytics
echo "\n[4/4] Calculating analytics..."
python3 /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/analytics/run_all_analytics.py

echo "\n=========================================="
echo "✅ Pipeline complete"
echo "Finished: $(date)"
echo "=========================================="
```

Make executable:
```bash
chmod +x 1.DATABASE/scripts/daily_etl.sh
```

### 4.2 Update Documentation

**File**: `1.DATABASE/IMPLEMENTATION_PLAN.md` (add section)

```markdown
### Starter Position Tracking (Migration 009)

**Tables Modified**: `player_game_stats`

**New Columns**:
- `start_position VARCHAR(5)` - Raw API value: "F", "G", "C", "F-C", "G-F", or NULL
- `is_starter BOOLEAN GENERATED` - Computed: TRUE if start_position IS NOT NULL

**Data Source**: NBA API boxscoretraditionalv2 endpoint

**Enrichment Script**: `etl/enrich_with_starters.py`

**Usage Examples**:
```sql
-- Filter to starter-only games
SELECT AVG(points) FROM player_game_stats
WHERE player_id = ? AND is_starter = TRUE

-- Position-based analysis
SELECT start_position, AVG(points) FROM player_game_stats
WHERE is_starter = TRUE GROUP BY start_position
```

**Daily Updates**: Runs automatically in `scripts/daily_etl.sh` after box score fetch
```

### 4.3 Add Frontend Query Helpers

**File**: `frontend/src/lib/queries.ts` (add functions)

```typescript
/**
 * Get player season averages filtered to starter-only games
 */
export async function getPlayerStarterAverages(
  playerId: number,
  season: string = '2025-26'
) {
  const result = await query(`
    SELECT
      p.full_name,
      COUNT(*) as games_started,
      ROUND(AVG(pgs.points), 1) as ppg,
      ROUND(AVG(pgs.assists), 1) as apg,
      ROUND(AVG(pgs.rebounds), 1) as rpg,
      ROUND(AVG(pgs.minutes), 1) as mpg,
      ROUND(AVG(pgs.field_goals_made), 1) as fgm,
      ROUND(AVG(pgs.field_goals_attempted), 1) as fga
    FROM player_game_stats pgs
    JOIN players p ON pgs.player_id = p.player_id
    JOIN games g ON pgs.game_id = g.game_id
    WHERE pgs.player_id = $1
      AND g.season = $2
      AND pgs.is_starter = TRUE
    GROUP BY p.player_id, p.full_name
  `, [playerId, season])

  return result.rows[0]
}

/**
 * Compare player performance as starter vs bench
 */
export async function getPlayerStarterBenchSplit(
  playerId: number,
  season: string = '2025-26'
) {
  const result = await query(`
    SELECT
      pgs.is_starter,
      COUNT(*) as games,
      ROUND(AVG(pgs.points), 1) as ppg,
      ROUND(AVG(pgs.assists), 1) as apg,
      ROUND(AVG(pgs.rebounds), 1) as rpg,
      ROUND(AVG(pgs.minutes), 1) as mpg
    FROM player_game_stats pgs
    JOIN games g ON pgs.game_id = g.game_id
    WHERE pgs.player_id = $1
      AND g.season = $2
    GROUP BY pgs.is_starter
    ORDER BY pgs.is_starter DESC
  `, [playerId, season])

  return {
    starter: result.rows.find(r => r.is_starter) || null,
    bench: result.rows.find(r => !r.is_starter) || null
  }
}
```

---

## Success Criteria

### Database Validation
- [ ] Migration 009 applied successfully
- [ ] Columns `start_position` and `is_starter` exist in `player_game_stats`
- [ ] Indexes created on both new columns
- [ ] All completed games have starter data (no NULL start_position)

### Data Quality Validation
- [ ] Every completed game has exactly 10 starters (5 per team)
- [ ] Valid `start_position` values: "F", "G", "C", "F-C", "G-F", NULL
- [ ] LaMelo Ball correctly marked as starter in all recent games
- [ ] Starter vs bench splits show meaningful differences (starters: 30+ MPG, bench: <20 MPG)

### ETL Script Validation
- [ ] `enrich_with_starters.py` runs without errors
- [ ] Rate limiting working (0.6s delays between requests)
- [ ] Retry logic handles 429 errors with exponential backoff
- [ ] Validation query catches games with incorrect starter count

### Integration Validation
- [ ] Daily ETL script includes starter enrichment step
- [ ] Frontend query functions return starter-only averages
- [ ] Documentation updated in IMPLEMENTATION_PLAN.md

---

## Rollback Plan

If issues are discovered after deployment:

```sql
-- Rollback migration 009
ALTER TABLE player_game_stats
DROP COLUMN IF EXISTS start_position CASCADE,
DROP COLUMN IF EXISTS is_starter CASCADE;

DROP INDEX IF EXISTS idx_player_game_stats_is_starter;
DROP INDEX IF EXISTS idx_player_game_stats_start_position;
```

Then remove from daily ETL:
```bash
# Comment out in daily_etl.sh:
# python3 .../enrich_with_starters.py
```

---

## Analytics Use Cases Enabled

### 1. Betting Prop Analysis
**Before**: "LaMelo Ball averages 19.8 PPG this season"
**After**: "LaMelo Ball averages 21.2 PPG when starting (18 games), 15.3 PPG off bench (2 games)"

**Query**:
```sql
SELECT
    is_starter,
    COUNT(*) as games,
    ROUND(AVG(points), 1) as ppg
FROM player_game_stats pgs
JOIN games g ON pgs.game_id = g.game_id
WHERE player_id = 1630163  -- LaMelo Ball
  AND g.season = '2025-26'
GROUP BY is_starter;
```

### 2. Position Matchup Analysis
**Use Case**: "How do point guards perform against OKC's defense?"

**Query**:
```sql
SELECT
    p.full_name,
    AVG(pgs.points) as ppg,
    AVG(pgs.assists) as apg
FROM player_game_stats pgs
JOIN players p ON pgs.player_id = p.player_id
JOIN games g ON pgs.game_id = g.game_id
WHERE pgs.start_position IN ('G', 'G-F')  -- Point guards
  AND g.season = '2025-26'
  AND (g.home_team_id = 1610612760 OR g.away_team_id = 1610612760)  -- OKC
  AND pgs.team_id != 1610612760  -- Opponent players
GROUP BY p.player_id, p.full_name
HAVING COUNT(*) >= 1;
```

### 3. Rotation Pattern Tracking
**Use Case**: "Players who moved from starter to bench role this season"

**Query**:
```sql
WITH role_changes AS (
    SELECT
        pgs.player_id,
        p.full_name,
        g.game_date,
        pgs.is_starter,
        LAG(pgs.is_starter) OVER (PARTITION BY pgs.player_id ORDER BY g.game_date) as prev_starter
    FROM player_game_stats pgs
    JOIN players p ON pgs.player_id = p.player_id
    JOIN games g ON pgs.game_id = g.game_id
    WHERE g.season = '2025-26'
)
SELECT
    player_id,
    full_name,
    game_date as role_change_date,
    CASE
        WHEN is_starter AND NOT prev_starter THEN 'Promoted to starter'
        WHEN NOT is_starter AND prev_starter THEN 'Moved to bench'
    END as change_type
FROM role_changes
WHERE is_starter != prev_starter
ORDER BY game_date DESC;
```

### 4. Starter vs Bench Performance Dashboard
**Frontend Component**: Player comparison showing starter/bench splits

**Data Structure**:
```typescript
interface PlayerSplit {
  role: 'starter' | 'bench'
  games: number
  ppg: number
  apg: number
  rpg: number
  mpg: number
  fgPct: number
}

interface PlayerPerformance {
  playerId: number
  fullName: string
  starter: PlayerSplit
  bench: PlayerSplit | null  // null if never came off bench
}
```

---

## Implementation Timeline

| Phase | Tasks | Duration | Dependencies |
|-------|-------|----------|--------------|
| **Phase 1** | Create migration, apply, verify | 10 min | None |
| **Phase 2** | Create ETL script, test on 1 game, test on 5 games | 30-45 min | Phase 1 complete |
| **Phase 3** | Run historical enrichment (242 games), validation queries, verify splits | 20 min | Phase 2 complete |
| **Phase 4** | Update daily ETL, update docs, add frontend helpers | 15 min | Phase 3 complete |

**Total: ~90 minutes** (assumes no issues during historical enrichment)

---

## Risk Assessment

### Low Risk
- ✅ Non-destructive addition (new columns only, no data deletion)
- ✅ Idempotent script (can re-run safely)
- ✅ Validation checks prevent bad data
- ✅ Simple rollback (DROP COLUMN)

### Medium Risk
- ⚠️ API rate limits (mitigated: 0.6s delays, exponential backoff)
- ⚠️ API changes (mitigated: field index validation in script)
- ⚠️ Historical data gaps (mitigated: incremental processing)

### Mitigation Strategies
1. **Test on single game first** before full historical run
2. **Monitor validation query** during historical enrichment
3. **Keep migration 009 separate** from other changes for easy rollback
4. **Log all API errors** to identify systematic issues

---

## Post-Implementation Tasks

### Week 1
- [ ] Monitor daily enrichment success rate
- [ ] Verify new games get starter data within 24 hours
- [ ] Check for any validation failures in production

### Week 2
- [ ] Add frontend starter filter toggle to player stats pages
- [ ] Create "Starter vs Bench" comparison dashboard
- [ ] Update betting prop analysis to use starter-only averages

### Month 1
- [ ] Analyze rotation pattern changes (starter ↔ bench transitions)
- [ ] Build position-based matchup reports
- [ ] Create starter efficiency metrics (PER, TS%, etc.)

---

## Notes

### NBA API Behavior
- Boxscore endpoint returns data immediately after game completion
- START_POSITION values observed: "F", "G", "C", "F-C", "G-F"
- NULL start_position = bench player (confirmed from manual inspection)

### Database Performance
- Computed column `is_starter` has zero storage overhead (calculated on read)
- Indexes on both columns enable fast filtering
- Expected query performance: <50ms for starter-only averages

### Future Enhancements
- Track starting lineup changes mid-game (injury replacements)
- Add "starter minutes" metric (minutes played while team has 5 starters on floor)
- Correlate starter status with opponent strength (vs top 10 defenses)

---

## Approval Required

This plan is ready for implementation. Please review and approve to proceed with Phase 1.

**Estimated completion time**: 90 minutes from approval
**Risk level**: Low
**Rollback complexity**: Simple (DROP COLUMN)
