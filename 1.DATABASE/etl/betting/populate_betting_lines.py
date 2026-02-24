#!/usr/bin/env python3
"""
Populate Betting Lines from Raw Odds Data

Transforms betting_odds raw data into structured betting_lines table by:
1. Aggregating odds by game_id + bookmaker + market_type
2. Extracting opening and current lines with movement analysis
3. Calculating line movement magnitude and direction

Usage:
    python populate_betting_lines.py [--dry-run] [--bookmaker BOOKMAKER] [--game-id GAME_ID]

Options:
    --dry-run: Preview transformations without writing to database
    --bookmaker: Filter for specific bookmaker (default: all)
    --game-id: Process specific game only (default: all)

Examples:
    python populate_betting_lines.py
    python populate_betting_lines.py --dry-run
    python populate_betting_lines.py --bookmaker pinnacle
    python populate_betting_lines.py --game-id 0022500123
"""

import os
import sys
import argparse
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from decimal import Decimal

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class BettingLinesPopulator:
    """Transform betting_odds into structured betting_lines."""

    def __init__(self, dry_run: bool = False):
        """
        Initialize populator.

        Args:
            dry_run: If True, preview without database writes
        """
        self.dry_run = dry_run
        self.conn = None
        self.stats = {
            'games_processed': 0,
            'lines_inserted': 0,
            'lines_updated': 0,
            'errors': 0
        }

    def connect_db(self):
        """Establish database connection."""
        try:
            self.conn = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '5432'),
                database=os.getenv('DB_NAME', 'nba_stats'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', '')
            )
            self.conn.autocommit = False  # Use explicit transactions
            logger.info("✅ Connected to database")
        except psycopg2.Error as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise

    def close_db(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")

    def fetch_spread_lines(self, bookmaker: Optional[str] = None,
                          game_id: Optional[str] = None) -> List[Dict]:
        """
        Fetch spread betting data grouped by game and bookmaker.

        Args:
            bookmaker: Filter for specific bookmaker
            game_id: Filter for specific game

        Returns:
            List of spread line dictionaries with opening/current values
        """
        query = """
            WITH spread_odds AS (
                SELECT
                    be.game_id,
                    be.bookmaker,
                    bm.market_id,
                    bo.selection,
                    bo.handicap,
                    bo.odds_decimal,
                    bo.odds_american,
                    bo.recorded_at,
                    bo.is_available,
                    ROW_NUMBER() OVER (
                        PARTITION BY be.game_id, be.bookmaker, bo.selection
                        ORDER BY bo.recorded_at ASC
                    ) as opening_rank,
                    ROW_NUMBER() OVER (
                        PARTITION BY be.game_id, be.bookmaker, bo.selection
                        ORDER BY bo.recorded_at DESC
                    ) as current_rank,
                    ht.full_name as home_team_name,
                    at.full_name as away_team_name
                FROM betting_odds bo
                JOIN betting_markets bm ON bo.market_id = bm.market_id
                JOIN betting_events be ON bm.event_id = be.event_id
                JOIN games g ON be.game_id = g.game_id
                JOIN teams ht ON g.home_team_id = ht.team_id
                JOIN teams at ON g.away_team_id = at.team_id
                WHERE bm.market_type = 'spread'
                  AND bo.is_available = true
                  AND be.game_id IS NOT NULL
                  {bookmaker_filter}
                  {game_filter}
            ),
            opening_lines AS (
                SELECT
                    game_id,
                    bookmaker,
                    selection,
                    handicap as opening_handicap,
                    odds_american as opening_odds,
                    recorded_at as first_seen,
                    home_team_name,
                    away_team_name
                FROM spread_odds
                WHERE opening_rank = 1
            ),
            current_lines AS (
                SELECT
                    game_id,
                    bookmaker,
                    selection,
                    handicap as current_handicap,
                    odds_american as current_odds,
                    recorded_at as last_updated
                FROM spread_odds
                WHERE current_rank = 1
            )
            SELECT
                ol.game_id,
                ol.bookmaker,
                ol.selection,
                ol.opening_handicap,
                cl.current_handicap,
                ol.opening_odds,
                cl.current_odds,
                ol.first_seen,
                cl.last_updated,
                ol.home_team_name,
                ol.away_team_name
            FROM opening_lines ol
            JOIN current_lines cl
                ON ol.game_id = cl.game_id
                AND ol.bookmaker = cl.bookmaker
                AND ol.selection = cl.selection
            ORDER BY ol.game_id, ol.bookmaker, ol.selection
        """.format(
            bookmaker_filter=f"AND be.bookmaker = '{bookmaker}'" if bookmaker else "",
            game_filter=f"AND be.game_id = '{game_id}'" if game_id else ""
        )

        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query)
                results = cur.fetchall()
                logger.info(f"📊 Fetched {len(results)} spread line records")
                return results
        except psycopg2.Error as e:
            logger.error(f"❌ Error fetching spread lines: {e}")
            return []

    def calculate_movement(self, opening_value: Decimal, current_value: Decimal) -> Tuple[Decimal, str]:
        """
        Calculate line movement magnitude and direction.

        Args:
            opening_value: Opening line handicap
            current_value: Current line handicap

        Returns:
            Tuple of (magnitude, direction)
        """
        if opening_value is None or current_value is None:
            return (Decimal('0.0'), 'none')

        magnitude = current_value - opening_value

        if magnitude > 0:
            direction = 'toward_home'
        elif magnitude < 0:
            direction = 'toward_away'
        else:
            direction = 'none'

        return (abs(magnitude), direction)

    def group_by_game_bookmaker(self, lines: List[Dict]) -> Dict[Tuple[str, str], List[Dict]]:
        """
        Group line data by (game_id, bookmaker).

        Args:
            lines: List of line dictionaries

        Returns:
            Dictionary keyed by (game_id, bookmaker) tuples
        """
        grouped = {}
        for line in lines:
            key = (line['game_id'], line['bookmaker'])
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(line)

        return grouped

    def transform_to_betting_line(self, game_id: str, bookmaker: str,
                                 lines: List[Dict]) -> Optional[Dict]:
        """
        Transform grouped lines into betting_lines row format.

        Args:
            game_id: NBA game ID
            bookmaker: Bookmaker name
            lines: List of line records for this game+bookmaker

        Returns:
            Dictionary ready for insertion into betting_lines
        """
        try:
            # Get team names from first line record
            if not lines:
                return None

            home_team_name = lines[0].get('home_team_name')
            away_team_name = lines[0].get('away_team_name')

            if not home_team_name or not away_team_name:
                logger.warning(f"Missing team names for {game_id} @ {bookmaker}")
                return None

            # Find home and away lines by matching team names in selection field
            home_line = next((l for l in lines if home_team_name in l['selection']), None)
            away_line = next((l for l in lines if away_team_name in l['selection']), None)

            if not home_line or not away_line:
                logger.warning(f"Missing home or away line for {game_id} @ {bookmaker} (home: {home_team_name}, away: {away_team_name})")
                return None

            # Return BOTH opening and current lines as separate records
            # Opening line
            opening_line = {
                'game_id': game_id,
                'bookmaker': bookmaker,
                'spread': float(home_line['opening_handicap']) if home_line['opening_handicap'] else None,
                'home_spread_odds': home_line['opening_odds'],
                'away_spread_odds': away_line['opening_odds'],
                'recorded_at': home_line['first_seen'],
                'is_opening_line': True,
                'is_closing_line': False
            }

            # Current line
            current_line = {
                'game_id': game_id,
                'bookmaker': bookmaker,
                'spread': float(home_line['current_handicap']) if home_line['current_handicap'] else None,
                'home_spread_odds': home_line['current_odds'],
                'away_spread_odds': away_line['current_odds'],
                'recorded_at': home_line['last_updated'],
                'is_opening_line': False,
                'is_closing_line': False  # Will be updated to True when game starts
            }

            return [opening_line, current_line]

        except Exception as e:
            logger.error(f"Error transforming lines for {game_id}: {e}")
            return None

    def insert_betting_line(self, line: Dict) -> bool:
        """
        Insert or update betting line in database.

        Args:
            line: Betting line dictionary matching betting_lines schema

        Returns:
            True if successful, False otherwise
        """
        if self.dry_run:
            logger.info(f"DRY RUN: Would insert line for game {line['game_id']}")
            logger.debug(f"  Spread: {line['spread']} | Home odds: {line['home_spread_odds']} | Away odds: {line['away_spread_odds']}")
            logger.debug(f"  Opening: {line['is_opening_line']} | Recorded: {line['recorded_at']}")
            return True

        query = """
            INSERT INTO betting_lines (
                game_id, bookmaker, spread,
                home_spread_odds, away_spread_odds,
                recorded_at, is_opening_line, is_closing_line
            ) VALUES (
                %(game_id)s, %(bookmaker)s, %(spread)s,
                %(home_spread_odds)s, %(away_spread_odds)s,
                %(recorded_at)s, %(is_opening_line)s, %(is_closing_line)s
            )
            RETURNING line_id
        """

        try:
            with self.conn.cursor() as cur:
                cur.execute(query, line)
                line_id = cur.fetchone()[0]
                self.stats['lines_inserted'] += 1
                return True

        except psycopg2.Error as e:
            logger.error(f"Database error inserting line: {e}")
            self.conn.rollback()
            self.stats['errors'] += 1
            return False

    def run(self, bookmaker: Optional[str] = None, game_id: Optional[str] = None):
        """
        Main execution flow.

        Args:
            bookmaker: Filter for specific bookmaker
            game_id: Filter for specific game
        """
        logger.info("=" * 80)
        logger.info(f"🏀 Betting Lines Populator - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("=" * 80)

        if self.dry_run:
            logger.info("⚠️  DRY RUN MODE: No database writes will occur")

        # Connect to database
        if not self.dry_run:
            self.connect_db()

        try:
            # Fetch spread lines
            lines = self.fetch_spread_lines(bookmaker, game_id)

            if not lines:
                logger.warning("No spread lines found to process")
                return

            # Group by game and bookmaker
            grouped = self.group_by_game_bookmaker(lines)
            logger.info(f"📦 Processing {len(grouped)} game+bookmaker combinations")

            # Transform and insert each group
            for (gid, bmaker), group_lines in grouped.items():
                self.stats['games_processed'] += 1

                # Transform to betting_line format (returns list of [opening, current])
                betting_lines = self.transform_to_betting_line(gid, bmaker, group_lines)

                if betting_lines:
                    # Insert both opening and current lines
                    for betting_line in betting_lines:
                        success = self.insert_betting_line(betting_line)

                        if success and not self.dry_run:
                            self.conn.commit()

                    # Log progress every 10 games
                    if self.stats['games_processed'] % 10 == 0:
                        logger.info(f"   Processed {self.stats['games_processed']} games...")
                else:
                    self.stats['errors'] += 1

        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
            if self.conn and not self.dry_run:
                self.conn.rollback()

        finally:
            # Print summary
            logger.info("=" * 80)
            logger.info("📊 Processing Summary:")
            logger.info(f"   • Games processed: {self.stats['games_processed']}")
            logger.info(f"   • Lines inserted: {self.stats['lines_inserted']}")
            logger.info(f"   • Lines updated: {self.stats['lines_updated']}")
            logger.info(f"   • Errors: {self.stats['errors']}")
            logger.info("=" * 80)

            # Close database
            if not self.dry_run:
                self.close_db()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Populate betting_lines from betting_odds data',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python populate_betting_lines.py
  python populate_betting_lines.py --dry-run
  python populate_betting_lines.py --bookmaker pinnacle
  python populate_betting_lines.py --game-id 0022500123
        """
    )
    parser.add_argument('--dry-run', action='store_true',
                       help='Preview transformations without database writes')
    parser.add_argument('--bookmaker', type=str,
                       help='Filter for specific bookmaker')
    parser.add_argument('--game-id', type=str,
                       help='Process specific game only')
    args = parser.parse_args()

    # Create populator and run
    populator = BettingLinesPopulator(dry_run=args.dry_run)

    try:
        populator.run(bookmaker=args.bookmaker, game_id=args.game_id)
    except KeyboardInterrupt:
        logger.info("\n⚠️  Processing interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
