-- ==================== Migration 006: Analytics & System Operations ====================
-- Created: 2025-01-23
-- Description: Materialized views, aggregations, and system monitoring
-- Dependencies: 001-005
-- =======================================================================================

BEGIN;

SET search_path TO public;

-- ==================== Table: Data Refresh Log ====================

CREATE TABLE data_refresh_log (
    log_id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    refresh_type VARCHAR(50) NOT NULL,
    rows_affected INTEGER,
    refresh_status VARCHAR(20) NOT NULL,
    refresh_duration_seconds NUMERIC(8,2),
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    CONSTRAINT check_refresh_status CHECK (refresh_status IN ('success', 'failure', 'in_progress', 'cancelled')),
    CONSTRAINT check_refresh_type CHECK (refresh_type IN ('full', 'incremental', 'materialized_view', 'aggregation'))
);

CREATE INDEX idx_data_refresh_log_table ON data_refresh_log(table_name);
CREATE INDEX idx_data_refresh_log_status ON data_refresh_log(refresh_status);
CREATE INDEX idx_data_refresh_log_started ON data_refresh_log(started_at);

COMMENT ON TABLE data_refresh_log IS 'ETL and data refresh operation tracking';
COMMENT ON COLUMN data_refresh_log.refresh_duration_seconds IS 'Total time for refresh operation';

-- ==================== Table: Query Performance Log ====================

CREATE TABLE query_performance_log (
    log_id SERIAL PRIMARY KEY,
    query_name VARCHAR(100),
    query_type VARCHAR(50),
    execution_time_ms NUMERIC(10,2),
    rows_returned INTEGER,
    query_plan JSONB,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_query_performance_query_name ON query_performance_log(query_name);
CREATE INDEX idx_query_performance_execution_time ON query_performance_log(execution_time_ms);
CREATE INDEX idx_query_performance_executed_at ON query_performance_log(executed_at);

COMMENT ON TABLE query_performance_log IS 'Query performance monitoring and optimization';

-- ==================== Table: API Request Log ====================

CREATE TABLE api_request_log (
    log_id SERIAL PRIMARY KEY,
    api_endpoint VARCHAR(200) NOT NULL,
    http_method VARCHAR(10),
    response_status INTEGER,
    response_time_ms NUMERIC(8,2),
    error_message TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_request_log_endpoint ON api_request_log(api_endpoint);
CREATE INDEX idx_api_request_log_status ON api_request_log(response_status);
CREATE INDEX idx_api_request_log_requested_at ON api_request_log(requested_at);

COMMENT ON TABLE api_request_log IS 'NBA API request monitoring and rate limit tracking';

-- ==================== Table: User Analytics ====================

CREATE TABLE user_analytics (
    analytics_id SERIAL PRIMARY KEY,
    user_session_id VARCHAR(100),
    page_viewed VARCHAR(200),
    action_type VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_analytics_session ON user_analytics(user_session_id);
CREATE INDEX idx_user_analytics_page ON user_analytics(page_viewed);
CREATE INDEX idx_user_analytics_created_at ON user_analytics(created_at);

COMMENT ON TABLE user_analytics IS 'Frontend user behavior tracking';

-- ==================== Table: Alerts ====================

CREATE TABLE alerts (
    alert_id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,

    CONSTRAINT check_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT check_alert_type CHECK (alert_type IN ('data_quality', 'system_error', 'api_failure', 'performance', 'betting_anomaly'))
);

CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_is_resolved ON alerts(is_resolved);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

COMMENT ON TABLE alerts IS 'System alerts and monitoring notifications';

-- ==================== Materialized View: Current Team Form ====================

CREATE MATERIALIZED VIEW mv_team_current_form AS
SELECT
    t.team_id,
    t.abbreviation,
    t.full_name,

    -- Last 5 games
    COUNT(g.game_id) FILTER (WHERE g.game_date >= CURRENT_DATE - 15) as last_5_games,
    SUM(
        CASE
            WHEN (g.home_team_id = t.team_id AND g.home_team_score > g.away_team_score) THEN 1
            WHEN (g.away_team_id = t.team_id AND g.away_team_score > g.home_team_score) THEN 1
            ELSE 0
        END
    ) FILTER (WHERE g.game_date >= CURRENT_DATE - 15) as last_5_wins,

    -- Last 10 games
    COUNT(g.game_id) FILTER (WHERE g.game_date >= CURRENT_DATE - 30) as last_10_games,
    SUM(
        CASE
            WHEN (g.home_team_id = t.team_id AND g.home_team_score > g.away_team_score) THEN 1
            WHEN (g.away_team_id = t.team_id AND g.away_team_score > g.home_team_score) THEN 1
            ELSE 0
        END
    ) FILTER (WHERE g.game_date >= CURRENT_DATE - 30) as last_10_wins,

    -- Season totals
    COUNT(g.game_id) as season_games,
    SUM(
        CASE
            WHEN (g.home_team_id = t.team_id AND g.home_team_score > g.away_team_score) THEN 1
            WHEN (g.away_team_id = t.team_id AND g.away_team_score > g.home_team_score) THEN 1
            ELSE 0
        END
    ) as season_wins

FROM teams t
LEFT JOIN games g ON (t.team_id = g.home_team_id OR t.team_id = g.away_team_id)
    AND g.game_status = 'Final'
    AND g.season = (SELECT season_id FROM seasons WHERE is_current = true LIMIT 1)
GROUP BY t.team_id, t.abbreviation, t.full_name;

CREATE UNIQUE INDEX idx_mv_team_current_form_team ON mv_team_current_form(team_id);

COMMENT ON MATERIALIZED VIEW mv_team_current_form IS 'Team performance trends - last 5, last 10, and season';

-- ==================== Materialized View: Top Player Averages ====================

CREATE MATERIALIZED VIEW mv_top_player_averages AS
SELECT
    p.player_id,
    p.full_name,
    t.team_id,
    t.abbreviation as team_abbreviation,
    COUNT(pgs.game_id) as games_played,
    ROUND(AVG(pgs.points), 1) as points_avg,
    ROUND(AVG(pgs.rebounds), 1) as rebounds_avg,
    ROUND(AVG(pgs.assists), 1) as assists_avg,
    ROUND(AVG(pgs.steals), 1) as steals_avg,
    ROUND(AVG(pgs.blocks), 1) as blocks_avg,
    ROUND(AVG(pgs.turnovers), 1) as turnovers_avg,
    ROUND(AVG(pgs.minutes), 1) as minutes_avg,
    ROUND(AVG(pgs.fg_pct), 3) as fg_pct_avg,
    ROUND(AVG(pgs.fg3_pct), 3) as fg3_pct_avg,
    ROUND(AVG(pgs.ft_pct), 3) as ft_pct_avg,
    MAX(g.game_date) as last_game_date
FROM players p
JOIN player_game_stats pgs ON p.player_id = pgs.player_id
JOIN teams t ON pgs.team_id = t.team_id
JOIN games g ON pgs.game_id = g.game_id
WHERE g.season = (SELECT season_id FROM seasons WHERE is_current = true LIMIT 1)
  AND g.game_status = 'Final'
GROUP BY p.player_id, p.full_name, t.team_id, t.abbreviation
HAVING COUNT(pgs.game_id) >= 5;

CREATE INDEX idx_mv_top_player_averages_player ON mv_top_player_averages(player_id);
CREATE INDEX idx_mv_top_player_averages_team ON mv_top_player_averages(team_id);
CREATE INDEX idx_mv_top_player_averages_ppg ON mv_top_player_averages(points_avg);
CREATE INDEX idx_mv_top_player_averages_minutes ON mv_top_player_averages(minutes_avg);

COMMENT ON MATERIALIZED VIEW mv_top_player_averages IS 'Season-long player averages for current season';

-- ==================== Materialized View: Head to Head History ====================

CREATE MATERIALIZED VIEW mv_head_to_head_history AS
SELECT
    LEAST(g.home_team_id, g.away_team_id) as team_a_id,
    GREATEST(g.home_team_id, g.away_team_id) as team_b_id,
    t1.abbreviation as team_a_abbr,
    t2.abbreviation as team_b_abbr,
    COUNT(*) as total_games,

    -- Last 5 games
    COUNT(*) FILTER (WHERE g.game_date >= CURRENT_DATE - INTERVAL '365 days') as last_year_games,

    -- Team A wins
    SUM(
        CASE
            WHEN (g.home_team_id = LEAST(g.home_team_id, g.away_team_id) AND g.home_team_score > g.away_team_score) THEN 1
            WHEN (g.away_team_id = LEAST(g.home_team_id, g.away_team_id) AND g.away_team_score > g.home_team_score) THEN 1
            ELSE 0
        END
    ) as team_a_wins,

    -- Average scoring
    ROUND(AVG(
        CASE
            WHEN g.home_team_id = LEAST(g.home_team_id, g.away_team_id) THEN g.home_team_score
            ELSE g.away_team_score
        END
    ), 1) as team_a_avg_score,

    ROUND(AVG(
        CASE
            WHEN g.away_team_id = GREATEST(g.home_team_id, g.away_team_id) THEN g.away_team_score
            ELSE g.home_team_score
        END
    ), 1) as team_b_avg_score

FROM games g
JOIN teams t1 ON LEAST(g.home_team_id, g.away_team_id) = t1.team_id
JOIN teams t2 ON GREATEST(g.home_team_id, g.away_team_id) = t2.team_id
WHERE g.game_status = 'Final'
GROUP BY
    LEAST(g.home_team_id, g.away_team_id),
    GREATEST(g.home_team_id, g.away_team_id),
    t1.abbreviation,
    t2.abbreviation;

CREATE INDEX idx_mv_head_to_head_team_a ON mv_head_to_head_history(team_a_id);
CREATE INDEX idx_mv_head_to_head_team_b ON mv_head_to_head_history(team_b_id);

COMMENT ON MATERIALIZED VIEW mv_head_to_head_history IS 'Historical matchup data between teams';

-- ==================== Refresh Functions ====================

CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_team_current_form;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_player_averages;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_head_to_head_history;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_all_materialized_views() IS 'Refresh all materialized views concurrently';

-- ==================== Verification ====================

SELECT
    schemaname,
    tablename as viewname
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('data_refresh_log', 'query_performance_log', 'api_request_log', 'user_analytics', 'alerts')
ORDER BY tablename;

SELECT
    schemaname,
    matviewname
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY matviewname;

COMMIT;
