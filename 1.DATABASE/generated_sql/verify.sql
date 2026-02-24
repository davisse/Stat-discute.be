-- Production verification query
SELECT 'Active Players: ' || COUNT(*) FROM players WHERE is_active = true;
SELECT 'Total Games 2025-26: ' || COUNT(*) FROM games WHERE season = '2025-26';
SELECT 'Final Games 2025-26: ' || COUNT(*) FROM games WHERE season = '2025-26' AND game_status = 'Final';
SELECT 'Scheduled Games 2025-26: ' || COUNT(*) FROM games WHERE season = '2025-26' AND game_status = 'Scheduled';
SELECT 'Last Final Game: ' || MAX(game_date) FROM games WHERE season = '2025-26' AND game_status = 'Final';
SELECT 'BOS Final Games: ' || COUNT(*) FROM games WHERE season = '2025-26' AND game_status = 'Final' AND (home_team_id = 1610612738 OR away_team_id = 1610612738);
SELECT 'BOS Scheduled Games: ' || COUNT(*) FROM games WHERE season = '2025-26' AND game_status = 'Scheduled' AND (home_team_id = 1610612738 OR away_team_id = 1610612738);
SELECT 'BOS game 0022500545 status: ' || game_status || ' score: ' || COALESCE(home_team_score::text,'NULL') || '-' || COALESCE(away_team_score::text,'NULL') FROM games WHERE game_id = '0022500545';
SELECT 'Player Game Stats: ' || COUNT(*) FROM player_game_stats pgs JOIN games g USING(game_id) WHERE g.season = '2025-26';
SELECT 'Standings Count: ' || COUNT(*) FROM team_standings WHERE season_id = '2025-26';
SELECT 'DVP Count: ' || COUNT(*) FROM defensive_stats_by_position WHERE season = '2025-26';
