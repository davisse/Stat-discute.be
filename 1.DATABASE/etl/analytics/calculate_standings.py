#!/usr/bin/env python3
"""
Calculate Team Standings
Calculate win/loss records, percentages, and rankings for current season
"""

import os
import sys
import psycopg2
from datetime import datetime
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

# NBA team conferences and divisions
TEAM_CONFERENCES = {
    # Eastern Conference
    'ATL': ('Eastern', 'Southeast'), 'BOS': ('Eastern', 'Atlantic'), 'BKN': ('Eastern', 'Atlantic'),
    'CHA': ('Eastern', 'Southeast'), 'CHI': ('Eastern', 'Central'), 'CLE': ('Eastern', 'Central'),
    'DET': ('Eastern', 'Central'), 'IND': ('Eastern', 'Central'), 'MIA': ('Eastern', 'Southeast'),
    'MIL': ('Eastern', 'Central'), 'NYK': ('Eastern', 'Atlantic'), 'ORL': ('Eastern', 'Southeast'),
    'PHI': ('Eastern', 'Atlantic'), 'TOR': ('Eastern', 'Atlantic'), 'WAS': ('Eastern', 'Southeast'),

    # Western Conference
    'DAL': ('Western', 'Southwest'), 'DEN': ('Western', 'Northwest'), 'GSW': ('Western', 'Pacific'),
    'HOU': ('Western', 'Southwest'), 'LAC': ('Western', 'Pacific'), 'LAL': ('Western', 'Pacific'),
    'MEM': ('Western', 'Southwest'), 'MIN': ('Western', 'Northwest'), 'NOP': ('Western', 'Southwest'),
    'OKC': ('Western', 'Northwest'), 'PHX': ('Western', 'Pacific'), 'POR': ('Western', 'Northwest'),
    'SAC': ('Western', 'Pacific'), 'SAS': ('Western', 'Southwest'), 'UTA': ('Western', 'Northwest'),
}

def calculate_streak(games_list):
    """
    Calculate current win/loss streak
    games_list: List of (is_win, game_date) tuples ordered by date DESC
    Returns: String like "W3" or "L2"
    """
    if not games_list:
        return None

    current_result = games_list[0][0]
    streak = 1

    for is_win, _ in games_list[1:]:
        if is_win == current_result:
            streak += 1
        else:
            break

    return f"{'W' if current_result else 'L'}{streak}"

def calculate_last_10(games_list):
    """
    Calculate record in last 10 games
    Returns: String like "7-3"
    """
    if not games_list:
        return None

    last_10 = games_list[:10]
    wins = sum(1 for is_win, _ in last_10 if is_win)
    losses = len(last_10) - wins

    return f"{wins}-{losses}"

def calculate_standings():
    """Calculate standings for current season"""
    print("=" * 80)
    print("🏆 CALCULATING TEAM STANDINGS")
    print("=" * 80)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get current season
        cur.execute("SELECT season_id FROM seasons WHERE is_current = true LIMIT 1")
        result = cur.fetchone()
        if not result:
            print("⚠️  No current season found")
            return False

        current_season = result[0]
        print(f"📅 Current season: {current_season}\n")

        # Get all teams
        cur.execute("SELECT team_id, abbreviation FROM teams")
        teams = cur.fetchall()

        inserted = 0
        updated = 0

        for team_id, team_abbr in teams:
            print(f"📊 Calculating standings for {team_abbr}...")

            # Get all games for this team
            cur.execute("""
                SELECT
                    CASE
                        WHEN home_team_id = %s THEN (home_team_score > away_team_score)
                        ELSE (away_team_score > home_team_score)
                    END as is_win,
                    CASE
                        WHEN home_team_id = %s THEN 'home'
                        ELSE 'away'
                    END as location,
                    CASE
                        WHEN home_team_id = %s THEN home_team_score
                        ELSE away_team_score
                    END as team_score,
                    CASE
                        WHEN home_team_id = %s THEN away_team_score
                        ELSE home_team_score
                    END as opp_score,
                    game_date
                FROM games
                WHERE (home_team_id = %s OR away_team_id = %s)
                  AND game_status = 'Final'
                  AND season = %s
                ORDER BY game_date DESC
            """, (team_id, team_id, team_id, team_id, team_id, team_id, current_season))

            games = cur.fetchall()

            if not games:
                print(f"  ⚠️  No games found for {team_abbr}")
                continue

            # Calculate record
            wins = sum(1 for is_win, _, _, _, _ in games if is_win)
            losses = len(games) - wins
            win_pct = wins / len(games) if len(games) > 0 else 0

            # Home/Away splits
            home_games = [(is_win, loc, score, opp, date) for is_win, loc, score, opp, date in games if loc == 'home']
            away_games = [(is_win, loc, score, opp, date) for is_win, loc, score, opp, date in games if loc == 'away']

            home_wins = sum(1 for is_win, _, _, _, _ in home_games if is_win)
            home_losses = len(home_games) - home_wins
            away_wins = sum(1 for is_win, _, _, _, _ in away_games if is_win)
            away_losses = len(away_games) - away_wins

            # Scoring averages
            points_for = sum(score for _, _, score, _, _ in games) / len(games)
            points_against = sum(opp for _, _, _, opp, _ in games) / len(games)
            point_diff = points_for - points_against

            # Calculate streak and last 10
            games_list = [(is_win, date) for is_win, _, _, _, date in games]
            streak = calculate_streak(games_list)
            last_10 = calculate_last_10(games_list)

            # Get conference and division
            conference, division = TEAM_CONFERENCES.get(team_abbr, (None, None))

            # Insert or update standings
            cur.execute("""
                INSERT INTO team_standings (
                    team_id, season_id,
                    wins, losses, win_pct,
                    home_wins, home_losses, away_wins, away_losses,
                    conference, division,
                    streak, last_10,
                    points_for, points_against, point_differential
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (team_id, season_id)
                DO UPDATE
                SET wins = EXCLUDED.wins,
                    losses = EXCLUDED.losses,
                    win_pct = EXCLUDED.win_pct,
                    home_wins = EXCLUDED.home_wins,
                    home_losses = EXCLUDED.home_losses,
                    away_wins = EXCLUDED.away_wins,
                    away_losses = EXCLUDED.away_losses,
                    streak = EXCLUDED.streak,
                    last_10 = EXCLUDED.last_10,
                    points_for = EXCLUDED.points_for,
                    points_against = EXCLUDED.points_against,
                    point_differential = EXCLUDED.point_differential,
                    last_updated = CURRENT_TIMESTAMP
                RETURNING (xmax = 0) AS inserted
            """, (
                team_id, current_season,
                wins, losses, win_pct,
                home_wins, home_losses, away_wins, away_losses,
                conference, division,
                streak, last_10,
                points_for, points_against, point_diff
            ))

            result = cur.fetchone()
            if result and result[0]:
                inserted += 1
            else:
                updated += 1

            print(f"  ✓ {team_abbr}: {wins}-{losses} ({win_pct:.3f}), {streak}, Last 10: {last_10}")

        # Calculate conference rankings
        for conference in ['Eastern', 'Western']:
            cur.execute("""
                UPDATE team_standings
                SET conference_rank = subquery.rank
                FROM (
                    SELECT
                        team_id,
                        ROW_NUMBER() OVER (ORDER BY win_pct DESC, wins DESC) as rank
                    FROM team_standings
                    WHERE season_id = %s AND conference = %s
                ) as subquery
                WHERE team_standings.team_id = subquery.team_id
                  AND team_standings.season_id = %s
            """, (current_season, conference, current_season))

        # Calculate division rankings
        for division in ['Atlantic', 'Central', 'Southeast', 'Northwest', 'Pacific', 'Southwest']:
            cur.execute("""
                UPDATE team_standings
                SET division_rank = subquery.rank
                FROM (
                    SELECT
                        team_id,
                        ROW_NUMBER() OVER (ORDER BY win_pct DESC, wins DESC) as rank
                    FROM team_standings
                    WHERE season_id = %s AND division = %s
                ) as subquery
                WHERE team_standings.team_id = subquery.team_id
                  AND team_standings.season_id = %s
            """, (current_season, division, current_season))

        # Calculate games behind leader for each conference
        for conference in ['Eastern', 'Western']:
            cur.execute("""
                SELECT MAX(wins) - MAX(losses) as leader_diff
                FROM team_standings
                WHERE season_id = %s AND conference = %s
            """, (current_season, conference))

            leader_diff = cur.fetchone()[0]

            cur.execute("""
                UPDATE team_standings
                SET games_behind = (%s - (wins - losses)) / 2.0
                WHERE season_id = %s AND conference = %s
            """, (leader_diff, current_season, conference))

        conn.commit()

        print(f"\n📊 Standings Calculation Summary:")
        print(f"  • Teams inserted: {inserted}")
        print(f"  • Teams updated: {updated}")
        print(f"  • Season: {current_season}")

        # Display standings by conference
        for conference in ['Eastern', 'Western']:
            print(f"\n{conference} Conference:")
            cur.execute("""
                SELECT
                    t.abbreviation,
                    ts.wins,
                    ts.losses,
                    ts.win_pct,
                    ts.games_behind,
                    ts.streak,
                    ts.last_10
                FROM team_standings ts
                JOIN teams t ON ts.team_id = t.team_id
                WHERE ts.season_id = %s AND ts.conference = %s
                ORDER BY ts.conference_rank
                LIMIT 5
            """, (current_season, conference))

            standings = cur.fetchall()
            for rank, (abbr, wins, losses, win_pct, gb, streak, last_10) in enumerate(standings, 1):
                gb_str = f"{gb:.1f}" if gb > 0 else "-"
                print(f"  {rank}. {abbr:3} {wins:2}-{losses:2} (.{int(win_pct*1000):03d}) GB: {gb_str:4} {streak:3} L10: {last_10}")

        cur.close()
        conn.close()

        print("\n✅ Standings calculation completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = calculate_standings()
    sys.exit(0 if success else 1)
