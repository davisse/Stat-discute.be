#!/usr/bin/env python3
"""
Scoring Extremes Analysis - Regression to Mean Study

Analyzes what happens to team scoring after extreme performances:
1. After hitting season-high: Do teams regress downward?
2. After hitting season-low: Do teams bounce back?

Explores psychological and behavioral dynamics:
- Overconfidence after big wins
- Motivation after embarrassing losses
- Fatigue after high-energy games
- Coach adjustments after extremes

Based on NBA human behavior patterns and statistical regression to mean.
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from collections import defaultdict
from datetime import datetime


def get_db_connection():
    return psycopg2.connect(
        host='localhost',
        port=5432,
        database='nba_stats',
        user='chapirou',
        cursor_factory=RealDictCursor
    )


def analyze_post_extreme_scoring():
    """
    Main analysis: What happens after teams hit season highs/lows?
    """
    conn = get_db_connection()
    cur = conn.cursor()

    # Get all team games ordered by date within each season
    cur.execute("""
        WITH team_games AS (
            SELECT
                g.game_id,
                g.game_date,
                g.season,
                g.home_team_id as team_id,
                ht.abbreviation as team,
                g.home_team_score as points_scored,
                g.away_team_score as points_allowed,
                'home' as location
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            WHERE g.home_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21')

            UNION ALL

            SELECT
                g.game_id,
                g.game_date,
                g.season,
                g.away_team_id as team_id,
                at.abbreviation as team,
                g.away_team_score as points_scored,
                g.home_team_score as points_allowed,
                'away' as location
            FROM games g
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE g.away_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21')
        ),
        ranked_games AS (
            SELECT
                *,
                ROW_NUMBER() OVER (PARTITION BY team_id, season ORDER BY game_date) as game_num,
                MAX(points_scored) OVER (
                    PARTITION BY team_id, season
                    ORDER BY game_date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) as season_high_before,
                MIN(points_scored) OVER (
                    PARTITION BY team_id, season
                    ORDER BY game_date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) as season_low_before,
                AVG(points_scored) OVER (
                    PARTITION BY team_id, season
                    ORDER BY game_date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) as season_avg_before,
                LAG(points_scored) OVER (PARTITION BY team_id, season ORDER BY game_date) as prev_game_points,
                LEAD(points_scored) OVER (PARTITION BY team_id, season ORDER BY game_date) as next_game_points,
                LEAD(points_scored, 2) OVER (PARTITION BY team_id, season ORDER BY game_date) as next_game_2_points,
                LEAD(points_scored, 3) OVER (PARTITION BY team_id, season ORDER BY game_date) as next_game_3_points
            FROM team_games
        )
        SELECT *
        FROM ranked_games
        WHERE game_num >= 10  -- Need enough games for meaningful season high/low
        ORDER BY team_id, season, game_date
    """)

    games = cur.fetchall()
    print(f"Analyzing {len(games)} team-games across multiple seasons\n")

    # Track results
    after_season_high = {
        'immediate': [],  # Next game
        'game_2': [],     # 2 games later
        'game_3': [],     # 3 games later
        'vs_avg': []      # Compared to their season average
    }

    after_season_low = {
        'immediate': [],
        'game_2': [],
        'game_3': [],
        'vs_avg': []
    }

    after_new_high = {  # When they SET a new season high
        'immediate': [],
        'game_2': [],
        'game_3': [],
        'vs_avg': []
    }

    after_new_low = {  # When they SET a new season low
        'immediate': [],
        'game_2': [],
        'game_3': [],
        'vs_avg': []
    }

    # Track extreme margin games
    after_blowout_win = []    # Won by 20+
    after_blowout_loss = []   # Lost by 20+
    after_close_win = []      # Won by 1-5
    after_close_loss = []     # Lost by 1-5

    for game in games:
        points = game['points_scored']
        season_high = game['season_high_before']
        season_low = game['season_low_before']
        season_avg = game['season_avg_before']
        next_pts = game['next_game_points']
        next_2_pts = game['next_game_2_points']
        next_3_pts = game['next_game_3_points']
        prev_pts = game['prev_game_points']
        allowed = game['points_allowed']

        if not season_high or not season_low or not season_avg or not next_pts:
            continue

        season_avg = float(season_avg)
        margin = points - allowed

        # Check if this game SET a new season high
        if points > season_high:
            after_new_high['immediate'].append(next_pts)
            after_new_high['vs_avg'].append(next_pts - season_avg)
            if next_2_pts:
                after_new_high['game_2'].append(next_2_pts)
            if next_3_pts:
                after_new_high['game_3'].append(next_3_pts)

        # Check if this game SET a new season low
        if points < season_low:
            after_new_low['immediate'].append(next_pts)
            after_new_low['vs_avg'].append(next_pts - season_avg)
            if next_2_pts:
                after_new_low['game_2'].append(next_2_pts)
            if next_3_pts:
                after_new_low['game_3'].append(next_3_pts)

        # Check if PREVIOUS game was at season high
        if prev_pts and prev_pts >= season_high:
            after_season_high['immediate'].append(points)
            after_season_high['vs_avg'].append(points - season_avg)
            if next_pts:
                after_season_high['game_2'].append(next_pts)
            if next_2_pts:
                after_season_high['game_3'].append(next_2_pts)

        # Check if PREVIOUS game was at season low
        if prev_pts and prev_pts <= season_low:
            after_season_low['immediate'].append(points)
            after_season_low['vs_avg'].append(points - season_avg)
            if next_pts:
                after_season_low['game_2'].append(next_pts)
            if next_2_pts:
                after_season_low['game_3'].append(next_2_pts)

        # Margin-based analysis
        if margin >= 20:  # Blowout win
            after_blowout_win.append({
                'next': next_pts,
                'vs_avg': next_pts - season_avg if next_pts else None
            })
        elif margin <= -20:  # Blowout loss
            after_blowout_loss.append({
                'next': next_pts,
                'vs_avg': next_pts - season_avg if next_pts else None
            })
        elif 1 <= margin <= 5:  # Close win
            after_close_win.append({
                'next': next_pts,
                'vs_avg': next_pts - season_avg if next_pts else None
            })
        elif -5 <= margin <= -1:  # Close loss
            after_close_loss.append({
                'next': next_pts,
                'vs_avg': next_pts - season_avg if next_pts else None
            })

    cur.close()
    conn.close()

    # Print results
    print("=" * 90)
    print("SCORING EXTREMES ANALYSIS - REGRESSION TO MEAN STUDY")
    print("=" * 90)

    print("\n" + "=" * 90)
    print("PART 1: AFTER SETTING A NEW SEASON HIGH")
    print("=" * 90)
    print("\nHypothesis: Teams regress after peak performance (fatigue, overconfidence, opponent adjustment)")
    print("-" * 90)

    if after_new_high['immediate']:
        n = len(after_new_high['immediate'])
        avg_next = sum(after_new_high['immediate']) / n
        avg_vs_avg = sum(after_new_high['vs_avg']) / n
        print(f"\nSample size: {n} games where team set new season high")
        print(f"\nNext game after setting season high:")
        print(f"  Average points: {avg_next:.1f}")
        print(f"  vs Season average: {avg_vs_avg:+.1f} pts")

        # Distribution analysis
        below_avg = sum(1 for x in after_new_high['vs_avg'] if x < 0)
        above_avg = sum(1 for x in after_new_high['vs_avg'] if x > 0)
        print(f"\n  Below season avg: {below_avg} ({below_avg/n*100:.1f}%)")
        print(f"  Above season avg: {above_avg} ({above_avg/n*100:.1f}%)")

        if after_new_high['game_2']:
            avg_g2 = sum(after_new_high['game_2']) / len(after_new_high['game_2'])
            print(f"\n2 games later: {avg_g2:.1f} pts")
        if after_new_high['game_3']:
            avg_g3 = sum(after_new_high['game_3']) / len(after_new_high['game_3'])
            print(f"3 games later: {avg_g3:.1f} pts")

    print("\n" + "=" * 90)
    print("PART 2: AFTER SETTING A NEW SEASON LOW")
    print("=" * 90)
    print("\nHypothesis: Teams bounce back after poor performance (motivation, coach adjustments, regression)")
    print("-" * 90)

    if after_new_low['immediate']:
        n = len(after_new_low['immediate'])
        avg_next = sum(after_new_low['immediate']) / n
        avg_vs_avg = sum(after_new_low['vs_avg']) / n
        print(f"\nSample size: {n} games where team set new season low")
        print(f"\nNext game after setting season low:")
        print(f"  Average points: {avg_next:.1f}")
        print(f"  vs Season average: {avg_vs_avg:+.1f} pts")

        # Distribution analysis
        below_avg = sum(1 for x in after_new_low['vs_avg'] if x < 0)
        above_avg = sum(1 for x in after_new_low['vs_avg'] if x > 0)
        print(f"\n  Below season avg: {below_avg} ({below_avg/n*100:.1f}%)")
        print(f"  Above season avg: {above_avg} ({above_avg/n*100:.1f}%)")

        if after_new_low['game_2']:
            avg_g2 = sum(after_new_low['game_2']) / len(after_new_low['game_2'])
            print(f"\n2 games later: {avg_g2:.1f} pts")
        if after_new_low['game_3']:
            avg_g3 = sum(after_new_low['game_3']) / len(after_new_low['game_3'])
            print(f"3 games later: {avg_g3:.1f} pts")

    print("\n" + "=" * 90)
    print("PART 3: GAME MARGIN IMPACT")
    print("=" * 90)
    print("\nDoes the WAY a team won/lost affect next game scoring?")
    print("-" * 90)

    print(f"\n{'Situation':<25} {'N':>8} {'Next Pts':>10} {'vs Avg':>10}")
    print("-" * 55)

    for name, data in [
        ('After blowout WIN (20+)', after_blowout_win),
        ('After blowout LOSS (20+)', after_blowout_loss),
        ('After close WIN (1-5)', after_close_win),
        ('After close LOSS (1-5)', after_close_loss)
    ]:
        valid = [d for d in data if d['next'] and d['vs_avg'] is not None]
        if valid:
            n = len(valid)
            avg_next = sum(d['next'] for d in valid) / n
            avg_vs_avg = sum(d['vs_avg'] for d in valid) / n
            print(f"{name:<25} {n:>8} {avg_next:>10.1f} {avg_vs_avg:>+10.1f}")

    print("\n" + "=" * 90)
    print("PART 4: PSYCHOLOGICAL INTERPRETATION")
    print("=" * 90)

    # Calculate key metrics for interpretation
    high_regression = sum(after_new_high['vs_avg']) / len(after_new_high['vs_avg']) if after_new_high['vs_avg'] else 0
    low_bounce = sum(after_new_low['vs_avg']) / len(after_new_low['vs_avg']) if after_new_low['vs_avg'] else 0

    print("\n🧠 BEHAVIORAL DYNAMICS:")
    print("-" * 60)

    if high_regression < 0:
        print(f"\n📉 AFTER SEASON HIGH: Teams score {abs(high_regression):.1f} pts BELOW average")
        print("   Possible explanations:")
        print("   • Statistical regression to mean (expected)")
        print("   • Physical fatigue after high-energy performance")
        print("   • Opponent game-planning after seeing peak effort")
        print("   • Psychological letdown after emotional high")
    else:
        print(f"\n📈 AFTER SEASON HIGH: Teams score {high_regression:.1f} pts ABOVE average")
        print("   This suggests momentum/confidence carries forward")

    if low_bounce > 0:
        print(f"\n📈 AFTER SEASON LOW: Teams score {low_bounce:.1f} pts ABOVE average")
        print("   Possible explanations:")
        print("   • Statistical regression to mean (expected)")
        print("   • Increased motivation after embarrassment")
        print("   • Coach adjustments and film study")
        print("   • Players responding to challenge")
    else:
        print(f"\n📉 AFTER SEASON LOW: Teams score {abs(low_bounce):.1f} pts BELOW average")
        print("   This suggests slumps persist (concerning)")

    return after_new_high, after_new_low


def analyze_extreme_thresholds():
    """
    Analyze different threshold levels for extreme games
    """
    conn = get_db_connection()
    cur = conn.cursor()

    print("\n" + "=" * 90)
    print("PART 5: THRESHOLD ANALYSIS - What Defines 'Extreme'?")
    print("=" * 90)

    # Get games with rolling stats
    cur.execute("""
        WITH team_games AS (
            SELECT
                g.game_id,
                g.game_date,
                g.season,
                g.home_team_id as team_id,
                g.home_team_score as points_scored,
                g.away_team_score as points_allowed
            FROM games g
            WHERE g.home_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21')

            UNION ALL

            SELECT
                g.game_id,
                g.game_date,
                g.season,
                g.away_team_id as team_id,
                g.away_team_score as points_scored,
                g.home_team_score as points_allowed
            FROM games g
            WHERE g.away_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21')
        ),
        with_stats AS (
            SELECT
                *,
                AVG(points_scored) OVER (
                    PARTITION BY team_id, season
                    ORDER BY game_date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) as season_avg,
                STDDEV(points_scored) OVER (
                    PARTITION BY team_id, season
                    ORDER BY game_date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) as season_std,
                LEAD(points_scored) OVER (PARTITION BY team_id, season ORDER BY game_date) as next_pts,
                ROW_NUMBER() OVER (PARTITION BY team_id, season ORDER BY game_date) as game_num
            FROM team_games
        )
        SELECT *
        FROM with_stats
        WHERE game_num >= 15  -- Need enough games for std dev
        AND season_std > 0
        AND next_pts IS NOT NULL
    """)

    games = cur.fetchall()

    # Analyze by standard deviation thresholds
    thresholds = [1.0, 1.5, 2.0, 2.5]

    print("\nScoring relative to season average (by standard deviations):")
    print("-" * 90)
    print(f"{'Threshold':<15} {'N High':>8} {'Next vs Avg':>12} {'N Low':>8} {'Next vs Avg':>12}")
    print("-" * 90)

    for threshold in thresholds:
        high_games = []
        low_games = []

        for game in games:
            pts = game['points_scored']
            avg = float(game['season_avg'])
            std = float(game['season_std'])
            next_pts = game['next_pts']

            z_score = (pts - avg) / std

            if z_score >= threshold:
                high_games.append(next_pts - avg)
            elif z_score <= -threshold:
                low_games.append(next_pts - avg)

        high_result = sum(high_games) / len(high_games) if high_games else 0
        low_result = sum(low_games) / len(low_games) if low_games else 0

        print(f"{threshold:.1f} std dev     {len(high_games):>8} {high_result:>+12.2f} {len(low_games):>8} {low_result:>+12.2f}")

    cur.close()
    conn.close()


def analyze_scoring_streaks():
    """
    Analyze what happens after scoring streaks (multiple high/low games)
    """
    conn = get_db_connection()
    cur = conn.cursor()

    print("\n" + "=" * 90)
    print("PART 6: STREAK ANALYSIS - Consecutive High/Low Games")
    print("=" * 90)

    cur.execute("""
        WITH team_games AS (
            SELECT
                g.game_id,
                g.game_date,
                g.season,
                g.home_team_id as team_id,
                g.home_team_score as points_scored
            FROM games g
            WHERE g.home_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21')

            UNION ALL

            SELECT
                g.game_id,
                g.game_date,
                g.season,
                g.away_team_id as team_id,
                g.away_team_score as points_scored
            FROM games g
            WHERE g.away_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21')
        ),
        with_rolling AS (
            SELECT
                *,
                AVG(points_scored) OVER (
                    PARTITION BY team_id, season
                    ORDER BY game_date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) as season_avg,
                LAG(points_scored, 1) OVER (PARTITION BY team_id, season ORDER BY game_date) as prev_1,
                LAG(points_scored, 2) OVER (PARTITION BY team_id, season ORDER BY game_date) as prev_2,
                LAG(points_scored, 3) OVER (PARTITION BY team_id, season ORDER BY game_date) as prev_3,
                LEAD(points_scored) OVER (PARTITION BY team_id, season ORDER BY game_date) as next_pts,
                ROW_NUMBER() OVER (PARTITION BY team_id, season ORDER BY game_date) as game_num
            FROM team_games
        )
        SELECT *
        FROM with_rolling
        WHERE game_num >= 15
        AND season_avg IS NOT NULL
        AND next_pts IS NOT NULL
        AND prev_1 IS NOT NULL
        AND prev_2 IS NOT NULL
        AND prev_3 IS NOT NULL
    """)

    games = cur.fetchall()

    # Track streaks
    after_3_high = []  # 3 consecutive above average
    after_3_low = []   # 3 consecutive below average
    after_2_high = []
    after_2_low = []

    for game in games:
        avg = float(game['season_avg'])
        prev_1 = game['prev_1']
        prev_2 = game['prev_2']
        prev_3 = game['prev_3']
        next_pts = game['next_pts']

        # Check for 3-game above average streak
        if prev_1 > avg and prev_2 > avg and prev_3 > avg:
            after_3_high.append(next_pts - avg)
        # Check for 3-game below average streak
        elif prev_1 < avg and prev_2 < avg and prev_3 < avg:
            after_3_low.append(next_pts - avg)
        # Check for 2-game streaks
        elif prev_1 > avg and prev_2 > avg:
            after_2_high.append(next_pts - avg)
        elif prev_1 < avg and prev_2 < avg:
            after_2_low.append(next_pts - avg)

    print("\nDoes momentum from consecutive games affect next game?")
    print("-" * 70)
    print(f"{'Streak Type':<35} {'N':>8} {'Next vs Avg':>15}")
    print("-" * 70)

    for name, data in [
        ('After 3 games ABOVE average', after_3_high),
        ('After 3 games BELOW average', after_3_low),
        ('After 2 games ABOVE average', after_2_high),
        ('After 2 games BELOW average', after_2_low),
    ]:
        if data:
            avg_result = sum(data) / len(data)
            print(f"{name:<35} {len(data):>8} {avg_result:>+15.2f}")

    cur.close()
    conn.close()


def betting_implications():
    """
    Translate findings into betting implications
    """
    print("\n" + "=" * 90)
    print("PART 7: BETTING IMPLICATIONS")
    print("=" * 90)

    print("""
🎯 ACTIONABLE BETTING SIGNALS:

1. AFTER NEW SEASON HIGH:
   • If regression confirmed → UNDER on team total next game
   • Strongest signal when: high-energy overtime win or blowout
   • Context matters: B2B schedule amplifies regression

2. AFTER NEW SEASON LOW:
   • If bounce-back confirmed → OVER on team total next game
   • Strongest signal when: embarrassing home loss
   • Look for motivational factors: rivalry game, playoff push

3. BLOWOUT DYNAMICS:
   • After 20+ win: Check for letdown spot
   • After 20+ loss: Check for bounce-back motivation

4. STREAK BREAKS:
   • 3-game above average streak likely to regress
   • 3-game below average streak likely to bounce back
   • Regression to mean is statistically inevitable

5. COMBINED SIGNALS:
   • Season high + B2B next game = STRONG UNDER
   • Season low + home game = STRONG OVER
   • Extreme + rest advantage = Amplified regression

⚠️ IMPORTANT CAVEATS:
   • Regression to mean is mathematical, not psychological
   • Market may already price these patterns
   • Always compare to closing lines, not just raw signals
   • Context (injuries, matchups) overrides statistical patterns
""")


if __name__ == '__main__':
    # Run all analyses
    analyze_post_extreme_scoring()
    analyze_extreme_thresholds()
    analyze_scoring_streaks()
    betting_implications()
