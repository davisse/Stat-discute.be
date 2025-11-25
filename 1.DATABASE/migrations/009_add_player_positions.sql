-- Migration 009: Add Player Positions
-- Purpose: Add position tracking to players table for positional matchup analytics
-- Created: 2025-11-20

BEGIN;

-- Add position column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS position VARCHAR(10);

-- Add height and weight for additional player attributes
ALTER TABLE players ADD COLUMN IF NOT EXISTS height VARCHAR(10);
ALTER TABLE players ADD COLUMN IF NOT EXISTS weight INTEGER;

-- Add jersey number
ALTER TABLE players ADD COLUMN IF NOT EXISTS jersey_number VARCHAR(5);

-- Add draft info
ALTER TABLE players ADD COLUMN IF NOT EXISTS draft_year INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS draft_round INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS draft_number INTEGER;

-- Add birth date for age calculations
ALTER TABLE players ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Add team context (current team)
ALTER TABLE players ADD COLUMN IF NOT EXISTS current_team_id BIGINT REFERENCES teams(team_id);

-- Create index on position for efficient filtering
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);

-- Create index on position + active for common queries
CREATE INDEX IF NOT EXISTS idx_players_position_active ON players(position, is_active) WHERE is_active = true;

-- Create defensive_stats_by_position analytics table
-- Tracks how teams perform defensively against specific positions
CREATE TABLE IF NOT EXISTS defensive_stats_by_position (
    id SERIAL PRIMARY KEY,
    season VARCHAR(7) NOT NULL,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    opponent_position VARCHAR(10) NOT NULL,
    games_played INTEGER NOT NULL DEFAULT 0,

    -- Points allowed to this position
    points_allowed DECIMAL(10,2) DEFAULT 0,
    points_allowed_per_game DECIMAL(10,2) DEFAULT 0,

    -- Shooting efficiency allowed
    fg_pct_allowed DECIMAL(5,2),
    fg3_pct_allowed DECIMAL(5,2),
    ft_pct_allowed DECIMAL(5,2),

    -- Other stats allowed
    rebounds_allowed DECIMAL(10,2) DEFAULT 0,
    assists_allowed DECIMAL(10,2) DEFAULT 0,
    steals_allowed DECIMAL(10,2) DEFAULT 0,
    blocks_allowed DECIMAL(10,2) DEFAULT 0,
    turnovers_forced DECIMAL(10,2) DEFAULT 0,

    -- Per game averages
    rebounds_allowed_per_game DECIMAL(5,2),
    assists_allowed_per_game DECIMAL(5,2),

    -- League rank (1 = best defense against this position)
    points_allowed_rank INTEGER,
    fg_pct_allowed_rank INTEGER,

    -- Timestamps
    calculated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(season, team_id, opponent_position)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_defensive_stats_season_team
    ON defensive_stats_by_position(season, team_id);

CREATE INDEX IF NOT EXISTS idx_defensive_stats_position
    ON defensive_stats_by_position(opponent_position);

CREATE INDEX IF NOT EXISTS idx_defensive_stats_rank
    ON defensive_stats_by_position(season, opponent_position, points_allowed_rank);

-- Add comments for documentation
COMMENT ON TABLE defensive_stats_by_position IS 'Tracks how each team defends against different positions (PG, SG, SF, PF, C)';
COMMENT ON COLUMN defensive_stats_by_position.points_allowed_rank IS 'League rank where 1 = best defense (allows fewest points)';
COMMENT ON COLUMN players.position IS 'Player position: PG, SG, SF, PF, C, or hybrid (PG-SG, SF-PF, etc.)';

COMMIT;

-- Verification queries
-- Check that columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'players'
AND column_name IN ('position', 'height', 'weight', 'current_team_id')
ORDER BY column_name;

-- Check that defensive_stats_by_position table was created
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'defensive_stats_by_position';

-- Check indexes
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('players', 'defensive_stats_by_position')
AND indexname LIKE '%position%'
ORDER BY indexname;
