#!/usr/bin/env python3
"""
O/U Results Calculator
Calculate over/under results for completed games with stored betting lines.

This script:
1. Queries completed games with final scores and period scores
2. Retrieves closing betting lines from game_closing_lines table
3. Calculates O/U results for: Full Game, 1st Half, 1st Quarter, Team Totals
4. Calculates spread results for ATS tracking
5. Stores results in game_ou_results table with ON CONFLICT handling

Usage:
    python calculate_ou_results.py [--season SEASON] [--date DATE] [--dry-run]

Options:
    --season: Season to process (e.g., '2025-26'). Default: current season
    --date: Specific date to process (YYYY-MM-DD). Default: all completed games
    --dry-run: Calculate and log results without writing to database
"""

import sys
import argparse
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
from decimal import Decimal

import psycopg2
from psycopg2.extras import RealDictCursor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'nba_stats',
    'user': 'chapirou',
    'password': ''
}


class OUResultsCalculator:
    """Calculate and store O/U results for completed games."""

    def __init__(self, db_config: Dict[str, Any], dry_run: bool = False):
        """
        Initialize calculator with database configuration.

        Args:
            db_config: Database connection parameters
            dry_run: If True, don't write to database
        """
        self.db_config = db_config
        self.dry_run = dry_run
        self.conn = None
        self.results_calculated = 0
        self.results_stored = 0
        self.errors_count = 0

    def connect_db(self):
        """Establish database connection."""
        if self.dry_run:
            logger.info("DRY RUN: Skipping database connection")
            # Still connect for read operations
            self.conn = psycopg2.connect(**self.db_config)
            self.conn.autocommit = True
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

    def get_current_season(self) -> str:
        """Get the current season from seasons table."""
        query = "SELECT season_id FROM seasons WHERE is_current = true LIMIT 1"

        try:
            with self.conn.cursor() as cur:
                cur.execute(query)
                result = cur.fetchone()
                if result:
                    return result[0]
                else:
                    logger.warning("No current season found, using '2025-26'")
                    return '2025-26'
        except psycopg2.Error as e:
            logger.error(f"Error fetching current season: {e}")
            return '2025-26'

    def fetch_completed_games_with_data(self, season: Optional[str] = None,
                                       game_date: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetch completed games with scores, period scores, and closing lines.

        Args:
            season: Season to filter (e.g., '2025-26')
            game_date: Specific date to filter (YYYY-MM-DD)

        Returns:
            List of game data dictionaries
        """
        logger.info("📋 Fetching completed games with betting lines...")

        query = """
        SELECT
            g.game_id,
            g.game_date,
            g.season,
            ht.abbreviation as home_team,
            at.abbreviation as away_team,

            -- Actual scores from team_game_stats
            tgs_home.points as home_pts,
            tgs_away.points as away_pts,

            -- Period scores (Q1)
            (SELECT SUM(points) FROM period_scores ps
             WHERE ps.game_id = g.game_id
             AND ps.period_number = 1
             AND ps.period_type = 'Q') as q1_total,

            -- Period scores (First Half = Q1 + Q2)
            (SELECT SUM(points) FROM period_scores ps
             WHERE ps.game_id = g.game_id
             AND ps.is_first_half = true
             AND ps.period_type = 'Q') as first_half_total,

            -- Home team period scores
            (SELECT points FROM period_scores ps
             WHERE ps.game_id = g.game_id
             AND ps.team_id = g.home_team_id
             AND ps.period_number = 1
             AND ps.period_type = 'Q') as home_q1,

            (SELECT SUM(points) FROM period_scores ps
             WHERE ps.game_id = g.game_id
             AND ps.team_id = g.home_team_id
             AND ps.is_first_half = true
             AND ps.period_type = 'Q') as home_first_half,

            -- Away team period scores
            (SELECT points FROM period_scores ps
             WHERE ps.game_id = g.game_id
             AND ps.team_id = g.away_team_id
             AND ps.period_number = 1
             AND ps.period_type = 'Q') as away_q1,

            (SELECT SUM(points) FROM period_scores ps
             WHERE ps.game_id = g.game_id
             AND ps.team_id = g.away_team_id
             AND ps.is_first_half = true
             AND ps.period_type = 'Q') as away_first_half,

            -- Closing lines from game_closing_lines table
            gcl.game_total_line,
            gcl.first_half_total as first_half_line,
            gcl.first_quarter_total as first_quarter_line,
            gcl.home_team_total as home_team_line,
            gcl.away_team_total as away_team_line,
            gcl.home_spread as spread_line,
            gcl.bookmaker

        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        JOIN team_game_stats tgs_home ON g.game_id = tgs_home.game_id
            AND tgs_home.team_id = g.home_team_id
        JOIN team_game_stats tgs_away ON g.game_id = tgs_away.game_id
            AND tgs_away.team_id = g.away_team_id
        LEFT JOIN game_closing_lines gcl ON g.game_id = gcl.game_id

        WHERE g.game_status = 'Final'
          AND gcl.game_total_line IS NOT NULL  -- Only games with closing lines
        """

        params = []
        if season:
            query += " AND g.season = %s"
            params.append(season)
        if game_date:
            query += " AND g.game_date = %s"
            params.append(game_date)

        query += " ORDER BY g.game_date DESC"

        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, params)
                games = cur.fetchall()
                logger.info(f"✅ Found {len(games)} completed games with closing lines")
                return games

        except psycopg2.Error as e:
            logger.error(f"Database error fetching games: {e}")
            self.errors_count += 1
            return []

    def determine_result(self, actual: Optional[int], line: Optional[Decimal]) -> Optional[str]:
        """
        Determine OVER/UNDER/PUSH result.

        Args:
            actual: Actual total points
            line: Betting line

        Returns:
            'OVER', 'UNDER', or 'PUSH'
        """
        if actual is None or line is None:
            return None

        actual_decimal = Decimal(str(actual))

        if actual_decimal > line:
            return 'OVER'
        elif actual_decimal < line:
            return 'UNDER'
        else:
            return 'PUSH'

    def determine_spread_result(self, actual_margin: Optional[int],
                               spread: Optional[Decimal]) -> Optional[str]:
        """
        Determine COVER/LOSS/PUSH result for home team spread.

        Args:
            actual_margin: Actual margin (home_pts - away_pts)
            spread: Home spread line (typically negative for favorite)

        Returns:
            'COVER', 'LOSS', or 'PUSH' for home team
        """
        if actual_margin is None or spread is None:
            return None

        # Adjusted margin = actual margin + spread
        # Example: Home wins by 5, spread is -7.5
        # Adjusted = 5 + (-7.5) = -2.5 (did not cover)
        adjusted = Decimal(str(actual_margin)) + spread

        if adjusted > 0:
            return 'COVER'
        elif adjusted < 0:
            return 'LOSS'
        else:
            return 'PUSH'

    def calculate_margin(self, actual: Optional[int], line: Optional[Decimal]) -> Optional[Decimal]:
        """
        Calculate margin (actual - line).

        Args:
            actual: Actual total points
            line: Betting line

        Returns:
            Margin (positive means over)
        """
        if actual is None or line is None:
            return None

        return Decimal(str(actual)) - line

    def calculate_game_results(self, game: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate all O/U results for a game.

        Args:
            game: Game data dictionary

        Returns:
            Dictionary with calculated results
        """
        results = {
            'game_id': game['game_id'],
            'bookmaker': game.get('bookmaker', 'pinnacle')
        }

        # Full Game Total
        actual_total = game['home_pts'] + game['away_pts']
        results['game_total_line'] = game['game_total_line']
        results['actual_total'] = actual_total
        results['game_total_result'] = self.determine_result(actual_total, game['game_total_line'])
        results['game_total_margin'] = self.calculate_margin(actual_total, game['game_total_line'])

        # First Half Total
        if game['first_half_total'] and game['first_half_line']:
            results['first_half_line'] = game['first_half_line']
            results['actual_first_half'] = game['first_half_total']
            results['first_half_result'] = self.determine_result(
                game['first_half_total'], game['first_half_line']
            )
            results['first_half_margin'] = self.calculate_margin(
                game['first_half_total'], game['first_half_line']
            )

        # First Quarter Total
        if game['q1_total'] and game['first_quarter_line']:
            results['first_quarter_line'] = game['first_quarter_line']
            results['actual_first_quarter'] = game['q1_total']
            results['first_quarter_result'] = self.determine_result(
                game['q1_total'], game['first_quarter_line']
            )
            results['first_quarter_margin'] = self.calculate_margin(
                game['q1_total'], game['first_quarter_line']
            )

        # Home Team Total
        if game['home_team_line']:
            results['home_team_line'] = game['home_team_line']
            results['actual_home_score'] = game['home_pts']
            results['home_team_result'] = self.determine_result(
                game['home_pts'], game['home_team_line']
            )
            results['home_team_margin'] = self.calculate_margin(
                game['home_pts'], game['home_team_line']
            )

        # Away Team Total
        if game['away_team_line']:
            results['away_team_line'] = game['away_team_line']
            results['actual_away_score'] = game['away_pts']
            results['away_team_result'] = self.determine_result(
                game['away_pts'], game['away_team_line']
            )
            results['away_team_margin'] = self.calculate_margin(
                game['away_pts'], game['away_team_line']
            )

        # Spread Result
        if game['spread_line']:
            actual_margin = game['home_pts'] - game['away_pts']
            results['spread_line'] = game['spread_line']
            results['actual_margin'] = actual_margin
            results['home_spread_result'] = self.determine_spread_result(
                actual_margin, game['spread_line']
            )

        return results

    def store_ou_results(self, results: Dict[str, Any]) -> bool:
        """
        Store O/U results in database.

        Args:
            results: Calculated results dictionary

        Returns:
            True if successful, False otherwise
        """
        if self.dry_run:
            logger.info(f"DRY RUN: Would store results for game {results['game_id']}")
            logger.info(f"  Game Total: {results['actual_total']} vs {results['game_total_line']} = {results['game_total_result']}")
            if results.get('first_half_result'):
                logger.info(f"  1st Half: {results['actual_first_half']} vs {results['first_half_line']} = {results['first_half_result']}")
            if results.get('home_spread_result'):
                logger.info(f"  Home Spread: {results['actual_margin']} vs {results['spread_line']} = {results['home_spread_result']}")
            return True

        query = """
            INSERT INTO game_ou_results (
                game_id,
                game_total_line, actual_total, game_total_result, game_total_margin,
                first_half_line, actual_first_half, first_half_result, first_half_margin,
                first_quarter_line, actual_first_quarter, first_quarter_result, first_quarter_margin,
                home_team_line, actual_home_score, home_team_result, home_team_margin,
                away_team_line, actual_away_score, away_team_result, away_team_margin,
                spread_line, actual_margin, home_spread_result,
                bookmaker, created_at
            ) VALUES (
                %(game_id)s,
                %(game_total_line)s, %(actual_total)s, %(game_total_result)s, %(game_total_margin)s,
                %(first_half_line)s, %(actual_first_half)s, %(first_half_result)s, %(first_half_margin)s,
                %(first_quarter_line)s, %(actual_first_quarter)s, %(first_quarter_result)s, %(first_quarter_margin)s,
                %(home_team_line)s, %(actual_home_score)s, %(home_team_result)s, %(home_team_margin)s,
                %(away_team_line)s, %(actual_away_score)s, %(away_team_result)s, %(away_team_margin)s,
                %(spread_line)s, %(actual_margin)s, %(home_spread_result)s,
                %(bookmaker)s, NOW()
            )
            ON CONFLICT (game_id, bookmaker)
            DO UPDATE SET
                game_total_line = EXCLUDED.game_total_line,
                actual_total = EXCLUDED.actual_total,
                game_total_result = EXCLUDED.game_total_result,
                game_total_margin = EXCLUDED.game_total_margin,
                first_half_line = EXCLUDED.first_half_line,
                actual_first_half = EXCLUDED.actual_first_half,
                first_half_result = EXCLUDED.first_half_result,
                first_half_margin = EXCLUDED.first_half_margin,
                first_quarter_line = EXCLUDED.first_quarter_line,
                actual_first_quarter = EXCLUDED.actual_first_quarter,
                first_quarter_result = EXCLUDED.first_quarter_result,
                first_quarter_margin = EXCLUDED.first_quarter_margin,
                home_team_line = EXCLUDED.home_team_line,
                actual_home_score = EXCLUDED.actual_home_score,
                home_team_result = EXCLUDED.home_team_result,
                home_team_margin = EXCLUDED.home_team_margin,
                away_team_line = EXCLUDED.away_team_line,
                actual_away_score = EXCLUDED.actual_away_score,
                away_team_result = EXCLUDED.away_team_result,
                away_team_margin = EXCLUDED.away_team_margin,
                spread_line = EXCLUDED.spread_line,
                actual_margin = EXCLUDED.actual_margin,
                home_spread_result = EXCLUDED.home_spread_result,
                created_at = NOW()
        """

        try:
            with self.conn.cursor() as cur:
                cur.execute(query, results)
                self.conn.commit()
                self.results_stored += 1
                return True

        except psycopg2.Error as e:
            logger.error(f"Database error storing results for {results['game_id']}: {e}")
            self.conn.rollback()
            self.errors_count += 1
            return False

    def run(self, season: Optional[str] = None, game_date: Optional[str] = None):
        """
        Main execution flow.

        Args:
            season: Season to process
            game_date: Specific date to process
        """
        logger.info(f"{'='*60}")
        logger.info(f"🎯 O/U Results Calculator - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"{'='*60}")

        # Connect to database
        self.connect_db()

        try:
            # Determine season
            if not season:
                season = self.get_current_season()
            logger.info(f"📅 Processing season: {season}")
            if game_date:
                logger.info(f"📅 Processing date: {game_date}")

            # Fetch completed games
            games = self.fetch_completed_games_with_data(season, game_date)

            if not games:
                logger.warning("No games to process")
                return

            # Process each game
            for game in games:
                try:
                    # Calculate results
                    results = self.calculate_game_results(game)
                    self.results_calculated += 1

                    # Store results
                    success = self.store_ou_results(results)

                    if success:
                        logger.info(
                            f"✅ {game['game_date']} - {game['away_team']} @ {game['home_team']}: "
                            f"{results['actual_total']} ({results['game_total_result']} {results['game_total_line']})"
                        )

                except Exception as e:
                    logger.error(f"Error processing game {game['game_id']}: {e}")
                    self.errors_count += 1
                    continue

        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
            if self.conn and not self.dry_run:
                self.conn.rollback()

        finally:
            # Print final summary
            logger.info(f"{'='*60}")
            logger.info(f"📈 Calculation Summary:")
            logger.info(f"   - Games processed: {self.results_calculated}")
            logger.info(f"   - Results stored: {self.results_stored}")
            logger.info(f"   - Errors encountered: {self.errors_count}")
            logger.info(f"{'='*60}")

            # Close database
            self.close_db()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Calculate O/U results for completed games')
    parser.add_argument('--season', type=str, help='Season to process (e.g., 2025-26)')
    parser.add_argument('--date', type=str, help='Specific date to process (YYYY-MM-DD)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Calculate and log without database writes')
    args = parser.parse_args()

    # Create calculator and run
    calculator = OUResultsCalculator(DB_CONFIG, dry_run=args.dry_run)

    try:
        calculator.run(season=args.season, game_date=args.date)
    except KeyboardInterrupt:
        logger.info("\n⚠️ Calculation interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
