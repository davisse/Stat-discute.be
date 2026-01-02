"""
Hybrid Ensemble Model for NBA Totals Prediction

Combines rule-based model predictions with ML predictions using dynamic weighting.
The weight depends on rule-based signal strength: strong signals trust rules more.

Usage:
    from models.hybrid import HybridEnsemble

    hybrid = HybridEnsemble(rule_model, ml_model)
    hybrid.fit(X_train, y_train, rule_adjustments_train)
    probabilities = hybrid.predict_proba(X_test, rule_adjustments_test)
"""

import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Tuple, Any, Union
from dataclasses import dataclass
import logging

from sklearn.base import BaseEstimator, ClassifierMixin

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@dataclass
class HybridConfig:
    """Configuration for hybrid model"""
    # Weighting thresholds based on rule signal strength
    strong_signal_threshold: float = 5.0  # Points adjustment
    medium_signal_threshold: float = 3.0
    weak_signal_threshold: float = 1.5

    # Weights for rule-based model at each signal level
    strong_signal_weight: float = 0.7  # Trust rules more
    medium_signal_weight: float = 0.5  # Equal trust
    weak_signal_weight: float = 0.3    # Trust ML more
    minimal_signal_weight: float = 0.2 # Mostly ML

    # Confidence calibration
    min_confidence: float = 0.45
    max_confidence: float = 0.75


class RuleBasedAdapter:
    """
    Adapter for the rule-based model to provide sklearn-compatible interface.

    The rule-based model provides point adjustments (e.g., +3.5 means OVER likely).
    We convert these to probabilities using a sigmoid function.
    """

    def __init__(
        self,
        sigmoid_scale: float = 0.5,  # How steep the probability curve is
        base_probability: float = 0.5  # Probability when adjustment = 0
    ):
        self.sigmoid_scale = sigmoid_scale
        self.base_probability = base_probability

    def adjustment_to_probability(self, adjustment: float) -> float:
        """
        Convert rule adjustment to probability.

        Positive adjustment -> higher P(OVER)
        Negative adjustment -> higher P(UNDER)

        Args:
            adjustment: Points adjustment from rule model (e.g., +3.5)

        Returns:
            Probability of OVER (0.5 to 1.0 for positive, 0 to 0.5 for negative)
        """
        # Sigmoid transformation
        return 1 / (1 + np.exp(-self.sigmoid_scale * adjustment))

    def adjustments_to_probabilities(self, adjustments: np.ndarray) -> np.ndarray:
        """Convert array of adjustments to probabilities"""
        return 1 / (1 + np.exp(-self.sigmoid_scale * adjustments))

    def predict_proba(self, adjustments: np.ndarray) -> np.ndarray:
        """
        Return probability matrix like sklearn classifiers.

        Args:
            adjustments: Array of rule adjustments

        Returns:
            (n_samples, 2) array of [P(UNDER), P(OVER)]
        """
        p_over = self.adjustments_to_probabilities(adjustments)
        return np.column_stack([1 - p_over, p_over])


class HybridEnsemble(BaseEstimator, ClassifierMixin):
    """
    Hybrid ensemble combining rule-based and ML predictions.

    Dynamic weighting based on rule signal strength:
    - Strong rule signals (>5 pts) -> 70% rule, 30% ML
    - Medium signals (3-5 pts) -> 50/50
    - Weak signals (<3 pts) -> 30% rule, 70% ML
    """

    def __init__(
        self,
        ml_model: BaseEstimator,
        rule_adapter: Optional[RuleBasedAdapter] = None,
        strong_threshold: float = 5.0,
        medium_threshold: float = 3.0,
        weak_threshold: float = 1.5,
        strong_weight: float = 0.7,
        medium_weight: float = 0.5,
        weak_weight: float = 0.3,
        minimal_weight: float = 0.2,
        use_learned_weights: bool = False
    ):
        """
        Initialize hybrid ensemble.

        Args:
            ml_model: Trained ML model (LogisticModel, XGBoostModel, etc.)
            rule_adapter: Adapter for rule-based model (auto-created if None)
            strong_threshold: Points for "strong" rule signal
            medium_threshold: Points for "medium" rule signal
            weak_threshold: Points for "weak" rule signal
            strong_weight: Rule weight when signal is strong
            medium_weight: Rule weight when signal is medium
            weak_weight: Rule weight when signal is weak
            minimal_weight: Rule weight when signal is minimal
            use_learned_weights: Learn optimal weights from data
        """
        self.ml_model = ml_model
        self.rule_adapter = rule_adapter or RuleBasedAdapter()

        self.strong_threshold = strong_threshold
        self.medium_threshold = medium_threshold
        self.weak_threshold = weak_threshold

        self.strong_weight = strong_weight
        self.medium_weight = medium_weight
        self.weak_weight = weak_weight
        self.minimal_weight = minimal_weight

        self.use_learned_weights = use_learned_weights
        self._learned_weights = None
        self._is_fitted = False

    def get_rule_weight(self, adjustment: float) -> float:
        """
        Get weight for rule-based model based on signal strength.

        Args:
            adjustment: Absolute points adjustment from rule model

        Returns:
            Weight for rule-based model (ML weight = 1 - rule_weight)
        """
        abs_adj = abs(adjustment)

        if abs_adj >= self.strong_threshold:
            return self.strong_weight
        elif abs_adj >= self.medium_threshold:
            return self.medium_weight
        elif abs_adj >= self.weak_threshold:
            return self.weak_weight
        else:
            return self.minimal_weight

    def get_rule_weights_array(self, adjustments: np.ndarray) -> np.ndarray:
        """Get weights for array of adjustments"""
        return np.array([self.get_rule_weight(adj) for adj in adjustments])

    def fit(
        self,
        X: np.ndarray,
        y: np.ndarray,
        rule_adjustments: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
        rule_adjustments_val: Optional[np.ndarray] = None
    ) -> 'HybridEnsemble':
        """
        Fit the hybrid ensemble.

        The ML model is trained on the feature matrix.
        Optionally learns optimal blending weights.

        Args:
            X: Feature matrix for ML model
            y: Target labels
            rule_adjustments: Rule-based adjustments for each sample
            X_val: Validation features (for weight learning)
            y_val: Validation labels
            rule_adjustments_val: Validation rule adjustments

        Returns:
            self
        """
        logger.info("Fitting HybridEnsemble...")

        # Fit ML model if needed
        if hasattr(self.ml_model, 'fit'):
            if X_val is not None and y_val is not None:
                self.ml_model.fit(X, y, X_val, y_val)
            else:
                self.ml_model.fit(X, y)

        # Learn optimal weights if requested
        if self.use_learned_weights and X_val is not None:
            self._learn_weights(X_val, y_val, rule_adjustments_val)

        self._is_fitted = True
        logger.info("HybridEnsemble fitted")

        return self

    def _learn_weights(
        self,
        X_val: np.ndarray,
        y_val: np.ndarray,
        rule_adjustments_val: np.ndarray
    ):
        """Learn optimal weights from validation data"""
        logger.info("Learning optimal blending weights...")

        # Get predictions from both models
        ml_probs = self.ml_model.predict_proba(X_val)[:, 1]
        rule_probs = self.rule_adapter.adjustments_to_probabilities(rule_adjustments_val)

        # Try different weight combinations
        best_roi = float('-inf')
        best_weights = (self.strong_weight, self.medium_weight, self.weak_weight, self.minimal_weight)

        ODDS = 1.91  # Standard -110 odds

        for strong in np.arange(0.5, 0.9, 0.1):
            for medium in np.arange(0.4, 0.7, 0.1):
                for weak in np.arange(0.2, 0.5, 0.1):
                    for minimal in np.arange(0.1, 0.4, 0.1):
                        # Blend predictions with these weights
                        blended_probs = self._blend_probabilities(
                            ml_probs, rule_probs, rule_adjustments_val,
                            strong, medium, weak, minimal
                        )
                        predictions = (blended_probs >= 0.5).astype(int)

                        # Calculate ROI
                        wins = np.sum(predictions == y_val)
                        losses = len(y_val) - wins
                        roi = (wins * (ODDS - 1) - losses) / len(y_val)

                        if roi > best_roi:
                            best_roi = roi
                            best_weights = (strong, medium, weak, minimal)

        self._learned_weights = best_weights
        self.strong_weight, self.medium_weight, self.weak_weight, self.minimal_weight = best_weights

        logger.info(f"Learned weights: strong={self.strong_weight:.2f}, medium={self.medium_weight:.2f}, "
                   f"weak={self.weak_weight:.2f}, minimal={self.minimal_weight:.2f}")
        logger.info(f"Validation ROI: {best_roi * 100:.1f}%")

    def _blend_probabilities(
        self,
        ml_probs: np.ndarray,
        rule_probs: np.ndarray,
        adjustments: np.ndarray,
        strong_w: float,
        medium_w: float,
        weak_w: float,
        minimal_w: float
    ) -> np.ndarray:
        """Blend probabilities with given weights"""
        blended = np.zeros_like(ml_probs)

        for i, adj in enumerate(adjustments):
            abs_adj = abs(adj)
            if abs_adj >= self.strong_threshold:
                rule_w = strong_w
            elif abs_adj >= self.medium_threshold:
                rule_w = medium_w
            elif abs_adj >= self.weak_threshold:
                rule_w = weak_w
            else:
                rule_w = minimal_w

            blended[i] = rule_w * rule_probs[i] + (1 - rule_w) * ml_probs[i]

        return blended

    def predict_proba(
        self,
        X: np.ndarray,
        rule_adjustments: np.ndarray
    ) -> np.ndarray:
        """
        Predict probabilities using hybrid ensemble.

        Args:
            X: Feature matrix
            rule_adjustments: Rule-based adjustments

        Returns:
            (n_samples, 2) array of [P(UNDER), P(OVER)]
        """
        self._check_is_fitted()

        # Get ML predictions
        ml_probs = self.ml_model.predict_proba(X)[:, 1]

        # Get rule predictions
        rule_probs = self.rule_adapter.adjustments_to_probabilities(rule_adjustments)

        # Blend based on signal strength
        blended = self._blend_probabilities(
            ml_probs, rule_probs, rule_adjustments,
            self.strong_weight, self.medium_weight,
            self.weak_weight, self.minimal_weight
        )

        return np.column_stack([1 - blended, blended])

    def predict(
        self,
        X: np.ndarray,
        rule_adjustments: np.ndarray,
        threshold: float = 0.5
    ) -> np.ndarray:
        """
        Predict class labels.

        Args:
            X: Feature matrix
            rule_adjustments: Rule-based adjustments
            threshold: Probability threshold for OVER prediction

        Returns:
            Predicted classes (1=OVER, 0=UNDER)
        """
        probs = self.predict_proba(X, rule_adjustments)[:, 1]
        return (probs >= threshold).astype(int)

    def analyze_blend(
        self,
        X: np.ndarray,
        y_true: np.ndarray,
        rule_adjustments: np.ndarray
    ) -> pd.DataFrame:
        """
        Analyze how blending affects predictions.

        Returns DataFrame showing ML-only, rule-only, and hybrid performance.
        """
        self._check_is_fitted()

        # Individual predictions
        ml_probs = self.ml_model.predict_proba(X)[:, 1]
        rule_probs = self.rule_adapter.adjustments_to_probabilities(rule_adjustments)
        hybrid_probs = self.predict_proba(X, rule_adjustments)[:, 1]

        ml_preds = (ml_probs >= 0.5).astype(int)
        rule_preds = (rule_probs >= 0.5).astype(int)
        hybrid_preds = (hybrid_probs >= 0.5).astype(int)

        ODDS = 1.91

        results = []

        # By signal strength bucket
        buckets = [
            ('Strong', rule_adjustments, self.strong_threshold, float('inf')),
            ('Medium', rule_adjustments, self.medium_threshold, self.strong_threshold),
            ('Weak', rule_adjustments, self.weak_threshold, self.medium_threshold),
            ('Minimal', rule_adjustments, 0, self.weak_threshold)
        ]

        for bucket_name, adjs, min_val, max_val in buckets:
            mask = (np.abs(adjs) >= min_val) & (np.abs(adjs) < max_val)
            if np.sum(mask) == 0:
                continue

            count = np.sum(mask)

            # ML accuracy
            ml_acc = np.mean(ml_preds[mask] == y_true[mask])
            ml_wins = np.sum(ml_preds[mask] == y_true[mask])
            ml_roi = (ml_wins * (ODDS - 1) - (count - ml_wins)) / count * 100

            # Rule accuracy
            rule_acc = np.mean(rule_preds[mask] == y_true[mask])
            rule_wins = np.sum(rule_preds[mask] == y_true[mask])
            rule_roi = (rule_wins * (ODDS - 1) - (count - rule_wins)) / count * 100

            # Hybrid accuracy
            hybrid_acc = np.mean(hybrid_preds[mask] == y_true[mask])
            hybrid_wins = np.sum(hybrid_preds[mask] == y_true[mask])
            hybrid_roi = (hybrid_wins * (ODDS - 1) - (count - hybrid_wins)) / count * 100

            results.append({
                'bucket': bucket_name,
                'count': count,
                'ml_accuracy': ml_acc,
                'ml_roi': ml_roi,
                'rule_accuracy': rule_acc,
                'rule_roi': rule_roi,
                'hybrid_accuracy': hybrid_acc,
                'hybrid_roi': hybrid_roi,
                'rule_weight': self.get_rule_weight(min_val if min_val > 0 else 0)
            })

        # Overall
        total = len(y_true)
        ml_total_acc = np.mean(ml_preds == y_true)
        rule_total_acc = np.mean(rule_preds == y_true)
        hybrid_total_acc = np.mean(hybrid_preds == y_true)

        ml_total_wins = np.sum(ml_preds == y_true)
        rule_total_wins = np.sum(rule_preds == y_true)
        hybrid_total_wins = np.sum(hybrid_preds == y_true)

        results.append({
            'bucket': 'TOTAL',
            'count': total,
            'ml_accuracy': ml_total_acc,
            'ml_roi': (ml_total_wins * (ODDS - 1) - (total - ml_total_wins)) / total * 100,
            'rule_accuracy': rule_total_acc,
            'rule_roi': (rule_total_wins * (ODDS - 1) - (total - rule_total_wins)) / total * 100,
            'hybrid_accuracy': hybrid_total_acc,
            'hybrid_roi': (hybrid_total_wins * (ODDS - 1) - (total - hybrid_total_wins)) / total * 100,
            'rule_weight': None
        })

        return pd.DataFrame(results)

    def get_params(self, deep: bool = True) -> Dict:
        """Get model parameters"""
        return {
            'strong_threshold': self.strong_threshold,
            'medium_threshold': self.medium_threshold,
            'weak_threshold': self.weak_threshold,
            'strong_weight': self.strong_weight,
            'medium_weight': self.medium_weight,
            'weak_weight': self.weak_weight,
            'minimal_weight': self.minimal_weight,
            'use_learned_weights': self.use_learned_weights
        }

    def set_params(self, **params) -> 'HybridEnsemble':
        """Set model parameters"""
        for param, value in params.items():
            setattr(self, param, value)
        return self

    def _check_is_fitted(self):
        """Check if model is fitted"""
        if not self._is_fitted:
            raise RuntimeError("Model must be fitted before making predictions")


def main():
    """Test hybrid ensemble"""
    print("=" * 60)
    print("Hybrid Ensemble Test")
    print("=" * 60)

    from ml.models.baseline import LogisticModel

    # Create synthetic data
    np.random.seed(42)
    n_samples = 1000
    n_features = 20

    X = np.random.randn(n_samples, n_features)

    # True signal from features
    feature_signal = 0.3 * X[:, 0] + 0.2 * X[:, 1] - 0.25 * X[:, 2]

    # Simulate rule adjustments (correlated with true signal)
    rule_adjustments = 2.5 * feature_signal + np.random.randn(n_samples) * 2

    # True outcome
    combined_signal = feature_signal + 0.1 * rule_adjustments
    probs = 1 / (1 + np.exp(-combined_signal))
    y = (np.random.rand(n_samples) < probs).astype(int)

    # Split
    split = int(0.7 * n_samples)
    val_split = int(0.85 * n_samples)

    X_train = X[:split]
    X_val = X[split:val_split]
    X_test = X[val_split:]

    y_train = y[:split]
    y_val = y[split:val_split]
    y_test = y[val_split:]

    adj_train = rule_adjustments[:split]
    adj_val = rule_adjustments[split:val_split]
    adj_test = rule_adjustments[val_split:]

    # Train ML model
    print("\n1. Training ML model...")
    ml_model = LogisticModel(C=0.1)
    ml_model.fit(X_train, y_train)

    # Create hybrid ensemble
    print("\n2. Creating hybrid ensemble...")
    hybrid = HybridEnsemble(
        ml_model=ml_model,
        strong_threshold=5.0,
        medium_threshold=3.0,
        weak_threshold=1.5
    )
    hybrid.fit(X_train, y_train, adj_train)

    # Predictions
    print("\n3. Making predictions...")

    # ML only
    ml_probs = ml_model.predict_proba(X_test)[:, 1]
    ml_preds = (ml_probs >= 0.5).astype(int)
    ml_accuracy = np.mean(ml_preds == y_test)

    # Hybrid
    hybrid_probs = hybrid.predict_proba(X_test, adj_test)[:, 1]
    hybrid_preds = (hybrid_probs >= 0.5).astype(int)
    hybrid_accuracy = np.mean(hybrid_preds == y_test)

    # Rule only
    rule_adapter = RuleBasedAdapter()
    rule_probs = rule_adapter.adjustments_to_probabilities(adj_test)
    rule_preds = (rule_probs >= 0.5).astype(int)
    rule_accuracy = np.mean(rule_preds == y_test)

    print(f"   ML only accuracy: {ml_accuracy:.1%}")
    print(f"   Rule only accuracy: {rule_accuracy:.1%}")
    print(f"   Hybrid accuracy: {hybrid_accuracy:.1%}")

    # Blend analysis
    print("\n4. Blend analysis by signal strength:")
    analysis = hybrid.analyze_blend(X_test, y_test, adj_test)
    print(analysis.to_string())

    # Test with learned weights
    print("\n5. Testing with learned weights...")
    hybrid_learned = HybridEnsemble(
        ml_model=ml_model,
        use_learned_weights=True
    )
    hybrid_learned.fit(X_train, y_train, adj_train, X_val, y_val, adj_val)

    learned_probs = hybrid_learned.predict_proba(X_test, adj_test)[:, 1]
    learned_preds = (learned_probs >= 0.5).astype(int)
    learned_accuracy = np.mean(learned_preds == y_test)
    print(f"   Learned weights accuracy: {learned_accuracy:.1%}")

    print("\n" + "=" * 60)
    print("Hybrid Ensemble Test Complete")
    print("=" * 60)


if __name__ == "__main__":
    main()
