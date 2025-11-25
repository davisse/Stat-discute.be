# Betting Value Agent - Implementation Plan

## Overview
Create an intelligent betting recommendation engine that identifies high-value betting opportunities by analyzing multiple data sources and calculating expected value scores.

**Date**: November 20, 2025
**Status**: In Development

## Value Scoring Methodology

### Core Principle
A "value bet" exists when our statistical analysis suggests the true probability of an outcome is higher than what the betting odds imply.

### Scoring Factors (Total: 100 points)

#### 1. Positional Matchup Edge (25 points)
**Data Source**: `defensive_stats_by_position` table

**Algorithm**:
- For each player matchup, compare player's season average vs opponent's defense rank against that position
- **Favorable matchup** (opponent allows more than league average): +points
- **Tough matchup** (opponent elite defense): -points

**Scoring**:
- Opponent ranked 26-30 (worst defenses): +5 per key player
- Opponent ranked 21-25: +3 per key player
- Opponent ranked 11-20: 0 (neutral)
- Opponent ranked 6-10: -3 per key player
- Opponent ranked 1-5 (best defenses): -5 per key player

**Max**: 25 points (5 key players × 5 points each)

#### 2. Betting Trend Performance (20 points)
**Data Source**: `ats_performance`, `betting_trends` tables

**Algorithm**:
- Analyze recent ATS (Against The Spread) performance
- Over/Under trend analysis (hitting over vs under)
- Home/Away splits

**Scoring**:
- Team covering >60% last 10 games: +10
- Team covering 55-60%: +5
- Team covering 45-55%: 0 (neutral)
- Team covering 40-45%: -5
- Team covering <40%: -10

**Max**: 20 points (10 per team in matchup)

#### 3. Advanced Stats Mismatch (20 points)
**Data Source**: `team_game_stats`, `player_advanced_stats` tables

**Key Metrics**:
- **Pace Differential**: Fast team vs slow team = over value
- **Four Factors Advantage**: eFG%, TOV%, OREB%, FT Rate
- **TS% and eFG% differentials**

**Scoring**:
- Significant pace mismatch (>5 possessions/game difference): +8
- Four Factors advantage (team superior in 3+ factors): +8
- Shooting efficiency edge (TS% difference >5%): +4

**Max**: 20 points

#### 4. Recent Form and Momentum (15 points)
**Data Source**: `team_standings`, `games` table

**Algorithm**:
- Last 5 games record (W-L)
- Point differential trend
- Home/away performance

**Scoring**:
- Team on 4+ game win streak: +8
- Team on 3 game win streak: +5
- Team .500 last 5: 0
- Team on 3 game losing streak: -5
- Team on 4+ game losing streak: -8

**Max**: 15 points (7.5 per team)

#### 5. Rest and Schedule Edge (10 points)
**Data Source**: `games` table (date analysis)

**Algorithm**:
- Days of rest comparison
- Back-to-back situations
- Travel distance (home/away)

**Scoring**:
- Well-rested (3+ days) vs opponent on back-to-back: +10
- Well-rested (2 days) vs opponent (1 day rest): +5
- Equal rest: 0
- Less rest than opponent: -5 to -10

**Max**: 10 points

#### 6. Line Movement and Odds Value (10 points)
**Data Source**: `betting_odds`, `betting_lines` tables

**Algorithm**:
- Compare opening line vs current line
- Identify reverse line movement (line moves against public betting %)
- Sharp money indicators

**Scoring**:
- Reverse line movement (sharp money): +10
- Line moved in our favor: +5
- No significant movement: 0
- Line moved against us: -5

**Max**: 10 points

---

## Value Score Ranges

**Total Score**: 0-100 points

### Classification
- **90-100**: 🔥 Exceptional Value (Highest Confidence)
- **75-89**: ⭐ Strong Value (High Confidence)
- **60-74**: ✅ Good Value (Moderate Confidence)
- **45-59**: ⚖️ Slight Edge (Low Confidence)
- **0-44**: ❌ No Value (Avoid)

---

## Bet Type Recommendations

### Spread Bets
**Recommended when**:
- Positional matchup edge is significant (±15 points)
- ATS performance supports the side
- Advanced stats show clear team superiority

### Total (Over/Under) Bets
**Recommended when**:
- Pace differential is significant
- Both teams have strong O/U trends in same direction
- Recent scoring trends align

### Player Props
**Recommended when**:
- Player faces favorable positional matchup (opponent rank 25+)
- Player's season average significantly higher than prop line
- Player has usage rate advantage

### Moneyline Bets
**Recommended when**:
- Underdog with value score >70
- Positional matchups heavily favor underdog
- Recent form supports upset potential

---

## Data Integration Strategy

### Step 1: Game Analysis
For each game on today's schedule:
1. Identify home and away teams
2. Pull team stats and trends
3. Identify key players and their positions

### Step 2: Matchup Analysis
For each key player:
1. Get player's season averages (PPG, RPG, APG)
2. Get opponent's defense rank vs that position
3. Calculate matchup differential

### Step 3: Statistical Comparison
1. Team pace differentials
2. Four Factors comparison
3. Recent form analysis (last 5-10 games)
4. ATS and O/U trends

### Step 4: Schedule Context
1. Days of rest calculation
2. Back-to-back detection
3. Home/away record

### Step 5: Betting Line Analysis
1. Current spread and total
2. Line movement analysis
3. Odds value calculation

### Step 6: Score Calculation
1. Calculate each of the 6 scoring factors
2. Sum to total value score (0-100)
3. Classify value tier
4. Generate recommendation

---

## Implementation Components

### 1. Database Table: `betting_value_analysis`
```sql
CREATE TABLE betting_value_analysis (
    analysis_id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) REFERENCES games(game_id),
    analysis_date DATE NOT NULL,

    -- Team identifiers
    home_team_id BIGINT REFERENCES teams(team_id),
    away_team_id BIGINT REFERENCES teams(team_id),

    -- Scoring factors (0-100 scale for each)
    positional_matchup_score DECIMAL(5,2),
    betting_trend_score DECIMAL(5,2),
    advanced_stats_score DECIMAL(5,2),
    recent_form_score DECIMAL(5,2),
    rest_schedule_score DECIMAL(5,2),
    line_value_score DECIMAL(5,2),

    -- Total value score
    total_value_score DECIMAL(5,2) NOT NULL,
    value_tier VARCHAR(20), -- 'Exceptional', 'Strong', 'Good', 'Slight', 'None'

    -- Recommendations
    recommended_bet_type VARCHAR(50), -- 'spread', 'total_over', 'total_under', 'moneyline', 'player_prop'
    recommended_side VARCHAR(10), -- 'home', 'away'
    confidence_level VARCHAR(20), -- 'High', 'Moderate', 'Low'

    -- Supporting data (JSON)
    matchup_details JSONB, -- Detailed breakdown of positional matchups
    trend_details JSONB,   -- ATS, O/U trends
    stat_details JSONB,    -- Advanced stats comparison

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_betting_value_date ON betting_value_analysis(analysis_date);
CREATE INDEX idx_betting_value_score ON betting_value_analysis(total_value_score DESC);
CREATE INDEX idx_betting_value_game ON betting_value_analysis(game_id);
```

### 2. Python Analytics Script: `calculate_betting_value.py`
Location: `1.DATABASE/etl/analytics/calculate_betting_value.py`

**Functions**:
- `get_todays_games()` - Fetch games for analysis date
- `analyze_positional_matchups(game_id)` - Score positional edges
- `analyze_betting_trends(team_id)` - Score ATS/O/U performance
- `analyze_advanced_stats(home_team_id, away_team_id)` - Score stat mismatches
- `analyze_recent_form(team_id)` - Score momentum
- `analyze_rest_schedule(game_id)` - Score rest advantage
- `analyze_line_value(game_id)` - Score line movement
- `calculate_total_value(scores)` - Combine all scores
- `generate_recommendation(game_id, total_score, scores)` - Create bet recommendation
- `store_analysis(analysis)` - Save to database

### 3. TypeScript Query Functions
Location: `frontend/src/lib/queries.ts`

**New Functions**:
```typescript
// Get value recommendations for a specific date
getBettingValueRecommendations(date?: string, minScore?: number)

// Get value analysis for a specific game
getGameValueAnalysis(gameId: string)

// Get top value opportunities
getTopValueOpportunities(limit: number = 10)

// Get value recommendations by bet type
getValueRecommendationsByType(betType: string)
```

### 4. Frontend Page: `/betting/value-finder`
Location: `frontend/src/app/betting/value-finder/page.tsx`

**Components**:
- Header with date selector
- Value tier filters (Exceptional, Strong, Good)
- Bet type filters (Spread, Total, Props)
- Game cards showing:
  - Matchup
  - Total value score with visual indicator
  - Individual factor scores (radar chart or bar chart)
  - Recommended bet with explanation
  - Supporting statistics
  - Confidence level

---

## Example Output

### Game: PHI @ MIL (Tonight 8:00 PM ET)

**Total Value Score**: 82/100 ⭐ **Strong Value**

**Recommended Bet**: Milwaukee -5.5 (Spread)
**Confidence**: High

**Factor Breakdown**:
- 🎯 Positional Matchup: 22/25 (Giannis vs PHI PF defense ranked 28th)
- 📊 Betting Trends: 15/20 (MIL 7-3 ATS last 10)
- 📈 Advanced Stats: 16/20 (MIL superior in pace, eFG%, OREB%)
- 🔥 Recent Form: 10/15 (MIL 4-1 last 5, PHI 2-3)
- 😴 Rest/Schedule: 9/10 (MIL rested, PHI on back-to-back)
- 💰 Line Value: 10/10 (Line opened -4.5, now -5.5 despite public on PHI)

**Key Insights**:
- Giannis Antetokounmpo (PF) faces 76ers defense ranked 28th vs PFs (allows 24.8 PPG, league avg 21.8)
- Milwaukee 7-3 ATS in last 10 games, covering by average of 6.2 points
- 76ers on second night of back-to-back, traveled from Philadelphia
- Sharp money pushed line from -4.5 to -5.5 despite public betting on 76ers

---

## Success Metrics

### Accuracy Targets
- **Value Score 90+**: >70% win rate
- **Value Score 75-89**: >60% win rate
- **Value Score 60-74**: >55% win rate

### Coverage Goals
- Analyze 100% of games on schedule
- Provide recommendations for 50%+ of games
- Identify 3-5 "Strong Value" or better opportunities per day

### Performance Tracking
- Track recommended bet outcomes
- Calculate ROI by value tier
- Refine scoring weights based on historical accuracy

---

## Implementation Status

### Phase 2A: Core Implementation (✅ COMPLETE)

1. ✅ Design methodology (this document)
2. ✅ Create database migration for `betting_value_analysis` table
3. ✅ Implement Python analytics script (`analyze_todays_games.py`)
4. ✅ Create ETL pipeline:
   - `populate_betting_lines.py` - Transform betting_odds → betting_lines
   - `calculate_ats_performance.py` - Calculate ATS stats
   - `calculate_betting_trends.py` - Aggregate betting trends
5. ✅ Create TypeScript query functions (in `queries.ts`)
6. ✅ Build frontend page (`/betting/value-finder`)
7. ✅ Test with tonight's 4 games (2025-11-20)
8. ✅ Validate recommendations and refine algorithm

**Phase 2A Results** (2025-11-20):
- All ETL scripts executing successfully
- Database populated with real betting data
- Value analysis running with integrated ATS and betting lines
- Scores: 35-45 range (expected with limited data)
- Data accumulation in progress

### Current Data State
```
betting_lines:         22 records (11 unique games)
betting_odds:          6,068 records
ats_performance:       9 teams (20 games with lines)
betting_trends:        0 trends (needs 10+ games/team)
betting_value_analysis: 4 analyses (today's games)
```

### Phase 2B: Data Accumulation & Enhancement (🔄 IN PROGRESS)

**Immediate Priority**:
1. 🔄 Run daily betting odds scraper (`fetch_pinnacle_odds.py`)
   - ✅ Script working correctly
   - ✅ Accumulated 272 new odds records today
   - ⏳ Need 2-3 weeks daily collection for reliable scores

2. ⏳ Achieve 50+ games with betting lines
   - Current: 20 games
   - Target: 50+ games for reliable ATS statistics
   - Expected: 60-70 score range (up from 35-45)

3. ⏳ Activate trend detection
   - Current: 0 trends (insufficient data)
   - Needs: 10+ games per team
   - Expected: 2-3 weeks of daily collection

**Automation Setup** (✅ COMPLETE):
4. ✅ Daily betting pipeline orchestration
   - Created `daily_betting_pipeline.sh` - 5-step ETL orchestration
   - Created `setup_cron.sh` - Interactive cron job installer
   - Proposed schedule: 10:00 AM ET daily (before games start)
   - Comprehensive logging and metrics reporting

**Enhancement Tasks** (Week 3-4):
5. ✅ Point differential trends (COMPLETE)
   - ✅ Enhanced `get_recent_form()` with margin of victory analysis
   - ✅ Added blowout/close win categorization (15+ pts, <8 pts)
   - ✅ Added momentum trend detection (improving/declining/neutral)
   - ✅ Updated `score_recent_form()` to use 8 metrics (was 2)
   - ✅ Maintained backward compatibility
   - ✅ Tested successfully on 2025-11-20 games

6. ⏳ Injury data integration
   - NBA injury API integration
   - Adjust positional matchup scores when key defenders out

7. ✅ Travel distance analysis (COMPLETE)
   - ✅ Added latitude/longitude/timezone to venues table (30 NBA arenas)
   - ✅ Created `calculate_distance_miles()` PostgreSQL function (Haversine formula)
   - ✅ Enhanced `get_travel_distance()` to calculate away team travel
   - ✅ Updated `score_rest_schedule()` with travel penalties:
     - Regional (500-1500 mi): +1 home bonus on back-to-back
     - Cross-country (>1500 mi): +2 home bonus on back-to-back
     - Long distance (>2000 mi): +1 home bonus even with equal rest
   - ✅ Fixed data flow bug in `get_days_rest()` function
   - ✅ Tested successfully with real game data (PHI @ MIL: 694 mi regional travel)

---

## Future Enhancements

### Phase 2
- **Injury impact analysis**: Adjust scores when key players are out
- **Weather conditions**: For outdoor sports (future expansion)
- **Referee tendencies**: Historical over/under patterns by official
- **Public betting %**: Contrarian indicators

### Phase 3
- **Machine learning model**: Train model on historical value scores vs outcomes
- **Live betting recommendations**: Update value scores during games
- **Automated alerts**: Notify when exceptional value opportunities appear
- **Backtesting framework**: Historical simulation to validate methodology
