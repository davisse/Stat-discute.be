# Pinnacle NBA Odds Scraper

This module fetches NBA betting odds from ps3838.com (Pinnacle Sports) and stores them in the PostgreSQL database for analysis and tracking.

## ⚠️ IMPORTANT DISCLAIMER

**This scraper is for educational and research purposes only.**

- Scraping may violate Pinnacle's Terms of Service
- Real-time odds require user authentication (guest users get delayed odds)
- Anti-bot protection is active on the site
- Consider using The Odds API ($50-100/month) as a legal alternative

## 📁 Files

- `fetch_pinnacle_odds.py` - Main scraper script that fetches and stores odds (enhanced with closing line tracking)
- `capture_closing_lines.py` - **NEW** Dedicated closing line capture script (Phase 4 - 2025-12-18)
- `parsers.py` - JSON parser for Pinnacle's compressed data format (~120 markets per game)
- `pinnacle_config.py` - Configuration settings, API endpoints, and team mappings
- `utils.py` - Helper functions for odds conversion, validation, and formatting
- `test_parsers.py` - Test suite for the parser
- `setup_cron.sh` - Shell script to set up automated scraping via cron
- `requirements.txt` - Python dependencies
- `.env.example` - Example environment variables file

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip3 install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Test Dry Run

```bash
# Test without writing to database
python3 fetch_pinnacle_odds.py --dry-run
```

### 4. Run Full Scraper

```bash
# Test without database writes
python3 fetch_pinnacle_odds.py --dry-run

# Fetch and store odds in database (production mode)
python3 fetch_pinnacle_odds.py

# Fetch ALL games (not just today's)
python3 fetch_pinnacle_odds.py --full-run
```

### 5. Capture Closing Lines (NEW - Phase 4)

```bash
# Capture closing lines for games starting within 2 hours
python3 capture_closing_lines.py

# Test in dry-run mode
python3 capture_closing_lines.py --dry-run

# Custom time window (e.g., 1.5 hours)
python3 capture_closing_lines.py --hours-window 1.5
```

### 6. Set Up Automation (Optional)

```bash
# Set up cron job to run every 15 minutes
./setup_cron.sh

# Add closing line capture (every 30 minutes during game hours)
# Add to crontab: crontab -e
*/30 16-23 * * * cd /path/to/etl/betting && python3 capture_closing_lines.py >> /var/log/closing_lines.log 2>&1
```

## 📊 Data Structure

### Markets Extracted (per game)
- **Moneylines** (4 markets) - Full game, 1st half, quarters
- **Spreads/Handicaps** (30+ markets) - Main and alternative lines
- **Totals** (30+ markets) - Over/under for different point totals
- **Player Props** (50+ markets) - Points, rebounds, assists, etc.
- **Special Markets** (varies) - Team totals, race to X points, etc.

Total: ~120-130 markets per NBA game

### Database Tables Used

1. **betting_events** - Stores Pinnacle event ID linked to our game_id
2. **betting_markets** - Market types (moneyline, spread, total, props)
3. **betting_odds** - Individual odds with timestamps for tracking movement
4. **game_closing_lines** - **NEW** Closing line snapshots before game start (Phase 4)
5. **game_ou_results** - **NEW** Actual O/U results vs betting lines (Phase 3 - pending)

## 🔧 Configuration

Key settings in `pinnacle_config.py`:

```python
RATE_LIMIT_SECONDS = 3      # Minimum seconds between requests
MAX_RETRIES = 3              # Retry failed requests
REQUEST_TIMEOUT = 10         # Request timeout in seconds
SCRAPE_INTERVAL_MINUTES = 15 # How often cron runs
```

## 📈 Odds Movement Tracking

The scraper stores a new row for each odds update, creating a complete history:

### Query Examples

```sql
-- 1. Get current lines for a game
SELECT
  bm.market_name,
  bo.selection,
  bo.handicap,
  bo.odds_decimal,
  bo.odds_american
FROM betting_odds bo
JOIN betting_markets bm ON bo.market_id = bm.market_id
JOIN betting_events be ON bm.event_id = be.event_id
WHERE be.game_id = '0022400123'
  AND bo.last_updated = (
    SELECT MAX(last_updated)
    FROM betting_odds
    WHERE market_id = bo.market_id
  );

-- 2. Track line movement for spreads
WITH line_movement AS (
  SELECT
    bm.market_name,
    bo.selection,
    bo.handicap,
    bo.odds_decimal,
    bo.last_updated,
    ROW_NUMBER() OVER (PARTITION BY bm.market_id ORDER BY bo.last_updated ASC) as rn_first,
    ROW_NUMBER() OVER (PARTITION BY bm.market_id ORDER BY bo.last_updated DESC) as rn_last
  FROM betting_odds bo
  JOIN betting_markets bm ON bo.market_id = bm.market_id
  WHERE bm.market_key LIKE 'spread_0%'
)
SELECT
  opening.selection,
  opening.handicap as opening_line,
  closing.handicap as closing_line,
  (closing.handicap - opening.handicap) as line_movement,
  opening.odds_decimal as opening_odds,
  closing.odds_decimal as closing_odds
FROM
  (SELECT * FROM line_movement WHERE rn_first = 1) opening
JOIN
  (SELECT * FROM line_movement WHERE rn_last = 1) closing
ON opening.selection = closing.selection;

-- 3. Find player prop value changes
SELECT
  bm.market_name,
  bo.selection,
  MIN(bo.handicap) as lowest_line,
  MAX(bo.handicap) as highest_line,
  MAX(bo.handicap) - MIN(bo.handicap) as total_movement,
  COUNT(DISTINCT bo.handicap) as line_changes
FROM betting_odds bo
JOIN betting_markets bm ON bo.market_id = bm.market_id
WHERE bm.market_key LIKE 'player_%'
GROUP BY bm.market_name, bo.selection
HAVING COUNT(DISTINCT bo.handicap) > 1
ORDER BY total_movement DESC;
```

## 🐛 Troubleshooting

### No Events Found
- Check if there are NBA games today
- Verify the API endpoints haven't changed
- May need authentication cookies (guest users limited)

### Database Connection Errors
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env` file
- Ensure database exists: `psql -l | grep nba_stats`

### Rate Limiting (HTTP 429)
- Script automatically waits 5 minutes
- Consider increasing RATE_LIMIT_SECONDS

### Team Matching Issues
- Check team name mappings in `pinnacle_config.py`
- Verify games exist in database for the date range

## 📊 Monitoring

### Check Logs
```bash
# Live log monitoring
tail -f /var/log/pinnacle/pinnacle_scraper.log

# Count successful stores
grep "✅ Stored" /var/log/pinnacle/*.log | wc -l

# Find errors
grep ERROR /var/log/pinnacle/*.log
```

### Database Queries
```sql
-- Check latest odds
SELECT
  be.event_id,
  g.game_date_est,
  ht.abbreviation || ' vs ' || at.abbreviation as matchup,
  COUNT(DISTINCT bm.market_id) as market_count,
  MAX(bo.last_updated) as last_update
FROM betting_events be
JOIN games g ON be.game_id = g.game_id
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
LEFT JOIN betting_markets bm ON be.event_id = bm.event_id
LEFT JOIN betting_odds bo ON bm.market_id = bo.market_id
WHERE be.bookmaker = 'pinnacle'
GROUP BY be.event_id, g.game_date_est, matchup
ORDER BY g.game_date_est DESC
LIMIT 10;
```

## 🗄️ Database Integration

### Database Schema
The scraper integrates with our PostgreSQL database using the existing betting intelligence schema:

```
betting_events (1 per game)
  └── betting_markets (133+ per game)
       └── betting_odds (2-10 per market)
```

### Data Volume
- **Per Game**: ~133 markets with 2-10 selections each
- **Daily**: ~2,660 odds records (10 games)
- **Monthly**: ~1.3 million odds records
- **Season**: ~8 million odds records

### Historical Tracking
- Never UPDATE odds, always INSERT new records
- Query opening line: `MIN(last_updated)`
- Query current line: `MAX(last_updated)`
- Track line movement: `ORDER BY last_updated`

## ⚠️ Legal & Ethical Considerations

1. **Terms of Service**: This scraper likely violates Pinnacle's ToS
2. **Authentication**: Real-time odds require user login (risky)
3. **Anti-Bot**: Heavy fingerprinting and bot detection active
4. **Alternative**: Consider The Odds API for legal access

## 📝 Development Status

### ✅ Completed (Phase A, B, C & Phase 4)
- Core scraper with rate limiting
- JSON parser for 133+ markets per game
- Odds conversion utilities
- Database integration with PostgreSQL
- Team/game matching logic
- Market storage with history tracking
- Dry-run mode for testing
- Authentication with cookies
- Cron automation setup
- **Phase 4 (2025-12-18)**: Closing lines capture functionality
  - `hours_to_game` and `is_closing_line` tracking in `betting_odds` table
  - `game_closing_lines` table for closing line snapshots
  - `capture_closing_lines.py` script for automated capture
  - See: `claudedocs/closing_lines_implementation_2025-12-18.md`

### ⏳ Known Issues
- Cookie expiration needs manual refresh
- Guest users receive "delayed odds" warning
- Anti-bot protection may block requests after extended use

### 🔮 Future Improvements
- Add session/cookie management for authentication
- Implement proxy rotation for reliability
- Add WebSocket support for live odds
- Create odds movement visualization dashboard
- Switch to The Odds API for legal compliance

## 📚 References

- [Database Schema](../../migrations/005_betting_intelligence.sql)
- [Implementation Plan](../../../../3.ACTIVE_PLANS/pinnacle-scraper-implementation-plan.md)
- [JSON Structure Mapping](../../../4.BETTING/json_structure_mapping.md)
- [Feasibility Assessment](../../../../claudedocs/pinnacle-api-feasibility-assessment.md)