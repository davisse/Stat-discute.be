"""
Baseline Logistic Regression Model for NBA Totals Prediction

A simple, interpretable baseline model using L2-regularized logistic regression.
Provides interpretable feature weights and establishes baseline performance.

Usage:
    from models.baseline import LogisticModel

    model = LogisticModel()
    model.fit(X_train, y_train)
    probabilities = model.predict_proba(X_test)
    feature_importance = model.get_feature_importance(feature_names)
"""

import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Tuple, Any
from dataclasses import dataclass
import logging

from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.base import BaseEstimator, ClassifierMixin

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@dataclass
class ModelConfig:
    """Configuration for Logistic Model"""
    C: float = 0.1  # Regularization strength (lower = more regularization)
    penalty: str = 'l2'  # L2 regularization for feature shrinkage
    solver: str = 'lbfgs'  # Optimization algorithm
    max_iter: int = 1000  # Maximum iterations
    class_weight: Optional[str] = 'balanced'  # Handle class imbalance
    random_state: int = 42


class LogisticModel(BaseEstimator, ClassifierMixin):
    """
    Interpretable baseline model using Logistic Regression.

    Features:
    - L2 regularization to prevent overfitting
    - Standard scaling for consistent feature magnitudes
    - Balanced class weights to handle OVER/UNDER imbalance
    - Feature importance via coefficient magnitudes
    """

    def __init__(
        self,
        C: float = 0.1,
        penalty: str = 'l2',
        class_weight: Optional[str] = 'balanced',
        max_iter: int = 1000,
        random_state: int = 42
    ):
        """
        Initialize logistic regression model.

        Args:
            C: Inverse regularization strength (smaller = more regularization)
            penalty: Regularization type ('l1', 'l2', 'elasticnet')
            class_weight: 'balanced' to handle class imbalance, None for uniform
            max_iter: Maximum optimization iterations
            random_state: Random seed for reproducibility
        """
        self.C = C
        self.penalty = penalty
        self.class_weight = class_weight
        self.max_iter = max_iter
        self.random_state = random_state

        self.scaler = StandardScaler()
        self.model = None
        self._is_fitted = False
        self._feature_names = None

    def fit(self, X: np.ndarray, y: np.ndarray, feature_names: Optional[List[str]] = None) -> 'LogisticModel':
        """
        Fit the logistic regression model.

        Args:
            X: Feature matrix (n_samples, n_features)
            y: Target array (n_samples,) with 1=OVER, 0=UNDER
            feature_names: Optional list of feature names for importance

        Returns:
            self
        """
        logger.info(f"Fitting LogisticModel on {X.shape[0]} samples, {X.shape[1]} features")

        # Store feature names
        self._feature_names = feature_names

        # Scale features
        X_scaled = self.scaler.fit_transform(X)

        # Determine solver based on penalty
        solver = 'lbfgs'
        if self.penalty == 'l1':
            solver = 'liblinear'
        elif self.penalty == 'elasticnet':
            solver = 'saga'

        # Create and fit model
        self.model = LogisticRegression(
            C=self.C,
            penalty=self.penalty,
            class_weight=self.class_weight,
            solver=solver,
            max_iter=self.max_iter,
            random_state=self.random_state,
            n_jobs=-1
        )

        self.model.fit(X_scaled, y)
        self._is_fitted = True

        logger.info(f"Model fitted. Coefficients shape: {self.model.coef_.shape}")

        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Predict class labels.

        Args:
            X: Feature matrix

        Returns:
            Predicted classes (1=OVER, 0=UNDER)
        """
        self._check_is_fitted()
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """
        Predict class probabilities.

        Args:
            X: Feature matrix

        Returns:
            Probability matrix (n_samples, 2) for [P(UNDER), P(OVER)]
        """
        self._check_is_fitted()
        X_scaled = self.scaler.transform(X)
        return self.model.predict_proba(X_scaled)

    def get_feature_importance(
        self,
        feature_names: Optional[List[str]] = None,
        top_k: int = 20
    ) -> pd.DataFrame:
        """
        Get feature importance based on coefficient magnitudes.

        Args:
            feature_names: List of feature names (uses stored names if None)
            top_k: Number of top features to return

        Returns:
            DataFrame with feature names, coefficients, and importance
        """
        self._check_is_fitted()

        names = feature_names or self._feature_names
        if names is None:
            names = [f"feature_{i}" for i in range(len(self.model.coef_[0]))]

        # Get coefficients
        coefs = self.model.coef_[0]

        # Create DataFrame
        importance_df = pd.DataFrame({
            'feature': names,
            'coefficient': coefs,
            'abs_importance': np.abs(coefs),
            'direction': ['OVER' if c > 0 else 'UNDER' for c in coefs]
        })

        # Sort by absolute importance
        importance_df = importance_df.sort_values('abs_importance', ascending=False)

        return importance_df.head(top_k)

    def get_calibration_metrics(
        self,
        X: np.ndarray,
        y_true: np.ndarray,
        n_bins: int = 10
    ) -> Dict[str, Any]:
        """
        Calculate calibration metrics (predicted probability vs actual frequency).

        Args:
            X: Feature matrix
            y_true: True labels
            n_bins: Number of probability bins

        Returns:
            Dict with calibration metrics
        """
        probs = self.predict_proba(X)[:, 1]  # P(OVER)

        # Bin predictions
        bin_edges = np.linspace(0, 1, n_bins + 1)
        bin_indices = np.digitize(probs, bin_edges) - 1
        bin_indices = np.clip(bin_indices, 0, n_bins - 1)

        calibration_data = []
        for i in range(n_bins):
            mask = bin_indices == i
            if np.sum(mask) > 0:
                bin_mean_predicted = np.mean(probs[mask])
                bin_actual_rate = np.mean(y_true[mask])
                calibration_data.append({
                    'bin': i,
                    'bin_range': f"{bin_edges[i]:.2f}-{bin_edges[i+1]:.2f}",
                    'mean_predicted': bin_mean_predicted,
                    'actual_rate': bin_actual_rate,
                    'count': int(np.sum(mask)),
                    'error': bin_actual_rate - bin_mean_predicted
                })

        # Calculate overall calibration error
        calibration_df = pd.DataFrame(calibration_data)
        if len(calibration_df) > 0:
            # Expected Calibration Error (ECE)
            weights = calibration_df['count'] / calibration_df['count'].sum()
            ece = np.sum(weights * np.abs(calibration_df['error']))
        else:
            ece = 0

        return {
            'bins': calibration_df,
            'expected_calibration_error': ece,
            'mean_predicted': np.mean(probs),
            'actual_over_rate': np.mean(y_true)
        }

    def get_params(self, deep: bool = True) -> Dict:
        """Get model parameters (sklearn interface)"""
        return {
            'C': self.C,
            'penalty': self.penalty,
            'class_weight': self.class_weight,
            'max_iter': self.max_iter,
            'random_state': self.random_state
        }

    def set_params(self, **params) -> 'LogisticModel':
        """Set model parameters (sklearn interface)"""
        for param, value in params.items():
            setattr(self, param, value)
        return self

    def _check_is_fitted(self):
        """Check if model has been fitted"""
        if not self._is_fitted:
            raise RuntimeError("Model must be fitted before making predictions")

    def save_model(self, filepath: str):
        """Save model to file"""
        import joblib
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'config': self.get_params(),
            'feature_names': self._feature_names
        }, filepath)
        logger.info(f"Model saved to {filepath}")

    @classmethod
    def load_model(cls, filepath: str) -> 'LogisticModel':
        """Load model from file"""
        import joblib
        data = joblib.load(filepath)

        instance = cls(**data['config'])
        instance.model = data['model']
        instance.scaler = data['scaler']
        instance._feature_names = data['feature_names']
        instance._is_fitted = True

        logger.info(f"Model loaded from {filepath}")
        return instance


def main():
    """Test logistic model"""
    print("=" * 60)
    print("Logistic Model Test")
    print("=" * 60)

    # Create synthetic test data
    np.random.seed(42)
    n_samples = 1000
    n_features = 50

    # Generate features
    X = np.random.randn(n_samples, n_features)

    # Create target with some signal
    # Features 0, 1, 2 are predictive
    true_weights = np.zeros(n_features)
    true_weights[0] = 0.5
    true_weights[1] = 0.3
    true_weights[2] = -0.4
    true_weights[10] = 0.2

    logits = X @ true_weights + np.random.randn(n_samples) * 0.5
    probs = 1 / (1 + np.exp(-logits))
    y = (np.random.rand(n_samples) < probs).astype(int)

    # Split data
    split = int(0.8 * n_samples)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    feature_names = [f"feature_{i}" for i in range(n_features)]

    # Train model
    print("\n1. Training logistic model...")
    model = LogisticModel(C=0.1)
    model.fit(X_train, y_train, feature_names=feature_names)

    # Predictions
    print("\n2. Making predictions...")
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)

    accuracy = np.mean(y_pred == y_test)
    print(f"   Accuracy: {accuracy:.1%}")

    # Feature importance
    print("\n3. Feature importance (top 10):")
    importance = model.get_feature_importance(top_k=10)
    print(importance.to_string())

    # Check if true features are identified
    top_features = importance['feature'].head(5).tolist()
    print(f"\n   True important features: feature_0, feature_1, feature_2, feature_10")
    print(f"   Model top 5: {top_features}")

    # Calibration
    print("\n4. Calibration metrics:")
    calibration = model.get_calibration_metrics(X_test, y_test)
    print(f"   Expected Calibration Error: {calibration['expected_calibration_error']:.4f}")
    print(f"   Mean predicted: {calibration['mean_predicted']:.3f}")
    print(f"   Actual OVER rate: {calibration['actual_over_rate']:.3f}")

    # Save/load test
    print("\n5. Save/Load test...")
    model.save_model('/tmp/test_logistic_model.joblib')
    loaded_model = LogisticModel.load_model('/tmp/test_logistic_model.joblib')
    loaded_accuracy = np.mean(loaded_model.predict(X_test) == y_test)
    print(f"   Loaded model accuracy: {loaded_accuracy:.1%}")
    assert accuracy == loaded_accuracy, "Save/load failed!"
    print("   ✓ Save/Load successful")

    print("\n" + "=" * 60)
    print("Logistic Model Test Complete")
    print("=" * 60)


if __name__ == "__main__":
    main()
