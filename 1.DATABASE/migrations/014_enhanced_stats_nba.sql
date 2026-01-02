-- Migration 014: Enhanced NBA Stats from stats.nba.com
-- Adds hustle stats, shooting zones, and defense dashboard tables
-- These tables provide additional factors for totals analysis

-- =============================================================================
-- 1. PLAYER HUSTLE STATS
-- Source: nba.com/stats/players/hustle
-- =============================================================================
CREATE TABLE IF NOT EXISTS player_hustle_stats (
    id SERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season VARCHAR(7) NOT NULL,

    -- Hustle Metrics
    minutes DECIMAL(5,1),
    contested_shots INT DEFAULT 0,
    contested_shots_2pt INT DEFAULT 0,
    contested_shots_3pt INT DEFAULT 0,
    deflections INT DEFAULT 0,
    charges_drawn INT DEFAULT 0,
    screen_assists INT DEFAULT 0,
    screen_assist_pts INT DEFAULT 0,

    -- Loose Ball Recovery
    loose_balls_recovered INT DEFAULT 0,
    loose_balls_recovered_off INT DEFAULT 0,
    loose_balls_recovered_def INT DEFAULT 0,

    -- Box Outs
    box_outs INT DEFAULT 0,
    box_outs_off INT DEFAULT 0,
    box_outs_def INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_player_hustle_game UNIQUE (player_id, game_id)
);

-- =============================================================================
-- 2. TEAM HUSTLE STATS (Aggregated)
-- =============================================================================
CREATE TABLE IF NOT EXISTS team_hustle_stats (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    season VARCHAR(7) NOT NULL,

    -- Hustle Metrics
    contested_shots INT DEFAULT 0,
    contested_shots_2pt INT DEFAULT 0,
    contested_shots_3pt INT DEFAULT 0,
    deflections INT DEFAULT 0,
    charges_drawn INT DEFAULT 0,
    screen_assists INT DEFAULT 0,
    screen_assist_pts INT DEFAULT 0,

    -- Loose Ball Recovery
    loose_balls_recovered INT DEFAULT 0,
    loose_balls_recovered_off INT DEFAULT 0,
    loose_balls_recovered_def INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_team_hustle_game UNIQUE (team_id, game_id)
);

-- =============================================================================
-- 3. PLAYER SHOOTING ZONES
-- Source: nba.com/stats/players/shooting
-- =============================================================================
CREATE TABLE IF NOT EXISTS player_shooting_zones (
    id SERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season VARCHAR(7) NOT NULL,

    -- Restricted Area (0-4 ft)
    ra_fgm INT DEFAULT 0,
    ra_fga INT DEFAULT 0,
    ra_fg_pct DECIMAL(5,3),

    -- In The Paint (Non-RA) (5-9 ft)
    paint_fgm INT DEFAULT 0,
    paint_fga INT DEFAULT 0,
    paint_fg_pct DECIMAL(5,3),

    -- Mid-Range (10-16 ft)
    mid_fgm INT DEFAULT 0,
    mid_fga INT DEFAULT 0,
    mid_fg_pct DECIMAL(5,3),

    -- Long Mid-Range (16-24 ft)
    long_mid_fgm INT DEFAULT 0,
    long_mid_fga INT DEFAULT 0,
    long_mid_fg_pct DECIMAL(5,3),

    -- Three-Point (24+ ft)
    three_fgm INT DEFAULT 0,
    three_fga INT DEFAULT 0,
    three_fg_pct DECIMAL(5,3),

    -- Corner Threes (specific)
    corner_three_fgm INT DEFAULT 0,
    corner_three_fga INT DEFAULT 0,
    corner_three_fg_pct DECIMAL(5,3),

    -- Above The Break Threes
    atb_three_fgm INT DEFAULT 0,
    atb_three_fga INT DEFAULT 0,
    atb_three_fg_pct DECIMAL(5,3),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_player_shooting_game UNIQUE (player_id, game_id)
);

-- =============================================================================
-- 4. TEAM SHOOTING PROFILE (Aggregated Zones)
-- =============================================================================
CREATE TABLE IF NOT EXISTS team_shooting_profile (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    season VARCHAR(7) NOT NULL,

    -- Zone Attempt Distribution (percentage of shots)
    ra_freq DECIMAL(5,3),          -- Restricted Area frequency
    paint_freq DECIMAL(5,3),       -- Paint (non-RA) frequency
    mid_freq DECIMAL(5,3),         -- Mid-range frequency
    three_freq DECIMAL(5,3),       -- Three-point frequency

    -- Efficiency by Zone
    ra_fg_pct DECIMAL(5,3),
    paint_fg_pct DECIMAL(5,3),
    mid_fg_pct DECIMAL(5,3),
    three_fg_pct DECIMAL(5,3),

    -- Shot Quality Indicators
    paint_heavy BOOLEAN DEFAULT FALSE,  -- >50% shots at rim/paint
    three_heavy BOOLEAN DEFAULT FALSE,  -- >40% shots from three

    -- Expected Points Per Shot (based on shot profile)
    expected_pps DECIMAL(5,3),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_team_shooting_game UNIQUE (team_id, game_id)
);

-- =============================================================================
-- 5. TEAM DEFENSE DASHBOARD
-- Source: nba.com/stats/teams/defense-dashboard
-- =============================================================================
CREATE TABLE IF NOT EXISTS team_defense_stats (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    season VARCHAR(7) NOT NULL,

    -- Overall Defense
    def_rating DECIMAL(5,1),
    opp_pts DECIMAL(5,1),

    -- Opponent Shooting
    opp_fgm INT DEFAULT 0,
    opp_fga INT DEFAULT 0,
    opp_fg_pct DECIMAL(5,3),
    opp_3pm INT DEFAULT 0,
    opp_3pa INT DEFAULT 0,
    opp_3p_pct DECIMAL(5,3),

    -- Differential (how much worse opponents shoot vs their average)
    opp_fg_diff DECIMAL(5,3),      -- Positive = better defense
    opp_3p_diff DECIMAL(5,3),      -- Positive = better defense

    -- Defensive Impact by Zone
    opp_ra_fg_pct DECIMAL(5,3),    -- Opponent restricted area %
    opp_paint_fg_pct DECIMAL(5,3), -- Opponent paint %
    opp_mid_fg_pct DECIMAL(5,3),   -- Opponent mid-range %

    -- Rim Protection
    blocks INT DEFAULT 0,
    altered_shots INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_team_defense_game UNIQUE (team_id, game_id)
);

-- =============================================================================
-- 6. TEAM HUSTLE AVERAGES (Rolling Averages for Projections)
-- =============================================================================
CREATE TABLE IF NOT EXISTS team_hustle_averages (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season VARCHAR(7) NOT NULL,
    games_played INT DEFAULT 0,

    -- Rolling Averages (last 10 games weighted)
    avg_deflections DECIMAL(5,2) DEFAULT 0,
    avg_contested_shots DECIMAL(5,2) DEFAULT 0,
    avg_loose_balls DECIMAL(5,2) DEFAULT 0,
    avg_charges_drawn DECIMAL(5,2) DEFAULT 0,
    avg_screen_assists DECIMAL(5,2) DEFAULT 0,

    -- Hustle Intensity Score (composite)
    hustle_intensity_score DECIMAL(5,2) DEFAULT 50.0,  -- 0-100 scale

    -- Tier Classification
    hustle_tier VARCHAR(10) DEFAULT 'medium',  -- 'high', 'medium', 'low'

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_team_hustle_avg UNIQUE (team_id, season)
);

-- =============================================================================
-- 7. TEAM SHOOTING AVERAGES (Rolling Averages for Projections)
-- =============================================================================
CREATE TABLE IF NOT EXISTS team_shooting_averages (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season VARCHAR(7) NOT NULL,
    games_played INT DEFAULT 0,

    -- Shot Distribution Averages
    avg_ra_freq DECIMAL(5,3) DEFAULT 0,
    avg_paint_freq DECIMAL(5,3) DEFAULT 0,
    avg_mid_freq DECIMAL(5,3) DEFAULT 0,
    avg_three_freq DECIMAL(5,3) DEFAULT 0,

    -- Efficiency Averages
    avg_ra_fg_pct DECIMAL(5,3) DEFAULT 0,
    avg_paint_fg_pct DECIMAL(5,3) DEFAULT 0,
    avg_mid_fg_pct DECIMAL(5,3) DEFAULT 0,
    avg_three_fg_pct DECIMAL(5,3) DEFAULT 0,

    -- Shot Profile Classification
    shot_profile VARCHAR(20) DEFAULT 'balanced',  -- 'paint_heavy', 'three_heavy', 'balanced', 'mid_heavy'

    -- Scoring Variance Indicator
    scoring_variance DECIMAL(5,2) DEFAULT 0,  -- Higher = more variance

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_team_shooting_avg UNIQUE (team_id, season)
);

-- =============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Hustle Stats Indexes
CREATE INDEX IF NOT EXISTS idx_player_hustle_season ON player_hustle_stats(season);
CREATE INDEX IF NOT EXISTS idx_player_hustle_player ON player_hustle_stats(player_id, season);
CREATE INDEX IF NOT EXISTS idx_team_hustle_season ON team_hustle_stats(season);
CREATE INDEX IF NOT EXISTS idx_team_hustle_team ON team_hustle_stats(team_id, season);

-- Shooting Zones Indexes
CREATE INDEX IF NOT EXISTS idx_player_shooting_season ON player_shooting_zones(season);
CREATE INDEX IF NOT EXISTS idx_player_shooting_player ON player_shooting_zones(player_id, season);
CREATE INDEX IF NOT EXISTS idx_team_shooting_season ON team_shooting_profile(season);
CREATE INDEX IF NOT EXISTS idx_team_shooting_team ON team_shooting_profile(team_id, season);

-- Defense Stats Indexes
CREATE INDEX IF NOT EXISTS idx_team_defense_season ON team_defense_stats(season);
CREATE INDEX IF NOT EXISTS idx_team_defense_team ON team_defense_stats(team_id, season);

-- Averages Indexes
CREATE INDEX IF NOT EXISTS idx_team_hustle_avg_season ON team_hustle_averages(season);
CREATE INDEX IF NOT EXISTS idx_team_shooting_avg_season ON team_shooting_averages(season);

-- =============================================================================
-- 9. COMMENTS
-- =============================================================================
COMMENT ON TABLE player_hustle_stats IS 'Per-game hustle metrics from stats.nba.com/players/hustle';
COMMENT ON TABLE team_hustle_stats IS 'Team-aggregated hustle metrics per game';
COMMENT ON TABLE player_shooting_zones IS 'Shot distribution by zone from stats.nba.com/players/shooting';
COMMENT ON TABLE team_shooting_profile IS 'Team shot profile and efficiency by zone';
COMMENT ON TABLE team_defense_stats IS 'Team defensive metrics from stats.nba.com/teams/defense-dashboard';
COMMENT ON TABLE team_hustle_averages IS 'Rolling hustle averages for totals projections';
COMMENT ON TABLE team_shooting_averages IS 'Rolling shooting profile averages for totals projections';

COMMENT ON COLUMN team_hustle_averages.hustle_intensity_score IS 'Composite score 0-100: deflections + contested shots + loose balls weighted';
COMMENT ON COLUMN team_shooting_averages.shot_profile IS 'Classification: paint_heavy (>50% paint), three_heavy (>40% 3PT), mid_heavy (>25% mid), balanced';
COMMENT ON COLUMN team_shooting_averages.scoring_variance IS 'Higher values indicate more game-to-game variance based on shot selection';
