-- Migration 025: Add game_time column to games table
-- Purpose: Store actual game start times from NBA ScoreboardV2 API
-- Date: 2026-01-09

-- Add game_time column (TIME type for storing time without date)
ALTER TABLE games
ADD COLUMN IF NOT EXISTS game_time TIME;

-- Add game_time_et column (store original ET time string from API)
ALTER TABLE games
ADD COLUMN IF NOT EXISTS game_time_et VARCHAR(20);

-- Add arena column (venue name)
ALTER TABLE games
ADD COLUMN IF NOT EXISTS arena VARCHAR(100);

-- Create index for time-based queries (upcoming games sorted by time)
CREATE INDEX IF NOT EXISTS idx_games_time ON games (game_date, game_time);

-- Comment
COMMENT ON COLUMN games.game_time IS 'Game start time in UTC';
COMMENT ON COLUMN games.game_time_et IS 'Original game time from NBA API (Eastern Time)';
COMMENT ON COLUMN games.arena IS 'Arena/venue name';
