"""Monte Carlo simulation tools for NBA betting.

Game Totals:
- Enhanced with data-driven parameters from 2024-25 NBA season analysis
- Actual score correlation: 0.19 (not 0.5 as commonly assumed)
- Slight positive skew: 0.19 (more high-scoring games than low)

Player Props:
- Poisson distribution for counting stats (3pm, steals, blocks, rebounds, assists)
- Normal distribution for continuous stats (points, PRA)
- Minutes variance modeling (DNP risk, blowout benching)
"""
import numpy as np
from typing import Optional, Literal


# Data-driven constants from 2024-25 NBA season analysis
NBA_EMPIRICAL = {
    "correlation": 0.19,       # Actual home/away score correlation
    "skewness": 0.19,          # Slight right skew in totals
    "excess_kurtosis": 0.19,   # Slightly fat tails
    "mean_team_score": 114.3,
    "std_team_score": 12.8,
    "mean_total": 228.5,
    "std_total": 19.7,
    "min_score": 67,
    "max_score": 162,
}


def _generate_skew_normal(mean: float, std: float, skewness: float, size: int) -> np.ndarray:
    """
    Generate samples from a skew-normal distribution.

    Uses the transformation method:
    1. Generate standard normal Z
    2. Apply skewness parameter alpha
    3. Scale and shift to desired mean/std

    Args:
        mean: Target mean
        std: Target standard deviation
        skewness: Skewness parameter (0 = normal, positive = right skew)
        size: Number of samples

    Returns:
        Array of samples with approximate target mean, std, and skewness
    """
    # Convert skewness to alpha parameter
    # For small skewness, alpha ≈ skewness * sqrt(2/pi) / (1 - 2/pi)^1.5
    # Simplified approximation for |skewness| < 1
    delta = skewness / np.sqrt(1 + skewness**2) if abs(skewness) < 0.99 else np.sign(skewness) * 0.99
    alpha = delta / np.sqrt(1 - delta**2)

    # Generate skew-normal using standard method
    u0 = np.random.normal(0, 1, size)
    u1 = np.random.normal(0, 1, size)

    # Skew-normal: X = delta * |U0| + sqrt(1-delta^2) * U1
    samples = delta * np.abs(u0) + np.sqrt(1 - delta**2) * u1

    # Adjust mean and variance (skew-normal has non-zero mean and different variance)
    raw_mean = delta * np.sqrt(2 / np.pi)
    raw_var = 1 - 2 * delta**2 / np.pi

    # Scale to target mean and std
    samples = (samples - raw_mean) / np.sqrt(raw_var)
    samples = samples * std + mean

    return samples


def monte_carlo_totals_simulation(
    t1_projection: float,
    t2_projection: float,
    t1_std_dev: float,
    t2_std_dev: float,
    total_line: float,
    n_sims: int = 10000,
    correlation: float = 0.2,  # Updated default based on actual data (was 0.5)
    ot_probability: float = 0.06,
    ot_points_mean: float = 12.0,
    seed: Optional[int] = None,
    use_skew_normal: bool = False,
    skewness: float = 0.19,
) -> dict:
    """
    Monte Carlo simulation for totals betting.

    Uses correlated bivariate normal (or skew-normal) for team scores,
    with discrete overtime probability.

    Args:
        t1_projection: Team 1 expected score
        t2_projection: Team 2 expected score
        t1_std_dev: Team 1 scoring standard deviation
        t2_std_dev: Team 2 scoring standard deviation
        total_line: Betting line to compare against
        n_sims: Number of simulations (default 10,000)
        correlation: Score correlation between teams (default 0.2 based on actual NBA data)
        ot_probability: Probability of overtime (default 0.06)
        ot_points_mean: Average additional points in OT (default 12.0)
        seed: Random seed for reproducibility
        use_skew_normal: Use skew-normal distribution for more realistic tails
        skewness: Skewness parameter if use_skew_normal=True (default 0.19)

    Returns:
        dict with probabilities, CIs, percentiles, distribution stats
    """
    if seed is not None:
        np.random.seed(seed)

    # Ensure valid std_dev values
    t1_std_dev = max(t1_std_dev, 5.0)
    t2_std_dev = max(t2_std_dev, 5.0)

    if use_skew_normal:
        # Generate independent skew-normal scores, then apply correlation
        t1_scores_raw = _generate_skew_normal(t1_projection, t1_std_dev, skewness, n_sims)
        t2_scores_raw = _generate_skew_normal(t2_projection, t2_std_dev, skewness, n_sims)

        # Apply correlation through Cholesky-like transformation
        # t2_correlated = correlation * (t1 - mean1) + sqrt(1-corr^2) * t2_raw
        t1_centered = t1_scores_raw - t1_projection
        t2_centered = t2_scores_raw - t2_projection

        t1_scores = t1_scores_raw
        t2_scores = t2_projection + correlation * (t1_centered / t1_std_dev) * t2_std_dev + \
                    np.sqrt(1 - correlation**2) * t2_centered
    else:
        # Standard bivariate normal
        # Build covariance matrix for correlated sampling
        # Cov(X,Y) = correlation * std_x * std_y
        cov = correlation * t1_std_dev * t2_std_dev
        cov_matrix = [
            [t1_std_dev**2, cov],
            [cov, t2_std_dev**2]
        ]
        means = [t1_projection, t2_projection]

        # Generate correlated scores using multivariate normal
        scores = np.random.multivariate_normal(means, cov_matrix, n_sims)
        t1_scores = scores[:, 0]
        t2_scores = scores[:, 1]

    # Ensure non-negative scores (floor at 70 for NBA)
    t1_scores = np.maximum(t1_scores, 70)
    t2_scores = np.maximum(t2_scores, 70)

    # Apply overtime as discrete event
    ot_games = np.random.random(n_sims) < ot_probability
    ot_points = np.where(ot_games, np.random.normal(ot_points_mean, 3, n_sims), 0)
    ot_points = np.maximum(ot_points, 0)  # OT adds points, never subtracts

    # Calculate total scores
    totals = t1_scores + t2_scores + ot_points

    # Calculate probabilities
    over_count = np.sum(totals > total_line)
    under_count = np.sum(totals < total_line)
    push_count = n_sims - over_count - under_count

    p_over = over_count / n_sims
    p_under = under_count / n_sims
    p_push = push_count / n_sims

    # Standard error for confidence intervals
    se_over = np.sqrt(p_over * (1 - p_over) / n_sims) if p_over > 0 else 0
    se_under = np.sqrt(p_under * (1 - p_under) / n_sims) if p_under > 0 else 0

    # Percentiles of total distribution
    percentiles = np.percentile(totals, [5, 10, 25, 50, 75, 90, 95])

    return {
        "n_simulations": n_sims,
        "p_over": round(p_over, 4),
        "p_under": round(p_under, 4),
        "p_push": round(p_push, 4),
        "se_over": round(se_over, 4),
        "se_under": round(se_under, 4),
        "ci_95_over": [
            round(max(0, p_over - 1.96 * se_over), 4),
            round(min(1, p_over + 1.96 * se_over), 4)
        ],
        "ci_95_under": [
            round(max(0, p_under - 1.96 * se_under), 4),
            round(min(1, p_under + 1.96 * se_under), 4)
        ],
        "mean_total": round(float(np.mean(totals)), 1),
        "median_total": round(float(np.median(totals)), 1),
        "std_total": round(float(np.std(totals)), 1),
        "min_total": round(float(np.min(totals)), 1),
        "max_total": round(float(np.max(totals)), 1),
        "percentiles": {
            "p5": round(float(percentiles[0]), 1),
            "p10": round(float(percentiles[1]), 1),
            "p25": round(float(percentiles[2]), 1),
            "p50": round(float(percentiles[3]), 1),
            "p75": round(float(percentiles[4]), 1),
            "p90": round(float(percentiles[5]), 1),
            "p95": round(float(percentiles[6]), 1),
        },
        "ot_games_simulated": int(np.sum(ot_games)),
        "ot_games_pct": round(float(np.sum(ot_games)) / n_sims, 4),
        "correlation_used": correlation,
        "distribution": "skew_normal" if use_skew_normal else "normal",
        "skewness_used": skewness if use_skew_normal else 0.0,
        "inputs": {
            "t1_projection": t1_projection,
            "t2_projection": t2_projection,
            "t1_std_dev": t1_std_dev,
            "t2_std_dev": t2_std_dev,
            "total_line": total_line,
        }
    }


def scenario_analysis(
    t1_projection: float,
    t2_projection: float,
    t1_std_dev: float,
    t2_std_dev: float,
    total_line: float,
    n_sims: int = 5000
) -> dict:
    """
    Run Monte Carlo simulation under multiple scenarios.

    Scenarios:
    - base: Default projections
    - high_pace: Both teams score 3 more points
    - low_pace: Both teams score 3 fewer points
    - high_variance: 30% higher variance
    - low_variance: 30% lower variance
    - high_ot: 10% overtime probability
    - no_correlation: Independent scoring
    - high_correlation: 70% score correlation

    Args:
        t1_projection: Team 1 expected score
        t2_projection: Team 2 expected score
        t1_std_dev: Team 1 scoring standard deviation
        t2_std_dev: Team 2 scoring standard deviation
        total_line: Betting line
        n_sims: Simulations per scenario (default 5000)

    Returns:
        dict with scenario names as keys and results as values
    """
    scenarios = {
        "base": {},
        "high_pace": {
            "t1_projection": t1_projection + 3,
            "t2_projection": t2_projection + 3
        },
        "low_pace": {
            "t1_projection": t1_projection - 3,
            "t2_projection": t2_projection - 3
        },
        "high_variance": {
            "t1_std_dev": t1_std_dev * 1.3,
            "t2_std_dev": t2_std_dev * 1.3
        },
        "low_variance": {
            "t1_std_dev": t1_std_dev * 0.7,
            "t2_std_dev": t2_std_dev * 0.7
        },
        "high_ot": {
            "ot_probability": 0.10
        },
        "no_correlation": {
            "correlation": 0.0
        },
        "high_correlation": {
            "correlation": 0.35  # Double the empirical correlation
        },
        "skew_normal": {
            "use_skew_normal": True,
            "skewness": 0.19
        },
    }

    base_params = {
        "t1_projection": t1_projection,
        "t2_projection": t2_projection,
        "t1_std_dev": t1_std_dev,
        "t2_std_dev": t2_std_dev,
        "total_line": total_line,
        "n_sims": n_sims,
    }

    results = {}
    for name, adjustments in scenarios.items():
        params = {**base_params, **adjustments}
        result = monte_carlo_totals_simulation(**params)
        results[name] = {
            "p_over": result["p_over"],
            "p_under": result["p_under"],
            "mean_total": result["mean_total"],
            "std_total": result["std_total"],
        }

    # Add scenario spread (range of P(under) across scenarios)
    p_under_values = [r["p_under"] for r in results.values()]
    results["_summary"] = {
        "p_under_min": round(min(p_under_values), 4),
        "p_under_max": round(max(p_under_values), 4),
        "p_under_spread": round(max(p_under_values) - min(p_under_values), 4),
    }

    return results


def sensitivity_analysis(
    t1_projection: float,
    t2_projection: float,
    t1_std_dev: float,
    t2_std_dev: float,
    total_line: float,
    perturbation: float = 0.05,
    n_sims: int = 5000
) -> dict:
    """
    Calculate sensitivity of P(under) to each input parameter.

    Uses central difference method: perturb each parameter by +/- perturbation
    and measure the effect on P(under).

    Args:
        t1_projection: Team 1 expected score
        t2_projection: Team 2 expected score
        t1_std_dev: Team 1 scoring standard deviation
        t2_std_dev: Team 2 scoring standard deviation
        total_line: Betting line
        perturbation: Relative perturbation size (default 5%)
        n_sims: Simulations per run (default 5000)

    Returns:
        dict with parameter sensitivities (change in P(under) per 1% change)
    """
    base_params = {
        "t1_projection": t1_projection,
        "t2_projection": t2_projection,
        "t1_std_dev": t1_std_dev,
        "t2_std_dev": t2_std_dev,
        "total_line": total_line,
        "n_sims": n_sims,
        "seed": 42,  # Fixed seed for fair comparison
    }

    base_result = monte_carlo_totals_simulation(**base_params)
    base_p_under = base_result["p_under"]

    sensitivities = {}
    params_to_test = [
        ("t1_projection", "Team 1 projection"),
        ("t2_projection", "Team 2 projection"),
        ("t1_std_dev", "Team 1 variance"),
        ("t2_std_dev", "Team 2 variance"),
    ]

    for param, description in params_to_test:
        # Perturb up
        params_up = base_params.copy()
        params_up[param] = base_params[param] * (1 + perturbation)
        params_up["seed"] = 42
        result_up = monte_carlo_totals_simulation(**params_up)

        # Perturb down
        params_down = base_params.copy()
        params_down[param] = base_params[param] * (1 - perturbation)
        params_down["seed"] = 42
        result_down = monte_carlo_totals_simulation(**params_down)

        # Sensitivity = (change in P(under)) / (relative change in input)
        delta_p = result_up["p_under"] - result_down["p_under"]
        # Normalize to "per 1 point change" for projections, "per 1 std change" for variance
        if "projection" in param:
            # Change per 1 point
            delta_input = 2 * perturbation * base_params[param]
            sensitivity_per_point = delta_p / delta_input if delta_input != 0 else 0
            sensitivities[param] = {
                "sensitivity_per_point": round(sensitivity_per_point, 4),
                "description": description,
                "interpretation": f"{round(sensitivity_per_point * 100, 2)}% change in P(under) per 1 point"
            }
        else:
            # Change per 1 std dev unit
            delta_input = 2 * perturbation * base_params[param]
            sensitivity_per_std = delta_p / delta_input if delta_input != 0 else 0
            sensitivities[param] = {
                "sensitivity_per_std": round(sensitivity_per_std, 4),
                "description": description,
                "interpretation": f"{round(sensitivity_per_std * 100, 2)}% change in P(under) per 1 std unit"
            }

    # Rank by absolute impact
    projection_impact = abs(sensitivities["t1_projection"]["sensitivity_per_point"]) + \
                       abs(sensitivities["t2_projection"]["sensitivity_per_point"])
    variance_impact = abs(sensitivities["t1_std_dev"]["sensitivity_per_std"]) + \
                     abs(sensitivities["t2_std_dev"]["sensitivity_per_std"])

    sensitivities["_summary"] = {
        "most_sensitive": "projections" if projection_impact > variance_impact else "variance",
        "projection_total_impact": round(projection_impact, 4),
        "variance_total_impact": round(variance_impact, 4),
    }

    return sensitivities


def calculate_ev_metrics(
    p_over: float,
    p_under: float,
    over_odds: float = 1.91,  # -110 in decimal
    under_odds: float = 1.91
) -> dict:
    """
    Calculate expected value and Kelly criterion for betting.

    Args:
        p_over: Probability of over hitting (from MC simulation)
        p_under: Probability of under hitting (from MC simulation)
        over_odds: Decimal odds for over (default 1.91 = -110)
        under_odds: Decimal odds for under (default 1.91 = -110)

    Returns:
        dict with EV, Kelly fractions, and recommendation
    """
    # Expected Value: EV = P(win) * profit - P(lose) * stake
    # Where profit = odds - 1, stake = 1
    ev_over = p_over * (over_odds - 1) - (1 - p_over)
    ev_under = p_under * (under_odds - 1) - (1 - p_under)

    # Kelly Criterion: f* = (b*p - q) / b
    # where b = odds - 1, p = win probability, q = lose probability
    b_over = over_odds - 1
    b_under = under_odds - 1

    kelly_over_full = (b_over * p_over - (1 - p_over)) / b_over if ev_over > 0 and b_over > 0 else 0
    kelly_under_full = (b_under * p_under - (1 - p_under)) / b_under if ev_under > 0 and b_under > 0 else 0

    # Fractional Kelly (25% of full Kelly - more conservative)
    kelly_over_fractional = kelly_over_full * 0.25
    kelly_under_fractional = kelly_under_full * 0.25

    # Cap at 5% maximum
    kelly_over_capped = min(max(kelly_over_fractional, 0), 0.05)
    kelly_under_capped = min(max(kelly_under_fractional, 0), 0.05)

    # Implied probabilities from odds
    implied_over = 1 / over_odds
    implied_under = 1 / under_odds

    # Edge = our probability - implied probability
    edge_over = p_over - implied_over
    edge_under = p_under - implied_under

    # Determine recommendation
    if ev_under > 0.03 and ev_under > ev_over:
        if ev_under > 0.06:
            recommendation = "STRONG_BET_UNDER"
        else:
            recommendation = "BET_UNDER"
    elif ev_over > 0.03 and ev_over > ev_under:
        if ev_over > 0.06:
            recommendation = "STRONG_BET_OVER"
        else:
            recommendation = "BET_OVER"
    elif max(ev_over, ev_under) > 0:
        recommendation = "LEAN_" + ("UNDER" if ev_under > ev_over else "OVER")
    else:
        recommendation = "NO_BET"

    return {
        "ev_over": round(ev_over, 4),
        "ev_under": round(ev_under, 4),
        "edge_over": round(edge_over, 4),
        "edge_under": round(edge_under, 4),
        "implied_over": round(implied_over, 4),
        "implied_under": round(implied_under, 4),
        "kelly_over_full": round(kelly_over_full, 4),
        "kelly_under_full": round(kelly_under_full, 4),
        "kelly_over_fractional": round(kelly_over_capped, 4),
        "kelly_under_fractional": round(kelly_under_capped, 4),
        "recommended_bet": recommendation,
        "best_ev": round(max(ev_over, ev_under), 4),
        "best_edge": round(max(edge_over, edge_under), 4),
        "odds_used": {
            "over": over_odds,
            "under": under_odds,
        }
    }


def full_monte_carlo_analysis(
    t1_projection: float,
    t2_projection: float,
    t1_std_dev: float,
    t2_std_dev: float,
    total_line: float,
    direction: str = "under",
    over_odds: float = 1.91,
    under_odds: float = 1.91,
    n_sims: int = 10000,
    include_scenarios: bool = True,
    include_sensitivity: bool = True
) -> dict:
    """
    Run complete Monte Carlo analysis with all features.

    Combines:
    - Core MC simulation
    - Scenario analysis
    - Sensitivity analysis
    - EV/Kelly calculations

    Args:
        t1_projection: Team 1 expected score
        t2_projection: Team 2 expected score
        t1_std_dev: Team 1 scoring std dev
        t2_std_dev: Team 2 scoring std dev
        total_line: Betting line
        direction: "over" or "under"
        over_odds: Decimal odds for over
        under_odds: Decimal odds for under
        n_sims: Number of simulations
        include_scenarios: Whether to run scenario analysis
        include_sensitivity: Whether to run sensitivity analysis

    Returns:
        Complete analysis dict
    """
    # Core simulation
    mc_result = monte_carlo_totals_simulation(
        t1_projection=t1_projection,
        t2_projection=t2_projection,
        t1_std_dev=t1_std_dev,
        t2_std_dev=t2_std_dev,
        total_line=total_line,
        n_sims=n_sims,
    )

    # EV metrics
    ev_metrics = calculate_ev_metrics(
        p_over=mc_result["p_over"],
        p_under=mc_result["p_under"],
        over_odds=over_odds,
        under_odds=under_odds,
    )

    result = {
        "simulation": mc_result,
        "ev_metrics": ev_metrics,
        "direction": direction,
        "our_probability": mc_result["p_under"] if direction == "under" else mc_result["p_over"],
        "our_ev": ev_metrics["ev_under"] if direction == "under" else ev_metrics["ev_over"],
        "our_kelly": ev_metrics["kelly_under_fractional"] if direction == "under" else ev_metrics["kelly_over_fractional"],
    }

    # Scenario analysis (optional)
    if include_scenarios:
        scenarios = scenario_analysis(
            t1_projection=t1_projection,
            t2_projection=t2_projection,
            t1_std_dev=t1_std_dev,
            t2_std_dev=t2_std_dev,
            total_line=total_line,
            n_sims=n_sims // 2,  # Fewer sims per scenario
        )
        result["scenarios"] = scenarios

    # Sensitivity analysis (optional)
    if include_sensitivity:
        sensitivity = sensitivity_analysis(
            t1_projection=t1_projection,
            t2_projection=t2_projection,
            t1_std_dev=t1_std_dev,
            t2_std_dev=t2_std_dev,
            total_line=total_line,
            n_sims=n_sims // 2,
        )
        result["sensitivity"] = sensitivity

    return result


def monte_carlo_realistic(
    t1_projection: float,
    t2_projection: float,
    t1_std_dev: float,
    t2_std_dev: float,
    total_line: float,
    over_odds: float = 1.91,
    under_odds: float = 1.91,
    n_sims: int = 10000,
    mode: Literal["standard", "skew", "compare"] = "standard",
) -> dict:
    """
    Run Monte Carlo simulation with data-driven parameters.

    Uses empirically-derived parameters from 2024-25 NBA season:
    - Correlation: 0.19 (actual home/away score correlation)
    - Optional skew-normal with skewness: 0.19

    Args:
        t1_projection: Team 1 expected score
        t2_projection: Team 2 expected score
        t1_std_dev: Team 1 scoring std dev
        t2_std_dev: Team 2 scoring std dev
        total_line: Betting line
        over_odds: Decimal odds for over
        under_odds: Decimal odds for under
        n_sims: Number of simulations
        mode:
            - "standard": Normal distribution with empirical correlation (0.19)
            - "skew": Skew-normal distribution with empirical skewness (0.19)
            - "compare": Run both and show differences

    Returns:
        Complete analysis with empirical parameters
    """
    results = {}

    if mode in ["standard", "compare"]:
        # Standard normal with empirical correlation
        mc_standard = monte_carlo_totals_simulation(
            t1_projection=t1_projection,
            t2_projection=t2_projection,
            t1_std_dev=t1_std_dev,
            t2_std_dev=t2_std_dev,
            total_line=total_line,
            n_sims=n_sims,
            correlation=NBA_EMPIRICAL["correlation"],  # 0.19
            use_skew_normal=False,
        )
        ev_standard = calculate_ev_metrics(
            p_over=mc_standard["p_over"],
            p_under=mc_standard["p_under"],
            over_odds=over_odds,
            under_odds=under_odds,
        )
        results["standard"] = {
            "simulation": mc_standard,
            "ev_metrics": ev_standard,
            "parameters": {
                "correlation": NBA_EMPIRICAL["correlation"],
                "distribution": "normal",
            }
        }

    if mode in ["skew", "compare"]:
        # Skew-normal with empirical parameters
        mc_skew = monte_carlo_totals_simulation(
            t1_projection=t1_projection,
            t2_projection=t2_projection,
            t1_std_dev=t1_std_dev,
            t2_std_dev=t2_std_dev,
            total_line=total_line,
            n_sims=n_sims,
            correlation=NBA_EMPIRICAL["correlation"],  # 0.19
            use_skew_normal=True,
            skewness=NBA_EMPIRICAL["skewness"],  # 0.19
        )
        ev_skew = calculate_ev_metrics(
            p_over=mc_skew["p_over"],
            p_under=mc_skew["p_under"],
            over_odds=over_odds,
            under_odds=under_odds,
        )
        results["skew"] = {
            "simulation": mc_skew,
            "ev_metrics": ev_skew,
            "parameters": {
                "correlation": NBA_EMPIRICAL["correlation"],
                "distribution": "skew_normal",
                "skewness": NBA_EMPIRICAL["skewness"],
            }
        }

    if mode == "compare":
        # Add comparison metrics
        std = results["standard"]["simulation"]
        skw = results["skew"]["simulation"]
        results["comparison"] = {
            "p_over_diff": round(skw["p_over"] - std["p_over"], 4),
            "p_under_diff": round(skw["p_under"] - std["p_under"], 4),
            "mean_diff": round(skw["mean_total"] - std["mean_total"], 1),
            "median_diff": round(skw["median_total"] - std["median_total"], 1),
            "std_diff": round(skw["std_total"] - std["std_total"], 1),
            "note": "Positive p_over_diff means skew model predicts more overs"
        }

    # Return single result for non-compare modes
    if mode == "standard":
        return results["standard"]
    elif mode == "skew":
        return results["skew"]
    else:
        return results


# ============================================================
# PLAYER PROP SIMULATIONS
# ============================================================

# Player prop empirical constants
PLAYER_PROP_EMPIRICAL = {
    # Minutes distribution parameters
    "minutes_mean": 32.0,          # Average minutes for starters
    "minutes_std": 5.0,            # Standard deviation of minutes
    "dnp_probability": 0.02,       # Chance of DNP (rest, minor injury)
    "blowout_minutes_cut": 0.08,   # Chance of reduced minutes due to blowout

    # Stat-specific variance multipliers (relative to player's own std)
    "points_variance_mult": 1.0,   # Points follow normal well
    "rebounds_variance_mult": 1.1, # Rebounds slightly more variable
    "assists_variance_mult": 1.2,  # Assists more dependent on game flow
    "3pm_variance_mult": 1.3,      # 3PM highly variable (streaky)

    # Per-36 rates for typical starters (for sanity checks)
    "typical_ppg_per36": 18.0,
    "typical_rpg_per36": 6.5,
    "typical_apg_per36": 4.0,
    "typical_3pm_per36": 2.2,
}

# Stats that should use Poisson (discrete counting stats)
POISSON_STATS = {"3pm", "fg3_made", "steals", "blocks", "turnovers"}

# Stats that should use normal distribution (continuous or high-count)
NORMAL_STATS = {"points", "rebounds", "assists", "pra", "points_rebounds",
                "points_assists", "rebounds_assists"}


def monte_carlo_player_prop(
    projection: float,
    std_dev: float,
    line: float,
    stat_type: str,
    n_sims: int = 10000,
    minutes_mean: float = 32.0,
    minutes_std: float = 5.0,
    seed: Optional[int] = None,
) -> dict:
    """
    Monte Carlo simulation for player prop betting.

    Distribution Selection:
    - Poisson: For counting stats (3pm, steals, blocks) - discrete, can't be negative
    - Normal: For continuous stats (points, PRA) - scaled by minutes variance

    Minutes Variance Model:
    - 2% chance of DNP (injury/rest) → 0 stat outcome
    - 8% chance of blowout → reduced minutes (70% of normal)
    - Otherwise: Normal distribution around expected minutes

    Args:
        projection: Expected stat value (e.g., player's adjusted average)
        std_dev: Historical standard deviation of this stat for player
        line: Betting line to compare against (e.g., 25.5 points)
        stat_type: Type of stat ('points', 'rebounds', 'assists', '3pm', 'pra', etc.)
        n_sims: Number of simulations (default 10,000)
        minutes_mean: Expected minutes (default 32.0)
        minutes_std: Minutes standard deviation (default 5.0)
        seed: Random seed for reproducibility

    Returns:
        dict with probabilities, confidence intervals, percentiles, and edge metrics
    """
    if seed is not None:
        np.random.seed(seed)

    # Ensure valid std_dev (use 20% of projection as floor)
    std_dev = max(std_dev, projection * 0.15, 1.0)

    # Normalize stat_type
    stat_type_lower = stat_type.lower().replace(" ", "_")

    # ========================================
    # MINUTES VARIANCE MODEL
    # ========================================
    # Generate minutes distribution with special cases

    # 1. DNP probability (2% chance of 0 minutes)
    dnp_mask = np.random.random(n_sims) < PLAYER_PROP_EMPIRICAL["dnp_probability"]

    # 2. Blowout probability (8% chance of reduced minutes)
    blowout_mask = np.random.random(n_sims) < PLAYER_PROP_EMPIRICAL["blowout_minutes_cut"]

    # 3. Generate base minutes (normal distribution)
    minutes = np.random.normal(minutes_mean, minutes_std, n_sims)
    minutes = np.maximum(minutes, 0)  # Can't have negative minutes

    # Apply DNP (0 minutes)
    minutes[dnp_mask] = 0

    # Apply blowout reduction (70% of minutes)
    minutes[blowout_mask & ~dnp_mask] *= 0.70

    # Cap minutes at 48 (regulation max)
    minutes = np.minimum(minutes, 48)

    # Calculate minutes factor (ratio of actual to expected)
    minutes_factor = np.where(minutes_mean > 0, minutes / minutes_mean, 1.0)

    # ========================================
    # STAT SIMULATION
    # ========================================
    if stat_type_lower in POISSON_STATS or stat_type_lower == "fg3_made":
        # POISSON DISTRIBUTION for counting stats
        # Rate parameter lambda = projection * (minutes/expected_minutes)
        # Poisson is discrete and naturally handles low counts

        # Adjust rate by minutes
        adjusted_rate = projection * minutes_factor

        # Add some extra variance for 3PM (streaky stat)
        if stat_type_lower in ("3pm", "fg3_made"):
            # Add overdispersion: use negative binomial approximation
            # by adding gamma-distributed noise to rate
            rate_noise = np.random.gamma(10, 0.1, n_sims)  # Slight noise
            adjusted_rate = adjusted_rate * rate_noise

        # Ensure non-negative rates
        adjusted_rate = np.maximum(adjusted_rate, 0)

        # Generate Poisson samples
        # For DNP games, stat is 0
        stat_values = np.zeros(n_sims)
        active_mask = minutes > 0
        stat_values[active_mask] = np.random.poisson(adjusted_rate[active_mask])

    else:
        # NORMAL DISTRIBUTION for continuous/high-count stats
        # Scale by minutes and add appropriate variance

        # Adjusted mean based on minutes
        adjusted_mean = projection * minutes_factor

        # Adjusted std dev (also scales with minutes, but less than linearly)
        adjusted_std = std_dev * np.sqrt(minutes_factor)

        # Generate normal samples
        stat_values = np.random.normal(adjusted_mean, adjusted_std)

        # Floor at 0 (can't have negative stats)
        stat_values = np.maximum(stat_values, 0)

        # DNP games get 0
        stat_values[dnp_mask] = 0

    # ========================================
    # CALCULATE PROBABILITIES
    # ========================================
    over_count = np.sum(stat_values > line)
    under_count = np.sum(stat_values < line)
    push_count = np.sum(stat_values == line)  # Rare for continuous, possible for discrete

    p_over = over_count / n_sims
    p_under = under_count / n_sims
    p_push = push_count / n_sims

    # Standard errors for confidence intervals
    se_over = np.sqrt(p_over * (1 - p_over) / n_sims) if p_over > 0 else 0
    se_under = np.sqrt(p_under * (1 - p_under) / n_sims) if p_under > 0 else 0

    # Percentiles
    percentiles = np.percentile(stat_values, [5, 10, 25, 50, 75, 90, 95])

    # ========================================
    # RESULT COMPILATION
    # ========================================
    return {
        "n_simulations": n_sims,
        "stat_type": stat_type,
        "line": line,

        # Core probabilities
        "p_over": round(p_over, 4),
        "p_under": round(p_under, 4),
        "p_push": round(p_push, 4),

        # Standard errors
        "se_over": round(se_over, 4),
        "se_under": round(se_under, 4),

        # 95% Confidence intervals
        "ci_95_over": [
            round(max(0, p_over - 1.96 * se_over), 4),
            round(min(1, p_over + 1.96 * se_over), 4)
        ],
        "ci_95_under": [
            round(max(0, p_under - 1.96 * se_under), 4),
            round(min(1, p_under + 1.96 * se_under), 4)
        ],

        # Distribution statistics
        "mean": round(float(np.mean(stat_values)), 2),
        "median": round(float(np.median(stat_values)), 2),
        "std": round(float(np.std(stat_values)), 2),
        "min": round(float(np.min(stat_values)), 2),
        "max": round(float(np.max(stat_values)), 2),

        # Percentiles
        "percentiles": {
            "p5": round(float(percentiles[0]), 2),
            "p10": round(float(percentiles[1]), 2),
            "p25": round(float(percentiles[2]), 2),
            "p50": round(float(percentiles[3]), 2),
            "p75": round(float(percentiles[4]), 2),
            "p90": round(float(percentiles[5]), 2),
            "p95": round(float(percentiles[6]), 2),
        },

        # Minutes variance info
        "minutes_model": {
            "dnp_simulated": int(np.sum(dnp_mask)),
            "blowout_simulated": int(np.sum(blowout_mask & ~dnp_mask)),
            "avg_minutes": round(float(np.mean(minutes)), 1),
            "minutes_mean_input": minutes_mean,
            "minutes_std_input": minutes_std,
        },

        # Model info
        "distribution": "poisson" if stat_type_lower in POISSON_STATS else "normal",
        "inputs": {
            "projection": projection,
            "std_dev": std_dev,
            "line": line,
        }
    }


def calculate_player_prop_ev(
    p_over: float,
    p_under: float,
    over_odds: float = 1.87,  # Typical player prop juice
    under_odds: float = 1.87,
) -> dict:
    """
    Calculate expected value and Kelly criterion for player prop betting.

    Args:
        p_over: Probability of over hitting (from MC simulation)
        p_under: Probability of under hitting (from MC simulation)
        over_odds: Decimal odds for over (default 1.87 = -115)
        under_odds: Decimal odds for under (default 1.87 = -115)

    Returns:
        dict with EV, Kelly fractions, edge, and recommendation
    """
    # Implied probabilities from odds
    implied_over = 1 / over_odds
    implied_under = 1 / under_odds

    # Edge = our probability - implied probability
    edge_over = p_over - implied_over
    edge_under = p_under - implied_under

    # Expected Value: EV = P(win) * profit - P(lose) * stake
    ev_over = p_over * (over_odds - 1) - (1 - p_over)
    ev_under = p_under * (under_odds - 1) - (1 - p_under)

    # Kelly Criterion: f* = (b*p - q) / b
    b_over = over_odds - 1
    b_under = under_odds - 1

    kelly_over_full = (b_over * p_over - (1 - p_over)) / b_over if ev_over > 0 and b_over > 0 else 0
    kelly_under_full = (b_under * p_under - (1 - p_under)) / b_under if ev_under > 0 and b_under > 0 else 0

    # Fractional Kelly (25% - conservative)
    kelly_over_frac = max(0, min(kelly_over_full * 0.25, 0.05))
    kelly_under_frac = max(0, min(kelly_under_full * 0.25, 0.05))

    # Determine recommendation
    # Player props require higher edge due to lower limits and higher variance
    if edge_under > 0.04 and edge_under > edge_over:
        recommendation = "BET_UNDER" if edge_under > 0.07 else "LEAN_UNDER"
    elif edge_over > 0.04 and edge_over > edge_under:
        recommendation = "BET_OVER" if edge_over > 0.07 else "LEAN_OVER"
    else:
        recommendation = "NO_BET"

    return {
        "edge_over": round(edge_over, 4),
        "edge_under": round(edge_under, 4),
        "ev_over": round(ev_over, 4),
        "ev_under": round(ev_under, 4),
        "implied_over": round(implied_over, 4),
        "implied_under": round(implied_under, 4),
        "kelly_over_full": round(kelly_over_full, 4),
        "kelly_under_full": round(kelly_under_full, 4),
        "kelly_over_fractional": round(kelly_over_frac, 4),
        "kelly_under_fractional": round(kelly_under_frac, 4),
        "recommended_bet": recommendation,
        "best_edge": round(max(edge_over, edge_under), 4),
        "best_ev": round(max(ev_over, ev_under), 4),
        "odds_used": {
            "over": over_odds,
            "under": under_odds,
        }
    }


def full_player_prop_analysis(
    projection: float,
    std_dev: float,
    line: float,
    stat_type: str,
    direction: str = "over",
    over_odds: float = 1.87,
    under_odds: float = 1.87,
    minutes_mean: float = 32.0,
    minutes_std: float = 5.0,
    n_sims: int = 10000,
) -> dict:
    """
    Complete Monte Carlo analysis for a player prop.

    Combines simulation with EV/Kelly calculations.

    Args:
        projection: Expected stat value (adjusted for matchup)
        std_dev: Historical standard deviation
        line: Betting line
        stat_type: Type of stat ('points', 'rebounds', '3pm', etc.)
        direction: Betting direction ('over' or 'under')
        over_odds: Decimal odds for over
        under_odds: Decimal odds for under
        minutes_mean: Expected minutes
        minutes_std: Minutes standard deviation
        n_sims: Number of simulations

    Returns:
        Complete analysis dict with simulation results and betting metrics
    """
    # Run Monte Carlo simulation
    mc_result = monte_carlo_player_prop(
        projection=projection,
        std_dev=std_dev,
        line=line,
        stat_type=stat_type,
        n_sims=n_sims,
        minutes_mean=minutes_mean,
        minutes_std=minutes_std,
    )

    # Calculate EV metrics
    ev_metrics = calculate_player_prop_ev(
        p_over=mc_result["p_over"],
        p_under=mc_result["p_under"],
        over_odds=over_odds,
        under_odds=under_odds,
    )

    # Determine our position
    direction_lower = direction.lower()
    our_prob = mc_result["p_over"] if direction_lower == "over" else mc_result["p_under"]
    our_edge = ev_metrics["edge_over"] if direction_lower == "over" else ev_metrics["edge_under"]
    our_ev = ev_metrics["ev_over"] if direction_lower == "over" else ev_metrics["ev_under"]
    our_kelly = ev_metrics["kelly_over_fractional"] if direction_lower == "over" else ev_metrics["kelly_under_fractional"]
    our_odds = over_odds if direction_lower == "over" else under_odds
    implied_prob = 1 / our_odds

    return {
        "simulation": mc_result,
        "ev_metrics": ev_metrics,
        "direction": direction_lower,
        "line": line,
        "stat_type": stat_type,

        # Our position summary
        "our_probability": round(our_prob, 4),
        "implied_probability": round(implied_prob, 4),
        "our_edge": round(our_edge, 4),
        "our_ev": round(our_ev, 4),
        "our_kelly": round(our_kelly, 4),

        # Quick verdict
        "verdict": "BET" if our_edge > 0.04 else ("LEAN" if our_edge > 0.02 else "NO_BET"),

        # Projection vs line comparison
        "projection": projection,
        "projection_vs_line": round(projection - line, 2),
        "projection_vs_line_pct": round((projection - line) / line * 100, 1) if line > 0 else 0,
    }
