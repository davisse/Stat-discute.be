#!/usr/bin/env python3
"""
GitHub Actions: Calculate Advanced Player Stats
Generates SQL statements to populate player_advanced_stats table.
Calculates team totals from player_game_stats to avoid team_game_stats dependency.

Usage:
    python github_sync_advanced_stats.py > advanced_stats.sql
    ssh vps "docker exec -i postgres psql -U user -d db" < advanced_stats.sql
"""

import sys
from datetime import datetime

# Configuration
SEASON = '2025-26'

def main():
    print("-- GitHub Actions: Advanced Stats Calculation", file=sys.stderr)
    print(f"-- Season: {SEASON}", file=sys.stderr)
    print(f"-- Started: {datetime.now().isoformat()}", file=sys.stderr)

    # Output SQL header
    print("-- NBA Advanced Stats Calculation SQL")
    print(f"-- Generated: {datetime.now().isoformat()}")
    print(f"-- Season: {SEASON}")
    print("")
    print("BEGIN;")
    print("")

    # =========================================================================
    # Player Advanced Stats Calculation
    # =========================================================================
    print("-- =================================================================")
    print("-- PLAYER ADVANCED STATS CALCULATION")
    print("-- =================================================================")
    print("")
    print("-- Formula:")
    print("-- True Shooting % = PTS / (2 * (FGA + 0.44 * FTA))")
    print("-- Effective FG% = (FGM + 0.5 * 3PM) / FGA")
    print("-- Usage Rate = 100 * ((FGA + 0.44 * FTA + TOV) * (240 / 5)) / (minutes * team_possessions)")
    print("")

    # Insert advanced stats - calculates team totals from player_game_stats
    print(f"""
INSERT INTO player_advanced_stats (
    game_id, player_id, team_id,
    true_shooting_pct, effective_fg_pct, usage_rate,
    assist_ratio, assist_to_turnover_ratio, rebound_percentage
)
WITH team_totals AS (
    -- Calculate team totals from player_game_stats
    SELECT
        pgs.game_id,
        pgs.team_id,
        SUM(pgs.fg_made) as team_fgm,
        SUM(pgs.fg_attempted) as team_fga,
        SUM(pgs.ft_attempted) as team_fta,
        SUM(pgs.rebounds) as team_reb,
        SUM(pgs.turnovers) as team_tov
    FROM player_game_stats pgs
    JOIN games g ON pgs.game_id = g.game_id
    WHERE g.season = '{SEASON}'
    GROUP BY pgs.game_id, pgs.team_id
),
opponent_rebounds AS (
    -- Calculate opponent rebounds for each team per game
    SELECT
        g.game_id,
        g.home_team_id as team_id,
        COALESCE(away_tt.team_reb, 0) as opp_reb
    FROM games g
    LEFT JOIN team_totals away_tt ON g.game_id = away_tt.game_id
        AND away_tt.team_id = g.away_team_id
    WHERE g.season = '{SEASON}'
    UNION ALL
    SELECT
        g.game_id,
        g.away_team_id as team_id,
        COALESCE(home_tt.team_reb, 0) as opp_reb
    FROM games g
    LEFT JOIN team_totals home_tt ON g.game_id = home_tt.game_id
        AND home_tt.team_id = g.home_team_id
    WHERE g.season = '{SEASON}'
)
SELECT
    pgs.game_id,
    pgs.player_id,
    pgs.team_id,
    -- True Shooting % = PTS / (2 * (FGA + 0.44 * FTA))
    CASE
        WHEN (pgs.fg_attempted + 0.44 * pgs.ft_attempted) > 0
        THEN ROUND((pgs.points::numeric / (2 * (pgs.fg_attempted + 0.44 * pgs.ft_attempted))) * 100, 1)
        ELSE NULL
    END as true_shooting_pct,
    -- Effective FG% = (FGM + 0.5 * 3PM) / FGA
    CASE
        WHEN pgs.fg_attempted > 0
        THEN ROUND(((pgs.fg_made + 0.5 * pgs.fg3_made)::numeric / pgs.fg_attempted) * 100, 1)
        ELSE NULL
    END as effective_fg_pct,
    -- Usage Rate = 100 * ((FGA + 0.44 * FTA + TOV) * (Team Minutes / 5)) / (Minutes * Team Possessions)
    CASE
        WHEN pgs.minutes > 0
            AND (tt.team_fga + 0.44 * tt.team_fta + tt.team_tov) > 0
        THEN ROUND(
            100 * (
                (pgs.fg_attempted + 0.44 * pgs.ft_attempted + pgs.turnovers) * (240.0 / 5)
            ) / (
                pgs.minutes * (tt.team_fga + 0.44 * tt.team_fta + tt.team_tov)
            ),
            1
        )
        ELSE NULL
    END as usage_rate,
    -- Assist Ratio = 100 * AST / ((Min / (240/5)) * Team FGM)
    CASE
        WHEN pgs.minutes > 0 AND tt.team_fgm > 0
        THEN ROUND(
            100 * pgs.assists::numeric / ((pgs.minutes / 48.0) * tt.team_fgm),
            1
        )
        ELSE NULL
    END as assist_ratio,
    -- Assist to Turnover Ratio
    CASE
        WHEN pgs.turnovers > 0
        THEN ROUND(pgs.assists::numeric / pgs.turnovers, 2)
        ELSE NULL
    END as assist_to_turnover_ratio,
    -- Rebound Percentage (simplified)
    CASE
        WHEN pgs.minutes > 0 AND (tt.team_reb + opp.opp_reb) > 0
        THEN ROUND(
            100 * (pgs.rebounds * (240.0 / 5)) / (pgs.minutes * (tt.team_reb + opp.opp_reb)),
            1
        )
        ELSE NULL
    END as rebound_percentage
FROM player_game_stats pgs
JOIN games g ON pgs.game_id = g.game_id
JOIN team_totals tt ON pgs.game_id = tt.game_id AND pgs.team_id = tt.team_id
LEFT JOIN opponent_rebounds opp ON pgs.game_id = opp.game_id AND pgs.team_id = opp.team_id
LEFT JOIN player_advanced_stats existing ON pgs.game_id = existing.game_id
    AND pgs.player_id = existing.player_id
WHERE g.season = '{SEASON}'
    AND pgs.minutes > 0
    AND existing.id IS NULL
ON CONFLICT (game_id, player_id) DO NOTHING;
""")
    print("")

    # Verification query
    print("-- Verification query")
    print(f"""
SELECT
    COUNT(*) as total,
    COUNT(true_shooting_pct) as with_ts,
    COUNT(effective_fg_pct) as with_efg,
    COUNT(usage_rate) as with_usg,
    ROUND(AVG(true_shooting_pct), 1) as avg_ts,
    ROUND(AVG(effective_fg_pct), 1) as avg_efg,
    ROUND(AVG(usage_rate), 1) as avg_usg
FROM player_advanced_stats pas
JOIN games g ON pas.game_id = g.game_id
WHERE g.season = '{SEASON}';
""")
    print("")

    print("COMMIT;")
    print("")
    print("-- Advanced stats calculation complete")

    print(f"-- Completed: {datetime.now().isoformat()}", file=sys.stderr)

if __name__ == '__main__':
    main()
