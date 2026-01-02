#!/usr/bin/env python3
"""
Fetch Hustle Stats from stats.nba.com
Source: https://stats.nba.com/stats/leaguehustlestatsplayer

Metrics fetched:
- Deflections
- Contested Shots (2PT, 3PT)
- Loose Balls Recovered (Off, Def)
- Charges Drawn
- Screen Assists and Points

Used for totals analysis: High hustle teams = higher defensive intensity = lower scoring
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
PLAYER_HUSTLE_URL = 'https://stats.nba.com/stats/leaguehustlestatsplayer'
TEAM_HUSTLE_URL = 'https://stats.nba.com/stats/leaguehustlestatsteam'


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


def fetch_player_hustle_stats(season: str, season_type: str = 'Regular Season') -> list:
    """
    Fetch player hustle stats from NBA API

    Returns list of player hustle records
    """
    params = {
        'College': '',
        'Conference': '',
        'Country': '',
        'DateFrom': '',
        'DateTo': '',
        'Division': '',
        'DraftPick': '',
        'DraftYear': '',
        'GameScope': '',
        'Height': '',
        'ISTRound': '',
        'LastNGames': '0',
        'LeagueID': '00',
        'Location': '',
        'Month': '0',
        'OpponentTeamID': '0',
        'Outcome': '',
        'PORound': '0',
        'PerMode': 'PerGame',
        'PlayerExperience': '',
        'PlayerPosition': '',
        'Season': season,
        'SeasonSegment': '',
        'SeasonType': season_type,
        'TeamID': '0',
        'VsConference': '',
        'VsDivision': '',
        'Weight': ''
    }

    try:
        print(f"  Fetching player hustle stats for {season}...")
        response = requests.get(PLAYER_HUSTLE_URL, headers=HEADERS, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        result_sets = data.get('resultSets', [])

        if not result_sets:
            print("    No result sets returned")
            return []

        # First result set contains player hustle stats
        headers_list = result_sets[0].get('headers', [])
        rows = result_sets[0].get('rowSet', [])

        print(f"    Found {len(rows)} player records")
        print(f"    Headers: {headers_list[:10]}...")

        # Convert to list of dicts
        players = []
        for row in rows:
            player = dict(zip(headers_list, row))
            players.append(player)

        return players

    except requests.exceptions.RequestException as e:
        print(f"    ERROR fetching hustle stats: {e}")
        return []


def fetch_team_hustle_stats(season: str, season_type: str = 'Regular Season') -> list:
    """
    Fetch team hustle stats from NBA API

    Returns list of team hustle records
    """
    params = {
        'Conference': '',
        'DateFrom': '',
        'DateTo': '',
        'Division': '',
        'GameScope': '',
        'ISTRound': '',
        'LastNGames': '0',
        'LeagueID': '00',
        'Location': '',
        'Month': '0',
        'OpponentTeamID': '0',
        'Outcome': '',
        'PORound': '0',
        'PerMode': 'PerGame',
        'Season': season,
        'SeasonSegment': '',
        'SeasonType': season_type,
        'TeamID': '0',
        'VsConference': '',
        'VsDivision': ''
    }

    try:
        print(f"  Fetching team hustle stats for {season}...")
        response = requests.get(TEAM_HUSTLE_URL, headers=HEADERS, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        result_sets = data.get('resultSets', [])

        if not result_sets:
            print("    No result sets returned")
            return []

        headers_list = result_sets[0].get('headers', [])
        rows = result_sets[0].get('rowSet', [])

        print(f"    Found {len(rows)} team records")
        print(f"    Headers: {headers_list}")

        teams = []
        for row in rows:
            team = dict(zip(headers_list, row))
            teams.append(team)

        return teams

    except requests.exceptions.RequestException as e:
        print(f"    ERROR fetching team hustle stats: {e}")
        return []


def calculate_hustle_intensity_score(deflections: float, contested: float, loose_balls: float) -> float:
    """
    Calculate composite hustle intensity score (0-100 scale)

    Weights based on correlation with defensive intensity:
    - Deflections: 40% (most predictive of opponent turnovers)
    - Contested Shots: 40% (directly impacts opponent FG%)
    - Loose Balls: 20% (effort metric)
    """
    # Normalize to league averages (approximate)
    deflections_norm = min(deflections / 20.0, 1.5)  # League avg ~14-16
    contested_norm = min(contested / 60.0, 1.5)      # League avg ~45-50
    loose_balls_norm = min(loose_balls / 12.0, 1.5)  # League avg ~8-10

    # Weighted composite
    raw_score = (deflections_norm * 0.4 + contested_norm * 0.4 + loose_balls_norm * 0.2)

    # Scale to 0-100
    return min(raw_score * 66.67, 100.0)


def classify_hustle_tier(score: float) -> str:
    """Classify team into hustle tier based on intensity score"""
    if score >= 65:
        return 'high'
    elif score >= 45:
        return 'medium'
    else:
        return 'low'


def update_team_hustle_averages(cur, team_data: list, season: str):
    """
    Update team_hustle_averages table with season averages

    This data is used in totals projections
    """
    print(f"\n  Updating team hustle averages for {len(team_data)} teams...")

    for team in team_data:
        team_id = team.get('TEAM_ID')
        if not team_id:
            continue

        # Extract metrics (handle both possible column names)
        deflections = float(team.get('DEFLECTIONS', team.get('DEF', 0)) or 0)
        contested = float(team.get('CONTESTED_SHOTS', team.get('CONTESTED_SHOTS_2PT', 0)) or 0)
        if 'CONTESTED_SHOTS_3PT' in team:
            contested += float(team.get('CONTESTED_SHOTS_3PT', 0) or 0)
        loose_balls = float(team.get('LOOSE_BALLS_RECOVERED', 0) or 0)
        charges = float(team.get('CHARGES_DRAWN', 0) or 0)
        screen_assists = float(team.get('SCREEN_ASSISTS', team.get('SCREEN_AST', 0)) or 0)
        games = int(team.get('GP', team.get('G', 0)) or 0)

        # Calculate intensity score
        intensity_score = calculate_hustle_intensity_score(deflections, contested, loose_balls)
        tier = classify_hustle_tier(intensity_score)

        # Upsert into database
        cur.execute("""
            INSERT INTO team_hustle_averages (
                team_id, season, games_played,
                avg_deflections, avg_contested_shots, avg_loose_balls,
                avg_charges_drawn, avg_screen_assists,
                hustle_intensity_score, hustle_tier, last_updated
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (team_id, season)
            DO UPDATE SET
                games_played = EXCLUDED.games_played,
                avg_deflections = EXCLUDED.avg_deflections,
                avg_contested_shots = EXCLUDED.avg_contested_shots,
                avg_loose_balls = EXCLUDED.avg_loose_balls,
                avg_charges_drawn = EXCLUDED.avg_charges_drawn,
                avg_screen_assists = EXCLUDED.avg_screen_assists,
                hustle_intensity_score = EXCLUDED.hustle_intensity_score,
                hustle_tier = EXCLUDED.hustle_tier,
                last_updated = EXCLUDED.last_updated
        """, (
            team_id, season, games,
            deflections, contested, loose_balls,
            charges, screen_assists,
            intensity_score, tier, datetime.now()
        ))

        print(f"    {team.get('TEAM_NAME', team.get('TEAM_ABBREVIATION', 'Unknown'))}: "
              f"Score={intensity_score:.1f} ({tier}) | "
              f"DEF={deflections:.1f} CONT={contested:.1f} LB={loose_balls:.1f}")


def main():
    """Main entry point"""
    print("=" * 70)
    print("FETCH HUSTLE STATS FROM NBA.COM")
    print("=" * 70)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get current season
        season = get_current_season(cur)
        print(f"\nCurrent Season: {season}")

        # Rate limiting - be respectful to NBA API
        print("\n" + "=" * 50)
        print("FETCHING DATA FROM NBA API")
        print("=" * 50)

        # Fetch team hustle stats
        team_data = fetch_team_hustle_stats(season)
        time.sleep(1)  # Rate limit

        # Fetch player hustle stats (optional, for player-level analysis)
        player_data = fetch_player_hustle_stats(season)
        time.sleep(1)

        if team_data:
            print("\n" + "=" * 50)
            print("PROCESSING TEAM HUSTLE DATA")
            print("=" * 50)
            update_team_hustle_averages(cur, team_data, season)
            conn.commit()

        # Print summary
        print("\n" + "=" * 50)
        print("HUSTLE STATS SUMMARY")
        print("=" * 50)

        cur.execute("""
            SELECT
                t.abbreviation,
                tha.hustle_intensity_score,
                tha.hustle_tier,
                tha.avg_deflections,
                tha.avg_contested_shots
            FROM team_hustle_averages tha
            JOIN teams t ON tha.team_id = t.team_id
            WHERE tha.season = %s
            ORDER BY tha.hustle_intensity_score DESC
        """, (season,))

        results = cur.fetchall()
        print(f"\nTeam Hustle Rankings ({len(results)} teams):")
        print("-" * 60)
        print(f"{'Rank':<5} {'Team':<6} {'Score':<8} {'Tier':<8} {'Defl':<8} {'Contest':<8}")
        print("-" * 60)

        for i, row in enumerate(results, 1):
            abbr, score, tier, defl, contest = row
            tier_emoji = {'high': '🔥', 'medium': '➖', 'low': '❄️'}.get(tier, '❓')
            print(f"{i:<5} {abbr:<6} {score:>6.1f}  {tier_emoji} {tier:<6} {defl:>6.1f}  {contest:>6.1f}")

        # Betting insight
        print("\n" + "=" * 50)
        print("TOTALS BETTING INSIGHT")
        print("=" * 50)
        print("High Hustle Teams (score >= 65):")
        print("  → Better defensive intensity → Lower opponent scoring")
        print("  → UNDER tendency when facing low-hustle teams")
        print("\nLow Hustle Teams (score < 45):")
        print("  → Weaker defensive effort → Higher opponent scoring")
        print("  → OVER tendency when facing high-pace offenses")

        cur.close()
        conn.close()

        print("\n✅ Hustle stats fetch completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
