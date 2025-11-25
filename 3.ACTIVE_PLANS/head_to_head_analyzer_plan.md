# Head-to-Head Matchup Analyzer - Implementation Plan

**Status**: In Progress
**Created**: 2025-11-25
**Page**: `/pace-analysis`

## Overview

Create an interactive head-to-head team comparison component for betting analysis on the pace-analysis page. Allows users to select two NBA teams and see projected game totals with variance analysis.

## Components to Implement

### 1. Database Queries (`lib/queries.ts`)

Add new query functions:

```typescript
// Get all teams for dropdown
export async function getTeamsList(): Promise<Team[]>

// Get detailed stats for a specific team
export async function getTeamDetailedStats(teamId: number): Promise<TeamDetailedStats>

// Get head-to-head history between two teams
export async function getHeadToHeadHistory(teamAId: number, teamBId: number): Promise<H2HGame[]>
```

**TeamDetailedStats Interface:**
```typescript
interface TeamDetailedStats {
  team_id: number
  abbreviation: string
  full_name: string
  pace: number
  ppg: number
  opp_ppg: number
  ortg: number
  drtg: number
  avg_total: number
  stddev_total: number
  min_total: number
  max_total: number
  l3_ppg: number
  l3_total: number
  l5_ppg: number
  l5_total: number
  l10_ppg: number
  l10_total: number
  games_played: number
}
```

### 2. API Route (`app/api/teams/[teamId]/stats/route.ts`)

Dynamic API endpoint for fetching team stats on-demand when user selects a team.

### 3. Main Component (`app/pace-analysis/HeadToHeadAnalyzer.tsx`)

Client component with:
- Team selection dropdowns
- Side-by-side comparison cards
- Projection dashboard
- Variance/confidence bands visualization
- Betting line input and analysis
- Insights panel

## Projection Formulas

```
Combined Pace = (Team A Pace + Team B Pace) / 2
Combined ORTG = (Team A ORTG + Team B ORTG) / 2
Projected Total = Combined Pace × Combined ORTG / 50

Combined StdDev = √(σA² + σB²)

Confidence Intervals:
- 68%: Projected ± 1σ
- 95%: Projected ± 2σ
```

## Matchup Type Classification

| Type | Condition |
|------|-----------|
| FAST vs FAST | Both teams pace ≥ 102 |
| SLOW vs SLOW | Both teams pace < 99 |
| MISMATCH | Pace difference > 4 |
| MIXED | All other cases |

## UI Mockup

```
┌─────────────────────────────────────────────────────────────────┐
│  HEAD-TO-HEAD MATCHUP ANALYZER                                  │
├─────────────────────────────────────────────────────────────────┤
│  [Team A Dropdown]     VS      [Team B Dropdown]                │
├─────────────────────────────────────────────────────────────────┤
│  TEAM COMPARISON (side-by-side stats)                           │
│  - Pace, PPG, ORTG, DRTG, Avg Total, StdDev                    │
│  - Recent form: L3, L5, L10                                     │
├─────────────────────────────────────────────────────────────────┤
│  PROJECTED MATCHUP                                              │
│  - Matchup type badge                                           │
│  - Combined Pace & ORTG                                         │
│  - PROJECTED TOTAL (large display)                              │
│  - Individual team projections                                  │
├─────────────────────────────────────────────────────────────────┤
│  VARIANCE & CONFIDENCE BANDS                                    │
│  - Visual band showing 68%/95% ranges                           │
│  - Historical min/max overlay                                   │
├─────────────────────────────────────────────────────────────────┤
│  BETTING LINE COMPARISON                                        │
│  - Input field for line                                         │
│  - Edge calculation (projection vs line)                        │
│  - Probability distribution                                     │
│  - Betting insights                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Tasks

- [ ] Task 1: Add database query functions to `lib/queries.ts`
- [ ] Task 2: Create API route `/api/teams/[teamId]/stats`
- [ ] Task 3: Create HeadToHeadAnalyzer client component
- [ ] Task 4: Integrate component into pace-analysis page
- [ ] Task 5: Test and validate calculations

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `lib/queries.ts` | Modify | Add 3 new query functions |
| `app/api/teams/[teamId]/stats/route.ts` | Create | API endpoint |
| `app/pace-analysis/HeadToHeadAnalyzer.tsx` | Create | Main component |
| `app/pace-analysis/page.tsx` | Modify | Import and add component |

## Technical Notes

- Use decimal odds format (per project requirements)
- PostgreSQL ROUND() returns numeric → use parseFloat() in TypeScript
- Season filtering required on all queries (WHERE g.season = $1)
- Client component with 'use client' directive for interactivity
