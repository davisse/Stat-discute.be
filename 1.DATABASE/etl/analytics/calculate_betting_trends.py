#!/usr/bin/env python3
"""
Calculate Betting Trends Analytics

This script analyzes ATS (Against The Spread) performance data to identify betting trends
for NBA teams. It calculates recent form, streaks, and pattern-based trend indicators.

Trend Detection Logic:
- Hot ATS: Team covering >= 7 of last 10 games
- Cold ATS: Team covering <= 3 of last 10 games
- Strong Home: Home ATS cover % >= 60%
- Weak Away: Away ATS cover % <= 40%
- Over Bias: Games going over total >= 60%
- Under Bias: Games going under total <= 40%

Confidence Scoring:
- Sample size weight (more games = higher confidence)
- Consistency weight (streak strength)
- Margin weight (how extreme the percentage)

Usage:
    python3 calculate_betting_trends.py [--season YYYY-YY]

Example:
    python3 calculate_betting_trends.py --season 2025-26
"""

import os
import sys
import psycopg2
import argparse
from datetime import datetime, timezone
from typing import Dict, List, Tuple, Optional
from dotenv import load_dotenv

# Load environment variables from config/.env
config_path = os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env')
load_dotenv(config_path)


def get_db_connection():
    """Establish PostgreSQL database connection."""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'nba_stats'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '')
        )
        return conn
    except psycopg2.Error as e:
        print(f"❌ Database connection failed: {e}")
        sys.exit(1)


def log(message: str):
    """Print timestamped log message."""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] {message}")


def get_current_season(conn) -> str:
    """Get the current active season from database."""
    with conn.cursor() as cur:
        cur.execute("SELECT season_id FROM seasons WHERE is_current = true LIMIT 1")
        result = cur.fetchone()
        if result:
            return result[0]
        else:
            log("⚠️  No current season found, defaulting to 2025-26")
            return "2025-26"


def get_last_n_games_ats(conn, team_id: int, season: str, n: int = 10) -> Tuple[int, int, List[bool]]:
    """
    Get last N games ATS results for a team.

    Returns:
        (covers, games_played, cover_sequence)
        - covers: Number of ATS covers in last N games
        - games_played: Actual games played (may be < N for new season)
        - cover_sequence: List of True/False for each game (most recent first)
    """
    with conn.cursor() as cur:
        # Query last N games with ATS results
        # A team covers ATS if:
        # - Home team: (home_score - away_score) > spread
        # - Away team: (away_score - home_score) > -spread
        cur.execute("""
            WITH team_games AS (
                SELECT
                    g.game_id,
                    g.game_date,
                    g.home_team_id,
                    g.away_team_id,
                    g.home_team_score,
                    g.away_team_score,
                    bl.spread as spread,
                    CASE
                        WHEN g.home_team_id = %s THEN 'home'
                        WHEN g.away_team_id = %s THEN 'away'
                    END as team_location
                FROM games g
                LEFT JOIN betting_lines bl ON g.game_id = bl.game_id
                    AND bl.spread IS NOT NULL
                    AND bl.is_opening_line = true
                WHERE g.season = %s
                    AND (g.home_team_id = %s OR g.away_team_id = %s)
                    AND g.game_status = 'Final'
                    AND g.home_team_score IS NOT NULL
                    AND g.away_team_score IS NOT NULL
                ORDER BY g.game_date DESC
                LIMIT %s
            )
            SELECT
                game_id,
                team_location,
                home_team_score,
                away_team_score,
                spread,
                CASE
                    WHEN team_location = 'home' AND spread IS NOT NULL
                        THEN (home_team_score - away_team_score) > spread
                    WHEN team_location = 'away' AND spread IS NOT NULL
                        THEN (away_team_score - home_team_score) > -spread
                    ELSE NULL
                END as covered_spread
            FROM team_games
            ORDER BY game_date DESC
        """, (team_id, team_id, season, team_id, team_id, n))

        results = cur.fetchall()

        if not results:
            return 0, 0, []

        # Filter out games without betting lines
        cover_sequence = [row[5] for row in results if row[5] is not None]
        covers = sum(1 for covered in cover_sequence if covered)
        games_played = len(cover_sequence)

        return covers, games_played, cover_sequence


def calculate_current_streak(cover_sequence: List[bool]) -> Tuple[int, str]:
    """
    Calculate current ATS streak.

    Returns:
        (streak_length, streak_type)
        - streak_length: Number of consecutive games
        - streak_type: 'covering' or 'not_covering'
    """
    if not cover_sequence:
        return 0, 'none'

    current_streak = 1
    is_covering = cover_sequence[0]

    for i in range(1, len(cover_sequence)):
        if cover_sequence[i] == is_covering:
            current_streak += 1
        else:
            break

    streak_type = 'covering' if is_covering else 'not_covering'
    return current_streak, streak_type


def calculate_confidence_score(
    games_sample_size: int,
    streak_length: int,
    percentage: float,
    min_games: int = 10
) -> float:
    """
    Calculate confidence score (0-100) based on multiple factors.

    Factors:
    - Sample size weight: More games = higher confidence
    - Consistency weight: Longer streaks = higher confidence
    - Margin weight: More extreme percentages = higher confidence
    """
    # Sample size component (0-40 points)
    sample_weight = min(40, (games_sample_size / min_games) * 40)

    # Streak consistency component (0-30 points)
    streak_weight = min(30, (streak_length / 10) * 30)

    # Percentage margin component (0-30 points)
    # Distance from 50% (neutral) - max at 0% or 100%
    margin = abs(percentage - 0.5) * 2  # Normalize to 0-1
    margin_weight = margin * 30

    confidence = sample_weight + streak_weight + margin_weight
    return round(min(100, confidence), 1)


def identify_trends(
    conn,
    team_id: int,
    season: str,
    ats_data: Dict[str, float],
    last_10_covers: int,
    last_10_games: int,
    current_streak: int,
    streak_type: str
) -> List[Dict]:
    """
    Identify betting trend patterns for a team.

    Returns list of trend dictionaries with:
    - trend_type
    - trend_value
    - trend_description
    - confidence_score
    """
    trends = []

    if last_10_games == 0:
        return trends

    last_10_pct = last_10_covers / last_10_games

    # Hot ATS Trend: >= 7 of last 10 covers
    if last_10_covers >= 7 and last_10_games >= 10:
        confidence = calculate_confidence_score(
            games_sample_size=last_10_games,
            streak_length=current_streak if streak_type == 'covering' else 0,
            percentage=last_10_pct
        )
        trends.append({
            'trend_type': 'hot_ats',
            'trend_value': last_10_pct,
            'trend_description': f"Covering {last_10_covers} of last {last_10_games} games",
            'confidence_score': confidence
        })

    # Cold ATS Trend: <= 3 of last 10 covers
    if last_10_covers <= 3 and last_10_games >= 10:
        confidence = calculate_confidence_score(
            games_sample_size=last_10_games,
            streak_length=current_streak if streak_type == 'not_covering' else 0,
            percentage=last_10_pct
        )
        trends.append({
            'trend_type': 'cold_ats',
            'trend_value': last_10_pct,
            'trend_description': f"Covering only {last_10_covers} of last {last_10_games} games",
            'confidence_score': confidence
        })

    # Strong Home Trend: >= 60% home ATS cover rate
    home_ats_pct = ats_data.get('home_ats_cover_pct', 0)
    home_games = ats_data.get('home_games', 0)
    if home_ats_pct >= 0.60 and home_games >= 5:
        confidence = calculate_confidence_score(
            games_sample_size=home_games,
            streak_length=current_streak if streak_type == 'covering' else 0,
            percentage=home_ats_pct,
            min_games=5
        )
        trends.append({
            'trend_type': 'strong_home',
            'trend_value': home_ats_pct,
            'trend_description': f"Strong home ATS performance ({home_ats_pct:.1%})",
            'confidence_score': confidence
        })

    # Weak Away Trend: <= 40% away ATS cover rate
    away_ats_pct = ats_data.get('away_ats_cover_pct', 0)
    away_games = ats_data.get('away_games', 0)
    if away_ats_pct <= 0.40 and away_games >= 5:
        confidence = calculate_confidence_score(
            games_sample_size=away_games,
            streak_length=current_streak if streak_type == 'not_covering' else 0,
            percentage=away_ats_pct,
            min_games=5
        )
        trends.append({
            'trend_type': 'weak_away',
            'trend_value': away_ats_pct,
            'trend_description': f"Weak away ATS performance ({away_ats_pct:.1%})",
            'confidence_score': confidence
        })

    # Over Bias: >= 60% of games going over total
    over_pct = ats_data.get('over_pct', 0)
    total_games = ats_data.get('total_games', 0)
    if over_pct >= 0.60 and total_games >= 10:
        confidence = calculate_confidence_score(
            games_sample_size=total_games,
            streak_length=0,  # Streak not applicable for totals
            percentage=over_pct
        )
        trends.append({
            'trend_type': 'over_bias',
            'trend_value': over_pct,
            'trend_description': f"Games consistently going over ({over_pct:.1%})",
            'confidence_score': confidence
        })

    # Under Bias: <= 40% of games going over total (60%+ under)
    if over_pct <= 0.40 and total_games >= 10:
        under_pct = 1 - over_pct
        confidence = calculate_confidence_score(
            games_sample_size=total_games,
            streak_length=0,
            percentage=over_pct
        )
        trends.append({
            'trend_type': 'under_bias',
            'trend_value': under_pct,
            'trend_description': f"Games consistently going under ({under_pct:.1%})",
            'confidence_score': confidence
        })

    return trends


def get_ats_performance_data(conn, team_id: int, season: str) -> Optional[Dict[str, float]]:
    """Fetch ATS performance data for a team."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                ats_win_pct,
                CASE
                    WHEN (home_ats_wins + home_ats_losses) > 0
                    THEN home_ats_wins::float / (home_ats_wins + home_ats_losses)
                    ELSE 0
                END as home_ats_cover_pct,
                CASE
                    WHEN (away_ats_wins + away_ats_losses) > 0
                    THEN away_ats_wins::float / (away_ats_wins + away_ats_losses)
                    ELSE 0
                END as away_ats_cover_pct,
                CASE
                    WHEN (over_record + under_record + ou_pushes) > 0
                    THEN over_record::float / (over_record + under_record + ou_pushes)
                    ELSE 0
                END as over_pct,
                (ats_wins + ats_losses + ats_pushes) as games_with_line,
                (home_ats_wins + home_ats_losses) as home_games_with_line,
                (away_ats_wins + away_ats_losses) as away_games_with_line
            FROM ats_performance
            WHERE team_id = %s AND season_id = %s
        """, (team_id, season))

        result = cur.fetchone()
        if not result:
            return None

        return {
            'ats_cover_pct': float(result[0]) if result[0] else 0,
            'home_ats_cover_pct': float(result[1]) or 0,
            'away_ats_cover_pct': float(result[2]) or 0,
            'over_pct': float(result[3]) or 0,
            'total_games': int(result[4]) or 0,
            'home_games': int(result[5]) or 0,
            'away_games': int(result[6]) or 0
        }


def upsert_betting_trend(
    conn,
    team_id: int,
    season: str,
    trend_type: str,
    trend_value: float,
    trend_description: str,
    games_sample_size: int,
    confidence_score: float,
    last_10_ats_record: str,
    last_10_ats_pct: float,
    current_streak: int,
    streak_type: str
):
    """Insert or update betting trend record."""
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO betting_trends (
                team_id,
                season,
                trend_type,
                trend_value,
                trend_description,
                games_sample_size,
                confidence_score,
                last_10_ats_record,
                last_10_ats_pct,
                current_streak,
                streak_type,
                last_updated
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (team_id, season, trend_type)
            DO UPDATE SET
                trend_value = EXCLUDED.trend_value,
                trend_description = EXCLUDED.trend_description,
                games_sample_size = EXCLUDED.games_sample_size,
                confidence_score = EXCLUDED.confidence_score,
                last_10_ats_record = EXCLUDED.last_10_ats_record,
                last_10_ats_pct = EXCLUDED.last_10_ats_pct,
                current_streak = EXCLUDED.current_streak,
                streak_type = EXCLUDED.streak_type,
                last_updated = EXCLUDED.last_updated
        """, (
            team_id,
            season,
            trend_type,
            trend_value,
            trend_description,
            games_sample_size,
            confidence_score,
            last_10_ats_record,
            last_10_ats_pct,
            current_streak,
            streak_type,
            datetime.now(timezone.utc)
        ))


def calculate_betting_trends(season: Optional[str] = None):
    """
    Main function to calculate betting trends for all teams.

    Args:
        season: Season string (e.g., '2025-26'). If None, uses current season.
    """
    conn = get_db_connection()

    try:
        if season is None:
            season = get_current_season(conn)

        log(f"🎯 Calculating betting trends for season: {season}")

        # Get all active teams
        with conn.cursor() as cur:
            cur.execute("SELECT team_id, full_name FROM teams ORDER BY team_id")
            teams = cur.fetchall()

        if not teams:
            log("⚠️  No teams found in database")
            return

        log(f"📊 Processing {len(teams)} teams...")

        trends_count = 0
        teams_with_trends = 0

        for team_id, team_name in teams:
            # Get ATS performance data
            ats_data = get_ats_performance_data(conn, team_id, season)

            if not ats_data:
                log(f"⚠️  No ATS data for {team_name} ({team_id})")
                continue

            # Get last 10 games ATS performance
            last_10_covers, last_10_games, cover_sequence = get_last_n_games_ats(
                conn, team_id, season, n=10
            )

            if last_10_games == 0:
                log(f"⚠️  No games with betting lines for {team_name}")
                continue

            # Calculate current streak
            current_streak, streak_type = calculate_current_streak(cover_sequence)

            # Identify trends
            trends = identify_trends(
                conn,
                team_id,
                season,
                ats_data,
                last_10_covers,
                last_10_games,
                current_streak,
                streak_type
            )

            if trends:
                teams_with_trends += 1
                last_10_ats_record = f"{last_10_covers}-{last_10_games - last_10_covers}"
                last_10_ats_pct = last_10_covers / last_10_games if last_10_games > 0 else 0

                for trend in trends:
                    upsert_betting_trend(
                        conn,
                        team_id,
                        season,
                        trend['trend_type'],
                        trend['trend_value'],
                        trend['trend_description'],
                        last_10_games,
                        trend['confidence_score'],
                        last_10_ats_record,
                        last_10_ats_pct,
                        current_streak,
                        streak_type
                    )
                    trends_count += 1

                    log(f"✅ {team_name}: {trend['trend_type']} - {trend['trend_description']} (confidence: {trend['confidence_score']:.1f})")
            else:
                log(f"ℹ️  {team_name}: No significant trends detected")

        conn.commit()

        log(f"\n✅ Betting trends calculation complete!")
        log(f"📊 Summary:")
        log(f"   - Teams processed: {len(teams)}")
        log(f"   - Teams with trends: {teams_with_trends}")
        log(f"   - Total trends identified: {trends_count}")
        log(f"   - Season: {season}")

    except Exception as e:
        conn.rollback()
        log(f"❌ Error calculating betting trends: {e}")
        raise
    finally:
        conn.close()


def main():
    """Parse arguments and run betting trends calculation."""
    parser = argparse.ArgumentParser(
        description='Calculate betting trends from ATS performance data'
    )
    parser.add_argument(
        '--season',
        type=str,
        help='Season to process (e.g., 2025-26). Default: current season'
    )

    args = parser.parse_args()

    try:
        calculate_betting_trends(season=args.season)
    except KeyboardInterrupt:
        log("\n⚠️  Process interrupted by user")
        sys.exit(1)
    except Exception as e:
        log(f"❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
