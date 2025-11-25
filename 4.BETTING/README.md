# NBA Betting Edge Strategies - Statistical Analysis Framework

## Overview

This directory contains a comprehensive collection of NBA betting strategies designed to identify statistical edges on bookmaker lines. Each strategy leverages historical data, recent form analysis, and situational factors to predict game outcomes more accurately than market consensus.

**Expected Performance:**
- Spread bets: 54-56% win rate (breakeven: 52.4%)
- Totals (O/U): 55-57% win rate
- Player props: 56-58% win rate
- Overall ROI: 3-7% (professional level)

## Strategy Documents

| File | Strategy | Difficulty | Expected Edge | Win Rate |
|------|----------|------------|---------------|----------|
| `01_ROLLING_AVERAGES.md` | Rolling Average Total Model | Easy | 3-5% | 55-58% |
| `02_PLAYER_IMPACT.md` | Player Impact Quantification | Medium | 4-6% | 56-59% |
| `03_REST_FATIGUE.md` | Rest & Schedule Advantage | Easy | 3-4% | 54-57% |
| `04_PACE_POSSESSION.md` | Pace and Possession Model | Medium | 2-4% | 54-56% |
| `05_HOME_AWAY_SPLITS.md` | Home/Away with Travel | Medium | 2-3% | 53-55% |
| `06_PLAYER_PROPS.md` | Player Props Usage Model | Medium | 4-7% | 56-58% |
| `07_REBOUNDING.md` | Rebound Rate Differential | Hard | 2-3% | 54-55% |
| `08_THREE_POINT_REGRESSION.md` | 3PT Shooting Regression | Medium | 2-4% | 54-56% |
| `09_COMPOSITE_MODEL.md` | Multi-Factor Composite | Hard | 5-8% | 57-60% |
| `IMPLEMENTATION_GUIDE.md` | Database queries & Python code | - | - | - |

## Implementation Priority

### Phase 1: Foundation (Week 1-2)
**Focus:** High ROI, Easy Implementation

1. **Rolling Average Total Model** (`01_ROLLING_AVERAGES.md`)
   - Simple 3-game averages for O/U predictions
   - SQL queries provided
   - 55-58% win rate expected

2. **Player Impact Quantification** (`02_PLAYER_IMPACT.md`)
   - Calculate team performance with/without key players
   - Exploits bookmaker under-adjustments
   - 56-59% win rate when star player news breaks

3. **Rest/Fatigue Model** (`03_REST_FATIGUE.md`)
   - Quantify cumulative fatigue and travel
   - Simple schedule analysis
   - 54-57% win rate

### Phase 2: Expansion (Week 3-4)
**Focus:** Medium Complexity, Broader Coverage

4. Pace and Possession Model
5. Home/Away Splits with Travel
6. Player Props (Usage/Matchup)

### Phase 3: Advanced (Week 5-6)
**Focus:** Maximum Edge, Complex Analysis

7. Rebounding Differential
8. Three-Point Regression
9. Composite Multi-Factor Model

## Database Requirements

### MVP Tables Needed (Already Available)
- `games` - Game schedules and results
- `teams` - Team reference data
- `players` - Player reference data
- `team_game_stats` - Team box scores
- `player_game_stats` - Player box scores
- `betting_lines` - Bookmaker lines (spread, total, moneyline)
- `standings` - Current team standings

### Additional Calculated Fields
- Rolling averages (3-game, 5-game, 10-game)
- Pace (possessions per 48 minutes)
- Offensive Rating (points per 100 possessions)
- Defensive Rating (points allowed per 100 possessions)
- Rest days between games
- Travel distance

## Quick Start

### 1. Review Core Strategies

Start with the three Phase 1 strategies:

```bash
# Read implementation guides
cat 01_ROLLING_AVERAGES.md
cat 02_PLAYER_IMPACT.md
cat 03_REST_FATIGUE.md
```

### 2. Set Up Database Queries

```bash
# Review SQL implementations
cat IMPLEMENTATION_GUIDE.md
```

### 3. Run Daily Analysis

```python
# Example: Today's games with edges
python daily_edge_finder.py --date 2025-10-23 --strategies all
```

**Output:**
```
=============================================================================
NBA BETTING EDGES - October 23, 2025
=============================================================================

GAME: Lakers vs Heat | Spread: LAL -5.5 | Total: 220.5

EDGE ANALYSIS:
-----------------------------------------------------------------------------
Strategy: Rolling Average Total
  - Lakers 3-game avg: 118.3 PPG
  - Heat 3-game avg: 108.2 PPG
  - Simulated total: 226.5
  - Book line: 220.5
  - EDGE: +6.0 points → BET OVER 220.5 ⭐⭐⭐
  - Confidence: HIGH (6+ points edge)

Strategy: Rest/Fatigue
  - Lakers: 2 days rest (neutral)
  - Heat: Back-to-back, 1800 miles traveled
  - Fatigue adjustment: Heat -4.0 points
  - Adjusted spread: LAL should be -9.5
  - Book line: LAL -5.5
  - EDGE: 4.0 points → BET Lakers -5.5 ⭐⭐
  - Confidence: MEDIUM (3-5 points edge)

RECOMMENDATION:
  BET: Lakers -5.5 (2 units) + OVER 220.5 (3 units)
  Expected Value: +4.8%
=============================================================================
```

## Strategy Philosophy

### Core Principles

1. **Value Over Volume**
   - Only bet when statistical edge exists (3+ points)
   - Quality over quantity (5-10 bets/day max)
   - Pass on marginal spots

2. **Regression to the Mean**
   - Hot/cold streaks regress toward average
   - Books overreact to recent performance
   - Exploit recency bias

3. **Market Inefficiency**
   - Books balance action, not predict outcomes
   - Public money creates line movement
   - Sharp money differs from public

4. **Multi-Factor Analysis**
   - Combine multiple edge indicators
   - Weight strategies by reliability
   - Composite scores increase win rate

### What Creates Betting Value?

**Information Edge:**
- Faster reaction to injury news
- Better player impact quantification
- Advanced statistical models

**Analytical Edge:**
- Rolling averages vs season averages
- Pace-adjusted metrics
- Cumulative fatigue calculations

**Market Timing:**
- Early lines before sharp action
- Line movement exploitation
- Public betting fade opportunities

## Risk Management

### Bankroll Management

```
Unit Size: 1-3% of total bankroll per bet

Confidence Levels:
- HIGH (5+ points edge): 2-3 units
- MEDIUM (3-4.9 edge): 1-2 units
- LOW (1-2.9 edge): 0.5-1 unit
- NO EDGE (<1): PASS
```

### Win Rate Expectations

```
Strategy Performance Target:
- Year 1: 54-55% (building trust)
- Year 2: 55-57% (refined models)
- Year 3+: 56-58% (mature system)

Monthly Variance:
- Best month: 65-70% (normal)
- Worst month: 45-50% (normal)
- Avoid tilt during cold streaks
```

## Tools and Scripts

### Daily Workflow

1. **Morning (9 AM):** Run overnight ETL updates
2. **Pre-game (2 hours before):** Run edge finder for today's games
3. **Injury Check (1 hour before):** Monitor late-breaking news
4. **Line Shopping:** Compare multiple sportsbooks
5. **Bet Placement:** Place bets 30-60 min before tipoff
6. **Post-game:** Log results and update models

### Automation

```bash
# Cron schedule for daily analysis
0 9 * * * python etl_update.py
0 11 * * * python edge_finder.py --notify
0 */1 * * * python injury_monitor.py
```

## Performance Tracking

### Key Metrics to Monitor

1. **Win Rate by Strategy**
   - Track each strategy separately
   - Identify strongest performers
   - Eliminate underperforming strategies

2. **ROI by Bet Type**
   - Spreads vs Totals vs Props
   - Home favorites vs Road underdogs
   - Identify profitable patterns

3. **Edge Calibration**
   - Predicted edge vs actual results
   - Adjust confidence thresholds
   - Refine models based on outcomes

### Monthly Report Template

```
=============================================================================
MONTHLY BETTING PERFORMANCE - October 2025
=============================================================================

OVERALL RESULTS:
  Total Bets: 247
  Wins: 137 (55.5%)
  Losses: 110 (44.5%)
  ROI: +4.2%
  Profit: +$2,145

BY STRATEGY:
  Rolling Averages: 68-51 (57.1%) | ROI: +5.8%
  Player Impact: 42-29 (59.2%) | ROI: +7.3%
  Rest/Fatigue: 27-30 (47.4%) | ROI: -2.1% ⚠️

BY BET TYPE:
  Spreads: 89-71 (55.6%) | ROI: +3.9%
  Totals: 38-29 (56.7%) | ROI: +5.4%
  Props: 10-10 (50.0%) | ROI: -1.2%

ADJUSTMENTS NEEDED:
  - Rest/Fatigue model underperforming → Review calculations
  - Props showing no edge → Reduce volume or eliminate
  - Rolling Averages strongest → Increase allocation
=============================================================================
```

## Legal and Ethical Considerations

### Sports Betting Legality
- Only bet in jurisdictions where legal
- Use licensed sportsbooks
- Verify local gambling laws

### Responsible Gambling
- Set daily/weekly loss limits
- Never chase losses
- Take breaks during losing streaks
- Gambling should be entertainment, not income replacement

### Data Usage
- Use publicly available data only
- Respect API rate limits
- No insider information or game fixing

## Support and Updates

### Documentation Updates
- Strategies reviewed quarterly
- Performance metrics updated monthly
- New edge opportunities added as discovered

### Community
- Share results and refinements
- Discuss strategy improvements
- Report bugs or issues

---

**Version:** 1.0.0
**Last Updated:** October 23, 2025
**Author:** stat-discute.be Betting Analytics Team
**License:** Internal Use Only
