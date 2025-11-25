"""
Utility functions for Pinnacle odds scraping.
Helper functions for odds conversion, validation, and data normalization.
"""

import re
from typing import Optional, Tuple
from datetime import datetime, timedelta
import logging

from pinnacle_config import (
    TEAM_NAME_MAPPING,
    ODDS_MIN,
    ODDS_MAX,
    HANDICAP_MIN,
    HANDICAP_MAX
)

logger = logging.getLogger(__name__)


def decimal_to_american(decimal_odds: float) -> int:
    """
    Convert decimal odds to American format.

    Args:
        decimal_odds: Decimal odds (e.g., 1.925)

    Returns:
        American odds (e.g., -108)

    Examples:
        1.335 → -335 (favorite)
        3.570 → +357 (underdog)
        2.000 → +100 (even money)
    """
    if decimal_odds >= 2.0:
        # Underdog: positive American odds
        return int((decimal_odds - 1) * 100)
    else:
        # Favorite: negative American odds
        return int(-100 / (decimal_odds - 1))


def american_to_decimal(american_odds: int) -> float:
    """
    Convert American odds to decimal format.

    Args:
        american_odds: American odds (e.g., -335 or +357)

    Returns:
        Decimal odds (e.g., 1.335 or 3.570)

    Examples:
        -335 → 1.335
        +357 → 3.570
        +100 → 2.000
    """
    if american_odds > 0:
        return 1 + (american_odds / 100)
    else:
        return 1 + (100 / abs(american_odds))


def parse_team_name(pinnacle_name: str) -> Optional[str]:
    """
    Normalize Pinnacle team name to our database abbreviation.

    Args:
        pinnacle_name: Team name from Pinnacle (e.g., "L.A. Lakers")

    Returns:
        Database team abbreviation (e.g., "LAL") or None if not found

    Examples:
        "L.A. Lakers" → "LAL"
        "Los Angeles Lakers" → "LAL"
        "Golden State Warriors" → "GSW"
    """
    # First try direct mapping
    if pinnacle_name in TEAM_NAME_MAPPING:
        return TEAM_NAME_MAPPING[pinnacle_name]

    # Try removing periods and extra spaces
    normalized = pinnacle_name.replace('.', '').replace('  ', ' ').strip()
    if normalized in TEAM_NAME_MAPPING:
        return TEAM_NAME_MAPPING[normalized]

    # Try partial matching for city names
    for full_name, abbr in TEAM_NAME_MAPPING.items():
        if pinnacle_name in full_name or full_name in pinnacle_name:
            return abbr

    # Log unmapped team name for future updates
    logger.warning(f"Unmapped team name: '{pinnacle_name}'")
    return None


def validate_odds(odds_value: float) -> bool:
    """
    Validate that odds are within reasonable ranges.

    Args:
        odds_value: Decimal odds to validate

    Returns:
        True if valid, False otherwise

    Valid range: 1.01 to 50.0 (decimal format)
    """
    try:
        return ODDS_MIN <= odds_value <= ODDS_MAX
    except (TypeError, ValueError):
        return False


def validate_handicap(handicap_value: float) -> bool:
    """
    Validate that handicap/spread is within reasonable ranges.

    Args:
        handicap_value: Handicap to validate

    Returns:
        True if valid, False otherwise

    Valid range: -30.0 to +30.0 points
    """
    try:
        return HANDICAP_MIN <= handicap_value <= HANDICAP_MAX
    except (TypeError, ValueError):
        return False


def calculate_implied_probability(decimal_odds: float) -> float:
    """
    Calculate implied probability from decimal odds.

    Args:
        decimal_odds: Decimal odds (e.g., 1.925)

    Returns:
        Implied probability as percentage (e.g., 51.95)

    Formula: (1 / decimal_odds) * 100
    """
    try:
        return (1 / decimal_odds) * 100
    except (ZeroDivisionError, TypeError, ValueError):
        return 0.0


def calculate_juice(odds1: float, odds2: float) -> float:
    """
    Calculate the bookmaker's juice/vig from two-way market.

    Args:
        odds1: Decimal odds for first outcome
        odds2: Decimal odds for second outcome

    Returns:
        Juice as percentage (e.g., 4.5 for 4.5% juice)

    Lower juice = better value for bettors
    Standard juice is around 4-5%
    """
    prob1 = calculate_implied_probability(odds1)
    prob2 = calculate_implied_probability(odds2)
    total_prob = prob1 + prob2
    return total_prob - 100


def format_game_time(timestamp_ms: int) -> Tuple[datetime, str]:
    """
    Convert Unix timestamp to datetime and formatted string.

    Args:
        timestamp_ms: Unix timestamp in milliseconds

    Returns:
        Tuple of (datetime object, formatted string)

    Example:
        1761262200000 → (datetime(2025, 1, 23, 19, 30), "2025-01-23 19:30:00 EST")
    """
    try:
        dt = datetime.fromtimestamp(timestamp_ms / 1000)
        formatted = dt.strftime('%Y-%m-%d %H:%M:%S EST')
        return dt, formatted
    except (TypeError, ValueError, OSError):
        return datetime.now(), "Invalid timestamp"


def generate_market_key(market_type: str, period: str, team: str = None) -> str:
    """
    Generate unique market key for database storage.

    Args:
        market_type: Type of market (moneyline, spread, total)
        period: Period (full, 1h, 1q, etc.)
        team: Team name for team-specific markets

    Returns:
        Unique market key string

    Examples:
        ("moneyline", "full", "LAL") → "moneyline_full_LAL"
        ("total", "1h", None) → "total_1h"
        ("spread", "full", None) → "spread_full"
    """
    parts = [market_type, period]
    if team:
        parts.append(team)
    return "_".join(parts).lower()


def extract_period_from_category(category_key: str) -> str:
    """
    Extract period name from category key.

    Args:
        category_key: Category key from JSON ('0', '1', '3', '4')

    Returns:
        Human-readable period name

    Mapping:
        '0' → 'full'
        '1' → '1h' (1st half)
        '3' → '1q' (1st quarter)
        '4' → 'other'
    """
    period_mapping = {
        '0': 'full',
        '1': '1h',
        '3': '1q',
        '4': 'other'
    }
    return period_mapping.get(category_key, 'unknown')


def is_line_movement_significant(old_line: float, new_line: float,
                                market_type: str) -> bool:
    """
    Check if line movement is significant enough to alert.

    Args:
        old_line: Previous line value
        new_line: Current line value
        market_type: Type of market (spread, total, moneyline)

    Returns:
        True if movement is significant, False otherwise

    Thresholds:
        - Spread: 1.5+ points
        - Total: 3+ points
        - Moneyline: 10% change
    """
    if market_type == 'spread':
        return abs(new_line - old_line) >= 1.5
    elif market_type == 'total':
        return abs(new_line - old_line) >= 3.0
    elif market_type == 'moneyline':
        if old_line == 0:
            return False
        pct_change = abs((new_line - old_line) / old_line) * 100
        return pct_change >= 10
    return False


def calculate_closing_line_value(opening_odds: float, closing_odds: float,
                                bet_odds: float) -> float:
    """
    Calculate CLV (Closing Line Value) for a bet.

    Args:
        opening_odds: Opening line decimal odds
        closing_odds: Closing line decimal odds
        bet_odds: Odds at which bet was placed

    Returns:
        CLV percentage (positive = good value)

    Formula: ((bet_odds / closing_odds) - 1) * 100
    Positive CLV indicates you beat the closing line
    """
    try:
        clv = ((bet_odds / closing_odds) - 1) * 100
        return round(clv, 2)
    except (ZeroDivisionError, TypeError, ValueError):
        return 0.0


def get_time_window(game_time: datetime, hours: int = 2) -> Tuple[datetime, datetime]:
    """
    Get time window for matching games.

    Args:
        game_time: Scheduled game time
        hours: Window size in hours (default ±2 hours)

    Returns:
        Tuple of (start_time, end_time)

    Used for matching Pinnacle events to our games table
    accounting for schedule changes.

    Special handling: Games scheduled after midnight (before 6 AM)
    are stored with the previous day's date in the NBA database,
    so we expand the window to include the previous day.
    """
    start_window = game_time - timedelta(hours=hours)
    end_window = game_time + timedelta(hours=hours)

    # If game is scheduled in early morning (before 6 AM),
    # expand window to include previous day to catch games
    # stored with the previous day's date
    if game_time.hour < 6:
        start_window = start_window - timedelta(days=1)

    return start_window, end_window


def clean_json_response(response_text: str) -> str:
    """
    Clean potential issues in JSON response.

    Args:
        response_text: Raw response text

    Returns:
        Cleaned JSON string

    Handles:
        - BOM characters
        - Trailing commas
        - Invalid escape sequences
    """
    # Remove BOM if present
    if response_text.startswith('\ufeff'):
        response_text = response_text[1:]

    # Remove trailing commas before closing brackets/braces
    response_text = re.sub(r',\s*}', '}', response_text)
    response_text = re.sub(r',\s*]', ']', response_text)

    return response_text


def format_odds_display(decimal_odds: float, american_odds: int,
                       handicap: Optional[float] = None) -> str:
    """
    Format odds for display/logging.

    Args:
        decimal_odds: Decimal format odds
        american_odds: American format odds
        handicap: Optional handicap/spread

    Returns:
        Formatted string for display

    Examples:
        (1.925, -108, -7.5) → "-7.5 @ 1.925 (-108)"
        (3.570, +357, None) → "3.570 (+357)"
    """
    if handicap is not None:
        return f"{handicap:+.1f} @ {decimal_odds:.3f} ({american_odds:+d})"
    else:
        return f"{decimal_odds:.3f} ({american_odds:+d})"


# Export all utility functions
__all__ = [
    'decimal_to_american',
    'american_to_decimal',
    'parse_team_name',
    'validate_odds',
    'validate_handicap',
    'calculate_implied_probability',
    'calculate_juice',
    'format_game_time',
    'generate_market_key',
    'extract_period_from_category',
    'is_line_movement_significant',
    'calculate_closing_line_value',
    'get_time_window',
    'clean_json_response',
    'format_odds_display',
]