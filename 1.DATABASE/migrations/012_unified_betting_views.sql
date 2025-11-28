-- Migration 012: Unified Betting Views
-- Creates cross-bookmaker views for player props and alternative lines
-- Combines Pinnacle (normalized) + Kambi/Scooore (denormalized) schemas
-- Date: 2024-11-28

BEGIN;

-- ============================================================================
-- UNIFIED PLAYER PROPS VIEW
-- Combines Pinnacle (betting_events → betting_markets → betting_odds)
-- with Kambi (player_props table)
-- ============================================================================

CREATE OR REPLACE VIEW v_unified_player_props AS
-- Pinnacle player props from normalized tables
SELECT
    be.game_id,
    g.game_date,
    ht.abbreviation as home_team,
    at.abbreviation as away_team,
    -- Extract player name from market_name (format: "Player Name (Prop Type)")
    REGEXP_REPLACE(bm.market_name, '\s*\([^)]+\)$', '') as player_name,
    pp.player_id,
    'pinnacle' as bookmaker,
    -- Extract prop type from market_key (more reliable)
    CASE
        WHEN bm.market_key ILIKE '%_points' THEN 'points'
        WHEN bm.market_key ILIKE '%_rebounds' THEN 'rebounds'
        WHEN bm.market_key ILIKE '%_assists' THEN 'assists'
        WHEN bm.market_key ILIKE '%_3_point_fg' THEN '3pm'
        WHEN bm.market_key ILIKE '%_pts+rebs+asts' OR bm.market_key ILIKE '%_pra' THEN 'pra'
        WHEN bm.market_key ILIKE '%_steals' THEN 'steals'
        WHEN bm.market_key ILIKE '%_blocks' THEN 'blocks'
        WHEN bm.market_key ILIKE '%_turnovers' THEN 'turnovers'
        WHEN bm.market_key ILIKE '%_double+double' THEN 'double_double'
        WHEN bm.market_key ILIKE '%_points+rebounds' THEN 'points_rebounds'
        WHEN bm.market_key ILIKE '%_points+assists' THEN 'points_assists'
        WHEN bm.market_key ILIKE '%_rebounds+assists' THEN 'rebounds_assists'
        WHEN bm.market_key ILIKE '%_steals+blocks' THEN 'steals_blocks'
        ELSE 'other'
    END as prop_type,
    bo.handicap as line,
    -- Get over odds (selection contains 'over')
    MAX(CASE WHEN bo.selection ILIKE '%over%' THEN bo.odds_decimal END) as over_odds_decimal,
    MAX(CASE WHEN bo.selection ILIKE '%under%' THEN bo.odds_decimal END) as under_odds_decimal,
    MAX(CASE WHEN bo.selection ILIKE '%over%' THEN bo.odds_american END) as over_odds_american,
    MAX(CASE WHEN bo.selection ILIKE '%under%' THEN bo.odds_american END) as under_odds_american,
    bo.recorded_at
FROM betting_odds bo
JOIN betting_markets bm ON bo.market_id = bm.market_id
JOIN betting_events be ON bm.event_id = be.event_id
JOIN games g ON be.game_id = g.game_id
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
LEFT JOIN players pp ON LOWER(REGEXP_REPLACE(bm.market_name, '\s*\([^)]+\)$', '')) = LOWER(pp.full_name)
WHERE bm.market_type = 'player_prop'
  AND be.bookmaker = 'pinnacle'
  AND bo.is_available = true
GROUP BY be.game_id, g.game_date, ht.abbreviation, at.abbreviation,
         bm.market_name, pp.player_id, bm.market_key, bo.handicap, bo.recorded_at

UNION ALL

-- Kambi/Scooore player props from denormalized table
SELECT
    pp.game_id,
    g.game_date,
    ht.abbreviation as home_team,
    at.abbreviation as away_team,
    pp.player_name,
    pp.player_id,
    pp.bookmaker,
    pp.prop_type,
    pp.line,
    pp.over_odds_decimal,
    pp.under_odds_decimal,
    pp.over_odds_american,
    pp.under_odds_american,
    pp.recorded_at
FROM player_props pp
JOIN games g ON pp.game_id = g.game_id
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
WHERE pp.is_available = true;

COMMENT ON VIEW v_unified_player_props IS 'Cross-bookmaker player props from Pinnacle and Kambi/Scooore';

-- ============================================================================
-- UNIFIED ALTERNATIVE LINES VIEW
-- Combines Pinnacle alternative spreads/totals with Kambi alternative_lines
-- ============================================================================

CREATE OR REPLACE VIEW v_unified_alternative_lines AS
-- Pinnacle alternative lines from normalized tables
SELECT
    be.game_id,
    g.game_date,
    ht.full_name as home_team,
    at.full_name as away_team,
    'pinnacle' as bookmaker,
    CASE
        WHEN bm.market_key ILIKE '%spread%' OR bm.market_key ILIKE '%handicap%' THEN 'spread'
        WHEN bm.market_key ILIKE '%total%' OR bm.market_key ILIKE '%over%under%' THEN 'total'
        ELSE 'other'
    END as line_type,
    bo.handicap as line_value,
    -- Spread odds (home/away)
    MAX(CASE WHEN bo.selection ILIKE '%home%' OR bo.selection = ht.full_name THEN bo.odds_american END) as home_odds_american,
    MAX(CASE WHEN bo.selection ILIKE '%away%' OR bo.selection = at.full_name THEN bo.odds_american END) as away_odds_american,
    MAX(CASE WHEN bo.selection ILIKE '%home%' OR bo.selection = ht.full_name THEN bo.odds_decimal END) as home_odds_decimal,
    MAX(CASE WHEN bo.selection ILIKE '%away%' OR bo.selection = at.full_name THEN bo.odds_decimal END) as away_odds_decimal,
    -- Total odds (over/under)
    MAX(CASE WHEN bo.selection ILIKE '%over%' THEN bo.odds_american END) as over_odds_american,
    MAX(CASE WHEN bo.selection ILIKE '%under%' THEN bo.odds_american END) as under_odds_american,
    MAX(CASE WHEN bo.selection ILIKE '%over%' THEN bo.odds_decimal END) as over_odds_decimal,
    MAX(CASE WHEN bo.selection ILIKE '%under%' THEN bo.odds_decimal END) as under_odds_decimal,
    CASE WHEN bm.market_key ILIKE '%main%' THEN true ELSE false END as is_main_line,
    bo.recorded_at
FROM betting_odds bo
JOIN betting_markets bm ON bo.market_id = bm.market_id
JOIN betting_events be ON bm.event_id = be.event_id
JOIN games g ON be.game_id = g.game_id
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
WHERE bm.market_type IN ('spread', 'total')
  AND be.bookmaker = 'pinnacle'
  AND bo.is_available = true
GROUP BY be.game_id, g.game_date, ht.full_name, at.full_name,
         bm.market_key, bo.handicap, bo.recorded_at

UNION ALL

-- Kambi/Scooore alternative lines from denormalized table
SELECT
    al.game_id,
    g.game_date,
    ht.full_name as home_team,
    at.full_name as away_team,
    al.bookmaker,
    al.line_type,
    al.line_value,
    al.home_odds_american,
    al.away_odds_american,
    al.home_odds_decimal,
    al.away_odds_decimal,
    al.over_odds_american,
    al.under_odds_american,
    al.over_odds_decimal,
    al.under_odds_decimal,
    al.is_main_line,
    al.recorded_at
FROM alternative_lines al
JOIN games g ON al.game_id = g.game_id
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id;

COMMENT ON VIEW v_unified_alternative_lines IS 'Cross-bookmaker alternative spreads and totals from Pinnacle and Kambi/Scooore';

-- ============================================================================
-- CROSS-BOOKMAKER PLAYER PROPS COMPARISON VIEW
-- Easy comparison of same prop across bookmakers
-- ============================================================================

CREATE OR REPLACE VIEW v_player_props_comparison AS
SELECT
    game_id,
    game_date,
    player_name,
    prop_type,
    line,
    bookmaker,
    over_odds_decimal,
    under_odds_decimal,
    recorded_at,
    -- Best odds indicator
    RANK() OVER (
        PARTITION BY game_id, player_name, prop_type, line
        ORDER BY over_odds_decimal DESC NULLS LAST
    ) as over_rank,
    RANK() OVER (
        PARTITION BY game_id, player_name, prop_type, line
        ORDER BY under_odds_decimal DESC NULLS LAST
    ) as under_rank
FROM v_unified_player_props
ORDER BY game_date DESC, player_name, prop_type, line, bookmaker;

COMMENT ON VIEW v_player_props_comparison IS 'Compare same player prop across bookmakers with best odds ranking';

-- ============================================================================
-- CROSS-BOOKMAKER ALTERNATIVE LINES COMPARISON VIEW
-- ============================================================================

CREATE OR REPLACE VIEW v_alt_lines_comparison AS
SELECT
    game_id,
    game_date,
    home_team,
    away_team,
    line_type,
    line_value,
    bookmaker,
    -- Spread display
    CASE WHEN line_type = 'spread' THEN home_odds_decimal END as home_spread_odds,
    CASE WHEN line_type = 'spread' THEN away_odds_decimal END as away_spread_odds,
    -- Total display
    CASE WHEN line_type = 'total' THEN over_odds_decimal END as over_total_odds,
    CASE WHEN line_type = 'total' THEN under_odds_decimal END as under_total_odds,
    is_main_line,
    recorded_at
FROM v_unified_alternative_lines
ORDER BY game_date DESC, game_id, line_type, line_value, bookmaker;

COMMENT ON VIEW v_alt_lines_comparison IS 'Compare alternative lines across bookmakers';

-- ============================================================================
-- BEST ODDS FINDER VIEW
-- Find the best available odds for each player prop
-- ============================================================================

CREATE OR REPLACE VIEW v_best_player_prop_odds AS
WITH ranked_props AS (
    SELECT
        game_id,
        game_date,
        player_name,
        prop_type,
        line,
        bookmaker,
        over_odds_decimal,
        under_odds_decimal,
        recorded_at,
        ROW_NUMBER() OVER (
            PARTITION BY game_id, player_name, prop_type, line
            ORDER BY over_odds_decimal DESC NULLS LAST
        ) as over_rank,
        ROW_NUMBER() OVER (
            PARTITION BY game_id, player_name, prop_type, line
            ORDER BY under_odds_decimal DESC NULLS LAST
        ) as under_rank
    FROM v_unified_player_props
)
SELECT DISTINCT
    rp.game_id,
    rp.game_date,
    rp.player_name,
    rp.prop_type,
    rp.line,
    -- Best over
    best_over.bookmaker as best_over_bookmaker,
    best_over.over_odds_decimal as best_over_odds,
    -- Best under
    best_under.bookmaker as best_under_bookmaker,
    best_under.under_odds_decimal as best_under_odds,
    -- Comparison
    (SELECT COUNT(DISTINCT bookmaker) FROM v_unified_player_props up
     WHERE up.game_id = rp.game_id AND up.player_name = rp.player_name
     AND up.prop_type = rp.prop_type AND up.line = rp.line) as bookmaker_count
FROM ranked_props rp
JOIN ranked_props best_over ON rp.game_id = best_over.game_id
    AND rp.player_name = best_over.player_name
    AND rp.prop_type = best_over.prop_type
    AND rp.line = best_over.line
    AND best_over.over_rank = 1
JOIN ranked_props best_under ON rp.game_id = best_under.game_id
    AND rp.player_name = best_under.player_name
    AND rp.prop_type = best_under.prop_type
    AND rp.line = best_under.line
    AND best_under.under_rank = 1
WHERE rp.over_rank = 1
ORDER BY rp.game_date DESC, rp.player_name, rp.prop_type, rp.line;

COMMENT ON VIEW v_best_player_prop_odds IS 'Find best available odds for each player prop across all bookmakers';

COMMIT;

-- ============================================================================
-- POST-MIGRATION NOTES
-- ============================================================================
--
-- Views created:
-- - v_unified_player_props: All player props from all bookmakers
-- - v_unified_alternative_lines: All alternative spreads/totals from all bookmakers
-- - v_player_props_comparison: Side-by-side comparison with ranking
-- - v_alt_lines_comparison: Alternative lines side-by-side
-- - v_best_player_prop_odds: Best available odds finder
--
-- Example queries:
--
-- 1. Compare LeBron's points prop across bookmakers:
--    SELECT * FROM v_player_props_comparison
--    WHERE player_name ILIKE '%lebron%' AND prop_type = 'points';
--
-- 2. Find best odds for all props today:
--    SELECT * FROM v_best_player_prop_odds
--    WHERE game_date = CURRENT_DATE;
--
-- 3. Alternative spreads comparison:
--    SELECT * FROM v_alt_lines_comparison
--    WHERE line_type = 'spread' AND is_main_line = true;
--
