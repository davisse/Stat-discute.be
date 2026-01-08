#!/usr/bin/env python3
"""
GitHub Actions: Sync Player Game Stats
Fetches player box scores from NBA API and outputs SQL statements to stdout.
Designed to be piped to psql via SSH.

Usage:
    python github_sync_player_stats.py > player_stats.sql
    ssh vps "docker exec -i postgres psql -U user -d db" < player_stats.sql
"""

import sys
import time
import requests
from datetime import datetime, timedelta

# Configuration
SEASON = '2025-26'
API_DELAY = 0.6  # Seconds between API calls to avoid rate limiting

# Required headers for NBA API
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Host': 'stats.nba.com',
    'x-nba-stats-origin': 'stats',
    'x-nba-stats-token': 'true'
}

def fetch_box_score(game_id):
    """Fetch box score for a single game"""
    url = f"https://stats.nba.com/stats/boxscoretraditionalv2"
    params = {
        'GameID': game_id,
        'StartPeriod': 0,
        'EndPeriod': 14,
        'StartRange': 0,
        'EndRange': 28800,
        'RangeType': 0
    }

    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"-- WARNING: Failed to fetch box score for {game_id}: {e}", file=sys.stderr)
        return None

def parse_minutes(min_str):
    """Convert minutes string (e.g., '32:45') to integer minutes"""
    if not min_str or min_str == '' or min_str is None:
        return 0
    try:
        if ':' in str(min_str):
            parts = str(min_str).split(':')
            return int(parts[0])
        return int(float(min_str))
    except:
        return 0

def fetch_recent_game_ids():
    """Fetch game IDs for recent games that need player stats"""
    from nba_api.stats.endpoints import leaguegamefinder

    gamefinder = leaguegamefinder.LeagueGameFinder(
        season_nullable=SEASON,
        league_id_nullable='00',
        season_type_nullable='Regular Season'
    )
    games_df = gamefinder.get_data_frames()[0]

    if games_df.empty:
        return []

    # Filter to last 7 days of completed games
    import pandas as pd
    games_df['GAME_DATE'] = pd.to_datetime(games_df['GAME_DATE'])
    seven_days_ago = datetime.now() - timedelta(days=7)

    # Only get completed games (have WL value)
    completed = games_df[
        (games_df['GAME_DATE'] >= seven_days_ago) &
        (games_df['WL'].isin(['W', 'L']))
    ]

    return completed['GAME_ID'].unique().tolist()

def main():
    print("-- GitHub Actions: Player Stats Sync", file=sys.stderr)
    print(f"-- Season: {SEASON}", file=sys.stderr)
    print(f"-- Started: {datetime.now().isoformat()}", file=sys.stderr)

    # Get recent game IDs
    print("-- Fetching recent game IDs...", file=sys.stderr)
    game_ids = fetch_recent_game_ids()

    if not game_ids:
        print("-- No recent games found", file=sys.stderr)
        print("-- SQL output empty (no player stats to sync)")
        sys.exit(0)

    print(f"-- Found {len(game_ids)} games to process", file=sys.stderr)

    # Output SQL header
    print("-- NBA Player Stats Sync SQL")
    print(f"-- Generated: {datetime.now().isoformat()}")
    print(f"-- Season: {SEASON}")
    print(f"-- Games: {len(game_ids)}")
    print("")
    print("BEGIN;")
    print("")

    # Delete existing stats for these games first
    game_ids_str = "', '".join(game_ids)
    print(f"-- Delete existing stats for games being synced")
    print(f"DELETE FROM player_game_stats WHERE game_id IN ('{game_ids_str}');")
    print("")

    total_players = 0

    # Process each game
    for idx, game_id in enumerate(game_ids, 1):
        print(f"-- Processing game {idx}/{len(game_ids)}: {game_id}", file=sys.stderr)

        box_score = fetch_box_score(game_id)
        if not box_score:
            continue

        # Parse player stats
        try:
            result_sets = box_score.get('resultSets', [])
            player_stats = None
            for rs in result_sets:
                if rs.get('name') == 'PlayerStats':
                    player_stats = rs
                    break

            if not player_stats:
                continue

            headers = player_stats['headers']
            rows = player_stats['rowSet']

            # Create index mapping
            col_idx = {h: i for i, h in enumerate(headers)}

            for row in rows:
                player_id = row[col_idx.get('PLAYER_ID', 0)]
                team_id = row[col_idx.get('TEAM_ID', 0)]
                minutes = parse_minutes(row[col_idx.get('MIN', 0)])
                points = row[col_idx.get('PTS', 0)] or 0
                rebounds = row[col_idx.get('REB', 0)] or 0
                assists = row[col_idx.get('AST', 0)] or 0
                steals = row[col_idx.get('STL', 0)] or 0
                blocks = row[col_idx.get('BLK', 0)] or 0
                turnovers = row[col_idx.get('TO', 0)] or 0
                fg_made = row[col_idx.get('FGM', 0)] or 0
                fg_attempted = row[col_idx.get('FGA', 0)] or 0
                fg_pct = row[col_idx.get('FG_PCT', 0)] or 0
                fg3_made = row[col_idx.get('FG3M', 0)] or 0
                fg3_attempted = row[col_idx.get('FG3A', 0)] or 0
                fg3_pct = row[col_idx.get('FG3_PCT', 0)] or 0
                ft_made = row[col_idx.get('FTM', 0)] or 0
                ft_attempted = row[col_idx.get('FTA', 0)] or 0
                ft_pct = row[col_idx.get('FT_PCT', 0)] or 0
                start_position = row[col_idx.get('START_POSITION', '')] or None

                # Handle NULL for start_position
                start_pos_sql = f"'{start_position}'" if start_position else 'NULL'

                print(f"""INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('{game_id}', {player_id}, {team_id}, {minutes}, {points}, {rebounds}, {assists}, {steals}, {blocks}, {turnovers}, {fg_made}, {fg_attempted}, {fg_pct}, {fg3_made}, {fg3_attempted}, {fg3_pct}, {ft_made}, {ft_attempted}, {ft_pct}, {start_pos_sql}, NOW());""")
                total_players += 1

        except Exception as e:
            print(f"-- WARNING: Error parsing game {game_id}: {e}", file=sys.stderr)
            continue

        # Rate limiting
        time.sleep(API_DELAY)

    print("")
    print("COMMIT;")
    print("")
    print(f"-- Processed {total_players} player records from {len(game_ids)} games")

    print(f"-- Completed: {datetime.now().isoformat()}", file=sys.stderr)
    print(f"-- Total players: {total_players}", file=sys.stderr)

if __name__ == '__main__':
    main()
