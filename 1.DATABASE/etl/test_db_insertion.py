#!/usr/bin/env python3
"""
Test script to verify database insertion works correctly.
Uses saved HTML file for testing without hitting the live website.

Usage:
    python3 test_db_insertion.py [--html-file /path/to/html]
"""

import sys
import os
import argparse
from datetime import date

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scrape_rotowire_lineups import RotoWireLineupsScraper, DB_CONFIG


def main():
    parser = argparse.ArgumentParser(description='Test RotoWire scraper database insertion')
    parser.add_argument('--html-file', default='/tmp/rotowire.html',
                        help='Path to saved HTML file (default: /tmp/rotowire.html)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Parse but do not insert into database')
    args = parser.parse_args()

    # Check if HTML file exists
    if not os.path.exists(args.html_file):
        print(f"❌ HTML file not found: {args.html_file}")
        print("\nTo generate test HTML, run:")
        print(f'  curl -s -H "User-Agent: Mozilla/5.0" https://www.rotowire.com/basketball/nba-lineups.php > {args.html_file}')
        sys.exit(1)

    print("=" * 80)
    print("  RotoWire Scraper - Database Insertion Test")
    print("=" * 80)
    print(f"\nHTML file: {args.html_file}")
    print(f"Dry run: {args.dry_run}")
    print(f"Database: {DB_CONFIG['database']}@{DB_CONFIG['host']}")
    print()

    # Initialize scraper
    scraper = RotoWireLineupsScraper(DB_CONFIG)

    # Read HTML file
    print("📄 Reading HTML file...")
    try:
        with open(args.html_file, 'r', encoding='utf-8') as f:
            html = f.read()
        print(f"   ✅ Read {len(html):,} characters")
    except Exception as e:
        print(f"   ❌ Error reading file: {e}")
        sys.exit(1)

    # Parse HTML (using scraper's internal methods)
    print("\n📊 Parsing HTML...")
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')

    # Use scraper's parse_game_date method
    game_date = scraper.parse_game_date(html)
    print(f"   Game date: {game_date}")

    # Find lineup containers
    lineup_divs = soup.find_all('div', class_=lambda x: x and 'lineup' in x.split() and 'is-nba' in x.split())
    print(f"   ✅ Found {len(lineup_divs)} games")

    if not lineup_divs:
        print("\n❌ No games found in HTML. Cannot test database insertion.")
        sys.exit(1)

    # Parse games
    games = []
    for i, lineup_div in enumerate(lineup_divs, 1):
        try:
            game_data = scraper._parse_game(lineup_div, game_date)
            if game_data and game_data.get('home_team'):
                games.append(game_data)
                print(f"   [{i}] {game_data['away_team']} @ {game_data['home_team']} - {game_data['game_time']}")
        except Exception as e:
            print(f"   ⚠️  [{i}] Error parsing game: {e}")

    print(f"\n✅ Successfully parsed {len(games)} games")

    if args.dry_run:
        print("\n🔍 DRY RUN - Skipping database insertion")
        print(f"\n📋 Sample game data (first game):")
        if games:
            import json
            print(json.dumps(games[0], indent=2, default=str))
        return

    # Connect to database
    print("\n💾 Connecting to database...")
    try:
        scraper.connect_db()
    except Exception as e:
        print(f"   ❌ Database connection failed: {e}")
        sys.exit(1)

    # Insert games
    print("\n💾 Inserting games into database...")
    inserted_count = 0
    skipped_count = 0
    failed_count = 0

    for i, game_data in enumerate(games, 1):
        try:
            result = scraper.save_game(game_data)
            if result:
                scraper.conn.commit()
                inserted_count += 1
                print(f"   ✅ [{i}] {game_data['away_team']} @ {game_data['home_team']} - Inserted")
            else:
                scraper.conn.rollback()
                skipped_count += 1
                print(f"   ⚠️  [{i}] {game_data['away_team']} @ {game_data['home_team']} - Skipped (duplicate)")
        except Exception as e:
            scraper.conn.rollback()
            failed_count += 1
            print(f"   ❌ [{i}] {game_data['away_team']} @ {game_data['home_team']} - Error: {e}")

    scraper.close_db()

    # Summary
    print("\n" + "=" * 80)
    print("  TEST SUMMARY")
    print("=" * 80)
    print(f"  Games parsed:    {len(games)}")
    print(f"  Games inserted:  {inserted_count}")
    print(f"  Games skipped:   {skipped_count}")
    print(f"  Games failed:    {failed_count}")
    print(f"  Success rate:    {((inserted_count + skipped_count) / len(games) * 100) if games else 0:.1f}%")
    print("=" * 80)

    if inserted_count > 0:
        print("\n✅ Database insertion test PASSED")
        print("\nVerify data with:")
        print(f"  psql {DB_CONFIG['database']} -c \"SELECT * FROM v_latest_daily_lineups WHERE game_date = '{game_date}';\"")
    elif skipped_count > 0:
        print("\n⚠️  All games already exist in database (duplicates skipped)")
        print("\nVerify existing data with:")
        print(f"  psql {DB_CONFIG['database']} -c \"SELECT * FROM v_latest_daily_lineups WHERE game_date = '{game_date}';\"")
    else:
        print("\n❌ Database insertion test FAILED - No games were inserted or skipped")


if __name__ == '__main__':
    main()
