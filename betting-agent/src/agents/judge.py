"""Judge node - Final synthesis and confidence calibration"""
import asyncio
from collections import Counter

from src.models.state import AgentState
from src.models.recommendations import BetRecommendation


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

        # Clamp confidence (never above 85%, never below 40%)
        confidence = max(0.40, min(0.85, confidence * 0.9))

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
        Calculate confidence via ensemble voting.

        Run multiple reasoning chains and measure agreement.
        High agreement = high confidence.
        """
        # TODO: Phase 3 - Implement ensemble
        # For now, return a placeholder based on edge
        quant = state.get("quant_result", {})
        edge = quant.get("edge", 0)

        if edge > 0.05:
            return 0.75
        elif edge > 0.02:
            return 0.65
        elif edge > 0:
            return 0.55
        else:
            return 0.45

    async def _find_similar_bets(self, state: AgentState) -> list[dict]:
        """Find historically similar betting situations"""
        # TODO: Phase 4 - Implement with memory store
        return []

    async def _get_learning_adjustments(self, state: AgentState) -> list[dict]:
        """Get applicable learning rules"""
        # TODO: Phase 4 - Implement with memory store
        return []

    def _build_recommendation(
        self,
        state: AgentState,
        confidence: float,
        similar_bets: list[dict]
    ) -> dict:
        """Build final recommendation object"""
        quant = state.get("quant_result", {})
        game = state.get("game_data", {})

        # Determine action
        edge = quant.get("edge", 0)
        if edge > 0.02 and confidence >= 0.6:
            action = "BET"
        elif edge > 0 and confidence >= 0.5:
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
