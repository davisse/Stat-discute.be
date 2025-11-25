---
name: odds
description: "Fetch NBA betting odds from Pinnacle and display summary"
---

# /odds - Fetch NBA Betting Odds

Fetch current NBA betting odds from Pinnacle (ps3838.com) and store them in the database.

## Instructions

1. **Run the odds fetcher script:**
   ```bash
   python3 /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/fetch_pinnacle_odds.py
   ```

2. **After fetching, display a summary of today's games with odds:**
   ```sql
   SELECT
       g.game_date,
       t1.abbreviation as away,
       t2.abbreviation as home,
       bm.market_name,
       bo.selection,
       bo.odds_decimal,
       bo.handicap
   FROM betting_events be
   JOIN games g ON be.game_id = g.game_id
   JOIN teams t1 ON g.away_team_id = t1.team_id
   JOIN teams t2 ON g.home_team_id = t2.team_id
   JOIN betting_markets bm ON be.event_id = bm.event_id
   JOIN betting_odds bo ON bm.market_id = bo.market_id
   WHERE g.game_date >= CURRENT_DATE
     AND bm.market_name IN ('Game Moneyline', 'Game Spread 8.5', 'Game Total')
   ORDER BY g.game_date, g.game_id, bm.market_name, bo.recorded_at DESC
   ```

3. **Present the odds in a clean table format showing:**
   - Game (Away @ Home)
   - Moneyline odds for both teams
   - Current spread and odds
   - Total (Over/Under) if available

## Options

- `--dry-run`: Parse and display without saving to database
- `--summary`: Only show summary, skip fetching (use existing data)
- `--spread`: Focus on spread movement analysis

## Examples

```
/odds                    # Fetch odds and show summary
/odds --summary          # Show current odds without fetching
/odds --spread           # Show spread movement for today's games
```
