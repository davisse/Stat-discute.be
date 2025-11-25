-- ==================== MIGRATION 009: PLAYER GAME PARTICIPATION ====================
-- Track player participation and absences for each game
-- This enables "with/without player" split analysis for betting

-- Table: player_game_participation
CREATE TABLE IF NOT EXISTS player_game_participation (
    participation_id BIGSERIAL PRIMARY KEY,
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    player_id BIGINT NOT NULL REFERENCES players(player_id) ON DELETE CASCADE,
    team_id BIGINT NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT false,
    inactive_reason VARCHAR(50),
    minutes_played INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_game_player UNIQUE(game_id, player_id)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_participation_game
    ON player_game_participation(game_id);

CREATE INDEX IF NOT EXISTS idx_participation_player
    ON player_game_participation(player_id);

CREATE INDEX IF NOT EXISTS idx_participation_team
    ON player_game_participation(team_id);

CREATE INDEX IF NOT EXISTS idx_participation_active
    ON player_game_participation(is_active);

CREATE INDEX IF NOT EXISTS idx_participation_team_game
    ON player_game_participation(team_id, game_id);

CREATE INDEX IF NOT EXISTS idx_participation_player_active
    ON player_game_participation(player_id, is_active);

-- Composite index for common query pattern: player + season games
CREATE INDEX IF NOT EXISTS idx_participation_player_game_active
    ON player_game_participation(player_id, game_id, is_active);

-- Comments for documentation
COMMENT ON TABLE player_game_participation IS
    'Tracks which players participated in each game, enabling with/without split analysis';

COMMENT ON COLUMN player_game_participation.is_active IS
    'TRUE if player played in the game, FALSE if absent/inactive';

COMMENT ON COLUMN player_game_participation.inactive_reason IS
    'Reason for absence: injury, rest, dnp-cd (coaches decision), suspension, personal, not-with-team';

COMMENT ON COLUMN player_game_participation.minutes_played IS
    'Minutes played if active, 0 if inactive';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_participation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_participation_updated_at
    BEFORE UPDATE ON player_game_participation
    FOR EACH ROW
    EXECUTE FUNCTION update_participation_timestamp();

-- Grant permissions (if using specific roles)
-- GRANT SELECT, INSERT, UPDATE ON player_game_participation TO nba_app;
-- GRANT USAGE, SELECT ON SEQUENCE player_game_participation_participation_id_seq TO nba_app;
