#!/usr/bin/env python3
"""
Sync 2025-26 NBA Season
Fetch all games and box scores for the new 2025-26 season
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

def sync_2025_26_games():
    """Sync all games for 2025-26 season up to current date"""
    print("=" * 80)
    print("🏀 SYNCING 2025-26 NBA SEASON GAMES")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Current date: {datetime.now().strftime('%B %d, %Y')}\n")

    try:
        # Season parameters
        season = '2025-26'
        season_start = datetime(2025, 10, 20)  # NBA season typically starts Oct 20-22
        current_date = datetime.now() + timedelta(days=7)  # Include upcoming games (7 days ahead)

        print(f"📅 Season: {season}")
        print(f"📅 Season start: {season_start.date()}")
        print(f"📅 Fetching games up to: {current_date.date()}")
        print(f"📡 Connecting to NBA API...\n")

        # Fetch games from NBA API
        print("⏳ Fetching games from NBA API (this may take 30-60 seconds)...")
        gamefinder = leaguegamefinder.LeagueGameFinder(
            season_nullable=season,
            league_id_nullable='00',  # NBA
            season_type_nullable='Regular Season'
        )

        games_df = gamefinder.get_data_frames()[0]

        if games_df.empty:
            print(f"⚠️  No games found for {season} season")
            print("   This is expected if the season hasn't started yet in the NBA API")
            return False

        # Filter games up to current date
        games_df['GAME_DATE'] = pd.to_datetime(games_df['GAME_DATE'])
        games_df = games_df[games_df['GAME_DATE'] <= current_date]

        # Get unique games
        unique_games = games_df['GAME_ID'].nunique()
        print(f"✅ Found {unique_games} unique games for first days of {season} season")
        print(f"   ({len(games_df)} total records - 2 per game)\n")

        if unique_games == 0:
            print("ℹ️  No games played yet in 2025-26 season")
            return True

        # Connect to database
        print("🔌 Connecting to database...")
        conn = get_db_connection()
        cur = conn.cursor()
        print("✅ Connected\n")

        print("💾 Inserting games into database...")
        inserted = 0
        updated = 0
        skipped = 0
        processed_games = set()

        # Process each unique game
        game_ids = games_df['GAME_ID'].unique()
        total_games = len(game_ids)

        for idx, game_id in enumerate(game_ids, 1):
            if game_id in processed_games:
                continue

            # Get both team rows for this game
            game_rows = games_df[games_df['GAME_ID'] == game_id]

            if len(game_rows) != 2:
                skipped += 1
                continue

            # Determine home/away from MATCHUP column
            home_rows = game_rows[game_rows['MATCHUP'].str.contains('vs.', na=False)]
            away_rows = game_rows[game_rows['MATCHUP'].str.contains('@', na=False)]

            if len(home_rows) != 1 or len(away_rows) != 1:
                print(f"   ⚠️  [{idx}/{total_games}] Skipping {game_id}: Cannot determine home/away")
                skipped += 1
                processed_games.add(game_id)
                continue

            home_row = home_rows.iloc[0]
            away_row = away_rows.iloc[0]

            # Skip if same team (data error)
            if int(home_row['TEAM_ID']) == int(away_row['TEAM_ID']):
                print(f"   ⚠️  [{idx}/{total_games}] Skipping {game_id}: Data error")
                skipped += 1
                processed_games.add(game_id)
                continue

            # Parse game date
            game_date = home_row['GAME_DATE'].date()

            # Get team names for display
            home_team = home_row['TEAM_ABBREVIATION']
            away_team = away_row['TEAM_ABBREVIATION']

            # Determine game status
            game_status = 'Final' if pd.notna(home_row['WL']) else 'Scheduled'

            # Insert/update game
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
                int(home_row['PTS']) if pd.notna(home_row['PTS']) else None,
                int(away_row['PTS']) if pd.notna(away_row['PTS']) else None,
                game_status
            ))

            result = cur.fetchone()
            if result and result[0]:
                inserted += 1
                status = "✅ Inserted"
            else:
                updated += 1
                status = "🔄 Updated"

            processed_games.add(game_id)

            # Show progress
            score_text = f"{int(home_row['PTS'])}-{int(away_row['PTS'])}" if pd.notna(home_row['PTS']) else "TBD"
            print(f"   [{idx}/{total_games}] {status}: {game_date} - {home_team} vs {away_team} ({score_text})")

        conn.commit()

        print(f"\n📊 Games Sync Summary:")
        print(f"   • Games inserted: {inserted}")
        print(f"   • Games updated: {updated}")
        print(f"   • Games skipped: {skipped}")
        print(f"   • Total unique games: {unique_games}")

        # Verify data in database
        cur.execute("""
            SELECT COUNT(*), MIN(game_date), MAX(game_date)
            FROM games
            WHERE season = %s
        """, (season,))
        count, min_date, max_date = cur.fetchone()

        print(f"\n✅ Database verification:")
        print(f"   • Total games for {season}: {count}")
        if count > 0:
            print(f"   • Date range: {min_date} to {max_date}")

        cur.close()
        conn.close()

        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

def collect_2025_26_box_scores():
    """Collect box scores for all completed 2025-26 games"""
    print("\n" + "=" * 80)
    print("📊 COLLECTING BOX SCORES FOR 2025-26 SEASON")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get completed games without box scores for 2025-26
        cur.execute("""
            SELECT DISTINCT g.game_id, g.game_date, ht.abbreviation, at.abbreviation,
                   g.home_team_score, g.away_team_score
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            LEFT JOIN player_game_stats pgs ON g.game_id = pgs.game_id
            WHERE g.season = '2025-26'
              AND g.game_status = 'Final'
              AND pgs.id IS NULL
            ORDER BY g.game_date ASC
        """)

        games = cur.fetchall()
        cur.close()
        conn.close()

        if not games:
            print("ℹ️  No completed games need box score collection for 2025-26")
            return True

        total_games = len(games)
        print(f"✅ Found {total_games} completed games needing box scores")
        print(f"⏱️  Estimated time: ~{total_games} seconds (1 second per game)\n")

        # Collect box scores
        total_players = 0
        games_processed = 0
        games_failed = 0

        for game_id, game_date, home_abbr, away_abbr, home_score, away_score in games:
            games_processed += 1
            print(f"[{games_processed}/{total_games}] 📊 {game_id}: {home_abbr} {home_score} - {away_score} {away_abbr} ({game_date})")

            try:
                # Fetch box score from NBA API
                box_score = boxscoretraditionalv2.BoxScoreTraditionalV2(game_id=game_id)
                player_stats = box_score.player_stats.get_data_frame()

                if player_stats.empty:
                    print(f"    ⚠️  No player stats available")
                    games_failed += 1
                    continue

                # Connect to database
                conn = get_db_connection()
                cur = conn.cursor()

                # Insert player stats
                players_inserted = 0

                for _, player in player_stats.iterrows():
                    # Insert/update player
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

                    # Parse minutes (handle various formats)
                    minutes_str = str(player['MIN']) if pd.notna(player['MIN']) else "0:00"
                    if minutes_str == 'None' or minutes_str == 'nan':
                        minutes = 0
                    elif ':' in minutes_str:
                        min_parts = minutes_str.split(':')
                        minutes = int(min_parts[0]) if min_parts[0].isdigit() else 0
                    else:
                        minutes = 0

                    # Insert player game stats
                    cur.execute("""
                        INSERT INTO player_game_stats
                        (game_id, player_id, team_id, minutes, points, rebounds, assists,
                         steals, blocks, turnovers, fg_made, fg_attempted, fg_pct,
                         fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (game_id, player_id) DO UPDATE
                        SET minutes = EXCLUDED.minutes,
                            points = EXCLUDED.points,
                            rebounds = EXCLUDED.rebounds,
                            assists = EXCLUDED.assists,
                            updated_at = CURRENT_TIMESTAMP
                    """, (
                        game_id,
                        int(player['PLAYER_ID']),
                        int(player['TEAM_ID']),
                        minutes,
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
                        players_inserted += 1

                conn.commit()
                cur.close()
                conn.close()

                total_players += players_inserted
                print(f"    ✅ {players_inserted} player stats collected")

                # Rate limiting - respect NBA API
                time.sleep(1)

            except Exception as e:
                games_failed += 1
                print(f"    ❌ Error: {e}")
                continue

        # Final summary
        print(f"\n📊 Box Scores Collection Summary:")
        print(f"   • Games processed: {games_processed}")
        print(f"   • Games successful: {games_processed - games_failed}")
        print(f"   • Games failed: {games_failed}")
        print(f"   • Total player stats collected: {total_players}")
        if games_processed - games_failed > 0:
            avg_players = total_players / (games_processed - games_failed)
            print(f"   • Average players per game: {avg_players:.1f}")

        # Database verification
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT COUNT(*)
            FROM player_game_stats pgs
            JOIN games g ON pgs.game_id = g.game_id
            WHERE g.season = '2025-26'
        """)
        total_stats = cur.fetchone()[0]

        cur.execute("""
            SELECT COUNT(DISTINCT pgs.player_id)
            FROM player_game_stats pgs
            JOIN games g ON pgs.game_id = g.game_id
            WHERE g.season = '2025-26'
        """)
        unique_players = cur.fetchone()[0]

        cur.close()
        conn.close()

        print(f"\n✅ Database verification for 2025-26:")
        print(f"   • Total player game stats: {total_stats}")
        print(f"   • Unique players in season: {unique_players}")

        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    start_time = datetime.now()

    print("\n" + "=" * 80)
    print("🚀 2025-26 NBA SEASON DATA SYNC")
    print("=" * 80)
    print(f"Started at: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80 + "\n")

    # Step 1: Sync games for 2025-26
    print("STEP 1: Fetching games for 2025-26 season")
    games_success = sync_2025_26_games()

    if not games_success:
        print("\n⚠️  Games sync completed with warnings. Proceeding to box scores...")

    # Step 2: Collect box scores
    print("\nSTEP 2: Collecting box scores for completed games")
    box_scores_success = collect_2025_26_box_scores()

    end_time = datetime.now()
    duration = end_time - start_time

    print("\n" + "=" * 80)
    if games_success and box_scores_success:
        print("✅ 2025-26 SEASON SYNC COMPLETED SUCCESSFULLY")
    else:
        print("⚠️  2025-26 SEASON SYNC COMPLETED WITH SOME ISSUES")
    print("=" * 80)
    print(f"Total duration: {duration}")
    print(f"Completed at: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("\nNext steps:")
    print("  1. Run analytics scripts to calculate team stats")
    print("  2. Update standings")
    print("  3. Refresh materialized views")
    print("=" * 80 + "\n")

    sys.exit(0 if (games_success and box_scores_success) else 1)