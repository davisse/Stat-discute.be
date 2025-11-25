"""
Visualization for Anthony Davis Scoring Analysis
Creates charts comparing AD's performance with/without LeBron James
"""

import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for headless execution
import matplotlib.pyplot as plt
import numpy as np
import os
from datetime import datetime
import sys

# Import analysis function
from ad_lebron_analysis import analyze_ad_with_without_lebron, DATA_DIR, LOGS_DIR, OUTPUT_BASE

# Output directories
CHARTS_DIR = os.path.join(OUTPUT_BASE, 'charts')

# Create directories if they don't exist
os.makedirs(CHARTS_DIR, exist_ok=True)

# Date stamp for filenames
date_str = datetime.now().strftime('%Y-%m-%d')

def create_comparison_charts(data):
    """Create visualization charts for the analysis."""

    with_lebron = data['with_lebron']
    without_lebron = data['without_lebron']

    # Set up the figure with multiple subplots
    fig = plt.figure(figsize=(16, 10))
    fig.suptitle('Anthony Davis Scoring Analysis: With vs Without LeBron James\n2023-24 Lakers Season',
                 fontsize=16, fontweight='bold')

    # Chart 1: Average Points Comparison (Bar Chart)
    ax1 = plt.subplot(2, 3, 1)
    categories = ['With LeBron', 'Without LeBron']
    avg_points = [with_lebron['PTS'].mean(), without_lebron['PTS'].mean()]
    colors = ['#552583', '#FDB927']  # Lakers colors

    bars = ax1.bar(categories, avg_points, color=colors, edgecolor='black', linewidth=1.5)
    ax1.set_ylabel('Points Per Game', fontweight='bold')
    ax1.set_title('Average Points Per Game', fontweight='bold')
    ax1.set_ylim(0, max(avg_points) * 1.2)

    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.1f}',
                ha='center', va='bottom', fontweight='bold', fontsize=12)

    # Chart 2: Points Distribution (Box Plot)
    ax2 = plt.subplot(2, 3, 2)
    box_data = [with_lebron['PTS'], without_lebron['PTS']]
    bp = ax2.boxplot(box_data, labels=categories, patch_artist=True,
                     boxprops=dict(facecolor='lightblue', edgecolor='black'),
                     medianprops=dict(color='red', linewidth=2))

    for patch, color in zip(bp['boxes'], colors):
        patch.set_facecolor(color)
        patch.set_alpha(0.6)

    ax2.set_ylabel('Points', fontweight='bold')
    ax2.set_title('Points Distribution', fontweight='bold')
    ax2.grid(axis='y', alpha=0.3)

    # Chart 3: Game-by-Game Trend
    ax3 = plt.subplot(2, 3, 3)

    # Sort by date
    with_lebron_sorted = with_lebron.sort_values('GAME_DATE')
    without_lebron_sorted = without_lebron.sort_values('GAME_DATE')

    ax3.plot(range(len(with_lebron_sorted)), with_lebron_sorted['PTS'],
             marker='o', color='#552583', label='With LeBron', alpha=0.7, linewidth=2)

    if len(without_lebron_sorted) > 0:
        ax3.plot(range(len(without_lebron_sorted)), without_lebron_sorted['PTS'],
                 marker='s', color='#FDB927', label='Without LeBron', alpha=0.7, linewidth=2)

    ax3.axhline(y=with_lebron['PTS'].mean(), color='#552583', linestyle='--', alpha=0.5, linewidth=1)
    if len(without_lebron) > 0:
        ax3.axhline(y=without_lebron['PTS'].mean(), color='#FDB927', linestyle='--', alpha=0.5, linewidth=1)

    ax3.set_xlabel('Game Number', fontweight='bold')
    ax3.set_ylabel('Points', fontweight='bold')
    ax3.set_title('Points Trend', fontweight='bold')
    ax3.legend()
    ax3.grid(alpha=0.3)

    # Chart 4: Shooting Efficiency Comparison
    ax4 = plt.subplot(2, 3, 4)
    x = np.arange(3)
    width = 0.35

    fg_pct = [with_lebron['FG_PCT'].mean() * 100, without_lebron['FG_PCT'].mean() * 100]
    fg3_pct = [with_lebron['FG3_PCT'].mean() * 100, without_lebron['FG3_PCT'].mean() * 100]
    ft_pct = [with_lebron['FT_PCT'].mean() * 100, without_lebron['FT_PCT'].mean() * 100]

    ax4.bar(x - width/2, [fg_pct[0], fg3_pct[0], ft_pct[0]], width,
            label='With LeBron', color='#552583', alpha=0.8)
    ax4.bar(x + width/2, [fg_pct[1], fg3_pct[1], ft_pct[1]], width,
            label='Without LeBron', color='#FDB927', alpha=0.8)

    ax4.set_ylabel('Percentage (%)', fontweight='bold')
    ax4.set_title('Shooting Efficiency', fontweight='bold')
    ax4.set_xticks(x)
    ax4.set_xticklabels(['FG%', '3PT%', 'FT%'])
    ax4.legend()
    ax4.grid(axis='y', alpha=0.3)

    # Chart 5: Volume Stats (FGA, Minutes)
    ax5 = plt.subplot(2, 3, 5)
    categories_vol = ['FGA\nper game', 'Minutes\nper game']
    with_lebron_vol = [with_lebron['FGA'].mean(), with_lebron['MIN'].mean()]
    without_lebron_vol = [without_lebron['FGA'].mean(), without_lebron['MIN'].mean()]

    x_vol = np.arange(len(categories_vol))
    ax5.bar(x_vol - width/2, with_lebron_vol, width,
            label='With LeBron', color='#552583', alpha=0.8)
    ax5.bar(x_vol + width/2, without_lebron_vol, width,
            label='Without LeBron', color='#FDB927', alpha=0.8)

    ax5.set_ylabel('Value', fontweight='bold')
    ax5.set_title('Usage & Playing Time', fontweight='bold')
    ax5.set_xticks(x_vol)
    ax5.set_xticklabels(categories_vol)
    ax5.legend()
    ax5.grid(axis='y', alpha=0.3)

    # Chart 6: Performance Categories
    ax6 = plt.subplot(2, 3, 6)

    # Count games in different scoring ranges
    def categorize_games(df):
        return {
            '0-19 pts': len(df[df['PTS'] < 20]),
            '20-29 pts': len(df[(df['PTS'] >= 20) & (df['PTS'] < 30)]),
            '30-39 pts': len(df[(df['PTS'] >= 30) & (df['PTS'] < 40)]),
            '40+ pts': len(df[df['PTS'] >= 40])
        }

    with_categories = categorize_games(with_lebron)
    without_categories = categorize_games(without_lebron)

    categories_names = list(with_categories.keys())
    x_cat = np.arange(len(categories_names))

    ax6.bar(x_cat - width/2, list(with_categories.values()), width,
            label='With LeBron', color='#552583', alpha=0.8)
    ax6.bar(x_cat + width/2, list(without_categories.values()), width,
            label='Without LeBron', color='#FDB927', alpha=0.8)

    ax6.set_ylabel('Number of Games', fontweight='bold')
    ax6.set_title('Scoring Distribution by Range', fontweight='bold')
    ax6.set_xticks(x_cat)
    ax6.set_xticklabels(categories_names, rotation=15)
    ax6.legend()
    ax6.grid(axis='y', alpha=0.3)

    plt.tight_layout()

    # Save the figure
    filename = os.path.join(CHARTS_DIR, f'ad_lebron_comparison_charts_{date_str}.png')
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"\n✅ Charts saved to {filename}")
    plt.close()

def create_summary_stats_image(data):
    """Create a summary statistics comparison image."""

    with_lebron = data['with_lebron']
    without_lebron = data['without_lebron']

    fig, ax = plt.subplots(figsize=(12, 8))
    ax.axis('tight')
    ax.axis('off')

    # Calculate statistics
    stats_data = [
        ['Metric', 'With LeBron', 'Without LeBron', 'Difference'],
        ['Games Played', f"{len(with_lebron)}", f"{len(without_lebron)}", ''],
        ['Avg Points', f"{with_lebron['PTS'].mean():.2f}",
         f"{without_lebron['PTS'].mean():.2f}",
         f"{(without_lebron['PTS'].mean() - with_lebron['PTS'].mean()):+.2f}"],
        ['Median Points', f"{with_lebron['PTS'].median():.1f}",
         f"{without_lebron['PTS'].median():.1f}",
         f"{(without_lebron['PTS'].median() - with_lebron['PTS'].median()):+.1f}"],
        ['Max Points', f"{with_lebron['PTS'].max():.0f}",
         f"{without_lebron['PTS'].max():.0f}", ''],
        ['FG%', f"{with_lebron['FG_PCT'].mean():.3f}",
         f"{without_lebron['FG_PCT'].mean():.3f}",
         f"{(without_lebron['FG_PCT'].mean() - with_lebron['FG_PCT'].mean()):+.3f}"],
        ['FGA per game', f"{with_lebron['FGA'].mean():.1f}",
         f"{without_lebron['FGA'].mean():.1f}",
         f"{(without_lebron['FGA'].mean() - with_lebron['FGA'].mean()):+.1f}"],
        ['Minutes/game', f"{with_lebron['MIN'].mean():.1f}",
         f"{without_lebron['MIN'].mean():.1f}",
         f"{(without_lebron['MIN'].mean() - with_lebron['MIN'].mean()):+.1f}"],
        ['30+ pt games', f"{len(with_lebron[with_lebron['PTS'] >= 30])}",
         f"{len(without_lebron[without_lebron['PTS'] >= 30])}", ''],
    ]

    table = ax.table(cellText=stats_data, cellLoc='center', loc='center',
                     colWidths=[0.3, 0.2, 0.2, 0.2])

    table.auto_set_font_size(False)
    table.set_fontsize(11)
    table.scale(1, 2)

    # Style header row
    for i in range(4):
        table[(0, i)].set_facecolor('#552583')
        table[(0, i)].set_text_props(weight='bold', color='white')

    # Color alternating rows
    for i in range(1, len(stats_data)):
        for j in range(4):
            if i % 2 == 0:
                table[(i, j)].set_facecolor('#F0F0F0')

    plt.title('Anthony Davis Stats: With vs Without LeBron James\n2023-24 Lakers Season',
              fontsize=14, fontweight='bold', pad=20)

    filename = os.path.join(CHARTS_DIR, f'ad_lebron_stats_table_{date_str}.png')
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"✅ Stats table saved to {filename}")
    plt.close()

if __name__ == "__main__":
    start_time = datetime.now()
    print("="*70)
    print("VISUALIZATION: AD vs LeBron Impact Analysis")
    print("Los Angeles Lakers - 2023-24 Regular Season")
    print(f"Execution started: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    print()

    try:
        # Run analysis
        print("Running analysis and fetching data...")
        results = analyze_ad_with_without_lebron()

        # Create charts
        print("\nGenerating comparison charts...")
        create_comparison_charts(results)

        print("\nGenerating summary statistics table...")
        create_summary_stats_image(results)

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        print("\n" + "="*70)
        print("✅ All visualizations complete!")
        print(f"Execution time: {duration:.2f} seconds")
        print(f"Charts saved to: {CHARTS_DIR}")
        print("="*70)

    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
