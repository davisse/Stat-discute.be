# NBA Expert Bettor Agent - Implementation Plan

**Status**: Phase 6 - COMPLETE ✅ (Narrative Intelligence)
**Created**: 2025-11-25
**Updated**: 2025-11-25
**Architecture**: System 2 - Council of Experts

---

## Architecture Evolution

### Original Plan (v1) → System 2 Architecture (v2)

| Aspect | v1 (Original) | v2 (System 2) |
|--------|---------------|---------------|
| **Architecture** | Linear API routes | LangGraph cyclic state machine |
| **Reasoning** | Sequential prompt | Adversarial debate (Bull/Bear) |
| **Math** | LLM linguistic | Python sandbox execution |
| **Memory** | Stateless | SQLite episodic memory |
| **Confidence** | LLM-generated % | Ensemble voting calibration |
| **Error Handling** | None specified | Fallback chains + graceful degradation |
| **Learning** | None | Post-mortem feedback loop |

---

## Current Implementation Status

### Phase 1 Complete ✅

```
betting-agent/
├── CLAUDE.md              ✅ Created - Source of truth
├── ROADMAP.md             ✅ Created - 5-phase plan
├── pyproject.toml         ✅ Created - Dependencies installed
├── .venv/                 ✅ Created - Python 3.14 environment
├── src/
│   ├── main.py            ✅ Created - Entry point
│   ├── agents/
│   │   ├── supervisor.py  ✅ IMPLEMENTED - Query parsing & routing
│   │   ├── data_scout.py  ✅ IMPLEMENTED - DB queries with error recovery
│   │   ├── quant_analyst.py ✅ IMPLEMENTED - Edge calculation, Kelly, Four Factors
│   │   ├── narrative.py   ✅ Placeholder (Phase 4)
│   │   ├── debate_room.py ✅ IMPLEMENTED - Bull/Bear adversarial debate
│   │   └── judge.py       ✅ IMPLEMENTED - Debate-weighted synthesis
│   ├── graph/
│   │   ├── workflow.py    ✅ LangGraph workflow with all nodes
│   │   ├── edges.py       ✅ Routing logic (reflexion disabled for Phase 1)
│   │   └── state.py       ✅ AgentState TypedDict
│   ├── memory/
│   │   └── schema.sql     ✅ Full schema
│   ├── models/
│   │   ├── state.py       ✅ Pydantic models
│   │   ├── recommendations.py ✅ Output schemas
│   │   └── data.py        ✅ Data models
│   └── tools/
│       └── db_tool.py     ✅ IMPLEMENTED - PostgreSQL async queries
├── tests/
│   └── test_e2e.py        ✅ End-to-end tests passing
├── data/
│   └── agent_memory.db    ✅ SQLite initialized
└── scripts/
    └── setup_mcp.sh       ✅ MCP setup script
```

### E2E Test Results (2025-11-25)

| Test | Query | Result |
|------|-------|--------|
| 1 | "Lakers vs Celtics" | ✅ FRESH data, both teams found |
| 2 | "Should I bet Celtics -5?" | ✅ Single team + spread line parsed |
| 3 | "Warriors" | ✅ Team stats + upcoming games shown |
| 4 | "Gotham Knights" | ✅ Graceful degradation (NO_BET) |

---

## Council of Experts Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPERVISOR (Router)                              │
│  Analyzes intent → Routes to specialists → Manages state graph           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  DATA SCOUT  │  │    QUANT     │  │  NARRATIVE   │                   │
│  │   ✅ DONE    │  │   ✅ DONE    │  │  RESEARCHER  │                   │
│  │ • NBA API    │  │ • Edge Calc  │  │              │                   │
│  │ • Odds API   │  │ • Kelly %    │  │ • Web Search │                   │
│  │ • DB Queries │  │ • Cover Prob │  │ • Sentiment  │                   │
│  │ • Error      │  │ • 4 Factors  │  │ • Injury     │                   │
│  │   Recovery   │  │ • Impl.Prob  │  │   Reports    │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
│         │                 │                 │                            │
│         └────────────┬────┴────────────────┘                            │
│                      ▼                                                   │
│              ┌──────────────┐                                            │
│              │ DEBATE ROOM  │                                            │
│              │   ✅ DONE    │                                            │
│              │ BULL ⚔️ BEAR │                                            │
│              └──────┬───────┘                                            │
│                     ▼                                                    │
│              ┌──────────────┐      ┌──────────────┐                     │
│              │    JUDGE     │◄────►│   MEMORY     │                     │
│              │   ✅ DONE    │      │   ✅ DONE    │                     │
│              │ • Synthesis  │      │ • Episodic   │                     │
│              │ • Calibrate  │      │ • Learning   │                     │
│              └──────────────┘      └──────────────┘                     │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  REFLEXION LOOP: If confidence < 0.8 AND critique_count < 3             │
│                  → Loop back to DATA SCOUT with specific queries         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Skeleton & Tools ✅ COMPLETE
- [x] Create CLAUDE.md with architecture
- [x] Create ROADMAP.md with phases
- [x] Scaffold directory structure
- [x] Create Pydantic models
- [x] Create LangGraph workflow skeleton
- [x] Create SQLite schema
- [x] Initialize uv environment
- [x] Install dependencies (56 packages)
- [x] Implement Supervisor with query parsing
- [x] Implement DataScout with error recovery
- [x] Implement DatabaseTool for PostgreSQL
- [x] End-to-end tests passing

### Phase 2: The Quant Engine ✅ COMPLETE
- [x] Edge calculation with margin projection and home court adjustment
- [x] Cover probability via logistic function: `P = 1 / (1 + e^(-margin/10))`
- [x] Kelly Criterion for bet sizing (quarter Kelly, capped at 5%)
- [x] Four Factors analysis (basic version using L10 stats)
- [x] Implied probability from decimal odds
- [x] Judge node integration with quant results
- [x] Fixed query parsing regex for spread lines ("Lakers -5 vs Celtics")

### Phase 2 Test Results (2025-11-25)

| Query | Action | Edge | Cover Prob | Kelly | Notes |
|-------|--------|------|------------|-------|-------|
| Lakers -5 vs Celtics | BET | 7.74% | 65.1% | 2.4% | Strong positive edge |
| Celtics +5 vs Lakers | FADE | -22.54% | 30.0% | 0% | Negative edge detected |

### Phase 3: Debate & Judge ✅ COMPLETE
- [x] BullAgent: Generates pro-bet arguments (edge, probability, home court, form, Kelly)
- [x] BearAgent: Generates counter-arguments (sample size, regression, market efficiency)
- [x] Adversarial debate flow with strength scoring
- [x] Judge synthesis with debate weighting (+5% confidence for Bull win, -10% for Bear win)
- [x] Debate affects final action: Bull win → full BET, Bear win + marginal edge → NO_BET

### Phase 3 Test Results (2025-11-25)

| Query | Edge | Debate Winner | Action | Reasoning |
|-------|------|---------------|--------|-----------|
| Lakers -5 vs Celtics | 7.7% | NEUTRAL (0.60 vs 0.68) | LEAN_BET | Edge positive but debate neutral |
| Celtics +5 vs Lakers | -22.5% | BEAR (0.53 vs 0.77) | NO_BET | Bear prevailed, edge insufficient |
| Warriors -3 vs Suns | -23.1% | BEAR (0.00 vs 0.78) | NO_BET | Bear prevailed, edge insufficient |

### Phase 4: Memory Integration ✅ COMPLETE
- [x] SQLite database initialized (7 tables, 8 indexes)
- [x] MemoryStore with wager save/retrieve/settle operations
- [x] Full reasoning trace storage (debate transcript, quant result, bull/bear args)
- [x] Post-mortem analysis system for outcome tracking
- [x] Learning rules engine with default rules loaded
- [x] Calibration tracking by confidence bucket
- [x] Reflexion loop enabled with critique_count tracking
- [x] Similar bet retrieval (pattern matching)

### Phase 4 Implementation Details (2025-11-25)

**Memory Schema**:
- `wagers` - Full recommendation storage with reasoning traces
- `calibration_log` - Track accuracy by confidence bucket
- `learning_rules` - Adjustments based on loss patterns
- `loss_analysis` - Root cause tracking for high-confidence losses
- `daily_summary` - Aggregate performance metrics

**Reflexion Loop**:
- Triggers when: actionable recommendation + missing_info + confidence < 0.7
- Max retries: 3 (then graceful degradation)
- critique_count incremented on each retry cycle

### Phase 5: Validation & Polish ✅ COMPLETE
- [x] End-to-end tests with pytest (test_quant_analyst.py, test_debate_room.py, test_memory.py)
- [x] Calibration dashboard (ASCII terminal dashboard with sections: calibration, performance, recent, rules)
- [x] Frontend API route integration (4 routes: /agent/analyze, /agent/history, /agent/calibration, /agent/settle)
- [x] `/bet` slash command for CLI (alias for analyze + dashboard, calibration, history, settle commands)
- [x] Documentation and usage examples (CLAUDE.md + main.py --help)

### Phase 5 Implementation Details (2025-11-25)

**Test Suite**:
- `tests/conftest.py` - Pytest fixtures (sample_game_data, sample_quant_result, state fixtures)
- `tests/test_quant_analyst.py` - Edge calculation, Kelly, cover probability tests
- `tests/test_debate_room.py` - Bull/Bear argument generation, debate scoring
- `tests/test_memory.py` - MemoryStore CRUD, calibration, learning rules, PostMortem

**CLI Commands**:
```bash
python -m src.main analyze "Lakers vs Celtics"     # Run analysis
python -m src.main bet "Lakers -5" --depth deep    # Alias for analyze
python -m src.main dashboard --refresh 30          # Live calibration dashboard
python -m src.main calibration                     # Calibration report
python -m src.main history --limit 20              # Recent wagers
python -m src.main settle 123 --outcome WIN        # Manually settle wager
python -m src.main post-mortem                     # Run nightly analysis
```

**Frontend API Routes**:
- `POST /api/betting/agent/analyze` - Run betting analysis (query, depth)
- `GET  /api/betting/agent/history` - Get wager history (limit, unsettled)
- `GET  /api/betting/agent/calibration` - Get calibration metrics
- `POST /api/betting/agent/settle` - Settle a wager (wager_id, outcome, profit)

---

## Key Design Decisions

### 1. Code as Reason
ALL math executed in Python sandbox, never linguistic:
```python
result = calculate_edge(line=-5.5, projected_margin=-8.0)
# Returns: {"edge": 0.042, "recommendation": "BET"}
```

### 2. Reflexion Loop
If confidence < 80% AND retries < 3 → loop back with specific queries:
```python
def should_continue(state):
    if state['confidence'] >= 0.8: return "publish"
    if state['critique_count'] >= 3: return "publish_with_warning"
    return "retry"  # Disabled in Phase 1 to avoid infinite loops
```

### 3. Calibrated Confidence
Never trust LLM-generated percentages. Use ensemble voting:
```python
# Run 5 chains, count agreement
results = [run_chain() for _ in range(5)]
confidence = sum(r == majority for r in results) / 5
```

### 4. Memory-Driven Learning
Track outcomes → Analyze losses → Create rules → Apply adjustments:
```sql
INSERT INTO learning_rules (condition, adjustment, evidence)
VALUES ('team_on_b2b', -0.05, 'Lost 8 of last 10 B2B bets');
```

---

## MCP Server Requirements

| Server | Status | Purpose |
|--------|--------|---------|
| `sequential-thinking` | ✅ Configured | Deep reasoning |
| `agent-memory` (SQLite) | ✅ Configured | Episodic memory |
| `brave-search` | ⏳ Optional | News research |

Setup: `./betting-agent/scripts/setup_mcp.sh`

---

## Quick Start Commands

```bash
# Activate environment
source betting-agent/.venv/bin/activate

# Run analysis
PYTHONPATH=betting-agent python -m src.main analyze "Lakers vs Celtics"

# Run tests
PYTHONPATH=betting-agent python -m tests.test_e2e
```

---

## MVP Complete - Future Enhancements

### Phase 6: Narrative Intelligence ✅ COMPLETE
- [x] Web search integration for news/injuries (DuckDuckGo API - no key required)
- [x] NarrativeResearcher agent with sentiment analysis
- [x] Injury impact scoring model (position weights + star multiplier)
- [x] Back-to-back game detection and adjustment (-3.0 points)
- [x] Rest advantage detection (+1.0 to +3.0 points)
- [x] Narrative integration into Bull/Bear debate arguments
- [x] 30 tests for narrative functionality (all passing)

### Phase 6 Implementation Details (2025-11-26)

**NarrativeNode Features**:
- `_search_injury_news()` - DuckDuckGo instant answer API for injury reports
- `_detect_back_to_back()` - PostgreSQL query to check yesterday's games
- `_check_rest_advantage()` - Calculate days since last game for each team
- `_search_motivation_factors()` - Web search for rivalry/preview news
- `_analyze_sentiment()` - Rule-based sentiment (POSITIVE/NEGATIVE/NEUTRAL)
- `_calculate_narrative_adjustment()` - Point adjustments per team

**Debate Integration**:
- BullAgent: +3 new arguments (narrative factors, rest advantage, opponent fatigue)
- BearAgent: +4 new arguments (selection B2B, opponent rest, negative narrative, injuries)

**Impact Values**:
- Back-to-back: -3.0 points (B2B teams cover ~45% historically)
- Rest advantage: +1.0 to +3.0 points (capped)
- Injury (negative sentiment): -2.0 points
- Injury (positive sentiment): +1.0 points

### Phase 7 (Optional - Production Hardening)
- [ ] Rate limiting and caching for API routes
- [ ] Authentication for API endpoints
- [ ] Database connection pooling optimization
- [ ] Kubernetes deployment configuration
- [ ] Prometheus metrics export

### Phase 8 (Optional - Advanced Learning)
- [ ] Brier score calibration tracking
- [ ] Automated rule creation from loss patterns
- [ ] A/B testing for model variations
- [ ] Historical backtesting pipeline

---

## References

### Core Agent
- **CLAUDE.md**: `betting-agent/CLAUDE.md`
- **ROADMAP.md**: `betting-agent/ROADMAP.md`
- **Schema**: `betting-agent/src/memory/schema.sql`
- **Workflow**: `betting-agent/src/graph/workflow.py`
- **Database Tool**: `betting-agent/src/tools/db_tool.py`
- **Data Scout**: `betting-agent/src/agents/data_scout.py`
- **Quant Analyst**: `betting-agent/src/agents/quant_analyst.py` (Phase 2)
- **Debate Room**: `betting-agent/src/agents/debate_room.py` (Phase 3)
- **Memory Store**: `betting-agent/src/memory/store.py` (Phase 4)
- **Post-Mortem**: `betting-agent/src/memory/post_mortem.py` (Phase 4)
- **Supervisor**: `betting-agent/src/agents/supervisor.py`

### Phase 5 (CLI & API)
- **CLI Main**: `betting-agent/src/main.py`
- **ASCII Dashboard**: `betting-agent/src/cli/dashboard.py`
- **API - Analyze**: `frontend/src/app/api/betting/agent/analyze/route.ts`
- **API - History**: `frontend/src/app/api/betting/agent/history/route.ts`
- **API - Calibration**: `frontend/src/app/api/betting/agent/calibration/route.ts`
- **API - Settle**: `frontend/src/app/api/betting/agent/settle/route.ts`

### Tests (Phase 5)
- **Fixtures**: `betting-agent/tests/conftest.py`
- **Quant Tests**: `betting-agent/tests/test_quant_analyst.py`
- **Debate Tests**: `betting-agent/tests/test_debate_room.py`
- **Memory Tests**: `betting-agent/tests/test_memory.py`
