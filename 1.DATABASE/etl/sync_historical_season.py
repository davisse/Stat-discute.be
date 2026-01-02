#!/usr/bin/env python3
"""
Sync Historical NBA Season Data
Generic script to fetch games and box scores for any NBA season.
Used for backfilling historical data (2014-15 through 2023-24).

Usage:
    python3 sync_historical_season.py 2023-24
    python3 sync_historical_season.py 2019-20 --skip-box-scores
"""

import os
import sys
import time
import json
import psycopg2
import pandas as pd
from datetime import datetime, timedelta
from nba_api.stats.endpoints import leaguegamefinder, boxscoretraditionalv2
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'config', '.env'))

# Rate limiting settings
DELAY_BETWEEN_API_CALLS = 0.6  # seconds
DELAY_BETWEEN_BOX_SCORES = 0.8  # seconds

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )

def ensure_season_exists(conn, season: str):
    """Ensure season record exists in seasons table"""
    cur = conn.cursor()

    # Parse season year (e.g., "2023-24" -> 2023)
    season_year = int(season.split('-')[0])

    # Calculate typical start/end dates
    start_date = datetime(season_year, 10, 1)
    end_date = datetime(season_year + 1, 6, 30)

    cur.execute("""
        INSERT INTO seasons (season_id, season_year, season_type, start_date, end_date, is_current)
        VALUES (%s, %s, 'Regular Season', %s, %s, false)
        ON CONFLICT (season_id) DO NOTHING
    """, (season, season_year, start_date, end_date))

    conn.commit()
    cur.close()
    print(f"✅ Season {season} record ensured in database")

def sync_season_games(season: str) -> dict:
    """Sync all games for a specific season"""
    print(f"\n{'='*80}")
    print(f"🏀 SYNCING {season} NBA SEASON GAMES")
    print(f"{'='*80}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    stats = {
        'season': season,
        'games_found': 0,
        'games_inserted': 0,
        'games_updated': 0,
        'games_skipped': 0,
        'errors': []
    }

    try:
        print(f"📡 Fetching games from NBA API for {season}...")

        gamefinder = leaguegamefinder.LeagueGameFinder(
            season_nullable=season,
            league_id_nullable='00',  # NBA
            season_type_nullable='Regular Season'
        )

        time.sleep(DELAY_BETWEEN_API_CALLS)

        games_df = gamefinder.get_data_frames()[0]

        if games_df.empty:
            print(f"⚠️  No games found for {season} season")
            return stats

        # Get unique games
        unique_games = games_df['GAME_ID'].nunique()
        stats['games_found'] = unique_games
        print(f"✅ Found {unique_games} unique games for {season} season")
        print(f"   ({len(games_df)} total records - 2 per game)\n")

        # Connect to database
        conn = get_db_connection()

        # Ensure season exists
        ensure_season_exists(conn, season)

        cur = conn.cursor()

        print("💾 Inserting games into database...")
        processed_games = set()
        game_ids = games_df['GAME_ID'].unique()
        total_games = len(game_ids)

        for idx, game_id in enumerate(game_ids, 1):
            if game_id in processed_games:
                continue

            game_rows = games_df[games_df['GAME_ID'] == game_id]

            if len(game_rows) != 2:
                stats['games_skipped'] += 1
                continue

            # Determine home/away
            home_rows = game_rows[game_rows['MATCHUP'].str.contains('vs.', na=False)]
            away_rows = game_rows[game_rows['MATCHUP'].str.contains('@', na=False)]

            if len(home_rows) != 1 or len(away_rows) != 1:
                stats['games_skipped'] += 1
                processed_games.add(game_id)
                continue

            home_row = home_rows.iloc[0]
            away_row = away_rows.iloc[0]

            if int(home_row['TEAM_ID']) == int(away_row['TEAM_ID']):
                stats['games_skipped'] += 1
                processed_games.add(game_id)
                continue

            game_date = pd.to_datetime(home_row['GAME_DATE']).date()
            game_status = 'Final' if pd.notna(home_row['WL']) else 'Scheduled'

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
                stats['games_inserted'] += 1
            else:
                stats['games_updated'] += 1

            processed_games.add(game_id)

            # Progress update every 100 games
            if idx % 100 == 0:
                conn.commit()
                print(f"   [{idx}/{total_games}] Progress: {stats['games_inserted']} inserted, {stats['games_updated']} updated")

        conn.commit()
        cur.close()
        conn.close()

        print(f"\n📊 Games Sync Summary for {season}:")
        print(f"   • Games found: {stats['games_found']}")
        print(f"   • Games inserted: {stats['games_inserted']}")
        print(f"   • Games updated: {stats['games_updated']}")
        print(f"   • Games skipped: {stats['games_skipped']}")

        return stats

    except Exception as e:
        stats['errors'].append(str(e))
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return stats

def collect_season_box_scores(season: str) -> dict:
    """Collect box scores for all completed games in a season"""
    print(f"\n{'='*80}")
    print(f"📊 COLLECTING BOX SCORES FOR {season} SEASON")
    print(f"{'='*80}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    stats = {
        'season': season,
        'games_needing_stats': 0,
        'games_processed': 0,
        'games_successful': 0,
        'games_failed': 0,
        'total_player_stats': 0,
        'errors': []
    }

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get completed games without box scores
        cur.execute("""
            SELECT DISTINCT g.game_id, g.game_date, ht.abbreviation, at.abbreviation,
                   g.home_team_score, g.away_team_score
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            LEFT JOIN player_game_stats pgs ON g.game_id = pgs.game_id
            WHERE g.season = %s
              AND g.game_status = 'Final'
              AND pgs.id IS NULL
            ORDER BY g.game_date ASC
        """, (season,))

        games = cur.fetchall()
        cur.close()
        conn.close()

        stats['games_needing_stats'] = len(games)

        if not games:
            print(f"ℹ️  No games need box score collection for {season}")
            return stats

        print(f"✅ Found {len(games)} games needing box scores")
        estimated_time = len(games) * DELAY_BETWEEN_BOX_SCORES / 60
        print(f"⏱️  Estimated time: ~{estimated_time:.1f} minutes\n")

        for game_id, game_date, home_abbr, away_abbr, home_score, away_score in games:
            stats['games_processed'] += 1

            if stats['games_processed'] % 50 == 1:
                print(f"[{stats['games_processed']}/{len(games)}] Processing {game_id}: {away_abbr} @ {home_abbr} ({game_date})")

            try:
                box_score = boxscoretraditionalv2.BoxScoreTraditionalV2(game_id=game_id)
                player_stats = box_score.player_stats.get_data_frame()

                time.sleep(DELAY_BETWEEN_BOX_SCORES)

                if player_stats.empty:
                    stats['games_failed'] += 1
                    continue

                conn = get_db_connection()
                cur = conn.cursor()

                players_inserted = 0
                for _, player in player_stats.iterrows():
                    # Insert/update player
                    cur.execute("""
                        INSERT INTO players (player_id, full_name)
                        VALUES (%s, %s)
                        ON CONFLICT (player_id) DO UPDATE
                        SET full_name = EXCLUDED.full_name,
                            updated_at = CURRENT_TIMESTAMP
                    """, (int(player['PLAYER_ID']), player['PLAYER_NAME']))

                    # Parse minutes
                    minutes_str = str(player['MIN']) if pd.notna(player['MIN']) else "0:00"
                    if minutes_str in ('None', 'nan', ''):
                        minutes = 0
                    elif ':' in minutes_str:
                        min_parts = minutes_str.split(':')
                        minutes = int(min_parts[0]) if min_parts[0].isdigit() else 0
                    else:
                        try:
                            minutes = int(float(minutes_str))
                        except:
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

                stats['games_successful'] += 1
                stats['total_player_stats'] += players_inserted

            except Exception as e:
                stats['games_failed'] += 1
                if len(stats['errors']) < 10:
                    stats['errors'].append(f"{game_id}: {str(e)[:50]}")
                continue

        print(f"\n📊 Box Scores Summary for {season}:")
        print(f"   • Games processed: {stats['games_processed']}")
        print(f"   • Games successful: {stats['games_successful']}")
        print(f"   • Games failed: {stats['games_failed']}")
        print(f"   • Total player stats: {stats['total_player_stats']}")

        return stats

    except Exception as e:
        stats['errors'].append(str(e))
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return stats

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python3 sync_historical_season.py <season> [--skip-box-scores]")
        print("Example: python3 sync_historical_season.py 2023-24")
        sys.exit(1)

    season = sys.argv[1]
    skip_box_scores = '--skip-box-scores' in sys.argv

    # Validate season format
    if not (len(season) == 7 and season[4] == '-'):
        print(f"❌ Invalid season format: {season}")
        print("   Expected format: YYYY-YY (e.g., 2023-24)")
        sys.exit(1)

    start_time = datetime.now()

    print(f"\n{'='*80}")
    print(f"🚀 HISTORICAL DATA SYNC: {season} NBA SEASON")
    print(f"{'='*80}")
    print(f"Started at: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Skip box scores: {skip_box_scores}")
    print(f"{'='*80}\n")

    # Step 1: Sync games
    games_stats = sync_season_games(season)

    # Step 2: Collect box scores (unless skipped)
    box_scores_stats = None
    if not skip_box_scores and games_stats['games_found'] > 0:
        box_scores_stats = collect_season_box_scores(season)

    # Final summary
    end_time = datetime.now()
    duration = end_time - start_time

    print(f"\n{'='*80}")
    print(f"✅ {season} SEASON SYNC COMPLETED")
    print(f"{'='*80}")
    print(f"Duration: {duration}")
    print(f"\n📊 Games:")
    print(f"   • Found: {games_stats['games_found']}")
    print(f"   • Inserted: {games_stats['games_inserted']}")
    print(f"   • Updated: {games_stats['games_updated']}")

    if box_scores_stats:
        print(f"\n📊 Box Scores:")
        print(f"   • Processed: {box_scores_stats['games_processed']}")
        print(f"   • Successful: {box_scores_stats['games_successful']}")
        print(f"   • Player stats: {box_scores_stats['total_player_stats']}")

    # Save results to JSON
    results = {
        'season': season,
        'completed_at': end_time.isoformat(),
        'duration_seconds': duration.total_seconds(),
        'games': games_stats,
        'box_scores': box_scores_stats
    }

    results_file = os.path.join(os.path.dirname(__file__), f'sync_results_{season.replace("-", "_")}.json')
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)

    print(f"\n📁 Results saved to: {results_file}")
    print(f"{'='*80}\n")

    # Exit with appropriate code
    success = games_stats['games_found'] > 0 and len(games_stats['errors']) == 0
    if box_scores_stats:
        success = success and box_scores_stats['games_failed'] < box_scores_stats['games_processed'] * 0.1

    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
