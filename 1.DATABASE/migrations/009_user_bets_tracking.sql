-- Migration 009: User Bets Tracking System
-- Purpose: Track daily betting picks with results and performance analytics

-- Drop existing table if exists
DROP TABLE IF EXISTS user_bets CASCADE;

-- Create user_bets table
CREATE TABLE user_bets (
    bet_id SERIAL PRIMARY KEY,
    bet_date DATE NOT NULL,
    game_id VARCHAR(10) REFERENCES games(game_id),
    home_team_abbr VARCHAR(3) NOT NULL,
    away_team_abbr VARCHAR(3) NOT NULL,
    game_datetime TIMESTAMP NOT NULL,

    -- Bet details
    bet_type VARCHAR(50) NOT NULL, -- 'total_under', 'total_over', 'spread', 'moneyline', etc.
    bet_selection TEXT NOT NULL, -- Description: 'Under 239.5', 'PHI -3.5', etc.
    line_value NUMERIC(5,1), -- The line (239.5, -3.5, etc.)
    odds_decimal NUMERIC(6,2) NOT NULL, -- Decimal odds (e.g., 2.02)
    odds_american INTEGER, -- American odds (e.g., +102)
    stake_units NUMERIC(6,2) DEFAULT 1.00, -- Units risked

    -- Result tracking
    result VARCHAR(20), -- 'win', 'loss', 'push', 'pending'
    actual_total NUMERIC(5,1), -- Actual game total/result
    profit_loss NUMERIC(8,2), -- Profit/loss in units

    -- Analysis notes
    confidence_rating INTEGER CHECK (confidence_rating BETWEEN 1 AND 10),
    notes TEXT,
    key_factors TEXT[], -- Array of key factors for the bet

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_bet_per_day UNIQUE (bet_date),
    CONSTRAINT valid_result CHECK (result IN ('win', 'loss', 'push', 'pending', NULL))
);

-- Create indexes for performance
CREATE INDEX idx_user_bets_date ON user_bets(bet_date DESC);
CREATE INDEX idx_user_bets_game ON user_bets(game_id);
CREATE INDEX idx_user_bets_result ON user_bets(result);
CREATE INDEX idx_user_bets_bet_type ON user_bets(bet_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_bets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_bets_updated_at
    BEFORE UPDATE ON user_bets
    FOR EACH ROW
    EXECUTE FUNCTION update_user_bets_updated_at();

-- Create view for bet statistics
CREATE OR REPLACE VIEW user_bet_stats AS
SELECT
    COUNT(*) as total_bets,
    COUNT(*) FILTER (WHERE result = 'win') as wins,
    COUNT(*) FILTER (WHERE result = 'loss') as losses,
    COUNT(*) FILTER (WHERE result = 'push') as pushes,
    COUNT(*) FILTER (WHERE result = 'pending') as pending,
    ROUND(
        COUNT(*) FILTER (WHERE result = 'win')::NUMERIC /
        NULLIF(COUNT(*) FILTER (WHERE result IN ('win', 'loss'))::NUMERIC, 0) * 100,
        2
    ) as win_percentage,
    COALESCE(SUM(profit_loss), 0) as total_profit_loss,
    COALESCE(SUM(profit_loss) FILTER (WHERE result = 'win'), 0) as total_winnings,
    COALESCE(SUM(profit_loss) FILTER (WHERE result = 'loss'), 0) as total_losses,
    COALESCE(AVG(profit_loss) FILTER (WHERE result IN ('win', 'loss')), 0) as avg_profit_loss,
    ROUND(
        COALESCE(SUM(profit_loss), 0) /
        NULLIF(COUNT(*) FILTER (WHERE result IN ('win', 'loss'))::NUMERIC, 0),
        2
    ) as roi_per_bet
FROM user_bets;

-- Create view for recent bets with game details
CREATE OR REPLACE VIEW user_bets_with_game_details AS
SELECT
    ub.bet_id,
    ub.bet_date,
    ub.game_datetime,
    ub.home_team_abbr,
    ub.away_team_abbr,
    ub.bet_type,
    ub.bet_selection,
    ub.line_value,
    ub.odds_decimal,
    ub.odds_american,
    ub.stake_units,
    ub.result,
    ub.actual_total,
    ub.profit_loss,
    ub.confidence_rating,
    ub.notes,
    ub.key_factors,
    g.home_team_score,
    g.away_team_score,
    (g.home_team_score + g.away_team_score) as combined_total,
    ub.created_at
FROM user_bets ub
LEFT JOIN games g ON ub.game_id = g.game_id
ORDER BY ub.bet_date DESC;

COMMENT ON TABLE user_bets IS 'Tracks user betting picks - one bet per day with performance analytics';
COMMENT ON COLUMN user_bets.bet_type IS 'Type of bet: total_under, total_over, spread, moneyline, etc.';
COMMENT ON COLUMN user_bets.confidence_rating IS 'Confidence level from 1 (low) to 10 (max bet)';
COMMENT ON COLUMN user_bets.key_factors IS 'Array of key factors that influenced the bet decision';
COMMENT ON VIEW user_bet_stats IS 'Aggregate betting performance statistics';
COMMENT ON VIEW user_bets_with_game_details IS 'User bets joined with actual game results';
