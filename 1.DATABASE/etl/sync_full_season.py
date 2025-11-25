#!/usr/bin/env python3
"""
Sync Full NBA Season
Comprehensive script to sync all games and box scores for 2024-25 season
"""

import os
import sys
import time
import psycopg2
import pandas as pd
from datetime import datetime, timedelta
from nba_api.stats.endpoints import leaguegamefinder, boxscoretraditionalv2
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

def sync_season_games(season='2024-25'):
    """Sync all games for the specified season"""
    print("=" * 80)
    print(f"🏀 SYNCING FULL {season} NBA SEASON")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        # Season date range
        # 2024-25 season: October 2024 - April 2025
        season_start = datetime(2024, 10, 1)
        season_end = datetime.now() + timedelta(days=7)  # Include upcoming week

        print(f"📅 Season date range: {season_start.date()} to {season_end.date()}")
        print(f"📡 Fetching all games from NBA API...\n")

        # Fetch all games for the season
        gamefinder = leaguegamefinder.LeagueGameFinder(
            season_nullable=season,
            league_id_nullable='00',
            season_type_nullable='Regular Season'
        )
        games_df = gamefinder.get_data_frames()[0]

        if games_df.empty:
            print(f"⚠️  No games found for {season} season")
            return False

        # Get unique games (API returns 2 rows per game, one per team)
        unique_games = games_df['GAME_ID'].nunique()
        print(f"✅ Found {unique_games} unique games for {season} season\n")

        # Connect to database
        print("🔌 Connecting to database...")
        conn = get_db_connection()
        cur = conn.cursor()
        print("✅ Connected\n")

        print("💾 Inserting games into database...")
        inserted = 0
        updated = 0
        processed_games = set()

        # Process each unique game
        for game_id in games_df['GAME_ID'].unique():
            if game_id in processed_games:
                continue

            # Get both team rows for this game
            game_rows = games_df[games_df['GAME_ID'] == game_id]

            if len(game_rows) != 2:
                continue

            # Determine home/away from MATCHUP column
            home_rows = game_rows[game_rows['MATCHUP'].str.contains('vs.', na=False)]
            away_rows = game_rows[game_rows['MATCHUP'].str.contains('@', na=False)]

            # Skip if we can't properly determine home/away or if teams are the same
            if len(home_rows) != 1 or len(away_rows) != 1:
                print(f"  ⚠️  Skipping {game_id}: Cannot determine home/away teams")
                processed_games.add(game_id)
                continue

            home_row = home_rows.iloc[0]
            away_row = away_rows.iloc[0]

            # Skip if home and away are the same team (data error)
            if int(home_row['TEAM_ID']) == int(away_row['TEAM_ID']):
                print(f"  ⚠️  Skipping {game_id}: Same team listed as home and away")
                processed_games.add(game_id)
                continue

            # Parse game date
            game_date = datetime.strptime(home_row['GAME_DATE'], '%Y-%m-%d').date()

            # Determine season from SEASON_ID
            season_id = str(home_row['SEASON_ID'])
            season_str = f"{season_id[1:5]}-{str(int(season_id[1:5]) + 1)[-2:]}"

            # Determine game status
            game_status = 'Final' if home_row['WL'] else 'Final'

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
                season_str,
                int(home_row['TEAM_ID']),
                int(away_row['TEAM_ID']),
                int(home_row['PTS']),
                int(away_row['PTS']),
                game_status
            ))

            result = cur.fetchone()
            if result and result[0]:
                inserted += 1
            else:
                updated += 1

            processed_games.add(game_id)

            # Progress indicator
            if len(processed_games) % 50 == 0:
                print(f"  Progress: {len(processed_games)}/{unique_games} games processed...")

        conn.commit()

        print(f"\n📊 Games Sync Summary:")
        print(f"  • Games inserted: {inserted}")
        print(f"  • Games updated: {updated}")
        print(f"  • Total unique games: {unique_games}")

        # Verify data
        cur.execute("SELECT COUNT(*) FROM games WHERE season = %s", (season,))
        count = cur.fetchone()[0]
        print(f"\n✅ Database verification: {count} games for {season} season")

        cur.close()
        conn.close()

        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

def collect_all_box_scores():
    """Collect box scores for all completed games without stats"""
    print("\n" + "=" * 80)
    print("📊 COLLECTING BOX SCORES FOR ALL COMPLETED GAMES")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get all completed games without box scores
        cur.execute("""
            SELECT DISTINCT g.game_id, g.game_date, ht.abbreviation, at.abbreviation
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            LEFT JOIN player_game_stats pgs ON g.game_id = pgs.game_id
            WHERE g.game_status = 'Final'
              AND pgs.id IS NULL
            ORDER BY g.game_date ASC
        """)

        games = cur.fetchall()
        cur.close()
        conn.close()

        if not games:
            print("⚠️  No games need box score collection")
            return True

        total_games = len(games)
        print(f"✅ Found {total_games} games needing box scores\n")
        print("⏱️  Estimated time: ~{:.1f} minutes (1 second per game)\n".format(total_games / 60))

        # Collect box scores
        total_players = 0
        games_processed = 0
        games_failed = 0

        for game_id, game_date, home_abbr, away_abbr in games:
            games_processed += 1
            print(f"[{games_processed}/{total_games}] 📊 {game_id}: {home_abbr} vs {away_abbr} ({game_date})")

            try:
                # Fetch box score
                box_score = boxscoretraditionalv2.BoxScoreTraditionalV2(game_id=game_id)
                player_stats = box_score.player_stats.get_data_frame()

                if player_stats.empty:
                    print(f"    ⚠️  No player stats available")
                    continue

                # Connect to database
                conn = get_db_connection()
                cur = conn.cursor()

                # Insert player stats
                inserted = 0

                for _, player in player_stats.iterrows():
                    # Insert player if doesn't exist
                    cur.execute("""
                        INSERT INTO players (player_id, full_name)
                        VALUES (%s, %s)
                        ON CONFLICT (player_id) DO UPDATE
                        SET full_name = EXCLUDED.full_name,
                            updated_at = CURRENT_TIMESTAMP
                    """, (
                        int(player['PLAYER_ID']),
                        player['PLAYER_NAME']
                    ))

                    # Parse minutes
                    minutes_str = str(player['MIN']) if player['MIN'] else "0:00"
                    minutes = 0
                    if ':' in minutes_str:
                        min_parts = minutes_str.split(':')
                        minutes = int(min_parts[0])

                    # Insert player stats
                    cur.execute("""
                        INSERT INTO player_game_stats
                        (game_id, player_id, team_id, minutes, points, rebounds, assists,
                         steals, blocks, turnovers, fg_made, fg_attempted, fg_pct,
                         fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (game_id, player_id) DO NOTHING
                    """, (
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
                    ))

                    if cur.rowcount > 0:
                        inserted += 1

                conn.commit()
                cur.close()
                conn.close()

                total_players += inserted
                print(f"    ✅ {inserted} players")

                # Rate limiting - respect NBA API
                time.sleep(1)

            except Exception as e:
                games_failed += 1
                print(f"    ❌ Error: {e}")
                continue

        # Final summary
        print(f"\n📊 Box Scores Collection Summary:")
        print(f"  • Games processed: {games_processed}")
        print(f"  • Games successful: {games_processed - games_failed}")
        print(f"  • Games failed: {games_failed}")
        print(f"  • Total player stats collected: {total_players}")
        print(f"  • Average players per game: {total_players / max(games_processed - games_failed, 1):.1f}")

        # Database verification
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM player_game_stats")
        total_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(DISTINCT player_id) FROM players")
        total_players_count = cur.fetchone()[0]
        cur.close()
        conn.close()

        print(f"\n✅ Database verification:")
        print(f"  • Total player game stats: {total_count}")
        print(f"  • Total unique players: {total_players_count}")

        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    start_time = datetime.now()

    print("\n" + "=" * 80)
    print("🚀 FULL SEASON DATA SYNC - 2024-25 NBA SEASON")
    print("=" * 80)
    print(f"Started at: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80 + "\n")

    # Step 1: Sync all games
    games_success = sync_season_games('2024-25')

    if not games_success:
        print("\n❌ Failed to sync games. Exiting.")
        sys.exit(1)

    # Step 2: Collect all box scores
    box_scores_success = collect_all_box_scores()

    end_time = datetime.now()
    duration = end_time - start_time

    print("\n" + "=" * 80)
    if games_success and box_scores_success:
        print("✅ FULL SEASON SYNC COMPLETED SUCCESSFULLY")
    else:
        print("⚠️  FULL SEASON SYNC COMPLETED WITH ERRORS")
    print("=" * 80)
    print(f"Total duration: {duration}")
    print(f"Completed at: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80 + "\n")

    sys.exit(0 if (games_success and box_scores_success) else 1)
