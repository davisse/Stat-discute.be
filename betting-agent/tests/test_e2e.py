"""End-to-end test for NBA Bettor Agent"""
import asyncio
import json
from src.graph.workflow import run_analysis


async def test_team_matchup():
    """Test a team vs team matchup query"""
    print("\n" + "=" * 60)
    print("TEST 1: Lakers vs Celtics")
    print("=" * 60)

    result = await run_analysis("Lakers vs Celtics")

    print(f"\nQuery Type: {result.get('query_type')}")
    print(f"Query Complexity: {result.get('query_complexity')}")
    print(f"Depth: {result.get('depth')}")
    print(f"Current Node: {result.get('current_node')}")
    print(f"Confidence: {result.get('confidence', 0):.2f}")

    if result.get("errors"):
        print(f"\nErrors: {result['errors']}")

    if result.get("missing_info"):
        print(f"Missing Info: {result['missing_info']}")

    game_data = result.get("game_data")
    if game_data:
        print(f"\nGame Data Quality: {game_data.get('data_quality')}")
        if game_data.get("team1"):
            print(f"Team 1: {game_data['team1'].get('name')}")
        if game_data.get("team2"):
            print(f"Team 2: {game_data['team2'].get('name')}")

    rec = result.get("recommendation")
    if rec:
        print(f"\n--- RECOMMENDATION ---")
        print(f"Action: {rec.get('action')}")
        print(f"Selection: {rec.get('selection')}")
        print(f"Edge: {rec.get('edge')}")
        print(f"Confidence: {rec.get('confidence')}")
        print(f"Reasoning: {rec.get('reasoning')}")
        print(f"Data Quality: {rec.get('data_quality')}")

    return result


async def test_spread_bet():
    """Test a spread bet query"""
    print("\n" + "=" * 60)
    print("TEST 2: Should I bet Celtics -5?")
    print("=" * 60)

    result = await run_analysis("Should I bet Celtics -5?")

    print(f"\nQuery Type: {result.get('query_type')}")
    print(f"Query Complexity: {result.get('query_complexity')}")
    print(f"Confidence: {result.get('confidence', 0):.2f}")

    game_data = result.get("game_data")
    if game_data:
        print(f"\nGame Data Quality: {game_data.get('data_quality')}")
        print(f"Selection: {game_data.get('selection')}")
        print(f"Line: {game_data.get('line')}")

    rec = result.get("recommendation")
    if rec:
        print(f"\n--- RECOMMENDATION ---")
        print(f"Action: {rec.get('action')}")
        print(f"Selection: {rec.get('selection')}")
        print(f"Line: {rec.get('line')}")
        print(f"Edge: {rec.get('edge')}")
        print(f"Reasoning: {rec.get('reasoning')}")

    return result


async def test_single_team():
    """Test a single team query"""
    print("\n" + "=" * 60)
    print("TEST 3: Warriors")
    print("=" * 60)

    result = await run_analysis("Warriors")

    print(f"\nQuery Type: {result.get('query_type')}")
    print(f"Query Complexity: {result.get('query_complexity')}")

    game_data = result.get("game_data")
    if game_data:
        print(f"\nGame Data Quality: {game_data.get('data_quality')}")
        if game_data.get("team1"):
            t1 = game_data["team1"]
            print(f"Team: {t1.get('name')}")
            if t1.get("stats_l10"):
                stats = t1["stats_l10"]
                print(f"L10 Stats: {stats.get('wins', 0)}-{int(stats.get('games', 0)) - int(stats.get('wins', 0))} record")
                print(f"PPG: {stats.get('ppg')}")
                print(f"OPP PPG: {stats.get('opp_ppg')}")
                print(f"Avg Margin: {stats.get('avg_margin')}")

        if game_data.get("upcoming_games"):
            print(f"\nUpcoming Games: {len(game_data['upcoming_games'])}")
            for g in game_data["upcoming_games"][:3]:
                print(f"  - {g.get('away_abbr')} @ {g.get('home_abbr')} ({g.get('game_date')})")

    rec = result.get("recommendation")
    if rec:
        print(f"\n--- RECOMMENDATION ---")
        print(f"Action: {rec.get('action')}")
        print(f"Reasoning: {rec.get('reasoning')}")

    return result


async def test_nonexistent_team():
    """Test error handling with invalid team"""
    print("\n" + "=" * 60)
    print("TEST 4: Invalid Team (Gotham Knights)")
    print("=" * 60)

    result = await run_analysis("Gotham Knights")

    print(f"\nQuery Type: {result.get('query_type')}")
    print(f"Errors: {result.get('errors', [])}")
    print(f"Missing Info: {result.get('missing_info', [])}")

    rec = result.get("recommendation")
    if rec:
        print(f"\n--- RECOMMENDATION ---")
        print(f"Action: {rec.get('action')}")
        print(f"Reasoning: {rec.get('reasoning')}")

    return result


async def main():
    """Run all E2E tests"""
    print("\n" + "=" * 60)
    print("NBA BETTOR AGENT - END-TO-END TESTS")
    print("=" * 60)

    try:
        await test_team_matchup()
        await test_spread_bet()
        await test_single_team()
        await test_nonexistent_team()

        print("\n" + "=" * 60)
        print("ALL TESTS COMPLETED")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
