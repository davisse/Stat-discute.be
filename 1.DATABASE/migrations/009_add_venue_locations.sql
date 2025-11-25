-- Migration 009: Add Geographic Coordinates to Venues
-- Purpose: Add latitude, longitude, and timezone for travel distance calculations
-- Date: 2025-11-20

-- Add geographic columns to existing venues table
ALTER TABLE venues
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);

-- Update existing venues with geographic coordinates and timezones
-- Eastern Conference
UPDATE venues SET latitude = 33.7573, longitude = -84.3963, timezone = 'America/New_York' WHERE venue_name = 'State Farm Arena'; -- ATL
UPDATE venues SET latitude = 42.3662, longitude = -71.0621, timezone = 'America/New_York' WHERE venue_name = 'TD Garden'; -- BOS
UPDATE venues SET latitude = 40.6826, longitude = -73.9754, timezone = 'America/New_York' WHERE venue_name = 'Barclays Center'; -- BKN
UPDATE venues SET latitude = 35.2251, longitude = -80.8392, timezone = 'America/New_York' WHERE venue_name = 'Spectrum Center'; -- CHA
UPDATE venues SET latitude = 41.8807, longitude = -87.6742, timezone = 'America/Chicago' WHERE venue_name = 'United Center'; -- CHI
UPDATE venues SET latitude = 41.4965, longitude = -81.6882, timezone = 'America/New_York' WHERE venue_name LIKE '%FieldHouse%' AND city = 'Cleveland'; -- CLE
UPDATE venues SET latitude = 32.7905, longitude = -96.8103, timezone = 'America/Chicago' WHERE venue_name = 'American Airlines Center'; -- DAL
UPDATE venues SET latitude = 39.7486, longitude = -105.0077, timezone = 'America/Denver' WHERE venue_name = 'Ball Arena'; -- DEN
UPDATE venues SET latitude = 42.3410, longitude = -83.0550, timezone = 'America/New_York' WHERE venue_name = 'Little Caesars Arena'; -- DET
UPDATE venues SET latitude = 37.7680, longitude = -122.3878, timezone = 'America/Los_Angeles' WHERE venue_name = 'Chase Center'; -- GSW
UPDATE venues SET latitude = 29.7508, longitude = -95.3621, timezone = 'America/Chicago' WHERE venue_name = 'Toyota Center'; -- HOU
UPDATE venues SET latitude = 39.7640, longitude = -86.1555, timezone = 'America/New_York' WHERE venue_name = 'Gainbridge Fieldhouse'; -- IND
UPDATE venues SET latitude = 34.0430, longitude = -118.2673, timezone = 'America/Los_Angeles' WHERE venue_name LIKE 'Crypto.com%'; -- LAC/LAL
UPDATE venues SET latitude = 35.1382, longitude = -90.0506, timezone = 'America/Chicago' WHERE venue_name = 'FedExForum'; -- MEM
UPDATE venues SET latitude = 25.7814, longitude = -80.1870, timezone = 'America/New_York' WHERE venue_name = 'Kaseya Center'; -- MIA
UPDATE venues SET latitude = 43.0451, longitude = -87.9172, timezone = 'America/Chicago' WHERE venue_name = 'Fiserv Forum'; -- MIL
UPDATE venues SET latitude = 44.9795, longitude = -93.2761, timezone = 'America/Chicago' WHERE venue_name = 'Target Center'; -- MIN
UPDATE venues SET latitude = 29.9490, longitude = -90.0821, timezone = 'America/Chicago' WHERE venue_name = 'Smoothie King Center'; -- NOP
UPDATE venues SET latitude = 40.7505, longitude = -73.9934, timezone = 'America/New_York' WHERE venue_name = 'Madison Square Garden'; -- NYK
UPDATE venues SET latitude = 35.4634, longitude = -97.5151, timezone = 'America/Chicago' WHERE venue_name = 'Paycom Center'; -- OKC
UPDATE venues SET latitude = 28.5392, longitude = -81.3839, timezone = 'America/New_York' WHERE venue_name = 'Kia Center'; -- ORL
UPDATE venues SET latitude = 39.9012, longitude = -75.1720, timezone = 'America/New_York' WHERE venue_name = 'Wells Fargo Center'; -- PHI
UPDATE venues SET latitude = 33.4457, longitude = -112.0712, timezone = 'America/Phoenix' WHERE venue_name = 'Footprint Center'; -- PHX
UPDATE venues SET latitude = 45.5316, longitude = -122.6668, timezone = 'America/Los_Angeles' WHERE venue_name = 'Moda Center'; -- POR
UPDATE venues SET latitude = 38.5802, longitude = -121.4997, timezone = 'America/Los_Angeles' WHERE venue_name = 'Golden 1 Center'; -- SAC
UPDATE venues SET latitude = 29.4270, longitude = -98.4375, timezone = 'America/Chicago' WHERE venue_name = 'Frost Bank Center'; -- SAS
UPDATE venues SET latitude = 43.6435, longitude = -79.3791, timezone = 'America/Toronto' WHERE venue_name = 'Scotiabank Arena'; -- TOR
UPDATE venues SET latitude = 40.7683, longitude = -111.9011, timezone = 'America/Denver' WHERE venue_name = 'Delta Center'; -- UTA
UPDATE venues SET latitude = 38.8981, longitude = -77.0209, timezone = 'America/New_York' WHERE venue_name = 'Capital One Arena'; -- WAS

-- Add comments
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

-- Example: Calculate distance from MSG (NYK) to Crypto.com Arena (LAL/LAC)
-- SELECT calculate_distance_miles(40.7505, -73.9934, 34.0430, -118.2673); -- ~2451 miles

COMMENT ON FUNCTION calculate_distance_miles IS 'Calculate great circle distance between two geographic points using Haversine formula. Returns distance in miles.';

-- Verify updates
SELECT
    venue_name,
    city,
    latitude,
    longitude,
    timezone,
    CASE
        WHEN latitude IS NULL OR longitude IS NULL THEN '❌ Missing'
        ELSE '✅ OK'
    END as status
FROM venues
WHERE is_active = true
ORDER BY city;
