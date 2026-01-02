"""
XGBoost Gradient Boosting Model for NBA Totals Prediction

Primary production model that captures non-linear feature interactions.
Optimized for betting ROI rather than pure accuracy.

Usage:
    from models.gradient_boosting import XGBoostModel

    model = XGBoostModel()
    model.fit(X_train, y_train, X_val, y_val)  # With early stopping
    probabilities = model.predict_proba(X_test)
    feature_importance = model.get_feature_importance(feature_names)
"""

import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Tuple, Any
from dataclasses import dataclass
import logging
import warnings

try:
    import xgboost as xgb
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False
    warnings.warn("XGBoost not installed. Run: pip install xgboost")

from sklearn.base import BaseEstimator, ClassifierMixin

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@dataclass
class XGBoostConfig:
    """Configuration for XGBoost Model"""
    # Tree parameters
    n_estimators: int = 100
    max_depth: int = 4
    learning_rate: float = 0.05
    min_child_weight: int = 5

    # Sampling parameters
    subsample: float = 0.8
    colsample_bytree: float = 0.8
    colsample_bylevel: float = 0.8

    # Regularization
    reg_alpha: float = 0.1  # L1 regularization
    reg_lambda: float = 1.0  # L2 regularization
    gamma: float = 0.1  # Minimum loss reduction for split

    # Training parameters
    early_stopping_rounds: int = 20
    eval_metric: str = 'logloss'
    random_state: int = 42

    # Scale for class imbalance
    scale_pos_weight: Optional[float] = None


class XGBoostModel(BaseEstimator, ClassifierMixin):
    """
    XGBoost model for NBA totals prediction.

    Features:
    - Gradient boosting for non-linear pattern capture
    - Early stopping to prevent overfitting
    - Built-in feature importance
    - Regularization (L1, L2, tree complexity)
    """

    def __init__(
        self,
        n_estimators: int = 100,
        max_depth: int = 4,
        learning_rate: float = 0.05,
        subsample: float = 0.8,
        colsample_bytree: float = 0.8,
        reg_alpha: float = 0.1,
        reg_lambda: float = 1.0,
        min_child_weight: int = 5,
        gamma: float = 0.1,
        scale_pos_weight: Optional[float] = None,
        early_stopping_rounds: int = 20,
        random_state: int = 42
    ):
        """
        Initialize XGBoost model.

        Args:
            n_estimators: Number of boosting rounds
            max_depth: Maximum tree depth (lower = less overfitting)
            learning_rate: Step size shrinkage (lower = more robust)
            subsample: Row sampling ratio per tree
            colsample_bytree: Column sampling ratio per tree
            reg_alpha: L1 regularization
            reg_lambda: L2 regularization
            min_child_weight: Minimum sum of instance weight in child
            gamma: Minimum loss reduction to make split
            scale_pos_weight: Balance for class imbalance (n_neg/n_pos)
            early_stopping_rounds: Rounds without improvement to stop
            random_state: Random seed
        """
        if not HAS_XGBOOST:
            raise ImportError("XGBoost not installed. Run: pip install xgboost")

        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.learning_rate = learning_rate
        self.subsample = subsample
        self.colsample_bytree = colsample_bytree
        self.reg_alpha = reg_alpha
        self.reg_lambda = reg_lambda
        self.min_child_weight = min_child_weight
        self.gamma = gamma
        self.scale_pos_weight = scale_pos_weight
        self.early_stopping_rounds = early_stopping_rounds
        self.random_state = random_state

        self.model = None
        self._is_fitted = False
        self._feature_names = None
        self._best_iteration = None

    def fit(
        self,
        X: np.ndarray,
        y: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
        feature_names: Optional[List[str]] = None,
        verbose: bool = True
    ) -> 'XGBoostModel':
        """
        Fit the XGBoost model.

        Args:
            X: Training feature matrix
            y: Training target array
            X_val: Validation feature matrix (for early stopping)
            y_val: Validation target array
            feature_names: Optional feature names
            verbose: Whether to print training progress

        Returns:
            self
        """
        logger.info(f"Fitting XGBoostModel on {X.shape[0]} samples, {X.shape[1]} features")

        self._feature_names = feature_names

        # Calculate scale_pos_weight if not provided
        scale_pos_weight = self.scale_pos_weight
        if scale_pos_weight is None:
            n_pos = np.sum(y == 1)
            n_neg = np.sum(y == 0)
            scale_pos_weight = n_neg / n_pos if n_pos > 0 else 1.0
            logger.info(f"Auto scale_pos_weight: {scale_pos_weight:.2f}")

        # Create model
        self.model = xgb.XGBClassifier(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            learning_rate=self.learning_rate,
            subsample=self.subsample,
            colsample_bytree=self.colsample_bytree,
            colsample_bylevel=0.8,
            reg_alpha=self.reg_alpha,
            reg_lambda=self.reg_lambda,
            min_child_weight=self.min_child_weight,
            gamma=self.gamma,
            scale_pos_weight=scale_pos_weight,
            random_state=self.random_state,
            n_jobs=-1,
            eval_metric='logloss',
            use_label_encoder=False,
            verbosity=1 if verbose else 0
        )

        # Prepare eval set
        eval_set = None
        if X_val is not None and y_val is not None:
            eval_set = [(X_val, y_val)]

        # Fit with early stopping
        fit_params = {}
        if eval_set:
            fit_params['eval_set'] = eval_set

        # XGBoost 2.0+ uses callbacks for early stopping
        if eval_set:
            callbacks = [xgb.callback.EarlyStopping(
                rounds=self.early_stopping_rounds,
                save_best=True
            )]
            fit_params['callbacks'] = callbacks

        try:
            self.model.fit(X, y, **fit_params)
        except TypeError:
            # Fallback for older XGBoost versions
            if eval_set:
                self.model.set_params(early_stopping_rounds=self.early_stopping_rounds)
            self.model.fit(X, y, eval_set=eval_set if eval_set else None)

        self._is_fitted = True
        self._best_iteration = getattr(self.model, 'best_iteration', self.n_estimators)

        logger.info(f"Model fitted. Best iteration: {self._best_iteration}")

        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict class labels"""
        self._check_is_fitted()
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Predict class probabilities"""
        self._check_is_fitted()
        return self.model.predict_proba(X)

    def get_feature_importance(
        self,
        feature_names: Optional[List[str]] = None,
        importance_type: str = 'gain',
        top_k: int = 20
    ) -> pd.DataFrame:
        """
        Get feature importance.

        Args:
            feature_names: List of feature names
            importance_type: 'gain', 'weight', or 'cover'
            top_k: Number of top features to return

        Returns:
            DataFrame with feature importance
        """
        self._check_is_fitted()

        names = feature_names or self._feature_names

        # Get importance from booster
        booster = self.model.get_booster()
        importance_dict = booster.get_score(importance_type=importance_type)

        # Map feature indices to names
        if names is None:
            names = [f"f{i}" for i in range(self.model.n_features_in_)]

        # Build DataFrame
        importance_data = []
        for i, name in enumerate(names):
            feature_key = f"f{i}"
            importance = importance_dict.get(feature_key, 0)
            importance_data.append({
                'feature': name,
                'importance': importance,
                'importance_type': importance_type
            })

        importance_df = pd.DataFrame(importance_data)
        importance_df = importance_df.sort_values('importance', ascending=False)

        # Normalize
        total = importance_df['importance'].sum()
        if total > 0:
            importance_df['importance_pct'] = importance_df['importance'] / total * 100
        else:
            importance_df['importance_pct'] = 0

        return importance_df.head(top_k)

    def get_all_importance_types(
        self,
        feature_names: Optional[List[str]] = None,
        top_k: int = 20
    ) -> pd.DataFrame:
        """Get feature importance for all importance types"""
        self._check_is_fitted()

        names = feature_names or self._feature_names

        # Get all importance types
        gain_df = self.get_feature_importance(names, 'gain', top_k=None)
        weight_df = self.get_feature_importance(names, 'weight', top_k=None)
        cover_df = self.get_feature_importance(names, 'cover', top_k=None)

        # Merge
        merged = gain_df[['feature', 'importance']].rename(columns={'importance': 'gain'})
        merged = merged.merge(
            weight_df[['feature', 'importance']].rename(columns={'importance': 'weight'}),
            on='feature', how='outer'
        )
        merged = merged.merge(
            cover_df[['feature', 'importance']].rename(columns={'importance': 'cover'}),
            on='feature', how='outer'
        )

        # Calculate average rank
        merged['gain_rank'] = merged['gain'].rank(ascending=False)
        merged['weight_rank'] = merged['weight'].rank(ascending=False)
        merged['cover_rank'] = merged['cover'].rank(ascending=False)
        merged['avg_rank'] = (merged['gain_rank'] + merged['weight_rank'] + merged['cover_rank']) / 3

        merged = merged.sort_values('avg_rank')

        return merged.head(top_k)

    def plot_feature_importance(
        self,
        feature_names: Optional[List[str]] = None,
        top_k: int = 20,
        figsize: Tuple[int, int] = (10, 8)
    ):
        """Plot feature importance (requires matplotlib)"""
        try:
            import matplotlib.pyplot as plt
        except ImportError:
            logger.warning("matplotlib not installed")
            return

        importance = self.get_feature_importance(feature_names, top_k=top_k)

        plt.figure(figsize=figsize)
        plt.barh(range(len(importance)), importance['importance_pct'].values)
        plt.yticks(range(len(importance)), importance['feature'].values)
        plt.xlabel('Importance (%)')
        plt.title(f'Top {top_k} Feature Importance (Gain)')
        plt.tight_layout()
        plt.show()

    def get_calibration_curve(
        self,
        X: np.ndarray,
        y_true: np.ndarray,
        n_bins: int = 10
    ) -> pd.DataFrame:
        """Calculate calibration curve data"""
        probs = self.predict_proba(X)[:, 1]

        bin_edges = np.linspace(0, 1, n_bins + 1)
        bin_indices = np.digitize(probs, bin_edges) - 1
        bin_indices = np.clip(bin_indices, 0, n_bins - 1)

        calibration_data = []
        for i in range(n_bins):
            mask = bin_indices == i
            if np.sum(mask) > 0:
                calibration_data.append({
                    'bin': i,
                    'bin_center': (bin_edges[i] + bin_edges[i+1]) / 2,
                    'mean_predicted': np.mean(probs[mask]),
                    'actual_rate': np.mean(y_true[mask]),
                    'count': int(np.sum(mask))
                })

        return pd.DataFrame(calibration_data)

    def get_params(self, deep: bool = True) -> Dict:
        """Get model parameters"""
        return {
            'n_estimators': self.n_estimators,
            'max_depth': self.max_depth,
            'learning_rate': self.learning_rate,
            'subsample': self.subsample,
            'colsample_bytree': self.colsample_bytree,
            'reg_alpha': self.reg_alpha,
            'reg_lambda': self.reg_lambda,
            'min_child_weight': self.min_child_weight,
            'gamma': self.gamma,
            'scale_pos_weight': self.scale_pos_weight,
            'early_stopping_rounds': self.early_stopping_rounds,
            'random_state': self.random_state
        }

    def set_params(self, **params) -> 'XGBoostModel':
        """Set model parameters"""
        for param, value in params.items():
            setattr(self, param, value)
        return self

    def _check_is_fitted(self):
        """Check if model is fitted"""
        if not self._is_fitted:
            raise RuntimeError("Model must be fitted before making predictions")

    def save_model(self, filepath: str):
        """Save model to file"""
        self._check_is_fitted()
        self.model.save_model(filepath)
        logger.info(f"Model saved to {filepath}")

    def load_model(self, filepath: str):
        """Load model from file"""
        self.model = xgb.XGBClassifier()
        self.model.load_model(filepath)
        self._is_fitted = True
        logger.info(f"Model loaded from {filepath}")


class LightGBMModel(BaseEstimator, ClassifierMixin):
    """
    Alternative gradient boosting using LightGBM.
    Faster training, similar performance.
    """

    def __init__(
        self,
        n_estimators: int = 100,
        max_depth: int = 4,
        learning_rate: float = 0.05,
        num_leaves: int = 15,
        subsample: float = 0.8,
        colsample_bytree: float = 0.8,
        reg_alpha: float = 0.1,
        reg_lambda: float = 1.0,
        min_child_samples: int = 20,
        random_state: int = 42
    ):
        try:
            import lightgbm as lgb
            self._lgb = lgb
        except ImportError:
            raise ImportError("LightGBM not installed. Run: pip install lightgbm")

        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.learning_rate = learning_rate
        self.num_leaves = num_leaves
        self.subsample = subsample
        self.colsample_bytree = colsample_bytree
        self.reg_alpha = reg_alpha
        self.reg_lambda = reg_lambda
        self.min_child_samples = min_child_samples
        self.random_state = random_state

        self.model = None
        self._is_fitted = False
        self._feature_names = None

    def fit(
        self,
        X: np.ndarray,
        y: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
        feature_names: Optional[List[str]] = None
    ) -> 'LightGBMModel':
        """Fit LightGBM model"""
        self._feature_names = feature_names

        # Calculate class weight
        n_pos = np.sum(y == 1)
        n_neg = np.sum(y == 0)
        is_unbalance = abs(n_pos / len(y) - 0.5) > 0.05

        self.model = self._lgb.LGBMClassifier(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            learning_rate=self.learning_rate,
            num_leaves=self.num_leaves,
            subsample=self.subsample,
            colsample_bytree=self.colsample_bytree,
            reg_alpha=self.reg_alpha,
            reg_lambda=self.reg_lambda,
            min_child_samples=self.min_child_samples,
            is_unbalance=is_unbalance,
            random_state=self.random_state,
            n_jobs=-1,
            verbose=-1
        )

        callbacks = None
        eval_set = None
        if X_val is not None and y_val is not None:
            eval_set = [(X_val, y_val)]
            callbacks = [self._lgb.early_stopping(20, verbose=False)]

        self.model.fit(
            X, y,
            eval_set=eval_set,
            callbacks=callbacks
        )

        self._is_fitted = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict_proba(X)

    def get_feature_importance(
        self,
        feature_names: Optional[List[str]] = None,
        top_k: int = 20
    ) -> pd.DataFrame:
        """Get feature importance"""
        names = feature_names or self._feature_names
        if names is None:
            names = [f"feature_{i}" for i in range(len(self.model.feature_importances_))]

        importance_df = pd.DataFrame({
            'feature': names,
            'importance': self.model.feature_importances_
        })
        importance_df = importance_df.sort_values('importance', ascending=False)
        importance_df['importance_pct'] = importance_df['importance'] / importance_df['importance'].sum() * 100

        return importance_df.head(top_k)

    def get_params(self, deep: bool = True) -> Dict:
        return {
            'n_estimators': self.n_estimators,
            'max_depth': self.max_depth,
            'learning_rate': self.learning_rate,
            'num_leaves': self.num_leaves,
            'subsample': self.subsample,
            'colsample_bytree': self.colsample_bytree,
            'reg_alpha': self.reg_alpha,
            'reg_lambda': self.reg_lambda,
            'min_child_samples': self.min_child_samples,
            'random_state': self.random_state
        }

    def set_params(self, **params) -> 'LightGBMModel':
        for param, value in params.items():
            setattr(self, param, value)
        return self


def main():
    """Test XGBoost model"""
    if not HAS_XGBOOST:
        print("XGBoost not installed. Run: pip install xgboost")
        return

    print("=" * 60)
    print("XGBoost Model Test")
    print("=" * 60)

    # Create synthetic test data
    np.random.seed(42)
    n_samples = 2000
    n_features = 50

    X = np.random.randn(n_samples, n_features)

    # Create non-linear target
    true_signal = (
        0.5 * X[:, 0] +
        0.3 * X[:, 1] ** 2 +  # Non-linear
        0.2 * X[:, 2] * X[:, 3] +  # Interaction
        -0.4 * X[:, 10]
    )
    probs = 1 / (1 + np.exp(-true_signal + np.random.randn(n_samples) * 0.3))
    y = (np.random.rand(n_samples) < probs).astype(int)

    # Split
    split = int(0.7 * n_samples)
    val_split = int(0.85 * n_samples)
    X_train, X_val, X_test = X[:split], X[split:val_split], X[val_split:]
    y_train, y_val, y_test = y[:split], y[split:val_split], y[val_split:]

    feature_names = [f"feature_{i}" for i in range(n_features)]

    # Train XGBoost
    print("\n1. Training XGBoost model...")
    model = XGBoostModel(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.05
    )
    model.fit(X_train, y_train, X_val, y_val, feature_names=feature_names)

    # Predictions
    print("\n2. Making predictions...")
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)

    accuracy = np.mean(y_pred == y_test)
    print(f"   Accuracy: {accuracy:.1%}")

    # Feature importance
    print("\n3. Feature importance (top 10):")
    importance = model.get_feature_importance(feature_names, top_k=10)
    print(importance[['feature', 'importance_pct']].to_string())

    # All importance types
    print("\n4. All importance types (top 5):")
    all_imp = model.get_all_importance_types(feature_names, top_k=5)
    print(all_imp[['feature', 'gain', 'weight', 'cover', 'avg_rank']].to_string())

    # Calibration
    print("\n5. Calibration curve:")
    calibration = model.get_calibration_curve(X_test, y_test, n_bins=5)
    print(calibration.to_string())

    # Save/load
    print("\n6. Save/Load test...")
    model.save_model('/tmp/test_xgb_model.json')
    loaded_model = XGBoostModel()
    loaded_model.load_model('/tmp/test_xgb_model.json')
    loaded_accuracy = np.mean(loaded_model.predict(X_test) == y_test)
    print(f"   Loaded model accuracy: {loaded_accuracy:.1%}")

    print("\n" + "=" * 60)
    print("XGBoost Model Test Complete")
    print("=" * 60)


if __name__ == "__main__":
    main()
