"""Main LangGraph workflow definition"""
from langgraph.graph import StateGraph, END

from src.models.state import AgentState
from src.graph.edges import route_from_supervisor, should_continue, should_fetch_news

# Placeholder node functions - to be implemented in Phase 1
async def supervisor_node(state: AgentState) -> AgentState:
    """Route tasks to appropriate specialists"""
    # TODO: Implement in Phase 1
    return {**state, "current_node": "supervisor"}


async def data_scout_node(state: AgentState) -> AgentState:
    """Fetch raw data from APIs and database"""
    # TODO: Implement in Phase 1
    return {**state, "current_node": "data_scout"}


async def quant_analyst_node(state: AgentState) -> AgentState:
    """Calculate edges using Python sandbox"""
    # TODO: Implement in Phase 2
    return {**state, "current_node": "quant_analyst"}


async def narrative_node(state: AgentState) -> AgentState:
    """Research news, injuries, and soft factors"""
    # TODO: Implement in Phase 3
    return {**state, "current_node": "narrative"}


async def debate_room_node(state: AgentState) -> AgentState:
    """Bull vs Bear adversarial debate"""
    # TODO: Implement in Phase 3
    return {**state, "current_node": "debate_room"}


async def judge_node(state: AgentState) -> AgentState:
    """Synthesize and calibrate final recommendation"""
    # TODO: Implement in Phase 3
    return {**state, "current_node": "judge"}


def create_agent_graph() -> StateGraph:
    """
    Build the Council of Experts graph.

    Flow:
    1. Supervisor analyzes query and routes
    2. DataScout fetches stats/odds
    3. Narrative fetches news (optional based on depth)
    4. QuantAnalyst calculates edge
    5. DebateRoom argues Bull vs Bear
    6. Judge synthesizes and calibrates
    7. Reflexion: If low confidence, loop back to DataScout

    ```
    START -> Supervisor -> DataScout -> [Narrative] -> QuantAnalyst
                                                            |
                                                            v
                              +----------------- DebateRoom
                              |                      |
                              |                      v
                              |                   Judge
                              |                      |
                              |     +----------------+----------------+
                              |     |                |                |
                              |  publish     publish_with_warning   retry
                              |     |                |                |
                              |     v                v                |
                              |    END              END               |
                              +---------------------------------------+
    ```
    """
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("supervisor", supervisor_node)
    graph.add_node("data_scout", data_scout_node)
    graph.add_node("narrative", narrative_node)
    graph.add_node("quant_analyst", quant_analyst_node)
    graph.add_node("debate_room", debate_room_node)
    graph.add_node("judge", judge_node)

    # Set entry point
    graph.set_entry_point("supervisor")

    # Supervisor routes to data collection
    graph.add_conditional_edges(
        "supervisor",
        route_from_supervisor,
        {
            "fetch_data": "data_scout",
            "analyze": "quant_analyst",
            "debate": "debate_room",
            "output": "judge",
        }
    )

    # DataScout -> optionally Narrative -> QuantAnalyst
    graph.add_conditional_edges(
        "data_scout",
        should_fetch_news,
        {
            "fetch_news": "narrative",
            "skip_news": "quant_analyst",
        }
    )

    # Narrative -> QuantAnalyst
    graph.add_edge("narrative", "quant_analyst")

    # QuantAnalyst -> DebateRoom
    graph.add_edge("quant_analyst", "debate_room")

    # DebateRoom -> Judge
    graph.add_edge("debate_room", "judge")

    # Judge -> Reflexion loop or END
    graph.add_conditional_edges(
        "judge",
        should_continue,
        {
            "publish": END,
            "publish_with_warning": END,
            "retry": "data_scout",  # Reflexion loop
        }
    )

    return graph.compile()


# Convenience function for quick testing
async def run_analysis(query: str, depth: str = "standard") -> AgentState:
    """Run a complete analysis and return final state"""
    from src.models.state import create_initial_state

    graph = create_agent_graph()
    initial_state = create_initial_state(query=query, depth=depth)

    final_state = await graph.ainvoke(initial_state)
    return final_state
