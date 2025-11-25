-- Migration 009: NBA Daily Starting Lineups System
-- Purpose: Track daily starting lineups and injury status from RotoWire
-- Critical for: Fantasy basketball, DFS, betting analytics, player availability

-- ============================================================================
-- Main table: Daily game lineup metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS nba_daily_lineups (
    lineup_id SERIAL PRIMARY KEY,
    game_date DATE NOT NULL,
    game_time VARCHAR(20),  -- e.g., "1:00 PM ET", "6:00 PM ET"
    home_team_id BIGINT NOT NULL REFERENCES teams(team_id),
    away_team_id BIGINT NOT NULL REFERENCES teams(team_id),
    home_team_record VARCHAR(10),  -- e.g., "10-6"
    away_team_record VARCHAR(10),  -- e.g., "4-12"

    -- Betting odds (from RotoWire page)
    home_ml DECIMAL(8,2),  -- Moneyline (e.g., -118, +105)
    away_ml DECIMAL(8,2),
    spread_team VARCHAR(3),  -- Team abbreviation (e.g., "MIA")
    spread_value DECIMAL(4,1),  -- e.g., -1.5, +3.5
    over_under DECIMAL(5,1),  -- e.g., 240.5

    -- Referees (stored as array)
    referees TEXT[],

    -- Metadata
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_url TEXT DEFAULT 'https://www.rotowire.com/basketball/nba-lineups.php',

    -- Prevent duplicate scrapes for same game at exact same time
    UNIQUE(game_date, home_team_id, away_team_id, scraped_at)
);

-- ============================================================================
-- Lineup snapshots: Track starting 5 and changes throughout the day
-- ============================================================================
CREATE TABLE IF NOT EXISTS nba_lineup_snapshots (
    snapshot_id SERIAL PRIMARY KEY,
    lineup_id INTEGER NOT NULL REFERENCES nba_daily_lineups(lineup_id) ON DELETE CASCADE,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    is_home_team BOOLEAN NOT NULL,

    -- Starting lineup (5 positions)
    -- Storing player_id and injury status for each position
    pg_player_id BIGINT REFERENCES players(player_id),
    pg_status VARCHAR(10),  -- NULL (playing), 'Prob', 'Ques', 'Doubt', 'Out'
    pg_rotowire_id VARCHAR(20),  -- RotoWire player ID from URL

    sg_player_id BIGINT REFERENCES players(player_id),
    sg_status VARCHAR(10),
    sg_rotowire_id VARCHAR(20),

    sf_player_id BIGINT REFERENCES players(player_id),
    sf_status VARCHAR(10),
    sf_rotowire_id VARCHAR(20),

    pf_player_id BIGINT REFERENCES players(player_id),
    pf_status VARCHAR(10),
    pf_rotowire_id VARCHAR(20),

    c_player_id BIGINT REFERENCES players(player_id),
    c_status VARCHAR(10),
    c_rotowire_id VARCHAR(20),

    -- Metadata
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Allow multiple snapshots per day to track changes
    UNIQUE(lineup_id, team_id, scraped_at)
);

-- ============================================================================
-- Injury status: "May Not Play" section tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS nba_injury_status (
    status_id SERIAL PRIMARY KEY,
    lineup_id INTEGER NOT NULL REFERENCES nba_daily_lineups(lineup_id) ON DELETE CASCADE,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    player_id BIGINT REFERENCES players(player_id),

    -- Player info from RotoWire
    player_name TEXT NOT NULL,  -- Full name as displayed
    rotowire_player_id VARCHAR(20),  -- From URL (e.g., "5354" from /player/davion-mitchell-5354)

    -- Injury details
    position_group VARCHAR(1),  -- 'G' (Guard), 'F' (Forward), 'C' (Center)
    injury_status VARCHAR(10) NOT NULL,  -- 'Prob', 'Ques', 'Doubt', 'Out'

    -- Metadata
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Player ID mapping: Link our player IDs to RotoWire IDs
-- ============================================================================
CREATE TABLE IF NOT EXISTS player_rotowire_mapping (
    mapping_id SERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    rotowire_player_id VARCHAR(20) NOT NULL UNIQUE,  -- RotoWire ID from URL
    rotowire_display_name TEXT,  -- Name as shown on RotoWire (e.g., "D. Mitchell")
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(player_id, rotowire_player_id)
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

-- Query lineups by date (most common query)
CREATE INDEX idx_daily_lineups_game_date ON nba_daily_lineups(game_date);
CREATE INDEX idx_daily_lineups_game_date_teams ON nba_daily_lineups(game_date, home_team_id, away_team_id);

-- Query latest lineup for a game
CREATE INDEX idx_daily_lineups_latest ON nba_daily_lineups(game_date, home_team_id, away_team_id, scraped_at DESC);

-- Query snapshots by lineup and team
CREATE INDEX idx_lineup_snapshots_lineup_team ON nba_lineup_snapshots(lineup_id, team_id);
CREATE INDEX idx_lineup_snapshots_scraped_at ON nba_lineup_snapshots(scraped_at);

-- Query by player (e.g., "show me all games where LeBron is starting")
CREATE INDEX idx_lineup_snapshots_pg ON nba_lineup_snapshots(pg_player_id) WHERE pg_player_id IS NOT NULL;
CREATE INDEX idx_lineup_snapshots_sg ON nba_lineup_snapshots(sg_player_id) WHERE sg_player_id IS NOT NULL;
CREATE INDEX idx_lineup_snapshots_sf ON nba_lineup_snapshots(sf_player_id) WHERE sf_player_id IS NOT NULL;
CREATE INDEX idx_lineup_snapshots_pf ON nba_lineup_snapshots(pf_player_id) WHERE pf_player_id IS NOT NULL;
CREATE INDEX idx_lineup_snapshots_c ON nba_lineup_snapshots(c_player_id) WHERE c_player_id IS NOT NULL;

-- Query injury status by team and date
CREATE INDEX idx_injury_status_lineup ON nba_injury_status(lineup_id);
CREATE INDEX idx_injury_status_player ON nba_injury_status(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX idx_injury_status_scraped_at ON nba_injury_status(scraped_at);

-- RotoWire mapping lookups
CREATE INDEX idx_rotowire_mapping_rotowire_id ON player_rotowire_mapping(rotowire_player_id);
CREATE INDEX idx_rotowire_mapping_player_id ON player_rotowire_mapping(player_id);

-- ============================================================================
-- Helper views for common queries
-- ============================================================================

-- Latest lineup for each game today
CREATE OR REPLACE VIEW v_latest_daily_lineups AS
SELECT DISTINCT ON (dl.game_date, dl.home_team_id, dl.away_team_id)
    dl.lineup_id,
    dl.game_date,
    dl.game_time,
    ht.abbreviation as home_team,
    at.abbreviation as away_team,
    dl.home_team_record,
    dl.away_team_record,
    dl.home_ml,
    dl.away_ml,
    dl.spread_team,
    dl.spread_value,
    dl.over_under,
    dl.referees,
    dl.scraped_at
FROM nba_daily_lineups dl
JOIN teams ht ON dl.home_team_id = ht.team_id
JOIN teams at ON dl.away_team_id = at.team_id
ORDER BY dl.game_date, dl.home_team_id, dl.away_team_id, dl.scraped_at DESC;

-- Latest lineup snapshot for each team
CREATE OR REPLACE VIEW v_latest_lineup_snapshots AS
SELECT DISTINCT ON (ls.lineup_id, ls.team_id)
    ls.snapshot_id,
    ls.lineup_id,
    t.abbreviation as team,
    ls.is_home_team,

    -- PG
    pg.full_name as pg_name,
    ls.pg_status,

    -- SG
    sg.full_name as sg_name,
    ls.sg_status,

    -- SF
    sf.full_name as sf_name,
    ls.sf_status,

    -- PF
    pf.full_name as pf_name,
    ls.pf_status,

    -- C
    c.full_name as c_name,
    ls.c_status,

    ls.scraped_at
FROM nba_lineup_snapshots ls
JOIN teams t ON ls.team_id = t.team_id
LEFT JOIN players pg ON ls.pg_player_id = pg.player_id
LEFT JOIN players sg ON ls.sg_player_id = sg.player_id
LEFT JOIN players sf ON ls.sf_player_id = sf.player_id
LEFT JOIN players pf ON ls.pf_player_id = pf.player_id
LEFT JOIN players c ON ls.c_player_id = c.player_id
ORDER BY ls.lineup_id, ls.team_id, ls.scraped_at DESC;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE nba_daily_lineups IS 'Daily NBA game lineup metadata scraped from RotoWire. Multiple scrapes per day track lineup changes.';
COMMENT ON TABLE nba_lineup_snapshots IS 'Snapshots of starting 5 lineups at specific times. Enables tracking of lineup changes throughout the day.';
COMMENT ON TABLE nba_injury_status IS 'Players listed in "May Not Play" section. Critical for fantasy/DFS/betting decisions.';
COMMENT ON TABLE player_rotowire_mapping IS 'Maps our player IDs to RotoWire player IDs for reliable data integration.';

COMMENT ON COLUMN nba_lineup_snapshots.pg_status IS 'Injury status: NULL=playing, Prob=probable, Ques=questionable, Doubt=doubtful, Out=not playing';
COMMENT ON COLUMN nba_injury_status.position_group IS 'Position group from RotoWire: G=Guard, F=Forward, C=Center';
