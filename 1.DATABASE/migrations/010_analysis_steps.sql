-- Migration 010: Add Analysis Steps for Detailed Thinking Flow
-- Purpose: Store structured step-by-step analysis for each bet

-- Add analysis_steps column to user_bets
ALTER TABLE user_bets
ADD COLUMN analysis_steps TEXT[];

COMMENT ON COLUMN user_bets.analysis_steps IS 'Step-by-step analysis flow showing the thinking process';

-- Update the view to include analysis_steps
DROP VIEW IF EXISTS user_bets_with_game_details;

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
    ub.analysis_steps,
    g.home_team_score,
    g.away_team_score,
    (g.home_team_score + g.away_team_score) as combined_total,
    ub.created_at
FROM user_bets ub
LEFT JOIN games g ON ub.game_id = g.game_id
ORDER BY ub.bet_date DESC;
