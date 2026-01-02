# NBA Totals Betting Framework

## Quick Reference Guide for Profitable Betting

**Based on**: 11 seasons of data (11,452+ games), 2022-23 backtest validation
**Model**: Unified Totals Model v1.0
**Last Updated**: December 2024

---

## TL;DR - The Only Profitable Spot

| Spot | Signal | Win Rate | ROI | Frequency |
|------|--------|----------|-----|-----------|
| **Away B2B + Both Slow** | UNDER | 53.8% | +2.8% | ~13/season |

**Everything else breaks even or loses money at -110 odds.**

---

## Daily Pre-Game Checklist

### Step 1: Check Back-to-Back Status
```
For each game, identify:
□ Home team played yesterday? → Note but DON'T adjust (losing signal)
□ Away team played yesterday? → Flag for UNDER consideration (-2.7 pts)
□ Both teams played yesterday? → Strong UNDER flag (-3.4 pts)
```

### Step 2: Check Pace Matchup
```
Look up each team's pace tier:
□ Both Fast (avg total >235)? → Games trend OVER (+3 pts)
□ Both Slow (avg total <225)? → Games trend UNDER (-3 pts)
□ Mixed pace? → No adjustment
```

### Step 3: Check for Golden Spot
```
GOLDEN SPOT = Away B2B + Both Slow Teams
✓ Away team is on B2B
✓ Home team is rested (1+ day rest)
✓ Both teams in bottom third of pace rankings
✓ → BET UNDER (53.8% win rate, +2.8% ROI)
```

### Step 4: Check Scoring Extremes (Optional)
```
□ Either team coming off new season HIGH? → +1.5 pts momentum
□ Either team coming off new season LOW? → -1.5 pts (slump persists)
□ Season LOW was 10+ below previous low? → -4.0 pts (crash continues)
```

### Step 5: Calculate Edge
```
Base Expected = Team A PPG + Team B PPG
Enhanced Expected = Base + Σ(Adjustments)
Edge = Enhanced Expected - Closing Line

ONLY bet if:
• Edge is 4-6 points (sweet spot)
• OR Golden Spot conditions met
```

---

## Factor Reference Card

### Validated Adjustments (USE THESE)

| Factor | Adjustment | Direction | Confidence |
|--------|------------|-----------|------------|
| Away B2B (home rested) | -2.7 pts | UNDER | HIGH |
| Both B2B | -3.4 pts | UNDER | HIGH |
| Both Fast Pace | +3.0 pts | OVER | HIGH |
| Both Slow Pace | -3.0 pts | UNDER | HIGH |
| Early Season (first 3 wks) | -2.0 pts | UNDER | MEDIUM |
| After Season Low Crash | -4.0 pts | UNDER | HIGH |
| After Season Low | -1.5 pts | UNDER | MEDIUM |
| After Season High (momentum) | +1.5 pts | OVER | MEDIUM |

### Factors to IGNORE (REMOVED FROM MODEL)

| Factor | Why Removed |
|--------|-------------|
| Home team B2B | 38.7% win rate, -26.1% ROI |
| Denver altitude | Inconsistent year-to-year |
| Division games | Effect too small (<1 pt) |
| Edges >6 pts | Model unreliable at extremes |

---

## Betting Decision Tree

```
START
  │
  ▼
Is Away team on B2B AND both teams slow pace?
  │
  ├─YES─→ 🔥 STRONG UNDER (Golden Spot) ─→ BET
  │
  └─NO──→ Calculate Enhanced Expected
           │
           ▼
        Do you have closing line?
           │
           ├─YES─→ Calculate Edge (Enhanced - Line)
           │        │
           │        ▼
           │     Is |Edge| between 4-6 pts?
           │        │
           │        ├─YES─→ Edge > 0? → BET OVER
           │        │       Edge < 0? → BET UNDER
           │        │
           │        └─NO──→ Edge > 6 pts? → NO BET (model unreliable)
           │                Edge < 4 pts? → NO BET (insufficient edge)
           │
           └─NO──→ Is total adjustment > 3 pts?
                    │
                    ├─YES─→ Adjustment positive? → LEAN OVER
                    │       Adjustment negative? → LEAN UNDER
                    │
                    └─NO──→ NO BET
```

---

## Expected ROI by Spot

### Profitable (Green Light)
| Spot | Expected ROI | Confidence | Frequency |
|------|-------------|------------|-----------|
| Away B2B + Both Slow | +2.8% | HIGH | ~13/season |

### Break-Even (Yellow Light)
| Spot | Expected ROI | Confidence | Frequency |
|------|-------------|------------|-----------|
| Both Slow alone | -2.7% | MEDIUM | ~53/season |
| No adjustments | -5.8% | LOW | ~219/season |
| Edge 4-5 pts | -1.0% | MEDIUM | Variable |

### Losers (Red Light - AVOID)
| Spot | Expected ROI | Confidence | Note |
|------|-------------|------------|------|
| Home B2B alone | -26.1% | VERY HIGH | Market overreacts |
| Both B2B alone | -31.8% | VERY HIGH | Market prices this |
| Away B2B alone | -13.9% | HIGH | Need slow pace too |
| Early Season alone | -18.1% | HIGH | Market prices this |
| Edge >6 pts | -28.9%+ | VERY HIGH | Model fails |

---

## Traps to Avoid

### 1. The Regression Trap
**Myth**: "Team scored 140 last night, they'll regress"
**Reality**: Hot teams score +2.7 pts ABOVE average next game
**Action**: DON'T bet UNDER just because a team scored high

### 2. The Bounce-Back Trap
**Myth**: "Team scored 85 last night, they'll bounce back"
**Reality**: Cold teams score -1.5 pts BELOW average next game
**Action**: DON'T bet OVER expecting immediate recovery

### 3. The Home B2B Trap
**Myth**: "Home team is tired from B2B, scoring will be lower"
**Reality**: Home comfort offsets fatigue; this is a LOSING signal
**Action**: IGNORE home B2B status entirely

### 4. The Big Edge Trap
**Myth**: "Model shows +8 pts edge, this is a slam dunk"
**Reality**: Large edges have 36% win rate, -31% ROI
**Action**: ONLY bet edges in 4-6 pt sweet spot

### 5. The Both B2B Trap
**Myth**: "Both teams tired = easy under"
**Reality**: Market already prices this aggressively (35.7% win rate)
**Action**: ONLY bet if also both slow pace teams

---

## Season Timeline Patterns

### October-November (First 3 Weeks)
- Games trend UNDER (-3.0 pts vs season avg)
- Higher variance (teams still gelling)
- Market often slow to adjust
- **Strategy**: Light UNDER lean, reduce bet sizes

### December-January
- Games normalize to seasonal averages
- Patterns become more predictable
- **Strategy**: Standard model application

### February (Pre-All-Star Break)
- Games trend OVER (+1.9 pts vs season avg)
- Teams in rhythm, playoff races heating up
- **Strategy**: Light OVER lean on matchups

### March-April
- Slight OVER tendency (+0.6 pts)
- Playoff implications vary game-to-game
- **Strategy**: Check playoff/lottery implications

---

## Bankroll Management

### Unit Sizing by Confidence

| Confidence Level | Unit Size | Spots |
|------------------|-----------|-------|
| Golden Spot | 2-3 units | Away B2B + Both Slow |
| High | 1-2 units | Single high-confidence factor |
| Medium | 0.5-1 unit | 4-6 pt edge in sweet spot |
| Low/Lean | 0 units | Don't bet, just track |

### Expected Volume & Results

| Metric | Per Season | Per Month |
|--------|-----------|-----------|
| Golden Spots | ~13 games | ~1-2 games |
| Sweet Spot Edges | ~50 games | ~6 games |
| Total Bets | ~65 games | ~8 games |
| Expected Win Rate | 51-54% | Variable |
| Expected ROI | +1% to +3% | Variable |

### Stop-Loss Guidelines
- 10-game losing streak: Pause, review methodology
- -15% monthly drawdown: Reduce to minimum units
- Model significantly wrong (>8 pts avg error): Stop, investigate

---

## Running the Model

### Quick Python Usage

```python
from unified_totals_model import UnifiedTotalsModel

model = UnifiedTotalsModel()

# Analyze by game ID
analysis = model.analyze_game(game_id='0022400123')
model.print_analysis(analysis)

# Analyze with closing line
analysis = model.analyze_game(
    game_id='0022400123',
    closing_line=224.5
)
model.print_analysis(analysis)
```

### Output Example
```
GAME ANALYSIS: BOS @ MIA
Date: 2024-12-18

📊 BASE CALCULATION:
   MIA PPG: 108.5
   BOS PPG: 117.2
   Base Expected: 225.7

🔧 SITUATIONAL ADJUSTMENTS:
   🟢 away_b2b: -2.7 pts
      └─ Away team on back-to-back, home rested
   🟢 both_slow: -3.0 pts
      └─ Both teams play slow pace

📈 ENHANCED PREDICTION:
   Total Adjustment: -5.7 pts
   Enhanced Expected: 220.0

💰 VS CLOSING LINE:
   Closing Line: 224.5
   Edge: -4.5 pts

🎯 RECOMMENDATION:
   Signal: 🔥 STRONG UNDER
   Confidence: HIGH
   Reasoning: GOLDEN SPOT: Away B2B + Both Slow Pace = +2.8% ROI
```

---

## Model Files Reference

| File | Purpose | Location |
|------|---------|----------|
| `unified_totals_model.py` | Main prediction model | `1.DATABASE/etl/analytics/` |
| `NBA_TOTALS_COMPREHENSIVE_ANALYSIS_REPORT.md` | Full methodology | `claudedocs/` |
| `SCORING_EXTREMES_ANALYSIS.md` | Regression study | `claudedocs/` |
| `analyze_situational_spots.py` | Factor analysis | `1.DATABASE/etl/analytics/` |
| `backtest_enhanced_model.py` | Backtest validation | `1.DATABASE/etl/analytics/` |

---

## Key Statistics Summary

### Market Efficiency
- Break-even at -110 odds: 52.4%
- Pinnacle closing line accuracy: ~54%
- Average model error: 10-12 pts

### Factor Impact (Validated)
| Factor | Avg Impact | Sample Size |
|--------|-----------|-------------|
| Pace Tier Matchup | 25 pts spread | 11,452 games |
| Away B2B | -2.7 pts | 2,039 games |
| Both B2B | -3.4 pts | 594 games |
| Early Season | -3.0 pts | 1,424 games |
| After Season Low Crash | -5.29 pts | 40 games |

### Behavioral Insights
- Hot teams stay hot: +2.7 pts above avg after season high
- Cold teams stay cold: -1.5 pts below avg after season low
- Location dominates: Home/away transition > extreme effects
- Partial regression: Takes 3-5 games, not immediate

---

## Disclaimer

This framework is for educational and research purposes. Key points:

1. **Past performance ≠ future results**: Patterns can break down
2. **Market evolves**: Edges can disappear as market learns
3. **Sample sizes matter**: Golden spot only has ~13 games/season
4. **Bet responsibly**: Only bet what you can afford to lose
5. **Shop for best lines**: Thin edges require best available odds

**The NBA totals market is highly efficient. Even with this framework, expect modest returns at best. The primary value is in understanding market dynamics, not guaranteed profits.**

---

*Framework developed by Stat-Discute.be Research Division*
*Based on 11 seasons of NBA data (2014-2025)*
