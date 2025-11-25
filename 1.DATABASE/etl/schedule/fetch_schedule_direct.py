#!/usr/bin/env python3
"""
Fetch NBA Schedule - Direct API Version
Fetch upcoming NBA games using direct HTTP requests to avoid nba_api bugs
"""

import os
import sys
import psycopg2
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))

# NBA API headers (required to avoid 403)
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Accept': '*/*'
}

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )

def get_team_id_from_abbreviation(cur, abbreviation):
    """Get team_id from team abbreviation"""
    cur.execute(
        "SELECT team_id FROM teams WHERE abbreviation = %s",
        (abbreviation,)
    )
    result = cur.fetchone()
    return result[0] if result else None

def fetch_schedule_for_date(date):
    """Fetch NBA games for a specific date using direct HTTP request"""
    print(f"\n📅 Fetching games for {date.strftime('%Y-%m-%d')}...")

    try:
        # Format date for NBA API (YYYY-MM-DD)
        game_date = date.strftime('%Y-%m-%d')

        # Direct NBA API endpoint
        url = f"https://stats.nba.com/stats/scoreboardV2?GameDate={game_date}&LeagueID=00&DayOffset=0"

        # Make request
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()

        data = response.json()

        # Extract GameHeader result set
        result_sets = data.get('resultSets', [])
        game_header = None

        for result_set in result_sets:
            if result_set.get('name') == 'GameHeader':
                game_header = result_set
                break

        if not game_header or not game_header.get('rowSet'):
            print(f"   ℹ️  No games scheduled for {game_date}")
            return []

        # Convert to list of dicts
        headers = game_header['headers']
        rows = game_header['rowSet']
        games_list = [dict(zip(headers, row)) for row in rows]

        print(f"   ✅ Found {len(games_list)} games")
        return games_list

    except requests.exceptions.RequestException as e:
        print(f"   ❌ HTTP Error: {e}")
        return []
    except Exception as e:
        print(f"   ❌ Error fetching schedule: {e}")
        import traceback
        traceback.print_exc()
        return []

def insert_game(cur, game, debug=False):
    """Insert or update a game in the database"""
    try:
        # Debug: print available keys (only for first game)
        if debug:
            print(f"      DEBUG: Available keys: {list(game.keys())}")
            print(f"      DEBUG: Sample game data: {game}")

        # Extract team abbreviations from GAMECODE
        # Format: "YYYYMMDD/AWAYTEAMHOMETEAM" (e.g., "20251119/HOUCLE")
        gamecode = game.get('GAMECODE', '')
        if '/' in gamecode:
            teams_part = gamecode.split('/')[1]  # Get "HOUCLE"
            if len(teams_part) >= 6:
                away_abbr = teams_part[:3]  # First 3 letters: "HOU"
                home_abbr = teams_part[3:6]  # Next 3 letters: "CLE"
            else:
                away_abbr = None
                home_abbr = None
        else:
            away_abbr = None
            home_abbr = None

        if not home_abbr or not away_abbr:
            if debug:
                print(f"      DEBUG: gamecode={gamecode}, home_abbr={home_abbr}, away_abbr={away_abbr}")
            print(f"      ⚠️  Cannot extract team abbreviations from GAMECODE")
            return False

        home_team_id = get_team_id_from_abbreviation(cur, home_abbr)
        away_team_id = get_team_id_from_abbreviation(cur, away_abbr)

        if not home_team_id or not away_team_id:
            print(f"      ⚠️  Unknown team: {away_abbr} @ {home_abbr}")
            return False

        # Parse game date
        game_date_str = game.get('GAME_DATE_EST')
        if not game_date_str:
            print(f"      ⚠️  Missing game date")
            return False

        # Convert to datetime
        game_date = datetime.strptime(game_date_str, '%Y-%m-%dT%H:%M:%S')

        # Determine season
        if game_date.month >= 10:
            season = f"{game_date.year}-{str(game_date.year + 1)[-2:]}"
        else:
            season = f"{game_date.year - 1}-{str(game_date.year)[-2:]}"

        # Get game status and scores
        game_status = game.get('GAME_STATUS_TEXT', 'Scheduled')
        home_score = game.get('HOME_TEAM_PTS')
        away_score = game.get('VISITOR_TEAM_PTS')

        # Insert or update game
        cur.execute("""
            INSERT INTO games (
                game_id, season, game_date,
                home_team_id, away_team_id,
                home_team_score, away_team_score,
                game_status
            ) VALUES (
                %s, %s, %s,
                %s, %s,
                %s, %s,
                %s
            )
            ON CONFLICT (game_id) DO UPDATE SET
                game_date = EXCLUDED.game_date,
                home_team_score = EXCLUDED.home_team_score,
                away_team_score = EXCLUDED.away_team_score,
                game_status = EXCLUDED.game_status
        """, (
            game.get('GAME_ID'),
            season,
            game_date,
            home_team_id,
            away_team_id,
            home_score if home_score else None,
            away_score if away_score else None,
            game_status
        ))

        print(f"      ✅ {away_abbr} @ {home_abbr} ({game_status})")
        return True

    except Exception as e:
        print(f"      ❌ Error inserting game: {e}")
        import traceback
        traceback.print_exc()
        return False

def main(days_ahead=7):
    """Fetch schedule for the next N days"""
    print("=" * 80)
    print("📅 NBA SCHEDULE FETCHER (Direct API)")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = get_db_connection()
        cur = conn.cursor()
        print("✅ Connected\n")

        total_games = 0
        first_game = True

        # Fetch schedule for each day
        for day_offset in range(days_ahead + 1):
            target_date = datetime.now() + timedelta(days=day_offset)

            games_list = fetch_schedule_for_date(target_date)

            if games_list:
                for game in games_list:
                    # Debug first game only
                    debug = first_game
                    if insert_game(cur, game, debug=debug):
                        total_games += 1
                    first_game = False

                conn.commit()

            # Rate limiting - wait between requests
            if day_offset < days_ahead:
                time.sleep(2)  # 2 seconds between requests

        # Summary
        print("\n" + "=" * 80)
        print("📊 SCHEDULE FETCH SUMMARY")
        print("=" * 80)
        print(f"   • Total games inserted/updated: {total_games}")
        print(f"   • Days fetched: {days_ahead + 1}")
        print("=" * 80)

        cur.close()
        conn.close()

        return True

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Fetch NBA schedule using direct API')
    parser.add_argument('--days', type=int, default=7, help='Number of days ahead to fetch (default: 7)')
    args = parser.parse_args()

    success = main(days_ahead=args.days)
    sys.exit(0 if success else 1)
