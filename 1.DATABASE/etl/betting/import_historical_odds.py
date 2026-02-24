#!/usr/bin/env python3
"""
Import historical NBA betting data from sportsbookreviewsonline.com into betting tables.

Data format:
- Pairs of rows: Visitor (V) then Home (H)
- Visitor row: open/close = game total, ml = visitor ML
- Home row: open/close = spread (home team), ml = home ML
"""

import json
import psycopg2
from datetime import datetime
import os

# Team name mapping: scraped name -> database abbreviation
TEAM_MAP = {
    'Atlanta': 'ATL',
    'Boston': 'BOS',
    'Brooklyn': 'BKN',
    'Charlotte': 'CHA',
    'Chicago': 'CHI',
    'Cleveland': 'CLE',
    'Dallas': 'DAL',
    'Denver': 'DEN',
    'Detroit': 'DET',
    'GoldenState': 'GSW',
    'Houston': 'HOU',
    'Indiana': 'IND',
    'LAClippers': 'LAC',
    'LALakers': 'LAL',
    'Memphis': 'MEM',
    'Miami': 'MIA',
    'Milwaukee': 'MIL',
    'Minnesota': 'MIN',
    'NewOrleans': 'NOP',
    'NewYork': 'NYK',
    'OklahomaCity': 'OKC',
    'Orlando': 'ORL',
    'Philadelphia': 'PHI',
    'Phoenix': 'PHX',
    'Portland': 'POR',
    'Sacramento': 'SAC',
    'SanAntonio': 'SAS',
    'Toronto': 'TOR',
    'Utah': 'UTA',
    'Washington': 'WAS',
}


def parse_date(date_str, season='2022-23'):
    """Parse MMDD date format to full date (inferring year from season)"""
    month = int(date_str[:len(date_str)-2])
    day = int(date_str[-2:])

    # NBA 2022-23 season: Oct 2022 - Jun 2023
    if month >= 10:  # Oct-Dec = 2022
        year = 2022
    else:  # Jan-Jun = 2023
        year = 2023

    return datetime(year, month, day)


def parse_float(value):
    """Parse numeric value, handling edge cases"""
    if not value or value in ['NL', 'PK', 'pk', '-']:
        return None
    try:
        # Remove any non-numeric characters except . and -
        clean = ''.join(c for c in value if c.isdigit() or c in '.-')
        return float(clean) if clean else None
    except ValueError:
        return None


def parse_american_odds(value):
    """Parse American odds (e.g., '-110', '+150')"""
    if not value or value in ['NL', '-']:
        return None
    try:
        clean = ''.join(c for c in value if c.isdigit() or c == '-')
        return int(clean) if clean else None
    except ValueError:
        return None


def american_to_decimal(american):
    """Convert American odds to decimal odds"""
    if american is None:
        return None
    if american > 0:
        return round(1 + (american / 100), 2)
    elif american < 0:
        return round(1 + (100 / abs(american)), 2)
    return 2.0  # Even money


def load_historical_odds():
    """Load historical odds into database"""

    # Load scraped data
    data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'odds', 'nba_odds_2022_23_raw.json')
    with open(data_path) as f:
        raw_data = json.load(f)

    print(f"Loaded {len(raw_data)} rows from JSON")

    # Pair visitor/home rows
    games = []
    i = 0
    while i < len(raw_data) - 1:
        visitor = raw_data[i]
        home = raw_data[i + 1]

        # Verify it's a valid pair
        if visitor['vh'] != 'V' or home['vh'] != 'H':
            print(f"Warning: Invalid pair at index {i}: {visitor['vh']}/{home['vh']}")
            i += 1
            continue

        if visitor['date'] != home['date']:
            print(f"Warning: Date mismatch at index {i}: {visitor['date']} vs {home['date']}")
            i += 1
            continue

        # Detect which row has the total vs spread
        # Total is typically 180-280, spread is typically -30 to +30
        v_close = parse_float(visitor['close'])
        h_close = parse_float(home['close'])

        # Determine which row has total vs spread based on value magnitude
        if v_close and h_close:
            if v_close > 100:  # Visitor has total
                game_total_close = v_close
                game_total_open = parse_float(visitor['open'])
                spread_close = h_close
                spread_open = parse_float(home['open'])
            else:  # Home has total (swap)
                game_total_close = h_close
                game_total_open = parse_float(home['open'])
                spread_close = v_close
                spread_open = parse_float(visitor['open'])
        else:
            # Fallback - assume visitor has total
            game_total_close = v_close
            game_total_open = parse_float(visitor['open'])
            spread_close = h_close
            spread_open = parse_float(home['open'])

        game = {
            'date': visitor['date'],
            'visitor_team': TEAM_MAP.get(visitor['team']),
            'home_team': TEAM_MAP.get(home['team']),
            'visitor_score': int(visitor['final']) if visitor['final'] else None,
            'home_score': int(home['final']) if home['final'] else None,
            'game_total_open': game_total_open,
            'game_total_close': game_total_close,
            'spread_open': spread_open,
            'spread_close': spread_close,
            'visitor_ml': parse_american_odds(visitor['ml']),
            'home_ml': parse_american_odds(home['ml']),
            'h2_total': parse_float(visitor['h2']),
            'h2_spread': parse_float(home['h2']),
        }

        if game['visitor_team'] and game['home_team']:
            games.append(game)
        else:
            print(f"Warning: Unknown team - {visitor['team']} or {home['team']}")

        i += 2

    print(f"Parsed {len(games)} games")

    # Connect to database
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        database='nba_stats',
        user='chapirou'
    )
    cur = conn.cursor()

    # Stats tracking
    matched = 0
    not_matched = 0
    events_created = 0
    markets_created = 0
    odds_created = 0

    for game in games:
        game_date = parse_date(game['date'])

        # Find matching game in database
        cur.execute("""
            SELECT g.game_id, g.game_date, g.home_team_score, g.away_team_score
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE g.season = '2022-23'
            AND g.game_date = %s
            AND ht.abbreviation = %s
            AND at.abbreviation = %s
        """, (game_date.date(), game['home_team'], game['visitor_team']))

        result = cur.fetchone()

        if not result:
            not_matched += 1
            continue

        game_id = result[0]
        matched += 1

        # Create event_id (unique per game + bookmaker)
        event_id = f"sbro_{game_id}"

        # Insert betting_event (or update if exists)
        cur.execute("""
            INSERT INTO betting_events (event_id, game_id, bookmaker, event_start_time, event_status, raw_data)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (event_id) DO UPDATE SET
                raw_data = EXCLUDED.raw_data,
                last_updated = CURRENT_TIMESTAMP
            RETURNING event_id
        """, (
            event_id,
            game_id,
            'sportsbookreviewsonline',
            game_date,
            'final',
            json.dumps(game)
        ))
        events_created += 1

        # Insert game total market
        if game['game_total_close']:
            # Full game total
            cur.execute("""
                INSERT INTO betting_markets (event_id, market_key, market_name, market_type)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (event_id, market_key) DO UPDATE SET
                    last_updated = CURRENT_TIMESTAMP
                RETURNING market_id
            """, (event_id, '0_game_total', 'Full Game Total', 'total'))

            market_id = cur.fetchone()[0]
            markets_created += 1

            # Over odds (closing line)
            cur.execute("""
                INSERT INTO betting_odds (market_id, selection, handicap, odds_decimal, odds_american, is_closing_line)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (
                market_id,
                'Over',
                game['game_total_close'],
                1.91,  # Standard -110 juice
                -110,
                True
            ))
            odds_created += 1

            # Under odds (closing line)
            cur.execute("""
                INSERT INTO betting_odds (market_id, selection, handicap, odds_decimal, odds_american, is_closing_line)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (
                market_id,
                'Under',
                game['game_total_close'],
                1.91,
                -110,
                True
            ))
            odds_created += 1

        # Insert spread market
        if game['spread_close']:
            cur.execute("""
                INSERT INTO betting_markets (event_id, market_key, market_name, market_type)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (event_id, market_key) DO UPDATE SET
                    last_updated = CURRENT_TIMESTAMP
                RETURNING market_id
            """, (event_id, '0_spread', 'Full Game Spread', 'spread'))

            market_id = cur.fetchone()[0]
            markets_created += 1

            # Home spread
            cur.execute("""
                INSERT INTO betting_odds (market_id, selection, handicap, odds_decimal, odds_american, is_closing_line)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (
                market_id,
                'Home',
                game['spread_close'],
                1.91,
                -110,
                True
            ))
            odds_created += 1

            # Away spread (negative of home)
            cur.execute("""
                INSERT INTO betting_odds (market_id, selection, handicap, odds_decimal, odds_american, is_closing_line)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (
                market_id,
                'Away',
                -game['spread_close'] if game['spread_close'] else None,
                1.91,
                -110,
                True
            ))
            odds_created += 1

        # Insert moneyline market
        if game['home_ml'] and game['visitor_ml']:
            cur.execute("""
                INSERT INTO betting_markets (event_id, market_key, market_name, market_type)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (event_id, market_key) DO UPDATE SET
                    last_updated = CURRENT_TIMESTAMP
                RETURNING market_id
            """, (event_id, '0_moneyline', 'Full Game Moneyline', 'moneyline'))

            market_id = cur.fetchone()[0]
            markets_created += 1

            # Home ML
            cur.execute("""
                INSERT INTO betting_odds (market_id, selection, odds_decimal, odds_american, is_closing_line)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (
                market_id,
                'Home',
                american_to_decimal(game['home_ml']),
                game['home_ml'],
                True
            ))
            odds_created += 1

            # Away ML
            cur.execute("""
                INSERT INTO betting_odds (market_id, selection, odds_decimal, odds_american, is_closing_line)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (
                market_id,
                'Away',
                american_to_decimal(game['visitor_ml']),
                game['visitor_ml'],
                True
            ))
            odds_created += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"\n=== Import Summary ===")
    print(f"Games matched: {matched}")
    print(f"Games not found: {not_matched}")
    print(f"Betting events created: {events_created}")
    print(f"Markets created: {markets_created}")
    print(f"Odds records created: {odds_created}")


if __name__ == '__main__':
    load_historical_odds()
