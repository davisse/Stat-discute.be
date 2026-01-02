"""
Data Loader for NBA Totals ML Pipeline

Loads historical games with closing lines and generates feature matrix
for training ML models using the FeatureEngineer.

Target Variable:
- y = 1 if actual_total > closing_line (OVER)
- y = 0 if actual_total < closing_line (UNDER)
- PUSHes are excluded from training

Usage:
    from data_loader import DataLoader

    loader = DataLoader()
    X, y, game_info = loader.load_training_data(seasons=['2019-20', '2020-21'])
"""

import os
import sys
import logging
from typing import List, Tuple, Dict, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
import numpy as np
import pandas as pd

# Add parent directory for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
from psycopg2.extras import RealDictCursor

from ml.feature_engineering import FeatureEngineer, GameFeatures

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class GameRecord:
    """Represents a single game with betting outcome for training"""
    game_id: str
    game_date: datetime
    season: str
    home_team_id: int
    away_team_id: int
    home_team: str
    away_team: str
    closing_line: float
    actual_total: int
    result: str  # OVER, UNDER, PUSH
    margin: float  # actual - line
    features: Optional[GameFeatures] = None


class DataLoader:
    """
    Loads and prepares training data for NBA totals ML models.

    Responsibilities:
    - Query games with closing lines and outcomes
    - Generate features using FeatureEngineer
    - Handle missing data appropriately
    - Return numpy arrays ready for sklearn/xgboost
    """

    def __init__(self, db_config: Optional[Dict] = None):
        """
        Initialize DataLoader with database configuration.

        Args:
            db_config: Database connection parameters. If None, uses environment.
        """
        self.db_config = db_config or {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 5432)),
            'dbname': os.getenv('DB_NAME', 'nba_stats'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', '')
        }
        self._conn = None
        # FeatureEngineer will connect on its own using env vars
        self.feature_engineer = FeatureEngineer()

    def _get_connection(self):
        """Get or create database connection"""
        if self._conn is None or self._conn.closed:
            self._conn = psycopg2.connect(**self.db_config)
        return self._conn

    def _close_connection(self):
        """Close database connection"""
        if self._conn and not self._conn.closed:
            self._conn.close()
            self._conn = None

    def get_available_seasons(self) -> List[str]:
        """
        Get list of seasons that have games with closing lines.

        Returns:
            List of season strings like ['2019-20', '2020-21', ...]
        """
        conn = self._get_connection()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT g.season
                FROM games g
                JOIN game_closing_lines gcl ON g.game_id = gcl.game_id
                JOIN game_ou_results gor ON g.game_id = gor.game_id
                WHERE g.game_status = 'Final'
                AND gcl.game_total_line IS NOT NULL
                AND gor.game_total_result IS NOT NULL
                ORDER BY g.season
            """)
            return [row[0] for row in cur.fetchall()]

    def get_games_count(self, seasons: Optional[List[str]] = None) -> Dict[str, int]:
        """
        Get count of games with betting data by season.

        Args:
            seasons: Optional list of seasons to filter

        Returns:
            Dict mapping season to game count
        """
        conn = self._get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = """
                SELECT g.season, COUNT(DISTINCT g.game_id) as game_count
                FROM games g
                JOIN game_closing_lines gcl ON g.game_id = gcl.game_id
                JOIN game_ou_results gor ON g.game_id = gor.game_id
                WHERE g.game_status = 'Final'
                AND gcl.game_total_line IS NOT NULL
                AND gor.game_total_result IS NOT NULL
            """
            if seasons:
                query += " AND g.season = ANY(%s)"
                cur.execute(query + " GROUP BY g.season ORDER BY g.season", (seasons,))
            else:
                cur.execute(query + " GROUP BY g.season ORDER BY g.season")

            return {row['season']: row['game_count'] for row in cur.fetchall()}

    def _load_game_records(
        self,
        seasons: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        min_games_required: int = 5
    ) -> List[GameRecord]:
        """
        Load game records with betting outcomes.

        Args:
            seasons: List of seasons to include (e.g., ['2019-20', '2020-21'])
            start_date: Filter games after this date
            end_date: Filter games before this date
            min_games_required: Minimum games each team must have played before game

        Returns:
            List of GameRecord objects
        """
        conn = self._get_connection()

        query = """
            WITH team_game_counts AS (
                SELECT
                    team_id,
                    game_id,
                    season,
                    game_date,
                    COUNT(*) OVER (
                        PARTITION BY team_id, season
                        ORDER BY game_date
                        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                    ) as prior_games
                FROM (
                    SELECT home_team_id as team_id, game_id, season, game_date
                    FROM games WHERE game_status = 'Final'
                    UNION ALL
                    SELECT away_team_id as team_id, game_id, season, game_date
                    FROM games WHERE game_status = 'Final'
                ) all_team_games
            )
            SELECT
                g.game_id,
                g.game_date,
                g.season,
                g.home_team_id,
                g.away_team_id,
                ht.abbreviation as home_team,
                at.abbreviation as away_team,
                gcl.game_total_line as closing_line,
                gor.actual_total,
                gor.game_total_result as result,
                gor.game_total_margin as margin
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            JOIN game_closing_lines gcl ON g.game_id = gcl.game_id
            JOIN game_ou_results gor ON g.game_id = gor.game_id
            JOIN team_game_counts htc ON g.game_id = htc.game_id AND g.home_team_id = htc.team_id
            JOIN team_game_counts atc ON g.game_id = atc.game_id AND g.away_team_id = atc.team_id
            WHERE g.game_status = 'Final'
            AND gcl.game_total_line IS NOT NULL
            AND gor.game_total_result IS NOT NULL
            AND gor.game_total_result != 'PUSH'  -- Exclude pushes
            AND htc.prior_games >= %s  -- Min games for home team
            AND atc.prior_games >= %s  -- Min games for away team
        """

        params = [min_games_required, min_games_required]

        if seasons:
            query += " AND g.season = ANY(%s)"
            params.append(seasons)

        if start_date:
            query += " AND g.game_date >= %s"
            params.append(start_date)

        if end_date:
            query += " AND g.game_date <= %s"
            params.append(end_date)

        query += " ORDER BY g.game_date"

        records = []
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            for row in cur.fetchall():
                records.append(GameRecord(
                    game_id=row['game_id'],
                    game_date=row['game_date'],
                    season=row['season'],
                    home_team_id=row['home_team_id'],
                    away_team_id=row['away_team_id'],
                    home_team=row['home_team'],
                    away_team=row['away_team'],
                    closing_line=float(row['closing_line']),
                    actual_total=row['actual_total'],
                    result=row['result'],
                    margin=float(row['margin']) if row['margin'] else 0.0
                ))

        return records

    def load_training_data(
        self,
        seasons: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        min_games_required: int = 5,
        include_game_info: bool = True,
        verbose: bool = True
    ) -> Tuple[np.ndarray, np.ndarray, Optional[pd.DataFrame]]:
        """
        Load complete training dataset with features.

        Args:
            seasons: List of seasons to include
            start_date: Filter games after this date
            end_date: Filter games before this date
            min_games_required: Minimum prior games for each team
            include_game_info: Whether to return game metadata
            verbose: Whether to print progress

        Returns:
            Tuple of (X, y, game_info):
            - X: Feature matrix (n_samples, n_features)
            - y: Target array (n_samples,) where 1=OVER, 0=UNDER
            - game_info: DataFrame with game metadata (if include_game_info=True)
        """
        logger.info("Loading game records...")
        records = self._load_game_records(
            seasons=seasons,
            start_date=start_date,
            end_date=end_date,
            min_games_required=min_games_required
        )

        if not records:
            logger.warning("No games found matching criteria")
            return np.array([]), np.array([]), None

        logger.info(f"Found {len(records)} games to process")

        # Generate features for each game
        feature_rows = []
        targets = []
        game_info_rows = []
        failed_games = []

        for i, record in enumerate(records):
            if verbose and (i + 1) % 100 == 0:
                logger.info(f"Processing game {i + 1}/{len(records)}")

            try:
                # Generate features
                features = self.feature_engineer.generate_features(
                    game_id=record.game_id,
                    game_date=record.game_date,
                    home_team_id=record.home_team_id,
                    away_team_id=record.away_team_id,
                    season=record.season
                )

                if features is None:
                    failed_games.append((record.game_id, "Feature generation returned None"))
                    continue

                # Convert features to array
                feature_dict = features.to_dict()
                feature_row = [feature_dict.get(name, 0.0) for name in self.feature_engineer.get_feature_names()]

                # Check for too many missing features
                missing_count = sum(1 for v in feature_row if v is None or (isinstance(v, float) and np.isnan(v)))
                if missing_count > len(feature_row) * 0.3:  # More than 30% missing
                    failed_games.append((record.game_id, f"Too many missing features: {missing_count}"))
                    continue

                # Replace any remaining None/NaN with 0
                feature_row = [0.0 if (v is None or (isinstance(v, float) and np.isnan(v))) else v for v in feature_row]

                feature_rows.append(feature_row)

                # Target: 1 for OVER, 0 for UNDER
                targets.append(1 if record.result == 'OVER' else 0)

                # Game info for analysis
                if include_game_info:
                    game_info_rows.append({
                        'game_id': record.game_id,
                        'game_date': record.game_date,
                        'season': record.season,
                        'home_team': record.home_team,
                        'away_team': record.away_team,
                        'closing_line': record.closing_line,
                        'actual_total': record.actual_total,
                        'result': record.result,
                        'margin': record.margin
                    })

            except Exception as e:
                failed_games.append((record.game_id, str(e)))
                continue

        # Log results
        logger.info(f"Successfully processed {len(feature_rows)} games")
        if failed_games:
            logger.warning(f"Failed to process {len(failed_games)} games")
            if verbose:
                for game_id, reason in failed_games[:10]:
                    logger.warning(f"  {game_id}: {reason}")
                if len(failed_games) > 10:
                    logger.warning(f"  ... and {len(failed_games) - 10} more")

        # Convert to numpy arrays
        X = np.array(feature_rows, dtype=np.float32)
        y = np.array(targets, dtype=np.int32)

        # Create game info DataFrame
        game_info = pd.DataFrame(game_info_rows) if include_game_info and game_info_rows else None

        return X, y, game_info

    def load_season_splits(
        self,
        train_seasons: List[str],
        test_season: str,
        min_games_required: int = 5,
        verbose: bool = True
    ) -> Dict[str, Any]:
        """
        Load data with explicit train/test season split.

        Args:
            train_seasons: List of seasons for training
            test_season: Single season for testing
            min_games_required: Minimum prior games for each team
            verbose: Whether to print progress

        Returns:
            Dict with X_train, y_train, X_test, y_test, train_info, test_info
        """
        logger.info(f"Loading training data for seasons: {train_seasons}")
        X_train, y_train, train_info = self.load_training_data(
            seasons=train_seasons,
            min_games_required=min_games_required,
            verbose=verbose
        )

        logger.info(f"Loading test data for season: {test_season}")
        X_test, y_test, test_info = self.load_training_data(
            seasons=[test_season],
            min_games_required=min_games_required,
            verbose=verbose
        )

        return {
            'X_train': X_train,
            'y_train': y_train,
            'X_test': X_test,
            'y_test': y_test,
            'train_info': train_info,
            'test_info': test_info,
            'train_seasons': train_seasons,
            'test_season': test_season,
            'feature_names': self.feature_engineer.get_feature_names()
        }

    def get_feature_names(self) -> List[str]:
        """Get list of feature names in order"""
        return self.feature_engineer.get_feature_names()

    def get_feature_statistics(self, X: np.ndarray) -> pd.DataFrame:
        """
        Calculate summary statistics for features.

        Args:
            X: Feature matrix

        Returns:
            DataFrame with feature statistics
        """
        feature_names = self.get_feature_names()

        stats = []
        for i, name in enumerate(feature_names):
            col = X[:, i]
            stats.append({
                'feature': name,
                'mean': np.mean(col),
                'std': np.std(col),
                'min': np.min(col),
                'max': np.max(col),
                'missing_pct': np.sum(col == 0) / len(col) * 100,  # Approximate
                'unique_values': len(np.unique(col))
            })

        return pd.DataFrame(stats)

    def __del__(self):
        """Cleanup database connection"""
        self._close_connection()


def main():
    """Test data loading functionality"""
    print("=" * 60)
    print("NBA Totals ML - Data Loader Test")
    print("=" * 60)

    loader = DataLoader()

    # Check available seasons
    print("\n1. Checking available seasons...")
    seasons = loader.get_available_seasons()
    print(f"   Available seasons: {seasons}")

    if not seasons:
        print("   No seasons with betting data found. Please run:")
        print("   - 1.DATABASE/etl/betting/capture_closing_lines.py")
        print("   - 1.DATABASE/etl/betting/calculate_ou_results.py")
        return

    # Get game counts
    print("\n2. Game counts by season:")
    counts = loader.get_games_count()
    for season, count in counts.items():
        print(f"   {season}: {count} games")

    total_games = sum(counts.values())
    print(f"   Total: {total_games} games")

    # Try loading a small sample
    print("\n3. Loading sample data (most recent season)...")
    test_season = seasons[-1]

    X, y, game_info = loader.load_training_data(
        seasons=[test_season],
        verbose=True
    )

    if len(X) > 0:
        print(f"\n4. Dataset Summary:")
        print(f"   Samples: {len(X)}")
        print(f"   Features: {X.shape[1]}")
        print(f"   Target distribution:")
        print(f"     OVER (1): {np.sum(y == 1)} ({np.mean(y) * 100:.1f}%)")
        print(f"     UNDER (0): {np.sum(y == 0)} ({(1 - np.mean(y)) * 100:.1f}%)")

        # Feature statistics
        print("\n5. Feature Statistics (first 10 features):")
        stats = loader.get_feature_statistics(X)
        print(stats.head(10).to_string())

        # Check for any issues
        print("\n6. Data Quality Checks:")
        nan_count = np.sum(np.isnan(X))
        inf_count = np.sum(np.isinf(X))
        print(f"   NaN values: {nan_count}")
        print(f"   Inf values: {inf_count}")

        # Sample game info
        if game_info is not None:
            print("\n7. Sample Game Info:")
            print(game_info.head(5).to_string())
    else:
        print("   No data loaded. Check if closing lines and O/U results are populated.")

    print("\n" + "=" * 60)
    print("Data Loader Test Complete")
    print("=" * 60)


if __name__ == "__main__":
    main()
