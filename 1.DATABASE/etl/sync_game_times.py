#!/usr/bin/env python3
"""
Sync Game Times from NBA ScoreboardV2 API
Fetches actual game start times and updates the games table
"""

import os
import sys
import re
import psycopg2
from datetime import datetime, timedelta
from nba_api.stats.endpoints import scoreboardv2
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'config', '.env'))


def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )


def parse_game_time_et(time_str: str) -> tuple:
    """
    Parse time string from NBA API (e.g., "7:00 pm ET", "10:30 pm ET")
    Returns (hour, minute) in 24-hour format
    """
    if not time_str:
        return None, None

    # Match pattern like "7:00 pm ET" or "10:30 am ET"
    match = re.match(r'(\d{1,2}):(\d{2})\s*(am|pm)\s*ET', time_str, re.IGNORECASE)
    if not match:
        # Check for "Final" or other status
        if 'Final' in time_str or 'Q' in time_str or 'Half' in time_str:
            return None, None
        return None, None

    hour = int(match.group(1))
    minute = int(match.group(2))
    period = match.group(3).lower()

    # Convert to 24-hour format
    if period == 'pm' and hour != 12:
        hour += 12
    elif period == 'am' and hour == 12:
        hour = 0

    return hour, minute


def et_to_utc(hour: int, minute: int) -> tuple:
    """
    Convert Eastern Time to UTC
    ET is UTC-5 (or UTC-4 during DST)
    For simplicity, using UTC-5 (standard time offset)
    """
    if hour is None or minute is None:
        return None, None

    # Add 5 hours to convert ET to UTC
    utc_hour = (hour + 5) % 24
    return utc_hour, minute


def sync_game_times_for_date(game_date: str):
    """
    Sync game times for a specific date
    Args:
        game_date: Date string in format 'YYYY-MM-DD'
    """
    # Convert to NBA API format (MM/DD/YYYY)
    date_obj = datetime.strptime(game_date, '%Y-%m-%d')
    nba_date = date_obj.strftime('%m/%d/%Y')

    print(f"  Fetching scoreboard for {game_date} ({nba_date})...")

    try:
        scoreboard = scoreboardv2.ScoreboardV2(game_date=nba_date)
        games = scoreboard.game_header.get_data_frame()

        if games.empty:
            print(f"  No games found for {game_date}")
            return 0, 0

        conn = get_db_connection()
        cur = conn.cursor()

        updated = 0
        skipped = 0

        for _, game in games.iterrows():
            game_id = game['GAME_ID']
            time_et = game['GAME_STATUS_TEXT']
            arena = game['ARENA_NAME']

            # Parse time
            hour, minute = parse_game_time_et(time_et)

            if hour is not None:
                # Convert to UTC for storage
                utc_hour, utc_minute = et_to_utc(hour, minute)
                game_time_utc = f"{utc_hour:02d}:{utc_minute:02d}:00"

                # Update game
                cur.execute("""
                    UPDATE games
                    SET game_time = %s,
                        game_time_et = %s,
                        arena = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE game_id = %s
                """, (game_time_utc, time_et, arena, game_id))

                if cur.rowcount > 0:
                    updated += 1
                    # Extract teams from gamecode
                    gamecode = game.get('GAMECODE', '')
                    teams = gamecode.split('/')[1] if '/' in gamecode else 'Unknown'
                    print(f"    {game_id} ({teams}): {time_et} -> {game_time_utc} UTC @ {arena}")
                else:
                    skipped += 1
            else:
                skipped += 1

        conn.commit()
        cur.close()
        conn.close()

        return updated, skipped

    except Exception as e:
        print(f"  Error fetching scoreboard: {e}")
        return 0, 0


def sync_all_game_times(days_back: int = 7, days_forward: int = 7):
    """
    Sync game times for a range of dates
    Args:
        days_back: Number of days in the past to sync
        days_forward: Number of days in the future to sync
    """
    print("=" * 70)
    print("SYNCING GAME TIMES FROM NBA SCOREBOARD API")
    print("=" * 70)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Range: {days_back} days back, {days_forward} days forward\n")

    today = datetime.now()
    start_date = today - timedelta(days=days_back)
    end_date = today + timedelta(days=days_forward)

    total_updated = 0
    total_skipped = 0

    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')
        updated, skipped = sync_game_times_for_date(date_str)
        total_updated += updated
        total_skipped += skipped
        current_date += timedelta(days=1)

    print(f"\n{'=' * 70}")
    print("SUMMARY")
    print(f"{'=' * 70}")
    print(f"Total games updated: {total_updated}")
    print(f"Total games skipped: {total_skipped}")
    print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


def sync_today_game_times():
    """Quick sync for today's games only"""
    print("Syncing today's game times...")
    today = datetime.now().strftime('%Y-%m-%d')
    updated, skipped = sync_game_times_for_date(today)
    print(f"Updated: {updated}, Skipped: {skipped}")
    return updated


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Sync NBA game times')
    parser.add_argument('--today', action='store_true', help='Sync only today\'s games')
    parser.add_argument('--date', type=str, help='Sync specific date (YYYY-MM-DD)')
    parser.add_argument('--days-back', type=int, default=7, help='Days in the past to sync')
    parser.add_argument('--days-forward', type=int, default=7, help='Days in the future to sync')

    args = parser.parse_args()

    if args.today:
        sync_today_game_times()
    elif args.date:
        updated, skipped = sync_game_times_for_date(args.date)
        print(f"Updated: {updated}, Skipped: {skipped}")
    else:
        sync_all_game_times(args.days_back, args.days_forward)
