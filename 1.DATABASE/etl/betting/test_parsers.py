"""
Test suite for Pinnacle Market Parser

Validates market extraction and parsing logic.
"""

import json
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from betting.parsers import PinnacleMarketParser, parse_pinnacle_response


class TestResults:
    """Simple test results tracker"""
    def __init__(self):
        self.passed = []
        self.failed = []

    def add_pass(self, test_name: str):
        self.passed.append(test_name)
        print(f"✅ PASS: {test_name}")

    def add_fail(self, test_name: str, reason: str):
        self.failed.append((test_name, reason))
        print(f"❌ FAIL: {test_name}")
        print(f"   Reason: {reason}")

    def summary(self):
        total = len(self.passed) + len(self.failed)
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {len(self.passed)}/{total} tests passed")
        print(f"{'='*60}")
        if self.failed:
            print("\nFailed tests:")
            for test_name, reason in self.failed:
                print(f"  - {test_name}: {reason}")
        return len(self.failed) == 0


def test_event_info_extraction(parser: PinnacleMarketParser, results: TestResults):
    """Test that event information is correctly extracted"""
    event_info = parser.get_event_info()

    # Check event_id
    if event_info.get('event_id') == '1617585501':
        results.add_pass("Event ID extraction")
    else:
        results.add_fail("Event ID extraction", f"Got {event_info.get('event_id')}, expected 1617585501")

    # Check teams
    if event_info.get('away_team') == 'Indiana Pacers':
        results.add_pass("Away team extraction")
    else:
        results.add_fail("Away team extraction", f"Got {event_info.get('away_team')}, expected Indiana Pacers")

    if event_info.get('home_team') == 'Oklahoma City Thunder':
        results.add_pass("Home team extraction")
    else:
        results.add_fail("Home team extraction", f"Got {event_info.get('home_team')}, expected Oklahoma City Thunder")

    # Check game name format
    expected_name = "Indiana Pacers @ Oklahoma City Thunder"
    if event_info.get('game_name') == expected_name:
        results.add_pass("Game name format")
    else:
        results.add_fail("Game name format", f"Got {event_info.get('game_name')}, expected {expected_name}")

    # Check start_time exists
    if event_info.get('start_time') is not None:
        results.add_pass("Start time extraction")
    else:
        results.add_fail("Start time extraction", "Start time is None")


def test_market_count(markets: list, results: TestResults):
    """Test that market count is within expected range"""
    market_count = len(markets)

    # Expected range: 120-140 markets
    if 120 <= market_count <= 140:
        results.add_pass(f"Market count ({market_count} markets)")
    else:
        results.add_fail("Market count", f"Got {market_count} markets, expected 120-140")


def test_market_categories(markets: list, results: TestResults):
    """Test that all expected market categories are present"""
    categories = set()
    for market in markets:
        categories.add(market.get('category', 'Unknown'))

    expected_categories = [
        'Moneyline',
        'Main',
        'Additional',
        'Alternative',
        'Player Props',
    ]

    for expected in expected_categories:
        found = any(expected in cat for cat in categories)
        if found:
            results.add_pass(f"Category present: {expected}")
        else:
            results.add_fail(f"Category present: {expected}", f"Category not found in {categories}")


def test_market_structure(markets: list, results: TestResults):
    """Test that markets have required fields"""
    required_fields = ['market_key', 'market_name', 'category', 'odds']

    sample_market = markets[0] if markets else None
    if not sample_market:
        results.add_fail("Market structure", "No markets found")
        return

    for field in required_fields:
        if field in sample_market:
            results.add_pass(f"Market field present: {field}")
        else:
            results.add_fail(f"Market field present: {field}", f"Field missing in sample market")


def test_odds_structure(markets: list, results: TestResults):
    """Test that odds have required fields"""
    required_fields = ['selection', 'odds_decimal', 'odds_american']

    # Find market with odds
    sample_odds = None
    for market in markets:
        if market.get('odds'):
            sample_odds = market['odds'][0]
            break

    if not sample_odds:
        results.add_fail("Odds structure", "No odds found in markets")
        return

    for field in required_fields:
        if field in sample_odds:
            results.add_pass(f"Odds field present: {field}")
        else:
            results.add_fail(f"Odds field present: {field}", f"Field missing in sample odds")


def test_odds_conversion(markets: list, results: TestResults):
    """Test decimal to American odds conversion"""
    # Test a few known conversions
    test_cases = [
        (2.0, +100),   # Even odds
        (1.5, -200),   # Favorite
        (3.0, +200),   # Underdog
    ]

    from betting.parsers import PinnacleMarketParser

    for decimal, expected_american in test_cases:
        american = PinnacleMarketParser._decimal_to_american(decimal)
        if american == expected_american:
            results.add_pass(f"Odds conversion: {decimal} → {expected_american}")
        else:
            results.add_fail(f"Odds conversion: {decimal}", f"Got {american}, expected {expected_american}")


def test_moneyline_extraction(markets: list, results: TestResults):
    """Test that moneylines are extracted"""
    moneylines = [m for m in markets if 'Moneyline' in m.get('category', '')]

    if len(moneylines) >= 4:  # Expect at least 4 moneylines (2 teams × 2+ categories)
        results.add_pass(f"Moneylines extracted ({len(moneylines)} found)")
    else:
        results.add_fail("Moneylines extracted", f"Found {len(moneylines)}, expected at least 4")


def test_player_props_extraction(markets: list, results: TestResults):
    """Test that player props are extracted"""
    player_props = [m for m in markets if 'Player Props' in m.get('category', '')]

    if len(player_props) >= 40:  # Expect at least 40 player props
        results.add_pass(f"Player props extracted ({len(player_props)} found)")
    else:
        results.add_fail("Player props extracted", f"Found {len(player_props)}, expected at least 40")


def test_alternative_lines_extraction(markets: list, results: TestResults):
    """Test that alternative lines are extracted"""
    alt_lines = [m for m in markets if 'Alternative' in m.get('category', '')]

    if len(alt_lines) >= 20:  # Expect at least 20 alternative lines
        results.add_pass(f"Alternative lines extracted ({len(alt_lines)} found)")
    else:
        results.add_fail("Alternative lines extracted", f"Found {len(alt_lines)}, expected at least 20")


def test_market_summary(parsed_data: dict, results: TestResults):
    """Test market summary statistics"""
    summary = parsed_data.get('summary', {})

    total = summary.get('total', 0)
    if total >= 120:
        results.add_pass(f"Total markets in summary ({total})")
    else:
        results.add_fail("Total markets in summary", f"Got {total}, expected >= 120")

    # Check that summary categories add up to total
    category_sum = (
        summary.get('moneylines', 0) +
        summary.get('main_lines', 0) +
        summary.get('additional_lines', 0) +
        summary.get('alternative_lines', 0) +
        summary.get('player_props', 0) +
        summary.get('special_markets', 0)
    )

    if category_sum == total:
        results.add_pass("Summary category totals match")
    else:
        results.add_fail("Summary category totals", f"Sum {category_sum} != Total {total}")


def run_tests(json_file_path: str):
    """Run all tests on a Pinnacle JSON response"""
    print(f"\n{'='*60}")
    print(f"TESTING PINNACLE MARKET PARSER")
    print(f"{'='*60}\n")
    print(f"Input file: {json_file_path}\n")

    # Load test data
    try:
        with open(json_file_path, 'r') as f:
            test_data = json.load(f)
    except Exception as e:
        print(f"❌ Failed to load test data: {e}")
        return False

    # Parse data
    try:
        parsed = parse_pinnacle_response(test_data)
        parser = PinnacleMarketParser(test_data)
    except Exception as e:
        print(f"❌ Failed to parse data: {e}")
        return False

    # Initialize results tracker
    results = TestResults()

    # Run tests
    print("Running tests...\n")
    test_event_info_extraction(parser, results)
    test_market_count(parsed['markets'], results)
    test_market_categories(parsed['markets'], results)
    test_market_structure(parsed['markets'], results)
    test_odds_structure(parsed['markets'], results)
    test_odds_conversion(parsed['markets'], results)
    test_moneyline_extraction(parsed['markets'], results)
    test_player_props_extraction(parsed['markets'], results)
    test_alternative_lines_extraction(parsed['markets'], results)
    test_market_summary(parsed, results)

    # Print summary
    return results.summary()


if __name__ == '__main__':
    if len(sys.argv) > 1:
        json_file = sys.argv[1]
        success = run_tests(json_file)
        sys.exit(0 if success else 1)
    else:
        print("Usage: python test_parsers.py <path_to_pinnacle_json>")
        print("Example: python test_parsers.py /tmp/pinnacle_response.json")
        sys.exit(1)
