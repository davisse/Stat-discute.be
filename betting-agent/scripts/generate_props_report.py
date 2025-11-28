#!/usr/bin/env python3
"""
NBA Player Props Analysis Report Generator
Generates detailed PDF reports for top betting picks with charts and analysis.
"""

import asyncio
import asyncpg
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import matplotlib.patches as mpatches
import numpy as np

# Configuration
DARK_BG = '#0a0a0a'
CARD_BG = '#1a1a1a'
GREEN = '#22c55e'
RED = '#ef4444'
GOLD = '#fbbf24'
GRAY = '#6b7280'
WHITE = '#ffffff'
LIGHT_GRAY = '#9ca3af'

DB_CONFIG = {
    'host': 'localhost',
    'database': 'nba_stats',
    'user': 'chapirou'
}


class PlayerPropsReport:
    """Generate detailed player props analysis reports."""

    def __init__(self):
        self.conn = None
        self.season = '2025-26'

    async def connect(self):
        """Establish database connection."""
        self.conn = await asyncpg.connect(**DB_CONFIG)

    async def close(self):
        """Close database connection."""
        if self.conn:
            await self.conn.close()

    async def get_player_game_log(self, player_name: str) -> List[Dict]:
        """Get player's game-by-game scoring this season."""
        rows = await self.conn.fetch("""
            SELECT
                g.game_date,
                CASE WHEN g.home_team_id = t.team_id THEN at.abbreviation
                     ELSE ht.abbreviation END as opponent,
                CASE WHEN g.home_team_id = t.team_id THEN 'HOME' ELSE 'AWAY' END as location,
                pgs.points,
                pgs.minutes
            FROM player_game_stats pgs
            JOIN players p ON pgs.player_id = p.player_id
            JOIN games g ON pgs.game_id = g.game_id
            JOIN teams t ON pgs.team_id = t.team_id
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE p.full_name ILIKE $1
            AND g.season = $2
            ORDER BY g.game_date
        """, f'%{player_name}%', self.season)

        return [dict(r) for r in rows]

    async def get_position_defense_log(self, team_abbr: str, position: str) -> List[Dict]:
        """Get team's defensive performance against a position."""
        rows = await self.conn.fetch("""
            WITH position_games AS (
                SELECT
                    g.game_id,
                    g.game_date,
                    CASE WHEN g.home_team_id = t.team_id THEN at.abbreviation
                         ELSE ht.abbreviation END as opponent,
                    SUM(pgs.points) as points_allowed,
                    -- Get the top scorer at this position (starter proxy)
                    MAX(pgs.points) as starter_points
                FROM games g
                JOIN teams t ON t.abbreviation = $1
                JOIN teams ht ON g.home_team_id = ht.team_id
                JOIN teams at ON g.away_team_id = at.team_id
                JOIN player_game_stats pgs ON pgs.game_id = g.game_id
                JOIN players p ON pgs.player_id = p.player_id
                WHERE g.season = $3
                AND p.position = $2
                AND (
                    (g.home_team_id = t.team_id AND pgs.team_id = g.away_team_id)
                    OR (g.away_team_id = t.team_id AND pgs.team_id = g.home_team_id)
                )
                GROUP BY g.game_id, g.game_date, t.team_id, ht.abbreviation, at.abbreviation
            )
            SELECT game_date, opponent, points_allowed, starter_points
            FROM position_games
            WHERE points_allowed > 0
            ORDER BY game_date
        """, team_abbr, position, self.season)

        return [dict(r) for r in rows]

    async def get_position_defense_rank(self, position: str) -> List[Dict]:
        """Get all teams ranked by position defense (starter PPG allowed)."""
        rows = await self.conn.fetch("""
            WITH game_position_scorers AS (
                SELECT
                    g.game_id,
                    CASE
                        WHEN pgs.team_id = g.home_team_id THEN g.away_team_id
                        ELSE g.home_team_id
                    END as defending_team_id,
                    pgs.points,
                    ROW_NUMBER() OVER (
                        PARTITION BY g.game_id,
                        CASE WHEN pgs.team_id = g.home_team_id THEN g.away_team_id ELSE g.home_team_id END
                        ORDER BY pgs.points DESC
                    ) as rank_in_game
                FROM player_game_stats pgs
                JOIN games g ON pgs.game_id = g.game_id
                JOIN players p ON pgs.player_id = p.player_id
                WHERE g.season = $1 AND p.position = $2 AND pgs.points > 0
            ),
            game_splits AS (
                SELECT defending_team_id,
                    SUM(CASE WHEN rank_in_game = 1 THEN points ELSE 0 END) as starter_points
                FROM game_position_scorers
                GROUP BY defending_team_id, game_id
            )
            SELECT t.abbreviation, ROUND(AVG(gs.starter_points), 1) as starter_ppg
            FROM game_splits gs
            JOIN teams t ON gs.defending_team_id = t.team_id
            GROUP BY t.team_id, t.abbreviation
            ORDER BY AVG(gs.starter_points) DESC
        """, self.season, position)

        return [{'team': r['abbreviation'], 'ppg': float(r['starter_ppg']), 'rank': i+1}
                for i, r in enumerate(rows)]

    def create_player_scoring_chart(self, ax, game_log: List[Dict], line: float,
                                    player_name: str, bet_type: str = 'OVER'):
        """Create player scoring bar chart with betting line."""
        ax.set_facecolor(CARD_BG)

        if not game_log:
            ax.text(0.5, 0.5, 'No data available', ha='center', va='center',
                   color=WHITE, fontsize=12)
            return 0, 0

        games = len(game_log)
        x = np.arange(games)
        points = [g['points'] for g in game_log]
        opponents = [g['opponent'] for g in game_log]

        # Color bars based on line
        if bet_type == 'OVER':
            colors = [GREEN if p > line else RED for p in points]
            hits = sum(1 for p in points if p > line)
        else:
            colors = [GREEN if p < line else RED for p in points]
            hits = sum(1 for p in points if p < line)

        # Create bars
        bars = ax.bar(x, points, color=colors, alpha=0.8, width=0.7, edgecolor='none')

        # Add point values on bars
        for i, (bar, pts) in enumerate(zip(bars, points)):
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                   f'{int(pts)}', ha='center', va='bottom', color=WHITE,
                   fontsize=8, fontweight='bold')

        # Add betting line
        ax.axhline(y=line, color=GOLD, linestyle='--', linewidth=2, alpha=0.8)
        ax.text(games - 0.5, line + 1, f'Line: {line}', color=GOLD,
               fontsize=10, fontweight='bold', ha='right')

        # Calculate average
        avg = sum(points) / len(points)
        ax.axhline(y=avg, color=LIGHT_GRAY, linestyle=':', linewidth=1, alpha=0.6)
        ax.text(0.5, avg + 0.5, f'Avg: {avg:.1f}', color=LIGHT_GRAY, fontsize=9)

        # Styling
        ax.set_xticks(x)
        ax.set_xticklabels(opponents, rotation=45, ha='right', color=LIGHT_GRAY, fontsize=8)
        ax.set_ylabel('Points', color=WHITE, fontsize=10)
        ax.set_title(f'{player_name} - Scoring Log ({self.season})',
                    color=WHITE, fontsize=12, fontweight='bold', pad=10)

        ax.tick_params(colors=LIGHT_GRAY)
        ax.spines['bottom'].set_color(GRAY)
        ax.spines['left'].set_color(GRAY)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.set_ylim(0, max(points) * 1.2)

        # Add hit rate annotation
        hit_rate = hits / games * 100
        ax.text(0.02, 0.98, f'Hit Rate: {hits}/{games} ({hit_rate:.0f}%)',
               transform=ax.transAxes, color=GREEN if hit_rate >= 50 else RED,
               fontsize=10, fontweight='bold', va='top')

        return hits, games

    def create_defense_chart(self, ax, defense_log: List[Dict], team_abbr: str,
                            position: str, rank_data: List[Dict]):
        """Create opponent position defense chart."""
        ax.set_facecolor(CARD_BG)

        if not defense_log:
            ax.text(0.5, 0.5, 'No data available', ha='center', va='center',
                   color=WHITE, fontsize=12)
            return

        games = len(defense_log)
        x = np.arange(games)
        starter_points = [g['starter_points'] for g in defense_log]
        opponents = [g['opponent'] for g in defense_log]

        # Calculate average
        avg = sum(starter_points) / len(starter_points)

        # Color based on above/below average
        colors = [RED if p > avg else GREEN for p in starter_points]

        # Create bars
        bars = ax.bar(x, starter_points, color=colors, alpha=0.8, width=0.7, edgecolor='none')

        # Add point values
        for bar, pts in zip(bars, starter_points):
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.3,
                   f'{int(pts)}', ha='center', va='bottom', color=WHITE, fontsize=8)

        # Average line
        ax.axhline(y=avg, color=GOLD, linestyle='--', linewidth=2, alpha=0.8)
        ax.text(games - 0.5, avg + 0.5, f'Avg: {avg:.1f}', color=GOLD,
               fontsize=10, fontweight='bold', ha='right')

        # Find rank
        rank = next((r['rank'] for r in rank_data if r['team'] == team_abbr), None)
        rank_text = f'#{rank} Worst' if rank and rank <= 15 else f'#{rank}'

        # Styling
        ax.set_xticks(x)
        ax.set_xticklabels(opponents, rotation=45, ha='right', color=LIGHT_GRAY, fontsize=8)
        ax.set_ylabel('Starter PPG Allowed', color=WHITE, fontsize=10)
        ax.set_title(f'{team_abbr} Defense vs {position}s ({rank_text})',
                    color=WHITE, fontsize=12, fontweight='bold', pad=10)

        ax.tick_params(colors=LIGHT_GRAY)
        ax.spines['bottom'].set_color(GRAY)
        ax.spines['left'].set_color(GRAY)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.set_ylim(0, max(starter_points) * 1.2)

    def create_pick_page(self, pdf, pick: Dict):
        """Create a full page analysis for one pick."""
        fig = plt.figure(figsize=(11, 8.5), facecolor=DARK_BG)

        # Header
        header_ax = fig.add_axes([0.05, 0.88, 0.9, 0.1])
        header_ax.set_facecolor(DARK_BG)
        header_ax.axis('off')

        bet_color = GREEN if pick['bet_type'] == 'OVER' else RED
        header_ax.text(0.5, 0.7, f"{pick['player_name']}",
                      color=WHITE, fontsize=20, fontweight='bold', ha='center')
        header_ax.text(0.5, 0.2, f"{pick['bet_type']} {pick['line']} POINTS @ {pick['odds']:.2f}",
                      color=bet_color, fontsize=16, fontweight='bold', ha='center')
        header_ax.text(0.98, 0.5, f"{pick['matchup']}",
                      color=LIGHT_GRAY, fontsize=12, ha='right', va='center')

        # Charts row
        ax1 = fig.add_axes([0.05, 0.48, 0.43, 0.35])  # Defense chart
        ax2 = fig.add_axes([0.55, 0.48, 0.43, 0.35])  # Player chart

        # Create charts
        self.create_defense_chart(ax1, pick['defense_log'], pick['opponent'],
                                 pick['position'], pick['rank_data'])
        hits, total = self.create_player_scoring_chart(ax2, pick['game_log'],
                                                       pick['line'], pick['player_name'],
                                                       pick['bet_type'])

        # Stats box
        stats_ax = fig.add_axes([0.05, 0.12, 0.55, 0.30])
        stats_ax.set_facecolor(CARD_BG)
        stats_ax.axis('off')

        # Key statistics
        stats_text = f"""KEY STATISTICS

Season Average:     {pick['season_avg']:.1f} PPG
Betting Line:       {pick['line']} pts
Line Value:         {'+' if pick['line_value'] > 0 else ''}{pick['line_value']:.1f} pts {'(above avg)' if pick['line_value'] > 0 else '(below avg)'}

Opponent Defense:   {pick['opponent']} allows {pick['opp_defense']:.1f} PPG to {pick['position']}s
Defense Rank:       #{pick['defense_rank']} {'worst' if pick['defense_rank'] <= 15 else 'best'} in NBA
Matchup Edge:       {'+' if pick['edge'] > 0 else ''}{pick['edge']:.1f} points

Hit Rate ({pick['bet_type']}):   {hits}/{total} games ({hits/total*100:.0f}%)
Last 5 Games:       {pick['last_5']}"""

        stats_ax.text(0.02, 0.98, stats_text, transform=stats_ax.transAxes,
                     color=WHITE, fontsize=10, fontfamily='monospace',
                     va='top', linespacing=1.5)

        # Analysis box
        analysis_ax = fig.add_axes([0.62, 0.12, 0.36, 0.30])
        analysis_ax.set_facecolor(CARD_BG)
        analysis_ax.axis('off')

        analysis_text = f"""ANALYSIS

{pick['analysis']}

RISK FACTORS:
{pick['risks']}"""

        analysis_ax.text(0.02, 0.98, analysis_text, transform=analysis_ax.transAxes,
                        color=WHITE, fontsize=9, va='top', linespacing=1.4,
                        wrap=True)

        # Verdict box
        verdict_ax = fig.add_axes([0.05, 0.02, 0.9, 0.08])
        verdict_ax.set_facecolor(bet_color)
        verdict_ax.axis('off')

        confidence = pick['confidence']
        stars = int(confidence / 20)
        star_str = '★' * stars + '☆' * (5 - stars)

        verdict_ax.text(0.02, 0.5, f"VERDICT: {pick['verdict']}",
                       color=WHITE, fontsize=14, fontweight='bold', va='center')
        verdict_ax.text(0.98, 0.5, f"Confidence: {confidence}% {star_str}",
                       color=WHITE, fontsize=14, fontweight='bold', va='center', ha='right')

        pdf.savefig(fig, facecolor=DARK_BG)
        plt.close(fig)

    def create_cover_page(self, pdf, picks: List[Dict], date_str: str):
        """Create cover page with summary."""
        fig = plt.figure(figsize=(11, 8.5), facecolor=DARK_BG)
        ax = fig.add_axes([0, 0, 1, 1])
        ax.set_facecolor(DARK_BG)
        ax.axis('off')

        # Title
        ax.text(0.5, 0.85, 'NBA PLAYER PROPS REPORT', color=WHITE,
               fontsize=28, fontweight='bold', ha='center')
        ax.text(0.5, 0.78, date_str, color=GOLD, fontsize=18, ha='center')

        # Subtitle
        ax.text(0.5, 0.70, 'Position Defense Analysis', color=LIGHT_GRAY,
               fontsize=14, ha='center')

        # Summary box
        y_start = 0.58
        ax.text(0.5, y_start, 'TOP 3 PICKS TONIGHT', color=WHITE,
               fontsize=16, fontweight='bold', ha='center')

        for i, pick in enumerate(picks):
            y = y_start - 0.08 - (i * 0.10)
            bet_color = GREEN if pick['bet_type'] == 'OVER' else RED
            stars = int(pick['confidence'] / 20)
            star_str = '★' * stars + '☆' * (5 - stars)

            ax.text(0.20, y, f"{i+1}.", color=WHITE, fontsize=14, fontweight='bold')
            ax.text(0.25, y, f"{pick['player_name']}", color=WHITE, fontsize=14, fontweight='bold')
            ax.text(0.55, y, f"{pick['bet_type']} {pick['line']}", color=bet_color, fontsize=14)
            ax.text(0.72, y, f"@ {pick['odds']:.2f}", color=LIGHT_GRAY, fontsize=14)
            ax.text(0.85, y, f"{star_str}", color=GOLD, fontsize=12)

        # Methodology box
        method_y = 0.20
        ax.text(0.5, method_y, 'METHODOLOGY', color=WHITE, fontsize=12,
               fontweight='bold', ha='center')

        method_text = """Analysis combines player scoring averages with opponent position defense rankings.
'Edge' = Opponent's PPG allowed to position starters - Player's season average.
Positive edge suggests favorable matchup for OVER bets."""

        ax.text(0.5, method_y - 0.08, method_text, color=LIGHT_GRAY, fontsize=10,
               ha='center', va='top', linespacing=1.5)

        # Footer
        ax.text(0.5, 0.05, 'Data: NBA Stats API + Pinnacle | Generated by Stat-Discute.be',
               color=GRAY, fontsize=9, ha='center')

        pdf.savefig(fig, facecolor=DARK_BG)
        plt.close(fig)

    async def generate_report(self, picks_config: List[Dict], output_path: Optional[Path] = None) -> Path:
        """Generate the full PDF report."""
        await self.connect()

        if output_path is None:
            output_path = Path(__file__).parent.parent / 'data' / 'reports' / f'props_report_{datetime.now().strftime("%Y%m%d_%H%M")}.pdf'

        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Prepare picks data
        picks = []
        for config in picks_config:
            print(f"Fetching data for {config['player_name']}...")

            # Get game log
            game_log = await self.get_player_game_log(config['player_name'])

            # Get opponent defense
            defense_log = await self.get_position_defense_log(config['opponent'], config['position'])

            # Get defense rankings
            rank_data = await self.get_position_defense_rank(config['position'])

            # Calculate stats
            if game_log:
                season_avg = sum(g['points'] for g in game_log) / len(game_log)
                last_5 = [int(g['points']) for g in game_log[-5:]]
            else:
                season_avg = 0
                last_5 = []

            opp_defense = next((r['ppg'] for r in rank_data if r['team'] == config['opponent']), 0)
            defense_rank = next((r['rank'] for r in rank_data if r['team'] == config['opponent']), 30)

            picks.append({
                **config,
                'game_log': game_log,
                'defense_log': defense_log,
                'rank_data': rank_data,
                'season_avg': season_avg,
                'line_value': config['line'] - season_avg,
                'opp_defense': opp_defense,
                'defense_rank': defense_rank,
                'edge': opp_defense - season_avg,
                'last_5': str(last_5)
            })

        # Generate PDF
        print(f"\nGenerating PDF report...")
        with PdfPages(output_path) as pdf:
            # Cover page
            self.create_cover_page(pdf, picks, datetime.now().strftime('%B %d, %Y'))

            # Individual pick pages
            for pick in picks:
                print(f"  Creating page for {pick['player_name']}...")
                self.create_pick_page(pdf, pick)

        await self.close()

        print(f"\nReport saved to: {output_path}")
        return output_path


async def main():
    """Generate tonight's picks report."""

    # Configure the 3 picks
    picks_config = [
        {
            'player_name': 'Gary Trent Jr.',
            'bet_type': 'OVER',
            'line': 8.5,
            'odds': 1.76,
            'position': 'SF',
            'opponent': 'NYK',
            'matchup': 'MIL @ NYK',
            'analysis': '''Gary Trent Jr. faces the Knicks who rank #2 worst in SF defense,
allowing 20.3 PPG to starter small forwards. With his season average at 10.5 PPG,
the line is set 2 points BELOW his average - excellent value. He's hit this
line in 12 of 17 games (70.6%) this season.''',
            'risks': '''- Middleton's return may reduce his shot volume
- NYK plays at slower pace (limiting possessions)
- Road game fatigue factor''',
            'verdict': 'STRONG OVER',
            'confidence': 80
        },
        {
            'player_name': 'Jalen Brunson',
            'bet_type': 'UNDER',
            'line': 30.5,
            'odds': 1.80,
            'position': 'PG',
            'opponent': 'MIL',
            'matchup': 'MIL @ NYK',
            'analysis': '''Brunson faces Milwaukee's elite PG defense which allows only 20.4 PPG
to starter point guards - that's 8.2 points BELOW his season average of 28.6.
The line at 30.5 requires him to exceed his average by 2 points against a
top-tier defense. This is a spot where stars historically underperform.''',
            'risks': '''- Brunson is elite and can overcome matchups
- Home court advantage for NYK
- May get extra shots if Knicks fall behind''',
            'verdict': 'GOOD UNDER',
            'confidence': 75
        },
        {
            'player_name': 'Malik Monk',
            'bet_type': 'OVER',
            'line': 13.5,
            'odds': 1.82,
            'position': 'SG',
            'opponent': 'UTA',
            'matchup': 'SAC @ UTA',
            'analysis': '''Utah has the WORST SG defense in the NBA, allowing 23.7 PPG to starter
shooting guards. Monk averages 13.2 PPG, so the line is essentially at his average
while facing the league's worst matchup. This is pure matchup value - Utah simply
cannot defend the shooting guard position.''',
            'risks': '''- Zach LaVine may take more shots as primary scorer
- Monk's inconsistency (range: 0-22 this season)
- Road game variance''',
            'verdict': 'GOOD OVER',
            'confidence': 72
        }
    ]

    report = PlayerPropsReport()
    output_path = await report.generate_report(picks_config)
    print(f"\n{'='*60}")
    print(f"Report generated: {output_path}")
    print(f"{'='*60}")


if __name__ == '__main__':
    asyncio.run(main())
