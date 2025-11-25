#!/usr/bin/env python3
"""
Calculate Advanced Player Stats
Calculate advanced metrics like PER, TS%, Usage Rate, etc.
"""

import os
import sys
import psycopg2
from datetime import datetime
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

def calculate_true_shooting_pct(points, fga, fta):
    """
    True Shooting % = PTS / (2 * (FGA + 0.44 * FTA))
    """
    tsa = 2 * (fga + 0.44 * fta)
    return (points / tsa) if tsa > 0 else None

def calculate_effective_fg_pct(fgm, fg3m, fga):
    """
    Effective FG% = (FGM + 0.5 * 3PM) / FGA
    """
    return ((fgm + 0.5 * fg3m) / fga) if fga > 0 else None

def calculate_usage_rate(fga, fta, tov, minutes, team_minutes, team_fga, team_fta, team_tov):
    """
    Usage Rate = 100 * ((FGA + 0.44 * FTA + TOV) * (Team Minutes / 5)) /
                 (Minutes * (Team FGA + 0.44 * Team FTA + Team TOV))
    """
    if minutes == 0 or team_minutes == 0:
        return None

    player_possessions = fga + 0.44 * fta + tov
    team_possessions = team_fga + 0.44 * team_fta + team_tov

    if team_possessions == 0:
        return None

    return 100 * ((player_possessions * (team_minutes / 5)) / (minutes * team_possessions))

def calculate_assist_ratio(assists, minutes, team_minutes, team_fgm):
    """
    Assist Ratio = 100 * Assists / (((Minutes / (Team Minutes / 5)) * Team FGM) - FGM)
    """
    if minutes == 0 or team_minutes == 0:
        return None

    denominator = ((minutes / (team_minutes / 5)) * team_fgm)
    return (100 * assists / denominator) if denominator > 0 else None

def calculate_rebound_percentage(rebounds, minutes, team_minutes, team_reb, opp_reb):
    """
    Rebound % = 100 * (Rebounds * (Team Minutes / 5)) / (Minutes * (Team Reb + Opp Reb))
    """
    if minutes == 0 or team_minutes == 0:
        return None

    total_reb = team_reb + opp_reb
    if total_reb == 0:
        return None

    return 100 * (rebounds * (team_minutes / 5)) / (minutes * total_reb)

def calculate_advanced_stats():
    """Calculate advanced stats for all player game stats"""
    print("=" * 80)
    print("🧮 CALCULATING ADVANCED PLAYER STATS")
    print("=" * 80)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get player game stats without advanced stats
        cur.execute("""
            SELECT pgs.game_id
            FROM player_game_stats pgs
            LEFT JOIN player_advanced_stats pas ON pgs.game_id = pas.game_id AND pgs.player_id = pas.player_id
            WHERE pas.id IS NULL
              AND pgs.minutes > 0
            GROUP BY pgs.game_id
            ORDER BY pgs.game_id DESC
            LIMIT 100
        """)

        games_to_process = [row[0] for row in cur.fetchall()]

        if not games_to_process:
            print("✅ All player stats have advanced calculations")
            cur.close()
            conn.close()
            return True

        print(f"📋 Found {len(games_to_process)} games to process\n")

        processed_games = 0
        inserted_stats = 0

        for game_id in games_to_process:
            processed_games += 1
            print(f"[{processed_games}/{len(games_to_process)}] Processing game {game_id}...")

            # Get all players in this game
            cur.execute("""
                SELECT
                    pgs.player_id,
                    pgs.team_id,
                    pgs.minutes,
                    pgs.points,
                    pgs.fg_made,
                    pgs.fg_attempted,
                    pgs.fg3_made,
                    pgs.fg3_attempted,
                    pgs.ft_made,
                    pgs.ft_attempted,
                    pgs.rebounds,
                    pgs.assists,
                    pgs.steals,
                    pgs.blocks,
                    pgs.turnovers
                FROM player_game_stats pgs
                WHERE pgs.game_id = %s AND pgs.minutes > 0
            """, (game_id,))

            players = cur.fetchall()

            if not players:
                continue

            # Get team totals for the game
            cur.execute("""
                SELECT
                    tgs.team_id,
                    tgs.field_goals_made,
                    tgs.field_goals_attempted,
                    tgs.free_throws_attempted,
                    tgs.total_rebounds,
                    tgs.turnovers
                FROM team_game_stats tgs
                WHERE tgs.game_id = %s
            """, (game_id,))

            team_stats = {row[0]: row[1:] for row in cur.fetchall()}

            # Calculate opponent rebounds for rebound % calculation
            team_rebounds_map = {}
            for team_id, (fgm, fga, fta, reb, tov) in team_stats.items():
                # Get opponent team ID
                cur.execute("""
                    SELECT CASE
                        WHEN home_team_id = %s THEN away_team_id
                        ELSE home_team_id
                    END as opponent_team_id
                    FROM games WHERE game_id = %s
                """, (team_id, game_id))
                opp_team_id = cur.fetchone()[0]

                if opp_team_id in team_stats:
                    opp_reb = team_stats[opp_team_id][3]
                    team_rebounds_map[team_id] = (reb, opp_reb)

            team_minutes = 240  # 48 minutes * 5 players

            for player in players:
                (player_id, team_id, minutes, points, fgm, fga, fg3m, fg3a,
                 ftm, fta, reb, ast, stl, blk, tov) = player

                if team_id not in team_stats:
                    continue

                team_fgm, team_fga, team_fta, team_reb, team_tov = team_stats[team_id]

                # Calculate advanced metrics
                ts_pct = calculate_true_shooting_pct(points, fga, fta)
                eff_fg_pct = calculate_effective_fg_pct(fgm, fg3m, fga)
                usage_rate = calculate_usage_rate(
                    fga, fta, tov, minutes, team_minutes, team_fga, team_fta, team_tov
                )
                assist_ratio = calculate_assist_ratio(ast, minutes, team_minutes, team_fgm)

                # Rebound percentage
                reb_pct = None
                if team_id in team_rebounds_map:
                    team_reb, opp_reb = team_rebounds_map[team_id]
                    reb_pct = calculate_rebound_percentage(
                        reb, minutes, team_minutes, team_reb, opp_reb
                    )

                # Assist to turnover ratio
                ast_to_tov = (ast / tov) if tov > 0 else None

                # Insert advanced stats
                cur.execute("""
                    INSERT INTO player_advanced_stats (
                        game_id, player_id, team_id,
                        true_shooting_pct, effective_fg_pct, usage_rate,
                        assist_ratio, assist_to_turnover_ratio, rebound_percentage
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (game_id, player_id) DO NOTHING
                """, (
                    game_id, player_id, team_id,
                    ts_pct, eff_fg_pct, usage_rate,
                    assist_ratio, ast_to_tov, reb_pct
                ))

                if cur.rowcount > 0:
                    inserted_stats += 1

            if processed_games % 10 == 0:
                conn.commit()
                print(f"  ✓ Committed batch (processed {processed_games}/{len(games_to_process)})")

        conn.commit()

        print(f"\n📊 Advanced Stats Calculation Summary:")
        print(f"  • Games processed: {processed_games}")
        print(f"  • Advanced stats inserted: {inserted_stats}")

        # Verify
        cur.execute("SELECT COUNT(*) FROM player_advanced_stats")
        total_advanced_stats = cur.fetchone()[0]
        print(f"\n✅ Total advanced stats in database: {total_advanced_stats}")

        cur.close()
        conn.close()

        print("\n✅ Advanced stats calculation completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = calculate_advanced_stats()
    sys.exit(0 if success else 1)
