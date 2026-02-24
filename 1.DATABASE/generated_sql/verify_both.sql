-- Verify which database has what data
SELECT 'Connected to DB - current_database: ' || current_database();
SELECT 'Active Players: ' || COUNT(*) FROM players WHERE is_active = true;
SELECT 'Total Games 2025-26: ' || COUNT(*) FROM games WHERE season = '2025-26';
SELECT 'Final Games 2025-26: ' || COUNT(*) FROM games WHERE season = '2025-26' AND game_status = 'Final';
SELECT 'BOS Final Games: ' || COUNT(*) FROM games WHERE season = '2025-26' AND game_status = 'Final' AND (home_team_id = 1610612738 OR away_team_id = 1610612738);
SELECT 'Last Final Game: ' || MAX(game_date) FROM games WHERE season = '2025-26' AND game_status = 'Final';
