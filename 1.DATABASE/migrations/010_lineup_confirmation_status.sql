-- Migration 010: Add Lineup Confirmation Status
-- Date: 2025-11-23
-- Purpose: Track whether lineups are "confirmed" or "expected" from RotoWire

-- Add lineup_status field to nba_lineup_snapshots
ALTER TABLE nba_lineup_snapshots
ADD COLUMN lineup_status VARCHAR(20) DEFAULT 'expected';

-- Add comment explaining the field
COMMENT ON COLUMN nba_lineup_snapshots.lineup_status IS
'Lineup confirmation status: "confirmed" (green dot on RotoWire) or "expected" (yellow dot). Confirmed means team has officially announced starting lineup.';

-- Add index for filtering queries by status
CREATE INDEX idx_lineup_snapshots_status
ON nba_lineup_snapshots(lineup_status);

-- Update the latest lineup snapshots view to include status
DROP VIEW IF EXISTS v_latest_lineup_snapshots;

CREATE VIEW v_latest_lineup_snapshots AS
SELECT DISTINCT ON (ls.lineup_id, ls.team_id)
    ls.snapshot_id,
    ls.lineup_id,
    ls.team_id,
    t.abbreviation as team,
    ls.is_home_team,
    ls.lineup_status,  -- NEW FIELD
    ls.pg_player_id, ls.pg_rotowire_id,
    p_pg.full_name as pg_name, ls.pg_status,
    ls.sg_player_id, ls.sg_rotowire_id,
    p_sg.full_name as sg_name, ls.sg_status,
    ls.sf_player_id, ls.sf_rotowire_id,
    p_sf.full_name as sf_name, ls.sf_status,
    ls.pf_player_id, ls.pf_rotowire_id,
    p_pf.full_name as pf_name, ls.pf_status,
    ls.c_player_id, ls.c_rotowire_id,
    p_c.full_name as c_name, ls.c_status,
    ls.scraped_at
FROM nba_lineup_snapshots ls
JOIN teams t ON ls.team_id = t.team_id
LEFT JOIN players p_pg ON ls.pg_player_id = p_pg.player_id
LEFT JOIN players p_sg ON ls.sg_player_id = p_sg.player_id
LEFT JOIN players p_sf ON ls.sf_player_id = p_sf.player_id
LEFT JOIN players p_pf ON ls.pf_player_id = p_pf.player_id
LEFT JOIN players p_c ON ls.c_player_id = p_c.player_id
ORDER BY ls.lineup_id, ls.team_id, ls.scraped_at DESC;

COMMENT ON VIEW v_latest_lineup_snapshots IS
'Latest lineup snapshot for each team in each game, including confirmation status and player names';

-- Validation query (should return 0 rows if migration applied correctly)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'nba_lineup_snapshots'
        AND column_name = 'lineup_status'
    ) THEN
        RAISE EXCEPTION 'Migration failed: lineup_status column not added';
    END IF;

    RAISE NOTICE 'Migration 010 completed successfully';
END $$;
