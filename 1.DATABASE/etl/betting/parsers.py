"""
Pinnacle Market Parser
Extracts all betting markets from Pinnacle API compressed structure.

Complete Structure Documentation:
- Game data at: data['e'][3]
  - [0]: event_id
  - [1]: away_team
  - [2]: home_team
  - [4]: start_time (Unix ms)
  - [8]: markets dict with keys '0', '1', '3', '4'

- Markets per category at: data['e'][3][8][key]
  - [0]: Main lines (2 per category)
  - [1]: List of dicts with player props/special markets
  - [2]: Alternative lines
  - [3]: Additional lines
  - [4]: Moneyline [home_odds, away_odds, None]
"""

from typing import List, Dict, Optional, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class PinnacleMarketParser:
    """
    Parses Pinnacle betting markets from compressed JSON structure.

    Extracts ~120-130 markets per NBA game:
    - Moneylines (4)
    - Main lines (8)
    - Additional lines (30)
    - Alternative lines (30)
    - Player props & special markets (57)
    """

    # Period category mapping
    # Key: period key from API
    # Value: period name (market type will be appended by parsing functions)
    CATEGORY_NAMES = {
        '0': 'Game',        # Full game period
        '1': 'Team',        # Team-specific markets
        '3': '1st Half',    # First half period
        '4': '1st Quarter'  # First quarter period
    }

    def __init__(self, raw_data: Dict[str, Any]):
        """
        Initialize parser with raw Pinnacle API response.

        Args:
            raw_data: Complete JSON response from Pinnacle API
        """
        self.raw_data = raw_data
        self.event_data = self._extract_event_data()
        self.markets: List[Dict[str, Any]] = []

    def _extract_event_data(self) -> Optional[List[Any]]:
        """
        Extract event data from response structure.

        Returns compressed array format:
        [0] = event_id (int)
        [1] = away_team (str)
        [2] = home_team (str)
        [4] = start_time (int, Unix timestamp ms)
        [8] = markets (dict)
        """
        try:
            # Try 'e' key first (individual event response)
            events = self.raw_data.get('e', [])
            if len(events) > 3 and isinstance(events[3], list):
                return events[3]

            # Try 'n' key (events list response)
            # Structure: n[0][2][0][2][0] = first game in NBA league
            n_data = self.raw_data.get('n', [])
            if n_data and isinstance(n_data, list) and len(n_data) > 0:
                basketball = n_data[0]  # Basketball category
                if isinstance(basketball, list) and len(basketball) > 2:
                    leagues = basketball[2]  # Leagues array
                    for league in leagues:
                        if isinstance(league, list) and len(league) > 2:
                            # Check if this is NBA (league ID 487)
                            if league[0] == 487 and league[1] == "NBA":
                                games = league[2]  # Games array
                                if isinstance(games, list) and len(games) > 0:
                                    # Return first game (we'll handle multiple games later)
                                    return games[0]
            return None
        except (KeyError, IndexError, TypeError) as e:
            logger.error(f"Failed to extract event data: {e}")
            return None

    def get_event_info(self) -> Dict[str, Any]:
        """
        Extract basic event information from compressed array.

        Returns:
            {
                'event_id': str,
                'game_name': str,
                'start_time': datetime,
                'home_team': str,
                'away_team': str
            }
        """
        if not self.event_data or not isinstance(self.event_data, list):
            return {}

        try:
            event_id = str(self.event_data[0]) if len(self.event_data) > 0 else ''
            # e[3][1] is home team, e[3][2] is away team
            home_team = str(self.event_data[1]) if len(self.event_data) > 1 else 'Unknown'
            away_team = str(self.event_data[2]) if len(self.event_data) > 2 else 'Unknown'
            start_time_ms = self.event_data[4] if len(self.event_data) > 4 else 0

            start_time = datetime.fromtimestamp(start_time_ms / 1000) if start_time_ms else None
            game_name = f"{away_team} @ {home_team}"

            return {
                'event_id': event_id,
                'game_name': game_name,
                'start_time': start_time,
                'away_team': away_team,
                'home_team': home_team
            }
        except (IndexError, ValueError, TypeError) as e:
            logger.error(f"Error parsing event info: {e}")
            return {}

    def parse_all_markets(self) -> List[Dict[str, Any]]:
        """
        Parse all markets from the event.

        Returns:
            List of market dictionaries with structure:
            {
                'market_key': str,
                'market_name': str,
                'category': str,
                'line': Optional[float],
                'odds': List[{
                    'selection': str,
                    'odds_decimal': float,
                    'odds_american': int,
                    'handicap': Optional[float]
                }]
            }
        """
        if not self.event_data:
            logger.warning("No event data available for parsing")
            return []

        self.markets = []

        # Parse compressed markets structure at index [8]
        if len(self.event_data) <= 8:
            logger.warning("No markets data available (index 8 missing)")
            return []

        compressed = self.event_data[8]
        if not isinstance(compressed, dict):
            logger.warning(f"Markets data is not a dict: {type(compressed)}")
            return []

        # Parse each category
        for key, market_array in compressed.items():
            period_name = self.CATEGORY_NAMES.get(key, f'Period_{key}')

            if not isinstance(market_array, list):
                continue

            # Parse based on actual data structure:
            # market_array[0] = Spreads/Handicaps
            # market_array[1] = Totals (Over/Under)
            # market_array[2] = Moneyline
            self.markets.extend(self._parse_spreads(market_array, period_name, key))
            self.markets.extend(self._parse_totals(market_array, period_name, key))
            self.markets.extend(self._parse_moneyline(market_array, period_name, key))
            self.markets.extend(self._parse_player_props(market_array, period_name, key))

        logger.info(f"Parsed {len(self.markets)} markets from event {self.get_event_info().get('event_id')}")
        return self.markets

    def _parse_spreads(
        self,
        market_array: List[Any],
        period_name: str,
        period_key: str
    ) -> List[Dict[str, Any]]:
        """
        Parse spread/handicap lines from market_array[2].

        Format: [[away_handicap, home_handicap, 'display_line', 'away_odds', 'home_odds', ...], ...]
        Example: [13.5, -13.5, "13.5", "2.420", "1.613", ...]
                 (away=SAC +13.5 @ 2.420, home=DEN -13.5 @ 1.613)
        """
        markets = []

        try:
            # Spreads are at index [2]
            if len(market_array) < 3:
                return markets

            spread_array = market_array[2]
            if not isinstance(spread_array, list):
                return markets

            event_info = self.get_event_info()
            team1 = event_info.get('home_team', 'Team1')  # e[3][1]
            team2 = event_info.get('away_team', 'Team2')  # e[3][2]

            for line_data in spread_array:
                if not isinstance(line_data, list) or len(line_data) < 5:
                    continue

                try:
                    # Array order is [away_handicap, home_handicap, display, away_odds, home_odds]
                    away_handicap = float(line_data[0])  # e.g., 13.5
                    home_handicap = float(line_data[1])  # e.g., -13.5
                    display_line = str(line_data[2])      # e.g., "13.5"
                    away_odds = float(line_data[3])      # e.g., "2.420"
                    home_odds = float(line_data[4])      # e.g., "1.613"

                    # Assign to teams: team1=home gets [1] and [4], team2=away gets [0] and [3]
                    team1_handicap = home_handicap  # home team gets home handicap
                    team2_handicap = away_handicap  # away team gets away handicap
                    team1_odds = home_odds          # home team gets home odds
                    team2_odds = away_odds          # away team gets away odds

                    markets.append({
                        'market_key': f"{period_key}_spread_{display_line.replace('.', '_')}",
                        'market_name': f"{period_name} Spread {display_line}",
                        'market_type': 'spread',
                        'category': f"{period_name} - Spread",
                        'line': float(display_line),
                        'odds': [
                            {
                                'selection': f"{team1} ({team1_handicap:+.1f})",
                                'odds_decimal': team1_odds,
                                'odds_american': self._decimal_to_american(team1_odds),
                                'handicap': team1_handicap
                            },
                            {
                                'selection': f"{team2} ({team2_handicap:+.1f})",
                                'odds_decimal': team2_odds,
                                'odds_american': self._decimal_to_american(team2_odds),
                                'handicap': team2_handicap
                            }
                        ]
                    })

                except (ValueError, TypeError, IndexError) as e:
                    logger.debug(f"Skipping spread line due to parsing error: {e}")
                    continue

        except Exception as e:
            logger.error(f"Error parsing spreads for {period_name}: {e}")

        return markets

    def _parse_totals(
        self,
        market_array: List[Any],
        period_name: str,
        period_key: str
    ) -> List[Dict[str, Any]]:
        """
        Parse total (over/under) lines from market_array.

        Structure:
        - market_array[0][0] = Home team totals (e.g., Denver 125.5)
        - market_array[0][1] = Away team totals (e.g., Sacramento 114.5)
        - market_array[3] = Game totals (combined score, e.g., 238.0-243.0)

        Format: [['display_line', line_value, 'over_odds', 'under_odds', ...], ...]
        Example: ["125.5", 125.5, "1.854", "2.000", ...]
        """
        markets = []

        # Get team names for proper labeling
        home_team = str(self.event_data[1]) if self.event_data and len(self.event_data) > 1 else 'Home'
        away_team = str(self.event_data[2]) if self.event_data and len(self.event_data) > 2 else 'Away'

        try:
            # Parse HOME team totals from [0][0]
            if len(market_array) >= 1 and isinstance(market_array[0], list) and len(market_array[0]) > 0:
                home_team_totals = market_array[0][0] if isinstance(market_array[0][0], list) else []

                for line_data in home_team_totals:
                    if not isinstance(line_data, list) or len(line_data) < 4:
                        continue

                    try:
                        display_line = str(line_data[0])    # e.g., "125.5"
                        line_value = float(line_data[1])    # e.g., 125.5
                        over_odds = float(line_data[2])     # e.g., "1.854"
                        under_odds = float(line_data[3])    # e.g., "2.000"

                        markets.append({
                            'market_key': f"{period_key}_team_total_home_{display_line.replace('.', '_')}",
                            'market_name': f"{period_name} {home_team} Team Total {display_line}",
                            'market_type': 'total',
                            'category': f"{period_name} - Team Total",
                            'line': line_value,
                            'odds': [
                                {
                                    'selection': f"{home_team} Over {display_line}",
                                    'odds_decimal': over_odds,
                                    'odds_american': self._decimal_to_american(over_odds),
                                    'handicap': line_value
                                },
                                {
                                    'selection': f"{home_team} Under {display_line}",
                                    'odds_decimal': under_odds,
                                    'odds_american': self._decimal_to_american(under_odds),
                                    'handicap': line_value
                                }
                            ]
                        })

                    except (ValueError, TypeError, IndexError) as e:
                        logger.debug(f"Skipping home team total line due to parsing error: {e}")
                        continue

            # Parse AWAY team totals from [0][1]
            if len(market_array) >= 1 and isinstance(market_array[0], list) and len(market_array[0]) > 1:
                away_team_totals = market_array[0][1] if isinstance(market_array[0][1], list) else []

                for line_data in away_team_totals:
                    if not isinstance(line_data, list) or len(line_data) < 4:
                        continue

                    try:
                        display_line = str(line_data[0])    # e.g., "114.5"
                        line_value = float(line_data[1])    # e.g., 114.5
                        over_odds = float(line_data[2])     # e.g., "1.943"
                        under_odds = float(line_data[3])    # e.g., "1.909"

                        markets.append({
                            'market_key': f"{period_key}_team_total_away_{display_line.replace('.', '_')}",
                            'market_name': f"{period_name} {away_team} Team Total {display_line}",
                            'market_type': 'total',
                            'category': f"{period_name} - Team Total",
                            'line': line_value,
                            'odds': [
                                {
                                    'selection': f"{away_team} Over {display_line}",
                                    'odds_decimal': over_odds,
                                    'odds_american': self._decimal_to_american(over_odds),
                                    'handicap': line_value
                                },
                                {
                                    'selection': f"{away_team} Under {display_line}",
                                    'odds_decimal': under_odds,
                                    'odds_american': self._decimal_to_american(under_odds),
                                    'handicap': line_value
                                }
                            ]
                        })

                    except (ValueError, TypeError, IndexError) as e:
                        logger.debug(f"Skipping away team total line due to parsing error: {e}")
                        continue

            # Parse GAME totals (combined score) from [3]
            if len(market_array) >= 4 and isinstance(market_array[3], list):
                game_totals = market_array[3]

                for line_data in game_totals:
                    if not isinstance(line_data, list) or len(line_data) < 4:
                        continue

                    try:
                        display_line = str(line_data[0])    # e.g., "243.0"
                        line_value = float(line_data[1])    # e.g., 243.0
                        over_odds = float(line_data[2])     # e.g., "2.200"
                        under_odds = float(line_data[3])    # e.g., "1.719"

                        markets.append({
                            'market_key': f"{period_key}_game_total_{display_line.replace('.', '_')}",
                            'market_name': f"{period_name} Game Total {display_line}",
                            'market_type': 'total',
                            'category': f"{period_name} - Game Total",
                            'line': line_value,
                            'odds': [
                                {
                                    'selection': f"Over {display_line}",
                                    'odds_decimal': over_odds,
                                    'odds_american': self._decimal_to_american(over_odds),
                                    'handicap': line_value
                                },
                                {
                                    'selection': f"Under {display_line}",
                                    'odds_decimal': under_odds,
                                    'odds_american': self._decimal_to_american(under_odds),
                                    'handicap': line_value
                                }
                            ]
                        })

                    except (ValueError, TypeError, IndexError) as e:
                        logger.debug(f"Skipping alternative total line due to parsing error: {e}")
                        continue

        except Exception as e:
            logger.error(f"Error parsing totals for {period_name}: {e}")

        return markets

    def _parse_moneyline(
        self,
        market_array: List[Any],
        period_name: str,
        period_key: str
    ) -> List[Dict[str, Any]]:
        """
        Parse moneyline from market_array[4].

        Format: [away_odds, home_odds, None, ...]
        Example: ["5.180", "1.192", None, ...]  (away=5.180, home=1.192)
        """
        markets = []

        try:
            # Moneyline is at index [4]
            if len(market_array) < 5:
                return markets

            moneyline_array = market_array[4]
            if not isinstance(moneyline_array, list) or len(moneyline_array) < 2:
                return markets

            # Array order is [away_odds, home_odds]
            away_odds_str = moneyline_array[0]
            home_odds_str = moneyline_array[1]

            if not away_odds_str or not home_odds_str:
                return markets

            event_info = self.get_event_info()
            team1 = event_info.get('home_team', 'Team1')  # e[3][1]
            team2 = event_info.get('away_team', 'Team2')  # e[3][2]

            # Assign odds: team1=home gets [1], team2=away gets [0]
            team1_odds = float(home_odds_str)
            team2_odds = float(away_odds_str)

            # Create single moneyline market with both teams
            markets.append({
                'market_key': f"{period_key}_moneyline",
                'market_name': f"{period_name} Moneyline",
                'market_type': 'moneyline',
                'category': f"{period_name} - Moneyline",
                'line': None,
                'odds': [
                    {
                        'selection': team1,
                        'odds_decimal': team1_odds,
                        'odds_american': self._decimal_to_american(team1_odds),
                        'handicap': None
                    },
                    {
                        'selection': team2,
                        'odds_decimal': team2_odds,
                        'odds_american': self._decimal_to_american(team2_odds),
                        'handicap': None
                    }
                ]
            })

        except (ValueError, TypeError, IndexError) as e:
            logger.debug(f"Error parsing moneyline for {period_name}: {e}")

        return markets

    def _parse_player_props(
        self,
        market_array: List[Any],
        category_name: str,
        category_key: str
    ) -> List[Dict[str, Any]]:
        """
        Parse player props and special markets from element [1].

        Element [1] contains a list of dicts with structure:
        {
            'cg': category (e.g., "Player Props", "Game Props"),
            'se': [list of markets],
            ...
        }

        Each market in 'se':
        {
            'n': market name (e.g., "Aaron Nesmith (3 Point FG)"),
            'un': unit (e.g., "ThreePointFieldGoals"),
            'bt': bet type (e.g., "OVER_UNDER"),
            'l': [list of offers],
            ...
        }

        Each offer in 'l':
        {
            'n': offer name (e.g., "Over", "Under"),
            'p': price/odds,
            'h': handicap/line
        }
        """
        markets = []

        try:
            if len(market_array) < 2:
                return markets

            elem_1 = market_array[1]
            if not isinstance(elem_1, list):
                return markets

            # Only parse for first category to avoid duplicates
            if category_key != '0':
                return markets

            # Iterate through list looking for dicts with 'se'
            for item in elem_1:
                if not isinstance(item, dict) or 'se' not in item:
                    continue

                market_category = item.get('cg', 'Unknown')
                se_array = item['se']

                if not isinstance(se_array, list):
                    continue

                # Parse each market in 'se'
                for market in se_array:
                    if not isinstance(market, dict):
                        continue

                    try:
                        market_name = market.get('n', 'Unknown Market')
                        unit = market.get('un')
                        bet_type = market.get('bt', 'Unknown')
                        offers_list = market.get('l', [])

                        if not offers_list:
                            continue

                        # Generate market key
                        market_key_base = market_name.lower().replace(' ', '_').replace('(', '').replace(')', '').replace('/', '_')
                        market_key = f"prop_{market_key_base}"

                        # Parse odds offers
                        odds = []
                        for offer in offers_list:
                            if not isinstance(offer, dict):
                                continue

                            selection = offer.get('n', 'Unknown')
                            odds_price = offer.get('p')
                            handicap = offer.get('h')

                            if not odds_price:
                                continue

                            try:
                                odds_decimal = float(odds_price)
                                odds.append({
                                    'selection': selection,
                                    'odds_decimal': odds_decimal,
                                    'odds_american': self._decimal_to_american(odds_decimal),
                                    'handicap': float(handicap) if handicap is not None else None
                                })
                            except (ValueError, TypeError):
                                continue

                        if odds:
                            # Determine line from first offer's handicap
                            line = odds[0]['handicap'] if odds[0]['handicap'] is not None else None

                            markets.append({
                                'market_key': market_key,
                                'market_name': market_name,
                                'category': market_category,
                                'line': line,
                                'unit': unit,
                                'bet_type': bet_type,
                                'odds': odds
                            })

                    except Exception as e:
                        logger.debug(f"Skipping malformed player prop: {e}")
                        continue

        except Exception as e:
            logger.error(f"Error parsing player props for {category_name}: {e}")

        return markets

    @staticmethod
    def _decimal_to_american(decimal_odds: float) -> int:
        """
        Convert decimal odds to American format.

        Args:
            decimal_odds: Decimal odds (e.g., 1.925)

        Returns:
            American odds (e.g., -108)
        """
        if decimal_odds >= 2.0:
            return int((decimal_odds - 1) * 100)
        else:
            return int(-100 / (decimal_odds - 1))

    def get_market_summary(self) -> Dict[str, int]:
        """
        Get summary statistics of parsed markets.

        Returns:
            {
                'total': int,
                'moneylines': int,
                'main_lines': int,
                'additional_lines': int,
                'alternative_lines': int,
                'player_props': int,
                'special_markets': int
            }
        """
        if not self.markets:
            self.parse_all_markets()

        summary = {
            'total': len(self.markets),
            'moneylines': 0,
            'main_lines': 0,
            'additional_lines': 0,
            'alternative_lines': 0,
            'player_props': 0,
            'special_markets': 0
        }

        for market in self.markets:
            category = market.get('category', '')
            market_name = market.get('market_name', '')

            if 'Moneyline' in category:
                summary['moneylines'] += 1
            elif 'Main' in category:
                summary['main_lines'] += 1
            elif 'Additional' in category:
                summary['additional_lines'] += 1
            elif 'Alternative' in category:
                summary['alternative_lines'] += 1
            elif 'Player Props' in category:
                summary['player_props'] += 1
            else:
                summary['special_markets'] += 1

        return summary


def parse_pinnacle_response(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convenience function to parse Pinnacle API response.

    Args:
        raw_data: Complete JSON response from Pinnacle API

    Returns:
        {
            'event_info': dict,
            'markets': list,
            'summary': dict,
            'fetched_at': datetime
        }
    """
    parser = PinnacleMarketParser(raw_data)

    return {
        'event_info': parser.get_event_info(),
        'markets': parser.parse_all_markets(),
        'summary': parser.get_market_summary(),
        'fetched_at': datetime.now()
    }


def extract_all_nba_games(raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extract all NBA games from events list response.

    DEPRECATED: Use extract_all_nba_games_compact() for compact events endpoint.

    Args:
        raw_data: Complete JSON response from Pinnacle events list API

    Returns:
        List of game info dictionaries
    """
    games = []

    try:
        # Structure: n[0][2][league][2][games]
        n_data = raw_data.get('n', [])
        if not n_data or not isinstance(n_data, list):
            return games

        basketball = n_data[0] if len(n_data) > 0 else None
        if not basketball or not isinstance(basketball, list) or len(basketball) <= 2:
            return games

        leagues = basketball[2]
        for league in leagues:
            if isinstance(league, list) and len(league) > 2:
                # Check if this is NBA (league ID 487)
                if league[0] == 487 and league[1] == "NBA":
                    game_list = league[2]
                    if isinstance(game_list, list):
                        for game_data in game_list:
                            if isinstance(game_data, list) and len(game_data) > 4:
                                game_info = {
                                    'event_id': str(game_data[0]) if len(game_data) > 0 else '',
                                    'home_team': game_data[1] if len(game_data) > 1 else 'Unknown',
                                    'away_team': game_data[2] if len(game_data) > 2 else 'Unknown',
                                    'start_time': datetime.fromtimestamp(game_data[4] / 1000) if len(game_data) > 4 and game_data[4] else None,
                                    'game_name': f"{game_data[2]} @ {game_data[1]}" if len(game_data) > 2 else 'Unknown',
                                    'raw_data': game_data  # Keep raw data for detailed parsing
                                }
                                games.append(game_info)
                    break  # Found NBA, no need to continue

    except (KeyError, IndexError, TypeError) as e:
        logger.error(f"Error extracting NBA games: {e}")

    logger.info(f"Extracted {len(games)} NBA games from response")
    return games


def extract_all_nba_games_compact(raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extract all NBA games from compact events list endpoint.

    This is the CORRECT function for the compact events endpoint:
    /sports-service/sv/compact/events?lg=487&sp=4&hle=true

    Structure: data['hle'][0][2][0][2] contains array of NBA events

    Args:
        raw_data: Complete JSON response from Pinnacle compact events API

    Returns:
        List of game info dictionaries with structure:
        {
            'event_id': str,
            'home_team': str,
            'away_team': str,
            'num_markets': int,
            'start_time': datetime,
            'markets': dict,
            'game_name': str,
            'raw_data': list
        }

    Example:
        >>> response = requests.get('/compact/events?lg=487&sp=4&hle=true')
        >>> games = extract_all_nba_games_compact(response.json())
        >>> print(f"Found {len(games)} NBA games")
    """
    games = []

    try:
        # Correct structure for compact events endpoint
        # Path: data['hle'][0][2][0][2]
        #   hle[0] = Basketball sport
        #   hle[0][2] = Leagues array
        #   hle[0][2][0] = NBA league
        #   hle[0][2][0][2] = NBA events array

        hle_data = raw_data.get('hle', [])
        if not hle_data or not isinstance(hle_data, list) or len(hle_data) == 0:
            logger.warning("No 'hle' data found in response")
            return games

        # Navigate to Basketball sport
        basketball = hle_data[0]
        if not isinstance(basketball, list) or len(basketball) < 3:
            logger.warning("Invalid basketball data structure")
            return games

        # Navigate to leagues array
        leagues = basketball[2]
        if not isinstance(leagues, list) or len(leagues) == 0:
            logger.warning("No leagues found in basketball data")
            return games

        # Find NBA league (league_id=487)
        for league in leagues:
            if not isinstance(league, list) or len(league) < 3:
                continue

            league_id = league[0]
            league_name = league[1]

            # Check if this is NBA
            if league_id == 487 and league_name == "NBA":
                # Extract events array
                nba_events = league[2]

                if not isinstance(nba_events, list):
                    logger.warning("NBA events is not a list")
                    continue

                logger.info(f"Found {len(nba_events)} NBA events in response")

                # Parse each event
                for event_data in nba_events:
                    if not isinstance(event_data, list) or len(event_data) < 9:
                        continue

                    try:
                        game_info = {
                            'event_id': str(event_data[0]),
                            'home_team': event_data[1],
                            'away_team': event_data[2],
                            'num_markets': event_data[3],
                            'start_time': datetime.fromtimestamp(event_data[4] / 1000),
                            'markets': event_data[8],  # Full markets object
                            'game_name': f"{event_data[2]} @ {event_data[1]}",
                            'raw_data': event_data  # Keep raw data for detailed parsing
                        }
                        games.append(game_info)

                    except (IndexError, ValueError, TypeError) as e:
                        logger.warning(f"Failed to parse event: {e}")
                        continue

                break  # Found NBA, no need to continue

    except (KeyError, IndexError, TypeError) as e:
        logger.error(f"Error extracting NBA games from compact endpoint: {e}")
        logger.debug(f"Response keys: {list(raw_data.keys())}")

    logger.info(f"✅ Extracted {len(games)} NBA games from compact endpoint")
    return games


if __name__ == '__main__':
    # Example usage for testing
    import json
    import sys

    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) > 1:
        # Load JSON file from command line argument
        with open(sys.argv[1], 'r') as f:
            test_data = json.load(f)

        parsed = parse_pinnacle_response(test_data)

        print("\n=== EVENT INFO ===")
        print(json.dumps(parsed['event_info'], indent=2, default=str))

        print("\n=== MARKET SUMMARY ===")
        print(json.dumps(parsed['summary'], indent=2))

        print("\n=== SAMPLE MARKETS (first 10) ===")
        for market in parsed['markets'][:10]:
            print(f"\n{market['market_name']} ({market['category']})")
            for odds in market['odds'][:2]:  # First 2 odds per market
                handicap_str = f" @ {odds['handicap']}" if odds['handicap'] is not None else ""
                print(f"  {odds['selection']}{handicap_str}: {odds['odds_decimal']} ({odds['odds_american']:+d})")

        print(f"\n✅ Successfully parsed {parsed['summary']['total']} markets")
    else:
        print("Usage: python parsers.py <path_to_pinnacle_json>")
        print("Example: python parsers.py /tmp/pinnacle_response.json")
