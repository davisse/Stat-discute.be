"""
Walk-Forward Validation for NBA Totals ML Pipeline

Time-series cross-validation that respects temporal ordering to avoid look-ahead bias.
Each split trains on historical data and tests on the next season.

Example splits:
- Split 1: Train 2014-17 → Test 2017-18
- Split 2: Train 2014-18 → Test 2018-19
- Split 3: Train 2014-19 → Test 2019-20
...

Usage:
    from training.walk_forward import WalkForwardValidator

    validator = WalkForwardValidator()
    for split in validator.generate_splits(data_loader, start_year=2017):
        model.fit(split['X_train'], split['y_train'])
        predictions = model.predict_proba(split['X_test'])
        # Evaluate...
"""

import logging
from typing import List, Dict, Any, Generator, Optional, Tuple
from dataclasses import dataclass, field
import numpy as np
import pandas as pd
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@dataclass
class WalkForwardSplit:
    """Represents a single walk-forward validation split"""
    split_id: int
    train_seasons: List[str]
    test_season: str
    X_train: np.ndarray
    y_train: np.ndarray
    X_test: np.ndarray
    y_test: np.ndarray
    train_info: pd.DataFrame
    test_info: pd.DataFrame
    feature_names: List[str]

    @property
    def train_size(self) -> int:
        return len(self.y_train)

    @property
    def test_size(self) -> int:
        return len(self.y_test)

    @property
    def train_over_rate(self) -> float:
        return np.mean(self.y_train) if len(self.y_train) > 0 else 0.0

    @property
    def test_over_rate(self) -> float:
        return np.mean(self.y_test) if len(self.y_test) > 0 else 0.0


@dataclass
class WalkForwardResults:
    """Aggregated results from walk-forward validation"""
    splits: List[Dict[str, Any]] = field(default_factory=list)
    total_train_games: int = 0
    total_test_games: int = 0
    test_seasons: List[str] = field(default_factory=list)

    def add_split_result(
        self,
        split: WalkForwardSplit,
        predictions: np.ndarray,
        probabilities: np.ndarray,
        metrics: Dict[str, float]
    ):
        """Add results from a single split"""
        self.splits.append({
            'split_id': split.split_id,
            'train_seasons': split.train_seasons,
            'test_season': split.test_season,
            'train_size': split.train_size,
            'test_size': split.test_size,
            'predictions': predictions,
            'probabilities': probabilities,
            'actuals': split.y_test,
            'test_info': split.test_info,
            'metrics': metrics
        })
        self.total_train_games += split.train_size
        self.total_test_games += split.test_size
        self.test_seasons.append(split.test_season)

    def get_aggregated_metrics(self) -> Dict[str, float]:
        """Calculate aggregated metrics across all splits"""
        if not self.splits:
            return {}

        # Combine all predictions and actuals
        all_preds = np.concatenate([s['predictions'] for s in self.splits])
        all_probs = np.concatenate([s['probabilities'] for s in self.splits])
        all_actuals = np.concatenate([s['actuals'] for s in self.splits])

        # Calculate overall metrics
        accuracy = np.mean(all_preds == all_actuals)
        over_accuracy = np.mean(all_preds[all_actuals == 1] == 1) if np.sum(all_actuals == 1) > 0 else 0
        under_accuracy = np.mean(all_preds[all_actuals == 0] == 0) if np.sum(all_actuals == 0) > 0 else 0

        # Average metrics per split
        avg_accuracy = np.mean([s['metrics'].get('accuracy', 0) for s in self.splits])
        avg_roi = np.mean([s['metrics'].get('roi', 0) for s in self.splits])

        # Consistency: How many splits were profitable?
        profitable_splits = sum(1 for s in self.splits if s['metrics'].get('roi', 0) > 0)

        return {
            'overall_accuracy': accuracy,
            'overall_over_accuracy': over_accuracy,
            'overall_under_accuracy': under_accuracy,
            'avg_split_accuracy': avg_accuracy,
            'avg_split_roi': avg_roi,
            'profitable_splits': profitable_splits,
            'total_splits': len(self.splits),
            'profitability_rate': profitable_splits / len(self.splits) if self.splits else 0
        }

    def to_dataframe(self) -> pd.DataFrame:
        """Convert split results to DataFrame"""
        rows = []
        for s in self.splits:
            row = {
                'split_id': s['split_id'],
                'train_seasons': ' → '.join(s['train_seasons'][-3:]),  # Last 3 training seasons
                'test_season': s['test_season'],
                'train_size': s['train_size'],
                'test_size': s['test_size'],
            }
            row.update(s['metrics'])
            rows.append(row)
        return pd.DataFrame(rows)


class WalkForwardValidator:
    """
    Walk-Forward Cross-Validation for time-series betting data.

    Key principles:
    - Train only on past data, never on future
    - Each test season uses all prior seasons for training
    - Expanding window: training set grows with each split
    """

    # All available NBA seasons for training (based on database schema)
    ALL_SEASONS = [
        '2014-15', '2015-16', '2016-17', '2017-18', '2018-19',
        '2019-20', '2020-21', '2021-22', '2022-23', '2023-24', '2024-25'
    ]

    def __init__(
        self,
        min_train_seasons: int = 3,
        expanding_window: bool = True,
        fixed_window_size: Optional[int] = None
    ):
        """
        Initialize walk-forward validator.

        Args:
            min_train_seasons: Minimum number of seasons for training
            expanding_window: If True, training set expands (all prior seasons)
                            If False, uses fixed window of recent seasons
            fixed_window_size: Number of seasons in fixed window (if expanding_window=False)
        """
        self.min_train_seasons = min_train_seasons
        self.expanding_window = expanding_window
        self.fixed_window_size = fixed_window_size or 3

    def _get_season_index(self, season: str) -> int:
        """Get index of season in ALL_SEASONS list"""
        try:
            return self.ALL_SEASONS.index(season)
        except ValueError:
            raise ValueError(f"Unknown season: {season}. Available: {self.ALL_SEASONS}")

    def generate_split_configs(
        self,
        available_seasons: List[str],
        start_test_year: int = 2017,
        end_test_year: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate configuration for each walk-forward split.

        Args:
            available_seasons: Seasons available in database
            start_test_year: First year to use as test set (e.g., 2017 for 2017-18)
            end_test_year: Last year to use as test set

        Returns:
            List of split configurations
        """
        # Sort available seasons
        available_seasons = sorted(available_seasons)

        configs = []
        split_id = 1

        for test_season in available_seasons:
            # Parse year from season string (e.g., '2017-18' -> 2017)
            test_year = int(test_season.split('-')[0])

            # Skip if before start year
            if test_year < start_test_year:
                continue

            # Skip if after end year
            if end_test_year and test_year > end_test_year:
                break

            # Get all seasons before test season
            test_idx = available_seasons.index(test_season)
            prior_seasons = available_seasons[:test_idx]

            # Check minimum training seasons
            if len(prior_seasons) < self.min_train_seasons:
                logger.debug(f"Skipping {test_season}: only {len(prior_seasons)} prior seasons")
                continue

            # Determine training seasons
            if self.expanding_window:
                train_seasons = prior_seasons
            else:
                train_seasons = prior_seasons[-self.fixed_window_size:]

            configs.append({
                'split_id': split_id,
                'train_seasons': train_seasons,
                'test_season': test_season
            })
            split_id += 1

        return configs

    def generate_splits(
        self,
        data_loader,
        start_test_year: int = 2017,
        end_test_year: Optional[int] = None,
        min_games_required: int = 5,
        verbose: bool = True
    ) -> Generator[WalkForwardSplit, None, None]:
        """
        Generate walk-forward validation splits.

        Args:
            data_loader: DataLoader instance for loading training data
            start_test_year: First year to use as test set
            end_test_year: Last year to use as test set
            min_games_required: Minimum prior games for each team
            verbose: Whether to print progress

        Yields:
            WalkForwardSplit objects
        """
        # Get available seasons from database
        available_seasons = data_loader.get_available_seasons()

        if not available_seasons:
            logger.error("No seasons available in database")
            return

        logger.info(f"Available seasons: {available_seasons}")

        # Generate split configurations
        configs = self.generate_split_configs(
            available_seasons=available_seasons,
            start_test_year=start_test_year,
            end_test_year=end_test_year
        )

        if not configs:
            logger.warning("No valid splits could be generated")
            return

        logger.info(f"Generated {len(configs)} walk-forward splits")

        # Process each split
        for config in configs:
            if verbose:
                logger.info(f"\n{'='*60}")
                logger.info(f"Split {config['split_id']}: Train {config['train_seasons'][-3:]} → Test {config['test_season']}")
                logger.info(f"{'='*60}")

            # Load data for this split
            split_data = data_loader.load_season_splits(
                train_seasons=config['train_seasons'],
                test_season=config['test_season'],
                min_games_required=min_games_required,
                verbose=verbose
            )

            # Skip if insufficient data
            if len(split_data['X_train']) == 0:
                logger.warning(f"No training data for split {config['split_id']}, skipping")
                continue

            if len(split_data['X_test']) == 0:
                logger.warning(f"No test data for split {config['split_id']}, skipping")
                continue

            # Create split object
            split = WalkForwardSplit(
                split_id=config['split_id'],
                train_seasons=config['train_seasons'],
                test_season=config['test_season'],
                X_train=split_data['X_train'],
                y_train=split_data['y_train'],
                X_test=split_data['X_test'],
                y_test=split_data['y_test'],
                train_info=split_data['train_info'],
                test_info=split_data['test_info'],
                feature_names=split_data['feature_names']
            )

            if verbose:
                logger.info(f"Train: {split.train_size} games, Over rate: {split.train_over_rate:.1%}")
                logger.info(f"Test: {split.test_size} games, Over rate: {split.test_over_rate:.1%}")

            yield split

    def run_validation(
        self,
        model,
        data_loader,
        confidence_threshold: float = 0.5,
        start_test_year: int = 2017,
        end_test_year: Optional[int] = None,
        verbose: bool = True
    ) -> WalkForwardResults:
        """
        Run complete walk-forward validation with a model.

        Args:
            model: Sklearn-compatible model with fit/predict_proba methods
            data_loader: DataLoader instance
            confidence_threshold: Minimum probability for making a bet
            start_test_year: First year to use as test set
            end_test_year: Last year to use as test set
            verbose: Whether to print progress

        Returns:
            WalkForwardResults with all split results
        """
        results = WalkForwardResults()

        for split in self.generate_splits(
            data_loader=data_loader,
            start_test_year=start_test_year,
            end_test_year=end_test_year,
            verbose=verbose
        ):
            # Clone model for this split (to ensure clean state)
            from sklearn.base import clone
            split_model = clone(model)

            # Train
            logger.info(f"Training on {split.train_size} games...")
            split_model.fit(split.X_train, split.y_train)

            # Predict
            probabilities = split_model.predict_proba(split.X_test)[:, 1]  # P(OVER)
            predictions = (probabilities >= 0.5).astype(int)

            # Calculate metrics
            metrics = self._calculate_split_metrics(
                y_true=split.y_test,
                y_pred=predictions,
                probabilities=probabilities,
                confidence_threshold=confidence_threshold,
                test_info=split.test_info
            )

            # Add to results
            results.add_split_result(
                split=split,
                predictions=predictions,
                probabilities=probabilities,
                metrics=metrics
            )

            if verbose:
                self._print_split_metrics(split.test_season, metrics)

        # Print aggregated results
        if verbose:
            self._print_aggregated_results(results)

        return results

    def _calculate_split_metrics(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        probabilities: np.ndarray,
        confidence_threshold: float,
        test_info: pd.DataFrame
    ) -> Dict[str, float]:
        """Calculate betting-relevant metrics for a single split"""

        # Basic accuracy
        accuracy = np.mean(y_pred == y_true)

        # Filtered metrics (bets only when confident)
        confident_mask = (probabilities >= confidence_threshold) | (probabilities <= (1 - confidence_threshold))
        confident_over_mask = probabilities >= confidence_threshold
        confident_under_mask = probabilities <= (1 - confidence_threshold)

        if np.sum(confident_mask) > 0:
            filtered_accuracy = np.mean(y_pred[confident_mask] == y_true[confident_mask])
            filtered_bets = np.sum(confident_mask)
        else:
            filtered_accuracy = 0.0
            filtered_bets = 0

        # ROI calculation (assuming -110 odds = 1.91 decimal)
        # Win: +0.91 units, Loss: -1.0 units
        ODDS = 1.91  # Pinnacle standard

        wins = np.sum(y_pred == y_true)
        losses = len(y_true) - wins
        roi = (wins * (ODDS - 1) - losses) / len(y_true) * 100 if len(y_true) > 0 else 0

        # Filtered ROI
        if np.sum(confident_mask) > 0:
            filtered_wins = np.sum(y_pred[confident_mask] == y_true[confident_mask])
            filtered_losses = np.sum(confident_mask) - filtered_wins
            filtered_roi = (filtered_wins * (ODDS - 1) - filtered_losses) / np.sum(confident_mask) * 100
        else:
            filtered_roi = 0

        # By side
        over_mask = probabilities >= 0.5
        under_mask = probabilities < 0.5

        over_accuracy = np.mean(y_true[over_mask] == 1) if np.sum(over_mask) > 0 else 0
        under_accuracy = np.mean(y_true[under_mask] == 0) if np.sum(under_mask) > 0 else 0

        return {
            'accuracy': accuracy,
            'filtered_accuracy': filtered_accuracy,
            'filtered_bets': filtered_bets,
            'total_bets': len(y_true),
            'roi': roi,
            'filtered_roi': filtered_roi,
            'over_accuracy': over_accuracy,
            'under_accuracy': under_accuracy,
            'over_bets': int(np.sum(over_mask)),
            'under_bets': int(np.sum(under_mask))
        }

    def _print_split_metrics(self, test_season: str, metrics: Dict[str, float]):
        """Print metrics for a single split"""
        logger.info(f"\n📊 Results for {test_season}:")
        logger.info(f"   Accuracy: {metrics['accuracy']:.1%} ({metrics['total_bets']} games)")
        logger.info(f"   ROI: {metrics['roi']:+.1f}%")
        if metrics['filtered_bets'] > 0:
            logger.info(f"   Filtered: {metrics['filtered_accuracy']:.1%} ({metrics['filtered_bets']} bets) ROI: {metrics['filtered_roi']:+.1f}%")
        logger.info(f"   Over: {metrics['over_accuracy']:.1%} ({metrics['over_bets']}) | Under: {metrics['under_accuracy']:.1%} ({metrics['under_bets']})")

    def _print_aggregated_results(self, results: WalkForwardResults):
        """Print aggregated results"""
        agg = results.get_aggregated_metrics()

        logger.info("\n" + "=" * 60)
        logger.info("📈 WALK-FORWARD VALIDATION SUMMARY")
        logger.info("=" * 60)
        logger.info(f"Total Splits: {agg['total_splits']}")
        logger.info(f"Total Test Games: {results.total_test_games}")
        logger.info(f"\nOverall Accuracy: {agg['overall_accuracy']:.1%}")
        logger.info(f"Average ROI: {agg['avg_split_roi']:+.1f}%")
        logger.info(f"Profitable Splits: {agg['profitable_splits']}/{agg['total_splits']} ({agg['profitability_rate']:.0%})")
        logger.info(f"\nBy Side:")
        logger.info(f"  Over Accuracy: {agg['overall_over_accuracy']:.1%}")
        logger.info(f"  Under Accuracy: {agg['overall_under_accuracy']:.1%}")


def main():
    """Test walk-forward validation"""
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

    from ml.data_loader import DataLoader

    print("=" * 60)
    print("Walk-Forward Validation Test")
    print("=" * 60)

    # Initialize
    data_loader = DataLoader()
    validator = WalkForwardValidator(min_train_seasons=3)

    # Check available seasons
    available = data_loader.get_available_seasons()
    print(f"\nAvailable seasons: {available}")

    if len(available) < 4:
        print("Not enough seasons for walk-forward validation")
        return

    # Generate split configs
    configs = validator.generate_split_configs(
        available_seasons=available,
        start_test_year=2019  # Start testing from 2019-20
    )

    print(f"\nGenerated {len(configs)} splits:")
    for config in configs:
        print(f"  Split {config['split_id']}: Train {config['train_seasons'][-2:]} → Test {config['test_season']}")

    # Test with a simple model
    print("\nTesting with LogisticRegression baseline...")

    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline

    model = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', LogisticRegression(C=0.1, max_iter=1000, random_state=42))
    ])

    # Run one split as test
    for split in validator.generate_splits(
        data_loader=data_loader,
        start_test_year=2023,  # Just test most recent
        verbose=True
    ):
        print(f"\nFirst split: {split.train_seasons[-2:]} → {split.test_season}")
        print(f"Train shape: {split.X_train.shape}")
        print(f"Test shape: {split.X_test.shape}")

        # Fit and predict
        model.fit(split.X_train, split.y_train)
        probs = model.predict_proba(split.X_test)[:, 1]
        preds = (probs >= 0.5).astype(int)

        accuracy = np.mean(preds == split.y_test)
        print(f"Accuracy: {accuracy:.1%}")
        break  # Just test first split

    print("\n" + "=" * 60)
    print("Walk-Forward Test Complete")
    print("=" * 60)


if __name__ == "__main__":
    main()
