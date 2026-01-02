#!/usr/bin/env python3
"""
Quick validation test for totals analytics scripts
Checks imports, database connections, and basic functionality
"""

import os
import sys

def test_imports():
    """Test that all scripts can be imported without errors"""
    print("=" * 80)
    print("🧪 TESTING IMPORTS")
    print("=" * 80)

    tests_passed = 0
    tests_failed = 0

    # Test calculate_totals_projections.py
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'analytics'))
        import calculate_totals_projections as proj
        print("✅ calculate_totals_projections.py imports successfully")
        tests_passed += 1

        # Check key functions exist
        assert hasattr(proj, 'calculate_projected_total')
        assert hasattr(proj, 'get_team_recent_stats')
        assert hasattr(proj, 'calculate_rest_adjustment')
        print("   ✓ All key functions present")

    except Exception as e:
        print(f"❌ calculate_totals_projections.py import failed: {e}")
        tests_failed += 1

    # Test identify_value_bets.py
    try:
        import identify_value_bets as value
        print("✅ identify_value_bets.py imports successfully")
        tests_passed += 1

        assert hasattr(value, 'identify_value_bets')
        assert hasattr(value, 'get_current_line')
        assert hasattr(value, 'generate_reasoning')
        print("   ✓ All key functions present")

    except Exception as e:
        print(f"❌ identify_value_bets.py import failed: {e}")
        tests_failed += 1

    # Test generate_situational_trends.py
    try:
        import generate_situational_trends as trends
        print("✅ generate_situational_trends.py imports successfully")
        tests_passed += 1

        assert hasattr(trends, 'analyze_both_b2b_games')
        assert hasattr(trends, 'analyze_division_games')
        assert hasattr(trends, 'analyze_high_pace_matchups')
        assert hasattr(trends, 'analyze_elite_defense_matchups')
        assert hasattr(trends, 'analyze_altitude_games')
        assert hasattr(trends, 'analyze_road_after_loss')
        print("   ✓ All 6 situation analyzers present")

    except Exception as e:
        print(f"❌ generate_situational_trends.py import failed: {e}")
        tests_failed += 1

    # Test daily_totals_pipeline.py
    try:
        sys.path.insert(0, os.path.dirname(__file__))
        import daily_totals_pipeline as pipeline
        print("✅ daily_totals_pipeline.py imports successfully")
        tests_passed += 1

        assert hasattr(pipeline, 'run_script')
        assert hasattr(pipeline, 'main')
        print("   ✓ All key functions present")

    except Exception as e:
        print(f"❌ daily_totals_pipeline.py import failed: {e}")
        tests_failed += 1

    print(f"\n📊 Import Tests: {tests_passed} passed, {tests_failed} failed")
    return tests_failed == 0


def test_database_connection():
    """Test database connection (doesn't run queries)"""
    print("\n" + "=" * 80)
    print("🔌 TESTING DATABASE CONNECTION")
    print("=" * 80)

    try:
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'analytics'))
        from calculate_totals_projections import get_db_connection

        conn = get_db_connection()
        cur = conn.cursor()

        # Simple test query
        cur.execute("SELECT 1")
        result = cur.fetchone()

        assert result[0] == 1
        print("✅ Database connection successful")

        cur.close()
        conn.close()

        return True

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("   Note: This is expected if database not configured yet")
        return False


def test_constants():
    """Test that critical constants are defined"""
    print("\n" + "=" * 80)
    print("🔢 TESTING CONSTANTS")
    print("=" * 80)

    try:
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'analytics'))
        from calculate_totals_projections import LEAGUE_AVG_PACE, DENVER_TEAM_ID
        from identify_value_bets import EDGE_THRESHOLD, CONFIDENCE_THRESHOLD
        from generate_situational_trends import MIN_SAMPLE_SIZE, PROFITABLE_THRESHOLD_UPPER

        print(f"✅ LEAGUE_AVG_PACE = {LEAGUE_AVG_PACE}")
        print(f"✅ DENVER_TEAM_ID = {DENVER_TEAM_ID}")
        print(f"✅ EDGE_THRESHOLD = {EDGE_THRESHOLD}")
        print(f"✅ CONFIDENCE_THRESHOLD = {CONFIDENCE_THRESHOLD}")
        print(f"✅ MIN_SAMPLE_SIZE = {MIN_SAMPLE_SIZE}")
        print(f"✅ PROFITABLE_THRESHOLD_UPPER = {PROFITABLE_THRESHOLD_UPPER}")

        # Validate values
        assert LEAGUE_AVG_PACE > 90 and LEAGUE_AVG_PACE < 110
        assert EDGE_THRESHOLD >= 2.0 and EDGE_THRESHOLD <= 5.0
        assert CONFIDENCE_THRESHOLD >= 0.5 and CONFIDENCE_THRESHOLD <= 0.8
        assert MIN_SAMPLE_SIZE >= 10

        print("\n✅ All constants defined and reasonable")
        return True

    except Exception as e:
        print(f"❌ Constants validation failed: {e}")
        return False


def main():
    """Run all validation tests"""
    print("=" * 80)
    print("🚀 TOTALS ANALYTICS SCRIPTS VALIDATION")
    print("=" * 80)
    print()

    results = []

    # Run tests
    results.append(("Imports", test_imports()))
    results.append(("Constants", test_constants()))
    results.append(("Database", test_database_connection()))

    # Summary
    print("\n" + "=" * 80)
    print("📊 VALIDATION SUMMARY")
    print("=" * 80)

    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status}: {test_name}")

    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)

    print(f"\n🎯 Total: {passed_count}/{total_count} tests passed")

    if passed_count == total_count:
        print("\n✅ All validation tests passed! Scripts are ready for testing.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Review errors above.")
        return 1


if __name__ == '__main__':
    sys.exit(main())
