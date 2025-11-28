"""Main LangGraph workflow definition"""
from langgraph.graph import StateGraph, END

from src.models.state import AgentState
from src.graph.edges import route_from_supervisor, should_continue, should_fetch_news

# Import actual node implementations
from src.agents.supervisor import supervisor_node
from src.agents.data_scout import data_scout_node
from src.agents.quant_analyst import quant_analyst_node
from src.agents.debate_room import debate_room_node
from src.agents.narrative import narrative_node  # Phase 6

# Memory integration (Phase 4)
from src.memory import get_memory_store




async def judge_node(state: AgentState) -> AgentState:
    """Synthesize and calibrate final recommendation with debate weighting"""
    game_data = state.get("game_data") or {}
    quant_result = state.get("quant_result") or {}
    debate_result = state.get("debate_result") or {}
    errors = list(state.get("errors", []))
    missing_info = list(state.get("missing_info", []))

    # Extract quant analysis results
    edge = quant_result.get("edge", 0) if quant_result else 0
    cover_prob = quant_result.get("cover_probability", 0.5) if quant_result else 0.5
    kelly = quant_result.get("kelly_fraction", 0) if quant_result else 0
    quant_rec = quant_result.get("recommendation", "NO_BET") if quant_result else "NO_BET"
    projected_margin = quant_result.get("projected_margin") if quant_result else None

    # Extract debate results
    debate_winner = debate_result.get("winner", "NEUTRAL")
    debate_edge = debate_result.get("debate_edge", 0)
    bull_score = debate_result.get("bull_score", 0)
    bear_score = debate_result.get("bear_score", 0)

    selection = game_data.get("selection", "Unknown") if game_data else "Unknown"
    line = game_data.get("line") if game_data else None
    data_quality = game_data.get("data_quality", "UNAVAILABLE") if game_data else "UNAVAILABLE"

    # Build selection string with line (avoid duplicating if line already in selection)
    if line is not None and str(line) not in selection:
        selection = f"{selection} {line:+.1f}" if selection != "Unknown" else f"Line {line:+.1f}"

    # Calculate confidence based on multiple factors
    base_confidence = 0.5

    # Data quality factor
    if data_quality == "FRESH":
        base_confidence += 0.15
    elif data_quality == "PARTIAL":
        base_confidence += 0.05

    # Edge magnitude factor (scaled for percentage edge)
    if edge is not None:
        if edge >= 0.05:  # 5%+ edge
            base_confidence += 0.15
        elif edge >= 0.02:  # 2%+ edge
            base_confidence += 0.10
        elif edge <= -0.02:  # Negative edge
            base_confidence -= 0.10

    # Cover probability factor
    if cover_prob and cover_prob >= 0.65:
        base_confidence += 0.05
    elif cover_prob and cover_prob <= 0.40:
        base_confidence -= 0.05

    # Debate outcome factor (NEW in Phase 3)
    if debate_winner == "BULL":
        base_confidence += 0.05
    elif debate_winner == "BEAR":
        base_confidence -= 0.10  # Bear wins = stronger downgrade
    # NEUTRAL has no effect

    # Missing info reduces confidence
    base_confidence -= len(missing_info) * 0.03
    base_confidence -= len(errors) * 0.02

    # Clamp confidence
    base_confidence = max(0.1, min(0.85, base_confidence))

    # Determine final action based on quant + debate consensus
    if data_quality == "UNAVAILABLE" or not game_data:
        action = "NO_BET"
        reasoning = "Insufficient data to make recommendation"
    elif debate_winner == "BEAR" and edge < 0.05:
        # Bear won debate AND edge is marginal - downgrade
        action = "NO_BET"
        reasoning = f"Bear case prevailed (score {bear_score:.2f}), edge {edge*100:.1f}% insufficient"
    elif quant_rec == "BET" and edge >= 0.03 and base_confidence >= 0.6:
        if debate_winner == "BULL":
            action = "BET"
            reasoning = f"Quant + Debate aligned: Edge {edge*100:.1f}%, Bull won ({bull_score:.2f} vs {bear_score:.2f})"
        else:
            action = "LEAN_BET"
            reasoning = f"Positive edge {edge*100:.1f}% but debate was {debate_winner.lower()}"
    elif quant_rec == "LEAN_BET" and edge >= 0.01:
        action = "LEAN_BET"
        reasoning = f"Marginal edge of {edge*100:.1f}%, debate {debate_winner.lower()}"
    elif quant_rec == "FADE":
        action = "FADE"
        reasoning = f"Negative edge of {edge*100:.1f}%, consider opposite side"
    elif quant_rec == "NEED_LINE":
        action = "NEED_LINE"
        reasoning = "Provide a spread line for edge calculation"
    else:
        action = "NO_BET"
        reasoning = f"Edge: {edge*100:.1f}% below threshold or low confidence"

    recommendation = {
        "action": action,
        "selection": selection,
        "line": line,
        "edge": round(edge * 100, 2) if edge else 0,  # Convert to percentage
        "edge_raw": edge,
        "cover_probability": round(cover_prob * 100, 1) if cover_prob else 50,
        "kelly_fraction": round(kelly * 100, 2) if kelly else 0,
        "projected_margin": projected_margin,
        "confidence": round(base_confidence, 2),
        "reasoning": reasoning,
        "key_factors": quant_result.get("confidence_factors", []) if quant_result else [],
        "risk_factors": errors + missing_info,
        "data_quality": data_quality,
        # Debate results (NEW in Phase 3)
        "debate_winner": debate_winner,
        "debate_edge": round(debate_edge, 3),
        "bull_score": round(bull_score, 2),
        "bear_score": round(bear_score, 2),
    }

    # Save to memory if actionable recommendation (Phase 4)
    wager_id = None
    if action in ("BET", "LEAN_BET", "FADE"):
        try:
            store = get_memory_store()
            bull_args = debate_result.get("bull_arguments", [])
            bear_args = debate_result.get("bear_arguments", [])

            # Determine bet_type and line based on game_data
            bet_type = game_data.get("bet_type", "spread").upper() if game_data else "SPREAD"
            wager_line = line or 0
            if bet_type == "TOTAL":
                wager_line = game_data.get("total_line", 0) if game_data else 0

            # For FADE action, flip the selection (OVER→UNDER, UNDER→OVER)
            wager_selection = selection
            if action == "FADE":
                if "OVER" in selection.upper():
                    # Extract line from selection and create UNDER
                    import re
                    match = re.search(r'([\d.]+)', selection)
                    if match:
                        wager_selection = f"UNDER {match.group(1)}"
                elif "UNDER" in selection.upper():
                    import re
                    match = re.search(r'([\d.]+)', selection)
                    if match:
                        wager_selection = f"OVER {match.group(1)}"
                # For spreads, FADE means bet the other side (not implemented yet)

            wager_id = store.save_wager(
                game_id=game_data.get("game_id", "") if game_data else "",
                bet_type=bet_type,
                selection=wager_selection,
                line=wager_line,
                confidence=base_confidence,
                predicted_edge=edge,
                reasoning_trace=state.get("debate_transcript", ""),
                bull_arguments=bull_args,
                bear_arguments=bear_args,
                depth=state.get("depth", "standard"),
                debate_result=debate_result,
                quant_result=quant_result,
            )
            recommendation["wager_id"] = wager_id
        except Exception as e:
            errors.append(f"Memory save error: {str(e)}")

    return {
        **state,
        "current_node": "judge",
        "confidence": base_confidence,
        "recommendation": recommendation,
    }


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
