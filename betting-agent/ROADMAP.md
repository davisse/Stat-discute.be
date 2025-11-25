# ROADMAP.md - NBA Expert Bettor Agent Implementation

**Created**: 2025-11-25
**Architecture**: Council of Experts (System 2)
**Estimated Duration**: 8-10 weeks

---

## Phase Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 1: Skeleton & Tools (Week 1-2)                               │
│  ├── LangGraph StateGraph setup                                     │
│  ├── MCP server connections                                         │
│  ├── NBA API wrapper with error recovery                            │
│  └── Basic Supervisor routing                                       │
├─────────────────────────────────────────────────────────────────────┤
│  Phase 2: The Quant Engine (Week 3-4)                               │
│  ├── Python sandbox integration                                     │
│  ├── Edge calculation with code execution                           │
│  ├── Basic backtesting queries                                      │
│  └── Data Scout error recovery                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Phase 3: Debate & Judge (Week 5-6)                                 │
│  ├── Bull/Bear adversarial prompts                                  │
│  ├── Narrative Researcher (news/sentiment)                          │
│  ├── Judge synthesis node                                           │
│  └── Confidence calibration via ensemble                            │
├─────────────────────────────────────────────────────────────────────┤
│  Phase 4: Memory Integration (Week 7-8)                             │
│  ├── SQLite schema (wagers, learning_rules)                         │
│  ├── Episodic memory storage                                        │
│  ├── Nightly post-mortem routine                                    │
│  └── RAG retrieval for similar bets                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Phase 5: Validation & Polish (Week 9-10)                           │
│  ├── End-to-end testing                                             │
│  ├── Calibration dashboard                                          │
│  ├── Frontend API integration                                       │
│  └── Slash command (/bet)                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Skeleton & Tools

**Duration**: Week 1-2
**Goal**: Working LangGraph skeleton with tool connectivity

### Deliverables

#### 1.1 LangGraph State Machine

```python
# src/graph/state.py
from typing import TypedDict
from langgraph.graph import StateGraph

class AgentState(TypedDict):
    game_id: str
    query: str
    game_data: dict | None
    odds_data: dict | None
    news_data: list[dict]
    hypotheses: list[dict]
    quant_result: dict | None
    debate_transcript: str
    confidence: float
    missing_info: list[str]
    critique_count: int
    current_node: str
    recommendation: dict | None
    errors: list[str]
```

#### 1.2 Basic Graph Definition

```python
# src/graph/workflow.py
from langgraph.graph import StateGraph, END

def create_agent_graph() -> StateGraph:
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("supervisor", supervisor_node)
    graph.add_node("data_scout", data_scout_node)
    graph.add_node("quant_analyst", quant_analyst_node)
    graph.add_node("narrative", narrative_node)
    graph.add_node("debate_room", debate_room_node)
    graph.add_node("judge", judge_node)

    # Entry point
    graph.set_entry_point("supervisor")

    # Routing edges
    graph.add_conditional_edges(
        "supervisor",
        route_from_supervisor,
        {
            "fetch_data": "data_scout",
            "analyze": "quant_analyst",
            "output": "judge"
        }
    )

    # Reflexion loop
    graph.add_conditional_edges(
        "judge",
        should_continue_or_finish,
        {
            "publish": END,
            "retry": "data_scout"
        }
    )

    return graph.compile()
```

#### 1.3 MCP Server Configuration

```json
// claude_desktop_config.json additions
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "agent-memory": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-sqlite", "--db-path", "./betting-agent/data/agent_memory.db"]
    }
  }
}
```

#### 1.4 NBA API Wrapper

```python
# src/tools/nba_api_tool.py
from nba_api.stats.endpoints import leaguegamefinder, playergamelog
from pydantic import BaseModel

class NBADataTool:
    def __init__(self, db_fallback: DatabaseTool):
        self.db = db_fallback

    async def get_player_recent_stats(
        self,
        player_id: int,
        last_n_games: int = 10
    ) -> PlayerStats:
        try:
            log = playergamelog.PlayerGameLog(player_id=player_id)
            df = log.get_data_frames()[0].head(last_n_games)
            return PlayerStats.from_dataframe(df)
        except Exception:
            # Fallback to local DB
            return await self.db.get_player_stats(player_id, last_n_games)
```

### Acceptance Criteria

- [ ] `uv run python -m src.main "test"` executes without errors
- [ ] StateGraph routes from supervisor → data_scout → back to supervisor
- [ ] NBA API returns real data for a known player_id
- [ ] Error fallback to local DB works when API fails
- [ ] MCP servers respond to ping

---

## Phase 2: The Quant Engine

**Duration**: Week 3-4
**Goal**: Code-verified mathematical calculations

### Deliverables

#### 2.1 Python Sandbox

```python
# src/tools/python_sandbox.py
import subprocess
import tempfile
from pydantic import BaseModel

class SandboxResult(BaseModel):
    success: bool
    output: dict | None
    error: str | None
    execution_time: float

class PythonSandbox:
    TIMEOUT = 10  # seconds

    async def execute(self, code: str) -> SandboxResult:
        """Execute Python code in isolated subprocess"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            # Wrap code to capture structured output
            wrapped = f'''
import json
import sys

def main():
{self._indent(code)}

result = main()
print(f"__RESULT__{{json.dumps(result)}}")
'''
            f.write(wrapped)
            f.flush()

            try:
                result = subprocess.run(
                    ['python', f.name],
                    capture_output=True,
                    timeout=self.TIMEOUT,
                    text=True
                )
                return self._parse_output(result)
            except subprocess.TimeoutExpired:
                return SandboxResult(
                    success=False,
                    output=None,
                    error="Execution timeout",
                    execution_time=self.TIMEOUT
                )
```

#### 2.2 Edge Calculation Template

```python
# src/agents/quant_analyst.py
EDGE_CALCULATION_TEMPLATE = '''
def calculate_edge(line: float, projected_margin: float, vig: float = 0.05):
    """
    Calculate betting edge using Kelly-adjacent logic.

    Args:
        line: Spread line (negative = favorite)
        projected_margin: Our model's projected margin
        vig: Bookmaker's vig (default 5%)
    """
    # Convert spread to implied probability
    if line < 0:
        implied_prob = abs(line) / (abs(line) + 100)
    else:
        implied_prob = 100 / (line + 100)

    # Our probability based on projection
    cover_margin = projected_margin - line
    # Simplified: assume each point = ~3% probability swing
    our_prob = 0.5 + (cover_margin * 0.03)
    our_prob = max(0.1, min(0.9, our_prob))  # Clamp

    # Edge calculation
    edge = our_prob - implied_prob - vig

    return {
        "implied_prob": round(implied_prob, 4),
        "our_prob": round(our_prob, 4),
        "edge": round(edge, 4),
        "recommendation": "BET" if edge > 0.02 else "NO_BET"
    }

# Execute with provided values
result = calculate_edge(line={line}, projected_margin={projected_margin})
return result
'''
```

#### 2.3 Backtest Query Generator

```python
# src/agents/quant_analyst.py
class QuantAnalyst:
    async def verify_hypothesis(
        self,
        hypothesis: str,
        db: DatabaseTool
    ) -> HypothesisResult:
        """
        Generate and execute SQL to verify a betting hypothesis.

        Example hypothesis: "Lakers perform poorly on back-to-backs"
        """
        # Generate verification query
        query = await self.generate_verification_sql(hypothesis)

        # Execute against DB
        result = await db.execute(query)

        # Calculate statistical significance
        p_value = self._calculate_significance(result)

        return HypothesisResult(
            hypothesis=hypothesis,
            sample_size=result['count'],
            win_rate=result['win_rate'],
            p_value=p_value,
            significant=p_value < 0.05
        )
```

### Acceptance Criteria

- [ ] Sandbox executes Python code and returns structured JSON
- [ ] Edge calculation matches manual verification
- [ ] Sandbox times out gracefully after 10s
- [ ] Backtest queries return valid statistical results
- [ ] All math is executed in code, never linguistic

---

## Phase 3: Debate & Judge

**Duration**: Week 5-6
**Goal**: Adversarial reasoning with calibrated outputs

### Deliverables

#### 3.1 Debate Room Prompts

```python
# src/agents/debate_room.py
BULL_PROMPT = """
You are the BULL advocate. Your job is to build the STRONGEST possible case
FOR this betting opportunity.

Game: {game_summary}
Quant Analysis: {quant_result}
News Context: {news_summary}

Construct your argument using:
1. Statistical evidence supporting the bet
2. Favorable situational factors
3. Market inefficiency indicators (line movement, public %)
4. Historical patterns that support this play

Output your argument in exactly 3-5 bullet points.
Be specific with numbers. Cite sources.
"""

BEAR_PROMPT = """
You are the BEAR advocate. Your job is to build the STRONGEST possible case
AGAINST this betting opportunity.

Game: {game_summary}
Quant Analysis: {quant_result}
News Context: {news_summary}
Bull's Argument: {bull_argument}

Construct your counter-argument addressing:
1. Why the statistics might be misleading
2. Risk factors the Bull ignored
3. Why the market might be efficient here
4. Historical patterns that contradict this play

Output your argument in exactly 3-5 bullet points.
Directly challenge the Bull's strongest points.
"""
```

#### 3.2 Judge Synthesis

```python
# src/agents/judge.py
class JudgeNode:
    async def synthesize(self, state: AgentState) -> AgentState:
        """
        Synthesize debate into final recommendation.
        """
        # Check for calibration ensemble
        confidence = await self._calculate_ensemble_confidence(state)

        # Check memory for similar bets
        similar_bets = await self.memory.find_similar(
            game_context=state['game_data'],
            limit=5
        )

        # Apply learning rules
        adjustments = await self.memory.get_learning_rules(
            context=state['game_data']
        )
        for rule in adjustments:
            confidence += rule['adjustment']

        # Clamp and apply conservative discount
        confidence = max(0.4, min(0.85, confidence * 0.9))

        # Generate recommendation
        recommendation = BetRecommendation(
            action="BET" if state['quant_result']['edge'] > 0.02 else "NO_BET",
            selection=state['game_data']['selection'],
            line=state['game_data']['line'],
            confidence=confidence,
            edge=state['quant_result']['edge'],
            key_factors=self._extract_factors(state, "bull"),
            risk_factors=self._extract_factors(state, "bear"),
            reasoning_trace=state['debate_transcript']
        )

        return {**state, "recommendation": recommendation}
```

#### 3.3 Confidence Calibration

```python
# src/agents/judge.py
async def _calculate_ensemble_confidence(
    self,
    state: AgentState,
    n_samples: int = 5
) -> float:
    """
    Run multiple reasoning chains and vote on outcome.
    """
    results = await asyncio.gather(*[
        self._run_single_analysis(state)
        for _ in range(n_samples)
    ])

    recommendations = [r['action'] for r in results]
    vote_counts = Counter(recommendations)
    majority = vote_counts.most_common(1)[0]

    agreement_rate = majority[1] / n_samples
    return agreement_rate
```

### Acceptance Criteria

- [ ] Bull generates 3-5 specific pro-arguments
- [ ] Bear directly challenges Bull's points
- [ ] Judge weights both sides proportionally
- [ ] Ensemble confidence matches actual agreement rate
- [ ] Historical similar bets influence recommendation

---

## Phase 4: Memory Integration

**Duration**: Week 7-8
**Goal**: Learning from outcomes

### Deliverables

#### 4.1 SQLite Schema

```sql
-- src/memory/schema.sql

-- Core wager tracking
CREATE TABLE IF NOT EXISTS wagers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    bet_type TEXT NOT NULL,  -- 'SPREAD', 'TOTAL', 'PLAYER_PROP'
    selection TEXT NOT NULL,
    line REAL NOT NULL,
    confidence REAL NOT NULL,
    predicted_edge REAL NOT NULL,
    reasoning_trace TEXT,  -- JSON blob
    outcome TEXT,  -- 'WIN', 'LOSS', 'PUSH', NULL (pending)
    actual_margin REAL,
    profit REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP
);

-- Calibration tracking
CREATE TABLE IF NOT EXISTS calibration_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    confidence_bucket INTEGER NOT NULL,  -- 40, 50, 60, 70, 80
    total_bets INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    actual_win_rate REAL NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning rules extracted from losses
CREATE TABLE IF NOT EXISTS learning_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    condition TEXT NOT NULL,  -- SQL-like condition
    adjustment REAL NOT NULL,  -- e.g., -0.05 = reduce confidence 5%
    evidence TEXT,  -- Why this rule exists
    win_rate_before REAL,
    win_rate_after REAL,
    sample_size INTEGER,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_wagers_game ON wagers(game_id);
CREATE INDEX IF NOT EXISTS idx_wagers_outcome ON wagers(outcome);
CREATE INDEX IF NOT EXISTS idx_wagers_confidence ON wagers(confidence);
```

#### 4.2 Post-Mortem Routine

```python
# src/memory/post_mortem.py
class PostMortem:
    """Nightly routine to learn from outcomes"""

    async def run(self):
        """Execute full post-mortem analysis"""
        # 1. Fetch yesterday's results
        pending = await self.db.get_pending_wagers()

        for wager in pending:
            # 2. Get actual outcome from NBA DB
            game = await self.nba_db.get_game_result(wager['game_id'])

            # 3. Determine outcome
            outcome = self._determine_outcome(wager, game)
            profit = self._calculate_profit(wager, outcome)

            # 4. Update wager record
            await self.db.update_wager(
                wager['id'],
                outcome=outcome,
                actual_margin=game['margin'],
                profit=profit
            )

            # 5. Root cause analysis for high-confidence losses
            if outcome == 'LOSS' and wager['confidence'] > 0.7:
                await self._analyze_loss(wager, game)

        # 6. Update calibration metrics
        await self._update_calibration()

    async def _analyze_loss(self, wager: dict, game: dict):
        """Investigate why a high-confidence bet lost"""
        trace = json.loads(wager['reasoning_trace'])

        # Check for common failure patterns
        patterns = [
            self._check_injury_miss(trace, game),
            self._check_b2b_factor(trace, game),
            self._check_altitude_factor(trace, game),
            self._check_referee_factor(trace, game),
        ]

        for pattern in patterns:
            if pattern['detected']:
                await self._create_learning_rule(pattern)
```

#### 4.3 RAG for Similar Bets

```python
# src/memory/store.py
class MemoryStore:
    async def find_similar_bets(
        self,
        game_context: dict,
        limit: int = 5
    ) -> list[dict]:
        """
        Find historically similar betting situations.

        Similarity based on:
        - Same teams
        - Similar spread range (+/- 2 points)
        - Same rest situation (B2B vs rested)
        - Same home/away
        """
        query = """
        SELECT w.*, g.home_team, g.away_team
        FROM wagers w
        JOIN games g ON w.game_id = g.game_id
        WHERE (
            g.home_team = ? OR g.away_team = ?
        )
        AND ABS(w.line - ?) <= 2.0
        AND w.outcome IS NOT NULL
        ORDER BY w.created_at DESC
        LIMIT ?
        """
        return await self.db.fetch_all(
            query,
            [
                game_context['home_team'],
                game_context['away_team'],
                game_context['line'],
                limit
            ]
        )
```

### Acceptance Criteria

- [ ] Wagers stored with full reasoning trace
- [ ] Post-mortem correctly determines WIN/LOSS/PUSH
- [ ] High-confidence losses trigger root cause analysis
- [ ] Learning rules apply adjustments to future predictions
- [ ] Similar bet retrieval returns relevant historical data
- [ ] Calibration metrics track accuracy by confidence bucket

---

## Phase 5: Validation & Polish

**Duration**: Week 9-10
**Goal**: Production readiness

### Deliverables

#### 5.1 End-to-End Testing

```python
# tests/test_e2e/test_full_flow.py
@pytest.mark.asyncio
async def test_full_analysis_flow():
    """Test complete agent flow from query to recommendation"""
    agent = create_agent_graph()

    state = await agent.ainvoke({
        "query": "Should I bet Lakers -5 vs Heat?",
        "game_id": "0022400123"
    })

    assert state['recommendation'] is not None
    assert 0.4 <= state['recommendation'].confidence <= 0.85
    assert state['recommendation'].edge is not None
    assert len(state['recommendation'].key_factors) >= 2
    assert len(state['recommendation'].risk_factors) >= 1


@pytest.mark.asyncio
async def test_reflexion_loop_triggers():
    """Test that low confidence triggers retry"""
    # Mock data that should cause uncertainty
    agent = create_agent_graph()

    state = await agent.ainvoke({
        "query": "Bet on game with conflicting signals",
        "game_id": "MOCK_CONFLICTING"
    })

    # Should have looped at least once
    assert state['critique_count'] >= 1
```

#### 5.2 Calibration Dashboard

```python
# src/memory/calibration_report.py
def generate_calibration_report() -> dict:
    """Generate calibration metrics for review"""
    query = """
    SELECT
        CAST(ROUND(confidence * 10) * 10 AS INTEGER) as bucket,
        COUNT(*) as total,
        SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
        ROUND(
            SUM(CASE WHEN outcome = 'WIN' THEN 1.0 ELSE 0.0 END) / COUNT(*),
            3
        ) as actual_rate
    FROM wagers
    WHERE outcome IS NOT NULL
    GROUP BY bucket
    ORDER BY bucket
    """
    results = db.fetch_all(query)

    # Calculate calibration error
    total_error = 0
    for row in results:
        expected = row['bucket'] / 100
        actual = row['actual_rate']
        error = abs(expected - actual) * row['total']
        total_error += error

    return {
        "buckets": results,
        "calibration_error": total_error / sum(r['total'] for r in results),
        "recommendation": "RECALIBRATE" if total_error > 0.1 else "OK"
    }
```

#### 5.3 Frontend API Route

```typescript
// frontend/src/app/api/betting/agent/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'

export async function POST(request: NextRequest) {
    const { query, depth = 'standard' } = await request.json()

    return new Promise((resolve) => {
        const agent = spawn('python', [
            '-m', 'src.main',
            'analyze',
            query,
            '--depth', depth,
            '--format', 'json'
        ], {
            cwd: process.cwd() + '/../betting-agent'
        })

        let output = ''
        agent.stdout.on('data', (data) => output += data)
        agent.on('close', () => {
            resolve(NextResponse.json(JSON.parse(output)))
        })
    })
}
```

#### 5.4 Slash Command

```markdown
<!-- ~/.claude/commands/bet.md -->
Analyze the betting opportunity: $ARGUMENTS

## Agent Configuration
- Use betting-agent System 2 architecture
- Enable Sequential Thinking MCP for deep reasoning
- Check agent-memory for similar historical bets

## Process
1. Parse game/player from query
2. Invoke betting-agent via subprocess
3. Return structured recommendation

## Output Requirements
- Action: BET / NO_BET / WAIT
- Selection with line
- Confidence (calibrated, max 85%)
- Edge (code-verified)
- Key factors (3-5 bullet points)
- Risk factors (2-3 bullet points)
- Similar historical bets from memory
```

### Acceptance Criteria

- [ ] E2E tests pass with mocked data
- [ ] E2E tests pass with real NBA API
- [ ] Calibration report generates without errors
- [ ] Frontend API returns valid JSON
- [ ] `/bet` slash command invokes agent successfully
- [ ] Response time < 30s for standard depth
- [ ] Response time < 90s for deep depth

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Calibration Error** | < 10% | |actual - expected| by bucket |
| **Response Time (Standard)** | < 30s | Query to recommendation |
| **Response Time (Deep)** | < 90s | With full debate cycle |
| **Code Execution Success** | > 95% | Sandbox completions |
| **API Uptime** | > 99% | Fallback activations < 1% |
| **Reflexion Loop Rate** | 20-40% | Queries needing retry |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **NBA API rate limits** | Local DB fallback + caching |
| **Infinite loops** | `critique_count` limiter (max 3) |
| **Math hallucinations** | ALL math in Python sandbox |
| **Overconfidence** | Ensemble voting + conservative discount |
| **Stale odds** | Timestamp checks + staleness flags |
| **Cold start (no memory)** | Default rules until 100+ bets logged |

---

## Dependencies

```toml
# pyproject.toml
[project]
name = "nba-bettor-agent"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "langgraph>=0.2.0",
    "langchain-anthropic>=0.2.0",
    "pydantic>=2.0",
    "nba_api>=1.4",
    "httpx>=0.27",
    "asyncpg>=0.29",  # PostgreSQL async
    "aiosqlite>=0.20",  # SQLite async
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-asyncio>=0.23",
    "mypy>=1.8",
    "ruff>=0.4",
]
```
