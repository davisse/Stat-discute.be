#!/usr/bin/env python3
"""
Absence Prop Finder Pipeline

Automated pipeline to find player prop value based on key player absences.

Pipeline Steps:
1. Identify games (today or specified)
2. Detect probable starters from L5 games
3. Identify key absences (star players missing)
4. Run absence cascade analysis (who benefits)
5. Fetch available player props from betting data
6. Compare lines vs performance without absent player
7. Validate: volume (minutes), efficiency (FG%), floor (min points)
8. Output value opportunities

Usage:
    python absence_prop_finder.py                    # Analyze today's games
    python absence_prop_finder.py --date 2026-01-11  # Specific date
    python absence_prop_finder.py --game 0022500554  # Specific game
    python absence_prop_finder.py --team DEN         # Games involving team
"""

import os
import sys
import argparse
from datetime import datetime, date
from typing import Optional
from dataclasses import dataclass
from decimal import Decimal

import psycopg2
from psycopg2.extras import RealDictCursor

# Database connection
DB_CONFIG = {
    'dbname': os.getenv('DB_NAME', 'nba_stats'),
    'user': os.getenv('DB_USER', 'chapirou'),
    'password': os.getenv('DB_PASSWORD', ''),
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432')
}


@dataclass
class Game:
    game_id: str
    game_date: date
    home_team: str
    away_team: str
    home_abbr: str
    away_abbr: str


@dataclass
class AbsentPlayer:
    player_id: int
    player_name: str
    team_abbr: str
    games_missed: int
    last_played: date
    avg_points: float
    avg_rebounds: float
    avg_assists: float


@dataclass
class Beneficiary:
    player_id: int
    player_name: str
    position: Optional[str]
    games_with: int
    games_without: int
    pts_with: float
    pts_without: float
    pts_boost: float
    reb_with: float
    reb_without: float
    reb_boost: float
    ast_with: float
    ast_without: float
    ast_boost: float
    min_with: float
    min_without: float
    min_boost: float
    fga_with: float
    fga_without: float
    fg_pct_with: float
    fg_pct_without: float
    floor_pts: int  # Minimum points in games without
    floor_reb: int  # Minimum rebounds in games without
    floor_ast: int  # Minimum assists in games without


@dataclass
class PropLine:
    market_name: str
    stat_type: str  # points, rebounds, assists, pra
    line: float
    over_odds: float
    under_odds: float


@dataclass
class PropOpportunity:
    player_name: str
    absent_player: str
    stat_type: str
    line: float
    odds: float
    avg_without: float
    edge: float  # avg_without - line
    min_without: float
    min_boost: float
    fg_pct_stable: bool
    floor: int
    floor_above_line: bool
    confidence: str  # HIGH, MEDIUM, LOW


def get_connection():
    """Get database connection."""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)


def get_current_season(conn) -> str:
    """Get current season from database."""
    with conn.cursor() as cur:
        cur.execute("SELECT season_id FROM seasons WHERE is_current = true LIMIT 1")
        row = cur.fetchone()
        return row['season_id'] if row else '2025-26'


def get_games_by_date(conn, season: str, target_date: Optional[date] = None) -> list[Game]:
    """Get games for a specific date (defaults to today)."""
    with conn.cursor() as cur:
        if target_date:
            cur.execute("""
                SELECT
                    g.game_id,
                    g.game_date,
                    ht.full_name as home_team,
                    at.full_name as away_team,
                    ht.abbreviation as home_abbr,
                    at.abbreviation as away_abbr
                FROM games g
                JOIN teams ht ON g.home_team_id = ht.team_id
                JOIN teams at ON g.away_team_id = at.team_id
                WHERE g.game_date = %s
                  AND g.season = %s
                ORDER BY g.game_id
            """, [target_date, season])
        else:
            cur.execute("""
                SELECT
                    g.game_id,
                    g.game_date,
                    ht.full_name as home_team,
                    at.full_name as away_team,
                    ht.abbreviation as home_abbr,
                    at.abbreviation as away_abbr
                FROM games g
                JOIN teams ht ON g.home_team_id = ht.team_id
                JOIN teams at ON g.away_team_id = at.team_id
                WHERE g.game_date = CURRENT_DATE
                  AND g.season = %s
                ORDER BY g.game_id
            """, [season])
        return [Game(**row) for row in cur.fetchall()]


def get_game_by_id(conn, game_id: str, season: str) -> Optional[Game]:
    """Get specific game by ID."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                g.game_id,
                g.game_date,
                ht.full_name as home_team,
                at.full_name as away_team,
                ht.abbreviation as home_abbr,
                at.abbreviation as away_abbr
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE g.game_id = %s AND g.season = %s
        """, [game_id, season])
        row = cur.fetchone()
        return Game(**row) if row else None


def get_games_by_team(conn, team_abbr: str, season: str) -> list[Game]:
    """Get upcoming games for a team."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                g.game_id,
                g.game_date,
                ht.full_name as home_team,
                at.full_name as away_team,
                ht.abbreviation as home_abbr,
                at.abbreviation as away_abbr
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE (ht.abbreviation = %s OR at.abbreviation = %s)
              AND g.season = %s
              AND g.game_date >= CURRENT_DATE
              AND g.game_status != 'Final'
            ORDER BY g.game_date
            LIMIT 5
        """, [team_abbr, team_abbr, season])
        return [Game(**row) for row in cur.fetchall()]


def detect_absent_stars(conn, team_abbr: str, season: str, min_games_missed: int = 3) -> list[AbsentPlayer]:
    """
    Detect star players who are currently absent.
    A star is defined as a player with high usage who hasn't played in recent games.
    """
    with conn.cursor() as cur:
        cur.execute("""
            WITH team_info AS (
                SELECT team_id FROM teams WHERE abbreviation = %s
            ),
            -- Get last 10 team games
            recent_team_games AS (
                SELECT g.game_id, g.game_date
                FROM games g
                JOIN team_info ti ON (g.home_team_id = ti.team_id OR g.away_team_id = ti.team_id)
                WHERE g.season = %s AND g.game_status = 'Final'
                ORDER BY g.game_date DESC
                LIMIT 10
            ),
            -- Find players who played earlier but not in recent games
            player_activity AS (
                SELECT
                    p.player_id,
                    p.full_name,
                    MAX(CASE WHEN pgs.minutes > 0 THEN g.game_date END) as last_played,
                    COUNT(CASE WHEN pgs.minutes > 0 THEN 1 END) as games_played,
                    AVG(CASE WHEN pgs.minutes > 0 THEN pgs.points END) as avg_pts,
                    AVG(CASE WHEN pgs.minutes > 0 THEN pgs.rebounds END) as avg_reb,
                    AVG(CASE WHEN pgs.minutes > 0 THEN pgs.assists END) as avg_ast,
                    AVG(CASE WHEN pgs.minutes > 0 THEN pgs.minutes END) as avg_min
                FROM players p
                JOIN player_game_stats pgs ON p.player_id = pgs.player_id
                JOIN games g ON pgs.game_id = g.game_id
                JOIN team_info ti ON pgs.team_id = ti.team_id
                WHERE g.season = %s AND g.game_status = 'Final'
                GROUP BY p.player_id, p.full_name
                HAVING AVG(CASE WHEN pgs.minutes > 0 THEN pgs.minutes END) >= 20  -- Significant minutes
                   AND AVG(CASE WHEN pgs.minutes > 0 THEN pgs.points END) >= 10   -- Significant scorer
            ),
            -- Count recent games missed
            recent_missed AS (
                SELECT
                    pa.player_id,
                    pa.full_name,
                    pa.last_played,
                    pa.avg_pts,
                    pa.avg_reb,
                    pa.avg_ast,
                    (SELECT COUNT(*) FROM recent_team_games rtg
                     WHERE rtg.game_date > pa.last_played) as games_missed
                FROM player_activity pa
            )
            SELECT
                player_id,
                full_name as player_name,
                %s as team_abbr,
                games_missed,
                last_played,
                ROUND(avg_pts::numeric, 1) as avg_points,
                ROUND(avg_reb::numeric, 1) as avg_rebounds,
                ROUND(avg_ast::numeric, 1) as avg_assists
            FROM recent_missed
            WHERE games_missed >= %s
            ORDER BY avg_pts DESC
        """, [team_abbr, season, season, team_abbr, min_games_missed])

        return [AbsentPlayer(**row) for row in cur.fetchall()]


def get_absence_beneficiaries(conn, absent_player_id: int, season: str, min_games: int = 3) -> list[Beneficiary]:
    """
    Get teammates who benefit from a player's absence.
    Returns stats comparison with/without the absent player.
    """
    with conn.cursor() as cur:
        cur.execute("""
            WITH player_info AS (
                SELECT DISTINCT pgs.team_id
                FROM player_game_stats pgs
                JOIN games g ON pgs.game_id = g.game_id
                WHERE pgs.player_id = %s AND g.season = %s
                LIMIT 1
            ),
            team_games AS (
                SELECT g.game_id, g.game_date
                FROM games g
                JOIN player_info pi ON (g.home_team_id = pi.team_id OR g.away_team_id = pi.team_id)
                WHERE g.season = %s AND g.game_status = 'Final'
            ),
            player_presence AS (
                SELECT
                    tg.game_id,
                    CASE WHEN pgs.minutes > 0 THEN true ELSE false END as player_played
                FROM team_games tg
                LEFT JOIN player_game_stats pgs ON tg.game_id = pgs.game_id AND pgs.player_id = %s
            ),
            teammate_stats AS (
                SELECT
                    p.player_id as teammate_id,
                    p.full_name as teammate_name,
                    p.position,
                    pgs.game_id,
                    pgs.points,
                    pgs.rebounds,
                    pgs.assists,
                    pgs.minutes,
                    pgs.fg_made,
                    pgs.fg_attempted,
                    pgs.is_starter,
                    pp.player_played
                FROM player_game_stats pgs
                JOIN players p ON pgs.player_id = p.player_id
                JOIN player_presence pp ON pgs.game_id = pp.game_id
                JOIN player_info pi ON pgs.team_id = pi.team_id
                WHERE pgs.player_id != %s
                  AND pgs.minutes > 0
            )
            SELECT
                ts.teammate_id as player_id,
                ts.teammate_name as player_name,
                MAX(ts.position) as position,
                COUNT(CASE WHEN ts.player_played THEN 1 END)::int as games_with,
                COUNT(CASE WHEN NOT ts.player_played THEN 1 END)::int as games_without,
                ROUND(AVG(CASE WHEN ts.player_played THEN ts.points END)::numeric, 1) as pts_with,
                ROUND(AVG(CASE WHEN NOT ts.player_played THEN ts.points END)::numeric, 1) as pts_without,
                ROUND((AVG(CASE WHEN NOT ts.player_played THEN ts.points END) -
                       AVG(CASE WHEN ts.player_played THEN ts.points END))::numeric, 1) as pts_boost,
                ROUND(AVG(CASE WHEN ts.player_played THEN ts.rebounds END)::numeric, 1) as reb_with,
                ROUND(AVG(CASE WHEN NOT ts.player_played THEN ts.rebounds END)::numeric, 1) as reb_without,
                ROUND((AVG(CASE WHEN NOT ts.player_played THEN ts.rebounds END) -
                       AVG(CASE WHEN ts.player_played THEN ts.rebounds END))::numeric, 1) as reb_boost,
                ROUND(AVG(CASE WHEN ts.player_played THEN ts.assists END)::numeric, 1) as ast_with,
                ROUND(AVG(CASE WHEN NOT ts.player_played THEN ts.assists END)::numeric, 1) as ast_without,
                ROUND((AVG(CASE WHEN NOT ts.player_played THEN ts.assists END) -
                       AVG(CASE WHEN ts.player_played THEN ts.assists END))::numeric, 1) as ast_boost,
                ROUND(AVG(CASE WHEN ts.player_played THEN ts.minutes END)::numeric, 1) as min_with,
                ROUND(AVG(CASE WHEN NOT ts.player_played THEN ts.minutes END)::numeric, 1) as min_without,
                ROUND((AVG(CASE WHEN NOT ts.player_played THEN ts.minutes END) -
                       AVG(CASE WHEN ts.player_played THEN ts.minutes END))::numeric, 1) as min_boost,
                ROUND(AVG(CASE WHEN ts.player_played THEN ts.fg_attempted END)::numeric, 1) as fga_with,
                ROUND(AVG(CASE WHEN NOT ts.player_played THEN ts.fg_attempted END)::numeric, 1) as fga_without,
                ROUND(100.0 * SUM(CASE WHEN ts.player_played THEN ts.fg_made END) /
                      NULLIF(SUM(CASE WHEN ts.player_played THEN ts.fg_attempted END), 0), 1) as fg_pct_with,
                ROUND(100.0 * SUM(CASE WHEN NOT ts.player_played THEN ts.fg_made END) /
                      NULLIF(SUM(CASE WHEN NOT ts.player_played THEN ts.fg_attempted END), 0), 1) as fg_pct_without,
                MIN(CASE WHEN NOT ts.player_played THEN ts.points END)::int as floor_pts,
                MIN(CASE WHEN NOT ts.player_played THEN ts.rebounds END)::int as floor_reb,
                MIN(CASE WHEN NOT ts.player_played THEN ts.assists END)::int as floor_ast
            FROM teammate_stats ts
            GROUP BY ts.teammate_id, ts.teammate_name
            HAVING COUNT(CASE WHEN ts.player_played THEN 1 END) >= %s
               AND COUNT(CASE WHEN NOT ts.player_played THEN 1 END) >= %s
            ORDER BY pts_boost DESC NULLS LAST
        """, [absent_player_id, season, season, absent_player_id, absent_player_id, min_games, min_games])

        results = []
        for row in cur.fetchall():
            # Convert Decimal to float
            cleaned = {}
            for k, v in row.items():
                if isinstance(v, Decimal):
                    cleaned[k] = float(v)
                else:
                    cleaned[k] = v
            results.append(Beneficiary(**cleaned))
        return results


def get_player_props(conn, game_id: str, player_name: str) -> list[PropLine]:
    """Get available player props for a specific player in a game."""
    with conn.cursor() as cur:
        cur.execute("""
            WITH latest_odds AS (
                SELECT DISTINCT ON (bm.market_id, bo.selection)
                    bm.market_name,
                    bo.selection,
                    bo.odds_decimal,
                    bo.handicap
                FROM betting_events be
                JOIN betting_markets bm ON be.event_id = bm.event_id
                JOIN betting_odds bo ON bm.market_id = bo.market_id
                WHERE be.game_id = %s
                  AND bm.market_type = 'player_prop'
                  AND bm.market_name ILIKE %s
                  AND bo.is_available = true
                ORDER BY bm.market_id, bo.selection, bo.recorded_at DESC
            )
            SELECT
                market_name,
                handicap as line,
                MAX(CASE WHEN selection ILIKE 'Over%%' THEN odds_decimal END) as over_odds,
                MAX(CASE WHEN selection ILIKE 'Under%%' THEN odds_decimal END) as under_odds
            FROM latest_odds
            GROUP BY market_name, handicap
            ORDER BY market_name
        """, [game_id, f"%{player_name}%"])

        results = []
        for row in cur.fetchall():
            # Determine stat type from market name
            market = row['market_name'].lower()
            if 'pts+rebs+asts' in market or 'pra' in market:
                stat_type = 'pra'
            elif 'points' in market:
                stat_type = 'points'
            elif 'rebounds' in market:
                stat_type = 'rebounds'
            elif 'assists' in market:
                stat_type = 'assists'
            elif '3 point' in market or '3pm' in market:
                stat_type = '3pm'
            else:
                stat_type = 'other'

            if row['over_odds'] and row['line']:
                results.append(PropLine(
                    market_name=row['market_name'],
                    stat_type=stat_type,
                    line=float(row['line']),
                    over_odds=float(row['over_odds']),
                    under_odds=float(row['under_odds']) if row['under_odds'] else 0
                ))
        return results


def evaluate_opportunity(
    beneficiary: Beneficiary,
    absent_player: AbsentPlayer,
    prop: PropLine
) -> Optional[PropOpportunity]:
    """
    Evaluate if a prop line offers value based on absence impact.
    """
    # Get the relevant stat based on prop type
    if prop.stat_type == 'points':
        avg_without = beneficiary.pts_without
        floor = beneficiary.floor_pts if beneficiary.floor_pts else 0
    elif prop.stat_type == 'rebounds':
        avg_without = beneficiary.reb_without
        floor = beneficiary.floor_reb if beneficiary.floor_reb else 0
    elif prop.stat_type == 'assists':
        avg_without = beneficiary.ast_without
        floor = beneficiary.floor_ast if beneficiary.floor_ast else 0
    elif prop.stat_type == 'pra':
        # PRA = pts + reb + ast without
        if beneficiary.pts_without and beneficiary.reb_without and beneficiary.ast_without:
            avg_without = beneficiary.pts_without + beneficiary.reb_without + beneficiary.ast_without
        else:
            return None
        floor = (beneficiary.floor_pts or 0) + (beneficiary.floor_reb or 0) + (beneficiary.floor_ast or 0)
    else:
        return None

    if avg_without is None:
        return None

    edge = avg_without - prop.line

    # Only consider positive edges for Over
    if edge <= 0:
        return None

    # Check FG% stability (within 5%)
    fg_pct_stable = True
    if beneficiary.fg_pct_with and beneficiary.fg_pct_without:
        fg_diff = abs(beneficiary.fg_pct_without - beneficiary.fg_pct_with)
        fg_pct_stable = fg_diff <= 5.0

    # Floor above line check
    floor_above_line = floor > prop.line if floor else False

    # Determine confidence
    if edge >= 5 and beneficiary.min_boost >= 5 and fg_pct_stable and floor_above_line:
        confidence = 'HIGH'
    elif edge >= 3 and beneficiary.min_boost >= 3:
        confidence = 'MEDIUM'
    elif edge >= 2:
        confidence = 'LOW'
    else:
        return None

    return PropOpportunity(
        player_name=beneficiary.player_name,
        absent_player=absent_player.player_name,
        stat_type=prop.stat_type,
        line=prop.line,
        odds=prop.over_odds,
        avg_without=avg_without,
        edge=edge,
        min_without=beneficiary.min_without,
        min_boost=beneficiary.min_boost,
        fg_pct_stable=fg_pct_stable,
        floor=floor if floor else 0,
        floor_above_line=floor_above_line,
        confidence=confidence
    )


def analyze_game(conn, game: Game, season: str) -> list[PropOpportunity]:
    """Run full analysis pipeline for a single game."""
    opportunities = []

    print(f"\n{'='*60}")
    print(f"🏀 {game.away_abbr} @ {game.home_abbr} - {game.game_date}")
    print(f"   Game ID: {game.game_id}")
    print(f"{'='*60}")

    # Analyze both teams
    for team_abbr in [game.home_abbr, game.away_abbr]:
        print(f"\n📊 Analyzing {team_abbr}...")

        # Step 1: Detect absent stars
        absent_players = detect_absent_stars(conn, team_abbr, season)

        if not absent_players:
            print(f"   ✓ No significant absences detected")
            continue

        for absent in absent_players:
            print(f"\n   🚨 ABSENCE: {absent.player_name}")
            print(f"      Games missed: {absent.games_missed}")
            print(f"      Last played: {absent.last_played}")
            print(f"      Season avg: {absent.avg_points} PTS / {absent.avg_rebounds} REB / {absent.avg_assists} AST")

            # Step 2: Get beneficiaries
            beneficiaries = get_absence_beneficiaries(conn, absent.player_id, season)

            if not beneficiaries:
                print(f"      No beneficiaries with sufficient sample size")
                continue

            print(f"\n   📈 Top Beneficiaries:")
            for ben in beneficiaries[:5]:  # Top 5
                if ben.pts_boost and ben.pts_boost > 0:
                    print(f"      • {ben.player_name}: +{ben.pts_boost} PTS, +{ben.min_boost} MIN")

            # Step 3: Check props for beneficiaries
            print(f"\n   🎯 Checking props...")
            for ben in beneficiaries:
                if ben.pts_boost is None or ben.pts_boost <= 2:
                    continue

                props = get_player_props(conn, game.game_id, ben.player_name)

                if not props:
                    continue

                for prop in props:
                    opp = evaluate_opportunity(ben, absent, prop)
                    if opp:
                        opportunities.append(opp)
                        print(f"\n   ✅ VALUE FOUND: {opp.player_name}")
                        print(f"      {prop.stat_type.upper()} O{prop.line} @ {prop.over_odds}")
                        print(f"      Avg without {absent.player_name}: {opp.avg_without}")
                        print(f"      Edge: +{opp.edge:.1f}")
                        print(f"      Minutes boost: +{opp.min_boost}")
                        print(f"      FG% stable: {'✓' if opp.fg_pct_stable else '✗'}")
                        print(f"      Floor: {opp.floor} ({'above line ✓' if opp.floor_above_line else 'below line'})")
                        print(f"      Confidence: {opp.confidence}")

    return opportunities


def print_summary(all_opportunities: list[PropOpportunity]):
    """Print summary of all opportunities found."""
    if not all_opportunities:
        print("\n" + "="*60)
        print("❌ No value opportunities found")
        print("="*60)
        return

    # Sort by confidence then edge
    confidence_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
    sorted_opps = sorted(all_opportunities,
                         key=lambda x: (confidence_order[x.confidence], -x.edge))

    print("\n" + "="*60)
    print("🎯 SUMMARY: VALUE OPPORTUNITIES")
    print("="*60)

    print(f"\n{'Player':<20} {'Absent':<15} {'Prop':<12} {'Line':<8} {'Avg':<8} {'Edge':<8} {'Odds':<8} {'Conf':<8}")
    print("-"*95)

    for opp in sorted_opps:
        print(f"{opp.player_name:<20} {opp.absent_player:<15} {opp.stat_type:<12} "
              f"{opp.line:<8.1f} {opp.avg_without:<8.1f} +{opp.edge:<7.1f} {opp.odds:<8.2f} {opp.confidence:<8}")

    # HIGH confidence summary
    high_conf = [o for o in sorted_opps if o.confidence == 'HIGH']
    if high_conf:
        print(f"\n🔥 HIGH CONFIDENCE ({len(high_conf)}):")
        for opp in high_conf:
            print(f"   • {opp.player_name} O{opp.line} {opp.stat_type} @ {opp.odds} (edge +{opp.edge:.1f})")


def main():
    parser = argparse.ArgumentParser(description='Find player prop value from absences')
    parser.add_argument('--date', type=str, help='Date to analyze (YYYY-MM-DD format)')
    parser.add_argument('--game', type=str, help='Specific game ID to analyze')
    parser.add_argument('--team', type=str, help='Team abbreviation (e.g., DEN, MIL)')
    parser.add_argument('--min-edge', type=float, default=2.0, help='Minimum edge to report')
    args = parser.parse_args()

    conn = get_connection()
    season = get_current_season(conn)

    # Parse date argument
    target_date = None
    if args.date:
        try:
            target_date = datetime.strptime(args.date, '%Y-%m-%d').date()
        except ValueError:
            print(f"❌ Invalid date format: {args.date}. Use YYYY-MM-DD")
            return

    print(f"🏀 Absence Prop Finder")
    print(f"   Season: {season}")
    print(f"   Date: {target_date or date.today()}")

    # Get games to analyze
    if args.game:
        game = get_game_by_id(conn, args.game, season)
        games = [game] if game else []
    elif args.team:
        games = get_games_by_team(conn, args.team.upper(), season)
    else:
        games = get_games_by_date(conn, season, target_date)

    if not games:
        print("\n❌ No games found to analyze")
        return

    print(f"\n📅 Games to analyze: {len(games)}")

    # Analyze each game
    all_opportunities = []
    for game in games:
        opportunities = analyze_game(conn, game, season)
        all_opportunities.extend(opportunities)

    # Print summary
    print_summary(all_opportunities)

    conn.close()


if __name__ == '__main__':
    main()
