-- Migration 017: Team Analysis System
-- Daily generated narrative analysis for each team
-- Generated after stats sync by ETL pipeline

CREATE TABLE IF NOT EXISTS team_analysis (
    analysis_id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season VARCHAR(7) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analysis_data JSONB NOT NULL,
    analysis_html TEXT NOT NULL,
    data_as_of DATE NOT NULL,
    games_included INTEGER NOT NULL,
    UNIQUE(team_id, season, data_as_of)
);

-- Index for fast lookups by team and season
CREATE INDEX IF NOT EXISTS idx_team_analysis_team_season ON team_analysis(team_id, season);

-- Index for ordering by generation time
CREATE INDEX IF NOT EXISTS idx_team_analysis_generated ON team_analysis(generated_at DESC);

-- Comment on table
COMMENT ON TABLE team_analysis IS 'Daily generated narrative analysis for each team, synthesizing all dashboard data';
COMMENT ON COLUMN team_analysis.analysis_data IS 'JSONB structured data used for analysis generation';
COMMENT ON COLUMN team_analysis.analysis_html IS 'Pre-rendered HTML narrative in French';
COMMENT ON COLUMN team_analysis.data_as_of IS 'Date of the data used for analysis (prevents duplicate daily runs)';
COMMENT ON COLUMN team_analysis.games_included IS 'Number of games included in the analysis';
