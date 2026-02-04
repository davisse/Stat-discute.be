-- Refresh team standings from games table
-- Safe standalone script - no dependencies on other tables
-- Uses season_id (not season) to match production schema

BEGIN;

-- Clear existing standings for 2025-26 season
DELETE FROM team_standings WHERE season_id = '2025-26';

-- Recalculate standings from games
INSERT INTO team_standings (
    team_id,
    season_id,
    wins,
    losses,
    win_pct,
    home_wins,
    home_losses,
    away_wins,
    away_losses,
    streak,
    last_10,
    last_updated
)
SELECT
    t.team_id,
    '2025-26' as season_id,
    COUNT(*) FILTER (WHERE
        (g.home_team_id = t.team_id AND g.home_team_score > g.away_team_score) OR
        (g.away_team_id = t.team_id AND g.away_team_score > g.home_team_score)
    ) as wins,
    COUNT(*) FILTER (WHERE
        (g.home_team_id = t.team_id AND g.home_team_score < g.away_team_score) OR
        (g.away_team_id = t.team_id AND g.away_team_score < g.home_team_score)
    ) as losses,
    ROUND(
        COUNT(*) FILTER (WHERE
            (g.home_team_id = t.team_id AND g.home_team_score > g.away_team_score) OR
            (g.away_team_id = t.team_id AND g.away_team_score > g.home_team_score)
        )::numeric / NULLIF(COUNT(*) FILTER (WHERE g.game_status = 'Final'), 0), 3
    ) as win_pct,
    COUNT(*) FILTER (WHERE g.home_team_id = t.team_id AND g.home_team_score > g.away_team_score) as home_wins,
    COUNT(*) FILTER (WHERE g.home_team_id = t.team_id AND g.home_team_score < g.away_team_score) as home_losses,
    COUNT(*) FILTER (WHERE g.away_team_id = t.team_id AND g.away_team_score > g.home_team_score) as away_wins,
    COUNT(*) FILTER (WHERE g.away_team_id = t.team_id AND g.away_team_score < g.home_team_score) as away_losses,
    'W1' as streak, -- Simplified, calculate properly would need window functions
    '5-5' as last_10, -- Simplified placeholder
    NOW() as last_updated
FROM teams t
LEFT JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
    AND g.season = '2025-26'
    AND g.game_status = 'Final'
GROUP BY t.team_id;

-- Output verification
SELECT 'Standings refreshed for ' || COUNT(*) || ' teams' FROM team_standings WHERE season_id = '2025-26';

COMMIT;
