"""
NBA Expert Bettor Agent - Main Entry Point

Usage:
    python -m src.main analyze "Lakers vs Heat"
    python -m src.main analyze "Should I bet Celtics -5?" --depth deep
    python -m src.main calibration
    python -m src.main post-mortem
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
        description="NBA Expert Bettor Agent - System 2 Architecture"
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
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)"
    )

    # Calibration report
    subparsers.add_parser("calibration", help="Generate calibration report")

    # Post-mortem
    subparsers.add_parser("post-mortem", help="Run nightly post-mortem analysis")

    return parser.parse_args()


def format_recommendation_text(state: dict) -> str:
    """Format recommendation for terminal output"""
    rec = state.get("recommendation")
    if not rec:
        return "No recommendation generated."

    output = []
    output.append("=" * 60)
    output.append("NBA EXPERT BETTOR AGENT - RECOMMENDATION")
    output.append("=" * 60)
    output.append("")
    output.append(f"Action:     {rec.get('action', 'N/A')}")
    output.append(f"Selection:  {rec.get('selection', 'N/A')}")
    output.append(f"Line:       {rec.get('line', 'N/A')}")
    output.append(f"Confidence: {rec.get('confidence', 0) * 100:.1f}%")
    output.append(f"Edge:       {rec.get('edge', 0) * 100:.2f}%")
    output.append("")

    output.append("KEY FACTORS:")
    for factor in rec.get("key_factors", []):
        output.append(f"  + {factor}")
    output.append("")

    output.append("RISK FACTORS:")
    for risk in rec.get("risk_factors", []):
        output.append(f"  - {risk}")
    output.append("")

    if state.get("critique_count", 0) > 0:
        output.append(f"[Reflexion loops: {state['critique_count']}]")

    if state.get("errors"):
        output.append("")
        output.append("WARNINGS:")
        for error in state["errors"]:
            output.append(f"  ! {error}")

    output.append("=" * 60)
    return "\n".join(output)


async def main_async():
    args = parse_args()

    if args.command == "analyze":
        print(f"Analyzing: {args.query}")
        print(f"Depth: {args.depth}")
        print("-" * 40)

        try:
            final_state = await run_analysis(
                query=args.query,
                depth=args.depth
            )

            if args.format == "json":
                print(json.dumps(final_state, indent=2, default=str))
            else:
                print(format_recommendation_text(final_state))

        except Exception as e:
            print(f"Error during analysis: {e}", file=sys.stderr)
            sys.exit(1)

    elif args.command == "calibration":
        print("Calibration report not yet implemented (Phase 4)")
        # TODO: Implement in Phase 4

    elif args.command == "post-mortem":
        print("Post-mortem not yet implemented (Phase 4)")
        # TODO: Implement in Phase 4

    else:
        print("Usage: python -m src.main <command> [options]")
        print("Commands: analyze, calibration, post-mortem")
        sys.exit(1)


def main():
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
