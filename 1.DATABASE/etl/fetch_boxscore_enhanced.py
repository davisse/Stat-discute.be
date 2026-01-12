#!/usr/bin/env python3
"""
Enhanced Boxscore Fetcher - NBA boxscoretraditionalv3 API

Fetches comprehensive player stats from boxscoretraditionalv3 endpoint:
- START_POSITION (G, F, C, or empty for bench)
- OREB/DREB (offensive/defensive rebounds)
- PLUS_MINUS (player impact on score)
- PF (personal fouls)
- COMMENT (DNP reasons: injuries, rest, coach's decision)

Features:
- Batch database updates for efficiency
- Exponential backoff retry on API failures
- Progress persistence (resume interrupted runs)
- Comprehensive logging and statistics

Usage:
    python fetch_boxscore_enhanced.py                    # Process games missing data
    python fetch_boxscore_enhanced.py --force-all       # Reprocess all games
    python fetch_boxscore_enhanced.py --limit 10        # Process 10 games only
    python fetch_boxscore_enhanced.py --stats           # Show statistics only
    python fetch_boxscore_enhanced.py --resume          # Resume from last checkpoint
"""

import os
import sys
import time
import json
import requests
import psycopg2
from psycopg2.extras import execute_batch
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent.parent / 'config' / '.env')

# =============================================================================
# Configuration
# =============================================================================

NBA_API_URL = "https://stats.nba.com/stats/boxscoretraditionalv3"
NBA_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Accept': '*/*',
    'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
}

# Rate limiting and retry configuration
REQUEST_DELAY = 0.6          # Base delay between requests (seconds)
MAX_RETRIES = 3              # Maximum retry attempts per request
RETRY_BACKOFF = 2.0          # Exponential backoff multiplier
BATCH_SIZE = 50              # Number of updates per batch commit

# Progress file for resuming interrupted runs
PROGRESS_FILE = Path(__file__).parent / '.boxscore_progress.json'


# =============================================================================
# Database Functions
# =============================================================================

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )


def get_current_season():
    """Get the current season from database"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT season_id FROM seasons WHERE is_current = true")
            result = cur.fetchone()
            return result[0] if result else '2025-26'


def get_games_to_process(season: str, force_all: bool = False, limit: int = None):
    """
    Get list of games that need boxscore data.

    Args:
        season: Season to process
        force_all: If True, return all games regardless of existing data
        limit: Maximum number of games to return

    Returns:
        List of (game_id, game_date) tuples
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            if force_all:
                query = """
                    SELECT DISTINCT g.game_id, g.game_date
                    FROM games g
                    WHERE g.season = %s
                      AND g.game_status = 'Final'
                    ORDER BY g.game_date DESC
                """
            else:
                # Games missing enhanced data (no plus_minus or no start_position set)
                query = """
                    SELECT DISTINCT g.game_id, g.game_date
                    FROM games g
                    JOIN player_game_stats pgs ON g.game_id = pgs.game_id
                    WHERE g.season = %s
                      AND g.game_status = 'Final'
                      AND NOT EXISTS (
                          SELECT 1 FROM player_game_stats pgs2
                          WHERE pgs2.game_id = g.game_id
                          AND (
                              (pgs2.start_position IS NOT NULL AND pgs2.start_position != '')
                              OR pgs2.plus_minus != 0
                              OR pgs2.oreb > 0
                              OR pgs2.dreb > 0
                          )
                      )
                    ORDER BY g.game_date DESC
                """

            if limit:
                query += f" LIMIT {limit}"

            cur.execute(query, (season,))
            return cur.fetchall()


def batch_upsert_player_stats(game_id: str, players: list):
    """
    Batch upsert player_game_stats with enhanced boxscore data.
    Uses INSERT ... ON CONFLICT to handle both existing players and DNP players.

    Args:
        game_id: Game ID
        players: List of player dicts from NBA API

    Returns:
        Tuple of (updated_count, starters_count, dnp_count, inserted_count)
    """
    if not players:
        return 0, 0, 0, 0

    upsert_data = []
    starters_count = 0
    dnp_count = 0

    for player in players:
        player_id = player.get('PLAYER_ID')
        team_id = player.get('TEAM_ID')
        start_position = player.get('START_POSITION', '') or None
        comment = player.get('COMMENT', '') or None

        # Parse minutes (format: "32:45" or None)
        min_str = player.get('MIN', '')
        minutes = 0
        if min_str and ':' in str(min_str):
            try:
                parts = str(min_str).split(':')
                minutes = int(parts[0])
            except (ValueError, IndexError):
                minutes = 0
        elif min_str:
            try:
                minutes = int(float(min_str))
            except (ValueError, TypeError):
                minutes = 0

        # Track starters and DNPs
        if start_position:
            starters_count += 1
        if comment:
            dnp_count += 1

        upsert_data.append({
            'game_id': game_id,
            'player_id': player_id,
            'team_id': team_id,
            'start_position': start_position,
            'oreb': player.get('OREB', 0) or 0,
            'dreb': player.get('DREB', 0) or 0,
            'plus_minus': player.get('PLUS_MINUS', 0) or 0,
            'personal_fouls': player.get('PF', 0) or 0,
            'dnp_reason': comment,
            'points': player.get('PTS', 0) or 0,
            'rebounds': player.get('REB', 0) or 0,
            'assists': player.get('AST', 0) or 0,
            'steals': player.get('STL', 0) or 0,
            'blocks': player.get('BLK', 0) or 0,
            'turnovers': player.get('TO', 0) or 0,
            'fg_made': player.get('FGM', 0) or 0,
            'fg_attempted': player.get('FGA', 0) or 0,
            'fg3_made': player.get('FG3M', 0) or 0,
            'fg3_attempted': player.get('FG3A', 0) or 0,
            'ft_made': player.get('FTM', 0) or 0,
            'ft_attempted': player.get('FTA', 0) or 0,
            'minutes': minutes,
        })

    # Batch upsert (INSERT or UPDATE on conflict)
    updated_count = 0
    inserted_count = 0

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Use INSERT ... ON CONFLICT DO UPDATE (UPSERT)
            upsert_query = """
                INSERT INTO player_game_stats (
                    game_id, player_id, team_id, start_position,
                    minutes, points, rebounds, assists, steals, blocks, turnovers,
                    fg_made, fg_attempted, fg3_made, fg3_attempted,
                    ft_made, ft_attempted, oreb, dreb, plus_minus,
                    personal_fouls, dnp_reason
                ) VALUES (
                    %(game_id)s, %(player_id)s, %(team_id)s, %(start_position)s,
                    %(minutes)s, %(points)s, %(rebounds)s, %(assists)s, %(steals)s,
                    %(blocks)s, %(turnovers)s, %(fg_made)s, %(fg_attempted)s,
                    %(fg3_made)s, %(fg3_attempted)s, %(ft_made)s, %(ft_attempted)s,
                    %(oreb)s, %(dreb)s, %(plus_minus)s, %(personal_fouls)s, %(dnp_reason)s
                )
                ON CONFLICT (game_id, player_id) DO UPDATE SET
                    start_position = EXCLUDED.start_position,
                    oreb = EXCLUDED.oreb,
                    dreb = EXCLUDED.dreb,
                    plus_minus = EXCLUDED.plus_minus,
                    personal_fouls = EXCLUDED.personal_fouls,
                    dnp_reason = EXCLUDED.dnp_reason,
                    points = EXCLUDED.points,
                    rebounds = EXCLUDED.rebounds,
                    assists = EXCLUDED.assists,
                    steals = EXCLUDED.steals,
                    blocks = EXCLUDED.blocks,
                    turnovers = EXCLUDED.turnovers,
                    fg_made = EXCLUDED.fg_made,
                    fg_attempted = EXCLUDED.fg_attempted,
                    fg3_made = EXCLUDED.fg3_made,
                    fg3_attempted = EXCLUDED.fg3_attempted,
                    ft_made = EXCLUDED.ft_made,
                    ft_attempted = EXCLUDED.ft_attempted,
                    minutes = EXCLUDED.minutes
            """

            # Execute batch and track results
            for idx, data in enumerate(upsert_data):
                try:
                    # Use savepoint so we can rollback single insert without failing whole transaction
                    cur.execute(f"SAVEPOINT sp_{idx}")
                    cur.execute(upsert_query, data)
                    cur.execute(f"RELEASE SAVEPOINT sp_{idx}")
                    # xmax = 0 means INSERT, xmax > 0 means UPDATE
                    # But we can't easily distinguish, so we count based on DNP
                    if data['dnp_reason'] and data['minutes'] == 0:
                        inserted_count += 1
                    else:
                        updated_count += 1
                except Exception as e:
                    # Rollback to savepoint on error
                    cur.execute(f"ROLLBACK TO SAVEPOINT sp_{idx}")
                    # Skip players that don't exist in players table
                    if 'player_game_stats_player_id_fkey' in str(e):
                        continue
                    raise

            conn.commit()

    return updated_count, starters_count, dnp_count, inserted_count


# =============================================================================
# NBA API Functions
# =============================================================================

def fetch_boxscore_with_retry(game_id: str):
    """
    Fetch boxscore data from NBA API v3 with exponential backoff retry.

    Args:
        game_id: NBA game ID (10 digits)

    Returns:
        List of player dicts (normalized to v2 format) or None on failure
    """
    params = {
        'GameID': game_id,
        'LeagueID': '00'
    }

    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(
                NBA_API_URL,
                params=params,
                headers=NBA_HEADERS,
                timeout=30
            )
            response.raise_for_status()

            data = response.json()

            # v3 structure: data['boxScoreTraditional']['homeTeam'/'awayTeam']['players']
            box_score = data.get('boxScoreTraditional', {})
            if not box_score:
                return None

            players = []

            for team_key in ['homeTeam', 'awayTeam']:
                team_data = box_score.get(team_key, {})
                team_id = team_data.get('teamId')
                team_players = team_data.get('players', [])

                for player in team_players:
                    stats = player.get('statistics', {})

                    # Parse minutes from "MM:SS" format
                    min_str = stats.get('minutes', '0:00') or '0:00'
                    minutes = 0
                    if ':' in str(min_str):
                        try:
                            parts = str(min_str).split(':')
                            minutes = int(parts[0])
                        except (ValueError, IndexError):
                            minutes = 0

                    # In v3, position is set only for starters (F, G, C)
                    # Empty position = bench player
                    position = player.get('position', '') or ''

                    # Normalize to v2-compatible dict
                    normalized = {
                        'PLAYER_ID': player.get('personId'),
                        'TEAM_ID': team_id,
                        'PLAYER_NAME': f"{player.get('firstName', '')} {player.get('familyName', '')}".strip(),
                        'START_POSITION': position if position else None,
                        'COMMENT': player.get('comment') or None,
                        'MIN': minutes,
                        'PTS': stats.get('points', 0) or 0,
                        'REB': stats.get('reboundsTotal', 0) or 0,
                        'AST': stats.get('assists', 0) or 0,
                        'STL': stats.get('steals', 0) or 0,
                        'BLK': stats.get('blocks', 0) or 0,
                        'TO': stats.get('turnovers', 0) or 0,
                        'FGM': stats.get('fieldGoalsMade', 0) or 0,
                        'FGA': stats.get('fieldGoalsAttempted', 0) or 0,
                        'FG3M': stats.get('threePointersMade', 0) or 0,
                        'FG3A': stats.get('threePointersAttempted', 0) or 0,
                        'FTM': stats.get('freeThrowsMade', 0) or 0,
                        'FTA': stats.get('freeThrowsAttempted', 0) or 0,
                        'OREB': stats.get('reboundsOffensive', 0) or 0,
                        'DREB': stats.get('reboundsDefensive', 0) or 0,
                        'PLUS_MINUS': int(stats.get('plusMinusPoints', 0) or 0),
                        'PF': stats.get('foulsPersonal', 0) or 0,
                    }
                    players.append(normalized)

            return players if players else None

        except requests.exceptions.RequestException as e:
            wait_time = REQUEST_DELAY * (RETRY_BACKOFF ** attempt)
            if attempt < MAX_RETRIES - 1:
                print(f"    ⚠️  Retry {attempt + 1}/{MAX_RETRIES} in {wait_time:.1f}s: {e}")
                time.sleep(wait_time)
            else:
                print(f"    ❌ Failed after {MAX_RETRIES} attempts: {e}")
                return None
        except Exception as e:
            print(f"    ❌ Unexpected error: {e}")
            return None

    return None


# =============================================================================
# Progress Persistence
# =============================================================================

def save_progress(processed_games: list, season: str):
    """Save progress to file for resuming"""
    progress = {
        'season': season,
        'processed_games': processed_games,
        'last_updated': datetime.now().isoformat()
    }
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f)


def load_progress(season: str):
    """Load progress from file"""
    if not PROGRESS_FILE.exists():
        return []

    try:
        with open(PROGRESS_FILE, 'r') as f:
            progress = json.load(f)

        if progress.get('season') == season:
            return progress.get('processed_games', [])
    except (json.JSONDecodeError, KeyError):
        pass

    return []


def clear_progress():
    """Clear progress file"""
    if PROGRESS_FILE.exists():
        PROGRESS_FILE.unlink()


# =============================================================================
# Statistics
# =============================================================================

def show_statistics(season: str = None):
    """Display comprehensive statistics about boxscore data"""
    if not season:
        season = get_current_season()

    print(f"\n{'=' * 60}")
    print(f"📊 Boxscore Data Statistics for {season}")
    print('=' * 60)

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Overall counts
            cur.execute("""
                SELECT
                    COUNT(DISTINCT g.game_id) as total_games,
                    COUNT(*) as total_player_records
                FROM games g
                JOIN player_game_stats pgs ON g.game_id = pgs.game_id
                WHERE g.season = %s AND g.game_status = 'Final'
            """, (season,))
            total_games, total_records = cur.fetchone()

            print(f"\n📈 Overview:")
            print(f"   Total finished games: {total_games}")
            print(f"   Total player records: {total_records:,}")

            # Starter data coverage
            cur.execute("""
                SELECT
                    SUM(CASE WHEN start_position IS NOT NULL AND start_position != '' THEN 1 ELSE 0 END) as starters,
                    SUM(CASE WHEN start_position IS NULL OR start_position = '' THEN 1 ELSE 0 END) as bench
                FROM player_game_stats pgs
                JOIN games g ON pgs.game_id = g.game_id
                WHERE g.season = %s
            """, (season,))
            starters, bench = cur.fetchone()

            print(f"\n🏀 Starter Data:")
            print(f"   Starters: {starters:,}")
            print(f"   Bench: {bench:,}")
            if total_records > 0:
                print(f"   Coverage: {(starters / total_records) * 100:.1f}%")

            # Enhanced data coverage
            cur.execute("""
                SELECT
                    SUM(CASE WHEN plus_minus != 0 THEN 1 ELSE 0 END) as has_plus_minus,
                    SUM(CASE WHEN oreb > 0 OR dreb > 0 THEN 1 ELSE 0 END) as has_reb_split,
                    SUM(CASE WHEN personal_fouls > 0 THEN 1 ELSE 0 END) as has_fouls,
                    SUM(CASE WHEN dnp_reason IS NOT NULL THEN 1 ELSE 0 END) as has_dnp
                FROM player_game_stats pgs
                JOIN games g ON pgs.game_id = g.game_id
                WHERE g.season = %s
            """, (season,))
            plus_minus, reb_split, fouls, dnp = cur.fetchone()

            print(f"\n📊 Enhanced Data Coverage:")
            print(f"   Plus/Minus data: {plus_minus:,} records")
            print(f"   OREB/DREB split: {reb_split:,} records")
            print(f"   Personal fouls: {fouls:,} records")
            print(f"   DNP reasons: {dnp:,} records")

            # DNP breakdown
            cur.execute("""
                SELECT
                    dnp_reason,
                    COUNT(*) as count
                FROM player_game_stats pgs
                JOIN games g ON pgs.game_id = g.game_id
                WHERE g.season = %s
                  AND dnp_reason IS NOT NULL
                GROUP BY dnp_reason
                ORDER BY count DESC
                LIMIT 10
            """, (season,))
            dnp_reasons = cur.fetchall()

            if dnp_reasons:
                print(f"\n🏥 DNP Reasons Breakdown:")
                for reason, count in dnp_reasons:
                    print(f"   {reason}: {count}")

            # Games by data completeness
            cur.execute("""
                SELECT status, COUNT(*) as games
                FROM (
                    SELECT
                        CASE
                            WHEN starter_count = 10 AND has_plus_minus THEN 'Complete'
                            WHEN starter_count = 10 THEN 'Starters only'
                            WHEN starter_count > 0 THEN 'Partial'
                            ELSE 'Missing'
                        END as status
                    FROM (
                        SELECT
                            g.game_id,
                            SUM(CASE WHEN pgs.start_position IS NOT NULL AND pgs.start_position != '' THEN 1 ELSE 0 END) as starter_count,
                            BOOL_OR(pgs.plus_minus != 0) as has_plus_minus
                        FROM games g
                        JOIN player_game_stats pgs ON g.game_id = pgs.game_id
                        WHERE g.season = %s AND g.game_status = 'Final'
                        GROUP BY g.game_id
                    ) game_stats
                ) categorized
                GROUP BY status
                ORDER BY
                    CASE status
                        WHEN 'Complete' THEN 1
                        WHEN 'Starters only' THEN 2
                        WHEN 'Partial' THEN 3
                        ELSE 4
                    END
            """, (season,))

            print(f"\n📋 Games by Data Completeness:")
            for status, count in cur.fetchall():
                print(f"   {status}: {count}")

    print()


# =============================================================================
# Main Execution
# =============================================================================

def run_enhanced_fetch(
    season: str = None,
    force_all: bool = False,
    limit: int = None,
    resume: bool = False
):
    """
    Main function to fetch and update enhanced boxscore data.

    Args:
        season: Season to process (default: current season)
        force_all: If True, process all games even if they have data
        limit: Limit number of games to process
        resume: If True, skip previously processed games
    """
    if not season:
        season = get_current_season()

    print("=" * 60)
    print("🏀 Enhanced Boxscore Fetcher (boxscoretraditionalv3)")
    print("=" * 60)
    print(f"Season: {season}")
    print(f"Mode: {'All games' if force_all else 'Missing data only'}")
    if limit:
        print(f"Limit: {limit} games")
    if resume:
        print(f"Resume: Enabled")
    print()

    # Get games to process
    games = get_games_to_process(season, force_all, limit)

    if not games:
        print("✅ No games to process!")
        return

    # Filter out already processed games if resuming
    processed_games = []
    if resume:
        processed_games = load_progress(season)
        if processed_games:
            original_count = len(games)
            games = [(gid, gdate) for gid, gdate in games if gid not in processed_games]
            print(f"📂 Resuming: {original_count - len(games)} games already processed")

    if not games:
        print("✅ All games already processed!")
        clear_progress()
        return

    print(f"📋 Found {len(games)} games to process")
    print("-" * 60)

    # Processing statistics
    stats = {
        'processed': 0,
        'errors': 0,
        'total_updated': 0,
        'total_starters': 0,
        'total_dnp': 0,
        'total_inserted': 0
    }

    start_time = time.time()

    for idx, (game_id, game_date) in enumerate(games, 1):
        # Progress indicator
        elapsed = time.time() - start_time
        rate = idx / elapsed if elapsed > 0 else 0
        eta = (len(games) - idx) / rate if rate > 0 else 0

        print(f"[{idx}/{len(games)}] {game_id} ({game_date}) ", end="")
        print(f"[ETA: {eta/60:.1f}min]...", end=" ")

        # Fetch from NBA API
        players = fetch_boxscore_with_retry(game_id)

        if players is None:
            print("❌ SKIP (API error)")
            stats['errors'] += 1
            time.sleep(REQUEST_DELAY)
            continue

        if not players:
            print("⚠️  SKIP (no player data)")
            stats['errors'] += 1
            time.sleep(REQUEST_DELAY)
            continue

        # Upsert database (UPDATE existing + INSERT DNP players)
        updated, starters, dnp, inserted = batch_upsert_player_stats(game_id, players)

        stats['processed'] += 1
        stats['total_updated'] += updated
        stats['total_starters'] += starters
        stats['total_dnp'] += dnp
        stats['total_inserted'] += inserted

        dnp_info = f", {inserted} DNP inserted" if inserted > 0 else ""
        print(f"✅ OK ({starters} starters, {dnp} DNP, {updated} updated{dnp_info})")

        # Save progress periodically
        processed_games.append(game_id)
        if idx % 10 == 0:
            save_progress(processed_games, season)

        # Rate limiting
        time.sleep(REQUEST_DELAY)

    # Final progress save and cleanup
    if stats['errors'] == 0:
        clear_progress()
    else:
        save_progress(processed_games, season)

    # Summary
    elapsed = time.time() - start_time
    print()
    print("=" * 60)
    print("📊 Summary")
    print("=" * 60)
    print(f"Time elapsed: {elapsed/60:.1f} minutes")
    print(f"Games processed: {stats['processed']}")
    print(f"Games with errors: {stats['errors']}")
    print(f"Total rows updated: {stats['total_updated']:,}")
    print(f"Total DNP inserted: {stats['total_inserted']:,}")
    print(f"Total starters found: {stats['total_starters']:,}")
    print(f"Total DNP records: {stats['total_dnp']:,}")

    if stats['errors'] > 0:
        print(f"\n⚠️  {stats['errors']} errors. Run with --resume to retry.")


# =============================================================================
# CLI
# =============================================================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description='Enhanced NBA boxscore data fetcher',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python fetch_boxscore_enhanced.py                    # Process missing games
  python fetch_boxscore_enhanced.py --force-all       # Reprocess all games
  python fetch_boxscore_enhanced.py --limit 10        # Test with 10 games
  python fetch_boxscore_enhanced.py --stats           # Show statistics only
  python fetch_boxscore_enhanced.py --resume          # Resume interrupted run
        """
    )

    parser.add_argument(
        '--season',
        type=str,
        help='Season to process (e.g., 2025-26)'
    )
    parser.add_argument(
        '--force-all',
        action='store_true',
        help='Process all games, not just missing data'
    )
    parser.add_argument(
        '--limit',
        type=int,
        help='Limit number of games to process'
    )
    parser.add_argument(
        '--stats',
        action='store_true',
        help='Show current statistics only'
    )
    parser.add_argument(
        '--resume',
        action='store_true',
        help='Resume from last checkpoint'
    )
    parser.add_argument(
        '--clear-progress',
        action='store_true',
        help='Clear saved progress'
    )

    args = parser.parse_args()

    if args.clear_progress:
        clear_progress()
        print("✅ Progress cleared")
    elif args.stats:
        show_statistics(args.season)
    else:
        run_enhanced_fetch(
            season=args.season,
            force_all=args.force_all,
            limit=args.limit,
            resume=args.resume
        )
        print()
        show_statistics(args.season)
