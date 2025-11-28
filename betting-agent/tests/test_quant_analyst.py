"""Tests for QuantAnalyst node"""
import pytest
import math
from src.agents.quant_analyst import QuantAnalystNode, quant_analyst_node


class TestQuantAnalystHelpers:
    """Tests for QuantAnalyst helper methods"""

    @pytest.fixture
    def analyst(self):
        """Create QuantAnalyst instance"""
        return QuantAnalystNode()

    def test_margin_to_probability_zero(self, analyst):
        """Zero margin should give 50% probability"""
        prob = analyst._margin_to_probability(0)
        assert 0.49 <= prob <= 0.51

    def test_margin_to_probability_positive(self, analyst):
        """Positive margin should give > 50% probability"""
        prob = analyst._margin_to_probability(10)
        assert prob > 0.5
        assert prob < 1.0

    def test_margin_to_probability_negative(self, analyst):
        """Negative margin should give < 50% probability"""
        prob = analyst._margin_to_probability(-10)
        assert prob < 0.5
        assert prob > 0.0

    def test_margin_to_probability_clamped(self, analyst):
        """Very extreme margins should be clamped"""
        prob_high = analyst._margin_to_probability(100)
        prob_low = analyst._margin_to_probability(-100)
        assert prob_high <= 0.95
        assert prob_low >= 0.05

    def test_odds_to_probability_standard_vig(self, analyst):
        """Test odds conversion with standard -110 odds"""
        # 1.91 decimal = -110 American = ~52.4%
        prob = analyst._odds_to_probability(1.91)
        assert 0.52 <= prob <= 0.53

    def test_odds_to_probability_even_money(self, analyst):
        """Test odds conversion for even money"""
        prob = analyst._odds_to_probability(2.0)
        assert prob == 0.5

    def test_odds_to_probability_underdog(self, analyst):
        """Test odds conversion for underdog"""
        # +150 = 2.50 decimal
        prob = analyst._odds_to_probability(2.50)
        assert prob == 0.4

    def test_odds_to_probability_invalid(self, analyst):
        """Test odds conversion with invalid input"""
        prob = analyst._odds_to_probability(1.0)  # Would be infinite probability
        assert prob == 0.5  # Default

    def test_safe_float_valid(self, analyst):
        """Test safe float with valid inputs"""
        assert analyst._safe_float(5) == 5.0
        assert analyst._safe_float(3.14) == 3.14
        assert analyst._safe_float("2.5") == 2.5

    def test_safe_float_invalid(self, analyst):
        """Test safe float with invalid inputs"""
        assert analyst._safe_float(None) == 0.0
        assert analyst._safe_float("not a number") == 0.0

    def test_safe_float_decimal(self, analyst):
        """Test safe float with Decimal"""
        from decimal import Decimal
        assert analyst._safe_float(Decimal("3.14")) == 3.14


class TestQuantAnalystEdgeCalculation:
    """Tests for edge calculation logic"""

    @pytest.fixture
    def analyst(self):
        return QuantAnalystNode()

    @pytest.mark.asyncio
    async def test_calculate_edge_positive(self, analyst):
        """Test edge calculation with favorable margin"""
        game_data = {
            "line": -5.0,
            "team1": {
                "abbreviation": "LAL",
                "is_home": True,
                "stats_l10": {
                    "avg_margin": 8.0,  # Team averages +8
                    "ppg": 115,
                    "opp_ppg": 107,
                }
            },
            "team2": {
                "abbreviation": "BOS",
                "is_home": False,
                "stats_l10": {
                    "avg_margin": -2.0,  # Opponent averages -2
                    "ppg": 110,
                    "opp_ppg": 112,
                }
            }
        }

        result = await analyst._calculate_edge(game_data, None)

        # Projected margin = (8 - (-2)) / 2 + 3 (HCA) = 8
        # Cover margin = 8 - (-5) = 13 points → high cover prob
        assert result["projected_margin"] == 8.0
        assert result["cover_probability"] > 0.5
        assert result["edge"] > 0
        assert result["recommendation"] in ("BET", "LEAN_BET")

    @pytest.mark.asyncio
    async def test_calculate_edge_negative(self, analyst):
        """Test edge calculation with unfavorable margin - team projected to lose but favored"""
        game_data = {
            "line": -10.0,  # Team1 is a big favorite (needs to win by 10+)
            "team1": {
                "abbreviation": "LAL",
                "is_home": False,  # Away (no home court advantage)
                "stats_l10": {
                    "avg_margin": -5.0,  # Team1 has been losing by 5 on average
                    "ppg": 100,
                    "opp_ppg": 105,
                }
            },
            "team2": {
                "abbreviation": "BOS",
                "is_home": True,  # Home team
                "stats_l10": {
                    "avg_margin": 10.0,  # Team2 has been winning by 10
                    "ppg": 115,
                    "opp_ppg": 105,
                }
            }
        }

        result = await analyst._calculate_edge(game_data, None)

        # Team1 projects to lose significantly but is favored by 10 - negative edge
        # Projected margin: (-5 - 10) / 2 - 3 (away penalty) = -7.5 - 3 = -10.5
        # Cover margin: -10.5 - (-10) = -0.5
        # This gives a cover_prob near 0.5, which minus vig gives negative edge
        assert result["edge"] < 0
        assert result["recommendation"] in ("NO_BET", "FADE")

    @pytest.mark.asyncio
    async def test_calculate_edge_no_line(self, analyst):
        """Test edge calculation without spread line"""
        game_data = {
            "line": None,
            "team1": {"stats_l10": {"avg_margin": 5.0}},
            "team2": {"stats_l10": {"avg_margin": 3.0}},
        }

        result = await analyst._calculate_edge(game_data, None)

        assert result["recommendation"] == "NEED_LINE"
        assert "no_line_provided" in result["confidence_factors"]

    @pytest.mark.asyncio
    async def test_calculate_edge_no_stats(self, analyst):
        """Test edge calculation without stats"""
        game_data = {
            "line": -5.0,
            "team1": {},
            "team2": {},
        }

        result = await analyst._calculate_edge(game_data, None)

        assert "insufficient_stats" in result["confidence_factors"]

    @pytest.mark.asyncio
    async def test_kelly_fraction_capped(self, analyst):
        """Test Kelly fraction is capped at 5%"""
        game_data = {
            "line": -5.0,
            "team1": {
                "is_home": True,
                "stats_l10": {"avg_margin": 20.0}  # Very strong team
            },
            "team2": {
                "is_home": False,
                "stats_l10": {"avg_margin": -15.0}  # Very weak team
            }
        }

        result = await analyst._calculate_edge(game_data, None)

        # Even with huge edge, Kelly should be capped
        assert result["kelly_fraction"] <= 0.05


class TestQuantAnalystNode:
    """Tests for the full QuantAnalyst node"""

    @pytest.mark.asyncio
    async def test_node_with_valid_state(self, state_with_game_data):
        """Test node processes valid state"""
        result = await quant_analyst_node(state_with_game_data)

        assert result["current_node"] == "quant_analyst"
        assert result["quant_result"] is not None
        assert "edge" in result["quant_result"]
        assert "recommendation" in result["quant_result"]

    @pytest.mark.asyncio
    async def test_node_missing_game_data(self, initial_state):
        """Test node handles missing game data"""
        result = await quant_analyst_node(initial_state)

        assert result["current_node"] == "quant_analyst"
        assert result["quant_result"] is None
        assert "No game data for analysis" in result.get("errors", [])

    @pytest.mark.asyncio
    async def test_node_preserves_existing_state(self, state_with_game_data):
        """Test node preserves existing state fields"""
        result = await quant_analyst_node(state_with_game_data)

        assert result["query"] == state_with_game_data["query"]
        assert result["game_data"] == state_with_game_data["game_data"]

    @pytest.mark.asyncio
    async def test_node_with_line(self, sample_game_data, initial_state):
        """Test node with spread line"""
        state = {
            **initial_state,
            "game_data": {**sample_game_data, "line": -5.0},
        }
        result = await quant_analyst_node(state)

        quant = result.get("quant_result", {})
        assert quant.get("recommendation") != "NEED_LINE"
        assert "cover_probability" in quant

    @pytest.mark.asyncio
    async def test_node_confidence_factors(self, state_with_game_data):
        """Test node generates confidence factors"""
        result = await quant_analyst_node(state_with_game_data)

        quant = result.get("quant_result", {})
        assert "confidence_factors" in quant
        assert len(quant["confidence_factors"]) > 0


class TestFourFactors:
    """Tests for Four Factors analysis"""

    @pytest.mark.asyncio
    async def test_four_factors_with_teams(self, sample_game_data):
        """Test Four Factors with full team data"""
        analyst = QuantAnalystNode()
        result = await analyst._analyze_four_factors(sample_game_data)

        assert "team1_name" in result
        assert "team2_name" in result
        assert "factors" in result

    @pytest.mark.asyncio
    async def test_four_factors_empty(self):
        """Test Four Factors with empty data"""
        analyst = QuantAnalystNode()
        result = await analyst._analyze_four_factors({})

        assert result["team1_name"] == "T1"
        assert result["team2_name"] == "T2"
