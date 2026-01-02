#!/usr/bin/env python3
"""
Fetch Period Scores (Quarter-by-Quarter) for NBA Games
Using NBA CDN JSON endpoint for quarter scores

Data sources:
- NBA CDN boxscore JSON: homeTeam.periods, awayTeam.periods (quarter scores)
- BoxScoreSummaryV2 OtherStats: PTS_PAINT, PTS_2ND_CHANCE, PTS_FB, PTS_OFF_TO, LARGEST_LEAD, LEAD_CHANGES, TIMES_TIED
"""

import os
import sys
import psycopg2
import time
import argparse
import requests
from datetime import datetime
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


def get_games_missing_period_scores(conn, season: str = '2025-26', limit: int = None) -> list:
    """Get games that don't have period_scores data yet"""
    cur = conn.cursor()

    query = """
        SELECT g.game_id, g.game_date, g.home_team_id, g.away_team_id,
               ht.abbreviation as home_abbr, at.abbreviation as away_abbr
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        LEFT JOIN period_scores ps ON g.game_id = ps.game_id
        WHERE g.season = %s
          AND g.home_team_score IS NOT NULL
          AND ps.game_id IS NULL
        ORDER BY g.game_date DESC
    """

    if limit:
        query += f" LIMIT {limit}"

    cur.execute(query, (season,))
    games = cur.fetchall()
    cur.close()

    return [
        {
            'game_id': row[0],
            'game_date': row[1],
            'home_team_id': row[2],
            'away_team_id': row[3],
            'home_abbr': row[4],
            'away_abbr': row[5]
        }
        for row in games
    ]


def fetch_boxscore_from_cdn(game_id: str) -> dict | None:
    """Fetch boxscore data from NBA CDN JSON endpoint"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
        'Referer': 'https://www.nba.com/',
        'Origin': 'https://www.nba.com',
        'Accept': 'application/json'
    }

    url = f'https://cdn.nba.com/static/json/liveData/boxscore/boxscore_{game_id}.json'

    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()

        game = data.get('game', {})

        return {
            'home_team': game.get('homeTeam', {}),
            'away_team': game.get('awayTeam', {}),
            'game_data': game
        }
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            print(f"   ⚠️  Game {game_id} not found on CDN")
        else:
            print(f"   ⚠️  HTTP error fetching {game_id}: {e}")
        return None
    except Exception as e:
        print(f"   ⚠️  Error fetching {game_id}: {str(e)[:100]}")
        return None


def fetch_boxscore_summary(game_id: str) -> dict | None:
    """Fetch BoxScoreSummaryV2 data from NBA API for OtherStats only"""
    try:
        from nba_api.stats.endpoints import BoxScoreSummaryV2

        box = BoxScoreSummaryV2(game_id=game_id, timeout=30)

        # Get OtherStats data (paint pts, fastbreak, etc.)
        other_stats = box.other_stats.get_data_frame()

        return {
            'other_stats': other_stats
        }

    except Exception as e:
        print(f"   ⚠️  Error fetching OtherStats for {game_id}: {str(e)[:100]}")
        return None


def parse_cdn_periods(cdn_data: dict, game_id: str, home_team_id: int, away_team_id: int) -> list:
    """Parse NBA CDN periods data into period_scores rows

    CDN format: homeTeam.periods / awayTeam.periods = [
        {'period': 1, 'periodType': 'REGULAR', 'score': 22},
        {'period': 2, 'periodType': 'REGULAR', 'score': 30},
        ...
        {'period': 5, 'periodType': 'OVERTIME', 'score': 8},  # OT if exists
    ]
    """
    period_scores = []

    teams_data = [
        (cdn_data.get('home_team', {}), home_team_id),
        (cdn_data.get('away_team', {}), away_team_id)
    ]

    for team_data, team_id in teams_data:
        periods = team_data.get('periods', [])

        for period_info in periods:
            period_num = period_info.get('period')
            period_type_raw = period_info.get('periodType', 'REGULAR')
            score = period_info.get('score')

            if period_num is None or score is None:
                continue

            # Map CDN periodType to our format
            if period_type_raw == 'OVERTIME':
                period_type = 'OT'
                # OT periods in CDN are numbered 5, 6, 7... but we want 1, 2, 3...
                period_number = period_num - 4
            else:
                period_type = 'Q'
                period_number = period_num

            period_scores.append({
                'game_id': game_id,
                'team_id': team_id,
                'period_number': period_number,
                'period_type': period_type,
                'points': int(score)
            })

    return period_scores


def parse_other_stats(other_stats_df, game_id: str, home_team_id: int, away_team_id: int) -> dict:
    """Parse OtherStats dataframe into game_advanced_stats row"""
    stats = {
        'game_id': game_id,
        'home_pts_paint': None,
        'home_pts_2nd_chance': None,
        'home_pts_fastbreak': None,
        'home_pts_off_turnovers': None,
        'home_largest_lead': None,
        'away_pts_paint': None,
        'away_pts_2nd_chance': None,
        'away_pts_fastbreak': None,
        'away_pts_off_turnovers': None,
        'away_largest_lead': None,
        'lead_changes': None,
        'times_tied': None
    }

    for _, row in other_stats_df.iterrows():
        team_id = row.get('TEAM_ID')

        # Determine if home or away
        if team_id == home_team_id:
            prefix = 'home'
        elif team_id == away_team_id:
            prefix = 'away'
        else:
            continue

        # Extract stats with safe conversion
        def safe_int(val):
            try:
                return int(val) if val is not None else None
            except (ValueError, TypeError):
                return None

        stats[f'{prefix}_pts_paint'] = safe_int(row.get('PTS_PAINT'))
        stats[f'{prefix}_pts_2nd_chance'] = safe_int(row.get('PTS_2ND_CHANCE'))
        stats[f'{prefix}_pts_fastbreak'] = safe_int(row.get('PTS_FB'))
        stats[f'{prefix}_pts_off_turnovers'] = safe_int(row.get('PTS_OFF_TO'))
        stats[f'{prefix}_largest_lead'] = safe_int(row.get('LARGEST_LEAD'))

        # Game-level stats (only need once)
        if stats['lead_changes'] is None:
            stats['lead_changes'] = safe_int(row.get('LEAD_CHANGES'))
        if stats['times_tied'] is None:
            stats['times_tied'] = safe_int(row.get('TIMES_TIED'))

    return stats


def insert_period_scores(conn, period_scores: list) -> int:
    """Insert period_scores into database"""
    if not period_scores:
        return 0

    cur = conn.cursor()
    inserted = 0

    for ps in period_scores:
        try:
            cur.execute("""
                INSERT INTO period_scores (game_id, team_id, period_number, period_type, points)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (game_id, team_id, period_number, period_type)
                DO UPDATE SET points = EXCLUDED.points
            """, (
                ps['game_id'],
                ps['team_id'],
                ps['period_number'],
                ps['period_type'],
                ps['points']
            ))
            inserted += 1
        except Exception as e:
            print(f"   ⚠️  Error inserting period_score: {e}")
            conn.rollback()
            continue

    conn.commit()
    cur.close()
    return inserted


def insert_game_advanced_stats(conn, stats: dict) -> bool:
    """Insert game_advanced_stats into database"""
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO game_advanced_stats (
                game_id,
                home_pts_paint, home_pts_2nd_chance, home_pts_fastbreak,
                home_pts_off_turnovers, home_largest_lead,
                away_pts_paint, away_pts_2nd_chance, away_pts_fastbreak,
                away_pts_off_turnovers, away_largest_lead,
                lead_changes, times_tied
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (game_id)
            DO UPDATE SET
                home_pts_paint = EXCLUDED.home_pts_paint,
                home_pts_2nd_chance = EXCLUDED.home_pts_2nd_chance,
                home_pts_fastbreak = EXCLUDED.home_pts_fastbreak,
                home_pts_off_turnovers = EXCLUDED.home_pts_off_turnovers,
                home_largest_lead = EXCLUDED.home_largest_lead,
                away_pts_paint = EXCLUDED.away_pts_paint,
                away_pts_2nd_chance = EXCLUDED.away_pts_2nd_chance,
                away_pts_fastbreak = EXCLUDED.away_pts_fastbreak,
                away_pts_off_turnovers = EXCLUDED.away_pts_off_turnovers,
                away_largest_lead = EXCLUDED.away_largest_lead,
                lead_changes = EXCLUDED.lead_changes,
                times_tied = EXCLUDED.times_tied
        """, (
            stats['game_id'],
            stats['home_pts_paint'], stats['home_pts_2nd_chance'], stats['home_pts_fastbreak'],
            stats['home_pts_off_turnovers'], stats['home_largest_lead'],
            stats['away_pts_paint'], stats['away_pts_2nd_chance'], stats['away_pts_fastbreak'],
            stats['away_pts_off_turnovers'], stats['away_largest_lead'],
            stats['lead_changes'], stats['times_tied']
        ))
        conn.commit()
        cur.close()
        return True

    except Exception as e:
        print(f"   ⚠️  Error inserting game_advanced_stats: {e}")
        conn.rollback()
        cur.close()
        return False


def process_game(conn, game: dict, delay: float = 1.5) -> tuple[int, bool]:
    """Process a single game: fetch data and insert into DB

    Uses two data sources:
    - NBA CDN for period scores (quarter-by-quarter)
    - BoxScoreSummaryV2 for OtherStats (paint pts, fastbreak, etc.)
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

    # 2. Fetch OtherStats from NBA API (paint pts, fastbreak, etc.)
    api_data = fetch_boxscore_summary(game_id)
    if api_data and 'other_stats' in api_data:
        advanced_stats = parse_other_stats(
            api_data['other_stats'],
            game_id,
            game['home_team_id'],
            game['away_team_id']
        )
        gas_success = insert_game_advanced_stats(conn, advanced_stats)

    # Rate limiting
    time.sleep(delay)

    return ps_count, gas_success


def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description='Fetch period scores from NBA API')
    parser.add_argument('--season', default='2025-26', help='NBA season (default: 2025-26)')
    parser.add_argument('--limit', type=int, default=None, help='Limit number of games to process')
    parser.add_argument('--delay', type=float, default=1.5, help='Delay between API calls (seconds)')
    parser.add_argument('--backfill', action='store_true', help='Backfill all games for the season')
    args = parser.parse_args()

    print("=" * 80)
    print("🏀 FETCHING NBA PERIOD SCORES (Quarter-by-Quarter)")
    print("=" * 80)
    print(f"Season: {args.season}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        conn = get_db_connection()
        print("✅ Connected to database\n")

        # Get games missing period_scores
        games = get_games_missing_period_scores(conn, args.season, args.limit)

        if not games:
            print("✅ All games already have period_scores data!")
            conn.close()
            return

        print(f"📋 Found {len(games)} games missing period_scores\n")

        # Process games
        total_ps = 0
        total_gas = 0
        errors = 0

        for idx, game in enumerate(games, 1):
            print(f"[{idx}/{len(games)}] {game['away_abbr']} @ {game['home_abbr']} ({game['game_date']}) - {game['game_id']}")

            ps_count, gas_success = process_game(conn, game, args.delay)

            if ps_count > 0:
                total_ps += ps_count
                print(f"   ✅ Inserted {ps_count} period_scores")
            else:
                errors += 1

            if gas_success:
                total_gas += 1
                print(f"   ✅ Inserted game_advanced_stats")

            # Progress update every 10 games
            if idx % 10 == 0:
                print(f"\n   📊 Progress: {idx}/{len(games)} games processed\n")

        # Summary
        print("\n" + "=" * 80)
        print("📊 SUMMARY")
        print("=" * 80)
        print(f"Games processed: {len(games)}")
        print(f"Period scores inserted: {total_ps}")
        print(f"Game advanced stats inserted: {total_gas}")
        print(f"Errors: {errors}")

        # Verify data
        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(DISTINCT ps.game_id) as games,
                   COUNT(*) as total_records
            FROM period_scores ps
            JOIN games g ON ps.game_id = g.game_id
            WHERE g.season = %s
        """, (args.season,))
        games_count, records_count = cur.fetchone()
        print(f"\n📊 {args.season} Period Scores:")
        print(f"   • Games with period data: {games_count}")
        print(f"   • Total period records: {records_count}")
        cur.close()

        conn.close()
        print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)

    except Exception as e:
        print(f"❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
