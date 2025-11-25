# Anthony Davis vs LeBron James Impact Analysis

## Overview

This analysis compares Anthony Davis's scoring performance in games with and without LeBron James during the 2023-24 Lakers season.

## Files

| File | Purpose |
|------|---------|
| `ad_lebron_analysis.py` | Main analysis script with statistical breakdown |
| `ad_lebron_visualization.py` | Creates charts and visual comparisons |
| `ad_lebron_comparison.csv` | Exported data (generated after running analysis) |

## Installation

### Prerequisites

```bash
# Install required packages
pip install nba_api pandas numpy matplotlib
```

## Usage

### 1. Run Basic Analysis

```bash
cd nba-schedule-api
python ad_lebron_analysis.py
```

**Output:**
- Console statistics comparing AD's performance with/without LeBron
- CSV file with game-by-game data: `ad_lebron_comparison.csv`

### 2. Generate Visualizations

```bash
python ad_lebron_visualization.py
```

**Output:**
- `ad_lebron_comparison_charts.png` - 6 comparison charts
- `ad_lebron_stats_table.png` - Summary statistics table
- Interactive matplotlib windows

## Analysis Components

### Key Metrics Analyzed

1. **Scoring Statistics**
   - Average points per game
   - Median points
   - Max/Min points
   - Standard deviation
   - Total points

2. **Shooting Efficiency**
   - Field Goal Percentage (FG%)
   - 3-Point Percentage (3PT%)
   - Free Throw Percentage (FT%)

3. **Volume Metrics**
   - Field Goal Attempts (FGA)
   - Minutes played
   - 30+ point games frequency

4. **Distribution Analysis**
   - Scoring ranges: 0-19, 20-29, 30-39, 40+ points
   - Game-by-game trends

### Generated Charts

The visualization script creates 6 comparison charts:

1. **Average Points Bar Chart** - Direct PPG comparison
2. **Points Distribution Box Plot** - Variance and consistency
3. **Game-by-Game Trend Line** - Performance over time
4. **Shooting Efficiency** - FG%, 3PT%, FT% comparison
5. **Usage & Playing Time** - FGA and minutes comparison
6. **Scoring Distribution** - Games by scoring range

## Example Output

```
======================================================================
ANTHONY DAVIS SCORING ANALYSIS - 2023-24 SEASON
======================================================================

Total games Anthony Davis played: 76
Games with LeBron: 55
Games without LeBron: 21

----------------------------------------------------------------------
WITH LEBRON JAMES:
----------------------------------------------------------------------
Games: 55
Average Points: 24.5 PPG
Median Points: 25.0
Max Points: 41.0
Min Points: 9.0
Standard Deviation: 7.23
Total Points: 1348.0

----------------------------------------------------------------------
WITHOUT LEBRON JAMES:
----------------------------------------------------------------------
Games: 21
Average Points: 27.8 PPG
Median Points: 28.0
Max Points: 42.0
Min Points: 14.0
Standard Deviation: 8.12
Total Points: 584.0

======================================================================
COMPARISON:
======================================================================
AD scores 3.30 MORE points per game without LeBron
That's a 13.5% INCREASE

----------------------------------------------------------------------
ADDITIONAL METRICS:
----------------------------------------------------------------------

Shooting Volume:
  With LeBron - FGA: 18.2 per game
  Without LeBron - FGA: 21.5 per game
  Difference: 3.3 more attempts

Shooting Efficiency:
  With LeBron - FG%: 0.543
  Without LeBron - FG%: 0.521

Minutes:
  With LeBron - MIN: 34.5 per game
  Without LeBron - MIN: 36.8 per game

30+ Point Games:
  With LeBron: 18 games (32.7%)
  Without LeBron: 10 games (47.6%)

======================================================================
```

## Data Export

The analysis automatically exports data to `ad_lebron_comparison.csv` with the following columns:

- `GAME_DATE` - Date of the game
- `MATCHUP` - Opponent (LAL vs/@ opponent)
- `WL` - Win/Loss result
- `Scenario` - "With LeBron" or "Without LeBron"
- `MIN` - Minutes played
- `PTS` - Points scored
- `FGM/FGA/FG_PCT` - Field goal stats
- `FG3M/FG3A/FG3_PCT` - 3-point stats
- `FTM/FTA/FT_PCT` - Free throw stats
- `REB/AST/STL/BLK/TOV` - Other stats
- `PLUS_MINUS` - Plus/minus rating

## Customization

### Analyze Different Season

Edit `ad_lebron_analysis.py`:

```python
# Change season parameter (line ~90)
results = analyze_ad_with_without_lebron(season='2024-25')
```

### Analyze Different Players

Modify the player names:

```python
# Example: Compare Kawhi Leonard with/without Paul George
lebron_id = find_player_id("Paul George")
ad_id = find_player_id("Kawhi Leonard")
```

### Different Metrics

Add additional metrics in the analysis section:

```python
# Example: Add rebounds comparison
print(f"  With LeBron - REB: {with_lebron['REB'].mean():.1f} per game")
print(f"  Without LeBron - REB: {without_lebron['REB'].mean():.1f} per game")
```

## Advanced Analysis

### Using the Exported CSV

```python
import pandas as pd

# Load the exported data
df = pd.read_csv('ad_lebron_comparison.csv')

# Filter games without LeBron where AD scored 30+
high_scoring = df[(df['Scenario'] == 'Without LeBron') & (df['PTS'] >= 30)]
print(high_scoring[['GAME_DATE', 'MATCHUP', 'PTS', 'REB', 'AST']])

# Calculate win percentage by scenario
win_pct = df.groupby('Scenario')['WL'].apply(lambda x: (x == 'W').sum() / len(x))
print(win_pct)
```

### Statistical Significance Test

```python
from scipy import stats

# T-test to determine if difference is statistically significant
with_pts = with_lebron['PTS']
without_pts = without_lebron['PTS']

t_stat, p_value = stats.ttest_ind(with_pts, without_pts)
print(f"T-statistic: {t_stat:.3f}")
print(f"P-value: {p_value:.3f}")

if p_value < 0.05:
    print("The difference is statistically significant!")
else:
    print("The difference is not statistically significant.")
```

## Integration with Database

If you have the PostgreSQL database setup:

```python
import psycopg2
import pandas as pd

# Connect to database
conn = psycopg2.connect(
    dbname="nba_stats",
    user="your_user",
    password="your_password",
    host="localhost"
)

# Query AD stats with LeBron playing status
query = """
SELECT
    g.game_date,
    bst_ad.pts as ad_points,
    bst_ad.fga as ad_fga,
    bst_ad.fg_pct as ad_fg_pct,
    CASE
        WHEN bst_lebron.player_id IS NOT NULL
        THEN 'With LeBron'
        ELSE 'Without LeBron'
    END as scenario
FROM games g
JOIN box_scores_traditional bst_ad ON (
    g.game_id = bst_ad.game_id
    AND bst_ad.player_id = 203076  -- Anthony Davis
)
LEFT JOIN box_scores_traditional bst_lebron ON (
    g.game_id = bst_lebron.game_id
    AND bst_lebron.player_id = 2544  -- LeBron James
    AND bst_lebron.min > 0
)
WHERE g.season = '2023-24'
    AND (g.home_team_id = 1610612747 OR g.away_team_id = 1610612747)
ORDER BY g.game_date;
"""

df = pd.read_sql(query, conn)
print(df.groupby('scenario')['ad_points'].mean())
conn.close()
```

## Troubleshooting

### Common Issues

1. **nba_api rate limiting**
   - Add delay between requests: `time.sleep(0.6)` between API calls
   - The script handles this automatically

2. **No data returned**
   - Verify player names are spelled correctly
   - Check season format is 'YYYY-YY' (e.g., '2023-24')
   - Ensure players were on the same team that season

3. **Visualization errors**
   - Install matplotlib: `pip install matplotlib`
   - If running on server without display: use `matplotlib.use('Agg')` before importing pyplot

## References

- **Player IDs**: Use `nba_api.stats.static.players.find_players_by_full_name()`
- **Team IDs**: Lakers = 1610612747
- **Season Format**: Regular Season only (excludes playoffs)
- **Stats Documentation**: See `nba_api/docs/nba_api/stats/endpoints/playergamelog.md`

## Next Steps

Potential expansions:

1. **Multi-season comparison** - Analyze trends across multiple years
2. **Win percentage impact** - Does Lakers W% change with/without LeBron?
3. **Other teammates** - Analyze D'Angelo Russell, Austin Reaves impact on AD
4. **Advanced metrics** - Add usage rate, true shooting %, offensive rating
5. **Opponent strength** - Factor in opponent defensive rating

---

**Last Updated:** 2025-01-23
**Author:** Stat Discute
**Version:** 1.0.0
