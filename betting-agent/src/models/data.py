"""Pydantic models for data structures"""
from datetime import datetime
from pydantic import BaseModel, Field


class PlayerStats(BaseModel):
    """Player statistics from NBA API or database"""
    player_id: int
    player_name: str
    games_played: int
    points_avg: float
    rebounds_avg: float
    assists_avg: float
    minutes_avg: float
    fg_pct: float
    three_pct: float
    ft_pct: float
    ts_pct: float = Field(description="True Shooting %")
    usage_rate: float = Field(description="Usage Rate %")
    last_n_games: int = Field(default=10, description="Sample size")


class GameData(BaseModel):
    """Game information for analysis"""
    game_id: str
    home_team: str
    away_team: str
    home_team_id: int
    away_team_id: int
    game_date: datetime
    spread: float = Field(description="Home team spread (negative = favorite)")
    total: float = Field(description="Over/Under line")
    home_ml: float = Field(description="Home moneyline (decimal odds)")
    away_ml: float = Field(description="Away moneyline (decimal odds)")


class OddsData(BaseModel):
    """Betting odds and market data"""
    game_id: str
    spread: float
    spread_home_odds: float = Field(description="Decimal odds")
    spread_away_odds: float = Field(description="Decimal odds")
    total: float
    over_odds: float
    under_odds: float
    home_ml: float
    away_ml: float
    public_home_pct: float = Field(ge=0.0, le=1.0, description="% of public on home")
    line_movement: float = Field(description="Change from open")
    timestamp: datetime
    data_quality: str = Field(default="FRESH", description="FRESH, STALE, or UNAVAILABLE")


class NewsItem(BaseModel):
    """News or injury report item"""
    headline: str
    source: str
    timestamp: datetime
    relevance_score: float = Field(ge=0.0, le=1.0)
    entities: list[str] = Field(default_factory=list, description="Players/teams mentioned")
    sentiment: str = Field(default="NEUTRAL", description="POSITIVE, NEGATIVE, NEUTRAL")
