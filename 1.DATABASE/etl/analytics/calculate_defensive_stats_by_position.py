#!/usr/bin/env python3
"""
Calculate Defensive Stats by Position
Analyzes how teams defend against different positions (PG, SG, SF, PF, C)

This helps identify:
- Which teams struggle against certain positions
- Which positions score best against specific teams
- Positional matchup advantages for betting

Usage:
    python3 calculate_defensive_stats_by_position.py [--season SEASON]
"""

import os
import sys
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )

def get_current_season(conn):
    """Get current season from database"""
    cur = conn.cursor()
    cur.execute("SELECT season_id FROM seasons WHERE is_current = true LIMIT 1")
    result = cur.fetchone()
    cur.close()
    return result[0] if result else '2025-26'

def calculate_defensive_stats_by_position(conn, season):
    """
    Calculate how each team defends against different positions

    Logic:
    1. For each game, identify opposing player positions
    2. Aggregate stats allowed to each position
    3. Calculate per-game averages
    4. Rank teams for each defensive category
    """

    print(f"\n📊 Calculating defensive stats by position for {season}...")

    cur = conn.cursor()

    # Clear existing data for this season
    cur.execute("DELETE FROM defensive_stats_by_position WHERE season = %s", (season,))

    # Calculate defensive stats by position
    # For each team, calculate what they allow to each opposing position
    query = """
    WITH position_stats AS (
        SELECT
            g.game_id,
            g.season,
            g.home_team_id as defending_team_id,
            g.away_team_id as opposing_team_id,
            p.position as opponent_position,
            pgs.player_id,
            pgs.points,
            pgs.rebounds,
            pgs.assists,
            pgs.steals,
            pgs.blocks,
            pgs.turnovers,
            pgs.fg_made,
            pgs.fg_attempted,
            pgs.fg3_made,
            pgs.fg3_attempted,
            pgs.ft_made,
            pgs.ft_attempted
        FROM games g
        JOIN player_game_stats pgs ON g.game_id = pgs.game_id
        JOIN players p ON pgs.player_id = p.player_id
        WHERE g.season = %s
          AND p.position IS NOT NULL
          AND pgs.team_id = g.away_team_id  -- Away team players (opposing team)
          AND pgs.minutes > 0  -- Only count players who actually played

        UNION ALL

        SELECT
            g.game_id,
            g.season,
            g.away_team_id as defending_team_id,
            g.home_team_id as opposing_team_id,
            p.position as opponent_position,
            pgs.player_id,
            pgs.points,
            pgs.rebounds,
            pgs.assists,
            pgs.steals,
            pgs.blocks,
            pgs.turnovers,
            pgs.fg_made,
            pgs.fg_attempted,
            pgs.fg3_made,
            pgs.fg3_attempted,
            pgs.ft_made,
            pgs.ft_attempted
        FROM games g
        JOIN player_game_stats pgs ON g.game_id = pgs.game_id
        JOIN players p ON pgs.player_id = p.player_id
        WHERE g.season = %s
          AND p.position IS NOT NULL
          AND pgs.team_id = g.home_team_id  -- Home team players (opposing team)
          AND pgs.minutes > 0
    ),
    aggregated_stats AS (
        SELECT
            season,
            defending_team_id as team_id,
            opponent_position,
            COUNT(DISTINCT game_id) as games_played,
            SUM(points) as total_points_allowed,
            SUM(rebounds) as total_rebounds_allowed,
            SUM(assists) as total_assists_allowed,
            SUM(steals) as total_steals_allowed,
            SUM(blocks) as total_blocks_allowed,
            SUM(turnovers) as total_turnovers_forced,
            SUM(fg_made) as total_fg_made,
            SUM(fg_attempted) as total_fg_attempted,
            SUM(fg3_made) as total_fg3_made,
            SUM(fg3_attempted) as total_fg3_attempted,
            SUM(ft_made) as total_ft_made,
            SUM(ft_attempted) as total_ft_attempted
        FROM position_stats
        GROUP BY season, team_id, opponent_position
    )
    INSERT INTO defensive_stats_by_position (
        season,
        team_id,
        opponent_position,
        games_played,
        points_allowed,
        points_allowed_per_game,
        fg_pct_allowed,
        fg3_pct_allowed,
        ft_pct_allowed,
        rebounds_allowed,
        assists_allowed,
        steals_allowed,
        blocks_allowed,
        turnovers_forced,
        rebounds_allowed_per_game,
        assists_allowed_per_game
    )
    SELECT
        season,
        team_id,
        opponent_position,
        games_played,
        total_points_allowed as points_allowed,
        ROUND(total_points_allowed::numeric / NULLIF(games_played, 0), 2) as points_allowed_per_game,
        CASE
            WHEN total_fg_attempted > 0
            THEN ROUND(100.0 * total_fg_made / total_fg_attempted, 2)
            ELSE NULL
        END as fg_pct_allowed,
        CASE
            WHEN total_fg3_attempted > 0
            THEN ROUND(100.0 * total_fg3_made / total_fg3_attempted, 2)
            ELSE NULL
        END as fg3_pct_allowed,
        CASE
            WHEN total_ft_attempted > 0
            THEN ROUND(100.0 * total_ft_made / total_ft_attempted, 2)
            ELSE NULL
        END as ft_pct_allowed,
        total_rebounds_allowed as rebounds_allowed,
        total_assists_allowed as assists_allowed,
        total_steals_allowed as steals_allowed,
        total_blocks_allowed as blocks_allowed,
        total_turnovers_forced as turnovers_forced,
        ROUND(total_rebounds_allowed::numeric / NULLIF(games_played, 0), 2) as rebounds_allowed_per_game,
        ROUND(total_assists_allowed::numeric / NULLIF(games_played, 0), 2) as assists_allowed_per_game
    FROM aggregated_stats
    WHERE games_played > 0;
    """

    cur.execute(query, (season, season))
    rows_inserted = cur.rowcount

    # Calculate ranks for each position
    positions = ['PG', 'SG', 'SF', 'PF', 'C']

    for position in positions:
        # Rank by points allowed per game (lower is better = better defense)
        cur.execute("""
            UPDATE defensive_stats_by_position ds1
            SET points_allowed_rank = (
                SELECT COUNT(*) + 1
                FROM defensive_stats_by_position ds2
                WHERE ds2.season = ds1.season
                  AND ds2.opponent_position = ds1.opponent_position
                  AND ds2.points_allowed_per_game < ds1.points_allowed_per_game
            )
            WHERE ds1.season = %s
              AND ds1.opponent_position = %s
        """, (season, position))

        # Rank by FG% allowed (lower is better)
        cur.execute("""
            UPDATE defensive_stats_by_position ds1
            SET fg_pct_allowed_rank = (
                SELECT COUNT(*) + 1
                FROM defensive_stats_by_position ds2
                WHERE ds2.season = ds1.season
                  AND ds2.opponent_position = ds1.opponent_position
                  AND ds2.fg_pct_allowed IS NOT NULL
                  AND ds1.fg_pct_allowed IS NOT NULL
                  AND ds2.fg_pct_allowed < ds1.fg_pct_allowed
            )
            WHERE ds1.season = %s
              AND ds1.opponent_position = %s
              AND ds1.fg_pct_allowed IS NOT NULL
        """, (season, position))

    conn.commit()

    print(f"✅ Inserted {rows_inserted} defensive stat records")
    print(f"✅ Calculated ranks for all positions")

    # Show summary
    cur.execute("""
        SELECT
            opponent_position,
            COUNT(*) as team_count,
            ROUND(AVG(points_allowed_per_game), 1) as avg_ppg_allowed,
            ROUND(AVG(fg_pct_allowed), 1) as avg_fg_pct_allowed
        FROM defensive_stats_by_position
        WHERE season = %s
        GROUP BY opponent_position
        ORDER BY opponent_position
    """, (season,))

    print(f"\n📈 League Averages by Position:")
    print(f"{'Position':<10} {'Teams':<8} {'PPG Allowed':<15} {'FG% Allowed':<15}")
    print("-" * 60)

    for row in cur.fetchall():
        pos, teams, ppg, fg_pct = row
        print(f"{pos:<10} {teams:<8} {ppg:<15.1f} {fg_pct or 0:<15.1f}%")

    cur.close()
    return rows_inserted

def main():
    print("=" * 80)
    print("🏀 Calculate Defensive Stats by Position")
    print("=" * 80)

    try:
        conn = get_db_connection()
        season = get_current_season(conn)

        print(f"📅 Analyzing season: {season}")

        # Calculate defensive stats by position
        rows = calculate_defensive_stats_by_position(conn, season)

        if rows > 0:
            # Show top and bottom 5 defenses for each position
            cur = conn.cursor()

            for position in ['PG', 'SG', 'SF', 'PF', 'C']:
                print(f"\n🛡️  Best Defenses Against {position}:")
                cur.execute("""
                    SELECT
                        t.abbreviation,
                        ds.points_allowed_per_game,
                        ds.fg_pct_allowed,
                        ds.points_allowed_rank
                    FROM defensive_stats_by_position ds
                    JOIN teams t ON ds.team_id = t.team_id
                    WHERE ds.season = %s
                      AND ds.opponent_position = %s
                    ORDER BY ds.points_allowed_per_game ASC
                    LIMIT 5
                """, (season, position))

                print(f"{'Rank':<6} {'Team':<6} {'PPG Allowed':<15} {'FG% Allowed':<15}")
                print("-" * 50)

                for idx, (team, ppg, fg_pct, rank) in enumerate(cur.fetchall(), 1):
                    print(f"{rank:<6} {team:<6} {ppg:<15.1f} {fg_pct or 0:<15.1f}%")

            cur.close()

        conn.close()
        print("\n✅ Defensive stats by position calculation complete!")

    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
