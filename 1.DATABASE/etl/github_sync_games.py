#!/usr/bin/env python3
"""
GitHub Actions: Sync NBA Games
Fetches games from NBA API and outputs SQL statements to stdout.
Designed to be piped to psql via SSH.

Usage:
    python github_sync_games.py > games.sql
    ssh vps "docker exec -i postgres psql -U user -d db" < games.sql
"""

import sys
import time
from datetime import datetime, timedelta
from nba_api.stats.endpoints import leaguegamefinder
import pandas as pd

# Configuration
SEASON = '2025-26'
SEASON_START = datetime(2025, 10, 20)
NBA_API_TIMEOUT = 120  # Increased timeout for reliability
MAX_RETRIES = 3
RETRY_DELAY = 10  # seconds

def escape_sql(value):
    """Escape single quotes for SQL"""
    if value is None:
        return 'NULL'
    if isinstance(value, str):
        return "'" + value.replace("'", "''") + "'"
    return str(value)

def main():
    print("-- GitHub Actions: NBA Games Sync", file=sys.stderr)
    print(f"-- Season: {SEASON}", file=sys.stderr)
    print(f"-- Started: {datetime.now().isoformat()}", file=sys.stderr)

    # Fetch games from NBA API with retry logic
    print(f"-- Fetching games from NBA API (timeout={NBA_API_TIMEOUT}s)...", file=sys.stderr)

    games_df = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"-- Attempt {attempt}/{MAX_RETRIES}...", file=sys.stderr)
            gamefinder = leaguegamefinder.LeagueGameFinder(
                season_nullable=SEASON,
                league_id_nullable='00',
                season_type_nullable='Regular Season',
                timeout=NBA_API_TIMEOUT
            )
            games_df = gamefinder.get_data_frames()[0]
            print(f"-- Success on attempt {attempt}", file=sys.stderr)
            break
        except Exception as e:
            print(f"-- Attempt {attempt} failed: {e}", file=sys.stderr)
            if attempt < MAX_RETRIES:
                print(f"-- Waiting {RETRY_DELAY}s before retry...", file=sys.stderr)
                time.sleep(RETRY_DELAY)
            else:
                print(f"-- ERROR: All {MAX_RETRIES} attempts failed", file=sys.stderr)
                sys.exit(1)

    if games_df.empty:
        print(f"-- No games found for {SEASON}", file=sys.stderr)
        print("-- SQL output empty (no games to sync)")
        sys.exit(0)

    # Filter to current date + 7 days ahead
    current_date = datetime.now() + timedelta(days=7)
    games_df['GAME_DATE'] = pd.to_datetime(games_df['GAME_DATE'])
    games_df = games_df[games_df['GAME_DATE'] <= current_date]

    unique_game_ids = games_df['GAME_ID'].unique()
    print(f"-- Found {len(unique_game_ids)} unique games", file=sys.stderr)

    # Output SQL header
    print("-- NBA Games Sync SQL")
    print(f"-- Generated: {datetime.now().isoformat()}")
    print(f"-- Season: {SEASON}")
    print(f"-- Games: {len(unique_game_ids)}")
    print("")
    print("BEGIN;")
    print("")

    # Process each game
    processed = set()
    for game_id in unique_game_ids:
        if game_id in processed:
            continue
        processed.add(game_id)

        game_rows = games_df[games_df['GAME_ID'] == game_id]
        if len(game_rows) != 2:
            continue

        # Determine home/away teams
        home_row = game_rows[game_rows['MATCHUP'].str.contains(' vs. ')].iloc[0] if len(game_rows[game_rows['MATCHUP'].str.contains(' vs. ')]) > 0 else None
        away_row = game_rows[game_rows['MATCHUP'].str.contains(' @ ')].iloc[0] if len(game_rows[game_rows['MATCHUP'].str.contains(' @ ')]) > 0 else None

        if home_row is None or away_row is None:
            continue

        game_date = home_row['GAME_DATE'].strftime('%Y-%m-%d')
        home_team_id = int(home_row['TEAM_ID'])
        away_team_id = int(away_row['TEAM_ID'])
        home_score = int(home_row['PTS']) if pd.notna(home_row['PTS']) else 'NULL'
        away_score = int(away_row['PTS']) if pd.notna(away_row['PTS']) else 'NULL'

        # Determine game status
        wl = home_row.get('WL', None)
        if pd.notna(wl) and wl in ['W', 'L']:
            game_status = 'Final'
        else:
            game_status = 'Scheduled'

        # Output INSERT with ON CONFLICT
        print(f"""INSERT INTO games (game_id, game_date, season, home_team_id, away_team_id, home_team_score, away_team_score, game_status, updated_at)
VALUES ('{game_id}', '{game_date}', '{SEASON}', {home_team_id}, {away_team_id}, {home_score}, {away_score}, '{game_status}', NOW())
ON CONFLICT (game_id) DO UPDATE SET
    home_team_score = EXCLUDED.home_team_score,
    away_team_score = EXCLUDED.away_team_score,
    game_status = EXCLUDED.game_status,
    updated_at = EXCLUDED.updated_at;""")
        print("")

    print("COMMIT;")
    print("")
    print(f"-- Processed {len(processed)} games")

    print(f"-- Completed: {datetime.now().isoformat()}", file=sys.stderr)

if __name__ == '__main__':
    main()
