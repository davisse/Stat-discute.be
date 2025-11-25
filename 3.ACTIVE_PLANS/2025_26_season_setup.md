# 2025-26 Season Setup Plan

## Overview
Setting up the 2025-26 NBA season as the current active season and retrieving all available data.

**Date**: October 23, 2025
**Status**: In Progress

## Context
- Current Date: October 23, 2025
- NBA 2025-26 Season: Just started (typically starts around Oct 20-22)
- Expected Data: First week of games (approximately 30-50 games)

## Implementation Steps

### 1. ✅ Update Seasons Table
- File: `1.DATABASE/etl/reference_data/sync_seasons_2025_26.py`
- Update existing seasons to set is_current = false
- Insert/update 2025-26 season with is_current = true
- Set proper date ranges (Oct 2025 - June 2026)

### 2. ✅ Create 2025-26 Data Collection Script
- File: `1.DATABASE/etl/sync_season_2025_26.py`
- Modified version of sync_full_season.py
- Specifically for 2025-26 season
- Fetch all games from season start to current date
- Collect box scores for completed games

### 3. ✅ Database Updates
```sql
-- Update all seasons to not current
UPDATE seasons SET is_current = false;

-- Set 2025-26 as current
INSERT INTO seasons (season_id, season_year, season_type, start_date, end_date, is_current)
VALUES ('2025-26', 2025, 'Regular Season', '2025-10-20', '2026-06-30', true)
ON CONFLICT (season_id)
DO UPDATE SET is_current = true, updated_at = CURRENT_TIMESTAMP;
```

### 4. ✅ ETL Execution Sequence
1. Run `sync_seasons_2025_26.py` - Update season records
2. Run `sync_season_2025_26.py` - Fetch games and box scores
3. Run analytics scripts:
   - `calculate_team_stats.py`
   - `calculate_advanced_stats.py`
   - `calculate_standings.py`
   - `refresh_materialized_views.py`

### 5. ✅ Verification Steps
- Check games count for 2025-26
- Verify player stats collected
- Confirm standings calculated
- Test frontend displays new season

## Expected Outcomes
- 2025-26 marked as current season
- ~30-50 games loaded (first week of season)
- ~500-600 player game stats
- Team standings initialized
- Analytics calculated for early season

## Files Created/Modified
1. `sync_seasons_2025_26.py` - Season updater
2. `sync_season_2025_26.py` - Game/stats collector
3. `run_2025_26_setup.sh` - Automation script

## Progress Log
- [2025-10-23 23:09] Plan created and approved
- [2025-10-23 23:10] Starting implementation
- [2025-10-23 23:15] Implementation complete - all scripts created
- [2025-10-23 23:18] Execution complete - season data loaded
- [2025-10-23 23:30] Player stats successfully fetched and stored (364 player stats)

## Status: FULLY COMPLETE WITH PLAYER DATA ✅

The 2025-26 season has been successfully set up and all data has been fetched.

### Execution Results

**Database Updates:**
- ✅ 2025-26 set as current season (2024-25 marked as not current)
- ✅ Season dates: October 20, 2025 to June 30, 2026

**Games Loaded:**
- ✅ 14 games fetched from NBA API
- ✅ Date range: October 21-22, 2025 (first 2 days of season)
- ✅ All games marked as Final with scores

**Player Stats:**
- ✅ 364 player game stats successfully loaded!
- ✅ 364 unique players tracked
- ✅ All 14 games have complete box scores

**Team Data:**
- ✅ 28 teams have played (2 teams haven't played yet: DEN, IND)
- ✅ 14 teams with 1-0 records (winners)
- ✅ 14 teams with 0-1 records (losers)
- ✅ Standings calculated for all conferences

**Analytics:**
- ✅ Team game stats calculated
- ✅ Advanced stats processed
- ✅ Standings updated
- ✅ Materialized views refreshed

### Sample Games from 2025-26 Season:
- Oct 21: OKC 125 - 124 HOU (27 players tracked)
- Oct 21: LAL 109 - 119 GSW (25 players tracked)
- Oct 22: NYK 119 - 111 CLE (21 players tracked)
- Oct 22: SAS 125 - 92 DAL (Game of the night!)
- Oct 22: MIL 133 - 120 WAS (High scoring!)

### Top Individual Performances:
1. Luka Dončić (LAL): 43 points
2. Anthony Edwards (MIN): 41 points
3. Victor Wembanyama (SAS): 40 points
4. Tyrese Maxey (PHI): 40 points
5. Alperen Sengun (HOU): 39 points

### Quick Start
```bash
cd /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl
./run_2025_26_setup.sh
```

### Manual Execution
```bash
# Step 1: Update seasons
python3 reference_data/sync_seasons_2025_26.py

# Step 2: Fetch games and box scores
python3 sync_season_2025_26.py

# Step 3: Run analytics (optional)
python3 analytics/calculate_team_stats.py
python3 analytics/calculate_advanced_stats.py
python3 analytics/calculate_standings.py
python3 analytics/refresh_materialized_views.py
```

### What the Scripts Do
1. **sync_seasons_2025_26.py** - Sets 2025-26 as the current active season in the database
2. **sync_season_2025_26.py** - Fetches all games from NBA API for 2025-26 and collects box scores
3. **run_2025_26_setup.sh** - Automated script that runs everything in sequence

---

## Phase 2: Starter Position Tracking Implementation ✅

**Date**: November 23-24, 2025
**Status**: FULLY COMPLETE

### Overview
Implemented starter vs bench tracking to enable more accurate betting prop analysis. Players perform significantly differently as starters vs bench players, so filtering to starter-only games provides better prop projections.

### Implementation Completed

#### 1. ✅ Database Migration (Migration 009)
- **File**: `migrations/009_add_starter_info.sql`
- **Changes**:
  - Added `start_position VARCHAR(5)` to player_game_stats (F, G, C, F-C, G-F)
  - Added computed column `is_starter BOOLEAN` (TRUE if start_position NOT NULL)
  - Created 2 partial indexes for efficient starter filtering
- **Applied**: Successfully applied to nba_stats database

#### 2. ✅ ETL Script Creation
- **File**: `etl/enrich_with_starters.py`
- **Features**:
  - Fetches from NBA API boxscoretraditionalv2 endpoint
  - Rate limiting: 0.6s between requests (~100 req/min)
  - Retry logic: Exponential backoff on 429 errors (1s, 2s, 4s, 8s)
  - Validation: Exactly 10 starters per game (5 per team)
  - Batch updates using PostgreSQL unnest() for efficiency
- **Critical Fix**: NBA API returns empty string '' for bench players (not NULL)

#### 3. ✅ Historical Data Enrichment
- **Season**: 2024-25 (all completed games)
- **Results**: 1,224 games successfully enriched (99.92% success rate)
- **Validation**: All games have exactly 10 starters
- **Position Distribution**: 40% G, 40% F, 20% C (perfect)

#### 4. ✅ Daily ETL Integration
- **File**: `scripts/daily_etl.sh`
- **Workflow**:
  1. Sync games and scores
  2. Fetch player box scores
  3. **Enrich with starter data** (newly added)
  4. Calculate analytics
  5. Validation checks
  6. Summary report generation

#### 5. ✅ Frontend Integration
- **File**: `frontend/src/lib/queries.ts`
- **New Functions**:
  - `getPlayerStarterAverages()` - Starter-only season stats
  - `getPlayerStarterBenchSplit()` - Compare starter vs bench performance
  - `getPlayerRoleChanges()` - Track starter ↔ bench transitions
  - `getDefenseByPosition()` - Position-based defensive matchup stats

#### 6. ✅ Documentation
- **File**: `1.DATABASE/IMPLEMENTATION_PLAN.md`
- **Added**: Comprehensive Migration 009 section with:
  - Business context and betting analytics use cases
  - Schema changes and SQL examples
  - Query patterns for prop analysis
  - ETL integration details

### Validation Results

**Coverage**: 99.9% (1,224 of 1,225 completed games)

**Data Quality**:
- ✅ All 1,224 games have exactly 10 starters (perfect validation)
- ✅ Position distribution: 40% Guards, 40% Forwards, 20% Centers
- ✅ No validation errors in enriched games

**Real-World Example - LaMelo Ball**:
- Total games (2024-25): 47
- Games started: 47 (100%)
- PPG as starter: 25.2
- Status: Elite player, always starts (as expected)

**Starter vs Bench Impact**:
Top performance gaps when moving from bench to starter:
- Jayson Tatum: +26.8 PPG
- Tyrese Maxey: +26.5 PPG
- Cade Cunningham: +26.1 PPG
- Cam Thomas: +21.3 PPG (23 starts, 19 bench appearances)

### Betting Analytics Value

1. **Prop Accuracy**: Filter player averages to starter-only games for current starters
2. **Role Changes**: Detect when players move to/from starting lineup
3. **Line Inefficiencies**: Identify when bookmakers haven't adjusted for role changes
4. **Matchup Analysis**: Position-based defensive impact (starter vs bench defenders)
5. **Injury Replacements**: Track performance when bench players get starting opportunities

### Next Steps for Daily Operations

Run daily ETL workflow after games complete:
```bash
cd /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE
./scripts/daily_etl.sh
```

The script automatically:
- Fetches new games and scores
- Collects player box scores
- Enriches with starter position data
- Calculates analytics
- Validates data quality
- Generates summary reports

### Files Created/Modified

1. `migrations/009_add_starter_info.sql` - Database schema changes
2. `etl/enrich_with_starters.py` - Starter data collection script
3. `scripts/daily_etl.sh` - Automated daily workflow
4. `frontend/src/lib/queries.ts` - Frontend query functions (+216 lines)
5. `1.DATABASE/IMPLEMENTATION_PLAN.md` - Migration 009 documentation
6. `3.ACTIVE_PLANS/2025_26_season_setup.md` - This file (phase 2 completion)

### Status: PRODUCTION READY ✅

The starter position tracking system is fully implemented and validated. All historical data (2024-25 season) has been enriched, and the daily ETL workflow is configured to automatically enrich new games as they complete.