"""Pytest fixtures for NBA Bettor Agent tests"""
import pytest
import sqlite3
from pathlib import Path
from typing import Generator

from src.models.state import AgentState, create_initial_state


@pytest.fixture
def sample_game_data() -> dict:
    """Sample game data for testing"""
    return {
        "game_id": "0022500123",
        "game_date": "2025-11-25",
        "home_team": "Los Angeles Lakers",
        "home_abbr": "LAL",
        "away_team": "Boston Celtics",
        "away_abbr": "BOS",
        "line": -5.0,
        "selection": "LAL -5.0",
        "team1": {
            "name": "Los Angeles Lakers",
            "abbreviation": "LAL",
            "is_home": True,
            "stats_l10": {
                "games": 10,
                "wins": 6,
                "ppg": 115.5,
                "opp_ppg": 110.2,
                "avg_margin": 5.3,
                "fg_pct": 0.475,
                "fg3_pct": 0.365,
                "ft_pct": 0.785,
            },
            "recent_games": [],
        },
        "team2": {
            "name": "Boston Celtics",
            "abbreviation": "BOS",
            "is_home": False,
            "stats_l10": {
                "games": 10,
                "wins": 7,
                "ppg": 118.2,
                "opp_ppg": 108.5,
                "avg_margin": 9.7,
                "fg_pct": 0.485,
                "fg3_pct": 0.385,
                "ft_pct": 0.805,
            },
            "recent_games": [],
        },
        "head_to_head": [],
        "data_quality": "FRESH",
        "bet_type": "spread",
    }


@pytest.fixture
def sample_odds_data() -> dict:
    """Sample odds data for testing"""
    return {
        "spread_home": -5.0,
        "spread_away": 5.0,
        "spread_odds_home": 1.91,
        "spread_odds_away": 1.91,
        "moneyline_home": 1.65,
        "moneyline_away": 2.35,
        "total": 225.5,
        "over_odds": 1.91,
        "under_odds": 1.91,
        "data_quality": "FRESH",
        "timestamp": "2025-11-25T10:00:00",
    }


@pytest.fixture
def sample_quant_result() -> dict:
    """Sample quant analysis result"""
    return {
        "projected_margin": -2.7,
        "home_court_adjustment": 3.0,
        "final_margin": 0.3,
        "cover_probability": 0.507,
        "implied_probability": 0.5,
        "vig": 0.05,
        "edge": 0.007,
        "kelly_fraction": 0.014,
        "recommendation": "LEAN_BET",
        "confidence_factors": [
            "Positive edge",
            "Home court advantage factored",
            "L10 data available",
        ],
    }


@pytest.fixture
def sample_debate_result() -> dict:
    """Sample debate result"""
    return {
        "winner": "NEUTRAL",
        "debate_edge": 0.05,
        "bull_score": 0.62,
        "bear_score": 0.58,
        "bull_arguments": [
            {
                "type": "edge",
                "strength": 0.7,
                "text": "Calculated edge of 7% exceeds the 5% vig",
                "evidence": "Edge = 7.0%",
            }
        ],
        "bear_arguments": [
            {
                "type": "methodology",
                "strength": 0.6,
                "text": "L10 sample size is insufficient",
                "evidence": "10 games = 12% of season",
            }
        ],
    }


@pytest.fixture
def initial_state() -> AgentState:
    """Create initial agent state for testing"""
    return create_initial_state(query="Lakers -5 vs Celtics", depth="standard")


@pytest.fixture
def state_with_game_data(initial_state, sample_game_data) -> AgentState:
    """State with game data populated"""
    return {
        **initial_state,
        "game_data": sample_game_data,
        "current_node": "data_scout",
    }


@pytest.fixture
def state_with_quant(state_with_game_data, sample_quant_result) -> AgentState:
    """State with quant analysis completed"""
    return {
        **state_with_game_data,
        "quant_result": sample_quant_result,
        "current_node": "quant_analyst",
    }


@pytest.fixture
def full_state(state_with_quant, sample_debate_result) -> AgentState:
    """Fully populated state before judge"""
    return {
        **state_with_quant,
        "debate_result": sample_debate_result,
        "debate_transcript": "Bull vs Bear debate completed",
        "current_node": "debate_room",
    }


@pytest.fixture
def temp_db_path(tmp_path) -> Path:
    """Temporary database path for memory tests"""
    return tmp_path / "test_agent_memory.db"


@pytest.fixture
def memory_db(temp_db_path) -> Generator[sqlite3.Connection, None, None]:
    """Initialize temporary memory database"""
    from src.memory.init_db import init_database

    conn = init_database(temp_db_path)
    yield conn
    conn.close()
