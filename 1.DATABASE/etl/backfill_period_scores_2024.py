#!/usr/bin/env python3
"""
Backfill Period Scores for 2024-25 NBA Season
Batch job to fetch quarter-by-quarter scores for all games

Uses existing fetch_period_scores.py infrastructure (NBA CDN endpoint)
Adds checkpoint file support for resumable processing

Target: ~1,214 games × 8 periods = ~9,712 records
Estimated time: ~30-40 minutes with 1.5 second delay per game
"""

import os
import sys
import json
import psycopg2
import time
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Add current directory to path to import fetch_period_scores module
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

# Checkpoint file for resumable processing
CHECKPOINT_FILE = os.path.join(os.path.dirname(__file__), 'backfill_2024_checkpoint.json')


def get_2024_25_games(conn) -> list:
    """Get all completed 2024-25 games"""
    cur = conn.cursor()

    cur.execute("""
        SELECT g.game_id, g.game_date, g.home_team_id, g.away_team_id,
               g.home_team_score, g.away_team_score,
               ht.abbreviation as home_abbr, at.abbreviation as away_abbr
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE g.season = '2024-25'
          AND g.game_status = 'Final'
          AND g.home_team_score IS NOT NULL
        ORDER BY g.game_date ASC
    """)

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


def get_games_already_processed(conn) -> set:
    """Get set of game_ids that already have period_scores"""
    cur = conn.cursor()

    cur.execute("""
        SELECT DISTINCT ps.game_id
        FROM period_scores ps
        JOIN games g ON ps.game_id = g.game_id
        WHERE g.season = '2024-25'
    """)

    processed = set(row[0] for row in cur.fetchall())
    cur.close()

    return processed


def load_checkpoint() -> dict:
    """Load checkpoint data from file"""
    if os.path.exists(CHECKPOINT_FILE):
        try:
            with open(CHECKPOINT_FILE, 'r') as f:
                checkpoint = json.load(f)
                print(f"📂 Loaded checkpoint: {checkpoint['processed']}/{checkpoint['total']} games processed")
                return checkpoint
        except Exception as e:
            print(f"⚠️  Error loading checkpoint: {e}")

    return {
        'processed': 0,
        'total': 0,
        'completed_games': [],
        'failed_games': [],
        'last_updated': None
    }


def save_checkpoint(checkpoint: dict):
    """Save checkpoint data to file"""
    checkpoint['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    try:
        with open(CHECKPOINT_FILE, 'w') as f:
            json.dump(checkpoint, f, indent=2)
    except Exception as e:
        print(f"⚠️  Error saving checkpoint: {e}")


def validate_period_scores(conn, game_id: str, expected_home_score: int, expected_away_score: int) -> bool:
    """
    Validate that period scores sum matches final game score

    Args:
        conn: Database connection
        game_id: NBA game ID
        expected_home_score: Final home team score from games table
        expected_away_score: Final away team score from games table

    Returns:
        True if validation passes, False otherwise
    """
    cur = conn.cursor()

    # Get sum of period scores for both teams
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
        print(f"   ⚠️  Validation failed: No period scores found")
        return False

    home_team_id, away_team_id, home_total, away_total = result

    home_match = home_total == expected_home_score
    away_match = away_total == expected_away_score

    if not home_match or not away_match:
        print(f"   ❌ Validation failed:")
        print(f"      Home: {home_total} (period sum) vs {expected_home_score} (final) - {'✅' if home_match else '❌'}")
        print(f"      Away: {away_total} (period sum) vs {expected_away_score} (final) - {'✅' if away_match else '❌'}")
        return False

    return True


def process_game_with_validation(conn, game: dict, delay: float = 1.5) -> tuple[int, bool, bool]:
    """
    Process a single game with validation

    Returns:
        tuple: (period_scores_count, game_advanced_stats_success, validation_passed)
    """
    game_id = game['game_id']
    ps_count = 0
    gas_success = False

    # 1. Fetch period scores from NBA CDN
    cdn_data = fetch_boxscore_from_cdn(game_id)
    if cdn_data:
        period_scores = parse_cdn_periods(
            cdn_data,
            game_id,
            game['home_team_id'],
            game['away_team_id']
        )
        ps_count = insert_period_scores(conn, period_scores)

    # 2. Fetch OtherStats from NBA API
    api_data = fetch_boxscore_summary(game_id)
    if api_data and 'other_stats' in api_data:
        advanced_stats = parse_other_stats(
            api_data['other_stats'],
            game_id,
            game['home_team_id'],
            game['away_team_id']
        )
        gas_success = insert_game_advanced_stats(conn, advanced_stats)

    # 3. Validate period scores sum to final score
    validation_passed = False
    if ps_count > 0:
        validation_passed = validate_period_scores(
            conn,
            game_id,
            game['home_score'],
            game['away_score']
        )

    # Rate limiting
    time.sleep(delay)

    return ps_count, gas_success, validation_passed


def main():
    """Main backfill execution"""
    print("=" * 80)
    print("🏀 BACKFILLING 2024-25 NBA SEASON PERIOD SCORES")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    start_time = datetime.now()

    try:
        # Connect to database
        conn = get_db_connection()
        print("✅ Connected to database\n")

        # Load checkpoint
        checkpoint = load_checkpoint()

        # Get all 2024-25 games
        all_games = get_2024_25_games(conn)
        print(f"📋 Total 2024-25 games: {len(all_games)}")

        # Filter out already processed games
        already_processed = get_games_already_processed(conn)
        print(f"✅ Games already processed: {len(already_processed)}")

        games_to_process = [g for g in all_games if g['game_id'] not in already_processed]
        print(f"⏳ Games remaining to process: {len(games_to_process)}\n")

        if not games_to_process:
            print("✅ All games already have period_scores!")
            conn.close()
            return

        # Update checkpoint total
        checkpoint['total'] = len(all_games)

        # Estimate time
        delay_per_game = 1.5  # seconds
        estimated_minutes = (len(games_to_process) * delay_per_game) / 60
        print(f"⏱️  Estimated time: ~{estimated_minutes:.0f} minutes")
        print(f"📊 Target records: ~{len(games_to_process) * 8} period scores\n")

        # Process games in batches
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
                ps_count, gas_success, validation_passed = process_game_with_validation(
                    conn, game, delay_per_game
                )

                if ps_count > 0:
                    total_ps += ps_count
                    checkpoint['completed_games'].append(game_id)
                    print(f"   ✅ Inserted {ps_count} period_scores", end='')

                    if validation_passed:
                        print(f" - Validation ✅")
                    else:
                        print(f" - Validation ❌")
                        validation_failures.append({
                            'game_id': game_id,
                            'matchup': f"{game['away_abbr']} @ {game['home_abbr']}",
                            'date': str(game['game_date'])
                        })
                else:
                    print(f"   ⚠️  No period scores inserted")
                    errors.append(game_id)
                    checkpoint['failed_games'].append(game_id)

                if gas_success:
                    total_gas += 1
                    print(f"   ✅ Inserted game_advanced_stats")

                checkpoint['processed'] = len(checkpoint['completed_games'])

                # Save checkpoint every batch
                if idx % batch_size == 0:
                    save_checkpoint(checkpoint)
                    print(f"\n   💾 Checkpoint saved: {checkpoint['processed']}/{checkpoint['total']} games\n")

                # Progress update
                if idx % 25 == 0:
                    elapsed = (datetime.now() - start_time).total_seconds() / 60
                    remaining = len(games_to_process) - idx
                    eta_minutes = (remaining * delay_per_game) / 60
                    print(f"\n   📊 Progress: {idx}/{len(games_to_process)} games "
                          f"| {elapsed:.1f}m elapsed | ~{eta_minutes:.0f}m remaining\n")

            except Exception as e:
                print(f"   ❌ Error processing {game_id}: {str(e)[:100]}")
                errors.append(game_id)
                checkpoint['failed_games'].append(game_id)
                continue

        # Final checkpoint save
        save_checkpoint(checkpoint)

        # Summary
        duration = datetime.now() - start_time
        print("\n" + "=" * 80)
        print("📊 BACKFILL SUMMARY")
        print("=" * 80)
        print(f"Total games processed: {len(games_to_process)}")
        print(f"Period scores inserted: {total_ps}")
        print(f"Game advanced stats inserted: {total_gas}")
        print(f"Validation failures: {len(validation_failures)}")
        print(f"Errors: {len(errors)}")
        print(f"Duration: {duration}")

        # Validation failures detail
        if validation_failures:
            print(f"\n⚠️  VALIDATION FAILURES ({len(validation_failures)}):")
            for failure in validation_failures[:10]:  # Show first 10
                print(f"   • {failure['matchup']} ({failure['date']}) - {failure['game_id']}")
            if len(validation_failures) > 10:
                print(f"   ... and {len(validation_failures) - 10} more")

        # Final verification
        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(DISTINCT ps.game_id) as games_with_data,
                   COUNT(*) as total_period_records
            FROM period_scores ps
            JOIN games g ON ps.game_id = g.game_id
            WHERE g.season = '2024-25'
        """)
        games_count, records_count = cur.fetchone()

        cur.execute("""
            SELECT COUNT(*) FROM games WHERE season = '2024-25' AND game_status = 'Final'
        """)
        total_completed_games = cur.fetchone()[0]

        print(f"\n📊 2024-25 Season Coverage:")
        print(f"   • Total completed games: {total_completed_games}")
        print(f"   • Games with period data: {games_count}")
        print(f"   • Coverage: {(games_count/total_completed_games*100):.1f}%")
        print(f"   • Total period records: {records_count}")
        print(f"   • Expected records: ~{total_completed_games * 8}")

        cur.close()
        conn.close()

        # Cleanup checkpoint file if complete
        if len(errors) == 0 and games_count == total_completed_games:
            print(f"\n✅ Backfill complete! Removing checkpoint file.")
            if os.path.exists(CHECKPOINT_FILE):
                os.remove(CHECKPOINT_FILE)

        print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)

    except KeyboardInterrupt:
        print(f"\n\n⚠️  Backfill interrupted by user")
        print(f"💾 Checkpoint saved. Run script again to resume from checkpoint.")
        sys.exit(1)

    except Exception as e:
        print(f"❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
