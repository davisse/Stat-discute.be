# /sync - Sync NBA Data

Run the full ETL pipeline to sync games, player stats, and analytics for the 2025-26 NBA season.

## Instructions

Execute the following scripts in order:

1. **Sync Games** - Fetch latest games and scores:
   ```bash
   python3 /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/sync_season_2025_26.py
   ```

2. **Fetch Player Stats** - Get player box scores:
   ```bash
   python3 /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/fetch_player_stats_direct.py
   ```

3. **Run Analytics** - Calculate team stats, advanced stats, standings, and refresh views:
   ```bash
   python3 /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/analytics/run_all_analytics.py
   ```

## After Completion

Display a summary showing:
- Number of games synced
- Number of player stats fetched
- Current standings (top 5 East and West)

## Options

- `--games-only`: Only sync games, skip player stats and analytics
- `--analytics-only`: Only run analytics (assumes data is already synced)
- `--quick`: Skip analytics, just sync games and player stats
