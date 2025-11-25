"""
Anthony Davis Scoring Analysis: With vs Without LeBron James
2023-24 Lakers Season

This script compares Anthony Davis's points per game when playing
with and without LeBron James.
"""

from nba_api.stats.endpoints import playergamelog
from nba_api.stats.static import players
import pandas as pd
import numpy as np
import os
from datetime import datetime
import sys

# Output directories
# Get the script's directory and construct path relative to project root
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_BASE = os.path.join(PROJECT_ROOT, '0.SCRIPTS-EXPORTS')
DATA_DIR = os.path.join(OUTPUT_BASE, 'data')
LOGS_DIR = os.path.join(OUTPUT_BASE, 'logs')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# Setup logging
timestamp = datetime.now().strftime('%Y-%m-%d_%H%M%S')
date_str = datetime.now().strftime('%Y-%m-%d')
log_file = os.path.join(LOGS_DIR, f'ad_lebron_analysis_{timestamp}.log')

class Logger:
    """Simple logger that writes to both console and file."""
    def __init__(self, log_file):
        self.terminal = sys.stdout
        self.log = open(log_file, 'w')

    def write(self, message):
        self.terminal.write(message)
        self.log.write(message)

    def flush(self):
        self.terminal.flush()
        self.log.flush()

    def close(self):
        self.log.close()

# Redirect output to logger
logger = Logger(log_file)
sys.stdout = logger

def find_player_id(player_name):
    """Find NBA player ID by name."""
    player = players.find_players_by_full_name(player_name)
    if player:
        return player[0]['id']
    return None

def get_player_game_log(player_id, season='2023-24'):
    """Get player's game log for specified season."""
    gamelog = playergamelog.PlayerGameLog(
        player_id=str(player_id),
        season=season,
        season_type_all_star='Regular Season'
    )
    return gamelog.get_data_frames()[0]

def analyze_ad_with_without_lebron():
    """Main analysis function."""

    # Step 1: Find player IDs
    print("Finding player IDs...")
    lebron_id = find_player_id("LeBron James")
    ad_id = find_player_id("Anthony Davis")

    print(f"LeBron James ID: {lebron_id}")
    print(f"Anthony Davis ID: {ad_id}")
    print("\n" + "="*70)

    # Step 2: Get game logs
    print("\nFetching LeBron's 2023-24 game log...")
    lebron_games = get_player_game_log(lebron_id, '2023-24')
    lebron_game_ids = set(lebron_games['Game_ID'])

    print("Fetching Anthony Davis's 2023-24 game log...")
    ad_games = get_player_game_log(ad_id, '2023-24')

    # Step 3: Categorize AD games
    print("\nCategorizing games...")
    ad_games['LeBron_Playing'] = ad_games['Game_ID'].isin(lebron_game_ids)

    # Separate into two groups
    with_lebron = ad_games[ad_games['LeBron_Playing'] == True]
    without_lebron = ad_games[ad_games['LeBron_Playing'] == False]

    # Step 4: Calculate statistics
    print("\n" + "="*70)
    print("ANTHONY DAVIS SCORING ANALYSIS - 2023-24 SEASON")
    print("="*70)

    # Overall stats
    print(f"\nTotal games Anthony Davis played: {len(ad_games)}")
    print(f"Games with LeBron: {len(with_lebron)}")
    print(f"Games without LeBron: {len(without_lebron)}")

    # Scoring statistics WITH LeBron
    print("\n" + "-"*70)
    print("WITH LEBRON JAMES:")
    print("-"*70)
    print(f"Games: {len(with_lebron)}")
    print(f"Average Points: {with_lebron['PTS'].mean():.2f} PPG")
    print(f"Median Points: {with_lebron['PTS'].median():.1f}")
    print(f"Max Points: {with_lebron['PTS'].max():.0f}")
    print(f"Min Points: {with_lebron['PTS'].min():.0f}")
    print(f"Standard Deviation: {with_lebron['PTS'].std():.2f}")
    print(f"Total Points: {with_lebron['PTS'].sum():.0f}")

    # Scoring statistics WITHOUT LeBron
    print("\n" + "-"*70)
    print("WITHOUT LEBRON JAMES:")
    print("-"*70)
    print(f"Games: {len(without_lebron)}")
    print(f"Average Points: {without_lebron['PTS'].mean():.2f} PPG")
    print(f"Median Points: {without_lebron['PTS'].median():.1f}")
    print(f"Max Points: {without_lebron['PTS'].max():.0f}")
    print(f"Min Points: {without_lebron['PTS'].min():.0f}")
    print(f"Standard Deviation: {without_lebron['PTS'].std():.2f}")
    print(f"Total Points: {without_lebron['PTS'].sum():.0f}")

    # Difference analysis
    print("\n" + "="*70)
    print("COMPARISON:")
    print("="*70)
    diff = without_lebron['PTS'].mean() - with_lebron['PTS'].mean()
    pct_change = (diff / with_lebron['PTS'].mean()) * 100

    if diff > 0:
        print(f"AD scores {diff:.2f} MORE points per game without LeBron")
        print(f"That's a {pct_change:.1f}% INCREASE")
    else:
        print(f"AD scores {abs(diff):.2f} FEWER points per game without LeBron")
        print(f"That's a {abs(pct_change):.1f}% DECREASE")

    # Additional metrics
    print("\n" + "-"*70)
    print("ADDITIONAL METRICS:")
    print("-"*70)

    # Field goal attempts
    print("\nShooting Volume:")
    print(f"  With LeBron - FGA: {with_lebron['FGA'].mean():.1f} per game")
    print(f"  Without LeBron - FGA: {without_lebron['FGA'].mean():.1f} per game")
    print(f"  Difference: {(without_lebron['FGA'].mean() - with_lebron['FGA'].mean()):.1f} more attempts")

    # Field goal percentage
    print("\nShooting Efficiency:")
    print(f"  With LeBron - FG%: {with_lebron['FG_PCT'].mean():.3f}")
    print(f"  Without LeBron - FG%: {without_lebron['FG_PCT'].mean():.3f}")

    # Minutes played
    print("\nMinutes:")
    print(f"  With LeBron - MIN: {with_lebron['MIN'].mean():.1f} per game")
    print(f"  Without LeBron - MIN: {without_lebron['MIN'].mean():.1f} per game")

    # Games over 30 points
    print("\n30+ Point Games:")
    with_30plus = len(with_lebron[with_lebron['PTS'] >= 30])
    without_30plus = len(without_lebron[without_lebron['PTS'] >= 30])
    print(f"  With LeBron: {with_30plus} games ({(with_30plus/len(with_lebron)*100):.1f}%)")
    print(f"  Without LeBron: {without_30plus} games ({(without_30plus/len(without_lebron)*100):.1f}%)")

    print("\n" + "="*70)

    # Step 5: Show game-by-game breakdown (without LeBron)
    if len(without_lebron) > 0:
        print("\nGAMES WITHOUT LEBRON (Detailed):")
        print("="*70)
        without_lebron_display = without_lebron[['GAME_DATE', 'MATCHUP', 'WL', 'MIN', 'PTS', 'FGM', 'FGA', 'FG_PCT', 'REB', 'AST']].copy()
        without_lebron_display = without_lebron_display.sort_values('GAME_DATE')
        print(without_lebron_display.to_string(index=False))

    # Return data for further analysis
    return {
        'with_lebron': with_lebron,
        'without_lebron': without_lebron,
        'all_games': ad_games
    }

def export_to_csv(data):
    """Export analysis results to CSV."""
    all_games = data['all_games'].copy()
    all_games['Scenario'] = all_games['LeBron_Playing'].apply(
        lambda x: 'With LeBron' if x else 'Without LeBron'
    )

    # Select relevant columns
    export_df = all_games[[
        'GAME_DATE', 'MATCHUP', 'WL', 'Scenario',
        'MIN', 'PTS', 'FGM', 'FGA', 'FG_PCT',
        'FG3M', 'FG3A', 'FG3_PCT', 'FTM', 'FTA', 'FT_PCT',
        'REB', 'AST', 'STL', 'BLK', 'TOV', 'PLUS_MINUS'
    ]]

    # Create filename with date stamp
    filename = os.path.join(DATA_DIR, f'ad_lebron_comparison_{date_str}.csv')
    export_df.to_csv(filename, index=False)
    print(f"\n✅ Data exported to {filename}")

if __name__ == "__main__":
    start_time = datetime.now()
    print("="*70)
    print("ANTHONY DAVIS vs LEBRON JAMES IMPACT ANALYSIS")
    print("Los Angeles Lakers - 2023-24 Regular Season")
    print(f"Execution started: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    print()

    try:
        # Run analysis
        results = analyze_ad_with_without_lebron()

        # Export to CSV
        export_to_csv(results)

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        print("\n" + "="*70)
        print("✅ Analysis complete!")
        print(f"Execution time: {duration:.2f} seconds")
        print(f"Log file: {log_file}")
        print(f"Data exported to: {DATA_DIR}")
        print("="*70)

    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        # Close logger
        sys.stdout = logger.terminal
        logger.close()
