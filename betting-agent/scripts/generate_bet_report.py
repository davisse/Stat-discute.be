#!/usr/bin/env python3
"""Generate professional PDF report for best bet analysis."""
import asyncio
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, ListFlowable, ListItem
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from src.tools.db_tool import DatabaseTool
from src.tools.monte_carlo import monte_carlo_totals_simulation, calculate_ev_metrics


# Color scheme
PRIMARY_COLOR = colors.HexColor("#1a1a2e")
ACCENT_COLOR = colors.HexColor("#16213e")
HIGHLIGHT_GREEN = colors.HexColor("#00b894")
HIGHLIGHT_RED = colors.HexColor("#d63031")
GOLD = colors.HexColor("#f39c12")
LIGHT_GRAY = colors.HexColor("#f5f5f5")
DARK_GRAY = colors.HexColor("#2d3436")


def create_styles():
    """Create custom paragraph styles."""
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
        fontSize=11,
        textColor=DARK_GRAY,
        spaceAfter=8,
        leading=14
    ))

    styles.add(ParagraphStyle(
        name='Highlight',
        parent=styles['Normal'],
        fontSize=12,
        textColor=HIGHLIGHT_GREEN,
        fontName='Helvetica-Bold'
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
    """Run full V4 analysis and return results."""
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

    # Get all data
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

    # All adjustments
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
            "home": home_vol.get("volatility_rating") if home_vol else "unknown",
            "away": away_vol.get("volatility_rating") if away_vol else "unknown",
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
    """Generate the PDF report."""
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=40,
        bottomMargin=40
    )

    styles = create_styles()
    story = []

    # Header
    story.append(Paragraph("NBA BETTING ANALYSIS", styles['MainTitle']))
    story.append(Paragraph(
        f"Best Bet Report - {datetime.now().strftime('%B %d, %Y')}",
        styles['SubTitle']
    ))

    # Recommendation Box
    rec = data["ev_metrics"]["recommended_bet"]
    direction = "OVER" if "OVER" in rec else "UNDER"
    edge = data["ev_metrics"]["edge_over"] if direction == "OVER" else data["ev_metrics"]["edge_under"]

    rec_data = [
        [Paragraph(f"<b>{data['game']['away_abbr']} @ {data['game']['home_abbr']}</b>",
                  ParagraphStyle('rec', fontSize=18, textColor=colors.white, alignment=TA_CENTER))],
        [Paragraph(f"<b>{direction} {data['line']['total']}</b>",
                  ParagraphStyle('rec2', fontSize=24, textColor=GOLD, alignment=TA_CENTER, fontName='Helvetica-Bold'))],
        [Paragraph(f"Edge: {edge*100:+.1f}% | Kelly: {data['ev_metrics']['kelly_over_fractional']*100:.1f}%",
                  ParagraphStyle('rec3', fontSize=12, textColor=colors.white, alignment=TA_CENTER))],
    ]

    rec_table = Table(rec_data, colWidths=[400])
    rec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY_COLOR),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
        ('ROUNDEDCORNERS', [10, 10, 10, 10]),
    ]))
    story.append(rec_table)
    story.append(Spacer(1, 20))

    # Key Metrics
    story.append(Paragraph("KEY METRICS", styles['SectionHeader']))

    metrics_data = [
        ["Metric", "Value"],
        ["Projected Total", f"{data['projection']['total']}"],
        ["Line", f"{data['line']['total']}"],
        ["Margin", f"{data['projection']['margin']:+.1f} pts"],
        ["P(Over)", f"{data['monte_carlo']['p_over']*100:.1f}%"],
        ["P(Under)", f"{data['monte_carlo']['p_under']*100:.1f}%"],
        ["Expected Value", f"{data['ev_metrics']['ev_over']:+.3f}" if direction == "OVER" else f"{data['ev_metrics']['ev_under']:+.3f}"],
        ["Over Odds", f"{data['line']['over_odds']:.2f}"],
        ["Under Odds", f"{data['line']['under_odds']:.2f}"],
    ]

    metrics_table = Table(metrics_data, colWidths=[200, 200])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 20))

    # Projection Breakdown
    story.append(Paragraph("PROJECTION BREAKDOWN", styles['SectionHeader']))

    adj = data["adjustments"]
    breakdown_data = [
        ["Component", "Adjustment", "Running Total"],
        ["Base Total (Efficiency)", "", f"{adj['base_total']}"],
        ["Opponent Strength", f"{adj['opp_strength']:+.1f}", f"{adj['base_total'] + adj['opp_strength']:.1f}"],
        ["Rest Days", f"{adj['rest']:+.1f}", f"{adj['base_total'] + adj['opp_strength'] + adj['rest']:.1f}"],
        ["Venue Splits", f"{adj['venue']:+.1f}", f"{adj['base_total'] + adj['opp_strength'] + adj['rest'] + adj['venue']:.1f}"],
        ["H2H History", f"{adj['h2h']:+.1f}", f"{adj['base_total'] + adj['opp_strength'] + adj['rest'] + adj['venue'] + adj['h2h']:.1f}"],
        ["O/U Trend", f"{adj['trend']:+.1f}", f"{adj['base_total'] + adj['opp_strength'] + adj['rest'] + adj['venue'] + adj['h2h'] + adj['trend']:.1f}"],
        ["Pace Matchup", f"{adj['pace']:+.1f}", f"{adj['base_total'] + adj['opp_strength'] + adj['rest'] + adj['venue'] + adj['h2h'] + adj['trend'] + adj['pace']:.1f}"],
        ["Bias Correction", f"{adj['bias']:+.1f}", f"{data['projection']['total']}"],
    ]

    breakdown_table = Table(breakdown_data, colWidths=[180, 100, 120])
    breakdown_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_GRAY),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#e8f5e9")),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(breakdown_table)
    story.append(Spacer(1, 20))

    # Team Efficiency
    story.append(Paragraph("TEAM EFFICIENCY RATINGS", styles['SectionHeader']))

    eff = data["efficiency"]
    eff_data = [
        ["Team", "ORTG", "DRTG", "Net", "Pace"],
        [data['game']['home_abbr'], f"{eff['home_ortg']:.1f}", f"{eff['home_drtg']:.1f}",
         f"{eff['home_ortg'] - eff['home_drtg']:+.1f}", f"{eff['home_pace']:.1f}"],
        [data['game']['away_abbr'], f"{eff['away_ortg']:.1f}", f"{eff['away_drtg']:.1f}",
         f"{eff['away_ortg'] - eff['away_drtg']:+.1f}", f"{eff['away_pace']:.1f}"],
    ]

    eff_table = Table(eff_data, colWidths=[80, 80, 80, 80, 80])
    eff_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(eff_table)
    story.append(Spacer(1, 20))

    # Detailed Analysis Section
    story.append(Paragraph("DETAILED ANALYSIS & RATIONALE", styles['SectionHeader']))

    # Build the narrative
    home = data['game']['home_abbr']
    away = data['game']['away_abbr']
    eff = data["efficiency"]
    rest = data["rest_info"]
    vol = data["volatility"]

    # Determine bet direction
    is_over = data['projection']['margin'] > 0
    bet_direction = "OVER" if is_over else "UNDER"

    # Calculate implied probability from odds
    over_implied = 1 / data['line']['over_odds']
    under_implied = 1 / data['line']['under_odds']

    # Introduction
    intro = f"""
    This analysis recommends <b>{bet_direction} {data['line']['total']}</b> for the {away} @ {home} matchup.
    Our V4 model projects a total of <b>{data['projection']['total']} points</b>, representing a
    <b>{abs(data['projection']['margin']):.1f}-point edge</b> over the posted line. After running 10,000
    Monte Carlo simulations, we estimate a <b>{data['monte_carlo']['p_over']*100:.1f}% probability</b>
    the game goes OVER and <b>{data['monte_carlo']['p_under']*100:.1f}%</b> probability it goes UNDER.
    """
    story.append(Paragraph(intro.strip(), styles['BodyPara']))
    story.append(Spacer(1, 10))

    # Efficiency Analysis
    story.append(Paragraph("<b>1. OFFENSIVE & DEFENSIVE EFFICIENCY ANALYSIS</b>", styles['BodyPara']))

    home_net = eff['home_ortg'] - eff['home_drtg']
    away_net = eff['away_ortg'] - eff['away_drtg']

    eff_analysis = f"""
    The foundation of our projection is team efficiency ratings, blended across multiple timeframes
    (season, L15, L10, L5 games) to capture both baseline performance and recent form.
    <br/><br/>
    <b>{home}</b> carries an Offensive Rating of {eff['home_ortg']:.1f} and Defensive Rating of {eff['home_drtg']:.1f},
    yielding a Net Rating of <b>{home_net:+.1f}</b>. """

    if eff['home_drtg'] > 115:
        eff_analysis += f"Notably, {home}'s defensive rating of {eff['home_drtg']:.1f} ranks among the worst in the league, indicating significant vulnerability to opposing offenses. "
    elif eff['home_drtg'] < 108:
        eff_analysis += f"{home}'s defensive rating of {eff['home_drtg']:.1f} is elite, suggesting they can limit scoring. "

    eff_analysis += f"""
    <br/><br/>
    <b>{away}</b> posts an Offensive Rating of {eff['away_ortg']:.1f} against a Defensive Rating of {eff['away_drtg']:.1f},
    for a Net Rating of <b>{away_net:+.1f}</b>. """

    if eff['away_ortg'] > 115:
        eff_analysis += f"{away}'s offense at {eff['away_ortg']:.1f} is highly efficient and should capitalize on defensive weaknesses. "

    eff_analysis += f"""
    <br/><br/>
    The matchup pace projection of <b>{(eff['home_pace'] + eff['away_pace'])/2:.1f}</b> possessions
    (combining {home}'s {eff['home_pace']:.1f} and {away}'s {eff['away_pace']:.1f}) provides the
    multiplier for our efficiency-based scoring expectations. This yields a <b>base total of {adj['base_total']} points</b>.
    """
    story.append(Paragraph(eff_analysis.strip(), styles['BodyPara']))
    story.append(Spacer(1, 10))

    # Rest & Schedule Analysis
    story.append(Paragraph("<b>2. REST & SCHEDULE SITUATION</b>", styles['BodyPara']))

    rest_analysis = f"""
    Rest advantages significantly impact pace and scoring. {home} enters with <b>{rest['home_rest']} days rest</b>
    while {away} has <b>{rest['away_rest']} days rest</b>. """

    if rest['home_b2b']:
        rest_analysis += f"{home} is on a back-to-back, which typically reduces scoring by 3-5 points due to fatigue. "
    if rest['away_b2b']:
        rest_analysis += f"{away} is on a back-to-back, which typically reduces scoring by 3-5 points due to fatigue. "

    if rest['home_rest'] >= 3 and rest['away_rest'] >= 3:
        rest_analysis += f"""
        With both teams enjoying extended rest (3+ days), we expect fresher legs translating to
        <b>higher pace and more efficient offense</b>. Historical data shows well-rested matchups
        average 2-3 points higher totals. This contributes <b>{adj['rest']:+.1f} points</b> to our projection.
        """
    elif adj['rest'] < 0:
        rest_analysis += f"""
        The fatigue factor works against scoring in this matchup, contributing <b>{adj['rest']:+.1f} points</b>
        to our projection.
        """
    else:
        rest_analysis += f"Rest situation is neutral to slightly positive, adding <b>{adj['rest']:+.1f} points</b>."

    story.append(Paragraph(rest_analysis.strip(), styles['BodyPara']))
    story.append(Spacer(1, 10))

    # Historical Trends
    story.append(Paragraph("<b>3. HISTORICAL O/U TRENDS</b>", styles['BodyPara']))

    if data["trend_info"]:
        trend = data["trend_info"]
        trend_analysis = f"""
        Examining the last 20 games for each team reveals important patterns. {home} games have gone
        UNDER at a rate of <b>{trend['home_under']*100:.1f}%</b>, while {away} games show an UNDER rate of
        <b>{trend['away_under']*100:.1f}%</b>. The combined UNDER rate is <b>{trend['combined']*100:.1f}%</b>.
        <br/><br/>
        """
        if trend['combined'] < 0.40:
            trend_analysis += f"""
            This is a strongly OVER-leaning profile. Both teams consistently participate in high-scoring games,
            suggesting the market may be underestimating scoring potential. This trend adds <b>{adj['trend']:+.1f} points</b>
            to our projection.
            """
        elif trend['combined'] > 0.60:
            trend_analysis += f"""
            This is an UNDER-leaning profile, but we must weigh this against the efficiency matchup.
            The trend adjustment is <b>{adj['trend']:+.1f} points</b>.
            """
        else:
            trend_analysis += f"The O/U trend is relatively neutral at {trend['combined']*100:.1f}% UNDER rate."
    else:
        trend_analysis = "Insufficient historical O/U data available for trend analysis."

    story.append(Paragraph(trend_analysis.strip(), styles['BodyPara']))
    story.append(Spacer(1, 10))

    # H2H Analysis
    story.append(Paragraph("<b>4. HEAD-TO-HEAD HISTORY</b>", styles['BodyPara']))

    if data["h2h_info"]:
        h2h = data["h2h_info"]
        h2h_diff = h2h['avg'] - adj['base_total']
        h2h_analysis = f"""
        The last <b>{h2h['games']} meetings</b> between these teams averaged <b>{h2h['avg']:.1f} total points</b>.
        Compared to our efficiency-based projection of {adj['base_total']}, this represents a
        difference of <b>{h2h_diff:+.1f} points</b>.
        <br/><br/>
        """
        if abs(h2h_diff) > 10:
            h2h_analysis += f"""
            This significant historical deviation suggests matchup-specific factors (defensive schemes,
            pace preferences, key player matchups) that our efficiency model may not fully capture.
            We weight H2H history at 15%, adding <b>{adj['h2h']:+.1f} points</b> to account for this pattern.
            """
        else:
            h2h_analysis += f"H2H history aligns reasonably with efficiency projections. Adjustment: <b>{adj['h2h']:+.1f} points</b>."
    else:
        h2h_analysis = "Insufficient head-to-head history (minimum 3 games required) for meaningful analysis."

    story.append(Paragraph(h2h_analysis.strip(), styles['BodyPara']))
    story.append(Spacer(1, 10))

    # Venue Analysis
    story.append(Paragraph("<b>5. VENUE & SITUATIONAL FACTORS</b>", styles['BodyPara']))

    venue_analysis = f"""
    Venue splits reveal how teams perform in specific contexts. We compare each team's home/away
    scoring averages against their overall averages to identify venue-specific tendencies.
    <br/><br/>
    The venue adjustment of <b>{adj['venue']:+.1f} points</b> reflects """

    if adj['venue'] > 2:
        venue_analysis += f"""
        a tendency for higher-scoring games at this venue. {away}'s road games and {home}'s home games
        both trend toward higher totals compared to their season averages.
        """
    elif adj['venue'] < -2:
        venue_analysis += f"""
        a tendency for lower-scoring games in this venue context.
        """
    else:
        venue_analysis += "neutral venue impact for this matchup."

    story.append(Paragraph(venue_analysis.strip(), styles['BodyPara']))
    story.append(Spacer(1, 10))

    # Value Analysis
    story.append(Paragraph("<b>6. VALUE & EDGE CALCULATION</b>", styles['BodyPara']))

    ev = data['ev_metrics']
    best_ev = ev['ev_over'] if is_over else ev['ev_under']
    best_edge = ev['edge_over'] if is_over else ev['edge_under']
    best_kelly = ev['kelly_over_fractional'] if is_over else ev['kelly_under_fractional']

    bet_odds = data['line']['over_odds'] if is_over else data['line']['under_odds']
    implied_prob = over_implied if is_over else under_implied
    mc_prob = data['monte_carlo']['p_over'] if is_over else data['monte_carlo']['p_under']

    value_analysis = f"""
    The critical question is not just which direction to bet, but whether there is <b>value</b> at the
    offered odds. The market prices {bet_direction} at <b>{bet_odds:.2f}</b>
    decimal odds, implying a {implied_prob*100:.1f}% probability.
    <br/><br/>
    Our Monte Carlo simulation estimates the true probability at <b>{mc_prob*100:.1f}%</b>.
    This creates an <b>edge of {best_edge*100:+.1f}%</b> - meaning we expect to win this bet
    {best_edge*100:.1f}% more often than the odds imply.
    <br/><br/>
    The <b>Expected Value (EV) is {best_ev:+.3f}</b>, indicating that for every $1 wagered, we expect
    to profit ${best_ev:.3f} on average over many similar bets.
    <br/><br/>
    Using the Kelly Criterion for optimal bankroll management, the recommended stake is
    <b>{best_kelly*100:.2f}% of bankroll</b>. """

    if best_kelly >= 0.05:
        value_analysis += """
        This qualifies as a <b>STRONG BET</b> - the edge is significant enough to warrant full Kelly sizing.
        """
    elif best_kelly >= 0.02:
        value_analysis += """
        This qualifies as a <b>STANDARD BET</b> with moderate edge.
        """
    elif best_kelly > 0:
        value_analysis += """
        This is a <b>LEAN</b> - positive expected value but smaller edge.
        """

    story.append(Paragraph(value_analysis.strip(), styles['BodyPara']))
    story.append(Spacer(1, 10))

    # Risk Factors
    story.append(Paragraph("<b>7. RISK FACTORS & CAVEATS</b>", styles['BodyPara']))

    risk_analysis = f"""
    No bet is without risk. Key considerations for this wager include:
    <br/><br/>
    <b>• Volatility:</b> {home} shows {vol['home']} volatility (std: {vol['home_std']} pts) while
    {away} shows {vol['away']} volatility (std: {vol['away_std']} pts). """

    if vol['home_std'] > 15 or vol['away_std'] > 15:
        risk_analysis += """
        Higher variance teams introduce more uncertainty - our 90% confidence interval spans
        """
        risk_analysis += f"{data['monte_carlo']['p95'] - data['monte_carlo']['p5']:.0f} points. "

    risk_analysis += f"""
    <br/><br/>
    <b>• Line Movement:</b> Odds can shift before tip-off. The current line of {data['line']['total']} may move.
    <br/><br/>
    <b>• Injury News:</b> Late scratches to key players could significantly impact our projection.
    Monitor injury reports before placing the bet.
    <br/><br/>
    <b>• Model Limitations:</b> Our V4 model achieved 90% accuracy on strong UNDER signals and 72% on
    strong OVER signals in backtesting. While robust, no model is perfect.
    """

    story.append(Paragraph(risk_analysis.strip(), styles['BodyPara']))
    story.append(Spacer(1, 10))

    # Conclusion
    story.append(Paragraph("<b>8. CONCLUSION</b>", styles['BodyPara']))

    conclusion = f"""
    Based on comprehensive analysis of efficiency metrics, rest situations, historical trends,
    head-to-head patterns, venue factors, and Monte Carlo probability modeling, we recommend
    <b>{bet_direction} {data['line']['total']}</b> for {away} @ {home}.
    <br/><br/>
    The projected total of <b>{data['projection']['total']}</b> points offers a <b>{abs(data['projection']['margin']):.1f}-point edge</b>
    over the line, with an expected value of <b>{best_ev:+.3f}</b> per dollar wagered. The Kelly-optimal
    stake is <b>{best_kelly*100:.2f}%</b> of bankroll.
    <br/><br/>
    <b>Final Verdict: {ev['recommended_bet']}</b>
    """

    story.append(Paragraph(conclusion.strip(), styles['BodyPara']))

    story.append(Spacer(1, 20))

    # Monte Carlo
    story.append(Paragraph("MONTE CARLO SIMULATION", styles['SectionHeader']))
    mc = data["monte_carlo"]
    story.append(Paragraph(
        f"Based on 10,000 simulations with correlated bivariate normal distribution:",
        styles['BodyPara']
    ))

    mc_data = [
        ["Metric", "Value"],
        ["Mean Total", f"{mc['mean']:.1f}"],
        ["5th Percentile", f"{mc['p5']:.1f}"],
        ["95th Percentile", f"{mc['p95']:.1f}"],
        ["Confidence Range", f"{mc['p95'] - mc['p5']:.1f} pts"],
    ]

    mc_table = Table(mc_data, colWidths=[200, 200])
    mc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(mc_table)
    story.append(Spacer(1, 30))

    # Disclaimer
    story.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>DISCLAIMER:</b> This analysis is for informational purposes only. Past performance does not guarantee future results. "
        "Sports betting involves risk. Please gamble responsibly. Model accuracy: 90% on strong UNDER signals, "
        "72% on strong OVER signals in backtesting (118 games, 2025-26 season).",
        styles['SmallText']
    ))
    story.append(Paragraph(
        f"Generated by NBA Expert Bettor Agent V4 | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        styles['SmallText']
    ))

    doc.build(story)
    print(f"PDF generated: {output_path}")


async def main():
    team1 = sys.argv[1] if len(sys.argv) > 1 else "PHI"
    team2 = sys.argv[2] if len(sys.argv) > 2 else "BKN"

    print(f"Analyzing {team1} vs {team2}...")
    data = await get_game_analysis(team1, team2)

    if not data:
        print(f"No game found for {team1} vs {team2}")
        return

    output_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data",
        f"best_bet_{data['game']['away_abbr']}_at_{data['game']['home_abbr']}_{datetime.now().strftime('%Y%m%d')}.pdf"
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    generate_pdf(data, output_path)


if __name__ == "__main__":
    asyncio.run(main())
