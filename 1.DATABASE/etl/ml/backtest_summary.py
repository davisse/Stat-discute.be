#!/usr/bin/env python3
"""
Generate backtest summary in JSON format for API consumption.

This is a lightweight version of backtest_ml_model.py that outputs JSON
instead of console logs, designed for the frontend ML Analysis page.

Usage:
    python backtest_summary.py          # Human-readable output
    python backtest_summary.py --json   # JSON output for API
"""

import os
import sys
import json
import argparse
import logging
import warnings
from datetime import datetime
from typing import Dict, Any

# Parse args early to set up logging BEFORE importing ML components
_parser = argparse.ArgumentParser(add_help=False)
_parser.add_argument('--json', action='store_true')
_args, _ = _parser.parse_known_args()

# Suppress ALL logging and warnings in JSON mode
if _args.json:
    logging.disable(logging.CRITICAL)
    warnings.filterwarnings('ignore')
    # Suppress XGBoost and other library output
    os.environ['PYTHONWARNINGS'] = 'ignore'
    # Redirect stderr AND stdout temporarily (restore stdout only for final JSON print)
    import io
    _real_stdout = sys.stdout
    _real_stderr = sys.stderr
    sys.stderr = io.StringIO()
    sys.stdout = io.StringIO()
else:
    warnings.filterwarnings('ignore')
    logging.basicConfig(level=logging.WARNING)
    _real_stdout = sys.stdout
    _real_stderr = sys.stderr

import numpy as np
import pandas as pd

# Add parent directory for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import ML components
from ml.data_loader import DataLoader
from ml.training.walk_forward import WalkForwardValidator
from ml.models.baseline import LogisticModel
from ml.models.gradient_boosting import XGBoostModel
from ml.evaluation.metrics import BettingMetrics

logger = logging.getLogger(__name__)

# Constants
ODDS = 1.91
STAKE = 10.0
CONFIDENCE_THRESHOLDS = [0.50, 0.52, 0.54, 0.56, 0.58, 0.60, 0.62]

# Feature category mapping
FEATURE_CATEGORIES = {
    'team_performance': ['ppg', 'ortg', 'drtg', 'efg', 'ts_pct', 'pace', 'oreb', 'dreb', 'ast', 'tov'],
    'rest_schedule': ['rest', 'b2b', 'days_rest', 'travel', 'road_trip'],
    'matchup': ['vs_', 'matchup', 'opponent', 'diff_'],
    'trends': ['trend', 'last_', 'recent', 'streak', 'rolling'],
    'context': ['home', 'away', 'altitude', 'time', 'season', 'month']
}


def categorize_feature(feature_name: str) -> str:
    """Categorize a feature based on its name."""
    feature_lower = feature_name.lower()
    for category, keywords in FEATURE_CATEGORIES.items():
        for keyword in keywords:
            if keyword in feature_lower:
                return category
    return 'context'  # Default


def calculate_sharpe(returns: np.ndarray, risk_free: float = 0) -> float:
    """Calculate Sharpe ratio from returns."""
    if len(returns) < 2 or np.std(returns) == 0:
        return 0.0
    excess = np.mean(returns) - risk_free
    return excess / np.std(returns) * np.sqrt(252)  # Annualized


def calculate_max_drawdown(cumulative: np.ndarray) -> float:
    """Calculate maximum drawdown from cumulative returns."""
    if len(cumulative) == 0:
        return 0.0
    peak = np.maximum.accumulate(cumulative)
    drawdown = (peak - cumulative) / (peak + 1e-10)
    return float(np.max(drawdown))


def run_backtest_summary(json_mode: bool = False) -> Dict[str, Any]:
    """Run a streamlined backtest and return summary metrics."""

    # Load data
    data_loader = DataLoader()
    available_seasons = data_loader.get_available_seasons()

    if not available_seasons:
        return {'error': 'No training data available', 'thresholds': [], 'byModel': {}, 'features': []}

    # Walk-forward validation
    validator = WalkForwardValidator(min_train_seasons=3)

    # Store all predictions
    results = {
        'logistic': {'y_true': [], 'y_pred': [], 'probs': [], 'seasons': []},
        'xgboost': {'y_true': [], 'y_pred': [], 'probs': [], 'seasons': []}
    }

    feature_importance = None

    if not json_mode:
        print("Running walk-forward backtest...")

    # Run validation
    split_count = 0
    for split in validator.generate_splits(
        data_loader=data_loader,
        start_test_year=2019,
        verbose=False
    ):
        split_count += 1
        if not json_mode:
            print(f"  Split {split_count}: {split.train_seasons[-1]} -> {split.test_season}")

        # Logistic Regression
        log_model = LogisticModel(C=0.1, class_weight='balanced')
        log_model.fit(split.X_train, split.y_train, split.feature_names)

        log_probs = log_model.predict_proba(split.X_test)
        if log_probs.ndim > 1:
            log_probs = log_probs[:, 1]
        log_preds = (log_probs >= 0.5).astype(int)

        results['logistic']['y_true'].extend(split.y_test.tolist())
        results['logistic']['y_pred'].extend(log_preds.tolist())
        results['logistic']['probs'].extend(log_probs.tolist())
        results['logistic']['seasons'].extend([split.test_season] * len(split.y_test))

        # XGBoost
        try:
            val_size = int(0.15 * len(split.X_train))
            xgb_model = XGBoostModel(
                n_estimators=100,
                max_depth=4,
                learning_rate=0.05
            )
            xgb_model.fit(
                split.X_train[:-val_size], split.y_train[:-val_size],
                split.X_train[-val_size:], split.y_train[-val_size:],
                feature_names=split.feature_names,
                verbose=False
            )

            xgb_probs = xgb_model.predict_proba(split.X_test)
            if xgb_probs.ndim > 1:
                xgb_probs = xgb_probs[:, 1]
            xgb_preds = (xgb_probs >= 0.5).astype(int)

            results['xgboost']['y_true'].extend(split.y_test.tolist())
            results['xgboost']['y_pred'].extend(xgb_preds.tolist())
            results['xgboost']['probs'].extend(xgb_probs.tolist())
            results['xgboost']['seasons'].extend([split.test_season] * len(split.y_test))

            # Get feature importance from XGBoost (first split only)
            if feature_importance is None:
                fi = xgb_model.get_feature_importance(split.feature_names)
                feature_importance = fi
        except Exception as e:
            logger.warning(f"XGBoost failed: {e}")
            # Fallback to logistic
            results['xgboost']['y_true'].extend(split.y_test.tolist())
            results['xgboost']['y_pred'].extend(log_preds.tolist())
            results['xgboost']['probs'].extend(log_probs.tolist())
            results['xgboost']['seasons'].extend([split.test_season] * len(split.y_test))

    if split_count == 0:
        return {'error': 'No valid splits generated', 'thresholds': [], 'byModel': {}, 'features': []}

    # Calculate metrics for each threshold
    thresholds_data = []

    for threshold in CONFIDENCE_THRESHOLDS:
        # Use ensemble (average of logistic and xgboost)
        log_probs = np.array(results['logistic']['probs'])
        xgb_probs = np.array(results['xgboost']['probs'])
        ensemble_probs = (log_probs + xgb_probs) / 2
        y_true = np.array(results['logistic']['y_true'])

        # Filter by confidence
        confident_mask = (ensemble_probs >= threshold) | (ensemble_probs <= (1 - threshold))

        if np.sum(confident_mask) == 0:
            continue

        y_true_conf = y_true[confident_mask]
        probs_conf = ensemble_probs[confident_mask]
        preds_conf = (probs_conf >= 0.5).astype(int)

        wins = np.sum(preds_conf == y_true_conf)
        losses = len(y_true_conf) - wins
        accuracy = wins / len(y_true_conf)
        profit = wins * STAKE * (ODDS - 1) - losses * STAKE
        roi = profit / (len(y_true_conf) * STAKE) * 100

        thresholds_data.append({
            'threshold': threshold,
            'accuracy': round(accuracy, 4),
            'roi': round(roi, 2),
            'totalBets': int(len(y_true_conf)),
            'wins': int(wins),
            'losses': int(losses),
            'pushes': 0,
            'profit': round(profit, 2)
        })

    # Calculate per-model metrics
    by_model = {}
    for model_name in ['logistic', 'xgboost']:
        y_true = np.array(results[model_name]['y_true'])
        y_pred = np.array(results[model_name]['y_pred'])
        probs = np.array(results[model_name]['probs'])

        if len(y_true) == 0:
            continue

        wins = np.sum(y_pred == y_true)
        losses = len(y_true) - wins
        accuracy = wins / len(y_true)
        profit = wins * STAKE * (ODDS - 1) - losses * STAKE
        roi = profit / (len(y_true) * STAKE) * 100

        # Calculate returns per bet
        returns = np.where(y_pred == y_true, STAKE * (ODDS - 1), -STAKE)
        cumulative = np.cumsum(returns)

        by_model[model_name] = {
            'name': model_name.capitalize(),
            'accuracy': round(accuracy, 4),
            'roi': round(roi, 2),
            'sharpe': round(calculate_sharpe(returns / STAKE), 2),
            'maxDrawdown': round(calculate_max_drawdown(cumulative), 4),
            'winRate': round(accuracy, 4)
        }

    # Add ensemble
    log_probs = np.array(results['logistic']['probs'])
    xgb_probs = np.array(results['xgboost']['probs'])
    ensemble_probs = (log_probs + xgb_probs) / 2
    ensemble_preds = (ensemble_probs >= 0.5).astype(int)
    y_true = np.array(results['logistic']['y_true'])

    wins = np.sum(ensemble_preds == y_true)
    losses = len(y_true) - wins
    accuracy = wins / len(y_true)
    profit = wins * STAKE * (ODDS - 1) - losses * STAKE
    roi = profit / (len(y_true) * STAKE) * 100
    returns = np.where(ensemble_preds == y_true, STAKE * (ODDS - 1), -STAKE)
    cumulative = np.cumsum(returns)

    by_model['ensemble'] = {
        'name': 'Ensemble',
        'accuracy': round(accuracy, 4),
        'roi': round(roi, 2),
        'sharpe': round(calculate_sharpe(returns / STAKE), 2),
        'maxDrawdown': round(calculate_max_drawdown(cumulative), 4),
        'winRate': round(accuracy, 4)
    }

    # Process feature importance
    features_data = []
    if feature_importance is not None:
        top_features = feature_importance.head(15)
        for _, row in top_features.iterrows():
            features_data.append({
                'name': row['feature'],
                'importance': round(float(row['importance']), 4),
                'category': categorize_feature(row['feature'])
            })

    # Get unique seasons
    all_seasons = sorted(set(results['logistic']['seasons']))

    # Build summary
    summary = {
        'thresholds': thresholds_data,
        'byModel': by_model,
        'features': features_data,
        'summary': {
            'totalGames': len(results['logistic']['y_true']),
            'dateRange': {
                'start': all_seasons[0] if all_seasons else '',
                'end': all_seasons[-1] if all_seasons else ''
            },
            'seasons': all_seasons
        }
    }

    return summary


def main():
    parser = argparse.ArgumentParser(description='Generate backtest summary')
    parser.add_argument('--json', action='store_true', help='Output JSON')
    args = parser.parse_args()

    try:
        result = run_backtest_summary(json_mode=args.json)

        if args.json:
            # Restore stdout for JSON output
            sys.stdout = _real_stdout
            print(json.dumps(result))
        else:
            print("\n" + "=" * 60)
            print("BACKTEST SUMMARY")
            print("=" * 60)

            if 'error' in result:
                print(f"Error: {result['error']}")
                return

            print(f"\nTotal Games: {result['summary']['totalGames']}")
            print(f"Seasons: {', '.join(result['summary']['seasons'])}")

            print("\n--- Model Performance ---")
            for name, metrics in result['byModel'].items():
                print(f"\n{name.upper()}:")
                print(f"  Accuracy: {metrics['accuracy']:.1%}")
                print(f"  ROI: {metrics['roi']:+.1f}%")
                print(f"  Sharpe: {metrics['sharpe']:.2f}")

            print("\n--- By Confidence Threshold ---")
            for t in result['thresholds']:
                print(f"  {t['threshold']:.0%}: {t['accuracy']:.1%} acc, {t['roi']:+.1f}% ROI ({t['totalBets']} bets)")

            print("\n--- Top Features ---")
            for f in result['features'][:10]:
                print(f"  {f['name']}: {f['importance']:.3f} ({f['category']})")

    except Exception as e:
        if args.json:
            # Restore stdout for JSON output
            sys.stdout = _real_stdout
            print(json.dumps({'error': str(e), 'thresholds': [], 'byModel': {}, 'features': []}))
        else:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()


if __name__ == '__main__':
    main()
