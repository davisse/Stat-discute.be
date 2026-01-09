-- Migration 018: Team Shooting Zones
-- Stores both offensive (team's shots) and defensive (opponent shots against) zone data
-- Created: 2025-01-09

-- Drop existing table if exists (for clean migration)
DROP TABLE IF EXISTS team_shooting_zones;

CREATE TABLE team_shooting_zones (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season VARCHAR(7) NOT NULL,
    zone_type VARCHAR(10) NOT NULL CHECK (zone_type IN ('offense', 'defense')),

    -- Restricted Area (0-4 ft)
    ra_fgm INTEGER NOT NULL DEFAULT 0,
    ra_fga INTEGER NOT NULL DEFAULT 0,
    ra_fg_pct NUMERIC(5,3),
    ra_freq NUMERIC(5,3),  -- % of total FGA in this zone

    -- In The Paint Non-RA (4-14 ft)
    paint_fgm INTEGER NOT NULL DEFAULT 0,
    paint_fga INTEGER NOT NULL DEFAULT 0,
    paint_fg_pct NUMERIC(5,3),
    paint_freq NUMERIC(5,3),

    -- Mid-Range (14-24 ft)
    mid_fgm INTEGER NOT NULL DEFAULT 0,
    mid_fga INTEGER NOT NULL DEFAULT 0,
    mid_fg_pct NUMERIC(5,3),
    mid_freq NUMERIC(5,3),

    -- Corner 3 (combined left + right)
    corner3_fgm INTEGER NOT NULL DEFAULT 0,
    corner3_fga INTEGER NOT NULL DEFAULT 0,
    corner3_fg_pct NUMERIC(5,3),
    corner3_freq NUMERIC(5,3),

    -- Above the Break 3
    ab3_fgm INTEGER NOT NULL DEFAULT 0,
    ab3_fga INTEGER NOT NULL DEFAULT 0,
    ab3_fg_pct NUMERIC(5,3),
    ab3_freq NUMERIC(5,3),

    -- Left/Right Corner 3 breakdown (for detailed analysis)
    lc3_fgm INTEGER DEFAULT 0,
    lc3_fga INTEGER DEFAULT 0,
    lc3_fg_pct NUMERIC(5,3),
    rc3_fgm INTEGER DEFAULT 0,
    rc3_fga INTEGER DEFAULT 0,
    rc3_fg_pct NUMERIC(5,3),

    -- Totals
    total_fgm INTEGER NOT NULL DEFAULT 0,
    total_fga INTEGER NOT NULL DEFAULT 0,
    total_fg_pct NUMERIC(5,3),

    -- Profile classification
    profile VARCHAR(30),  -- paint_heavy, three_heavy, mid_heavy, balanced, paint_protector, perimeter_defender

    -- Strengths/weaknesses (for defense type)
    strengths TEXT[],   -- zones where below league avg
    weaknesses TEXT[],  -- zones where above league avg

    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint: one row per team/season/type
    UNIQUE(team_id, season, zone_type)
);

-- Create indexes for efficient queries
CREATE INDEX idx_team_shooting_zones_team ON team_shooting_zones(team_id);
CREATE INDEX idx_team_shooting_zones_season ON team_shooting_zones(season);
CREATE INDEX idx_team_shooting_zones_type ON team_shooting_zones(zone_type);
CREATE INDEX idx_team_shooting_zones_team_season ON team_shooting_zones(team_id, season);

-- Create league averages table for comparison
DROP TABLE IF EXISTS league_zone_averages;

CREATE TABLE league_zone_averages (
    id SERIAL PRIMARY KEY,
    season VARCHAR(7) NOT NULL,
    zone_type VARCHAR(10) NOT NULL CHECK (zone_type IN ('offense', 'defense')),

    -- Averages per zone
    ra_fg_pct NUMERIC(5,3),
    ra_freq NUMERIC(5,3),
    paint_fg_pct NUMERIC(5,3),
    paint_freq NUMERIC(5,3),
    mid_fg_pct NUMERIC(5,3),
    mid_freq NUMERIC(5,3),
    corner3_fg_pct NUMERIC(5,3),
    corner3_freq NUMERIC(5,3),
    ab3_fg_pct NUMERIC(5,3),
    ab3_freq NUMERIC(5,3),

    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(season, zone_type)
);

CREATE INDEX idx_league_zone_avg_season ON league_zone_averages(season);

-- Comment for documentation
COMMENT ON TABLE team_shooting_zones IS 'Team shooting zone data - offense (team shots) and defense (opponent shots against)';
COMMENT ON COLUMN team_shooting_zones.zone_type IS 'offense = team shots, defense = opponent shots against';
COMMENT ON COLUMN team_shooting_zones.profile IS 'Classification: paint_heavy, three_heavy, mid_heavy, balanced (offense) or paint_protector, perimeter_defender (defense)';
COMMENT ON COLUMN team_shooting_zones.strengths IS 'Defensive zones where team is below league avg FG% allowed';
COMMENT ON COLUMN team_shooting_zones.weaknesses IS 'Defensive zones where team is above league avg FG% allowed';
