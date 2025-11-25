-- ==================== POC Migration: Minimal Schema ====================
-- Created: 2025-01-23
-- Description: 4 core tables for 2-hour proof of concept
-- Purpose: Test database setup and live NBA data collection
-- ================================================================

-- Begin transaction
BEGIN;

-- Set search path
SET search_path TO public;

-- ==================== Table 1: Teams ====================

CREATE TABLE teams (
    team_id INTEGER PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(3) NOT NULL UNIQUE,
    nickname VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50),
    year_founded INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_teams_abbreviation ON teams(abbreviation);
CREATE INDEX idx_teams_city ON teams(city);

-- Comments
COMMENT ON TABLE teams IS 'NBA teams - 30 franchises with basic information';
COMMENT ON COLUMN teams.team_id IS 'Official NBA team ID';
COMMENT ON COLUMN teams.abbreviation IS '3-letter team code (e.g., LAL, GSW)';

-- ==================== Table 2: Players ====================

CREATE TABLE players (
    player_id INTEGER PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_players_full_name ON players(full_name);
CREATE INDEX idx_players_is_active ON players(is_active);

-- Comments
COMMENT ON TABLE players IS 'NBA players - active and historical';
COMMENT ON COLUMN players.player_id IS 'Official NBA player ID';
COMMENT ON COLUMN players.is_active IS 'Currently active in the league';

-- ==================== Table 3: Games ====================

CREATE TABLE games (
    game_id VARCHAR(10) PRIMARY KEY,
    game_date DATE NOT NULL,
    season VARCHAR(7) NOT NULL,
    home_team_id INTEGER NOT NULL REFERENCES teams(team_id),
    away_team_id INTEGER NOT NULL REFERENCES teams(team_id),
    home_team_score INTEGER,
    away_team_score INTEGER,
    game_status VARCHAR(20) DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_different_teams CHECK (home_team_id != away_team_id)
);

-- Indexes for performance
CREATE INDEX idx_games_date ON games(game_date);
CREATE INDEX idx_games_season ON games(season);
CREATE INDEX idx_games_home_team ON games(home_team_id);
CREATE INDEX idx_games_away_team ON games(away_team_id);
CREATE INDEX idx_games_status ON games(game_status);

-- Comments
COMMENT ON TABLE games IS 'NBA games - schedule and scores';
COMMENT ON COLUMN games.game_id IS 'Official NBA game ID';
COMMENT ON COLUMN games.game_status IS 'Status: Scheduled, In Progress, Final';
COMMENT ON COLUMN games.season IS 'Season in format YYYY-YY (e.g., 2024-25)';

-- ==================== Table 4: Player Game Stats ====================

CREATE TABLE player_game_stats (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    player_id INTEGER NOT NULL REFERENCES players(player_id),
    team_id INTEGER NOT NULL REFERENCES teams(team_id),
    minutes INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    rebounds INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    steals INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    turnovers INTEGER DEFAULT 0,
    fg_made INTEGER DEFAULT 0,
    fg_attempted INTEGER DEFAULT 0,
    fg_pct NUMERIC(5,3),
    fg3_made INTEGER DEFAULT 0,
    fg3_attempted INTEGER DEFAULT 0,
    fg3_pct NUMERIC(5,3),
    ft_made INTEGER DEFAULT 0,
    ft_attempted INTEGER DEFAULT 0,
    ft_pct NUMERIC(5,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_player_game UNIQUE(game_id, player_id),
    CONSTRAINT check_positive_stats CHECK (
        minutes >= 0 AND points >= 0 AND rebounds >= 0 AND assists >= 0
    )
);

-- Indexes for performance
CREATE INDEX idx_player_stats_game ON player_game_stats(game_id);
CREATE INDEX idx_player_stats_player ON player_game_stats(player_id);
CREATE INDEX idx_player_stats_team ON player_game_stats(team_id);
CREATE INDEX idx_player_stats_points ON player_game_stats(points);

-- Comments
COMMENT ON TABLE player_game_stats IS 'Player box score statistics per game';
COMMENT ON COLUMN player_game_stats.minutes IS 'Minutes played';
COMMENT ON COLUMN player_game_stats.fg_pct IS 'Field goal percentage (0-1)';

-- Commit transaction
COMMIT;

-- ==================== Verification ====================

-- Verify tables exist
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('teams', 'players', 'games', 'player_game_stats')
ORDER BY tablename;

-- Verify indexes
SELECT
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Success message
SELECT '✅ POC Migration completed successfully! 4 tables created.' AS status;
