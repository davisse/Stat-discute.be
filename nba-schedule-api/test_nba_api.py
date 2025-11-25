#!/usr/bin/env python3
"""
Test script to verify NBA API installation and functionality.
Run: python3 test_nba_api.py
"""

def test_imports():
    """Test that all dependencies can be imported."""
    print("Testing imports...")
    try:
        import nba_api
        import flask
        import flask_cors
        import pandas as pd
        import numpy as np
        import requests
        print("✅ All dependencies imported successfully\n")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}\n")
        return False


def test_nba_teams():
    """Test fetching NBA teams list."""
    print("Testing NBA teams endpoint...")
    try:
        from nba_api.stats.static import teams
        nba_teams = teams.get_teams()
        print(f"✅ Found {len(nba_teams)} NBA teams")
        print(f"Example: {nba_teams[0]['full_name']} ({nba_teams[0]['abbreviation']})\n")
        return True
    except Exception as e:
        print(f"❌ Error fetching teams: {e}\n")
        return False


def test_game_data():
    """Test fetching actual game data."""
    print("Testing game data retrieval...")
    try:
        from nba_api.stats.endpoints import leaguegamefinder

        # Fetch Lakers games from 2023-24 season
        gamefinder = leaguegamefinder.LeagueGameFinder(
            team_id_nullable='1610612747',  # Lakers
            season_nullable='2023-24'
        )
        df = gamefinder.get_data_frames()[0]

        if len(df) > 0:
            print(f"✅ Retrieved {len(df)} games for Lakers 2023-24 season")
            print(f"Most recent: {df.iloc[0]['GAME_DATE']} - {df.iloc[0]['MATCHUP']} - {df.iloc[0]['WL']}\n")
            return True
        else:
            print("⚠️  No games found (API accessible but no data)\n")
            return True
    except Exception as e:
        print(f"❌ Error fetching game data: {e}\n")
        return False


def test_pandas_processing():
    """Test pandas data processing capabilities."""
    print("Testing pandas data processing...")
    try:
        import pandas as pd
        import numpy as np

        # Create sample game data
        data = {
            'GAME_DATE': ['2024-10-22', '2024-10-24', '2024-10-26'],
            'PTS': [110, 105, 118],
            'WL': ['W', 'L', 'W']
        }
        df = pd.DataFrame(data)

        # Calculate stats
        avg_points = df['PTS'].mean()
        wins = len(df[df['WL'] == 'W'])

        print(f"✅ Pandas processing working")
        print(f"Sample stats - Avg Points: {avg_points:.1f}, Wins: {wins}\n")
        return True
    except Exception as e:
        print(f"❌ Error in pandas processing: {e}\n")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("NBA API Installation Test")
    print("=" * 60 + "\n")

    tests = [
        ("Imports", test_imports),
        ("NBA Teams", test_nba_teams),
        ("Game Data", test_game_data),
        ("Data Processing", test_pandas_processing),
    ]

    results = []
    for name, test_func in tests:
        results.append(test_func())

    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")

    if passed == total:
        print("\n✅ All tests passed! NBA API is ready to use.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check errors above.")

    return passed == total


if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
