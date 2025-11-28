#!/usr/bin/env python3
"""
Generate NBA Position Defense Report
Creates a comprehensive PDF report with:
- Position charts for all 30 teams (without average line)
- Position rankings (best/worst defense by position)

Usage:
    python generate_position_report.py
    python generate_position_report.py --output report.pdf
"""

import argparse
import asyncio
import io
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

import asyncpg
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.backends.backend_pdf import PdfPages
import numpy as np

# ============================================================================
# Configuration
# ============================================================================

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'dbname': 'nba_stats',
    'user': 'chapirou'
}

# Design tokens
COLORS = {
    'background': '#000000',
    'card_bg': '#0a0a0a',
    'foreground': '#ffffff',
    'positive': '#10b981',  # Green
    'negative': '#ef4444',  # Red
    'gray_400': '#9ca3af',
    'gray_500': '#6b7280',
    'gray_800': '#1f2937',
    'gray_900': '#111827',
    'gray_950': '#030712'
}

POSITION_COLORS = {
    'PG': '#3b82f6',  # Blue
    'SG': '#8b5cf6',  # Purple
    'SF': '#ec4899',  # Pink
    'PF': '#f97316',  # Orange
    'C': '#10b981',   # Green
}

POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']
POSITION_NAMES = {
    'PG': 'Point Guards',
    'SG': 'Shooting Guards',
    'SF': 'Small Forwards',
    'PF': 'Power Forwards',
    'C': 'Centers'
}

# All 30 NBA teams
NBA_TEAMS = [
    'ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 'DET', 'GSW',
    'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'MIL', 'MIN', 'NOP', 'NYK',
    'OKC', 'ORL', 'PHI', 'PHX', 'POR', 'SAC', 'SAS', 'TOR', 'UTA', 'WAS'
]

OUTPUT_DIR = Path(__file__).parent.parent / 'data' / 'reports'


# ============================================================================
# Database Functions
# ============================================================================

async def get_db_connection():
    """Create database connection."""
    return await asyncpg.connect(
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port'],
        database=DB_CONFIG['dbname'],
        user=DB_CONFIG['user']
    )


async def get_current_season() -> str:
    """Get current season from database."""
    conn = await get_db_connection()
    row = await conn.fetchrow("SELECT season_id FROM seasons WHERE is_current = true LIMIT 1")
    await conn.close()
    return row['season_id'] if row else '2025-26'


async def get_all_teams() -> list:
    """Get all NBA teams."""
    conn = await get_db_connection()
    rows = await conn.fetch("""
        SELECT team_id, abbreviation, full_name, city
        FROM teams
        WHERE abbreviation = ANY($1)
        ORDER BY abbreviation
    """, NBA_TEAMS)
    await conn.close()
    return [dict(row) for row in rows]


async def get_points_by_position(team_id: int) -> list:
    """Get points allowed by position for each game."""
    current_season = await get_current_season()

    query = f"""
        WITH team_games AS (
            SELECT
                g.game_id,
                g.game_date,
                CASE
                    WHEN g.home_team_id = {team_id} THEN away.abbreviation
                    ELSE home.abbreviation
                END as opponent_abbr,
                CASE
                    WHEN g.home_team_id = {team_id} THEN 'HOME'
                    ELSE 'AWAY'
                END as location,
                CASE
                    WHEN g.home_team_id = {team_id} THEN g.away_team_id
                    ELSE g.home_team_id
                END as opponent_team_id,
                CASE
                    WHEN g.home_team_id = {team_id} THEN g.away_team_score
                    ELSE g.home_team_score
                END as opponent_score
            FROM games g
            JOIN teams home ON g.home_team_id = home.team_id
            JOIN teams away ON g.away_team_id = away.team_id
            WHERE (g.home_team_id = {team_id} OR g.away_team_id = {team_id})
                AND g.season = '{current_season}'
                AND g.game_status = 'Final'
                AND g.home_team_score IS NOT NULL
            ORDER BY g.game_date
        ),
        position_points AS (
            SELECT
                tg.game_id,
                tg.game_date,
                tg.opponent_abbr,
                tg.location,
                tg.opponent_score,
                COALESCE(glp.position, p.position) as position,
                SUM(pgs.points) as position_points
            FROM team_games tg
            JOIN player_game_stats pgs ON tg.game_id = pgs.game_id
                AND pgs.team_id = tg.opponent_team_id
            JOIN players p ON pgs.player_id = p.player_id
            LEFT JOIN game_lineup_positions glp ON glp.game_date = tg.game_date
                AND glp.team_abbr = tg.opponent_abbr
                AND glp.player_id = pgs.player_id
            WHERE COALESCE(glp.position, p.position) IS NOT NULL
            GROUP BY tg.game_id, tg.game_date, tg.opponent_abbr, tg.location, tg.opponent_score, COALESCE(glp.position, p.position)
        )
        SELECT
            game_id,
            game_date::text,
            opponent_abbr,
            location,
            opponent_score,
            COALESCE(SUM(CASE WHEN position = 'PG' THEN position_points END), 0) as pg_points,
            COALESCE(SUM(CASE WHEN position = 'SG' THEN position_points END), 0) as sg_points,
            COALESCE(SUM(CASE WHEN position = 'SF' THEN position_points END), 0) as sf_points,
            COALESCE(SUM(CASE WHEN position = 'PF' THEN position_points END), 0) as pf_points,
            COALESCE(SUM(CASE WHEN position = 'C' THEN position_points END), 0) as c_points
        FROM position_points
        GROUP BY game_id, game_date, opponent_abbr, location, opponent_score
        ORDER BY game_date
    """

    conn = await get_db_connection()
    rows = await conn.fetch(query)
    await conn.close()

    return [dict(row) for row in rows]


# ============================================================================
# Chart Generation (No Average Line)
# ============================================================================

def create_position_chart_no_avg(
    games: list,
    team_abbr: str,
    position: str,
    figsize: tuple = (12, 4)
) -> Optional[plt.Figure]:
    """
    Create a position chart WITHOUT average line.
    All bars are green (positive color).
    """
    if not games:
        return None

    position = position.upper()
    if position not in POSITION_COLORS:
        return None

    # Setup figure
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=figsize, facecolor=COLORS['background'])
    ax.set_facecolor(COLORS['card_bg'])

    # Extract position points
    key = f'{position.lower()}_points'
    scores = [float(g[key] or 0) for g in games]

    if not scores:
        plt.close(fig)
        return None

    avg_points = np.mean(scores)

    # Bar positions
    x_positions = np.arange(len(games))
    bar_width = 0.7

    # All bars are green (no comparison to average)
    bar_colors = [COLORS['positive']] * len(scores)

    # Calculate chart dimensions
    max_score = max(scores) + 10 if max(scores) > 0 else 50
    y_step = 10
    y_labels = list(range(0, int(max_score) + 1, y_step))

    # Plot bars
    bars = ax.bar(
        x_positions,
        scores,
        width=bar_width,
        color=bar_colors,
        alpha=0.85,
        edgecolor='none'
    )

    # Add value labels
    for bar, score in zip(bars, scores):
        if score > 0:
            ax.annotate(
                f'{int(score)}',
                xy=(bar.get_x() + bar.get_width() / 2, score),
                xytext=(0, 3),
                textcoords="offset points",
                ha='center', va='bottom',
                fontsize=7,
                fontweight='bold',
                color=COLORS['foreground'],
                fontfamily='monospace'
            )

    # White gridlines (subtle)
    for label in y_labels:
        ax.axhline(y=label, color=COLORS['foreground'], linewidth=0.3, alpha=0.15, zorder=1)

    # Configure axes
    ax.set_xlim(-0.5, len(games) - 0.5)
    ax.set_ylim(0, max_score)

    ax.set_xticks(x_positions)
    ax.set_xticklabels(
        [g['opponent_abbr'] for g in games],
        rotation=45, ha='right', fontsize=7, fontfamily='monospace', color=COLORS['gray_500']
    )

    ax.set_yticks(y_labels)
    ax.set_yticklabels(y_labels, fontsize=7, fontfamily='monospace', color=COLORS['gray_500'])

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(COLORS['gray_800'])
    ax.spines['bottom'].set_color(COLORS['gray_800'])

    # Title
    ax.set_title(
        f'{team_abbr} vs {POSITION_NAMES[position]} ({position}) - Avg: {avg_points:.1f} PPG',
        fontsize=10, fontweight='bold', color=POSITION_COLORS[position], pad=8
    )

    plt.tight_layout()
    return fig


def create_team_position_page(
    games: list,
    team_info: dict,
    season: str
) -> Optional[plt.Figure]:
    """
    Create a full page with all 5 position charts for one team.
    """
    if not games:
        return None

    # Create figure with 5 subplots (5 rows, 1 column)
    plt.style.use('dark_background')
    fig, axes = plt.subplots(5, 1, figsize=(14, 16), facecolor=COLORS['background'])

    # Calculate averages for each position
    position_avgs = {}
    for position in POSITIONS:
        key = f'{position.lower()}_points'
        scores = [float(g[key] or 0) for g in games]
        position_avgs[position] = np.mean(scores) if scores else 0

    for idx, position in enumerate(POSITIONS):
        ax = axes[idx]
        ax.set_facecolor(COLORS['card_bg'])

        # Extract position points
        key = f'{position.lower()}_points'
        scores = [float(g[key] or 0) for g in games]
        avg_points = position_avgs[position]

        # Bar positions
        x_positions = np.arange(len(games))
        bar_width = 0.7

        # All bars green
        bar_colors = [COLORS['positive']] * len(scores)

        # Calculate chart dimensions
        max_score = max(scores) + 10 if scores and max(scores) > 0 else 50
        y_step = 10
        y_labels = list(range(0, int(max_score) + 1, y_step))

        # Plot bars
        bars = ax.bar(
            x_positions,
            scores,
            width=bar_width,
            color=bar_colors,
            alpha=0.85,
            edgecolor='none'
        )

        # Add value labels
        for bar, score in zip(bars, scores):
            if score > 0:
                ax.annotate(
                    f'{int(score)}',
                    xy=(bar.get_x() + bar.get_width() / 2, score),
                    xytext=(0, 2),
                    textcoords="offset points",
                    ha='center', va='bottom',
                    fontsize=6,
                    fontweight='bold',
                    color=COLORS['foreground'],
                    fontfamily='monospace'
                )

        # White gridlines
        for label in y_labels:
            ax.axhline(y=label, color=COLORS['foreground'], linewidth=0.3, alpha=0.15, zorder=1)

        # Configure axes
        ax.set_xlim(-0.5, len(games) - 0.5)
        ax.set_ylim(0, max_score)

        ax.set_xticks(x_positions)
        ax.set_xticklabels(
            [g['opponent_abbr'] for g in games],
            rotation=45, ha='right', fontsize=6, fontfamily='monospace', color=COLORS['gray_500']
        )

        ax.set_yticks(y_labels)
        ax.set_yticklabels(y_labels, fontsize=6, fontfamily='monospace', color=COLORS['gray_500'])

        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['left'].set_color(COLORS['gray_800'])
        ax.spines['bottom'].set_color(COLORS['gray_800'])

        # Title with position color
        ax.set_title(
            f'{POSITION_NAMES[position]} ({position}) - Avg: {avg_points:.1f} PPG | {len(games)} games',
            fontsize=9, fontweight='bold', color=POSITION_COLORS[position], pad=5, loc='left'
        )

    # Main title
    fig.suptitle(
        f'{team_info["full_name"]} ({team_info["abbreviation"]}) - Points Allowed by Position',
        fontsize=14, fontweight='bold', color=COLORS['foreground'], y=0.98
    )

    plt.tight_layout(rect=[0, 0, 1, 0.97])
    return fig


def create_rankings_page(
    all_team_data: dict,
    position: str,
    season: str
) -> plt.Figure:
    """
    Create a rankings page for a single position.
    Shows all 30 teams ranked by average PPG allowed.
    """
    position = position.upper()

    # Calculate averages for all teams
    rankings = []
    for team_abbr, data in all_team_data.items():
        games = data['games']
        if not games:
            continue

        key = f'{position.lower()}_points'
        scores = [float(g[key] or 0) for g in games]
        avg = np.mean(scores) if scores else 0
        games_count = len(games)
        rankings.append({
            'team': team_abbr,
            'avg': avg,
            'games': games_count,
            'min': min(scores) if scores else 0,
            'max': max(scores) if scores else 0
        })

    # Sort by average (ascending = best defense)
    rankings.sort(key=lambda x: x['avg'])

    # Create figure
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(14, 10), facecolor=COLORS['background'])
    ax.set_facecolor(COLORS['card_bg'])

    # Bar chart (horizontal)
    y_positions = np.arange(len(rankings))
    avgs = [r['avg'] for r in rankings]
    teams = [r['team'] for r in rankings]

    # Color gradient: green (best) to red (worst)
    colors = []
    for i, _ in enumerate(rankings):
        ratio = i / (len(rankings) - 1) if len(rankings) > 1 else 0
        if ratio < 0.33:
            colors.append(COLORS['positive'])  # Green - best
        elif ratio < 0.67:
            colors.append('#eab308')  # Yellow - middle
        else:
            colors.append(COLORS['negative'])  # Red - worst

    bars = ax.barh(y_positions, avgs, color=colors, alpha=0.85, height=0.7)

    # Add value labels
    for bar, r in zip(bars, rankings):
        width = bar.get_width()
        ax.annotate(
            f'{r["avg"]:.1f} ({r["games"]}g)',
            xy=(width, bar.get_y() + bar.get_height() / 2),
            xytext=(5, 0),
            textcoords="offset points",
            ha='left', va='center',
            fontsize=8,
            color=COLORS['foreground'],
            fontfamily='monospace'
        )

    # Configure axes
    ax.set_yticks(y_positions)
    ax.set_yticklabels(teams, fontsize=9, fontfamily='monospace', color=COLORS['foreground'])
    ax.invert_yaxis()  # Best at top

    ax.set_xlabel('Average Points Allowed', fontsize=10, color=COLORS['gray_400'])

    # Add rank numbers
    for i, (team, r) in enumerate(zip(teams, rankings)):
        ax.annotate(
            f'#{i+1}',
            xy=(0, i),
            xytext=(-35, 0),
            textcoords="offset points",
            ha='right', va='center',
            fontsize=8,
            fontweight='bold',
            color=COLORS['gray_400'],
            fontfamily='monospace'
        )

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(COLORS['gray_800'])
    ax.spines['bottom'].set_color(COLORS['gray_800'])

    # Title
    ax.set_title(
        f'Defense vs {POSITION_NAMES[position]} ({position}) - League Rankings',
        fontsize=14, fontweight='bold', color=POSITION_COLORS[position], pad=15
    )

    # Legend
    legend_elements = [
        mpatches.Patch(color=COLORS['positive'], label='Best Defense (Top 10)'),
        mpatches.Patch(color='#eab308', label='Average Defense (11-20)'),
        mpatches.Patch(color=COLORS['negative'], label='Worst Defense (21-30)')
    ]
    ax.legend(handles=legend_elements, loc='lower right', framealpha=0.8,
              facecolor=COLORS['card_bg'], edgecolor=COLORS['gray_800'])

    plt.tight_layout()
    return fig


def create_summary_page(
    all_team_data: dict,
    season: str
) -> plt.Figure:
    """
    Create a summary page with all position rankings in a table format.
    """
    # Calculate rankings for all positions
    position_rankings = {}
    for position in POSITIONS:
        rankings = []
        for team_abbr, data in all_team_data.items():
            games = data['games']
            if not games:
                continue
            key = f'{position.lower()}_points'
            scores = [float(g[key] or 0) for g in games]
            avg = np.mean(scores) if scores else 0
            rankings.append({'team': team_abbr, 'avg': avg})
        rankings.sort(key=lambda x: x['avg'])
        position_rankings[position] = rankings

    # Create figure
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(14, 10), facecolor=COLORS['background'])
    ax.set_facecolor(COLORS['card_bg'])
    ax.axis('off')

    # Title
    fig.suptitle(
        f'NBA Position Defense Rankings - {season} Season',
        fontsize=18, fontweight='bold', color=COLORS['foreground'], y=0.95
    )

    # Subtitle
    ax.text(0.5, 0.92, 'Lower PPG = Better Defense | Green = Best 5 | Red = Worst 5',
            ha='center', va='top', fontsize=10, color=COLORS['gray_400'],
            transform=ax.transAxes, fontfamily='monospace')

    # Create 5 columns (one per position)
    col_width = 0.18
    start_x = 0.05

    for col_idx, position in enumerate(POSITIONS):
        x = start_x + col_idx * col_width
        rankings = position_rankings[position]

        # Column header
        ax.text(x + col_width/2, 0.85, f'{position}',
                ha='center', va='top', fontsize=14, fontweight='bold',
                color=POSITION_COLORS[position], transform=ax.transAxes)
        ax.text(x + col_width/2, 0.82, POSITION_NAMES[position],
                ha='center', va='top', fontsize=8,
                color=COLORS['gray_400'], transform=ax.transAxes)

        # Rankings
        for i, r in enumerate(rankings[:30]):
            y = 0.78 - i * 0.024

            # Color based on rank
            if i < 5:
                color = COLORS['positive']
            elif i >= 25:
                color = COLORS['negative']
            else:
                color = COLORS['foreground']

            # Rank and team
            ax.text(x, y, f'{i+1:2}. {r["team"]}',
                    ha='left', va='top', fontsize=8,
                    color=color, transform=ax.transAxes, fontfamily='monospace')

            # Average
            ax.text(x + col_width - 0.01, y, f'{r["avg"]:.1f}',
                    ha='right', va='top', fontsize=8,
                    color=color, transform=ax.transAxes, fontfamily='monospace')

    # Footer
    ax.text(0.5, 0.02, f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}',
            ha='center', va='bottom', fontsize=8, color=COLORS['gray_500'],
            transform=ax.transAxes, fontfamily='monospace')

    return fig


# ============================================================================
# Main Report Generation
# ============================================================================

async def generate_report(output_path: Optional[Path] = None) -> Path:
    """
    Generate the full PDF report.
    """
    output_path = output_path or OUTPUT_DIR / f'position_defense_report_{datetime.now().strftime("%Y%m%d_%H%M")}.pdf'
    output_path.parent.mkdir(parents=True, exist_ok=True)

    season = await get_current_season()
    teams = await get_all_teams()

    print(f"\n{'='*60}")
    print(f"NBA Position Defense Report Generator")
    print(f"Season: {season}")
    print(f"Teams: {len(teams)}")
    print(f"{'='*60}\n")

    # Collect data for all teams
    all_team_data = {}

    for i, team in enumerate(teams):
        team_abbr = team['abbreviation']
        print(f"[{i+1:2}/{len(teams)}] Fetching data for {team['full_name']}...", end=' ')

        games = await get_points_by_position(team['team_id'])
        all_team_data[team_abbr] = {
            'team_info': team,
            'games': games
        }
        print(f"{len(games)} games")

    print(f"\n{'='*60}")
    print("Generating PDF report...")
    print(f"{'='*60}\n")

    # Create PDF
    with PdfPages(output_path) as pdf:
        # Page 1: Summary
        print("Creating summary page...")
        fig = create_summary_page(all_team_data, season)
        pdf.savefig(fig, facecolor=COLORS['background'])
        plt.close(fig)

        # Pages 2-6: Position Rankings (one per position)
        for position in POSITIONS:
            print(f"Creating {position} rankings page...")
            fig = create_rankings_page(all_team_data, position, season)
            pdf.savefig(fig, facecolor=COLORS['background'])
            plt.close(fig)

        # Pages 7-36: Team pages (one per team)
        for i, team_abbr in enumerate(sorted(all_team_data.keys())):
            data = all_team_data[team_abbr]
            print(f"[{i+1:2}/30] Creating page for {data['team_info']['full_name']}...")

            if data['games']:
                fig = create_team_position_page(
                    data['games'],
                    data['team_info'],
                    season
                )
                if fig:
                    pdf.savefig(fig, facecolor=COLORS['background'])
                    plt.close(fig)

    print(f"\n{'='*60}")
    print(f"Report generated: {output_path}")
    print(f"{'='*60}\n")

    return output_path


# ============================================================================
# CLI
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Generate NBA Position Defense Report'
    )
    parser.add_argument('--output', '-o', type=str, help='Output PDF path')

    args = parser.parse_args()

    output_path = Path(args.output) if args.output else None

    asyncio.run(generate_report(output_path))


if __name__ == '__main__':
    main()
