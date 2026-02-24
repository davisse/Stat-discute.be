#!/usr/bin/env python3
"""
ATS Performance Updater
Aggregate O/U results and spread results into ats_performance table.

This script:
1. Aggregates game_ou_results by team and season
2. Counts OVER/UNDER/PUSH results for each team
3. Counts COVER/LOSS/PUSH results for spread betting (ATS)
4. Updates ats_performance table with aggregated statistics
5. Handles both home and away games for each team

Usage:
    python update_ats_performance.py [--season SEASON] [--dry-run]

Options:
    --season: Season to process (e.g., '2025-26'). Default: current season
    --dry-run: Calculate and log statistics without updating database
"""

import sys
import argparse
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any

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


class ATSPerformanceUpdater:
    """Aggregate O/U results into ats_performance table."""

    def __init__(self, db_config: Dict[str, Any], dry_run: bool = False):
        """
        Initialize updater with database configuration.

        Args:
            db_config: Database connection parameters
            dry_run: If True, don't write to database
        """
        self.db_config = db_config
        self.dry_run = dry_run
        self.conn = None
        self.teams_updated = 0
        self.errors_count = 0

    def connect_db(self):
        """Establish database connection."""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.conn.autocommit = False if not self.dry_run else True
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

    def aggregate_team_ou_stats(self, season: str) -> List[Dict[str, Any]]:
        """
        Aggregate O/U statistics by team for a season.

        This query counts OVER/UNDER/PUSH results for all games
        where the team participated (home or away).

        Args:
            season: Season to aggregate (e.g., '2025-26')

        Returns:
            List of team statistics dictionaries
        """
        logger.info(f"📊 Aggregating O/U statistics for season {season}...")

        query = """
        SELECT
            t.team_id,
            t.abbreviation,
            g.season as season_id,
            COUNT(DISTINCT g.game_id) as games_with_results,

            -- Full Game O/U counts
            SUM(CASE WHEN gor.game_total_result = 'OVER' THEN 1 ELSE 0 END) as over_record,
            SUM(CASE WHEN gor.game_total_result = 'UNDER' THEN 1 ELSE 0 END) as under_record,
            SUM(CASE WHEN gor.game_total_result = 'PUSH' THEN 1 ELSE 0 END) as ou_pushes,

            -- Spread results (ATS) - for home games
            SUM(CASE
                WHEN g.home_team_id = t.team_id AND gor.home_spread_result = 'COVER'
                THEN 1
                WHEN g.away_team_id = t.team_id AND gor.home_spread_result = 'LOSS'
                THEN 1
                ELSE 0
            END) as ats_wins,

            SUM(CASE
                WHEN g.home_team_id = t.team_id AND gor.home_spread_result = 'LOSS'
                THEN 1
                WHEN g.away_team_id = t.team_id AND gor.home_spread_result = 'COVER'
                THEN 1
                ELSE 0
            END) as ats_losses,

            SUM(CASE WHEN gor.home_spread_result = 'PUSH' THEN 1 ELSE 0 END) as ats_pushes,

            -- Home-specific stats
            SUM(CASE
                WHEN g.home_team_id = t.team_id AND gor.home_spread_result = 'COVER'
                THEN 1 ELSE 0
            END) as home_ats_wins,

            SUM(CASE
                WHEN g.home_team_id = t.team_id AND gor.home_spread_result = 'LOSS'
                THEN 1 ELSE 0
            END) as home_ats_losses,

            -- Away-specific stats
            SUM(CASE
                WHEN g.away_team_id = t.team_id AND gor.home_spread_result = 'LOSS'
                THEN 1 ELSE 0
            END) as away_ats_wins,

            SUM(CASE
                WHEN g.away_team_id = t.team_id AND gor.home_spread_result = 'COVER'
                THEN 1 ELSE 0
            END) as away_ats_losses,

            -- Favorite/Underdog stats (based on spread sign)
            SUM(CASE
                WHEN g.home_team_id = t.team_id
                     AND gor.spread_line < 0
                     AND gor.home_spread_result = 'COVER'
                THEN 1
                WHEN g.away_team_id = t.team_id
                     AND gor.spread_line > 0
                     AND gor.home_spread_result = 'LOSS'
                THEN 1
                ELSE 0
            END) as favorite_ats_wins,

            SUM(CASE
                WHEN g.home_team_id = t.team_id
                     AND gor.spread_line < 0
                     AND gor.home_spread_result = 'LOSS'
                THEN 1
                WHEN g.away_team_id = t.team_id
                     AND gor.spread_line > 0
                     AND gor.home_spread_result = 'COVER'
                THEN 1
                ELSE 0
            END) as favorite_ats_losses,

            SUM(CASE
                WHEN g.home_team_id = t.team_id
                     AND gor.spread_line > 0
                     AND gor.home_spread_result = 'COVER'
                THEN 1
                WHEN g.away_team_id = t.team_id
                     AND gor.spread_line < 0
                     AND gor.home_spread_result = 'LOSS'
                THEN 1
                ELSE 0
            END) as underdog_ats_wins,

            SUM(CASE
                WHEN g.home_team_id = t.team_id
                     AND gor.spread_line > 0
                     AND gor.home_spread_result = 'LOSS'
                THEN 1
                WHEN g.away_team_id = t.team_id
                     AND gor.spread_line < 0
                     AND gor.home_spread_result = 'COVER'
                THEN 1
                ELSE 0
            END) as underdog_ats_losses

        FROM teams t
        JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
        JOIN game_ou_results gor ON g.game_id = gor.game_id
        WHERE g.season = %s
          AND g.game_status = 'Final'
        GROUP BY t.team_id, t.abbreviation, g.season
        ORDER BY t.abbreviation
        """

        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, (season,))
                results = cur.fetchall()
                logger.info(f"✅ Found statistics for {len(results)} teams")
                return results

        except psycopg2.Error as e:
            logger.error(f"Database error aggregating statistics: {e}")
            self.errors_count += 1
            return []

    def calculate_ats_win_pct(self, wins: int, losses: int) -> Optional[float]:
        """
        Calculate ATS win percentage.

        Args:
            wins: Number of ATS wins
            losses: Number of ATS losses

        Returns:
            Win percentage (0.0 to 1.0) or None if no games
        """
        total_games = wins + losses
        if total_games == 0:
            return None
        return round(wins / total_games, 3)

    def update_ats_performance(self, stats: Dict[str, Any]) -> bool:
        """
        Update ats_performance table with aggregated statistics.

        Args:
            stats: Team statistics dictionary

        Returns:
            True if successful, False otherwise
        """
        if self.dry_run:
            logger.info(f"DRY RUN: Would update {stats['abbreviation']} for {stats['season_id']}")
            logger.info(f"  O/U: {stats['over_record']}-{stats['under_record']}-{stats['ou_pushes']}")
            logger.info(f"  ATS: {stats['ats_wins']}-{stats['ats_losses']}-{stats['ats_pushes']}")
            logger.info(f"  Home ATS: {stats['home_ats_wins']}-{stats['home_ats_losses']}")
            logger.info(f"  Away ATS: {stats['away_ats_wins']}-{stats['away_ats_losses']}")
            logger.info(f"  Favorite: {stats['favorite_ats_wins']}-{stats['favorite_ats_losses']}")
            logger.info(f"  Underdog: {stats['underdog_ats_wins']}-{stats['underdog_ats_losses']}")
            return True

        # Calculate win percentage
        ats_win_pct = self.calculate_ats_win_pct(stats['ats_wins'], stats['ats_losses'])

        query = """
            INSERT INTO ats_performance (
                team_id, season_id,
                ats_wins, ats_losses, ats_pushes, ats_win_pct,
                home_ats_wins, home_ats_losses,
                away_ats_wins, away_ats_losses,
                favorite_ats_wins, favorite_ats_losses,
                underdog_ats_wins, underdog_ats_losses,
                over_record, under_record, ou_pushes,
                last_updated
            ) VALUES (
                %(team_id)s, %(season_id)s,
                %(ats_wins)s, %(ats_losses)s, %(ats_pushes)s, %(ats_win_pct)s,
                %(home_ats_wins)s, %(home_ats_losses)s,
                %(away_ats_wins)s, %(away_ats_losses)s,
                %(favorite_ats_wins)s, %(favorite_ats_losses)s,
                %(underdog_ats_wins)s, %(underdog_ats_losses)s,
                %(over_record)s, %(under_record)s, %(ou_pushes)s,
                NOW()
            )
            ON CONFLICT (team_id, season_id)
            DO UPDATE SET
                ats_wins = EXCLUDED.ats_wins,
                ats_losses = EXCLUDED.ats_losses,
                ats_pushes = EXCLUDED.ats_pushes,
                ats_win_pct = EXCLUDED.ats_win_pct,
                home_ats_wins = EXCLUDED.home_ats_wins,
                home_ats_losses = EXCLUDED.home_ats_losses,
                away_ats_wins = EXCLUDED.away_ats_wins,
                away_ats_losses = EXCLUDED.away_ats_losses,
                favorite_ats_wins = EXCLUDED.favorite_ats_wins,
                favorite_ats_losses = EXCLUDED.favorite_ats_losses,
                underdog_ats_wins = EXCLUDED.underdog_ats_wins,
                underdog_ats_losses = EXCLUDED.underdog_ats_losses,
                over_record = EXCLUDED.over_record,
                under_record = EXCLUDED.under_record,
                ou_pushes = EXCLUDED.ou_pushes,
                last_updated = NOW()
        """

        try:
            with self.conn.cursor() as cur:
                # Add calculated win percentage to stats
                update_data = dict(stats)
                update_data['ats_win_pct'] = ats_win_pct

                cur.execute(query, update_data)
                self.conn.commit()
                self.teams_updated += 1

                win_pct_str = f"{ats_win_pct:.1%}" if ats_win_pct else "N/A"
                logger.info(
                    f"✅ Updated {stats['abbreviation']}: "
                    f"O/U {stats['over_record']}-{stats['under_record']}, "
                    f"ATS {stats['ats_wins']}-{stats['ats_losses']} "
                    f"({win_pct_str})"
                )
                return True

        except psycopg2.Error as e:
            logger.error(f"Database error updating {stats['abbreviation']}: {e}")
            self.conn.rollback()
            self.errors_count += 1
            return False

    def verify_update(self, season: str):
        """
        Verify that ats_performance table was updated correctly.

        Args:
            season: Season to verify
        """
        query = """
        SELECT
            t.abbreviation,
            ap.ats_wins,
            ap.ats_losses,
            ap.ats_win_pct,
            ap.over_record,
            ap.under_record
        FROM ats_performance ap
        JOIN teams t ON ap.team_id = t.team_id
        WHERE ap.season_id = %s
        ORDER BY ap.ats_win_pct DESC NULLS LAST
        LIMIT 5
        """

        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, (season,))
                results = cur.fetchall()

                if results:
                    logger.info(f"\n📊 Top 5 Teams by ATS Win %:")
                    for i, team in enumerate(results, 1):
                        win_pct = f"{team['ats_win_pct']:.1%}" if team['ats_win_pct'] else "N/A"
                        logger.info(
                            f"  {i}. {team['abbreviation']}: "
                            f"ATS {team['ats_wins']}-{team['ats_losses']} ({win_pct}), "
                            f"O/U {team['over_record']}-{team['under_record']}"
                        )
                else:
                    logger.warning("No results found in ats_performance table")

        except psycopg2.Error as e:
            logger.error(f"Error verifying update: {e}")

    def run(self, season: Optional[str] = None):
        """
        Main execution flow.

        Args:
            season: Season to process
        """
        logger.info(f"{'='*60}")
        logger.info(f"📈 ATS Performance Updater - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"{'='*60}")

        # Connect to database
        self.connect_db()

        try:
            # Determine season
            if not season:
                season = self.get_current_season()
            logger.info(f"📅 Processing season: {season}")

            # Aggregate statistics
            team_stats = self.aggregate_team_ou_stats(season)

            if not team_stats:
                logger.warning("No statistics to process")
                return

            # Update each team
            for stats in team_stats:
                self.update_ats_performance(stats)

            # Verify update if not dry run
            if not self.dry_run:
                self.verify_update(season)

        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
            if self.conn and not self.dry_run:
                self.conn.rollback()

        finally:
            # Print final summary
            logger.info(f"\n{'='*60}")
            logger.info(f"📈 Update Summary:")
            logger.info(f"   - Teams updated: {self.teams_updated}")
            logger.info(f"   - Errors encountered: {self.errors_count}")
            logger.info(f"{'='*60}")

            # Close database
            self.close_db()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Update ATS performance statistics')
    parser.add_argument('--season', type=str, help='Season to process (e.g., 2025-26)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Calculate and log without database writes')
    args = parser.parse_args()

    # Create updater and run
    updater = ATSPerformanceUpdater(DB_CONFIG, dry_run=args.dry_run)

    try:
        updater.run(season=args.season)
    except KeyboardInterrupt:
        logger.info("\n⚠️ Update interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
