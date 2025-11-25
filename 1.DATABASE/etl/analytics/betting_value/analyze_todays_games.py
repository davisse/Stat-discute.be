#!/usr/bin/env python3
"""
Betting Value Analysis - Analyze Today's Games

Collects data from PostgreSQL and generates betting value recommendations
Stores results in betting_value_analysis table
"""

import os
import sys
import json
from datetime import date, datetime
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))
from scoring_engine import ScoringEngine, ValueRecommendation

# Load environment
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))


def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'chapirou'),
        password=os.getenv('DB_PASSWORD', ''),
        cursor_factory=RealDictCursor
    )


def get_current_season(conn):
    """Get current season from database"""
    cur = conn.cursor()
    cur.execute("SELECT season_id FROM seasons WHERE is_current = true LIMIT 1")
    result = cur.fetchone()
    cur.close()
    return result['season_id'] if result else '2025-26'


def get_todays_games(conn, season, analysis_date=None):
    """Get all games for analysis date"""
    if analysis_date is None:
        analysis_date = date.today()

    cur = conn.cursor()
    cur.execute("""
        SELECT
            g.game_id,
            g.game_date,
            g.home_team_id,
            g.away_team_id,
            ht.abbreviation as home_team_abbr,
            at.abbreviation as away_team_abbr,
            g.game_status
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE g.game_date = %s
          AND g.season = %s
        ORDER BY g.game_date
    """, (analysis_date, season))

    games = cur.fetchall()
    cur.close()
    return games


def get_positional_matchups(conn, game_id, home_team_id, away_team_id, season):
    """
    Get key positional matchups for a game
    Returns list of dicts with player stats vs opponent defensive rank
    """
    cur = conn.cursor()

    # Get away team's top players (they're facing home defense)
    cur.execute("""
        SELECT
            p.player_id,
            p.full_name as player_name,
            p.position,
            AVG(pgs.points) as season_avg_points,
            COUNT(pgs.game_id) as games_played
        FROM players p
        JOIN player_game_stats pgs ON p.player_id = pgs.player_id
        JOIN games g ON pgs.game_id = g.game_id
        WHERE pgs.team_id = %s
          AND g.season = %s
          AND p.position IS NOT NULL
          AND pgs.minutes > 0
        GROUP BY p.player_id, p.full_name, p.position
        HAVING COUNT(pgs.game_id) >= 5
        ORDER BY AVG(pgs.points) DESC
        LIMIT 3
    """, (away_team_id, season))

    away_players = cur.fetchall()

    # Get home defense stats by position
    matchups = []
    for player in away_players:
        position = player['position']

        # Get home team's defense against this position
        cur.execute("""
            SELECT
                opponent_position,
                points_allowed_rank,
                points_allowed_per_game,
                fg_pct_allowed
            FROM defensive_stats_by_position
            WHERE team_id = %s
              AND opponent_position = %s
              AND season = %s
        """, (home_team_id, position, season))

        defense = cur.fetchone()

        if defense:
            # Get league average for this position
            cur.execute("""
                SELECT AVG(points_allowed_per_game) as league_avg
                FROM defensive_stats_by_position
                WHERE opponent_position = %s
                  AND season = %s
            """, (position, season))

            league_avg = cur.fetchone()

            matchups.append({
                'player_name': player['player_name'],
                'position': position,
                'season_avg_points': float(player['season_avg_points']),
                'opponent_rank_vs_position': int(defense['points_allowed_rank']),
                'opponent_ppg_allowed': float(defense['points_allowed_per_game']),
                'league_avg_ppg_allowed': float(league_avg['league_avg']) if league_avg else 25.0
            })

    # Repeat for home team's top players vs away defense
    cur.execute("""
        SELECT
            p.player_id,
            p.full_name as player_name,
            p.position,
            AVG(pgs.points) as season_avg_points,
            COUNT(pgs.game_id) as games_played
        FROM players p
        JOIN player_game_stats pgs ON p.player_id = pgs.player_id
        JOIN games g ON pgs.game_id = g.game_id
        WHERE pgs.team_id = %s
          AND g.season = %s
          AND p.position IS NOT NULL
          AND pgs.minutes > 0
        GROUP BY p.player_id, p.full_name, p.position
        HAVING COUNT(pgs.game_id) >= 5
        ORDER BY AVG(pgs.points) DESC
        LIMIT 3
    """, (home_team_id, season))

    home_players = cur.fetchall()

    for player in home_players:
        position = player['position']

        cur.execute("""
            SELECT
                opponent_position,
                points_allowed_rank,
                points_allowed_per_game,
                fg_pct_allowed
            FROM defensive_stats_by_position
            WHERE team_id = %s
              AND opponent_position = %s
              AND season = %s
        """, (away_team_id, position, season))

        defense = cur.fetchone()

        if defense:
            cur.execute("""
                SELECT AVG(points_allowed_per_game) as league_avg
                FROM defensive_stats_by_position
                WHERE opponent_position = %s
                  AND season = %s
            """, (position, season))

            league_avg = cur.fetchone()

            matchups.append({
                'player_name': player['player_name'],
                'position': position,
                'season_avg_points': float(player['season_avg_points']),
                'opponent_rank_vs_position': int(defense['points_allowed_rank']),
                'opponent_ppg_allowed': float(defense['points_allowed_per_game']),
                'league_avg_ppg_allowed': float(league_avg['league_avg']) if league_avg else 25.0
            })

    cur.close()
    return matchups


def get_team_advanced_stats(conn, team_id, season):
    """Get team's recent advanced stats (last 10 games)"""
    cur = conn.cursor()

    cur.execute("""
        SELECT
            AVG(pace) as pace,
            AVG(efg_pct) as efg_pct,
            AVG(tov_pct) as tov_pct
        FROM (
            SELECT
                tgs.pace,
                tgs.effective_fg_pct as efg_pct,
                tgs.turnover_pct as tov_pct
            FROM team_game_stats tgs
            JOIN games g ON tgs.game_id = g.game_id
            WHERE tgs.team_id = %s
              AND g.season = %s
            ORDER BY g.game_date DESC
            LIMIT 10
        ) as recent_games
    """, (team_id, season))

    result = cur.fetchone()
    cur.close()

    if result and result['pace']:
        return {
            'pace': float(result['pace']),
            'efg_pct': float(result['efg_pct']) if result['efg_pct'] else 0.50,
            'tov_pct': float(result['tov_pct']) if result['tov_pct'] else 0.14
        }
    else:
        # Defaults if no data
        return {
            'pace': 100.0,
            'efg_pct': 0.50,
            'tov_pct': 0.14
        }


def get_recent_form(conn, team_id, season):
    """Get team's last 5 games results with point differential analysis"""
    cur = conn.cursor()

    cur.execute("""
        SELECT
            g.game_date,
            g.home_team_score,
            g.away_team_score,
            CASE
                WHEN g.home_team_id = %s THEN
                    CASE WHEN g.home_team_score > g.away_team_score THEN 1 ELSE 0 END
                ELSE
                    CASE WHEN g.away_team_score > g.home_team_score THEN 1 ELSE 0 END
            END as won,
            CASE
                WHEN g.home_team_id = %s THEN g.home_team_score - g.away_team_score
                ELSE g.away_team_score - g.home_team_score
            END as point_differential
        FROM games g
        WHERE (g.home_team_id = %s OR g.away_team_id = %s)
          AND g.season = %s
          AND g.game_status = 'Final'
        ORDER BY g.game_date DESC
        LIMIT 5
    """, (team_id, team_id, team_id, team_id, season))

    results = cur.fetchall()
    cur.close()

    if not results:
        return {
            'wins': 0,
            'losses': 5,
            'avg_point_diff': 0.0,
            'blowout_wins': 0,  # Wins by 15+ points
            'close_wins': 0,     # Wins by <8 points
            'blowout_losses': 0, # Losses by 15+ points
            'close_losses': 0,   # Losses by <8 points
            'momentum_trend': 'neutral'  # improving, declining, neutral
        }

    wins = sum(1 for r in results if r['won'] == 1)
    losses = len(results) - wins

    # Point differential analysis
    point_diffs = [float(r['point_differential']) for r in results]
    avg_point_diff = sum(point_diffs) / len(point_diffs) if point_diffs else 0.0

    # Categorize wins and losses
    blowout_wins = sum(1 for r in results if r['won'] == 1 and r['point_differential'] >= 15)
    close_wins = sum(1 for r in results if r['won'] == 1 and r['point_differential'] < 8)
    blowout_losses = sum(1 for r in results if r['won'] == 0 and r['point_differential'] <= -15)
    close_losses = sum(1 for r in results if r['won'] == 0 and abs(r['point_differential']) < 8)

    # Momentum trend: Are margins improving or declining?
    if len(point_diffs) >= 3:
        recent_avg = sum(point_diffs[:3]) / 3  # Last 3 games
        older_avg = sum(point_diffs[3:]) / len(point_diffs[3:]) if len(point_diffs) > 3 else recent_avg

        if recent_avg > older_avg + 5:
            momentum_trend = 'improving'
        elif recent_avg < older_avg - 5:
            momentum_trend = 'declining'
        else:
            momentum_trend = 'neutral'
    else:
        momentum_trend = 'neutral'

    return {
        'wins': wins,
        'losses': losses,
        'avg_point_diff': avg_point_diff,
        'blowout_wins': blowout_wins,
        'close_wins': close_wins,
        'blowout_losses': blowout_losses,
        'close_losses': close_losses,
        'momentum_trend': momentum_trend
    }


def get_days_rest(conn, team_id, game_date, season):
    """Calculate days of rest before this game

    Returns:
        tuple: (days_rest: int, is_back_to_back: bool, last_game_date: date or None)
    """
    cur = conn.cursor()

    cur.execute("""
        SELECT MAX(g.game_date) as last_game_date
        FROM games g
        WHERE (g.home_team_id = %s OR g.away_team_id = %s)
          AND g.game_date < %s
          AND g.season = %s
          AND g.game_status = 'Final'
    """, (team_id, team_id, game_date, season))

    result = cur.fetchone()
    cur.close()

    if result and result['last_game_date']:
        last_game = result['last_game_date']
        if isinstance(last_game, str):
            last_game = datetime.strptime(last_game, '%Y-%m-%d').date()
        if isinstance(game_date, str):
            game_date = datetime.strptime(game_date, '%Y-%m-%d').date()

        days_rest = (game_date - last_game).days - 1
        is_back_to_back = days_rest == 0

        return days_rest, is_back_to_back, last_game
    else:
        return 3, False, None  # Assume well-rested if no recent game


def get_ats_performance(conn, team_id, season, is_home=True):
    """
    Get ATS cover percentage from database

    Args:
        conn: Database connection
        team_id: Team ID to query
        season: Season string (e.g., '2025-26')
        is_home: If True, return home ATS %, else away ATS %

    Returns:
        float: ATS cover percentage (0.0-1.0), defaults to 0.50 if no data
    """
    cur = conn.cursor()
    cur.execute("""
        SELECT
            ats_win_pct,
            home_ats_wins,
            home_ats_losses,
            away_ats_wins,
            away_ats_losses
        FROM ats_performance
        WHERE team_id = %s AND season_id = %s
    """, (team_id, season))
    result = cur.fetchone()
    cur.close()

    if result:
        # Calculate home or away ATS percentage based on context
        if is_home:
            if result['home_ats_wins'] + result['home_ats_losses'] > 0:
                return float(result['home_ats_wins']) / (result['home_ats_wins'] + result['home_ats_losses'])
            else:
                return float(result['ats_win_pct']) if result['ats_win_pct'] else 0.50
        else:
            if result['away_ats_wins'] + result['away_ats_losses'] > 0:
                return float(result['away_ats_wins']) / (result['away_ats_wins'] + result['away_ats_losses'])
            else:
                return float(result['ats_win_pct']) if result['ats_win_pct'] else 0.50
    else:
        # Default to neutral 0.50 if no data available
        return 0.50


def get_line_value(conn, game_id):
    """
    Get betting line movement data from database

    Args:
        conn: Database connection
        game_id: Game ID to query

    Returns:
        dict: Line movement data with keys:
            - opening_line: Opening spread value
            - current_line: Current spread value
            - movement_magnitude: Absolute points moved
            - movement_direction: 'home'/'away'/'none'
        None: If no line data available
    """
    cur = conn.cursor()

    # Get opening line
    cur.execute("""
        SELECT spread, recorded_at
        FROM betting_lines
        WHERE game_id = %s
          AND spread IS NOT NULL
          AND is_opening_line = true
        ORDER BY recorded_at ASC
        LIMIT 1
    """, (game_id,))
    opening = cur.fetchone()

    # Get current line
    cur.execute("""
        SELECT spread, recorded_at
        FROM betting_lines
        WHERE game_id = %s
          AND spread IS NOT NULL
          AND is_opening_line = false
        ORDER BY recorded_at DESC
        LIMIT 1
    """, (game_id,))
    current = cur.fetchone()

    cur.close()

    if opening and current:
        opening_line = float(opening['spread'])
        current_line = float(current['spread'])
        movement = current_line - opening_line

        return {
            'opening_line': opening_line,
            'current_line': current_line,
            'movement_magnitude': abs(movement),
            'movement_direction': 'toward_home' if movement > 0 else ('toward_away' if movement < 0 else 'none')
        }
    elif opening:
        # Only opening line available
        return {
            'opening_line': float(opening['spread']),
            'current_line': float(opening['spread']),
            'movement_magnitude': 0.0,
            'movement_direction': 'none'
        }
    else:
        return None


def get_travel_distance(conn, away_team_id, home_team_id, away_team_last_game_date, game_date, season):
    """
    Calculate travel distance for away team from their last game location

    Args:
        conn: Database connection
        away_team_id: Away team ID
        home_team_id: Home team ID (today's game venue)
        away_team_last_game_date: Date of away team's previous game
        game_date: Current game date
        season: Current season

    Returns:
        float: Travel distance in miles, or 0.0 if cannot be calculated
    """
    if not away_team_last_game_date:
        return 0.0

    cur = conn.cursor()

    try:
        # Get coordinates of today's game venue (where away team is traveling TO)
        cur.execute("""
            SELECT v.latitude, v.longitude
            FROM venues v
            WHERE v.team_id = %s
              AND v.is_active = true
            LIMIT 1
        """, (home_team_id,))
        dest_venue = cur.fetchone()

        if not dest_venue or not dest_venue['latitude'] or not dest_venue['longitude']:
            return 0.0

        dest_lat = float(dest_venue['latitude'])
        dest_lon = float(dest_venue['longitude'])

        # Get coordinates of away team's last game location (where they're traveling FROM)
        cur.execute("""
            SELECT
                CASE
                    WHEN g.home_team_id = %s THEN home_v.latitude
                    ELSE away_v.latitude
                END as origin_lat,
                CASE
                    WHEN g.home_team_id = %s THEN home_v.longitude
                    ELSE away_v.longitude
                END as origin_lon
            FROM games g
            LEFT JOIN venues home_v ON g.home_team_id = home_v.team_id AND home_v.is_active = true
            LEFT JOIN venues away_v ON g.away_team_id = away_v.team_id AND away_v.is_active = true
            WHERE (g.home_team_id = %s OR g.away_team_id = %s)
              AND g.game_date = %s
              AND g.season = %s
            LIMIT 1
        """, (away_team_id, away_team_id, away_team_id, away_team_id, away_team_last_game_date, season))
        origin_venue = cur.fetchone()

        if not origin_venue or not origin_venue['origin_lat'] or not origin_venue['origin_lon']:
            return 0.0

        origin_lat = float(origin_venue['origin_lat'])
        origin_lon = float(origin_venue['origin_lon'])

        # Calculate distance using database function
        cur.execute("""
            SELECT calculate_distance_miles(%s, %s, %s, %s) as distance
        """, (origin_lat, origin_lon, dest_lat, dest_lon))
        result = cur.fetchone()

        return float(result['distance']) if result and result['distance'] else 0.0

    except Exception as e:
        print(f"⚠️  Error calculating travel distance: {e}")
        return 0.0
    finally:
        cur.close()


def analyze_game(conn, game, season):
    """
    Analyze a single game and generate value recommendation

    Returns:
        ValueRecommendation object
    """
    game_id = game['game_id']
    home_team_id = game['home_team_id']
    away_team_id = game['away_team_id']
    home_team = game['home_team_abbr']
    away_team = game['away_team_abbr']
    game_date = game['game_date']

    print(f"\n🔍 Analyzing: {away_team} @ {home_team} ({game_id})")

    # Collect all data
    matchups = get_positional_matchups(conn, game_id, home_team_id, away_team_id, season)
    home_stats = get_team_advanced_stats(conn, home_team_id, season)
    away_stats = get_team_advanced_stats(conn, away_team_id, season)
    home_wins_last_5 = get_recent_form(conn, home_team_id, season)
    away_wins_last_5 = get_recent_form(conn, away_team_id, season)
    home_days_rest, _, _ = get_days_rest(conn, home_team_id, game_date, season)
    away_days_rest, away_is_b2b, away_last_game_date = get_days_rest(conn, away_team_id, game_date, season)

    # Calculate away team travel distance
    away_travel_distance = get_travel_distance(
        conn, away_team_id, home_team_id, away_last_game_date, game_date, season
    )

    # Get ATS performance with home/away context
    home_ats_pct = get_ats_performance(conn, home_team_id, season, is_home=True)
    away_ats_pct = get_ats_performance(conn, away_team_id, season, is_home=False)

    # Get betting line movement data
    line_value = get_line_value(conn, game_id)

    # Use scoring engine
    recommendation = ScoringEngine.calculate_total_value(
        game_id=game_id,
        home_team=home_team,
        away_team=away_team,
        matchups=matchups,
        home_ats_pct=home_ats_pct,
        away_ats_pct=away_ats_pct,
        home_pace=home_stats['pace'],
        away_pace=away_stats['pace'],
        home_efg=home_stats['efg_pct'],
        away_efg=away_stats['efg_pct'],
        home_tov_pct=home_stats['tov_pct'],
        away_tov_pct=away_stats['tov_pct'],
        home_wins_last_5=home_wins_last_5,
        away_wins_last_5=away_wins_last_5,
        home_days_rest=home_days_rest,
        away_days_rest=away_days_rest,
        away_is_back_to_back=away_is_b2b,
        away_travel_distance_miles=away_travel_distance,
        # Add betting line movement data
        opening_line=line_value['opening_line'] if line_value else None,
        current_line=line_value['current_line'] if line_value else None
    )

    print(f"✅ Score: {recommendation.total_score:.1f} ({recommendation.value_tier.value})")
    print(f"💡 Recommendation: {recommendation.recommended_bet.value} on {recommendation.recommended_side}")

    return recommendation, home_team_id, away_team_id


def store_analysis(conn, recommendation, home_team_id, away_team_id, analysis_date):
    """Store analysis in database"""
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO betting_value_analysis (
            game_id, analysis_date,
            home_team_id, away_team_id,
            positional_matchup_score,
            betting_trend_score,
            advanced_stats_score,
            recent_form_score,
            rest_schedule_score,
            line_value_score,
            total_value_score,
            value_tier,
            recommended_bet_type,
            recommended_side,
            confidence_level,
            score_rationale
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (game_id, analysis_date)
        DO UPDATE SET
            positional_matchup_score = EXCLUDED.positional_matchup_score,
            betting_trend_score = EXCLUDED.betting_trend_score,
            advanced_stats_score = EXCLUDED.advanced_stats_score,
            recent_form_score = EXCLUDED.recent_form_score,
            rest_schedule_score = EXCLUDED.rest_schedule_score,
            line_value_score = EXCLUDED.line_value_score,
            total_value_score = EXCLUDED.total_value_score,
            value_tier = EXCLUDED.value_tier,
            recommended_bet_type = EXCLUDED.recommended_bet_type,
            recommended_side = EXCLUDED.recommended_side,
            confidence_level = EXCLUDED.confidence_level,
            score_rationale = EXCLUDED.score_rationale,
            updated_at = NOW()
    """, (
        recommendation.game_id,
        analysis_date,
        home_team_id,
        away_team_id,
        recommendation.score_breakdown.positional_matchup,
        recommendation.score_breakdown.betting_trends,
        recommendation.score_breakdown.advanced_stats,
        recommendation.score_breakdown.recent_form,
        recommendation.score_breakdown.rest_schedule,
        recommendation.score_breakdown.line_value,
        recommendation.total_score,
        recommendation.value_tier.value,
        recommendation.recommended_bet.value,
        recommendation.recommended_side,
        recommendation.confidence,
        json.dumps(recommendation.rationale)
    ))

    conn.commit()
    cur.close()


def main():
    """Main analysis workflow"""
    print("=" * 80)
    print("🎯 BETTING VALUE ANALYSIS - Today's Games")
    print("=" * 80)

    conn = get_db_connection()

    try:
        season = get_current_season(conn)
        today = date.today()

        print(f"\n📅 Season: {season}")
        print(f"📅 Analysis Date: {today}")

        # Get today's games
        games = get_todays_games(conn, season, today)

        if not games:
            print(f"\n⚠️  No games scheduled for {today}")
            return

        print(f"\n🏀 Found {len(games)} games")

        # Analyze each game
        recommendations = []
        for game in games:
            try:
                rec, home_id, away_id = analyze_game(conn, game, season)
                recommendations.append((rec, home_id, away_id))

                # Store in database
                store_analysis(conn, rec, home_id, away_id, today)

            except Exception as e:
                print(f"❌ Error analyzing {game['game_id']}: {str(e)}")
                import traceback
                traceback.print_exc()
                continue

        # Print summary
        print("\n" + "=" * 80)
        print("📊 SUMMARY - Top Value Opportunities")
        print("=" * 80)

        # Sort by score
        recommendations.sort(key=lambda x: x[0].total_score, reverse=True)

        for i, (rec, _, _) in enumerate(recommendations, 1):
            tier_emoji = {
                'Exceptional': '🔥',
                'Strong': '⭐',
                'Good': '✅',
                'Slight': '⚖️',
                'None': '❌'
            }.get(rec.value_tier.value, '')

            print(f"\n{i}. {tier_emoji} {rec.recommended_side} ({rec.total_score:.1f}/100 - {rec.value_tier.value})")
            print(f"   Game: {rec.game_id}")
            print(f"   Bet: {rec.recommended_bet.value}")
            print(f"   Confidence: {rec.confidence}")

            if rec.rationale:
                print(f"   Key Factors:")
                for rationale in rec.rationale[:3]:  # Top 3
                    print(f"     • {rationale}")

        print("\n✅ Analysis complete! Results stored in betting_value_analysis table")

    finally:
        conn.close()


if __name__ == '__main__':
    main()
