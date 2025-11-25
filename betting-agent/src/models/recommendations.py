"""Pydantic models for betting recommendations"""
from typing import Literal
from pydantic import BaseModel, Field


class BetRecommendation(BaseModel):
    """Structured betting recommendation output"""
    action: Literal["BET", "NO_BET", "WAIT"]
    selection: str = Field(description="Team or player selection")
    line: float = Field(description="Spread or total line")
    confidence: float = Field(ge=0.0, le=1.0, description="Calibrated confidence (max 0.85)")
    edge: float = Field(description="Code-verified edge percentage")
    key_factors: list[str] = Field(min_length=2, description="Supporting evidence")
    risk_factors: list[str] = Field(min_length=1, description="Counter-arguments")
    reasoning_trace: str = Field(description="Full debate transcript")
    similar_bets: list[dict] = Field(default_factory=list, description="Historical similar bets")


class HypothesisResult(BaseModel):
    """Result of backtesting a hypothesis"""
    hypothesis: str
    sample_size: int
    win_rate: float
    p_value: float
    significant: bool = Field(description="p_value < 0.05")
    recommendation: str = Field(description="ACCEPT or REJECT hypothesis")


class EdgeCalculation(BaseModel):
    """Result of edge calculation from Python sandbox"""
    implied_prob: float
    our_prob: float
    edge: float
    kelly_fraction: float = Field(ge=0.0, le=0.25, description="Suggested bet size")
    recommendation: Literal["BET", "NO_BET"]
