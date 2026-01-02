# Totals Betting Analysis Method

## Overview

This document describes the systematic approach for analyzing NBA totals betting markets:
- **Game Totals**: Combined score of both teams (Over/Under)
- **Team Totals**: Individual team scoring lines

## Data Sources

### Required Tables
```sql
team_game_stats    -- Team box scores (points, pace, ratings)
games              -- Schedule, scores, season filtering
teams              -- Team identifiers and abbreviations
betting_events     -- Event metadata and raw odds data
betting_markets    -- Parsed market types and lines
betting_odds       -- Current odds with decimal/american formats
```

### Key Metrics
| Metric | Source | Description |
|--------|--------|-------------|
| PPG | team_game_stats.points | Points per game average |
| ORtg | team_game_stats.offensive_rating | Points per 100 possessions (offense) |
| DRtg | team_game_stats.defensive_rating | Points per 100 possessions (defense) |
| Pace | team_game_stats.pace | Possessions per 48 minutes |

---

## Five-Method Expected Total Framework

### Method 1: Season PPG Average
**Formula**: `Team_A_PPG + Team_B_PPG`

```sql
SELECT
    t.abbreviation,
    ROUND(AVG(tgs.points)::numeric, 1) as ppg
FROM team_game_stats tgs
JOIN games g ON tgs.game_id = g.game_id
JOIN teams t ON tgs.team_id = t.team_id
WHERE g.season = '2025-26'
AND g.home_team_score IS NOT NULL
GROUP BY t.abbreviation;
```

**Use Case**: Baseline expectation, large sample size

---

### Method 2: Location-Adjusted PPG
**Formula**: `Home_Team_Home_PPG + Away_Team_Away_PPG`

```sql
SELECT
    t.abbreviation,
    CASE
        WHEN tgs.team_id = g.home_team_id THEN 'Home'
        ELSE 'Away'
    END as location,
    ROUND(AVG(tgs.points)::numeric, 1) as ppg
FROM team_game_stats tgs
JOIN games g ON tgs.game_id = g.game_id
JOIN teams t ON tgs.team_id = t.team_id
WHERE g.season = '2025-26'
AND g.home_team_score IS NOT NULL
GROUP BY t.abbreviation,
         CASE WHEN tgs.team_id = g.home_team_id THEN 'Home' ELSE 'Away' END;
```

**Use Case**: Accounts for home/away scoring differentials (typically 3-5 pts)

---

### Method 3: Location + Opponent Defense
**Formula**: Adjust team scoring based on opponent's DRtg relative to league average

```
Expected_Score = Location_PPG * (Opponent_DRtg / League_Avg_DRtg)
```

**Logic**:
- DRtg > 115 = Poor defense → boost expected scoring
- DRtg < 110 = Good defense → reduce expected scoring
- League average DRtg ≈ 114

**Use Case**: Matchup-specific adjustment

---

### Method 4: Recent Form (Last 5 Games)
**Formula**: `Team_A_Last5_PPG + Team_B_Last5_PPG`

```sql
WITH recent_games AS (
    SELECT
        t.abbreviation,
        tgs.points,
        ROW_NUMBER() OVER (
            PARTITION BY t.abbreviation
            ORDER BY g.game_date DESC
        ) as rn
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    JOIN teams t ON tgs.team_id = t.team_id
    WHERE g.season = '2025-26'
    AND g.home_team_score IS NOT NULL
)
SELECT abbreviation,
       ROUND(AVG(points)::numeric, 1) as last_5_ppg
FROM recent_games
WHERE rn <= 5
GROUP BY abbreviation;
```

**Use Case**: Captures momentum, injuries, lineup changes

---

### Method 5: ORtg/DRtg Matchup
**Formula**: Project scoring using efficiency ratings

```
Team_A_Expected = (Team_A_ORtg + Team_B_DRtg) / 2 * (Pace / 100)
Team_B_Expected = (Team_B_ORtg + Team_A_DRtg) / 2 * (Pace / 100)
Game_Total = Team_A_Expected + Team_B_Expected
```

**Use Case**: Most sophisticated, accounts for pace and efficiency

---

## Edge Calculation

### Formula
```
Edge = Expected_Total - Betting_Line
```

### Signal Interpretation
| Edge | Signal | Confidence |
|------|--------|------------|
| > +5 pts | Strong OVER | High |
| +2 to +5 | Moderate OVER | Medium |
| -2 to +2 | No edge (PUSH) | Low |
| -2 to -5 | Moderate UNDER | Medium |
| < -5 pts | Strong UNDER | High |

### Consensus Scoring
When all 5 methods agree on direction → **High confidence**
When 4/5 methods agree → **Medium-high confidence**
When 3/5 methods agree → **Medium confidence**
When methods split → **No play**

---

## Team Totals Analysis

Apply the same 5 methods to individual team lines:

### Example: Team A (Home) - Line 115.5

| Method | Calculation | Expected |
|--------|-------------|----------|
| Season PPG | Team_A overall PPG | 112.0 |
| Home PPG | Team_A home-only PPG | 116.5 |
| vs Defense | Team_A vs Team_B DRtg | 114.0 |
| Last 5 | Team_A recent form | 118.0 |
| ORtg adjusted | Team_A ORtg vs Team_B DRtg | 115.0 |

**Average Expected**: 115.1 → Edge: -0.4 → **PUSH**

---

## Betting Lines Query

### Get All Totals for a Game
```sql
SELECT
    bm.market_key,
    bm.market_name,
    bo.selection,
    bo.handicap as line,
    bo.odds_decimal
FROM betting_events be
JOIN betting_markets bm ON be.event_id = bm.event_id
JOIN betting_odds bo ON bm.market_id = bo.market_id
WHERE be.event_id = '[EVENT_ID]'
AND (bm.market_key LIKE '0_game_total%'
  OR bm.market_key LIKE '0_team_total%')
ORDER BY bm.market_key;
```

### Market Key Patterns
| Pattern | Description |
|---------|-------------|
| `0_game_total_XXX` | Full game O/U |
| `0_team_total_home_XXX` | Home team total |
| `0_team_total_away_XXX` | Away team total |
| `1_game_total_XXX` | 1st half game total |
| `3_game_total_XXX` | 1st half total (alt) |
| `4_game_total_XXX` | 1st quarter total |

---

## Complete Analysis Workflow

### Step 1: Identify Game
```sql
SELECT event_id, event_start_time,
       raw_data->>'participants' as teams
FROM betting_events
WHERE event_start_time >= NOW()
ORDER BY event_start_time;
```

### Step 2: Get Betting Lines
Query `betting_markets` + `betting_odds` for game total and team totals.

### Step 3: Calculate Expected Totals
Run all 5 methods for both teams.

### Step 4: Calculate Edge
```
Game Total Edge = AVG(Method1..5) - Game_Line
Team_A Edge = AVG(Team_A_Methods) - Team_A_Line
Team_B Edge = AVG(Team_B_Methods) - Team_B_Line
```

### Step 5: Generate Preliminary Report
| Bet | Line | Expected | Edge | Signal |
|-----|------|----------|------|--------|
| Game Total | 225.0 | 232 | +7 | OVER |
| Team A | 112.5 | 115 | +2.5 | Slight OVER |
| Team B | 112.5 | 117 | +4.5 | OVER |

### Step 6: Hit Rate Validation
Validate edge signals against historical performance at the specific line.

#### Team Total Hit Rate Query
```sql
SELECT
    COUNT(*) as total_games,
    SUM(CASE WHEN tgs.points < [LINE] THEN 1 ELSE 0 END) as under_hits,
    SUM(CASE WHEN tgs.points > [LINE] THEN 1 ELSE 0 END) as over_hits,
    ROUND(100.0 * SUM(CASE WHEN tgs.points < [LINE] THEN 1 ELSE 0 END) / COUNT(*)::numeric, 1) as under_pct,
    ROUND(100.0 * SUM(CASE WHEN tgs.points > [LINE] THEN 1 ELSE 0 END) / COUNT(*)::numeric, 1) as over_pct,
    ROUND(AVG(tgs.points)::numeric, 1) as avg_points
FROM team_game_stats tgs
JOIN games g ON tgs.game_id = g.game_id
JOIN teams t ON tgs.team_id = t.team_id
WHERE g.season = '2025-26'
AND g.home_team_score IS NOT NULL
AND t.abbreviation = '[TEAM]';
```

#### Game Total Hit Rate Query
```sql
WITH game_totals AS (
    SELECT
        g.game_id,
        g.home_team_score + g.away_team_score as total
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE g.season = '2025-26'
    AND g.home_team_score IS NOT NULL
    AND (ht.abbreviation IN ('[TEAM_A]', '[TEAM_B]')
      OR at.abbreviation IN ('[TEAM_A]', '[TEAM_B]'))
)
SELECT
    COUNT(*) as total_games,
    SUM(CASE WHEN total > [LINE] THEN 1 ELSE 0 END) as over_hits,
    SUM(CASE WHEN total < [LINE] THEN 1 ELSE 0 END) as under_hits,
    ROUND(100.0 * SUM(CASE WHEN total > [LINE] THEN 1 ELSE 0 END) / COUNT(*)::numeric, 1) as over_pct,
    ROUND(100.0 * SUM(CASE WHEN total < [LINE] THEN 1 ELSE 0 END) / COUNT(*)::numeric, 1) as under_pct,
    ROUND(AVG(total)::numeric, 1) as avg_total
FROM game_totals;
```

#### Confidence Alignment Matrix
| Edge Signal | Hit Rate | Final Confidence | Action |
|-------------|----------|------------------|--------|
| Strong (>5 pts) | >65% | **HIGH** | Strong play |
| Strong (>5 pts) | 55-65% | **MEDIUM** | Cautious play |
| Strong (>5 pts) | <55% | **LOW** | Avoid - conflicting signals |
| Moderate (2-5 pts) | >65% | **MEDIUM-HIGH** | Good value |
| Moderate (2-5 pts) | 55-65% | **MEDIUM** | Standard play |
| Moderate (2-5 pts) | <55% | **LOW** | Skip |
| Weak (<2 pts) | Any | **NO PLAY** | Insufficient edge |

#### Example Validation
**LAL Team Total - Line 125.5 - Edge: -9.0 (Strong UNDER)**

| Metric | Value |
|--------|-------|
| Games Played | 22 |
| Under Hits | 18 |
| Over Hits | 4 |
| Under % | **81.8%** |
| Avg Points | 115.0 |

**Result**: Edge (-9.0 UNDER) + Hit Rate (81.8% under) = **HIGH CONFIDENCE**

#### Refined Signal Classification
After hit rate validation, reclassify plays:

| Play | Edge | Hit Rate | Alignment | Final Signal |
|------|------|----------|-----------|--------------|
| LAL U125.5 | -9.0 | 81.8% U | Strong | **TOP PLAY** |
| MIL O110.5 | +8.0 | 72.7% O | Strong | **TOP PLAY** |
| DEN/ORL O220 | +8.5 | 48.0% O | Weak | **AVOID** |
| POR/SAC U233 | -8.0 | 48.0% U | Weak | **AVOID** |

**Key Insight**: A large edge with weak historical hit rate indicates the line may already account for team tendencies. Only plays with **Edge + Hit Rate alignment** should be considered.

---

## Additional Factors (Not Quantified)

- **Back-to-back games**: Reduce expected by 3-5 pts
- **Injuries to key scorers**: Adjust team total accordingly
- **Pace mismatches**: High-pace vs low-pace → use lower pace
- **Rest advantage**: 3+ days rest → slight boost
- **Altitude (DEN home)**: Slight over tendency

---

## Example Output

### CHA vs ATL - December 18, 2024

**Lines**: Game 239.0 | CHA 116.5 | ATL 121.5

| Method | CHA | ATL | Game Total |
|--------|-----|-----|------------|
| Season PPG | 113.0 | 118.3 | 231.3 |
| Location | 110.6 | 121.1 | 231.7 |
| vs Defense | 112 | 120 | 232 |
| Last 5 | 110.6 | 121.1 | 231.7 |
| ORtg/DRtg | 112 | 119 | 231 |
| **Average** | **111.6** | **119.9** | **231.5** |

**Edges**:
- Game Total: 231.5 - 239.0 = **-7.5 UNDER**
- CHA: 111.6 - 116.5 = **-4.9 UNDER**
- ATL: 119.9 - 121.5 = **-1.6 PUSH/UNDER**

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-18 | 1.0 | Initial documentation |
| 2024-12-18 | 1.1 | Added Step 6: Hit Rate Validation with SQL queries and confidence alignment matrix |
