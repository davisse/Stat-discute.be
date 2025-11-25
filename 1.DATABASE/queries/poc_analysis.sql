-- ==================== POC Analysis Query ====================
-- Today's Games with Team Performance Context
-- ================================================================

\echo '\n========================================='
\echo '🏀 NBA GAMES ANALYSIS - TODAY'
\echo '=========================================\n'

-- Today's games with recent team performance
SELECT
    TO_CHAR(g.game_date, 'Day, Mon DD, YYYY') AS game_date,
    g.game_id,
    ht.full_name AS home_team,
    at.full_name AS away_team,
    CASE
        WHEN g.home_team_score IS NULL THEN 'Scheduled'
        ELSE g.home_team_score || ' - ' || g.away_team_score
    END AS score,
    g.game_status,

    -- Home team recent performance (last 5 games)
    (
        SELECT ROUND(AVG(CASE WHEN pgs.team_id = g.home_team_id THEN pgs.points ELSE NULL END), 1)
        FROM player_game_stats pgs
        JOIN games recent_g ON pgs.game_id = recent_g.game_id
        WHERE pgs.team_id = g.home_team_id
          AND recent_g.game_date < g.game_date
          AND recent_g.game_status = 'Final'
        ORDER BY recent_g.game_date DESC
        LIMIT 5
    ) AS home_avg_ppg_l5,

    -- Away team recent performance (last 5 games)
    (
        SELECT ROUND(AVG(CASE WHEN pgs.team_id = g.away_team_id THEN pgs.points ELSE NULL END), 1)
        FROM player_game_stats pgs
        JOIN games recent_g ON pgs.game_id = recent_g.game_id
        WHERE pgs.team_id = g.away_team_id
          AND recent_g.game_date < g.game_date
          AND recent_g.game_status = 'Final'
        ORDER BY recent_g.game_date DESC
        LIMIT 5
    ) AS away_avg_ppg_l5

FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
WHERE g.game_date = CURRENT_DATE
ORDER BY g.game_id;

\echo '\n========================================='
\echo '📊 DATABASE STATISTICS'
\echo '=========================================\n'

-- Database statistics
SELECT
    'Teams' AS table_name,
    COUNT(*) AS total_rows,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - 1) AS added_today
FROM teams
UNION ALL
SELECT
    'Games',
    COUNT(*),
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - 1)
FROM games
UNION ALL
SELECT
    'Player Stats',
    COUNT(*),
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - 1)
FROM player_game_stats
ORDER BY table_name;

\echo '\n========================================='
\echo '🎯 RECENT GAMES WITH BOX SCORES'
\echo '=========================================\n'

-- Recent games with collected stats
SELECT
    g.game_date,
    ht.abbreviation || ' vs ' || at.abbreviation AS matchup,
    g.home_team_score || ' - ' || g.away_team_score AS score,
    COUNT(DISTINCT pgs.player_id) AS players_with_stats,
    ROUND(AVG(pgs.points), 1) AS avg_points_per_player,
    ROUND(AVG(pgs.rebounds), 1) AS avg_rebounds_per_player,
    ROUND(AVG(pgs.assists), 1) AS avg_assists_per_player
FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
LEFT JOIN player_game_stats pgs ON g.game_id = pgs.game_id
WHERE g.game_status = 'Final'
  AND g.game_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY g.game_date, g.game_id, ht.abbreviation, at.abbreviation, g.home_team_score, g.away_team_score
HAVING COUNT(DISTINCT pgs.player_id) > 0
ORDER BY g.game_date DESC
LIMIT 10;

\echo '\n========================================='
\echo '⭐ TOP PERFORMERS (Last 7 Days)'
\echo '=========================================\n'

-- Top scorers in recent games
SELECT
    ROW_NUMBER() OVER (ORDER BY pgs.points DESC) AS rank,
    p.full_name AS player,
    t.abbreviation AS team,
    g.game_date,
    pgs.points,
    pgs.rebounds,
    pgs.assists,
    ROUND(pgs.fg_pct * 100, 1) AS fg_pct
FROM player_game_stats pgs
JOIN players p ON pgs.player_id = p.player_id
JOIN teams t ON pgs.team_id = t.team_id
JOIN games g ON pgs.game_id = g.game_id
WHERE g.game_date >= CURRENT_DATE - INTERVAL '7 days'
  AND g.game_status = 'Final'
ORDER BY pgs.points DESC
LIMIT 10;

\echo '\n========================================='
\echo '✅ POC ANALYSIS COMPLETE'
\echo '=========================================\n'
