# RotoWire NBA Daily Lineups Scraper

## Overview

This scraper collects critical NBA starting lineup data from RotoWire, including:

- **Starting lineups** (5 positions per team)
- **Injury status** (Probable, Questionable, Doubtful, Out)
- **Betting odds** (Moneyline, Spread, Over/Under)
- **Referee assignments**
- **Team records**

## Why This Data Is Critical

1. **Fantasy Basketball**: Starting lineups determine minutes and fantasy value
2. **DFS (Daily Fantasy Sports)**: Late lineup changes dramatically affect optimal lineups
3. **Sports Betting**: Injury status and starting lineups impact betting lines
4. **Player Props**: Knowing who starts affects over/under player prop bets
5. **Real-time Updates**: RotoWire updates throughout the day as injury news breaks

## Database Schema

### Tables Created (Migration 009)

1. **`nba_daily_lineups`** - Game-level metadata
   - Game date, time, teams, records
   - Betting odds (ML, spread, O/U)
   - Referees
   - Scrape timestamp

2. **`nba_lineup_snapshots`** - Starting lineup snapshots
   - 5 positions (PG, SG, SF, PF, C)
   - Player IDs and RotoWire IDs
   - Injury status per position
   - Multiple snapshots per game (track changes)

3. **`nba_injury_status`** - "May Not Play" tracking
   - Players with injury concerns
   - Position group (G/F/C)
   - Injury designation

4. **`player_rotowire_mapping`** - Player ID mapping
   - Links our player_id to RotoWire player_id
   - Enables reliable player matching
   - Stores display names for verification

### Key Features

- **Historical tracking**: Multiple scrapes per day show lineup changes
- **Efficient queries**: Optimized indexes for common access patterns
- **Data integrity**: Foreign key constraints ensure valid data
- **Views**: Pre-built views for latest lineups and snapshots

## Installation

```bash
# 1. Run database migration
psql nba_stats < 1.DATABASE/migrations/009_nba_daily_lineups.sql

# 2. Install Python dependencies (if not already installed)
pip3 install --break-system-packages beautifulsoup4 requests psycopg2-binary lxml

# 3. Make script executable
chmod +x 1.DATABASE/etl/scrape_rotowire_lineups.py
```

## Usage

### Basic Usage

```bash
# Scrape today's lineups
python3 1.DATABASE/etl/scrape_rotowire_lineups.py

# Scrape tomorrow's lineups
python3 1.DATABASE/etl/scrape_rotowire_lineups.py --date tomorrow

# Dry run (parse but don't save)
python3 1.DATABASE/etl/scrape_rotowire_lineups.py --dry-run

# Save to JSON file for inspection
python3 1.DATABASE/etl/scrape_rotowire_lineups.py --output lineups.json --dry-run
```

### Recommended Schedule

Run the scraper **multiple times per day** to track lineup changes:

```bash
# Cron schedule examples

# Morning lineups (8 AM ET)
0 13 * * * cd /path/to/project && python3 1.DATABASE/etl/scrape_rotowire_lineups.py

# Afternoon updates (2 PM ET)
0 19 * * * cd /path/to/project && python3 1.DATABASE/etl/scrape_rotowire_lineups.py

# Pre-game confirmations (5 PM ET)
0 22 * * * cd /path/to/project && python3 1.DATABASE/etl/scrape_rotowire_lineups.py

# Evening updates (8 PM ET for late games)
0 1 * * * cd /path/to/project && python3 1.DATABASE/etl/scrape_rotowire_lineups.py
```

## Data Output Format

### JSON Structure

```json
{
  "scraped_at": "2025-11-23T14:30:00Z",
  "source": "https://www.rotowire.com/basketball/nba-lineups.php",
  "games": [
    {
      "game_date": "2025-11-23",
      "game_time": "1:00 PM ET",
      "home_team": "PHI",
      "away_team": "MIA",
      "home_record": "9-6",
      "away_record": "10-6",
      "home_lineup": {
        "PG": {
          "name": "Tyrese Maxey",
          "rotowire_id": "5158",
          "url": "/basketball/player/tyrese-maxey-5158",
          "status": null
        },
        "SG": { /* ... */ },
        "SF": { /* ... */ },
        "PF": { /* ... */ },
        "C": { /* ... */ }
      },
      "away_lineup": { /* same structure */ },
      "betting": {
        "line_team": "MIA",
        "line_value": -118,
        "spread_team": "MIA",
        "spread_value": -1.5,
        "over_under": 240.5
      },
      "referees": ["Nick Buchert", "Brandon Schwab", "Matt Myers"]
    }
  ]
}
```

### Database Queries

```sql
-- Get today's latest lineups
SELECT * FROM v_latest_daily_lineups
WHERE game_date = CURRENT_DATE;

-- Get latest lineup snapshots for a specific game
SELECT
    g.game_date,
    g.game_time,
    ls.team,
    ls.pg_name || COALESCE(' (' || ls.pg_status || ')', '') as PG,
    ls.sg_name || COALESCE(' (' || ls.sg_status || ')', '') as SG,
    ls.sf_name || COALESCE(' (' || ls.sf_status || ')', '') as SF,
    ls.pf_name || COALESCE(' (' || ls.pf_status || ')', '') as PF,
    ls.c_name || COALESCE(' (' || ls.c_status || ')', '') as C
FROM v_latest_lineup_snapshots ls
JOIN v_latest_daily_lineups g ON ls.lineup_id = g.lineup_id
WHERE g.game_date = CURRENT_DATE
ORDER BY g.game_time, ls.is_home_team DESC;

-- Track lineup changes for a specific game
SELECT
    scraped_at,
    team,
    pg_name, pg_status,
    sg_name, sg_status,
    sf_name, sf_status,
    pf_name, pf_status,
    c_name, c_status
FROM nba_lineup_snapshots ls
JOIN nba_daily_lineups dl ON ls.lineup_id = dl.lineup_id
JOIN teams t ON ls.team_id = t.team_id
WHERE dl.game_date = '2025-11-23'
  AND t.abbreviation = 'MIA'
ORDER BY scraped_at DESC;

-- Find all games where a specific player is starting
SELECT
    dl.game_date,
    dl.game_time,
    t.abbreviation as team,
    CASE
        WHEN ls.pg_player_id = 2544 THEN 'PG'
        WHEN ls.sg_player_id = 2544 THEN 'SG'
        WHEN ls.sf_player_id = 2544 THEN 'SF'
        WHEN ls.pf_player_id = 2544 THEN 'PF'
        WHEN ls.c_player_id = 2544 THEN 'C'
    END as position
FROM nba_lineup_snapshots ls
JOIN nba_daily_lineups dl ON ls.lineup_id = dl.lineup_id
JOIN teams t ON ls.team_id = t.team_id
WHERE ls.pg_player_id = 2544  -- LeBron James example
   OR ls.sg_player_id = 2544
   OR ls.sf_player_id = 2544
   OR ls.pf_player_id = 2544
   OR ls.c_player_id = 2544
ORDER BY dl.game_date DESC
LIMIT 20;
```

## Important Notes

### HTML Parsing Challenges

The RotoWire page structure is complex and may require adjustments:

1. **Dynamic class names**: May change over time
2. **Nested divs**: Lineup data deeply nested in HTML
3. **Inconsistent structure**: "Expected Lineup" vs "MAY NOT PLAY" sections
4. **JavaScript rendering**: Some data may load dynamically

### Debugging Tips

```bash
# Save HTML for inspection
curl -H "User-Agent: Mozilla/5.0" https://www.rotowire.com/basketball/nba-lineups.php > rotowire.html

# Test parser on saved HTML
python3 -c "
from bs4 import BeautifulSoup
with open('rotowire.html') as f:
    soup = BeautifulSoup(f, 'html.parser')
    # Test your parsing logic here
    lineup_divs = soup.find_all('div', class_='lineup')
    print(f'Found {len(lineup_divs)} lineup containers')
"

# Check for specific elements
grep -i "expected lineup" rotowire.html
grep -i "game_time" rotowire.html
```

### Player Matching

The scraper uses a two-step approach for player matching:

1. **RotoWire ID mapping**: Check `player_rotowire_mapping` table first
2. **Fuzzy name matching**: Fall back to name matching if no mapping exists
3. **Manual review**: Log mismatches for manual verification

To improve matching accuracy:

```sql
-- Pre-populate common player mappings
INSERT INTO player_rotowire_mapping (player_id, rotowire_player_id, rotowire_display_name)
VALUES
    (2544, '2344', 'LeBron James'),
    (-- add more mappings --);

-- Check for unmapped players
SELECT DISTINCT
    pg_rotowire_id, pg_player_id
FROM nba_lineup_snapshots
WHERE pg_player_id IS NULL AND pg_rotowire_id IS NOT NULL
LIMIT 50;
```

## Next Steps

### Parser Refinement

The current parser needs HTML structure validation:

1. **Inspect actual HTML**: Use browser DevTools or save HTML to file
2. **Identify element selectors**: Find consistent class names or data attributes
3. **Update parsing logic**: Adjust `_parse_game()` and `_parse_lineup_section()`
4. **Test with real data**: Run dry-run and validate JSON output

### Integration with Frontend

Once data is being collected:

```typescript
// frontend/src/lib/queries.ts

export async function getTodayLineups() {
  const result = await query(`
    SELECT
      g.*,
      json_agg(
        json_build_object(
          'team', t.abbreviation,
          'is_home', ls.is_home_team,
          'lineup', json_build_object(
            'PG', json_build_object('name', pg.full_name, 'status', ls.pg_status),
            'SG', json_build_object('name', sg.full_name, 'status', ls.sg_status),
            'SF', json_build_object('name', sf.full_name, 'status', ls.sf_status),
            'PF', json_build_object('name', pf.full_name, 'status', ls.pf_status),
            'C', json_build_object('name', c.full_name, 'status', ls.c_status)
          )
        )
      ) as lineups
    FROM v_latest_daily_lineups g
    JOIN v_latest_lineup_snapshots ls ON g.lineup_id = ls.lineup_id
    JOIN teams t ON ls.team_id = t.team_id
    LEFT JOIN players pg ON ls.pg_player_id = pg.player_id
    LEFT JOIN players sg ON ls.sg_player_id = sg.player_id
    LEFT JOIN players sf ON ls.sf_player_id = sf.player_id
    LEFT JOIN players pf ON ls.pf_player_id = pf.player_id
    LEFT JOIN players c ON ls.c_player_id = c.player_id
    WHERE g.game_date = CURRENT_DATE
    GROUP BY g.lineup_id
    ORDER BY g.game_time
  `)
  return result.rows
}
```

### Monitoring

Set up alerts for:
- Failed scrapes (empty results when games expected)
- Unmapped players (check logs for player matching failures)
- Stale data (no updates for > 24 hours)
- Missing games (expected vs actual game count)

## Troubleshooting

### Common Issues

**Issue**: `ModuleNotFoundError: No module named 'bs4'`
```bash
pip3 install --break-system-packages beautifulsoup4
```

**Issue**: Database connection failed
```bash
# Check PostgreSQL is running
psql nba_stats -c "SELECT 1"

# Verify environment variables
echo $DB_HOST $DB_USER $DB_NAME
```

**Issue**: No games found
- Check if there are actually games scheduled for today
- Inspect HTML structure (may have changed)
- Run with `--output` to see raw parsed data
- Check for JavaScript-rendered content (may need Selenium)

**Issue**: Player matching failures
```sql
-- Review unmatched players
SELECT DISTINCT rotowire_player_id, rotowire_display_name
FROM player_rotowire_mapping
WHERE player_id IS NULL;

-- Manually create mappings
INSERT INTO player_rotowire_mapping (player_id, rotowire_player_id, rotowire_display_name)
VALUES (YOUR_PLAYER_ID, 'ROTOWIRE_ID', 'Display Name');
```

## Future Enhancements

1. **Selenium/Playwright**: Handle JavaScript-rendered content
2. **Change notifications**: Alert when starter changes (e.g., "LeBron OUT")
3. **Historical analysis**: Track how often lineups change by team
4. **Accuracy tracking**: Compare RotoWire vs official NBA lineups
5. **API endpoint**: Expose lineup data via REST API for frontend
6. **Real-time updates**: WebSocket for live lineup changes

## License & Legal

**Important**: This scraper is for personal/educational use only. Always review and comply with:
- RotoWire's Terms of Service
- Robots.txt guidelines
- Rate limiting (don't overwhelm their servers)
- Attribution requirements

Consider subscribing to RotoWire if you find their data valuable.
