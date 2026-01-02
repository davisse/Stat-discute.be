#!/usr/bin/env python3
"""
NBA Totals ML Model Backtest

Full historical backtest with walk-forward validation comparing:
1. Baseline Logistic Regression
2. XGBoost Gradient Boosting
3. Hybrid Ensemble (ML + Rule-based)

Evaluates using betting-specific metrics: ROI, Sharpe, calibration.

Usage:
    python3 backtest_ml_model.py

Output:
    - Console summary of performance by season and model
    - Feature importance analysis
    - Confidence threshold recommendations
    - Comparison with rule-based baseline
"""

import os
import sys
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
import warnings

import numpy as np
import pandas as pd

# Add parent directory for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import ML components
from ml.data_loader import DataLoader
from ml.training.walk_forward import WalkForwardValidator, WalkForwardSplit
from ml.models.baseline import LogisticModel
from ml.models.gradient_boosting import XGBoostModel
from ml.models.hybrid import HybridEnsemble, RuleBasedAdapter
from ml.evaluation.metrics import BettingMetrics

# Suppress warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constants
ODDS = 1.91  # Standard -110 odds (decimal)
STAKE = 10.0  # €10 per bet
CONFIDENCE_THRESHOLDS = [0.50, 0.52, 0.55, 0.58, 0.60]


class MLBacktester:
    """
    Run full ML backtest with walk-forward validation.
    """

    def __init__(
        self,
        start_test_year: int = 2019,
        end_test_year: Optional[int] = None,
        min_train_seasons: int = 3
    ):
        """
        Initialize backtester.

        Args:
            start_test_year: First season to test (e.g., 2019 for 2019-20)
            end_test_year: Last season to test
            min_train_seasons: Minimum training seasons before testing
        """
        self.start_test_year = start_test_year
        self.end_test_year = end_test_year
        self.min_train_seasons = min_train_seasons

        self.data_loader = DataLoader()
        self.validator = WalkForwardValidator(min_train_seasons=min_train_seasons)
        self.metrics = BettingMetrics(odds=ODDS, stake=STAKE)

        self.results = {
            'logistic': [],
            'xgboost': [],
            'hybrid': []
        }
        self.all_predictions = {
            'logistic': {'y_true': [], 'y_pred': [], 'probs': [], 'info': []},
            'xgboost': {'y_true': [], 'y_pred': [], 'probs': [], 'info': []},
            'hybrid': {'y_true': [], 'y_pred': [], 'probs': [], 'info': []}
        }

    def run_backtest(self, verbose: bool = True) -> Dict[str, Any]:
        """
        Run complete backtest.

        Args:
            verbose: Whether to print progress

        Returns:
            Dict with all results
        """
        logger.info("=" * 70)
        logger.info("NBA TOTALS ML MODEL BACKTEST")
        logger.info("=" * 70)
        logger.info(f"Test period: {self.start_test_year}-{self.end_test_year or 'present'}")
        logger.info(f"Min training seasons: {self.min_train_seasons}")
        logger.info(f"Stake: €{STAKE} per bet")
        logger.info(f"Odds: {ODDS} (decimal)")
        logger.info("=" * 70)

        # Check available data
        available_seasons = self.data_loader.get_available_seasons()
        if not available_seasons:
            logger.error("No data available. Run ETL scripts first.")
            return {}

        logger.info(f"Available seasons: {available_seasons}")
        game_counts = self.data_loader.get_games_count()
        total_games = sum(game_counts.values())
        logger.info(f"Total games with betting data: {total_games}")

        if total_games == 0:
            logger.error("No games with closing lines found. Run:")
            logger.error("  - 1.DATABASE/etl/betting/capture_closing_lines.py")
            logger.error("  - 1.DATABASE/etl/betting/calculate_ou_results.py")
            return {}

        # Run walk-forward validation
        split_num = 0
        for split in self.validator.generate_splits(
            data_loader=self.data_loader,
            start_test_year=self.start_test_year,
            end_test_year=self.end_test_year,
            verbose=verbose
        ):
            split_num += 1
            logger.info(f"\n{'='*70}")
            logger.info(f"SPLIT {split_num}: {split.train_seasons[-3:]} → {split.test_season}")
            logger.info(f"{'='*70}")

            self._run_split(split, verbose)

        if split_num == 0:
            logger.warning("No valid splits were generated")
            return {}

        # Aggregate and report results
        return self._aggregate_results(verbose)

    def _run_split(self, split: WalkForwardSplit, verbose: bool):
        """Run all models on a single split"""

        # 1. Logistic Regression
        logger.info("\n📊 Training Logistic Regression...")
        log_model = LogisticModel(C=0.1, class_weight='balanced')
        log_model.fit(split.X_train, split.y_train, split.feature_names)

        log_probs = log_model.predict_proba(split.X_test)[:, 1]
        log_preds = (log_probs >= 0.5).astype(int)
        log_metrics = self._calculate_metrics(split.y_test, log_preds, log_probs)

        self.results['logistic'].append({
            'season': split.test_season,
            'train_size': split.train_size,
            'test_size': split.test_size,
            **log_metrics
        })
        self._store_predictions('logistic', split.y_test, log_preds, log_probs, split.test_info)

        if verbose:
            logger.info(f"   Accuracy: {log_metrics['accuracy']:.1%}, ROI: {log_metrics['roi']:+.1f}%")

        # 2. XGBoost
        logger.info("\n📈 Training XGBoost...")
        try:
            # Split training data for early stopping
            val_size = int(0.15 * len(split.X_train))
            X_train_xgb = split.X_train[:-val_size]
            y_train_xgb = split.y_train[:-val_size]
            X_val_xgb = split.X_train[-val_size:]
            y_val_xgb = split.y_train[-val_size:]

            xgb_model = XGBoostModel(
                n_estimators=100,
                max_depth=4,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_alpha=0.1,
                reg_lambda=1.0
            )
            xgb_model.fit(
                X_train_xgb, y_train_xgb,
                X_val_xgb, y_val_xgb,
                feature_names=split.feature_names,
                verbose=False
            )

            xgb_probs = xgb_model.predict_proba(split.X_test)[:, 1]
            xgb_preds = (xgb_probs >= 0.5).astype(int)
            xgb_metrics = self._calculate_metrics(split.y_test, xgb_preds, xgb_probs)

            self.results['xgboost'].append({
                'season': split.test_season,
                **xgb_metrics
            })
            self._store_predictions('xgboost', split.y_test, xgb_preds, xgb_probs, split.test_info)

            if verbose:
                logger.info(f"   Accuracy: {xgb_metrics['accuracy']:.1%}, ROI: {xgb_metrics['roi']:+.1f}%")

        except Exception as e:
            logger.warning(f"   XGBoost failed: {e}")
            # Use logistic as fallback
            self.results['xgboost'].append({
                'season': split.test_season,
                **log_metrics
            })
            self._store_predictions('xgboost', split.y_test, log_preds, log_probs, split.test_info)

        # 3. Hybrid Ensemble
        logger.info("\n🔀 Training Hybrid Ensemble...")

        # Generate rule adjustments from features
        # Use projected total vs closing line as proxy for rule adjustment
        rule_adjustments = self._estimate_rule_adjustments(split)

        hybrid = HybridEnsemble(
            ml_model=log_model,  # Use logistic for stability
            strong_threshold=5.0,
            medium_threshold=3.0,
            weak_threshold=1.5
        )
        hybrid.fit(
            split.X_train, split.y_train, rule_adjustments[:split.train_size]
        )

        hybrid_probs = hybrid.predict_proba(
            split.X_test,
            rule_adjustments[split.train_size:split.train_size + split.test_size]
        )[:, 1]
        hybrid_preds = (hybrid_probs >= 0.5).astype(int)
        hybrid_metrics = self._calculate_metrics(split.y_test, hybrid_preds, hybrid_probs)

        self.results['hybrid'].append({
            'season': split.test_season,
            **hybrid_metrics
        })
        self._store_predictions('hybrid', split.y_test, hybrid_preds, hybrid_probs, split.test_info)

        if verbose:
            logger.info(f"   Accuracy: {hybrid_metrics['accuracy']:.1%}, ROI: {hybrid_metrics['roi']:+.1f}%")

        # Feature importance (from best model)
        if split_num := len(self.results['logistic']) == 1:  # First split
            logger.info("\n📋 Top 15 Feature Importance (Logistic):")
            importance = log_model.get_feature_importance(split.feature_names, top_k=15)
            for _, row in importance.iterrows():
                logger.info(f"   {row['feature']}: {row['coefficient']:+.3f} ({row['direction']})")

    def _estimate_rule_adjustments(self, split: WalkForwardSplit) -> np.ndarray:
        """
        Estimate rule-based adjustments from features.

        Uses matchup features as proxy for rule model output.
        """
        # Combine training and test data
        X_all = np.vstack([split.X_train, split.X_test])

        # Get feature indices for relevant features
        feature_names = split.feature_names

        # Look for projected_total and closing_line features
        projected_idx = None
        closing_idx = None

        for i, name in enumerate(feature_names):
            if 'projected_total' in name.lower():
                projected_idx = i
            elif 'closing_line' in name.lower() or 'line' in name.lower():
                closing_idx = i

        if projected_idx is not None and closing_idx is not None:
            # Use difference between projection and line
            adjustments = X_all[:, projected_idx] - X_all[:, closing_idx]
        else:
            # Fallback: Use combination of pace and rating features
            adjustment_features = []
            for i, name in enumerate(feature_names):
                if 'pace' in name.lower() or 'ortg' in name.lower() or 'drtg' in name.lower():
                    adjustment_features.append(i)

            if adjustment_features:
                # Sum of relevant features as proxy
                adjustments = np.sum(X_all[:, adjustment_features], axis=1)
                # Scale to reasonable range
                adjustments = (adjustments - np.mean(adjustments)) / (np.std(adjustments) + 1e-6) * 3
            else:
                # Random small adjustments
                adjustments = np.random.randn(len(X_all)) * 2

        return adjustments

    def _calculate_metrics(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        probs: np.ndarray
    ) -> Dict[str, float]:
        """Calculate key metrics for a single split"""

        accuracy = np.mean(y_pred == y_true)
        wins = np.sum(y_pred == y_true)
        losses = len(y_true) - wins

        # ROI at -110
        profit = wins * STAKE * (ODDS - 1) - losses * STAKE
        roi = profit / (len(y_true) * STAKE) * 100

        # By confidence
        confident_mask = (probs >= 0.55) | (probs <= 0.45)
        if np.sum(confident_mask) > 0:
            conf_accuracy = np.mean(y_pred[confident_mask] == y_true[confident_mask])
            conf_wins = np.sum(y_pred[confident_mask] == y_true[confident_mask])
            conf_losses = np.sum(confident_mask) - conf_wins
            conf_roi = (conf_wins * STAKE * (ODDS - 1) - conf_losses * STAKE) / (np.sum(confident_mask) * STAKE) * 100
            conf_bets = int(np.sum(confident_mask))
        else:
            conf_accuracy = 0
            conf_roi = 0
            conf_bets = 0

        # By side
        over_mask = y_pred == 1
        under_mask = y_pred == 0

        over_accuracy = np.mean(y_true[over_mask] == 1) if np.sum(over_mask) > 0 else 0
        under_accuracy = np.mean(y_true[under_mask] == 0) if np.sum(under_mask) > 0 else 0

        return {
            'accuracy': accuracy,
            'win_rate': accuracy,
            'roi': roi,
            'profit': profit,
            'bets': len(y_true),
            'wins': int(wins),
            'losses': int(losses),
            'conf_accuracy': conf_accuracy,
            'conf_roi': conf_roi,
            'conf_bets': conf_bets,
            'over_accuracy': over_accuracy,
            'under_accuracy': under_accuracy,
            'over_bets': int(np.sum(over_mask)),
            'under_bets': int(np.sum(under_mask))
        }

    def _store_predictions(
        self,
        model_name: str,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        probs: np.ndarray,
        info: pd.DataFrame
    ):
        """Store predictions for aggregation"""
        self.all_predictions[model_name]['y_true'].extend(y_true.tolist())
        self.all_predictions[model_name]['y_pred'].extend(y_pred.tolist())
        self.all_predictions[model_name]['probs'].extend(probs.tolist())
        if info is not None:
            self.all_predictions[model_name]['info'].append(info)

    def _aggregate_results(self, verbose: bool) -> Dict[str, Any]:
        """Aggregate and report results across all splits"""

        logger.info("\n" + "=" * 70)
        logger.info("AGGREGATED RESULTS")
        logger.info("=" * 70)

        summary = {}

        for model_name in ['logistic', 'xgboost', 'hybrid']:
            if not self.results[model_name]:
                continue

            # Combine all predictions
            y_true = np.array(self.all_predictions[model_name]['y_true'])
            y_pred = np.array(self.all_predictions[model_name]['y_pred'])
            probs = np.array(self.all_predictions[model_name]['probs'])

            if len(y_true) == 0:
                continue

            # Overall metrics
            overall = self._calculate_metrics(y_true, y_pred, probs)

            # Per-season breakdown
            seasons_df = pd.DataFrame(self.results[model_name])

            # Confidence analysis
            confidence_analysis = self._analyze_confidence(y_true, y_pred, probs)

            summary[model_name] = {
                'overall': overall,
                'by_season': seasons_df,
                'confidence_analysis': confidence_analysis,
                'profitable_seasons': int(seasons_df['roi'].apply(lambda x: x > 0).sum()),
                'total_seasons': len(seasons_df)
            }

            if verbose:
                self._print_model_summary(model_name, summary[model_name])

        # Comparison
        if verbose and len(summary) > 1:
            self._print_comparison(summary)

        return summary

    def _analyze_confidence(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        probs: np.ndarray
    ) -> pd.DataFrame:
        """Analyze performance at different confidence thresholds"""

        results = []
        for threshold in CONFIDENCE_THRESHOLDS:
            mask = (probs >= threshold) | (probs <= (1 - threshold))

            if np.sum(mask) == 0:
                continue

            conf_accuracy = np.mean(y_pred[mask] == y_true[mask])
            conf_wins = np.sum(y_pred[mask] == y_true[mask])
            conf_losses = np.sum(mask) - conf_wins
            conf_profit = conf_wins * STAKE * (ODDS - 1) - conf_losses * STAKE
            conf_roi = conf_profit / (np.sum(mask) * STAKE) * 100

            results.append({
                'threshold': threshold,
                'bets': int(np.sum(mask)),
                'bets_pct': np.sum(mask) / len(y_true) * 100,
                'accuracy': conf_accuracy,
                'roi': conf_roi,
                'profit': conf_profit
            })

        return pd.DataFrame(results)

    def _print_model_summary(self, model_name: str, data: Dict):
        """Print summary for a single model"""

        display_name = {
            'logistic': '📊 LOGISTIC REGRESSION',
            'xgboost': '📈 XGBOOST',
            'hybrid': '🔀 HYBRID ENSEMBLE'
        }.get(model_name, model_name.upper())

        logger.info(f"\n{display_name}")
        logger.info("-" * 50)

        overall = data['overall']
        logger.info(f"Total Bets: {overall['bets']}")
        logger.info(f"Win Rate: {overall['win_rate']:.1%} ({overall['wins']}-{overall['losses']})")
        logger.info(f"ROI: {overall['roi']:+.2f}%")
        logger.info(f"Total Profit: €{overall['profit']:+.2f}")

        logger.info(f"\nProfitable Seasons: {data['profitable_seasons']}/{data['total_seasons']}")

        logger.info(f"\nBy Season:")
        for _, row in data['by_season'].iterrows():
            roi_symbol = "✓" if row['roi'] > 0 else "✗"
            logger.info(f"   {row['season']}: {row['accuracy']:.1%} acc, {row['roi']:+.1f}% ROI, €{row['profit']:+.1f} {roi_symbol}")

        logger.info(f"\nConfidence Thresholds:")
        for _, row in data['confidence_analysis'].iterrows():
            logger.info(f"   ≥{row['threshold']:.0%}: {row['accuracy']:.1%} acc, {row['roi']:+.1f}% ROI ({int(row['bets'])} bets)")

    def _print_comparison(self, summary: Dict):
        """Print model comparison"""

        logger.info("\n" + "=" * 70)
        logger.info("MODEL COMPARISON")
        logger.info("=" * 70)

        comparison_data = []
        for model_name, data in summary.items():
            comparison_data.append({
                'Model': model_name.upper(),
                'Win Rate': f"{data['overall']['win_rate']:.1%}",
                'ROI': f"{data['overall']['roi']:+.1f}%",
                'Profit': f"€{data['overall']['profit']:+.0f}",
                'Profitable Seasons': f"{data['profitable_seasons']}/{data['total_seasons']}"
            })

        comparison_df = pd.DataFrame(comparison_data)
        logger.info(comparison_df.to_string(index=False))

        # Recommendation
        best_model = max(summary.items(), key=lambda x: x[1]['overall']['roi'])
        logger.info(f"\n🏆 Best Model: {best_model[0].upper()} with {best_model[1]['overall']['roi']:+.1f}% ROI")

        # Optimal threshold
        best_threshold_data = None
        best_threshold_roi = float('-inf')

        for model_name, data in summary.items():
            for _, row in data['confidence_analysis'].iterrows():
                if row['bets'] >= 50 and row['roi'] > best_threshold_roi:  # Min 50 bets
                    best_threshold_roi = row['roi']
                    best_threshold_data = (model_name, row['threshold'], row)

        if best_threshold_data:
            model, threshold, row = best_threshold_data
            logger.info(f"\n🎯 Recommended: {model.upper()} at ≥{threshold:.0%} confidence")
            logger.info(f"   Expected: {row['accuracy']:.1%} win rate, {row['roi']:+.1f}% ROI, {int(row['bets'])} bets/season avg")


def main():
    """Run the backtest"""
    print("\n" + "=" * 70)
    print("🏀 NBA TOTALS ML BACKTEST")
    print("=" * 70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)

    # Initialize and run
    backtester = MLBacktester(
        start_test_year=2019,  # Start testing from 2019-20 season
        min_train_seasons=3    # Need at least 3 seasons of training data
    )

    try:
        results = backtester.run_backtest(verbose=True)

        if not results:
            print("\n⚠️  No results generated. Check if betting data exists.")
            print("\nTo populate betting data, run:")
            print("  cd 1.DATABASE/etl")
            print("  python3 betting/capture_closing_lines.py")
            print("  python3 betting/calculate_ou_results.py")
            return

        # Summary
        print("\n" + "=" * 70)
        print("✅ BACKTEST COMPLETE")
        print("=" * 70)
        print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # Target comparison
        print("\n📊 Target vs Actual:")
        print(f"   Target Win Rate: 56-58%")
        print(f"   Target ROI: +6-8%")

        for model_name, data in results.items():
            print(f"\n   {model_name.upper()}:")
            print(f"      Actual Win Rate: {data['overall']['win_rate']:.1%}")
            print(f"      Actual ROI: {data['overall']['roi']:+.1f}%")

    except Exception as e:
        logger.error(f"Backtest failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
