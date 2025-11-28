-- Migration 011: Multi-Bookmaker Support
-- Adds support for multiple bookmakers (Scooore/Kambi, Pinnacle, etc.)
-- Includes: bookmaker_events, team_aliases, player_props, alternative_lines
-- Date: 2024-11-28

BEGIN;

-- ============================================================================
-- BOOKMAKER EVENTS MAPPING
-- Maps external bookmaker event IDs to internal game_id
-- Enables deduplication and cross-bookmaker event matching
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookmaker_events (
    id SERIAL PRIMARY KEY,
    bookmaker VARCHAR(50) NOT NULL,              -- 'pinnacle', 'scooore', 'draftkings'
    external_event_id VARCHAR(50) NOT NULL,      -- Bookmaker's event ID (e.g., Kambi: "1024647954")
    game_id VARCHAR(10) REFERENCES games(game_id),
    home_team VARCHAR(100),                      -- For matching when game_id unknown
    away_team VARCHAR(100),                      -- For matching when game_id unknown
    event_start_time TIMESTAMPTZ,
    league VARCHAR(50) DEFAULT 'NBA',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bookmaker, external_event_id)
);

CREATE INDEX idx_bookmaker_events_game ON bookmaker_events(game_id);
CREATE INDEX idx_bookmaker_events_bookmaker ON bookmaker_events(bookmaker);
CREATE INDEX idx_bookmaker_events_start_time ON bookmaker_events(event_start_time);
CREATE INDEX idx_bookmaker_events_teams ON bookmaker_events(home_team, away_team);

COMMENT ON TABLE bookmaker_events IS 'Maps external bookmaker event IDs to internal game_id for multi-bookmaker support';

-- ============================================================================
-- TEAM ALIASES
-- Handles team name variations across bookmakers
-- ============================================================================

CREATE TABLE IF NOT EXISTS team_aliases (
    alias_id SERIAL PRIMARY KEY,
    team_id BIGINT REFERENCES teams(team_id),
    bookmaker VARCHAR(50) NOT NULL,              -- 'scooore', 'pinnacle', 'all'
    alias_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bookmaker, alias_name)
);

CREATE INDEX idx_team_aliases_team ON team_aliases(team_id);
CREATE INDEX idx_team_aliases_bookmaker ON team_aliases(bookmaker);
CREATE INDEX idx_team_aliases_name ON team_aliases(alias_name);

COMMENT ON TABLE team_aliases IS 'Team name variations across different bookmakers for reliable matching';

-- ============================================================================
-- PLAYER PROPS (TIER 2)
-- Stores player proposition bets from all bookmakers
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_props (
    prop_id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) REFERENCES games(game_id),
    player_id BIGINT REFERENCES players(player_id),
    player_name VARCHAR(100) NOT NULL,           -- Original name from bookmaker
    bookmaker VARCHAR(50) NOT NULL,              -- 'scooore', 'pinnacle'
    prop_type VARCHAR(30) NOT NULL,              -- 'points', 'rebounds', 'assists', '3pm', 'pra', 'steals', 'blocks'
    line NUMERIC(5,1) NOT NULL,                  -- 27.5
    over_odds_american INTEGER,                  -- -110
    under_odds_american INTEGER,                 -- -110
    over_odds_decimal NUMERIC(6,3),              -- 1.910
    under_odds_decimal NUMERIC(6,3),             -- 1.910
    external_event_id VARCHAR(50),               -- Bookmaker's event ID
    external_offer_id VARCHAR(50),               -- Bookmaker's betOffer ID
    is_available BOOLEAN DEFAULT TRUE,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT check_prop_type CHECK (prop_type IN (
        'points', 'rebounds', 'assists', '3pm', 'pra',
        'steals', 'blocks', 'turnovers', 'double_double',
        'points_rebounds', 'points_assists', 'rebounds_assists',
        'steals_blocks'
    ))
);

CREATE INDEX idx_player_props_game ON player_props(game_id);
CREATE INDEX idx_player_props_player ON player_props(player_id);
CREATE INDEX idx_player_props_bookmaker ON player_props(bookmaker);
CREATE INDEX idx_player_props_type ON player_props(prop_type);
CREATE INDEX idx_player_props_recorded ON player_props(recorded_at DESC);
CREATE INDEX idx_player_props_game_bookmaker ON player_props(game_id, bookmaker);
CREATE INDEX idx_player_props_player_type ON player_props(player_id, prop_type);
CREATE INDEX idx_player_props_available ON player_props(is_available) WHERE is_available = TRUE;

-- Unique constraint for deduplication (same prop from same bookmaker)
CREATE UNIQUE INDEX idx_player_props_unique ON player_props(
    game_id, player_name, bookmaker, prop_type, line, recorded_at
);

COMMENT ON TABLE player_props IS 'Player proposition bets (points, rebounds, assists, etc.) from multiple bookmakers';

-- ============================================================================
-- ALTERNATIVE LINES (TIER 3)
-- Stores alternative spread and total lines
-- ============================================================================

CREATE TABLE IF NOT EXISTS alternative_lines (
    alt_line_id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) REFERENCES games(game_id),
    bookmaker VARCHAR(50) NOT NULL,
    line_type VARCHAR(20) NOT NULL,              -- 'spread', 'total'
    line_value NUMERIC(5,1) NOT NULL,            -- -5.5 or 235.5

    -- For spreads
    home_odds_american INTEGER,
    away_odds_american INTEGER,
    home_odds_decimal NUMERIC(6,3),
    away_odds_decimal NUMERIC(6,3),

    -- For totals
    over_odds_american INTEGER,
    under_odds_american INTEGER,
    over_odds_decimal NUMERIC(6,3),
    under_odds_decimal NUMERIC(6,3),

    is_main_line BOOLEAN DEFAULT FALSE,          -- Flag for the primary line
    external_event_id VARCHAR(50),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT check_line_type CHECK (line_type IN ('spread', 'total'))
);

CREATE INDEX idx_alt_lines_game ON alternative_lines(game_id);
CREATE INDEX idx_alt_lines_bookmaker ON alternative_lines(bookmaker);
CREATE INDEX idx_alt_lines_type ON alternative_lines(line_type);
CREATE INDEX idx_alt_lines_main ON alternative_lines(is_main_line) WHERE is_main_line = TRUE;
CREATE INDEX idx_alt_lines_recorded ON alternative_lines(recorded_at DESC);
CREATE INDEX idx_alt_lines_game_bookmaker ON alternative_lines(game_id, bookmaker, line_type);

COMMENT ON TABLE alternative_lines IS 'Alternative spread and total lines from multiple bookmakers';

-- ============================================================================
-- PLAYER ALIASES (for prop matching)
-- Handles player name variations across bookmakers
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_aliases (
    alias_id SERIAL PRIMARY KEY,
    player_id BIGINT REFERENCES players(player_id),
    bookmaker VARCHAR(50) NOT NULL,
    alias_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bookmaker, alias_name)
);

CREATE INDEX idx_player_aliases_player ON player_aliases(player_id);
CREATE INDEX idx_player_aliases_bookmaker ON player_aliases(bookmaker);
CREATE INDEX idx_player_aliases_name ON player_aliases(alias_name);

COMMENT ON TABLE player_aliases IS 'Player name variations across bookmakers for prop matching';

-- ============================================================================
-- SEED NBA TEAM ALIASES FOR SCOOORE/KAMBI
-- ============================================================================

-- All teams in this database are NBA teams
INSERT INTO team_aliases (team_id, bookmaker, alias_name)
SELECT team_id, 'scooore', full_name FROM teams
ON CONFLICT (bookmaker, alias_name) DO NOTHING;

-- Add common abbreviations (universal)
INSERT INTO team_aliases (team_id, bookmaker, alias_name)
SELECT team_id, 'all', abbreviation FROM teams
ON CONFLICT (bookmaker, alias_name) DO NOTHING;

-- Add full names as universal aliases
INSERT INTO team_aliases (team_id, bookmaker, alias_name)
SELECT team_id, 'all', full_name FROM teams
ON CONFLICT (bookmaker, alias_name) DO NOTHING;

-- ============================================================================
-- VIEWS FOR EASY QUERYING
-- ============================================================================

-- Cross-bookmaker odds comparison view
CREATE OR REPLACE VIEW v_odds_comparison AS
SELECT
    g.game_id,
    g.game_date,
    ht.full_name as home_team,
    at.full_name as away_team,
    bl.bookmaker,
    bl.home_moneyline,
    bl.away_moneyline,
    bl.spread,
    bl.home_spread_odds,
    bl.away_spread_odds,
    bl.total,
    bl.over_odds,
    bl.under_odds,
    bl.recorded_at
FROM betting_lines bl
JOIN games g ON bl.game_id = g.game_id
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
ORDER BY g.game_date DESC, g.game_id, bl.bookmaker;

COMMENT ON VIEW v_odds_comparison IS 'Cross-bookmaker comparison of main betting lines';

-- Player props comparison view
CREATE OR REPLACE VIEW v_props_comparison AS
SELECT
    pp.game_id,
    g.game_date,
    pp.player_name,
    pp.prop_type,
    pp.bookmaker,
    pp.line,
    pp.over_odds_decimal,
    pp.under_odds_decimal,
    pp.recorded_at
FROM player_props pp
JOIN games g ON pp.game_id = g.game_id
WHERE pp.is_available = TRUE
ORDER BY g.game_date DESC, pp.player_name, pp.prop_type, pp.bookmaker;

COMMENT ON VIEW v_props_comparison IS 'Cross-bookmaker comparison of player props';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Convert decimal odds to American odds
CREATE OR REPLACE FUNCTION decimal_to_american(decimal_odds NUMERIC)
RETURNS INTEGER AS $$
BEGIN
    IF decimal_odds >= 2.0 THEN
        RETURN ROUND((decimal_odds - 1) * 100)::INTEGER;
    ELSE
        RETURN ROUND(-100 / (decimal_odds - 1))::INTEGER;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Convert American odds to decimal odds
CREATE OR REPLACE FUNCTION american_to_decimal(american_odds INTEGER)
RETURNS NUMERIC AS $$
BEGIN
    IF american_odds > 0 THEN
        RETURN ROUND((american_odds / 100.0) + 1, 3);
    ELSE
        RETURN ROUND((100.0 / ABS(american_odds)) + 1, 3);
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION decimal_to_american IS 'Convert decimal odds (1.91) to American odds (-110)';
COMMENT ON FUNCTION american_to_decimal IS 'Convert American odds (-110) to decimal odds (1.91)';

COMMIT;

-- ============================================================================
-- POST-MIGRATION NOTES
-- ============================================================================
--
-- To use:
-- 1. Run: psql nba_stats < migrations/011_multi_bookmaker_support.sql
--
-- Tables created:
-- - bookmaker_events: Maps external event IDs to game_id
-- - team_aliases: Team name variations per bookmaker
-- - player_props: Player proposition bets
-- - alternative_lines: Alt spreads and totals
-- - player_aliases: Player name variations per bookmaker
--
-- Views created:
-- - v_odds_comparison: Cross-bookmaker main lines
-- - v_props_comparison: Cross-bookmaker player props
--
-- Functions created:
-- - decimal_to_american(NUMERIC): Convert decimal to American odds
-- - american_to_decimal(INTEGER): Convert American to decimal odds
--
