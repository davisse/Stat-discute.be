# NBA Expert Bettor Agent - Implementation Plan

**Status**: Validated
**Created**: 2025-11-25
**Author**: Claude Code

---

## Vision

An intelligent agent that synthesizes all available NBA data to provide evidence-based betting analysis with confidence scoring.

---

## Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    NBA EXPERT BETTOR AGENT                      │
├─────────────────────────────────────────────────────────────────┤
│  INPUTS (Data Sources)                                          │
│  ├── Database: player_game_stats, team_standings, betting_odds  │
│  ├── Advanced: TS%, eFG%, USG%, ORTG/DRTG, pace                │
│  ├── Context: injuries, lineups, rest days, B2B               │
│  ├── Betting: lines, movements, value scores, ATS trends       │
│  └── Research: news, matchup history, referee tendencies       │
├─────────────────────────────────────────────────────────────────┤
│  ANALYSIS ENGINE                                                │
│  ├── Sequential Thinking (structured multi-step reasoning)      │
│  ├── Cross-Reference Matrix (correlate multiple factors)        │
│  ├── Confidence Scoring (evidence-weighted conclusions)         │
│  └── Contrarian Detection (spot market inefficiencies)          │
├─────────────────────────────────────────────────────────────────┤
│  OUTPUTS                                                        │
│  ├── Bet Recommendations with confidence % and edge             │
│  ├── Risk Assessment (injury risk, variance factors)            │
│  ├── Supporting Evidence (stats that support conclusion)        │
│  └── Counter-Arguments (why bet might fail)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Components

### 1. Agent Definition File

**Location**: `~/.claude/agents/nba-bettor-expert.md`

**Capabilities**:
- Access to all database queries via API routes
- Sequential thinking for deep analysis
- Web search for real-time news/injuries
- Structured output format for betting recommendations

---

### 2. New API Routes (Data Access Layer)

| Route | Purpose | Data Returned |
|-------|---------|---------------|
| `/api/betting/analysis/player` | Player prop analysis | Last 10 games, vs position defense, home/away splits |
| `/api/betting/analysis/game` | Game totals/spread analysis | Pace matchup, rest days, ATS history, line movement |
| `/api/betting/analysis/matchup` | Head-to-head context | Historical meetings, positional advantages |
| `/api/betting/analysis/context` | Situational factors | B2B, travel, injuries, motivation |

---

### 3. Analysis Frameworks

#### A. Player Prop Framework
```
1. Baseline: Season avg + last 10 trend
2. Matchup: vs opponent position defense rank
3. Context: Home/away, rest, pace of opponent
4. Line Value: Current line vs projected output
5. Confidence: Weight of supporting evidence
```

#### B. Game Total Framework
```
1. Pace Analysis: Combined pace rating
2. Defensive Context: Both teams DRTG
3. Historical: H2H scoring, venue totals
4. Rest/Travel: Fatigue factors
5. Line Movement: Sharp money indicators
```

#### C. Spread Framework
```
1. Power Rating: Net rating differential
2. ATS History: Recent cover trends
3. Situational: Revenge, division, playoff implications
4. Public vs Sharp: Line movement analysis
5. Key Numbers: 3, 7, 10 point thresholds
```

---

### 4. Slash Command Integration

**Command**: `/sc:nba-bet` or `/bet`

**Usage Examples**:
```bash
/bet "Should I take Luka over 28.5 points tonight?"
/bet "Lakers -3.5 vs Warriors - good value?"
/bet "Best player props for tonight's slate"
/bet "Analyze Celtics vs Heat total 215.5"
```

---

### 5. Output Template

```markdown
## NBA Betting Analysis

### Recommendation
**[BET TYPE]**: [SELECTION] | Confidence: [X]% | Edge: [+X.X]%

### Supporting Evidence
- Stat 1: [Evidence]
- Stat 2: [Evidence]
- Stat 3: [Evidence]

### Risk Factors
- Risk 1: [Counter-argument]
- Risk 2: [Counter-argument]

### Context Factors
- Favorable: [List]
- Unfavorable: [List]

### Verdict
[Final analysis with reasoning]
```

---

## Files to Create

| File | Type | Purpose |
|------|------|---------|
| `~/.claude/agents/nba-bettor-expert.md` | Agent | Agent definition with tools and persona |
| `frontend/src/app/api/betting/analysis/route.ts` | API | Unified analysis endpoint |
| `frontend/src/lib/betting-analysis.ts` | Lib | Analysis functions and frameworks |
| `~/.claude/commands/bet.md` | Command | Slash command definition |

---

## Analysis Depth Modes

| Mode | Trigger | Depth | Token Budget |
|------|---------|-------|--------------|
| Quick | Simple question | 1-2 data points | ~2K |
| Standard | Single bet analysis | 5-7 data points | ~5K |
| Deep (`--think`) | Complex matchup | 10+ data points | ~10K |
| Ultra (`--ultrathink`) | Full slate analysis | All available data | ~20K |

---

## Data Cross-Reference Matrix

```
                    │ Player │ Team  │ Pace  │ Defense │ Betting │ Context │
────────────────────┼────────┼───────┼───────┼─────────┼─────────┼─────────┤
Player Props        │   ✓    │   ✓   │   ✓   │    ✓    │    ✓    │    ✓    │
Game Totals         │   ○    │   ✓   │   ✓   │    ✓    │    ✓    │    ✓    │
Spreads             │   ○    │   ✓   │   ✓   │    ✓    │    ✓    │    ✓    │
Live Betting        │   ✓    │   ✓   │   ○   │    ○    │    ✓    │    ✓    │

✓ = Primary input  ○ = Secondary input
```

---

## Implementation Phases

### Phase 1: Agent Core
- [ ] Create agent definition file
- [ ] Define persona and expertise
- [ ] Configure tool access (Sequential, WebSearch)

### Phase 2: Data Layer
- [ ] Create unified analysis API route
- [ ] Implement betting-analysis.ts library
- [ ] Connect to existing database queries

### Phase 3: Analysis Frameworks
- [ ] Implement Player Prop Framework
- [ ] Implement Game Total Framework
- [ ] Implement Spread Framework

### Phase 4: Integration
- [ ] Create slash command `/bet`
- [ ] Test with real betting questions
- [ ] Calibrate confidence scoring

### Phase 5: Validation
- [ ] Agent can access all database queries
- [ ] Sequential thinking integration works
- [ ] Output format is consistent and actionable
- [ ] Confidence scoring is calibrated
- [ ] Web research fills real-time gaps
- [ ] Cross-referencing produces unique insights

---

## Next Steps

Ready for implementation upon user request.
