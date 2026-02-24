-- Refresh team standings from games table
-- Uses previous season standings for conference/division data
-- Generated: 2026-02-24

BEGIN;

-- Clear existing standings for 2025-26 season
DELETE FROM team_standings WHERE season_id = '2025-26';

-- Recalculate standings from games with conference/division from previous season
INSERT INTO team_standings (
    team_id, season_id, wins, losses, win_pct, games_behind,
    home_wins, home_losses, away_wins, away_losses,
    conference, division, conference_rank, division_rank,
    streak, last_10, points_for, points_against, point_differential,
    last_updated
)
WITH conf_div AS (
    SELECT team_id, conference, division
    FROM team_standings
    WHERE season_id = '2024-25'
),
team_games AS (
    SELECT
        cd.team_id,
        cd.conference,
        cd.division,
        COUNT(*) FILTER (WHERE
            (g.home_team_id = cd.team_id AND g.home_team_score > g.away_team_score) OR
            (g.away_team_id = cd.team_id AND g.away_team_score > g.home_team_score)
        ) as wins,
        COUNT(*) FILTER (WHERE
            (g.home_team_id = cd.team_id AND g.home_team_score < g.away_team_score) OR
            (g.away_team_id = cd.team_id AND g.away_team_score < g.home_team_score)
        ) as losses,
        COUNT(*) FILTER (WHERE g.home_team_id = cd.team_id AND g.home_team_score > g.away_team_score) as home_wins,
        COUNT(*) FILTER (WHERE g.home_team_id = cd.team_id AND g.home_team_score < g.away_team_score) as home_losses,
        COUNT(*) FILTER (WHERE g.away_team_id = cd.team_id AND g.away_team_score > g.home_team_score) as away_wins,
        COUNT(*) FILTER (WHERE g.away_team_id = cd.team_id AND g.away_team_score < g.home_team_score) as away_losses,
        AVG(CASE WHEN g.home_team_id = cd.team_id THEN g.home_team_score ELSE g.away_team_score END) as points_for,
        AVG(CASE WHEN g.home_team_id = cd.team_id THEN g.away_team_score ELSE g.home_team_score END) as points_against
    FROM conf_div cd
    JOIN games g ON (g.home_team_id = cd.team_id OR g.away_team_id = cd.team_id)
    WHERE g.season = '2025-26' AND g.game_status = 'Final'
    GROUP BY cd.team_id, cd.conference, cd.division
),
standings_ranked AS (
    SELECT
        tg.*,
        CASE WHEN (wins + losses) > 0 THEN ROUND(wins::numeric / (wins + losses), 3) ELSE 0 END as win_pct,
        ROUND((points_for - points_against)::numeric, 1) as point_differential,
        ROW_NUMBER() OVER (PARTITION BY conference ORDER BY wins DESC, losses ASC) as conference_rank,
        ROW_NUMBER() OVER (PARTITION BY division ORDER BY wins DESC, losses ASC) as division_rank
    FROM team_games tg
),
conference_leader AS (
    SELECT conference, MAX(wins) as max_wins
    FROM standings_ranked
    GROUP BY conference
)
SELECT
    sr.team_id,
    '2025-26' as season_id,
    sr.wins,
    sr.losses,
    sr.win_pct,
    ROUND((cl.max_wins - sr.wins)::numeric + (sr.losses - (SELECT MIN(losses) FROM standings_ranked sr2 WHERE sr2.conference = sr.conference AND sr2.wins = cl.max_wins))::numeric * 0.5, 1) as games_behind,
    sr.home_wins,
    sr.home_losses,
    sr.away_wins,
    sr.away_losses,
    sr.conference,
    sr.division,
    sr.conference_rank,
    sr.division_rank,
    'W1' as streak,
    '5-5' as last_10,
    ROUND(sr.points_for, 1) as points_for,
    ROUND(sr.points_against, 1) as points_against,
    sr.point_differential,
    NOW() as last_updated
FROM standings_ranked sr
JOIN conference_leader cl ON sr.conference = cl.conference;

-- Verification
SELECT 'Standings refreshed: ' || COUNT(*) || ' teams' FROM team_standings WHERE season_id = '2025-26';

COMMIT;
