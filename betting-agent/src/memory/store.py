"""Memory store for wager tracking and learning rules"""
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any

from .init_db import get_connection, get_db_path


class MemoryStore:
    """
    Episodic memory for the betting agent.

    Responsibilities:
    - Store wagers with full reasoning traces
    - Track outcomes and calculate calibration
    - Retrieve similar past bets
    - Manage learning rules
    """

    def __init__(self, db_path: Path | None = None):
        self.db_path = db_path or get_db_path()
        self._conn: sqlite3.Connection | None = None

    @property
    def conn(self) -> sqlite3.Connection:
        """Lazy connection initialization"""
        if self._conn is None:
            self._conn = get_connection(self.db_path)
        return self._conn

    def close(self):
        """Close database connection"""
        if self._conn is not None:
            self._conn.close()
            self._conn = None

    # ==================== WAGER OPERATIONS ====================

    def save_wager(
        self,
        game_id: str,
        bet_type: str,
        selection: str,
        line: float,
        confidence: float,
        predicted_edge: float,
        reasoning_trace: str | None = None,
        bull_arguments: list[dict] | None = None,
        bear_arguments: list[dict] | None = None,
        depth: str = "standard",
        debate_result: dict | None = None,
        quant_result: dict | None = None,
    ) -> int:
        """
        Save a new wager with full reasoning trace.

        Returns the wager ID.
        """
        # Serialize JSON fields
        bull_json = json.dumps(bull_arguments) if bull_arguments else None
        bear_json = json.dumps(bear_arguments) if bear_arguments else None

        # Build extended reasoning trace with all context
        full_trace = {
            "debate_transcript": reasoning_trace,
            "debate_result": debate_result,
            "quant_result": quant_result,
            "timestamp": datetime.now().isoformat(),
        }

        cursor = self.conn.execute(
            """
            INSERT INTO wagers (
                game_id, bet_type, selection, line, confidence, predicted_edge,
                reasoning_trace, bull_arguments, bear_arguments, depth
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                game_id,
                bet_type.upper(),
                selection,
                line,
                confidence,
                predicted_edge,
                json.dumps(full_trace),
                bull_json,
                bear_json,
                depth,
            ),
        )
        self.conn.commit()
        return cursor.lastrowid

    def get_wager(self, wager_id: int) -> dict | None:
        """Get a wager by ID"""
        cursor = self.conn.execute(
            "SELECT * FROM wagers WHERE id = ?", (wager_id,)
        )
        row = cursor.fetchone()
        if row:
            return self._row_to_dict(row)
        return None

    def get_unsettled_wagers(self) -> list[dict]:
        """Get all wagers without outcomes"""
        cursor = self.conn.execute(
            "SELECT * FROM wagers WHERE outcome IS NULL ORDER BY created_at DESC"
        )
        return [self._row_to_dict(row) for row in cursor.fetchall()]

    def get_recent_wagers(self, limit: int = 20) -> list[dict]:
        """Get recent wagers"""
        cursor = self.conn.execute(
            "SELECT * FROM wagers ORDER BY created_at DESC LIMIT ?", (limit,)
        )
        return [self._row_to_dict(row) for row in cursor.fetchall()]

    def get_wagers_by_game(self, game_id: str) -> list[dict]:
        """Get all wagers for a specific game"""
        cursor = self.conn.execute(
            "SELECT * FROM wagers WHERE game_id = ?", (game_id,)
        )
        return [self._row_to_dict(row) for row in cursor.fetchall()]

    def settle_wager(
        self,
        wager_id: int,
        outcome: str,
        actual_margin: float | None = None,
        profit: float | None = None,
    ):
        """
        Settle a wager with outcome.

        outcome: 'WIN', 'LOSS', or 'PUSH'
        """
        self.conn.execute(
            """
            UPDATE wagers
            SET outcome = ?, actual_margin = ?, profit = ?, settled_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (outcome.upper(), actual_margin, profit, wager_id),
        )
        self.conn.commit()

        # Update calibration
        wager = self.get_wager(wager_id)
        if wager:
            self._update_calibration(wager["confidence"], outcome)

    # ==================== CALIBRATION ====================

    def _update_calibration(self, confidence: float, outcome: str):
        """Update calibration log for confidence bucket"""
        # Round to nearest 10 (40, 50, 60, 70, 80)
        bucket = max(40, min(80, round(confidence * 100 / 10) * 10))

        win_col = "wins" if outcome == "WIN" else "losses" if outcome == "LOSS" else "pushes"

        self.conn.execute(
            f"""
            UPDATE calibration_log
            SET total_bets = total_bets + 1,
                {win_col} = {win_col} + 1,
                actual_win_rate = CAST(wins AS REAL) / NULLIF(wins + losses, 0),
                calibration_error = ABS((? / 100.0) - CAST(wins AS REAL) / NULLIF(wins + losses, 0)),
                updated_at = CURRENT_TIMESTAMP
            WHERE confidence_bucket = ?
            """,
            (bucket, bucket),
        )
        self.conn.commit()

    def get_calibration_report(self) -> list[dict]:
        """Get calibration statistics by confidence bucket"""
        cursor = self.conn.execute(
            """
            SELECT
                confidence_bucket,
                total_bets,
                wins,
                losses,
                pushes,
                ROUND(actual_win_rate * 100, 1) as actual_pct,
                ROUND(calibration_error * 100, 1) as error_pct
            FROM calibration_log
            WHERE total_bets > 0
            ORDER BY confidence_bucket
            """
        )
        return [dict(row) for row in cursor.fetchall()]

    # ==================== LEARNING RULES ====================

    def get_active_rules(self) -> list[dict]:
        """Get all active learning rules"""
        cursor = self.conn.execute(
            """
            SELECT * FROM learning_rules
            WHERE active = TRUE
            ORDER BY sample_size DESC
            """
        )
        return [dict(row) for row in cursor.fetchall()]

    def apply_rule(self, rule_id: int):
        """Mark a rule as applied"""
        self.conn.execute(
            """
            UPDATE learning_rules
            SET trigger_count = trigger_count + 1,
                last_applied_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (rule_id,),
        )
        self.conn.commit()

    def create_rule(
        self,
        condition: str,
        adjustment: float,
        evidence: str,
        condition_type: str = "natural",
    ) -> int:
        """Create a new learning rule"""
        cursor = self.conn.execute(
            """
            INSERT INTO learning_rules (condition, condition_type, adjustment, evidence)
            VALUES (?, ?, ?, ?)
            """,
            (condition, condition_type, adjustment, evidence),
        )
        self.conn.commit()
        return cursor.lastrowid

    def update_rule_performance(
        self, rule_id: int, win_rate_after: float, sample_size: int
    ):
        """Update rule performance metrics"""
        self.conn.execute(
            """
            UPDATE learning_rules
            SET win_rate_after = ?, sample_size = ?
            WHERE id = ?
            """,
            (win_rate_after, sample_size, rule_id),
        )
        self.conn.commit()

    def deactivate_rule(self, rule_id: int):
        """Deactivate a learning rule"""
        self.conn.execute(
            "UPDATE learning_rules SET active = FALSE WHERE id = ?",
            (rule_id,),
        )
        self.conn.commit()

    # ==================== SIMILAR BET RETRIEVAL ====================

    def find_similar_wagers(
        self,
        game_id: str | None = None,
        bet_type: str | None = None,
        selection_pattern: str | None = None,
        min_confidence: float | None = None,
        limit: int = 5,
    ) -> list[dict]:
        """
        Find similar past wagers for reference.

        Simple pattern matching (RAG with embeddings would be Phase 5).
        """
        query = "SELECT * FROM wagers WHERE outcome IS NOT NULL"
        params = []

        if bet_type:
            query += " AND bet_type = ?"
            params.append(bet_type.upper())

        if selection_pattern:
            query += " AND selection LIKE ?"
            params.append(f"%{selection_pattern}%")

        if min_confidence:
            query += " AND confidence >= ?"
            params.append(min_confidence)

        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        cursor = self.conn.execute(query, params)
        return [self._row_to_dict(row) for row in cursor.fetchall()]

    def get_historical_performance(
        self, selection_pattern: str, min_samples: int = 3
    ) -> dict | None:
        """Get historical performance for a selection pattern"""
        cursor = self.conn.execute(
            """
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN outcome = 'LOSS' THEN 1 ELSE 0 END) as losses,
                AVG(predicted_edge) as avg_edge,
                AVG(confidence) as avg_confidence,
                SUM(COALESCE(profit, 0)) as total_profit
            FROM wagers
            WHERE selection LIKE ?
            AND outcome IS NOT NULL
            """,
            (f"%{selection_pattern}%",),
        )
        row = cursor.fetchone()
        if row and row["total"] >= min_samples:
            return {
                "total": row["total"],
                "wins": row["wins"],
                "losses": row["losses"],
                "win_rate": row["wins"] / row["total"] if row["total"] > 0 else 0,
                "avg_edge": row["avg_edge"],
                "avg_confidence": row["avg_confidence"],
                "total_profit": row["total_profit"],
            }
        return None

    # ==================== AUTO-SETTLEMENT ====================

    async def auto_settle_wagers(self, db_tool) -> dict:
        """
        Auto-settle wagers by looking up game results from PostgreSQL.

        Args:
            db_tool: DatabaseTool instance for PostgreSQL queries

        Returns:
            dict with settlement summary
        """
        unsettled = self.get_unsettled_wagers()
        settled_count = 0
        wins = 0
        losses = 0
        pushes = 0
        results = []

        for wager in unsettled:
            game_id = wager.get("game_id")
            if not game_id:
                continue

            # Get game result from PostgreSQL
            result = await db_tool.execute("""
                SELECT home_team_score, away_team_score,
                       home_team_score + away_team_score as total
                FROM games
                WHERE game_id = $1
                  AND home_team_score IS NOT NULL
            """, [game_id])

            if not result.success or not result.data:
                continue  # Game not finished yet

            game = result.data[0]
            actual_total = game["total"]
            bet_type = wager.get("bet_type", "").upper()
            selection = wager.get("selection", "")
            line = wager.get("line", 0)

            # Extract line from selection if line is 0 (legacy wagers)
            if line == 0 and ("OVER" in selection.upper() or "UNDER" in selection.upper()):
                import re
                match = re.search(r'(OVER|UNDER)\s+([\d.]+)', selection, re.IGNORECASE)
                if match:
                    line = float(match.group(2))

            outcome = None
            actual_margin = None

            if bet_type == "TOTAL" or "OVER" in selection.upper() or "UNDER" in selection.upper():
                # Total bet settlement
                actual_margin = actual_total - line

                if "OVER" in selection.upper():
                    if actual_total > line:
                        outcome = "WIN"
                    elif actual_total < line:
                        outcome = "LOSS"
                    else:
                        outcome = "PUSH"
                elif "UNDER" in selection.upper():
                    if actual_total < line:
                        outcome = "WIN"
                    elif actual_total > line:
                        outcome = "LOSS"
                    else:
                        outcome = "PUSH"

            elif bet_type == "SPREAD" or (line != 0 and "OVER" not in selection.upper() and "UNDER" not in selection.upper()):
                # Spread bet settlement - get team abbreviations
                team_result = await db_tool.execute("""
                    SELECT
                        ht.abbreviation as home_team,
                        at.abbreviation as away_team,
                        g.home_team_score,
                        g.away_team_score,
                        g.home_team_score - g.away_team_score as home_margin
                    FROM games g
                    JOIN teams ht ON g.home_team_id = ht.team_id
                    JOIN teams at ON g.away_team_id = at.team_id
                    WHERE g.game_id = $1
                """, [game_id])

                if team_result.success and team_result.data:
                    team_data = team_result.data[0]
                    home_team = team_data["home_team"]
                    away_team = team_data["away_team"]
                    home_margin = team_data["home_margin"]

                    # Extract team from selection (e.g., "LAL -5.0" → "LAL")
                    import re
                    team_match = re.match(r'^([A-Z]{2,3})\s*[+-]?\d', selection.upper())
                    if team_match:
                        selected_team = team_match.group(1)

                        # Determine if selected team is home or away
                        if selected_team == home_team:
                            # Betting on home team to cover
                            actual_margin = home_margin + line  # line is negative for favorites
                        elif selected_team == away_team:
                            # Betting on away team to cover (away margin = -home_margin)
                            actual_margin = (-home_margin) + line
                        else:
                            continue  # Can't match team

                        if actual_margin > 0:
                            outcome = "WIN"
                        elif actual_margin < 0:
                            outcome = "LOSS"
                        else:
                            outcome = "PUSH"

            # Calculate profit
            profit = None
            if outcome == "WIN":
                profit = 0.91  # Standard -110 odds payout
                wins += 1
            elif outcome == "LOSS":
                profit = -1.0
                losses += 1
            elif outcome == "PUSH":
                profit = 0.0
                pushes += 1

            if outcome:
                self.settle_wager(
                    wager_id=wager["id"],
                    outcome=outcome,
                    actual_margin=actual_margin,
                    profit=profit,
                )
                settled_count += 1

                # Determine what to show for "actual" column
                is_total_bet = "OVER" in selection.upper() or "UNDER" in selection.upper()
                results.append({
                    "wager_id": wager["id"],
                    "selection": selection,
                    "line": line,
                    "actual_total": actual_total if is_total_bet else None,
                    "actual_margin": actual_margin if not is_total_bet else None,
                    "is_total_bet": is_total_bet,
                    "outcome": outcome,
                    "profit": profit,
                })

        return {
            "settled_count": settled_count,
            "wins": wins,
            "losses": losses,
            "pushes": pushes,
            "results": results,
            "total_profit": sum(r["profit"] for r in results if r["profit"]),
        }

    def get_performance_summary(self, bet_type: str = None) -> dict:
        """
        Get performance summary, optionally filtered by bet type.

        Returns detailed stats including:
        - Total bets and outcomes
        - Win rate by confidence bucket
        - ROI
        - Edge accuracy (predicted vs actual)
        """
        query = """
            SELECT
                COUNT(*) as total_bets,
                SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN outcome = 'LOSS' THEN 1 ELSE 0 END) as losses,
                SUM(CASE WHEN outcome = 'PUSH' THEN 1 ELSE 0 END) as pushes,
                SUM(COALESCE(profit, 0)) as total_profit,
                AVG(CASE WHEN outcome IS NOT NULL THEN confidence END) as avg_confidence,
                AVG(CASE WHEN outcome IS NOT NULL THEN predicted_edge END) as avg_edge,
                AVG(CASE WHEN outcome = 'WIN' THEN predicted_edge END) as avg_winning_edge,
                AVG(CASE WHEN outcome = 'LOSS' THEN predicted_edge END) as avg_losing_edge
            FROM wagers
            WHERE outcome IS NOT NULL
        """
        params = []

        if bet_type:
            query += " AND bet_type = ?"
            params.append(bet_type.upper())

        cursor = self.conn.execute(query, params)
        row = cursor.fetchone()

        if not row or row["total_bets"] == 0:
            return {"total_bets": 0, "message": "No settled bets found"}

        total = row["total_bets"]
        wins = row["wins"] or 0
        losses = row["losses"] or 0

        return {
            "total_bets": total,
            "wins": wins,
            "losses": losses,
            "pushes": row["pushes"] or 0,
            "win_rate": wins / (wins + losses) if (wins + losses) > 0 else 0,
            "total_profit": row["total_profit"] or 0,
            "roi": (row["total_profit"] or 0) / total * 100 if total > 0 else 0,
            "avg_confidence": row["avg_confidence"],
            "avg_edge": row["avg_edge"],
            "avg_winning_edge": row["avg_winning_edge"],
            "avg_losing_edge": row["avg_losing_edge"],
        }

    # ==================== DAILY SUMMARY ====================

    def update_daily_summary(self, date: str | None = None):
        """Update or create daily summary"""
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")

        # Calculate stats for the day
        cursor = self.conn.execute(
            """
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN outcome = 'LOSS' THEN 1 ELSE 0 END) as losses,
                SUM(CASE WHEN outcome = 'PUSH' THEN 1 ELSE 0 END) as pushes,
                SUM(COALESCE(profit, 0)) as profit,
                AVG(confidence) as avg_conf,
                AVG(predicted_edge) as avg_edge
            FROM wagers
            WHERE DATE(created_at) = ?
            """,
            (date,),
        )
        row = cursor.fetchone()

        self.conn.execute(
            """
            INSERT OR REPLACE INTO daily_summary (
                date, total_bets, wins, losses, pushes,
                total_profit, avg_confidence, avg_edge
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                date,
                row["total"] or 0,
                row["wins"] or 0,
                row["losses"] or 0,
                row["pushes"] or 0,
                row["profit"] or 0,
                row["avg_conf"],
                row["avg_edge"],
            ),
        )
        self.conn.commit()

    def get_daily_summaries(self, days: int = 30) -> list[dict]:
        """Get recent daily summaries"""
        cursor = self.conn.execute(
            """
            SELECT * FROM daily_summary
            ORDER BY date DESC
            LIMIT ?
            """,
            (days,),
        )
        return [dict(row) for row in cursor.fetchall()]

    # ==================== HELPERS ====================

    def _row_to_dict(self, row: sqlite3.Row) -> dict:
        """Convert row to dict with JSON parsing"""
        d = dict(row)

        # Parse JSON fields
        for field in ["reasoning_trace", "bull_arguments", "bear_arguments"]:
            if d.get(field):
                try:
                    d[field] = json.loads(d[field])
                except json.JSONDecodeError:
                    pass  # Keep as string if not valid JSON

        return d


# Singleton instance for easy import
_store: MemoryStore | None = None


def get_memory_store() -> MemoryStore:
    """Get or create singleton memory store"""
    global _store
    if _store is None:
        _store = MemoryStore()
    return _store
