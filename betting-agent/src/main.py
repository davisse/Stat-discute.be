"""
NBA Expert Bettor Agent - Main Entry Point

Usage:
    python -m src.main analyze "Lakers vs Heat"
    python -m src.main analyze "Should I bet Celtics -5?" --depth deep
    python -m src.main bet "Lakers -5 vs Celtics"  # Alias for analyze
    python -m src.main dashboard                    # Show calibration dashboard
    python -m src.main calibration                  # Calibration report
    python -m src.main post-mortem                  # Run nightly analysis
    python -m src.main history                      # Recent wagers
    python -m src.main settle-all                   # Auto-settle from game results
    python -m src.main performance                  # Show performance summary
"""
import argparse
import asyncio
import json
import sys
from typing import Literal

from src.graph.workflow import run_analysis
from src.models.state import create_initial_state


def parse_args():
    parser = argparse.ArgumentParser(
        description="NBA Expert Bettor Agent - System 2 Architecture",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m src.main analyze "Lakers vs Celtics"
  python -m src.main bet "Lakers -5 vs Celtics" --depth deep
  python -m src.main dashboard
  python -m src.main calibration
  python -m src.main history --limit 10
        """
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Analyze command
    analyze_parser = subparsers.add_parser("analyze", help="Analyze a betting opportunity")
    analyze_parser.add_argument("query", help="Betting query (e.g., 'Lakers vs Heat')")
    analyze_parser.add_argument(
        "--depth",
        choices=["quick", "standard", "deep"],
        default="standard",
        help="Analysis depth (default: standard)"
    )
    analyze_parser.add_argument(
        "--format",
        choices=["text", "json", "brief"],
        default="text",
        help="Output format (default: text)"
    )

    # Bet command (alias for analyze)
    bet_parser = subparsers.add_parser("bet", help="Analyze bet (alias for analyze)")
    bet_parser.add_argument("query", help="Betting query")
    bet_parser.add_argument("--depth", choices=["quick", "standard", "deep"], default="standard")
    bet_parser.add_argument("--format", choices=["text", "json", "brief"], default="text")

    # Dashboard command
    dashboard_parser = subparsers.add_parser("dashboard", help="Show calibration dashboard")
    dashboard_parser.add_argument(
        "--section",
        choices=["all", "calibration", "performance", "recent", "rules"],
        default="all",
        help="Dashboard section to display"
    )
    dashboard_parser.add_argument(
        "--refresh",
        type=int,
        default=0,
        help="Refresh interval in seconds (0 = no refresh)"
    )

    # Calibration report
    subparsers.add_parser("calibration", help="Generate calibration report")

    # Post-mortem
    subparsers.add_parser("post-mortem", help="Run nightly post-mortem analysis")

    # History
    history_parser = subparsers.add_parser("history", help="Show recent wagers")
    history_parser.add_argument("--limit", type=int, default=10, help="Number of wagers to show")
    history_parser.add_argument("--unsettled", action="store_true", help="Show only unsettled wagers")

    # Settle command
    settle_parser = subparsers.add_parser("settle", help="Manually settle a wager")
    settle_parser.add_argument("wager_id", type=int, help="Wager ID to settle")
    settle_parser.add_argument("--outcome", choices=["WIN", "LOSS", "PUSH"], required=True)
    settle_parser.add_argument("--profit", type=float, help="Profit/loss amount")

    # Settle-all command (auto-settlement from game results)
    settle_all_parser = subparsers.add_parser("settle-all", help="Auto-settle all unsettled wagers from game results")
    settle_all_parser.add_argument("--bet-type", choices=["TOTAL", "SPREAD"], help="Filter by bet type")

    # Performance summary
    subparsers.add_parser("performance", help="Show performance summary")

    return parser.parse_args()


def format_recommendation_text(state: dict) -> str:
    """Format recommendation for terminal output"""
    rec = state.get("recommendation")
    if not rec:
        return "No recommendation generated."

    output = []
    output.append("")
    output.append("╔" + "═" * 58 + "╗")
    output.append("║" + " NBA EXPERT BETTOR - RECOMMENDATION".ljust(58) + "║")
    output.append("╠" + "═" * 58 + "╣")

    # Action with emoji
    action = rec.get("action", "N/A")
    action_emoji = {
        "BET": "🎯 BET",
        "LEAN_BET": "⚖️  LEAN_BET",
        "NO_BET": "🚫 NO_BET",
        "FADE": "↩️  FADE",
        "NEED_LINE": "❓ NEED_LINE"
    }.get(action, action)

    output.append("║" + f"  Action:     {action_emoji}".ljust(58) + "║")
    output.append("║" + f"  Selection:  {rec.get('selection', 'N/A')}".ljust(58) + "║")

    line = rec.get("line")
    if line is not None:
        output.append("║" + f"  Line:       {line:+.1f}".ljust(58) + "║")

    output.append("╟" + "─" * 58 + "╢")

    # Key metrics
    confidence = rec.get("confidence", 0)
    edge = rec.get("edge", 0)
    cover_prob = rec.get("cover_probability", 50)
    kelly = rec.get("kelly_fraction", 0)

    conf_bar = "█" * int(confidence * 10) + "░" * (10 - int(confidence * 10))
    output.append("║" + f"  Confidence: [{conf_bar}] {confidence*100:.0f}%".ljust(58) + "║")
    output.append("║" + f"  Edge:       {edge:+.2f}%".ljust(58) + "║")
    output.append("║" + f"  Cover Prob: {cover_prob:.1f}%".ljust(58) + "║")
    output.append("║" + f"  Kelly:      {kelly:.2f}%".ljust(58) + "║")

    # Debate result - use summary if available
    debate_summary = state.get("debate_result", {}).get("summary", {})
    verdict = debate_summary.get("verdict", "")
    bull_strengths = debate_summary.get("bull_strengths", [])
    bear_concerns = debate_summary.get("bear_concerns", [])

    output.append("╟" + "─" * 58 + "╢")
    if verdict:
        # Word wrap verdict
        verdict_words = verdict.split()
        line_words = []
        current_len = 0
        for word in verdict_words:
            if current_len + len(word) + 1 > 54:
                output.append("║" + f"  {' '.join(line_words)}".ljust(58) + "║")
                line_words = [word]
                current_len = len(word)
            else:
                line_words.append(word)
                current_len += len(word) + 1
        if line_words:
            output.append("║" + f"  {' '.join(line_words)}".ljust(58) + "║")
    else:
        debate_winner = rec.get("debate_winner", "N/A")
        output.append("║" + f"  Debate: {debate_winner}".ljust(58) + "║")

    # Reasoning
    output.append("╟" + "─" * 58 + "╢")
    reasoning = rec.get("reasoning", "")
    # Word wrap reasoning
    words = reasoning.split()
    line_words = []
    current_len = 0
    for word in words:
        if current_len + len(word) + 1 > 52:
            output.append("║" + f"  {' '.join(line_words)}".ljust(58) + "║")
            line_words = [word]
            current_len = len(word)
        else:
            line_words.append(word)
            current_len += len(word) + 1
    if line_words:
        output.append("║" + f"  {' '.join(line_words)}".ljust(58) + "║")

    # Key factors
    key_factors = rec.get("key_factors", [])
    if key_factors:
        output.append("╟" + "─" * 58 + "╢")
        output.append("║" + "  Key Factors:".ljust(58) + "║")
        for factor in key_factors[:4]:
            output.append("║" + f"    ✓ {factor}".ljust(58) + "║")

    # Risk factors
    risk_factors = rec.get("risk_factors", [])
    if risk_factors:
        output.append("║" + "  Risk Factors:".ljust(58) + "║")
        for risk in risk_factors[:3]:
            output.append("║" + f"    ⚠ {risk}".ljust(58) + "║")

    # Wager tracking
    wager_id = rec.get("wager_id")
    if wager_id:
        output.append("╟" + "─" * 58 + "╢")
        output.append("║" + f"  📝 Saved as Wager #{wager_id}".ljust(58) + "║")

    # Reflexion info
    critique_count = state.get("critique_count", 0)
    if critique_count > 0:
        output.append("║" + f"  🔄 Reflexion loops: {critique_count}".ljust(58) + "║")

    output.append("╚" + "═" * 58 + "╝")
    output.append("")

    return "\n".join(output)


def format_recommendation_brief(state: dict) -> str:
    """Format brief one-line recommendation"""
    rec = state.get("recommendation")
    if not rec:
        return "No recommendation"

    action = rec.get("action", "N/A")
    selection = rec.get("selection", "N/A")
    edge = rec.get("edge", 0)
    confidence = rec.get("confidence", 0)

    return f"{action}: {selection} | Edge: {edge:+.1f}% | Conf: {confidence*100:.0f}%"


async def run_analyze(args):
    """Run analysis command"""
    print(f"🏀 Analyzing: {args.query}")
    print(f"📊 Depth: {args.depth}")
    print("-" * 40)

    try:
        final_state = await run_analysis(
            query=args.query,
            depth=args.depth
        )

        if args.format == "json":
            print(json.dumps(final_state, indent=2, default=str))
        elif args.format == "brief":
            print(format_recommendation_brief(final_state))
        else:
            print(format_recommendation_text(final_state))

    except Exception as e:
        print(f"Error during analysis: {e}", file=sys.stderr)
        sys.exit(1)


def run_dashboard(args):
    """Run dashboard command"""
    from src.cli.dashboard import CalibrationDashboard
    import time

    dashboard = CalibrationDashboard()

    if args.refresh > 0:
        try:
            while True:
                print("\033[2J\033[H", end="")  # Clear screen
                dashboard.display(section=args.section)
                time.sleep(args.refresh)
        except KeyboardInterrupt:
            print("\nDashboard stopped.")
    else:
        dashboard.display(section=args.section)


def run_calibration():
    """Run calibration report"""
    from src.memory import PostMortem

    post_mortem = PostMortem()
    report = post_mortem.generate_calibration_report()
    print(report)


async def run_post_mortem():
    """Run post-mortem analysis"""
    from src.memory import PostMortem
    from src.tools.db_tool import get_db

    post_mortem = PostMortem()

    print("Running post-mortem analysis...")
    print("-" * 40)

    try:
        db = await get_db()
        report = await post_mortem.run_nightly_analysis(db_tool=db)

        print(f"Settled: {report.get('settled_count', 0)} wagers")
        print(f"Results: {report.get('wins', 0)}W - {report.get('losses', 0)}L - {report.get('pushes', 0)}P")

        if report.get("high_confidence_losses"):
            print(f"\n⚠️  High-confidence losses: {len(report['high_confidence_losses'])}")

        if report.get("new_rules"):
            print(f"\n📝 New learning rules suggested: {len(report['new_rules'])}")
            for rule in report["new_rules"]:
                print(f"   • {rule['condition']}: {rule['adjustment']:+.0%}")

        print("\n✅ Post-mortem complete!")

    except Exception as e:
        print(f"Error during post-mortem: {e}", file=sys.stderr)
        sys.exit(1)


def run_history(args):
    """Show wager history"""
    from src.memory import get_memory_store

    store = get_memory_store()

    if args.unsettled:
        wagers = store.get_unsettled_wagers()
        print(f"📋 Unsettled Wagers ({len(wagers)})")
    else:
        wagers = store.get_recent_wagers(limit=args.limit)
        print(f"📋 Recent Wagers (last {args.limit})")

    print("=" * 70)

    if not wagers:
        print("  No wagers found.")
        return

    header = f"{'ID':<5} {'Selection':<20} {'Conf%':<8} {'Edge%':<8} {'Result':<10} {'P&L':<8}"
    print(header)
    print("-" * 70)

    for wager in wagers:
        wager_id = wager.get("id", "")
        selection = wager.get("selection", "")[:18]
        confidence = wager.get("confidence", 0) * 100
        edge = wager.get("predicted_edge", 0) * 100
        outcome = wager.get("outcome") or "PENDING"
        profit = wager.get("profit")

        profit_str = f"{profit:+.2f}" if profit is not None else "-"

        print(f"{wager_id:<5} {selection:<20} {confidence:>5.0f}%   {edge:>5.1f}%   {outcome:<10} {profit_str:<8}")


def run_settle(args):
    """Manually settle a wager"""
    from src.memory import get_memory_store

    store = get_memory_store()

    # Calculate profit if not provided
    profit = args.profit
    if profit is None:
        if args.outcome == "WIN":
            profit = 0.91
        elif args.outcome == "LOSS":
            profit = -1.0
        else:
            profit = 0.0

    store.settle_wager(args.wager_id, outcome=args.outcome, profit=profit)
    print(f"✅ Wager #{args.wager_id} settled: {args.outcome} ({profit:+.2f} units)")


async def run_settle_all(args):
    """Auto-settle all unsettled wagers from game results"""
    from src.memory import get_memory_store
    from src.tools.db_tool import get_db

    store = get_memory_store()
    db = await get_db()

    print("🔄 Auto-settling wagers from game results...")
    print("-" * 60)

    # Show unsettled wagers first
    unsettled = store.get_unsettled_wagers()
    if not unsettled:
        print("No unsettled wagers found.")
        return

    print(f"Found {len(unsettled)} unsettled wager(s)")
    print()

    # Run auto-settlement
    result = await store.auto_settle_wagers(db)

    if result["settled_count"] == 0:
        print("⚠️  No wagers could be settled (games may not be finished yet)")
        return

    # Show results
    print("Settlement Results:")
    print("-" * 60)
    print(f"{'Selection':<30} {'Line':>8} {'Actual':>8} {'Result':>8} {'P&L':>8}")
    print("-" * 60)

    for r in result["results"]:
        selection = r["selection"][:28]
        line = r["line"]
        outcome = r["outcome"]
        profit = r["profit"]

        # Display actual total for totals, margin for spreads
        if r.get("is_total_bet"):
            actual = str(r.get("actual_total", ""))
        else:
            margin = r.get("actual_margin", 0)
            actual = f"{margin:+.1f}" if margin else "0"

        outcome_symbol = {"WIN": "✅", "LOSS": "❌", "PUSH": "➖"}.get(outcome, "?")
        print(f"{selection:<30} {line:>8.1f} {actual:>8} {outcome_symbol} {outcome:<5} {profit:>+7.2f}")

    print("-" * 60)
    print(f"Total: {result['wins']}W - {result['losses']}L - {result['pushes']}P | Profit: {result['total_profit']:+.2f} units")


def run_performance(args=None):
    """Show performance summary"""
    from src.memory import get_memory_store

    store = get_memory_store()

    print("📊 Performance Summary")
    print("=" * 50)

    # Overall performance
    overall = store.get_performance_summary()
    if overall.get("total_bets", 0) == 0:
        print("No settled bets found yet.")
        return

    print("\n📈 Overall:")
    print(f"  Total Bets:  {overall['total_bets']}")
    print(f"  Record:      {overall['wins']}W - {overall['losses']}L - {overall['pushes']}P")
    print(f"  Win Rate:    {overall['win_rate']*100:.1f}%")
    print(f"  Total P&L:   {overall['total_profit']:+.2f} units")
    print(f"  ROI:         {overall['roi']:+.1f}%")

    # By bet type
    print("\n📊 By Bet Type:")
    for bet_type in ["TOTAL", "SPREAD"]:
        stats = store.get_performance_summary(bet_type=bet_type)
        if stats.get("total_bets", 0) > 0:
            print(f"\n  {bet_type}:")
            print(f"    Bets:     {stats['total_bets']}")
            print(f"    Record:   {stats['wins']}W - {stats['losses']}L")
            print(f"    Win Rate: {stats['win_rate']*100:.1f}%")
            print(f"    P&L:      {stats['total_profit']:+.2f} units")

    # Edge accuracy
    if overall.get("avg_winning_edge") and overall.get("avg_losing_edge"):
        print("\n📉 Edge Analysis:")
        print(f"  Avg Edge (Wins):   {overall['avg_winning_edge']*100:+.1f}%")
        print(f"  Avg Edge (Losses): {overall['avg_losing_edge']*100:+.1f}%")


async def main_async():
    args = parse_args()

    if args.command in ("analyze", "bet"):
        await run_analyze(args)

    elif args.command == "dashboard":
        run_dashboard(args)

    elif args.command == "calibration":
        run_calibration()

    elif args.command == "post-mortem":
        await run_post_mortem()

    elif args.command == "history":
        run_history(args)

    elif args.command == "settle":
        run_settle(args)

    elif args.command == "settle-all":
        await run_settle_all(args)

    elif args.command == "performance":
        run_performance(args)

    else:
        print("NBA Expert Bettor Agent - System 2 Architecture")
        print("=" * 50)
        print()
        print("Usage: python -m src.main <command> [options]")
        print()
        print("Commands:")
        print("  analyze     Analyze a betting opportunity")
        print("  bet         Alias for analyze")
        print("  dashboard   Show calibration dashboard")
        print("  calibration Generate calibration report")
        print("  post-mortem Run nightly post-mortem analysis")
        print("  history     Show recent wagers")
        print("  settle      Manually settle a wager")
        print("  settle-all  Auto-settle wagers from game results")
        print("  performance Show performance summary")
        print()
        print("Examples:")
        print("  python -m src.main bet 'Lakers -5 vs Celtics'")
        print("  python -m src.main dashboard --refresh 30")
        print("  python -m src.main history --unsettled")
        sys.exit(1)


def main():
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
