"""Conditional edge functions for LangGraph routing"""
from typing import Literal
from src.models.state import AgentState

# Constants
CONFIDENCE_THRESHOLD = 0.8
MAX_CRITIQUE_COUNT = 3


def route_from_supervisor(state: AgentState) -> Literal["fetch_data", "analyze", "debate", "output"]:
    """
    Route from supervisor to appropriate next node.

    Logic:
    - If no game data: fetch_data
    - If game data but no quant result: analyze
    - If analysis done but no debate: debate
    - Otherwise: output
    """
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

    The Reflexion Loop:
    - If confidence >= threshold: publish
    - If critique_count >= max: publish with warning (graceful degradation)
    - Otherwise: retry (loop back to data_scout)
    """
    confidence = state.get("confidence", 0.0)
    critique_count = state.get("critique_count", 0)
    missing_info = state.get("missing_info", [])

    # High confidence - publish
    if confidence >= CONFIDENCE_THRESHOLD:
        return "publish"

    # Max retries reached - graceful degradation
    if critique_count >= MAX_CRITIQUE_COUNT:
        return "publish_with_warning"

    # Low confidence and we know what's missing - retry
    if missing_info and critique_count < MAX_CRITIQUE_COUNT:
        return "retry"

    # Low confidence but nothing specific to research - publish with warning
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
