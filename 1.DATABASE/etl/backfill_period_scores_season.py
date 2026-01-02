#!/usr/bin/env python3
"""
Backfill Period Scores for Any NBA Season
Generic script to fetch quarter-by-quarter scores for all games in a season.

Usage:
    python3 backfill_period_scores_season.py 2023-24
    python3 backfill_period_scores_season.py 2019-20 --delay 2.0
"""

import os
import sys
import json
import psycopg2
import time
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))
from fetch_period_scores import (
    get_db_connection,
    fetch_boxscore_from_cdn,
    fetch_boxscore_summary,
    parse_cdn_periods,
    parse_other_stats,
    insert_period_scores,
    insert_game_advanced_stats
)

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'config', '.env'))


def get_season_games(conn, season: str) -> list:
    """Get all completed games for a specific season"""
    cur = conn.cursor()

    cur.execute("""
        SELECT g.game_id, g.game_date, g.home_team_id, g.away_team_id,
               g.home_team_score, g.away_team_score,
               ht.abbreviation as home_abbr, at.abbreviation as away_abbr
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE g.season = %s
          AND g.game_status = 'Final'
          AND g.home_team_score IS NOT NULL
        ORDER BY g.game_date ASC
    """, (season,))

    games = cur.fetchall()
    cur.close()

    return [
        {
            'game_id': row[0],
            'game_date': row[1],
            'home_team_id': row[2],
            'away_team_id': row[3],
            'home_score': row[4],
            'away_score': row[5],
            'home_abbr': row[6],
            'away_abbr': row[7]
        }
        for row in games
    ]


def get_games_already_processed(conn, season: str) -> set:
    """Get set of game_ids that already have period_scores for this season"""
    cur = conn.cursor()

    cur.execute("""
        SELECT DISTINCT ps.game_id
        FROM period_scores ps
        JOIN games g ON ps.game_id = g.game_id
        WHERE g.season = %s
    """, (season,))

    processed = set(row[0] for row in cur.fetchall())
    cur.close()

    return processed


def get_checkpoint_file(season: str) -> str:
    """Get checkpoint file path for a season"""
    return os.path.join(
        os.path.dirname(__file__),
        f'backfill_checkpoint_{season.replace("-", "_")}.json'
    )


def load_checkpoint(season: str) -> dict:
    """Load checkpoint data from file"""
    checkpoint_file = get_checkpoint_file(season)

    if os.path.exists(checkpoint_file):
        try:
            with open(checkpoint_file, 'r') as f:
                checkpoint = json.load(f)
                print(f"📂 Loaded checkpoint: {checkpoint['processed']}/{checkpoint['total']} games")
                return checkpoint
        except Exception as e:
            print(f"⚠️  Error loading checkpoint: {e}")

    return {
        'season': season,
        'processed': 0,
        'total': 0,
        'completed_games': [],
        'failed_games': [],
        'last_updated': None
    }


def save_checkpoint(checkpoint: dict):
    """Save checkpoint data to file"""
    checkpoint['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    checkpoint_file = get_checkpoint_file(checkpoint['season'])

    try:
        with open(checkpoint_file, 'w') as f:
            json.dump(checkpoint, f, indent=2)
    except Exception as e:
        print(f"⚠️  Error saving checkpoint: {e}")


def validate_period_scores(conn, game_id: str, expected_home: int, expected_away: int) -> bool:
    """Validate that period scores sum matches final score"""
    cur = conn.cursor()

    cur.execute("""
        SELECT
            g.home_team_id,
            g.away_team_id,
            COALESCE(SUM(CASE WHEN ps.team_id = g.home_team_id THEN ps.points ELSE 0 END), 0) as home_total,
            COALESCE(SUM(CASE WHEN ps.team_id = g.away_team_id THEN ps.points ELSE 0 END), 0) as away_total
        FROM games g
        LEFT JOIN period_scores ps ON g.game_id = ps.game_id
        WHERE g.game_id = %s
        GROUP BY g.home_team_id, g.away_team_id
    """, (game_id,))

    result = cur.fetchone()
    cur.close()

    if not result:
        return False

    _, _, home_total, away_total = result
    return home_total == expected_home and away_total == expected_away


def process_game(conn, game: dict, delay: float = 1.5) -> tuple:
    """Process a single game - returns (period_count, gas_success, validation)"""
    game_id = game['game_id']
    ps_count = 0
    gas_success = False

    # Fetch period scores from NBA CDN
    cdn_data = fetch_boxscore_from_cdn(game_id)
    if cdn_data:
        period_scores = parse_cdn_periods(
            cdn_data,
            game_id,
            game['home_team_id'],
            game['away_team_id']
        )
        ps_count = insert_period_scores(conn, period_scores)

    # Fetch advanced stats from NBA API
    api_data = fetch_boxscore_summary(game_id)
    if api_data and 'other_stats' in api_data:
        advanced_stats = parse_other_stats(
            api_data['other_stats'],
            game_id,
            game['home_team_id'],
            game['away_team_id']
        )
        gas_success = insert_game_advanced_stats(conn, advanced_stats)

    # Validate
    validation_passed = False
    if ps_count > 0:
        validation_passed = validate_period_scores(
            conn, game_id, game['home_score'], game['away_score']
        )

    time.sleep(delay)

    return ps_count, gas_success, validation_passed


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python3 backfill_period_scores_season.py <season> [--delay <seconds>]")
        print("Example: python3 backfill_period_scores_season.py 2023-24")
        sys.exit(1)

    season = sys.argv[1]

    # Parse delay argument
    delay = 1.5
    if '--delay' in sys.argv:
        try:
            delay_idx = sys.argv.index('--delay')
            delay = float(sys.argv[delay_idx + 1])
        except (ValueError, IndexError):
            pass

    # Validate season format
    if not (len(season) == 7 and season[4] == '-'):
        print(f"❌ Invalid season format: {season}")
        sys.exit(1)

    print("=" * 80)
    print(f"🏀 BACKFILLING {season} NBA SEASON PERIOD SCORES")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Delay between games: {delay}s\n")

    start_time = datetime.now()

    try:
        conn = get_db_connection()
        print("✅ Connected to database\n")

        # Load checkpoint
        checkpoint = load_checkpoint(season)

        # Get all games for this season
        all_games = get_season_games(conn, season)
        print(f"📋 Total {season} games: {len(all_games)}")

        if not all_games:
            print(f"⚠️  No games found for {season} season")
            print("   Run sync_historical_season.py first to fetch game data")
            conn.close()
            sys.exit(1)

        # Filter out already processed
        already_processed = get_games_already_processed(conn, season)
        print(f"✅ Games already processed: {len(already_processed)}")

        games_to_process = [g for g in all_games if g['game_id'] not in already_processed]
        print(f"⏳ Games remaining: {len(games_to_process)}\n")

        if not games_to_process:
            print(f"✅ All {season} games already have period_scores!")
            conn.close()
            return

        # Update checkpoint
        checkpoint['total'] = len(all_games)

        # Estimate time
        estimated_minutes = (len(games_to_process) * delay) / 60
        print(f"⏱️  Estimated time: ~{estimated_minutes:.0f} minutes")
        print(f"📊 Target records: ~{len(games_to_process) * 8}\n")

        # Process games
        batch_size = 50
        total_ps = 0
        total_gas = 0
        validation_failures = []
        errors = []

        for idx, game in enumerate(games_to_process, 1):
            game_id = game['game_id']

            print(f"[{idx}/{len(games_to_process)}] {game['away_abbr']} @ {game['home_abbr']} "
                  f"({game['game_date']}) {game['away_score']}-{game['home_score']} - {game_id}")

            try:
                ps_count, gas_success, validation_passed = process_game(conn, game, delay)

                if ps_count > 0:
                    total_ps += ps_count
                    checkpoint['completed_games'].append(game_id)
                    status = f"✅ {ps_count} periods"
                    if not validation_passed:
                        status += " ⚠️ validation"
                        validation_failures.append(game_id)
                    print(f"   {status}")
                else:
                    errors.append(game_id)
                    checkpoint['failed_games'].append(game_id)
                    print(f"   ⚠️  No period scores")

                if gas_success:
                    total_gas += 1

                checkpoint['processed'] = len(checkpoint['completed_games'])

                # Save checkpoint periodically
                if idx % batch_size == 0:
                    save_checkpoint(checkpoint)
                    print(f"\n   💾 Checkpoint: {checkpoint['processed']}/{checkpoint['total']}\n")

            except Exception as e:
                print(f"   ❌ Error: {str(e)[:80]}")
                errors.append(game_id)
                checkpoint['failed_games'].append(game_id)
                continue

        # Final save
        save_checkpoint(checkpoint)

        # Summary
        duration = datetime.now() - start_time
        print(f"\n{'='*80}")
        print(f"📊 {season} BACKFILL SUMMARY")
        print(f"{'='*80}")
        print(f"Games processed: {len(games_to_process)}")
        print(f"Period scores inserted: {total_ps}")
        print(f"Advanced stats inserted: {total_gas}")
        print(f"Validation failures: {len(validation_failures)}")
        print(f"Errors: {len(errors)}")
        print(f"Duration: {duration}")

        # Verification
        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(DISTINCT ps.game_id), COUNT(*)
            FROM period_scores ps
            JOIN games g ON ps.game_id = g.game_id
            WHERE g.season = %s
        """, (season,))
        games_count, records_count = cur.fetchone()

        cur.execute("""
            SELECT COUNT(*) FROM games WHERE season = %s AND game_status = 'Final'
        """, (season,))
        total_games = cur.fetchone()[0]

        print(f"\n📊 {season} Coverage:")
        print(f"   • Total completed games: {total_games}")
        print(f"   • Games with period data: {games_count}")
        print(f"   • Coverage: {(games_count/total_games*100):.1f}%" if total_games > 0 else "   • Coverage: N/A")
        print(f"   • Total period records: {records_count}")

        cur.close()
        conn.close()

        # Cleanup checkpoint if complete
        checkpoint_file = get_checkpoint_file(season)
        if len(errors) == 0 and games_count == total_games:
            print(f"\n✅ Backfill complete! Removing checkpoint.")
            if os.path.exists(checkpoint_file):
                os.remove(checkpoint_file)

        print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)

    except KeyboardInterrupt:
        print(f"\n\n⚠️  Interrupted. Checkpoint saved for resume.")
        sys.exit(1)

    except Exception as e:
        print(f"❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
