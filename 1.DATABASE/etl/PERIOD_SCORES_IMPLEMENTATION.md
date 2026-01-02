# Period Scores ETL Implementation

**Created**: 2025-12-18
**Status**: READY FOR TESTING

## Overview

ETL scripts for fetching and backfilling quarter-by-quarter scoring data from NBA games. Supports Q1-Q4 regular quarters plus overtime periods.

---

## Files Created

### 1. `fetch_period_scores.py` (Already Existed)
**Purpose**: Generic fetcher for period scores with ongoing maintenance capability

**Data Source**: NBA CDN JSON endpoint
**Endpoint**: `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_{game_id}.json`

**Features**:
- Fetches quarter-by-quarter scores from CDN (faster, more reliable)
- Fetches OtherStats from BoxScoreSummaryV2 API (paint pts, fastbreak, etc.)
- Dual data source strategy for complete coverage
- Rate limiting (1.5 seconds between requests)
- Database insertion with ON CONFLICT handling
- Progress tracking

**Usage**:
```bash
# Fetch missing period scores for current season
python3 1.DATABASE/etl/fetch_period_scores.py --season 2025-26

# Limit to specific number of games
python3 1.DATABASE/etl/fetch_period_scores.py --season 2025-26 --limit 10

# Adjust rate limiting delay
python3 1.DATABASE/etl/fetch_period_scores.py --season 2025-26 --delay 2.0
```

### 2. `backfill_period_scores_2024.py` (New)
**Purpose**: Batch backfill job for 2024-25 season historical data

**Features**:
- Checkpoint file support for resumable processing
- Validation: SUM(period scores) = final game score
- Progress tracking with ETA calculation
- Batch processing with periodic saves
- Automatic cleanup when complete
- Detailed validation failure reporting

**Usage**:
```bash
# Run full backfill for 2024-25 season
python3 1.DATABASE/etl/backfill_period_scores_2024.py

# Resume from checkpoint after interruption
python3 1.DATABASE/etl/backfill_period_scores_2024.py
```

**Checkpoint File**: `backfill_2024_checkpoint.json`
- Stores progress state
- Tracks completed and failed games
- Enables resumable processing
- Automatically deleted upon successful completion

---

## Implementation Details

### API Endpoint Strategy

**Deviation from Original Plan**:
- Plan specified: BoxScoreSummaryV2 API endpoint (stats.nba.com)
- Implementation uses: NBA CDN JSON endpoint (cdn.nba.com)

**Rationale**:
1. **Reliability**: CDN is more stable and less prone to 403 errors
2. **Speed**: CDN responses are faster (no authentication required)
3. **Data Quality**: CDN provides same period data with cleaner structure
4. **Existing Pattern**: Matches current project architecture

**CDN JSON Structure**:
```json
{
  "game": {
    "homeTeam": {
      "periods": [
        {"period": 1, "periodType": "REGULAR", "score": 22},
        {"period": 2, "periodType": "REGULAR", "score": 30},
        {"period": 3, "periodType": "REGULAR", "score": 28},
        {"period": 4, "periodType": "REGULAR", "score": 26},
        {"period": 5, "periodType": "OVERTIME", "score": 8}  // if OT
      ]
    },
    "awayTeam": { /* same structure */ }
  }
}
```

**BoxScoreSummaryV2 API** (still used for OtherStats):
```python
# OtherStats dataset provides:
- PTS_PAINT (paint points)
- PTS_2ND_CHANCE (second chance points)
- PTS_FB (fastbreak points)
- PTS_OFF_TO (points off turnovers)
- LARGEST_LEAD
- LEAD_CHANGES
- TIMES_TIED
```

### Database Schema

**Table**: `period_scores`
```sql
CREATE TABLE period_scores (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) REFERENCES games(game_id),
    team_id BIGINT REFERENCES teams(team_id),
    period_number SMALLINT,  -- 1-4 for quarters, 1-4 for OT
    period_type VARCHAR(3),  -- 'Q' or 'OT'
    points SMALLINT,
    is_first_half BOOLEAN GENERATED ALWAYS AS (period_number <= 2 AND period_type = 'Q') STORED,
    UNIQUE(game_id, team_id, period_number, period_type)
);
```

**Period Numbering**:
- Q1-Q4: `period_number = 1-4`, `period_type = 'Q'`
- OT1-OT4: `period_number = 1-4`, `period_type = 'OT'`

**CDN Mapping**:
- CDN period 1-4 → `period_number = 1-4, period_type = 'Q'`
- CDN period 5 (OT1) → `period_number = 1, period_type = 'OT'`
- CDN period 6 (OT2) → `period_number = 2, period_type = 'OT'`
- etc.

### Validation Logic

**Score Validation**:
```python
# After inserting period scores, verify:
SUM(period_scores.points WHERE team_id = home_team) == games.home_team_score
SUM(period_scores.points WHERE team_id = away_team) == games.away_team_score
```

**Validation Failures**:
- Logged to checkpoint file
- Displayed in summary report
- Does not stop processing (continues to next game)
- Manual review required for failed validations

---

## Expected Data Coverage

### 2024-25 Season Backfill
- **Total games**: ~1,214 (full regular season)
- **Expected records**: ~9,712 (1,214 games × 8 periods × 2 teams, minus OT)
- **Processing time**: ~30-40 minutes (1.5 sec/game with dual API calls)
- **Validation target**: 100% score match

### Record Breakdown
```
Regular quarters: 1,214 games × 4 quarters × 2 teams = 9,712 records
OT periods: Variable (typically ~50-80 games go to OT)
Total: ~9,800-9,900 records for 2024-25 season
```

---

## Rate Limiting

**Strategy**: Conservative delays to respect NBA API
- **Default delay**: 1.5 seconds between games
- **Dual API calls**: CDN fetch + BoxScoreSummaryV2 fetch
- **Adjustable**: `--delay` parameter in fetch_period_scores.py

**NBA API Headers** (required for BoxScoreSummaryV2):
```python
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Accept': '*/*'
}
```

---

## Testing Workflow

### 1. Test with Single Game
```bash
# Test fetch_period_scores.py with limit
python3 1.DATABASE/etl/fetch_period_scores.py --season 2024-25 --limit 1
```

**Expected Output**:
```
✅ Connected to database
📋 Found 1 games missing period_scores
[1/1] BOS @ NYK (2024-10-22) - 0022400001
   ✅ Inserted 8 period_scores
   ✅ Inserted game_advanced_stats
📊 2024-25 Period Scores:
   • Games with period data: 1
   • Total period records: 8
```

### 2. Test Validation
```bash
# Check database for validation
psql nba_stats -c "
  SELECT g.game_id,
         ht.abbreviation || ' ' || g.home_team_score as home,
         at.abbreviation || ' ' || g.away_team_score as away,
         SUM(CASE WHEN ps.team_id = g.home_team_id THEN ps.points ELSE 0 END) as home_periods,
         SUM(CASE WHEN ps.team_id = g.away_team_id THEN ps.points ELSE 0 END) as away_periods
  FROM games g
  JOIN teams ht ON g.home_team_id = ht.team_id
  JOIN teams at ON g.away_team_id = at.team_id
  LEFT JOIN period_scores ps ON g.game_id = ps.game_id
  WHERE g.season = '2024-25' AND ps.game_id IS NOT NULL
  GROUP BY g.game_id, ht.abbreviation, at.abbreviation, g.home_team_score, g.away_team_score
  LIMIT 5;
"
```

### 3. Small Batch Test
```bash
# Test with 10 games
python3 1.DATABASE/etl/fetch_period_scores.py --season 2024-25 --limit 10
```

### 4. Full Backfill (Production)
```bash
# Run full 2024-25 backfill
python3 1.DATABASE/etl/backfill_period_scores_2024.py

# Monitor progress
tail -f backfill_2024_checkpoint.json
```

---

## Error Handling

### Common Issues

**Issue**: 404 from CDN endpoint
- **Cause**: Game data not yet available on CDN
- **Action**: Script logs warning and continues to next game
- **Resolution**: Re-run for missing games later

**Issue**: Validation failure (period sum ≠ final score)
- **Cause**: Data discrepancy between CDN and games table
- **Action**: Logged to validation_failures list
- **Resolution**: Manual review and potential re-fetch

**Issue**: 403 from BoxScoreSummaryV2 API
- **Cause**: Missing or incorrect headers
- **Action**: OtherStats insertion fails but period_scores succeed
- **Resolution**: Headers already configured correctly

### Checkpoint Recovery

**Scenario**: Script interrupted mid-run
```bash
# Simply re-run the script
python3 1.DATABASE/etl/backfill_period_scores_2024.py

# Output will show:
# 📂 Loaded checkpoint: 450/1214 games processed
# ⏳ Games remaining to process: 764
```

**Checkpoint Location**: Same directory as script
**Checkpoint Format**: JSON with completed/failed game lists

---

## Verification Queries

### 1. Coverage Check
```sql
SELECT
    COUNT(DISTINCT ps.game_id) as games_with_period_data,
    COUNT(DISTINCT g.game_id) as total_completed_games,
    ROUND(COUNT(DISTINCT ps.game_id)::numeric / COUNT(DISTINCT g.game_id) * 100, 1) as coverage_pct
FROM games g
LEFT JOIN period_scores ps ON g.game_id = ps.game_id
WHERE g.season = '2024-25' AND g.game_status = 'Final';
```

### 2. Period Count Distribution
```sql
SELECT
    period_type,
    period_number,
    COUNT(*) as record_count,
    COUNT(DISTINCT game_id) as games
FROM period_scores ps
JOIN games g ON ps.game_id = g.game_id
WHERE g.season = '2024-25'
GROUP BY period_type, period_number
ORDER BY period_type DESC, period_number;
```

Expected output:
```
 period_type | period_number | record_count | games
-------------+---------------+--------------+-------
 Q           |             1 |         2428 |  1214
 Q           |             2 |         2428 |  1214
 Q           |             3 |         2428 |  1214
 Q           |             4 |         2428 |  1214
 OT          |             1 |          ~120|    ~60  # OT games
```

### 3. Validation Check
```sql
SELECT
    g.game_id,
    g.game_date,
    ht.abbreviation || ' ' || g.home_team_score as home,
    at.abbreviation || ' ' || g.away_team_score as away,
    SUM(CASE WHEN ps.team_id = g.home_team_id THEN ps.points ELSE 0 END) as home_period_sum,
    SUM(CASE WHEN ps.team_id = g.away_team_id THEN ps.points ELSE 0 END) as away_period_sum,
    (SUM(CASE WHEN ps.team_id = g.home_team_id THEN ps.points ELSE 0 END) = g.home_team_score) as home_valid,
    (SUM(CASE WHEN ps.team_id = g.away_team_id THEN ps.points ELSE 0 END) = g.away_team_score) as away_valid
FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
JOIN period_scores ps ON g.game_id = ps.game_id
WHERE g.season = '2024-25'
GROUP BY g.game_id, g.game_date, ht.abbreviation, at.abbreviation, g.home_team_score, g.away_team_score
HAVING SUM(CASE WHEN ps.team_id = g.home_team_id THEN ps.points ELSE 0 END) != g.home_team_score
    OR SUM(CASE WHEN ps.team_id = g.away_team_id THEN ps.points ELSE 0 END) != g.away_team_score;
```

Should return **0 rows** if all validations pass.

### 4. First Half Totals Check
```sql
-- Verify is_first_half generated column
SELECT
    t.abbreviation,
    COUNT(*) as games,
    ROUND(AVG(first_half_pts), 1) as avg_first_half_pts
FROM (
    SELECT
        ps.team_id,
        ps.game_id,
        SUM(ps.points) as first_half_pts
    FROM period_scores ps
    JOIN games g ON ps.game_id = g.game_id
    WHERE g.season = '2024-25'
      AND ps.is_first_half = true  -- Generated column
    GROUP BY ps.team_id, ps.game_id
) subq
JOIN teams t ON subq.team_id = t.team_id
GROUP BY t.team_id, t.abbreviation
ORDER BY avg_first_half_pts DESC
LIMIT 10;
```

---

## Next Steps

### Immediate (Phase 2 Complete)
- [x] Create `fetch_period_scores.py` (already existed)
- [x] Create `backfill_period_scores_2024.py` (new)
- [ ] **TEST with 1 game**
- [ ] **TEST with 10 games**
- [ ] **RUN full backfill** (~30-40 minutes)
- [ ] **VERIFY coverage** (target: 100%)
- [ ] **CHECK validation failures** (investigate any mismatches)

### Phase 3: O/U Results Calculator
After period scores backfill completes:
```bash
# Calculate team_period_averages
python3 1.DATABASE/etl/analytics/calculate_period_stats.py

# Calculate O/U results (requires betting lines)
python3 1.DATABASE/etl/betting/calculate_ou_results.py
```

### Phase 4: Closing Lines Storage
Enhance `fetch_pinnacle_odds.py` to capture closing lines:
- Add `is_closing_line` flag
- Create `game_closing_lines` snapshots
- Track `hours_to_game` for CLV analysis

---

## Maintenance

### Daily Operations
```bash
# Fetch period scores for yesterday's games
python3 1.DATABASE/etl/fetch_period_scores.py --season 2025-26 --limit 15
```

### Weekly Verification
```bash
# Check for any games missing period_scores
psql nba_stats -c "
  SELECT COUNT(*) as missing_games
  FROM games g
  LEFT JOIN period_scores ps ON g.game_id = ps.game_id
  WHERE g.season = '2025-26'
    AND g.game_status = 'Final'
    AND ps.game_id IS NULL;
"
```

### Re-process Failed Games
```bash
# Check checkpoint file for failed games
cat 1.DATABASE/etl/backfill_2024_checkpoint.json | jq '.failed_games'

# Re-run for specific season (will skip already processed)
python3 1.DATABASE/etl/fetch_period_scores.py --season 2024-25 --limit 100
```

---

## Performance Metrics

**Target Metrics**:
- Fetch success rate: > 95%
- Validation pass rate: > 99%
- Processing speed: ~40-60 games/minute (CDN is fast)
- Data completeness: 100% for completed games

**Actual Performance** (to be measured after backfill):
- TBD after testing
- Will update this section with real metrics

---

## Notes

- **NBA API Headers**: Critical for BoxScoreSummaryV2 (403 without proper headers)
- **CDN Reliability**: CDN endpoint is more stable than stats.nba.com
- **Checkpoint Safety**: Always save checkpoint every 50 games
- **Validation Importance**: Period sum MUST equal final score for betting analytics
- **OT Detection**: CDN periodType='OVERTIME' with period > 4
- **Database ON CONFLICT**: Safe to re-run scripts (idempotent)

---

**Status**: READY FOR TESTING
**Author**: Claude Code
**Date**: 2025-12-18
