"""Supervisor node - Routes tasks to specialists"""
import re
from src.models.state import AgentState


class SupervisorNode:
    """
    The Supervisor analyzes the query and routes to appropriate specialists.

    Responsibilities:
    - Parse user query to identify game/player
    - Determine required data sources
    - Set analysis depth based on complexity
    - Route to the correct starting node

    Routing Logic:
    - New query → fetch_data (always start with DataScout)
    - Already have data + no analysis → analyze (QuantAnalyst)
    - Already have analysis + need debate → debate (DebateRoom)
    - Ready for output → output (Judge)
    """

    def __init__(self):
        self.bet_keywords = [
            "bet", "wager", "pick", "play", "back", "fade",
            "spread", "moneyline", "total", "over", "under",
            "prop", "points", "rebounds", "assists"
        ]
        self.question_keywords = [
            "should", "would", "could", "will", "is", "are",
            "can", "do", "does", "what", "how", "why"
        ]

    async def __call__(self, state: AgentState) -> AgentState:
        """Execute supervisor logic"""
        query = state.get("query", "")
        errors = list(state.get("errors", []))

        # Classify the query
        query_type = self._classify_query(query)
        complexity = self._assess_complexity(query)
        depth = self._determine_depth(complexity, state.get("depth", "standard"))

        # Determine next action based on current state
        next_action = self._determine_next_action(state)

        return {
            **state,
            "current_node": "supervisor",
            "query_type": query_type,
            "query_complexity": complexity,
            "depth": depth,
            "next_action": next_action,
            "errors": errors,
        }

    def _classify_query(self, query: str) -> str:
        """
        Classify query type for appropriate handling.

        Types:
        - game_analysis: "Lakers vs Heat" style matchup queries
        - player_prop: "LeBron over 28.5 points" style prop queries
        - spread_bet: "Lakers -5" style spread queries
        - general: General basketball questions
        """
        query_lower = query.lower()

        # Check for player prop indicators
        prop_indicators = ["over", "under", "points", "rebounds", "assists", "threes", "3s", "steals", "blocks"]
        if any(ind in query_lower for ind in prop_indicators):
            # Look for a number that could be a line
            if re.search(r'\d+\.?\d*', query):
                return "player_prop"

        # Check for spread bet
        if re.search(r'[+-]\d+\.?\d*', query):
            return "spread_bet"

        # Check for matchup
        if re.search(r'\s+vs\.?\s+|\s+at\s+|\s+@\s+', query, re.IGNORECASE):
            return "game_analysis"

        # Check for team name alone
        nba_teams = [
            "lakers", "heat", "celtics", "warriors", "nets", "knicks", "bulls",
            "sixers", "suns", "bucks", "mavs", "mavericks", "nuggets", "clippers",
            "rockets", "spurs", "jazz", "thunder", "blazers", "pelicans", "grizzlies",
            "hawks", "hornets", "pistons", "pacers", "cavaliers", "cavs", "magic",
            "wizards", "raptors", "kings", "timberwolves", "wolves"
        ]
        for team in nba_teams:
            if team in query_lower:
                return "game_analysis"

        return "general"

    def _assess_complexity(self, query: str) -> str:
        """
        Assess query complexity to determine analysis depth.

        Factors:
        - Number of entities (teams/players)
        - Presence of specific line/odds
        - Request for detailed analysis
        """
        query_lower = query.lower()
        complexity_score = 0

        # Multiple entities increase complexity
        vs_match = re.search(r'(\w+)\s+(?:vs\.?|at|@)\s+(\w+)', query, re.IGNORECASE)
        if vs_match:
            complexity_score += 2

        # Specific line increases complexity
        if re.search(r'[+-]?\d+\.?\d*', query):
            complexity_score += 1

        # Analysis keywords increase complexity
        deep_keywords = ["analyze", "analysis", "detailed", "deep", "thorough", "full"]
        if any(kw in query_lower for kw in deep_keywords):
            complexity_score += 2

        # Question format suggests more reasoning needed
        if any(kw in query_lower for kw in self.question_keywords):
            complexity_score += 1

        if complexity_score >= 4:
            return "high"
        elif complexity_score >= 2:
            return "medium"
        else:
            return "low"

    def _determine_depth(self, complexity: str, requested_depth: str) -> str:
        """
        Map complexity to analysis depth.

        Always respect user-requested depth, but suggest upgrades
        for complex queries.
        """
        # If user explicitly requested a depth, respect it
        if requested_depth != "standard":
            return requested_depth

        # Otherwise, map complexity to depth
        depth_map = {
            "low": "quick",
            "medium": "standard",
            "high": "deep",
        }
        return depth_map.get(complexity, "standard")

    def _determine_next_action(self, state: AgentState) -> str:
        """
        Determine the next action based on current state.

        Returns routing key for LangGraph conditional edge.
        """
        # Check what data we have
        has_game_data = state.get("game_data") is not None
        has_quant_result = state.get("quant_result") is not None
        has_debate = bool(state.get("debate_transcript", ""))
        critique_count = state.get("critique_count", 0)

        # If this is a retry (critique loop), go back to data scout
        if critique_count > 0 and not has_game_data:
            return "fetch_data"

        # New query or missing data → fetch data
        if not has_game_data:
            return "fetch_data"

        # Have data but no analysis → analyze
        if has_game_data and not has_quant_result:
            return "analyze"

        # Have analysis but no debate → debate
        if has_quant_result and not has_debate:
            return "debate"

        # Have everything → output
        return "output"


# Functional interface for LangGraph
async def supervisor_node(state: AgentState) -> AgentState:
    """Supervisor node function for LangGraph"""
    node = SupervisorNode()
    return await node(state)
