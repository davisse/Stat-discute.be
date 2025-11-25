#!/usr/bin/env python3
"""
Calculate Team Game Stats
Aggregate player stats to team level and calculate advanced metrics
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

def calculate_possessions(fga, fta, oreb, tov):
    """
    Calculate possessions using the standard formula
    Possessions = FGA + 0.44 * FTA - OREB + TOV
    """
    return fga + (0.44 * fta) - oreb + tov

def calculate_pace(possessions, minutes):
    """
    Calculate pace (possessions per 48 minutes)
    Pace = (Possessions / Minutes) * 48
    """
    if minutes == 0:
        return 0
    return (possessions / minutes) * 48

def calculate_offensive_rating(points, possessions):
    """
    Calculate offensive rating (points per 100 possessions)
    ORtg = (Points / Possessions) * 100
    """
    if possessions == 0:
        return 0
    return (points / possessions) * 100

def calculate_defensive_rating(opp_points, possessions):
    """
    Calculate defensive rating (opponent points per 100 possessions)
    DRtg = (Opponent Points / Possessions) * 100
    Lower is better (fewer points allowed)
    """
    if possessions == 0:
        return 0
    return (opp_points / possessions) * 100

def calculate_four_factors(fg_made, fg_att, three_made, ft_made, ft_att, oreb, dreb, tov):
    """
    Calculate the Four Factors of Basketball Success
    1. Effective FG% = (FGM + 0.5 * 3PM) / FGA
    2. Turnover Rate = TOV / (FGA + 0.44 * FTA + TOV)
    3. Offensive Rebound % = OREB / (OREB + Opp DREB)
    4. Free Throw Rate = FT / FGA
    """
    # Effective FG%
    eff_fg_pct = ((fg_made + 0.5 * three_made) / fg_att) if fg_att > 0 else 0

    # Turnover Rate (simplified without opponent stats)
    tov_rate = (tov / (fg_att + 0.44 * ft_att + tov)) if (fg_att + 0.44 * ft_att + tov) > 0 else 0

    # Free Throw Rate
    ft_rate = (ft_made / fg_att) if fg_att > 0 else 0

    return eff_fg_pct, tov_rate, ft_rate

def calculate_team_game_stats():
    """Calculate team-level stats for all games"""
    print("=" * 80)
    print("📊 CALCULATING TEAM GAME STATS")
    print("=" * 80)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get all games without team stats
        cur.execute("""
            SELECT g.game_id
            FROM games g
            LEFT JOIN team_game_stats tgs ON g.game_id = tgs.game_id
            WHERE g.game_status = 'Final'
              AND tgs.id IS NULL
            GROUP BY g.game_id, g.game_date
            ORDER BY g.game_date DESC
            LIMIT 100
        """)

        games_to_process = [row[0] for row in cur.fetchall()]

        if not games_to_process:
            print("✅ All games have team stats calculated")
            cur.close()
            conn.close()
            return True

        print(f"📋 Found {len(games_to_process)} games to process\n")

        processed = 0
        inserted = 0

        for game_id in games_to_process:
            processed += 1
            print(f"[{processed}/{len(games_to_process)}] Processing game {game_id}...")

            # Get game info
            cur.execute("""
                SELECT home_team_id, away_team_id, home_team_score, away_team_score
                FROM games
                WHERE game_id = %s
            """, (game_id,))

            game_info = cur.fetchone()
            if not game_info:
                continue

            home_team_id, away_team_id, home_score, away_score = game_info

            # Calculate stats for both teams
            for team_id in [home_team_id, away_team_id]:
                # Aggregate player stats for this team
                cur.execute("""
                    SELECT
                        COUNT(*) as players,
                        SUM(points) as points,
                        SUM(fg_made) as fg_made,
                        SUM(fg_attempted) as fg_attempted,
                        SUM(fg3_made) as fg3_made,
                        SUM(fg3_attempted) as fg3_attempted,
                        SUM(ft_made) as ft_made,
                        SUM(ft_attempted) as ft_attempted,
                        SUM(rebounds) as total_rebounds,
                        SUM(assists) as assists,
                        SUM(steals) as steals,
                        SUM(blocks) as blocks,
                        SUM(turnovers) as turnovers
                    FROM player_game_stats
                    WHERE game_id = %s AND team_id = %s
                """, (game_id, team_id))

                stats = cur.fetchone()
                if not stats or stats[0] == 0:
                    continue

                (players, points, fg_made, fg_att, three_made, three_att,
                 ft_made, ft_att, total_reb, assists, steals, blocks, turnovers) = stats

                # Calculate percentages
                fg_pct = (fg_made / fg_att) if fg_att > 0 else None
                three_pct = (three_made / three_att) if three_att > 0 else None
                ft_pct = (ft_made / ft_att) if ft_att > 0 else None

                # Estimate offensive/defensive rebounds (2/3 defensive, 1/3 offensive)
                oreb = int(total_reb * 0.33)
                dreb = int(total_reb * 0.67)

                # Determine opponent score
                if team_id == home_team_id:
                    opp_score = away_score if away_score else 0
                else:
                    opp_score = home_score if home_score else 0

                # Calculate advanced metrics
                possessions = calculate_possessions(fg_att, ft_att, oreb, turnovers)
                pace = calculate_pace(possessions, 48)  # 48 minutes per game
                offensive_rating = calculate_offensive_rating(points, possessions)
                defensive_rating = calculate_defensive_rating(opp_score, possessions)
                net_rating = offensive_rating - defensive_rating

                # Calculate four factors
                eff_fg_pct, tov_rate, ft_rate = calculate_four_factors(
                    fg_made, fg_att, three_made, ft_made, ft_att, oreb, dreb, turnovers
                )

                # Insert team game stats
                cur.execute("""
                    INSERT INTO team_game_stats (
                        game_id, team_id, points,
                        field_goals_made, field_goals_attempted, field_goal_pct,
                        three_pointers_made, three_pointers_attempted, three_point_pct,
                        free_throws_made, free_throws_attempted, free_throw_pct,
                        offensive_rebounds, defensive_rebounds, total_rebounds,
                        assists, steals, blocks, turnovers, personal_fouls,
                        possessions, pace, offensive_rating, defensive_rating, net_rating,
                        effective_fg_pct, turnover_pct, free_throw_rate
                    )
                    VALUES (
                        %s, %s, %s,
                        %s, %s, %s,
                        %s, %s, %s,
                        %s, %s, %s,
                        %s, %s, %s,
                        %s, %s, %s, %s, NULL,
                        %s, %s, %s, %s, %s,
                        %s, %s, %s
                    )
                    ON CONFLICT (game_id, team_id) DO UPDATE SET
                        defensive_rating = EXCLUDED.defensive_rating,
                        net_rating = EXCLUDED.net_rating
                """, (
                    game_id, team_id, points,
                    fg_made, fg_att, fg_pct,
                    three_made, three_att, three_pct,
                    ft_made, ft_att, ft_pct,
                    oreb, dreb, total_reb,
                    assists, steals, blocks, turnovers,
                    possessions, pace, offensive_rating, defensive_rating, net_rating,
                    eff_fg_pct, tov_rate, ft_rate
                ))

                if cur.rowcount > 0:
                    inserted += 1

            if processed % 10 == 0:
                conn.commit()
                print(f"  ✓ Committed batch (processed {processed}/{len(games_to_process)})")

        conn.commit()

        print(f"\n📊 Team Stats Calculation Summary:")
        print(f"  • Games processed: {processed}")
        print(f"  • Team stats inserted: {inserted}")

        # Verify
        cur.execute("SELECT COUNT(*) FROM team_game_stats")
        total_team_stats = cur.fetchone()[0]
        print(f"\n✅ Total team game stats in database: {total_team_stats}")

        cur.close()
        conn.close()

        print("\n✅ Team stats calculation completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

def update_defensive_ratings():
    """Update defensive_rating and net_rating for existing records that have NULL values"""
    print("=" * 80)
    print("📊 UPDATING DEFENSIVE RATINGS FOR EXISTING RECORDS")
    print("=" * 80)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Update defensive_rating and net_rating for all existing records
        cur.execute("""
            UPDATE team_game_stats tgs
            SET
                defensive_rating = CASE
                    WHEN tgs.possessions > 0 THEN
                        CASE
                            WHEN g.home_team_id = tgs.team_id THEN (g.away_team_score::numeric / tgs.possessions) * 100
                            ELSE (g.home_team_score::numeric / tgs.possessions) * 100
                        END
                    ELSE NULL
                END,
                net_rating = tgs.offensive_rating - CASE
                    WHEN tgs.possessions > 0 THEN
                        CASE
                            WHEN g.home_team_id = tgs.team_id THEN (g.away_team_score::numeric / tgs.possessions) * 100
                            ELSE (g.home_team_score::numeric / tgs.possessions) * 100
                        END
                    ELSE 0
                END
            FROM games g
            WHERE tgs.game_id = g.game_id
              AND (tgs.defensive_rating IS NULL OR tgs.net_rating IS NULL)
              AND g.home_team_score IS NOT NULL
              AND g.away_team_score IS NOT NULL
        """)

        updated = cur.rowcount
        conn.commit()

        print(f"\n✅ Updated {updated} records with defensive ratings")

        # Verify
        cur.execute("""
            SELECT
                COUNT(*) as total,
                COUNT(defensive_rating) as with_drtg,
                ROUND(AVG(defensive_rating)::numeric, 1) as avg_drtg
            FROM team_game_stats
        """)
        stats = cur.fetchone()
        print(f"📊 Team game stats: {stats[0]} total, {stats[1]} with DRTG, avg DRTG: {stats[2]}")

        cur.close()
        conn.close()

        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    # First update existing records
    update_defensive_ratings()
    # Then calculate any new records
    success = calculate_team_game_stats()
    sys.exit(0 if success else 1)
