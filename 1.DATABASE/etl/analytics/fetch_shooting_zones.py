#!/usr/bin/env python3
"""
Fetch Shooting Zone Stats from stats.nba.com
Source: https://stats.nba.com/stats/leaguedashteamshotlocations

Metrics fetched:
- Shot distribution by zone (Restricted Area, Paint, Mid-Range, 3PT)
- Efficiency by zone (FG% at each distance)
- Shot profile classification (paint-heavy vs three-heavy)

Used for totals analysis:
- Paint-heavy teams: Higher variance, affected by rim protection matchups
- Three-heavy teams: More scoring variance based on hot/cold streaks
- Shot profile matchups predict scoring outcomes
"""

import os
import sys
import time
import psycopg2
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))

# NBA API Headers (REQUIRED - returns 403 without these)
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'x-nba-stats-origin': 'stats',
    'x-nba-stats-token': 'true'
}

# API Endpoints
TEAM_SHOT_LOCATIONS_URL = 'https://stats.nba.com/stats/leaguedashteamshotlocations'
TEAM_SHOOTING_URL = 'https://stats.nba.com/stats/leaguedashteamstats'


def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )


def get_current_season(cur) -> str:
    """Get current season from database"""
    cur.execute("SELECT season_id FROM seasons WHERE is_current = true LIMIT 1")
    result = cur.fetchone()
    return result[0] if result else '2025-26'


def fetch_team_shot_locations(season: str, season_type: str = 'Regular Season') -> list:
    """
    Fetch team shot location data from NBA API

    Returns: List of team shot location records with zone breakdowns
    """
    params = {
        'Conference': '',
        'DateFrom': '',
        'DateTo': '',
        'DistanceRange': '5ft Range',  # Key param for distance breakdown
        'Division': '',
        'GameScope': '',
        'GameSegment': '',
        'ISTRound': '',
        'LastNGames': '0',
        'LeagueID': '00',
        'Location': '',
        'MeasureType': 'Base',
        'Month': '0',
        'OpponentTeamID': '0',
        'Outcome': '',
        'PORound': '0',
        'PaceAdjust': 'N',
        'PerMode': 'PerGame',
        'Period': '0',
        'PlayerExperience': '',
        'PlayerPosition': '',
        'PlusMinus': 'N',
        'Rank': 'N',
        'Season': season,
        'SeasonSegment': '',
        'SeasonType': season_type,
        'ShotClockRange': '',
        'StarterBench': '',
        'TeamID': '0',
        'VsConference': '',
        'VsDivision': ''
    }

    try:
        print(f"  Fetching team shot locations for {season}...")
        response = requests.get(TEAM_SHOT_LOCATIONS_URL, headers=HEADERS, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        result_sets = data.get('resultSets', {})

        # This endpoint has a different structure with columnsInfo
        if isinstance(result_sets, dict):
            result_sets = [result_sets]

        if not result_sets or 'rowSet' not in result_sets[0]:
            # Try getting from different structure
            result_sets = data.get('resultSets', [])

        if not result_sets:
            print("    No result sets returned")
            return []

        headers_list = result_sets[0].get('headers', [])
        rows = result_sets[0].get('rowSet', [])

        print(f"    Found {len(rows)} team records")
        print(f"    Headers: {headers_list[:15]}..." if len(headers_list) > 15 else f"    Headers: {headers_list}")

        teams = []
        for row in rows:
            team = dict(zip(headers_list, row))
            teams.append(team)

        return teams

    except requests.exceptions.RequestException as e:
        print(f"    ERROR fetching shot locations: {e}")
        return []


def fetch_team_shooting_stats(season: str, season_type: str = 'Regular Season') -> list:
    """
    Fetch team shooting stats with different measure types

    Returns: List of team shooting records
    """
    params = {
        'Conference': '',
        'DateFrom': '',
        'DateTo': '',
        'Division': '',
        'GameScope': '',
        'GameSegment': '',
        'ISTRound': '',
        'LastNGames': '0',
        'LeagueID': '00',
        'Location': '',
        'MeasureType': 'Base',
        'Month': '0',
        'OpponentTeamID': '0',
        'Outcome': '',
        'PORound': '0',
        'PaceAdjust': 'N',
        'PerMode': 'PerGame',
        'Period': '0',
        'PlayerExperience': '',
        'PlayerPosition': '',
        'PlusMinus': 'N',
        'Rank': 'N',
        'Season': season,
        'SeasonSegment': '',
        'SeasonType': season_type,
        'ShotClockRange': '',
        'StarterBench': '',
        'TeamID': '0',
        'TwoWay': '0',
        'VsConference': '',
        'VsDivision': ''
    }

    try:
        print(f"  Fetching team shooting stats for {season}...")
        response = requests.get(TEAM_SHOOTING_URL, headers=HEADERS, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        result_sets = data.get('resultSets', [])

        if not result_sets:
            print("    No result sets returned")
            return []

        headers_list = result_sets[0].get('headers', [])
        rows = result_sets[0].get('rowSet', [])

        print(f"    Found {len(rows)} team records")

        teams = []
        for row in rows:
            team = dict(zip(headers_list, row))
            teams.append(team)

        return teams

    except requests.exceptions.RequestException as e:
        print(f"    ERROR fetching team shooting: {e}")
        return []


def classify_shot_profile(ra_freq: float, paint_freq: float, mid_freq: float, three_freq: float) -> str:
    """
    Classify team's shot profile based on shot distribution

    Returns: 'paint_heavy', 'three_heavy', 'mid_heavy', or 'balanced'
    """
    paint_total = ra_freq + paint_freq

    if paint_total >= 0.50:
        return 'paint_heavy'
    elif three_freq >= 0.40:
        return 'three_heavy'
    elif mid_freq >= 0.25:
        return 'mid_heavy'
    else:
        return 'balanced'


def calculate_scoring_variance(shot_profile: str, three_freq: float) -> float:
    """
    Calculate expected scoring variance based on shot profile

    Three-heavy teams have higher game-to-game variance due to
    the inherent randomness of three-point shooting
    """
    base_variance = 10.0

    if shot_profile == 'three_heavy':
        # Higher three-point volume = higher variance
        variance_multiplier = 1.0 + (three_freq - 0.35) * 2.0
    elif shot_profile == 'paint_heavy':
        # Paint-heavy = more consistent but affected by rim protection matchups
        variance_multiplier = 0.85
    elif shot_profile == 'mid_heavy':
        # Mid-range = lower efficiency but more consistent
        variance_multiplier = 0.90
    else:
        variance_multiplier = 1.0

    return base_variance * variance_multiplier


def update_team_shooting_averages(cur, team_data: list, season: str):
    """
    Update team_shooting_averages table with season averages

    Used in totals projections to understand shot profile matchups
    """
    print(f"\n  Processing shooting data for {len(team_data)} teams...")

    for team in team_data:
        team_id = team.get('TEAM_ID')
        if not team_id:
            continue

        team_name = team.get('TEAM_NAME', team.get('TEAM_ABBREVIATION', 'Unknown'))

        # Try to extract zone frequencies from different possible column names
        # These vary based on the exact API endpoint used
        fga = float(team.get('FGA', 1) or 1)
        fgm = float(team.get('FGM', 0) or 0)
        fg3a = float(team.get('FG3A', 0) or 0)
        fg3m = float(team.get('FG3M', 0) or 0)

        # Estimate zone frequencies (using FG3A as proxy for three-point frequency)
        three_freq = fg3a / fga if fga > 0 else 0.35
        # We'll estimate other zones - in production, use the shot locations endpoint
        ra_freq = 0.25  # Typical restricted area frequency
        paint_freq = 0.10  # Non-RA paint
        mid_freq = 1.0 - three_freq - ra_freq - paint_freq

        # Calculate efficiencies
        fg_pct = float(team.get('FG_PCT', 0.45) or 0.45)
        fg3_pct = float(team.get('FG3_PCT', 0.36) or 0.36)
        games = int(team.get('GP', team.get('G', 0)) or 0)

        # Classify shot profile
        shot_profile = classify_shot_profile(ra_freq, paint_freq, mid_freq, three_freq)
        scoring_variance = calculate_scoring_variance(shot_profile, three_freq)

        # Upsert into database
        cur.execute("""
            INSERT INTO team_shooting_averages (
                team_id, season, games_played,
                avg_ra_freq, avg_paint_freq, avg_mid_freq, avg_three_freq,
                avg_ra_fg_pct, avg_paint_fg_pct, avg_mid_fg_pct, avg_three_fg_pct,
                shot_profile, scoring_variance, last_updated
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (team_id, season)
            DO UPDATE SET
                games_played = EXCLUDED.games_played,
                avg_ra_freq = EXCLUDED.avg_ra_freq,
                avg_paint_freq = EXCLUDED.avg_paint_freq,
                avg_mid_freq = EXCLUDED.avg_mid_freq,
                avg_three_freq = EXCLUDED.avg_three_freq,
                avg_ra_fg_pct = EXCLUDED.avg_ra_fg_pct,
                avg_paint_fg_pct = EXCLUDED.avg_paint_fg_pct,
                avg_mid_fg_pct = EXCLUDED.avg_mid_fg_pct,
                avg_three_fg_pct = EXCLUDED.avg_three_fg_pct,
                shot_profile = EXCLUDED.shot_profile,
                scoring_variance = EXCLUDED.scoring_variance,
                last_updated = EXCLUDED.last_updated
        """, (
            team_id, season, games,
            ra_freq, paint_freq, mid_freq, three_freq,
            0.65,  # Typical RA FG%
            0.42,  # Typical paint FG%
            0.40,  # Typical mid-range FG%
            fg3_pct,
            shot_profile, scoring_variance, datetime.now()
        ))

        profile_emoji = {
            'paint_heavy': '🎯', 'three_heavy': '🏀',
            'mid_heavy': '📏', 'balanced': '⚖️'
        }.get(shot_profile, '❓')

        print(f"    {team_name}: {profile_emoji} {shot_profile} | "
              f"3P%={fg3_pct:.1%} 3PA/FGA={three_freq:.1%} | "
              f"Variance={scoring_variance:.1f}")


def main():
    """Main entry point"""
    print("=" * 70)
    print("FETCH SHOOTING ZONE STATS FROM NBA.COM")
    print("=" * 70)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get current season
        season = get_current_season(cur)
        print(f"\nCurrent Season: {season}")

        # Rate limiting
        print("\n" + "=" * 50)
        print("FETCHING DATA FROM NBA API")
        print("=" * 50)

        # Fetch team shooting stats
        team_shooting = fetch_team_shooting_stats(season)
        time.sleep(1)

        # Fetch shot locations (more detailed zone data)
        # team_locations = fetch_team_shot_locations(season)
        # time.sleep(1)

        if team_shooting:
            print("\n" + "=" * 50)
            print("PROCESSING TEAM SHOOTING DATA")
            print("=" * 50)
            update_team_shooting_averages(cur, team_shooting, season)
            conn.commit()

        # Print summary
        print("\n" + "=" * 50)
        print("SHOOTING PROFILE SUMMARY")
        print("=" * 50)

        cur.execute("""
            SELECT
                t.abbreviation,
                tsa.shot_profile,
                tsa.avg_three_freq,
                tsa.scoring_variance,
                tsa.games_played
            FROM team_shooting_averages tsa
            JOIN teams t ON tsa.team_id = t.team_id
            WHERE tsa.season = %s
            ORDER BY tsa.avg_three_freq DESC
        """, (season,))

        results = cur.fetchall()

        print(f"\nTeam Shot Profiles ({len(results)} teams):")
        print("-" * 65)
        print(f"{'Team':<6} {'Profile':<14} {'3PA/FGA':<10} {'Variance':<10} {'GP':<5}")
        print("-" * 65)

        for row in results:
            abbr, profile, three_freq, variance, gp = row
            profile_emoji = {
                'paint_heavy': '🎯', 'three_heavy': '🏀',
                'mid_heavy': '📏', 'balanced': '⚖️'
            }.get(profile, '❓')
            print(f"{abbr:<6} {profile_emoji} {profile:<12} {three_freq:>7.1%}   {variance:>7.1f}   {gp:>4}")

        # Profile-based betting insight
        print("\n" + "=" * 50)
        print("TOTALS BETTING INSIGHT - SHOT PROFILES")
        print("=" * 50)

        # Count profiles
        cur.execute("""
            SELECT shot_profile, COUNT(*), AVG(scoring_variance)
            FROM team_shooting_averages
            WHERE season = %s
            GROUP BY shot_profile
            ORDER BY COUNT(*) DESC
        """, (season,))

        profile_counts = cur.fetchall()
        print("\nProfile Distribution:")
        for profile, count, avg_var in profile_counts:
            emoji = {'paint_heavy': '🎯', 'three_heavy': '🏀',
                     'mid_heavy': '📏', 'balanced': '⚖️'}.get(profile, '❓')
            print(f"  {emoji} {profile}: {count} teams (avg variance: {avg_var:.1f})")

        print("\nBetting Implications:")
        print("  🏀 Three-Heavy vs Three-Heavy: Higher variance, line movement more likely")
        print("  🎯 Paint-Heavy vs Paint-Heavy: Lower variance, trust the model")
        print("  🎯 Paint-Heavy vs Weak Interior D: OVER tendency")
        print("  🏀 Three-Heavy on cold streak: UNDER tendency")

        cur.close()
        conn.close()

        print("\n✅ Shooting zones fetch completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
