#!/usr/bin/env python3
"""
Generate Team Analysis
Daily narrative analysis generation for all 30 NBA teams in French
Synthesizes all dashboard data into comprehensive written reports
"""

import os
import sys
import json
import psycopg2
from decimal import Decimal
from datetime import datetime, date
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )

def get_current_season(cur):
    """Get current season from database"""
    cur.execute("SELECT season_id FROM seasons WHERE is_current = true LIMIT 1")
    result = cur.fetchone()
    return result[0] if result else '2025-26'

def fetch_team_basic_info(cur, team_id, season):
    """Query 1: Team basic info and standings"""
    cur.execute("""
        SELECT
            t.team_id, t.abbreviation, t.full_name,
            ts.conference, ts.conference_rank,
            ts.wins, ts.losses, ts.win_pct,
            ts.streak
        FROM teams t
        LEFT JOIN team_standings ts ON t.team_id = ts.team_id AND ts.season_id = %s
        WHERE t.team_id = %s
    """, (season, team_id))
    return cur.fetchone()

def fetch_team_ratings(cur, team_id, season):
    """Query 2: Offensive and defensive ratings, pace, PPG"""
    cur.execute("""
        SELECT
            ROUND(AVG(tgs.offensive_rating)::numeric, 1) as ortg,
            ROUND(AVG(tgs.defensive_rating)::numeric, 1) as drtg,
            ROUND(AVG(tgs.pace)::numeric, 1) as pace,
            ROUND(AVG(tgs.points)::numeric, 1) as ppg,
            ROUND(AVG(
                CASE WHEN g.home_team_id = tgs.team_id THEN g.away_team_score
                     ELSE g.home_team_score END
            )::numeric, 1) as opp_ppg,
            COUNT(*) as games_played
        FROM team_game_stats tgs
        JOIN games g ON tgs.game_id = g.game_id
        WHERE tgs.team_id = %s AND g.season = %s AND g.game_status = 'Final'
    """, (team_id, season))
    return cur.fetchone()

def fetch_ppg_rankings(cur, team_id, season):
    """Query 3: PPG rankings (offensive and defensive)"""
    cur.execute("""
        WITH team_ppg AS (
            SELECT
                tgs.team_id,
                ROUND(AVG(tgs.points)::numeric, 1) as ppg,
                ROUND(AVG(
                    CASE WHEN g.home_team_id = tgs.team_id THEN g.away_team_score
                         ELSE g.home_team_score END
                )::numeric, 1) as opp_ppg
            FROM team_game_stats tgs
            JOIN games g ON tgs.game_id = g.game_id
            WHERE g.season = %s AND g.game_status = 'Final'
            GROUP BY tgs.team_id
        ),
        ranked AS (
            SELECT
                team_id,
                ppg,
                opp_ppg,
                RANK() OVER (ORDER BY ppg DESC) as ppg_rank,
                RANK() OVER (ORDER BY opp_ppg ASC) as opp_ppg_rank
            FROM team_ppg
        )
        SELECT ppg_rank, opp_ppg_rank FROM ranked WHERE team_id = %s
    """, (season, team_id))
    return cur.fetchone()

def fetch_totals_stats(cur, team_id, season):
    """Query 4: Totals statistics (avg, stddev, min, max, over rate)"""
    cur.execute("""
        SELECT
            ROUND(AVG(g.home_team_score + g.away_team_score)::numeric, 1) as avg_total,
            ROUND(STDDEV(g.home_team_score + g.away_team_score)::numeric, 1) as stddev_total,
            MIN(g.home_team_score + g.away_team_score) as min_total,
            MAX(g.home_team_score + g.away_team_score) as max_total,
            ROUND(100.0 * SUM(CASE WHEN (g.home_team_score + g.away_team_score) > 220.5 THEN 1 ELSE 0 END) / COUNT(*)::numeric, 1) as over_rate
        FROM games g
        WHERE g.season = %s AND g.game_status = 'Final'
          AND (g.home_team_id = %s OR g.away_team_id = %s)
    """, (season, team_id, team_id))
    return cur.fetchone()

def fetch_recent_form(cur, team_id, season):
    """Query 5: Recent form L3/L5/L10"""
    cur.execute("""
        WITH recent_games AS (
            SELECT
                tgs.points,
                g.home_team_score + g.away_team_score as total,
                ROW_NUMBER() OVER (ORDER BY g.game_date DESC) as rn
            FROM team_game_stats tgs
            JOIN games g ON tgs.game_id = g.game_id
            WHERE tgs.team_id = %s AND g.season = %s AND g.game_status = 'Final'
        )
        SELECT
            ROUND(AVG(CASE WHEN rn <= 3 THEN points END)::numeric, 1) as l3_ppg,
            ROUND(AVG(CASE WHEN rn <= 3 THEN total END)::numeric, 1) as l3_total,
            ROUND(AVG(CASE WHEN rn <= 5 THEN points END)::numeric, 1) as l5_ppg,
            ROUND(AVG(CASE WHEN rn <= 5 THEN total END)::numeric, 1) as l5_total,
            ROUND(AVG(CASE WHEN rn <= 10 THEN points END)::numeric, 1) as l10_ppg,
            ROUND(AVG(CASE WHEN rn <= 10 THEN total END)::numeric, 1) as l10_total
        FROM recent_games
        WHERE rn <= 10
    """, (team_id, season))
    return cur.fetchone()

def fetch_momentum_stats(cur, team_id, season):
    """Query 6: Momentum (average margin, best win, worst loss)"""
    cur.execute("""
        SELECT
            ROUND(AVG(
                CASE WHEN g.home_team_id = %s THEN g.home_team_score - g.away_team_score
                     ELSE g.away_team_score - g.home_team_score END
            )::numeric, 1) as avg_margin,
            MAX(CASE WHEN g.home_team_id = %s THEN g.home_team_score - g.away_team_score
                     ELSE g.away_team_score - g.home_team_score END) as best_win,
            MIN(CASE WHEN g.home_team_id = %s THEN g.home_team_score - g.away_team_score
                     ELSE g.away_team_score - g.home_team_score END) as worst_loss
        FROM games g
        WHERE g.season = %s AND g.game_status = 'Final'
          AND (g.home_team_id = %s OR g.away_team_id = %s)
    """, (team_id, team_id, team_id, season, team_id, team_id))
    return cur.fetchone()

def fetch_dvp_data(cur, team_id, season):
    """Query 7: Defense vs Position data from pre-calculated table"""
    cur.execute("""
        SELECT
            opponent_position as position,
            ROUND(points_allowed_per_game::numeric, 1) as pts_allowed,
            points_allowed_rank as rank
        FROM defensive_stats_by_position
        WHERE team_id = %s AND season = %s
          AND opponent_position IN ('PG', 'SG', 'SF', 'PF', 'C')
        ORDER BY opponent_position
    """, (team_id, season))
    return cur.fetchall()

def fetch_home_away_split(cur, team_id, season):
    """Query 8: Home/Away performance split"""
    cur.execute("""
        SELECT
            SUM(CASE WHEN g.home_team_id = %s AND g.home_team_score > g.away_team_score THEN 1 ELSE 0 END) as home_wins,
            SUM(CASE WHEN g.home_team_id = %s THEN 1 ELSE 0 END) as home_games,
            SUM(CASE WHEN g.away_team_id = %s AND g.away_team_score > g.home_team_score THEN 1 ELSE 0 END) as away_wins,
            SUM(CASE WHEN g.away_team_id = %s THEN 1 ELSE 0 END) as away_games
        FROM games g
        WHERE g.season = %s AND g.game_status = 'Final'
          AND (g.home_team_id = %s OR g.away_team_id = %s)
    """, (team_id, team_id, team_id, team_id, season, team_id, team_id))
    return cur.fetchone()

def classify_team_profile(ppg_rank, opp_ppg_rank):
    """Classify team profile based on offensive and defensive rankings"""
    if ppg_rank is None or opp_ppg_rank is None:
        return "une équipe en développement"

    if ppg_rank <= 10 and opp_ppg_rank <= 10:
        return "une équipe d'élite des deux côtés du terrain"
    elif ppg_rank <= 10 and opp_ppg_rank > 15:
        return "une équipe résolument offensive"
    elif opp_ppg_rank <= 10 and ppg_rank > 15:
        return "une équipe défensive avant tout"
    elif ppg_rank <= 15 and opp_ppg_rank <= 15:
        return "une équipe complète et équilibrée"
    elif ppg_rank > 20 and opp_ppg_rank > 20:
        return "une équipe en reconstruction"
    else:
        return "une équipe au profil mixte"

def analyze_trend(l3_ppg, l10_ppg):
    """Analyze recent form trend"""
    if l3_ppg is None or l10_ppg is None:
        return "avec une forme difficile à évaluer"

    diff = float(l3_ppg) - float(l10_ppg)
    if diff > 5:
        return "en excellente forme récente"
    elif diff > 3:
        return "en nette progression"
    elif diff > 1:
        return "en légère amélioration"
    elif diff < -5:
        return "en forte baisse de régime"
    elif diff < -3:
        return "en perte de vitesse"
    elif diff < -1:
        return "en léger recul"
    else:
        return "avec une performance stable"

def format_streak(streak):
    """Format streak string in French"""
    if not streak:
        return "sans série particulière"
    if streak.startswith('W'):
        count = streak[1:]
        return f"sur une série de {count} victoire{'s' if int(count) > 1 else ''}"
    elif streak.startswith('L'):
        count = streak[1:]
        return f"sur une série de {count} défaite{'s' if int(count) > 1 else ''}"
    return streak

def get_dvp_tier(rank):
    """Get DVP tier label from rank"""
    if rank <= 6:
        return "Élite"
    elif rank <= 12:
        return "Bon"
    elif rank <= 18:
        return "Moyen"
    elif rank <= 24:
        return "Faible"
    else:
        return "Vulnérable"

def get_dvp_tier_class(rank):
    """Get CSS class name for DVP tier"""
    if rank <= 6:
        return "dvp-elite"
    elif rank <= 12:
        return "dvp-good"
    elif rank <= 18:
        return "dvp-average"
    else:
        return "dvp-weak"

def generate_analysis_html(data):
    """Generate French narrative HTML from collected data - plain text, well formatted"""
    html_parts = []
    abbr = data['abbreviation']

    # Section 1: Vue d'ensemble
    html_parts.append('<h3>Vue d\'ensemble</h3>')

    overview = f"<p>Les <strong>{data['full_name']}</strong> occupent actuellement la <strong>{data['conference_rank']}e place</strong> de la Conférence {data['conference']} avec un bilan de <strong>{data['wins']}-{data['losses']}</strong> ({data['win_pct']:.1%}). {format_streak(data['streak']).capitalize()}.</p>"

    profile = classify_team_profile(data['ppg_rank'], data['opp_ppg_rank'])
    net_rtg = float(data['ortg'] or 0) - float(data['drtg'] or 0)
    net_sign = '+' if net_rtg >= 0 else ''
    overview += f"<p>Avec un Net Rating de <strong>{net_sign}{net_rtg:.1f}</strong>, {abbr} se profile comme {profile}.</p>"
    html_parts.append(overview)

    # Section 2: Profil offensif
    html_parts.append('<h3>Profil Offensif</h3>')

    offense = f"<p>Avec <strong>{data['ppg']:.1f} points par match</strong> ({data['ppg_rank']}e de la ligue), les {abbr} affichent un Rating Offensif de {data['ortg']:.1f}."

    pace = float(data['pace'] or 100)
    if pace > 102:
        offense += f" Leur pace de {pace:.1f} indique une préférence pour le jeu rapide et les transitions.</p>"
    elif pace < 98:
        offense += f" Leur pace de {pace:.1f} témoigne d'un style de jeu posé et maîtrisé en demi-terrain.</p>"
    else:
        offense += f" Avec un pace de {pace:.1f}, ils jouent à un rythme équilibré.</p>"
    html_parts.append(offense)

    # Section 3: Profil défensif avec DVP
    html_parts.append('<h3>Profil Défensif</h3>')

    defense = f"<p>En défense, {abbr} concède <strong>{data['opp_ppg']:.1f} points</strong> en moyenne ({data['opp_ppg_rank']}e de la ligue), avec un Rating Défensif de {data['drtg']:.1f}.</p>"
    html_parts.append(defense)

    # DVP data as simple list
    if data['dvp_data']:
        dvp_text = "<p><strong>Defense vs Position :</strong><br/>"
        dvp_items = []
        for pos, pts, rank in data['dvp_data']:
            if pts:
                tier = get_dvp_tier(rank)
                dvp_items.append(f"• {pos} : {pts:.1f} pts (#{rank} - {tier})")
        dvp_text += "<br/>".join(dvp_items) + "</p>"
        html_parts.append(dvp_text)

        # Identify strengths and weaknesses
        strengths = [pos for pos, pts, rank in data['dvp_data'] if rank and rank <= 10]
        weaknesses = [pos for pos, pts, rank in data['dvp_data'] if rank and rank >= 20]

        insights = []
        if strengths:
            insights.append(f"Points forts défensifs contre les {', '.join(strengths)}.")
        if weaknesses:
            insights.append(f"Vulnérable face aux {', '.join(weaknesses)}.")
        if insights:
            html_parts.append(f"<p>{' '.join(insights)}</p>")

    # Section 4: Forme récente
    html_parts.append('<h3>Forme Récente</h3>')

    trend = analyze_trend(data['l3_ppg'], data['l10_ppg'])
    form = f"<p>L'équipe est actuellement {trend}.</p>"
    form += f"<p>PPG sur les derniers matchs : L3 = {data['l3_ppg']:.1f} | L5 = {data['l5_ppg']:.1f} | L10 = {data['l10_ppg']:.1f}</p>"
    html_parts.append(form)

    if data['avg_margin'] is not None:
        margin = float(data['avg_margin'])
        margin_sign = '+' if margin >= 0 else ''
        form_extra = f"<p>Écart moyen : {margin_sign}{margin:.1f} pts/match. Plus grande victoire : +{data['best_win']} | Plus lourde défaite : {data['worst_loss']}</p>"
        html_parts.append(form_extra)

    # Section 5: Domicile vs Extérieur
    html_parts.append('<h3>Domicile vs Extérieur</h3>')

    home_losses = data['home_games'] - data['home_wins']
    away_losses = data['away_games'] - data['away_wins']
    splits = f"<p>Domicile : {data['home_wins']}-{home_losses} | Extérieur : {data['away_wins']}-{away_losses}</p>"
    html_parts.append(splits)

    # Section 6: Tendances Paris
    html_parts.append('<h3>Tendances Paris</h3>')

    betting = f"<p>Les matchs de {abbr} totalisent en moyenne <strong>{data['avg_total']:.1f} points</strong> (écart-type : {data['stddev_total']:.1f}). Range observé : {data['min_total']} à {data['max_total']} points.</p>"

    over_rate = float(data['over_rate'] or 0)
    betting += f"<p>Taux de Over 220.5 : <strong>{over_rate:.0f}%</strong></p>"
    html_parts.append(betting)

    return "\n".join(html_parts)

def generate_team_analysis():
    """Main function to generate analysis for all teams"""
    print("=" * 80)
    print("📝 GENERATING TEAM ANALYSIS")
    print("=" * 80)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        season = get_current_season(cur)
        today = date.today()

        print(f"📅 Season: {season}")
        print(f"📅 Analysis date: {today}\n")

        # Get all teams
        cur.execute("SELECT team_id FROM teams ORDER BY team_id")
        teams = [row[0] for row in cur.fetchall()]

        print(f"📋 Processing {len(teams)} teams\n")

        processed = 0
        inserted = 0

        for team_id in teams:
            processed += 1

            # Fetch all data for this team
            basic = fetch_team_basic_info(cur, team_id, season)
            if not basic or not basic[0]:
                print(f"  ⚠️  Team {team_id}: No basic info found")
                continue

            ratings = fetch_team_ratings(cur, team_id, season)
            rankings = fetch_ppg_rankings(cur, team_id, season)
            totals = fetch_totals_stats(cur, team_id, season)
            recent = fetch_recent_form(cur, team_id, season)
            momentum = fetch_momentum_stats(cur, team_id, season)
            dvp = fetch_dvp_data(cur, team_id, season)
            home_away = fetch_home_away_split(cur, team_id, season)

            # Skip if no games played
            games_played = ratings[5] if ratings and ratings[5] else 0
            if games_played == 0:
                print(f"  ⚠️  {basic[1]}: No games played yet")
                continue

            # Compile all data
            data = {
                'team_id': basic[0],
                'abbreviation': basic[1],
                'full_name': basic[2],
                'conference': basic[3] or 'East',
                'conference_rank': basic[4] or 0,
                'wins': basic[5] or 0,
                'losses': basic[6] or 0,
                'win_pct': basic[7] or 0,
                'streak': basic[8],
                'ortg': ratings[0] if ratings else 0,
                'drtg': ratings[1] if ratings else 0,
                'pace': ratings[2] if ratings else 0,
                'ppg': ratings[3] if ratings else 0,
                'opp_ppg': ratings[4] if ratings else 0,
                'games_played': games_played,
                'ppg_rank': rankings[0] if rankings else None,
                'opp_ppg_rank': rankings[1] if rankings else None,
                'avg_total': totals[0] if totals else 0,
                'stddev_total': totals[1] if totals else 0,
                'min_total': totals[2] if totals else 0,
                'max_total': totals[3] if totals else 0,
                'over_rate': totals[4] if totals else 0,
                'l3_ppg': recent[0] if recent else 0,
                'l3_total': recent[1] if recent else 0,
                'l5_ppg': recent[2] if recent else 0,
                'l5_total': recent[3] if recent else 0,
                'l10_ppg': recent[4] if recent else 0,
                'l10_total': recent[5] if recent else 0,
                'avg_margin': momentum[0] if momentum else 0,
                'best_win': momentum[1] if momentum else 0,
                'worst_loss': momentum[2] if momentum else 0,
                'dvp_data': dvp if dvp else [],
                'home_wins': home_away[0] if home_away else 0,
                'home_games': home_away[1] if home_away else 0,
                'away_wins': home_away[2] if home_away else 0,
                'away_games': home_away[3] if home_away else 0,
            }

            # Generate HTML narrative
            analysis_html = generate_analysis_html(data)

            # Convert data to JSON-serializable format (handle Decimal from PostgreSQL)
            def to_json_safe(v):
                if v is None:
                    return None
                if isinstance(v, Decimal):
                    return float(v)
                if isinstance(v, (int, float)):
                    return float(v)
                return v

            analysis_data = {k: to_json_safe(v) for k, v in data.items() if k != 'dvp_data'}
            analysis_data['dvp_data'] = [
                {'position': pos, 'pts_allowed': float(pts) if pts else 0, 'rank': int(rank) if rank else 0}
                for pos, pts, rank in (dvp or [])
            ]

            # Insert into database
            cur.execute("""
                INSERT INTO team_analysis (
                    team_id, season, analysis_data, analysis_html, data_as_of, games_included
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (team_id, season, data_as_of)
                DO UPDATE SET
                    analysis_data = EXCLUDED.analysis_data,
                    analysis_html = EXCLUDED.analysis_html,
                    generated_at = NOW(),
                    games_included = EXCLUDED.games_included
            """, (
                team_id, season,
                json.dumps(analysis_data),
                analysis_html,
                today,
                games_played
            ))

            if cur.rowcount > 0:
                inserted += 1

            print(f"[{processed}/{len(teams)}] ✅ {data['abbreviation']}: {games_played} games analyzed")

            # Batch commit every 10 teams
            if processed % 10 == 0:
                conn.commit()
                print(f"  📦 Committed batch ({processed}/{len(teams)})")

        conn.commit()

        print(f"\n{'=' * 80}")
        print(f"📊 Team Analysis Generation Summary:")
        print(f"  • Teams processed: {processed}")
        print(f"  • Analyses generated: {inserted}")
        print(f"  • Season: {season}")
        print(f"  • Date: {today}")
        print(f"{'=' * 80}")

        # Verify
        cur.execute("""
            SELECT COUNT(*), MAX(generated_at)
            FROM team_analysis
            WHERE season = %s AND data_as_of = %s
        """, (season, today))
        verification = cur.fetchone()
        print(f"\n✅ Verified: {verification[0]} analyses in database (last: {verification[1]})")

        cur.close()
        conn.close()

        print("\n✅ Team analysis generation completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = generate_team_analysis()
    sys.exit(0 if success else 1)
