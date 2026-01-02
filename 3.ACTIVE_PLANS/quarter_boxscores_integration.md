# Quarter Boxscores Integration Plan

**Status**: ✅ COMPLETED
**Created**: 2024-12-12
**Completed**: 2024-12-12
**Data Source**: `BoxScoreSummaryV2` (LineScore + OtherStats datasets)

---

## Overview

Add quarter-by-quarter scoring data to enable first quarter (Q1), first half (1H), and period-specific betting analysis.

## Data Model

### Option Selected: Normalized Tables

Chose normalized approach over denormalized columns for:
- Flexible OT period handling (OT1-OT10)
- Easy aggregation queries for betting analysis
- Extensibility for future per-period stats

---

## Database Schema

### Table 1: `period_scores`

```sql
CREATE TABLE period_scores (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    period_number SMALLINT NOT NULL,  -- 1,2,3,4 for quarters, 5+ for OT
    period_type VARCHAR(3) NOT NULL DEFAULT 'Q',  -- 'Q' or 'OT'
    points SMALLINT NOT NULL,
    is_first_half BOOLEAN GENERATED ALWAYS AS (period_number <= 2 AND period_type = 'Q') STORED,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(game_id, team_id, period_number, period_type)
);

-- Indexes
CREATE INDEX idx_period_scores_game ON period_scores(game_id);
CREATE INDEX idx_period_scores_team_period ON period_scores(team_id, period_number, period_type);
CREATE INDEX idx_period_scores_first_half ON period_scores(team_id) WHERE is_first_half = true;
```

**Volume**: ~10,000 rows per season (1,230 games × 2 teams × 4 quarters + OT)

### Table 2: `game_advanced_stats`

```sql
CREATE TABLE game_advanced_stats (
    game_id VARCHAR(10) PRIMARY KEY REFERENCES games(game_id) ON DELETE CASCADE,
    -- Home team stats
    home_pts_paint SMALLINT,
    home_pts_2nd_chance SMALLINT,
    home_pts_fastbreak SMALLINT,
    home_pts_off_turnovers SMALLINT,
    home_largest_lead SMALLINT,
    -- Away team stats
    away_pts_paint SMALLINT,
    away_pts_2nd_chance SMALLINT,
    away_pts_fastbreak SMALLINT,
    away_pts_off_turnovers SMALLINT,
    away_largest_lead SMALLINT,
    -- Game flow
    lead_changes SMALLINT,
    times_tied SMALLINT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_game_advanced_stats_game ON game_advanced_stats(game_id);
```

**Volume**: ~1,230 rows per season

### Table 3: `team_period_averages` (Analytics)

```sql
CREATE TABLE team_period_averages (
    team_id BIGINT REFERENCES teams(team_id),
    season VARCHAR(7) NOT NULL,
    period_number SMALLINT NOT NULL,
    period_type VARCHAR(3) NOT NULL DEFAULT 'Q',
    location VARCHAR(4) NOT NULL,  -- 'HOME', 'AWAY', 'ALL'
    games_played INT NOT NULL,
    avg_points DECIMAL(5,2),
    avg_allowed DECIMAL(5,2),
    period_win_pct DECIMAL(4,3),  -- % won that period
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (team_id, season, period_number, period_type, location)
);
```

### Table 4: `team_half_averages` (Analytics)

```sql
CREATE TABLE team_half_averages (
    team_id BIGINT REFERENCES teams(team_id),
    season VARCHAR(7) NOT NULL,
    half SMALLINT NOT NULL,  -- 1 or 2
    location VARCHAR(4) NOT NULL,
    games_played INT NOT NULL,
    avg_points DECIMAL(5,2),
    avg_total DECIMAL(5,2),  -- combined with opponent
    avg_margin DECIMAL(5,2),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (team_id, season, half, location)
);
```

---

## ETL Pipeline

### Data Source: BoxScoreSummaryV2

```python
from nba_api.stats.endpoints import BoxScoreSummaryV2

box = BoxScoreSummaryV2(game_id="0022400350")
line_score = box.line_score.get_data_frame()  # Quarter scores
other_stats = box.other_stats.get_data_frame()  # Paint pts, fastbreak, etc.
```

### LineScore Columns
| Column | Description |
|--------|-------------|
| `PTS_QTR1` | Q1 points |
| `PTS_QTR2` | Q2 points |
| `PTS_QTR3` | Q3 points |
| `PTS_QTR4` | Q4 points |
| `PTS_OT1` - `PTS_OT10` | Overtime periods |
| `PTS` | Total points |

### OtherStats Columns
| Column | Description |
|--------|-------------|
| `PTS_PAINT` | Points in the paint |
| `PTS_2ND_CHANCE` | Second chance points |
| `PTS_FB` | Fastbreak points |
| `PTS_OFF_TO` | Points off turnovers |
| `LARGEST_LEAD` | Largest lead |
| `LEAD_CHANGES` | Number of lead changes |
| `TIMES_TIED` | Times score was tied |

### ETL Script: `fetch_period_scores.py`

```python
# Pseudocode structure
async def fetch_period_scores():
    # 1. Get games without period_scores
    games = await get_games_missing_period_scores()

    # 2. Process in batches with rate limiting
    for game in games:
        try:
            box = BoxScoreSummaryV2(game_id=game.game_id)

            # Insert period_scores
            for team_row in box.line_score.get_data_frame().itertuples():
                for q in range(1, 5):
                    insert_period_score(game_id, team_id, q, 'Q', points)
                # Handle OT periods
                for ot in range(1, 11):
                    if team_row[f'PTS_OT{ot}'] > 0:
                        insert_period_score(game_id, team_id, ot+4, 'OT', points)

            # Insert game_advanced_stats
            insert_game_advanced_stats(box.other_stats)

            await asyncio.sleep(1.5)  # Rate limit

        except Exception as e:
            log_error(game.game_id, e)
            continue
```

### Backfill Strategy

| Step | Description | Time |
|------|-------------|------|
| 1 | Identify games without period_scores | ~1 min |
| 2 | Fetch BoxScoreSummaryV2 per game | 1.5s/game |
| 3 | Insert period_scores + game_advanced_stats | ~0.1s/game |
| **Total** | ~1,230 games | **~30 minutes** |

---

## Analytics Scripts

### `calculate_period_stats.py`

Computes:
1. `team_period_averages` - Q1/Q2/Q3/Q4 averages by team
2. `team_half_averages` - 1H/2H averages by team

Run after `fetch_period_scores.py` in daily workflow.

---

## Betting Analysis Use Cases

### 1. First Quarter Betting
```sql
-- Team Q1 scoring average
SELECT t.abbreviation,
       AVG(ps.points) as avg_q1_pts,
       AVG(opp_ps.points) as avg_q1_allowed
FROM period_scores ps
JOIN games g ON ps.game_id = g.game_id
JOIN teams t ON ps.team_id = t.team_id
JOIN period_scores opp_ps ON ps.game_id = opp_ps.game_id
    AND opp_ps.team_id != ps.team_id AND opp_ps.period_number = 1
WHERE ps.period_number = 1 AND g.season = '2024-25'
GROUP BY t.abbreviation
ORDER BY avg_q1_pts DESC;
```

### 2. First Half Totals
```sql
-- Team 1H scoring (home vs away split)
SELECT t.abbreviation,
       CASE WHEN g.home_team_id = ps.team_id THEN 'HOME' ELSE 'AWAY' END as location,
       AVG(ps.points) as avg_1h_pts
FROM period_scores ps
JOIN games g ON ps.game_id = g.game_id
JOIN teams t ON ps.team_id = t.team_id
WHERE ps.is_first_half = true
  AND g.season = '2024-25'
GROUP BY t.abbreviation, location;
```

### 3. Quarter Win Percentage
```sql
-- Which teams consistently win Q3? (halftime adjustments)
SELECT t.abbreviation,
       COUNT(*) FILTER (WHERE ps.points > opp.points) * 100.0 / COUNT(*) as q3_win_pct
FROM period_scores ps
JOIN games g ON ps.game_id = g.game_id
JOIN teams t ON ps.team_id = t.team_id
JOIN period_scores opp ON ps.game_id = opp.game_id
    AND opp.team_id != ps.team_id AND opp.period_number = 3
WHERE ps.period_number = 3 AND g.season = '2024-25'
GROUP BY t.abbreviation
ORDER BY q3_win_pct DESC;
```

### 4. Fast Starters vs Closers
```sql
-- Teams that score more in Q1 than Q4 (fast starters)
WITH quarter_avg AS (
    SELECT ps.team_id, ps.period_number, AVG(ps.points) as avg_pts
    FROM period_scores ps
    JOIN games g ON ps.game_id = g.game_id
    WHERE g.season = '2024-25' AND ps.period_type = 'Q'
    GROUP BY ps.team_id, ps.period_number
)
SELECT t.abbreviation,
       q1.avg_pts as q1_avg,
       q4.avg_pts as q4_avg,
       q1.avg_pts - q4.avg_pts as q1_q4_diff
FROM quarter_avg q1
JOIN quarter_avg q4 ON q1.team_id = q4.team_id
JOIN teams t ON q1.team_id = t.team_id
WHERE q1.period_number = 1 AND q4.period_number = 4
ORDER BY q1_q4_diff DESC;
```

---

## Frontend Integration

### New API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/games/[gameId]/quarters` | Quarter scores for a game |
| `GET /api/teams/[abbr]/quarter-trends` | Team quarter averages |
| `GET /api/analysis/first-half` | 1H projections for today |
| `GET /api/analysis/quarter-props` | Q1 analysis for today |

### New Pages

| Page | Description |
|------|-------------|
| `/analysis/quarters` | Quarter betting dashboard |
| `/teams/[abbr]/quarters` | Team quarter breakdown |

### Enhance Existing

- H2H page: Add quarter splits section
- Game detail: Add quarter-by-quarter chart

---

## Agent Integration

### New db_tool.py Methods

```python
async def get_team_quarter_stats(self, team_id: int, last_n_games: int = 10):
    """Get team's quarter-by-quarter averages"""

async def get_team_first_half_stats(self, team_id: int, location: str = 'ALL'):
    """Get team's 1H scoring averages"""

async def get_game_quarter_scores(self, game_id: str):
    """Get quarter scores for a specific game"""
```

### data_scout.py Enhancements

Add quarter data to player/game context for props like:
- "Lakers Q1 over 28.5"
- "Celtics 1H -4.5"

### quant_analyst.py Enhancements

- Quarter prop edge calculation
- 1H total projection model

---

## Implementation Phases

### Phase 1: Database Foundation ✅
- [x] Migration 009: Create `period_scores` + `game_advanced_stats` + analytics tables
- [x] Test with sample data

### Phase 2: ETL Pipeline ✅
- [x] Create `fetch_period_scores.py`
- [x] Add to daily workflow (documented in script)
- [x] Ready for backfill current season (~30 min)

### Phase 3: Analytics ✅
- [x] Create `calculate_period_stats.py`
- [x] Ready for `run_all_analytics.py` integration

### Phase 4: Frontend ✅
- [x] API endpoints (`/api/analysis/quarters`, `/api/games/[gameId]/quarters`, `/api/teams/[teamId]/quarter-trends`)
- [x] Quarter analysis page (`/analysis/quarters`)
- [ ] H2H enhancement (optional future enhancement)

### Phase 5: Agent Integration ✅
- [x] db_tool.py methods (6 new methods added)
  - `get_team_quarter_stats()`
  - `get_team_first_half_stats()`
  - `get_game_quarter_scores()`
  - `get_q1_matchup_projection()`
  - `get_1h_matchup_projection()`
  - `get_team_all_quarter_trends()`
- [ ] data_scout.py context (optional future enhancement)
- [ ] quant_analyst.py edge calc (optional future enhancement)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| BoxScoreSummaryV2 deprecation | Monitor V3, add fallback |
| Rate limiting during backfill | 1.5s delay between calls |
| NBA API unavailability | Retry logic with exponential backoff |
| Missing OT data | Handle gracefully (OT fields can be 0) |

---

## Files to Create

| File | Purpose |
|------|---------|
| `1.DATABASE/migrations/009_period_scores.sql` | Schema migration |
| `1.DATABASE/etl/fetch_period_scores.py` | ETL script |
| `1.DATABASE/etl/analytics/calculate_period_stats.py` | Analytics |
| `frontend/src/app/api/analysis/quarters/route.ts` | API endpoint |
| `frontend/src/app/analysis/quarters/page.tsx` | Frontend page |

---

## Validation Checklist

- [x] Schema design approved
- [x] ETL approach confirmed
- [x] Betting use cases prioritized
- [x] Phase order agreed

## Files Created

| File | Status |
|------|--------|
| `1.DATABASE/migrations/009_period_scores.sql` | ✅ Created |
| `1.DATABASE/etl/fetch_period_scores.py` | ✅ Created |
| `1.DATABASE/etl/analytics/calculate_period_stats.py` | ✅ Created |
| `frontend/src/app/api/analysis/quarters/route.ts` | ✅ Created |
| `frontend/src/app/api/games/[gameId]/quarters/route.ts` | ✅ Created |
| `frontend/src/app/api/teams/[teamId]/quarter-trends/route.ts` | ✅ Created |
| `frontend/src/app/analysis/quarters/page.tsx` | ✅ Created |
| `betting-agent/src/tools/db_tool.py` | ✅ Updated (6 new methods) |

## Data Population Status

**Completed on 2024-12-12**:

```bash
# 1. ✅ Applied database migration
psql nba_stats < 1.DATABASE/migrations/009_period_scores.sql
# Result: 4 tables created (period_scores, game_advanced_stats, team_period_averages, team_half_averages)

# 2. ✅ Ran ETL to fetch period scores
python3 1.DATABASE/etl/fetch_period_scores.py
# Result: 361 games processed, 2936 period_scores, 361 game_advanced_stats
# Note: Uses NBA CDN endpoint (not BoxScoreSummaryV2 which returns None for quarters)

# 3. ✅ Calculated period statistics
python3 1.DATABASE/etl/analytics/calculate_period_stats.py
# Result: 436 team_period_averages, 180 team_half_averages

# 4. Test frontend page
npm run dev  # Then visit http://localhost:3000/analysis/quarters
```

**Data Counts**:
- `period_scores`: 2,936 rows (361 games × ~8 periods, some with OT)
- `game_advanced_stats`: 361 rows
- `team_period_averages`: 436 rows
- `team_half_averages`: 180 rows

---

## Q1 Value Analysis Feature

**Added on 2024-12-12**:

### New Files Created

| File | Purpose |
|------|---------|
| `frontend/src/lib/queries.ts` | Added 3 new Q1 query functions: `getQ1TeamStats()`, `getQ1ValueAnalysis()`, `getQ1Leaderboard()` |
| `frontend/src/app/api/analysis/q1-value/route.ts` | API endpoint for Q1 value analysis |
| `frontend/src/app/analysis/q1-value/page.tsx` | Q1 Moneyline Value Finder page |

### Features
- **Q1 Value Model**: Logistic regression on Q1 scoring margins (k=0.15 calibration factor)
- **Projections**: Opponent-adjusted Q1 scoring projections
- **Fair Odds**: Model-derived fair decimal odds for comparison with market odds
- **Leaderboards**: Best Q1 offense, defense, margin, and win percentage rankings
- **Team Stats Table**: Complete Q1 stats for all 30 teams

### Value Calculation Formula
```
Projected Q1 = (Team Q1 Avg + Opponent Q1 Allowed) / 2
Expected Margin = Home Projected - Away Projected
Model Win Prob = 1 / (1 + exp(-0.15 * margin))
Fair Odds = 1 / Model Win Prob
Edge = Model Prob - Implied Prob (from market odds)
```

### Access
- Page: `/analysis/q1-value`
- API: `/api/analysis/q1-value`
