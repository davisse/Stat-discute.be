-- ==================== Migration 010: Totals Betting Analytics ====================
-- Created: 2025-12-18
-- Description: Comprehensive totals betting analytics system with historical backtesting
-- Dependencies: 001-009 (requires period_scores, team_game_stats, games, teams)
-- Purpose: Store closing lines, calculate O/U results, track period betting performance
-- ===================================================================================

BEGIN;

SET search_path TO public;

-- ==================== Table: Game Closing Lines ====================
-- Captures final odds before game start for all market types
-- Used for backtesting and Closing Line Value (CLV) tracking

CREATE TABLE IF NOT EXISTS game_closing_lines (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    bookmaker VARCHAR(50) NOT NULL DEFAULT 'pinnacle',

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

    CONSTRAINT unique_game_bookmaker UNIQUE(game_id, bookmaker)
);

CREATE INDEX IF NOT EXISTS idx_gcl_game_id ON game_closing_lines(game_id);
CREATE INDEX IF NOT EXISTS idx_gcl_bookmaker ON game_closing_lines(bookmaker);
CREATE INDEX IF NOT EXISTS idx_gcl_game_start ON game_closing_lines(game_start_time);
CREATE INDEX IF NOT EXISTS idx_gcl_recorded_at ON game_closing_lines(recorded_at);

COMMENT ON TABLE game_closing_lines IS 'Final odds snapshot before game start for all market types';
COMMENT ON COLUMN game_closing_lines.game_total_line IS 'Full game over/under total points line';
COMMENT ON COLUMN game_closing_lines.home_spread IS 'Home team point spread (negative = favorite)';
COMMENT ON COLUMN game_closing_lines.hours_before_game IS 'How many hours before game start these lines were recorded';

-- ==================== Table: Game Over/Under Results ====================
-- Tracks actual results vs betting lines for all period types
-- Enables backtesting and performance analysis

CREATE TABLE IF NOT EXISTS game_ou_results (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    bookmaker VARCHAR(50) NOT NULL DEFAULT 'pinnacle',

    -- Full Game Results
    game_total_line DECIMAL(5,1),
    actual_total INTEGER,
    game_total_result VARCHAR(5),
    game_total_margin DECIMAL(5,1),  -- actual - line (positive = over)

    -- First Half Results
    first_half_line DECIMAL(5,1),
    actual_first_half INTEGER,
    first_half_result VARCHAR(5),
    first_half_margin DECIMAL(5,1),

    -- First Quarter Results
    first_quarter_line DECIMAL(5,1),
    actual_first_quarter INTEGER,
    first_quarter_result VARCHAR(5),
    first_quarter_margin DECIMAL(5,1),

    -- Home Team Total Results
    home_team_line DECIMAL(5,1),
    actual_home_score INTEGER,
    home_team_result VARCHAR(5),
    home_team_margin DECIMAL(5,1),

    -- Away Team Total Results
    away_team_line DECIMAL(5,1),
    actual_away_score INTEGER,
    away_team_result VARCHAR(5),
    away_team_margin DECIMAL(5,1),

    -- Spread Results (bonus tracking)
    spread_line DECIMAL(5,1),
    actual_margin INTEGER,  -- home_score - away_score
    home_spread_result VARCHAR(5),

    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_gor_game_bookmaker UNIQUE(game_id, bookmaker),
    CONSTRAINT check_game_total_result CHECK (game_total_result IN ('OVER', 'UNDER', 'PUSH')),
    CONSTRAINT check_first_half_result CHECK (first_half_result IN ('OVER', 'UNDER', 'PUSH')),
    CONSTRAINT check_first_quarter_result CHECK (first_quarter_result IN ('OVER', 'UNDER', 'PUSH')),
    CONSTRAINT check_home_team_result CHECK (home_team_result IN ('OVER', 'UNDER', 'PUSH')),
    CONSTRAINT check_away_team_result CHECK (away_team_result IN ('OVER', 'UNDER', 'PUSH')),
    CONSTRAINT check_home_spread_result CHECK (home_spread_result IN ('COVER', 'LOSS', 'PUSH'))
);

CREATE INDEX IF NOT EXISTS idx_gor_game_id ON game_ou_results(game_id);
CREATE INDEX IF NOT EXISTS idx_gor_bookmaker ON game_ou_results(bookmaker);
CREATE INDEX IF NOT EXISTS idx_gor_game_result ON game_ou_results(game_total_result);
CREATE INDEX IF NOT EXISTS idx_gor_1h_result ON game_ou_results(first_half_result);
CREATE INDEX IF NOT EXISTS idx_gor_1q_result ON game_ou_results(first_quarter_result);
CREATE INDEX IF NOT EXISTS idx_gor_home_team_result ON game_ou_results(home_team_result);
CREATE INDEX IF NOT EXISTS idx_gor_away_team_result ON game_ou_results(away_team_result);

COMMENT ON TABLE game_ou_results IS 'Actual over/under results vs betting lines for backtesting';
COMMENT ON COLUMN game_ou_results.game_total_margin IS 'Points by which actual exceeded line (positive = over)';
COMMENT ON COLUMN game_ou_results.game_total_result IS 'OVER, UNDER, or PUSH for full game total';
COMMENT ON COLUMN game_ou_results.home_spread_result IS 'COVER, LOSS, or PUSH for home team spread bet';

-- ==================== Enhance Betting Odds Table ====================
-- Add columns for closing line tracking and time-to-game calculation

ALTER TABLE betting_odds
    ADD COLUMN IF NOT EXISTS is_closing_line BOOLEAN DEFAULT FALSE;

ALTER TABLE betting_odds
    ADD COLUMN IF NOT EXISTS hours_to_game DECIMAL(5,2);

CREATE INDEX IF NOT EXISTS idx_betting_odds_closing
    ON betting_odds(market_id, is_closing_line)
    WHERE is_closing_line = TRUE;

CREATE INDEX IF NOT EXISTS idx_betting_odds_hours_to_game
    ON betting_odds(hours_to_game);

COMMENT ON COLUMN betting_odds.is_closing_line IS 'True if these were the final odds before game start';
COMMENT ON COLUMN betting_odds.hours_to_game IS 'Hours remaining before game start when odds were recorded';

-- ==================== Analytics View: Totals Edge Calculator ====================
-- Pace-adjusted projections vs betting lines for value identification
-- Uses Four Factors methodology: pace × (offensive/defensive rating)

CREATE OR REPLACE VIEW v_totals_edge_calculator AS
SELECT
    g.game_id,
    g.game_date,
    g.season,
    ht.abbreviation as home_team,
    at.abbreviation as away_team,
    g.home_team_id,
    g.away_team_id,
    gcl.game_total_line,

    -- Pace-adjusted projection formula
    -- Formula: (Avg Pace / 2) × ((Home ORtg + Away DRtg + Away ORtg + Home DRtg) / 200)
    ROUND(
        ((home_stats.avg_pace + away_stats.avg_pace) / 2) *
        ((home_stats.avg_ortg + away_stats.avg_drtg + away_stats.avg_ortg + home_stats.avg_drtg) / 200)
    , 1) as projected_total,

    -- Edge calculation (projection - line, positive = over edge)
    ROUND(
        ((home_stats.avg_pace + away_stats.avg_pace) / 2) *
        ((home_stats.avg_ortg + away_stats.avg_drtg + away_stats.avg_ortg + home_stats.avg_drtg) / 200)
        - gcl.game_total_line
    , 1) as edge,

    -- Team stats used in calculation
    ROUND(home_stats.avg_points, 1) as home_avg_pts,
    ROUND(away_stats.avg_points, 1) as away_avg_pts,
    ROUND(home_stats.avg_pace, 1) as home_pace,
    ROUND(away_stats.avg_pace, 1) as away_pace,
    ROUND(home_stats.avg_ortg, 1) as home_ortg,
    ROUND(home_stats.avg_drtg, 1) as home_drtg,
    ROUND(away_stats.avg_ortg, 1) as away_ortg,
    ROUND(away_stats.avg_drtg, 1) as away_drtg,

    home_stats.games_count as home_games,
    away_stats.games_count as away_games

FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
LEFT JOIN game_closing_lines gcl ON g.game_id = gcl.game_id

-- Home team season averages (only games before this game)
LEFT JOIN LATERAL (
    SELECT
        AVG(tgs.points) as avg_points,
        AVG(tgs.pace) as avg_pace,
        AVG(tgs.offensive_rating) as avg_ortg,
        AVG(tgs.defensive_rating) as avg_drtg,
        COUNT(*) as games_count
    FROM team_game_stats tgs
    JOIN games g2 ON tgs.game_id = g2.game_id
    WHERE tgs.team_id = g.home_team_id
    AND g2.season = g.season
    AND g2.game_date < g.game_date
    AND g2.game_status = 'Final'
) home_stats ON true

-- Away team season averages (only games before this game)
LEFT JOIN LATERAL (
    SELECT
        AVG(tgs.points) as avg_points,
        AVG(tgs.pace) as avg_pace,
        AVG(tgs.offensive_rating) as avg_ortg,
        AVG(tgs.defensive_rating) as avg_drtg,
        COUNT(*) as games_count
    FROM team_game_stats tgs
    JOIN games g2 ON tgs.game_id = g2.game_id
    WHERE tgs.team_id = g.away_team_id
    AND g2.season = g.season
    AND g2.game_date < g.game_date
    AND g2.game_status = 'Final'
) away_stats ON true

WHERE gcl.game_total_line IS NOT NULL
AND home_stats.games_count >= 5  -- Minimum sample size
AND away_stats.games_count >= 5;

COMMENT ON VIEW v_totals_edge_calculator IS 'Pace-adjusted total projections vs betting lines with edge calculation';

-- ==================== Analytics View: Team O/U Performance ====================
-- Historical over/under performance by team and period type
-- Used to identify team tendencies and situational trends

CREATE OR REPLACE VIEW v_team_ou_performance AS
SELECT
    t.team_id,
    t.abbreviation,
    t.full_name,
    g.season,
    COUNT(DISTINCT g.game_id) as games_played,

    -- Full Game O/U Performance
    SUM(CASE WHEN gor.game_total_result = 'OVER' THEN 1 ELSE 0 END) as game_overs,
    SUM(CASE WHEN gor.game_total_result = 'UNDER' THEN 1 ELSE 0 END) as game_unders,
    SUM(CASE WHEN gor.game_total_result = 'PUSH' THEN 1 ELSE 0 END) as game_pushes,
    ROUND(AVG(gor.game_total_margin), 1) as avg_game_margin,
    ROUND(
        CAST(SUM(CASE WHEN gor.game_total_result = 'OVER' THEN 1 ELSE 0 END) AS DECIMAL) /
        NULLIF(COUNT(DISTINCT g.game_id), 0) * 100,
        1
    ) as game_over_pct,

    -- First Half O/U Performance
    SUM(CASE WHEN gor.first_half_result = 'OVER' THEN 1 ELSE 0 END) as half_overs,
    SUM(CASE WHEN gor.first_half_result = 'UNDER' THEN 1 ELSE 0 END) as half_unders,
    ROUND(AVG(gor.first_half_margin), 1) as avg_half_margin,
    ROUND(
        CAST(SUM(CASE WHEN gor.first_half_result = 'OVER' THEN 1 ELSE 0 END) AS DECIMAL) /
        NULLIF(COUNT(DISTINCT g.game_id), 0) * 100,
        1
    ) as half_over_pct,

    -- First Quarter O/U Performance
    SUM(CASE WHEN gor.first_quarter_result = 'OVER' THEN 1 ELSE 0 END) as quarter_overs,
    SUM(CASE WHEN gor.first_quarter_result = 'UNDER' THEN 1 ELSE 0 END) as quarter_unders,
    ROUND(AVG(gor.first_quarter_margin), 1) as avg_quarter_margin,
    ROUND(
        CAST(SUM(CASE WHEN gor.first_quarter_result = 'OVER' THEN 1 ELSE 0 END) AS DECIMAL) /
        NULLIF(COUNT(DISTINCT g.game_id), 0) * 100,
        1
    ) as quarter_over_pct,

    -- Team Total O/U Performance (both home and away)
    SUM(CASE
        WHEN g.home_team_id = t.team_id AND gor.home_team_result = 'OVER' THEN 1
        WHEN g.away_team_id = t.team_id AND gor.away_team_result = 'OVER' THEN 1
        ELSE 0
    END) as team_total_overs,
    SUM(CASE
        WHEN g.home_team_id = t.team_id AND gor.home_team_result = 'UNDER' THEN 1
        WHEN g.away_team_id = t.team_id AND gor.away_team_result = 'UNDER' THEN 1
        ELSE 0
    END) as team_total_unders,
    ROUND(
        CAST(SUM(CASE
            WHEN g.home_team_id = t.team_id AND gor.home_team_result = 'OVER' THEN 1
            WHEN g.away_team_id = t.team_id AND gor.away_team_result = 'OVER' THEN 1
            ELSE 0
        END) AS DECIMAL) /
        NULLIF(COUNT(DISTINCT g.game_id), 0) * 100,
        1
    ) as team_total_over_pct

FROM teams t
JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
LEFT JOIN game_ou_results gor ON g.game_id = gor.game_id
WHERE g.game_status = 'Final'
GROUP BY t.team_id, t.abbreviation, t.full_name, g.season;

COMMENT ON VIEW v_team_ou_performance IS 'Team over/under performance by period type with percentages';

-- ==================== Analytics View: Period Scoring Patterns ====================
-- Quarter-by-quarter scoring patterns for situational betting
-- Based on team_period_averages from migration 009

CREATE OR REPLACE VIEW v_period_scoring_patterns AS
SELECT
    t.abbreviation,
    t.full_name,
    t.team_id,
    tpa.season,
    tpa.period_number,
    tpa.period_type,
    tpa.location,
    tpa.games_played,
    ROUND(tpa.avg_points, 1) as team_avg,
    ROUND(tpa.avg_allowed, 1) as opp_avg,
    ROUND(tpa.avg_points + tpa.avg_allowed, 1) as period_total_avg,
    ROUND(tpa.period_win_pct * 100, 1) as period_win_pct,
    tpa.updated_at
FROM team_period_averages tpa
JOIN teams t ON tpa.team_id = t.team_id
WHERE tpa.period_type = 'Q'  -- Only quarters (not overtime)
ORDER BY t.abbreviation, tpa.season DESC, tpa.period_number;

COMMENT ON VIEW v_period_scoring_patterns IS 'Quarter-by-quarter scoring patterns by team and location';

-- ==================== Verification ====================

-- Log migration completion
INSERT INTO sync_logs (action, status, duration, message)
VALUES
    ('migration_010', 'success', 0, 'Totals analytics system tables and views created');

-- Verify tables created
DO $$
DECLARE
    table_count INT;
    view_count INT;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('game_closing_lines', 'game_ou_results');

    -- Count views
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name IN ('v_totals_edge_calculator', 'v_team_ou_performance', 'v_period_scoring_patterns');

    IF table_count = 2 AND view_count = 3 THEN
        RAISE NOTICE '✅ Migration 010 complete: 2 tables and 3 views created successfully';
        RAISE NOTICE '  - game_closing_lines: Final odds storage';
        RAISE NOTICE '  - game_ou_results: O/U results tracking';
        RAISE NOTICE '  - v_totals_edge_calculator: Projection vs line analysis';
        RAISE NOTICE '  - v_team_ou_performance: Historical O/U performance';
        RAISE NOTICE '  - v_period_scoring_patterns: Quarter-by-quarter patterns';
    ELSE
        RAISE EXCEPTION '❌ Migration 010 failed: Expected 2 tables and 3 views, found % tables and % views',
            table_count, view_count;
    END IF;
END $$;

COMMIT;

-- ==================== Post-Migration Notes ====================
--
-- NEXT STEPS:
-- 1. Run ETL: 1.DATABASE/etl/fetch_period_scores.py (if not already populated)
-- 2. Run ETL: 1.DATABASE/etl/betting/calculate_ou_results.py
-- 3. Run ETL: 1.DATABASE/etl/analytics/calculate_period_stats.py
-- 4. Set up closing line capture cron job
--
-- USAGE EXAMPLES:
--
-- Find games with betting edge:
--   SELECT * FROM v_totals_edge_calculator
--   WHERE ABS(edge) >= 3.0
--   ORDER BY ABS(edge) DESC;
--
-- Team O/U performance this season:
--   SELECT * FROM v_team_ou_performance
--   WHERE season = '2025-26'
--   ORDER BY game_over_pct DESC;
--
-- Quarter scoring patterns:
--   SELECT * FROM v_period_scoring_patterns
--   WHERE abbreviation = 'LAL' AND season = '2025-26';
--
