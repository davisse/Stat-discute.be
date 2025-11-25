-- ==================== Migration 005: Betting Intelligence Tables ====================
-- Created: 2025-01-23
-- Description: Betting lines, odds, predictions, and analytics
-- Dependencies: 001-004
-- ===================================================================================

BEGIN;

SET search_path TO public;

-- ==================== Table: Betting Events ====================

CREATE TABLE betting_events (
    event_id VARCHAR(20) PRIMARY KEY,
    game_id VARCHAR(10) REFERENCES games(game_id),
    bookmaker VARCHAR(50) DEFAULT 'pinnacle',
    league_id INTEGER,
    sport_id INTEGER,
    event_start_time TIMESTAMP,
    event_status VARCHAR(20),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_data JSONB,

    CONSTRAINT check_event_status CHECK (event_status IN ('scheduled', 'live', 'final', 'cancelled'))
);

CREATE INDEX idx_betting_events_game ON betting_events(game_id);
CREATE INDEX idx_betting_events_bookmaker ON betting_events(bookmaker);
CREATE INDEX idx_betting_events_status ON betting_events(event_status);
CREATE INDEX idx_betting_events_start_time ON betting_events(event_start_time);

COMMENT ON TABLE betting_events IS 'Betting events linked to NBA games';
COMMENT ON COLUMN betting_events.raw_data IS 'Raw JSON response from betting API';

-- ==================== Table: Betting Markets ====================

CREATE TABLE betting_markets (
    market_id SERIAL PRIMARY KEY,
    event_id VARCHAR(20) NOT NULL REFERENCES betting_events(event_id),
    market_key VARCHAR(50) NOT NULL,
    market_name VARCHAR(100) NOT NULL,
    market_type VARCHAR(20) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_market_type CHECK (market_type IN ('moneyline', 'spread', 'total', 'player_prop', 'team_prop', 'other')),
    UNIQUE(event_id, market_key)
);

CREATE INDEX idx_betting_markets_event ON betting_markets(event_id);
CREATE INDEX idx_betting_markets_type ON betting_markets(market_type);
CREATE INDEX idx_betting_markets_key ON betting_markets(market_key);

COMMENT ON TABLE betting_markets IS 'Available betting markets per event';
COMMENT ON COLUMN betting_markets.market_type IS 'Type of bet (moneyline, spread, total, props)';

-- ==================== Table: Betting Odds ====================

CREATE TABLE betting_odds (
    odds_id SERIAL PRIMARY KEY,
    market_id INTEGER NOT NULL REFERENCES betting_markets(market_id),
    selection VARCHAR(100) NOT NULL,
    odds_decimal NUMERIC(6,2),
    odds_american INTEGER,
    handicap NUMERIC(5,1),
    is_available BOOLEAN DEFAULT true,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_odds_decimal CHECK (odds_decimal > 1.0),
    CONSTRAINT check_odds_american CHECK (odds_american != 0)
);

CREATE INDEX idx_betting_odds_market ON betting_odds(market_id);
CREATE INDEX idx_betting_odds_recorded_at ON betting_odds(recorded_at);
CREATE INDEX idx_betting_odds_is_available ON betting_odds(is_available);

COMMENT ON TABLE betting_odds IS 'Historical odds data with timestamps';
COMMENT ON COLUMN betting_odds.odds_decimal IS 'Decimal odds format (e.g., 2.50)';
COMMENT ON COLUMN betting_odds.odds_american IS 'American odds format (e.g., +150, -110)';
COMMENT ON COLUMN betting_odds.handicap IS 'Point spread or handicap value';

-- ==================== Table: Betting Lines (Snapshot) ====================

CREATE TABLE betting_lines (
    line_id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    bookmaker VARCHAR(50) NOT NULL,

    -- Moneyline
    home_moneyline INTEGER,
    away_moneyline INTEGER,

    -- Spread
    spread NUMERIC(4,1),
    home_spread_odds INTEGER,
    away_spread_odds INTEGER,

    -- Total
    total NUMERIC(5,1),
    over_odds INTEGER,
    under_odds INTEGER,

    -- Metadata
    line_source VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_opening_line BOOLEAN DEFAULT false,
    is_closing_line BOOLEAN DEFAULT false
);

CREATE INDEX idx_betting_lines_game ON betting_lines(game_id);
CREATE INDEX idx_betting_lines_bookmaker ON betting_lines(bookmaker);
CREATE INDEX idx_betting_lines_recorded_at ON betting_lines(recorded_at);
CREATE INDEX idx_betting_lines_opening ON betting_lines(is_opening_line);
CREATE INDEX idx_betting_lines_closing ON betting_lines(is_closing_line);

COMMENT ON TABLE betting_lines IS 'Simplified betting lines snapshot (moneyline, spread, total)';
COMMENT ON COLUMN betting_lines.spread IS 'Point spread (positive = home favored)';
COMMENT ON COLUMN betting_lines.total IS 'Over/under total points';

-- ==================== Table: ATS Performance (Against The Spread) ====================

CREATE TABLE ats_performance (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(7) NOT NULL REFERENCES seasons(season_id),

    -- Overall ATS
    ats_wins INTEGER DEFAULT 0,
    ats_losses INTEGER DEFAULT 0,
    ats_pushes INTEGER DEFAULT 0,
    ats_win_pct NUMERIC(5,3),

    -- Home/Away ATS
    home_ats_wins INTEGER DEFAULT 0,
    home_ats_losses INTEGER DEFAULT 0,
    away_ats_wins INTEGER DEFAULT 0,
    away_ats_losses INTEGER DEFAULT 0,

    -- Favorite/Underdog ATS
    favorite_ats_wins INTEGER DEFAULT 0,
    favorite_ats_losses INTEGER DEFAULT 0,
    underdog_ats_wins INTEGER DEFAULT 0,
    underdog_ats_losses INTEGER DEFAULT 0,

    -- Over/Under
    over_record INTEGER DEFAULT 0,
    under_record INTEGER DEFAULT 0,
    ou_pushes INTEGER DEFAULT 0,

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(team_id, season_id)
);

CREATE INDEX idx_ats_performance_team ON ats_performance(team_id);
CREATE INDEX idx_ats_performance_season ON ats_performance(season_id);
CREATE INDEX idx_ats_performance_win_pct ON ats_performance(ats_win_pct);

COMMENT ON TABLE ats_performance IS 'Team performance against the spread (ATS) by season';
COMMENT ON COLUMN ats_performance.ats_win_pct IS 'ATS winning percentage';

-- ==================== Table: Game Predictions ====================

CREATE TABLE game_predictions (
    prediction_id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    model_name VARCHAR(50) NOT NULL,
    model_version VARCHAR(20),

    -- Predictions
    predicted_winner_id BIGINT REFERENCES teams(team_id),
    predicted_home_score NUMERIC(5,1),
    predicted_away_score NUMERIC(5,1),
    predicted_spread NUMERIC(4,1),
    predicted_total NUMERIC(5,1),

    -- Confidence
    win_probability NUMERIC(5,3),
    confidence_level VARCHAR(20),

    -- Value Indicators
    has_betting_edge BOOLEAN DEFAULT false,
    expected_value NUMERIC(6,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_win_probability CHECK (win_probability BETWEEN 0 AND 1),
    CONSTRAINT check_confidence_level CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high'))
);

CREATE INDEX idx_game_predictions_game ON game_predictions(game_id);
CREATE INDEX idx_game_predictions_model ON game_predictions(model_name);
CREATE INDEX idx_game_predictions_edge ON game_predictions(has_betting_edge);
CREATE INDEX idx_game_predictions_confidence ON game_predictions(confidence_level);

COMMENT ON TABLE game_predictions IS 'Game outcome predictions from various models';
COMMENT ON COLUMN game_predictions.expected_value IS 'Expected value of betting opportunity';
COMMENT ON COLUMN game_predictions.has_betting_edge IS 'Indicates positive expected value';

-- ==================== Table: Betting Trends ====================

CREATE TABLE betting_trends (
    trend_id SERIAL PRIMARY KEY,
    trend_name VARCHAR(100) NOT NULL,
    trend_type VARCHAR(50) NOT NULL,
    team_id BIGINT REFERENCES teams(team_id),
    player_id BIGINT REFERENCES players(player_id),
    season_id VARCHAR(7) REFERENCES seasons(season_id),

    -- Trend Stats
    sample_size INTEGER,
    success_rate NUMERIC(5,3),
    units_won NUMERIC(8,2),
    roi NUMERIC(6,3),

    -- Conditions
    conditions JSONB,

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_trend_type CHECK (trend_type IN ('team', 'player', 'situational', 'system'))
);

CREATE INDEX idx_betting_trends_type ON betting_trends(trend_type);
CREATE INDEX idx_betting_trends_team ON betting_trends(team_id);
CREATE INDEX idx_betting_trends_player ON betting_trends(player_id);
CREATE INDEX idx_betting_trends_roi ON betting_trends(roi);

COMMENT ON TABLE betting_trends IS 'Historical betting trends and systems';
COMMENT ON COLUMN betting_trends.roi IS 'Return on investment percentage';
COMMENT ON COLUMN betting_trends.conditions IS 'JSON conditions for trend (home/away, rest days, etc.)';

-- ==================== Verification ====================

SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('betting_events', 'betting_markets', 'betting_odds', 'betting_lines', 'ats_performance', 'game_predictions', 'betting_trends')
ORDER BY tablename;

COMMIT;
