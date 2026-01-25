#!/usr/bin/env python3
"""
GitHub Actions: Sync NBA Games
Fetches games from NBA API (nba_api package) and outputs SQL statements to stdout.
Designed to be piped to psql via SSH.

Usage:
    python github_sync_games.py > games.sql
    ssh vps "docker exec -i postgres psql -U user -d db" < games.sql
"""

import sys
import time
from datetime import datetime, timedelta
import pandas as pd
from nba_api.stats.endpoints import leaguegamefinder

# Configuration
SEASON = '2025-26'
SEASON_START = datetime(2025, 10, 20)
MAX_RETRIES = 3
RETRY_DELAY = 10  # seconds

def fetch_games_with_retry():
    """Fetch games from NBA API with retry logic for GitHub Actions reliability"""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"-- Attempt {attempt}/{MAX_RETRIES}: Fetching from NBA API...", file=sys.stderr)
            gamefinder = leaguegamefinder.LeagueGameFinder(
                season_nullable=SEASON,
                league_id_nullable='00',  # NBA
                season_type_nullable='Regular Season',
                timeout=60  # Increase timeout to 60 seconds
            )
            games_df = gamefinder.get_data_frames()[0]
            print(f"-- Received {len(games_df)} records from NBA API", file=sys.stderr)
            return games_df
        except Exception as e:
            print(f"-- Attempt {attempt} failed: {e}", file=sys.stderr)
            if attempt < MAX_RETRIES:
                print(f"-- Waiting {RETRY_DELAY}s before retry...", file=sys.stderr)
                time.sleep(RETRY_DELAY)
            else:
                raise e
    return None

def main():
    print("-- GitHub Actions: NBA Games Sync", file=sys.stderr)
    print(f"-- Season: {SEASON}", file=sys.stderr)
    print(f"-- Started: {datetime.now().isoformat()}", file=sys.stderr)

    # Fetch games from NBA API using nba_api package
    print("-- Fetching games from NBA API (LeagueGameFinder)...", file=sys.stderr)
    current_date = datetime.now() + timedelta(days=7)  # Include upcoming games

    try:
        games_df = fetch_games_with_retry()
        if games_df is None:
            raise Exception("Failed to fetch games after all retries")
    except Exception as e:
        print(f"-- ERROR: Failed to fetch from NBA API: {e}", file=sys.stderr)
        sys.exit(1)

    if games_df.empty:
        print(f"-- No games found for {SEASON}", file=sys.stderr)
        print("-- SQL output empty (no games to sync)")
        sys.exit(0)

    # Process games
    games_df['GAME_DATE'] = pd.to_datetime(games_df['GAME_DATE'])
    games_df = games_df[games_df['GAME_DATE'] <= current_date]

    unique_game_ids = games_df['GAME_ID'].unique()
    print(f"-- Found {len(unique_game_ids)} unique games", file=sys.stderr)

    # Output SQL header
    print("-- NBA Games Sync SQL")
    print(f"-- Generated: {datetime.now().isoformat()}")
    print(f"-- Source: NBA API (LeagueGameFinder)")
    print(f"-- Season: {SEASON}")
    print(f"-- Games: {len(unique_game_ids)}")
    print("")
    print("BEGIN;")
    print("")

    # Process each game
    processed = 0
    for game_id in unique_game_ids:
        game_rows = games_df[games_df['GAME_ID'] == game_id]

        if len(game_rows) != 2:
            continue

        # Determine home and away teams
        # The MATCHUP field contains '@' for away team
        for _, row in game_rows.iterrows():
            matchup = row['MATCHUP']
            team_id = row['TEAM_ID']
            pts = row['PTS']
            game_date = row['GAME_DATE'].strftime('%Y-%m-%d')
            wl = row.get('WL', '')

            if '@' in matchup:
                # This is the away team
                away_team_id = team_id
                away_score = pts
            else:
                # This is the home team
                home_team_id = team_id
                home_score = pts

        # Determine game status
        # If both teams have scores and WL is set, game is Final
        game_status = 'Final' if home_score and away_score else 'Scheduled'

        # Format scores
        home_score_sql = str(int(home_score)) if pd.notna(home_score) and home_score else 'NULL'
        away_score_sql = str(int(away_score)) if pd.notna(away_score) and away_score else 'NULL'

        # Output INSERT with ON CONFLICT
        print(f"""INSERT INTO games (game_id, game_date, season, home_team_id, away_team_id, home_team_score, away_team_score, game_status, updated_at)
VALUES ('{game_id}', '{game_date}', '{SEASON}', {home_team_id}, {away_team_id}, {home_score_sql}, {away_score_sql}, '{game_status}', NOW())
ON CONFLICT (game_id) DO UPDATE SET
    home_team_score = EXCLUDED.home_team_score,
    away_team_score = EXCLUDED.away_team_score,
    game_status = EXCLUDED.game_status,
    updated_at = EXCLUDED.updated_at;""")
        print("")
        processed += 1

    print("COMMIT;")
    print("")
    print(f"-- Processed {processed} games")

    # Count Final games
    final_count = sum(1 for gid in unique_game_ids
                      if games_df[games_df['GAME_ID'] == gid]['PTS'].notna().all())
    print(f"-- Final games: {final_count}", file=sys.stderr)
    print(f"-- Completed: {datetime.now().isoformat()}", file=sys.stderr)

if __name__ == '__main__':
    main()
