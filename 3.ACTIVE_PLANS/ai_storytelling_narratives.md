# AI-Powered Storytelling Narratives

**Date**: 2025-12-20
**Status**: Planning
**Goal**: Replace hardcoded template strings with AI-generated, value-driven betting analysis narratives

---

## Executive Summary

Transform the storytelling prototype from static template-based text to dynamically AI-generated narratives that provide real analytical value for NBA betting analysis. The system will use Anthropic's Claude API with streaming to generate insightful, betting-focused French-language narratives for each sequence of the game analysis.

---

## Current State Analysis

### Identified Text Generation Points

| Sequence | Line | Current Approach | Issue |
|----------|------|------------------|-------|
| Intro | 326-342 | Template string with team data interpolation | Generic, no insight |
| Accroche | 827-828 | Template with trend counts | Repetitive pattern |
| Scoring | 891 | Static "Scoring Offensif · Saison 2024-25" | No analysis |
| Combined | 1045-1046 | Template with pace/H2H data | No betting angle |
| Defense | 1129-1130 | Template with defensive ranks | No edge identification |
| Synthesis | 1269-1271 | Template with totals comparison | No verdict/confidence |

### Existing Infrastructure

- **Ollama integration**: `lib/ollama.ts` for local LLM (llama3.1)
- **Chat API**: `api/chat/route.ts` with intent parsing and response generation
- **No Anthropic SDK**: Will need to add

---

## Proposed Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORYTELLING PAGE                             │
│  ┌─────────────────┐         ┌─────────────────────────────┐    │
│  │   Game Data     │         │   Narratives (Streaming)     │    │
│  │   API Call      │         │   API Call                   │    │
│  └────────┬────────┘         └────────────┬─────────────────┘    │
│           │                               │                       │
│           ▼                               ▼                       │
│  ┌─────────────────┐         ┌─────────────────────────────┐    │
│  │  /api/analysis/ │         │  /api/analysis/storytelling/│    │
│  │  storytelling/  │────────▶│  [gameId]/narratives       │    │
│  │  [gameId]       │  data   │  (POST with game data)      │    │
│  └─────────────────┘         └─────────────────────────────┘    │
│                                          │                       │
│                                          ▼                       │
│                              ┌─────────────────────────────┐    │
│                              │  lib/anthropic.ts           │    │
│                              │  (Claude API + Streaming)   │    │
│                              └─────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Narrative Types

```typescript
interface GameNarratives {
  intro: {
    headline: string       // Compelling main hook
    subtext: string        // Contextual matchup description
  }
  accroche: {
    context: string        // Trend analysis with insight
    reflection: string     // Betting consideration question
  }
  scoring: {
    title: string          // Dynamic section title
    analysis: string       // Comparative offensive breakdown
  }
  combined: {
    title: string          // Section title
    context: string        // Pace and H2H insights
    insight: string        // Key betting angle
  }
  defense: {
    title: string          // Section title
    context: string        // Defensive matchup analysis
    edge: string           // Which team has defensive edge
  }
  synthesis: {
    title: string          // Final section title
    context: string        // Overall assessment
    reflection: string     // Final betting consideration
    verdict: 'OVER' | 'UNDER' | 'PASS'
    confidence: number     // 0-100 scale
    reasoning: string[]    // 2-3 key reasons
  }
}
```

---

## Prompt Engineering Strategy

### System Prompt (Core)

```
Tu es un analyste NBA expert spécialisé dans les paris sportifs, particulièrement les totaux (Over/Under).

PRINCIPES:
- Utilise UNIQUEMENT les données fournies, jamais d'estimations
- Chaque insight doit être lié à une implication pour le pari
- Identifie ce que le marché pourrait manquer
- Style: direct, analytique, professionnel mais accessible
- Langue: français

CONTEXTE MARCHÉ:
- Moyenne NBA totaux: ~225 points
- -110 américain = 1.91 décimal
- Cherche les écarts significatifs (>3 pts) pour identifier la valeur

ÉVITE:
- Les généralités ("ce sera un match serré")
- Les prédictions de scores exacts
- Le langage marketing ("match explosif!")
```

### Sequence-Specific Prompts

**Intro Prompt:**
```
Génère une accroche percutante pour ce match NBA.

DONNÉES DU MATCH:
{fullGameData}

OBJECTIF: Une phrase d'accroche impactante + une phrase de contexte
ANGLE: Ce qui rend ce match intéressant pour les paris totaux
STYLE: Journalistique sportif, direct

FORMAT JSON:
{ "headline": "...", "subtext": "..." }
```

**Synthesis Prompt:**
```
Génère la synthèse finale d'analyse pour ce match.

DONNÉES COMPLÈTES:
{fullGameData}

FACTEURS OVER: {overFactors}
FACTEURS UNDER: {underFactors}

OBJECTIF:
1. Évaluer objectivement les facteurs
2. Donner un verdict clair (OVER/UNDER/PASS)
3. Quantifier la confiance (0-100)
4. Expliquer en 2-3 points clés

FORMAT JSON:
{
  "title": "Synthèse · {away} @ {home}...",
  "context": "...",
  "reflection": "...",
  "verdict": "OVER|UNDER|PASS",
  "confidence": 75,
  "reasoning": ["Raison 1", "Raison 2", "Raison 3"]
}
```

---

## Implementation Phases

### Phase 1: Infrastructure Setup (Day 1)

**Tasks:**
1. Install `@anthropic-ai/sdk` package
2. Add `ANTHROPIC_API_KEY` to `.env.local`
3. Create `lib/anthropic.ts` with:
   - Client initialization
   - Streaming helper function
   - Error handling
4. Create `lib/ai/types.ts` with narrative interfaces

**Files:**
- `frontend/package.json` (modify)
- `frontend/.env.local` (modify)
- `frontend/src/lib/anthropic.ts` (create)
- `frontend/src/lib/ai/types.ts` (create)

### Phase 2: Prompt & API Development (Day 1-2)

**Tasks:**
5. Create `lib/ai/storytelling-prompts.ts` with all prompt templates
6. Create `/api/analysis/storytelling/[gameId]/narratives/route.ts`:
   - POST handler accepting game data
   - Call Claude API with structured prompts
   - Stream response for progressive loading
7. Add error handling and fallback to templates

**Files:**
- `frontend/src/lib/ai/storytelling-prompts.ts` (create)
- `frontend/src/app/api/analysis/storytelling/[gameId]/narratives/route.ts` (create)

### Phase 3: Frontend Integration (Day 2)

**Tasks:**
8. Create `components/analysis/StreamingNarrative.tsx`:
   - Typewriter effect component
   - Loading skeleton
   - Error fallback
9. Create `hooks/useNarratives.ts`:
   - Fetch narratives with game data
   - Handle streaming response
   - Manage loading/error states
10. Modify `app/prototype/storytelling/[gameId]/page.tsx`:
    - Integrate useNarratives hook
    - Replace template strings with StreamingNarrative components
    - Keep existing UI structure

**Files:**
- `frontend/src/components/analysis/StreamingNarrative.tsx` (create)
- `frontend/src/hooks/useNarratives.ts` (create)
- `frontend/src/app/prototype/storytelling/[gameId]/page.tsx` (modify)

### Phase 4: Polish & Enhancement (Day 3)

**Tasks:**
11. Add caching layer (localStorage or Redis) for repeated views
12. Fine-tune prompts based on output quality
13. Add analytics/logging for AI calls
14. Create loading animations specific to each sequence
15. Add "Regenerate" button for synthesis

---

## Technical Decisions

### Provider Choice: Anthropic Claude

**Reasons:**
- Superior analytical reasoning for betting insights
- Excellent French language support
- Reliable cloud service vs local Ollama
- Streaming support built-in
- Can use Claude 3.5 Sonnet for cost efficiency

### Streaming Architecture

**Approach:** Server-Sent Events (SSE) via `ReadableStream`

```typescript
// API Route
export async function POST(request: Request) {
  const gameData = await request.json()

  const stream = new ReadableStream({
    async start(controller) {
      for (const sequence of sequences) {
        const narrative = await generateNarrative(sequence, gameData)
        controller.enqueue(JSON.stringify({ sequence, narrative }) + '\n')
      }
      controller.close()
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
```

### Cost Estimation

| Metric | Estimate |
|--------|----------|
| Input tokens per game | ~2,000 |
| Output tokens per game | ~1,000 |
| Claude 3.5 Sonnet cost | ~$0.02/game |
| 100 games/day | ~$2/day |
| Monthly estimate | ~$60/month |

---

## UX Design

### Loading States

```
┌─────────────────────────────────────────┐
│  [Charts render immediately from data]   │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│  │      Generating analysis...        │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [Typewriter effect as text streams]     │
│  "Une ligne à 234.5 points — parmi le█" │
└─────────────────────────────────────────┘
```

### Fallback Behavior

1. **AI unavailable**: Show current template-based text
2. **Streaming fails mid-way**: Show partial + template for rest
3. **Slow generation**: Show skeleton, auto-retry once

---

## File Structure (Final)

```
frontend/src/
├── lib/
│   ├── anthropic.ts                    # NEW: Claude API client
│   └── ai/
│       ├── types.ts                    # NEW: Narrative types
│       └── storytelling-prompts.ts     # NEW: Prompt templates
│
├── hooks/
│   └── useNarratives.ts                # NEW: Narratives hook
│
├── components/
│   └── analysis/
│       └── StreamingNarrative.tsx      # NEW: Typewriter component
│
└── app/
    ├── api/
    │   └── analysis/
    │       └── storytelling/
    │           └── [gameId]/
    │               ├── route.ts        # EXISTING: Game data
    │               └── narratives/
    │                   └── route.ts    # NEW: AI narratives
    │
    └── prototype/
        └── storytelling/
            └── [gameId]/
                └── page.tsx            # MODIFY: Use narratives
```

---

## Success Criteria

1. **Quality**: Narratives provide genuine betting insights beyond data description
2. **Performance**: Time to first narrative < 3 seconds
3. **Reliability**: < 1% failure rate with graceful fallback
4. **UX**: Streaming provides progressive, engaging experience
5. **Cost**: Under $100/month at reasonable usage

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| API costs spike | Set spending limits in Anthropic dashboard |
| Poor narrative quality | Iterate on prompts with A/B testing |
| Latency issues | Implement caching, parallel generation |
| Service outage | Fallback to template strings |
| Rate limits | Queue requests, implement backoff |

---

## Next Steps

1. **Validate Plan**: Get user approval
2. **Setup API Key**: Obtain Anthropic API key
3. **Begin Phase 1**: Infrastructure setup
4. **Test First Narrative**: Validate prompt quality before full implementation

---

**Author**: Claude Code
**Last Updated**: 2025-12-20
