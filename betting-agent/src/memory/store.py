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

    # ==================== PLAYER PROP SETTLEMENT ====================

    def settle_player_prop(
        self,
        wager_id: int,
        actual_stat: float,
        line: float | None = None,
        direction: str | None = None,
    ) -> dict:
        """
        Settle a player prop wager.

        Args:
            wager_id: The wager ID to settle
            actual_stat: The player's actual stat value
            line: The prop line (if not stored in wager)
            direction: 'over' or 'under' (if not stored in selection)

        Returns:
            dict with settlement result
        """
        wager = self.get_wager(wager_id)
        if not wager:
            return {"error": f"Wager {wager_id} not found"}

        if wager.get("outcome"):
            return {"error": f"Wager {wager_id} already settled: {wager['outcome']}"}

        selection = wager.get("selection", "").upper()
        wager_line = line or wager.get("line", 0)

        # Determine direction from selection if not provided
        if direction is None:
            if "OVER" in selection:
                direction = "over"
            elif "UNDER" in selection:
                direction = "under"
            else:
                return {"error": f"Cannot determine direction from selection: {selection}"}

        # Determine outcome
        if direction == "over":
            if actual_stat > wager_line:
                outcome = "WIN"
            elif actual_stat < wager_line:
                outcome = "LOSS"
            else:
                outcome = "PUSH"
        else:  # under
            if actual_stat < wager_line:
                outcome = "WIN"
            elif actual_stat > wager_line:
                outcome = "LOSS"
            else:
                outcome = "PUSH"

        # Calculate profit (assuming -110 odds = 1.91 decimal)
        if outcome == "WIN":
            profit = 0.91  # Standard -110 payout
        elif outcome == "LOSS":
            profit = -1.0
        else:
            profit = 0.0

        # Settle the wager
        actual_margin = actual_stat - wager_line
        self.settle_wager(
            wager_id=wager_id,
            outcome=outcome,
            actual_margin=actual_margin,
            profit=profit,
        )

        return {
            "wager_id": wager_id,
            "selection": selection,
            "line": wager_line,
            "actual_stat": actual_stat,
            "direction": direction,
            "outcome": outcome,
            "profit": profit,
            "margin": actual_margin,
        }

    async def auto_settle_player_props(self, db_tool) -> dict:
        """
        Auto-settle player prop wagers from game stats.

        Args:
            db_tool: DatabaseTool instance for PostgreSQL queries

        Returns:
            dict with settlement summary
        """
        unsettled = self.get_unsettled_wagers()

        # Filter to player props only
        player_prop_wagers = [
            w for w in unsettled
            if w.get("bet_type", "").upper() == "PLAYER_PROP"
        ]

        if not player_prop_wagers:
            return {
                "settled_count": 0,
                "message": "No unsettled player prop wagers found"
            }

        settled_count = 0
        wins = 0
        losses = 0
        pushes = 0
        results = []
        errors = []

        for wager in player_prop_wagers:
            game_id = wager.get("game_id")
            selection = wager.get("selection", "")
            line = wager.get("line", 0)

            if not game_id:
                errors.append({"wager_id": wager["id"], "error": "No game_id"})
                continue

            # Parse selection to get player name and stat type
            # Format expected: "LeBron James OVER 25.5 points" or similar
            import re
            match = re.match(
                r'^(.+?)\s+(OVER|UNDER)\s+([\d.]+)\s+(\w+)',
                selection,
                re.IGNORECASE
            )
            if not match:
                errors.append({
                    "wager_id": wager["id"],
                    "error": f"Cannot parse selection: {selection}"
                })
                continue

            player_name = match.group(1).strip()
            direction = match.group(2).lower()
            prop_line = float(match.group(3))
            stat_type = match.group(4).lower()

            # Map stat type to database column
            stat_column_map = {
                "points": "points",
                "pts": "points",
                "rebounds": "rebounds",
                "rebs": "rebounds",
                "assists": "assists",
                "asts": "assists",
                "threes": "fg3_made",
                "3pm": "fg3_made",
                "3s": "fg3_made",
                "steals": "steals",
                "blocks": "blocks",
                "turnovers": "turnovers",
            }

            db_column = stat_column_map.get(stat_type)
            if not db_column:
                # Handle combo stats
                if stat_type in ("pra", "pts+rebs+asts"):
                    db_column = "points + rebounds + assists"
                elif stat_type in ("pr", "pts+rebs", "points_rebounds"):
                    db_column = "points + rebounds"
                elif stat_type in ("pa", "pts+asts", "points_assists"):
                    db_column = "points + assists"
                elif stat_type in ("ra", "rebs+asts", "rebounds_assists"):
                    db_column = "rebounds + assists"
                else:
                    errors.append({
                        "wager_id": wager["id"],
                        "error": f"Unknown stat type: {stat_type}"
                    })
                    continue

            # Get actual stat from player_game_stats
            result = await db_tool.execute(f"""
                SELECT {db_column} as stat_value
                FROM player_game_stats pgs
                JOIN players p ON pgs.player_id = p.player_id
                WHERE pgs.game_id = $1
                  AND LOWER(p.full_name) LIKE $2
            """, [game_id, f"%{player_name.lower()}%"])

            if not result.success or not result.data:
                # Game not finished or player didn't play
                continue

            actual_stat = result.data[0]["stat_value"]
            if actual_stat is None:
                continue

            actual_stat = float(actual_stat)

            # Settle the prop
            settlement = self.settle_player_prop(
                wager_id=wager["id"],
                actual_stat=actual_stat,
                line=prop_line,
                direction=direction,
            )

            if "error" not in settlement:
                settled_count += 1
                outcome = settlement["outcome"]
                if outcome == "WIN":
                    wins += 1
                elif outcome == "LOSS":
                    losses += 1
                else:
                    pushes += 1

                results.append({
                    "wager_id": wager["id"],
                    "player": player_name,
                    "stat_type": stat_type,
                    "line": prop_line,
                    "actual": actual_stat,
                    "direction": direction,
                    "outcome": outcome,
                    "profit": settlement["profit"],
                })
            else:
                errors.append({
                    "wager_id": wager["id"],
                    "error": settlement["error"]
                })

        return {
            "settled_count": settled_count,
            "wins": wins,
            "losses": losses,
            "pushes": pushes,
            "results": results,
            "errors": errors if errors else None,
            "total_profit": sum(r["profit"] for r in results if r.get("profit")),
        }

    def get_player_prop_performance(self) -> dict:
        """
        Get performance breakdown for player props by stat type.

        Returns performance by:
        - Stat type (points, rebounds, assists, etc.)
        - Direction (over vs under)
        - Player (if enough samples)
        """
        cursor = self.conn.execute(
            """
            SELECT
                CASE
                    WHEN UPPER(selection) LIKE '%OVER%' THEN 'OVER'
                    WHEN UPPER(selection) LIKE '%UNDER%' THEN 'UNDER'
                    ELSE 'UNKNOWN'
                END as direction,
                CASE
                    WHEN LOWER(selection) LIKE '%points%' OR LOWER(selection) LIKE '%pts%' THEN 'points'
                    WHEN LOWER(selection) LIKE '%rebounds%' OR LOWER(selection) LIKE '%rebs%' THEN 'rebounds'
                    WHEN LOWER(selection) LIKE '%assists%' OR LOWER(selection) LIKE '%asts%' THEN 'assists'
                    WHEN LOWER(selection) LIKE '%threes%' OR LOWER(selection) LIKE '%3pm%' THEN '3pm'
                    WHEN LOWER(selection) LIKE '%pra%' THEN 'pra'
                    ELSE 'other'
                END as stat_type,
                COUNT(*) as total,
                SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN outcome = 'LOSS' THEN 1 ELSE 0 END) as losses,
                AVG(confidence) as avg_confidence,
                AVG(predicted_edge) as avg_edge,
                SUM(COALESCE(profit, 0)) as total_profit
            FROM wagers
            WHERE bet_type = 'PLAYER_PROP'
              AND outcome IS NOT NULL
            GROUP BY direction, stat_type
            ORDER BY total DESC
            """
        )

        results = {
            "by_direction": {"OVER": {}, "UNDER": {}},
            "by_stat_type": {},
            "overall": {"total": 0, "wins": 0, "losses": 0, "profit": 0}
        }

        for row in cursor.fetchall():
            direction = row["direction"]
            stat_type = row["stat_type"]
            total = row["total"]
            wins = row["wins"] or 0
            losses = row["losses"] or 0

            stat_data = {
                "total": total,
                "wins": wins,
                "losses": losses,
                "win_rate": wins / (wins + losses) if (wins + losses) > 0 else 0,
                "avg_confidence": row["avg_confidence"],
                "avg_edge": row["avg_edge"],
                "total_profit": row["total_profit"] or 0,
            }

            # Add to direction breakdown
            if direction in results["by_direction"]:
                results["by_direction"][direction][stat_type] = stat_data

            # Add to stat type breakdown
            if stat_type not in results["by_stat_type"]:
                results["by_stat_type"][stat_type] = {
                    "total": 0, "wins": 0, "losses": 0, "profit": 0
                }
            results["by_stat_type"][stat_type]["total"] += total
            results["by_stat_type"][stat_type]["wins"] += wins
            results["by_stat_type"][stat_type]["losses"] += losses
            results["by_stat_type"][stat_type]["profit"] += row["total_profit"] or 0

            # Update overall
            results["overall"]["total"] += total
            results["overall"]["wins"] += wins
            results["overall"]["losses"] += losses
            results["overall"]["profit"] += row["total_profit"] or 0

        # Calculate win rates for stat types
        for stat_type, data in results["by_stat_type"].items():
            if data["wins"] + data["losses"] > 0:
                data["win_rate"] = data["wins"] / (data["wins"] + data["losses"])
            else:
                data["win_rate"] = 0

        # Calculate overall win rate
        if results["overall"]["wins"] + results["overall"]["losses"] > 0:
            results["overall"]["win_rate"] = (
                results["overall"]["wins"] /
                (results["overall"]["wins"] + results["overall"]["losses"])
            )
        else:
            results["overall"]["win_rate"] = 0

        return results

    def get_direction_performance(self) -> dict:
        """
        Get performance breakdown by direction (OVER vs UNDER).

        Critical for calibration - Nov 2025 backtest showed:
        - OVER: 16.7% win rate (disaster)
        - UNDER: 62.5% win rate (profitable)
        """
        cursor = self.conn.execute(
            """
            SELECT
                CASE
                    WHEN UPPER(selection) LIKE '%OVER%' THEN 'OVER'
                    WHEN UPPER(selection) LIKE '%UNDER%' THEN 'UNDER'
                    ELSE 'OTHER'
                END as direction,
                COUNT(*) as total,
                SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN outcome = 'LOSS' THEN 1 ELSE 0 END) as losses,
                AVG(confidence) as avg_confidence,
                AVG(predicted_edge) as avg_edge,
                SUM(COALESCE(profit, 0)) as total_profit
            FROM wagers
            WHERE outcome IS NOT NULL
            GROUP BY direction
            """
        )
        results = {}
        for row in cursor.fetchall():
            direction = row["direction"]
            total = row["total"]
            wins = row["wins"] or 0
            losses = row["losses"] or 0
            results[direction] = {
                "total": total,
                "wins": wins,
                "losses": losses,
                "win_rate": wins / (wins + losses) if (wins + losses) > 0 else 0,
                "avg_confidence": row["avg_confidence"],
                "avg_edge": row["avg_edge"],
                "total_profit": row["total_profit"] or 0,
            }
        return results

    def get_confidence_vs_outcome(self) -> dict:
        """
        Get win rate by confidence bucket to detect inverse correlation.

        Returns buckets: low (<55%), medium (55-70%), high (>70%)
        """
        cursor = self.conn.execute(
            """
            SELECT
                CASE
                    WHEN confidence < 0.55 THEN 'low'
                    WHEN confidence < 0.70 THEN 'medium'
                    ELSE 'high'
                END as conf_bucket,
                COUNT(*) as total,
                SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN outcome = 'LOSS' THEN 1 ELSE 0 END) as losses
            FROM wagers
            WHERE outcome IS NOT NULL
            GROUP BY conf_bucket
            """
        )
        results = {}
        for row in cursor.fetchall():
            bucket = row["conf_bucket"]
            total = row["total"]
            wins = row["wins"] or 0
            losses = row["losses"] or 0
            results[bucket] = {
                "total": total,
                "wins": wins,
                "losses": losses,
                "win_rate": wins / (wins + losses) if (wins + losses) > 0 else 0,
            }
        return results

    def get_calibration_adjustments(self) -> dict:
        """
        Calculate recommended adjustments based on historical performance.

        Used by judge.py to apply data-driven confidence corrections.
        """
        direction_perf = self.get_direction_performance()
        conf_perf = self.get_confidence_vs_outcome()

        adjustments = {
            "direction_multipliers": {},
            "confidence_discounts": {},
            "recommendations": [],
        }

        # Direction adjustments
        over_perf = direction_perf.get("OVER", {})
        under_perf = direction_perf.get("UNDER", {})

        if over_perf.get("total", 0) >= 5:
            over_win_rate = over_perf.get("win_rate", 0.5)
            if over_win_rate < 0.35:
                adjustments["direction_multipliers"]["OVER"] = 0.5
                adjustments["recommendations"].append(
                    f"OVER picks: {over_win_rate:.1%} win rate - apply 50% edge penalty"
                )
            elif over_win_rate < 0.45:
                adjustments["direction_multipliers"]["OVER"] = 0.75
                adjustments["recommendations"].append(
                    f"OVER picks: {over_win_rate:.1%} win rate - apply 25% edge penalty"
                )

        if under_perf.get("total", 0) >= 5:
            under_win_rate = under_perf.get("win_rate", 0.5)
            if under_win_rate > 0.55:
                adjustments["direction_multipliers"]["UNDER"] = 1.15
                adjustments["recommendations"].append(
                    f"UNDER picks: {under_win_rate:.1%} win rate - apply 15% edge boost"
                )

        # Confidence adjustments (detect inverse correlation)
        high_conf = conf_perf.get("high", {})
        low_conf = conf_perf.get("low", {})

        if high_conf.get("total", 0) >= 5 and low_conf.get("total", 0) >= 5:
            high_win = high_conf.get("win_rate", 0.5)
            low_win = low_conf.get("win_rate", 0.5)

            if high_win < low_win:
                # Inverse correlation detected!
                adjustments["confidence_discounts"]["inverse_detected"] = True
                adjustments["confidence_discounts"]["high_conf_penalty"] = 0.75
                adjustments["recommendations"].append(
                    f"INVERSE CORRELATION: High conf {high_win:.1%} < Low conf {low_win:.1%}"
                )

        return adjustments

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
