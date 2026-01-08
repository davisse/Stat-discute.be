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

# Configuration
SEASON = '2025-26'
SEASON_YEAR = '2025'  # For scoreboard API
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds

# Headers for NBA CDN (simpler, less likely to be blocked)
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
}

def escape_sql(value):
    """Escape single quotes for SQL"""
    if value is None:
        return 'NULL'
    if isinstance(value, str):
        return "'" + value.replace("'", "''") + "'"
    return str(value)

def fetch_schedule():
    """Fetch season schedule from NBA CDN (more reliable than stats.nba.com)"""
    # Use the CDN schedule endpoint which is less restricted
    url = f"https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json"

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"-- Attempt {attempt}/{MAX_RETRIES}...", file=sys.stderr)
            response = requests.get(url, headers=HEADERS, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"-- Attempt {attempt} failed: {e}", file=sys.stderr)
            if attempt < MAX_RETRIES:
                print(f"-- Retrying in {RETRY_DELAY} seconds...", file=sys.stderr)
                time.sleep(RETRY_DELAY)
            else:
                raise

def fetch_scoreboard(date_str):
    """Fetch scoreboard for a specific date"""
    url = f"https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json"
    # For historical dates, use a different endpoint
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

def main():
    print("-- GitHub Actions: NBA Games Sync", file=sys.stderr)
    print(f"-- Season: {SEASON}", file=sys.stderr)
    print(f"-- Started: {datetime.now().isoformat()}", file=sys.stderr)

    # Fetch schedule from NBA CDN
    print(f"-- Fetching schedule from NBA CDN...", file=sys.stderr)

    try:
        schedule_data = fetch_schedule()
    except Exception as e:
        print(f"-- ERROR: Failed to fetch schedule after {MAX_RETRIES} attempts: {e}", file=sys.stderr)
        sys.exit(1)

    # Parse schedule data
    league_schedule = schedule_data.get('leagueSchedule', {})
    game_dates = league_schedule.get('gameDates', [])

    if not game_dates:
        print(f"-- No games found in schedule", file=sys.stderr)
        print("-- SQL output empty (no games to sync)")
        sys.exit(0)

    # Collect all games
    games = []
    current_date = datetime.now()
    cutoff_date = current_date + timedelta(days=7)

    for date_entry in game_dates:
        game_date_str = date_entry.get('gameDate', '')[:10]  # Format: YYYY-MM-DD or MM/DD/YYYY HH:MM:SS AM
        if '/' in game_date_str:
            # Parse MM/DD/YYYY format
            try:
                game_date = datetime.strptime(game_date_str.split()[0], '%m/%d/%Y')
            except:
                continue
        else:
            try:
                game_date = datetime.strptime(game_date_str, '%Y-%m-%d')
            except:
                continue

        # Only include games up to cutoff
        if game_date > cutoff_date:
            continue

        for game in date_entry.get('games', []):
            game_id = game.get('gameId', '')
            if not game_id:
                continue

            home_team = game.get('homeTeam', {})
            away_team = game.get('awayTeam', {})
            home_team_id = home_team.get('teamId')
            away_team_id = away_team.get('teamId')

            if not home_team_id or not away_team_id:
                continue

            home_score = home_team.get('score')
            away_score = away_team.get('score')

            # Determine game status
            game_status_code = game.get('gameStatus', 1)
            if game_status_code == 3:  # Final
                game_status = 'Final'
            elif game_status_code == 2:  # In Progress
                game_status = 'In Progress'
            else:
                game_status = 'Scheduled'

            games.append({
                'game_id': game_id,
                'game_date': game_date.strftime('%Y-%m-%d'),
                'home_team_id': home_team_id,
                'away_team_id': away_team_id,
                'home_score': home_score if home_score else 'NULL',
                'away_score': away_score if away_score else 'NULL',
                'game_status': game_status
            })

    print(f"-- Found {len(games)} games", file=sys.stderr)

    # Output SQL header
    print("-- NBA Games Sync SQL")
    print(f"-- Generated: {datetime.now().isoformat()}")
    print(f"-- Season: {SEASON}")
    print(f"-- Games: {len(games)}")
    print("")
    print("BEGIN;")
    print("")

    # Process each game
    for g in games:
        home_score_sql = g['home_score'] if g['home_score'] != 'NULL' else 'NULL'
        away_score_sql = g['away_score'] if g['away_score'] != 'NULL' else 'NULL'

        print(f"""INSERT INTO games (game_id, game_date, season, home_team_id, away_team_id, home_team_score, away_team_score, game_status, updated_at)
VALUES ('{g['game_id']}', '{g['game_date']}', '{SEASON}', {g['home_team_id']}, {g['away_team_id']}, {home_score_sql}, {away_score_sql}, '{g['game_status']}', NOW())
ON CONFLICT (game_id) DO UPDATE SET
    home_team_score = EXCLUDED.home_team_score,
    away_team_score = EXCLUDED.away_team_score,
    game_status = EXCLUDED.game_status,
    updated_at = EXCLUDED.updated_at;""")
        print("")

    print("COMMIT;")
    print("")
    print(f"-- Processed {len(games)} games")

    print(f"-- Completed: {datetime.now().isoformat()}", file=sys.stderr)

if __name__ == '__main__':
    main()
