#!/usr/bin/env python3
"""
Debug Box Score Collection
Test fetching box scores for 2025-26 season games
"""

import os
import sys
import psycopg2
from datetime import datetime
from nba_api.stats.endpoints import boxscoretraditionalv2, boxscoresummaryv2
from dotenv import load_dotenv
import time

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

def test_single_game_box_score(game_id):
    """Test fetching box score for a single game"""
    print(f"\n{'='*60}")
    print(f"Testing game: {game_id}")
    print(f"{'='*60}")

    try:
        # Method 1: Try BoxScoreTraditionalV2
        print("\n1. Testing BoxScoreTraditionalV2...")
        box_score = boxscoretraditionalv2.BoxScoreTraditionalV2(game_id=game_id)
        player_stats = box_score.player_stats.get_data_frame()

        if not player_stats.empty:
            print(f"   ✅ Found {len(player_stats)} player stats!")
            print(f"   Sample players:")
            for idx, player in player_stats.head(3).iterrows():
                print(f"      - {player['PLAYER_NAME']}: {player['PTS']} pts, {player['REB']} reb, {player['AST']} ast")
            return True
        else:
            print(f"   ⚠️  No player stats returned")

    except Exception as e:
        print(f"   ❌ Error with BoxScoreTraditionalV2: {e}")

    try:
        # Method 2: Try BoxScoreSummaryV2 for diagnostics
        print("\n2. Testing BoxScoreSummaryV2...")
        summary = boxscoresummaryv2.BoxScoreSummaryV2(game_id=game_id)
        game_summary = summary.game_summary.get_data_frame()

        if not game_summary.empty:
            print(f"   ✅ Game summary found:")
            print(f"      Game Status: {game_summary['GAME_STATUS_TEXT'].iloc[0]}")
            print(f"      Game Date: {game_summary['GAME_DATE'].iloc[0]}")

            # Check line score
            line_score = summary.line_score.get_data_frame()
            if not line_score.empty:
                print(f"   ✅ Line score available:")
                for idx, team in line_score.iterrows():
                    print(f"      {team['TEAM_ABBREVIATION']}: {team['PTS']} points")
        else:
            print(f"   ⚠️  No game summary returned")

    except Exception as e:
        print(f"   ❌ Error with BoxScoreSummaryV2: {e}")

    return False

def debug_box_scores():
    """Debug box score collection for 2025-26 games"""
    print("=" * 80)
    print("🔍 DEBUGGING BOX SCORE COLLECTION FOR 2025-26")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        # Get games from database
        conn = get_db_connection()
        cur = conn.cursor()

        # Get a few 2025-26 games to test
        cur.execute("""
            SELECT g.game_id, g.game_date, ht.abbreviation, g.home_team_score,
                   at.abbreviation, g.away_team_score
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE g.season = '2025-26' AND g.game_status = 'Final'
            ORDER BY g.game_date
            LIMIT 3
        """)

        games = cur.fetchall()
        cur.close()
        conn.close()

        if not games:
            print("❌ No completed games found for 2025-26")
            return

        print(f"Found {len(games)} games to test:\n")
        for game_id, game_date, home, home_score, away, away_score in games:
            print(f"• {game_id}: {home} {home_score} - {away_score} {away} ({game_date})")

        # Test each game
        successful = 0
        for game_id, game_date, home, home_score, away, away_score in games:
            if test_single_game_box_score(game_id):
                successful += 1

            # Rate limit
            time.sleep(1)

        print(f"\n{'='*60}")
        print(f"Summary: {successful}/{len(games)} games had box scores available")

        if successful == 0:
            print("\n⚠️  DIAGNOSIS:")
            print("• Box scores may not be immediately available for brand new games")
            print("• NBA API might have a delay in processing new season data")
            print("• Try using alternative endpoints or wait for data availability")

            print("\n💡 SUGGESTIONS:")
            print("1. Try fetching data from a different endpoint")
            print("2. Check if there's a different season format needed")
            print("3. Wait a few hours for NBA API to update")
            print("4. Use web scraping as a fallback option")

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_box_scores()