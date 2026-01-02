#!/usr/bin/env python3
"""
Identify Value Bets
Compare projections vs betting lines to identify value opportunities
"""

import os
import sys
import json
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Import projection calculator
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from calculate_totals_projections import calculate_projected_total

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))

# Value thresholds
EDGE_THRESHOLD = 3.0  # Minimum edge in points
CONFIDENCE_THRESHOLD = 0.65  # Minimum confidence score


def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )


def get_current_line(cur, game_id: str) -> Optional[Dict]:
    """
    Get current betting line for a game
    First tries game_closing_lines, then falls back to latest betting_odds
    """
    # Try game_closing_lines first (if game is close to starting)
    cur.execute("""
        SELECT
            game_total_line,
            game_total_over_odds,
            game_total_under_odds,
            recorded_at
        FROM game_closing_lines
        WHERE game_id = %s
        ORDER BY recorded_at DESC
        LIMIT 1
    """, (game_id,))

    result = cur.fetchone()
    if result and result[0]:
        return {
            'game_total': float(result[0]),
            'over_odds': float(result[1]) if result[1] else None,
            'under_odds': float(result[2]) if result[2] else None,
            'source': 'closing_line',
            'recorded_at': result[3]
        }

    # Fallback to latest betting_odds
    cur.execute("""
        SELECT
            bo.line,
            bo.over_odds,
            bo.under_odds,
            bo.recorded_at
        FROM betting_odds bo
        JOIN betting_markets bm ON bo.market_id = bm.market_id
        JOIN betting_events be ON bm.event_id = be.event_id
        WHERE be.game_id = %s
        AND bm.market_key LIKE '%Total%'
        AND bm.period = 0  -- Full game
        ORDER BY bo.recorded_at DESC
        LIMIT 1
    """, (game_id,))

    result = cur.fetchone()
    if result and result[0]:
        return {
            'game_total': float(result[0]),
            'over_odds': float(result[1]) if result[1] else None,
            'under_odds': float(result[2]) if result[2] else None,
            'source': 'latest_odds',
            'recorded_at': result[3]
        }

    return None


def generate_reasoning(
    game_info: Dict,
    projection: Dict,
    edge: float,
    line: float
) -> str:
    """
    Generate human-readable reasoning for the value bet
    """
    direction = "OVER" if edge > 0 else "UNDER"
    matchup = game_info['matchup']

    reasons = []

    # Pace analysis
    if projection['matchup_pace'] > 102:
        reasons.append(f"High-pace matchup ({projection['matchup_pace']:.1f} possessions/48)")
    elif projection['matchup_pace'] < 97:
        reasons.append(f"Slow-pace matchup ({projection['matchup_pace']:.1f} possessions/48)")

    # Efficiency mismatch
    home_eff = projection['home_stats']['avg_ortg'] - projection['home_stats']['avg_drtg']
    away_eff = projection['away_stats']['avg_ortg'] - projection['away_stats']['avg_drtg']
    if abs(home_eff - away_eff) > 10:
        reasons.append(f"Significant efficiency differential ({abs(home_eff - away_eff):.1f} net rating gap)")

    # Situational adjustments
    if projection['adjustments']['back_to_back']['value'] < 0:
        reasons.append(projection['adjustments']['back_to_back']['reason'])

    if projection['adjustments']['altitude']['value'] > 0:
        reasons.append(projection['adjustments']['altitude']['reason'])

    if projection['adjustments']['rest']['value'] != 0:
        home_reason = projection['adjustments']['rest']['home_reason']
        away_reason = projection['adjustments']['rest']['away_reason']
        if 'Back-to-back' in home_reason or 'Back-to-back' in away_reason:
            reasons.append(f"Rest disparity: Home ({home_reason}), Away ({away_reason})")

    # Edge magnitude
    if abs(edge) >= 5:
        reasons.append(f"Significant edge: {abs(edge):.1f} points vs market")
    else:
        reasons.append(f"Moderate edge: {abs(edge):.1f} points vs market")

    # Confidence note
    if projection['confidence'] >= 0.8:
        confidence_note = "(high confidence)"
    elif projection['confidence'] >= 0.7:
        confidence_note = "(good confidence)"
    else:
        confidence_note = "(moderate confidence)"

    reasoning = f"{direction} {line} for {matchup} {confidence_note}\n"
    reasoning += f"Projection: {projection['projected_total']} (Base: {projection['base_projection']} + Adj: {projection['total_adjustment']:+.1f})\n"
    reasoning += "Factors:\n"
    for reason in reasons:
        reasoning += f"  • {reason}\n"

    return reasoning.strip()


def calculate_expected_value(edge: float, odds: float) -> Optional[float]:
    """
    Calculate expected value (EV) of a bet
    EV = (Probability × Profit) - (1 - Probability) × Stake

    For decimal odds:
    Implied probability = 1 / odds (with vig removed)
    """
    if not odds or odds <= 1.0:
        return None

    # Simplified EV calculation
    # Assuming 1 unit stake and removing vig
    implied_prob = 1.0 / odds
    actual_prob = implied_prob + (abs(edge) / 240)  # Rough conversion of edge to probability

    profit = odds - 1.0
    ev = (actual_prob * profit) - ((1 - actual_prob) * 1.0)

    return ev * 100  # Return as percentage


def identify_value_bets(date_filter: Optional[str] = None) -> List[Dict]:
    """
    Find games with edge > threshold and confidence > threshold
    """
    print("=" * 80)
    print("💰 IDENTIFYING VALUE BETS")
    print("=" * 80)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get upcoming games with betting lines
        if date_filter:
            cur.execute("""
                SELECT DISTINCT
                    g.game_id,
                    g.game_date,
                    g.season,
                    g.home_team_id,
                    g.away_team_id,
                    ht.abbreviation as home_abbr,
                    at.abbreviation as away_abbr,
                    ht.full_name as home_name,
                    at.full_name as away_name
                FROM games g
                JOIN teams ht ON g.home_team_id = ht.team_id
                JOIN teams at ON g.away_team_id = at.team_id
                WHERE g.game_date = %s
                AND g.game_status IN ('Scheduled', 'Pre-Game')
                ORDER BY g.game_date, g.game_id
            """, (date_filter,))
        else:
            # Next 3 days
            today = datetime.now().date()
            end_date = today + timedelta(days=3)
            cur.execute("""
                SELECT DISTINCT
                    g.game_id,
                    g.game_date,
                    g.season,
                    g.home_team_id,
                    g.away_team_id,
                    ht.abbreviation as home_abbr,
                    at.abbreviation as away_abbr,
                    ht.full_name as home_name,
                    at.full_name as away_name
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
            print("✅ No upcoming games found")
            cur.close()
            conn.close()
            return []

        print(f"📋 Analyzing {len(games)} upcoming games\n")

        value_bets = []
        processed = 0

        for game in games:
            (game_id, game_date, season, home_id, away_id,
             home_abbr, away_abbr, home_name, away_name) = game
            processed += 1

            matchup = f"{away_abbr} @ {home_abbr}"
            print(f"[{processed}/{len(games)}] {matchup} ({game_date})...")

            # Get projection
            projection = calculate_projected_total(
                cur,
                home_id,
                away_id,
                season,
                str(game_date)
            )

            if not projection:
                print(f"  ⚠️  No projection available (insufficient data)")
                continue

            # Get current line
            line = get_current_line(cur, game_id)

            if not line:
                print(f"  ⚠️  No betting line available")
                continue

            # Calculate edge
            edge = projection['projected_total'] - line['game_total']

            print(f"  Line: {line['game_total']} | Projection: {projection['projected_total']} | Edge: {edge:+.1f}")

            # Check if meets value thresholds
            if abs(edge) >= EDGE_THRESHOLD and projection['confidence'] >= CONFIDENCE_THRESHOLD:
                direction = "OVER" if edge > 0 else "UNDER"
                odds = line['over_odds'] if edge > 0 else line['under_odds']

                ev = calculate_expected_value(edge, odds) if odds else None

                game_info = {
                    'game_id': game_id,
                    'game_date': str(game_date),
                    'matchup': matchup,
                    'home_team': home_name,
                    'away_team': away_name
                }

                value_bet = {
                    'game_id': game_id,
                    'game_date': str(game_date),
                    'matchup': matchup,
                    'home_team': home_name,
                    'away_team': away_name,
                    'line': line['game_total'],
                    'projection': projection['projected_total'],
                    'edge': round(edge, 1),
                    'direction': direction,
                    'confidence': projection['confidence'],
                    'odds': odds,
                    'expected_value': round(ev, 2) if ev else None,
                    'line_source': line['source'],
                    'reasoning': generate_reasoning(game_info, projection, edge, line['game_total']),
                    'projection_details': projection
                }

                value_bets.append(value_bet)
                print(f"  💰 VALUE FOUND: {direction} {line['game_total']} (Edge: {edge:+.1f}, Conf: {projection['confidence']:.0%})")

        # Sort by absolute edge (highest first)
        value_bets.sort(key=lambda x: abs(x['edge']), reverse=True)

        print(f"\n📊 Value Bet Summary:")
        print(f"  • Games analyzed: {len(games)}")
        print(f"  • Value bets identified: {len(value_bets)}")

        if value_bets:
            print(f"\n🎯 Top Value Bets:")
            for i, bet in enumerate(value_bets[:5], 1):
                print(f"\n  {i}. {bet['direction']} {bet['line']} - {bet['matchup']}")
                print(f"     Edge: {bet['edge']:+.1f} | Confidence: {bet['confidence']:.0%} | Odds: {bet['odds']}")
                if bet['expected_value']:
                    print(f"     Expected Value: {bet['expected_value']:+.2f}%")

        cur.close()
        conn.close()

        print("\n✅ Value bet identification completed successfully!")
        return value_bets

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return []


if __name__ == '__main__':
    # Allow optional date filter as command-line argument
    date_filter = sys.argv[1] if len(sys.argv) > 1 else None
    value_bets = identify_value_bets(date_filter)

    # Print value bets in JSON format
    if value_bets:
        print("\n" + "=" * 80)
        print("📄 VALUE BETS JSON OUTPUT")
        print("=" * 80)
        print(json.dumps(value_bets, indent=2))

        # Also save to file
        output_file = os.path.join(
            os.path.dirname(__file__),
            '..',
            '..',
            'data',
            f'value_bets_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        )
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, 'w') as f:
            json.dump(value_bets, f, indent=2)
        print(f"\n💾 Saved to: {output_file}")

    sys.exit(0 if value_bets is not None else 1)
