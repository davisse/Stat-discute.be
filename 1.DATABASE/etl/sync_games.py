#!/usr/bin/env python3
"""
Sync NBA Games to Database
POC Script - Fetches today's games and updates database
"""

import os
import sys
import psycopg2
from datetime import datetime, timedelta
from nba_api.stats.endpoints import leaguegamefinder
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

def sync_games(target_date=None):
    """Fetch games for specified date and insert into database"""
    if target_date is None:
        # Use a date from the 2024-25 season that definitely has games
        target_date = '2025-01-15'

    print("=" * 70)
    print("🏀 NBA GAMES SYNC")
    print("=" * 70)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Target date: {target_date}")
    print(f"Note: Using recent games from 2024-25 season for POC\n")

    try:
        # Fetch games from NBA API using LeagueGameFinder
        print("📡 Fetching games from NBA API...")

        # Convert date string to datetime for date_to parameter
        date_obj = datetime.strptime(target_date, '%Y-%m-%d')
        date_to = date_obj.strftime('%m/%d/%Y')
        date_from = (date_obj - timedelta(days=7)).strftime('%m/%d/%Y')

        # Fetch games from the past week
        gamefinder = leaguegamefinder.LeagueGameFinder(
            date_from_nullable=date_from,
            date_to_nullable=date_to,
            league_id_nullable='00'  # NBA
        )
        games_df = gamefinder.get_data_frames()[0]

        if games_df.empty:
            print(f"⚠️  No games found for date range")
            print("=" * 70)
            return True

        # Group by GAME_ID to get unique games (API returns one row per team)
        games_df = games_df.drop_duplicates(subset=['GAME_ID'])

        print(f"✅ Found {len(games_df)} games\n")

        # Connect to database
        print("🔌 Connecting to database...")
        conn = get_db_connection()
        cur = conn.cursor()
        print("✅ Connected\n")

        # Insert games
        print("💾 Inserting games into database...")
        inserted = 0
        updated = 0

        # Get full game data (both teams per game) to reconstruct home/away
        gamefinder_full = leaguegamefinder.LeagueGameFinder(
            date_from_nullable=date_from,
            date_to_nullable=date_to,
            league_id_nullable='00'
        )
        full_games_df = gamefinder_full.get_data_frames()[0]

        # Process each unique game
        processed_games = set()
        for game_id in games_df['GAME_ID'].unique():
            if game_id in processed_games:
                continue

            # Get both team rows for this game
            game_rows = full_games_df[full_games_df['GAME_ID'] == game_id]

            if len(game_rows) != 2:
                print(f"  ⚠️  Skipping {game_id}: incomplete data")
                continue

            # Determine home/away from MATCHUP column (contains 'vs.' for home, '@' for away)
            home_row = game_rows[game_rows['MATCHUP'].str.contains('vs.')].iloc[0] if len(game_rows[game_rows['MATCHUP'].str.contains('vs.')]) > 0 else game_rows.iloc[0]
            away_row = game_rows[game_rows['MATCHUP'].str.contains('@')].iloc[0] if len(game_rows[game_rows['MATCHUP'].str.contains('@')]) > 0 else game_rows.iloc[1]

            # Parse game date
            game_date = datetime.strptime(home_row['GAME_DATE'], '%Y-%m-%d').date()

            # Determine season from SEASON_ID (format: 22024 = 2024-25 season)
            season_id = str(home_row['SEASON_ID'])
            season = f"{season_id[1:5]}-{str(int(season_id[1:5]) + 1)[-2:]}"

            cur.execute("""
                INSERT INTO games (game_id, game_date, season, home_team_id, away_team_id,
                                   home_team_score, away_team_score, game_status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (game_id) DO UPDATE
                SET home_team_score = EXCLUDED.home_team_score,
                    away_team_score = EXCLUDED.away_team_score,
                    game_status = EXCLUDED.game_status,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING (xmax = 0) AS inserted
            """, (
                game_id,
                game_date,
                season,
                int(home_row['TEAM_ID']),
                int(away_row['TEAM_ID']),
                int(home_row['PTS']),
                int(away_row['PTS']),
                'Final'
            ))

            result = cur.fetchone()
            if result and result[0]:
                inserted += 1
            else:
                updated += 1

            # Get team names
            cur.execute("""
                SELECT ht.abbreviation, at.abbreviation
                FROM teams ht, teams at
                WHERE ht.team_id = %s AND at.team_id = %s
            """, (int(home_row['TEAM_ID']), int(away_row['TEAM_ID'])))

            home_abbr, away_abbr = cur.fetchone()
            print(f"  ✓ {game_id}: {home_abbr} vs {away_abbr} - {int(home_row['PTS'])}-{int(away_row['PTS'])}")

            processed_games.add(game_id)

        conn.commit()

        print(f"\n📊 Summary:")
        print(f"  • Games inserted: {inserted}")
        print(f"  • Games updated: {updated}")
        print(f"  • Total games: {len(games_df)}")

        # Verify data
        cur.execute("SELECT COUNT(*) FROM games WHERE game_date BETWEEN %s AND %s",
                   (date_from, date_to))
        count = cur.fetchone()[0]
        print(f"\n✅ Database verification: {count} games in database")

        cur.close()
        conn.close()

        print("\n" + "=" * 70)
        print("✅ GAMES SYNC COMPLETED SUCCESSFULLY")
        print("=" * 70)
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        print("=" * 70)
        return False

if __name__ == '__main__':
    # You can pass a date argument: python sync_games.py 2025-01-20
    target_date = sys.argv[1] if len(sys.argv) > 1 else None
    success = sync_games(target_date)
    sys.exit(0 if success else 1)
