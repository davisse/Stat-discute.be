#!/usr/bin/env python3
"""
Smart absence detection using rotation patterns.

This script identifies meaningful player absences by:
1. Finding each team's regular rotation players (played in most recent games)
2. Detecting when these rotation players don't have stats in a game
3. Marking them as absent in player_game_participation

This heuristic approach:
- Doesn't require NBA roster API calls
- Works with existing game data
- Catches absences that matter for betting (key players)
- Ignores deep bench players (minimal impact)

Usage:
    python3 populate_absences_smart.py [season]

Example:
    python3 populate_absences_smart.py 2025-26
"""

import os
import sys
import psycopg2
from psycopg2.extras import execute_batch
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'config', '.env'))

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'nba_stats'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '')
}


def get_db_connection():
    """Create database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        sys.exit(1)


def identify_rotation_players(season, lookback_games=10, min_games_played=5):
    """
    Identify regular rotation players for each team.

    A player is considered "rotation" if they played in at least min_games_played
    of the last lookback_games games for their team.

    Args:
        season (str): Season ID (e.g., '2025-26')
        lookback_games (int): Number of recent games to analyze
        min_games_played (int): Minimum games played to be considered rotation

    Returns:
        dict: {team_id: set(player_ids)} - rotation players per team
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    print(f"🔍 Identifying rotation players for season {season}...")
    print(f"   Lookback: {lookback_games} games, Min games: {min_games_played}")

    try:
        # Get rotation players per team
        # Logic: Players who played in >= min_games_played of team's last lookback_games games
        cursor.execute("""
            WITH team_games AS (
                -- Get each team's recent games (lookback window)
                SELECT DISTINCT
                    CASE
                        WHEN g.home_team_id = t.team_id THEN g.home_team_id
                        ELSE g.away_team_id
                    END as team_id,
                    g.game_id,
                    g.game_date,
                    ROW_NUMBER() OVER (
                        PARTITION BY t.team_id
                        ORDER BY g.game_date DESC
                    ) as game_rank
                FROM teams t
                CROSS JOIN games g
                WHERE g.season = %s
                  AND g.game_status = 'Final'
                  AND (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
            ),
            recent_games AS (
                SELECT team_id, game_id
                FROM team_games
                WHERE game_rank <= %s
            ),
            player_appearances AS (
                -- Count how many recent games each player appeared in
                SELECT
                    rg.team_id,
                    pgs.player_id,
                    COUNT(*) as games_played,
                    AVG(pgs.minutes) as avg_minutes
                FROM recent_games rg
                JOIN player_game_stats pgs ON rg.game_id = pgs.game_id
                WHERE pgs.team_id = rg.team_id
                GROUP BY rg.team_id, pgs.player_id
            )
            SELECT
                pa.team_id,
                pa.player_id,
                pa.games_played,
                pa.avg_minutes,
                p.full_name,
                t.abbreviation
            FROM player_appearances pa
            JOIN players p ON pa.player_id = p.player_id
            JOIN teams t ON pa.team_id = t.team_id
            WHERE pa.games_played >= %s  -- Rotation threshold
            ORDER BY pa.team_id, pa.games_played DESC, pa.avg_minutes DESC
        """, (season, lookback_games, min_games_played))

        results = cursor.fetchall()

        # Build rotation dict
        rotation_by_team = {}
        for team_id, player_id, games_played, avg_minutes, player_name, team_abbr in results:
            if team_id not in rotation_by_team:
                rotation_by_team[team_id] = {
                    'team_abbr': team_abbr,
                    'players': set()
                }
            rotation_by_team[team_id]['players'].add((player_id, player_name, games_played, avg_minutes))

        # Print summary
        total_rotation_players = sum(len(data['players']) for data in rotation_by_team.values())
        print(f"   ✅ Found {total_rotation_players} rotation players across {len(rotation_by_team)} teams")

        for team_id, data in sorted(rotation_by_team.items(), key=lambda x: x[1]['team_abbr']):
            print(f"   - {data['team_abbr']}: {len(data['players'])} rotation players")

        return rotation_by_team

    except Exception as e:
        print(f"   ❌ Error identifying rotation players: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


def detect_and_insert_absences(season, rotation_by_team):
    """
    Detect absences by finding games where rotation players didn't play.

    Args:
        season (str): Season ID (e.g., '2025-26')
        rotation_by_team (dict): Rotation players per team
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    print(f"\n🔎 Detecting absences for rotation players...")

    try:
        # Get all games for the season
        cursor.execute("""
            SELECT game_id, game_date, home_team_id, away_team_id
            FROM games
            WHERE season = %s AND game_status = 'Final'
            ORDER BY game_date
        """, (season,))

        games = cursor.fetchall()
        print(f"   Analyzing {len(games)} completed games...")

        absences_found = []

        for game_id, game_date, home_team_id, away_team_id in games:
            # Get players who actually played in this game
            cursor.execute("""
                SELECT player_id
                FROM player_game_stats
                WHERE game_id = %s
            """, (game_id,))

            players_who_played = {row[0] for row in cursor.fetchall()}

            # Check home team rotation
            if home_team_id in rotation_by_team:
                for player_id, player_name, games_played, avg_minutes in rotation_by_team[home_team_id]['players']:
                    if player_id not in players_who_played:
                        absences_found.append((
                            game_id,
                            player_id,
                            home_team_id,
                            False,  # is_active
                            'dnp',  # inactive_reason (generic - could be injury/rest/other)
                            0  # minutes_played
                        ))

            # Check away team rotation
            if away_team_id in rotation_by_team:
                for player_id, player_name, games_played, avg_minutes in rotation_by_team[away_team_id]['players']:
                    if player_id not in players_who_played:
                        absences_found.append((
                            game_id,
                            player_id,
                            away_team_id,
                            False,  # is_active
                            'dnp',  # inactive_reason
                            0  # minutes_played
                        ))

        print(f"   ✅ Detected {len(absences_found)} absences")

        if absences_found:
            # Insert absences
            print(f"   📥 Inserting absence records...")
            execute_batch(cursor, """
                INSERT INTO player_game_participation
                (game_id, player_id, team_id, is_active, inactive_reason, minutes_played)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (game_id, player_id)
                DO UPDATE SET
                    is_active = EXCLUDED.is_active,
                    inactive_reason = EXCLUDED.inactive_reason,
                    minutes_played = EXCLUDED.minutes_played,
                    updated_at = CURRENT_TIMESTAMP
            """, absences_found, page_size=500)

            conn.commit()
            print(f"   ✅ Inserted {len(absences_found)} absence records")
        else:
            print(f"   ℹ️  No absences detected (all rotation players played in all games)")

    except Exception as e:
        conn.rollback()
        print(f"   ❌ Error detecting absences: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


def get_absence_stats(season):
    """
    Get statistics about detected absences.

    Args:
        season (str): Season ID (e.g., '2025-26')
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Overall stats
        cursor.execute("""
            SELECT
                COUNT(*) as total_records,
                SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN NOT is_active THEN 1 ELSE 0 END) as absent_count
            FROM player_game_participation pgp
            JOIN games g ON pgp.game_id = g.game_id
            WHERE g.season = %s
        """, (season,))

        total, active, absent = cursor.fetchone()

        print(f"\n📊 Absence Statistics for {season}:")
        print(f"   Total records: {total}")
        print(f"   Active (played): {active}")
        print(f"   Absent: {absent}")

        if absent and absent > 0:
            # Top players by absences
            cursor.execute("""
                SELECT
                    p.full_name,
                    t.abbreviation as team,
                    COUNT(*) as games_missed
                FROM player_game_participation pgp
                JOIN games g ON pgp.game_id = g.game_id
                JOIN players p ON pgp.player_id = p.player_id
                JOIN teams t ON pgp.team_id = t.team_id
                WHERE g.season = %s
                  AND pgp.is_active = FALSE
                GROUP BY p.player_id, p.full_name, t.abbreviation
                ORDER BY games_missed DESC
                LIMIT 10
            """, (season,))

            top_absences = cursor.fetchall()
            if top_absences:
                print(f"\n   Top 10 players by games missed:")
                for player_name, team, games_missed in top_absences:
                    print(f"   - {player_name} ({team}): {games_missed} games")

    except Exception as e:
        print(f"   ❌ Error getting stats: {e}")
    finally:
        cursor.close()
        conn.close()


def main():
    """Main execution"""
    # Get season from command line or use default
    season = sys.argv[1] if len(sys.argv) > 1 else '2025-26'

    print(f"🏀 Smart Absence Detection")
    print(f"=" * 60)
    print(f"Season: {season}")
    print(f"Database: {DB_CONFIG['database']} @ {DB_CONFIG['host']}")
    print()

    # Step 1: Identify rotation players
    rotation_by_team = identify_rotation_players(
        season=season,
        lookback_games=10,  # Analyze last 10 games
        min_games_played=5   # Must have played in 5+ of those games
    )

    # Step 2: Detect and insert absences
    detect_and_insert_absences(season, rotation_by_team)

    # Step 3: Show absence statistics
    get_absence_stats(season)

    print(f"\n✅ Smart absence detection completed for {season}")
    print(f"\n💡 Tip: Run this script regularly to keep absence data up-to-date")


if __name__ == '__main__':
    main()
