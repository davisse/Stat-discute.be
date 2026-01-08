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
import requests
from datetime import datetime, timedelta
import pandas as pd

# Configuration
SEASON = '2025-26'
SEASON_START = datetime(2025, 10, 20)
NBA_API_TIMEOUT = 60
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds

# Use CDN endpoint (more reliable than stats.nba.com)
CDN_SCHEDULE_URL = "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json"

# Required headers
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com'
}

def escape_sql(value):
    """Escape single quotes for SQL"""
    if value is None:
        return 'NULL'
    if isinstance(value, str):
        return "'" + value.replace("'", "''") + "'"
    return str(value)

def fetch_schedule_from_cdn():
    """Fetch game schedule from CDN endpoint with retry logic"""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"-- Attempt {attempt}/{MAX_RETRIES} fetching from CDN...", file=sys.stderr)
            response = requests.get(CDN_SCHEDULE_URL, headers=HEADERS, timeout=NBA_API_TIMEOUT)
            response.raise_for_status()
            data = response.json()
            print(f"-- Success on attempt {attempt}", file=sys.stderr)
            return data
        except Exception as e:
            print(f"-- Attempt {attempt} failed: {e}", file=sys.stderr)
            if attempt < MAX_RETRIES:
                print(f"-- Waiting {RETRY_DELAY}s before retry...", file=sys.stderr)
                time.sleep(RETRY_DELAY)
    return None

def main():
    print("-- GitHub Actions: NBA Games Sync", file=sys.stderr)
    print(f"-- Season: {SEASON}", file=sys.stderr)
    print(f"-- Started: {datetime.now().isoformat()}", file=sys.stderr)

    # Fetch schedule from CDN
    print(f"-- Fetching schedule from CDN (timeout={NBA_API_TIMEOUT}s)...", file=sys.stderr)

    schedule_data = fetch_schedule_from_cdn()
    if not schedule_data:
        print(f"-- ERROR: Failed to fetch schedule from CDN", file=sys.stderr)
        sys.exit(1)

    # Parse games from schedule
    games = []
    try:
        league_schedule = schedule_data.get('leagueSchedule', {})
        schedule_season = league_schedule.get('seasonYear', '')
        game_dates = league_schedule.get('gameDates', [])

        print(f"-- Schedule season: {schedule_season}", file=sys.stderr)

        for game_date_obj in game_dates:
            # Parse date from "MM/DD/YYYY HH:MM:SS" format
            raw_date = game_date_obj.get('gameDate', '')
            try:
                # Handle "10/02/2025 00:00:00" format
                parsed_date = datetime.strptime(raw_date.split()[0], '%m/%d/%Y')
                game_date = parsed_date.strftime('%Y-%m-%d')
            except:
                # Try ISO format as fallback
                game_date = raw_date[:10]

            for game in game_date_obj.get('games', []):
                game_id = game.get('gameId', '')
                home_team = game.get('homeTeam', {})
                away_team = game.get('awayTeam', {})

                # Only include regular season games (gameId starts with '002')
                if not game_id.startswith('002'):
                    continue

                games.append({
                    'game_id': game_id,
                    'game_date': game_date,
                    'home_team_id': home_team.get('teamId'),
                    'away_team_id': away_team.get('teamId'),
                    'home_score': home_team.get('score'),
                    'away_score': away_team.get('score'),
                    'game_status': 'Final' if game.get('gameStatus') == 3 else 'Scheduled'
                })

        print(f"-- Parsed {len(games)} regular season games from schedule", file=sys.stderr)
    except Exception as e:
        print(f"-- ERROR: Failed to parse schedule: {e}", file=sys.stderr)
        sys.exit(1)

    if not games:
        print(f"-- No games found for {SEASON}", file=sys.stderr)
        print("-- SQL output empty (no games to sync)")
        sys.exit(0)

    # Filter to current date + 7 days ahead
    current_date = datetime.now() + timedelta(days=7)
    current_date_str = current_date.strftime('%Y-%m-%d')
    filtered_games = [g for g in games if g['game_date'] <= current_date_str]

    print(f"-- Found {len(filtered_games)} games within date range", file=sys.stderr)

    # Output SQL header
    print("-- NBA Games Sync SQL")
    print(f"-- Generated: {datetime.now().isoformat()}")
    print(f"-- Season: {SEASON}")
    print(f"-- Games: {len(filtered_games)}")
    print("")
    print("BEGIN;")
    print("")

    # Process each game
    processed = 0
    for game in filtered_games:
        game_id = game['game_id']
        game_date = game['game_date']
        home_team_id = game['home_team_id']
        away_team_id = game['away_team_id']
        home_score = game['home_score'] if game['home_score'] else 'NULL'
        away_score = game['away_score'] if game['away_score'] else 'NULL'
        game_status = game['game_status']

        # Skip games with missing team IDs
        if not home_team_id or not away_team_id:
            continue

        # Output INSERT with ON CONFLICT
        print(f"""INSERT INTO games (game_id, game_date, season, home_team_id, away_team_id, home_team_score, away_team_score, game_status, updated_at)
VALUES ('{game_id}', '{game_date}', '{SEASON}', {home_team_id}, {away_team_id}, {home_score}, {away_score}, '{game_status}', NOW())
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

    print(f"-- Completed: {datetime.now().isoformat()}", file=sys.stderr)

if __name__ == '__main__':
    main()
