#!/usr/bin/env python3
"""
Scooore.be NBA Betting Odds Scraper with Database Integration

Fetches NBA betting odds from Scooore.be (Belgian sportsbook powered by Kambi).
Extracts and stores:
  - Tier 1: Main lines (moneyline, spread, total) → betting_lines table
  - Tier 2: Player props (points, rebounds, assists, etc.) → player_props table
  - Tier 3: Alternative lines (alt spreads, alt totals) → alternative_lines table

API Provider: Kambi
Base URL: https://eu1.offering-api.kambicdn.com/offering/v2018/bnlbe/

Usage:
    python fetch_scooore_odds.py                     # Display only
    python fetch_scooore_odds.py --db                # Store to database
    python fetch_scooore_odds.py --db --full         # Store all tiers (fetch player props)
    python fetch_scooore_odds.py --save --format json # Save to JSON file

Author: Claude Code
Date: 2024-11-28
"""

import requests
import json
import csv
import sys
import os
import re
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Tuple
from dataclasses import dataclass, asdict, field

import psycopg2
from psycopg2.extras import RealDictCursor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Kambi API Configuration for Scooore.be (Belgium)
KAMBI_BASE_URL = "https://eu1.offering-api.kambicdn.com/offering/v2018/bnlbe"
OPERATOR_ID = "bnlbe"  # Scooore Belgium operator code
BOOKMAKER = "scooore"

# API Endpoints
ENDPOINTS = {
    "nba_matches": "/listView/basketball/nba/all/all/matches.json",
    "nba_competitions": "/listView/basketball/nba/all/all/competitions.json",
    "event_details": "/betoffer/event/{event_id}.json",
    "live_events": "/event/live/open.json",
    "groups": "/group.json",
}

# Default query parameters
DEFAULT_PARAMS = {
    "channel_id": "1",
    "client_id": "200",
    "lang": "fr_BE",
    "market": "BE",
    "useCombined": "true",
    "useCombinedLive": "true",
}

# BetOffer type IDs (Kambi standard)
BET_OFFER_TYPES = {
    1: "spread",      # Point Spread / Handicap
    2: "moneyline",   # Match Winner
    6: "total",       # Total Points Over/Under
    127: "player_prop",  # Player Props
}

# Player prop type mapping (Kambi criterion labels to our prop types)
PROP_TYPE_MAPPING = {
    "points": "points",
    "rebounds": "rebounds",
    "assists": "assists",
    "3-point field goals": "3pm",
    "three pointers": "3pm",
    "steals": "steals",
    "blocks": "blocks",
    "turnovers": "turnovers",
    "pts+reb+ast": "pra",
    "points + rebounds + assists": "pra",
    "points + rebounds": "points_rebounds",
    "points + assists": "points_assists",
    "rebounds + assists": "rebounds_assists",
    "steals + blocks": "steals_blocks",
    "double double": "double_double",
}

# Request headers (minimal, Kambi API is public)
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:130.0) Gecko/20100101 Firefox/130.0",
    "Accept": "application/json",
    "Accept-Language": "fr-BE,fr;q=0.9,en;q=0.8",
    "Origin": "https://www.scooore.be",
    "Referer": "https://www.scooore.be/",
}

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
    "dbname": os.getenv("DB_NAME", "nba_stats"),
    "user": os.getenv("DB_USER", "chapirou"),
    "password": os.getenv("DB_PASSWORD", ""),
}


@dataclass
class BettingLine:
    """Represents a single betting line/outcome."""
    event_id: int
    event_name: str
    home_team: str
    away_team: str
    start_time: str
    market_type: str       # moneyline, spread, total
    selection: str         # team name or Over/Under
    line: Optional[float]  # spread or total line (None for moneyline)
    decimal_odds: float    # European decimal odds
    american_odds: str     # American odds (+150, -110)
    bookmaker: str = BOOKMAKER
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()


@dataclass
class PlayerProp:
    """Represents a player proposition bet."""
    event_id: int
    player_name: str
    prop_type: str         # points, rebounds, assists, etc.
    line: float            # 27.5
    over_odds_decimal: float
    under_odds_decimal: float
    over_odds_american: Optional[str] = None
    under_odds_american: Optional[str] = None
    external_offer_id: Optional[str] = None


@dataclass
class AlternativeLine:
    """Represents an alternative spread or total line."""
    event_id: int
    line_type: str         # spread, total
    line_value: float      # -5.5 or 235.5
    # For spreads
    home_odds_decimal: Optional[float] = None
    away_odds_decimal: Optional[float] = None
    home_odds_american: Optional[str] = None
    away_odds_american: Optional[str] = None
    # For totals
    over_odds_decimal: Optional[float] = None
    under_odds_decimal: Optional[float] = None
    over_odds_american: Optional[str] = None
    under_odds_american: Optional[str] = None
    is_main_line: bool = False


@dataclass
class GameOdds:
    """Complete odds for a single game."""
    event_id: int
    event_name: str
    home_team: str
    away_team: str
    start_time: str
    # Main lines (Tier 1)
    home_moneyline_decimal: Optional[float] = None
    away_moneyline_decimal: Optional[float] = None
    spread: Optional[float] = None
    home_spread_odds_decimal: Optional[float] = None
    away_spread_odds_decimal: Optional[float] = None
    total: Optional[float] = None
    over_odds_decimal: Optional[float] = None
    under_odds_decimal: Optional[float] = None
    # Tier 2 & 3
    player_props: List[PlayerProp] = field(default_factory=list)
    alternative_lines: List[AlternativeLine] = field(default_factory=list)


def decimal_to_american(decimal_odds: float) -> int:
    """Convert decimal odds to American odds."""
    if decimal_odds >= 2.0:
        return round((decimal_odds - 1) * 100)
    else:
        return round(-100 / (decimal_odds - 1))


def parse_odds(raw_odds: int) -> float:
    """Convert Kambi raw odds (basis points) to decimal odds."""
    return raw_odds / 1000.0


def parse_line(raw_line: int) -> float:
    """Convert Kambi raw line (basis points) to actual line."""
    return raw_line / 1000.0


def fetch_nba_matches() -> dict:
    """Fetch NBA matches and betting offers from Kambi API."""
    url = f"{KAMBI_BASE_URL}{ENDPOINTS['nba_matches']}"

    try:
        response = requests.get(url, params=DEFAULT_PARAMS, headers=HEADERS, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching NBA matches: {e}")
        return {}


def fetch_event_details(event_id: int) -> dict:
    """Fetch detailed betting offers for a specific event (includes player props)."""
    url = f"{KAMBI_BASE_URL}{ENDPOINTS['event_details'].format(event_id=event_id)}"

    try:
        response = requests.get(url, params=DEFAULT_PARAMS, headers=HEADERS, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching event {event_id}: {e}")
        return {}


def extract_prop_type(criterion_label: str) -> Optional[str]:
    """Extract prop type from Kambi criterion label."""
    label_lower = criterion_label.lower()
    for key, prop_type in PROP_TYPE_MAPPING.items():
        if key in label_lower:
            return prop_type
    return None


def extract_player_name(outcome_label: str) -> str:
    """Extract player name from outcome label (e.g., 'LeBron James - Over')."""
    # Remove "Over", "Under", "Plus de", "Moins de" suffixes
    name = re.sub(r'\s*[-–]\s*(Over|Under|Plus de|Moins de).*$', '', outcome_label, flags=re.IGNORECASE)
    return name.strip()


def parse_game_odds(data: dict, fetch_full: bool = False) -> List[GameOdds]:
    """Parse Kambi API response into structured GameOdds objects."""
    games = []
    event_items = data.get("events", [])

    for item in event_items:
        event = item.get("event", {})
        bet_offers = item.get("betOffers", [])

        if not event:
            continue

        game = GameOdds(
            event_id=event.get("id"),
            event_name=event.get("name", ""),
            home_team=event.get("homeName", ""),
            away_team=event.get("awayName", ""),
            start_time=event.get("start", ""),
        )

        # Process main bet offers (Tier 1)
        for offer in bet_offers:
            offer_type_id = offer.get("betOfferType", {}).get("id")
            outcomes = offer.get("outcomes", [])

            if offer_type_id == 2:  # Moneyline
                for outcome in outcomes:
                    if outcome.get("status") != "OPEN":
                        continue
                    participant = outcome.get("participant", "")
                    decimal_odds = parse_odds(outcome.get("odds", 0))

                    if participant == game.home_team:
                        game.home_moneyline_decimal = decimal_odds
                    elif participant == game.away_team:
                        game.away_moneyline_decimal = decimal_odds

            elif offer_type_id == 1:  # Spread
                for outcome in outcomes:
                    if outcome.get("status") != "OPEN":
                        continue
                    participant = outcome.get("participant", "")
                    line = parse_line(outcome.get("line", 0))
                    decimal_odds = parse_odds(outcome.get("odds", 0))

                    if participant == game.home_team:
                        game.spread = line
                        game.home_spread_odds_decimal = decimal_odds
                    elif participant == game.away_team:
                        game.away_spread_odds_decimal = decimal_odds

            elif offer_type_id == 6:  # Total
                for outcome in outcomes:
                    if outcome.get("status") != "OPEN":
                        continue
                    label = outcome.get("label", "")
                    line = parse_line(outcome.get("line", 0))
                    decimal_odds = parse_odds(outcome.get("odds", 0))

                    if "Plus" in label or "Over" in label:
                        game.total = line
                        game.over_odds_decimal = decimal_odds
                    elif "Moins" in label or "Under" in label:
                        game.under_odds_decimal = decimal_odds

        # Fetch full event details for Tier 2 & 3 if requested
        if fetch_full and game.event_id:
            event_details = fetch_event_details(game.event_id)
            if event_details:
                parse_event_details(game, event_details)

        games.append(game)

    return games


def parse_event_details(game: GameOdds, event_data: dict) -> None:
    """Parse detailed event data for player props and alternative lines."""
    bet_offers = event_data.get("betOffers", [])

    for offer in bet_offers:
        offer_type_id = offer.get("betOfferType", {}).get("id")
        offer_id = offer.get("id")
        criterion = offer.get("criterion", {})
        criterion_label = criterion.get("englishLabel", criterion.get("label", ""))
        outcomes = offer.get("outcomes", [])

        if offer_type_id == 127:  # Player Props (Tier 2)
            prop_type = extract_prop_type(criterion_label)
            if not prop_type:
                continue

            # Group outcomes by player (over/under pairs)
            # Player name is in the 'participant' field, not the label
            player_outcomes = {}
            for outcome in outcomes:
                if outcome.get("status") != "OPEN":
                    continue

                player_name = outcome.get("participant", "")
                if not player_name:
                    continue

                label = outcome.get("label", "")
                english_label = outcome.get("englishLabel", label)
                line = parse_line(outcome.get("line", 0)) if outcome.get("line") else None
                decimal_odds = parse_odds(outcome.get("odds", 0))
                american_odds = outcome.get("oddsAmerican", "")

                if player_name not in player_outcomes:
                    player_outcomes[player_name] = {"line": line}

                if "Plus" in label or "Over" in english_label:
                    player_outcomes[player_name]["over_decimal"] = decimal_odds
                    player_outcomes[player_name]["over_american"] = american_odds
                    if line:
                        player_outcomes[player_name]["line"] = line
                elif "Moins" in label or "Under" in english_label:
                    player_outcomes[player_name]["under_decimal"] = decimal_odds
                    player_outcomes[player_name]["under_american"] = american_odds
                    if line:
                        player_outcomes[player_name]["line"] = line

            # Create PlayerProp objects
            for player_name, data in player_outcomes.items():
                if data.get("over_decimal") and data.get("under_decimal") and data.get("line"):
                    prop = PlayerProp(
                        event_id=game.event_id,
                        player_name=player_name,
                        prop_type=prop_type,
                        line=data["line"],
                        over_odds_decimal=data["over_decimal"],
                        under_odds_decimal=data["under_decimal"],
                        over_odds_american=data.get("over_american"),
                        under_odds_american=data.get("under_american"),
                        external_offer_id=str(offer_id),
                    )
                    game.player_props.append(prop)

        elif offer_type_id == 1:  # Alternative Spreads (Tier 3)
            # Check if this is an alternative line (not the main one)
            is_main = "MAIN" in offer.get("tags", [])

            home_data = {"line": None, "odds": None, "american": None}
            away_data = {"line": None, "odds": None, "american": None}

            for outcome in outcomes:
                if outcome.get("status") != "OPEN":
                    continue
                participant = outcome.get("participant", "")
                line = parse_line(outcome.get("line", 0)) if outcome.get("line") else None
                decimal_odds = parse_odds(outcome.get("odds", 0))
                american_odds = outcome.get("oddsAmerican", "")

                if participant == game.home_team:
                    home_data = {"line": line, "odds": decimal_odds, "american": american_odds}
                elif participant == game.away_team:
                    away_data = {"line": line, "odds": decimal_odds, "american": american_odds}

            if home_data["line"] is not None:
                alt_line = AlternativeLine(
                    event_id=game.event_id,
                    line_type="spread",
                    line_value=home_data["line"],
                    home_odds_decimal=home_data["odds"],
                    away_odds_decimal=away_data["odds"],
                    home_odds_american=home_data["american"],
                    away_odds_american=away_data["american"],
                    is_main_line=is_main,
                )
                game.alternative_lines.append(alt_line)

        elif offer_type_id == 6:  # Alternative Totals (Tier 3)
            is_main = "MAIN" in offer.get("tags", [])

            over_data = {"line": None, "odds": None, "american": None}
            under_data = {"line": None, "odds": None, "american": None}

            for outcome in outcomes:
                if outcome.get("status") != "OPEN":
                    continue
                label = outcome.get("label", "")
                line = parse_line(outcome.get("line", 0)) if outcome.get("line") else None
                decimal_odds = parse_odds(outcome.get("odds", 0))
                american_odds = outcome.get("oddsAmerican", "")

                if "Plus" in label or "Over" in label:
                    over_data = {"line": line, "odds": decimal_odds, "american": american_odds}
                elif "Moins" in label or "Under" in label:
                    under_data = {"line": line, "odds": decimal_odds, "american": american_odds}

            if over_data["line"] is not None:
                alt_line = AlternativeLine(
                    event_id=game.event_id,
                    line_type="total",
                    line_value=over_data["line"],
                    over_odds_decimal=over_data["odds"],
                    under_odds_decimal=under_data["odds"],
                    over_odds_american=over_data["american"],
                    under_odds_american=under_data["american"],
                    is_main_line=is_main,
                )
                game.alternative_lines.append(alt_line)


class ScoooreOddsStorage:
    """Database storage handler for Scooore/Kambi odds."""

    def __init__(self, dry_run: bool = False):
        self.conn = None
        self.dry_run = dry_run
        self.stats = {
            "events_mapped": 0,
            "betting_lines": 0,
            "player_props": 0,
            "alternative_lines": 0,
        }

    def connect(self) -> bool:
        """Connect to database."""
        try:
            self.conn = psycopg2.connect(**DB_CONFIG)
            logger.info("Connected to database")
            return True
        except psycopg2.Error as e:
            logger.error(f"Database connection error: {e}")
            return False

    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")

    def match_game_id(self, game: GameOdds) -> Optional[str]:
        """Match Kambi event to our game_id using team names and date.

        Note: Kambi times are in UTC. Games at 00:30 UTC are evening games
        in Eastern time (the day before). We check both dates.
        """
        if not self.conn:
            return None

        # Parse start time
        try:
            start_dt = datetime.fromisoformat(game.start_time.replace("Z", "+00:00"))
            game_date_utc = start_dt.date()
            # For games starting early morning UTC (00:00-08:00), also check previous day
            # as these are typically evening games in Eastern time
            game_date_prev = game_date_utc - timedelta(days=1)
        except:
            logger.warning(f"Could not parse start time: {game.start_time}")
            return None

        # Query using team aliases - check both dates
        query = """
            SELECT g.game_id
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            LEFT JOIN team_aliases ha ON ht.team_id = ha.team_id
            LEFT JOIN team_aliases aa ON at.team_id = aa.team_id
            WHERE (
                (ha.alias_name = %s OR ht.full_name = %s)
                AND (aa.alias_name = %s OR at.full_name = %s)
            )
            AND g.game_date IN (%s, %s)
            LIMIT 1
        """

        try:
            with self.conn.cursor() as cur:
                cur.execute(query, (
                    game.home_team, game.home_team,
                    game.away_team, game.away_team,
                    game_date_utc, game_date_prev
                ))
                result = cur.fetchone()
                if result:
                    logger.info(f"Matched {game.away_team} @ {game.home_team} → {result[0]}")
                    return result[0]
                else:
                    logger.warning(f"No match for {game.away_team} @ {game.home_team} on {game_date_prev}/{game_date_utc}")
                    return None
        except psycopg2.Error as e:
            logger.error(f"Error matching game: {e}")
            return None

    def store_bookmaker_event(self, game: GameOdds, game_id: Optional[str]) -> bool:
        """Store event mapping in bookmaker_events table."""
        if self.dry_run:
            logger.info(f"DRY RUN: Would store event {game.event_id} → {game_id}")
            return True

        query = """
            INSERT INTO bookmaker_events (
                bookmaker, external_event_id, game_id,
                home_team, away_team, event_start_time
            ) VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (bookmaker, external_event_id)
            DO UPDATE SET
                game_id = EXCLUDED.game_id,
                updated_at = NOW()
        """

        try:
            start_time = None
            try:
                start_time = datetime.fromisoformat(game.start_time.replace("Z", "+00:00"))
            except:
                pass

            with self.conn.cursor() as cur:
                cur.execute(query, (
                    BOOKMAKER,
                    str(game.event_id),
                    game_id,
                    game.home_team,
                    game.away_team,
                    start_time,
                ))
            self.conn.commit()
            self.stats["events_mapped"] += 1
            return True
        except psycopg2.Error as e:
            logger.error(f"Error storing bookmaker event: {e}")
            self.conn.rollback()
            return False

    def store_betting_line(self, game: GameOdds, game_id: str) -> bool:
        """Store main betting line in betting_lines table (Tier 1)."""
        if self.dry_run:
            logger.info(f"DRY RUN: Would store betting line for game {game_id}")
            return True

        # Convert decimal odds to American
        home_ml = decimal_to_american(game.home_moneyline_decimal) if game.home_moneyline_decimal else None
        away_ml = decimal_to_american(game.away_moneyline_decimal) if game.away_moneyline_decimal else None
        home_spread_odds = decimal_to_american(game.home_spread_odds_decimal) if game.home_spread_odds_decimal else None
        away_spread_odds = decimal_to_american(game.away_spread_odds_decimal) if game.away_spread_odds_decimal else None
        over_odds = decimal_to_american(game.over_odds_decimal) if game.over_odds_decimal else None
        under_odds = decimal_to_american(game.under_odds_decimal) if game.under_odds_decimal else None

        query = """
            INSERT INTO betting_lines (
                game_id, bookmaker,
                home_moneyline, away_moneyline,
                spread, home_spread_odds, away_spread_odds,
                total, over_odds, under_odds,
                line_source, recorded_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """

        try:
            with self.conn.cursor() as cur:
                cur.execute(query, (
                    game_id,
                    BOOKMAKER,
                    home_ml,
                    away_ml,
                    game.spread,
                    home_spread_odds,
                    away_spread_odds,
                    game.total,
                    over_odds,
                    under_odds,
                    "kambi",
                ))
            self.conn.commit()
            self.stats["betting_lines"] += 1
            logger.debug(f"Stored betting line for game {game_id}")
            return True
        except psycopg2.Error as e:
            logger.error(f"Error storing betting line: {e}")
            self.conn.rollback()
            return False

    def store_player_props(self, game: GameOdds, game_id: str) -> int:
        """Store player props in player_props table (Tier 2)."""
        if self.dry_run:
            logger.info(f"DRY RUN: Would store {len(game.player_props)} player props")
            return len(game.player_props)

        if not game.player_props:
            return 0

        query = """
            INSERT INTO player_props (
                game_id, player_name, bookmaker, prop_type,
                line, over_odds_decimal, under_odds_decimal,
                over_odds_american, under_odds_american,
                external_event_id, external_offer_id,
                recorded_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (game_id, player_name, bookmaker, prop_type, line, recorded_at)
            DO NOTHING
        """

        stored = 0
        try:
            with self.conn.cursor() as cur:
                for prop in game.player_props:
                    over_american = int(prop.over_odds_american) if prop.over_odds_american else decimal_to_american(prop.over_odds_decimal)
                    under_american = int(prop.under_odds_american) if prop.under_odds_american else decimal_to_american(prop.under_odds_decimal)

                    cur.execute(query, (
                        game_id,
                        prop.player_name,
                        BOOKMAKER,
                        prop.prop_type,
                        prop.line,
                        prop.over_odds_decimal,
                        prop.under_odds_decimal,
                        over_american,
                        under_american,
                        str(game.event_id),
                        prop.external_offer_id,
                    ))
                    stored += 1
            self.conn.commit()
            self.stats["player_props"] += stored
            logger.debug(f"Stored {stored} player props for game {game_id}")
            return stored
        except psycopg2.Error as e:
            logger.error(f"Error storing player props: {e}")
            self.conn.rollback()
            return 0

    def store_alternative_lines(self, game: GameOdds, game_id: str) -> int:
        """Store alternative lines in alternative_lines table (Tier 3)."""
        if self.dry_run:
            logger.info(f"DRY RUN: Would store {len(game.alternative_lines)} alternative lines")
            return len(game.alternative_lines)

        if not game.alternative_lines:
            return 0

        query = """
            INSERT INTO alternative_lines (
                game_id, bookmaker, line_type, line_value,
                home_odds_decimal, away_odds_decimal,
                home_odds_american, away_odds_american,
                over_odds_decimal, under_odds_decimal,
                over_odds_american, under_odds_american,
                is_main_line, external_event_id, recorded_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """

        stored = 0
        try:
            with self.conn.cursor() as cur:
                for alt in game.alternative_lines:
                    # Convert to American odds
                    home_american = decimal_to_american(alt.home_odds_decimal) if alt.home_odds_decimal else None
                    away_american = decimal_to_american(alt.away_odds_decimal) if alt.away_odds_decimal else None
                    over_american = decimal_to_american(alt.over_odds_decimal) if alt.over_odds_decimal else None
                    under_american = decimal_to_american(alt.under_odds_decimal) if alt.under_odds_decimal else None

                    cur.execute(query, (
                        game_id,
                        BOOKMAKER,
                        alt.line_type,
                        alt.line_value,
                        alt.home_odds_decimal,
                        alt.away_odds_decimal,
                        home_american,
                        away_american,
                        alt.over_odds_decimal,
                        alt.under_odds_decimal,
                        over_american,
                        under_american,
                        alt.is_main_line,
                        str(game.event_id),
                    ))
                    stored += 1
            self.conn.commit()
            self.stats["alternative_lines"] += stored
            logger.debug(f"Stored {stored} alternative lines for game {game_id}")
            return stored
        except psycopg2.Error as e:
            logger.error(f"Error storing alternative lines: {e}")
            self.conn.rollback()
            return 0

    def store_all(self, games: List[GameOdds]) -> Dict[str, int]:
        """Store all game odds to database."""
        if not self.connect():
            return self.stats

        try:
            for game in games:
                # Match to our game_id
                game_id = self.match_game_id(game)

                # Store event mapping (even without game_id match)
                self.store_bookmaker_event(game, game_id)

                if game_id:
                    # Tier 1: Main betting lines
                    self.store_betting_line(game, game_id)

                    # Tier 2: Player props
                    if game.player_props:
                        self.store_player_props(game, game_id)

                    # Tier 3: Alternative lines
                    if game.alternative_lines:
                        self.store_alternative_lines(game, game_id)

            return self.stats
        finally:
            self.close()


def format_for_display(games: List[GameOdds]) -> None:
    """Print betting odds in a formatted table."""
    print("\n" + "=" * 100)
    print(f"{'SCOOORE.BE NBA BETTING ODDS':^100}")
    print(f"{'(Powered by Kambi)':^100}")
    print("=" * 100)
    print(f"Fetched at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total games: {len(games)}")
    print("=" * 100 + "\n")

    for game in games:
        # Parse and format start time
        try:
            start_dt = datetime.fromisoformat(game.start_time.replace("Z", "+00:00"))
            start_str = start_dt.strftime("%a %d/%m %H:%M")
        except:
            start_str = game.start_time

        print(f"📅 {start_str}")
        print(f"🏀 {game.away_team} @ {game.home_team}")
        print("-" * 60)

        # Moneyline
        if game.home_moneyline_decimal and game.away_moneyline_decimal:
            print(f"  Moneyline:  {game.home_team}: {game.home_moneyline_decimal:.2f}  |  {game.away_team}: {game.away_moneyline_decimal:.2f}")

        # Spread
        if game.spread is not None and game.home_spread_odds_decimal:
            line_str = f"+{game.spread}" if game.spread > 0 else str(game.spread)
            print(f"  Spread:     {game.home_team} {line_str} @ {game.home_spread_odds_decimal:.2f}")

        # Total
        if game.total and game.over_odds_decimal and game.under_odds_decimal:
            print(f"  Total:      O {game.total} @ {game.over_odds_decimal:.2f}  |  U {game.total} @ {game.under_odds_decimal:.2f}")

        # Player props summary
        if game.player_props:
            print(f"  Props:      {len(game.player_props)} player props available")

        # Alternative lines summary
        if game.alternative_lines:
            spreads = len([a for a in game.alternative_lines if a.line_type == "spread"])
            totals = len([a for a in game.alternative_lines if a.line_type == "total"])
            print(f"  Alt Lines:  {spreads} spreads, {totals} totals")

        print()


def parse_bet_offers(data: dict) -> list[BettingLine]:
    """Parse Kambi API response into structured BettingLine objects (legacy format)."""
    betting_lines = []
    event_items = data.get("events", [])

    for item in event_items:
        event = item.get("event", {})
        bet_offers = item.get("betOffers", [])

        if not event or not bet_offers:
            continue

        event_id = event.get("id")
        event_name = event.get("name", "")
        home_team = event.get("homeName", "")
        away_team = event.get("awayName", "")
        start_time = event.get("start", "")

        for offer in bet_offers:
            offer_type_id = offer.get("betOfferType", {}).get("id")
            market_type = BET_OFFER_TYPES.get(offer_type_id, "unknown")

            if market_type == "unknown" or market_type == "player_prop":
                continue

            outcomes = offer.get("outcomes", [])

            for outcome in outcomes:
                if outcome.get("status") != "OPEN":
                    continue

                if market_type == "total":
                    selection = outcome.get("label", "")
                else:
                    selection = outcome.get("label", outcome.get("participant", ""))

                line = None
                if "line" in outcome:
                    line = parse_line(outcome["line"])
                elif "line" in offer:
                    line = parse_line(offer["line"])

                decimal_odds = parse_odds(outcome.get("odds", 0))
                american_odds = outcome.get("oddsAmerican", "")

                betting_line = BettingLine(
                    event_id=event_id,
                    event_name=event_name,
                    home_team=home_team,
                    away_team=away_team,
                    start_time=start_time,
                    market_type=market_type,
                    selection=selection,
                    line=line,
                    decimal_odds=decimal_odds,
                    american_odds=american_odds,
                )
                betting_lines.append(betting_line)

    return betting_lines


def save_to_json(games: List[GameOdds], filename: str) -> None:
    """Save game odds to JSON file."""
    data = {
        "bookmaker": BOOKMAKER,
        "provider": "kambi",
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "sport": "basketball",
        "league": "NBA",
        "games": [],
    }

    for game in games:
        game_dict = {
            "event_id": game.event_id,
            "event_name": game.event_name,
            "home_team": game.home_team,
            "away_team": game.away_team,
            "start_time": game.start_time,
            "main_lines": {
                "home_moneyline": game.home_moneyline_decimal,
                "away_moneyline": game.away_moneyline_decimal,
                "spread": game.spread,
                "home_spread_odds": game.home_spread_odds_decimal,
                "away_spread_odds": game.away_spread_odds_decimal,
                "total": game.total,
                "over_odds": game.over_odds_decimal,
                "under_odds": game.under_odds_decimal,
            },
            "player_props": [asdict(p) for p in game.player_props],
            "alternative_lines": [asdict(a) for a in game.alternative_lines],
        }
        data["games"].append(game_dict)

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✅ Saved {len(games)} games to {filename}")


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Fetch NBA betting odds from Scooore.be (Kambi)"
    )
    parser.add_argument(
        "--db",
        action="store_true",
        default=True,
        help="Store results to database (default: True)"
    )
    parser.add_argument(
        "--no-db",
        action="store_true",
        help="Skip database storage, display only"
    )
    parser.add_argument(
        "--full",
        action="store_true",
        default=True,
        help="Fetch full event details (player props, alt lines) (default: True)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate database operations without writing"
    )
    parser.add_argument(
        "--save",
        action="store_true",
        help="Save results to file"
    )
    parser.add_argument(
        "--format",
        choices=["json", "csv"],
        default="json",
        help="Output format (default: json)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Output filename (auto-generated if not specified)"
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress display output"
    )

    args = parser.parse_args()

    print("🏀 Fetching NBA odds from Scooore.be...")

    # Fetch data
    data = fetch_nba_matches()

    if not data:
        print("❌ Failed to fetch data")
        sys.exit(1)

    # Determine if we should store to database
    store_to_db = args.db and not args.no_db

    # Parse game odds (always fetch full details by default)
    games = parse_game_odds(data, fetch_full=args.full)

    if not games:
        print("⚠️ No games found")
        sys.exit(0)

    # Summary counts
    total_props = sum(len(g.player_props) for g in games)
    total_alts = sum(len(g.alternative_lines) for g in games)
    print(f"✅ Found {len(games)} games")
    if args.full:
        print(f"   - {total_props} player props")
        print(f"   - {total_alts} alternative lines")

    # Display results
    if not args.quiet:
        format_for_display(games)

    # Store to database
    if store_to_db:
        print("\n📊 Storing to database...")
        storage = ScoooreOddsStorage(dry_run=args.dry_run)
        stats = storage.store_all(games)
        print(f"\n✅ Database storage complete:")
        print(f"   - Events mapped: {stats['events_mapped']}")
        print(f"   - Betting lines: {stats['betting_lines']}")
        print(f"   - Player props: {stats['player_props']}")
        print(f"   - Alternative lines: {stats['alternative_lines']}")

    # Save to file
    if args.save:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        if args.output:
            filename = args.output
        else:
            data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "odds")
            os.makedirs(data_dir, exist_ok=True)
            filename = os.path.join(data_dir, f"scooore_nba_{timestamp}.{args.format}")

        save_to_json(games, filename)

    return games


if __name__ == "__main__":
    main()
