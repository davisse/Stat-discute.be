# Monte Carlo Simulation for Totals Betting

**Status**: IMPLEMENTED & VALIDATED
**Created**: 2025-11-28
**Related**: nba-bettor-agent.md, v3 totals model

---

## Overview

Enhance the totals betting model with Monte Carlo simulations to generate probability distributions instead of single-point estimates. This provides more robust probability estimation with confidence intervals.

---

## Current State (v3 Model)

```
Single-point projection: 233.7
Z-score probability: 63.6% (under)
Edge: 6.21%
```

**Limitation**: Assumes normal distribution, doesn't capture game-specific variance or correlations.

---

## Monte Carlo Approach

### Core Concept

Run N simulations (default 10,000) where each simulation:
1. Samples team scores from correlated distributions
2. Models overtime as discrete event (6% probability)
3. Counts outcomes to estimate probabilities
4. Provides confidence intervals via standard error

### Key Features

| Feature | Description |
|---------|-------------|
| **Correlated Sampling** | Team scores are correlated (~50%) - high-pace games affect both teams |
| **Overtime Modeling** | 6% of games go to OT, adds ~12 points |
| **Confidence Intervals** | 95% CI on probability estimates |
| **Sensitivity Analysis** | Which inputs matter most? |
| **Scenario Analysis** | High-pace, low-pace, blowout scenarios |

---

## Implementation Plan

### Phase 1: Core Monte Carlo Function

**New File**: `betting-agent/src/tools/monte_carlo.py`

```python
import numpy as np
from typing import Optional

def monte_carlo_totals_simulation(
    t1_projection: float,
    t2_projection: float,
    t1_std_dev: float,
    t2_std_dev: float,
    total_line: float,
    n_sims: int = 10000,
    correlation: float = 0.5,
    ot_probability: float = 0.06,
    ot_points_mean: float = 12.0,
    seed: Optional[int] = None
) -> dict:
    """
    Monte Carlo simulation for totals betting.

    Uses correlated bivariate normal for team scores,
    with discrete overtime probability.

    Args:
        t1_projection: Team 1 expected score
        t2_projection: Team 2 expected score
        t1_std_dev: Team 1 scoring standard deviation
        t2_std_dev: Team 2 scoring standard deviation
        total_line: Betting line to compare against
        n_sims: Number of simulations
        correlation: Score correlation between teams (0-1)
        ot_probability: Probability of overtime
        ot_points_mean: Average additional points in OT
        seed: Random seed for reproducibility

    Returns:
        dict with probabilities, CIs, percentiles, etc.
    """
    if seed is not None:
        np.random.seed(seed)

    # Build covariance matrix for correlated sampling
    cov = correlation * t1_std_dev * t2_std_dev
    cov_matrix = [
        [t1_std_dev**2, cov],
        [cov, t2_std_dev**2]
    ]
    means = [t1_projection, t2_projection]

    # Generate correlated scores
    scores = np.random.multivariate_normal(means, cov_matrix, n_sims)
    t1_scores = scores[:, 0]
    t2_scores = scores[:, 1]

    # Apply overtime (discrete event)
    ot_games = np.random.random(n_sims) < ot_probability
    ot_points = np.where(ot_games, np.random.normal(ot_points_mean, 3, n_sims), 0)

    # Total scores
    totals = t1_scores + t2_scores + ot_points

    # Calculate probabilities
    over_count = np.sum(totals > total_line)
    under_count = np.sum(totals < total_line)
    push_count = n_sims - over_count - under_count

    p_over = over_count / n_sims
    p_under = under_count / n_sims

    # Standard error (for confidence interval)
    se_over = np.sqrt(p_over * (1 - p_over) / n_sims)
    se_under = np.sqrt(p_under * (1 - p_under) / n_sims)

    # Percentiles
    percentiles = np.percentile(totals, [5, 10, 25, 50, 75, 90, 95])

    return {
        "n_simulations": n_sims,
        "p_over": round(p_over, 4),
        "p_under": round(p_under, 4),
        "p_push": round(push_count / n_sims, 4),
        "se_over": round(se_over, 4),
        "se_under": round(se_under, 4),
        "ci_95_over": [round(p_over - 1.96*se_over, 4), round(p_over + 1.96*se_over, 4)],
        "ci_95_under": [round(p_under - 1.96*se_under, 4), round(p_under + 1.96*se_under, 4)],
        "mean_total": round(float(np.mean(totals)), 1),
        "median_total": round(float(np.median(totals)), 1),
        "std_total": round(float(np.std(totals)), 1),
        "percentiles": {
            "p5": round(percentiles[0], 1),
            "p10": round(percentiles[1], 1),
            "p25": round(percentiles[2], 1),
            "p50": round(percentiles[3], 1),
            "p75": round(percentiles[4], 1),
            "p90": round(percentiles[5], 1),
            "p95": round(percentiles[6], 1),
        },
        "ot_games_simulated": int(np.sum(ot_games)),
        "ot_games_pct": round(float(np.sum(ot_games)) / n_sims, 4),
        "correlation_used": correlation,
    }
```

### Phase 2: Scenario & Sensitivity Analysis

```python
def scenario_analysis(
    t1_projection: float,
    t2_projection: float,
    t1_std_dev: float,
    t2_std_dev: float,
    total_line: float,
    n_sims: int = 10000
) -> dict:
    """
    Run MC under multiple scenarios.
    """
    scenarios = {
        "base": {},
        "high_pace": {"t1_projection": t1_projection + 3, "t2_projection": t2_projection + 3},
        "low_pace": {"t1_projection": t1_projection - 3, "t2_projection": t2_projection - 3},
        "high_variance": {"t1_std_dev": t1_std_dev * 1.3, "t2_std_dev": t2_std_dev * 1.3},
        "low_variance": {"t1_std_dev": t1_std_dev * 0.7, "t2_std_dev": t2_std_dev * 0.7},
        "high_ot": {"ot_probability": 0.10},
        "no_correlation": {"correlation": 0.0},
        "high_correlation": {"correlation": 0.7},
    }

    results = {}
    base_params = {
        "t1_projection": t1_projection,
        "t2_projection": t2_projection,
        "t1_std_dev": t1_std_dev,
        "t2_std_dev": t2_std_dev,
        "total_line": total_line,
        "n_sims": n_sims,
    }

    for name, adjustments in scenarios.items():
        params = {**base_params, **adjustments}
        result = monte_carlo_totals_simulation(**params)
        results[name] = {
            "p_over": result["p_over"],
            "p_under": result["p_under"],
            "mean_total": result["mean_total"],
        }

    return results


def sensitivity_analysis(
    t1_projection: float,
    t2_projection: float,
    t1_std_dev: float,
    t2_std_dev: float,
    total_line: float,
    perturbation: float = 0.05,
    n_sims: int = 10000
) -> dict:
    """
    Calculate sensitivity of P(under) to each input parameter.

    Returns sensitivity coefficient: change in P(under) per 1% change in input.
    """
    base_params = {
        "t1_projection": t1_projection,
        "t2_projection": t2_projection,
        "t1_std_dev": t1_std_dev,
        "t2_std_dev": t2_std_dev,
        "total_line": total_line,
        "n_sims": n_sims,
    }

    base_result = monte_carlo_totals_simulation(**base_params)
    base_p_under = base_result["p_under"]

    sensitivities = {}
    params_to_test = ["t1_projection", "t2_projection", "t1_std_dev", "t2_std_dev"]

    for param in params_to_test:
        # Perturb up
        params_up = base_params.copy()
        params_up[param] *= (1 + perturbation)
        result_up = monte_carlo_totals_simulation(**params_up)

        # Perturb down
        params_down = base_params.copy()
        params_down[param] *= (1 - perturbation)
        result_down = monte_carlo_totals_simulation(**params_down)

        # Sensitivity = change in output / change in input
        delta_p = result_up["p_under"] - result_down["p_under"]
        sensitivity = delta_p / (2 * perturbation)

        sensitivities[param] = round(sensitivity, 4)

    return sensitivities
```

### Phase 3: Expected Value Calculations

```python
def calculate_ev_metrics(
    p_over: float,
    p_under: float,
    over_odds: float = 1.91,  # -110 decimal
    under_odds: float = 1.91
) -> dict:
    """
    Calculate expected value and Kelly criterion.

    Args:
        p_over: Probability of over hitting
        p_under: Probability of under hitting
        over_odds: Decimal odds for over
        under_odds: Decimal odds for under

    Returns:
        EV, Kelly fraction, and recommendation strength
    """
    # Expected Value: EV = P(win) * profit - P(lose) * stake
    ev_over = p_over * (over_odds - 1) - (1 - p_over)
    ev_under = p_under * (under_odds - 1) - (1 - p_under)

    # Kelly Criterion: f* = (bp - q) / b where b=odds-1, p=win prob, q=lose prob
    b_over = over_odds - 1
    b_under = under_odds - 1

    kelly_over = (b_over * p_over - (1 - p_over)) / b_over if ev_over > 0 else 0
    kelly_under = (b_under * p_under - (1 - p_under)) / b_under if ev_under > 0 else 0

    # Fractional Kelly (25%)
    kelly_over_fractional = kelly_over * 0.25
    kelly_under_fractional = kelly_under * 0.25

    # Capped at 5% max
    kelly_over_capped = min(kelly_over_fractional, 0.05)
    kelly_under_capped = min(kelly_under_fractional, 0.05)

    return {
        "ev_over": round(ev_over, 4),
        "ev_under": round(ev_under, 4),
        "kelly_over_full": round(kelly_over, 4),
        "kelly_under_full": round(kelly_under, 4),
        "kelly_over_fractional": round(kelly_over_capped, 4),
        "kelly_under_fractional": round(kelly_under_capped, 4),
        "recommended_bet": "UNDER" if ev_under > ev_over else "OVER" if ev_over > 0 else "NO_BET",
        "best_ev": round(max(ev_over, ev_under), 4),
    }
```

### Phase 4: Integration with QuantAnalyst

**Modify**: `betting-agent/src/agents/quant_analyst.py`

```python
# Add import at top
from src.tools.monte_carlo import (
    monte_carlo_totals_simulation,
    scenario_analysis,
    sensitivity_analysis,
    calculate_ev_metrics
)

# In _calculate_totals_edge(), after LAYER 7 and before FINAL PROJECTION:

# ============================================================
# MONTE CARLO SIMULATION
# ============================================================
t1_expected = result["projection_breakdown"].get("t1_expected", projected_total / 2)
t2_expected = result["projection_breakdown"].get("t2_expected", projected_total / 2)

mc_result = monte_carlo_totals_simulation(
    t1_projection=t1_expected,
    t2_projection=t2_expected,
    t1_std_dev=t1_std if t1_std > 0 else 12.0,
    t2_std_dev=t2_std if t2_std > 0 else 12.0,
    total_line=float(total_line),
    n_sims=10000,
    correlation=0.5,
)

result["monte_carlo"] = mc_result
result["inputs_used"].append("monte_carlo_simulation")

# Use MC probability instead of z-score
if direction == "over":
    hit_prob = mc_result["p_over"]
else:
    hit_prob = mc_result["p_under"]

result["our_probability"] = hit_prob
result["our_probability_method"] = "monte_carlo"
result["z_score_probability"] = old_z_score_prob  # Keep for comparison

# Scenario analysis (optional, adds ~200ms)
if n_sims >= 10000:
    scenarios = scenario_analysis(
        t1_projection=t1_expected,
        t2_projection=t2_expected,
        t1_std_dev=t1_std if t1_std > 0 else 12.0,
        t2_std_dev=t2_std if t2_std > 0 else 12.0,
        total_line=float(total_line),
    )
    result["scenarios"] = scenarios

# EV metrics
ev_metrics = calculate_ev_metrics(
    p_over=mc_result["p_over"],
    p_under=mc_result["p_under"],
)
result["ev_metrics"] = ev_metrics
```

---

## Output Structure

```python
{
    # Existing v3 output...
    "projected_total": 233.7,
    "direction": "under",
    "total_line": 240.0,

    # NEW: Monte Carlo results
    "monte_carlo": {
        "n_simulations": 10000,
        "p_over": 0.3521,
        "p_under": 0.6479,
        "p_push": 0.0000,
        "se_under": 0.0048,
        "ci_95_under": [0.6385, 0.6573],
        "mean_total": 233.8,
        "median_total": 233.5,
        "std_total": 18.4,
        "percentiles": {
            "p5": 202.1,
            "p10": 210.3,
            "p25": 221.4,
            "p50": 233.5,
            "p75": 245.9,
            "p90": 258.2,
            "p95": 265.7
        },
        "ot_games_pct": 0.0587,
        "correlation_used": 0.5
    },

    # NEW: Scenario analysis
    "scenarios": {
        "base": {"p_under": 0.6479},
        "high_pace": {"p_under": 0.5821},
        "low_pace": {"p_under": 0.7102},
        "high_variance": {"p_under": 0.6012},
        "low_variance": {"p_under": 0.7234}
    },

    # NEW: EV metrics
    "ev_metrics": {
        "ev_under": 0.0654,
        "ev_over": -0.0721,
        "kelly_under_fractional": 0.0187,
        "recommended_bet": "UNDER",
        "best_ev": 0.0654
    }
}
```

---

## Simulation Tiers

| Tier | Simulations | Time | Use Case |
|------|-------------|------|----------|
| Quick | 1,000 | ~10ms | Real-time API responses |
| Standard | 10,000 | ~50ms | Normal analysis |
| Deep | 100,000 | ~500ms | High-stakes decisions |
| Research | 1,000,000 | ~5s | Model validation |

---

## Validation Checklist

- [ ] Core MC function with correlated sampling
- [ ] Overtime discrete event modeling
- [ ] 95% confidence intervals via standard error
- [ ] Percentile distribution output
- [ ] Scenario analysis (8 scenarios)
- [ ] Sensitivity analysis (4 parameters)
- [ ] Expected value calculation
- [ ] Kelly criterion integration
- [ ] Integration with v3 model
- [ ] Unit tests for MC functions
- [ ] Performance benchmarks

---

## Dependencies

```toml
# In pyproject.toml
[project]
dependencies = [
    # existing...
    "numpy>=1.24.0",
]
```

---

## Example Output (CLE @ ATL Under 240)

```
MONTE CARLO SIMULATION: 10,000 runs
================================================
P(Under 240): 64.79% [95% CI: 63.85% - 65.73%]
P(Over 240):  35.21%

Distribution:
  5th percentile:  202.1
  25th percentile: 221.4
  50th percentile: 233.5 (median)
  75th percentile: 245.9
  95th percentile: 265.7

Scenarios:
  Base case:      64.79% under
  High-pace game: 58.21% under
  Low-pace game:  71.02% under
  High variance:  60.12% under

Expected Value @ -110 odds: +6.54%
Kelly Fraction (25%): 1.87% of bankroll
Recommendation: STRONG_BET UNDER
```

---

## Implementation Complete (2025-11-28)

### Files Created/Modified:
- **NEW**: `betting-agent/src/tools/monte_carlo.py` - Core MC functions
- **MODIFIED**: `betting-agent/src/agents/quant_analyst.py` - Integration

### Validation Results (CLE @ ATL Under 240):

```
MONTE CARLO SIMULATION (10,000 runs):
  P(Under): 58.45%
  P(Over):  41.55%
  95% CI:   [57.48% - 59.42%]
  Mean Total: 233.2
  Std Total:  31.6
  OT Games:   6.2%

PERCENTILES:
  5th:  181.2
  25th: 211.6
  50th: 233.5 (median)
  75th: 254.5
  95th: 285.1

SCENARIO ANALYSIS:
  base:          P(Under)=58.4%
  high_pace:     P(Under)=51.0%
  low_pace:      P(Under)=65.5%
  high_variance: P(Under)=56.4%
  low_variance:  P(Under)=62.2%
  Spread: 14.6%

EV METRICS:
  EV Under:  11.64%
  Edge:      6.09%
  Kelly:     3.20% of bankroll

MC vs Z-Score:
  MC Probability:     58.45%
  Z-Score Probability: 63.61%

RECOMMENDATION: STRONG_BET_UNDER
```

### Key Insights:
1. MC probability (58.45%) is more conservative than Z-score (63.61%)
2. Scenario spread of 14.6% shows moderate sensitivity to conditions
3. High-pace scenario drops under probability to 51%
4. Low-variance scenario increases confidence to 62.2%
5. OT modeling adds realistic 6% overtime rate

### Future Enhancements:
- Add sensitivity analysis to output
- Unit tests for MC functions
- Performance benchmarks
- Live odds integration for real-time EV
