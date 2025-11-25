-- ================================================================
-- Migration 009: Add Starter Position Tracking
-- ================================================================
-- Purpose: Enable starter vs bench analysis for betting props
-- Date: 2025-11-23
-- Author: Claude Code
-- ================================================================

\echo '=========================================='
\echo 'Migration 009: Add Starter Position Tracking'
\echo '=========================================='

BEGIN;

-- Add starter tracking columns to player_game_stats
\echo 'Adding start_position and is_starter columns...'
ALTER TABLE player_game_stats
ADD COLUMN IF NOT EXISTS start_position VARCHAR(5),
ADD COLUMN IF NOT EXISTS is_starter BOOLEAN GENERATED ALWAYS AS (start_position IS NOT NULL) STORED;

-- Add indexes for efficient starter filtering
\echo 'Creating indexes...'
CREATE INDEX IF NOT EXISTS idx_player_game_stats_is_starter
ON player_game_stats(is_starter)
WHERE is_starter = TRUE;

CREATE INDEX IF NOT EXISTS idx_player_game_stats_start_position
ON player_game_stats(start_position)
WHERE start_position IS NOT NULL;

-- Add column comments for documentation
\echo 'Adding column documentation...'
COMMENT ON COLUMN player_game_stats.start_position IS
'Starting position from NBA API boxscoretraditionalv2: F, G, C, F-C, G-F, or NULL for bench players';

COMMENT ON COLUMN player_game_stats.is_starter IS
'Computed column: TRUE if start_position IS NOT NULL (player started), FALSE if bench player';

COMMIT;

\echo '=========================================='
\echo 'Migration 009 completed successfully'
\echo '=========================================='

-- Verification query
\echo ''
\echo 'Verification: Checking new columns...'
SELECT
    column_name,
    data_type,
    is_nullable,
    CASE
        WHEN column_name = 'is_starter' THEN 'GENERATED COLUMN'
        ELSE COALESCE(column_default, 'NULL')
    END as default_value
FROM information_schema.columns
WHERE table_name = 'player_game_stats'
  AND column_name IN ('start_position', 'is_starter')
ORDER BY column_name;

\echo ''
\echo 'Verification: Checking indexes...'
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'player_game_stats'
  AND indexname LIKE '%starter%'
ORDER BY indexname;
