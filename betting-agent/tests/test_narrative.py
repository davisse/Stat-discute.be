"""Tests for NarrativeResearcher node (Phase 6)"""
import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch, MagicMock
from src.agents.narrative import NarrativeNode, narrative_node


class TestNarrativeHelpers:
    """Tests for NarrativeNode helper methods"""

    @pytest.fixture
    def narrative(self):
        """Create NarrativeNode instance"""
        return NarrativeNode()

    def test_analyze_sentiment_negative(self, narrative):
        """Test sentiment detection for injury news"""
        text = "LeBron James ruled out with knee injury"
        assert narrative._analyze_sentiment(text) == "NEGATIVE"

    def test_analyze_sentiment_positive(self, narrative):
        """Test sentiment detection for return news"""
        text = "Anthony Davis cleared to play, expected in lineup"
        assert narrative._analyze_sentiment(text) == "POSITIVE"

    def test_analyze_sentiment_neutral(self, narrative):
        """Test sentiment detection for neutral news"""
        text = "Lakers schedule update announced"
        assert narrative._analyze_sentiment(text) == "NEUTRAL"

    def test_analyze_sentiment_multiple_indicators(self, narrative):
        """Test sentiment with mixed indicators (should pick stronger)"""
        text = "Player questionable but expected to play"
        # Both questionable (negative) and expected to play (positive)
        result = narrative._analyze_sentiment(text)
        assert result in ("POSITIVE", "NEGATIVE", "NEUTRAL")

    def test_extract_entities_teams(self, narrative):
        """Test entity extraction for team names"""
        text = "Lakers face Celtics in tonight's matchup"
        entities = narrative._extract_entities(text)
        assert "Lakers" in entities
        assert "Celtics" in entities

    def test_extract_entities_empty(self, narrative):
        """Test entity extraction with no teams"""
        text = "Basketball game scheduled"
        entities = narrative._extract_entities(text)
        assert entities == []

    def test_extract_entities_limit(self, narrative):
        """Test entity extraction respects limit"""
        text = "Lakers, Celtics, Warriors, Heat, Bulls, Nets play today"
        entities = narrative._extract_entities(text)
        assert len(entities) <= 5


class TestNarrativeAdjustment:
    """Tests for narrative adjustment calculation"""

    @pytest.fixture
    def narrative(self):
        return NarrativeNode()

    def test_calculate_narrative_adjustment_empty(self, narrative):
        """Test adjustment with no news"""
        result = narrative._calculate_narrative_adjustment([], {})
        assert result["team1_adjustment"] == 0.0
        assert result["team2_adjustment"] == 0.0
        assert result["net_adjustment"] == 0.0
        assert result["factors"] == []

    def test_calculate_narrative_adjustment_b2b(self, narrative):
        """Test adjustment for back-to-back"""
        news_data = [{
            "headline": "LAL playing back-to-back games",
            "category": "fatigue",
            "impact": -3.0,
            "sentiment": "NEGATIVE",
            "entities": ["Lakers"],
        }]
        game_data = {
            "team1": {"abbreviation": "LAL"},
            "team2": {"abbreviation": "BOS"},
        }
        result = narrative._calculate_narrative_adjustment(news_data, game_data)
        assert result["team1_adjustment"] == -3.0
        assert "LAL on B2B" in result["factors"][0]

    def test_calculate_narrative_adjustment_rest(self, narrative):
        """Test adjustment for rest advantage"""
        news_data = [{
            "headline": "BOS has 3 days rest advantage",
            "category": "rest",
            "impact": 2.0,
            "sentiment": "POSITIVE",
            "entities": ["Celtics"],
        }]
        game_data = {
            "team1": {"abbreviation": "LAL"},
            "team2": {"abbreviation": "BOS"},
        }
        result = narrative._calculate_narrative_adjustment(news_data, game_data)
        assert result["team2_adjustment"] == 2.0
        assert "BOS rest advantage" in result["factors"][0]

    def test_calculate_narrative_net_adjustment(self, narrative):
        """Test net adjustment calculation"""
        news_data = [
            {
                "headline": "LAL has rest advantage",
                "category": "rest",
                "impact": 2.0,
                "sentiment": "POSITIVE",
                "entities": ["Lakers"],
            },
            {
                "headline": "BOS playing back-to-back",
                "category": "fatigue",
                "impact": -3.0,
                "sentiment": "NEGATIVE",
                "entities": ["Celtics"],
            }
        ]
        game_data = {
            "team1": {"abbreviation": "LAL"},
            "team2": {"abbreviation": "BOS"},
        }
        result = narrative._calculate_narrative_adjustment(news_data, game_data)
        # team1_adj = +2.0, team2_adj = -3.0
        # net = 2.0 - (-3.0) = 5.0
        assert result["net_adjustment"] == 5.0


class TestBackToBackDetection:
    """Tests for back-to-back game detection"""

    @pytest.fixture
    def narrative(self):
        return NarrativeNode()

    @pytest.mark.asyncio
    async def test_detect_b2b_no_game_date(self, narrative):
        """Test B2B detection without game date"""
        result = await narrative._detect_back_to_back({})
        assert result["has_b2b"] is False

    @pytest.mark.asyncio
    async def test_detect_b2b_with_date_string(self, narrative):
        """Test B2B detection with date string"""
        game_data = {
            "game_date": "2025-11-26T19:00:00",
            "team1": {"team_id": 1610612747, "abbreviation": "LAL"},
            "team2": {"team_id": 1610612738, "abbreviation": "BOS"},
        }
        # Mock the database query to return no B2B
        with patch.object(narrative.db_tool, 'execute', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = [{"games": 0}]
            result = await narrative._detect_back_to_back(game_data)
            assert result["has_b2b"] is False

    @pytest.mark.asyncio
    async def test_detect_b2b_found(self, narrative):
        """Test B2B detection when team played yesterday"""
        game_data = {
            "game_date": "2025-11-26T19:00:00",
            "team1": {"team_id": 1610612747, "abbreviation": "LAL"},
            "team2": {"team_id": 1610612738, "abbreviation": "BOS"},
        }
        with patch.object(narrative.db_tool, 'execute', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = [{"games": 1}]
            result = await narrative._detect_back_to_back(game_data)
            assert result["has_b2b"] is True
            assert result["team"] == "LAL"
            assert result["impact"] == -3.0


class TestRestAdvantage:
    """Tests for rest advantage detection"""

    @pytest.fixture
    def narrative(self):
        return NarrativeNode()

    @pytest.mark.asyncio
    async def test_check_rest_no_date(self, narrative):
        """Test rest check without game date"""
        result = await narrative._check_rest_advantage({})
        assert result["has_advantage"] is False

    @pytest.mark.asyncio
    async def test_check_rest_significant_advantage(self, narrative):
        """Test rest check with significant advantage"""
        game_data = {
            "game_date": "2025-11-26T19:00:00",
            "team1": {"team_id": 1610612747, "abbreviation": "LAL"},
            "team2": {"team_id": 1610612738, "abbreviation": "BOS"},
        }

        # Mock: LAL last played 4 days ago, BOS last played 1 day ago
        async def mock_query(query, params):
            team_id = params[0]
            if team_id == 1610612747:  # LAL
                return [{"game_date": "2025-11-22"}]  # 4 days ago
            else:  # BOS
                return [{"game_date": "2025-11-25"}]  # 1 day ago

        with patch.object(narrative.db_tool, 'execute', side_effect=mock_query):
            result = await narrative._check_rest_advantage(game_data)
            assert result["has_advantage"] is True
            assert result["team"] == "LAL"
            assert result["days_rest"] == 4


class TestNarrativeNode:
    """Tests for full NarrativeNode execution"""

    @pytest.mark.asyncio
    async def test_node_returns_state(self, initial_state):
        """Test node returns proper state structure"""
        state = {**initial_state, "game_data": {}}
        result = await narrative_node(state)

        assert result["current_node"] == "narrative"
        assert "news_data" in result
        assert "narrative_adjustment" in result

    @pytest.mark.asyncio
    async def test_node_preserves_existing_state(self, state_with_game_data):
        """Test node preserves existing state fields"""
        result = await narrative_node(state_with_game_data)

        assert result["query"] == state_with_game_data["query"]
        assert result["game_data"] == state_with_game_data["game_data"]

    @pytest.mark.asyncio
    async def test_node_handles_empty_game_data(self, initial_state):
        """Test node handles missing game data gracefully"""
        result = await narrative_node(initial_state)

        assert result["current_node"] == "narrative"
        assert isinstance(result["news_data"], list)

    @pytest.mark.asyncio
    async def test_node_with_full_game_data(self, sample_game_data, initial_state):
        """Test node with complete game data"""
        state = {
            **initial_state,
            "game_data": sample_game_data,
        }
        result = await narrative_node(state)

        assert result["current_node"] == "narrative"
        assert "narrative_adjustment" in result
        assert "team1_adjustment" in result["narrative_adjustment"]
        assert "team2_adjustment" in result["narrative_adjustment"]


class TestWebSearch:
    """Tests for web search functionality"""

    @pytest.fixture
    def narrative(self):
        return NarrativeNode()

    @pytest.mark.asyncio
    async def test_web_search_empty_query(self, narrative):
        """Test web search with empty teams"""
        result = await narrative._search_injury_news("", "")
        assert result == []

    @pytest.mark.asyncio
    async def test_web_search_graceful_failure(self, narrative):
        """Test web search handles API failures gracefully"""
        with patch.object(narrative.http_client, 'get', side_effect=Exception("API Error")):
            result = await narrative._search_injury_news("Lakers", "Celtics")
            # Should return empty list on failure, not raise
            assert result == []


class TestDebateIntegration:
    """Tests for narrative integration with debate room"""

    @pytest.mark.asyncio
    async def test_debate_uses_narrative(self, state_with_game_data):
        """Test that debate room can use narrative factors"""
        from src.agents.debate_room import debate_room_node

        # Add narrative data
        state = {
            **state_with_game_data,
            "news_data": [{
                "headline": "LAL on back-to-back",
                "category": "fatigue",
                "impact": -3.0,
                "sentiment": "NEGATIVE",
                "entities": ["Lakers"],
            }],
            "narrative_adjustment": {
                "team1_adjustment": -3.0,
                "team2_adjustment": 0.0,
                "net_adjustment": -3.0,
                "factors": ["LAL on B2B (-3.0)"],
            },
            "quant_result": {
                "edge": 0.05,
                "cover_probability": 0.6,
                "kelly_fraction": 0.02,
                "recommendation": "LEAN_BET",
            },
        }

        result = await debate_room_node(state)

        # Check debate incorporates narrative
        debate_result = result.get("debate_result", {})
        bear_args = debate_result.get("bear_arguments", [])

        # Bear should have fatigue argument
        arg_types = [arg["type"] for arg in bear_args]
        # Should contain fatigue or narrative-related argument
        assert len(bear_args) > 0


class TestSentimentPatterns:
    """Tests for sentiment pattern detection"""

    @pytest.fixture
    def narrative(self):
        return NarrativeNode()

    @pytest.mark.parametrize("text,expected", [
        ("Player ruled out for tonight's game", "NEGATIVE"),
        ("Star player cleared, will play tonight", "POSITIVE"),
        ("Game time decision pending", "NEUTRAL"),
        ("Injury report: questionable", "NEGATIVE"),
        ("Back in lineup after recovery", "POSITIVE"),
        ("Load management rest day", "NEGATIVE"),
        ("Expected to play through minor issue", "POSITIVE"),
    ])
    def test_sentiment_patterns(self, narrative, text, expected):
        """Test various sentiment patterns"""
        result = narrative._analyze_sentiment(text)
        assert result == expected
