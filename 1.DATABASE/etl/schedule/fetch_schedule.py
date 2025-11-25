#!/usr/bin/env python3
"""
Fetch NBA Schedule
Fetch upcoming NBA games and insert them into the database
Uses ScoreboardV2 endpoint to get scheduled games
"""

import os
import sys
import psycopg2
from datetime import datetime, timedelta
from nba_api.stats.endpoints import scoreboardv2
from dotenv import load_dotenv
import time

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

def get_team_id_from_abbreviation(cur, abbreviation):
    """Get team_id from team abbreviation"""
    cur.execute(
        "SELECT team_id FROM teams WHERE abbreviation = %s",
        (abbreviation,)
    )
    result = cur.fetchone()
    return result[0] if result else None

def fetch_schedule_for_date(date):
    """Fetch NBA games for a specific date"""
    print(f"\n📅 Fetching games for {date.strftime('%Y-%m-%d')}...")

    try:
        # Format date for NBA API (MM/DD/YYYY for ScoreboardV2)
        game_date = date.strftime('%m/%d/%Y')

        # Fetch scoreboard for the date
        scoreboard = scoreboardv2.ScoreboardV2(game_date=game_date)
        games = scoreboard.get_dict()['resultSets']

        # Find GameHeader result set
        game_header = None
        for result_set in games:
            if result_set['name'] == 'GameHeader':
                game_header = result_set
                break

        if not game_header or not game_header['rowSet']:
            print(f"   ℹ️  No games scheduled for {game_date}")
            return []

        # Convert to list of dicts
        headers = game_header['headers']
        rows = game_header['rowSet']
        games_list = [dict(zip(headers, row)) for row in rows]

        print(f"   ✅ Found {len(games_list)} games")
        return games_list

    except Exception as e:
        print(f"   ❌ Error fetching schedule: {e}")
        import traceback
        traceback.print_exc()
        return []

def insert_game(cur, game):
    """Insert or update a game in the database"""
    try:
        # Get team IDs
        home_team_id = get_team_id_from_abbreviation(cur, game['HOME_TEAM_ABBREVIATION'])
        away_team_id = get_team_id_from_abbreviation(cur, game['VISITOR_TEAM_ABBREVIATION'])

        if not home_team_id or not away_team_id:
            print(f"      ⚠️  Unknown team: {game['VISITOR_TEAM_ABBREVIATION']} @ {game['HOME_TEAM_ABBREVIATION']}")
            return False

        # Convert game date to Python datetime
        game_date = datetime.strptime(game['GAME_DATE_EST'], '%Y-%m-%dT%H:%M:%S')

        # Determine season (Oct-June is same year-next year)
        if game_date.month >= 10:  # October or later
            season = f"{game_date.year}-{str(game_date.year + 1)[-2:]}"
        else:  # Before October
            season = f"{game_date.year - 1}-{str(game_date.year)[-2:]}"

        # Insert or update game
        cur.execute("""
            INSERT INTO games (
                game_id, season, game_date,
                home_team_id, away_team_id,
                home_team_score, away_team_score,
                game_status, arena_name
            ) VALUES (
                %s, %s, %s,
                %s, %s,
                %s, %s,
                %s, %s
            )
            ON CONFLICT (game_id) DO UPDATE SET
                game_date = EXCLUDED.game_date,
                home_team_score = EXCLUDED.home_team_score,
                away_team_score = EXCLUDED.away_team_score,
                game_status = EXCLUDED.game_status
        """, (
            game['GAME_ID'],
            season,
            game_date,
            home_team_id,
            away_team_id,
            game['HOME_TEAM_PTS'] if game['HOME_TEAM_PTS'] else None,
            game['VISITOR_TEAM_PTS'] if game['VISITOR_TEAM_PTS'] else None,
            game['GAME_STATUS_TEXT'],
            game['ARENA_NAME'] if 'ARENA_NAME' in game else None
        ))

        print(f"      ✅ {game['VISITOR_TEAM_ABBREVIATION']} @ {game['HOME_TEAM_ABBREVIATION']}")
        return True

    except Exception as e:
        print(f"      ❌ Error inserting game: {e}")
        return False

def main(days_ahead=7):
    """Fetch schedule for the next N days"""
    print("=" * 80)
    print("📅 NBA SCHEDULE FETCHER")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = get_db_connection()
        cur = conn.cursor()
        print("✅ Connected\n")

        total_games = 0

        # Fetch schedule for each day
        for day_offset in range(days_ahead + 1):
            target_date = datetime.now() + timedelta(days=day_offset)

            games_list = fetch_schedule_for_date(target_date)

            if games_list:
                for game in games_list:
                    if insert_game(cur, game):
                        total_games += 1

                conn.commit()

            # Rate limiting - wait between requests
            if day_offset < days_ahead:
                time.sleep(1)

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
        return False

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Fetch NBA schedule')
    parser.add_argument('--days', type=int, default=7, help='Number of days ahead to fetch (default: 7)')
    args = parser.parse_args()

    success = main(days_ahead=args.days)
    sys.exit(0 if success else 1)
