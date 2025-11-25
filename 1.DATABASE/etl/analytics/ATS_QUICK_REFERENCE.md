# ATS Performance Calculator - Quick Reference

## What is ATS?

**Against The Spread (ATS)** = Did the team beat the betting market's expectation?

## Formula

```
Adjusted Margin = Actual Margin + Spread
```

- **> 0**: Team COVERED (won against the spread)
- **< 0**: Team LOST (didn't cover)
- **= 0**: PUSH (tie, bet refunded)

## Spread Convention

| Spread | Meaning | Must Do To Cover |
|--------|---------|------------------|
| -7.5 | Favorite by 7.5 | Win by 8+ points |
| +7.5 | Underdog by 7.5 | Lose by 7 or less, OR win |
| 0.0 | Pick'em (even) | Win the game |

## Quick Examples

```
Lakers -5.5 vs Celtics
Lakers win 110-103 (margin: +7)
7 + (-5.5) = 1.5 > 0 → COVERED ✅

Celtics +5.5 vs Lakers
Celtics lose 103-110 (margin: -7)
-7 + 5.5 = -1.5 < 0 → LOST ❌
```

## Usage

```bash
# Basic
python3 calculate_ats_performance.py

# Specific season
python3 calculate_ats_performance.py --season 2024-25

# Detailed output
python3 calculate_ats_performance.py --verbose

# Top teams only
python3 calculate_ats_performance.py --top 10
```

## Prerequisites

1. **Games data**: Completed games with scores
2. **Betting lines**: Spread and total in `betting_lines` table
3. **Database config**: `.env` in `1.DATABASE/config/`

## Output Statistics

- **Overall ATS**: W-L-P record and cover %
- **Home ATS**: Performance at home
- **Away ATS**: Performance on road
- **Favorite ATS**: When favored (spread < 0)
- **Underdog ATS**: When underdog (spread > 0)
- **Over/Under**: Games over/under total

## Files

```
calculate_ats_performance.py    # Main production script
test_ats_calculation.py         # Test suite
sample_betting_lines_insert.sql # Example data
ATS_QUICK_REFERENCE.md          # This file
```

## Database Tables

**Input**:
- `games` (game results)
- `betting_lines` (spreads and totals)

**Output**:
- `ats_performance` (aggregated stats)

## Key Points

1. Negative spread = home team favored
2. Positive spread = home team underdog
3. Half-point spreads (.5) prevent pushes
4. Pushes excluded from cover percentage
5. Script handles missing lines gracefully
6. Idempotent (can rerun safely)

## Testing

```bash
# Run test suite (8 scenarios)
python3 test_ats_calculation.py

# All tests pass ✅
```

## Common Questions

**Q: Why does an underdog team have a "loss" if they won the game?**
A: ATS is separate from game result. If underdog by +10 and win by 2, they covered. But if favored by -5 and win by 3, they lost ATS (didn't cover).

**Q: What's a "push"?**
A: When margin exactly equals spread (e.g., -3 spread, win by 3). Bet is refunded. Rare with half-point lines.

**Q: Why are Over/Under counts so high?**
A: Each team in a game counts toward O/U, so 100 games = 200 O/U records.

**Q: Can I run this on historical seasons?**
A: Yes! Use `--season 2023-24` (requires betting lines for that season).

## Contact

For issues or questions, see full documentation:
`/Users/chapirou/dev/perso/stat-discute.be/claudedocs/ats_calculation_implementation.md`
