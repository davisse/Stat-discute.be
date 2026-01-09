#!/usr/bin/env python3
"""
Fetch Shooting Zone Stats from stats.nba.com
Source: https://stats.nba.com/stats/leaguedashteamshotlocations

Fetches BOTH offensive and defensive zone data:
- OFFENSE (MeasureType=Base): Team's own shot distribution and efficiency
- DEFENSE (MeasureType=Opponent): Opponent shots against the team (defensive analysis)

Zone structure from API:
- Restricted Area (0-4ft): High efficiency shots near rim
- In The Paint Non-RA (4-14ft): Floaters, post-ups
- Mid-Range (14-24ft): Pull-up jumpers, fadeaways
- Corner 3 (combined): Catch-and-shoot corner threes
- Above the Break 3: Arc threes (most common 3PT)

Used for:
- Offensive profiles: paint_heavy, three_heavy, mid_heavy, balanced
- Defensive profiles: paint_protector, perimeter_defender, balanced_defense
- Identifying defensive strengths/weaknesses by zone
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

# Threshold for identifying strengths/weaknesses (percentage points)
STRENGTH_THRESHOLD = -2.0  # Below league avg by 2% = strength
WEAKNESS_THRESHOLD = 2.0   # Above league avg by 2% = weakness


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


def fetch_team_shot_locations(season: str, measure_type: str = 'Base', season_type: str = 'Regular Season') -> list:
    """
    Fetch team shot location data from NBA API

    Args:
        season: Season string like '2025-26'
        measure_type: 'Base' for team shots, 'Opponent' for opponent shots against
        season_type: 'Regular Season' or 'Playoffs'

    Returns: List of team shot location records with zone breakdowns

    API Response Structure (per row):
    [0] TEAM_ID
    [1] TEAM_NAME
    [2-4] Restricted Area: FGM, FGA, FG_PCT
    [5-7] In The Paint (Non-RA): FGM, FGA, FG_PCT
    [8-10] Mid-Range: FGM, FGA, FG_PCT
    [11-13] Left Corner 3: FGM, FGA, FG_PCT
    [14-16] Right Corner 3: FGM, FGA, FG_PCT
    [17-19] Above the Break 3: FGM, FGA, FG_PCT
    [20-22] Backcourt: FGM, FGA, FG_PCT (usually 0)
    [23-25] Corner 3 (combined): FGM, FGA, FG_PCT
    """
    params = {
        'Conference': '',
        'DateFrom': '',
        'DateTo': '',
        'DistanceRange': 'By Zone',
        'Division': '',
        'GameScope': '',
        'GameSegment': '',
        'ISTRound': '',
        'LastNGames': '0',
        'LeagueID': '00',
        'Location': '',
        'MeasureType': measure_type,
        'Month': '0',
        'OpponentTeamID': '0',
        'Outcome': '',
        'PORound': '0',
        'PaceAdjust': 'N',
        'PerMode': 'Totals',  # Changed to Totals for accurate counting
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

    zone_label = "OFFENSIVE" if measure_type == 'Base' else "DEFENSIVE"

    try:
        print(f"  Fetching {zone_label} zone data for {season} (MeasureType={measure_type})...")
        response = requests.get(TEAM_SHOT_LOCATIONS_URL, headers=HEADERS, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        result_sets = data.get('resultSets', {})
        rows = result_sets.get('rowSet', [])

        if not rows:
            print("    No data returned")
            return []

        print(f"    Found {len(rows)} team records")

        teams = []
        for row in rows:
            team = {
                'team_id': row[0],
                'team_name': row[1],
                # Restricted Area (0-4ft)
                'ra_fgm': row[2] or 0,
                'ra_fga': row[3] or 0,
                'ra_fg_pct': row[4] or 0,
                # In The Paint Non-RA (4-14ft)
                'paint_fgm': row[5] or 0,
                'paint_fga': row[6] or 0,
                'paint_fg_pct': row[7] or 0,
                # Mid-Range (14-24ft)
                'mid_fgm': row[8] or 0,
                'mid_fga': row[9] or 0,
                'mid_fg_pct': row[10] or 0,
                # Left Corner 3
                'lc3_fgm': row[11] or 0,
                'lc3_fga': row[12] or 0,
                'lc3_fg_pct': row[13] or 0,
                # Right Corner 3
                'rc3_fgm': row[14] or 0,
                'rc3_fga': row[15] or 0,
                'rc3_fg_pct': row[16] or 0,
                # Above the Break 3
                'ab3_fgm': row[17] or 0,
                'ab3_fga': row[18] or 0,
                'ab3_fg_pct': row[19] or 0,
                # Corner 3 Combined
                'corner3_fgm': row[23] or 0,
                'corner3_fga': row[24] or 0,
                'corner3_fg_pct': row[25] or 0,
            }
            teams.append(team)

        return teams

    except requests.exceptions.RequestException as e:
        print(f"    ERROR fetching {zone_label} zone data: {e}")
        return []


def calculate_league_averages(team_data: list) -> dict:
    """Calculate league-wide averages for each zone"""
    totals = {
        'ra_fgm': 0, 'ra_fga': 0,
        'paint_fgm': 0, 'paint_fga': 0,
        'mid_fgm': 0, 'mid_fga': 0,
        'corner3_fgm': 0, 'corner3_fga': 0,
        'ab3_fgm': 0, 'ab3_fga': 0,
        'total_fga': 0
    }

    for team in team_data:
        totals['ra_fgm'] += team['ra_fgm']
        totals['ra_fga'] += team['ra_fga']
        totals['paint_fgm'] += team['paint_fgm']
        totals['paint_fga'] += team['paint_fga']
        totals['mid_fgm'] += team['mid_fgm']
        totals['mid_fga'] += team['mid_fga']
        totals['corner3_fgm'] += team['corner3_fgm']
        totals['corner3_fga'] += team['corner3_fga']
        totals['ab3_fgm'] += team['ab3_fgm']
        totals['ab3_fga'] += team['ab3_fga']

    # Calculate total FGA
    totals['total_fga'] = (
        totals['ra_fga'] + totals['paint_fga'] + totals['mid_fga'] +
        totals['corner3_fga'] + totals['ab3_fga']
    )

    if totals['total_fga'] == 0:
        return {}

    return {
        'ra_fg_pct': totals['ra_fgm'] / totals['ra_fga'] if totals['ra_fga'] > 0 else 0,
        'ra_freq': totals['ra_fga'] / totals['total_fga'],
        'paint_fg_pct': totals['paint_fgm'] / totals['paint_fga'] if totals['paint_fga'] > 0 else 0,
        'paint_freq': totals['paint_fga'] / totals['total_fga'],
        'mid_fg_pct': totals['mid_fgm'] / totals['mid_fga'] if totals['mid_fga'] > 0 else 0,
        'mid_freq': totals['mid_fga'] / totals['total_fga'],
        'corner3_fg_pct': totals['corner3_fgm'] / totals['corner3_fga'] if totals['corner3_fga'] > 0 else 0,
        'corner3_freq': totals['corner3_fga'] / totals['total_fga'],
        'ab3_fg_pct': totals['ab3_fgm'] / totals['ab3_fga'] if totals['ab3_fga'] > 0 else 0,
        'ab3_freq': totals['ab3_fga'] / totals['total_fga'],
    }


def classify_offensive_profile(ra_freq: float, paint_freq: float, mid_freq: float, three_freq: float) -> str:
    """
    Classify team's offensive shot profile based on shot distribution

    Returns: 'paint_heavy', 'three_heavy', 'mid_heavy', or 'balanced'
    """
    paint_total = ra_freq + paint_freq

    if paint_total >= 0.50:
        return 'paint_heavy'
    elif three_freq >= 0.40:
        return 'three_heavy'
    elif mid_freq >= 0.20:
        return 'mid_heavy'
    else:
        return 'balanced'


def classify_defensive_profile(strengths: list, weaknesses: list) -> str:
    """
    Classify team's defensive profile based on identified strengths/weaknesses

    Returns: 'paint_protector', 'perimeter_defender', 'rim_weak', 'perimeter_weak', 'balanced_defense'
    """
    paint_zones = ['ra', 'paint']
    perimeter_zones = ['corner3', 'ab3', 'mid']

    # Check for paint protection
    paint_strength = any(z in strengths for z in paint_zones)
    paint_weakness = any(z in weaknesses for z in paint_zones)

    # Check for perimeter defense
    perimeter_strength = any(z in strengths for z in perimeter_zones)
    perimeter_weakness = any(z in weaknesses for z in perimeter_zones)

    if paint_strength and not paint_weakness:
        return 'paint_protector'
    elif perimeter_strength and not perimeter_weakness:
        return 'perimeter_defender'
    elif paint_weakness:
        return 'rim_weak'
    elif perimeter_weakness:
        return 'perimeter_weak'
    else:
        return 'balanced_defense'


def identify_strengths_weaknesses(team: dict, league_avg: dict) -> tuple:
    """
    Identify defensive strengths and weaknesses based on FG% allowed vs league avg

    Strength = zone where opponents shoot BELOW league avg FG%
    Weakness = zone where opponents shoot ABOVE league avg FG%

    Returns: (strengths: list, weaknesses: list)
    """
    strengths = []
    weaknesses = []

    zones = [
        ('ra', 'Restricted Area'),
        ('paint', 'Paint'),
        ('mid', 'Mid-Range'),
        ('corner3', 'Corner 3'),
        ('ab3', 'Above Break 3')
    ]

    for zone_key, zone_name in zones:
        team_pct = team.get(f'{zone_key}_fg_pct', 0) or 0
        league_pct = league_avg.get(f'{zone_key}_fg_pct', 0) or 0

        diff = (team_pct - league_pct) * 100  # Convert to percentage points

        if diff <= STRENGTH_THRESHOLD:
            strengths.append(zone_key)
        elif diff >= WEAKNESS_THRESHOLD:
            weaknesses.append(zone_key)

    return strengths, weaknesses


def process_team_zone_data(team: dict, zone_type: str, league_avg: dict) -> dict:
    """Process a single team's zone data and calculate derived metrics"""

    # Calculate total FGA
    total_fga = (
        team['ra_fga'] + team['paint_fga'] + team['mid_fga'] +
        team['corner3_fga'] + team['ab3_fga']
    )

    if total_fga == 0:
        return None

    total_fgm = (
        team['ra_fgm'] + team['paint_fgm'] + team['mid_fgm'] +
        team['corner3_fgm'] + team['ab3_fgm']
    )

    # Calculate frequencies
    ra_freq = team['ra_fga'] / total_fga
    paint_freq = team['paint_fga'] / total_fga
    mid_freq = team['mid_fga'] / total_fga
    corner3_freq = team['corner3_fga'] / total_fga
    ab3_freq = team['ab3_fga'] / total_fga
    three_freq = corner3_freq + ab3_freq

    # Determine profile and strengths/weaknesses
    if zone_type == 'offense':
        profile = classify_offensive_profile(ra_freq, paint_freq, mid_freq, three_freq)
        strengths = None
        weaknesses = None
    else:
        strengths, weaknesses = identify_strengths_weaknesses(team, league_avg)
        profile = classify_defensive_profile(strengths, weaknesses)

    return {
        'team_id': team['team_id'],
        'team_name': team['team_name'],
        'zone_type': zone_type,
        'ra_fgm': team['ra_fgm'],
        'ra_fga': team['ra_fga'],
        'ra_fg_pct': team['ra_fg_pct'],
        'ra_freq': ra_freq,
        'paint_fgm': team['paint_fgm'],
        'paint_fga': team['paint_fga'],
        'paint_fg_pct': team['paint_fg_pct'],
        'paint_freq': paint_freq,
        'mid_fgm': team['mid_fgm'],
        'mid_fga': team['mid_fga'],
        'mid_fg_pct': team['mid_fg_pct'],
        'mid_freq': mid_freq,
        'corner3_fgm': team['corner3_fgm'],
        'corner3_fga': team['corner3_fga'],
        'corner3_fg_pct': team['corner3_fg_pct'],
        'corner3_freq': corner3_freq,
        'ab3_fgm': team['ab3_fgm'],
        'ab3_fga': team['ab3_fga'],
        'ab3_fg_pct': team['ab3_fg_pct'],
        'ab3_freq': ab3_freq,
        'lc3_fgm': team['lc3_fgm'],
        'lc3_fga': team['lc3_fga'],
        'lc3_fg_pct': team['lc3_fg_pct'],
        'rc3_fgm': team['rc3_fgm'],
        'rc3_fga': team['rc3_fga'],
        'rc3_fg_pct': team['rc3_fg_pct'],
        'total_fgm': total_fgm,
        'total_fga': total_fga,
        'total_fg_pct': total_fgm / total_fga if total_fga > 0 else 0,
        'profile': profile,
        'strengths': strengths,
        'weaknesses': weaknesses,
    }


def save_league_averages(cur, league_avg: dict, season: str, zone_type: str):
    """Save league averages to database"""
    cur.execute("""
        INSERT INTO league_zone_averages (
            season, zone_type,
            ra_fg_pct, ra_freq,
            paint_fg_pct, paint_freq,
            mid_fg_pct, mid_freq,
            corner3_fg_pct, corner3_freq,
            ab3_fg_pct, ab3_freq,
            updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (season, zone_type)
        DO UPDATE SET
            ra_fg_pct = EXCLUDED.ra_fg_pct,
            ra_freq = EXCLUDED.ra_freq,
            paint_fg_pct = EXCLUDED.paint_fg_pct,
            paint_freq = EXCLUDED.paint_freq,
            mid_fg_pct = EXCLUDED.mid_fg_pct,
            mid_freq = EXCLUDED.mid_freq,
            corner3_fg_pct = EXCLUDED.corner3_fg_pct,
            corner3_freq = EXCLUDED.corner3_freq,
            ab3_fg_pct = EXCLUDED.ab3_fg_pct,
            ab3_freq = EXCLUDED.ab3_freq,
            updated_at = EXCLUDED.updated_at
    """, (
        season, zone_type,
        league_avg.get('ra_fg_pct', 0),
        league_avg.get('ra_freq', 0),
        league_avg.get('paint_fg_pct', 0),
        league_avg.get('paint_freq', 0),
        league_avg.get('mid_fg_pct', 0),
        league_avg.get('mid_freq', 0),
        league_avg.get('corner3_fg_pct', 0),
        league_avg.get('corner3_freq', 0),
        league_avg.get('ab3_fg_pct', 0),
        league_avg.get('ab3_freq', 0),
        datetime.now()
    ))


def save_team_zone_data(cur, processed: dict, season: str):
    """Save processed team zone data to database"""
    cur.execute("""
        INSERT INTO team_shooting_zones (
            team_id, season, zone_type,
            ra_fgm, ra_fga, ra_fg_pct, ra_freq,
            paint_fgm, paint_fga, paint_fg_pct, paint_freq,
            mid_fgm, mid_fga, mid_fg_pct, mid_freq,
            corner3_fgm, corner3_fga, corner3_fg_pct, corner3_freq,
            ab3_fgm, ab3_fga, ab3_fg_pct, ab3_freq,
            lc3_fgm, lc3_fga, lc3_fg_pct,
            rc3_fgm, rc3_fga, rc3_fg_pct,
            total_fgm, total_fga, total_fg_pct,
            profile, strengths, weaknesses, updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (team_id, season, zone_type)
        DO UPDATE SET
            ra_fgm = EXCLUDED.ra_fgm,
            ra_fga = EXCLUDED.ra_fga,
            ra_fg_pct = EXCLUDED.ra_fg_pct,
            ra_freq = EXCLUDED.ra_freq,
            paint_fgm = EXCLUDED.paint_fgm,
            paint_fga = EXCLUDED.paint_fga,
            paint_fg_pct = EXCLUDED.paint_fg_pct,
            paint_freq = EXCLUDED.paint_freq,
            mid_fgm = EXCLUDED.mid_fgm,
            mid_fga = EXCLUDED.mid_fga,
            mid_fg_pct = EXCLUDED.mid_fg_pct,
            mid_freq = EXCLUDED.mid_freq,
            corner3_fgm = EXCLUDED.corner3_fgm,
            corner3_fga = EXCLUDED.corner3_fga,
            corner3_fg_pct = EXCLUDED.corner3_fg_pct,
            corner3_freq = EXCLUDED.corner3_freq,
            ab3_fgm = EXCLUDED.ab3_fgm,
            ab3_fga = EXCLUDED.ab3_fga,
            ab3_fg_pct = EXCLUDED.ab3_fg_pct,
            ab3_freq = EXCLUDED.ab3_freq,
            lc3_fgm = EXCLUDED.lc3_fgm,
            lc3_fga = EXCLUDED.lc3_fga,
            lc3_fg_pct = EXCLUDED.lc3_fg_pct,
            rc3_fgm = EXCLUDED.rc3_fgm,
            rc3_fga = EXCLUDED.rc3_fga,
            rc3_fg_pct = EXCLUDED.rc3_fg_pct,
            total_fgm = EXCLUDED.total_fgm,
            total_fga = EXCLUDED.total_fga,
            total_fg_pct = EXCLUDED.total_fg_pct,
            profile = EXCLUDED.profile,
            strengths = EXCLUDED.strengths,
            weaknesses = EXCLUDED.weaknesses,
            updated_at = EXCLUDED.updated_at
    """, (
        processed['team_id'], season, processed['zone_type'],
        processed['ra_fgm'], processed['ra_fga'], processed['ra_fg_pct'], processed['ra_freq'],
        processed['paint_fgm'], processed['paint_fga'], processed['paint_fg_pct'], processed['paint_freq'],
        processed['mid_fgm'], processed['mid_fga'], processed['mid_fg_pct'], processed['mid_freq'],
        processed['corner3_fgm'], processed['corner3_fga'], processed['corner3_fg_pct'], processed['corner3_freq'],
        processed['ab3_fgm'], processed['ab3_fga'], processed['ab3_fg_pct'], processed['ab3_freq'],
        processed['lc3_fgm'], processed['lc3_fga'], processed['lc3_fg_pct'],
        processed['rc3_fgm'], processed['rc3_fga'], processed['rc3_fg_pct'],
        processed['total_fgm'], processed['total_fga'], processed['total_fg_pct'],
        processed['profile'], processed['strengths'], processed['weaknesses'],
        datetime.now()
    ))


def print_zone_summary(processed_data: list, zone_type: str, league_avg: dict):
    """Print formatted summary of zone data"""
    type_label = "OFFENSIVE" if zone_type == 'offense' else "DEFENSIVE"
    print(f"\n{type_label} ZONE SUMMARY:")
    print("-" * 110)

    if zone_type == 'offense':
        print(f"{'Team':<22} {'Profile':<14} | {'RA%':>6} {'Paint%':>7} {'Mid%':>6} {'3PT%':>6} | {'RA FG%':>7} {'Mid FG%':>7} {'3P FG%':>7}")
    else:
        print(f"{'Team':<22} {'Profile':<18} | {'RA FG%':>7} {'Paint FG%':>9} {'Mid FG%':>8} {'3P FG%':>7} | {'Strengths':<15} {'Weaknesses':<15}")

    print("-" * 110)

    # Sort by profile for readability
    sorted_data = sorted(processed_data, key=lambda x: (x['profile'], x['team_name']))

    for p in sorted_data:
        profile_emoji = {
            'paint_heavy': '🎯', 'three_heavy': '🏀', 'mid_heavy': '📏', 'balanced': '⚖️',
            'paint_protector': '🛡️', 'perimeter_defender': '🎯', 'balanced_defense': '⚖️',
            'rim_weak': '⚠️', 'perimeter_weak': '🔥'
        }.get(p['profile'], '❓')

        if zone_type == 'offense':
            three_freq = p['corner3_freq'] + p['ab3_freq']
            print(f"{p['team_name']:<22} {profile_emoji} {p['profile']:<12} | "
                  f"{p['ra_freq']:>5.1%} {p['paint_freq']:>6.1%} {p['mid_freq']:>5.1%} {three_freq:>5.1%} | "
                  f"{p['ra_fg_pct']:>6.1%} {p['mid_fg_pct']:>6.1%} {p['corner3_fg_pct']:>6.1%}")
        else:
            strengths_str = ','.join(p['strengths'] or []) or '-'
            weaknesses_str = ','.join(p['weaknesses'] or []) or '-'
            print(f"{p['team_name']:<22} {profile_emoji} {p['profile']:<16} | "
                  f"{p['ra_fg_pct']:>6.1%} {p['paint_fg_pct']:>8.1%} {p['mid_fg_pct']:>7.1%} {p['ab3_fg_pct']:>6.1%} | "
                  f"{strengths_str:<15} {weaknesses_str:<15}")

    # Print league averages
    print("-" * 110)
    print(f"{'LEAGUE AVG':<22} {'':14} | ", end='')
    if zone_type == 'offense':
        three_freq_avg = league_avg.get('corner3_freq', 0) + league_avg.get('ab3_freq', 0)
        print(f"{league_avg.get('ra_freq', 0):>5.1%} {league_avg.get('paint_freq', 0):>6.1%} "
              f"{league_avg.get('mid_freq', 0):>5.1%} {three_freq_avg:>5.1%} | "
              f"{league_avg.get('ra_fg_pct', 0):>6.1%} {league_avg.get('mid_fg_pct', 0):>6.1%} "
              f"{league_avg.get('corner3_fg_pct', 0):>6.1%}")
    else:
        print(f"{league_avg.get('ra_fg_pct', 0):>6.1%} {league_avg.get('paint_fg_pct', 0):>8.1%} "
              f"{league_avg.get('mid_fg_pct', 0):>7.1%} {league_avg.get('ab3_fg_pct', 0):>6.1%}")


def main():
    """Main entry point"""
    print("=" * 80)
    print("FETCH TEAM SHOOTING ZONES - OFFENSE & DEFENSE")
    print("=" * 80)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get current season
        season = get_current_season(cur)
        print(f"\nCurrent Season: {season}")

        # ===========================================
        # STEP 1: Fetch OFFENSIVE zone data
        # ===========================================
        print("\n" + "=" * 60)
        print("STEP 1: OFFENSIVE ZONE DATA (Team's own shots)")
        print("=" * 60)

        offense_data = fetch_team_shot_locations(season, measure_type='Base')
        time.sleep(1.5)  # Rate limiting between API calls

        if not offense_data:
            print("  ERROR: No offensive data fetched")
            return False

        # Calculate league averages for offense
        league_avg_offense = calculate_league_averages(offense_data)
        save_league_averages(cur, league_avg_offense, season, 'offense')

        # Process and save offensive data
        processed_offense = []
        for team in offense_data:
            processed = process_team_zone_data(team, 'offense', league_avg_offense)
            if processed:
                processed_offense.append(processed)
                save_team_zone_data(cur, processed, season)

        print_zone_summary(processed_offense, 'offense', league_avg_offense)
        conn.commit()

        # ===========================================
        # STEP 2: Fetch DEFENSIVE zone data
        # ===========================================
        print("\n" + "=" * 60)
        print("STEP 2: DEFENSIVE ZONE DATA (Opponent shots against)")
        print("=" * 60)

        defense_data = fetch_team_shot_locations(season, measure_type='Opponent')
        time.sleep(1.5)

        if not defense_data:
            print("  ERROR: No defensive data fetched")
            return False

        # Calculate league averages for defense
        league_avg_defense = calculate_league_averages(defense_data)
        save_league_averages(cur, league_avg_defense, season, 'defense')

        # Process and save defensive data
        processed_defense = []
        for team in defense_data:
            processed = process_team_zone_data(team, 'defense', league_avg_defense)
            if processed:
                processed_defense.append(processed)
                save_team_zone_data(cur, processed, season)

        print_zone_summary(processed_defense, 'defense', league_avg_defense)
        conn.commit()

        # ===========================================
        # STEP 3: Print betting insights
        # ===========================================
        print("\n" + "=" * 60)
        print("BETTING INSIGHTS")
        print("=" * 60)

        # Find interesting matchup scenarios
        print("\n🎯 Paint Protectors (allow below-avg FG% at rim):")
        paint_protectors = [p for p in processed_defense if 'ra' in (p['strengths'] or [])]
        for p in paint_protectors[:5]:
            print(f"   {p['team_name']:<20} RA FG% allowed: {p['ra_fg_pct']:.1%}")

        print("\n⚠️ Rim Vulnerable (allow above-avg FG% at rim):")
        rim_weak = [p for p in processed_defense if 'ra' in (p['weaknesses'] or [])]
        for p in rim_weak[:5]:
            print(f"   {p['team_name']:<20} RA FG% allowed: {p['ra_fg_pct']:.1%}")

        print("\n🏀 Perimeter Defenders (limit 3PT efficiency):")
        perimeter_d = [p for p in processed_defense if 'ab3' in (p['strengths'] or []) or 'corner3' in (p['strengths'] or [])]
        for p in perimeter_d[:5]:
            print(f"   {p['team_name']:<20} 3PT FG% allowed: {p['ab3_fg_pct']:.1%}")

        print("\n🔥 3PT Vulnerable (allow above-avg 3PT%):")
        three_weak = [p for p in processed_defense if 'ab3' in (p['weaknesses'] or []) or 'corner3' in (p['weaknesses'] or [])]
        for p in three_weak[:5]:
            print(f"   {p['team_name']:<20} 3PT FG% allowed: {p['ab3_fg_pct']:.1%}")

        print("\n" + "=" * 60)
        print("MATCHUP TIP EXAMPLES")
        print("=" * 60)
        print("  🎯 Paint-Heavy OFF vs 🛡️ Paint Protector DEF → UNDER tendency")
        print("  🎯 Paint-Heavy OFF vs ⚠️ Rim Weak DEF → OVER tendency")
        print("  🏀 Three-Heavy OFF vs 🔥 3PT Vulnerable DEF → OVER tendency")
        print("  🏀 Three-Heavy OFF vs 🎯 Perimeter DEF → UNDER tendency")

        cur.close()
        conn.close()

        print("\n✅ Shooting zones (offense + defense) fetch completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
