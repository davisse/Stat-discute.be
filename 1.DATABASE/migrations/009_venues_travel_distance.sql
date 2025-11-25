-- Migration 009: Venues and Travel Distance Analysis
-- Purpose: Add venue location data for travel distance calculations
-- Date: 2025-11-20

-- Create venues table with geographic coordinates
CREATE TABLE IF NOT EXISTS venues (
    venue_id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    venue_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(2),
    country VARCHAR(2) DEFAULT 'US',
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, venue_name)
);

-- Insert NBA arena locations (2025-26 season)
-- Coordinates are for the arena locations, timezones for game scheduling
INSERT INTO venues (team_id, venue_name, city, state, latitude, longitude, timezone) VALUES
    -- Eastern Conference
    (1610612737, 'State Farm Arena', 'Atlanta', 'GA', 33.7573, -84.3963, 'America/New_York'),           -- ATL Hawks
    (1610612738, 'TD Garden', 'Boston', 'MA', 42.3662, -71.0621, 'America/New_York'),                  -- BOS Celtics
    (1610612751, 'Barclays Center', 'Brooklyn', 'NY', 40.6826, -73.9754, 'America/New_York'),          -- BKN Nets
    (1610612766, 'Spectrum Center', 'Charlotte', 'NC', 35.2251, -80.8392, 'America/New_York'),         -- CHA Hornets
    (1610612741, 'United Center', 'Chicago', 'IL', 41.8807, -87.6742, 'America/Chicago'),              -- CHI Bulls
    (1610612739, 'Rocket Mortgage FieldHouse', 'Cleveland', 'OH', 41.4965, -81.6882, 'America/New_York'), -- CLE Cavaliers
    (1610612742, 'American Airlines Center', 'Dallas', 'TX', 32.7905, -96.8103, 'America/Chicago'),    -- DAL Mavericks
    (1610612743, 'Ball Arena', 'Denver', 'CO', 39.7486, -105.0077, 'America/Denver'),                  -- DEN Nuggets
    (1610612765, 'Little Caesars Arena', 'Detroit', 'MI', 42.3410, -83.0550, 'America/New_York'),      -- DET Pistons
    (1610612744, 'Chase Center', 'San Francisco', 'CA', 37.7680, -122.3878, 'America/Los_Angeles'),    -- GSW Warriors
    (1610612745, 'Toyota Center', 'Houston', 'TX', 29.7508, -95.3621, 'America/Chicago'),              -- HOU Rockets
    (1610612754, 'Gainbridge Fieldhouse', 'Indianapolis', 'IN', 39.7640, -86.1555, 'America/New_York'), -- IND Pacers
    (1610612746, 'Crypto.com Arena', 'Los Angeles', 'CA', 34.0430, -118.2673, 'America/Los_Angeles'),  -- LAC Clippers
    (1610612747, 'Crypto.com Arena', 'Los Angeles', 'CA', 34.0430, -118.2673, 'America/Los_Angeles'),  -- LAL Lakers
    (1610612763, 'FedExForum', 'Memphis', 'TN', 35.1382, -90.0506, 'America/Chicago'),                 -- MEM Grizzlies
    (1610612748, 'Kaseya Center', 'Miami', 'FL', 25.7814, -80.1870, 'America/New_York'),               -- MIA Heat
    (1610612749, 'Fiserv Forum', 'Milwaukee', 'WI', 43.0451, -87.9172, 'America/Chicago'),             -- MIL Bucks
    (1610612750, 'Target Center', 'Minneapolis', 'MN', 44.9795, -93.2761, 'America/Chicago'),          -- MIN Timberwolves
    (1610612740, 'Smoothie King Center', 'New Orleans', 'LA', 29.9490, -90.0821, 'America/Chicago'),   -- NOP Pelicans
    (1610612752, 'Madison Square Garden', 'New York', 'NY', 40.7505, -73.9934, 'America/New_York'),    -- NYK Knicks
    (1610612760, 'Paycom Center', 'Oklahoma City', 'OK', 35.4634, -97.5151, 'America/Chicago'),        -- OKC Thunder
    (1610612753, 'Kia Center', 'Orlando', 'FL', 28.5392, -81.3839, 'America/New_York'),                -- ORL Magic
    (1610612755, 'Wells Fargo Center', 'Philadelphia', 'PA', 39.9012, -75.1720, 'America/New_York'),   -- PHI 76ers
    (1610612756, 'Footprint Center', 'Phoenix', 'AZ', 33.4457, -112.0712, 'America/Phoenix'),          -- PHX Suns
    (1610612757, 'Moda Center', 'Portland', 'OR', 45.5316, -122.6668, 'America/Los_Angeles'),          -- POR Trail Blazers
    (1610612758, 'Golden 1 Center', 'Sacramento', 'CA', 38.5802, -121.4997, 'America/Los_Angeles'),    -- SAC Kings
    (1610612759, 'Frost Bank Center', 'San Antonio', 'TX', 29.4270, -98.4375, 'America/Chicago'),      -- SAS Spurs
    (1610612761, 'Scotiabank Arena', 'Toronto', 'ON', 43.6435, -79.3791, 'America/Toronto'),           -- TOR Raptors
    (1610612762, 'Delta Center', 'Salt Lake City', 'UT', 40.7683, -111.9011, 'America/Denver'),        -- UTA Jazz
    (1610612764, 'Capital One Arena', 'Washington', 'DC', 38.8981, -77.0209, 'America/New_York')       -- WAS Wizards
ON CONFLICT (team_id, venue_name) DO NOTHING;

-- Add index for team lookups
CREATE INDEX IF NOT EXISTS idx_venues_team_id ON venues(team_id);
CREATE INDEX IF NOT EXISTS idx_venues_active ON venues(is_active);

-- Add helpful comment
COMMENT ON TABLE venues IS 'NBA arena locations with geographic coordinates for travel distance calculations';
COMMENT ON COLUMN venues.latitude IS 'Arena latitude in decimal degrees (North positive)';
COMMENT ON COLUMN venues.longitude IS 'Arena longitude in decimal degrees (East positive)';
COMMENT ON COLUMN venues.timezone IS 'IANA timezone identifier for game scheduling';

-- Helper function: Calculate great circle distance between two points (Haversine formula)
-- Returns distance in miles
CREATE OR REPLACE FUNCTION calculate_distance_miles(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    earth_radius_miles CONSTANT DECIMAL := 3959.0;
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    -- Convert to radians
    dlat := RADIANS(lat2 - lat1);
    dlon := RADIANS(lon2 - lon1);

    -- Haversine formula
    a := SIN(dlat / 2.0) * SIN(dlat / 2.0) +
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
         SIN(dlon / 2.0) * SIN(dlon / 2.0);

    c := 2.0 * ATAN2(SQRT(a), SQRT(1.0 - a));

    RETURN earth_radius_miles * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Example usage:
-- SELECT calculate_distance_miles(40.7505, -73.9934, 34.0430, -118.2673); -- NYC to LA: ~2451 miles

COMMENT ON FUNCTION calculate_distance_miles IS 'Calculate great circle distance between two geographic points using Haversine formula. Returns distance in miles.';
