-- ==================== Migration 013: Closing Lines Capture ====================
-- Created: 2025-12-18
-- Description: Add closing lines capture functionality for totals betting analytics
-- Dependencies: 005_betting_intelligence.sql, 009_period_scores.sql
-- ===================================================================================

BEGIN;

SET search_path TO public;

-- ==================== Enhance betting_odds table ====================
-- Add columns to track closing lines and time to game

ALTER TABLE betting_odds
ADD COLUMN IF NOT EXISTS is_closing_line BOOLEAN DEFAULT FALSE;

ALTER TABLE betting_odds
ADD COLUMN IF NOT EXISTS hours_to_game DECIMAL(5,2);

COMMENT ON COLUMN betting_odds.is_closing_line IS 'TRUE if this record represents the final odds before game start';
COMMENT ON COLUMN betting_odds.hours_to_game IS 'Hours between this odds record and game start time';

-- Create index for efficient closing line queries
CREATE INDEX IF NOT EXISTS idx_betting_odds_closing
ON betting_odds(market_id, is_closing_line)
WHERE is_closing_line = TRUE;

CREATE INDEX IF NOT EXISTS idx_betting_odds_hours_to_game
ON betting_odds(hours_to_game);

-- ==================== Create game_closing_lines table ====================
-- Captures final odds snapshot before game start

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
    first_half_home_spread_odds DECIMAL(6,3),
    first_half_away_spread_odds DECIMAL(6,3),

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

CREATE INDEX IF NOT EXISTS idx_gcl_game_id ON game_closing_lines(game_id);
CREATE INDEX IF NOT EXISTS idx_gcl_bookmaker ON game_closing_lines(bookmaker);
CREATE INDEX IF NOT EXISTS idx_gcl_game_start_time ON game_closing_lines(game_start_time);
CREATE INDEX IF NOT EXISTS idx_gcl_hours_before ON game_closing_lines(hours_before_game);

COMMENT ON TABLE game_closing_lines IS 'Snapshot of closing lines (final odds before game start)';
COMMENT ON COLUMN game_closing_lines.hours_before_game IS 'How many hours before game start the closing line was captured';
COMMENT ON COLUMN game_closing_lines.game_total_over_odds IS 'Decimal odds for Over (European format)';
COMMENT ON COLUMN game_closing_lines.game_total_under_odds IS 'Decimal odds for Under (European format)';

-- ==================== Create game_ou_results table ====================
-- Tracks actual results vs betting lines

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

    -- Spread Results
    spread_line DECIMAL(5,1),
    actual_margin INTEGER,  -- home_score - away_score
    home_spread_result VARCHAR(5) CHECK (home_spread_result IN ('COVER', 'LOSS', 'PUSH')),

    bookmaker VARCHAR(50) DEFAULT 'pinnacle',
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(game_id, bookmaker)
);

CREATE INDEX IF NOT EXISTS idx_gor_game_id ON game_ou_results(game_id);
CREATE INDEX IF NOT EXISTS idx_gor_game_result ON game_ou_results(game_total_result);
CREATE INDEX IF NOT EXISTS idx_gor_1h_result ON game_ou_results(first_half_result);
CREATE INDEX IF NOT EXISTS idx_gor_1q_result ON game_ou_results(first_quarter_result);
CREATE INDEX IF NOT EXISTS idx_gor_home_result ON game_ou_results(home_team_result);
CREATE INDEX IF NOT EXISTS idx_gor_away_result ON game_ou_results(away_team_result);
CREATE INDEX IF NOT EXISTS idx_gor_spread_result ON game_ou_results(home_spread_result);

COMMENT ON TABLE game_ou_results IS 'Actual game results compared to betting lines (over/under performance)';
COMMENT ON COLUMN game_ou_results.game_total_margin IS 'Actual total minus line (positive = over)';
COMMENT ON COLUMN game_ou_results.actual_margin IS 'Home score minus away score (for spread calculation)';

-- ==================== Verification ====================

SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('game_closing_lines', 'game_ou_results')
ORDER BY tablename;

-- Verify new columns
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'betting_odds'
  AND column_name IN ('is_closing_line', 'hours_to_game')
ORDER BY column_name;

COMMIT;
