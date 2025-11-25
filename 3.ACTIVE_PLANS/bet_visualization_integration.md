# Bet Analysis Visualization Integration Plan

## Overview
Integrate data-driven visualization components into the bet analysis flow on the my-bets page. Each of the 11 analysis steps will have an appropriate visualization component to provide proof and visual evidence for the betting decision.

## Analysis Step Mapping

### Step 1: Data Collection - Embiid Status
**Component**: Player Status Card
**Data Needed**:
- Player name: Joel Embiid
- Injury status: OUT
- Historical impact: -9.9 PPG without him
**Visualization**: Simple status card with injury designation and impact metric
**Priority**: LOW (simple metric display)

### Step 2: Home Performance Without Embiid ⭐
**Component**: PlayerImpactAnalysis (EXISTING - from /team-defense)
**Data Needed**:
- Team: PHI (team_id)
- Player: Joel Embiid (player_id)
- Location filter: HOME
- View mode: combined-totals
**Query**: `/api/team-defense?action=player-impact&teamId=X&playerId=Y`
**Visualization**: WITH/WITHOUT comparison cards + bar chart + detailed game table
**Priority**: HIGH (reuse existing component)
**Implementation Notes**:
- Component already exists at `frontend/src/app/team-defense/PlayerImpactAnalysis.tsx`
- Takes props: `teamId`, `teamAbbreviation`
- Has built-in player selector and view mode toggle
- Need to pre-select Embiid and set view to 'combined-totals'
- Consider creating a simplified version or passing initial props

### Step 3: Recent Form Analysis
**Component**: Recent Games Trend
**Data Needed**:
- Last 6 games without Embiid
- Combined totals for each game
- Average: 214.7 points
- Reference line: 239.5 (bet line)
**Visualization**: Line chart with horizontal reference line at 239.5
**Priority**: MEDIUM (data-driven visualization)

### Step 4: Head-to-Head Pattern
**Component**: Head-to-Head History
**Data Needed**:
- Last 4 PHI vs MIA games
- Dates, scores, combined totals
- Average: 209.75 points
- Result vs 241 line (all UNDER)
**Visualization**: Table with game history + UNDER/OVER indicators
**Priority**: MEDIUM (table-based visualization)

### Step 5: Miami Lineup Impact ⭐
**Component**: PlayerImpactAnalysis (EXISTING - adapted for opponent)
**Data Needed**:
- Team: MIA (team_id)
- Player: Bam Adebayo (player_id)
- View mode: combined-totals
**Query**: Same as Step 2, different teamId/playerId
**Visualization**: WITH Bam / WITHOUT Bam comparison for defensive impact
**Priority**: HIGH (reuse existing component)

### Step 6: Pace Factor
**Component**: Pace Analysis
**Data Needed**:
- PHI pace WITH Embiid
- PHI pace WITHOUT Embiid
- Difference in possessions per game
**Visualization**: Comparison card showing tempo metrics
**Priority**: LOW (simple metric comparison)

### Step 7: Market Analysis
**Component**: Odds Movement Chart
**Data Needed**:
- Opening line: 241
- Current line: 239.5
- Movement direction: DOWN (UNDER pressure)
- Time series if available
**Visualization**: Line movement graph or simple movement indicator
**Priority**: MEDIUM (if historical data available)
**Note**: odds-tracker page has no historical line movement data, may need to build simple version

### Step 8: Value Assessment
**Component**: Value Calculation
**Data Needed**:
- Fair odds calculation
- Actual odds: 2.07
- Edge: +21%
- Expected ROI: +38.75%
**Visualization**: EV calculation display with metrics
**Priority**: LOW (simple calculation display)

### Step 9: Projected Range
**Component**: Score Projection Range
**Data Needed**:
- Projected range: 218-230 points
- Betting line: 239.5
- Cushion: 9.5-21.5 points
**Visualization**: Horizontal range bar with line reference and cushion zones
**Priority**: MEDIUM (visual range display)

### Step 10: Risk Evaluation
**Component**: Risk Assessment Grid
**Data Needed**:
- Risk factors: Maxey explosion, OT, foul trouble
- Likelihood/impact scores
- Mitigation: strong historical data
**Visualization**: Risk grid with traffic light indicators
**Priority**: LOW (structured text display)

### Step 11: Final Decision
**Component**: Decision Summary Card
**Data Needed**:
- Decision: UNDER 239.5
- Odds: 2.07
- Expected ROI: +38.75%
- Confidence: 8/10
**Visualization**: Prominent summary card with key metrics
**Priority**: LOW (summary display)

## Database Queries Required

### Player Impact Analysis (Steps 2, 5)
```sql
-- Already exists in /api/team-defense
-- Returns games with player_played flag, scores, etc.
SELECT
  g.game_id, g.game_date, g.season,
  g.home_team_abbr, g.away_team_abbr,
  g.home_team_score, g.away_team_score,
  CASE WHEN pgs.player_id IS NOT NULL THEN true ELSE false END as player_played,
  pgs.minutes as player_minutes,
  CASE WHEN g.home_team_abbr = $teamAbbr THEN 'HOME' ELSE 'AWAY' END as location,
  CASE WHEN g.home_team_abbr = $teamAbbr THEN g.away_team_abbr ELSE g.home_team_abbr END as opponent_abbr,
  CASE WHEN g.home_team_abbr = $teamAbbr THEN g.away_team_score ELSE g.home_team_score END as opponent_score,
  CASE WHEN g.home_team_abbr = $teamAbbr THEN g.home_team_score ELSE g.away_team_score END as team_score
FROM games g
LEFT JOIN player_game_stats pgs ON g.game_id = pgs.game_id AND pgs.player_id = $playerId
WHERE g.season = $currentSeason
  AND (g.home_team_id = $teamId OR g.away_team_id = $teamId)
ORDER BY g.game_date DESC
```

### Recent Games Without Player (Step 3)
```sql
-- Last N games where specific player did NOT play
SELECT
  g.game_date,
  g.home_team_abbr,
  g.away_team_abbr,
  g.home_team_score,
  g.away_team_score,
  (g.home_team_score + g.away_team_score) as combined_total
FROM games g
WHERE g.season = $currentSeason
  AND (g.home_team_abbr = 'PHI' OR g.away_team_abbr = 'PHI')
  AND NOT EXISTS (
    SELECT 1 FROM player_game_stats pgs
    WHERE pgs.game_id = g.game_id
    AND pgs.player_id = $embiidPlayerId
  )
ORDER BY g.game_date DESC
LIMIT 6
```

### Head-to-Head History (Step 4)
```sql
-- Last N games between two teams
SELECT
  g.game_date,
  g.home_team_abbr,
  g.away_team_abbr,
  g.home_team_score,
  g.away_team_score,
  (g.home_team_score + g.away_team_score) as combined_total
FROM games g
WHERE g.season IN ($currentSeason, $previousSeason)
  AND (
    (g.home_team_abbr = 'PHI' AND g.away_team_abbr = 'MIA')
    OR (g.home_team_abbr = 'MIA' AND g.away_team_abbr = 'PHI')
  )
ORDER BY g.game_date DESC
LIMIT 4
```

### Team Pace Analysis (Step 6)
```sql
-- Calculate possessions and pace with/without player
-- Possessions formula: FGA + 0.44 * FTA - OREB + TOV
-- Pace: (Possessions / Minutes) * 48

-- This requires team_game_stats table
SELECT
  CASE WHEN pgs.player_id IS NOT NULL THEN 'WITH' ELSE 'WITHOUT' END as player_status,
  AVG(
    (tgs.fga + 0.44 * tgs.fta - tgs.oreb + tgs.turnovers) / (tgs.minutes / 48.0)
  ) as pace
FROM games g
JOIN team_game_stats tgs ON g.game_id = tgs.game_id
LEFT JOIN player_game_stats pgs ON g.game_id = pgs.game_id AND pgs.player_id = $playerId
WHERE g.season = $currentSeason
  AND tgs.team_id = $teamId
GROUP BY CASE WHEN pgs.player_id IS NOT NULL THEN 'WITH' ELSE 'WITHOUT' END
```

## Component Architecture

### Directory Structure
```
frontend/src/app/my-bets/
├── page.tsx                          # Main page (already exists)
└── components/
    ├── PlayerStatusCard.tsx          # Step 1
    ├── BetPlayerImpactAnalysis.tsx   # Steps 2, 5 (adapted from team-defense)
    ├── RecentGamesTrend.tsx          # Step 3
    ├── HeadToHeadHistory.tsx         # Step 4
    ├── PaceAnalysis.tsx              # Step 6
    ├── OddsMovement.tsx              # Step 7
    ├── ValueCalculation.tsx          # Step 8
    ├── ScoreProjectionRange.tsx      # Step 9
    ├── RiskAssessmentGrid.tsx        # Step 10
    └── DecisionSummary.tsx           # Step 11
```

### API Routes Required
```
/api/my-bets
├── GET ?action=player-impact&teamId=X&playerId=Y&location=HOME
├── GET ?action=recent-games&teamAbbr=PHI&playerId=X&limit=6
├── GET ?action=head-to-head&team1=PHI&team2=MIA&limit=4
└── GET ?action=team-pace&teamId=X&playerId=Y
```

## Implementation Phases

### Phase 1: High Priority (Reuse Existing)
1. ✅ Analyze PlayerImpactAnalysis component structure
2. Create BetPlayerImpactAnalysis wrapper for Steps 2 & 5
3. Test with PHI/Embiid and MIA/Bam data
4. Integrate into bet details section

### Phase 2: Medium Priority (Data-Driven)
1. Create Recent Games Trend (Step 3)
2. Create Head-to-Head History (Step 4)
3. Create Score Projection Range (Step 9)
4. Add API endpoints for these queries

### Phase 3: Low Priority (Metric Cards)
1. Create Player Status Card (Step 1)
2. Create Pace Analysis (Step 6)
3. Create Value Calculation (Step 8)
4. Create Risk Assessment Grid (Step 10)
5. Create Decision Summary (Step 11)

### Phase 4: Integration & Testing
1. Wire all components into analysis_steps display
2. Map each step to its component
3. Pass bet context (teams, players, game_id) as props
4. Test with real PHI vs MIA bet
5. Verify all data queries return correct results

## Technical Considerations

### Props Structure
Each visualization component should accept:
```typescript
interface BetVisualizationProps {
  bet: Bet  // Full bet object with all context
  step: string  // Step text from analysis_steps array
}
```

### Data Fetching Strategy
- Use Server Components where possible for initial data
- Client Components for interactive elements
- Consider caching strategies for expensive queries
- Use existing API patterns from team-defense

### Styling Consistency
- Reuse design tokens from `lib/design-tokens.ts`
- Match existing component styles (gray backgrounds, borders)
- Maintain responsive layout
- Use consistent spacing and typography

## Success Criteria

1. ✅ All 11 steps have appropriate visualizations
2. ✅ Visualizations show real data from database
3. ✅ Components reuse existing patterns where possible
4. ✅ Performance is acceptable (<2s load time)
5. ✅ Design matches existing my-bets page style
6. ✅ Mobile responsive (if applicable)
7. ✅ Data queries are season-aware
8. ✅ Error states handled gracefully

## Current Status

- [x] Sequential thinking analysis completed
- [x] PlayerImpactAnalysis component analyzed
- [x] Odds-tracker page analyzed
- [x] Implementation plan created
- [x] **Phase 1 COMPLETE** (Steps 2 & 5 visualizations working)
- [x] **Phase 2 COMPLETE** (Steps 3, 4, 9 data-driven visualizations)
  - [x] Step 3: Recent Games Trend with line chart
  - [x] Step 4: Head-to-Head History with table
  - [x] Step 9: Score Projection Range with horizontal bar
  - [x] **Type Conversion Fixes Applied**: All `bettingLine.toFixed()` calls wrapped with `Number()` across all 3 components (9 total fixes) to prevent TypeErrors
  - [x] **Database Query Fixes Applied**: Fixed `/api/my-bets` route to JOIN with teams table for abbreviations (replaced `g.home_team_abbr` with `home.abbreviation`)
  - [x] **Defensive Array Checks Added**: All components check `Array.isArray(data)` before using array methods
  - [x] **SQL Subquery Fix Applied**: Changed head-to-head query from `WHERE g.season >= (LIMIT 2)` to `WHERE g.season IN (LIMIT 2)` to resolve PostgreSQL error "more than one row returned by a subquery used as an expression"
- [x] **Phase 3 COMPLETE** (Simple metric cards: Steps 1, 6, 7, 8, 10, 11)
  - [x] Step 1: PlayerStatusCard - Player injury status with impact metric display
  - [x] Step 6: PaceAnalysis - Team pace WITH/WITHOUT player comparison with visual bars
  - [x] Step 7: OddsMovement - Line movement visualization with arrow and direction indicator
  - [x] Step 8: ValueCalculation - EV calculation display with odds, edge, ROI, and formula
  - [x] Step 10: RiskAssessmentGrid - Risk factors with likelihood/impact scores and traffic light indicators
  - [x] Step 11: DecisionSummary - Final recommendation card with confidence rating and metrics
- [x] **Phase 4 COMPLETE** (Full integration & testing)
  - [x] All 11 visualization components integrated into my-bets page
  - [x] Each analysis step mapped to its corresponding component
  - [x] Components receive bet context (teams, players, line value, odds)
  - [x] All API endpoints tested and working (no errors)
  - [x] **Type Conversion Fixes Applied Across All Components**:
    - **OddsMovement**: Added Number() conversions for all 4 props (10 total .toFixed() fixes)
    - **ValueCalculation**: Fixed prop name mismatch (actualOdds → oddsDecimal) + 3 type conversion fixes
    - **DecisionSummary**: Added Number() conversions for all 4 props (multiple display references updated)
    - **PlayerStatusCard** (Proactive): Added Number() conversion for impactValue prop (3 .toFixed() fixes)
    - **PaceAnalysis** (Proactive): Added Number() conversions for all 4 numeric props (12 .toFixed() fixes)
  - [x] **Preventive Type Conversion Complete**: All components reviewed and fixed to handle PostgreSQL numeric values returned as strings
  - [x] Complete 11-step betting analysis flow operational:
    - Step 1: PlayerStatusCard (Embiid OUT, -9.9 PPG impact)
    - Step 2: BetPlayerImpactAnalysis (PHI home without Embiid)
    - Step 3: RecentGamesTrend (Last 6 games trend vs betting line)
    - Step 4: HeadToHeadHistory (PHI vs MIA historical matchups)
    - Step 5: BetPlayerImpactAnalysis (MIA with/without Bam)
    - Step 6: PaceAnalysis (Pace impact without Embiid)
    - Step 7: OddsMovement (Line movement 241 → 239.5)
    - Step 8: ValueCalculation (EV calculation with 21% edge)
    - Step 9: ScoreProjectionRange (218-230 projected vs 239.5 line)
    - Step 10: RiskAssessmentGrid (Risk factors with mitigation)
    - Step 11: DecisionSummary (Final recommendation with confidence)
