# CLAUDE.md - NBA Expert Bettor Agent

## Project Overview

**Name**: NBA Expert Bettor Agent (System 2 Architecture)
**Type**: Autonomous Multi-Agent System with Deep Reasoning
**Status**: Phase 1 - Foundation

### Vision

An intelligent "Council of Experts" agent that synthesizes NBA data through adversarial debate, mathematical verification, and persistent memory to provide calibrated betting recommendations.

### Architecture: Council of Experts

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPERVISOR (Router)                              │
│  Analyzes intent → Routes to specialists → Manages state graph           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  DATA SCOUT  │  │    QUANT     │  │  NARRATIVE   │                   │
│  │              │  │   ANALYST    │  │  RESEARCHER  │                   │
│  │ • NBA API    │  │              │  │              │                   │
│  │ • Odds API   │  │ • Python     │  │ • Web Search │                   │
│  │ • DB Queries │  │   Sandbox    │  │ • Sentiment  │                   │
│  │ • Error      │  │ • Edge Calc  │  │ • Injury     │                   │
│  │   Recovery   │  │ • Backtest   │  │   Reports    │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
│         │                 │                 │                            │
│         └────────────┬────┴────────────────┘                            │
│                      ▼                                                   │
│              ┌──────────────┐                                            │
│              │ DEBATE ROOM  │                                            │
│              │              │                                            │
│              │ BULL ⚔️ BEAR │                                            │
│              │  (Pro)  (Con)│                                            │
│              └──────┬───────┘                                            │
│                     ▼                                                    │
│              ┌──────────────┐      ┌──────────────┐                     │
│              │    JUDGE     │◄────►│   MEMORY     │                     │
│              │              │      │   (SQLite)   │                     │
│              │ • Synthesis  │      │              │                     │
│              │ • Calibrate  │      │ • Episodic   │                     │
│              │ • Output     │      │ • Learning   │                     │
│              └──────────────┘      └──────────────┘                     │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  REFLEXION LOOP: If confidence < 0.8 AND critique_count < 3             │
│                  → Loop back to DATA SCOUT with specific queries         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Core Design Principles

1. **System 2 Thinking**: Deliberate, slow reasoning with iteration over fast intuition
2. **Code as Reason**: All math executed in Python sandbox, never linguistic
3. **Adversarial Verification**: Bull/Bear debate before any recommendation
4. **Memory-Driven Learning**: Track outcomes, learn from mistakes
5. **Graceful Degradation**: Always output something, even with partial data

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Orchestration** | LangGraph | Cyclic state graphs with conditional routing |
| **Language** | Python 3.11+ | Type-safe with Pydantic models |
| **Package Manager** | uv | Fast, modern Python environment |
| **Tooling Protocol** | MCP (Model Context Protocol) | Standardized tool integration |
| **Memory** | SQLite (via MCP) | Episodic memory for bets/outcomes |
| **Reasoning** | Sequential Thinking MCP | Structured multi-step planning |
| **Data Source** | nba_api + PostgreSQL | Stats from NBA.com + local DB |
| **Search** | Brave Search MCP | Real-time news/injuries |

---

## Design Patterns

### 1. Check-Reflect-Apply Loop

Every node MUST implement this pattern:

```python
async def node_execute(state: AgentState) -> AgentState:
    # CHECK: Validate inputs exist and are fresh
    if not state.get('game_data'):
        return state.with_error("Missing game data")

    # REFLECT: Assess if we have enough information
    missing = identify_missing_info(state)
    if missing and state['critique_count'] < 3:
        return state.request_more_info(missing)

    # APPLY: Execute core logic
    result = await execute_analysis(state)
    return state.with_result(result)
```

### 2. Pydantic Structured Outputs

ALL data structures use Pydantic for validation:

```python
from pydantic import BaseModel, Field
from typing import Literal

class BetRecommendation(BaseModel):
    action: Literal["BET", "NO_BET", "WAIT"]
    selection: str
    line: float
    confidence: float = Field(ge=0.0, le=1.0)
    edge: float = Field(description="Code-verified edge percentage")
    key_factors: list[str]
    risk_factors: list[str]
    reasoning_trace: str
```

### 3. Error Recovery Protocol

```python
class DataScout:
    async def fetch_with_fallback(self, query: str) -> DataResult:
        sources = [
            self.nba_api,        # Primary
            self.local_db,       # Secondary (PostgreSQL)
            self.cached_data,    # Tertiary (stale but available)
        ]
        for source in sources:
            try:
                data = await source.fetch(query)
                return DataResult(data=data, source=source.name, quality="FRESH")
            except Exception as e:
                continue

        # All sources failed - return with warning
        return DataResult(data=None, source="NONE", quality="UNAVAILABLE")
```

### 4. Confidence Calibration

Confidence is calculated via ensemble voting, NOT linguistic estimation:

```python
async def calculate_calibrated_confidence(state: AgentState, n_samples: int = 5) -> float:
    results = await asyncio.gather(*[
        run_analysis_chain(state) for _ in range(n_samples)
    ])

    recommendations = [r.recommendation for r in results]
    majority_vote = Counter(recommendations).most_common(1)[0]
    agreement_rate = majority_vote[1] / n_samples

    # Conservative discount
    return agreement_rate * 0.9
```

---

## Command Reference

### Development

```bash
# Setup environment (first time)
cd betting-agent
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"

# Run the agent (interactive)
python -m src.main analyze "Lakers vs Heat"

# Run with specific depth
python -m src.main analyze "Lakers vs Heat" --depth deep

# Run tests
pytest tests/ -v

# Type checking
mypy src/
```

### Database Operations

```bash
# Initialize memory database
python -m src.memory.init_db

# Run nightly post-mortem
python -m src.memory.post_mortem

# Check calibration metrics
python -m src.memory.calibration_report
```

### MCP Server Management

```bash
# Check installed MCP servers
claude mcp list

# Add required servers (if missing)
claude mcp add sequential-thinking
claude mcp add sqlite --db-path ./data/agent_memory.db
claude mcp add brave-search
```

---

## State Schema

```python
from typing import TypedDict, Literal
from pydantic import BaseModel

class AgentState(TypedDict):
    # Core identifiers
    game_id: str
    query: str

    # Data collection
    game_data: dict | None
    odds_data: dict | None
    news_data: list[dict]

    # Analysis artifacts
    hypotheses: list[dict]
    quant_result: dict | None
    debate_transcript: str

    # Control flow
    confidence: float
    missing_info: list[str]
    critique_count: int
    current_node: str

    # Output
    recommendation: BetRecommendation | None
    errors: list[str]
```

---

## Integration Points

### PostgreSQL (Existing Database)

The agent connects to the existing `nba_stats` database:

```python
# Connection via existing frontend/.env.local
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "nba_stats",
    "user": "chapirou"
}
```

Key tables:
- `games` - Schedule and scores (filter by `season`)
- `player_game_stats` - Box scores
- `betting_odds` - Historical odds
- `team_standings` - Current standings

### Frontend API

Expose agent via HTTP for frontend consumption:

```
POST /api/betting/agent/analyze
{
    "query": "Should I bet Lakers -5?",
    "depth": "standard"  // quick | standard | deep
}
```

---

## File Structure

```
betting-agent/
├── CLAUDE.md              # This file (source of truth)
├── ROADMAP.md             # Implementation phases
├── pyproject.toml         # uv/pip configuration
├── src/
│   ├── __init__.py
│   ├── main.py            # Entry point
│   ├── agents/            # Individual node implementations
│   │   ├── __init__.py
│   │   ├── supervisor.py
│   │   ├── data_scout.py
│   │   ├── quant_analyst.py
│   │   ├── narrative.py
│   │   ├── debate_room.py
│   │   └── judge.py
│   ├── graph/             # LangGraph workflow definitions
│   │   ├── __init__.py
│   │   ├── state.py       # AgentState definition
│   │   ├── workflow.py    # Main graph construction
│   │   └── edges.py       # Conditional routing logic
│   ├── tools/             # MCP clients and direct API tools
│   │   ├── __init__.py
│   │   ├── nba_api_tool.py
│   │   ├── odds_api_tool.py
│   │   ├── db_tool.py
│   │   └── python_sandbox.py
│   ├── memory/            # Persistence layer
│   │   ├── __init__.py
│   │   ├── schema.sql
│   │   ├── init_db.py
│   │   ├── store.py
│   │   └── post_mortem.py
│   └── models/            # Pydantic schemas
│       ├── __init__.py
│       ├── state.py
│       ├── recommendations.py
│       └── data.py
├── tests/
│   ├── __init__.py
│   ├── test_agents/
│   ├── test_graph/
│   ├── test_tools/
│   └── fixtures/
├── data/
│   └── agent_memory.db    # SQLite episodic memory
└── scripts/
    └── setup_mcp.sh       # MCP server installation
```

---

## Critical Rules

### DO

- Use Pydantic for ALL data structures
- Execute ALL math in Python sandbox
- Log every decision with reasoning trace
- Check `critique_count` before looping
- Filter queries by current season
- Use decimal odds (not American)

### DO NOT

- Trust LLM-generated numbers without code verification
- Loop infinitely (max 3 critique cycles)
- Output confidence > 90% (always discount)
- Recommend bets without checking memory for similar losses
- Skip error recovery fallbacks

---

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://chapirou@localhost:5432/nba_stats
ANTHROPIC_API_KEY=sk-ant-...

# Optional
BRAVE_API_KEY=...           # For news search
ODDS_API_KEY=...            # For live odds (if using external)
LOG_LEVEL=INFO              # DEBUG | INFO | WARNING | ERROR
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2025-11-25 | Initial architecture design |
