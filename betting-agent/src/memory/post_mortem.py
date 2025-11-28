"""Post-mortem analysis for wager outcomes"""
import json
from datetime import datetime, timedelta
from typing import Any

from .store import MemoryStore, get_memory_store


class PostMortem:
    """
    Analyze settled wagers to learn from outcomes.

    Responsibilities:
    - Settle wagers when game results are available
    - Analyze high-confidence losses
    - Generate learning rules from patterns
    - Update calibration metrics
    """

    def __init__(self, store: MemoryStore | None = None):
        self.store = store or get_memory_store()

    async def run_nightly_analysis(self, db_tool=None):
        """
        Run full post-mortem analysis.

        Should be run nightly after games complete.
        """
        report = {
            "timestamp": datetime.now().isoformat(),
            "settled_count": 0,
            "wins": 0,
            "losses": 0,
            "pushes": 0,
            "high_confidence_losses": [],
            "new_rules": [],
            "calibration_update": None,
        }

        # 1. Settle unsettled wagers
        if db_tool:
            settled = await self._settle_pending_wagers(db_tool)
            report["settled_count"] = len(settled)
            for result in settled:
                if result["outcome"] == "WIN":
                    report["wins"] += 1
                elif result["outcome"] == "LOSS":
                    report["losses"] += 1
                else:
                    report["pushes"] += 1

        # 2. Analyze high-confidence losses
        high_conf_losses = self._find_high_confidence_losses()
        report["high_confidence_losses"] = high_conf_losses

        # 3. Generate learning rules from patterns
        new_rules = self._analyze_loss_patterns()
        report["new_rules"] = new_rules

        # 4. Update daily summary
        self.store.update_daily_summary()

        # 5. Get updated calibration
        report["calibration_update"] = self.store.get_calibration_report()

        return report

    async def _settle_pending_wagers(self, db_tool) -> list[dict]:
        """Settle wagers using game results from database"""
        unsettled = self.store.get_unsettled_wagers()
        settled = []

        for wager in unsettled:
            game_id = wager["game_id"]
            if not game_id:
                continue

            # Fetch game result from database
            try:
                result = await db_tool.execute(
                    """
                    SELECT
                        home_team_score,
                        away_team_score,
                        (home_team_score - away_team_score) as margin,
                        status
                    FROM games
                    WHERE game_id = $1
                    """,
                    [game_id],
                )

                if not result.success or not result.data:
                    continue

                game = result.data[0]
                if game.get("status") != "Final":
                    continue  # Game not finished

                # Determine outcome based on wager type
                outcome, actual_margin = self._determine_outcome(wager, game)

                if outcome:
                    # Calculate profit (assuming -110 odds)
                    profit = self._calculate_profit(outcome, wager.get("line", 0))

                    self.store.settle_wager(
                        wager["id"],
                        outcome,
                        actual_margin,
                        profit,
                    )

                    settled.append({
                        "wager_id": wager["id"],
                        "outcome": outcome,
                        "actual_margin": actual_margin,
                        "profit": profit,
                    })

            except Exception as e:
                print(f"Error settling wager {wager['id']}: {e}")
                continue

        return settled

    def _determine_outcome(self, wager: dict, game: dict) -> tuple[str | None, float | None]:
        """Determine if wager won, lost, or pushed"""
        bet_type = wager.get("bet_type", "").upper()
        selection = wager.get("selection", "")
        line = wager.get("line", 0)
        margin = float(game.get("margin", 0))

        if bet_type == "SPREAD":
            # Parse selection to determine which team was picked
            # Selection format: "LAL -5.0" or "BOS +5.0"

            # Simple heuristic: if line is negative, we took the favorite
            # Actual margin vs line determines outcome
            if "+" in selection:
                # Underdog - they need to lose by less than line (or win)
                adjusted_margin = -margin  # Flip for underdog perspective
            else:
                # Favorite - they need to win by more than line
                adjusted_margin = margin

            cover_margin = adjusted_margin + line  # Add line (negative for favorite)

            if abs(cover_margin) < 0.5:
                return "PUSH", margin
            elif cover_margin > 0:
                return "WIN", margin
            else:
                return "LOSS", margin

        elif bet_type == "TOTAL":
            total = float(game.get("home_team_score", 0)) + float(
                game.get("away_team_score", 0)
            )
            actual_margin = total

            if "OVER" in selection.upper():
                if total > line:
                    return "WIN", actual_margin
                elif total < line:
                    return "LOSS", actual_margin
                else:
                    return "PUSH", actual_margin
            else:  # UNDER
                if total < line:
                    return "WIN", actual_margin
                elif total > line:
                    return "LOSS", actual_margin
                else:
                    return "PUSH", actual_margin

        return None, None

    def _calculate_profit(self, outcome: str, _line: float) -> float:
        """
        Calculate profit assuming standard -110 odds.

        WIN: +0.91 units (risking 1 to win 0.91)
        LOSS: -1.00 units
        PUSH: 0.00 units
        """
        if outcome == "WIN":
            return 0.91
        elif outcome == "LOSS":
            return -1.00
        else:
            return 0.00

    def _find_high_confidence_losses(self, threshold: float = 0.7) -> list[dict]:
        """Find losses where confidence was high"""
        cursor = self.store.conn.execute(
            """
            SELECT * FROM wagers
            WHERE outcome = 'LOSS'
            AND confidence >= ?
            ORDER BY confidence DESC
            LIMIT 20
            """,
            (threshold,),
        )
        return [self.store._row_to_dict(row) for row in cursor.fetchall()]

    def _analyze_loss_patterns(self) -> list[dict]:
        """
        Analyze losses to identify patterns for learning rules.

        Returns list of potential new rules.
        """
        new_rules = []

        # Pattern 1: High edge but loss
        high_edge_losses = self._query_pattern(
            """
            SELECT
                COUNT(*) as count,
                AVG(predicted_edge) as avg_edge,
                AVG(confidence) as avg_conf
            FROM wagers
            WHERE outcome = 'LOSS'
            AND predicted_edge > 0.05
            """
        )

        if high_edge_losses and high_edge_losses.get("count", 0) >= 5:
            loss_rate = high_edge_losses["count"] / max(
                self._get_high_edge_total(), 1
            )
            if loss_rate > 0.55:  # More than 55% loss rate on high edge bets
                new_rules.append({
                    "condition": "predicted_edge > 0.05",
                    "adjustment": -0.02,
                    "evidence": f"High edge bets losing {loss_rate*100:.0f}% ({high_edge_losses['count']} samples)",
                    "pattern": "high_edge_overconfidence",
                })

        # Pattern 2: Bull won debate but loss
        bull_win_losses = self._query_pattern(
            """
            SELECT COUNT(*) as count
            FROM wagers
            WHERE outcome = 'LOSS'
            AND reasoning_trace LIKE '%"winner": "BULL"%'
            """
        )

        total_bull_wins = self._query_pattern(
            """
            SELECT COUNT(*) as count
            FROM wagers
            WHERE reasoning_trace LIKE '%"winner": "BULL"%'
            AND outcome IS NOT NULL
            """
        )

        if (
            bull_win_losses
            and total_bull_wins
            and bull_win_losses.get("count", 0) >= 5
        ):
            loss_rate = bull_win_losses["count"] / max(
                total_bull_wins.get("count", 1), 1
            )
            if loss_rate > 0.50:  # Bull winning debate but still losing >50%
                new_rules.append({
                    "condition": "debate_winner = BULL",
                    "adjustment": -0.03,
                    "evidence": f"Bull debate wins losing {loss_rate*100:.0f}% of time",
                    "pattern": "debate_overconfidence",
                })

        return new_rules

    def _query_pattern(self, query: str) -> dict | None:
        """Execute pattern analysis query"""
        try:
            cursor = self.store.conn.execute(query)
            row = cursor.fetchone()
            return dict(row) if row else None
        except Exception:
            return None

    def _get_high_edge_total(self) -> int:
        """Get total high edge bets"""
        result = self._query_pattern(
            """
            SELECT COUNT(*) as count FROM wagers
            WHERE predicted_edge > 0.05
            AND outcome IS NOT NULL
            """
        )
        return result.get("count", 0) if result else 0

    def generate_calibration_report(self) -> str:
        """Generate human-readable calibration report"""
        calibration = self.store.get_calibration_report()

        if not calibration:
            return "No calibration data available yet."

        report = ["", "=" * 50, "CALIBRATION REPORT", "=" * 50, ""]
        report.append(f"{'Bucket':<10} {'Total':<8} {'Wins':<8} {'Actual%':<10} {'Error%':<10}")
        report.append("-" * 50)

        for row in calibration:
            report.append(
                f"{row['confidence_bucket']}%{'':<6} "
                f"{row['total_bets']:<8} "
                f"{row['wins']:<8} "
                f"{row['actual_pct'] or 'N/A':<10} "
                f"{row['error_pct'] or 'N/A':<10}"
            )

        report.append("=" * 50)

        # Overall assessment
        total_bets = sum(r["total_bets"] for r in calibration)
        total_wins = sum(r["wins"] for r in calibration)
        if total_bets > 0:
            overall_rate = total_wins / total_bets * 100
            report.append(f"\nOverall: {total_wins}/{total_bets} ({overall_rate:.1f}%)")

        return "\n".join(report)

    def analyze_loss(
        self,
        wager_id: int,
        root_cause: str,
        category: str,
        severity: str = "MEDIUM",
        action_taken: str | None = None,
    ):
        """Record root cause analysis for a loss"""
        self.store.conn.execute(
            """
            INSERT INTO loss_analysis (wager_id, root_cause, category, severity, action_taken)
            VALUES (?, ?, ?, ?, ?)
            """,
            (wager_id, root_cause, category, severity, action_taken),
        )
        self.store.conn.commit()

    def get_loss_analysis_summary(self) -> dict:
        """Get summary of loss root causes"""
        cursor = self.store.conn.execute(
            """
            SELECT
                category,
                COUNT(*) as count,
                AVG(w.confidence) as avg_confidence
            FROM loss_analysis la
            JOIN wagers w ON la.wager_id = w.id
            GROUP BY category
            ORDER BY count DESC
            """
        )

        return {
            "by_category": [dict(row) for row in cursor.fetchall()],
        }
