#!/usr/bin/env python3
"""
Pinnacle NBA Odds Scraper
Fetches NBA betting odds from ps3838.com (Pinnacle) and stores in database.

Usage:
    python fetch_pinnacle_odds.py [--full-run] [--dry-run]

Options:
    --full-run: Fetch all markets for all games (default: today's games only)
    --dry-run: Parse and log without database writes
"""

import sys
import json
import time
import logging
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple

import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import sql

# Import our modules
from pinnacle_session import PinnacleSession
from pinnacle_config import (
    DB_CONFIG,
    get_timestamp
)
from utils import (
    parse_team_name,
    validate_odds,
    validate_handicap,
    format_game_time,
    generate_market_key,
    extract_period_from_category,
    get_time_window,
    format_odds_display,
    decimal_to_american
)
from parsers import parse_pinnacle_response, extract_all_nba_games_compact

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class PinnacleOddsFetcher:
    """Main class for fetching and storing Pinnacle odds."""

    def __init__(self, db_config: Dict[str, Any], dry_run: bool = False, session_file: str = 'pinnacle_session.json'):
        """
        Initialize fetcher with database configuration.

        Args:
            db_config: Database connection parameters
            dry_run: If True, don't write to database
            session_file: Path to Pinnacle session persistence file
        """
        self.db_config = db_config
        self.dry_run = dry_run
        self.conn = None
        self.events_fetched = 0
        self.markets_stored = 0
        self.props_stored = 0
        self.errors_count = 0

        # Initialize Pinnacle session manager
        self.session = PinnacleSession(session_file=session_file)
        logger.info(f"✅ Pinnacle session manager initialized")

    def connect_db(self):
        """Establish database connection."""
        if self.dry_run:
            logger.info("DRY RUN: Skipping database connection")
            return

        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.conn.autocommit = False  # Use transactions
            logger.info("✅ Connected to database")
        except psycopg2.Error as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise

    def close_db(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")

    def fetch_events(self, league_id: int = 487, sport_id: int = 4) -> List[Dict[str, Any]]:
        """
        Fetch list of NBA games from Pinnacle using session manager.

        Args:
            league_id: League ID (default 487 for NBA)
            sport_id: Sport ID (default 4 for Basketball)

        Returns:
            List of event dictionaries with basic info
        """
        logger.info("📋 Fetching NBA events list using session manager...")

        # Validate session first
        if not self.session.validate_session():
            logger.error("❌ Session validation failed - please update credentials")
            self.errors_count += 1
            return []

        # Fetch events using session manager
        try:
            events = self.session.get_upcoming_events(league_id=league_id, sport_id=sport_id)

            if not events:
                logger.warning("No NBA games found in response")
                return []

            logger.info(f"✅ Found {len(events)} NBA games")
            for event in events:
                logger.info(f"   - {event['game_name']} @ {event['start_time']}")

            return events

        except Exception as e:
            logger.error(f"Error fetching events: {e}")
            self.errors_count += 1
            return []

    def fetch_event_markets(self, event_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch detailed markets for specific event using session manager.

        Args:
            event_id: Pinnacle event ID

        Returns:
            Parsed markets data or None
        """
        logger.info(f"📈 Fetching markets for event {event_id}")

        # Use session manager to fetch markets
        try:
            response = self.session.get_event_markets(event_id)

            if not response:
                logger.warning(f"No response for event {event_id}")
                self.errors_count += 1
                return None

            # Parse markets
            parsed = parse_pinnacle_response(response)
            markets_count = len(parsed.get('markets', []))
            logger.info(f"✅ Found {markets_count} markets for event {event_id}")
            return parsed

        except Exception as e:
            logger.error(f"Error fetching/parsing markets for {event_id}: {e}")
            self.errors_count += 1
            return None

    def _extract_main_game_total_from_compact(self, event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Extract the main game total line from the compact endpoint data.

        The compact endpoint (events list) includes the main line at markets['0'][1],
        while the detailed endpoint returns alternative lines at markets['0'][3]
        but SKIPS ~3 lines around the main line.

        Args:
            event: Event dict from compact endpoint with 'markets' key

        Returns:
            Market dict in format expected by store_market_odds, or None
        """
        try:
            markets_data = event.get('markets', {})
            if not markets_data:
                return None

            # Get full game markets (key '0')
            full_game = markets_data.get('0', [])
            if not full_game or len(full_game) < 2:
                return None

            # Index 1 contains game totals from compact endpoint
            # Structure: [[display_line, line_value, over_odds, under_odds, market_id, ...]]
            game_totals = full_game[1]
            if not game_totals or not isinstance(game_totals, list):
                return None

            # Get the first (and usually only) main line
            if len(game_totals) == 0:
                return None

            main_line_data = game_totals[0]
            if not isinstance(main_line_data, list) or len(main_line_data) < 4:
                return None

            # Parse the line data
            display_line = str(main_line_data[0])  # e.g., "235.0"
            line_value = float(main_line_data[1])   # e.g., 235.0
            over_odds = float(main_line_data[2])    # e.g., "1.917"
            under_odds = float(main_line_data[3])   # e.g., "1.934"

            # Validate odds
            if not (1.0 < over_odds < 100.0 and 1.0 < under_odds < 100.0):
                logger.warning(f"Invalid odds for main game total: over={over_odds}, under={under_odds}")
                return None

            # Create market dict matching the format expected by store_market_odds
            market = {
                'market_key': f"fullgame_game_total_{display_line.replace('.', '_')}",
                'market_name': f"Full Game Game Total {display_line}",
                'market_type': 'total',
                'category': 'Full Game - Game Total',
                'line': line_value,
                'odds': [
                    {
                        'selection': f"Over {display_line}",
                        'odds_decimal': over_odds,
                        'odds_american': decimal_to_american(over_odds),
                        'handicap': line_value
                    },
                    {
                        'selection': f"Under {display_line}",
                        'odds_decimal': under_odds,
                        'odds_american': decimal_to_american(under_odds),
                        'handicap': line_value
                    }
                ]
            }

            logger.info(f"📌 Extracted MAIN game total from compact endpoint: {display_line} (Over: {over_odds}, Under: {under_odds})")
            return market

        except (KeyError, IndexError, TypeError, ValueError) as e:
            logger.debug(f"Could not extract main game total from compact: {e}")
            return None

    def match_pinnacle_to_game(self, home_team: str, away_team: str,
                              start_time: datetime) -> Optional[str]:
        """
        Match Pinnacle event to our games table.

        Args:
            home_team: Pinnacle home team name
            away_team: Pinnacle away team name
            start_time: Game start time

        Returns:
            game_id from our database or None
        """
        if self.dry_run:
            logger.info(f"DRY RUN: Would match {away_team} @ {home_team}")
            return f"DRYRUN_{away_team}_{home_team}"

        # Normalize team names
        logger.info(f"🔍 Matching: home_team='{home_team}' away_team='{away_team}' start_time={start_time}")
        home_abbr = parse_team_name(home_team)
        away_abbr = parse_team_name(away_team)
        logger.info(f"🔍 Parsed abbreviations: home_abbr='{home_abbr}' away_abbr='{away_abbr}'")

        if not home_abbr or not away_abbr:
            logger.warning(f"Could not map teams: {home_team} vs {away_team}")
            return None

        # Query games table with time window
        start_window, end_window = get_time_window(start_time)
        logger.info(f"🔍 Date window: start={start_window} end={end_window}")

        # Try both directions: Pinnacle may list home/away in any order
        query = """
            SELECT g.game_id
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE ((ht.abbreviation = %s AND at.abbreviation = %s)
                OR (ht.abbreviation = %s AND at.abbreviation = %s))
              AND g.game_date BETWEEN %s::date AND %s::date
            LIMIT 1
        """

        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                logger.info(f"🔍 Executing query with params: ({home_abbr}, {away_abbr}, {away_abbr}, {home_abbr}, {start_window}, {end_window})")
                cur.execute(query, (home_abbr, away_abbr, away_abbr, home_abbr, start_window, end_window))
                result = cur.fetchone()
                logger.info(f"🔍 Query result: {result}")

                if result:
                    logger.info(f"✅ Matched to game_id: {result['game_id']}")
                    return result['game_id']
                else:
                    logger.warning(f"❌ No match found for {home_team} vs {away_team}")
                    return None

        except psycopg2.Error as e:
            logger.error(f"Database error matching game: {e}")
            return None

    def store_betting_event(self, event_id: str, game_id: str,
                          event_info: Dict[str, Any]) -> bool:
        """
        Store or update betting event in database.

        Args:
            event_id: Pinnacle event ID
            game_id: Our database game ID
            event_info: Event information dict

        Returns:
            True if successful, False otherwise
        """
        if self.dry_run:
            logger.info(f"DRY RUN: Would store event {event_id} → game {game_id}")
            return True

        query = """
            INSERT INTO betting_events (
                event_id, game_id, bookmaker,
                event_start_time, raw_data, last_updated
            ) VALUES (
                %s, %s, 'pinnacle',
                %s, %s, NOW()
            )
            ON CONFLICT (event_id)
            DO UPDATE SET
                last_updated = NOW(),
                raw_data = EXCLUDED.raw_data,
                game_id = EXCLUDED.game_id
            RETURNING event_id
        """

        try:
            with self.conn.cursor() as cur:
                # Convert datetime to string for JSON serialization
                event_info_json = event_info.copy()
                if 'start_time' in event_info_json and hasattr(event_info_json['start_time'], 'isoformat'):
                    event_info_json['start_time'] = event_info_json['start_time'].isoformat()

                cur.execute(query, (
                    event_id,
                    game_id,
                    event_info.get('start_time'),
                    json.dumps(event_info_json)
                ))
                self.conn.commit()
                logger.info(f"✅ Stored event {event_id}")
                return True

        except psycopg2.Error as e:
            logger.error(f"Database error storing event: {e}")
            self.conn.rollback()
            return False

    def store_player_props(self, event_id: str, game_id: str, markets: List[Dict[str, Any]]) -> int:
        """
        Store player props in player_props table.

        Args:
            event_id: Pinnacle event ID
            game_id: Our database game ID
            markets: List of market dictionaries

        Returns:
            Number of props stored
        """
        # Filter to player props only
        player_prop_markets = [m for m in markets if 'Player Props' in m.get('category', '')]

        if not player_prop_markets:
            return 0

        if self.dry_run:
            logger.info(f"DRY RUN: Would store {len(player_prop_markets)} player props")
            return len(player_prop_markets)

        # Map Pinnacle unit names to our prop_type (must match check_prop_type constraint)
        # Allowed: points, rebounds, assists, 3pm, pra, steals, blocks, turnovers,
        #          double_double, points_rebounds, points_assists, rebounds_assists, steals_blocks
        unit_to_prop_type = {
            'Points': 'points',
            'Rebounds': 'rebounds',
            'Assists': 'assists',
            'ThreePointFieldGoals': '3pm',
            'Steals': 'steals',
            'Blocks': 'blocks',
            'PointsReboundsAssists': 'pra',
            'PointsAssists': 'points_assists',
            'PointsRebounds': 'points_rebounds',
            'ReboundsAssists': 'rebounds_assists',
            'StealsBlocks': 'steals_blocks',
            'Turnovers': 'turnovers',
            'DoubleDouble': 'double_double',
            # Note: TripleDouble not in check constraint, skip these
        }

        props_stored = 0

        for market in player_prop_markets:
            try:
                market_name = market.get('market_name', '')
                unit = market.get('unit', '')
                line = market.get('line')
                odds = market.get('odds', [])

                # Parse player name from market_name: "Aaron Nesmith (3 Point FG)"
                if '(' in market_name:
                    player_name = market_name.split('(')[0].strip()
                else:
                    player_name = market_name.strip()

                if not player_name or line is None:
                    continue

                # Map unit to prop_type - skip if not in our allowed list
                prop_type = unit_to_prop_type.get(unit)
                if not prop_type:
                    logger.debug(f"Skipping unknown prop type: {unit} for {player_name}")
                    continue

                # Extract over/under odds
                over_odds_decimal = None
                over_odds_american = None
                under_odds_decimal = None
                under_odds_american = None

                for odd in odds:
                    selection = odd.get('selection', '').lower()
                    if 'over' in selection:
                        over_odds_decimal = odd.get('odds_decimal')
                        over_odds_american = odd.get('odds_american')
                    elif 'under' in selection:
                        under_odds_decimal = odd.get('odds_decimal')
                        under_odds_american = odd.get('odds_american')

                # Insert into player_props
                query = """
                    INSERT INTO player_props (
                        game_id, player_name, bookmaker, prop_type, line,
                        over_odds_decimal, over_odds_american,
                        under_odds_decimal, under_odds_american,
                        external_event_id, is_available, recorded_at
                    ) VALUES (
                        %s, %s, 'pinnacle', %s, %s,
                        %s, %s, %s, %s,
                        %s, true, NOW()
                    )
                    ON CONFLICT (game_id, player_name, bookmaker, prop_type, line, recorded_at)
                    DO NOTHING
                """

                with self.conn.cursor() as cur:
                    cur.execute(query, (
                        game_id,
                        player_name,
                        prop_type,
                        line,
                        over_odds_decimal,
                        over_odds_american,
                        under_odds_decimal,
                        under_odds_american,
                        event_id
                    ))
                    props_stored += 1

            except Exception as e:
                logger.warning(f"Error storing player prop: {e}")
                self.conn.rollback()  # Rollback to recover from failed transaction
                continue

        if props_stored > 0:
            self.conn.commit()
            logger.info(f"✅ Stored {props_stored} player props for game {game_id}")

        return props_stored

    def store_market_odds(self, event_id: str, game_id: str, game_start_time: datetime,
                         markets: List[Dict[str, Any]]) -> int:
        """
        Store market odds in database with hours_to_game calculation.

        Args:
            event_id: Pinnacle event ID
            game_id: Our database game ID
            game_start_time: Game start time
            markets: List of market dictionaries

        Returns:
            Number of odds records stored
        """
        if self.dry_run:
            logger.info(f"DRY RUN: Would store {len(markets)} markets")
            for market in markets[:5]:  # Show first 5 for verification
                logger.debug(f"  - {market['market_name']}: {len(market['odds'])} selections")
            return len(markets)

        odds_stored = 0

        # Calculate hours to game
        now = datetime.now(game_start_time.tzinfo) if game_start_time.tzinfo else datetime.now()
        hours_to_game = (game_start_time - now).total_seconds() / 3600

        # Determine if this is likely a closing line (within 2 hours of game start)
        is_closing_line = 0 < hours_to_game <= 2.0

        for market in markets:
            try:
                # Determine market type based on category and market name
                category = market.get('category', '')
                market_name = market.get('market_name', '').lower()

                if 'Player Props' in category:
                    market_type = 'player_prop'
                elif 'moneyline' in market_name.lower():
                    market_type = 'moneyline'
                elif 'spread' in market_name or 'handicap' in market_name:
                    market_type = 'spread'
                elif 'total' in market_name or 'over' in market_name or 'under' in market_name:
                    market_type = 'total'
                else:
                    market_type = 'other'

                # First, insert/update market
                market_query = """
                    INSERT INTO betting_markets (
                        event_id, market_key, market_name, market_type, last_updated
                    ) VALUES (
                        %s, %s, %s, %s, NOW()
                    )
                    ON CONFLICT (event_id, market_key)
                    DO UPDATE SET
                        market_type = EXCLUDED.market_type,
                        last_updated = NOW()
                    RETURNING market_id
                """

                with self.conn.cursor() as cur:
                    cur.execute(market_query, (
                        event_id,
                        market['market_key'],
                        market['market_name'],
                        market_type
                    ))
                    market_id = cur.fetchone()[0]

                    # Insert odds (always new rows for history tracking)
                    for odds in market.get('odds', []):
                        # Validate odds before inserting
                        if not validate_odds(odds['odds_decimal']):
                            logger.warning(f"Invalid odds: {odds['odds_decimal']}")
                            continue

                        if odds.get('handicap') and not validate_handicap(odds['handicap']):
                            logger.warning(f"Invalid handicap: {odds['handicap']}")
                            continue

                        odds_query = """
                            INSERT INTO betting_odds (
                                market_id, selection,
                                odds_decimal, odds_american,
                                handicap, hours_to_game, is_closing_line,
                                recorded_at
                            ) VALUES (
                                %s, %s, %s, %s, %s, %s, %s, NOW()
                            )
                        """

                        cur.execute(odds_query, (
                            market_id,
                            odds['selection'],
                            odds['odds_decimal'],
                            odds.get('odds_american'),
                            odds.get('handicap'),
                            round(hours_to_game, 2),
                            is_closing_line
                        ))
                        odds_stored += 1

                self.conn.commit()

            except psycopg2.Error as e:
                logger.error(f"Database error storing market {market['market_key']}: {e}")
                self.conn.rollback()
                continue

        if is_closing_line:
            logger.info(f"🚨 Closing line captured! {hours_to_game:.2f} hours before game")

        logger.info(f"✅ Stored {odds_stored} odds records")
        self.markets_stored += odds_stored
        return odds_stored

    def run(self, full_run: bool = False):
        """
        Main execution flow.

        Args:
            full_run: If True, fetch all games (not just today)

        Note: Player props require a fresh authenticated session.
        If session is expired, only main lines (spread/total/moneyline) will be fetched.
        To refresh session, manually log into ps3838.com and update pinnacle_session.json.
        """
        logger.info(f"{'='*60}")
        logger.info(f"🏀 Pinnacle NBA Odds Scraper - {get_timestamp()}")
        logger.info(f"{'='*60}")

        # Connect to database
        self.connect_db()

        try:
            # Fetch events list
            events = self.fetch_events()

            if not events:
                logger.warning("No events to process")
                return

            # Process each event
            for event in events:
                event_id = event.get('event_id')
                if not event_id:
                    continue

                # Skip live games - only fetch pre-match odds
                event_start_time = event.get('start_time')
                if event_start_time:
                    now = datetime.now(event_start_time.tzinfo) if event_start_time.tzinfo else datetime.now()
                    if event_start_time <= now:
                        logger.info(f"⏭️  Skipping LIVE game: {event.get('away_team')} @ {event.get('home_team')} (started {event_start_time})")
                        continue

                self.events_fetched += 1

                # Log event data before matching
                logger.info(f"📋 Event data: event_id={event_id}")
                logger.info(f"   home_team='{event.get('home_team')}'")
                logger.info(f"   away_team='{event.get('away_team')}'")
                logger.info(f"   start_time={event.get('start_time')}")

                # Match to our game
                game_id = self.match_pinnacle_to_game(
                    event.get('home_team'),
                    event.get('away_team'),
                    event.get('start_time')
                )

                if not game_id and not self.dry_run:
                    logger.warning(f"Skipping unmatched event {event_id}")
                    continue

                # Store betting event
                if not self.store_betting_event(event_id, game_id, event):
                    continue

                # Fetch detailed markets
                markets_data = self.fetch_event_markets(event_id)
                if not markets_data:
                    continue

                # Store markets and odds
                markets = markets_data.get('markets', [])

                # CRITICAL FIX: Extract main game total from compact endpoint
                # The detailed endpoint (markets_data) returns alternative lines at [3]
                # but SKIPS ~3 lines around the main line area.
                # The compact endpoint (event) has the main line at ['0'][1]
                main_total = self._extract_main_game_total_from_compact(event)
                if main_total:
                    # Check if this line already exists in markets (avoid duplicates)
                    main_line = main_total['line']
                    existing_lines = [m.get('line') for m in markets
                                      if m.get('market_type') == 'total' and 'Game Total' in m.get('category', '')]
                    if main_line not in existing_lines:
                        markets.append(main_total)
                        logger.info(f"✅ Injected main game total line {main_line} into markets")
                    else:
                        logger.debug(f"Main game total line {main_line} already exists in markets")

                self.store_market_odds(event_id, game_id, event.get('start_time'), markets)

                # Store player props in player_props table
                if game_id:
                    props_count = self.store_player_props(event_id, game_id, markets)
                    self.props_stored += props_count
                    if props_count > 0:
                        logger.info(f"   ✅ Stored {props_count} player props")

                # Log summary for this event
                summary = markets_data.get('summary', {})
                logger.info(f"📊 Event {event_id} summary:")
                logger.info(f"   - Moneylines: {summary.get('moneylines', 0)}")
                logger.info(f"   - Main lines: {summary.get('main_lines', 0)}")
                logger.info(f"   - Alternative lines: {summary.get('alternative_lines', 0)}")
                logger.info(f"   - Player props: {summary.get('player_props', 0)}")

        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
            if self.conn:
                self.conn.rollback()

        finally:
            # Print final summary
            logger.info(f"{'='*60}")
            logger.info(f"📈 Scraping Summary:")
            logger.info(f"   - Events fetched: {self.events_fetched}")
            logger.info(f"   - Markets stored: {self.markets_stored}")
            logger.info(f"   - Player props stored: {self.props_stored}")
            logger.info(f"   - Errors encountered: {self.errors_count}")
            logger.info(f"{'='*60}")

            # Close database
            self.close_db()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Fetch NBA odds from Pinnacle')
    parser.add_argument('--full-run', action='store_true',
                      help='Fetch all markets for all games')
    parser.add_argument('--dry-run', action='store_true',
                      help='Parse and log without database writes')
    args = parser.parse_args()

    # Create fetcher and run
    fetcher = PinnacleOddsFetcher(DB_CONFIG, dry_run=args.dry_run)

    try:
        fetcher.run(full_run=args.full_run)
    except KeyboardInterrupt:
        logger.info("\n⚠️ Scraping interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()