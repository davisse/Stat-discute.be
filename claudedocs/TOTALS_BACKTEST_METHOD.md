# Totals Backtest Method

## Overview

This document describes the systematic backtesting approach for validating the 5-method totals analysis framework against historical game results.

**Purpose**: Measure prediction accuracy and identify profitable signal patterns across any NBA season dataset.

---

## Prerequisites

### Required Tables
```sql
games              -- Game schedule with scores
teams              -- Team identifiers
team_game_stats    -- Team box scores (points, pace, ratings)
betting_events     -- Betting event metadata
betting_markets    -- Market types and identifiers
betting_odds       -- Lines and odds data
```

### Required Data
- Completed games with final scores (`home_team_score IS NOT NULL`)
- Betting lines for game totals (`market_key LIKE '0_game_total%'`)
- Team statistics (PPG, ORtg, DRtg, pace)

---

## Configuration Parameters

```sql
-- Season to backtest (change this for different seasons)
SET session.backtest_season = '2025-26';

-- Or use a variable in your scripts:
-- $SEASON = '2025-26'
-- $SEASON = '2024-25'
-- $SEASON = '2023-24'
```

---

## Step 1: Identify Games with Betting Data

Query all completed games that have associated betting lines.

```sql
WITH game_betting AS (
    SELECT DISTINCT
        g.game_id,
        g.game_date,
        g.home_team_id,
        g.away_team_id,
        ht.abbreviation as home_team,
        at.abbreviation as away_team,
        g.home_team_score,
        g.away_team_score,
        g.home_team_score + g.away_team_score as actual_total,
        be.event_id
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    JOIN betting_events be ON g.game_date = be.event_start_time::date
        AND be.raw_data::text LIKE '%' || ht.full_name || '%'
    WHERE g.season = '[SEASON]'  -- PARAMETER: Change season here
    AND g.home_team_score IS NOT NULL
)
SELECT COUNT(*) as games_with_betting FROM game_betting;
```

---

## Step 2: Extract Betting Lines

Get the main game total line (closest to standard -110 odds / 1.91 decimal).

```sql
game_lines AS (
    SELECT
        gb.*,
        bo.handicap as game_line,
        ROW_NUMBER() OVER (
            PARTITION BY gb.game_id
            ORDER BY ABS(bo.odds_decimal - 1.91)
        ) as rn
    FROM game_betting gb
    JOIN betting_markets bm ON gb.event_id = bm.event_id
    JOIN betting_odds bo ON bm.market_id = bo.market_id
    WHERE bm.market_key LIKE '0_game_total%'
    AND bo.selection LIKE 'Over%'
)
-- Filter to main line only
SELECT * FROM game_lines WHERE rn = 1;
```

---

## Step 3: Calculate Team Statistics

### Season-to-Date Stats
```sql
team_stats AS (
    SELECT
        t.team_id,
        t.abbreviation,
        AVG(tgs.points) as season_ppg,
        AVG(CASE WHEN tgs.team_id = g.home_team_id THEN tgs.points END) as home_ppg,
        AVG(CASE WHEN tgs.team_id = g.away_team_id THEN tgs.points END) as away_ppg,
        AVG(tgs.offensive_rating) as ortg,
        AVG(tgs.defensive_rating) as drtg,
        AVG(tgs.pace) as pace
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    JOIN teams t ON tgs.team_id = t.team_id
    WHERE g.season = '[SEASON]'  -- PARAMETER
    AND g.home_team_score IS NOT NULL
    GROUP BY t.team_id, t.abbreviation
)
```

### Last 5 Games Stats
```sql
last5_stats AS (
    SELECT team_id, AVG(points) as last5_ppg
    FROM (
        SELECT
            t.team_id,
            tgs.points,
            ROW_NUMBER() OVER (
                PARTITION BY t.team_id
                ORDER BY g.game_date DESC
            ) as rn
        FROM team_game_stats tgs
        JOIN games g ON tgs.game_id = g.game_id
        JOIN teams t ON tgs.team_id = t.team_id
        WHERE g.season = '[SEASON]'  -- PARAMETER
        AND g.home_team_score IS NOT NULL
    ) x
    WHERE rn <= 5
    GROUP BY team_id
)
```

### League Average Defensive Rating
```sql
league_avg AS (
    SELECT AVG(defensive_rating) as league_drtg
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    WHERE g.season = '[SEASON]'  -- PARAMETER
    AND g.home_team_score IS NOT NULL
)
```

---

## Step 4: Calculate Expected Totals (5 Methods)

```sql
game_analysis AS (
    SELECT
        gl.game_id,
        gl.game_date,
        gl.home_team,
        gl.away_team,
        gl.actual_total,
        gl.game_line,

        -- Method 1: Season PPG Average
        (hs.season_ppg + aws.season_ppg) as m1_season_ppg,

        -- Method 2: Location-Adjusted PPG
        (hs.home_ppg + aws.away_ppg) as m2_location_ppg,

        -- Method 3: vs Defense Adjusted
        (hs.home_ppg * (aws.drtg / la.league_drtg) +
         aws.away_ppg * (hs.drtg / la.league_drtg)) as m3_vs_defense,

        -- Method 4: Last 5 Games
        (hl5.last5_ppg + al5.last5_ppg) as m4_last5,

        -- Method 5: ORtg/DRtg Efficiency Matchup
        (((hs.ortg + aws.drtg) / 2 * (hs.pace / 100)) +
         ((aws.ortg + hs.drtg) / 2 * (aws.pace / 100))) as m5_efficiency,

        -- Average of all 5 methods
        ((hs.season_ppg + aws.season_ppg) +
         (hs.home_ppg + aws.away_ppg) +
         (hs.home_ppg * (aws.drtg / la.league_drtg) +
          aws.away_ppg * (hs.drtg / la.league_drtg)) +
         (hl5.last5_ppg + al5.last5_ppg) +
         (((hs.ortg + aws.drtg) / 2 * (hs.pace / 100)) +
          ((aws.ortg + hs.drtg) / 2 * (aws.pace / 100)))
        ) / 5 as avg_expected

    FROM game_lines gl
    JOIN team_stats hs ON gl.home_team_id = hs.team_id
    JOIN team_stats aws ON gl.away_team_id = aws.team_id
    JOIN last5_stats hl5 ON gl.home_team_id = hl5.team_id
    JOIN last5_stats al5 ON gl.away_team_id = al5.team_id
    CROSS JOIN league_avg la
    WHERE gl.rn = 1
)
```

---

## Step 5: Calculate Edge and Classify Signals

```sql
results AS (
    SELECT
        game_date,
        home_team || ' vs ' || away_team as matchup,
        actual_total,
        game_line,
        ROUND(avg_expected::numeric, 1) as expected,
        ROUND((avg_expected - game_line)::numeric, 1) as edge,

        -- Signal Classification
        CASE
            WHEN avg_expected - game_line > 5 THEN 'Strong OVER'
            WHEN avg_expected - game_line > 2 THEN 'Moderate OVER'
            WHEN avg_expected - game_line < -5 THEN 'Strong UNDER'
            WHEN avg_expected - game_line < -2 THEN 'Moderate UNDER'
            ELSE 'PUSH'
        END as signal,

        -- Actual Result
        CASE
            WHEN actual_total > game_line THEN 'OVER'
            WHEN actual_total < game_line THEN 'UNDER'
            ELSE 'PUSH'
        END as actual_result,

        -- Outcome (WIN/LOSS)
        CASE
            WHEN avg_expected > game_line AND actual_total > game_line THEN 'WIN'
            WHEN avg_expected < game_line AND actual_total < game_line THEN 'WIN'
            WHEN actual_total = game_line THEN 'PUSH'
            ELSE 'LOSS'
        END as outcome

    FROM game_analysis
)
SELECT * FROM results ORDER BY game_date;
```

---

## Step 6: Aggregate Performance Metrics

### By Signal Type
```sql
SELECT
    signal,
    COUNT(*) as bets,
    SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
    COUNT(*) - SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as losses,
    ROUND(100.0 * SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) /
          COUNT(*)::numeric, 1) as win_pct
FROM results
GROUP BY signal
ORDER BY
    CASE signal
        WHEN 'Strong OVER' THEN 1
        WHEN 'Moderate OVER' THEN 2
        WHEN 'PUSH' THEN 3
        WHEN 'Moderate UNDER' THEN 4
        WHEN 'Strong UNDER' THEN 5
    END;
```

### By Edge Size (Absolute)
```sql
SELECT
    CASE
        WHEN ABS(edge) > 10 THEN '10+ pts edge'
        WHEN ABS(edge) > 5 THEN '5-10 pts edge'
        WHEN ABS(edge) > 2 THEN '2-5 pts edge'
        ELSE '0-2 pts (no edge)'
    END as edge_bucket,
    COUNT(*) as bets,
    SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
    ROUND(100.0 * SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) /
          COUNT(*)::numeric, 1) as win_pct,
    ROUND(AVG(ABS(edge))::numeric, 1) as avg_edge
FROM results
GROUP BY
    CASE
        WHEN ABS(edge) > 10 THEN '10+ pts edge'
        WHEN ABS(edge) > 5 THEN '5-10 pts edge'
        WHEN ABS(edge) > 2 THEN '2-5 pts edge'
        ELSE '0-2 pts (no edge)'
    END
ORDER BY avg_edge DESC;
```

### OVER vs UNDER
```sql
SELECT
    CASE WHEN edge > 0 THEN 'OVER' ELSE 'UNDER' END as direction,
    COUNT(*) as bets,
    SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
    ROUND(100.0 * SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) /
          COUNT(*)::numeric, 1) as win_pct
FROM results
WHERE signal != 'PUSH'
GROUP BY CASE WHEN edge > 0 THEN 'OVER' ELSE 'UNDER' END;
```

---

## Step 7: Method Accuracy Analysis

Compare individual method prediction errors:

```sql
SELECT
    'M1: Season PPG' as method,
    ROUND(AVG(ABS(actual_total - m1_season_ppg))::numeric, 1) as avg_error,
    ROUND(STDDEV(actual_total - m1_season_ppg)::numeric, 1) as std_dev
FROM game_analysis
UNION ALL
SELECT 'M2: Location PPG',
    ROUND(AVG(ABS(actual_total - m2_location_ppg))::numeric, 1),
    ROUND(STDDEV(actual_total - m2_location_ppg)::numeric, 1)
FROM game_analysis
UNION ALL
SELECT 'M3: vs Defense',
    ROUND(AVG(ABS(actual_total - m3_vs_defense))::numeric, 1),
    ROUND(STDDEV(actual_total - m3_vs_defense)::numeric, 1)
FROM game_analysis
UNION ALL
SELECT 'M4: Last 5 Games',
    ROUND(AVG(ABS(actual_total - m4_last5))::numeric, 1),
    ROUND(STDDEV(actual_total - m4_last5)::numeric, 1)
FROM game_analysis
UNION ALL
SELECT 'M5: ORtg/DRtg',
    ROUND(AVG(ABS(actual_total - m5_efficiency))::numeric, 1),
    ROUND(STDDEV(actual_total - m5_efficiency)::numeric, 1)
FROM game_analysis
UNION ALL
SELECT 'AVG (5 Methods)',
    ROUND(AVG(ABS(actual_total - avg_expected))::numeric, 1),
    ROUND(STDDEV(actual_total - avg_expected)::numeric, 1)
FROM game_analysis
ORDER BY avg_error;
```

---

## Step 8: ROI Calculation

Calculate return on investment assuming flat betting at standard odds:

```sql
SELECT
    signal,
    COUNT(*) as bets,
    SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
    ROUND(100.0 * SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) /
          COUNT(*)::numeric, 1) as win_pct,
    -- ROI at 1.91 odds (-110)
    ROUND((SUM(CASE WHEN outcome = 'WIN' THEN 0.91 ELSE -1 END) /
           COUNT(*) * 100)::numeric, 1) as roi_pct
FROM results
GROUP BY signal
ORDER BY roi_pct DESC;
```

---

## Complete Backtest Query (Single Execution)

```sql
-- TOTALS BACKTEST - Complete Query
-- Change [SEASON] parameter to run on different seasons

WITH game_betting AS (
    SELECT DISTINCT
        g.game_id, g.game_date, g.home_team_id, g.away_team_id,
        ht.abbreviation as home_team, at.abbreviation as away_team,
        g.home_team_score, g.away_team_score,
        g.home_team_score + g.away_team_score as actual_total,
        be.event_id
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    JOIN betting_events be ON g.game_date = be.event_start_time::date
        AND be.raw_data::text LIKE '%' || ht.full_name || '%'
    WHERE g.season = '2025-26'  -- <<< CHANGE SEASON HERE
    AND g.home_team_score IS NOT NULL
),
game_lines AS (
    SELECT gb.*, bo.handicap as game_line,
        ROW_NUMBER() OVER (PARTITION BY gb.game_id ORDER BY ABS(bo.odds_decimal - 1.91)) as rn
    FROM game_betting gb
    JOIN betting_markets bm ON gb.event_id = bm.event_id
    JOIN betting_odds bo ON bm.market_id = bo.market_id
    WHERE bm.market_key LIKE '0_game_total%' AND bo.selection LIKE 'Over%'
),
team_stats AS (
    SELECT t.team_id, AVG(tgs.points) as season_ppg,
        AVG(CASE WHEN tgs.team_id = g.home_team_id THEN tgs.points END) as home_ppg,
        AVG(CASE WHEN tgs.team_id = g.away_team_id THEN tgs.points END) as away_ppg,
        AVG(tgs.offensive_rating) as ortg, AVG(tgs.defensive_rating) as drtg,
        AVG(tgs.pace) as pace
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    JOIN teams t ON tgs.team_id = t.team_id
    WHERE g.season = '2025-26'  -- <<< CHANGE SEASON HERE
    AND g.home_team_score IS NOT NULL
    GROUP BY t.team_id
),
last5_stats AS (
    SELECT team_id, AVG(points) as last5_ppg FROM (
        SELECT t.team_id, tgs.points,
            ROW_NUMBER() OVER (PARTITION BY t.team_id ORDER BY g.game_date DESC) as rn
        FROM team_game_stats tgs
        JOIN games g ON tgs.game_id = g.game_id
        JOIN teams t ON tgs.team_id = t.team_id
        WHERE g.season = '2025-26'  -- <<< CHANGE SEASON HERE
        AND g.home_team_score IS NOT NULL
    ) x WHERE rn <= 5
    GROUP BY team_id
),
league_avg AS (
    SELECT AVG(defensive_rating) as league_drtg
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    WHERE g.season = '2025-26'  -- <<< CHANGE SEASON HERE
    AND g.home_team_score IS NOT NULL
),
game_analysis AS (
    SELECT
        gl.game_id, gl.game_date, gl.home_team, gl.away_team,
        gl.actual_total, gl.game_line,
        ((hs.season_ppg + aws.season_ppg) +
         (hs.home_ppg + aws.away_ppg) +
         (hs.home_ppg * (aws.drtg / la.league_drtg) +
          aws.away_ppg * (hs.drtg / la.league_drtg)) +
         (hl5.last5_ppg + al5.last5_ppg) +
         (((hs.ortg + aws.drtg) / 2 * (hs.pace / 100)) +
          ((aws.ortg + hs.drtg) / 2 * (aws.pace / 100)))
        ) / 5 as avg_expected
    FROM game_lines gl
    JOIN team_stats hs ON gl.home_team_id = hs.team_id
    JOIN team_stats aws ON gl.away_team_id = aws.team_id
    JOIN last5_stats hl5 ON gl.home_team_id = hl5.team_id
    JOIN last5_stats al5 ON gl.away_team_id = al5.team_id
    CROSS JOIN league_avg la
    WHERE gl.rn = 1
),
results AS (
    SELECT
        CASE
            WHEN avg_expected - game_line > 5 THEN 'Strong OVER'
            WHEN avg_expected - game_line > 2 THEN 'Moderate OVER'
            WHEN avg_expected - game_line < -5 THEN 'Strong UNDER'
            WHEN avg_expected - game_line < -2 THEN 'Moderate UNDER'
            ELSE 'PUSH'
        END as signal,
        CASE
            WHEN avg_expected > game_line AND actual_total > game_line THEN 1
            WHEN avg_expected < game_line AND actual_total < game_line THEN 1
            ELSE 0
        END as win
    FROM game_analysis
)
SELECT
    signal,
    COUNT(*) as bets,
    SUM(win) as wins,
    COUNT(*) - SUM(win) as losses,
    ROUND(100.0 * SUM(win) / COUNT(*)::numeric, 1) as win_pct,
    ROUND((SUM(CASE WHEN win = 1 THEN 0.91 ELSE -1 END) / COUNT(*) * 100)::numeric, 1) as roi_pct
FROM results
GROUP BY signal
ORDER BY roi_pct DESC;
```

---

## Output Metrics

### Performance Summary Table
| Metric | Description |
|--------|-------------|
| `bets` | Number of games in signal category |
| `wins` | Correct predictions |
| `losses` | Incorrect predictions |
| `win_pct` | Win percentage (need >52.4% for profit at -110) |
| `roi_pct` | Return on investment assuming 1.91 odds |

### Signal Classifications
| Signal | Edge Range | Typical Win % |
|--------|------------|---------------|
| Strong OVER | >+5 pts | 60-75% |
| Moderate OVER | +2 to +5 pts | 45-55% |
| PUSH | -2 to +2 pts | ~50% (no play) |
| Moderate UNDER | -2 to -5 pts | 55-65% |
| Strong UNDER | <-5 pts | 40-60% |

---

## Running on Different Seasons

### Available Seasons
Check available seasons in your database:
```sql
SELECT DISTINCT season, COUNT(*) as games
FROM games
WHERE home_team_score IS NOT NULL
GROUP BY season
ORDER BY season DESC;
```

### Season Parameter Locations
Replace `'2025-26'` in these 5 locations:
1. `game_betting` CTE - WHERE clause
2. `team_stats` CTE - WHERE clause
3. `last5_stats` subquery - WHERE clause
4. `league_avg` CTE - WHERE clause

### Multi-Season Comparison
Run the backtest for each season and compare:

```sql
-- Create summary table for multiple seasons
CREATE TABLE IF NOT EXISTS backtest_results (
    season VARCHAR(7),
    signal VARCHAR(20),
    bets INT,
    wins INT,
    win_pct NUMERIC(5,1),
    roi_pct NUMERIC(5,1),
    run_date TIMESTAMP DEFAULT NOW()
);
```

---

## Interpreting Results

### Profitable Signals (>52.4% win rate needed)
- **Strong OVER**: Historically best performer
- **Moderate UNDER**: Often reliable
- **2-5 pt edge bucket**: Good volume with decent accuracy

### Signals to Avoid
- **PUSH/No Edge**: Insufficient signal
- **Moderate OVER**: Often below breakeven
- **Strong UNDER**: Inconsistent results

### Method Weighting Insights
From backtesting, consider adjusting method weights:
- **Increase M5 (ORtg/DRtg)** weight - lowest prediction error
- **Decrease M4 (Last 5)** weight - highest volatility/error

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-18 | 1.0 | Initial backtest documentation |
