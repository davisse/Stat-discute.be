#!/usr/bin/env python3
"""
GitHub Actions: Calculate Player ORTG/DRTG
Generates SQL statements to populate offensive_rating, defensive_rating, net_rating
in player_advanced_stats table.

Usage:
    python github_sync_player_ortg.py > ortg.sql
    ssh vps "docker exec -i postgres psql -U user -d db" < ortg.sql
"""

import sys
from datetime import datetime

# Configuration
SEASON = '2025-26'

def main():
    print("-- GitHub Actions: Player ORTG/DRTG Calculation", file=sys.stderr)
    print(f"-- Season: {SEASON}", file=sys.stderr)
    print(f"-- Started: {datetime.now().isoformat()}", file=sys.stderr)

    # Output SQL header
    print("-- NBA Player ORTG/DRTG Calculation SQL")
    print(f"-- Generated: {datetime.now().isoformat()}")
    print(f"-- Season: {SEASON}")
    print("")
    print("BEGIN;")
    print("")

    # =========================================================================
    # Player ORTG/DRTG/Net Rating Calculation
    # =========================================================================
    print("-- =================================================================")
    print("-- PLAYER ORTG/DRTG/NET RATING CALCULATION")
    print("-- =================================================================")
    print("")
    print("-- Formula:")
    print("-- Individual ORTG = (PTS / Individual Possessions) * 100")
    print("-- Individual Possessions = FGA + (0.44 * FTA) + TOV")
    print("-- DRTG = Team DRTG (from team_game_stats)")
    print("-- Net Rating = ORTG - DRTG")
    print("")

    # Update ORTG, DRTG, and Net Rating
    print(f"""
WITH player_calculations AS (
    SELECT
        pas.game_id,
        pas.player_id,
        -- Individual ORTG = (Points / Individual Possessions) * 100
        CASE
            WHEN (pgs.fg_attempted + 0.44 * pgs.ft_attempted + pgs.turnovers) > 0
            THEN ROUND((pgs.points::numeric / (pgs.fg_attempted + 0.44 * pgs.ft_attempted + pgs.turnovers)) * 100, 2)
            ELSE NULL
        END as ortg,
        -- Team DRTG for this game
        tgs.defensive_rating as drtg
    FROM player_advanced_stats pas
    JOIN player_game_stats pgs
        ON pas.game_id = pgs.game_id
        AND pas.player_id = pgs.player_id
    JOIN team_game_stats tgs
        ON pas.game_id = tgs.game_id
        AND pas.team_id = tgs.team_id
    JOIN games g ON pas.game_id = g.game_id
    WHERE pas.offensive_rating IS NULL
      AND pgs.minutes > 0
      AND g.season = '{SEASON}'
)
UPDATE player_advanced_stats pas
SET
    offensive_rating = pc.ortg,
    defensive_rating = pc.drtg,
    net_rating = CASE
        WHEN pc.ortg IS NOT NULL AND pc.drtg IS NOT NULL
        THEN ROUND(pc.ortg - pc.drtg, 2)
        ELSE NULL
    END
FROM player_calculations pc
WHERE pas.game_id = pc.game_id
  AND pas.player_id = pc.player_id;
""")
    print("")

    # Verify the update
    print("-- Verification query")
    print(f"""
SELECT
    COUNT(*) as total,
    COUNT(offensive_rating) as with_ortg,
    COUNT(defensive_rating) as with_drtg,
    COUNT(net_rating) as with_net,
    ROUND(AVG(offensive_rating), 1) as avg_ortg,
    ROUND(AVG(defensive_rating), 1) as avg_drtg,
    ROUND(AVG(net_rating), 1) as avg_net
FROM player_advanced_stats pas
JOIN games g ON pas.game_id = g.game_id
WHERE g.season = '{SEASON}';
""")
    print("")

    print("COMMIT;")
    print("")
    print("-- Player ORTG/DRTG calculation complete")

    print(f"-- Completed: {datetime.now().isoformat()}", file=sys.stderr)

if __name__ == '__main__':
    main()
