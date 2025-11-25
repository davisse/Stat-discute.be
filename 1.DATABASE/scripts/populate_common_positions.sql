-- Populate Common NBA Player Positions
-- This script adds position data for active players based on common knowledge
-- Run this to get started with positional analytics

BEGIN;

-- Update positions for well-known current players (2025-26 season)
-- Position abbreviations: PG (Point Guard), SG (Shooting Guard), SF (Small Forward), PF (Power Forward), C (Center)

-- Lakers
UPDATE players SET position = 'SF' WHERE full_name = 'LeBron James';
UPDATE players SET position = 'PF' WHERE full_name = 'Anthony Davis';
UPDATE players SET position = 'PG' WHERE full_name = 'D''Angelo Russell';
UPDATE players SET position = 'SG' WHERE full_name = 'Austin Reaves';

-- Celtics
UPDATE players SET position = 'SF' WHERE full_name = 'Jayson Tatum';
UPDATE players SET position = 'SF' WHERE full_name = 'Jaylen Brown';
UPDATE players SET position = 'C' WHERE full_name = 'Kristaps Porzingis';
UPDATE players SET position = 'PG' WHERE full_name = 'Jrue Holiday';

-- Warriors
UPDATE players SET position = 'PG' WHERE full_name = 'Stephen Curry';
UPDATE players SET position = 'SG' WHERE full_name = 'Klay Thompson';
UPDATE players SET position = 'SF' WHERE full_name = 'Andrew Wiggins';
UPDATE players SET position = 'PF' WHERE full_name = 'Draymond Green';

-- Nuggets
UPDATE players SET position = 'C' WHERE full_name = 'Nikola Jokic';
UPDATE players SET position = 'SG' WHERE full_name = 'Jamal Murray';
UPDATE players SET position = 'SF' WHERE full_name = 'Michael Porter Jr.';
UPDATE players SET position = 'PF' WHERE full_name = 'Aaron Gordon';

-- Bucks
UPDATE players SET position = 'PF' WHERE full_name = 'Giannis Antetokounmpo';
UPDATE players SET position = 'PG' WHERE full_name = 'Damian Lillard';
UPDATE players SET position = 'SG' WHERE full_name = 'Khris Middleton';
UPDATE players SET position = 'C' WHERE full_name = 'Brook Lopez';

-- 76ers
UPDATE players SET position = 'C' WHERE full_name = 'Joel Embiid';
UPDATE players SET position = 'PG' WHERE full_name = 'Tyrese Maxey';
UPDATE players SET position = 'SF' WHERE full_name = 'Tobias Harris';

-- Suns
UPDATE players SET position = 'SG' WHERE full_name = 'Devin Booker';
UPDATE players SET position = 'SF' WHERE full_name = 'Kevin Durant';
UPDATE players SET position = 'PF' WHERE full_name = 'Bradley Beal';
UPDATE players SET position = 'C' WHERE full_name = 'Jusuf Nurkic';

-- Mavericks
UPDATE players SET position = 'PG' WHERE full_name = 'Luka Doncic';
UPDATE players SET position = 'SG' WHERE full_name = 'Kyrie Irving';
UPDATE players SET position = 'C' WHERE full_name = 'Daniel Gafford';

-- Thunder
UPDATE players SET position = 'PG' WHERE full_name = 'Shai Gilgeous-Alexander';
UPDATE players SET position = 'SF' WHERE full_name = 'Luguentz Dort';
UPDATE players SET position = 'C' WHERE full_name = 'Chet Holmgren';
UPDATE players SET position = 'SG' WHERE full_name = 'Jalen Williams';

-- Timberwolves
UPDATE players SET position = 'PG' WHERE full_name = 'Anthony Edwards';
UPDATE players SET position = 'C' WHERE full_name = 'Karl-Anthony Towns';
UPDATE players SET position = 'C' WHERE full_name = 'Rudy Gobert';
UPDATE players SET position = 'SG' WHERE full_name = 'Mike Conley';

-- Knicks
UPDATE players SET position = 'SF' WHERE full_name = 'Julius Randle';
UPDATE players SET position = 'SG' WHERE full_name = 'Jalen Brunson';
UPDATE players SET position = 'C' WHERE full_name = 'Mitchell Robinson';

-- Heat
UPDATE players SET position = 'SF' WHERE full_name = 'Jimmy Butler';
UPDATE players SET position = 'C' WHERE full_name = 'Bam Adebayo';
UPDATE players SET position = 'SG' WHERE full_name = 'Tyler Herro';

-- Cavaliers
UPDATE players SET position = 'SG' WHERE full_name = 'Donovan Mitchell';
UPDATE players SET position = 'PF' WHERE full_name = 'Evan Mobley';
UPDATE players SET position = 'C' WHERE full_name = 'Jarrett Allen';
UPDATE players SET position = 'PG' WHERE full_name = 'Darius Garland';

-- Kings
UPDATE players SET position = 'SF' WHERE full_name = 'De''Aaron Fox';
UPDATE players SET position = 'C' WHERE full_name = 'Domantas Sabonis';
UPDATE players SET position = 'SG' WHERE full_name = 'Kevin Huerter';

-- Pelicans
UPDATE players SET position = 'PF' WHERE full_name = 'Zion Williamson';
UPDATE players SET position = 'SF' WHERE full_name = 'Brandon Ingram';
UPDATE players SET position = 'SG' WHERE full_name = 'CJ McCollum';

-- Clippers
UPDATE players SET position = 'SF' WHERE full_name = 'Kawhi Leonard';
UPDATE players SET position = 'SG' WHERE full_name = 'Paul George';
UPDATE players SET position = 'C' WHERE full_name = 'Ivica Zubac';

-- Grizzlies
UPDATE players SET position = 'PG' WHERE full_name = 'Ja Morant';
UPDATE players SET position = 'PF' WHERE full_name = 'Jaren Jackson Jr.';
UPDATE players SET position = 'C' WHERE full_name = 'Steven Adams';

-- Hawks
UPDATE players SET position = 'PG' WHERE full_name = 'Trae Young';
UPDATE players SET position = 'SF' WHERE full_name = 'Dejounte Murray';
UPDATE players SET position = 'C' WHERE full_name = 'Clint Capela';

-- Raptors
UPDATE players SET position = 'SF' WHERE full_name = 'Scottie Barnes';
UPDATE players SET position = 'SF' WHERE full_name = 'Pascal Siakam';
UPDATE players SET position = 'PF' WHERE full_name = 'OG Anunoby';

-- Bulls
UPDATE players SET position = 'SG' WHERE full_name = 'Zach LaVine';
UPDATE players SET position = 'SF' WHERE full_name = 'DeMar DeRozan';
UPDATE players SET position = 'C' WHERE full_name = 'Nikola Vucevic';

-- Nets
UPDATE players SET position = 'SF' WHERE full_name = 'Mikal Bridges';
UPDATE players SET position = 'C' WHERE full_name = 'Nic Claxton';

-- Pacers
UPDATE players SET position = 'PG' WHERE full_name = 'Tyrese Haliburton';
UPDATE players SET position = 'SF' WHERE full_name = 'Buddy Hield';
UPDATE players SET position = 'C' WHERE full_name = 'Myles Turner';

-- Hornets
UPDATE players SET position = 'PG' WHERE full_name = 'LaMelo Ball';
UPDATE players SET position = 'SF' WHERE full_name = 'Miles Bridges';

-- Wizards
UPDATE players SET position = 'SG' WHERE full_name = 'Jordan Poole';
UPDATE players SET position = 'C' WHERE full_name = 'Daniel Gafford';

-- Spurs
UPDATE players SET position = 'C' WHERE full_name = 'Victor Wembanyama';
UPDATE players SET position = 'PG' WHERE full_name = 'Tre Jones';

-- Rockets
UPDATE players SET position = 'SG' WHERE full_name = 'Jalen Green';
UPDATE players SET position = 'C' WHERE full_name = 'Alperen Sengun';

-- Magic
UPDATE players SET position = 'PF' WHERE full_name = 'Paolo Banchero';
UPDATE players SET position = 'SG' WHERE full_name = 'Franz Wagner';
UPDATE players SET position = 'C' WHERE full_name = 'Wendell Carter Jr.';

-- Pistons
UPDATE players SET position = 'SG' WHERE full_name = 'Cade Cunningham';
UPDATE players SET position = 'PF' WHERE full_name = 'Jalen Duren';

-- Trail Blazers
UPDATE players SET position = 'SG' WHERE full_name = 'Anfernee Simons';
UPDATE players SET position = 'SF' WHERE full_name = 'Jerami Grant';

-- Jazz
UPDATE players SET position = 'SF' WHERE full_name = 'Lauri Markkanen';
UPDATE players SET position = 'C' WHERE full_name = 'Walker Kessler';

COMMIT;

-- Verification query
SELECT
    position,
    COUNT(*) as player_count,
    STRING_AGG(full_name, ', ' ORDER BY full_name) as players
FROM players
WHERE position IS NOT NULL
GROUP BY position
ORDER BY position;

-- Show coverage
SELECT
    COUNT(*) FILTER (WHERE position IS NOT NULL) as with_position,
    COUNT(*) FILTER (WHERE position IS NULL) as without_position,
    COUNT(*) as total,
    ROUND(100.0 * COUNT(*) FILTER (WHERE position IS NOT NULL) / COUNT(*), 1) as coverage_pct
FROM players
WHERE is_active = true;
