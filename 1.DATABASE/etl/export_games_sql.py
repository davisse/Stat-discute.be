#!/usr/bin/env python3
"""
Export Games from Local Database to SQL
Exports games data from local PostgreSQL to SQL statements for production import.

Usage:
    python export_games_sql.py > games.sql
    ssh vps "docker exec -i postgres psql -U user -d db" < games.sql
"""

import sys
import os
from datetime import datetime
import psycopg2

# Configuration
SEASON = '2025-26'

def get_db_connection():
    """Connect to local PostgreSQL database"""
    return psycopg2.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        port=os.environ.get('DB_PORT', '5432'),
        database=os.environ.get('DB_NAME', 'nba_stats'),
        user=os.environ.get('DB_USER', 'chapirou'),
        password=os.environ.get('DB_PASSWORD', '')
    )

def main():
    print("-- Local Database: Export Games to SQL", file=sys.stderr)
    print(f"-- Season: {SEASON}", file=sys.stderr)
    print(f"-- Started: {datetime.now().isoformat()}", file=sys.stderr)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch all games for current season
        cursor.execute("""
            SELECT game_id, game_date, season, home_team_id, away_team_id,
                   home_team_score, away_team_score, game_status
            FROM games
            WHERE season = %s
            ORDER BY game_date ASC
        """, (SEASON,))

        games = cursor.fetchall()
        print(f"-- Found {len(games)} games to export", file=sys.stderr)

        # Count stats
        final_count = sum(1 for g in games if g[7] == 'Final')
        scheduled_count = len(games) - final_count
        print(f"-- Final: {final_count}, Scheduled: {scheduled_count}", file=sys.stderr)

        # Output SQL header
        print("-- NBA Games Export SQL")
        print(f"-- Generated: {datetime.now().isoformat()}")
        print(f"-- Source: Local Database")
        print(f"-- Season: {SEASON}")
        print(f"-- Total Games: {len(games)}")
        print(f"-- Final: {final_count}")
        print("")
        print("BEGIN;")
        print("")

        for game in games:
            game_id, game_date, season, home_team_id, away_team_id, home_score, away_score, game_status = game

            # Format scores
            home_score_sql = str(home_score) if home_score is not None else 'NULL'
            away_score_sql = str(away_score) if away_score is not None else 'NULL'

            print(f"""INSERT INTO games (game_id, game_date, season, home_team_id, away_team_id, home_team_score, away_team_score, game_status, updated_at)
VALUES ('{game_id}', '{game_date}', '{season}', {home_team_id}, {away_team_id}, {home_score_sql}, {away_score_sql}, '{game_status}', NOW())
ON CONFLICT (game_id) DO UPDATE SET
    home_team_score = EXCLUDED.home_team_score,
    away_team_score = EXCLUDED.away_team_score,
    game_status = EXCLUDED.game_status,
    updated_at = EXCLUDED.updated_at;""")
            print("")

        print("COMMIT;")
        print("")
        print(f"-- Exported {len(games)} games")

        cursor.close()
        conn.close()

        print(f"-- Completed: {datetime.now().isoformat()}", file=sys.stderr)

    except Exception as e:
        print(f"-- ERROR: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
