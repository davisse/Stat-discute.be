-- ==================== Migration 007: Indexes & Constraints Optimization ====================
-- Created: 2025-01-23
-- Description: Additional indexes, constraints, and performance optimizations
-- Dependencies: 001-006
-- ===========================================================================================

BEGIN;

SET search_path TO public;

-- ==================== Player Game Stats: Additional Indexes ====================

-- Composite indexes for common query patterns
CREATE INDEX idx_player_game_stats_player_date ON player_game_stats(player_id, game_id);
CREATE INDEX idx_player_game_stats_team_date ON player_game_stats(team_id, game_id);
CREATE INDEX idx_player_game_stats_points ON player_game_stats(points DESC);
CREATE INDEX idx_player_game_stats_minutes ON player_game_stats(minutes DESC);

-- Performance stats indexes
CREATE INDEX idx_player_game_stats_efficiency ON player_game_stats((points + rebounds + assists - (fg_attempted - fg_made) - (ft_attempted - ft_made) - turnovers));

COMMENT ON INDEX idx_player_game_stats_efficiency IS 'Game efficiency formula index';

-- ==================== Games: Composite Indexes ====================

-- Common date range queries
CREATE INDEX idx_games_season_date ON games(season, game_date);
CREATE INDEX idx_games_status_date ON games(game_status, game_date);

-- Team combination lookups
CREATE INDEX idx_games_teams ON games(home_team_id, away_team_id);

-- ==================== Team Game Stats: Performance Indexes ====================

CREATE INDEX idx_team_game_stats_game_team ON team_game_stats(game_id, team_id);
CREATE INDEX idx_team_game_stats_pace ON team_game_stats(pace);
CREATE INDEX idx_team_game_stats_net_rating ON team_game_stats(net_rating DESC);

-- ==================== Betting: Composite Indexes ====================

CREATE INDEX idx_betting_lines_game_bookmaker ON betting_lines(game_id, bookmaker, recorded_at);
CREATE INDEX idx_betting_odds_market_recorded ON betting_odds(market_id, recorded_at DESC);

-- ==================== Add Missing Constraints ====================

-- Ensure positive values where applicable
ALTER TABLE player_game_stats ADD CONSTRAINT check_pgs_minutes_positive CHECK (minutes >= 0);
ALTER TABLE player_game_stats ADD CONSTRAINT check_pgs_points_positive CHECK (points >= 0);
ALTER TABLE player_game_stats ADD CONSTRAINT check_pgs_rebounds_positive CHECK (rebounds >= 0);
ALTER TABLE player_game_stats ADD CONSTRAINT check_pgs_assists_positive CHECK (assists >= 0);

ALTER TABLE team_game_stats ADD CONSTRAINT check_tgs_points_positive CHECK (points >= 0);
ALTER TABLE team_game_stats ADD CONSTRAINT check_tgs_possessions_positive CHECK (possessions >= 0);

-- Game scores must be consistent with status
ALTER TABLE games ADD CONSTRAINT check_game_final_has_scores CHECK (
    (game_status != 'Final') OR
    (home_team_score IS NOT NULL AND away_team_score IS NOT NULL)
);

-- ==================== Partial Indexes (Performance Optimization) ====================

-- Only index active players for common queries
CREATE INDEX idx_players_active_name ON players(full_name) WHERE is_active = true;

-- Only index completed games for stats (removed date filter - not immutable)
CREATE INDEX idx_games_final ON games(game_date) WHERE game_status = 'Final';

-- Only index available betting odds
CREATE INDEX idx_betting_odds_available ON betting_odds(market_id, recorded_at DESC) WHERE is_available = true;

-- ==================== Full Text Search ====================

-- Add full text search for player names
ALTER TABLE players ADD COLUMN name_search_vector tsvector;

UPDATE players
SET name_search_vector = to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(first_name, '') || ' ' || coalesce(last_name, ''));

CREATE INDEX idx_players_name_search ON players USING gin(name_search_vector);

-- Trigger to keep search vector updated
CREATE OR REPLACE FUNCTION update_player_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.name_search_vector :=
        to_tsvector('english', coalesce(NEW.full_name, '') || ' ' || coalesce(NEW.first_name, '') || ' ' || coalesce(NEW.last_name, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_search_vector
    BEFORE INSERT OR UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_player_search_vector();

-- ==================== Partitioning Preparation ====================

-- Add partition key comments for future partitioning
COMMENT ON COLUMN games.game_date IS 'Partition key for future range partitioning by season';
COMMENT ON COLUMN player_game_stats.game_id IS 'Can be partitioned by game date range for performance';
COMMENT ON COLUMN betting_odds.recorded_at IS 'Partition key for time-series data retention';

-- ==================== Database Statistics ====================

-- Update statistics for query planner
ANALYZE teams;
ANALYZE players;
ANALYZE games;
ANALYZE player_game_stats;
ANALYZE team_game_stats;

-- ==================== Verification ====================

-- Check all indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check all constraints
SELECT
    conrelid::regclass AS table_name,
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, contype, conname;

COMMIT;

-- ==================== Post-Migration Recommendations ====================

-- Run VACUUM ANALYZE after migration
-- VACUUM ANALYZE;

-- Consider enabling query logging for performance monitoring
-- ALTER DATABASE nba_stats SET log_min_duration_statement = 1000; -- Log queries > 1s

-- Set up automatic statistics updates
-- ALTER TABLE player_game_stats SET (autovacuum_analyze_threshold = 50);
-- ALTER TABLE games SET (autovacuum_analyze_threshold = 50);
