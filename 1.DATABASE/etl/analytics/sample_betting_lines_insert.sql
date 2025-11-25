-- Sample Betting Lines Insert
-- This demonstrates how betting_lines data should be structured for ATS calculation
-- Use this as a reference when implementing actual betting data collection

-- Example 1: Lakers vs Celtics (Lakers favored by 5.5 points)
-- Lakers won 110-103, covered the spread (7 point margin > 5.5 spread)
INSERT INTO betting_lines (
    game_id,
    bookmaker,
    spread,
    home_spread_odds,
    away_spread_odds,
    total,
    over_odds,
    under_odds,
    line_source,
    is_opening_line
) VALUES (
    '0022500001',  -- Must match actual game_id in games table
    'pinnacle',
    -5.5,          -- Negative = home team favored
    -110,          -- American odds for home spread
    -110,          -- American odds for away spread
    220.5,         -- Total points line
    -110,
    -110,
    'manual_test',
    true
);

-- Example 2: Warriors vs Suns (Warriors underdog by 3.5 points)
-- Warriors lost 98-105, but covered (7 point loss < 3.5 spread)
INSERT INTO betting_lines (
    game_id,
    bookmaker,
    spread,
    home_spread_odds,
    away_spread_odds,
    total,
    over_odds,
    under_odds,
    line_source,
    is_opening_line
) VALUES (
    '0022500002',
    'pinnacle',
    3.5,           -- Positive = home team underdog
    -110,
    -110,
    210.0,
    -110,
    -110,
    'manual_test',
    true
);

-- Example 3: Pick'em game (no favorite, spread = 0)
INSERT INTO betting_lines (
    game_id,
    bookmaker,
    spread,
    home_spread_odds,
    away_spread_odds,
    total,
    over_odds,
    under_odds,
    line_source,
    is_opening_line
) VALUES (
    '0022500003',
    'pinnacle',
    0.0,           -- Even odds, no favorite
    -110,
    -110,
    225.0,
    -110,
    -110,
    'manual_test',
    true
);

-- Notes:
-- 1. spread < 0 means home team is FAVORITE
-- 2. spread > 0 means home team is UNDERDOG
-- 3. spread = 0 means PICK'EM (even odds)
-- 4. Half-point spreads (.5) prevent pushes
-- 5. American odds: -110 = risk $110 to win $100 (standard vig)
