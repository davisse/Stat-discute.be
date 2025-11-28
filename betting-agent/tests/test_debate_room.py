"""Tests for DebateRoom node (Bull vs Bear adversarial debate)"""
import pytest
from src.agents.debate_room import (
    BullAgent,
    BearAgent,
    DebateRoomNode,
    debate_room_node,
)


class TestBullAgent:
    """Tests for Bull (pro-bet) agent"""

    @pytest.fixture
    def bull(self):
        return BullAgent()

    def test_generates_edge_argument_positive(self, bull, state_with_quant):
        """Bull generates edge argument when edge is positive"""
        state = {
            **state_with_quant,
            "quant_result": {
                **state_with_quant["quant_result"],
                "edge": 0.08,
                "cover_probability": 0.65,
            }
        }

        arguments = bull.generate_arguments(state)

        edge_args = [a for a in arguments if a["type"] == "edge"]
        assert len(edge_args) > 0
        assert edge_args[0]["strength"] > 0.5

    def test_generates_probability_argument(self, bull, state_with_quant):
        """Bull generates probability argument when cover prob is high"""
        state = {
            **state_with_quant,
            "quant_result": {
                **state_with_quant["quant_result"],
                "cover_probability": 0.70,
            }
        }

        arguments = bull.generate_arguments(state)

        prob_args = [a for a in arguments if a["type"] == "probability"]
        assert len(prob_args) > 0

    def test_generates_situational_argument_for_home(self, bull, state_with_game_data, sample_quant_result):
        """Bull generates situational argument when team is home"""
        state = {
            **state_with_game_data,
            "quant_result": sample_quant_result,
            "game_data": {
                **state_with_game_data["game_data"],
                "team1": {
                    **state_with_game_data["game_data"]["team1"],
                    "is_home": True,
                }
            }
        }

        arguments = bull.generate_arguments(state)

        home_args = [a for a in arguments if a["type"] == "situational"]
        assert len(home_args) > 0
        assert "home" in home_args[0]["text"].lower()

    def test_generates_sizing_argument(self, bull, state_with_quant):
        """Bull generates sizing argument when Kelly > 0.01"""
        state = {
            **state_with_quant,
            "quant_result": {
                **state_with_quant["quant_result"],
                "kelly_fraction": 0.03,
            }
        }

        arguments = bull.generate_arguments(state)

        sizing_args = [a for a in arguments if a["type"] == "sizing"]
        assert len(sizing_args) > 0

    def test_limits_arguments_to_five(self, bull, state_with_quant):
        """Bull returns maximum 5 arguments"""
        arguments = bull.generate_arguments(state_with_quant)
        assert len(arguments) <= 5

    def test_no_arguments_with_no_data(self, bull, initial_state):
        """Bull generates no/few arguments without quant data"""
        arguments = bull.generate_arguments(initial_state)
        # Without quant data, should have very few or no arguments
        assert len(arguments) <= 2

    def test_arguments_sorted_by_strength(self, bull, state_with_quant):
        """Arguments are sorted by strength descending"""
        state = {
            **state_with_quant,
            "quant_result": {
                **state_with_quant["quant_result"],
                "edge": 0.10,
                "cover_probability": 0.70,
                "kelly_fraction": 0.04,
            }
        }

        arguments = bull.generate_arguments(state)

        if len(arguments) >= 2:
            strengths = [a["strength"] for a in arguments]
            assert strengths == sorted(strengths, reverse=True)


class TestBearAgent:
    """Tests for Bear (anti-bet) agent"""

    @pytest.fixture
    def bear(self):
        return BearAgent()

    def test_generates_methodology_counter(self, bear, state_with_quant):
        """Bear generates methodology counter-argument"""
        bull_args = [{"type": "edge", "strength": 0.7, "text": "Good edge"}]

        arguments = bear.generate_arguments(state_with_quant, bull_args)

        method_args = [a for a in arguments if a["type"] == "methodology"]
        assert len(method_args) > 0
        # Should argue about sample size
        assert "sample" in method_args[0]["text"].lower() or "10" in method_args[0]["text"]

    def test_generates_statistical_counter(self, bear, state_with_quant):
        """Bear generates statistical counter-argument"""
        bull_args = [{"type": "probability", "strength": 0.6}]

        arguments = bear.generate_arguments(state_with_quant, bull_args)

        stat_args = [a for a in arguments if a["type"] == "statistical"]
        assert len(stat_args) > 0
        # Should mention regression to mean
        assert "regression" in stat_args[0]["text"].lower()

    def test_generates_market_efficiency_argument(self, bear, state_with_quant):
        """Bear generates market efficiency argument for small edges"""
        state = {
            **state_with_quant,
            "quant_result": {
                **state_with_quant["quant_result"],
                "edge": 0.02,  # Small edge
            }
        }

        arguments = bear.generate_arguments(state, [])

        market_args = [a for a in arguments if a["type"] == "market"]
        assert len(market_args) > 0

    def test_generates_opponent_argument(self, bear, state_with_quant):
        """Bear generates opponent strength argument when opponent is strong"""
        state = {
            **state_with_quant,
            "game_data": {
                **state_with_quant["game_data"],
                "team2": {
                    **state_with_quant["game_data"]["team2"],
                    "stats_l10": {
                        "avg_margin": 12.0,  # Strong opponent
                        "wins": 8,
                        "games": 10,
                    }
                }
            }
        }

        arguments = bear.generate_arguments(state, [])

        opp_args = [a for a in arguments if a["type"] == "opponent"]
        assert len(opp_args) > 0

    def test_generates_data_quality_argument(self, bear, state_with_quant):
        """Bear generates data quality argument when errors exist"""
        state = {
            **state_with_quant,
            "errors": ["Missing injury data"],
            "missing_info": ["news_data"],
        }

        arguments = bear.generate_arguments(state, [])

        quality_args = [a for a in arguments if a["type"] == "data_quality"]
        assert len(quality_args) > 0

    def test_limits_arguments_to_five(self, bear, state_with_quant):
        """Bear returns maximum 5 arguments"""
        arguments = bear.generate_arguments(state_with_quant, [])
        assert len(arguments) <= 5

    def test_generates_counter_to_bull(self, bear, state_with_quant):
        """Bear generates counter-argument to Bull's strongest point"""
        bull_args = [
            {"type": "edge", "strength": 0.9, "text": "Strong edge"},
            {"type": "form", "strength": 0.7, "text": "Good form"},
        ]

        arguments = bear.generate_arguments(state_with_quant, bull_args)

        counter_args = [a for a in arguments if a["type"] == "counter"]
        assert len(counter_args) > 0


class TestDebateRoomNode:
    """Tests for DebateRoom orchestration"""

    @pytest.fixture
    def debate_room(self):
        return DebateRoomNode()

    @pytest.mark.asyncio
    async def test_debate_produces_winner(self, debate_room, state_with_quant):
        """Debate produces a winner or neutral result"""
        result = await debate_room(state_with_quant)
        debate_result = result["debate_result"]

        assert "winner" in debate_result
        assert debate_result["winner"] in ("BULL", "BEAR", "NEUTRAL")

    @pytest.mark.asyncio
    async def test_debate_produces_scores(self, debate_room, state_with_quant):
        """Debate produces scores for both sides"""
        result = await debate_room(state_with_quant)
        debate_result = result["debate_result"]

        assert "bull_score" in debate_result
        assert "bear_score" in debate_result
        assert 0 <= debate_result["bull_score"] <= 1
        assert 0 <= debate_result["bear_score"] <= 1

    @pytest.mark.asyncio
    async def test_debate_produces_arguments(self, debate_room, state_with_quant):
        """Debate returns arguments from both sides"""
        result = await debate_room(state_with_quant)
        debate_result = result["debate_result"]

        assert "bull_arguments" in debate_result
        assert "bear_arguments" in debate_result

    @pytest.mark.asyncio
    async def test_debate_edge_calculation(self, debate_room, state_with_quant):
        """Debate calculates debate edge (difference in scores)"""
        result = await debate_room(state_with_quant)
        debate_result = result["debate_result"]

        assert "debate_edge" in debate_result
        expected_edge = debate_result["bull_score"] - debate_result["bear_score"]
        assert abs(debate_result["debate_edge"] - expected_edge) < 0.01

    @pytest.mark.asyncio
    async def test_bull_competitive_with_high_edge(self, debate_room, state_with_quant):
        """Bull should be competitive with high edge scenario"""
        state = {
            **state_with_quant,
            "quant_result": {
                **state_with_quant["quant_result"],
                "edge": 0.15,  # Very high edge
                "cover_probability": 0.75,
                "kelly_fraction": 0.05,
            },
            "game_data": {
                **state_with_quant["game_data"],
                "data_quality": "FRESH",
            },
            "errors": [],
            "missing_info": [],
        }

        result = await debate_room(state)
        debate_result = result["debate_result"]

        # With strong bull case, bull should be competitive
        assert debate_result["bull_score"] >= 0.4

    @pytest.mark.asyncio
    async def test_bear_competitive_with_low_edge(self, debate_room, state_with_quant):
        """Bear should be competitive with low/negative edge scenario"""
        state = {
            **state_with_quant,
            "quant_result": {
                **state_with_quant["quant_result"],
                "edge": -0.05,  # Negative edge
                "cover_probability": 0.40,
                "kelly_fraction": 0,
            },
            "game_data": {
                **state_with_quant["game_data"],
                "data_quality": "PARTIAL",
            },
            "errors": ["Missing data"],
        }

        result = await debate_room(state)
        debate_result = result["debate_result"]

        # With weak bull case, bear should dominate
        assert debate_result["bear_score"] >= debate_result["bull_score"]


class TestDebateRoomNodeFunction:
    """Tests for the LangGraph node function"""

    @pytest.mark.asyncio
    async def test_node_produces_debate_result(self, state_with_quant):
        """Node produces debate_result in state"""
        result = await debate_room_node(state_with_quant)

        assert "debate_result" in result
        assert result["debate_result"] is not None
        assert "winner" in result["debate_result"]

    @pytest.mark.asyncio
    async def test_node_produces_transcript(self, state_with_quant):
        """Node produces debate transcript"""
        result = await debate_room_node(state_with_quant)

        assert "debate_transcript" in result
        assert len(result["debate_transcript"]) > 0
        # Should contain debate sections
        assert "BULL" in result["debate_transcript"]
        assert "BEAR" in result["debate_transcript"]

    @pytest.mark.asyncio
    async def test_node_sets_current_node(self, state_with_quant):
        """Node sets current_node to debate_room"""
        result = await debate_room_node(state_with_quant)

        assert result["current_node"] == "debate_room"

    @pytest.mark.asyncio
    async def test_node_preserves_state(self, state_with_quant):
        """Node preserves existing state fields"""
        result = await debate_room_node(state_with_quant)

        assert result["query"] == state_with_quant["query"]
        assert result["quant_result"] == state_with_quant["quant_result"]

    @pytest.mark.asyncio
    async def test_node_handles_missing_quant(self, state_with_game_data):
        """Node handles missing quant result gracefully"""
        result = await debate_room_node(state_with_game_data)

        assert "debate_result" in result
        # Should still produce a result
        assert result["debate_result"]["winner"] in ("BULL", "BEAR", "NEUTRAL")
