#!/usr/bin/env python3
"""
Fetch Player Stats for 2025-26 Season
Using direct NBA API calls with proper headers
"""

import os
import sys
import psycopg2
import requests
import json
from datetime import datetime
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

def fetch_player_game_logs():
    """Fetch player game logs using direct NBA API call with proper headers"""

    url = 'https://stats.nba.com/stats/leaguegamelog'

    # Headers exactly as provided in the curl command
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
        'Accept': '*/*',
        'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Referer': 'https://www.nba.com/',
        'Origin': 'https://www.nba.com',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'Priority': 'u=4'
    }

    # Parameters for the request
    params = {
        'Counter': '1000',
        'DateFrom': '',
        'DateTo': '',
        'Direction': 'DESC',
        'ISTRound': '',
        'LeagueID': '00',
        'PlayerOrTeam': 'P',  # P for Player stats
        'Season': '2025-26',
        'SeasonType': 'Regular Season',
        'Sorter': 'DATE'
    }

    print("📡 Fetching player game logs from NBA API...")
    print(f"   URL: {url}")
    print(f"   Season: 2025-26 Regular Season")

    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)
        response.raise_for_status()

        data = response.json()

        # The response structure from NBA API
        result_sets = data.get('resultSets', [])
        if not result_sets:
            print("❌ No result sets in response")
            return None

        result_set = result_sets[0]
        headers = result_set.get('headers', [])
        rows = result_set.get('rowSet', [])

        print(f"✅ Received {len(rows)} player game log entries")

        # Convert to dictionary format for easier processing
        player_stats = []
        for row in rows:
            stat_dict = dict(zip(headers, row))
            player_stats.append(stat_dict)

        return player_stats

    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse JSON response: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

def insert_player_stats(player_stats):
    """Insert player statistics into database"""

    if not player_stats:
        print("❌ No player stats to insert")
        return False

    print(f"\n💾 Inserting {len(player_stats)} player game stats into database...")

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        inserted = 0
        updated = 0
        errors = 0

        # Group stats by game for better progress tracking
        games_processed = set()

        for idx, stat in enumerate(player_stats, 1):
            try:
                game_id = stat.get('GAME_ID')
                player_id = stat.get('PLAYER_ID')
                player_name = stat.get('PLAYER_NAME')
                team_id = stat.get('TEAM_ID')

                if game_id not in games_processed:
                    games_processed.add(game_id)
                    if len(games_processed) % 5 == 0:
                        print(f"   Processing game {len(games_processed)}...")

                # Insert or update player
                cur.execute("""
                    INSERT INTO players (player_id, full_name)
                    VALUES (%s, %s)
                    ON CONFLICT (player_id) DO UPDATE
                    SET full_name = EXCLUDED.full_name
                """, (player_id, player_name))

                # Parse minutes (format: "MM:SS" or just minutes as integer)
                min_str = str(stat.get('MIN', '0'))
                if ':' in min_str:
                    parts = min_str.split(':')
                    minutes = int(parts[0]) if parts[0].isdigit() else 0
                else:
                    minutes = int(float(min_str)) if min_str.replace('.', '').isdigit() else 0

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
                        steals = EXCLUDED.steals,
                        blocks = EXCLUDED.blocks,
                        turnovers = EXCLUDED.turnovers,
                        fg_made = EXCLUDED.fg_made,
                        fg_attempted = EXCLUDED.fg_attempted,
                        fg_pct = EXCLUDED.fg_pct,
                        fg3_made = EXCLUDED.fg3_made,
                        fg3_attempted = EXCLUDED.fg3_attempted,
                        fg3_pct = EXCLUDED.fg3_pct,
                        ft_made = EXCLUDED.ft_made,
                        ft_attempted = EXCLUDED.ft_attempted,
                        ft_pct = EXCLUDED.ft_pct
                """, (
                    game_id,
                    player_id,
                    team_id,
                    minutes,
                    stat.get('PTS', 0) or 0,
                    stat.get('REB', 0) or 0,
                    stat.get('AST', 0) or 0,
                    stat.get('STL', 0) or 0,
                    stat.get('BLK', 0) or 0,
                    stat.get('TOV', 0) or 0,
                    stat.get('FGM', 0) or 0,
                    stat.get('FGA', 0) or 0,
                    stat.get('FG_PCT') if stat.get('FG_PCT') is not None else None,
                    stat.get('FG3M', 0) or 0,
                    stat.get('FG3A', 0) or 0,
                    stat.get('FG3_PCT') if stat.get('FG3_PCT') is not None else None,
                    stat.get('FTM', 0) or 0,
                    stat.get('FTA', 0) or 0,
                    stat.get('FT_PCT') if stat.get('FT_PCT') is not None else None
                ))

                if cur.rowcount > 0:
                    inserted += 1
                else:
                    updated += 1

                # Commit every 100 records
                if idx % 100 == 0:
                    conn.commit()
                    print(f"   Processed {idx}/{len(player_stats)} records...")

            except Exception as e:
                errors += 1
                print(f"   ⚠️  Error inserting {player_name}: {str(e)[:100]}")
                conn.rollback()
                continue

        # Final commit
        conn.commit()

        print(f"\n✅ Database Insert Summary:")
        print(f"   • Records inserted: {inserted}")
        print(f"   • Records updated: {updated}")
        print(f"   • Errors: {errors}")
        print(f"   • Games processed: {len(games_processed)}")

        # Verify the data
        cur.execute("""
            SELECT COUNT(DISTINCT pgs.game_id) as games,
                   COUNT(*) as total_stats,
                   COUNT(DISTINCT pgs.player_id) as players,
                   MIN(g.game_date) as first_game,
                   MAX(g.game_date) as last_game
            FROM player_game_stats pgs
            JOIN games g ON pgs.game_id = g.game_id
            WHERE g.season = '2025-26'
        """)

        games, total, players, first, last = cur.fetchone()

        print(f"\n📊 2025-26 Season Statistics:")
        print(f"   • Games with stats: {games}")
        print(f"   • Total player stats: {total}")
        print(f"   • Unique players: {players}")
        if first and last:
            print(f"   • Date range: {first} to {last}")

        cur.close()
        conn.close()

        return True

    except Exception as e:
        print(f"❌ Database error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main execution function"""
    print("=" * 80)
    print("🏀 FETCHING 2025-26 NBA PLAYER STATISTICS")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # Fetch player game logs
    player_stats = fetch_player_game_logs()

    if player_stats:
        # Show sample data
        print(f"\n📊 Sample Player Stats (first 3):")
        for stat in player_stats[:3]:
            print(f"   • {stat.get('PLAYER_NAME')}: {stat.get('PTS')} pts, "
                  f"{stat.get('REB')} reb, {stat.get('AST')} ast "
                  f"vs {stat.get('MATCHUP')} on {stat.get('GAME_DATE')}")

        # Insert into database
        success = insert_player_stats(player_stats)

        if success:
            print("\n✅ Successfully fetched and stored player statistics!")
        else:
            print("\n⚠️  Player stats fetched but database insert had issues")
    else:
        print("\n❌ Failed to fetch player statistics")
        print("\n💡 Troubleshooting tips:")
        print("   1. Check if the NBA season has started")
        print("   2. Verify the Season parameter (2025-26)")
        print("   3. Try different SeasonType values")
        print("   4. Check network connectivity")

    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

if __name__ == '__main__':
    main()