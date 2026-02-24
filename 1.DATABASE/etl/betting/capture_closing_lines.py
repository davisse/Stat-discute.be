#!/usr/bin/env python3
"""
Closing Lines Capture Script
Captures closing lines for games starting soon (within 2 hours).
Consolidates latest odds from betting_markets into game_closing_lines table.

Usage:
    python capture_closing_lines.py [--dry-run] [--hours-window HOURS]

Options:
    --dry-run: Log what would be captured without database writes
    --hours-window: Time window for upcoming games (default: 2 hours)
"""

import sys
import logging
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from decimal import Decimal

import psycopg2
from psycopg2.extras import RealDictCursor

# Import database config
from pinnacle_config import DB_CONFIG, get_timestamp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ClosingLinesCapture:
    """Captures closing lines for upcoming games."""

    def __init__(self, db_config: Dict[str, Any], dry_run: bool = False,
                 hours_window: float = 2.0):
        """
        Initialize closing lines capturer.

        Args:
            db_config: Database connection parameters
            dry_run: If True, don't write to database
            hours_window: Time window for upcoming games (hours)
        """
        self.db_config = db_config
        self.dry_run = dry_run
        self.hours_window = hours_window
        self.conn = None
        self.games_processed = 0
        self.lines_captured = 0
        self.errors_count = 0

    def connect_db(self):
        """Establish database connection."""
        if self.dry_run:
            logger.info("DRY RUN: Skipping database connection")
            return

        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.conn.autocommit = False
            logger.info("✅ Connected to database")
        except psycopg2.Error as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise

    def close_db(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")

    def find_upcoming_games(self) -> List[Dict[str, Any]]:
        """
        Find games starting soon that need closing line capture.

        Returns:
            List of game dictionaries with event_id and game metadata
        """
        if self.dry_run:
            logger.info(f"DRY RUN: Would find games within {self.hours_window} hours")
            return []

        # Calculate time window
        now = datetime.now()
        window_start = now
        window_end = now + timedelta(hours=self.hours_window)

        query = """
        SELECT
            g.game_id,
            g.game_date,
            g.game_time,
            ht.abbreviation as home_team,
            at.abbreviation as away_team,
            be.event_id,
            be.event_start_time,
            EXTRACT(EPOCH FROM (be.event_start_time - NOW())) / 3600 as hours_until_game
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        JOIN betting_events be ON g.game_id = be.game_id
        LEFT JOIN game_closing_lines gcl ON g.game_id = gcl.game_id AND gcl.bookmaker = 'pinnacle'
        WHERE be.event_start_time BETWEEN %s AND %s
        AND g.game_status != 'Final'
        AND gcl.id IS NULL  -- Only games without captured closing lines
        ORDER BY be.event_start_time
        """

        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, (window_start, window_end))
                games = cur.fetchall()

                logger.info(f"📋 Found {len(games)} games needing closing line capture")
                for game in games:
                    logger.info(f"   - {game['away_team']} @ {game['home_team']} "
                              f"in {game['hours_until_game']:.2f} hours")

                return games

        except psycopg2.Error as e:
            logger.error(f"Database error finding games: {e}")
            self.errors_count += 1
            return []

    def get_latest_market_odds(self, event_id: str, market_pattern: str) -> Optional[Dict[str, Any]]:
        """
        Get the most recent odds for a specific market type.

        Args:
            event_id: Pinnacle event ID
            market_pattern: SQL pattern to match market_key (e.g., '%Total%Full Game%')

        Returns:
            Dictionary with line, over_odds, under_odds, or None
        """
        if self.dry_run:
            return None

        query = """
        SELECT
            bm.market_key,
            bm.market_name,
            bo.handicap as line,
            MAX(CASE WHEN bo.selection ILIKE '%over%' THEN bo.odds_decimal END) as over_odds,
            MAX(CASE WHEN bo.selection ILIKE '%under%' THEN bo.odds_decimal END) as under_odds,
            MAX(bo.recorded_at) as recorded_at
        FROM betting_markets bm
        JOIN betting_odds bo ON bm.market_id = bo.market_id
        WHERE bm.event_id = %s
        AND bm.market_key ILIKE %s
        AND bo.recorded_at = (
            SELECT MAX(recorded_at)
            FROM betting_odds
            WHERE market_id = bm.market_id
        )
        GROUP BY bm.market_key, bm.market_name, bo.handicap
        ORDER BY bo.recorded_at DESC
        LIMIT 1
        """

        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, (event_id, market_pattern))
                result = cur.fetchone()
                return dict(result) if result else None

        except psycopg2.Error as e:
            logger.error(f"Error fetching market odds: {e}")
            return None

    def get_spread_odds(self, event_id: str, market_pattern: str) -> Optional[Dict[str, Any]]:
        """
        Get the most recent spread odds.

        Args:
            event_id: Pinnacle event ID
            market_pattern: SQL pattern to match market_key (e.g., '%Spread%Full Game%')

        Returns:
            Dictionary with spread, home_odds, away_odds, or None
        """
        if self.dry_run:
            return None

        query = """
        SELECT
            bm.market_key,
            bo.handicap as spread,
            MAX(CASE WHEN bo.selection ILIKE '%home%' THEN bo.odds_decimal END) as home_odds,
            MAX(CASE WHEN bo.selection ILIKE '%away%' THEN bo.odds_decimal END) as away_odds,
            MAX(bo.recorded_at) as recorded_at
        FROM betting_markets bm
        JOIN betting_odds bo ON bm.market_id = bo.market_id
        WHERE bm.event_id = %s
        AND bm.market_key ILIKE %s
        AND bo.recorded_at = (
            SELECT MAX(recorded_at)
            FROM betting_odds
            WHERE market_id = bm.market_id
        )
        GROUP BY bm.market_key, bo.handicap
        ORDER BY bo.recorded_at DESC
        LIMIT 1
        """

        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, (event_id, market_pattern))
                result = cur.fetchone()
                return dict(result) if result else None

        except psycopg2.Error as e:
            logger.error(f"Error fetching spread odds: {e}")
            return None

    def get_moneyline_odds(self, event_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the most recent moneyline odds.

        Args:
            event_id: Pinnacle event ID

        Returns:
            Dictionary with home_ml, away_ml, or None
        """
        if self.dry_run:
            return None

        query = """
        SELECT
            MAX(CASE WHEN bo.selection ILIKE '%home%' THEN bo.odds_decimal END) as home_ml,
            MAX(CASE WHEN bo.selection ILIKE '%away%' THEN bo.odds_decimal END) as away_ml,
            MAX(bo.recorded_at) as recorded_at
        FROM betting_markets bm
        JOIN betting_odds bo ON bm.market_id = bo.market_id
        WHERE bm.event_id = %s
        AND bm.market_type = 'moneyline'
        AND bo.recorded_at = (
            SELECT MAX(recorded_at)
            FROM betting_odds
            WHERE market_id = bm.market_id
        )
        GROUP BY bm.market_id
        ORDER BY MAX(bo.recorded_at) DESC
        LIMIT 1
        """

        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, (event_id,))
                result = cur.fetchone()
                return dict(result) if result else None

        except psycopg2.Error as e:
            logger.error(f"Error fetching moneyline odds: {e}")
            return None

    def capture_closing_line(self, game: Dict[str, Any]) -> bool:
        """
        Capture closing line for a single game.

        Args:
            game: Game dictionary with game_id, event_id, etc.

        Returns:
            True if successful, False otherwise
        """
        game_id = game['game_id']
        event_id = game['event_id']
        game_start_time = game['event_start_time']
        hours_before = game['hours_until_game']

        logger.info(f"📊 Capturing closing line for {game['away_team']} @ {game['home_team']}")

        if self.dry_run:
            logger.info(f"DRY RUN: Would capture closing line for game {game_id}")
            return True

        try:
            # Fetch all market types
            full_game_total = self.get_latest_market_odds(event_id, '%Total%Full Game%')
            first_half_total = self.get_latest_market_odds(event_id, '%Total%1st Half%')
            first_quarter_total = self.get_latest_market_odds(event_id, '%Total%1st Quarter%')

            full_game_spread = self.get_spread_odds(event_id, '%Spread%Full Game%')
            first_half_spread = self.get_spread_odds(event_id, '%Spread%1st Half%')

            moneyline = self.get_moneyline_odds(event_id)

            # Team totals (if available)
            home_team_total = self.get_latest_market_odds(event_id, '%Team Total%Home%')
            away_team_total = self.get_latest_market_odds(event_id, '%Team Total%Away%')

            # Build closing line record
            closing_data = {
                'game_id': game_id,
                'bookmaker': 'pinnacle',
                'game_start_time': game_start_time,
                'hours_before_game': round(hours_before, 2),
                'game_total_line': full_game_total['line'] if full_game_total else None,
                'game_total_over_odds': full_game_total['over_odds'] if full_game_total else None,
                'game_total_under_odds': full_game_total['under_odds'] if full_game_total else None,
                'first_half_total': first_half_total['line'] if first_half_total else None,
                'first_half_over_odds': first_half_total['over_odds'] if first_half_total else None,
                'first_half_under_odds': first_half_total['under_odds'] if first_half_total else None,
                'first_quarter_total': first_quarter_total['line'] if first_quarter_total else None,
                'first_quarter_over_odds': first_quarter_total['over_odds'] if first_quarter_total else None,
                'first_quarter_under_odds': first_quarter_total['under_odds'] if first_quarter_total else None,
                'home_spread': full_game_spread['spread'] if full_game_spread else None,
                'home_spread_odds': full_game_spread['home_odds'] if full_game_spread else None,
                'away_spread_odds': full_game_spread['away_odds'] if full_game_spread else None,
                'first_half_spread': first_half_spread['spread'] if first_half_spread else None,
                'first_half_home_spread_odds': first_half_spread['home_odds'] if first_half_spread else None,
                'first_half_away_spread_odds': first_half_spread['away_odds'] if first_half_spread else None,
                'home_moneyline': moneyline['home_ml'] if moneyline else None,
                'away_moneyline': moneyline['away_ml'] if moneyline else None,
                'home_team_total': home_team_total['line'] if home_team_total else None,
                'home_team_over_odds': home_team_total['over_odds'] if home_team_total else None,
                'home_team_under_odds': home_team_total['under_odds'] if home_team_total else None,
                'away_team_total': away_team_total['line'] if away_team_total else None,
                'away_team_over_odds': away_team_total['over_odds'] if away_team_total else None,
                'away_team_under_odds': away_team_total['under_odds'] if away_team_total else None,
            }

            # Insert into game_closing_lines
            query = """
                INSERT INTO game_closing_lines (
                    game_id, bookmaker, game_start_time, hours_before_game,
                    game_total_line, game_total_over_odds, game_total_under_odds,
                    first_half_total, first_half_over_odds, first_half_under_odds,
                    first_quarter_total, first_quarter_over_odds, first_quarter_under_odds,
                    home_spread, home_spread_odds, away_spread_odds,
                    first_half_spread, first_half_home_spread_odds, first_half_away_spread_odds,
                    home_moneyline, away_moneyline,
                    home_team_total, home_team_over_odds, home_team_under_odds,
                    away_team_total, away_team_over_odds, away_team_under_odds,
                    recorded_at
                ) VALUES (
                    %(game_id)s, %(bookmaker)s, %(game_start_time)s, %(hours_before_game)s,
                    %(game_total_line)s, %(game_total_over_odds)s, %(game_total_under_odds)s,
                    %(first_half_total)s, %(first_half_over_odds)s, %(first_half_under_odds)s,
                    %(first_quarter_total)s, %(first_quarter_over_odds)s, %(first_quarter_under_odds)s,
                    %(home_spread)s, %(home_spread_odds)s, %(away_spread_odds)s,
                    %(first_half_spread)s, %(first_half_home_spread_odds)s, %(first_half_away_spread_odds)s,
                    %(home_moneyline)s, %(away_moneyline)s,
                    %(home_team_total)s, %(home_team_over_odds)s, %(home_team_under_odds)s,
                    %(away_team_total)s, %(away_team_over_odds)s, %(away_team_under_odds)s,
                    NOW()
                )
                ON CONFLICT (game_id, bookmaker)
                DO UPDATE SET
                    game_total_line = EXCLUDED.game_total_line,
                    game_total_over_odds = EXCLUDED.game_total_over_odds,
                    game_total_under_odds = EXCLUDED.game_total_under_odds,
                    first_half_total = EXCLUDED.first_half_total,
                    first_half_over_odds = EXCLUDED.first_half_over_odds,
                    first_half_under_odds = EXCLUDED.first_half_under_odds,
                    first_quarter_total = EXCLUDED.first_quarter_total,
                    first_quarter_over_odds = EXCLUDED.first_quarter_over_odds,
                    first_quarter_under_odds = EXCLUDED.first_quarter_under_odds,
                    home_spread = EXCLUDED.home_spread,
                    home_spread_odds = EXCLUDED.home_spread_odds,
                    away_spread_odds = EXCLUDED.away_spread_odds,
                    first_half_spread = EXCLUDED.first_half_spread,
                    first_half_home_spread_odds = EXCLUDED.first_half_home_spread_odds,
                    first_half_away_spread_odds = EXCLUDED.first_half_away_spread_odds,
                    home_moneyline = EXCLUDED.home_moneyline,
                    away_moneyline = EXCLUDED.away_moneyline,
                    home_team_total = EXCLUDED.home_team_total,
                    home_team_over_odds = EXCLUDED.home_team_over_odds,
                    home_team_under_odds = EXCLUDED.home_team_under_odds,
                    away_team_total = EXCLUDED.away_team_total,
                    away_team_over_odds = EXCLUDED.away_team_over_odds,
                    away_team_under_odds = EXCLUDED.away_team_under_odds,
                    hours_before_game = EXCLUDED.hours_before_game,
                    recorded_at = EXCLUDED.recorded_at
            """

            with self.conn.cursor() as cur:
                cur.execute(query, closing_data)

                # Mark the source betting_odds records as closing lines
                mark_query = """
                    UPDATE betting_odds
                    SET is_closing_line = TRUE
                    WHERE market_id IN (
                        SELECT market_id
                        FROM betting_markets
                        WHERE event_id = %s
                    )
                    AND recorded_at = (
                        SELECT MAX(recorded_at)
                        FROM betting_odds bo2
                        WHERE bo2.market_id = betting_odds.market_id
                    )
                    AND is_closing_line = FALSE
                """
                cur.execute(mark_query, (event_id,))
                marked_count = cur.rowcount

                self.conn.commit()

                logger.info(f"✅ Captured closing line for {game_id}")
                logger.info(f"   - Game Total: {closing_data['game_total_line']} "
                          f"(O: {closing_data['game_total_over_odds']}, "
                          f"U: {closing_data['game_total_under_odds']})")
                logger.info(f"   - Marked {marked_count} betting_odds records as closing lines")

                self.lines_captured += 1
                return True

        except psycopg2.Error as e:
            logger.error(f"Database error capturing closing line for {game_id}: {e}")
            if self.conn:
                self.conn.rollback()
            self.errors_count += 1
            return False

    def run(self):
        """Main execution flow."""
        logger.info(f"{'='*60}")
        logger.info(f"🚨 Closing Lines Capture - {get_timestamp()}")
        logger.info(f"📅 Time window: {self.hours_window} hours")
        logger.info(f"{'='*60}")

        # Connect to database
        self.connect_db()

        try:
            # Find upcoming games
            games = self.find_upcoming_games()

            if not games:
                logger.info("No games need closing line capture")
                return

            # Process each game
            for game in games:
                self.games_processed += 1
                self.capture_closing_line(game)

        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
            if self.conn:
                self.conn.rollback()

        finally:
            # Print final summary
            logger.info(f"{'='*60}")
            logger.info(f"📈 Capture Summary:")
            logger.info(f"   - Games processed: {self.games_processed}")
            logger.info(f"   - Closing lines captured: {self.lines_captured}")
            logger.info(f"   - Errors encountered: {self.errors_count}")
            logger.info(f"{'='*60}")

            # Close database
            self.close_db()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Capture closing lines for upcoming games')
    parser.add_argument('--dry-run', action='store_true',
                      help='Log what would be captured without database writes')
    parser.add_argument('--hours-window', type=float, default=2.0,
                      help='Time window for upcoming games (default: 2.0 hours)')
    args = parser.parse_args()

    # Create capturer and run
    capturer = ClosingLinesCapture(DB_CONFIG, dry_run=args.dry_run,
                                   hours_window=args.hours_window)

    try:
        capturer.run()
    except KeyboardInterrupt:
        logger.info("\n⚠️ Capture interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
