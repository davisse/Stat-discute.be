"""Conditional edge functions for LangGraph routing"""
from typing import Literal
from src.models.state import AgentState

# Constants
CONFIDENCE_THRESHOLD = 0.8
MAX_CRITIQUE_COUNT = 3


def route_from_supervisor(state: AgentState) -> Literal["fetch_data", "analyze", "debate", "output"]:
    """
    Route from supervisor to appropriate next node.

    Uses the next_action field set by the Supervisor, which has already
    analyzed the query and current state to determine optimal routing.

    Fallback Logic (if next_action not set):
    - If no game data: fetch_data
    - If game data but no quant result: analyze
    - If analysis done but no debate: debate
    - Otherwise: output
    """
    # Prefer explicit routing from Supervisor
    next_action = state.get("next_action")
    if next_action in ("fetch_data", "analyze", "debate", "output"):
        return next_action

    # Fallback logic if Supervisor didn't set next_action
    if state.get("game_data") is None:
        return "fetch_data"

    if state.get("quant_result") is None:
        return "analyze"

    if not state.get("debate_transcript"):
        return "debate"

    return "output"


def should_continue(state: AgentState) -> Literal["publish", "publish_with_warning", "retry"]:
    """
    Determine if we should publish result or retry with more research.

    The Reflexion Loop (Phase 4 enabled):
    - If confidence >= threshold: publish
    - If critique_count >= max: publish with warning (graceful degradation)
    - If actionable recommendation and low confidence: retry to gather more data
    - Otherwise: publish with warning

    Retry is triggered when:
    1. Confidence < threshold (0.8)
    2. critique_count < max (3)
    3. There are identifiable gaps to fill (missing_info not empty)
    4. The recommendation is actionable (BET, LEAN_BET, FADE)
    """
    confidence = state.get("confidence", 0.0)
    critique_count = state.get("critique_count", 0)
    missing_info = state.get("missing_info", [])
    recommendation = state.get("recommendation", {})
    action = recommendation.get("action", "NO_BET") if recommendation else "NO_BET"

    # High confidence - publish
    if confidence >= CONFIDENCE_THRESHOLD:
        return "publish"

    # Max retries reached - graceful degradation
    if critique_count >= MAX_CRITIQUE_COUNT:
        return "publish_with_warning"

    # Retry conditions:
    # 1. Action is potentially valuable (worth refining)
    # 2. There are gaps we can try to fill
    # 3. Confidence is meaningfully below threshold
    should_retry = (
        action in ("BET", "LEAN_BET", "FADE")
        and len(missing_info) > 0
        and confidence < CONFIDENCE_THRESHOLD - 0.1  # At least 10% below threshold
    )

    if should_retry:
        return "retry"

    return "publish_with_warning"


def should_fetch_news(state: AgentState) -> Literal["fetch_news", "skip_news"]:
    """
    Determine if narrative research is needed.

    Skip news if:
    - Quick depth mode
    - Already have sufficient news data
    """
    depth = state.get("depth", "standard")
    news_data = state.get("news_data", [])

    if depth == "quick":
        return "skip_news"

    if len(news_data) >= 3:
        return "skip_news"

    return "fetch_news"
