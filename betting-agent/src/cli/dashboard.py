"""ASCII Calibration Dashboard for NBA Bettor Agent"""
import sys
from datetime import datetime, timedelta

from src.memory import get_memory_store, PostMortem


class CalibrationDashboard:
    """
    ASCII dashboard for viewing calibration metrics and performance.

    Displays:
    - Calibration by confidence bucket
    - Recent wager history
    - Daily performance summary
    - Learning rules status
    - Overall P&L
    """

    def __init__(self):
        self.store = get_memory_store()
        self.post_mortem = PostMortem(self.store)

    def display(self, section: str = "all"):
        """Display dashboard sections"""
        self._print_header()

        if section in ("all", "calibration"):
            self._print_calibration()

        if section in ("all", "performance"):
            self._print_performance()

        if section in ("all", "recent"):
            self._print_recent_wagers()

        if section in ("all", "rules"):
            self._print_learning_rules()

        self._print_footer()

    def _print_header(self):
        """Print dashboard header"""
        now = datetime.now().strftime("%Y-%m-%d %H:%M")
        print()
        print("╔" + "═" * 68 + "╗")
        print("║" + "NBA BETTOR AGENT - CALIBRATION DASHBOARD".center(68) + "║")
        print("║" + f"Generated: {now}".center(68) + "║")
        print("╠" + "═" * 68 + "╣")

    def _print_footer(self):
        """Print dashboard footer"""
        print("╚" + "═" * 68 + "╝")
        print()

    def _print_calibration(self):
        """Print calibration table"""
        print("║" + " CALIBRATION BY CONFIDENCE BUCKET".ljust(68) + "║")
        print("╟" + "─" * 68 + "╢")

        calibration = self.store.get_calibration_report()

        if not calibration:
            print("║" + "  No calibration data yet. Place some bets!".ljust(68) + "║")
        else:
            # Header
            header = f"  {'Bucket':<10} {'Total':<8} {'W-L-P':<12} {'Actual%':<10} {'Target%':<10} {'Error':<10}"
            print("║" + header.ljust(68) + "║")
            print("║" + "  " + "-" * 60 + "      ║")

            total_bets = 0
            total_wins = 0
            total_losses = 0

            for row in calibration:
                bucket = row["confidence_bucket"]
                total = row["total_bets"]
                wins = row["wins"]
                losses = row["losses"]
                pushes = row.get("pushes", 0)
                actual_pct = row.get("actual_pct")
                error_pct = row.get("error_pct")

                total_bets += total
                total_wins += wins
                total_losses += losses

                w_l_p = f"{wins}-{losses}-{pushes}"
                actual_str = f"{actual_pct:.1f}%" if actual_pct else "N/A"
                target_str = f"{bucket}%"
                error_str = f"{error_pct:.1f}%" if error_pct else "N/A"

                # Calibration indicator
                if actual_pct and error_pct:
                    if error_pct <= 5:
                        indicator = "✅"
                    elif error_pct <= 10:
                        indicator = "⚠️"
                    else:
                        indicator = "❌"
                else:
                    indicator = "  "

                line = f"  {bucket}%{indicator:<7} {total:<8} {w_l_p:<12} {actual_str:<10} {target_str:<10} {error_str:<10}"
                print("║" + line.ljust(68) + "║")

            # Summary
            print("║" + "  " + "-" * 60 + "      ║")
            if total_bets > 0:
                overall_pct = (total_wins / total_bets) * 100
                summary = f"  OVERALL: {total_wins}-{total_losses} ({overall_pct:.1f}%)"
                print("║" + summary.ljust(68) + "║")

        print("╟" + "─" * 68 + "╢")

    def _print_performance(self):
        """Print P&L performance"""
        print("║" + " PERFORMANCE SUMMARY".ljust(68) + "║")
        print("╟" + "─" * 68 + "╢")

        summaries = self.store.get_daily_summaries(days=7)

        if not summaries:
            print("║" + "  No performance data yet.".ljust(68) + "║")
        else:
            # Calculate totals
            total_profit = sum(s.get("total_profit", 0) or 0 for s in summaries)
            total_bets = sum(s.get("total_bets", 0) or 0 for s in summaries)
            total_wins = sum(s.get("wins", 0) or 0 for s in summaries)

            # ROI calculation (assuming 1 unit per bet)
            roi = (total_profit / total_bets * 100) if total_bets > 0 else 0

            # Win rate
            win_rate = (total_wins / total_bets * 100) if total_bets > 0 else 0

            # Profit indicator
            profit_symbol = "📈" if total_profit > 0 else "📉" if total_profit < 0 else "➡️"

            stats = [
                f"  Last 7 Days: {total_bets} bets",
                f"  Win Rate: {win_rate:.1f}%",
                f"  {profit_symbol} Total P&L: {total_profit:+.2f} units",
                f"  ROI: {roi:+.1f}%",
            ]

            for stat in stats:
                print("║" + stat.ljust(68) + "║")

            # Daily breakdown
            print("║" + "".ljust(68) + "║")
            print("║" + "  Daily Breakdown:".ljust(68) + "║")
            header = f"    {'Date':<12} {'Bets':<6} {'W-L':<8} {'P&L':<10}"
            print("║" + header.ljust(68) + "║")

            for summary in summaries[:7]:
                date = summary.get("date", "")
                bets = summary.get("total_bets", 0) or 0
                wins = summary.get("wins", 0) or 0
                losses = summary.get("losses", 0) or 0
                profit = summary.get("total_profit", 0) or 0

                w_l = f"{wins}-{losses}"
                profit_str = f"{profit:+.2f}"

                line = f"    {date:<12} {bets:<6} {w_l:<8} {profit_str:<10}"
                print("║" + line.ljust(68) + "║")

        print("╟" + "─" * 68 + "╢")

    def _print_recent_wagers(self):
        """Print recent wagers"""
        print("║" + " RECENT WAGERS".ljust(68) + "║")
        print("╟" + "─" * 68 + "╢")

        wagers = self.store.get_recent_wagers(limit=5)

        if not wagers:
            print("║" + "  No wagers recorded yet.".ljust(68) + "║")
        else:
            header = f"  {'ID':<5} {'Selection':<18} {'Conf%':<8} {'Edge%':<8} {'Result':<10}"
            print("║" + header.ljust(68) + "║")

            for wager in wagers:
                wager_id = wager.get("id", "")
                selection = wager.get("selection", "")[:16]
                confidence = wager.get("confidence", 0) * 100
                edge = wager.get("predicted_edge", 0) * 100
                outcome = wager.get("outcome") or "PENDING"

                # Outcome indicator
                if outcome == "WIN":
                    result = "✅ WIN"
                elif outcome == "LOSS":
                    result = "❌ LOSS"
                elif outcome == "PUSH":
                    result = "➡️ PUSH"
                else:
                    result = "⏳ PENDING"

                line = f"  {wager_id:<5} {selection:<18} {confidence:>5.0f}%   {edge:>5.1f}%   {result:<10}"
                print("║" + line.ljust(68) + "║")

        print("╟" + "─" * 68 + "╢")

    def _print_learning_rules(self):
        """Print active learning rules"""
        print("║" + " ACTIVE LEARNING RULES".ljust(68) + "║")
        print("╟" + "─" * 68 + "╢")

        rules = self.store.get_active_rules()

        if not rules:
            print("║" + "  No learning rules created yet.".ljust(68) + "║")
        else:
            for rule in rules[:5]:
                condition = rule.get("condition", "")[:30]
                adjustment = rule.get("adjustment", 0)
                adj_str = f"{adjustment:+.0%}" if adjustment else "0%"

                line = f"  • {condition:<30} → Adjust: {adj_str}"
                print("║" + line.ljust(68) + "║")

                # Show evidence
                evidence = rule.get("evidence", "")[:50]
                if evidence:
                    print("║" + f"    ({evidence})".ljust(68) + "║")

        print("╟" + "─" * 68 + "╢")


def main():
    """CLI entry point for dashboard"""
    import argparse

    parser = argparse.ArgumentParser(description="NBA Bettor Agent Dashboard")
    parser.add_argument(
        "--section",
        choices=["all", "calibration", "performance", "recent", "rules"],
        default="all",
        help="Section to display",
    )
    parser.add_argument(
        "--refresh",
        type=int,
        default=0,
        help="Refresh interval in seconds (0 = no refresh)",
    )

    args = parser.parse_args()

    dashboard = CalibrationDashboard()

    if args.refresh > 0:
        import time

        try:
            while True:
                # Clear screen
                print("\033[2J\033[H", end="")
                dashboard.display(section=args.section)
                time.sleep(args.refresh)
        except KeyboardInterrupt:
            print("\nDashboard stopped.")
    else:
        dashboard.display(section=args.section)


if __name__ == "__main__":
    main()
