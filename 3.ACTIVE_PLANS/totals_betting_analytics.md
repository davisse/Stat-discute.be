# Totals Betting Analytics Implementation Plan

**Created**: 2025-12-18
**Status**: IN PROGRESS - Phase 1 & 4 COMPLETE (Closing Lines Capture Implemented)
**Objective**: Build comprehensive totals betting analytics with historical backtesting capability
**Last Updated**: 2025-12-18 (Phase 4 completion)

---

## Executive Summary

Implement a complete totals betting analytics system covering:
1. **Period Scores Backfill** - Historical quarter-by-quarter data for 2024-25 season
2. **O/U Results Calculator** - Track actual over/under performance vs betting lines
3. **Closing Lines Storage** - Preserve historical odds for backtesting and CLV tracking

Expected outcome: Transform odds storage into actionable value identification platform.

---

## Implementation Status

### Phase 4: Closing Lines Capture - COMPLETED 2025-12-18

**Implemented Components**:

1. **Migration 013**: `013_closing_lines_capture.sql`
   - Added `hours_to_game` and `is_closing_line` columns to `betting_odds` table
   - Created `game_closing_lines` table for closing line snapshots
   - Created `game_ou_results` table for tracking actual O/U results
   - Added indexes for efficient queries

2. **Enhanced fetch_pinnacle_odds.py**:
   - Modified `store_market_odds()` to calculate `hours_to_game`
   - Automatically sets `is_closing_line = TRUE` for odds captured within 2 hours of game start
   - Logs closing line captures with special indicator

3. **Created capture_closing_lines.py**:
   - Dedicated script to capture closing lines for games starting soon
   - Finds games within configurable time window (default: 2 hours)
   - Consolidates latest odds from all market types:
     - Full game total, spread, moneyline
     - First half total and spread
     - First quarter total
     - Team totals (home/away)
   - Stores snapshot in `game_closing_lines` table
   - Marks source `betting_odds` records as closing lines
   - Includes dry-run mode for testing

**Usage**:
```bash
# Test in dry-run mode
python3 capture_closing_lines.py --dry-run --hours-window 2

# Run for production (capture games starting within 2 hours)
python3 capture_closing_lines.py

# Custom time window (e.g., 1 hour before games)
python3 capture_closing_lines.py --hours-window 1
```

**Cron Schedule Recommendation**:
```bash
# Run every 30 minutes during game days (4pm-11pm ET)
*/30 16-23 * * * cd /path/to/etl/betting && python3 capture_closing_lines.py >> /var/log/closing_lines.log 2>&1
```

**Validation Results**:
- Migration executed successfully without errors
- Tables and columns created with proper indexes
- Dry-run test completed successfully
- Script ready for production deployment

---

## Phase 1: Database Schema Enhancement ✅ COMPLETE

**Status**: ✅ Migration deployed successfully on 2025-12-18
**Migration File**: `1.DATABASE/migrations/010_totals_analytics.sql`

**Verification Results**:
- ✅ 2 tables created: `game_closing_lines`, `game_ou_results`
- ✅ 3 analytics views created: `v_totals_edge_calculator`, `v_team_ou_performance`, `v_period_scoring_patterns`
- ✅ `betting_odds` table enhanced with `is_closing_line` and `hours_to_game` columns
- ✅ All indexes created successfully
- ✅ All constraints and checks in place
- ✅ Migration logged in `sync_logs`

### Migration: `010_totals_analytics.sql`

```sql
-- =============================================
-- GAME CLOSING LINES TABLE
-- Captures final odds before game start
-- =============================================
CREATE TABLE IF NOT EXISTS game_closing_lines (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) REFERENCES games(game_id),
    bookmaker VARCHAR(50) DEFAULT 'pinnacle',

    -- Full Game Lines
    game_total_line DECIMAL(5,1),
    game_total_over_odds DECIMAL(6,3),
    game_total_under_odds DECIMAL(6,3),
    home_spread DECIMAL(5,1),
    home_spread_odds DECIMAL(6,3),
    away_spread_odds DECIMAL(6,3),
    home_moneyline DECIMAL(6,3),
    away_moneyline DECIMAL(6,3),

    -- First Half Lines
    first_half_total DECIMAL(5,1),
    first_half_over_odds DECIMAL(6,3),
    first_half_under_odds DECIMAL(6,3),
    first_half_spread DECIMAL(5,1),

    -- First Quarter Lines
    first_quarter_total DECIMAL(5,1),
    first_quarter_over_odds DECIMAL(6,3),
    first_quarter_under_odds DECIMAL(6,3),

    -- Team Totals
    home_team_total DECIMAL(5,1),
    home_team_over_odds DECIMAL(6,3),
    home_team_under_odds DECIMAL(6,3),
    away_team_total DECIMAL(5,1),
    away_team_over_odds DECIMAL(6,3),
    away_team_under_odds DECIMAL(6,3),

    -- Metadata
    recorded_at TIMESTAMP DEFAULT NOW(),
    game_start_time TIMESTAMP,
    hours_before_game DECIMAL(5,2),

    UNIQUE(game_id, bookmaker)
);

-- =============================================
-- GAME O/U RESULTS TABLE
-- Tracks actual results vs betting lines
-- =============================================
CREATE TABLE IF NOT EXISTS game_ou_results (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) REFERENCES games(game_id),

    -- Full Game Results
    game_total_line DECIMAL(5,1),
    actual_total INTEGER,
    game_total_result VARCHAR(5) CHECK (game_total_result IN ('OVER', 'UNDER', 'PUSH')),
    game_total_margin DECIMAL(5,1),  -- actual - line (positive = over)

    -- First Half Results
    first_half_line DECIMAL(5,1),
    actual_first_half INTEGER,
    first_half_result VARCHAR(5) CHECK (first_half_result IN ('OVER', 'UNDER', 'PUSH')),
    first_half_margin DECIMAL(5,1),

    -- First Quarter Results
    first_quarter_line DECIMAL(5,1),
    actual_first_quarter INTEGER,
    first_quarter_result VARCHAR(5) CHECK (first_quarter_result IN ('OVER', 'UNDER', 'PUSH')),
    first_quarter_margin DECIMAL(5,1),

    -- Home Team Total Results
    home_team_line DECIMAL(5,1),
    actual_home_score INTEGER,
    home_team_result VARCHAR(5) CHECK (home_team_result IN ('OVER', 'UNDER', 'PUSH')),
    home_team_margin DECIMAL(5,1),

    -- Away Team Total Results
    away_team_line DECIMAL(5,1),
    actual_away_score INTEGER,
    away_team_result VARCHAR(5) CHECK (away_team_result IN ('OVER', 'UNDER', 'PUSH')),
    away_team_margin DECIMAL(5,1),

    -- Spread Results (bonus)
    spread_line DECIMAL(5,1),
    actual_margin INTEGER,  -- home_score - away_score
    home_spread_result VARCHAR(5) CHECK (home_spread_result IN ('COVER', 'LOSS', 'PUSH')),

    bookmaker VARCHAR(50) DEFAULT 'pinnacle',
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(game_id, bookmaker)
);

-- =============================================
-- ENHANCE BETTING_ODDS TABLE
-- =============================================
ALTER TABLE betting_odds ADD COLUMN IF NOT EXISTS is_closing_line BOOLEAN DEFAULT FALSE;
ALTER TABLE betting_odds ADD COLUMN IF NOT EXISTS hours_to_game DECIMAL(5,2);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_gcl_game_id ON game_closing_lines(game_id);
CREATE INDEX IF NOT EXISTS idx_gcl_bookmaker ON game_closing_lines(bookmaker);
CREATE INDEX IF NOT EXISTS idx_gor_game_id ON game_ou_results(game_id);
CREATE INDEX IF NOT EXISTS idx_gor_game_result ON game_ou_results(game_total_result);
CREATE INDEX IF NOT EXISTS idx_gor_1h_result ON game_ou_results(first_half_result);
CREATE INDEX IF NOT EXISTS idx_gor_1q_result ON game_ou_results(first_quarter_result);
CREATE INDEX IF NOT EXISTS idx_betting_odds_closing ON betting_odds(event_id, is_closing_line)
    WHERE is_closing_line = TRUE;

-- =============================================
-- ANALYTICS VIEW: TOTALS EDGE CALCULATOR
-- =============================================
CREATE OR REPLACE VIEW v_totals_edge_calculator AS
SELECT
    g.game_id,
    g.game_date,
    g.season,
    ht.abbreviation as home_team,
    at.abbreviation as away_team,
    gcl.game_total_line,

    -- Pace-adjusted projection formula
    ROUND(
        ((home_stats.avg_pace + away_stats.avg_pace) / 2) *
        ((home_stats.avg_ortg + away_stats.avg_drtg + away_stats.avg_ortg + home_stats.avg_drtg) / 200)
    , 1) as projected_total,

    -- Edge calculation
    ROUND(
        ((home_stats.avg_pace + away_stats.avg_pace) / 2) *
        ((home_stats.avg_ortg + away_stats.avg_drtg + away_stats.avg_ortg + home_stats.avg_drtg) / 200)
        - gcl.game_total_line
    , 1) as edge,

    -- Team averages
    home_stats.avg_points as home_avg_pts,
    away_stats.avg_points as away_avg_pts,
    home_stats.avg_pace as home_pace,
    away_stats.avg_pace as away_pace,
    home_stats.avg_ortg as home_ortg,
    home_stats.avg_drtg as home_drtg,
    away_stats.avg_ortg as away_ortg,
    away_stats.avg_drtg as away_drtg

FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
LEFT JOIN game_closing_lines gcl ON g.game_id = gcl.game_id
LEFT JOIN LATERAL (
    SELECT
        AVG(tgs.points) as avg_points,
        AVG(tgs.pace) as avg_pace,
        AVG(tgs.offensive_rating) as avg_ortg,
        AVG(tgs.defensive_rating) as avg_drtg
    FROM team_game_stats tgs
    JOIN games g2 ON tgs.game_id = g2.game_id
    WHERE tgs.team_id = g.home_team_id
    AND g2.season = g.season
    AND g2.game_date < g.game_date
) home_stats ON true
LEFT JOIN LATERAL (
    SELECT
        AVG(tgs.points) as avg_points,
        AVG(tgs.pace) as avg_pace,
        AVG(tgs.offensive_rating) as avg_ortg,
        AVG(tgs.defensive_rating) as avg_drtg
    FROM team_game_stats tgs
    JOIN games g2 ON tgs.game_id = g2.game_id
    WHERE tgs.team_id = g.away_team_id
    AND g2.season = g.season
    AND g2.game_date < g.game_date
) away_stats ON true;

-- =============================================
-- ANALYTICS VIEW: TEAM O/U PERFORMANCE
-- =============================================
CREATE OR REPLACE VIEW v_team_ou_performance AS
SELECT
    t.team_id,
    t.abbreviation,
    t.full_name,
    g.season,
    COUNT(*) as games_played,

    -- Full Game O/U
    SUM(CASE WHEN gor.game_total_result = 'OVER' THEN 1 ELSE 0 END) as game_overs,
    SUM(CASE WHEN gor.game_total_result = 'UNDER' THEN 1 ELSE 0 END) as game_unders,
    SUM(CASE WHEN gor.game_total_result = 'PUSH' THEN 1 ELSE 0 END) as game_pushes,
    ROUND(AVG(gor.game_total_margin), 1) as avg_game_margin,

    -- First Half O/U
    SUM(CASE WHEN gor.first_half_result = 'OVER' THEN 1 ELSE 0 END) as half_overs,
    SUM(CASE WHEN gor.first_half_result = 'UNDER' THEN 1 ELSE 0 END) as half_unders,
    ROUND(AVG(gor.first_half_margin), 1) as avg_half_margin,

    -- First Quarter O/U
    SUM(CASE WHEN gor.first_quarter_result = 'OVER' THEN 1 ELSE 0 END) as quarter_overs,
    SUM(CASE WHEN gor.first_quarter_result = 'UNDER' THEN 1 ELSE 0 END) as quarter_unders,
    ROUND(AVG(gor.first_quarter_margin), 1) as avg_quarter_margin,

    -- Team Total O/U (when team is home)
    SUM(CASE WHEN g.home_team_id = t.team_id AND gor.home_team_result = 'OVER' THEN 1
             WHEN g.away_team_id = t.team_id AND gor.away_team_result = 'OVER' THEN 1
             ELSE 0 END) as team_total_overs,
    SUM(CASE WHEN g.home_team_id = t.team_id AND gor.home_team_result = 'UNDER' THEN 1
             WHEN g.away_team_id = t.team_id AND gor.away_team_result = 'UNDER' THEN 1
             ELSE 0 END) as team_total_unders

FROM teams t
JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
LEFT JOIN game_ou_results gor ON g.game_id = gor.game_id
WHERE g.game_status = 'Final'
GROUP BY t.team_id, t.abbreviation, t.full_name, g.season;

-- =============================================
-- ANALYTICS VIEW: PERIOD SCORING PATTERNS
-- =============================================
CREATE OR REPLACE VIEW v_period_scoring_patterns AS
SELECT
    t.abbreviation,
    t.team_id,
    tpa.season,
    tpa.period_number,
    tpa.period_type,
    tpa.location,
    tpa.games_played,
    ROUND(tpa.avg_points, 1) as team_avg,
    ROUND(tpa.avg_allowed, 1) as opp_avg,
    ROUND(tpa.avg_points + tpa.avg_allowed, 1) as period_total_avg,
    ROUND(tpa.period_win_pct * 100, 1) as period_win_pct
FROM team_period_averages tpa
JOIN teams t ON tpa.team_id = t.team_id
WHERE tpa.period_type = 'Q';
```

---

## Phase 2: Period Scores Backfill ETL

### File: `1.DATABASE/etl/fetch_period_scores.py`

**Purpose**: Generic fetcher for quarter-by-quarter scores from NBA API

**NBA API Endpoint**: `stats.nba.com/stats/boxscoresummaryv2`
- Returns `LineScore` resultSet with: PTS_QTR1, PTS_QTR2, PTS_QTR3, PTS_QTR4, PTS_OT1-4
- Required headers: Same as existing fetch_player_stats_direct.py

**Core Logic**:
```python
def fetch_game_period_scores(game_id):
    """Fetch quarter-by-quarter scores from NBA API"""
    url = "https://stats.nba.com/stats/boxscoresummaryv2"
    params = {
        "GameID": game_id,
        "StartPeriod": 0,
        "EndPeriod": 14,  # Support up to 4 OT
        "StartRange": 0,
        "EndRange": 0,
        "RangeType": 0
    }

    response = requests.get(url, headers=NBA_HEADERS, params=params)
    data = response.json()

    # LineScore is resultSet index 5
    line_scores = data['resultSets'][5]
    return parse_line_scores(game_id, line_scores)

def parse_line_scores(game_id, line_scores):
    """Parse LineScore into period_scores records"""
    records = []
    headers = line_scores['headers']

    # Find column indices
    team_id_idx = headers.index('TEAM_ID')
    q1_idx = headers.index('PTS_QTR1')
    q2_idx = headers.index('PTS_QTR2')
    q3_idx = headers.index('PTS_QTR3')
    q4_idx = headers.index('PTS_QTR4')

    for team_row in line_scores['rowSet']:
        team_id = team_row[team_id_idx]

        # Q1-Q4 always exist
        for q, idx in enumerate([q1_idx, q2_idx, q3_idx, q4_idx], 1):
            pts = team_row[idx] or 0
            records.append({
                'game_id': game_id,
                'team_id': team_id,
                'period_number': q,
                'period_type': 'Q',
                'points': pts,
                'is_first_half': q <= 2
            })

        # Check for OT periods (indices after Q4)
        for ot in range(1, 5):
            ot_header = f'PTS_OT{ot}'
            if ot_header in headers:
                ot_idx = headers.index(ot_header)
                ot_pts = team_row[ot_idx]
                if ot_pts and ot_pts > 0:
                    records.append({
                        'game_id': game_id,
                        'team_id': team_id,
                        'period_number': ot,
                        'period_type': 'OT',
                        'points': ot_pts,
                        'is_first_half': False
                    })

    return records
```

### File: `1.DATABASE/etl/backfill_period_scores_2024.py`

**Purpose**: Batch job to fetch all 2024-25 season period scores

**Execution Strategy**:
1. Query all game_ids from 2024-25 season (~1,214 games)
2. Filter out games already in period_scores
3. Batch in groups of 50 with checkpoint file
4. Rate limit: 1 request per 0.5 seconds (~10 mins total)
5. Insert with ON CONFLICT DO UPDATE

**Validation**:
- After completion, verify SUM(Q1+Q2+Q3+Q4+OT) = team_game_stats.points
- Log any discrepancies for manual review

**Expected Output**: ~9,712 records (1,214 games × 8 periods × 2 teams, minus OT)

---

## Phase 3: O/U Results Calculator

### File: `1.DATABASE/etl/betting/calculate_ou_results.py`

**Purpose**: Match completed games with stored betting lines, calculate O/U results

**Core Logic**:
```python
def calculate_ou_results():
    """Calculate O/U results for all completed games with stored lines"""

    query = """
    SELECT
        g.game_id,
        g.game_date,
        g.season,

        -- Actual scores
        tgs_home.points as home_pts,
        tgs_away.points as away_pts,

        -- Period scores
        (SELECT SUM(points) FROM period_scores ps
         WHERE ps.game_id = g.game_id AND ps.period_number = 1 AND ps.period_type = 'Q') as q1_total,
        (SELECT SUM(points) FROM period_scores ps
         WHERE ps.game_id = g.game_id AND ps.is_first_half = true AND ps.period_type = 'Q') as first_half_total,

        -- Closing lines
        gcl.game_total_line,
        gcl.first_half_total as first_half_line,
        gcl.first_quarter_total as first_quarter_line,
        gcl.home_team_total as home_team_line,
        gcl.away_team_total as away_team_line,
        gcl.home_spread as spread_line

    FROM games g
    JOIN team_game_stats tgs_home ON g.game_id = tgs_home.game_id
        AND tgs_home.team_id = g.home_team_id
    JOIN team_game_stats tgs_away ON g.game_id = tgs_away.game_id
        AND tgs_away.team_id = g.away_team_id
    LEFT JOIN game_closing_lines gcl ON g.game_id = gcl.game_id
    WHERE g.game_status = 'Final'
    AND gcl.game_total_line IS NOT NULL
    """

    for game in cursor.fetchall():
        actual_total = game['home_pts'] + game['away_pts']

        # Game total result
        game_result = determine_result(actual_total, game['game_total_line'])
        game_margin = actual_total - game['game_total_line']

        # First half result
        if game['first_half_total'] and game['first_half_line']:
            half_result = determine_result(game['first_half_total'], game['first_half_line'])
            half_margin = game['first_half_total'] - game['first_half_line']

        # First quarter result
        if game['q1_total'] and game['first_quarter_line']:
            quarter_result = determine_result(game['q1_total'], game['first_quarter_line'])
            quarter_margin = game['q1_total'] - game['first_quarter_line']

        # Home/Away team totals
        home_result = determine_result(game['home_pts'], game['home_team_line'])
        away_result = determine_result(game['away_pts'], game['away_team_line'])

        # Spread result
        actual_margin = game['home_pts'] - game['away_pts']
        spread_result = determine_spread_result(actual_margin, game['spread_line'])

        # Insert into game_ou_results
        insert_ou_result(game['game_id'], ...)

def determine_result(actual, line):
    """Determine OVER/UNDER/PUSH"""
    if actual > line:
        return 'OVER'
    elif actual < line:
        return 'UNDER'
    else:
        return 'PUSH'

def determine_spread_result(actual_margin, spread):
    """Determine COVER/LOSS/PUSH for home team"""
    adjusted = actual_margin + spread  # spread is typically negative for favorite
    if adjusted > 0:
        return 'COVER'
    elif adjusted < 0:
        return 'LOSS'
    else:
        return 'PUSH'
```

### File: `1.DATABASE/etl/betting/update_ats_performance.py`

**Purpose**: Aggregate O/U results into ats_performance table

**SQL Update**:
```sql
UPDATE ats_performance ap
SET
    over_record = subq.overs,
    under_record = subq.unders,
    ou_pushes = subq.pushes,
    last_updated = NOW()
FROM (
    SELECT
        t.team_id,
        g.season as season_id,
        SUM(CASE WHEN gor.game_total_result = 'OVER' THEN 1 ELSE 0 END) as overs,
        SUM(CASE WHEN gor.game_total_result = 'UNDER' THEN 1 ELSE 0 END) as unders,
        SUM(CASE WHEN gor.game_total_result = 'PUSH' THEN 1 ELSE 0 END) as pushes
    FROM teams t
    JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
    JOIN game_ou_results gor ON g.game_id = gor.game_id
    GROUP BY t.team_id, g.season
) subq
WHERE ap.team_id = subq.team_id
AND ap.season_id = subq.season_id;
```

---

## Phase 4: Closing Lines Storage

### Enhanced `fetch_pinnacle_odds.py`

**Modifications**:
1. Add `hours_to_game` calculation based on game start time
2. Add `is_closing_line` marking for last fetch before game
3. Create `game_closing_lines` snapshot when game is about to start

**Closing Line Capture Logic**:
```python
def capture_closing_lines(game_id, event_id):
    """Capture closing lines for a game before it starts"""

    # Get all market types for this event
    markets_query = """
    SELECT
        bm.market_type,
        bm.market_key,
        bo.line,
        bo.over_odds,
        bo.under_odds,
        bo.recorded_at
    FROM betting_markets bm
    JOIN betting_odds bo ON bm.market_id = bo.market_id
    WHERE bm.event_id = %s
    AND bo.recorded_at = (
        SELECT MAX(recorded_at) FROM betting_odds
        WHERE market_id = bm.market_id
    )
    """

    # Parse and organize by market type
    closing_data = {
        'game_id': game_id,
        'bookmaker': 'pinnacle'
    }

    for market in markets:
        if 'Full Game Total' in market['market_key']:
            closing_data['game_total_line'] = market['line']
            closing_data['game_total_over_odds'] = market['over_odds']
            closing_data['game_total_under_odds'] = market['under_odds']
        elif '1st Half Total' in market['market_key']:
            closing_data['first_half_total'] = market['line']
            # ... etc

    # Insert into game_closing_lines
    insert_closing_lines(closing_data)

    # Mark these odds as closing lines
    mark_closing_lines(event_id)

def mark_closing_lines(event_id):
    """Mark the last recorded odds as closing lines"""
    cursor.execute("""
        UPDATE betting_odds bo
        SET is_closing_line = TRUE
        WHERE bo.market_id IN (
            SELECT market_id FROM betting_markets WHERE event_id = %s
        )
        AND bo.recorded_at = (
            SELECT MAX(recorded_at) FROM betting_odds bo2
            WHERE bo2.market_id = bo.market_id
        )
    """, [event_id])
```

### Scheduled Closing Line Capture

**Cron Strategy**:
```bash
# Run 30 minutes before each game start window
# NBA games typically start at: 7pm, 7:30pm, 8pm, 9pm, 10pm, 10:30pm ET

0 18,19,20,21,22 * * * python3 capture_closing_lines.py  # 30 mins before common start times
30 18,19,21 * * * python3 capture_closing_lines.py       # Additional 30-min marks
```

**Alternative**: Real-time detection
- Poll Pinnacle every 5 minutes
- Detect when market disappears (game started)
- Capture last known odds as closing line

---

## Phase 5: Value Identification Analytics

### File: `1.DATABASE/etl/analytics/calculate_totals_projections.py`

**Purpose**: Generate pace-adjusted total projections for upcoming games

**Projection Formula**:
```python
def calculate_projected_total(home_team_id, away_team_id, season):
    """Calculate pace-adjusted total projection"""

    # Get team stats (last 10 games for recency)
    home_stats = get_team_recent_stats(home_team_id, season, games=10)
    away_stats = get_team_recent_stats(away_team_id, season, games=10)

    # Base projection: Average of both teams' game totals
    base_total = (home_stats['avg_total'] + away_stats['avg_total']) / 2

    # Pace adjustment
    league_avg_pace = get_league_avg_pace(season)
    matchup_pace = (home_stats['pace'] + away_stats['pace']) / 2
    pace_factor = matchup_pace / league_avg_pace

    # Efficiency-based projection
    # Expected points = Possessions × (Points per possession)
    home_expected = matchup_pace * (home_stats['ortg'] + away_stats['drtg']) / 200
    away_expected = matchup_pace * (away_stats['ortg'] + home_stats['drtg']) / 200
    efficiency_total = home_expected + away_expected

    # Weighted average (60% efficiency, 40% historical)
    projected_total = 0.6 * efficiency_total + 0.4 * base_total

    # Adjustments
    adjustments = {
        'rest_advantage': calculate_rest_adjustment(home_team_id, away_team_id),
        'back_to_back': calculate_b2b_adjustment(home_team_id, away_team_id),
        'travel': calculate_travel_adjustment(away_team_id),
        'altitude': calculate_altitude_adjustment(home_team_id),  # Denver factor
    }

    final_projection = projected_total + sum(adjustments.values())

    return {
        'projected_total': round(final_projection, 1),
        'confidence': calculate_confidence(home_stats, away_stats),
        'adjustments': adjustments
    }
```

### File: `1.DATABASE/etl/analytics/identify_value_bets.py`

**Purpose**: Compare projections vs betting lines, identify value opportunities

**Value Criteria**:
```python
def identify_value_bets(date):
    """Find games with edge > threshold"""

    games = get_games_for_date(date)
    value_bets = []

    for game in games:
        projection = calculate_projected_total(
            game['home_team_id'],
            game['away_team_id'],
            game['season']
        )

        line = get_current_line(game['game_id'])

        if not line:
            continue

        edge = projection['projected_total'] - line['game_total']

        # Value thresholds
        if abs(edge) >= 3.0 and projection['confidence'] >= 0.65:
            value_bets.append({
                'game_id': game['game_id'],
                'matchup': f"{game['away_team']} @ {game['home_team']}",
                'line': line['game_total'],
                'projection': projection['projected_total'],
                'edge': edge,
                'direction': 'OVER' if edge > 0 else 'UNDER',
                'confidence': projection['confidence'],
                'reasoning': generate_reasoning(game, projection, edge)
            })

    return sorted(value_bets, key=lambda x: abs(x['edge']), reverse=True)
```

### Situational Trends Analysis

**Key Situations to Track**:
```python
SITUATIONS = {
    'both_b2b': {
        'description': 'Both teams on back-to-back',
        'expected_trend': 'UNDER',
        'reason': 'Fatigue reduces pace and efficiency'
    },
    'road_after_loss': {
        'description': 'Road team coming off loss',
        'expected_trend': 'OVER',
        'reason': 'Urgency leads to faster pace'
    },
    'division_rivalry': {
        'description': 'Division game',
        'expected_trend': 'UNDER',
        'reason': 'Familiarity breeds defensive focus'
    },
    'high_pace_matchup': {
        'description': 'Both teams top-10 pace',
        'expected_trend': 'OVER',
        'reason': 'More possessions = more scoring opportunities'
    },
    'elite_defense_matchup': {
        'description': 'At least one top-5 defensive team',
        'expected_trend': 'UNDER',
        'reason': 'Elite defense suppresses scoring'
    },
    'altitude_game': {
        'description': 'Game in Denver',
        'expected_trend': 'OVER',
        'reason': 'Altitude affects visiting teams, faster pace'
    }
}
```

---

## Implementation Timeline

| Phase | Component | Duration | Dependencies |
|-------|-----------|----------|--------------|
| 1 | Migration 010 | 1 hour | None |
| 2 | Period scores backfill | 2-3 hours | Phase 1 |
| 3 | O/U results calculator | 2 hours | Phase 1 |
| 4 | Closing lines capture | 2 hours | Phase 3 |
| 5 | Value identification | 3 hours | Phases 2-4 |
| 6 | Frontend integration | 4 hours | Phase 5 |

**Total Estimated**: 1-2 days

---

## Expected Outcomes

### Data Coverage
- **Full Game Totals**: 100% coverage for games with stored lines
- **1st Half Totals**: 100% coverage (2025-26), backfilled (2024-25)
- **1st Quarter Totals**: 100% coverage (2025-26), backfilled (2024-25)
- **Team Totals**: 100% coverage for games with team total lines

### Analytics Capabilities
1. **Projection Accuracy**: Target MAE < 8 points vs actual totals
2. **Value Bet ROI**: Track bets where edge > 3 points
3. **Situational Profitability**: Identify trends with > 55% hit rate
4. **CLV Tracking**: Measure bet quality vs market efficiency

### Insights Delivered
- Pre-game totals edge scores with confidence levels
- Period-specific value alerts (Q1/1H trends)
- Situational trend alerts (B2B, rest, travel)
- Team O/U tendencies by home/away
- Historical closing line accuracy

---

## Validation Checklist

### Phase 1 Validation
- [ ] Migration runs without errors
- [ ] All indexes created successfully
- [ ] Views return expected data structure

### Phase 2 Validation
- [ ] Period scores match final scores (SUM check)
- [ ] All 2024-25 games have period scores
- [ ] OT periods captured correctly

### Phase 3 Validation
- [ ] O/U results match manual spot-checks
- [ ] ats_performance over/under records populated
- [ ] Push cases handled correctly

### Phase 4 Validation
- [ ] Closing lines captured within 30 mins of game start
- [ ] All market types (full game, 1H, 1Q, team totals) captured
- [ ] is_closing_line flag set correctly

### Phase 5 Validation
- [ ] Projections within reasonable range (190-260)
- [ ] Value bets identified match edge criteria
- [ ] Situational trends statistically significant (n > 20)

---

## File Structure Summary

```
1.DATABASE/
├── migrations/
│   └── 010_totals_analytics.sql           # Schema enhancement
├── etl/
│   ├── fetch_period_scores.py             # Generic period fetcher
│   ├── backfill_period_scores_2024.py     # 2024-25 backfill job
│   ├── betting/
│   │   ├── fetch_pinnacle_odds.py         # Enhanced with closing lines
│   │   ├── calculate_ou_results.py        # O/U results calculator
│   │   └── update_ats_performance.py      # Aggregate O/U records
│   ├── analytics/
│   │   ├── calculate_period_averages.py   # Existing (ensure runs)
│   │   ├── calculate_totals_projections.py # Pace-adjusted projections
│   │   ├── identify_value_bets.py         # Value detection
│   │   └── generate_situational_trends.py # Trend analysis
│   └── daily_totals_pipeline.py           # Orchestrator script

frontend/src/
├── lib/
│   └── queries/
│       └── totals.ts                      # Totals-specific queries
├── app/
│   └── betting/
│       └── totals/
│           ├── page.tsx                   # Totals dashboard
│           └── components/
│               ├── TotalsEdgeCard.tsx
│               ├── PeriodTrendsTable.tsx
│               └── SituationalAlerts.tsx
```

---

## Notes

- All decimal odds (European format) used throughout
- Pinnacle as primary bookmaker (most efficient odds)
- NBA API rate limiting: 1 req/0.5sec conservative
- Closing line capture within 30 mins of game start
- Edge threshold: 3+ points for value classification
- Confidence threshold: 65%+ for value bet recommendation

---

**Status**: PHASE 3 SCRIPTS CREATED - 2025-12-18

**Completed**:
- ✅ Created `calculate_ou_results.py` - O/U results calculator
- ✅ Created `update_ats_performance.py` - ATS performance aggregator

**Next Steps**:
1. Create migration 010_totals_analytics.sql (from plan Phase 1)
2. Run migration on nba_stats database
3. Execute period scores backfill (Phase 2)
4. Test O/U calculator with existing data
5. Set up closing lines capture (Phase 4)
6. Build frontend components (Phase 6)

**Important Notes**:
- Scripts created but require migration 010 tables: `game_closing_lines`, `game_ou_results`
- Scripts follow database patterns from existing `fetch_pinnacle_odds.py`
- Both scripts support --dry-run for testing before database writes
- ATS performance updater calculates: O/U records, ATS records, home/away/favorite/underdog splits
