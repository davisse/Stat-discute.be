#!/usr/bin/env python3
"""
Calculate Against The Spread (ATS) Performance Statistics

This script calculates team performance against betting spreads, which is critical
for evaluating betting value and team performance relative to market expectations.

ATS Calculation Logic:
---------------------
1. For each completed game with betting lines:
   - Compare actual game margin to the betting spread
   - Example: Team favored by -5.5, wins by 7 → 7 + (-5.5) = 1.5 > 0 → COVERED
   - Example: Team underdog by +3.5, loses by 2 → -2 + 3.5 = 1.5 > 0 → COVERED
   - Push: Margin exactly equals spread (rare with 0.5 point lines)

2. Calculate splits:
   - Home/Away: Performance as home vs away team
   - Favorite/Underdog: Performance when favored (spread < 0) vs underdog (spread > 0)
   - Over/Under: Games going over vs under the total line

3. Aggregate by team and season:
   - ATS record: wins/losses/pushes
   - ATS cover percentage: wins / (wins + losses)
   - Split percentages for each category

Database Schema:
---------------
Input tables:
  - games: game results (scores, home/away teams)
  - betting_lines: spread and total lines per game

Output table:
  - ats_performance: aggregated ATS statistics per team per season

Usage:
------
  python3 calculate_ats_performance.py              # Process current season
  python3 calculate_ats_performance.py --season 2024-25  # Specific season
  python3 calculate_ats_performance.py --verbose         # Detailed output

Author: Claude Code
Created: 2025-11-20
"""

import os
import sys
import argparse
import psycopg2
from datetime import datetime
from decimal import Decimal
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )

def get_current_season(cur):
    """Get current season ID from database"""
    cur.execute("SELECT season_id FROM seasons WHERE is_current = true")
    result = cur.fetchone()
    return result[0] if result else '2025-26'

def calculate_game_margin(team_score, opponent_score):
    """
    Calculate margin from team's perspective
    Positive = team won, Negative = team lost
    """
    return team_score - opponent_score

def did_cover_spread(margin, spread):
    """
    Determine if team covered the spread

    Args:
        margin: Actual game margin (positive = team won)
        spread: Betting spread (negative = team favored)

    Returns:
        'cover' if team covered spread
        'loss' if team didn't cover
        'push' if margin equals spread (exactly on line)

    Examples:
        Team favored by -5.5, wins by 7: margin=7, spread=-5.5 → 7+(-5.5)=1.5>0 → COVER
        Team favored by -3.0, wins by 3: margin=3, spread=-3.0 → 3+(-3.0)=0 → PUSH
        Team underdog by +4.5, loses by 2: margin=-2, spread=4.5 → -2+4.5=2.5>0 → COVER
        Team underdog by +6.0, loses by 10: margin=-10, spread=6.0 → -10+6.0=-4<0 → LOSS
    """
    adjusted_margin = margin + float(spread)

    if adjusted_margin > 0:
        return 'cover'
    elif adjusted_margin < 0:
        return 'loss'
    else:
        return 'push'

def did_game_go_over(total_score, line_total):
    """
    Determine if game went over/under the total line

    Returns:
        'over' if total score > line
        'under' if total score < line
        'push' if exactly equal
    """
    if total_score > line_total:
        return 'over'
    elif total_score < line_total:
        return 'under'
    else:
        return 'push'

def process_game_ats(game_data, betting_line, verbose=False):
    """
    Process a single game's ATS results

    Args:
        game_data: (game_id, home_team_id, away_team_id, home_score, away_score)
        betting_line: (spread, total)

    Returns:
        dict with ATS results for home and away teams
    """
    game_id, home_team_id, away_team_id, home_score, away_score = game_data
    spread, total = betting_line

    if spread is None:
        if verbose:
            print(f"  ⚠️  Game {game_id}: No spread available, skipping")
        return None

    # Calculate results
    home_margin = calculate_game_margin(home_score, away_score)
    away_margin = calculate_game_margin(away_score, home_score)
    total_score = home_score + away_score

    # Home team ATS (spread is from home team's perspective)
    home_ats_result = did_cover_spread(home_margin, spread)
    home_is_favorite = spread < 0

    # Away team ATS (flip the spread)
    away_spread = -spread if spread else None
    away_ats_result = did_cover_spread(away_margin, away_spread) if away_spread else None
    away_is_favorite = away_spread < 0 if away_spread else False

    # Over/Under
    ou_result = did_game_go_over(total_score, float(total)) if total else None

    if verbose:
        print(f"  📊 Game {game_id}:")
        print(f"      Home {home_team_id}: {home_score} (spread: {spread:+.1f}) → {home_ats_result.upper()}")
        print(f"      Away {away_team_id}: {away_score} (spread: {away_spread:+.1f}) → {away_ats_result.upper()}")
        print(f"      Total: {total_score} (line: {total}) → {ou_result.upper() if ou_result else 'N/A'}")

    return {
        'home_team': {
            'team_id': home_team_id,
            'ats_result': home_ats_result,
            'is_home': True,
            'is_favorite': home_is_favorite,
            'ou_result': ou_result
        },
        'away_team': {
            'team_id': away_team_id,
            'ats_result': away_ats_result,
            'is_home': False,
            'is_favorite': away_is_favorite,
            'ou_result': ou_result
        }
    }

def aggregate_ats_stats(cur, season, verbose=False):
    """
    Aggregate ATS statistics for all teams in a season

    Returns:
        dict: {team_id: {ats_wins: int, ats_losses: int, ...}}
    """
    # Get all completed games with betting lines
    cur.execute("""
        SELECT
            g.game_id,
            g.home_team_id,
            g.away_team_id,
            g.home_team_score,
            g.away_team_score,
            bl.spread,
            bl.total
        FROM games g
        LEFT JOIN betting_lines bl ON g.game_id = bl.game_id
        WHERE g.season = %s
          AND g.game_status = 'Final'
          AND g.home_team_score IS NOT NULL
          AND g.away_team_score IS NOT NULL
        ORDER BY g.game_date
    """, (season,))

    games = cur.fetchall()

    if not games:
        print(f"⚠️  No completed games found for season {season}")
        return {}

    print(f"📋 Processing {len(games)} completed games for season {season}\n")

    # Initialize stats dictionary
    team_stats = {}
    games_with_lines = 0
    games_without_lines = 0

    for game in games:
        game_id, home_team_id, away_team_id, home_score, away_score, spread, total = game

        # Initialize team stats if not exists
        for team_id in [home_team_id, away_team_id]:
            if team_id not in team_stats:
                team_stats[team_id] = {
                    'ats_wins': 0,
                    'ats_losses': 0,
                    'ats_pushes': 0,
                    'home_ats_wins': 0,
                    'home_ats_losses': 0,
                    'away_ats_wins': 0,
                    'away_ats_losses': 0,
                    'favorite_ats_wins': 0,
                    'favorite_ats_losses': 0,
                    'underdog_ats_wins': 0,
                    'underdog_ats_losses': 0,
                    'over_record': 0,
                    'under_record': 0,
                    'ou_pushes': 0
                }

        if spread is None:
            games_without_lines += 1
            continue

        games_with_lines += 1

        # Process game ATS
        result = process_game_ats(
            (game_id, home_team_id, away_team_id, home_score, away_score),
            (spread, total),
            verbose=verbose
        )

        if not result:
            continue

        # Update stats for both teams
        for team_key in ['home_team', 'away_team']:
            team_data = result[team_key]
            team_id = team_data['team_id']
            ats_result = team_data['ats_result']
            is_home = team_data['is_home']
            is_favorite = team_data['is_favorite']
            ou_result = team_data['ou_result']

            # Overall ATS
            if ats_result == 'cover':
                team_stats[team_id]['ats_wins'] += 1
            elif ats_result == 'loss':
                team_stats[team_id]['ats_losses'] += 1
            elif ats_result == 'push':
                team_stats[team_id]['ats_pushes'] += 1

            # Home/Away ATS
            if is_home:
                if ats_result == 'cover':
                    team_stats[team_id]['home_ats_wins'] += 1
                elif ats_result == 'loss':
                    team_stats[team_id]['home_ats_losses'] += 1
            else:
                if ats_result == 'cover':
                    team_stats[team_id]['away_ats_wins'] += 1
                elif ats_result == 'loss':
                    team_stats[team_id]['away_ats_losses'] += 1

            # Favorite/Underdog ATS
            if is_favorite:
                if ats_result == 'cover':
                    team_stats[team_id]['favorite_ats_wins'] += 1
                elif ats_result == 'loss':
                    team_stats[team_id]['favorite_ats_losses'] += 1
            else:
                if ats_result == 'cover':
                    team_stats[team_id]['underdog_ats_wins'] += 1
                elif ats_result == 'loss':
                    team_stats[team_id]['underdog_ats_losses'] += 1

            # Over/Under (count once per team per game)
            if ou_result == 'over':
                team_stats[team_id]['over_record'] += 1
            elif ou_result == 'under':
                team_stats[team_id]['under_record'] += 1
            elif ou_result == 'push':
                team_stats[team_id]['ou_pushes'] += 1

    print(f"\n📊 Processing Summary:")
    print(f"  • Games with betting lines: {games_with_lines}")
    print(f"  • Games without lines: {games_without_lines}")

    return team_stats

def calculate_percentages(stats):
    """Calculate ATS cover percentages"""
    total_games = stats['ats_wins'] + stats['ats_losses']
    if total_games == 0:
        return None

    return round(stats['ats_wins'] / total_games, 3)

def save_ats_performance(cur, team_stats, season):
    """Save ATS performance to database"""
    print(f"\n💾 Saving ATS performance to database...")

    inserted = 0
    updated = 0

    for team_id, stats in team_stats.items():
        # Calculate overall ATS win percentage
        ats_win_pct = calculate_percentages(stats)

        if ats_win_pct is None:
            continue  # Skip teams with no ATS games

        # Insert or update
        cur.execute("""
            INSERT INTO ats_performance (
                team_id,
                season_id,
                ats_wins,
                ats_losses,
                ats_pushes,
                ats_win_pct,
                home_ats_wins,
                home_ats_losses,
                away_ats_wins,
                away_ats_losses,
                favorite_ats_wins,
                favorite_ats_losses,
                underdog_ats_wins,
                underdog_ats_losses,
                over_record,
                under_record,
                ou_pushes,
                last_updated
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP
            )
            ON CONFLICT (team_id, season_id) DO UPDATE SET
                ats_wins = EXCLUDED.ats_wins,
                ats_losses = EXCLUDED.ats_losses,
                ats_pushes = EXCLUDED.ats_pushes,
                ats_win_pct = EXCLUDED.ats_win_pct,
                home_ats_wins = EXCLUDED.home_ats_wins,
                home_ats_losses = EXCLUDED.home_ats_losses,
                away_ats_wins = EXCLUDED.away_ats_wins,
                away_ats_losses = EXCLUDED.away_ats_losses,
                favorite_ats_wins = EXCLUDED.favorite_ats_wins,
                favorite_ats_losses = EXCLUDED.favorite_ats_losses,
                underdog_ats_wins = EXCLUDED.underdog_ats_wins,
                underdog_ats_losses = EXCLUDED.underdog_ats_losses,
                over_record = EXCLUDED.over_record,
                under_record = EXCLUDED.under_record,
                ou_pushes = EXCLUDED.ou_pushes,
                last_updated = CURRENT_TIMESTAMP
        """, (
            team_id, season,
            stats['ats_wins'], stats['ats_losses'], stats['ats_pushes'],
            ats_win_pct,
            stats['home_ats_wins'], stats['home_ats_losses'],
            stats['away_ats_wins'], stats['away_ats_losses'],
            stats['favorite_ats_wins'], stats['favorite_ats_losses'],
            stats['underdog_ats_wins'], stats['underdog_ats_losses'],
            stats['over_record'], stats['under_record'], stats['ou_pushes']
        ))

        if cur.rowcount > 0:
            # Check if it was an insert or update
            cur.execute("""
                SELECT last_updated FROM ats_performance
                WHERE team_id = %s AND season_id = %s
            """, (team_id, season))
            inserted += 1

    print(f"  ✓ Processed {len(team_stats)} teams")

def print_ats_summary(cur, season, limit=None):
    """Print ATS performance summary"""
    print(f"\n{'='*100}")
    print(f"📊 ATS PERFORMANCE SUMMARY - {season} Season")
    print(f"{'='*100}\n")

    query = """
        SELECT
            t.abbreviation,
            t.full_name,
            a.ats_wins,
            a.ats_losses,
            a.ats_pushes,
            a.ats_win_pct,
            a.home_ats_wins,
            a.home_ats_losses,
            a.away_ats_wins,
            a.away_ats_losses,
            a.favorite_ats_wins,
            a.favorite_ats_losses,
            a.underdog_ats_wins,
            a.underdog_ats_losses,
            a.over_record,
            a.under_record
        FROM ats_performance a
        JOIN teams t ON a.team_id = t.team_id
        WHERE a.season_id = %s
        ORDER BY a.ats_win_pct DESC
    """

    if limit:
        query += f" LIMIT {limit}"

    cur.execute(query, (season,))
    teams = cur.fetchall()

    if not teams:
        print("⚠️  No ATS performance data found")
        return

    # Print header
    print(f"{'Team':<25} {'Overall ATS':<15} {'Home ATS':<15} {'Away ATS':<15} {'Fav ATS':<15} {'Dog ATS':<15} {'O/U':<10}")
    print(f"{'-'*25} {'-'*15} {'-'*15} {'-'*15} {'-'*15} {'-'*15} {'-'*10}")

    for team in teams:
        (abbr, name, ats_w, ats_l, ats_p, ats_pct,
         home_w, home_l, away_w, away_l,
         fav_w, fav_l, dog_w, dog_l, over, under) = team

        # Calculate percentages
        home_pct = (home_w / (home_w + home_l) * 100) if (home_w + home_l) > 0 else 0
        away_pct = (away_w / (away_w + away_l) * 100) if (away_w + away_l) > 0 else 0
        fav_pct = (fav_w / (fav_w + fav_l) * 100) if (fav_w + fav_l) > 0 else 0
        dog_pct = (dog_w / (dog_w + dog_l) * 100) if (dog_w + dog_l) > 0 else 0

        print(f"{abbr:<25} "
              f"{ats_w}-{ats_l}-{ats_p} ({ats_pct*100:.1f}%) "
              f"{home_w}-{home_l} ({home_pct:.1f}%) "
              f"{away_w}-{away_l} ({away_pct:.1f}%) "
              f"{fav_w}-{fav_l} ({fav_pct:.1f}%) "
              f"{dog_w}-{dog_l} ({dog_pct:.1f}%) "
              f"{over}-{under}")

    print(f"\n{'='*100}\n")

def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(
        description='Calculate Against The Spread (ATS) performance statistics',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 calculate_ats_performance.py                    # Current season
  python3 calculate_ats_performance.py --season 2024-25   # Specific season
  python3 calculate_ats_performance.py --verbose          # Detailed output
  python3 calculate_ats_performance.py --top 10           # Show top 10 teams only
        """
    )
    parser.add_argument('--season', type=str, help='Season to process (e.g., 2025-26)')
    parser.add_argument('--verbose', action='store_true', help='Show detailed game-by-game results')
    parser.add_argument('--top', type=int, help='Show only top N teams in summary')

    args = parser.parse_args()

    print("=" * 100)
    print("📊 ATS PERFORMANCE CALCULATOR")
    print("=" * 100)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get season
        season = args.season if args.season else get_current_season(cur)
        print(f"🏀 Processing season: {season}\n")

        # Aggregate ATS statistics
        team_stats = aggregate_ats_stats(cur, season, verbose=args.verbose)

        if not team_stats:
            print("\n⚠️  No ATS data to process. Make sure:")
            print("   1. Games are marked as 'Final' in the database")
            print("   2. Betting lines exist in the betting_lines table")
            print("   3. The specified season has completed games")
            cur.close()
            conn.close()
            return False

        # Save to database
        save_ats_performance(cur, team_stats, season)
        conn.commit()

        # Print summary
        print_ats_summary(cur, season, limit=args.top)

        print(f"✅ ATS performance calculation completed successfully!")
        print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

        cur.close()
        conn.close()
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
