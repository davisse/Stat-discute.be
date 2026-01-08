#!/usr/bin/env python3
"""
GitHub Actions: Calculate Analytics
Generates SQL statements to calculate team standings and DVP stats.
Designed to be piped to psql via SSH.

Usage:
    python github_sync_analytics.py > analytics.sql
    ssh vps "docker exec -i postgres psql -U user -d db" < analytics.sql
"""

import sys
from datetime import datetime

# Configuration
SEASON = '2025-26'

def main():
    print("-- GitHub Actions: Analytics Calculation", file=sys.stderr)
    print(f"-- Season: {SEASON}", file=sys.stderr)
    print(f"-- Started: {datetime.now().isoformat()}", file=sys.stderr)

    # Output SQL header
    print("-- NBA Analytics Calculation SQL")
    print(f"-- Generated: {datetime.now().isoformat()}")
    print(f"-- Season: {SEASON}")
    print("")
    print("BEGIN;")
    print("")

    # =========================================================================
    # Team Standings Calculation
    # =========================================================================
    print("-- =================================================================")
    print("-- TEAM STANDINGS CALCULATION")
    print("-- =================================================================")
    print("")

    # Delete existing standings for the season
    print(f"DELETE FROM team_standings WHERE season_id = '{SEASON}';")
    print("")

    # Insert calculated standings
    print(f"""
INSERT INTO team_standings (
    team_id, season_id, wins, losses, win_pct, games_behind,
    home_wins, home_losses, away_wins, away_losses,
    conference, division, conference_rank, division_rank,
    streak, last_10, points_for, points_against, point_differential,
    last_updated
)
WITH team_games AS (
    SELECT
        t.team_id,
        t.conference,
        t.division,
        COUNT(*) FILTER (WHERE
            (g.home_team_id = t.team_id AND g.home_team_score > g.away_team_score) OR
            (g.away_team_id = t.team_id AND g.away_team_score > g.home_team_score)
        ) as wins,
        COUNT(*) FILTER (WHERE
            (g.home_team_id = t.team_id AND g.home_team_score < g.away_team_score) OR
            (g.away_team_id = t.team_id AND g.away_team_score < g.home_team_score)
        ) as losses,
        COUNT(*) FILTER (WHERE g.home_team_id = t.team_id AND g.home_team_score > g.away_team_score) as home_wins,
        COUNT(*) FILTER (WHERE g.home_team_id = t.team_id AND g.home_team_score < g.away_team_score) as home_losses,
        COUNT(*) FILTER (WHERE g.away_team_id = t.team_id AND g.away_team_score > g.home_team_score) as away_wins,
        COUNT(*) FILTER (WHERE g.away_team_id = t.team_id AND g.away_team_score < g.home_team_score) as away_losses,
        AVG(CASE WHEN g.home_team_id = t.team_id THEN g.home_team_score ELSE g.away_team_score END) as points_for,
        AVG(CASE WHEN g.home_team_id = t.team_id THEN g.away_team_score ELSE g.home_team_score END) as points_against
    FROM teams t
    JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
    WHERE g.season = '{SEASON}' AND g.game_status = 'Final'
    GROUP BY t.team_id, t.conference, t.division
),
standings_ranked AS (
    SELECT
        tg.*,
        CASE WHEN (wins + losses) > 0 THEN ROUND(wins::numeric / (wins + losses), 3) ELSE 0 END as win_pct,
        ROUND((points_for - points_against)::numeric, 1) as point_differential,
        ROW_NUMBER() OVER (PARTITION BY conference ORDER BY wins DESC, losses ASC) as conference_rank,
        ROW_NUMBER() OVER (PARTITION BY division ORDER BY wins DESC, losses ASC) as division_rank
    FROM team_games tg
),
conference_leader AS (
    SELECT conference, MAX(wins) as max_wins
    FROM standings_ranked
    GROUP BY conference
)
SELECT
    sr.team_id,
    '{SEASON}' as season_id,
    sr.wins,
    sr.losses,
    sr.win_pct,
    ROUND((cl.max_wins - sr.wins)::numeric + (sr.losses - (SELECT MIN(losses) FROM standings_ranked sr2 WHERE sr2.conference = sr.conference AND sr2.wins = cl.max_wins))::numeric * 0.5, 1) as games_behind,
    sr.home_wins,
    sr.home_losses,
    sr.away_wins,
    sr.away_losses,
    sr.conference,
    sr.division,
    sr.conference_rank,
    sr.division_rank,
    'W1' as streak,
    '5-5' as last_10,
    ROUND(sr.points_for, 1) as points_for,
    ROUND(sr.points_against, 1) as points_against,
    sr.point_differential,
    NOW() as last_updated
FROM standings_ranked sr
JOIN conference_leader cl ON sr.conference = cl.conference;
""")
    print("")

    # =========================================================================
    # Defense vs Position (DVP) Calculation
    # =========================================================================
    print("-- =================================================================")
    print("-- DEFENSE VS POSITION (DVP) CALCULATION")
    print("-- =================================================================")
    print("")

    # Delete existing DVP for the season
    print(f"DELETE FROM defensive_stats_by_position WHERE season = '{SEASON}';")
    print("")

    # Insert calculated DVP stats
    print(f"""
INSERT INTO defensive_stats_by_position (
    season, team_id, opponent_position, games_played,
    points_allowed, points_allowed_per_game,
    fg_pct_allowed, fg3_pct_allowed, ft_pct_allowed,
    rebounds_allowed, assists_allowed, steals_allowed, blocks_allowed, turnovers_forced,
    rebounds_allowed_per_game, assists_allowed_per_game,
    points_allowed_rank, fg_pct_allowed_rank,
    calculated_at
)
WITH position_mapping AS (
    SELECT 'G' as position UNION ALL
    SELECT 'F' UNION ALL
    SELECT 'C'
),
team_defense AS (
    SELECT
        t.team_id,
        CASE
            WHEN pgs.start_position IN ('G', 'PG', 'SG') THEN 'G'
            WHEN pgs.start_position IN ('F', 'SF', 'PF') THEN 'F'
            WHEN pgs.start_position IN ('C') THEN 'C'
            ELSE NULL
        END as opponent_position,
        COUNT(DISTINCT g.game_id) as games_played,
        SUM(pgs.points) as total_points,
        AVG(pgs.points) as avg_points,
        CASE WHEN SUM(pgs.fg_attempted) > 0 THEN SUM(pgs.fg_made)::numeric / SUM(pgs.fg_attempted) ELSE NULL END as fg_pct,
        CASE WHEN SUM(pgs.fg3_attempted) > 0 THEN SUM(pgs.fg3_made)::numeric / SUM(pgs.fg3_attempted) ELSE NULL END as fg3_pct,
        CASE WHEN SUM(pgs.ft_attempted) > 0 THEN SUM(pgs.ft_made)::numeric / SUM(pgs.ft_attempted) ELSE NULL END as ft_pct,
        SUM(pgs.rebounds) as total_rebounds,
        AVG(pgs.rebounds) as avg_rebounds,
        SUM(pgs.assists) as total_assists,
        AVG(pgs.assists) as avg_assists,
        SUM(pgs.steals) as total_steals,
        SUM(pgs.blocks) as total_blocks,
        SUM(pgs.turnovers) as turnovers_forced
    FROM teams t
    JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
    JOIN player_game_stats pgs ON g.game_id = pgs.game_id
        AND pgs.team_id != t.team_id  -- Opponent's players
    WHERE g.season = '{SEASON}'
        AND g.game_status = 'Final'
        AND pgs.start_position IS NOT NULL
        AND pgs.start_position != ''
    GROUP BY t.team_id,
        CASE
            WHEN pgs.start_position IN ('G', 'PG', 'SG') THEN 'G'
            WHEN pgs.start_position IN ('F', 'SF', 'PF') THEN 'F'
            WHEN pgs.start_position IN ('C') THEN 'C'
            ELSE NULL
        END
),
dvp_ranked AS (
    SELECT
        td.*,
        ROW_NUMBER() OVER (PARTITION BY opponent_position ORDER BY avg_points ASC) as points_rank,
        ROW_NUMBER() OVER (PARTITION BY opponent_position ORDER BY fg_pct ASC) as fg_pct_rank
    FROM team_defense td
    WHERE opponent_position IS NOT NULL
)
SELECT
    '{SEASON}' as season,
    team_id,
    opponent_position,
    games_played,
    ROUND(total_points, 2) as points_allowed,
    ROUND(avg_points, 2) as points_allowed_per_game,
    ROUND(fg_pct * 100, 2) as fg_pct_allowed,
    ROUND(fg3_pct * 100, 2) as fg3_pct_allowed,
    ROUND(ft_pct * 100, 2) as ft_pct_allowed,
    ROUND(total_rebounds, 2) as rebounds_allowed,
    ROUND(total_assists, 2) as assists_allowed,
    ROUND(total_steals, 2) as steals_allowed,
    ROUND(total_blocks, 2) as blocks_allowed,
    ROUND(turnovers_forced, 2) as turnovers_forced,
    ROUND(avg_rebounds, 2) as rebounds_allowed_per_game,
    ROUND(avg_assists, 2) as assists_allowed_per_game,
    points_rank as points_allowed_rank,
    fg_pct_rank as fg_pct_allowed_rank,
    NOW() as calculated_at
FROM dvp_ranked
WHERE games_played > 0;
""")
    print("")

    print("COMMIT;")
    print("")
    print("-- Analytics calculation complete")

    print(f"-- Completed: {datetime.now().isoformat()}", file=sys.stderr)

if __name__ == '__main__':
    main()
