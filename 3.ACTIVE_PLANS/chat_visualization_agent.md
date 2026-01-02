# Chat Visualization Agent - Revised Implementation Plan

**Status**: IMPLEMENTED
**Date**: 2025-12-07
**Completed**: 2025-12-07
**Revised**: After deep analysis of data landscape

---

## Key Insight: Hybrid Architecture

**Original approach**: LLM generates raw SQL → risky with smaller models
**Revised approach**: LLM extracts intent → Backend uses templates → LLM summarizes

This ensures reliable queries while leveraging LLM for understanding and communication.

---

## Architecture

```
User: "Show me LeBron's scoring last 10 games"
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: INTENT EXTRACTION (Ollama)                         │
│  Input: User message                                        │
│  Output: {                                                  │
│    entity_type: "player",                                   │
│    entity_name: "LeBron James",                             │
│    stat_name: "points",                                     │
│    timeframe: "last_n",                                     │
│    n_games: 10,                                             │
│    chart_type: "bar"                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: QUERY BUILDER (Deterministic)                      │
│  - Match intent to template: player_game_log               │
│  - Resolve aliases: "LeBron" → player_id: 2544             │
│  - Build parameterized SQL                                  │
│  - Execute safely against PostgreSQL                        │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: RESPONSE GENERATION (Ollama)                       │
│  Input: Query results + original question                   │
│  Output: Natural language summary + insights                │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
Frontend: Render message + DynamicChart component
```

---

## Intent Schema

```typescript
interface QueryIntent {
  // What entity?
  entity_type: 'player' | 'team' | 'game' | 'league' | 'prop';
  entity_name?: string;

  // What stat?
  stat_category: 'scoring' | 'rebounds' | 'assists' | 'shooting' |
                 'advanced' | 'standings' | 'betting' | 'props';
  stat_name?: string;

  // Time scope
  timeframe: 'last_n' | 'season' | 'today' | 'date_range';
  n_games?: number;

  // Comparison?
  comparison?: {
    type: 'vs_player' | 'vs_team' | 'home_away' | 'vs_line';
    compare_to?: string;
  };

  // Visualization
  chart_type: 'bar' | 'horizontal_bar' | 'line' | 'grouped_bar' |
              'pie' | 'table' | 'line_threshold';

  // Modifiers
  sort_by?: 'asc' | 'desc';
  limit?: number;
  filter?: string;
}
```

---

## User Interaction Scenarios

### Category 1: Player Performance

| User Says | Chart Type | Template |
|-----------|------------|----------|
| "Show me LeBron's scoring last 10 games" | Bar | player_game_log |
| "Compare Tatum vs Brown PPG" | Grouped Bar | player_vs_player |
| "Top 10 scorers in the league" | Horizontal Bar | league_leaders |
| "Jokic's rebounds trend this season" | Line | player_season_trend |
| "Show Curry's shooting splits" | Grouped Bar | shooting_splits |

**Example Output - LeBron Scoring:**
```
┌────────────────────────────────────────────────┐
│  LeBron James - Last 10 Games                  │
│  ████████████████████████ 32 vs WAS            │
│  ██████████████████████ 28 vs LAL              │
│  █████████████████████████ 35 vs CHI           │
│  ...                                           │
│  Average: 27.4 PPG                             │
└────────────────────────────────────────────────┘
```

### Category 2: Team Analysis

| User Says | Chart Type | Template |
|-----------|------------|----------|
| "Boston's scoring trend this season" | Line | team_season_trend |
| "Lakers home vs away record" | Pie | team_home_away |
| "Teams with best defense" | Horizontal Bar | league_team_rankings |
| "Western Conference standings" | Table | team_standings |
| "How do the Celtics play on back-to-backs?" | Grouped Bar | back_to_back_performance |

### Category 3: Betting Intelligence

| User Says | Chart Type | Template |
|-----------|------------|----------|
| "What are tonight's betting lines?" | Table | game_lines_today |
| "Show Lakers spread results last 20 games" | Bar (W/L colored) | spread_results |
| "Over/under trends for high-scoring teams" | Grouped Bar | ou_results_by_team |
| "LeBron points prop vs actual last 15" | Line + Threshold | player_prop_vs_actual |
| "Which teams cover the spread most?" | Horizontal Bar | ats_leaders |

**Example Output - Prop vs Actual:**
```
┌────────────────────────────────────────────────┐
│  LeBron James - Points vs Prop Line (25.5)     │
│                                                │
│  35 ─ ●                                        │
│  30 ─     ●       ●   ●                        │
│  25 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ PROP LINE ─ ─ ─ ─  │
│  20 ─         ●               ●                │
│  15 ─             ●                            │
│      ─────────────────────────────────────     │
│      Game 1  2  3  4  5  6  7  8  9  10        │
│                                                │
│  Hit Rate: 7/10 (70%) - LEAN OVER              │
└────────────────────────────────────────────────┘
```

### Category 4: Advanced Analytics

| User Says | Chart Type | Template |
|-----------|------------|----------|
| "Top 10 true shooting percentage" | Horizontal Bar | advanced_leaders |
| "Compare team pace league-wide" | Bar | league_pace_comparison |
| "Players with best assist-to-turnover" | Horizontal Bar | advanced_leaders |
| "Show usage rate vs efficiency" | Scatter | usage_vs_efficiency |

### Category 5: Props & Today's Games

| User Says | Chart Type | Template |
|-----------|------------|----------|
| "What props are available tonight?" | Table | props_today |
| "Show all LeBron props for tonight" | Table | player_props_today |
| "Who's playing tonight?" | Table | games_today |
| "Tonight's totals with team averages" | Table | totals_analysis |

---

## Query Templates (20 Core)

```typescript
const QUERY_TEMPLATES = {
  // Player queries
  player_game_log: (playerId, stat, nGames) => `...`,
  player_season_avg: (playerId, stats) => `...`,
  player_vs_player: (p1Id, p2Id, stat) => `...`,
  player_prop_vs_actual: (playerId, propType, nGames) => `...`,
  player_season_trend: (playerId, stat) => `...`,

  // Team queries
  team_game_log: (teamId, stat, nGames) => `...`,
  team_season_stats: (teamId) => `...`,
  team_home_away: (teamId) => `...`,
  team_standings: (conference) => `...`,
  back_to_back_performance: (teamId) => `...`,

  // League queries
  league_leaders: (stat, limit) => `...`,
  league_team_rankings: (stat, order) => `...`,
  league_pace_comparison: () => `...`,

  // Betting queries
  game_lines_today: () => `...`,
  spread_results: (teamId, nGames) => `...`,
  ou_results: (teamId, nGames) => `...`,
  ats_leaders: (limit) => `...`,

  // Props queries
  props_today: (teamOrPlayer) => `...`,
  player_props_today: (playerId) => `...`,

  // Advanced queries
  advanced_leaders: (stat, limit) => `...`,
  shooting_splits: (entityId, entityType) => `...`,
};
```

---

## File Structure

```
frontend/src/
├── app/
│   ├── chat/
│   │   └── page.tsx                    # Chat page UI
│   └── api/
│       └── chat/
│           └── route.ts                # Main API endpoint
├── components/
│   └── chat/
│       ├── ChatInterface.tsx           # Chat container
│       ├── ChatMessage.tsx             # Message bubbles
│       ├── DynamicChart.tsx            # Chart renderer
│       └── ChartTable.tsx              # Table renderer
└── lib/
    ├── ollama.ts                       # Ollama API wrapper
    └── chat/
        ├── intent-parser.ts            # Parse intent from LLM
        ├── query-templates.ts          # SQL templates
        ├── query-builder.ts            # Build SQL from intent
        ├── entity-resolver.ts          # Resolve names to IDs
        └── chart-config.ts             # Chart type configs
```

---

## System Prompts

### Intent Extraction Prompt

```
You are an NBA data analyst assistant. Parse user questions into structured intents.

ENTITY ALIASES:
- Teams: BOS/Boston/Celtics, LAL/Lakers/Los Angeles Lakers, etc.
- Players: LeBron/LeBron James/James, Curry/Steph/Stephen Curry, etc.

STAT MAPPINGS:
- scoring/points/PPG → points
- boards/rebounds/RPG → rebounds
- dimes/assists/APG → assists
- 3s/threes/3-pointers → fg3_made
- TS%/true shooting → true_shooting_pct

OUTPUT FORMAT (JSON only):
{
  "entity_type": "player|team|game|league|prop",
  "entity_name": "resolved name",
  "stat_category": "scoring|rebounds|...",
  "stat_name": "specific stat column",
  "timeframe": "last_n|season|today",
  "n_games": number or null,
  "comparison": { "type": "...", "compare_to": "..." } or null,
  "chart_type": "bar|line|table|...",
  "limit": number or null
}
```

### Response Generation Prompt

```
You are an NBA analyst summarizing data for a user.

Given:
- Original question: {question}
- Data results: {data}
- Chart type: {chartType}

Write a brief 1-2 sentence summary highlighting:
1. Key finding or trend
2. Notable outliers or insights
3. Relevant context (if betting-related, mention edge)

Keep it conversational but insightful. Don't repeat the data.
```

---

## Implementation Phases

### Phase 1: Core Foundation (2 hours) - COMPLETE
- [x] Create `/app/chat/page.tsx` with basic chat UI
- [x] Create `/api/chat/route.ts` with Ollama integration
- [x] Create `/lib/ollama.ts` service wrapper
- [x] Implement intent extraction with 3 example prompts
- [x] Create 5 basic query templates:
  - player_game_log
  - team_game_log
  - league_leaders
  - team_standings
  - games_today

### Phase 2: Charts & Visualization (1.5 hours) - COMPLETE
- [x] Create `DynamicChart.tsx` with recharts
- [x] Support: bar, horizontal_bar, line, grouped_bar
- [x] Create `ChartTable.tsx` for tabular data (built into DynamicChart)
- [x] Style charts to match dark theme

### Phase 3: Betting & Props (1 hour) - COMPLETE
- [x] Add query templates:
  - game_lines_today
  - spread_results
  - player_prop_vs_actual
  - props_today
- [x] Add line_threshold chart type for props
- [x] Color coding for over/under results

### Phase 4: Polish & UX (1 hour) - COMPLETE
- [x] Response generation with insights
- [x] Error handling and fallbacks
- [x] Loading states and animations
- [x] Suggested follow-up questions
- [x] Add to navigation

---

## Model Recommendation

For reliable intent extraction, pull llama3.1:
```bash
ollama pull llama3.1:8b   # 4.7GB - Best for structured output
```

Fallback with existing models:
- `deepseek-r1` - Good reasoning, try first
- `gemma3:4b` - Fast but may need more examples in prompt

---

## Security

1. **Read-only**: All templates are SELECT queries only
2. **Parameterized**: All values are parameterized, no string interpolation
3. **Entity validation**: Names resolved to IDs before query building
4. **Rate limiting**: Max 10 queries per minute per session
5. **Query timeout**: 5 second max execution time

---

## Success Metrics

- Intent extraction accuracy > 90% on test scenarios
- Query execution success > 95%
- Average response time < 3 seconds
- User can ask 80% of scenarios without rephrasing

---

**Awaiting approval to begin implementation.**
