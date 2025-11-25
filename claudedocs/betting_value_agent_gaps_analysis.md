# Betting Value Agent - Gaps Analysis & Improvement Plan

**Date**: 2025-11-20
**Status**: Phase 1 Complete - Data Gaps Identified

## Current Performance

### Analyzed Games (2025-11-20)
- ATL @ SAS: **45.5/100** (Slight Value)
- SAC @ MEM: **42.5/100** (None)
- LAC @ ORL: **37.5/100** (None)
- PHI @ MIL: **35.0/100** (None)

### Issue: Low Scores
Scores are significantly lower than expected (35-45 vs target 60-90) due to **missing betting data**.

---

## Data Gap Analysis

### ✅ Available Data (Working)

| Data Source | Status | Row Count | Coverage |
|-------------|--------|-----------|----------|
| **Defensive Stats by Position** | ✅ Full | 150 | 30 teams × 5 positions |
| **Team Advanced Stats** | ✅ Full | ~8,000 | pace, eFG%, TOV% per game |
| **Recent Form** | ✅ Full | All games | Last 5 games W-L record |
| **Rest & Schedule** | ✅ Full | All games | Days rest, back-to-back detection |
| **Betting Odds** | ✅ Partial | 5,796 | Raw odds data available |

### ❌ Missing Data (Critical Gaps)

| Data Source | Status | Impact | Score Factor |
|-------------|--------|--------|--------------|
| **ATS Performance** | ❌ Empty (0 rows) | **HIGH** | -20 points (Betting Trends) |
| **Betting Lines** | ❌ Empty (0 rows) | **HIGH** | -10 points (Line Value) |
| **Betting Trends** | ❌ Empty (0 rows) | **HIGH** | -20 points (Betting Trends) |
| **Line Movement** | ❌ No tracking | **MEDIUM** | -10 points (Line Value) |
| **Sharp Money Indicators** | ❌ No data | **MEDIUM** | -5 points (Line Value) |

**Total Missing Points**: Up to **50/100 points** (half the scoring potential!)

---

## Factor-by-Factor Analysis

### 1. ✅ Positional Matchup Edge (0-25 points)
**Status**: WORKING
**Data Source**: `defensive_stats_by_position` table (150 rows)

**What Works**:
- Ranks opponent defense vs each position (1-30)
- Compares player averages vs opponent defense
- Identifies favorable/tough matchups

**What Could Improve**:
- ⚠️ **Injury data integration** - Adjust when key defenders are out
- ⚠️ **Usage rate adjustment** - Weight by player's offensive role
- ⚠️ **Home/away splits** - Players perform differently on road

### 2. ❌ Betting Trend Performance (0-20 points)
**Status**: MOCK DATA (always returns 0.50)
**Current Implementation**:
```python
def get_ats_performance(conn, team_id, season):
    """Get ATS cover percentage (mock for now)"""
    # TODO: Implement when betting_trends table has data
    return 0.50  # ❌ Always neutral
```

**Required Data** (table: `ats_performance`):
- ATS cover percentage (last 10 games)
- Home/away ATS splits
- Favorite/underdog ATS performance
- Over/Under trends

**Impact**: Missing **~15-20 points per game** due to neutral scoring

### 3. ✅ Advanced Stats Mismatch (0-20 points)
**Status**: WORKING
**Data Source**: `team_game_stats` table

**What Works**:
- Pace differential analysis
- Effective FG% comparison
- Turnover percentage comparison

**What Could Improve**:
- ⚠️ **Four Factors weighting** - Add OREB% and FT Rate
- ⚠️ **Offensive/Defensive rating** - More comprehensive efficiency metrics
- ⚠️ **Clutch stats** - Performance in close games

### 4. ✅ Recent Form and Momentum (0-15 points)
**Status**: WORKING
**Data Source**: `games` table

**What Works**:
- Last 5 games W-L record
- Calculates team momentum

**What Could Improve**:
- ⚠️ **Point differential trends** - Not just W-L but margin of victory
- ⚠️ **Schedule strength** - Quality of recent opponents
- ⚠️ **Home vs away form** - Separate momentum by location

### 5. ✅ Rest and Schedule Edge (0-10 points)
**Status**: WORKING
**Data Source**: `games` table

**What Works**:
- Days rest calculation
- Back-to-back detection
- Rest differential between teams

**What Could Improve**:
- ⚠️ **Travel distance** - Cross-country flights, time zones
- ⚠️ **3-in-4 or 4-in-5 detection** - Extended fatigue situations
- ⚠️ **Home stand vs road trip** - Streaks of home/away games

### 6. ❌ Line Movement and Odds Value (0-10 points)
**Status**: MOCK DATA (always returns 5.0)
**Current Implementation**: Not implemented, uses default score

**Required Data** (tables: `betting_lines`, `betting_odds`):
- Opening line vs current line
- Line movement magnitude and direction
- Reverse line movement detection
- Public betting percentages
- Sharp money indicators

**Required Features**:
- Historical line tracking
- Movement speed analysis
- Market sentiment indicators

**Impact**: Missing **~5-10 points per game** due to neutral scoring

---

## Critical Missing Tables & Data

### 1. `ats_performance` Table
**Priority**: 🔴 CRITICAL
**Impact**: -20 points per game

**Required Schema**:
```sql
CREATE TABLE ats_performance (
    team_id BIGINT REFERENCES teams(team_id),
    season VARCHAR(7),
    games_played INT,
    ats_wins INT,
    ats_losses INT,
    ats_pushes INT,
    ats_cover_pct DECIMAL(4,3),

    -- Splits
    home_ats_cover_pct DECIMAL(4,3),
    away_ats_cover_pct DECIMAL(4,3),
    favorite_ats_cover_pct DECIMAL(4,3),
    underdog_ats_cover_pct DECIMAL(4,3),

    -- Totals
    over_record VARCHAR(10),  -- "15-8-2"
    under_record VARCHAR(10),
    over_pct DECIMAL(4,3),

    last_updated TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (team_id, season)
);
```

**Data Source**: Need to calculate from historical game results + betting lines

### 2. `betting_lines` Table Population
**Priority**: 🔴 CRITICAL
**Impact**: -10 points per game

**Current Status**: Table exists (migration 005) but is **EMPTY** (0 rows)

**Required Data**:
```sql
-- Need to populate:
INSERT INTO betting_lines (
    game_id, bookmaker, line_type,
    opening_value, current_value,
    movement_magnitude, movement_direction
)
```

**Data Source**:
- betting_odds table has 5,796 rows with raw odds
- Need ETL to transform betting_odds → betting_lines
- Track opening vs current values

### 3. `betting_trends` Table Population
**Priority**: 🔴 CRITICAL
**Impact**: -20 points per game

**Current Status**: Table exists but is **EMPTY** (0 rows)

**Required Calculations**:
- ATS performance by team
- Over/Under trends
- Home/away betting splits
- Recent betting performance (last 10 games)

---

## Enhancement Opportunities (Phase 2)

### 🟡 Medium Priority

#### 1. Injury Impact Analysis
**Impact**: +5-10 points accuracy
**Requirements**:
- Injury reports (NBA API or scraping)
- Player impact metrics (VORP, Win Shares)
- Lineup adjustment logic

#### 2. Referee Tendencies
**Impact**: +3-5 points accuracy
**Requirements**:
- Referee assignments per game
- Historical over/under by referee
- Foul rate by referee

#### 3. Public Betting Percentages
**Impact**: +5-7 points contrarian value
**Requirements**:
- Public betting % from sportsbooks
- Contrarian indicator logic
- Sharp vs public money differentiation

#### 4. Historical Head-to-Head
**Impact**: +3-5 points context
**Requirements**:
- Matchup history (last 3 years)
- ATS performance in matchups
- Coaching adjustments

### 🟢 Low Priority (Future Phases)

#### 1. Machine Learning Model
**Impact**: +10-15 points predictive power
**Requirements**:
- Historical betting results database
- Feature engineering pipeline
- ML training infrastructure (scikit-learn, TensorFlow)

#### 2. Real-Time Odds Monitoring
**Impact**: +5-10 points timing advantage
**Requirements**:
- Live odds API integration
- WebSocket for real-time updates
- Alert system for significant movements

#### 3. Backtesting Framework
**Impact**: Validation & refinement
**Requirements**:
- Historical value scores
- Actual bet outcomes
- ROI calculation by tier
- Score weight optimization

#### 4. Weather Conditions
**Impact**: Not applicable (indoor sport)
**Note**: Relevant for future NFL/MLB expansion

---

## Recommended Implementation Priority

### Phase 2A: Critical Data Population (Week 1-2)

**Goal**: Increase scores from 35-45 to 60-80 range

1. **Create ATS Performance Calculator** (Priority: 🔴)
   - Script: `1.DATABASE/etl/analytics/calculate_ats_performance.py`
   - Populate `ats_performance` table
   - Calculate from historical games + betting lines
   - Update: `get_ats_performance()` function

2. **Transform Betting Odds → Betting Lines** (Priority: 🔴)
   - Script: `1.DATABASE/etl/betting/populate_betting_lines.py`
   - Extract opening/current lines from betting_odds
   - Track line movements
   - Populate `betting_lines` table

3. **Calculate Betting Trends** (Priority: 🔴)
   - Script: `1.DATABASE/etl/analytics/calculate_betting_trends.py`
   - Team-level ATS and O/U trends
   - Home/away splits
   - Populate `betting_trends` table

4. **Implement Line Value Scoring** (Priority: 🔴)
   - Update: `analyze_todays_games.py`
   - Add `get_line_value()` function
   - Read from betting_lines table
   - Calculate movement indicators

### Phase 2B: Enhancements (Week 3-4)

**Goal**: Fine-tune accuracy to 70-90 range

5. **Add Injury Impact** (Priority: 🟡)
   - NBA injury API integration
   - Player impact metrics
   - Adjust positional matchup scores

6. **Add Point Differential to Form** (Priority: 🟡)
   - Enhance `get_recent_form()`
   - Not just W-L but margin trends
   - Blowout wins vs close wins

7. **Add Travel Distance** (Priority: 🟡)
   - Venue locations database
   - Calculate flight distance
   - Adjust rest/schedule score

### Phase 3: Advanced Features (Month 2+)

8. **Machine Learning Model**
9. **Real-Time Monitoring**
10. **Backtesting Framework**

---

## Expected Score Improvements

| Phase | Missing Data | Expected Score Range | High Value Games |
|-------|--------------|---------------------|------------------|
| **Current (Phase 1)** | ATS, Lines, Trends | 35-45 | 0-1 per night |
| **Phase 2A** | Injuries, Referees | 60-80 | 2-4 per night |
| **Phase 2B** | Travel, H2H | 70-85 | 3-5 per night |
| **Phase 3** | ML Predictions | 75-90 | 4-6 per night |

---

## Code Improvements Needed

### 1. Update `analyze_todays_games.py`

**Lines 306-309** - Replace mock ATS function:
```python
def get_ats_performance(conn, team_id, season):
    """Get ATS cover percentage from ats_performance table"""
    cur = conn.cursor()
    cur.execute("""
        SELECT
            ats_cover_pct,
            home_ats_cover_pct,
            away_ats_cover_pct
        FROM ats_performance
        WHERE team_id = %s AND season = %s
    """, (team_id, season))
    result = cur.fetchone()
    cur.close()

    if result:
        return float(result['ats_cover_pct'])
    else:
        return 0.50  # Default if no data
```

### 2. Add `get_line_value()` Function

**Location**: After `get_ats_performance()` in `analyze_todays_games.py`

```python
def get_line_value(conn, game_id):
    """Get betting line movement data"""
    cur = conn.cursor()
    cur.execute("""
        SELECT
            opening_value,
            current_value,
            movement_magnitude,
            movement_direction
        FROM betting_lines
        WHERE game_id = %s
          AND line_type = 'spread'
        ORDER BY last_updated DESC
        LIMIT 1
    """, (game_id,))
    result = cur.fetchone()
    cur.close()

    if result:
        return {
            'opening_line': float(result['opening_value']),
            'current_line': float(result['current_value'])
        }
    else:
        return None
```

### 3. Update `analyze_game()` Function

**Line 340** - Add line value parameters:
```python
# After line 337: away_ats_pct = get_ats_performance(...)
line_value = get_line_value(conn, game_id)

# Pass to scoring engine (line 340+):
recommendation = ScoringEngine.calculate_total_value(
    # ... existing params ...
    opening_line=line_value['opening_line'] if line_value else None,
    current_line=line_value['current_line'] if line_value else None
)
```

---

## ETL Scripts to Create

### 1. `calculate_ats_performance.py`
**Purpose**: Populate ats_performance table from historical games

```python
#!/usr/bin/env python3
"""
Calculate ATS performance for all teams
Requires betting_lines table to be populated first
"""

# Algorithm:
# 1. Get all games with final scores
# 2. Join with betting_lines to get spread
# 3. Calculate: did team cover spread?
# 4. Aggregate: wins, losses, pushes, cover %
# 5. Calculate splits: home/away, favorite/underdog
# 6. Insert into ats_performance table
```

### 2. `populate_betting_lines.py`
**Purpose**: Transform betting_odds raw data into structured betting_lines

```python
#!/usr/bin/env python3
"""
Extract opening/current lines from betting_odds
Track line movements over time
"""

# Algorithm:
# 1. Get all betting_odds records grouped by game_id
# 2. Identify opening line (earliest timestamp)
# 3. Identify current line (latest timestamp)
# 4. Calculate movement: current - opening
# 5. Determine direction: moved toward home/away
# 6. Insert into betting_lines table
```

### 3. `calculate_betting_trends.py`
**Purpose**: Calculate team-level betting trends

```python
#!/usr/bin/env python3
"""
Calculate betting trends: ATS records, O/U trends
"""

# Algorithm:
# 1. Use ats_performance data
# 2. Calculate rolling 10-game ATS performance
# 3. Calculate O/U trends from game totals
# 4. Identify streaks (covering/not covering)
# 5. Insert into betting_trends table
```

---

## Success Metrics

### Validation Criteria (After Phase 2A)

**Target Improvements**:
- Average score: 35-45 → **60-70**
- High value games (≥60): 0-1/night → **2-3/night**
- Score variance: Reduce from wide range to consistent tiers

**Backtesting Goals** (Phase 3):
- Exceptional (90+): >70% win rate
- Strong (75-89): >60% win rate
- Good (60-74): >55% win rate
- ROI: >5% across all bets

---

## Summary

### What's Missing (Immediate Impact)

| Missing Item | Impact | Effort | Priority |
|--------------|--------|--------|----------|
| ATS Performance Data | -20 pts | 2-3 days | 🔴 Critical |
| Betting Lines Population | -10 pts | 1-2 days | 🔴 Critical |
| Line Movement Tracking | -10 pts | 1-2 days | 🔴 Critical |
| Betting Trends Calculation | -20 pts | 2-3 days | 🔴 Critical |
| Injury Data Integration | -5 pts | 3-5 days | 🟡 Medium |
| Travel Distance | -3 pts | 1-2 days | 🟡 Medium |

**Total Immediate Potential Gain**: +60 points (from 35-45 to 60-80 range)

### Next Steps

1. **Week 1**: Create ATS performance calculator
2. **Week 1**: Transform betting_odds → betting_lines
3. **Week 2**: Implement line value scoring
4. **Week 2**: Add betting trends calculation
5. **Week 3**: Test and validate with live games
6. **Week 4**: Add enhancements (injuries, travel)

---

**Generated**: 2025-11-20
**Agent Status**: Phase 1 Complete, Phase 2A Ready to Begin
