# MVP Plan: Stat Discute v1.0

**Status**: IN PROGRESS
**Started**: 2026-01-06
**Current Phase**: Phase 3 - Navigation & UX
**Phase 1 Completed**: 2026-01-06
**Phase 2 Completed**: 2026-01-06

---

## Executive Summary

Build a focused NBA betting analytics MVP with **12 core pages** from the current 40-page codebase. Focus on complete, functional features that deliver immediate value.

---

## MVP Scope

### Core Pages to Include (12 pages)

| Page | Route | Completion | Reason |
|------|-------|------------|--------|
| Homepage | `/` | 95% | Entry point, navigation hub |
| Teams List | `/teams` | 95% | Core feature |
| Team Detail | `/teams/[teamId]` | 100% | Complete with charts |
| Players List | `/players` | 90% | Core feature |
| Player Detail | `/players/[playerId]` | 95% | Complete stats display |
| Games | `/games` | 85% | Schedule/results |
| Betting Totals | `/betting/totals` | 100% | Key betting feature |
| Q1 Value | `/analysis/q1-value` | 90% | Unique value prop |
| Game Analysis | `/analysis/[gameId]` | 95% | Deep game analysis |
| Value Finder | `/betting/value-finder` | 85% | Betting recommendations |
| Login | `/login` | 90% | Basic auth (placeholder credentials) |
| Admin | `/admin` | 85% | Data management |

### Pages to Defer (Post-MVP)

| Page | Route | Reason |
|------|-------|--------|
| Chat | `/chat` | Requires Ollama server |
| ML Analysis | `/ml-analysis` | Requires ML API |
| Storytelling | `/prototype/storytelling/*` | Prototype phase |
| Lineups | `/lineups` | Incomplete (70%) |
| Matchups | `/matchups` | Incomplete (75%) |
| My Bets | `/my-bets` | Misplaced, incomplete |
| Player Props | `/player-props/*` | Multiple incomplete pages |
| All test pages | `/design-tokens-test/*` | Development only |

### Pages to Remove (Duplicates/Unused)

| Page | Reason |
|------|--------|
| `/landing/page.tsx` | Duplicate of root homepage |
| `/analyse/page.tsx` | French duplicate of `/analysis` |
| `/forgot-password/page.tsx` | No auth system active |

---

## Implementation Phases

### Phase 1: Cleanup (Day 1) ✅ COMPLETE
- [x] Write plan to active plans
- [x] Remove duplicate pages (`landing/`, `analyse/`, `forgot-password/`)
- [x] Remove test pages from production build (`*-test/`)
- [x] ~~Fix login page - remove hardcoded dev credentials~~ SKIP (keep as placeholders)
- [x] Update navigation to only show MVP pages
- [x] Verify production build succeeds

### Phase 2: Polish Core Pages (Days 2-3) ✅ COMPLETE
- [x] Homepage - finalize navigation links to MVP pages only
- [x] Teams/Players - ensure responsive design works (fixed padding)
- [x] Betting Totals - verify Monte Carlo calculations (Agent API + fallback)
- [x] Game Analysis - test all sections load correctly (7 sections verified)

### Phase 3: Navigation & UX (Day 4) ⬅️ CURRENT
- [ ] Simplify AppLayout navigation to MVP pages
- [ ] Add loading states where missing
- [ ] Ensure consistent error handling
- [ ] Mobile responsiveness check

### Phase 4: Deployment Prep (Day 5)
- [ ] Environment variables audit
- [ ] Database connection verification
- [ ] API routes health check
- [ ] Build and test production bundle

---

## Critical Files to Modify

```
frontend/src/
├── app/
│   ├── page.tsx              # Simplify homepage links
│   └── layout.tsx            # Verify metadata
├── components/
│   └── layout/
│       └── AppLayout.tsx     # Update navItems array
└── lib/
    └── queries.ts            # Verify all queries work
```

### Files to Delete (Phase 1)
```
frontend/src/app/
├── landing/                  # Duplicate
├── analyse/                  # French duplicate
├── forgot-password/          # Unused
├── design-tokens-test/       # Dev only
├── ui-components-test/       # Dev only
└── stats-components-test/    # Dev only
```

---

## Success Criteria

- [ ] 12 core pages load without errors
- [ ] Navigation shows only MVP pages
- [ ] Mobile responsive on all pages
- [ ] Production build succeeds
- [ ] All API routes return data

---

## Out of Scope for MVP

- User authentication system (use placeholder login)
- AI chat features (Ollama dependency)
- ML predictions (external API)
- Player props tracking
- Bet tracking/history
- Multi-language support
- Dark/light theme toggle

---

## Post-MVP Roadmap

1. **v1.1**: Add lineups page with injury reports
2. **v1.2**: ML predictions integration
3. **v1.3**: Player props analysis
4. **v1.4**: Bet tracking and history
5. **v2.0**: AI chat assistant
