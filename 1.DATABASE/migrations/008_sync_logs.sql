-- Migration 008: Add sync_logs table for ETL operations tracking
-- Created: 2025-11-19
-- Purpose: Track data synchronization operations with status, duration, and messages

-- Drop existing table if exists
DROP TABLE IF EXISTS sync_logs CASCADE;

-- Create sync_logs table
CREATE TABLE sync_logs (
    log_id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,  -- 'sync_games', 'fetch_player_stats', 'calculate_analytics', etc.
    status VARCHAR(20) NOT NULL,   -- 'success', 'error', 'running'
    duration INTEGER,               -- Duration in seconds (NULL if still running)
    message TEXT,                   -- Success message or error details
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_sync_logs_created_at ON sync_logs(created_at DESC);
CREATE INDEX idx_sync_logs_action ON sync_logs(action);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);

-- Add comment for table documentation
COMMENT ON TABLE sync_logs IS 'ETL operation logs with status tracking and performance metrics';
COMMENT ON COLUMN sync_logs.action IS 'Type of sync operation performed';
COMMENT ON COLUMN sync_logs.status IS 'Operation status: success, error, or running';
COMMENT ON COLUMN sync_logs.duration IS 'Execution time in seconds';
COMMENT ON COLUMN sync_logs.message IS 'Detailed message or error description';

-- Insert sample log for migration verification
INSERT INTO sync_logs (action, status, duration, message)
VALUES ('migration_008', 'success', 0, 'Sync logs table created successfully');
