-- ==================== Migration 003: Advanced Reference Tables ====================
-- Created: 2025-01-23
-- Description: Extended reference data - seasons, venues, coaches, transactions
-- Dependencies: 001_poc_minimal.sql, 002_fix_integer_types.sql
-- ===============================================================================

BEGIN;

SET search_path TO public;

-- ==================== Table: Seasons ====================

CREATE TABLE seasons (
    season_id VARCHAR(7) PRIMARY KEY,  -- Format: "2024-25"
    season_year INTEGER NOT NULL,      -- Starting year: 2024
    season_type VARCHAR(20) NOT NULL,  -- Regular Season, Playoffs, Play-In
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_season_type CHECK (season_type IN ('Regular Season', 'Playoffs', 'Play-In', 'Preseason'))
);

CREATE INDEX idx_seasons_year ON seasons(season_year);
CREATE INDEX idx_seasons_type ON seasons(season_type);
CREATE INDEX idx_seasons_current ON seasons(is_current);

COMMENT ON TABLE seasons IS 'NBA seasons with date ranges and types';
COMMENT ON COLUMN seasons.season_id IS 'Format: YYYY-YY (e.g., 2024-25)';
COMMENT ON COLUMN seasons.is_current IS 'Currently active season';

-- ==================== Table: Venues ====================

CREATE TABLE venues (
    venue_id SERIAL PRIMARY KEY,
    venue_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'USA',
    capacity INTEGER,
    year_opened INTEGER,
    team_id BIGINT REFERENCES teams(team_id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_venues_team ON venues(team_id);
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_is_active ON venues(is_active);

COMMENT ON TABLE venues IS 'NBA arenas and venues';
COMMENT ON COLUMN venues.capacity IS 'Seating capacity';

-- ==================== Table: Coaches ====================

CREATE TABLE coaches (
    coach_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coaches_full_name ON coaches(full_name);
CREATE INDEX idx_coaches_is_active ON coaches(is_active);

COMMENT ON TABLE coaches IS 'NBA coaches - head coaches and assistants';

-- ==================== Table: Team Coaches ====================

CREATE TABLE team_coaches (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    coach_id INTEGER NOT NULL REFERENCES coaches(coach_id),
    season_id VARCHAR(7) NOT NULL REFERENCES seasons(season_id),
    coach_type VARCHAR(20) NOT NULL DEFAULT 'head',
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_coach_type CHECK (coach_type IN ('head', 'assistant', 'interim'))
);

CREATE INDEX idx_team_coaches_team ON team_coaches(team_id);
CREATE INDEX idx_team_coaches_coach ON team_coaches(coach_id);
CREATE INDEX idx_team_coaches_season ON team_coaches(season_id);
CREATE INDEX idx_team_coaches_is_current ON team_coaches(is_current);

COMMENT ON TABLE team_coaches IS 'Coach assignments to teams by season';
COMMENT ON COLUMN team_coaches.coach_type IS 'head, assistant, or interim';

-- ==================== Table: Trades and Transactions ====================

CREATE TABLE trades_transactions (
    transaction_id SERIAL PRIMARY KEY,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    player_id BIGINT REFERENCES players(player_id),
    from_team_id BIGINT REFERENCES teams(team_id),
    to_team_id BIGINT REFERENCES teams(team_id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_transaction_type CHECK (transaction_type IN ('trade', 'free_agent', 'waiver', 'draft', 'release', 'two_way'))
);

CREATE INDEX idx_transactions_date ON trades_transactions(transaction_date);
CREATE INDEX idx_transactions_type ON trades_transactions(transaction_type);
CREATE INDEX idx_transactions_player ON trades_transactions(player_id);
CREATE INDEX idx_transactions_from_team ON trades_transactions(from_team_id);
CREATE INDEX idx_transactions_to_team ON trades_transactions(to_team_id);

COMMENT ON TABLE trades_transactions IS 'Player movement history - trades, signings, releases';
COMMENT ON COLUMN trades_transactions.transaction_type IS 'Type of player movement';

-- ==================== Table: Officials (Referees) ====================

CREATE TABLE officials (
    official_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    jersey_number VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_officials_full_name ON officials(full_name);
CREATE INDEX idx_officials_is_active ON officials(is_active);

COMMENT ON TABLE officials IS 'NBA referees and officials';

-- ==================== Table: Game Officials ====================

CREATE TABLE game_officials (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    official_id INTEGER NOT NULL REFERENCES officials(official_id),
    official_position VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(game_id, official_id)
);

CREATE INDEX idx_game_officials_game ON game_officials(game_id);
CREATE INDEX idx_game_officials_official ON game_officials(official_id);

COMMENT ON TABLE game_officials IS 'Officials assigned to each game';
COMMENT ON COLUMN game_officials.official_position IS 'Crew chief, referee, umpire';

-- ==================== Verification ====================

-- Verify tables exist
SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('seasons', 'venues', 'coaches', 'team_coaches', 'trades_transactions', 'officials', 'game_officials')
ORDER BY tablename;

COMMIT;
