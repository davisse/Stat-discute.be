# O/U Results Calculator and ATS Performance Scripts

## Overview

Two production-ready Python scripts for calculating over/under betting results and aggregating ATS performance statistics.

## Prerequisites

### Database Tables Required

These scripts require migration `010_totals_analytics.sql` to be run first, which creates:
- `game_closing_lines` - Stores closing betting lines before games
- `game_ou_results` - Stores calculated O/U and spread results

### Existing Tables Used
- `games` - Game schedule and status
- `team_game_stats` - Final scores
- `period_scores` - Quarter-by-quarter scores (Q1, 1H)
- `ats_performance` - ATS statistics (updated by scripts)
- `betting_events`, `betting_markets`, `betting_odds` - Betting data

## Scripts

### 1. calculate_ou_results.py

**Purpose**: Calculate O/U results for completed games with stored betting lines.

**What it does**:
- Queries completed games with final scores and closing lines
- Calculates OVER/UNDER/PUSH results for:
  - Full Game Total
  - First Half Total
  - First Quarter Total
  - Home Team Total
  - Away Team Total
- Calculates spread results (COVER/LOSS/PUSH) for ATS tracking
- Stores results in `game_ou_results` table with ON CONFLICT handling

**Usage**:
```bash
# Process all completed games for current season
python3 calculate_ou_results.py

# Process specific season
python3 calculate_ou_results.py --season 2025-26

# Process specific date
python3 calculate_ou_results.py --date 2025-12-17

# Dry run (calculate without storing)
python3 calculate_ou_results.py --dry-run
```

**Output Example**:
```
✅ 2025-12-17 - LAL @ GSW: 228 (OVER 225.5)
✅ 2025-12-17 - BOS @ MIA: 215 (UNDER 220.0)
```

### 2. update_ats_performance.py

**Purpose**: Aggregate O/U and spread results into `ats_performance` table by team and season.

**What it does**:
- Aggregates all games from `game_ou_results` by team
- Counts OVER/UNDER/PUSH results for each team
- Counts COVER/LOSS/PUSH for spread betting (ATS)
- Calculates splits:
  - Home ATS record
  - Away ATS record
  - Favorite ATS record (when spread < 0)
  - Underdog ATS record (when spread > 0)
- Updates `ats_performance` table with ON CONFLICT handling

**Usage**:
```bash
# Update all teams for current season
python3 update_ats_performance.py

# Update specific season
python3 update_ats_performance.py --season 2025-26

# Dry run (calculate without updating)
python3 update_ats_performance.py --dry-run
```

**Output Example**:
```
✅ Updated LAL: O/U 15-12, ATS 14-13 (51.9%)
✅ Updated GSW: O/U 18-10, ATS 16-12 (57.1%)

📊 Top 5 Teams by ATS Win %:
  1. GSW: ATS 16-12 (57.1%), O/U 18-10
  2. LAL: ATS 14-13 (51.9%), O/U 15-12
```

## Daily Workflow

Recommended execution order after games complete:

```bash
# 1. Fetch player stats and period scores (if not done)
python3 ../../fetch_player_stats_direct.py
python3 ../../fetch_period_scores.py

# 2. Calculate O/U results for completed games
python3 calculate_ou_results.py

# 3. Update ATS performance aggregates
python3 update_ats_performance.py
```

## Database Schema

### game_closing_lines
Stores final betting lines before game start:
- Game totals (full game, 1H, 1Q)
- Team totals (home, away)
- Spreads (home spread line)
- Odds for each market (over/under)

### game_ou_results
Stores calculated results:
- Actual totals vs lines
- Result classification (OVER/UNDER/PUSH)
- Margins (actual - line)
- Spread results (COVER/LOSS/PUSH)

### ats_performance (updated)
Aggregated team statistics:
- `over_record` - Count of OVER results
- `under_record` - Count of UNDER results
- `ou_pushes` - Count of PUSH results
- `ats_wins` - ATS covers
- `ats_losses` - ATS losses
- `ats_pushes` - ATS pushes
- Home/Away/Favorite/Underdog splits

## Error Handling

Both scripts include:
- ✅ ON CONFLICT handling (safe to re-run)
- ✅ Transaction rollback on errors
- ✅ Detailed error logging
- ✅ Summary statistics
- ✅ Dry-run mode for testing

## Testing

Before running on production data:

```bash
# 1. Test with dry-run
python3 calculate_ou_results.py --dry-run

# 2. Test with specific date
python3 calculate_ou_results.py --date 2025-12-17

# 3. Verify results
psql nba_stats -c "SELECT * FROM game_ou_results LIMIT 5"

# 4. Test ATS updater
python3 update_ats_performance.py --dry-run

# 5. Verify aggregation
psql nba_stats -c "SELECT * FROM ats_performance WHERE season_id='2025-26' LIMIT 5"
```

## Notes

- Both scripts use PostgreSQL parameterized queries for security
- Decimal odds format used throughout (European)
- Scripts follow patterns from existing `fetch_pinnacle_odds.py`
- Full logging with INFO, WARNING, and ERROR levels
- Season filtering applied to all queries (critical for data accuracy)

## Dependencies

- Python 3.8+
- psycopg2
- PostgreSQL 18 database with NBA stats schema
