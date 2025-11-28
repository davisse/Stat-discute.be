"""Agent state definition for LangGraph"""
from typing import TypedDict, Literal
from pydantic import BaseModel


class AgentState(TypedDict, total=False):
    """
    State object that flows through the LangGraph workflow.

    All nodes read from and write to this shared state.
    """
    # Core identifiers
    game_id: str
    query: str

    # Supervisor analysis (populated by Supervisor)
    query_type: Literal["game_analysis", "player_prop", "spread_bet", "general"]
    query_complexity: Literal["low", "medium", "high"]
    next_action: Literal["fetch_data", "analyze", "debate", "output"]

    # Data collection (populated by DataScout)
    game_data: dict | None
    odds_data: dict | None
    news_data: list[dict]

    # Analysis artifacts
    hypotheses: list[dict]
    quant_result: dict | None
    debate_transcript: str
    debate_result: dict | None  # Bull/Bear structured debate output

    # Control flow
    confidence: float
    missing_info: list[str]
    critique_count: int
    current_node: str
    depth: Literal["quick", "standard", "deep"]

    # Output
    recommendation: dict | None
    errors: list[str]


def create_initial_state(query: str, depth: str = "standard") -> AgentState:
    """Create a fresh state for a new analysis"""
    return AgentState(
        game_id="",
        query=query,
        game_data=None,
        odds_data=None,
        news_data=[],
        hypotheses=[],
        quant_result=None,
        debate_transcript="",
        debate_result=None,
        confidence=0.0,
        missing_info=[],
        critique_count=0,
        current_node="supervisor",
        depth=depth,
        recommendation=None,
        errors=[],
    )
