"""
Betting-Specific Evaluation Metrics for NBA Totals ML Pipeline

Standard ML metrics (accuracy, AUC) don't capture betting performance.
This module provides ROI, Sharpe ratio, calibration, and other betting metrics.

Usage:
    from evaluation.metrics import BettingMetrics

    metrics = BettingMetrics(odds=1.91)
    results = metrics.calculate_all(y_true, y_pred, probabilities)
    print(metrics.format_results(results))
"""

import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Tuple, Any
from dataclasses import dataclass, field
import logging

from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, brier_score_loss, log_loss
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@dataclass
class BettingResult:
    """Results from a single betting simulation"""
    total_bets: int
    wins: int
    losses: int
    pushes: int = 0

    win_rate: float = 0.0
    roi: float = 0.0
    profit: float = 0.0
    units_wagered: float = 0.0

    # Risk metrics
    max_drawdown: float = 0.0
    sharpe_ratio: float = 0.0
    kelly_fraction: float = 0.0

    # Calibration
    expected_calibration_error: float = 0.0
    brier_score: float = 0.0


class BettingMetrics:
    """
    Calculate betting-specific performance metrics.

    Key metrics:
    - ROI: (Total Profit / Total Wagered) * 100
    - Sharpe Ratio: Risk-adjusted return (annualized)
    - Max Drawdown: Largest peak-to-trough decline
    - Kelly Fraction: Optimal bet sizing
    - Calibration: How well probabilities match actual rates
    """

    def __init__(
        self,
        odds: float = 1.91,  # Decimal odds (-110 American)
        stake: float = 1.0,  # Unit stake per bet
        bankroll: float = 100.0  # Starting bankroll for drawdown
    ):
        """
        Initialize betting metrics calculator.

        Args:
            odds: Decimal odds for each bet (1.91 = -110)
            stake: Units wagered per bet
            bankroll: Starting bankroll for risk calculations
        """
        self.odds = odds
        self.stake = stake
        self.bankroll = bankroll

        # Implied probability from odds
        self.implied_prob = 1 / odds
        # Break-even win rate
        self.breakeven_rate = 1 / odds

    def calculate_roi(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        confidence: Optional[np.ndarray] = None,
        min_confidence: float = 0.0
    ) -> Dict[str, float]:
        """
        Calculate Return on Investment.

        Args:
            y_true: True labels (1=OVER, 0=UNDER)
            y_pred: Predicted labels
            confidence: Optional confidence scores for filtering
            min_confidence: Minimum confidence to place bet

        Returns:
            Dict with ROI metrics
        """
        # Apply confidence filter
        if confidence is not None and min_confidence > 0:
            mask = confidence >= min_confidence
            y_true = y_true[mask]
            y_pred = y_pred[mask]
            n_filtered = np.sum(~mask)
        else:
            n_filtered = 0

        if len(y_true) == 0:
            return {'roi': 0.0, 'profit': 0.0, 'bets': 0, 'filtered': n_filtered}

        # Calculate wins/losses
        wins = np.sum(y_pred == y_true)
        losses = len(y_true) - wins

        # Calculate profit
        profit = wins * self.stake * (self.odds - 1) - losses * self.stake
        units_wagered = len(y_true) * self.stake

        # ROI
        roi = (profit / units_wagered) * 100 if units_wagered > 0 else 0

        return {
            'roi': roi,
            'profit': profit,
            'units_wagered': units_wagered,
            'bets': len(y_true),
            'wins': int(wins),
            'losses': int(losses),
            'win_rate': wins / len(y_true) if len(y_true) > 0 else 0,
            'filtered': n_filtered
        }

    def calculate_drawdown(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray
    ) -> Dict[str, float]:
        """
        Calculate max drawdown and drawdown statistics.

        Args:
            y_true: True labels
            y_pred: Predicted labels

        Returns:
            Dict with drawdown metrics
        """
        # Build equity curve
        equity = [self.bankroll]

        for true, pred in zip(y_true, y_pred):
            if pred == true:  # Win
                equity.append(equity[-1] + self.stake * (self.odds - 1))
            else:  # Loss
                equity.append(equity[-1] - self.stake)

        equity = np.array(equity)

        # Calculate drawdowns
        peak = np.maximum.accumulate(equity)
        drawdowns = (peak - equity) / peak

        max_drawdown = np.max(drawdowns)
        avg_drawdown = np.mean(drawdowns)

        # Longest drawdown period
        in_drawdown = drawdowns > 0
        drawdown_lengths = []
        current_length = 0
        for is_dd in in_drawdown:
            if is_dd:
                current_length += 1
            else:
                if current_length > 0:
                    drawdown_lengths.append(current_length)
                current_length = 0
        if current_length > 0:
            drawdown_lengths.append(current_length)

        longest_drawdown = max(drawdown_lengths) if drawdown_lengths else 0

        return {
            'max_drawdown': max_drawdown,
            'avg_drawdown': avg_drawdown,
            'longest_drawdown_games': longest_drawdown,
            'final_equity': equity[-1],
            'equity_curve': equity
        }

    def calculate_sharpe_ratio(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        risk_free_rate: float = 0.0,
        games_per_year: int = 1230  # ~82 games * 15 bettable games/day
    ) -> float:
        """
        Calculate Sharpe ratio (risk-adjusted return).

        Args:
            y_true: True labels
            y_pred: Predicted labels
            risk_free_rate: Annual risk-free rate
            games_per_year: Number of betting opportunities per year

        Returns:
            Annualized Sharpe ratio
        """
        # Per-bet returns
        returns = []
        for true, pred in zip(y_true, y_pred):
            if pred == true:
                returns.append(self.odds - 1)  # Win return
            else:
                returns.append(-1.0)  # Loss return

        returns = np.array(returns)

        if len(returns) < 2:
            return 0.0

        # Mean and std of returns
        mean_return = np.mean(returns)
        std_return = np.std(returns, ddof=1)

        if std_return == 0:
            return 0.0

        # Annualize
        # Sharpe = (mean - rf) / std * sqrt(n_periods)
        sharpe = (mean_return - risk_free_rate / games_per_year) / std_return * np.sqrt(games_per_year)

        return sharpe

    def calculate_kelly_criterion(
        self,
        win_rate: float,
        odds: Optional[float] = None
    ) -> float:
        """
        Calculate Kelly criterion for optimal bet sizing.

        Kelly % = (bp - q) / b
        where b = odds - 1, p = win probability, q = 1 - p

        Args:
            win_rate: Historical win rate
            odds: Decimal odds (uses self.odds if None)

        Returns:
            Optimal fraction of bankroll to bet
        """
        odds = odds or self.odds
        b = odds - 1
        p = win_rate
        q = 1 - p

        kelly = (b * p - q) / b

        # Kelly can be negative (don't bet) or > 1 (leverage)
        return max(0, min(kelly, 1.0))

    def calculate_calibration(
        self,
        y_true: np.ndarray,
        probabilities: np.ndarray,
        n_bins: int = 10
    ) -> Dict[str, Any]:
        """
        Calculate calibration metrics.

        Good calibration: 60% predicted probability = 60% actual win rate

        Args:
            y_true: True labels
            probabilities: Predicted probabilities
            n_bins: Number of bins for calibration curve

        Returns:
            Dict with calibration metrics and curve data
        """
        # Bin predictions
        bin_edges = np.linspace(0, 1, n_bins + 1)
        bin_indices = np.digitize(probabilities, bin_edges) - 1
        bin_indices = np.clip(bin_indices, 0, n_bins - 1)

        calibration_data = []
        for i in range(n_bins):
            mask = bin_indices == i
            if np.sum(mask) > 0:
                mean_pred = np.mean(probabilities[mask])
                actual_rate = np.mean(y_true[mask])
                calibration_data.append({
                    'bin': i,
                    'bin_low': bin_edges[i],
                    'bin_high': bin_edges[i + 1],
                    'mean_predicted': mean_pred,
                    'actual_rate': actual_rate,
                    'count': int(np.sum(mask)),
                    'error': actual_rate - mean_pred
                })

        calibration_df = pd.DataFrame(calibration_data)

        # Expected Calibration Error (ECE)
        if len(calibration_df) > 0:
            weights = calibration_df['count'] / calibration_df['count'].sum()
            ece = np.sum(weights * np.abs(calibration_df['error']))
        else:
            ece = 0.0

        # Brier score (lower is better)
        brier = brier_score_loss(y_true, probabilities)

        # Reliability diagram slopes
        if len(calibration_df) >= 2:
            slope, _ = np.polyfit(
                calibration_df['mean_predicted'],
                calibration_df['actual_rate'],
                1
            )
        else:
            slope = 1.0

        return {
            'expected_calibration_error': ece,
            'brier_score': brier,
            'calibration_slope': slope,
            'calibration_curve': calibration_df,
            'is_well_calibrated': ece < 0.05 and abs(slope - 1) < 0.2
        }

    def calculate_confidence_analysis(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        probabilities: np.ndarray,
        thresholds: List[float] = [0.50, 0.55, 0.60, 0.65, 0.70]
    ) -> pd.DataFrame:
        """
        Analyze performance at different confidence thresholds.

        Args:
            y_true: True labels
            y_pred: Predicted labels
            probabilities: Predicted probabilities
            thresholds: Confidence thresholds to analyze

        Returns:
            DataFrame with metrics at each threshold
        """
        results = []

        for threshold in thresholds:
            # Filter by confidence
            confident_mask = (probabilities >= threshold) | (probabilities <= (1 - threshold))

            if np.sum(confident_mask) == 0:
                continue

            y_true_conf = y_true[confident_mask]
            y_pred_conf = y_pred[confident_mask]

            roi_result = self.calculate_roi(y_true_conf, y_pred_conf)

            results.append({
                'threshold': threshold,
                'bets': roi_result['bets'],
                'bets_pct': roi_result['bets'] / len(y_true) * 100,
                'win_rate': roi_result['win_rate'],
                'roi': roi_result['roi'],
                'profit': roi_result['profit']
            })

        return pd.DataFrame(results)

    def calculate_all(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        probabilities: np.ndarray
    ) -> Dict[str, Any]:
        """
        Calculate all betting metrics.

        Args:
            y_true: True labels
            y_pred: Predicted labels
            probabilities: Predicted probabilities

        Returns:
            Comprehensive metrics dictionary
        """
        # Basic metrics
        roi_result = self.calculate_roi(y_true, y_pred)
        drawdown_result = self.calculate_drawdown(y_true, y_pred)
        sharpe = self.calculate_sharpe_ratio(y_true, y_pred)
        calibration = self.calculate_calibration(y_true, probabilities)
        confidence_analysis = self.calculate_confidence_analysis(y_true, y_pred, probabilities)

        # Kelly fraction based on win rate
        kelly = self.calculate_kelly_criterion(roi_result['win_rate'])

        # Standard ML metrics
        try:
            auc = roc_auc_score(y_true, probabilities)
        except:
            auc = 0.5

        logloss = log_loss(y_true, probabilities)

        # By side analysis
        over_mask = y_pred == 1
        under_mask = y_pred == 0

        over_roi = self.calculate_roi(y_true[over_mask], y_pred[over_mask]) if np.sum(over_mask) > 0 else {'roi': 0}
        under_roi = self.calculate_roi(y_true[under_mask], y_pred[under_mask]) if np.sum(under_mask) > 0 else {'roi': 0}

        return {
            # Betting metrics
            'total_bets': roi_result['bets'],
            'wins': roi_result['wins'],
            'losses': roi_result['losses'],
            'win_rate': roi_result['win_rate'],
            'roi': roi_result['roi'],
            'profit': roi_result['profit'],

            # Risk metrics
            'max_drawdown': drawdown_result['max_drawdown'],
            'sharpe_ratio': sharpe,
            'kelly_fraction': kelly,

            # Calibration
            'expected_calibration_error': calibration['expected_calibration_error'],
            'brier_score': calibration['brier_score'],
            'is_well_calibrated': calibration['is_well_calibrated'],

            # Standard ML
            'accuracy': accuracy_score(y_true, y_pred),
            'auc_roc': auc,
            'log_loss': logloss,

            # By side
            'over_win_rate': over_roi.get('win_rate', 0),
            'over_roi': over_roi.get('roi', 0),
            'over_bets': int(np.sum(over_mask)),
            'under_win_rate': under_roi.get('win_rate', 0),
            'under_roi': under_roi.get('roi', 0),
            'under_bets': int(np.sum(under_mask)),

            # Detailed data
            'confidence_analysis': confidence_analysis,
            'calibration_curve': calibration['calibration_curve'],
            'equity_curve': drawdown_result['equity_curve']
        }

    def format_results(self, results: Dict[str, Any]) -> str:
        """
        Format results for display.

        Args:
            results: Results from calculate_all()

        Returns:
            Formatted string
        """
        output = []
        output.append("=" * 50)
        output.append("BETTING PERFORMANCE METRICS")
        output.append("=" * 50)

        output.append(f"\n📊 CORE METRICS")
        output.append(f"   Total Bets: {results['total_bets']}")
        output.append(f"   Win Rate: {results['win_rate']:.1%} ({results['wins']}-{results['losses']})")
        output.append(f"   ROI: {results['roi']:+.2f}%")
        output.append(f"   Profit: {results['profit']:+.2f} units")

        output.append(f"\n📈 RISK METRICS")
        output.append(f"   Max Drawdown: {results['max_drawdown']:.1%}")
        output.append(f"   Sharpe Ratio: {results['sharpe_ratio']:.2f}")
        output.append(f"   Kelly Fraction: {results['kelly_fraction']:.1%}")

        output.append(f"\n🎯 CALIBRATION")
        output.append(f"   ECE: {results['expected_calibration_error']:.4f}")
        output.append(f"   Brier Score: {results['brier_score']:.4f}")
        output.append(f"   Well Calibrated: {'✓' if results['is_well_calibrated'] else '✗'}")

        output.append(f"\n📉 BY SIDE")
        output.append(f"   OVER: {results['over_win_rate']:.1%} win rate, {results['over_roi']:+.1f}% ROI ({results['over_bets']} bets)")
        output.append(f"   UNDER: {results['under_win_rate']:.1%} win rate, {results['under_roi']:+.1f}% ROI ({results['under_bets']} bets)")

        output.append(f"\n📐 ML METRICS")
        output.append(f"   Accuracy: {results['accuracy']:.1%}")
        output.append(f"   AUC-ROC: {results['auc_roc']:.3f}")
        output.append(f"   Log Loss: {results['log_loss']:.4f}")

        # Confidence analysis
        if 'confidence_analysis' in results and len(results['confidence_analysis']) > 0:
            output.append(f"\n🎚️ CONFIDENCE THRESHOLDS")
            for _, row in results['confidence_analysis'].iterrows():
                output.append(f"   {row['threshold']:.0%}: {row['win_rate']:.1%} win, {row['roi']:+.1f}% ROI ({row['bets']} bets)")

        output.append("\n" + "=" * 50)

        return "\n".join(output)


def main():
    """Test betting metrics"""
    print("=" * 60)
    print("Betting Metrics Test")
    print("=" * 60)

    # Create synthetic results
    np.random.seed(42)
    n_samples = 500

    # Simulate predictions with ~55% accuracy
    y_true = np.random.randint(0, 2, n_samples)
    accuracy_target = 0.55

    # Generate predictions
    y_pred = y_true.copy()
    wrong_indices = np.random.choice(n_samples, int(n_samples * (1 - accuracy_target)), replace=False)
    y_pred[wrong_indices] = 1 - y_pred[wrong_indices]

    # Generate probabilities
    probabilities = np.clip(
        np.where(y_pred == 1, 0.55, 0.45) + np.random.randn(n_samples) * 0.1,
        0.3, 0.7
    )

    # Calculate metrics
    metrics = BettingMetrics(odds=1.91, stake=1.0)
    results = metrics.calculate_all(y_true, y_pred, probabilities)

    # Print formatted results
    print(metrics.format_results(results))

    # Additional analysis
    print("\n📊 Confidence Analysis:")
    if len(results['confidence_analysis']) > 0:
        print(results['confidence_analysis'].to_string())

    print("\n📉 Calibration Curve:")
    if len(results['calibration_curve']) > 0:
        print(results['calibration_curve'][['bin_low', 'bin_high', 'mean_predicted', 'actual_rate', 'count']].to_string())

    print("\n" + "=" * 60)
    print("Betting Metrics Test Complete")
    print("=" * 60)


if __name__ == "__main__":
    main()
