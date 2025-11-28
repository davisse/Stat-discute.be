#!/usr/bin/env python3
"""
Export Combined Total Analysis Chart
Generates PNG/SVG images + JSON data matching the frontend visualization.

Usage:
    python export_totals_chart.py --team ATL --line 220 --format png
    python export_totals_chart.py --team ATL --line 220 --format svg --limit 10
    python export_totals_chart.py --team ATL --line 220 --format all
"""

import argparse
import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import asyncpg

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

# ============================================================================
# Configuration
# ============================================================================

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'dbname': 'nba_stats',
    'user': 'chapirou'
}

# Design tokens matching frontend
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

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / 'data' / 'charts'


# ============================================================================
# Database Functions (async with asyncpg)
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
    return row['season_id'] if row else '2024-25'


async def get_team_id(abbreviation: str) -> Optional[int]:
    """Get team_id from abbreviation."""
    conn = await get_db_connection()
    row = await conn.fetchrow(
        "SELECT team_id FROM teams WHERE abbreviation = $1",
        abbreviation.upper()
    )
    await conn.close()
    return row['team_id'] if row else None


async def get_team_games(team_id: int, location: Optional[str] = None, limit: Optional[int] = None) -> list:
    """
    Get team defensive performance data.
    Matches frontend query: getTeamDefensivePerformance
    """
    current_season = await get_current_season()

    location_filter = ""
    if location:
        location_filter = f"AND CASE WHEN g.home_team_id = {team_id} THEN 'HOME' ELSE 'AWAY' END = '{location}'"

    limit_clause = f"LIMIT {limit}" if limit else ""

    query = f"""
        SELECT
            g.game_id,
            g.game_date::text,
            CASE
                WHEN g.home_team_id = {team_id} THEN g.away_team_id
                ELSE g.home_team_id
            END as opponent_id,
            CASE
                WHEN g.home_team_id = {team_id} THEN away.abbreviation
                ELSE home.abbreviation
            END as opponent_abbr,
            CASE
                WHEN g.home_team_id = {team_id} THEN away.full_name
                ELSE home.full_name
            END as opponent_full_name,
            CASE
                WHEN g.home_team_id = {team_id} THEN 'HOME'
                ELSE 'AWAY'
            END as location,
            CASE
                WHEN g.home_team_id = {team_id} THEN g.away_team_score
                ELSE g.home_team_score
            END as opponent_score,
            CASE
                WHEN g.home_team_id = {team_id} THEN g.home_team_score
                ELSE g.away_team_score
            END as team_score,
            CASE
                WHEN g.home_team_id = {team_id} THEN (g.home_team_score - g.away_team_score)
                ELSE (g.away_team_score - g.home_team_score)
            END as point_diff,
            CASE
                WHEN (g.home_team_id = {team_id} AND g.home_team_score > g.away_team_score)
                    OR (g.away_team_id = {team_id} AND g.away_team_score > g.home_team_score)
                THEN 'W'
                ELSE 'L'
            END as result
        FROM games g
        JOIN teams home ON g.home_team_id = home.team_id
        JOIN teams away ON g.away_team_id = away.team_id
        WHERE (g.home_team_id = {team_id} OR g.away_team_id = {team_id})
            AND g.season = '{current_season}'
            AND g.game_status = 'Final'
            AND g.home_team_score IS NOT NULL
            AND g.away_team_score IS NOT NULL
            {location_filter}
        ORDER BY g.game_date DESC
        {limit_clause}
    """

    conn = await get_db_connection()
    rows = await conn.fetch(query)
    await conn.close()

    return [dict(row) for row in rows]


async def get_team_info(team_id: int) -> dict:
    """Get team info."""
    conn = await get_db_connection()
    row = await conn.fetchrow(
        "SELECT team_id, abbreviation, full_name, city FROM teams WHERE team_id = $1",
        team_id
    )
    await conn.close()
    return dict(row) if row else {}


async def get_points_by_position(team_id: int, location: Optional[str] = None, limit: Optional[int] = None) -> list:
    """
    Get points allowed by position for each game.
    Returns opponent players' points grouped by position.
    """
    current_season = await get_current_season()

    location_filter = ""
    if location:
        location_filter = f"AND CASE WHEN g.home_team_id = {team_id} THEN 'HOME' ELSE 'AWAY' END = '{location}'"

    limit_clause = f"LIMIT {limit}" if limit else ""

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
                {location_filter}
            ORDER BY g.game_date DESC
            {limit_clause}
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
# Chart Generation
# ============================================================================

def create_combined_total_chart(
    games: list,
    team_abbr: str,
    total_line: float = 220.0,
    season: str = '2024-25',
    figsize: tuple = (14, 8)
) -> tuple:
    """
    Create Combined Total Analysis chart matching frontend style.

    Returns:
        tuple: (figure, chart_data_dict)
    """
    if not games:
        return None, None

    # Reverse to show chronologically (oldest first) - matches frontend
    games_chrono = list(reversed(games))

    # Calculate combined totals
    games_with_totals = []
    for game in games_chrono:
        combined_total = game['team_score'] + game['opponent_score']
        diff = combined_total - total_line
        vs_line = 'OVER' if combined_total > total_line else 'UNDER' if combined_total < total_line else 'PUSH'
        games_with_totals.append({
            **game,
            'combined_total': combined_total,
            'diff': diff,
            'vs_line': vs_line
        })

    # Calculate statistics
    totals = [g['combined_total'] for g in games_with_totals]
    avg_total = np.mean(totals)
    over_count = sum(1 for g in games_with_totals if g['vs_line'] == 'OVER')
    under_count = sum(1 for g in games_with_totals if g['vs_line'] == 'UNDER')
    over_pct = (over_count / len(games_with_totals)) * 100 if games_with_totals else 0

    # Calculate chart dimensions
    actual_max = max(totals)
    actual_min = min(totals)
    max_total = max(actual_max + 20, total_line + 30, avg_total + 30)
    min_total = max(0, min(actual_min - 20, total_line - 30, avg_total - 30))
    total_range = max_total - min_total

    # Y-axis labels (every 20 points)
    start_label = int(np.floor(min_total / 20) * 20)
    y_labels = list(range(start_label, int(max_total) + 1, 20))

    # Setup figure with dark theme
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=figsize, facecolor=COLORS['background'])
    ax.set_facecolor(COLORS['card_bg'])

    # Bar positions
    x_positions = np.arange(len(games_with_totals))
    bar_width = 0.7

    # Create bars with gradient effect (solid colors for simplicity)
    bar_colors = [
        COLORS['positive'] if g['vs_line'] == 'OVER' else COLORS['negative']
        for g in games_with_totals
    ]

    # Calculate bar heights relative to min_total
    bar_heights = [g['combined_total'] - min_total for g in games_with_totals]

    # Plot bars
    bars = ax.bar(
        x_positions,
        bar_heights,
        bottom=min_total,
        width=bar_width,
        color=bar_colors,
        alpha=0.85,
        edgecolor='none'
    )

    # Add value labels on top of bars
    for i, (bar, game) in enumerate(zip(bars, games_with_totals)):
        height = bar.get_height() + min_total
        ax.annotate(
            f'{game["combined_total"]}',
            xy=(bar.get_x() + bar.get_width() / 2, height),
            xytext=(0, 5),
            textcoords="offset points",
            ha='center', va='bottom',
            fontsize=8,
            fontweight='bold',
            color=COLORS['foreground'],
            fontfamily='monospace'
        )

    # Betting line (solid white)
    ax.axhline(
        y=total_line,
        color=COLORS['foreground'],
        linewidth=2,
        linestyle='-',
        alpha=0.9,
        zorder=5
    )
    ax.annotate(
        f'Line: {total_line:.0f}',
        xy=(0.02, total_line),
        xycoords=('axes fraction', 'data'),
        fontsize=10,
        fontweight='bold',
        color=COLORS['foreground'],
        fontfamily='monospace',
        va='bottom',
        bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card_bg'], edgecolor='none')
    )

    # Average line (dashed gray)
    ax.axhline(
        y=avg_total,
        color=COLORS['gray_400'],
        linewidth=1.5,
        linestyle='--',
        alpha=0.7,
        zorder=5
    )
    ax.annotate(
        f'Avg: {avg_total:.1f}',
        xy=(0.98, avg_total),
        xycoords=('axes fraction', 'data'),
        fontsize=10,
        color=COLORS['gray_400'],
        fontfamily='monospace',
        va='bottom',
        ha='right',
        bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card_bg'], edgecolor='none')
    )

    # Gridlines at Y-axis labels
    for label in y_labels:
        ax.axhline(y=label, color=COLORS['gray_800'], linewidth=0.5, alpha=0.3, zorder=1)

    # Configure axes
    ax.set_xlim(-0.5, len(games_with_totals) - 0.5)
    ax.set_ylim(min_total, max_total)

    # X-axis: opponent abbreviations
    ax.set_xticks(x_positions)
    ax.set_xticklabels(
        [g['opponent_abbr'] for g in games_with_totals],
        rotation=45,
        ha='right',
        fontsize=9,
        fontfamily='monospace',
        color=COLORS['gray_500']
    )

    # Y-axis
    ax.set_yticks(y_labels)
    ax.set_yticklabels(
        y_labels,
        fontsize=9,
        fontfamily='monospace',
        color=COLORS['gray_500']
    )

    # Remove spines except left and bottom
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(COLORS['gray_800'])
    ax.spines['bottom'].set_color(COLORS['gray_800'])

    # Title
    ax.set_title(
        f'Combined Total Points by Game - {team_abbr}',
        fontsize=16,
        fontweight='bold',
        color=COLORS['foreground'],
        pad=20
    )

    # Legend
    over_patch = mpatches.Patch(color=COLORS['positive'], label=f'Over {total_line:.0f}')
    under_patch = mpatches.Patch(color=COLORS['negative'], label=f'Under {total_line:.0f}')
    ax.legend(
        handles=[over_patch, under_patch],
        loc='upper right',
        framealpha=0.8,
        facecolor=COLORS['card_bg'],
        edgecolor=COLORS['gray_800'],
        fontsize=10
    )

    # Add summary stats as text box
    trend_text = 'OVER' if over_pct > 55 else 'UNDER' if over_pct < 45 else 'EVEN'
    trend_color = COLORS['positive'] if over_pct > 55 else COLORS['negative'] if over_pct < 45 else COLORS['gray_400']

    stats_text = (
        f"Avg Total: {avg_total:.1f} ({'+' if avg_total > total_line else ''}{avg_total - total_line:.1f} vs line)\n"
        f"Over: {over_count} ({over_pct:.1f}%)  |  Under: {under_count} ({100-over_pct:.1f}%)\n"
        f"Trend: {trend_text}  |  {len(games_with_totals)} games"
    )

    props = dict(boxstyle='round,pad=0.5', facecolor=COLORS['gray_950'], edgecolor=COLORS['gray_800'], alpha=0.9)
    ax.text(
        0.02, 0.98, stats_text,
        transform=ax.transAxes,
        fontsize=10,
        fontfamily='monospace',
        verticalalignment='top',
        color=COLORS['foreground'],
        bbox=props
    )

    plt.tight_layout()

    # Prepare data for JSON export
    chart_data = {
        'metadata': {
            'team_abbreviation': team_abbr,
            'total_line': total_line,
            'generated_at': datetime.now().isoformat(),
            'season': season
        },
        'statistics': {
            'total_games': len(games_with_totals),
            'average_total': round(avg_total, 1),
            'vs_line_diff': round(avg_total - total_line, 1),
            'over_count': over_count,
            'under_count': under_count,
            'over_percentage': round(over_pct, 1),
            'under_percentage': round(100 - over_pct, 1),
            'trend': trend_text,
            'min_total': min(totals),
            'max_total': max(totals)
        },
        'games': [
            {
                'game_id': g['game_id'],
                'game_date': g['game_date'],
                'opponent_abbr': g['opponent_abbr'],
                'location': g['location'],
                'team_score': g['team_score'],
                'opponent_score': g['opponent_score'],
                'combined_total': g['combined_total'],
                'vs_line': g['vs_line'],
                'diff': g['diff'],
                'result': g['result']
            }
            for g in games_with_totals
        ]
    }

    return fig, chart_data


def create_opponent_scoring_chart(
    games: list,
    team_abbr: str,
    betting_line: Optional[float] = None,
    show_avg_line: bool = True,
    season: str = '2024-25',
    figsize: tuple = (14, 8)
) -> tuple:
    """
    Create Opponent Scoring Chart - Points allowed by the team's defense.
    Green = below average (good defense), Red = above average (poor defense)

    Args:
        games: List of game data
        team_abbr: Team abbreviation
        betting_line: Optional betting line (yellow dashed)
        show_avg_line: Whether to show the average line (default True)
        season: Season string
        figsize: Figure size

    Returns:
        tuple: (figure, chart_data_dict)
    """
    if not games:
        return None, None

    # Reverse to show chronologically (oldest first)
    games_chrono = list(reversed(games))

    # Extract opponent scores
    scores = [g['opponent_score'] for g in games_chrono]
    avg_opponent_ppg = np.mean(scores)

    # Calculate chart dimensions
    actual_max = max(scores)
    actual_min = min(scores)
    max_score = max(actual_max + 10, avg_opponent_ppg + 20)
    if betting_line:
        max_score = max(max_score, betting_line + 15)

    # Y-axis starts at 0 when no avg line, otherwise dynamic
    if show_avg_line:
        min_score = max(0, min(actual_min - 10, avg_opponent_ppg - 20))
        if betting_line:
            min_score = min(min_score, betting_line - 15)
    else:
        min_score = 0
    score_range = max_score - min_score

    # Y-axis labels (every 20 points)
    start_label = int(np.floor(min_score / 20) * 20)
    y_labels = list(range(start_label, int(max_score) + 1, 20))

    # Setup figure
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=figsize, facecolor=COLORS['background'])
    ax.set_facecolor(COLORS['card_bg'])

    # Bar positions
    x_positions = np.arange(len(games_chrono))
    bar_width = 0.7

    # Bar colors: green if below avg (good defense), red if above (poor defense)
    # If no avg line, all bars are green
    if show_avg_line:
        bar_colors = [
            COLORS['positive'] if s < avg_opponent_ppg else COLORS['negative']
            for s in scores
        ]
    else:
        bar_colors = [COLORS['positive']] * len(scores)

    # Calculate bar heights
    bar_heights = [s - min_score for s in scores]

    # Plot bars
    bars = ax.bar(
        x_positions,
        bar_heights,
        bottom=min_score,
        width=bar_width,
        color=bar_colors,
        alpha=0.85,
        edgecolor='none'
    )

    # Add value labels
    for bar, score in zip(bars, scores):
        height = bar.get_height() + min_score
        ax.annotate(
            f'{score}',
            xy=(bar.get_x() + bar.get_width() / 2, height),
            xytext=(0, 5),
            textcoords="offset points",
            ha='center', va='bottom',
            fontsize=8,
            fontweight='bold',
            color=COLORS['foreground'],
            fontfamily='monospace'
        )

    # Average line (white dashed) - optional
    if show_avg_line:
        ax.axhline(
            y=avg_opponent_ppg,
            color=COLORS['foreground'],
            linewidth=1.5,
            linestyle='--',
            alpha=0.7,
            zorder=5
        )
        ax.annotate(
            f'Avg: {avg_opponent_ppg:.1f}',
            xy=(0.98, avg_opponent_ppg),
            xycoords=('axes fraction', 'data'),
            fontsize=10,
            color=COLORS['foreground'],
            fontfamily='monospace',
            va='bottom',
            ha='right',
            bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card_bg'], edgecolor='none')
        )

    # Betting line (yellow dashed) - optional
    if betting_line:
        ax.axhline(
            y=betting_line,
            color='#eab308',  # Yellow
            linewidth=2,
            linestyle='--',
            alpha=0.8,
            zorder=5
        )
        ax.annotate(
            f'Line: {betting_line:.1f}',
            xy=(0.02, betting_line),
            xycoords=('axes fraction', 'data'),
            fontsize=10,
            fontweight='bold',
            color='#eab308',
            fontfamily='monospace',
            va='bottom',
            bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card_bg'], edgecolor='none')
        )

    # Gridlines - white when no avg line, dark gray otherwise
    gridline_color = COLORS['foreground'] if not show_avg_line else COLORS['gray_800']
    gridline_alpha = 0.2 if not show_avg_line else 0.3
    for label in y_labels:
        ax.axhline(y=label, color=gridline_color, linewidth=0.5, alpha=gridline_alpha, zorder=1)

    # Configure axes
    ax.set_xlim(-0.5, len(games_chrono) - 0.5)
    ax.set_ylim(min_score, max_score)

    ax.set_xticks(x_positions)
    ax.set_xticklabels(
        [g['opponent_abbr'] for g in games_chrono],
        rotation=45, ha='right', fontsize=9, fontfamily='monospace', color=COLORS['gray_500']
    )

    ax.set_yticks(y_labels)
    ax.set_yticklabels(y_labels, fontsize=9, fontfamily='monospace', color=COLORS['gray_500'])

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(COLORS['gray_800'])
    ax.spines['bottom'].set_color(COLORS['gray_800'])

    # Title
    ax.set_title(
        f'Opponent Scoring by Game - {team_abbr} Defense',
        fontsize=16, fontweight='bold', color=COLORS['foreground'], pad=20
    )

    # Legend
    handles = []
    if show_avg_line:
        good_patch = mpatches.Patch(color=COLORS['positive'], label='Below Avg (Good Defense)')
        bad_patch = mpatches.Patch(color=COLORS['negative'], label='Above Avg (Poor Defense)')
        handles = [good_patch, bad_patch]
    if betting_line:
        from matplotlib.lines import Line2D
        line_handle = Line2D([0], [0], color='#eab308', linewidth=2, linestyle='--', label='Betting Line')
        handles.append(line_handle)
    if handles:
        ax.legend(handles=handles, loc='upper right', framealpha=0.8, facecolor=COLORS['card_bg'], edgecolor=COLORS['gray_800'])

    # Stats box
    below_avg = sum(1 for s in scores if s < avg_opponent_ppg)
    above_avg = len(scores) - below_avg
    below_pct = (below_avg / len(scores)) * 100

    if betting_line:
        below_line = sum(1 for s in scores if s < betting_line)
        line_stats = f"\nBelow Line: {below_line} ({(below_line/len(scores))*100:.1f}%)"
    else:
        line_stats = ""

    if show_avg_line:
        stats_text = (
            f"Avg Opponent PPG: {avg_opponent_ppg:.1f}\n"
            f"Below Avg: {below_avg} ({below_pct:.1f}%)  |  Above: {above_avg} ({100-below_pct:.1f}%)\n"
            f"{len(games_chrono)} games{line_stats}"
        )
    else:
        stats_text = f"{len(games_chrono)} games{line_stats}"
    props = dict(boxstyle='round,pad=0.5', facecolor=COLORS['gray_950'], edgecolor=COLORS['gray_800'], alpha=0.9)
    ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, fontsize=10, fontfamily='monospace',
            verticalalignment='top', color=COLORS['foreground'], bbox=props)

    plt.tight_layout()

    # Chart data
    chart_data = {
        'metadata': {
            'chart_type': 'opponent_scoring',
            'team_abbreviation': team_abbr,
            'betting_line': betting_line,
            'generated_at': datetime.now().isoformat(),
            'season': season
        },
        'statistics': {
            'total_games': len(games_chrono),
            'average_opponent_ppg': round(avg_opponent_ppg, 1),
            'below_avg_count': below_avg,
            'above_avg_count': above_avg,
            'below_avg_percentage': round(below_pct, 1),
            'min_score': min(scores),
            'max_score': max(scores)
        },
        'games': [
            {
                'game_id': g['game_id'],
                'game_date': g['game_date'],
                'opponent_abbr': g['opponent_abbr'],
                'location': g['location'],
                'opponent_score': g['opponent_score'],
                'team_score': g['team_score'],
                'vs_avg': 'BELOW' if g['opponent_score'] < avg_opponent_ppg else 'ABOVE',
                'result': g['result']
            }
            for g in games_chrono
        ]
    }

    return fig, chart_data


def create_team_scoring_chart(
    games: list,
    team_abbr: str,
    betting_line: Optional[float] = None,
    show_avg_line: bool = True,
    season: str = '2024-25',
    figsize: tuple = (14, 8)
) -> tuple:
    """
    Create Team Scoring Chart - Points scored by the team.
    Green = above average (good offense), Red = below average (poor offense)

    Args:
        games: List of game data
        team_abbr: Team abbreviation
        betting_line: Optional betting line (yellow dashed)
        season: Season string
        figsize: Figure size

    Returns:
        tuple: (figure, chart_data_dict)
    """
    if not games:
        return None, None

    # Reverse to show chronologically (oldest first)
    games_chrono = list(reversed(games))

    # Extract team scores
    scores = [g['team_score'] for g in games_chrono]
    avg_team_ppg = np.mean(scores)

    # Calculate chart dimensions
    actual_max = max(scores)
    actual_min = min(scores)
    max_score = max(actual_max + 10, avg_team_ppg + 20)
    if betting_line:
        max_score = max(max_score, betting_line + 15)

    # Y-axis starts at 0 when no avg line, otherwise dynamic
    if show_avg_line:
        min_score = max(0, min(actual_min - 10, avg_team_ppg - 20))
        if betting_line:
            min_score = min(min_score, betting_line - 15)
    else:
        min_score = 0
    score_range = max_score - min_score

    # Y-axis labels (every 20 points)
    start_label = int(np.floor(min_score / 20) * 20)
    y_labels = list(range(start_label, int(max_score) + 1, 20))

    # Setup figure
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=figsize, facecolor=COLORS['background'])
    ax.set_facecolor(COLORS['card_bg'])

    # Bar positions
    x_positions = np.arange(len(games_chrono))
    bar_width = 0.7

    # Bar colors: green if above avg (good offense), red if below (poor offense)
    # If no avg line, all bars are green
    if show_avg_line:
        bar_colors = [
            COLORS['positive'] if s >= avg_team_ppg else COLORS['negative']
            for s in scores
        ]
    else:
        bar_colors = [COLORS['positive']] * len(scores)

    # Calculate bar heights
    bar_heights = [s - min_score for s in scores]

    # Plot bars
    bars = ax.bar(
        x_positions,
        bar_heights,
        bottom=min_score,
        width=bar_width,
        color=bar_colors,
        alpha=0.85,
        edgecolor='none'
    )

    # Add value labels
    for bar, score in zip(bars, scores):
        height = bar.get_height() + min_score
        ax.annotate(
            f'{score}',
            xy=(bar.get_x() + bar.get_width() / 2, height),
            xytext=(0, 5),
            textcoords="offset points",
            ha='center', va='bottom',
            fontsize=8,
            fontweight='bold',
            color=COLORS['foreground'],
            fontfamily='monospace'
        )

    # Average line (white dashed) - optional
    if show_avg_line:
        ax.axhline(
            y=avg_team_ppg,
            color=COLORS['foreground'],
            linewidth=1.5,
            linestyle='--',
            alpha=0.7,
            zorder=5
        )
        ax.annotate(
            f'Avg: {avg_team_ppg:.1f}',
            xy=(0.98, avg_team_ppg),
            xycoords=('axes fraction', 'data'),
            fontsize=10,
            color=COLORS['foreground'],
            fontfamily='monospace',
            va='bottom',
            ha='right',
            bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card_bg'], edgecolor='none')
        )

    # Betting line (yellow dashed) - optional
    if betting_line:
        ax.axhline(
            y=betting_line,
            color='#eab308',  # Yellow
            linewidth=2,
            linestyle='--',
            alpha=0.8,
            zorder=5
        )
        ax.annotate(
            f'Line: {betting_line:.1f}',
            xy=(0.02, betting_line),
            xycoords=('axes fraction', 'data'),
            fontsize=10,
            fontweight='bold',
            color='#eab308',
            fontfamily='monospace',
            va='bottom',
            bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card_bg'], edgecolor='none')
        )

    # Gridlines - white when no avg line, dark gray otherwise
    gridline_color = COLORS['foreground'] if not show_avg_line else COLORS['gray_800']
    gridline_alpha = 0.2 if not show_avg_line else 0.3
    for label in y_labels:
        ax.axhline(y=label, color=gridline_color, linewidth=0.5, alpha=gridline_alpha, zorder=1)

    # Configure axes
    ax.set_xlim(-0.5, len(games_chrono) - 0.5)
    ax.set_ylim(min_score, max_score)

    ax.set_xticks(x_positions)
    ax.set_xticklabels(
        [g['opponent_abbr'] for g in games_chrono],
        rotation=45, ha='right', fontsize=9, fontfamily='monospace', color=COLORS['gray_500']
    )

    ax.set_yticks(y_labels)
    ax.set_yticklabels(y_labels, fontsize=9, fontfamily='monospace', color=COLORS['gray_500'])

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(COLORS['gray_800'])
    ax.spines['bottom'].set_color(COLORS['gray_800'])

    # Title
    ax.set_title(
        f'Team Scoring by Game - {team_abbr} Offense',
        fontsize=16, fontweight='bold', color=COLORS['foreground'], pad=20
    )

    # Legend
    handles = []
    if show_avg_line:
        good_patch = mpatches.Patch(color=COLORS['positive'], label='Above Avg (Good Offense)')
        bad_patch = mpatches.Patch(color=COLORS['negative'], label='Below Avg (Poor Offense)')
        handles = [good_patch, bad_patch]
    if betting_line:
        from matplotlib.lines import Line2D
        line_handle = Line2D([0], [0], color='#eab308', linewidth=2, linestyle='--', label='Betting Line')
        handles.append(line_handle)
    if handles:
        ax.legend(handles=handles, loc='upper right', framealpha=0.8, facecolor=COLORS['card_bg'], edgecolor=COLORS['gray_800'])

    # Stats box
    above_avg = sum(1 for s in scores if s >= avg_team_ppg)
    below_avg = len(scores) - above_avg
    above_pct = (above_avg / len(scores)) * 100

    if betting_line:
        above_line = sum(1 for s in scores if s >= betting_line)
        line_stats = f"\nAbove Line: {above_line} ({(above_line/len(scores))*100:.1f}%)"
    else:
        line_stats = ""

    if show_avg_line:
        stats_text = (
            f"Avg Team PPG: {avg_team_ppg:.1f}\n"
            f"Above Avg: {above_avg} ({above_pct:.1f}%)  |  Below: {below_avg} ({100-above_pct:.1f}%)\n"
            f"{len(games_chrono)} games{line_stats}"
        )
    else:
        stats_text = f"{len(games_chrono)} games{line_stats}"
    props = dict(boxstyle='round,pad=0.5', facecolor=COLORS['gray_950'], edgecolor=COLORS['gray_800'], alpha=0.9)
    ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, fontsize=10, fontfamily='monospace',
            verticalalignment='top', color=COLORS['foreground'], bbox=props)

    plt.tight_layout()

    # Chart data
    chart_data = {
        'metadata': {
            'chart_type': 'team_scoring',
            'team_abbreviation': team_abbr,
            'betting_line': betting_line,
            'generated_at': datetime.now().isoformat(),
            'season': season
        },
        'statistics': {
            'total_games': len(games_chrono),
            'average_team_ppg': round(avg_team_ppg, 1),
            'above_avg_count': above_avg,
            'below_avg_count': below_avg,
            'above_avg_percentage': round(above_pct, 1),
            'min_score': min(scores),
            'max_score': max(scores)
        },
        'games': [
            {
                'game_id': g['game_id'],
                'game_date': g['game_date'],
                'opponent_abbr': g['opponent_abbr'],
                'location': g['location'],
                'team_score': g['team_score'],
                'opponent_score': g['opponent_score'],
                'vs_avg': 'ABOVE' if g['team_score'] >= avg_team_ppg else 'BELOW',
                'result': g['result']
            }
            for g in games_chrono
        ]
    }

    return fig, chart_data


def create_points_by_position_chart(
    games: list,
    team_abbr: str,
    season: str = '2024-25',
    figsize: tuple = (14, 8)
) -> tuple:
    """
    Create Points Allowed by Position stacked bar chart.
    Shows how many points each position (PG, SG, SF, PF, C) scores against the team's defense.

    Args:
        games: List of game data with position points
        team_abbr: Team abbreviation
        season: Season string
        figsize: Figure size

    Returns:
        tuple: (figure, chart_data_dict)
    """
    if not games:
        return None, None

    # Position colors - distinct colors for each position
    POSITION_COLORS = {
        'PG': '#3b82f6',  # Blue
        'SG': '#8b5cf6',  # Purple
        'SF': '#ec4899',  # Pink
        'PF': '#f97316',  # Orange
        'C': '#10b981',   # Green
    }

    POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

    # Setup figure
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=figsize, facecolor=COLORS['background'])
    ax.set_facecolor(COLORS['card_bg'])

    # Bar positions
    x_positions = np.arange(len(games))
    bar_width = 0.7

    # Create stacked bars
    bottoms = np.zeros(len(games))

    for position in POSITIONS:
        key = f'{position.lower()}_points'
        values = [float(g[key] or 0) for g in games]  # Convert to float, handle None

        bars = ax.bar(
            x_positions,
            values,
            bottom=bottoms,
            width=bar_width,
            label=position,
            color=POSITION_COLORS[position],
            edgecolor='none',
            alpha=0.9
        )

        bottoms += np.array(values)

    # Calculate totals for each game (for Y-axis scaling)
    totals = [sum(float(g[f'{pos.lower()}_points'] or 0) for pos in POSITIONS) for g in games]
    max_total = max(totals) if totals else 150
    avg_total = np.mean(totals)

    # Y-axis configuration
    max_score = max_total + 20
    y_step = 20
    y_labels = list(range(0, int(max_score) + 1, y_step))

    # Gridlines (white, subtle)
    for label in y_labels:
        ax.axhline(y=label, color=COLORS['foreground'], linewidth=0.5, alpha=0.15, zorder=1)

    # Average line
    ax.axhline(
        y=avg_total,
        color=COLORS['foreground'],
        linewidth=1.5,
        linestyle='--',
        alpha=0.7,
        zorder=5
    )
    ax.annotate(
        f'Avg: {avg_total:.1f}',
        xy=(0.98, avg_total),
        xycoords=('axes fraction', 'data'),
        fontsize=10,
        color=COLORS['foreground'],
        fontfamily='monospace',
        va='bottom',
        ha='right',
        bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card_bg'], edgecolor='none')
    )

    # Add total labels on top of each bar
    for i, total in enumerate(totals):
        ax.annotate(
            f'{int(total)}',
            xy=(x_positions[i], total),
            xytext=(0, 5),
            textcoords="offset points",
            ha='center', va='bottom',
            fontsize=8,
            fontweight='bold',
            color=COLORS['foreground'],
            fontfamily='monospace'
        )

    # Configure axes
    ax.set_xlim(-0.5, len(games) - 0.5)
    ax.set_ylim(0, max_score)

    ax.set_xticks(x_positions)
    ax.set_xticklabels(
        [g['opponent_abbr'] for g in games],
        rotation=45, ha='right', fontsize=9, fontfamily='monospace', color=COLORS['gray_500']
    )

    ax.set_yticks(y_labels)
    ax.set_yticklabels(y_labels, fontsize=9, fontfamily='monospace', color=COLORS['gray_500'])

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(COLORS['gray_800'])
    ax.spines['bottom'].set_color(COLORS['gray_800'])

    # Title
    ax.set_title(
        f'Points Allowed by Position - {team_abbr} Defense',
        fontsize=16, fontweight='bold', color=COLORS['foreground'], pad=20
    )

    # Legend
    handles = [mpatches.Patch(color=POSITION_COLORS[pos], label=pos) for pos in POSITIONS]
    ax.legend(handles=handles, loc='upper right', framealpha=0.8,
              facecolor=COLORS['card_bg'], edgecolor=COLORS['gray_800'],
              ncol=5)

    # Stats box - average points by position
    avg_by_position = {
        pos: np.mean([float(g[f'{pos.lower()}_points'] or 0) for g in games])
        for pos in POSITIONS
    }

    stats_text = (
        f"Avg Points Allowed by Position:\n"
        f"PG: {avg_by_position['PG']:.1f}  |  SG: {avg_by_position['SG']:.1f}  |  SF: {avg_by_position['SF']:.1f}\n"
        f"PF: {avg_by_position['PF']:.1f}  |  C: {avg_by_position['C']:.1f}\n"
        f"{len(games)} games  |  Avg Total: {avg_total:.1f}"
    )
    props = dict(boxstyle='round,pad=0.5', facecolor=COLORS['gray_950'], edgecolor=COLORS['gray_800'], alpha=0.9)
    ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, fontsize=10, fontfamily='monospace',
            verticalalignment='top', color=COLORS['foreground'], bbox=props)

    plt.tight_layout()

    # Chart data
    chart_data = {
        'metadata': {
            'chart_type': 'points_by_position',
            'team_abbreviation': team_abbr,
            'generated_at': datetime.now().isoformat(),
            'season': season
        },
        'statistics': {
            'total_games': len(games),
            'average_total': round(avg_total, 1),
            'average_by_position': {pos: round(avg_by_position[pos], 1) for pos in POSITIONS},
            'min_total': min(totals),
            'max_total': max(totals)
        },
        'games': [
            {
                'game_id': g['game_id'],
                'game_date': g['game_date'],
                'opponent_abbr': g['opponent_abbr'],
                'location': g['location'],
                'opponent_score': g['opponent_score'],
                'pg_points': g['pg_points'],
                'sg_points': g['sg_points'],
                'sf_points': g['sf_points'],
                'pf_points': g['pf_points'],
                'c_points': g['c_points'],
                'total_position_points': sum(float(g[f'{pos.lower()}_points'] or 0) for pos in POSITIONS)
            }
            for g in games
        ]
    }

    return fig, chart_data


def create_single_position_chart(
    games: list,
    team_abbr: str,
    position: str,
    season: str = '2024-25',
    figsize: tuple = (14, 6)
) -> tuple:
    """
    Create a chart for a single position showing points allowed per game.

    Args:
        games: List of game data with position points
        team_abbr: Team abbreviation
        position: Position to chart (PG, SG, SF, PF, C)
        season: Season string
        figsize: Figure size

    Returns:
        tuple: (figure, chart_data_dict)
    """
    if not games:
        return None, None

    # Position colors
    POSITION_COLORS = {
        'PG': '#3b82f6',  # Blue
        'SG': '#8b5cf6',  # Purple
        'SF': '#ec4899',  # Pink
        'PF': '#f97316',  # Orange
        'C': '#10b981',   # Green
    }

    position = position.upper()
    if position not in POSITION_COLORS:
        raise ValueError(f"Invalid position: {position}")

    # Setup figure
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=figsize, facecolor=COLORS['background'])
    ax.set_facecolor(COLORS['card_bg'])

    # Extract position points
    key = f'{position.lower()}_points'
    scores = [float(g[key] or 0) for g in games]
    avg_points = np.mean(scores)

    # Bar positions
    x_positions = np.arange(len(games))
    bar_width = 0.7

    # Bar colors: green if below avg, red if above
    bar_colors = [
        COLORS['positive'] if s <= avg_points else COLORS['negative']
        for s in scores
    ]

    # Calculate chart dimensions
    max_score = max(scores) + 10 if scores else 50
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
                xytext=(0, 5),
                textcoords="offset points",
                ha='center', va='bottom',
                fontsize=8,
                fontweight='bold',
                color=COLORS['foreground'],
                fontfamily='monospace'
            )

    # Average line
    ax.axhline(
        y=avg_points,
        color=POSITION_COLORS[position],
        linewidth=2,
        linestyle='--',
        alpha=0.8,
        zorder=5
    )
    ax.annotate(
        f'Avg: {avg_points:.1f}',
        xy=(0.98, avg_points),
        xycoords=('axes fraction', 'data'),
        fontsize=10,
        fontweight='bold',
        color=POSITION_COLORS[position],
        fontfamily='monospace',
        va='bottom',
        ha='right',
        bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card_bg'], edgecolor='none')
    )

    # Gridlines
    for label in y_labels:
        ax.axhline(y=label, color=COLORS['gray_800'], linewidth=0.5, alpha=0.3, zorder=1)

    # Configure axes
    ax.set_xlim(-0.5, len(games) - 0.5)
    ax.set_ylim(0, max_score)

    ax.set_xticks(x_positions)
    ax.set_xticklabels(
        [g['opponent_abbr'] for g in games],
        rotation=45, ha='right', fontsize=9, fontfamily='monospace', color=COLORS['gray_500']
    )

    ax.set_yticks(y_labels)
    ax.set_yticklabels(y_labels, fontsize=9, fontfamily='monospace', color=COLORS['gray_500'])

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(COLORS['gray_800'])
    ax.spines['bottom'].set_color(COLORS['gray_800'])

    # Position full names
    position_names = {
        'PG': 'Point Guards',
        'SG': 'Shooting Guards',
        'SF': 'Small Forwards',
        'PF': 'Power Forwards',
        'C': 'Centers'
    }

    # Title with position color
    ax.set_title(
        f'Points Allowed to {position_names[position]} ({position}) - {team_abbr} Defense',
        fontsize=14, fontweight='bold', color=POSITION_COLORS[position], pad=15
    )

    # Stats box
    games_with_points = sum(1 for s in scores if s > 0)
    below_avg = sum(1 for s in scores if s <= avg_points)

    stats_text = (
        f"Avg: {avg_points:.1f} PPG  |  {len(games)} games\n"
        f"Games with {position} points: {games_with_points}\n"
        f"Below avg: {below_avg} ({below_avg/len(games)*100:.0f}%)"
    )
    props = dict(boxstyle='round,pad=0.5', facecolor=COLORS['gray_950'], edgecolor=COLORS['gray_800'], alpha=0.9)
    ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, fontsize=9, fontfamily='monospace',
            verticalalignment='top', color=COLORS['foreground'], bbox=props)

    plt.tight_layout()

    # Chart data
    chart_data = {
        'metadata': {
            'chart_type': f'position_{position.lower()}',
            'position': position,
            'team_abbreviation': team_abbr,
            'generated_at': datetime.now().isoformat(),
            'season': season
        },
        'statistics': {
            'total_games': len(games),
            'average_points': round(avg_points, 1),
            'max_points': max(scores),
            'min_points': min(scores),
            'games_with_points': games_with_points
        },
        'games': [
            {
                'game_id': g['game_id'],
                'game_date': g['game_date'],
                'opponent_abbr': g['opponent_abbr'],
                'location': g['location'],
                'points': float(g[key] or 0)
            }
            for g in games
        ]
    }

    return fig, chart_data


# ============================================================================
# Export Functions
# ============================================================================

async def export_chart(
    team_abbr: str,
    chart_type: str = 'totals',
    betting_line: Optional[float] = None,
    show_avg_line: bool = True,
    location: Optional[str] = None,
    limit: Optional[int] = None,
    output_format: str = 'png',
    output_dir: Optional[Path] = None
) -> dict:
    """
    Export chart to file(s).

    Args:
        team_abbr: Team abbreviation (e.g., 'ATL')
        chart_type: 'totals', 'opponent', or 'team'
        betting_line: Betting line (for totals: over/under; for others: optional)
        show_avg_line: Show average line on chart (default True)
        location: Filter by 'HOME' or 'AWAY'
        limit: Limit number of games
        output_format: 'png', 'svg', 'json', or 'all'
        output_dir: Output directory (defaults to data/charts/)

    Returns:
        dict with paths to exported files
    """
    output_dir = output_dir or OUTPUT_DIR
    output_dir.mkdir(parents=True, exist_ok=True)

    # Get team data
    team_id = await get_team_id(team_abbr)
    if not team_id:
        raise ValueError(f"Team not found: {team_abbr}")

    team_info = await get_team_info(team_id)
    games = await get_team_games(team_id, location=location, limit=limit)
    current_season = await get_current_season()

    if not games:
        raise ValueError(f"No games found for team: {team_abbr}")

    print(f"Found {len(games)} games for {team_info['full_name']}")

    # Generate chart based on type
    if chart_type == 'totals':
        line = betting_line if betting_line else 220.0
        fig, chart_data = create_combined_total_chart(
            games=games,
            team_abbr=team_abbr,
            total_line=line,
            season=current_season
        )
        chart_prefix = 'totals'
    elif chart_type == 'opponent':
        fig, chart_data = create_opponent_scoring_chart(
            games=games,
            team_abbr=team_abbr,
            betting_line=betting_line,
            show_avg_line=show_avg_line,
            season=current_season
        )
        chart_prefix = 'opponent_scoring'
    elif chart_type == 'team':
        fig, chart_data = create_team_scoring_chart(
            games=games,
            team_abbr=team_abbr,
            betting_line=betting_line,
            show_avg_line=show_avg_line,
            season=current_season
        )
        chart_prefix = 'team_scoring'
    elif chart_type == 'position':
        # Need different data source for position chart
        position_games = await get_points_by_position(team_id, location=location, limit=limit)
        if not position_games:
            raise ValueError(f"No position data found for team: {team_abbr}")
        print(f"Found {len(position_games)} games with position data")
        fig, chart_data = create_points_by_position_chart(
            games=position_games,
            team_abbr=team_abbr,
            season=current_season
        )
        chart_prefix = 'points_by_position'
    elif chart_type.startswith('position-'):
        # Individual position chart (e.g., position-pg, position-sf)
        position = chart_type.split('-')[1].upper()
        position_games = await get_points_by_position(team_id, location=location, limit=limit)
        if not position_games:
            raise ValueError(f"No position data found for team: {team_abbr}")
        print(f"Found {len(position_games)} games with position data")
        fig, chart_data = create_single_position_chart(
            games=position_games,
            team_abbr=team_abbr,
            position=position,
            season=current_season
        )
        chart_prefix = f'position_{position.lower()}'
    else:
        raise ValueError(f"Unknown chart type: {chart_type}")

    if fig is None:
        raise ValueError("Failed to create chart")

    # Build filename
    timestamp = datetime.now().strftime('%Y%m%d')
    location_suffix = f"_{location.lower()}" if location else ""
    limit_suffix = f"_last{limit}" if limit else ""
    line_suffix = f"_line{int(betting_line)}" if betting_line and chart_type != 'totals' else ""
    noavg_suffix = "_noavg" if not show_avg_line else ""
    base_name = f"{chart_prefix}_{team_abbr}{location_suffix}{limit_suffix}{line_suffix}{noavg_suffix}_{timestamp}"

    exported_files = {}

    # Export based on format
    formats_to_export = ['png', 'svg', 'json'] if output_format == 'all' else [output_format]

    for fmt in formats_to_export:
        if fmt == 'png':
            path = output_dir / f"{base_name}.png"
            fig.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['background'])
            exported_files['png'] = str(path)
            print(f"  PNG: {path}")

        elif fmt == 'svg':
            path = output_dir / f"{base_name}.svg"
            fig.savefig(path, format='svg', bbox_inches='tight', facecolor=COLORS['background'])
            exported_files['svg'] = str(path)
            print(f"  SVG: {path}")

        elif fmt == 'json':
            path = output_dir / f"{base_name}.json"
            with open(path, 'w') as f:
                json.dump(chart_data, f, indent=2, default=str)
            exported_files['json'] = str(path)
            print(f"  JSON: {path}")

    plt.close(fig)

    return {
        'team': team_info,
        'files': exported_files,
        'data': chart_data,
        'chart_type': chart_type
    }


# ============================================================================
# CLI Interface
# ============================================================================

async def list_teams():
    """List all available teams."""
    conn = await get_db_connection()
    rows = await conn.fetch("""
        SELECT abbreviation, full_name
        FROM teams
        WHERE team_id <= 1610612766
        ORDER BY abbreviation
    """)
    await conn.close()

    print("\nAvailable Teams:")
    print("-" * 40)
    for row in rows:
        print(f"  {row['abbreviation']:4} - {row['full_name']}")


async def async_main(args):
    """Async main function."""
    # List teams mode
    if args.list_teams:
        await list_teams()
        return

    # Validate team argument
    if not args.team:
        print("Error: --team is required (use --list-teams to see available teams)")
        sys.exit(1)

    # Export
    try:
        output_dir = Path(args.output_dir) if args.output_dir else None
        result = await export_chart(
            team_abbr=args.team.upper(),
            chart_type=args.type,
            betting_line=args.line,
            show_avg_line=not args.no_avg,
            location=args.location,
            limit=args.limit,
            output_format=args.format,
            output_dir=output_dir
        )

        print(f"\n✅ Export complete for {result['team']['full_name']}")
        print(f"Chart type: {result['chart_type']}")
        print(f"\nStatistics:")
        stats = result['data']['statistics']
        print(f"  - Games: {stats['total_games']}")

        # Display stats based on chart type
        if result['chart_type'] == 'totals':
            print(f"  - Avg Total: {stats['average_total']} ({'+' if stats['vs_line_diff'] > 0 else ''}{stats['vs_line_diff']} vs line)")
            print(f"  - Over: {stats['over_count']} ({stats['over_percentage']}%)")
            print(f"  - Under: {stats['under_count']} ({stats['under_percentage']}%)")
            print(f"  - Trend: {stats['trend']}")
        elif result['chart_type'] == 'opponent':
            print(f"  - Avg Opponent PPG: {stats['average_opponent_ppg']}")
            print(f"  - Below Avg (Good D): {stats['below_avg_count']} ({stats['below_avg_percentage']}%)")
            print(f"  - Above Avg (Poor D): {stats['above_avg_count']} ({100 - stats['below_avg_percentage']:.1f}%)")
        elif result['chart_type'] == 'team':
            print(f"  - Avg Team PPG: {stats['average_team_ppg']}")
            print(f"  - Above Avg (Good O): {stats['above_avg_count']} ({stats['above_avg_percentage']}%)")
            print(f"  - Below Avg (Poor O): {stats['below_avg_count']} ({100 - stats['above_avg_percentage']:.1f}%)")
        elif result['chart_type'] == 'points_by_position':
            print(f"  - Avg Total Allowed: {stats['average_total']}")
            print(f"  - Avg by Position:")
            for pos, avg in stats['average_by_position'].items():
                print(f"      {pos}: {avg}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description='Export NBA Team Scoring Charts',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Chart Types:
  totals   - Combined total points (team + opponent) vs betting line
  opponent - Opponent scoring (defense analysis) with optional line
  team     - Team scoring (offense analysis) with optional line
  position - Points allowed by position (PG, SG, SF, PF, C stacked bar chart)

Examples:
  # Combined totals chart
  python export_totals_chart.py --team ATL --type totals --line 225

  # Opponent scoring (defense) - no line
  python export_totals_chart.py --team ATL --type opponent

  # Opponent scoring with betting line
  python export_totals_chart.py --team ATL --type opponent --line 112

  # Team scoring (offense) - no line
  python export_totals_chart.py --team ATL --type team

  # Team scoring with betting line
  python export_totals_chart.py --team ATL --type team --line 115

  # Charts without average line (bars only)
  python export_totals_chart.py --team ATL --type opponent --no-avg
  python export_totals_chart.py --team ATL --type team --no-avg

  # Points allowed by position (stacked bar chart)
  python export_totals_chart.py --team ATL --type position
  python export_totals_chart.py --team BOS --type position --location HOME

  # Filter by location
  python export_totals_chart.py --team ATL --type opponent --location HOME

  # Limit to last N games
  python export_totals_chart.py --team ATL --type team --limit 10

  # List available teams
  python export_totals_chart.py --list-teams
        """
    )

    parser.add_argument('--team', '-t', type=str, help='Team abbreviation (e.g., ATL, BOS, LAL)')
    parser.add_argument('--type', type=str, default='totals',
                       choices=['totals', 'opponent', 'team', 'position', 'position-pg', 'position-sg', 'position-sf', 'position-pf', 'position-c'],
                       help='Chart type: totals, opponent, team, or position (default: totals)')
    parser.add_argument('--line', '-l', type=float, default=None,
                       help='Betting line (required for totals, optional for opponent/team)')
    parser.add_argument('--no-avg', action='store_true',
                       help='Hide average line (show bars only)')
    parser.add_argument('--location', type=str, choices=['HOME', 'AWAY'], help='Filter by location')
    parser.add_argument('--limit', type=int, help='Limit number of games')
    parser.add_argument('--format', '-f', type=str, default='all',
                       choices=['png', 'svg', 'json', 'all'], help='Output format (default: all)')
    parser.add_argument('--output-dir', '-o', type=str, help='Output directory')
    parser.add_argument('--list-teams', action='store_true', help='List all available teams')

    args = parser.parse_args()
    asyncio.run(async_main(args))


if __name__ == '__main__':
    main()
