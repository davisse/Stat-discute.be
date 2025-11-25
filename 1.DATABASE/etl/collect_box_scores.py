#!/usr/bin/env python3
"""
Collect NBA Box Scores
POC Script - Collects box scores for completed games
"""

import os
import sys
import time
import psycopg2
import pandas as pd
from nba_api.stats.endpoints import boxscoretraditionalv2
from dotenv import load_dotenv
from datetime import datetime

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

def get_completed_games(limit=5):
    """Get game IDs for completed games without box scores"""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT DISTINCT g.game_id, g.game_date, ht.abbreviation, at.abbreviation
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        LEFT JOIN player_game_stats pgs ON g.game_id = pgs.game_id
        WHERE g.game_status = 'Final'
          AND pgs.id IS NULL
        ORDER BY g.game_date DESC
        LIMIT %s
    """, (limit,))

    games = cur.fetchall()

    cur.close()
    conn.close()

    return games

def collect_box_score(game_id, game_date, home_abbr, away_abbr):
    """Collect box score for a single game"""
    print(f"  📊 {game_id}: {home_abbr} vs {away_abbr} ({game_date})")

    try:
        # Fetch box score from NBA API
        box_score = boxscoretraditionalv2.BoxScoreTraditionalV2(game_id=game_id)
        player_stats = box_score.player_stats.get_data_frame()

        if player_stats.empty:
            print(f"    ⚠️  No player stats available")
            return 0

        # Connect to database
        conn = get_db_connection()
        cur = conn.cursor()

        # Insert player stats
        inserted = 0

        for _, player in player_stats.iterrows():
            # First, ensure player exists in players table
            cur.execute("""
                INSERT INTO players (player_id, full_name)
                VALUES (%s, %s)
                ON CONFLICT (player_id) DO UPDATE
                SET full_name = EXCLUDED.full_name,
                    updated_at = CURRENT_TIMESTAMP
            """, (
                player['PLAYER_ID'],
                player['PLAYER_NAME']
            ))

            # Convert minutes to integer (format: "MM:SS")
            minutes_str = str(player['MIN']) if player['MIN'] else "0:00"
            minutes = 0
            if ':' in minutes_str:
                min_parts = minutes_str.split(':')
                minutes = int(min_parts[0])

            # Prepare values for INSERT - convert to Python native types, handle NaN
            values = (
                game_id,
                int(player['PLAYER_ID']),
                int(player['TEAM_ID']),
                int(minutes),
                int(player['PTS']) if pd.notna(player['PTS']) else 0,
                int(player['REB']) if pd.notna(player['REB']) else 0,
                int(player['AST']) if pd.notna(player['AST']) else 0,
                int(player['STL']) if pd.notna(player['STL']) else 0,
                int(player['BLK']) if pd.notna(player['BLK']) else 0,
                int(player['TO']) if pd.notna(player['TO']) else 0,
                int(player['FGM']) if pd.notna(player['FGM']) else 0,
                int(player['FGA']) if pd.notna(player['FGA']) else 0,
                float(player['FG_PCT']) if pd.notna(player['FG_PCT']) else None,
                int(player['FG3M']) if pd.notna(player['FG3M']) else 0,
                int(player['FG3A']) if pd.notna(player['FG3A']) else 0,
                float(player['FG3_PCT']) if pd.notna(player['FG3_PCT']) else None,
                int(player['FTM']) if pd.notna(player['FTM']) else 0,
                int(player['FTA']) if pd.notna(player['FTA']) else 0,
                float(player['FT_PCT']) if pd.notna(player['FT_PCT']) else None
            )

            # Debug: Print ALL values for first player
            if inserted == 0:
                print(f"    DEBUG - All INSERT values:")
                for i, val in enumerate(values):
                    print(f"      [{i}] {val} (type: {type(val)})")

            cur.execute("""
                INSERT INTO player_game_stats
                (game_id, player_id, team_id, minutes, points, rebounds, assists,
                 steals, blocks, turnovers, fg_made, fg_attempted, fg_pct,
                 fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (game_id, player_id) DO NOTHING
            """, values)

            if cur.rowcount > 0:
                inserted += 1

        conn.commit()

        print(f"    ✅ Collected stats for {inserted} players")

        cur.close()
        conn.close()

        return inserted

    except Exception as e:
        print(f"    ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 0

def collect_box_scores(limit=5):
    """Collect box scores for all completed games"""
    print("=" * 70)
    print("🏀 NBA BOX SCORES COLLECTION")
    print("=" * 70)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        # Get games needing box scores
        print(f"🔍 Finding completed games without box scores (limit: {limit})...")
        games = get_completed_games(limit)

        if not games:
            print("⚠️  No completed games to process")
            print("=" * 70)
            return True

        print(f"✅ Found {len(games)} games to process\n")

        # Process each game
        total_players = 0

        for game_id, game_date, home_abbr, away_abbr in games:
            players = collect_box_score(game_id, game_date, home_abbr, away_abbr)
            total_players += players

            # Rate limiting - be respectful to NBA API
            time.sleep(1)

        print(f"\n📊 Summary:")
        print(f"  • Games processed: {len(games)}")
        print(f"  • Player stats collected: {total_players}")
        print(f"  • Average players per game: {total_players / len(games):.1f}")

        # Verify data
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT COUNT(*) FROM player_game_stats")
        total_count = cur.fetchone()[0]
        print(f"\n✅ Database verification: {total_count} total player game stats")

        cur.close()
        conn.close()

        print("\n" + "=" * 70)
        print("✅ BOX SCORES COLLECTION COMPLETED SUCCESSFULLY")
        print("=" * 70)
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        print("=" * 70)
        return False

if __name__ == '__main__':
    # You can pass a limit argument: python collect_box_scores.py 10
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    success = collect_box_scores(limit)
    sys.exit(0 if success else 1)
