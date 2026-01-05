-- Migration 010: Create game_quarter_scores view
-- This view pivots the normalized period_scores table into a denormalized format
-- expected by the frontend Q1 analysis queries

-- Drop if exists (for re-running)
DROP VIEW IF EXISTS game_quarter_scores;

-- Create the view
CREATE VIEW game_quarter_scores AS
WITH home_scores AS (
    SELECT
        ps.game_id,
        MAX(CASE WHEN ps.period_number = 1 AND ps.period_type = 'Q' THEN ps.points END) as q1,
        MAX(CASE WHEN ps.period_number = 2 AND ps.period_type = 'Q' THEN ps.points END) as q2,
        MAX(CASE WHEN ps.period_number = 3 AND ps.period_type = 'Q' THEN ps.points END) as q3,
        MAX(CASE WHEN ps.period_number = 4 AND ps.period_type = 'Q' THEN ps.points END) as q4,
        MAX(CASE WHEN ps.period_number = 1 AND ps.period_type = 'OT' THEN ps.points END) as ot1,
        MAX(CASE WHEN ps.period_number = 2 AND ps.period_type = 'OT' THEN ps.points END) as ot2,
        SUM(CASE WHEN ps.period_number <= 2 AND ps.period_type = 'Q' THEN ps.points ELSE 0 END) as first_half,
        SUM(CASE WHEN ps.period_number >= 3 AND ps.period_type = 'Q' THEN ps.points ELSE 0 END) as second_half
    FROM period_scores ps
    JOIN games g ON ps.game_id = g.game_id
    WHERE ps.team_id = g.home_team_id
    GROUP BY ps.game_id
),
away_scores AS (
    SELECT
        ps.game_id,
        MAX(CASE WHEN ps.period_number = 1 AND ps.period_type = 'Q' THEN ps.points END) as q1,
        MAX(CASE WHEN ps.period_number = 2 AND ps.period_type = 'Q' THEN ps.points END) as q2,
        MAX(CASE WHEN ps.period_number = 3 AND ps.period_type = 'Q' THEN ps.points END) as q3,
        MAX(CASE WHEN ps.period_number = 4 AND ps.period_type = 'Q' THEN ps.points END) as q4,
        MAX(CASE WHEN ps.period_number = 1 AND ps.period_type = 'OT' THEN ps.points END) as ot1,
        MAX(CASE WHEN ps.period_number = 2 AND ps.period_type = 'OT' THEN ps.points END) as ot2,
        SUM(CASE WHEN ps.period_number <= 2 AND ps.period_type = 'Q' THEN ps.points ELSE 0 END) as first_half,
        SUM(CASE WHEN ps.period_number >= 3 AND ps.period_type = 'Q' THEN ps.points ELSE 0 END) as second_half
    FROM period_scores ps
    JOIN games g ON ps.game_id = g.game_id
    WHERE ps.team_id = g.away_team_id
    GROUP BY ps.game_id
)
SELECT
    g.game_id,
    g.home_team_id,
    g.away_team_id,
    hs.q1 as home_q1,
    hs.q2 as home_q2,
    hs.q3 as home_q3,
    hs.q4 as home_q4,
    hs.ot1 as home_ot1,
    hs.ot2 as home_ot2,
    hs.first_half as home_first_half,
    hs.second_half as home_second_half,
    aws.q1 as away_q1,
    aws.q2 as away_q2,
    aws.q3 as away_q3,
    aws.q4 as away_q4,
    aws.ot1 as away_ot1,
    aws.ot2 as away_ot2,
    aws.first_half as away_first_half,
    aws.second_half as away_second_half
FROM games g
JOIN home_scores hs ON g.game_id = hs.game_id
JOIN away_scores aws ON g.game_id = aws.game_id;

-- Create an index hint comment for the view (indexes already exist on period_scores)
COMMENT ON VIEW game_quarter_scores IS 'Denormalized view of quarter scores for Q1 betting analysis. Built from period_scores table.';
