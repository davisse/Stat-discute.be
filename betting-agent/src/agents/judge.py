"""Judge node - Final synthesis and confidence calibration"""
import asyncio
from collections import Counter

from src.models.state import AgentState
from src.models.recommendations import BetRecommendation
from src.memory.store import get_memory_store


class JudgeNode:
    """
    The Judge synthesizes all evidence into a final recommendation.

    Responsibilities:
    - Weigh Bull vs Bear arguments
    - Calculate calibrated confidence via ensemble
    - Check memory for similar historical bets
    - Apply learning rules
    - Generate final recommendation
    """

    def __init__(self):
        # TODO: Phase 4 - Initialize memory store
        self.memory = None

    async def __call__(self, state: AgentState) -> AgentState:
        """Execute final synthesis"""
        errors = list(state.get("errors", []))

        # Calculate calibrated confidence
        confidence = await self._calculate_ensemble_confidence(state)

        # Check memory for similar bets
        similar_bets = await self._find_similar_bets(state)

        # Apply learning rules
        adjustments = await self._get_learning_adjustments(state)
        for adj in adjustments:
            confidence += adj["adjustment"]

        # Clamp confidence with aggressive upper bound
        # Historical data: High confidence = inverse indicator (21.4% win rate)
        # Never allow confidence above 65%, floor at 40%
        confidence = max(0.40, min(0.65, confidence * 0.9))

        # Generate recommendation
        recommendation = self._build_recommendation(state, confidence, similar_bets)

        return {
            **state,
            "current_node": "judge",
            "confidence": confidence,
            "recommendation": recommendation,
            "errors": errors,
        }

    async def _calculate_ensemble_confidence(
        self,
        state: AgentState,
        n_samples: int = 5
    ) -> float:
        """
        Calculate calibrated confidence with contrarian adjustments.

        Key insight from Nov 2025 backtest:
        - High confidence (≥80%) → 21.4% win rate (INVERSE indicator!)
        - Low confidence UNDER picks → 62.5% win rate (profitable!)

        Therefore: Apply heavy contrarian discount to high-confidence projections.
        """
        quant = state.get("quant_result", {})
        edge = quant.get("edge", 0)
        direction = quant.get("direction", "under")

        # Get Monte Carlo confidence interval spread if available
        mc_result = quant.get("monte_carlo", {})
        ci_under = mc_result.get("ci_95_under", [0.4, 0.6])
        ci_spread = ci_under[1] - ci_under[0] if isinstance(ci_under, list) else 0.2

        # Get scenario variance if available
        scenarios = quant.get("scenarios", {})
        scenario_spread = scenarios.get("_summary", {}).get("p_under_spread", 0.1)

        # Base confidence from edge (but heavily discounted)
        if edge > 0.05:
            base_confidence = 0.60  # Reduced from 0.75
        elif edge > 0.02:
            base_confidence = 0.55  # Reduced from 0.65
        elif edge > 0:
            base_confidence = 0.50  # Reduced from 0.55
        else:
            base_confidence = 0.45

        # CONTRARIAN ADJUSTMENT: High model confidence → apply heavy discount
        # Historical data shows high confidence is an inverse indicator
        if base_confidence >= 0.60:
            # Apply 25% contrarian penalty for high confidence
            base_confidence *= 0.75

        # Uncertainty adjustment: More scenario variance → lower confidence
        if scenario_spread > 0.12:
            base_confidence *= 0.85  # High variance penalty
        elif scenario_spread < 0.06:
            base_confidence *= 1.05  # Low variance bonus

        # CI spread adjustment: Wider CI → lower confidence
        if ci_spread > 0.15:
            base_confidence *= 0.90
        elif ci_spread < 0.08:
            base_confidence *= 1.05

        # Direction adjustment: UNDER picks have historically performed better
        if direction == "under":
            base_confidence *= 1.10  # 10% boost for UNDER
        else:
            base_confidence *= 0.90  # 10% penalty for OVER

        # Never exceed 0.65 (historical high confidence = bad indicator)
        return min(base_confidence, 0.65)

    async def _find_similar_bets(self, state: AgentState) -> list[dict]:
        """Find historically similar betting situations"""
        # TODO: Phase 4 - Implement with memory store
        return []

    async def _get_learning_adjustments(self, state: AgentState) -> list[dict]:
        """Get applicable learning rules from memory store"""
        adjustments = []

        try:
            memory = get_memory_store()
            calibration = memory.get_calibration_adjustments()

            # Check for inverse correlation adjustment
            if calibration.get("confidence_discounts", {}).get("inverse_detected"):
                # High confidence is a bad signal - apply penalty
                quant = state.get("quant_result", {})
                current_confidence = quant.get("confidence", 0.5)
                if current_confidence > 0.65:
                    adjustments.append({
                        "adjustment": -0.10,  # 10% penalty for high confidence
                        "reason": "inverse_correlation_detected",
                    })

            # Check for direction-based adjustments
            direction_mults = calibration.get("direction_multipliers", {})
            quant = state.get("quant_result", {})
            direction = quant.get("direction", "under").upper()

            if direction == "OVER" and direction_mults.get("OVER"):
                # OVER penalty already applied in quant, but add extra caution
                if direction_mults["OVER"] < 0.6:
                    adjustments.append({
                        "adjustment": -0.05,
                        "reason": "over_historical_underperformance",
                    })

            if direction == "UNDER" and direction_mults.get("UNDER", 1.0) > 1.0:
                adjustments.append({
                    "adjustment": 0.03,  # Small boost for UNDER
                    "reason": "under_historical_outperformance",
                })

        except Exception as e:
            # If memory store fails, continue without adjustments
            pass

        return adjustments

    def _build_recommendation(
        self,
        state: AgentState,
        confidence: float,
        similar_bets: list[dict]
    ) -> dict:
        """Build final recommendation object with contrarian logic"""
        quant = state.get("quant_result", {})
        game = state.get("game_data", {})

        # Determine action with more conservative thresholds
        # Historical backtest: positive edge bets had 20% win rate!
        edge = quant.get("edge", 0)
        direction = quant.get("direction", "under")

        # Apply contrarian logic: favor low-confidence UNDER picks
        if direction == "under" and confidence < 0.55 and edge > 0:
            # Low confidence UNDER = historically profitable (62.5% win rate)
            action = "BET"
        elif direction == "over":
            # OVER picks have been disastrous (16.7% win rate)
            # Require much higher thresholds
            if edge > 0.05 and confidence >= 0.60:
                action = "WAIT"  # Still cautious
            else:
                action = "NO_BET"
        elif edge > 0.03 and confidence >= 0.55:
            action = "BET"
        elif edge > 0.01 and confidence >= 0.50:
            action = "WAIT"  # Borderline, more research needed
        else:
            action = "NO_BET"

        # Extract factors from debate
        bull_factors = self._extract_factors(state, "bull")
        bear_factors = self._extract_factors(state, "bear")

        return {
            "action": action,
            "selection": game.get("selection", "Unknown"),
            "line": game.get("line", 0),
            "confidence": confidence,
            "edge": edge,
            "key_factors": bull_factors,
            "risk_factors": bear_factors,
            "reasoning_trace": state.get("debate_transcript", ""),
            "similar_bets": similar_bets,
        }

    def _extract_factors(self, state: AgentState, side: str) -> list[str]:
        """Extract bullet points from debate transcript"""
        transcript = state.get("debate_transcript", "")

        # TODO: Phase 3 - Implement proper extraction
        if side == "bull":
            return ["Statistical edge detected", "Favorable matchup"]
        else:
            return ["Market may be efficient", "Sample size concerns"]


# Functional interface for LangGraph
async def judge_node(state: AgentState) -> AgentState:
    """Judge node function for LangGraph"""
    node = JudgeNode()
    return await node(state)
