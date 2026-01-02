# Totals Analytics Quick Start Guide

**Last Updated**: 2025-12-18

---

## Quick Usage

### Generate Projections
```bash
# All upcoming games (next 7 days)
python3 analytics/calculate_totals_projections.py

# Specific date
python3 analytics/calculate_totals_projections.py 2025-12-20

# With JSON output
python3 analytics/calculate_totals_projections.py 2025-12-20 --json
```

### Identify Value Bets
```bash
# Next 3 days
python3 analytics/identify_value_bets.py

# Specific date
python3 analytics/identify_value_bets.py 2025-12-20

# Output: Console summary + JSON file in data/
```

### Situational Trends
```bash
# Current season
python3 analytics/generate_situational_trends.py

# Specific season
python3 analytics/generate_situational_trends.py 2024-25

# Output: Console report + JSON file in data/
```

### Full Pipeline
```bash
# Run all analytics
python3 daily_totals_pipeline.py

# Recommended: Run daily at 10 AM via cron
# Add to crontab: crontab -e
0 10 * * * cd /path/to/etl && python3 daily_totals_pipeline.py >> logs/totals_$(date +\%Y\%m\%d).log 2>&1
```

---

## File Locations

```
1.DATABASE/etl/
├── analytics/
│   ├── calculate_totals_projections.py    # Projections engine
│   ├── identify_value_bets.py             # Value finder
│   └── generate_situational_trends.py     # Trend analyzer
├── daily_totals_pipeline.py               # Orchestrator
├── test_totals_scripts.py                 # Validation tests
└── TOTALS_ANALYTICS_QUICKSTART.md         # This file

1.DATABASE/data/                            # JSON outputs
1.DATABASE/logs/                            # Pipeline logs
```

---

## Output Files

### Projections JSON
```json
{
  "game_id": "0022500456",
  "matchup": "LAL @ BOS",
  "projected_total": 229.3,
  "confidence": 0.72,
  "adjustments": { /* breakdown */ }
}
```

### Value Bets JSON
```json
{
  "game_id": "0022500456",
  "matchup": "LAL @ BOS",
  "line": 225.5,
  "projection": 229.3,
  "edge": 3.8,
  "direction": "OVER",
  "reasoning": "..."
}
```

### Situational Trends JSON
```json
{
  "situation": "both_b2b",
  "over_pct": 0.365,
  "under_pct": 0.635,
  "is_profitable": true
}
```

---

## Configuration

### Environment Variables (.env)
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nba_stats
DB_USER=postgres
DB_PASSWORD=
```

### Thresholds (in scripts)
```python
EDGE_THRESHOLD = 3.0        # Minimum edge for value
CONFIDENCE_THRESHOLD = 0.65 # Minimum confidence
MIN_SAMPLE_SIZE = 20        # Min games for trends
LEAGUE_AVG_PACE = 99.5      # 2024-25 season
```

---

## Troubleshooting

### "No database connection"
- Check .env file exists in `1.DATABASE/config/`
- Verify PostgreSQL is running: `psql nba_stats`
- Test connection: `python3 test_totals_scripts.py`

### "No upcoming games found"
- Verify games in database: `SELECT * FROM games WHERE game_date >= CURRENT_DATE`
- Check game_status is 'Scheduled' or 'Pre-Game'

### "No betting lines available"
- Check `betting_odds` table has data
- Verify `betting_events` maps game_id correctly
- Run `betting/fetch_pinnacle_odds.py` first

### "Insufficient data for projections"
- Need at least 5 completed games per team
- Check `team_game_stats` has recent data
- Run `analytics/calculate_team_stats.py`

---

## Testing

### Run Validation Tests
```bash
python3 test_totals_scripts.py

# Expected: 3/3 tests pass
# ✅ Imports
# ✅ Constants
# ✅ Database
```

### Manual Verification
```bash
# 1. Check projection range
python3 analytics/calculate_totals_projections.py 2025-12-20 --json | jq '.[] | .projected_total'
# Expected: Values between 190-260

# 2. Check value bet count
python3 analytics/identify_value_bets.py | grep "VALUE FOUND" | wc -l
# Expected: 2-5 per day

# 3. Check trend sample sizes
python3 analytics/generate_situational_trends.py | grep "total_games"
# Expected: Most > 20 games
```

---

## Key Metrics

### Projection Quality
- **Target MAE**: < 8 points vs actual totals
- **Confidence Range**: 0.5 - 1.0
- **Adjustment Range**: -5 to +5 points

### Value Identification
- **Daily Count**: 2-5 value bets
- **Edge Range**: 3-8 points typical
- **Expected ROI**: > 5% over 100 bets

### Situational Trends
- **Profitable Threshold**: >55% or <45% hit rate
- **Min Sample**: 20 games
- **Most Profitable**: Both B2B (UNDER), High Pace (OVER)

---

## Support

### Documentation
- Full implementation: `claudedocs/totals_analytics_implementation_summary.md`
- Original plan: `3.ACTIVE_PLANS/totals_betting_analytics.md`
- Status: `3.ACTIVE_PLANS/totals_betting_analytics_IMPLEMENTATION_COMPLETE.md`

### Common Issues
- Database schema: Apply `migrations/010_totals_analytics.sql`
- Period scores: Run `fetch_period_scores.py` (if exists)
- Team stats: Run `analytics/calculate_team_stats.py`
- Betting data: Run `betting/fetch_pinnacle_odds.py`

---

**Quick Start**: `python3 daily_totals_pipeline.py`
**Questions**: See full documentation in `claudedocs/`
