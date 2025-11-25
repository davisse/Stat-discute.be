#!/usr/bin/env python3
"""
Test ATS Calculation Logic

This script demonstrates and validates the ATS (Against The Spread) calculation
with example scenarios to ensure correctness.
"""

def did_cover_spread(margin, spread):
    """Calculate if team covered the spread"""
    adjusted_margin = margin + float(spread)

    if adjusted_margin > 0:
        return 'cover'
    elif adjusted_margin < 0:
        return 'loss'
    else:
        return 'push'

def test_scenarios():
    """Test various ATS scenarios"""

    print("=" * 80)
    print("📊 ATS CALCULATION TEST SCENARIOS")
    print("=" * 80)
    print()

    scenarios = [
        # (description, team_score, opp_score, spread, expected_result)
        ("Favorite covers: -5.5 spread, wins by 7", 110, 103, -5.5, "cover"),
        ("Favorite doesn't cover: -5.5 spread, wins by 4", 105, 101, -5.5, "loss"),
        ("Favorite pushes: -3.0 spread, wins by 3", 100, 97, -3.0, "push"),
        ("Underdog covers: +4.5 spread, loses by 2", 98, 100, 4.5, "cover"),
        ("Underdog covers by winning: +6.0 spread, wins by 5", 105, 100, 6.0, "cover"),
        ("Underdog doesn't cover: +6.0 spread, loses by 10", 90, 100, 6.0, "loss"),
        ("Pick'em: 0 spread, wins by 1", 101, 100, 0, "cover"),
        ("Pick'em: 0 spread, loses by 1", 99, 100, 0, "loss"),
    ]

    passed = 0
    failed = 0

    for desc, team_score, opp_score, spread, expected in scenarios:
        margin = team_score - opp_score
        result = did_cover_spread(margin, spread)
        status = "✅" if result == expected else "❌"

        print(f"{status} {desc}")
        print(f"   Score: {team_score}-{opp_score} | Margin: {margin:+d} | Spread: {spread:+.1f}")
        print(f"   Calculation: {margin} + ({spread}) = {margin + spread:.1f}")
        print(f"   Result: {result.upper()} (expected: {expected.upper()})")

        if result == expected:
            passed += 1
        else:
            failed += 1
            print(f"   ⚠️  MISMATCH!")

        print()

    print("=" * 80)
    print(f"Test Results: {passed} passed, {failed} failed")
    print("=" * 80)

    return failed == 0

def explain_ats_logic():
    """Explain the ATS calculation logic"""

    print("\n" + "=" * 80)
    print("📚 ATS CALCULATION EXPLANATION")
    print("=" * 80)
    print()

    print("Against The Spread (ATS) determines if a team 'covered' the betting spread.")
    print()
    print("Formula: Adjusted Margin = Actual Margin + Spread")
    print()
    print("Rules:")
    print("  • If Adjusted Margin > 0  → Team COVERED the spread")
    print("  • If Adjusted Margin < 0  → Team LOST against the spread")
    print("  • If Adjusted Margin = 0  → PUSH (tie, bet refunded)")
    print()
    print("Key Concepts:")
    print("  • Negative spread (-5.5) = Team is FAVORITE (must win by more than 5.5)")
    print("  • Positive spread (+5.5) = Team is UNDERDOG (can lose by up to 5.5)")
    print("  • Half-point spreads (.5) prevent pushes")
    print()
    print("Examples:")
    print()
    print("1. Favorite covering:")
    print("   Lakers -7.5 vs Celtics")
    print("   Lakers win 110-100 (margin: +10)")
    print("   Adjusted: 10 + (-7.5) = 2.5 > 0 → COVERED ✅")
    print()
    print("2. Favorite not covering:")
    print("   Lakers -7.5 vs Celtics")
    print("   Lakers win 105-100 (margin: +5)")
    print("   Adjusted: 5 + (-7.5) = -2.5 < 0 → LOST ❌")
    print()
    print("3. Underdog covering by losing:")
    print("   Celtics +7.5 vs Lakers")
    print("   Celtics lose 100-105 (margin: -5)")
    print("   Adjusted: -5 + 7.5 = 2.5 > 0 → COVERED ✅")
    print()
    print("4. Underdog covering by winning:")
    print("   Celtics +7.5 vs Lakers")
    print("   Celtics win 110-100 (margin: +10)")
    print("   Adjusted: 10 + 7.5 = 17.5 > 0 → COVERED ✅")
    print()
    print("=" * 80)

if __name__ == '__main__':
    explain_ats_logic()
    print()
    success = test_scenarios()

    exit(0 if success else 1)
