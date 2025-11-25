-- Migration 010: Betting Value Analysis
-- Creates table to store multi-factor value analysis and betting recommendations
-- Part of the Betting Value Agent system

BEGIN;

-- Betting value analysis results table
CREATE TABLE betting_value_analysis (
    analysis_id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    analysis_date DATE NOT NULL,

    -- Team identifiers
    home_team_id BIGINT NOT NULL REFERENCES teams(team_id),
    away_team_id BIGINT NOT NULL REFERENCES teams(team_id),

    -- Score breakdown (each factor scored 0-25, 0-20, 0-15, or 0-10)
    positional_matchup_score DECIMAL(5,2) NOT NULL CHECK (positional_matchup_score >= 0 AND positional_matchup_score <= 25),
    betting_trend_score DECIMAL(5,2) NOT NULL CHECK (betting_trend_score >= 0 AND betting_trend_score <= 20),
    advanced_stats_score DECIMAL(5,2) NOT NULL CHECK (advanced_stats_score >= 0 AND advanced_stats_score <= 20),
    recent_form_score DECIMAL(5,2) NOT NULL CHECK (recent_form_score >= 0 AND recent_form_score <= 15),
    rest_schedule_score DECIMAL(5,2) NOT NULL CHECK (rest_schedule_score >= 0 AND rest_schedule_score <= 10),
    line_value_score DECIMAL(5,2) NOT NULL CHECK (line_value_score >= 0 AND line_value_score <= 10),

    -- Total value score (sum of all factors, max 100)
    total_value_score DECIMAL(5,2) NOT NULL CHECK (total_value_score >= 0 AND total_value_score <= 100),

    -- Value tier classification
    value_tier VARCHAR(20) NOT NULL CHECK (value_tier IN ('Exceptional', 'Strong', 'Good', 'Slight', 'None')),

    -- Recommendation details
    recommended_bet_type VARCHAR(50) NOT NULL,  -- 'spread', 'total_over', 'total_under', 'moneyline', 'player_prop'
    recommended_side VARCHAR(50),  -- Team abbreviation or player name
    confidence_level VARCHAR(20) NOT NULL CHECK (confidence_level IN ('High', 'Moderate', 'Low', 'None')),

    -- Supporting data stored as JSONB for flexibility and queryability
    score_rationale JSONB NOT NULL,  -- Array of human-readable rationale strings
    matchup_details JSONB,           -- Detailed positional matchup breakdown
    trend_details JSONB,             -- Betting trend analysis details
    stat_details JSONB,              -- Advanced stats comparison

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Ensure one analysis per game per date (can re-run daily to update)
    UNIQUE(game_id, analysis_date)
);

-- Indexes for common query patterns

-- Query by date (most common: "what are today's recommendations?")
CREATE INDEX idx_betting_value_date
ON betting_value_analysis(analysis_date);

-- Query by score (descending, to get top opportunities)
CREATE INDEX idx_betting_value_score_desc
ON betting_value_analysis(total_value_score DESC);

-- Filter by value tier
CREATE INDEX idx_betting_value_tier
ON betting_value_analysis(value_tier);

-- Lookup by specific game
CREATE INDEX idx_betting_value_game
ON betting_value_analysis(game_id);

-- Filter by confidence level
CREATE INDEX idx_betting_value_confidence
ON betting_value_analysis(confidence_level);

-- Composite index for date + score queries (most common pattern)
CREATE INDEX idx_betting_value_date_score
ON betting_value_analysis(analysis_date, total_value_score DESC);

-- Composite index for date + tier queries
CREATE INDEX idx_betting_value_date_tier
ON betting_value_analysis(analysis_date, value_tier);

-- GIN index for JSONB queries (to search within rationale and details)
CREATE INDEX idx_betting_value_rationale_gin
ON betting_value_analysis USING GIN(score_rationale);

CREATE INDEX idx_betting_value_matchup_details_gin
ON betting_value_analysis USING GIN(matchup_details);

-- Table comments
COMMENT ON TABLE betting_value_analysis IS
'Betting value analysis results with multi-factor scoring (6 factors: positional matchups, betting trends, advanced stats, recent form, rest/schedule, line value) and actionable betting recommendations';

COMMENT ON COLUMN betting_value_analysis.positional_matchup_score IS
'Score 0-25 based on player positional matchup advantages (uses defensive_stats_by_position data)';

COMMENT ON COLUMN betting_value_analysis.betting_trend_score IS
'Score 0-20 based on ATS performance and Over/Under trends (uses betting_trends, ats_performance data)';

COMMENT ON COLUMN betting_value_analysis.advanced_stats_score IS
'Score 0-20 based on Four Factors, pace, TS%, eFG% advantages (uses team_game_stats, player_advanced_stats data)';

COMMENT ON COLUMN betting_value_analysis.recent_form_score IS
'Score 0-15 based on recent win/loss record and momentum (uses games, team_standings data)';

COMMENT ON COLUMN betting_value_analysis.rest_schedule_score IS
'Score 0-10 based on days of rest, back-to-back situations (uses games table date analysis)';

COMMENT ON COLUMN betting_value_analysis.line_value_score IS
'Score 0-10 based on line movement and sharp money indicators (uses betting_lines, betting_odds data)';

COMMENT ON COLUMN betting_value_analysis.total_value_score IS
'Sum of all factor scores (0-100). 90-100=Exceptional, 75-89=Strong, 60-74=Good, 45-59=Slight, 0-44=None';

COMMENT ON COLUMN betting_value_analysis.score_rationale IS
'JSONB array of human-readable strings explaining the score (e.g., ["Giannis vs #28 PF defense", "MIL 7-3 ATS last 10"])';

COMMENT ON COLUMN betting_value_analysis.matchup_details IS
'JSONB object with detailed positional matchup data for key players';

COMMENT ON COLUMN betting_value_analysis.trend_details IS
'JSONB object with betting trend analysis (ATS records, O/U trends, home/away splits)';

COMMENT ON COLUMN betting_value_analysis.stat_details IS
'JSONB object with advanced stats comparison (pace differential, Four Factors, shooting efficiency)';

-- Verification query
-- Shows the structure and ensures table was created correctly
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'betting_value_analysis'
ORDER BY ordinal_position;

-- Example query to verify indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'betting_value_analysis'
ORDER BY indexname;

COMMIT;

-- Usage Example (for documentation):
/*

-- Example: Insert a value analysis
INSERT INTO betting_value_analysis (
    game_id, analysis_date,
    home_team_id, away_team_id,
    positional_matchup_score, betting_trend_score, advanced_stats_score,
    recent_form_score, rest_schedule_score, line_value_score,
    total_value_score, value_tier,
    recommended_bet_type, recommended_side, confidence_level,
    score_rationale
) VALUES (
    '0022500123', '2025-11-20',
    1610612749, 1610612755,  -- MIL vs PHI
    22.0, 15.0, 16.0, 10.0, 9.0, 10.0,
    82.0, 'Strong',
    'spread', 'MIL', 'High',
    '["Giannis (PF) vs #28 PF defense (allows 24.8 PPG)", "MIL 7-3 ATS last 10", "MIL superior in 3/4 factors", "PHI on back-to-back", "Sharp money on MIL"]'::jsonb
);

-- Query today's top recommendations
SELECT
    g.game_date,
    ht.abbreviation || ' vs ' || at.abbreviation as matchup,
    bva.total_value_score,
    bva.value_tier,
    bva.recommended_bet_type,
    bva.recommended_side,
    bva.confidence_level,
    bva.score_rationale
FROM betting_value_analysis bva
JOIN teams ht ON bva.home_team_id = ht.team_id
JOIN teams at ON bva.away_team_id = at.team_id
JOIN games g ON bva.game_id = g.game_id
WHERE bva.analysis_date = CURRENT_DATE
  AND bva.total_value_score >= 60
ORDER BY bva.total_value_score DESC;

-- Query top opportunities this week
SELECT
    bva.analysis_date,
    ht.abbreviation || ' vs ' || at.abbreviation as matchup,
    bva.total_value_score,
    bva.value_tier,
    bva.recommended_side
FROM betting_value_analysis bva
JOIN teams ht ON bva.home_team_id = ht.team_id
JOIN teams at ON bva.away_team_id = at.team_id
WHERE bva.analysis_date >= CURRENT_DATE - INTERVAL '7 days'
  AND bva.value_tier IN ('Exceptional', 'Strong')
ORDER BY bva.total_value_score DESC
LIMIT 10;

-- Search rationale for specific keywords
SELECT
    bva.game_id,
    ht.abbreviation || ' vs ' || at.abbreviation as matchup,
    bva.total_value_score,
    bva.score_rationale
FROM betting_value_analysis bva
JOIN teams ht ON bva.home_team_id = ht.team_id
JOIN teams at ON bva.away_team_id = at.team_id
WHERE bva.score_rationale @> '["back-to-back"]'::jsonb
  AND bva.analysis_date >= CURRENT_DATE
ORDER BY bva.total_value_score DESC;

*/
