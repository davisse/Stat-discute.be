#!/usr/bin/env python3
"""
GitHub Actions: Calculate Player ORTG/DRTG
Generates SQL statements to populate offensive_rating, defensive_rating, net_rating
in player_advanced_stats table.
Calculates team DRTG from game data to avoid team_game_stats dependency.

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
    print("-- Team DRTG = (Opponent Points / Team Possessions) * 100")
    print("-- Net Rating = ORTG - DRTG")
    print("")

    # Update ORTG, DRTG, and Net Rating - calculate team DRTG from game scores
    print(f"""
WITH team_game_possessions AS (
    -- Calculate team possessions from player stats
    SELECT
        pgs.game_id,
        pgs.team_id,
        SUM(pgs.fg_attempted) as team_fga,
        SUM(pgs.ft_attempted) as team_fta,
        SUM(pgs.turnovers) as team_tov
    FROM player_game_stats pgs
    JOIN games g ON pgs.game_id = g.game_id
    WHERE g.season = '{SEASON}'
    GROUP BY pgs.game_id, pgs.team_id
),
team_drtg AS (
    -- Calculate team DRTG from opponent points and team possessions
    SELECT
        tgp.game_id,
        tgp.team_id,
        -- Team DRTG = (Points Allowed / Team Possessions) * 100
        CASE
            WHEN (tgp.team_fga + 0.44 * tgp.team_fta + tgp.team_tov) > 0
            THEN ROUND((
                CASE
                    WHEN g.home_team_id = tgp.team_id THEN g.away_team_score
                    ELSE g.home_team_score
                END::numeric /
                (tgp.team_fga + 0.44 * tgp.team_fta + tgp.team_tov)
            ) * 100, 2)
            ELSE NULL
        END as drtg
    FROM team_game_possessions tgp
    JOIN games g ON tgp.game_id = g.game_id
),
player_calculations AS (
    SELECT
        pas.game_id,
        pas.player_id,
        -- Individual ORTG = (Points / Individual Possessions) * 100
        CASE
            WHEN (pgs.fg_attempted + 0.44 * pgs.ft_attempted + pgs.turnovers) > 0
            THEN ROUND((pgs.points::numeric / (pgs.fg_attempted + 0.44 * pgs.ft_attempted + pgs.turnovers)) * 100, 2)
            ELSE NULL
        END as ortg,
        -- Team DRTG from our calculation
        td.drtg
    FROM player_advanced_stats pas
    JOIN player_game_stats pgs
        ON pas.game_id = pgs.game_id
        AND pas.player_id = pgs.player_id
    JOIN team_drtg td
        ON pas.game_id = td.game_id
        AND pas.team_id = td.team_id
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
