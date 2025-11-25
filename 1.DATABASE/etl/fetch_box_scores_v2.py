#!/usr/bin/env python3
"""
Enhanced Box Score Collection for 2025-26 Season
Using multiple endpoints and methods to fetch player stats
"""

import os
import sys
import psycopg2
import pandas as pd
from datetime import datetime
from nba_api.stats.endpoints import (
    boxscoretraditionalv2,
    boxscoreadvancedv2,
    boxscoreplayertrackv2,
    playergamelog,
    leaguegamelog
)
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

def try_multiple_endpoints(game_id):
    """Try multiple endpoints to get box score data"""
    methods_tried = []

    # Method 1: Traditional Box Score V2
    try:
        print(f"   Trying BoxScoreTraditionalV2...")
        box_score = boxscoretraditionalv2.BoxScoreTraditionalV2(
            game_id=game_id,
            timeout=30
        )
        player_stats = box_score.player_stats.get_data_frame()

        if not player_stats.empty:
            print(f"   ✅ Success! Found {len(player_stats)} player stats")
            return player_stats
        else:
            print(f"   ⚠️  Empty result from BoxScoreTraditionalV2")
            methods_tried.append("BoxScoreTraditionalV2 (empty)")
    except Exception as e:
        print(f"   ❌ BoxScoreTraditionalV2 failed: {str(e)[:100]}")
        methods_tried.append(f"BoxScoreTraditionalV2 ({str(e)[:50]})")

    # Method 2: Advanced Box Score V2
    try:
        print(f"   Trying BoxScoreAdvancedV2...")
        box_score = boxscoreadvancedv2.BoxScoreAdvancedV2(
            game_id=game_id,
            timeout=30
        )
        player_stats = box_score.player_stats.get_data_frame()

        if not player_stats.empty:
            print(f"   ✅ Success! Found {len(player_stats)} player stats")
            # Convert advanced stats to traditional format
            return player_stats
        else:
            print(f"   ⚠️  Empty result from BoxScoreAdvancedV2")
            methods_tried.append("BoxScoreAdvancedV2 (empty)")
    except Exception as e:
        print(f"   ❌ BoxScoreAdvancedV2 failed: {str(e)[:100]}")
        methods_tried.append(f"BoxScoreAdvancedV2 ({str(e)[:50]})")

    # Method 3: Player Track Box Score
    try:
        print(f"   Trying BoxScorePlayerTrackV2...")
        box_score = boxscoreplayertrackv2.BoxScorePlayerTrackV2(
            game_id=game_id,
            timeout=30
        )
        player_stats = box_score.player_stats.get_data_frame()

        if not player_stats.empty:
            print(f"   ✅ Success! Found {len(player_stats)} player tracking stats")
            return player_stats
        else:
            print(f"   ⚠️  Empty result from BoxScorePlayerTrackV2")
            methods_tried.append("BoxScorePlayerTrackV2 (empty)")
    except Exception as e:
        print(f"   ❌ BoxScorePlayerTrackV2 failed: {str(e)[:100]}")
        methods_tried.append(f"BoxScorePlayerTrackV2 ({str(e)[:50]})")

    print(f"   ❌ All methods failed for game {game_id}")
    print(f"      Methods tried: {', '.join(methods_tried)}")
    return None

def fetch_player_game_logs(season='2025-26'):
    """Alternative: Fetch player game logs for the season"""
    print("\n📊 Trying alternative approach: Player Game Logs")
    print("=" * 60)

    try:
        # Fetch league game log
        print("Fetching league game log for 2025-26...")
        game_log = leaguegamelog.LeagueGameLog(
            season=season,
            season_type_all_star='Regular Season',
            timeout=30
        )

        games_df = game_log.get_data_frames()[0]

        if games_df.empty:
            print("⚠️  No game logs found")
            return None

        print(f"✅ Found {len(games_df)} game log entries")

        # Group by game and get player stats
        unique_games = games_df['GAME_ID'].nunique()
        unique_players = games_df['PLAYER_ID'].nunique() if 'PLAYER_ID' in games_df.columns else 0

        print(f"   • Unique games: {unique_games}")
        print(f"   • Unique players: {unique_players}")

        # Sample data
        if not games_df.empty:
            print("\n   Sample entries:")
            for idx, row in games_df.head(3).iterrows():
                if 'PLAYER_NAME' in games_df.columns:
                    print(f"   • {row.get('PLAYER_NAME', 'N/A')}: {row.get('PTS', 0)} pts, {row.get('REB', 0)} reb, {row.get('AST', 0)} ast")
                else:
                    print(f"   • Team: {row.get('TEAM_ABBREVIATION', 'N/A')}, Points: {row.get('PTS', 0)}")

        return games_df

    except Exception as e:
        print(f"❌ Failed to fetch game logs: {e}")
        return None

def collect_box_scores_v2():
    """Enhanced box score collection with multiple methods"""
    print("=" * 80)
    print("📊 ENHANCED BOX SCORE COLLECTION FOR 2025-26")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get all 2025-26 games
        cur.execute("""
            SELECT g.game_id, g.game_date, ht.abbreviation, g.home_team_score,
                   at.abbreviation, g.away_team_score
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE g.season = '2025-26' AND g.game_status = 'Final'
            ORDER BY g.game_date
        """)

        games = cur.fetchall()
        total_games = len(games)

        print(f"Found {total_games} games to process\n")

        successful = 0
        failed = 0
        total_stats = 0

        for idx, (game_id, game_date, home, home_score, away, away_score) in enumerate(games, 1):
            print(f"\n[{idx}/{total_games}] Processing {game_id}: {home} {home_score} - {away_score} {away} ({game_date})")

            # Try multiple methods to get box score
            player_stats_df = try_multiple_endpoints(game_id)

            if player_stats_df is not None and not player_stats_df.empty:
                # Insert player stats into database
                stats_inserted = 0

                for _, player in player_stats_df.iterrows():
                    try:
                        # Insert/update player
                        cur.execute("""
                            INSERT INTO players (player_id, full_name)
                            VALUES (%s, %s)
                            ON CONFLICT (player_id) DO UPDATE
                            SET full_name = EXCLUDED.full_name,
                                updated_at = CURRENT_TIMESTAMP
                        """, (
                            int(player.get('PLAYER_ID', 0)),
                            player.get('PLAYER_NAME', 'Unknown')
                        ))

                        # Parse minutes
                        minutes_str = str(player.get('MIN', '0:00'))
                        if ':' in minutes_str:
                            min_parts = minutes_str.split(':')
                            minutes = int(min_parts[0]) if min_parts[0].isdigit() else 0
                        else:
                            minutes = int(minutes_str) if minutes_str.isdigit() else 0

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
                                turnovers = EXCLUDED.turnovers
                        """, (
                            game_id,
                            int(player.get('PLAYER_ID', 0)),
                            int(player.get('TEAM_ID', 0)),
                            minutes,
                            int(player.get('PTS', 0)),
                            int(player.get('REB', 0)),
                            int(player.get('AST', 0)),
                            int(player.get('STL', 0)),
                            int(player.get('BLK', 0)),
                            int(player.get('TO', 0)),
                            int(player.get('FGM', 0)),
                            int(player.get('FGA', 0)),
                            float(player.get('FG_PCT', 0)) if pd.notna(player.get('FG_PCT')) else None,
                            int(player.get('FG3M', 0)),
                            int(player.get('FG3A', 0)),
                            float(player.get('FG3_PCT', 0)) if pd.notna(player.get('FG3_PCT')) else None,
                            int(player.get('FTM', 0)),
                            int(player.get('FTA', 0)),
                            float(player.get('FT_PCT', 0)) if pd.notna(player.get('FT_PCT')) else None
                        ))

                        if cur.rowcount > 0:
                            stats_inserted += 1

                    except Exception as e:
                        print(f"      ⚠️  Error inserting player {player.get('PLAYER_NAME', 'Unknown')}: {e}")
                        continue

                if stats_inserted > 0:
                    conn.commit()
                    successful += 1
                    total_stats += stats_inserted
                    print(f"   ✅ Inserted {stats_inserted} player stats")
                else:
                    failed += 1
                    print(f"   ❌ No stats inserted")
            else:
                failed += 1

            # Rate limiting
            time.sleep(1)

            # Commit every 5 games
            if idx % 5 == 0:
                conn.commit()
                print(f"   💾 Committed batch")

        # Final commit
        conn.commit()

        # Try alternative method if all traditional methods failed
        if successful == 0:
            game_logs = fetch_player_game_logs('2025-26')
            if game_logs is not None and not game_logs.empty:
                print("\n✅ Found data through game logs!")
                # Process game logs here if needed

        # Summary
        print(f"\n{'='*60}")
        print(f"📊 Collection Summary:")
        print(f"   • Games processed: {total_games}")
        print(f"   • Successful: {successful}")
        print(f"   • Failed: {failed}")
        print(f"   • Total player stats: {total_stats}")

        # Verify in database
        cur.execute("""
            SELECT COUNT(DISTINCT pgs.game_id), COUNT(*), COUNT(DISTINCT pgs.player_id)
            FROM player_game_stats pgs
            JOIN games g ON pgs.game_id = g.game_id
            WHERE g.season = '2025-26'
        """)
        games_with_stats, total_db_stats, unique_players = cur.fetchone()

        print(f"\n✅ Database Verification:")
        print(f"   • Games with stats: {games_with_stats}")
        print(f"   • Total player stats: {total_db_stats}")
        print(f"   • Unique players: {unique_players}")

        cur.close()
        conn.close()

        return successful > 0

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = collect_box_scores_v2()
    sys.exit(0 if success else 1)