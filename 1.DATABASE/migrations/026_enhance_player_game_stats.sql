-- Migration 026: Enhance player_game_stats with additional boxscore data
-- Adds columns available from boxscoretraditionalv2 endpoint
--
-- New columns:
--   - oreb/dreb: Offensive/defensive rebounds (currently only total rebounds)
--   - plus_minus: Player +/- for the game
--   - personal_fouls: Personal fouls committed
--   - dnp_reason: DNP/DND reason from COMMENT field (injuries, rest, etc.)
--
-- Date: 2025-01-11

BEGIN;

-- Add offensive rebounds
ALTER TABLE player_game_stats
ADD COLUMN IF NOT EXISTS oreb INTEGER DEFAULT 0;

-- Add defensive rebounds
ALTER TABLE player_game_stats
ADD COLUMN IF NOT EXISTS dreb INTEGER DEFAULT 0;

-- Add plus/minus
ALTER TABLE player_game_stats
ADD COLUMN IF NOT EXISTS plus_minus INTEGER DEFAULT 0;

-- Add personal fouls
ALTER TABLE player_game_stats
ADD COLUMN IF NOT EXISTS personal_fouls INTEGER DEFAULT 0;

-- Add DNP reason (from COMMENT field)
-- Examples: "DNP - Coach's Decision", "DNP - Injury/Illness", "DNP - Rest", "DND - Injury/Illness", "NWT"
ALTER TABLE player_game_stats
ADD COLUMN IF NOT EXISTS dnp_reason VARCHAR(100);

-- Add index on dnp_reason for filtering DNP players
CREATE INDEX IF NOT EXISTS idx_player_game_stats_dnp
ON player_game_stats(dnp_reason)
WHERE dnp_reason IS NOT NULL;

-- Add index on plus_minus for impact analysis
CREATE INDEX IF NOT EXISTS idx_player_game_stats_plus_minus
ON player_game_stats(plus_minus DESC);

-- Add check constraints
ALTER TABLE player_game_stats
ADD CONSTRAINT check_pgs_oreb_positive CHECK (oreb >= 0);

ALTER TABLE player_game_stats
ADD CONSTRAINT check_pgs_dreb_positive CHECK (dreb >= 0);

ALTER TABLE player_game_stats
ADD CONSTRAINT check_pgs_personal_fouls_positive CHECK (personal_fouls >= 0);

-- Comment on new columns
COMMENT ON COLUMN player_game_stats.oreb IS 'Offensive rebounds from boxscoretraditionalv2';
COMMENT ON COLUMN player_game_stats.dreb IS 'Defensive rebounds from boxscoretraditionalv2';
COMMENT ON COLUMN player_game_stats.plus_minus IS 'Plus/minus score impact from boxscoretraditionalv2';
COMMENT ON COLUMN player_game_stats.personal_fouls IS 'Personal fouls committed from boxscoretraditionalv2';
COMMENT ON COLUMN player_game_stats.dnp_reason IS 'DNP/DND reason from COMMENT field (e.g., DNP - Rest, DND - Injury/Illness)';

COMMIT;

-- Verification query
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'player_game_stats'
AND column_name IN ('oreb', 'dreb', 'plus_minus', 'personal_fouls', 'dnp_reason')
ORDER BY ordinal_position;
