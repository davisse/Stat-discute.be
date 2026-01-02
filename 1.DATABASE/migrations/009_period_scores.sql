-- Migration 009: Period Scores and Game Advanced Stats
-- Created: 2025-12-12
-- Purpose: Add quarter-by-quarter scoring data for betting analysis (Q1, 1H, period props)
-- Source: BoxScoreSummaryV2 (LineScore + OtherStats datasets)

-- ============================================================
-- TABLE 1: period_scores - Quarter/OT scores per team per game
-- ============================================================

DROP TABLE IF EXISTS team_half_averages CASCADE;
DROP TABLE IF EXISTS team_period_averages CASCADE;
DROP TABLE IF EXISTS game_advanced_stats CASCADE;
DROP TABLE IF EXISTS period_scores CASCADE;

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

-- Indexes for period_scores
CREATE INDEX idx_period_scores_game ON period_scores(game_id);
CREATE INDEX idx_period_scores_team_period ON period_scores(team_id, period_number, period_type);
CREATE INDEX idx_period_scores_first_half ON period_scores(team_id) WHERE is_first_half = true;

-- Comments
COMMENT ON TABLE period_scores IS 'Quarter and overtime period scores for each team per game';
COMMENT ON COLUMN period_scores.period_number IS '1-4 for regular quarters, 5+ for overtime periods';
COMMENT ON COLUMN period_scores.period_type IS 'Q for quarter, OT for overtime';
COMMENT ON COLUMN period_scores.is_first_half IS 'Generated column: true for Q1 and Q2';


-- ============================================================
-- TABLE 2: game_advanced_stats - Paint points, fastbreak, etc.
-- ============================================================

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

COMMENT ON TABLE game_advanced_stats IS 'Advanced game stats: paint points, fastbreak, turnovers, lead changes';


-- ============================================================
-- TABLE 3: team_period_averages - Analytics aggregation
-- ============================================================

CREATE TABLE team_period_averages (
    team_id BIGINT REFERENCES teams(team_id),
    season VARCHAR(7) NOT NULL,
    period_number SMALLINT NOT NULL,
    period_type VARCHAR(3) NOT NULL DEFAULT 'Q',  -- 'Q' or 'OT'
    location VARCHAR(4) NOT NULL,  -- 'HOME', 'AWAY', 'ALL'
    games_played INT NOT NULL,
    avg_points DECIMAL(5,2),
    avg_allowed DECIMAL(5,2),
    period_win_pct DECIMAL(4,3),  -- % won that period
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (team_id, season, period_number, period_type, location)
);

COMMENT ON TABLE team_period_averages IS 'Pre-calculated team averages by period for fast querying';
COMMENT ON COLUMN team_period_averages.period_win_pct IS 'Percentage of games where team outscored opponent in this period';


-- ============================================================
-- TABLE 4: team_half_averages - 1H/2H analytics
-- ============================================================

CREATE TABLE team_half_averages (
    team_id BIGINT REFERENCES teams(team_id),
    season VARCHAR(7) NOT NULL,
    half SMALLINT NOT NULL,  -- 1 or 2
    location VARCHAR(4) NOT NULL,  -- 'HOME', 'AWAY', 'ALL'
    games_played INT NOT NULL,
    avg_points DECIMAL(5,2),
    avg_total DECIMAL(5,2),  -- combined with opponent
    avg_margin DECIMAL(5,2),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (team_id, season, half, location)
);

COMMENT ON TABLE team_half_averages IS 'Pre-calculated team half averages for 1H/2H betting analysis';


-- ============================================================
-- Verification
-- ============================================================

-- Insert migration log
INSERT INTO sync_logs (action, status, duration, message)
VALUES ('migration_009', 'success', 0, 'Period scores and game advanced stats tables created');

-- Verify tables created
DO $$
DECLARE
    table_count INT;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('period_scores', 'game_advanced_stats', 'team_period_averages', 'team_half_averages');

    IF table_count = 4 THEN
        RAISE NOTICE 'Migration 009 complete: 4 tables created successfully';
    ELSE
        RAISE EXCEPTION 'Migration 009 failed: Expected 4 tables, found %', table_count;
    END IF;
END $$;
