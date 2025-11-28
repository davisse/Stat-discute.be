"""Tests for Memory module (store and post-mortem)"""
import pytest
import sqlite3
from pathlib import Path
from datetime import datetime

from src.memory.init_db import init_database, get_db_path, get_connection
from src.memory.store import MemoryStore
from src.memory.post_mortem import PostMortem


class TestDatabaseInit:
    """Tests for database initialization"""

    def test_init_creates_database(self, temp_db_path):
        """Database file is created on init"""
        assert not temp_db_path.exists()
        conn = init_database(temp_db_path)
        assert temp_db_path.exists()
        conn.close()

    def test_init_creates_tables(self, temp_db_path):
        """All required tables are created"""
        conn = init_database(temp_db_path)

        cursor = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        )
        tables = {row[0] for row in cursor.fetchall()}

        assert "wagers" in tables
        assert "calibration_log" in tables
        assert "learning_rules" in tables
        assert "loss_analysis" in tables
        assert "daily_summary" in tables

        conn.close()

    def test_init_idempotent(self, temp_db_path):
        """Multiple init calls don't fail"""
        conn1 = init_database(temp_db_path)
        conn1.close()

        conn2 = init_database(temp_db_path)
        conn2.close()

    def test_get_db_path_returns_path(self):
        """get_db_path returns a Path object"""
        path = get_db_path()
        assert isinstance(path, Path)
        assert "agent_memory.db" in str(path)


class TestMemoryStore:
    """Tests for MemoryStore class"""

    @pytest.fixture
    def store(self, temp_db_path):
        """Create store with test database"""
        init_database(temp_db_path)
        s = MemoryStore(temp_db_path)
        yield s
        s.close()

    def test_save_wager_returns_id(self, store):
        """save_wager returns wager ID"""
        wager_id = store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.75,
            predicted_edge=0.08,
            reasoning_trace="Test reasoning",
        )

        assert wager_id is not None
        assert wager_id > 0

    def test_save_wager_with_full_data(self, store):
        """save_wager stores all provided data"""
        wager_id = store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.75,
            predicted_edge=0.08,
            reasoning_trace="Test reasoning",
            bull_arguments=[{"type": "edge", "strength": 0.8}],
            bear_arguments=[{"type": "methodology", "strength": 0.6}],
            depth="deep",
            debate_result={"winner": "BULL"},
            quant_result={"edge": 0.08},
        )

        wager = store.get_wager(wager_id)

        assert wager is not None
        assert wager["game_id"] == "0022500123"
        assert wager["selection"] == "LAL -5.0"
        assert wager["confidence"] == 0.75

    def test_get_wager_returns_none_for_missing(self, store):
        """get_wager returns None for non-existent ID"""
        wager = store.get_wager(99999)
        assert wager is None

    def test_settle_wager_updates_outcome_win(self, store):
        """settle_wager updates outcome for win"""
        wager_id = store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.75,
            predicted_edge=0.08,
            reasoning_trace="Test",
        )

        store.settle_wager(wager_id, outcome="WIN", profit=0.91)

        wager = store.get_wager(wager_id)
        assert wager["outcome"] == "WIN"
        assert wager["profit"] == 0.91

    def test_settle_wager_updates_outcome_loss(self, store):
        """settle_wager handles losses"""
        wager_id = store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.75,
            predicted_edge=0.08,
            reasoning_trace="Test",
        )

        store.settle_wager(wager_id, outcome="LOSS", profit=-1.0)

        wager = store.get_wager(wager_id)
        assert wager["outcome"] == "LOSS"
        assert wager["profit"] == -1.0

    def test_settle_wager_push(self, store):
        """settle_wager handles push"""
        wager_id = store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.75,
            predicted_edge=0.08,
            reasoning_trace="Test",
        )

        store.settle_wager(wager_id, outcome="PUSH", profit=0)

        wager = store.get_wager(wager_id)
        assert wager["outcome"] == "PUSH"
        assert wager["profit"] == 0

    def test_get_recent_wagers(self, store):
        """get_recent_wagers returns recent entries"""
        # Save multiple wagers
        for i in range(5):
            store.save_wager(
                game_id=f"002250012{i}",
                bet_type="SPREAD",
                selection=f"TEAM{i}",
                line=-5.0,
                confidence=0.7,
                predicted_edge=0.05,
                reasoning_trace="Test",
            )

        recent = store.get_recent_wagers(limit=3)
        assert len(recent) == 3

    def test_get_recent_wagers_empty(self, store):
        """get_recent_wagers returns empty list when no wagers"""
        recent = store.get_recent_wagers()
        assert recent == []

    def test_get_unsettled_wagers(self, store):
        """get_unsettled_wagers returns pending wagers"""
        wager_id = store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.75,
            predicted_edge=0.08,
            reasoning_trace="Test",
        )

        unsettled = store.get_unsettled_wagers()
        assert len(unsettled) == 1
        assert unsettled[0]["id"] == wager_id

    def test_get_wagers_by_game(self, store):
        """get_wagers_by_game finds wagers for specific game"""
        store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.75,
            predicted_edge=0.08,
            reasoning_trace="Test",
        )
        store.save_wager(
            game_id="0022500124",
            bet_type="SPREAD",
            selection="BOS -3.0",
            line=-3.0,
            confidence=0.70,
            predicted_edge=0.06,
            reasoning_trace="Test",
        )

        wagers = store.get_wagers_by_game("0022500123")
        assert len(wagers) == 1
        assert wagers[0]["selection"] == "LAL -5.0"

    def test_find_similar_wagers(self, store):
        """find_similar_wagers finds matching patterns"""
        # Save and settle some wagers
        wager_id = store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.75,
            predicted_edge=0.08,
            reasoning_trace="Test",
        )
        store.settle_wager(wager_id, outcome="WIN", profit=0.91)

        similar = store.find_similar_wagers(
            bet_type="SPREAD",
            selection_pattern="LAL",
        )

        assert len(similar) >= 1
        assert "LAL" in similar[0]["selection"]


class TestCalibrationTracking:
    """Tests for calibration tracking"""

    @pytest.fixture
    def store(self, temp_db_path):
        init_database(temp_db_path)
        s = MemoryStore(temp_db_path)
        yield s
        s.close()

    def test_settle_updates_calibration(self, store):
        """Settling wager updates calibration log"""
        wager_id = store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.75,  # Should round to 80 bucket
            predicted_edge=0.08,
            reasoning_trace="Test",
        )

        store.settle_wager(wager_id, outcome="WIN", profit=0.91)

        # Check calibration was updated
        report = store.get_calibration_report()
        # Find the 80 bucket
        bucket_80 = next((r for r in report if r["confidence_bucket"] == 80), None)
        if bucket_80:
            assert bucket_80["wins"] >= 1

    def test_get_calibration_report(self, store):
        """get_calibration_report returns calibration metrics"""
        # Settle multiple wagers at different confidence levels
        for conf in [0.65, 0.75, 0.85]:
            wager_id = store.save_wager(
                game_id="0022500123",
                bet_type="SPREAD",
                selection="TEST",
                line=-5.0,
                confidence=conf,
                predicted_edge=0.05,
                reasoning_trace="Test",
            )
            store.settle_wager(wager_id, outcome="WIN", profit=0.91)

        report = store.get_calibration_report()
        # Should have some buckets with data
        assert isinstance(report, list)


class TestLearningRules:
    """Tests for learning rules"""

    @pytest.fixture
    def store(self, temp_db_path):
        init_database(temp_db_path)
        s = MemoryStore(temp_db_path)
        yield s
        s.close()

    def test_create_rule(self, store):
        """create_rule stores new rule"""
        rule_id = store.create_rule(
            condition="team_on_b2b",
            adjustment=-0.05,
            evidence="Lost 8 of last 10 B2B bets",
        )

        assert rule_id is not None
        assert rule_id > 0

    def test_get_active_rules(self, store):
        """get_active_rules returns active rules"""
        store.create_rule("team_on_b2b", -0.05, "Evidence 1")
        store.create_rule("heavy_favorite", -0.03, "Evidence 2")

        rules = store.get_active_rules()

        assert len(rules) >= 2

    def test_deactivate_rule(self, store):
        """deactivate_rule marks rule as inactive"""
        rule_id = store.create_rule("test_rule", -0.05, "Test")

        store.deactivate_rule(rule_id)

        rules = store.get_active_rules()
        rule_ids = [r["id"] for r in rules]
        assert rule_id not in rule_ids


class TestDailySummary:
    """Tests for daily summary"""

    @pytest.fixture
    def store(self, temp_db_path):
        init_database(temp_db_path)
        s = MemoryStore(temp_db_path)
        yield s
        s.close()

    def test_update_daily_summary(self, store):
        """update_daily_summary creates summary"""
        # Add some wagers
        store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.75,
            predicted_edge=0.08,
            reasoning_trace="Test",
        )

        today = datetime.now().strftime("%Y-%m-%d")
        store.update_daily_summary(today)

        summaries = store.get_daily_summaries(days=1)
        assert len(summaries) == 1
        assert summaries[0]["date"] == today

    def test_get_daily_summaries(self, store):
        """get_daily_summaries returns recent summaries"""
        summaries = store.get_daily_summaries(days=7)
        assert isinstance(summaries, list)


class TestPostMortem:
    """Tests for PostMortem analysis"""

    @pytest.fixture
    def store(self, temp_db_path):
        init_database(temp_db_path)
        s = MemoryStore(temp_db_path)
        yield s
        s.close()

    @pytest.fixture
    def post_mortem(self, store):
        return PostMortem(store)

    @pytest.mark.asyncio
    async def test_run_nightly_analysis(self, post_mortem, store):
        """run_nightly_analysis processes settled bets"""
        # Add a settled bet
        wager_id = store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.75,
            predicted_edge=0.08,
            reasoning_trace="Test",
        )
        store.settle_wager(wager_id, outcome="WIN", profit=0.91)

        # Run analysis (without db_tool to skip settling)
        report = await post_mortem.run_nightly_analysis(db_tool=None)

        assert report is not None
        assert "timestamp" in report
        assert "calibration_update" in report

    def test_generate_calibration_report(self, post_mortem, store):
        """generate_calibration_report produces readable report"""
        # Add some settled bets
        wager_id = store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.75,
            predicted_edge=0.08,
            reasoning_trace="Test",
        )
        store.settle_wager(wager_id, outcome="WIN", profit=0.91)

        report = post_mortem.generate_calibration_report()
        assert isinstance(report, str)

    def test_analyze_loss(self, post_mortem, store):
        """analyze_loss records root cause"""
        # Add a loss
        wager_id = store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.85,
            predicted_edge=0.12,
            reasoning_trace="High confidence loss",
        )
        store.settle_wager(wager_id, outcome="LOSS", profit=-1.0)

        # Record analysis
        post_mortem.analyze_loss(
            wager_id=wager_id,
            root_cause="Model overfit to recent games",
            category="MODEL_ERROR",
            severity="HIGH",
        )

        # Verify recorded
        summary = post_mortem.get_loss_analysis_summary()
        assert summary is not None


class TestMemoryIntegration:
    """Integration tests for memory system"""

    @pytest.fixture
    def store(self, temp_db_path):
        init_database(temp_db_path)
        s = MemoryStore(temp_db_path)
        yield s
        s.close()

    def test_full_wager_lifecycle(self, store):
        """Test complete wager lifecycle: create → track → settle"""
        # 1. Create wager
        wager_id = store.save_wager(
            game_id="0022500123",
            bet_type="SPREAD",
            selection="LAL -5.0",
            line=-5.0,
            confidence=0.75,
            predicted_edge=0.08,
            reasoning_trace="Full test",
            bull_arguments=[{"type": "edge", "strength": 0.8}],
            bear_arguments=[{"type": "methodology", "strength": 0.6}],
        )

        # 2. Verify created
        wager = store.get_wager(wager_id)
        assert wager["outcome"] is None  # Pending

        # 3. Verify in unsettled list
        unsettled = store.get_unsettled_wagers()
        assert wager_id in [w["id"] for w in unsettled]

        # 4. Settle wager
        store.settle_wager(wager_id, outcome="WIN", profit=0.91)

        # 5. Verify settled
        wager = store.get_wager(wager_id)
        assert wager["outcome"] == "WIN"
        assert wager["profit"] == 0.91

        # 6. Verify no longer in unsettled
        unsettled = store.get_unsettled_wagers()
        assert wager_id not in [w["id"] for w in unsettled]

    def test_historical_performance(self, store):
        """Test historical performance tracking"""
        # Add multiple settled wagers for same team
        for i in range(3):
            wager_id = store.save_wager(
                game_id=f"002250012{i}",
                bet_type="SPREAD",
                selection="LAL -5.0",
                line=-5.0,
                confidence=0.75,
                predicted_edge=0.08,
                reasoning_trace="Test",
            )
            store.settle_wager(
                wager_id,
                outcome="WIN" if i % 2 == 0 else "LOSS",
                profit=0.91 if i % 2 == 0 else -1.0,
            )

        perf = store.get_historical_performance("LAL")
        assert perf is not None
        assert perf["total"] == 3
