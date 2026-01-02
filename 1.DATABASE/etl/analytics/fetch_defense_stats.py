#!/usr/bin/env python3
"""
Fetch Defense Dashboard Stats from stats.nba.com
Source: https://stats.nba.com/stats/leaguedashteamstats (MeasureType=Defense)

Metrics fetched:
- Opponent FG%, 3P%, FT%
- Defensive Rating
- Opponent Points Per Game
- Differential (how much worse opponents shoot vs their average)

Used for totals analysis:
- Strong defensive teams (high diff%) lower opponent scoring
- Weak defensive teams allow more points, higher totals
- Matchup-specific defense predictions
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

# NBA API Headers
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

# API Endpoint
TEAM_DEFENSE_URL = 'https://stats.nba.com/stats/leaguedashteamstats'


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


def fetch_team_defense_stats(season: str, season_type: str = 'Regular Season') -> list:
    """
    Fetch team defensive stats from NBA API

    Returns: List of team defensive records
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
        'MeasureType': 'Opponent',  # Key: Gets opponent stats (what they allow)
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
        print(f"  Fetching team defense stats for {season}...")
        response = requests.get(TEAM_DEFENSE_URL, headers=HEADERS, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        result_sets = data.get('resultSets', [])

        if not result_sets:
            print("    No result sets returned")
            return []

        headers_list = result_sets[0].get('headers', [])
        rows = result_sets[0].get('rowSet', [])

        print(f"    Found {len(rows)} team records")
        print(f"    Headers sample: {headers_list[:12]}...")

        teams = []
        for row in rows:
            team = dict(zip(headers_list, row))
            teams.append(team)

        return teams

    except requests.exceptions.RequestException as e:
        print(f"    ERROR fetching defense stats: {e}")
        return []


def fetch_team_advanced_defense(season: str, season_type: str = 'Regular Season') -> list:
    """
    Fetch advanced defensive metrics (Defensive Rating)

    Returns: List of team advanced records
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
        'MeasureType': 'Advanced',
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
        print(f"  Fetching advanced defense stats for {season}...")
        response = requests.get(TEAM_DEFENSE_URL, headers=HEADERS, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        result_sets = data.get('resultSets', [])

        if not result_sets:
            return []

        headers_list = result_sets[0].get('headers', [])
        rows = result_sets[0].get('rowSet', [])

        print(f"    Found {len(rows)} team records with advanced stats")

        teams = []
        for row in rows:
            team = dict(zip(headers_list, row))
            teams.append(team)

        return teams

    except requests.exceptions.RequestException as e:
        print(f"    ERROR fetching advanced defense: {e}")
        return []


def calculate_defensive_tier(def_rating: float, opp_fg_pct: float) -> str:
    """
    Classify team's defensive tier

    Returns: 'elite', 'good', 'average', 'poor'
    """
    # Defensive rating thresholds (lower is better)
    if def_rating <= 108.0:
        return 'elite'
    elif def_rating <= 112.0:
        return 'good'
    elif def_rating <= 116.0:
        return 'average'
    else:
        return 'poor'


def main():
    """Main entry point"""
    print("=" * 70)
    print("FETCH DEFENSE DASHBOARD FROM NBA.COM")
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

        # Fetch opponent stats (what teams allow)
        opp_stats = fetch_team_defense_stats(season)
        time.sleep(1)

        # Fetch advanced stats (defensive rating)
        adv_stats = fetch_team_advanced_defense(season)
        time.sleep(1)

        # Merge the data
        adv_map = {}
        if adv_stats:
            for team in adv_stats:
                team_id = team.get('TEAM_ID')
                if team_id:
                    adv_map[team_id] = team

        if opp_stats:
            print("\n" + "=" * 50)
            print("DEFENSIVE STATS SUMMARY")
            print("=" * 50)

            print(f"\nTeam Defense Rankings ({len(opp_stats)} teams):")
            print("-" * 75)
            print(f"{'Team':<20} {'DRtg':<8} {'Opp PTS':<10} {'Opp FG%':<10} {'Opp 3P%':<10} {'Tier':<8}")
            print("-" * 75)

            # Sort by points allowed
            opp_stats.sort(key=lambda x: float(x.get('PTS', 0) or 0))

            for team in opp_stats:
                team_id = team.get('TEAM_ID')
                team_name = team.get('TEAM_NAME', 'Unknown')

                # Get opponent (allowed) stats
                opp_pts = float(team.get('PTS', 0) or 0)
                opp_fg_pct = float(team.get('FG_PCT', 0) or 0)
                opp_3p_pct = float(team.get('FG3_PCT', 0) or 0)

                # Get defensive rating from advanced stats
                def_rating = 0.0
                if team_id in adv_map:
                    def_rating = float(adv_map[team_id].get('DEF_RATING', 0) or 0)

                tier = calculate_defensive_tier(def_rating, opp_fg_pct)
                tier_emoji = {
                    'elite': '🛡️', 'good': '✓', 'average': '➖', 'poor': '❌'
                }.get(tier, '❓')

                print(f"{team_name:<20} {def_rating:>6.1f}  {opp_pts:>8.1f}  "
                      f"{opp_fg_pct:>8.1%}  {opp_3p_pct:>8.1%}  {tier_emoji} {tier}")

            # Save to database (create a temporary summary table)
            # Note: In production, you'd want to save this to team_defense_stats per game

            print("\n" + "=" * 50)
            print("TOTALS BETTING INSIGHT - DEFENSE")
            print("=" * 50)

            # Identify elite and poor defenses
            elite_teams = [t for t in opp_stats if calculate_defensive_tier(
                float(adv_map.get(t.get('TEAM_ID'), {}).get('DEF_RATING', 115) or 115),
                float(t.get('FG_PCT', 0.46) or 0.46)
            ) == 'elite']

            poor_teams = [t for t in opp_stats if calculate_defensive_tier(
                float(adv_map.get(t.get('TEAM_ID'), {}).get('DEF_RATING', 115) or 115),
                float(t.get('FG_PCT', 0.46) or 0.46)
            ) == 'poor']

            print(f"\n🛡️ Elite Defenses ({len(elite_teams)} teams):")
            for t in elite_teams[:5]:
                print(f"   - {t.get('TEAM_NAME')}: {float(t.get('PTS', 0) or 0):.1f} PPG allowed")

            print(f"\n❌ Poor Defenses ({len(poor_teams)} teams):")
            for t in poor_teams[:5]:
                print(f"   - {t.get('TEAM_NAME')}: {float(t.get('PTS', 0) or 0):.1f} PPG allowed")

            print("\nBetting Implications:")
            print("  🛡️ Elite Defense vs Poor Offense: Strong UNDER signal (-3.0 adj)")
            print("  ❌ Poor Defense vs Elite Offense: Strong OVER signal (+3.0 adj)")
            print("  🛡️ Elite vs Elite Defense: Low-scoring, lean UNDER")
            print("  ❌ Poor vs Poor Defense: High variance, use other factors")

        cur.close()
        conn.close()

        print("\n✅ Defense dashboard fetch completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
