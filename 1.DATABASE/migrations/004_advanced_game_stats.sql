-- ==================== Migration 004: Advanced Game Statistics ====================
-- Created: 2025-01-23
-- Description: Team game stats, advanced metrics, four factors analysis
-- Dependencies: 001-003
-- ==================================================================================

BEGIN;

SET search_path TO public;

-- ==================== Table: Team Game Stats ====================

CREATE TABLE team_game_stats (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),

    -- Basic Stats
    points INTEGER,
    field_goals_made INTEGER,
    field_goals_attempted INTEGER,
    field_goal_pct NUMERIC(5,3),
    three_pointers_made INTEGER,
    three_pointers_attempted INTEGER,
    three_point_pct NUMERIC(5,3),
    free_throws_made INTEGER,
    free_throws_attempted INTEGER,
    free_throw_pct NUMERIC(5,3),

    -- Rebounds
    offensive_rebounds INTEGER,
    defensive_rebounds INTEGER,
    total_rebounds INTEGER,

    -- Other Stats
    assists INTEGER,
    steals INTEGER,
    blocks INTEGER,
    turnovers INTEGER,
    personal_fouls INTEGER,

    -- Advanced Stats
    possessions NUMERIC(8,2),
    pace NUMERIC(6,2),
    offensive_rating NUMERIC(6,2),
    defensive_rating NUMERIC(6,2),
    net_rating NUMERIC(6,2),

    -- Four Factors
    effective_fg_pct NUMERIC(5,3),
    turnover_pct NUMERIC(5,3),
    offensive_rebound_pct NUMERIC(5,3),
    free_throw_rate NUMERIC(5,3),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(game_id, team_id)
);

CREATE INDEX idx_team_game_stats_game ON team_game_stats(game_id);
CREATE INDEX idx_team_game_stats_team ON team_game_stats(team_id);
CREATE INDEX idx_team_game_stats_offensive_rating ON team_game_stats(offensive_rating);
CREATE INDEX idx_team_game_stats_defensive_rating ON team_game_stats(defensive_rating);

COMMENT ON TABLE team_game_stats IS 'Team-level statistics per game with advanced metrics';
COMMENT ON COLUMN team_game_stats.possessions IS 'Estimated possessions in the game';
COMMENT ON COLUMN team_game_stats.pace IS 'Possessions per 48 minutes';
COMMENT ON COLUMN team_game_stats.effective_fg_pct IS '(FGM + 0.5 * 3PM) / FGA';

-- ==================== Table: Team Standings ====================

CREATE TABLE team_standings (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(7) NOT NULL REFERENCES seasons(season_id),

    -- Record
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    win_pct NUMERIC(5,3),
    games_behind NUMERIC(4,1),

    -- Home/Away
    home_wins INTEGER DEFAULT 0,
    home_losses INTEGER DEFAULT 0,
    away_wins INTEGER DEFAULT 0,
    away_losses INTEGER DEFAULT 0,

    -- Conference/Division
    conference VARCHAR(10),
    division VARCHAR(20),
    conference_rank INTEGER,
    division_rank INTEGER,

    -- Streaks
    streak VARCHAR(10),
    last_10 VARCHAR(10),

    -- Points
    points_for NUMERIC(6,1),
    points_against NUMERIC(6,1),
    point_differential NUMERIC(6,1),

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(team_id, season_id)
);

CREATE INDEX idx_team_standings_season ON team_standings(season_id);
CREATE INDEX idx_team_standings_team ON team_standings(team_id);
CREATE INDEX idx_team_standings_win_pct ON team_standings(win_pct);
CREATE INDEX idx_team_standings_conference ON team_standings(conference, conference_rank);

COMMENT ON TABLE team_standings IS 'Team standings by season with rankings and records';
COMMENT ON COLUMN team_standings.streak IS 'Current win/loss streak (e.g., W3, L2)';
COMMENT ON COLUMN team_standings.last_10 IS 'Record in last 10 games (e.g., 7-3)';

-- ==================== Table: Player Advanced Stats ====================

CREATE TABLE player_advanced_stats (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),

    -- Advanced Box Score
    player_impact_estimate NUMERIC(6,2),
    offensive_rating NUMERIC(6,2),
    defensive_rating NUMERIC(6,2),
    net_rating NUMERIC(6,2),
    assist_percentage NUMERIC(5,2),
    assist_to_turnover_ratio NUMERIC(5,2),
    assist_ratio NUMERIC(5,2),
    offensive_rebound_pct NUMERIC(5,2),
    defensive_rebound_pct NUMERIC(5,2),
    rebound_percentage NUMERIC(5,2),
    turnover_ratio NUMERIC(5,2),
    effective_fg_pct NUMERIC(5,3),
    true_shooting_pct NUMERIC(5,3),
    usage_rate NUMERIC(5,2),
    pace NUMERIC(6,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(game_id, player_id)
);

CREATE INDEX idx_player_advanced_stats_game ON player_advanced_stats(game_id);
CREATE INDEX idx_player_advanced_stats_player ON player_advanced_stats(player_id);
CREATE INDEX idx_player_advanced_stats_team ON player_advanced_stats(team_id);

COMMENT ON TABLE player_advanced_stats IS 'Advanced player statistics per game';
COMMENT ON COLUMN player_advanced_stats.true_shooting_pct IS 'PTS / (2 * (FGA + 0.44 * FTA))';
COMMENT ON COLUMN player_advanced_stats.usage_rate IS 'Percentage of team plays used by player';

-- ==================== Table: Injuries ====================

CREATE TABLE injuries (
    injury_id SERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    team_id BIGINT REFERENCES teams(team_id),
    injury_date DATE,
    injury_type VARCHAR(100),
    injury_description TEXT,
    status VARCHAR(20),
    expected_return_date DATE,
    actual_return_date DATE,
    games_missed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_injury_status CHECK (status IN ('out', 'day-to-day', 'questionable', 'probable', 'active', 'inactive'))
);

CREATE INDEX idx_injuries_player ON injuries(player_id);
CREATE INDEX idx_injuries_team ON injuries(team_id);
CREATE INDEX idx_injuries_date ON injuries(injury_date);
CREATE INDEX idx_injuries_status ON injuries(status);

COMMENT ON TABLE injuries IS 'Player injury tracking and availability';
COMMENT ON COLUMN injuries.status IS 'Current injury status';

-- ==================== Table: Player Rotations ====================

CREATE TABLE player_rotations (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),

    -- Rotation Info
    starter BOOLEAN DEFAULT false,
    bench_position INTEGER,
    quarter_minutes JSONB,  -- {"Q1": 8.5, "Q2": 7.2, ...}

    -- Performance
    plus_minus INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(game_id, player_id)
);

CREATE INDEX idx_player_rotations_game ON player_rotations(game_id);
CREATE INDEX idx_player_rotations_player ON player_rotations(player_id);
CREATE INDEX idx_player_rotations_starter ON player_rotations(starter);

COMMENT ON TABLE player_rotations IS 'Player rotation patterns and bench positions';
COMMENT ON COLUMN player_rotations.quarter_minutes IS 'Minutes played per quarter as JSON';

-- ==================== Verification ====================

SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('team_game_stats', 'team_standings', 'player_advanced_stats', 'injuries', 'player_rotations')
ORDER BY tablename;

COMMIT;
