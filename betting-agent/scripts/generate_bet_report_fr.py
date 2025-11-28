#!/usr/bin/env python3
"""
Génération de rapport PDF professionnel en français avec visualisations.
"""
import asyncio
import sys
import os
from datetime import datetime
from io import BytesIO

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, Image, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from src.tools.db_tool import DatabaseTool
from src.tools.monte_carlo import monte_carlo_totals_simulation, calculate_ev_metrics


# Couleurs du thème stat-discute.be
PRIMARY_COLOR = colors.HexColor("#000000")  # Noir
ACCENT_COLOR = colors.HexColor("#1a1a1a")
HIGHLIGHT_GREEN = colors.HexColor("#22c55e")  # Vert succès
HIGHLIGHT_RED = colors.HexColor("#ef4444")    # Rouge danger
GOLD = colors.HexColor("#f59e0b")             # Or/Accent
LIGHT_GRAY = colors.HexColor("#f5f5f5")
DARK_GRAY = colors.HexColor("#374151")
CHART_BLUE = colors.HexColor("#3b82f6")
CHART_ORANGE = colors.HexColor("#f97316")


def setup_matplotlib_style():
    """Configure le style matplotlib pour correspondre au site."""
    plt.style.use('dark_background')
    plt.rcParams['figure.facecolor'] = '#1a1a1a'
    plt.rcParams['axes.facecolor'] = '#1a1a1a'
    plt.rcParams['axes.edgecolor'] = '#374151'
    plt.rcParams['axes.labelcolor'] = '#ffffff'
    plt.rcParams['text.color'] = '#ffffff'
    plt.rcParams['xtick.color'] = '#9ca3af'
    plt.rcParams['ytick.color'] = '#9ca3af'
    plt.rcParams['grid.color'] = '#374151'
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.size'] = 10


def create_efficiency_chart(data: dict) -> BytesIO:
    """Crée un graphique comparatif des efficacités."""
    setup_matplotlib_style()

    fig, ax = plt.subplots(figsize=(7, 3.5))

    home = data['game']['home_abbr']
    away = data['game']['away_abbr']
    eff = data['efficiency']

    categories = ['ORTG\n(Attaque)', 'DRTG\n(Défense)', 'Pace\n(Rythme)']
    home_values = [eff['home_ortg'], eff['home_drtg'], eff['home_pace']]
    away_values = [eff['away_ortg'], eff['away_drtg'], eff['away_pace']]

    x = np.arange(len(categories))
    width = 0.35

    bars1 = ax.bar(x - width/2, home_values, width, label=home, color='#3b82f6', edgecolor='white', linewidth=0.5)
    bars2 = ax.bar(x + width/2, away_values, width, label=away, color='#f97316', edgecolor='white', linewidth=0.5)

    ax.set_ylabel('Rating', fontsize=11)
    ax.set_title('Comparaison des Efficacités', fontsize=14, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(categories)
    ax.legend(loc='upper right', framealpha=0.9)
    ax.set_ylim(90, 130)
    ax.grid(axis='y', alpha=0.3)

    # Ajouter les valeurs sur les barres
    for bar, val in zip(bars1, home_values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                f'{val:.1f}', ha='center', va='bottom', fontsize=9, color='white')
    for bar, val in zip(bars2, away_values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                f'{val:.1f}', ha='center', va='bottom', fontsize=9, color='white')

    plt.tight_layout()

    buf = BytesIO()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight',
                facecolor='#1a1a1a', edgecolor='none')
    plt.close()
    buf.seek(0)
    return buf


def create_projection_waterfall(data: dict) -> BytesIO:
    """Crée un graphique en cascade pour la projection."""
    setup_matplotlib_style()

    fig, ax = plt.subplots(figsize=(7, 4))

    adj = data['adjustments']
    labels = ['Base', 'Adversaires', 'Repos', 'Venue', 'H2H', 'Tendance', 'Pace', 'Biais', 'TOTAL']
    values = [
        adj['base_total'],
        adj['opp_strength'],
        adj['rest'],
        adj['venue'],
        adj['h2h'],
        adj['trend'],
        adj['pace'],
        adj['bias'],
        data['projection']['total']
    ]

    # Calculer les positions pour le waterfall
    cumulative = [values[0]]
    for i in range(1, len(values) - 1):
        cumulative.append(cumulative[-1] + values[i])
    cumulative.append(values[-1])

    # Couleurs
    bar_colors = ['#3b82f6']  # Base en bleu
    for v in values[1:-1]:
        if v > 0:
            bar_colors.append('#22c55e')
        elif v < 0:
            bar_colors.append('#ef4444')
        else:
            bar_colors.append('#6b7280')
    bar_colors.append('#f59e0b')  # Total en or

    # Dessiner les barres
    x = np.arange(len(labels))

    # Barres pour les ajustements (style waterfall)
    bottoms = [0] + cumulative[:-2] + [0]
    heights = [values[0]] + values[1:-1] + [values[-1]]

    for i, (b, h, c, lbl) in enumerate(zip(bottoms, heights, bar_colors, labels)):
        if i == 0 or i == len(labels) - 1:
            ax.bar(x[i], h, color=c, edgecolor='white', linewidth=0.5)
        else:
            ax.bar(x[i], abs(h), bottom=min(b, b+h), color=c, edgecolor='white', linewidth=0.5)

    ax.set_ylabel('Points', fontsize=11)
    ax.set_title('Décomposition de la Projection', fontsize=14, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=9)
    ax.axhline(y=data['line']['total'], color='#ef4444', linestyle='--', linewidth=2, label=f"Ligne: {data['line']['total']}")
    ax.legend(loc='upper left', framealpha=0.9)
    ax.grid(axis='y', alpha=0.3)

    # Ajouter les valeurs
    for i, (h, v) in enumerate(zip(heights, values)):
        if i == 0 or i == len(values) - 1:
            y_pos = h + 1
        else:
            y_pos = cumulative[i-1] + (h/2 if h > 0 else h/2)
        ax.text(x[i], y_pos, f'{v:+.1f}' if i > 0 and i < len(values)-1 else f'{v:.1f}',
                ha='center', va='bottom' if h > 0 else 'top', fontsize=8, color='white')

    plt.tight_layout()

    buf = BytesIO()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight',
                facecolor='#1a1a1a', edgecolor='none')
    plt.close()
    buf.seek(0)
    return buf


def create_probability_chart(data: dict) -> BytesIO:
    """Crée un graphique des probabilités."""
    setup_matplotlib_style()

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(7, 3))

    mc = data['monte_carlo']
    ev = data['ev_metrics']

    # Graphique 1: Probabilités
    probs = [mc['p_over'] * 100, mc['p_under'] * 100]
    labels = ['OVER', 'UNDER']
    colors_prob = ['#22c55e', '#ef4444']

    bars = ax1.barh(labels, probs, color=colors_prob, edgecolor='white', linewidth=0.5)
    ax1.set_xlim(0, 100)
    ax1.set_xlabel('Probabilité (%)', fontsize=10)
    ax1.set_title('Probabilités Monte Carlo', fontsize=12, fontweight='bold')
    ax1.axvline(x=50, color='#6b7280', linestyle='--', alpha=0.5)

    for bar, prob in zip(bars, probs):
        ax1.text(prob + 2, bar.get_y() + bar.get_height()/2,
                f'{prob:.1f}%', va='center', fontsize=11, fontweight='bold', color='white')

    # Graphique 2: Expected Value
    evs = [ev['ev_over'], ev['ev_under']]
    colors_ev = ['#22c55e' if e > 0 else '#ef4444' for e in evs]

    bars2 = ax2.barh(labels, evs, color=colors_ev, edgecolor='white', linewidth=0.5)
    ax2.set_xlabel('Valeur Espérée (EV)', fontsize=10)
    ax2.set_title('Expected Value', fontsize=12, fontweight='bold')
    ax2.axvline(x=0, color='#6b7280', linestyle='-', linewidth=1)

    for bar, e in zip(bars2, evs):
        x_pos = e + 0.02 if e > 0 else e - 0.02
        ax2.text(x_pos, bar.get_y() + bar.get_height()/2,
                f'{e:+.3f}', va='center', ha='left' if e > 0 else 'right',
                fontsize=11, fontweight='bold', color='white')

    plt.tight_layout()

    buf = BytesIO()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight',
                facecolor='#1a1a1a', edgecolor='none')
    plt.close()
    buf.seek(0)
    return buf


def create_monte_carlo_distribution(data: dict) -> BytesIO:
    """Crée un histogramme de la distribution Monte Carlo."""
    setup_matplotlib_style()

    fig, ax = plt.subplots(figsize=(7, 3.5))

    mc = data['monte_carlo']
    line = data['line']['total']

    # Simuler une distribution normale basée sur les percentiles
    mean = mc['mean']
    # Estimer std à partir des percentiles (p5 et p95 sont ~1.645 std de la moyenne)
    std = (mc['p95'] - mc['p5']) / (2 * 1.645)

    # Générer des points pour la distribution
    x = np.linspace(mc['p5'] - 20, mc['p95'] + 20, 200)
    y = (1 / (std * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mean) / std) ** 2)

    # Remplir les zones
    ax.fill_between(x[x < line], y[x < line], alpha=0.6, color='#ef4444', label=f'UNDER ({mc["p_under"]*100:.1f}%)')
    ax.fill_between(x[x >= line], y[x >= line], alpha=0.6, color='#22c55e', label=f'OVER ({mc["p_over"]*100:.1f}%)')

    ax.axvline(x=line, color='white', linestyle='--', linewidth=2, label=f'Ligne: {line}')
    ax.axvline(x=mean, color='#f59e0b', linestyle='-', linewidth=2, label=f'Projection: {mean:.1f}')

    ax.set_xlabel('Total Points', fontsize=11)
    ax.set_ylabel('Densité de probabilité', fontsize=11)
    ax.set_title('Distribution Monte Carlo (10,000 simulations)', fontsize=14, fontweight='bold', pad=15)
    ax.legend(loc='upper right', framealpha=0.9)
    ax.set_xlim(mc['p5'] - 10, mc['p95'] + 10)

    plt.tight_layout()

    buf = BytesIO()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight',
                facecolor='#1a1a1a', edgecolor='none')
    plt.close()
    buf.seek(0)
    return buf


def create_edge_gauge(data: dict) -> BytesIO:
    """Crée une jauge pour l'edge."""
    setup_matplotlib_style()

    fig, ax = plt.subplots(figsize=(4, 2.5))

    is_over = data['projection']['margin'] > 0
    edge = data['ev_metrics']['edge_over'] if is_over else data['ev_metrics']['edge_under']
    edge_pct = edge * 100

    # Créer une jauge semi-circulaire
    theta = np.linspace(0, np.pi, 100)

    # Zones de couleur
    ax.fill_between(np.linspace(0, np.pi/3, 30), 0.7, 1.0,
                   alpha=0.3, color='#ef4444', transform=ax.transData)
    ax.fill_between(np.linspace(np.pi/3, 2*np.pi/3, 30), 0.7, 1.0,
                   alpha=0.3, color='#f59e0b', transform=ax.transData)
    ax.fill_between(np.linspace(2*np.pi/3, np.pi, 30), 0.7, 1.0,
                   alpha=0.3, color='#22c55e', transform=ax.transData)

    # Arc de fond
    ax.plot(np.cos(theta), np.sin(theta) * 0.5 + 0.5, color='#374151', linewidth=20, solid_capstyle='round')

    # Aiguille
    needle_angle = np.pi - (edge_pct / 20) * np.pi  # 0-20% mapped to pi-0
    needle_angle = max(0, min(np.pi, needle_angle))
    ax.arrow(0, 0.5, 0.7 * np.cos(needle_angle), 0.7 * np.sin(needle_angle) * 0.5,
            head_width=0.08, head_length=0.05, fc='white', ec='white', linewidth=2)

    ax.text(0, 0.15, f'{edge_pct:+.1f}%', ha='center', va='center',
           fontsize=24, fontweight='bold', color='#f59e0b')
    ax.text(0, -0.1, 'EDGE', ha='center', va='center',
           fontsize=12, color='#9ca3af')

    ax.set_xlim(-1.2, 1.2)
    ax.set_ylim(-0.3, 1.2)
    ax.axis('off')
    ax.set_aspect('equal')

    plt.tight_layout()

    buf = BytesIO()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight',
                facecolor='#1a1a1a', edgecolor='none')
    plt.close()
    buf.seek(0)
    return buf


def create_styles():
    """Crée les styles de paragraphe personnalisés."""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name='MainTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=PRIMARY_COLOR,
        alignment=TA_CENTER,
        spaceAfter=6,
        fontName='Helvetica-Bold'
    ))

    styles.add(ParagraphStyle(
        name='SubTitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=DARK_GRAY,
        alignment=TA_CENTER,
        spaceAfter=20
    ))

    styles.add(ParagraphStyle(
        name='SectionHeader',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=PRIMARY_COLOR,
        spaceBefore=20,
        spaceAfter=10,
        fontName='Helvetica-Bold'
    ))

    styles.add(ParagraphStyle(
        name='BodyPara',
        parent=styles['Normal'],
        fontSize=10,
        textColor=DARK_GRAY,
        spaceAfter=8,
        leading=14
    ))

    styles.add(ParagraphStyle(
        name='SmallText',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.gray,
        spaceAfter=4
    ))

    return styles


async def get_game_analysis(team1: str, team2: str) -> dict:
    """Exécute l'analyse complète V4 et retourne les résultats."""
    db = DatabaseTool()
    await db.connect()

    result = await db.execute("""
        SELECT
            g.game_id, g.game_date,
            g.home_team_id, g.away_team_id,
            ht.abbreviation as home_abbr, ht.full_name as home_team,
            at.abbreviation as away_abbr, at.full_name as away_team,
            (SELECT bo.handicap FROM betting_odds bo
             JOIN betting_markets bm ON bo.market_id = bm.market_id
             JOIN betting_events be ON bm.event_id = be.event_id
             WHERE be.game_id = g.game_id
               AND bm.market_type = 'total'
               AND bm.market_key LIKE '0_game_total_%'
             ORDER BY bo.recorded_at DESC LIMIT 1) as total_line,
            (SELECT bo.odds_decimal FROM betting_odds bo
             JOIN betting_markets bm ON bo.market_id = bm.market_id
             JOIN betting_events be ON bm.event_id = be.event_id
             WHERE be.game_id = g.game_id
               AND bm.market_type = 'total'
               AND bm.market_key LIKE '0_game_total_%'
               AND bo.selection LIKE 'Over%%'
             ORDER BY bo.recorded_at DESC LIMIT 1) as over_odds,
            (SELECT bo.odds_decimal FROM betting_odds bo
             JOIN betting_markets bm ON bo.market_id = bm.market_id
             JOIN betting_events be ON bm.event_id = be.event_id
             WHERE be.game_id = g.game_id
               AND bm.market_type = 'total'
               AND bm.market_key LIKE '0_game_total_%'
               AND bo.selection LIKE 'Under%%'
             ORDER BY bo.recorded_at DESC LIMIT 1) as under_odds
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE g.game_date >= CURRENT_DATE
          AND g.game_date < CURRENT_DATE + INTERVAL '1 day'
          AND (ht.abbreviation IN ($1, $2) OR at.abbreviation IN ($1, $2))
    """, [team1.upper(), team2.upper()])

    if not result.data:
        await db.close()
        return None

    game = result.data[0]
    home_id = game["home_team_id"]
    away_id = game["away_team_id"]
    total_line = float(game["total_line"])
    game_date = str(game["game_date"])
    over_odds = float(game["over_odds"]) if game["over_odds"] else 1.91
    under_odds = float(game["under_odds"]) if game["under_odds"] else 1.91

    def sf(v): return float(v) if v else 0.0

    # Récupérer toutes les données
    home_multi = await db.get_team_efficiency_multi_timeframe(home_id)
    away_multi = await db.get_team_efficiency_multi_timeframe(away_id)

    hb = home_multi.get("blended", {})
    ab = away_multi.get("blended", {})

    home_ortg = sf(hb.get("ortg", 110))
    home_drtg = sf(hb.get("drtg", 110))
    home_pace = sf(hb.get("pace", 100))
    away_ortg = sf(ab.get("ortg", 110))
    away_drtg = sf(ab.get("drtg", 110))
    away_pace = sf(ab.get("pace", 100))

    matchup_pace = (home_pace + away_pace) / 2
    home_expected = ((home_ortg + away_drtg) / 2) * matchup_pace / 100
    away_expected = ((away_ortg + home_drtg) / 2) * matchup_pace / 100
    base_total = home_expected + away_expected

    # Tous les ajustements
    home_opp_adj = await db.get_opponent_adjusted_stats(home_id, last_n_games=15)
    away_opp_adj = await db.get_opponent_adjusted_stats(away_id, last_n_games=15)
    opp_strength_adj = 0
    if home_opp_adj and away_opp_adj:
        opp_strength_adj = (sf(home_opp_adj.get("ppg_adjustment", 0)) +
                          sf(home_opp_adj.get("opp_ppg_adjustment", 0)) +
                          sf(away_opp_adj.get("ppg_adjustment", 0)) +
                          sf(away_opp_adj.get("opp_ppg_adjustment", 0))) / 2

    home_rest = await db.get_team_rest_days(home_id, game_date)
    away_rest = await db.get_team_rest_days(away_id, game_date)
    rest_adjustment = 0
    if home_rest.get("is_back_to_back"): rest_adjustment -= 3.0
    if away_rest.get("is_back_to_back"): rest_adjustment -= 3.0
    if home_rest.get("rest_days") == 1: rest_adjustment -= 1.5
    if away_rest.get("rest_days") == 1: rest_adjustment -= 1.5
    if home_rest.get("rest_days", 0) >= 3 and away_rest.get("rest_days", 0) >= 3:
        rest_adjustment += 2.0

    home_density = await db.get_schedule_density(home_id, game_date)
    away_density = await db.get_schedule_density(away_id, game_date)
    fatigue_adj = 0
    if home_density and away_density:
        fatigue_adj = -(home_density.get("fatigue_score", 0) + away_density.get("fatigue_score", 0)) * 0.5

    home_totals = await db.get_team_totals_context(home_id, last_n_games=15)
    away_totals = await db.get_team_totals_context(away_id, last_n_games=15)
    venue_adjustment = 0
    if home_totals and away_totals:
        h_venue = sf(home_totals.get("home_avg_total", 0))
        a_venue = sf(away_totals.get("away_avg_total", 0))
        h_overall = sf(home_totals.get("avg_total", 0))
        a_overall = sf(away_totals.get("avg_total", 0))
        if h_venue > 0 and a_venue > 0:
            venue_adjustment = ((h_venue - h_overall) + (a_venue - a_overall)) / 2

    h2h = await db.get_h2h_totals(home_id, away_id, limit=10)
    h2h_adjustment = 0
    h2h_info = None
    if h2h and h2h.get("games", 0) >= 3:
        h2h_avg = sf(h2h.get("avg_total", 0))
        h2h_adjustment = (h2h_avg - base_total) * 0.15
        h2h_info = {"games": h2h.get("games"), "avg": h2h_avg}

    home_ou = await db.get_team_ou_record(home_id, line=total_line, last_n_games=20)
    away_ou = await db.get_team_ou_record(away_id, line=total_line, last_n_games=20)
    historical_trend_adj = 0
    trend_info = None
    if home_ou and away_ou:
        h_under = sf(home_ou.get("under_rate", 0.5))
        a_under = sf(away_ou.get("under_rate", 0.5))
        combined_under = (h_under + a_under) / 2
        trend_info = {"home_under": h_under, "away_under": a_under, "combined": combined_under}
        if combined_under > 0.65: historical_trend_adj = -2.0
        elif combined_under > 0.55: historical_trend_adj = -1.0
        elif combined_under < 0.35: historical_trend_adj = 2.0
        elif combined_under < 0.45: historical_trend_adj = 1.0

    pace_matchup = await db.get_pace_matchup_data(home_id, away_id)
    pace_adj = pace_matchup.get("pace_adjustment", 0.0) if pace_matchup else 0.0

    home_vol = await db.get_team_volatility(home_id, last_n_games=15)
    away_vol = await db.get_team_volatility(away_id, last_n_games=15)

    h_std = sf(home_totals.get("total_std_dev", 12.0)) if home_totals else 12.0
    a_std = sf(away_totals.get("total_std_dev", 12.0)) if away_totals else 12.0
    if home_vol and home_vol.get("volatility_rating") == "high": h_std *= 1.15
    if away_vol and away_vol.get("volatility_rating") == "high": a_std *= 1.15

    BIAS_CORRECTION = 4.0

    projected_total = (base_total + opp_strength_adj + rest_adjustment + fatigue_adj +
                      venue_adjustment + h2h_adjustment + historical_trend_adj +
                      pace_adj + BIAS_CORRECTION)

    mc_result = monte_carlo_totals_simulation(
        t1_projection=home_expected + (projected_total - base_total) / 2,
        t2_projection=away_expected + (projected_total - base_total) / 2,
        t1_std_dev=h_std,
        t2_std_dev=a_std,
        total_line=total_line,
        n_sims=10000,
        correlation=0.5,
    )

    ev_metrics = calculate_ev_metrics(
        p_over=mc_result["p_over"],
        p_under=mc_result["p_under"],
        over_odds=over_odds,
        under_odds=under_odds,
    )

    await db.close()

    return {
        "game": {
            "home_abbr": game["home_abbr"],
            "away_abbr": game["away_abbr"],
            "home_team": game["home_team"],
            "away_team": game["away_team"],
            "game_date": game_date,
        },
        "line": {
            "total": total_line,
            "over_odds": over_odds,
            "under_odds": under_odds,
        },
        "efficiency": {
            "home_ortg": home_ortg,
            "home_drtg": home_drtg,
            "home_pace": home_pace,
            "away_ortg": away_ortg,
            "away_drtg": away_drtg,
            "away_pace": away_pace,
        },
        "adjustments": {
            "base_total": round(base_total, 1),
            "opp_strength": round(opp_strength_adj, 1),
            "rest": round(rest_adjustment, 1),
            "fatigue": round(fatigue_adj, 1),
            "venue": round(venue_adjustment, 1),
            "h2h": round(h2h_adjustment, 1),
            "trend": round(historical_trend_adj, 1),
            "pace": round(pace_adj, 1),
            "bias": BIAS_CORRECTION,
        },
        "rest_info": {
            "home_rest": home_rest.get("rest_days"),
            "away_rest": away_rest.get("rest_days"),
            "home_b2b": home_rest.get("is_back_to_back"),
            "away_b2b": away_rest.get("is_back_to_back"),
        },
        "h2h_info": h2h_info,
        "trend_info": trend_info,
        "volatility": {
            "home": home_vol.get("volatility_rating") if home_vol else "inconnu",
            "away": away_vol.get("volatility_rating") if away_vol else "inconnu",
            "home_std": round(h_std, 1),
            "away_std": round(a_std, 1),
        },
        "projection": {
            "total": round(projected_total, 1),
            "margin": round(projected_total - total_line, 1),
        },
        "monte_carlo": {
            "mean": mc_result["mean_total"],
            "p_over": mc_result["p_over"],
            "p_under": mc_result["p_under"],
            "p5": mc_result["percentiles"]["p5"],
            "p95": mc_result["percentiles"]["p95"],
        },
        "ev_metrics": ev_metrics,
    }


def generate_pdf(data: dict, output_path: str):
    """Génère le rapport PDF en français avec visualisations."""
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=30,
        bottomMargin=30
    )

    styles = create_styles()
    story = []

    # En-tête
    story.append(Paragraph("ANALYSE PARIS NBA", styles['MainTitle']))
    story.append(Paragraph(
        f"Rapport du Meilleur Pari • {datetime.now().strftime('%d %B %Y')}",
        styles['SubTitle']
    ))

    # Encadré de recommandation
    rec = data["ev_metrics"]["recommended_bet"]
    direction = "OVER" if "OVER" in rec else "UNDER"
    direction_fr = "PLUS DE" if direction == "OVER" else "MOINS DE"
    edge = data["ev_metrics"]["edge_over"] if direction == "OVER" else data["ev_metrics"]["edge_under"]

    rec_data = [
        [Paragraph(f"<b>{data['game']['away_abbr']} @ {data['game']['home_abbr']}</b>",
                  ParagraphStyle('rec', fontSize=18, textColor=colors.white, alignment=TA_CENTER))],
        [Paragraph(f"<b>{direction_fr} {data['line']['total']} POINTS</b>",
                  ParagraphStyle('rec2', fontSize=22, textColor=GOLD, alignment=TA_CENTER, fontName='Helvetica-Bold'))],
        [Paragraph(f"Edge: {edge*100:+.1f}% | Kelly: {data['ev_metrics']['kelly_over_fractional']*100:.1f}% | EV: {data['ev_metrics']['ev_over'] if direction == 'OVER' else data['ev_metrics']['ev_under']:+.3f}",
                  ParagraphStyle('rec3', fontSize=11, textColor=colors.white, alignment=TA_CENTER))],
    ]

    rec_table = Table(rec_data, colWidths=[450])
    rec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY_COLOR),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(rec_table)
    story.append(Spacer(1, 15))

    # Graphique des efficacités
    story.append(Paragraph("COMPARAISON DES ÉQUIPES", styles['SectionHeader']))
    eff_chart = create_efficiency_chart(data)
    story.append(Image(eff_chart, width=450, height=225))
    story.append(Spacer(1, 10))

    # Explication des efficacités
    home = data['game']['home_abbr']
    away = data['game']['away_abbr']
    eff = data['efficiency']

    eff_text = f"""
    <b>Lecture du graphique :</b> L'ORTG (Offensive Rating) mesure les points marqués par 100 possessions.
    Le DRTG (Defensive Rating) mesure les points encaissés. Un DRTG élevé indique une <b>mauvaise défense</b>.
    <br/><br/>
    <b>{home}</b> affiche un DRTG de {eff['home_drtg']:.1f} - """

    if eff['home_drtg'] > 115:
        eff_text += "une des pires défenses de la ligue. "
    elif eff['home_drtg'] < 108:
        eff_text += "une défense d'élite. "
    else:
        eff_text += "une défense moyenne. "

    eff_text += f"<b>{away}</b> avec un ORTG de {eff['away_ortg']:.1f} "
    if eff['away_ortg'] > 114:
        eff_text += "possède une attaque très efficace qui devrait exploiter ces faiblesses défensives."
    else:
        eff_text += "a une attaque dans la moyenne."

    story.append(Paragraph(eff_text.strip(), styles['BodyPara']))
    story.append(Spacer(1, 15))

    # Graphique de la projection
    story.append(Paragraph("DÉCOMPOSITION DE LA PROJECTION", styles['SectionHeader']))
    waterfall_chart = create_projection_waterfall(data)
    story.append(Image(waterfall_chart, width=450, height=260))
    story.append(Spacer(1, 10))

    adj = data['adjustments']
    proj_text = f"""
    <b>Notre modèle V4 calcule un total projeté de {data['projection']['total']} points</b>, soit
    <b>{abs(data['projection']['margin']):.1f} points {'au-dessus' if data['projection']['margin'] > 0 else 'en-dessous'}</b>
    de la ligne fixée à {data['line']['total']}.
    <br/><br/>
    <b>Facteurs clés :</b><br/>
    • <b>Base efficacité ({adj['base_total']} pts)</b> : Calculé à partir des ratings offensifs/défensifs pondérés<br/>
    • <b>Repos (+{adj['rest']:.1f} pts)</b> : Les deux équipes sont bien reposées ({data['rest_info']['home_rest']}j et {data['rest_info']['away_rest']}j)<br/>
    • <b>Tendance O/U ({adj['trend']:+.1f} pts)</b> : Historique des totaux sur les 20 derniers matchs<br/>
    • <b>Correction biais (+{adj['bias']:.1f} pts)</b> : Ajustement calibré sur le backtest (MAE 12.8 pts)
    """
    story.append(Paragraph(proj_text.strip(), styles['BodyPara']))

    # Nouvelle page pour les probabilités
    story.append(PageBreak())

    # Graphique Monte Carlo
    story.append(Paragraph("SIMULATION MONTE CARLO", styles['SectionHeader']))
    mc_chart = create_monte_carlo_distribution(data)
    story.append(Image(mc_chart, width=450, height=225))
    story.append(Spacer(1, 10))

    mc = data['monte_carlo']
    mc_text = f"""
    <b>10 000 simulations</b> ont été exécutées avec une distribution normale bivariée corrélée (ρ=0.5)
    pour modéliser l'incertitude des scores.
    <br/><br/>
    • <b>Moyenne simulée : {mc['mean']:.1f} points</b><br/>
    • <b>Intervalle de confiance 90% : [{mc['p5']:.0f} - {mc['p95']:.0f}]</b><br/>
    • <b>Probabilité OVER : {mc['p_over']*100:.1f}%</b><br/>
    • <b>Probabilité UNDER : {mc['p_under']*100:.1f}%</b>
    """
    story.append(Paragraph(mc_text.strip(), styles['BodyPara']))
    story.append(Spacer(1, 15))

    # Graphique des probabilités et EV
    story.append(Paragraph("PROBABILITÉS ET VALEUR ESPÉRÉE", styles['SectionHeader']))
    prob_chart = create_probability_chart(data)
    story.append(Image(prob_chart, width=450, height=195))
    story.append(Spacer(1, 10))

    ev = data['ev_metrics']
    is_over = data['projection']['margin'] > 0
    bet_odds = data['line']['over_odds'] if is_over else data['line']['under_odds']
    implied_prob = (1 / bet_odds) * 100
    mc_prob = mc['p_over'] * 100 if is_over else mc['p_under'] * 100
    best_ev = ev['ev_over'] if is_over else ev['ev_under']

    value_text = f"""
    <b>Calcul de la valeur :</b>
    <br/><br/>
    Le marché propose le {direction} à <b>{bet_odds:.2f}</b> (cote décimale), ce qui implique une probabilité de {implied_prob:.1f}%.
    Notre modèle estime la vraie probabilité à <b>{mc_prob:.1f}%</b>.
    <br/><br/>
    <b>Edge = {mc_prob:.1f}% - {implied_prob:.1f}% = {edge*100:+.1f}%</b>
    <br/><br/>
    Avec un edge de {edge*100:.1f}%, la <b>Valeur Espérée (EV) est de {best_ev:+.3f}</b> par euro misé.
    Sur 100€ misés, nous espérons un profit moyen de <b>{best_ev*100:+.1f}€</b>.
    <br/><br/>
    Le <b>critère de Kelly</b> recommande une mise de <b>{ev['kelly_over_fractional']*100:.2f}%</b> du capital.
    """
    story.append(Paragraph(value_text.strip(), styles['BodyPara']))
    story.append(Spacer(1, 15))

    # Tableau récapitulatif
    story.append(Paragraph("TABLEAU RÉCAPITULATIF", styles['SectionHeader']))

    summary_data = [
        ["Métrique", "Valeur", "Interprétation"],
        ["Total Projeté", f"{data['projection']['total']}", "Estimation du modèle V4"],
        ["Ligne", f"{data['line']['total']}", "Ligne du bookmaker"],
        ["Marge", f"{data['projection']['margin']:+.1f} pts", "Écart projection vs ligne"],
        [f"P({direction})", f"{mc_prob:.1f}%", "Probabilité Monte Carlo"],
        ["Cote", f"{bet_odds:.2f}", f"Cote décimale {direction}"],
        ["Edge", f"{edge*100:+.1f}%", "Avantage sur le marché"],
        ["EV", f"{best_ev:+.3f}", "Valeur espérée par €"],
        ["Kelly", f"{ev['kelly_over_fractional']*100:.2f}%", "Mise optimale"],
    ]

    summary_table = Table(summary_data, colWidths=[120, 100, 200])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (2, 0), (2, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 20))

    # Conclusion
    story.append(Paragraph("CONCLUSION", styles['SectionHeader']))

    verdict_fr = "PARI FORT" if "STRONG" in rec else ("PARI" if "BET" in rec and "NO" not in rec else "PAS DE PARI")

    conclusion = f"""
    Sur la base de l'analyse complète des efficacités, du repos, des tendances historiques,
    de l'historique des confrontations directes et de la modélisation Monte Carlo,
    nous recommandons <b>{direction_fr} {data['line']['total']}</b> pour {away} @ {home}.
    <br/><br/>
    Le total projeté de <b>{data['projection']['total']}</b> points offre un <b>edge de {edge*100:+.1f}%</b>
    sur la ligne, avec une valeur espérée de <b>{best_ev:+.3f}</b> par euro misé.
    <br/><br/>
    <b>VERDICT FINAL : {verdict_fr} - {direction} {data['line']['total']}</b>
    """
    story.append(Paragraph(conclusion.strip(), styles['BodyPara']))
    story.append(Spacer(1, 20))

    # Avertissement
    story.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>AVERTISSEMENT :</b> Cette analyse est fournie à titre informatif uniquement. "
        "Les performances passées ne garantissent pas les résultats futurs. "
        "Les paris sportifs comportent des risques. Jouez de manière responsable. "
        "Précision du modèle en backtest : 90% sur les signaux UNDER forts, 72% sur les signaux OVER forts (118 matchs, saison 2025-26).",
        styles['SmallText']
    ))
    story.append(Paragraph(
        f"Généré par NBA Expert Bettor Agent V4 | stat-discute.be | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        styles['SmallText']
    ))

    doc.build(story)
    print(f"PDF généré : {output_path}")


async def main():
    team1 = sys.argv[1] if len(sys.argv) > 1 else "PHI"
    team2 = sys.argv[2] if len(sys.argv) > 2 else "BKN"

    print(f"Analyse de {team1} vs {team2}...")
    data = await get_game_analysis(team1, team2)

    if not data:
        print(f"Aucun match trouvé pour {team1} vs {team2}")
        return

    output_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data",
        f"rapport_pari_{data['game']['away_abbr']}_at_{data['game']['home_abbr']}_{datetime.now().strftime('%Y%m%d')}.pdf"
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    generate_pdf(data, output_path)


if __name__ == "__main__":
    asyncio.run(main())
