#!/usr/bin/env python3
"""
Calculate Totals Projections
Generate pace-adjusted total projections for upcoming games
"""

import os
import sys
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))

# Constants
LEAGUE_AVG_PACE = 99.5  # 2024-25 season league average
DENVER_TEAM_ID = 1610612743  # Denver Nuggets for altitude adjustment


def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )


def get_team_recent_stats(cur, team_id: int, season: str, games: int = 10) -> Optional[Dict]:
    """
    Get team's recent stats for projection calculations
    Uses exponential weighting for recent games (more recent = higher weight)
    """
    cur.execute("""
        WITH recent_games AS (
            SELECT
                tgs.points,
                tgs.pace,
                tgs.offensive_rating,
                tgs.defensive_rating,
                tgs.effective_fg_pct,
                tgs.turnover_pct,
                g.game_date,
                ROW_NUMBER() OVER (ORDER BY g.game_date DESC) as game_recency
            FROM team_game_stats tgs
            JOIN games g ON tgs.game_id = g.game_id
            WHERE tgs.team_id = %s
            AND g.season = %s
            AND g.game_status = 'Final'
            ORDER BY g.game_date DESC
            LIMIT %s
        )
        SELECT
            COUNT(*) as games_played,
            AVG(points) as avg_points,
            AVG(pace) as avg_pace,
            AVG(offensive_rating) as avg_ortg,
            AVG(defensive_rating) as avg_drtg,
            AVG(effective_fg_pct) as avg_efg,
            AVG(turnover_pct) as avg_tov_pct,
            -- Weighted recent average (more recent games have higher weight)
            SUM(points * (1.0 / game_recency)) / SUM(1.0 / game_recency) as weighted_points,
            SUM(pace * (1.0 / game_recency)) / SUM(1.0 / game_recency) as weighted_pace
        FROM recent_games
    """, (team_id, season, games))

    result = cur.fetchone()
    if not result or result[0] == 0:
        return None

    return {
        'games_played': result[0],
        'avg_points': float(result[1]) if result[1] else 0.0,
        'avg_pace': float(result[2]) if result[2] else LEAGUE_AVG_PACE,
        'avg_ortg': float(result[3]) if result[3] else 110.0,
        'avg_drtg': float(result[4]) if result[4] else 110.0,
        'avg_efg': float(result[5]) if result[5] else 0.52,
        'avg_tov_pct': float(result[6]) if result[6] else 0.12,
        'weighted_points': float(result[7]) if result[7] else float(result[1]),
        'weighted_pace': float(result[8]) if result[8] else float(result[2])
    }


def calculate_rest_adjustment(cur, team_id: int, game_date: str) -> Tuple[float, str]:
    """
    Calculate adjustment based on days of rest
    Returns: (adjustment_value, explanation)
    """
    cur.execute("""
        SELECT g.game_date
        FROM games g
        WHERE (g.home_team_id = %s OR g.away_team_id = %s)
        AND g.game_status = 'Final'
        AND g.game_date < %s
        ORDER BY g.game_date DESC
        LIMIT 1
    """, (team_id, team_id, game_date))

    result = cur.fetchone()
    if not result:
        return 0.0, "No recent games found"

    last_game_date = result[0]
    days_rest = (datetime.strptime(game_date, '%Y-%m-%d').date() - last_game_date).days

    if days_rest == 1:  # Back-to-back
        return -2.5, "Back-to-back (1 day rest) → fatigue factor"
    elif days_rest == 2:
        return -0.5, "2 days rest → slight fatigue"
    elif days_rest >= 4:
        return 1.0, f"{days_rest} days rest → well rested"
    else:
        return 0.0, f"{days_rest} days rest → normal"


def calculate_b2b_adjustment(cur, home_team_id: int, away_team_id: int, game_date: str) -> Tuple[float, str]:
    """
    Additional adjustment when both teams are on back-to-back
    Returns: (adjustment_value, explanation)
    """
    home_rest, _ = calculate_rest_adjustment(cur, home_team_id, game_date)
    away_rest, _ = calculate_rest_adjustment(cur, away_team_id, game_date)

    if home_rest == -2.5 and away_rest == -2.5:
        return -3.0, "Both teams on back-to-back → significant pace drop"

    return 0.0, "Not both on back-to-back"


def calculate_altitude_adjustment(home_team_id: int) -> Tuple[float, str]:
    """
    Altitude adjustment for Denver home games
    Returns: (adjustment_value, explanation)
    """
    if home_team_id == DENVER_TEAM_ID:
        return 2.0, "Denver altitude → typically higher scoring"
    return 0.0, "Sea level game"


def calculate_travel_adjustment(cur, away_team_id: int, game_date: str) -> Tuple[float, str]:
    """
    Travel distance adjustment for away team
    Returns: (adjustment_value, explanation)
    """
    # Get away team's last game location
    cur.execute("""
        SELECT
            CASE
                WHEN g.home_team_id = %s THEN ht.city
                ELSE at.city
            END as last_location,
            g.game_date
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE (g.home_team_id = %s OR g.away_team_id = %s)
        AND g.game_status = 'Final'
        AND g.game_date < %s
        ORDER BY g.game_date DESC
        LIMIT 1
    """, (away_team_id, away_team_id, away_team_id, game_date))

    result = cur.fetchone()
    if not result:
        return 0.0, "No travel data"

    last_location = result[0]
    last_game_date = result[1]
    days_since = (datetime.strptime(game_date, '%Y-%m-%d').date() - last_game_date).days

    # Simple heuristic: if last game was very recent and different city
    if days_since == 1:
        return -1.0, "Recent travel on back-to-back"

    return 0.0, "Normal travel pattern"


def calculate_confidence(home_stats: Dict, away_stats: Dict) -> float:
    """
    Calculate confidence score based on data quality
    Returns: confidence between 0.0 and 1.0
    """
    confidence = 0.5  # Base confidence

    # More games played = higher confidence
    min_games = min(home_stats['games_played'], away_stats['games_played'])
    if min_games >= 10:
        confidence += 0.3
    elif min_games >= 5:
        confidence += 0.15

    # Check for reasonable pace values
    if 95 <= home_stats['avg_pace'] <= 105 and 95 <= away_stats['avg_pace'] <= 105:
        confidence += 0.1

    # Check for reasonable ratings
    if 100 <= home_stats['avg_ortg'] <= 125 and 100 <= away_stats['avg_ortg'] <= 125:
        confidence += 0.1

    return min(confidence, 1.0)


def calculate_projected_total(
    cur,
    home_team_id: int,
    away_team_id: int,
    season: str,
    game_date: str
) -> Optional[Dict]:
    """
    Calculate pace-adjusted total projection for a game

    Formula:
    Base = (Team_A_Pace + Team_B_Pace) / 2 × (Team_A_ORtg + Team_B_DRtg + Team_B_ORtg + Team_A_DRtg) / 200

    Then apply situation adjustments:
    - Rest days differential
    - Back-to-back status
    - Travel factors
    - Altitude (Denver)
    """
    # Get recent stats for both teams
    home_stats = get_team_recent_stats(cur, home_team_id, season, games=10)
    away_stats = get_team_recent_stats(cur, away_team_id, season, games=10)

    if not home_stats or not away_stats:
        return None

    # Calculate matchup pace (average of both teams)
    matchup_pace = (home_stats['weighted_pace'] + away_stats['weighted_pace']) / 2

    # Calculate expected possessions-based projection
    # Home expected = Matchup Pace × (Home ORtg + Away DRtg) / 200
    home_expected = matchup_pace * (home_stats['avg_ortg'] + away_stats['avg_drtg']) / 200
    away_expected = matchup_pace * (away_stats['avg_ortg'] + home_stats['avg_drtg']) / 200

    efficiency_total = home_expected + away_expected

    # Historical total (simple average)
    historical_total = home_stats['weighted_points'] + away_stats['weighted_points']

    # Weighted projection (60% efficiency-based, 40% historical)
    base_projection = 0.6 * efficiency_total + 0.4 * historical_total

    # Calculate adjustments
    adjustments = {}
    total_adjustment = 0.0

    # Rest advantage
    home_rest_adj, home_rest_reason = calculate_rest_adjustment(cur, home_team_id, game_date)
    away_rest_adj, away_rest_reason = calculate_rest_adjustment(cur, away_team_id, game_date)
    rest_adj = home_rest_adj + away_rest_adj
    adjustments['rest'] = {
        'value': rest_adj,
        'home_reason': home_rest_reason,
        'away_reason': away_rest_reason
    }
    total_adjustment += rest_adj

    # Both teams back-to-back
    b2b_adj, b2b_reason = calculate_b2b_adjustment(cur, home_team_id, away_team_id, game_date)
    adjustments['back_to_back'] = {'value': b2b_adj, 'reason': b2b_reason}
    total_adjustment += b2b_adj

    # Travel
    travel_adj, travel_reason = calculate_travel_adjustment(cur, away_team_id, game_date)
    adjustments['travel'] = {'value': travel_adj, 'reason': travel_reason}
    total_adjustment += travel_adj

    # Altitude
    altitude_adj, altitude_reason = calculate_altitude_adjustment(home_team_id)
    adjustments['altitude'] = {'value': altitude_adj, 'reason': altitude_reason}
    total_adjustment += altitude_adj

    # Final projection
    final_projection = base_projection + total_adjustment

    # Calculate confidence
    confidence = calculate_confidence(home_stats, away_stats)

    return {
        'projected_total': round(final_projection, 1),
        'base_projection': round(base_projection, 1),
        'total_adjustment': round(total_adjustment, 1),
        'confidence': round(confidence, 2),
        'matchup_pace': round(matchup_pace, 1),
        'home_expected': round(home_expected, 1),
        'away_expected': round(away_expected, 1),
        'adjustments': adjustments,
        'home_stats': {
            'avg_pace': round(home_stats['avg_pace'], 1),
            'avg_ortg': round(home_stats['avg_ortg'], 1),
            'avg_drtg': round(home_stats['avg_drtg'], 1),
            'games_played': home_stats['games_played']
        },
        'away_stats': {
            'avg_pace': round(away_stats['avg_pace'], 1),
            'avg_ortg': round(away_stats['avg_ortg'], 1),
            'avg_drtg': round(away_stats['avg_drtg'], 1),
            'games_played': away_stats['games_played']
        }
    }


def generate_projections_for_upcoming_games(date_filter: Optional[str] = None):
    """
    Generate projections for upcoming games
    If date_filter is provided, only process games on that date
    Otherwise, process next 7 days
    """
    print("=" * 80)
    print("📊 CALCULATING TOTALS PROJECTIONS")
    print("=" * 80)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get upcoming games
        if date_filter:
            cur.execute("""
                SELECT
                    g.game_id,
                    g.game_date,
                    g.season,
                    g.home_team_id,
                    g.away_team_id,
                    ht.abbreviation as home_abbr,
                    at.abbreviation as away_abbr
                FROM games g
                JOIN teams ht ON g.home_team_id = ht.team_id
                JOIN teams at ON g.away_team_id = at.team_id
                WHERE g.game_date = %s
                AND g.game_status IN ('Scheduled', 'Pre-Game')
                ORDER BY g.game_date, g.game_id
            """, (date_filter,))
        else:
            # Next 7 days
            today = datetime.now().date()
            end_date = today + timedelta(days=7)
            cur.execute("""
                SELECT
                    g.game_id,
                    g.game_date,
                    g.season,
                    g.home_team_id,
                    g.away_team_id,
                    ht.abbreviation as home_abbr,
                    at.abbreviation as away_abbr
                FROM games g
                JOIN teams ht ON g.home_team_id = ht.team_id
                JOIN teams at ON g.away_team_id = at.team_id
                WHERE g.game_date >= %s
                AND g.game_date <= %s
                AND g.game_status IN ('Scheduled', 'Pre-Game')
                ORDER BY g.game_date, g.game_id
            """, (today, end_date))

        games = cur.fetchall()

        if not games:
            print("✅ No upcoming games found to project")
            cur.close()
            conn.close()
            return []

        print(f"📋 Found {len(games)} upcoming games\n")

        projections = []
        processed = 0

        for game in games:
            game_id, game_date, season, home_id, away_id, home_abbr, away_abbr = game
            processed += 1

            print(f"[{processed}/{len(games)}] {away_abbr} @ {home_abbr} ({game_date})...")

            projection = calculate_projected_total(
                cur,
                home_id,
                away_id,
                season,
                str(game_date)
            )

            if projection:
                projection['game_id'] = game_id
                projection['game_date'] = str(game_date)
                projection['matchup'] = f"{away_abbr} @ {home_abbr}"
                projections.append(projection)

                print(f"  ✓ Projected Total: {projection['projected_total']}")
                print(f"    Confidence: {projection['confidence']:.0%}")
                print(f"    Base: {projection['base_projection']} + Adj: {projection['total_adjustment']}")

        print(f"\n📊 Projections Summary:")
        print(f"  • Games projected: {len(projections)}")
        if projections:
            avg_confidence = sum(p['confidence'] for p in projections) / len(projections)
            print(f"  • Average confidence: {avg_confidence:.0%}")
            print(f"  • Total range: {min(p['projected_total'] for p in projections):.1f} - {max(p['projected_total'] for p in projections):.1f}")

        cur.close()
        conn.close()

        print("\n✅ Projections calculation completed successfully!")
        return projections

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return []


if __name__ == '__main__':
    # Allow optional date filter as command-line argument
    date_filter = sys.argv[1] if len(sys.argv) > 1 else None
    projections = generate_projections_for_upcoming_games(date_filter)

    # Print projections in JSON format if requested
    if len(sys.argv) > 2 and sys.argv[2] == '--json':
        import json
        print("\n" + json.dumps(projections, indent=2))

    sys.exit(0 if projections is not None else 1)
