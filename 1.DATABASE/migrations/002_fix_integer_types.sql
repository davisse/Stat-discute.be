-- ==================== Migration 002: Fix Integer Types ====================
-- Fix player_id and team_id to use BIGINT for NBA API compatibility
-- ========================================================================

BEGIN;

-- Alter players table
ALTER TABLE players ALTER COLUMN player_id TYPE BIGINT;

-- Alter teams table
ALTER TABLE teams ALTER COLUMN team_id TYPE BIGINT;

-- Alter games table
ALTER TABLE games ALTER COLUMN home_team_id TYPE BIGINT;
ALTER TABLE games ALTER COLUMN away_team_id TYPE BIGINT;

-- Alter player_game_stats table
ALTER TABLE player_game_stats ALTER COLUMN player_id TYPE BIGINT;
ALTER TABLE player_game_stats ALTER COLUMN team_id TYPE BIGINT;

COMMIT;
