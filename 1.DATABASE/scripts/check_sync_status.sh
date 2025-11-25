#!/bin/bash
# Check sync status and database statistics

echo "========================================"
echo "📊 DATABASE SYNC STATUS"
echo "========================================"
echo ""

# Connect to database and get stats
/opt/homebrew/opt/postgresql@18/bin/psql nba_stats -c "
SELECT
    'Teams' as table_name,
    COUNT(*) as total_rows
FROM teams
UNION ALL
SELECT
    'Games',
    COUNT(*)
FROM games
UNION ALL
SELECT
    'Players',
    COUNT(*)
FROM players
UNION ALL
SELECT
    'Player Stats',
    COUNT(*)
FROM player_game_stats
ORDER BY table_name;
"

echo ""
echo "========================================"
echo "🏀 GAMES BY STATUS"
echo "========================================"
/opt/homebrew/opt/postgresql@18/bin/psql nba_stats -c "
SELECT
    game_status,
    COUNT(*) as count
FROM games
GROUP BY game_status
ORDER BY game_status;
"

echo ""
echo "========================================"
echo "📅 GAMES BY DATE RANGE"
echo "========================================"
/opt/homebrew/opt/postgresql@18/bin/psql nba_stats -c "
SELECT
    MIN(game_date) as earliest_game,
    MAX(game_date) as latest_game,
    COUNT(*) as total_games
FROM games;
"

echo ""
echo "========================================"
echo "✅ GAMES WITH BOX SCORES"
echo "========================================"
/opt/homebrew/opt/postgresql@18/bin/psql nba_stats -c "
SELECT
    COUNT(DISTINCT g.game_id) as games_with_stats,
    (SELECT COUNT(*) FROM games WHERE game_status = 'Final') as total_final_games,
    ROUND(100.0 * COUNT(DISTINCT g.game_id) / NULLIF((SELECT COUNT(*) FROM games WHERE game_status = 'Final'), 0), 1) as percentage_complete
FROM games g
JOIN player_game_stats pgs ON g.game_id = pgs.game_id;
"

echo ""
