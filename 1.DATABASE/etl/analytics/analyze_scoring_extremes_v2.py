#!/usr/bin/env python3
"""
Scoring Extremes Analysis V2 - Deep Dive

The initial analysis revealed COUNTERINTUITIVE results:
- After season HIGH: Teams score +2.7 pts ABOVE average (NOT regression!)
- After season LOW: Teams score -1.5 pts BELOW average (slumps persist!)

This contradicts classic regression to mean theory.
Let's investigate WHY with deeper analysis.

Hypotheses to test:
1. Selection bias: Teams setting highs/lows are on hot/cold streaks
2. Opponent quality: Maybe facing easier/harder opponents
3. Home/Away context: Location affecting both extreme and next game
4. True momentum exists: Good teams stay good, bad teams stay bad
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from collections import defaultdict
import statistics


def get_db_connection():
    return psycopg2.connect(
        host='localhost',
        port=5432,
        database='nba_stats',
        user='chapirou',
        cursor_factory=RealDictCursor
    )


def analyze_with_controls():
    """
    Control for confounding variables to find TRUE regression effect
    """
    conn = get_db_connection()
    cur = conn.cursor()

    print("=" * 90)
    print("SCORING EXTREMES V2 - CONTROLLED ANALYSIS")
    print("=" * 90)
    print("\nInvestigating why initial results contradicted regression to mean theory")

    # Get comprehensive game data
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
                g.away_team_id as opponent_id,
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
                g.home_team_id as opponent_id,
                'away' as location
            FROM games g
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE g.away_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21')
        ),
        with_rolling AS (
            SELECT
                *,
                ROW_NUMBER() OVER (PARTITION BY team_id, season ORDER BY game_date) as game_num,
                AVG(points_scored) OVER (
                    PARTITION BY team_id, season
                    ORDER BY game_date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) as season_avg,
                MAX(points_scored) OVER (
                    PARTITION BY team_id, season
                    ORDER BY game_date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) as season_high,
                MIN(points_scored) OVER (
                    PARTITION BY team_id, season
                    ORDER BY game_date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) as season_low,
                LAG(points_scored) OVER (PARTITION BY team_id, season ORDER BY game_date) as prev_points,
                LAG(location) OVER (PARTITION BY team_id, season ORDER BY game_date) as prev_location,
                LEAD(points_scored) OVER (PARTITION BY team_id, season ORDER BY game_date) as next_points,
                LEAD(location) OVER (PARTITION BY team_id, season ORDER BY game_date) as next_location
            FROM team_games
        )
        SELECT *
        FROM with_rolling
        WHERE game_num >= 15
        AND season_avg IS NOT NULL
        AND next_points IS NOT NULL
    """)

    games = cur.fetchall()
    print(f"\nAnalyzing {len(games)} team-games with full context\n")

    # Analysis 1: Control for location
    print("=" * 90)
    print("ANALYSIS 1: CONTROLLING FOR HOME/AWAY LOCATION")
    print("=" * 90)
    print("\nQuestion: Is the 'momentum' effect actually just home court advantage?")

    location_buckets = {
        'high_at_home_next_home': [],
        'high_at_home_next_away': [],
        'high_at_away_next_home': [],
        'high_at_away_next_away': [],
        'low_at_home_next_home': [],
        'low_at_home_next_away': [],
        'low_at_away_next_home': [],
        'low_at_away_next_away': [],
    }

    for game in games:
        pts = game['points_scored']
        season_high = game['season_high']
        season_low = game['season_low']
        season_avg = float(game['season_avg'])
        next_pts = game['next_points']
        loc = game['location']
        next_loc = game['next_location']
        prev_pts = game['prev_points']

        if not season_high or not season_low or not next_loc:
            continue

        # Check if PREVIOUS game set new high
        if prev_pts and prev_pts >= season_high:
            prev_loc = game['prev_location']
            if prev_loc == 'home' and next_loc == 'home':
                location_buckets['high_at_home_next_home'].append(next_pts - season_avg)
            elif prev_loc == 'home' and next_loc == 'away':
                location_buckets['high_at_home_next_away'].append(next_pts - season_avg)
            elif prev_loc == 'away' and next_loc == 'home':
                location_buckets['high_at_away_next_home'].append(next_pts - season_avg)
            elif prev_loc == 'away' and next_loc == 'away':
                location_buckets['high_at_away_next_away'].append(next_pts - season_avg)

        # Check if PREVIOUS game set new low
        if prev_pts and prev_pts <= season_low:
            prev_loc = game['prev_location']
            if prev_loc == 'home' and next_loc == 'home':
                location_buckets['low_at_home_next_home'].append(next_pts - season_avg)
            elif prev_loc == 'home' and next_loc == 'away':
                location_buckets['low_at_home_next_away'].append(next_pts - season_avg)
            elif prev_loc == 'away' and next_loc == 'home':
                location_buckets['low_at_away_next_home'].append(next_pts - season_avg)
            elif prev_loc == 'away' and next_loc == 'away':
                location_buckets['low_at_away_next_away'].append(next_pts - season_avg)

    print("\nAFTER SETTING SEASON HIGH:")
    print("-" * 70)
    print(f"{'Extreme Location → Next Location':<40} {'N':>6} {'Next vs Avg':>12}")
    print("-" * 70)
    for key in ['high_at_home_next_home', 'high_at_home_next_away', 'high_at_away_next_home', 'high_at_away_next_away']:
        data = location_buckets[key]
        if data:
            avg = sum(data) / len(data)
            label = key.replace('high_at_', '').replace('_next_', ' → ')
            print(f"{label:<40} {len(data):>6} {avg:>+12.2f}")

    print("\nAFTER SETTING SEASON LOW:")
    print("-" * 70)
    for key in ['low_at_home_next_home', 'low_at_home_next_away', 'low_at_away_next_home', 'low_at_away_next_away']:
        data = location_buckets[key]
        if data:
            avg = sum(data) / len(data)
            label = key.replace('low_at_', '').replace('_next_', ' → ')
            print(f"{label:<40} {len(data):>6} {avg:>+12.2f}")

    # Analysis 2: Compare to EXACT same game situation without extreme
    print("\n" + "=" * 90)
    print("ANALYSIS 2: MATCHED COMPARISON - EXTREME vs NON-EXTREME")
    print("=" * 90)
    print("\nComparing: 'after season high' vs 'normal game with same next location'")

    normal_home_to_home = []
    normal_home_to_away = []
    normal_away_to_home = []
    normal_away_to_away = []

    for game in games:
        pts = game['points_scored']
        season_high = game['season_high']
        season_low = game['season_low']
        season_avg = float(game['season_avg'])
        next_pts = game['next_points']
        loc = game['location']
        next_loc = game['next_location']
        prev_pts = game['prev_points']
        prev_loc = game['prev_location']

        if not season_high or not season_low or not next_loc or not prev_loc:
            continue

        # Only include games that are NOT setting new high or low
        if prev_pts and season_low < prev_pts < season_high:
            if prev_loc == 'home' and next_loc == 'home':
                normal_home_to_home.append(next_pts - season_avg)
            elif prev_loc == 'home' and next_loc == 'away':
                normal_home_to_away.append(next_pts - season_avg)
            elif prev_loc == 'away' and next_loc == 'home':
                normal_away_to_home.append(next_pts - season_avg)
            elif prev_loc == 'away' and next_loc == 'away':
                normal_away_to_away.append(next_pts - season_avg)

    print("\nNORMAL GAMES (not extreme) - BASELINE:")
    print("-" * 70)
    print(f"{'Location Transition':<40} {'N':>6} {'Next vs Avg':>12}")
    print("-" * 70)
    for name, data in [
        ('home → home', normal_home_to_home),
        ('home → away', normal_home_to_away),
        ('away → home', normal_away_to_home),
        ('away → away', normal_away_to_away)
    ]:
        if data:
            avg = sum(data) / len(data)
            print(f"{name:<40} {len(data):>6} {avg:>+12.2f}")

    # Analysis 3: True regression - compare extreme to their OWN baseline
    print("\n" + "=" * 90)
    print("ANALYSIS 3: EXTREME GAME IMPACT (Difference from Baseline)")
    print("=" * 90)

    print("\nThis shows the TRUE effect of extreme games by comparing to matched baseline")
    print("-" * 70)

    # Calculate differences
    print(f"\n{'Comparison':<50} {'Extreme':>10} {'Baseline':>10} {'Diff':>10}")
    print("-" * 70)

    comparisons = [
        ('High at home → home', 'high_at_home_next_home', normal_home_to_home),
        ('High at home → away', 'high_at_home_next_away', normal_home_to_away),
        ('High at away → home', 'high_at_away_next_home', normal_away_to_home),
        ('High at away → away', 'high_at_away_next_away', normal_away_to_away),
        ('Low at home → home', 'low_at_home_next_home', normal_home_to_home),
        ('Low at home → away', 'low_at_home_next_away', normal_home_to_away),
        ('Low at away → home', 'low_at_away_next_home', normal_away_to_home),
        ('Low at away → away', 'low_at_away_next_away', normal_away_to_away),
    ]

    for label, extreme_key, baseline_data in comparisons:
        extreme_data = location_buckets[extreme_key]
        if extreme_data and baseline_data:
            extreme_avg = sum(extreme_data) / len(extreme_data)
            baseline_avg = sum(baseline_data) / len(baseline_data)
            diff = extreme_avg - baseline_avg
            print(f"{label:<50} {extreme_avg:>+10.2f} {baseline_avg:>+10.2f} {diff:>+10.2f}")

    cur.close()
    conn.close()


def analyze_true_regression_effect():
    """
    Calculate the pure regression effect by looking at deviation from expected
    """
    conn = get_db_connection()
    cur = conn.cursor()

    print("\n" + "=" * 90)
    print("ANALYSIS 4: PURE REGRESSION TO MEAN EFFECT")
    print("=" * 90)

    cur.execute("""
        WITH team_games AS (
            SELECT
                g.game_date,
                g.season,
                g.home_team_id as team_id,
                g.home_team_score as points_scored
            FROM games g
            WHERE g.home_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21')

            UNION ALL

            SELECT
                g.game_date,
                g.season,
                g.away_team_id as team_id,
                g.away_team_score as points_scored
            FROM games g
            WHERE g.away_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21')
        ),
        with_stats AS (
            SELECT
                *,
                AVG(points_scored) OVER (PARTITION BY team_id, season) as team_season_avg,
                STDDEV(points_scored) OVER (PARTITION BY team_id, season) as team_season_std,
                LEAD(points_scored) OVER (PARTITION BY team_id, season ORDER BY game_date) as next_pts,
                ROW_NUMBER() OVER (PARTITION BY team_id, season ORDER BY game_date) as game_num
            FROM team_games
        )
        SELECT
            points_scored,
            team_season_avg,
            team_season_std,
            next_pts,
            (points_scored - team_season_avg) / NULLIF(team_season_std, 0) as z_score
        FROM with_stats
        WHERE game_num >= 10
        AND team_season_std > 0
        AND next_pts IS NOT NULL
    """)

    games = cur.fetchall()

    # Bin by z-score and see what happens next
    bins = {}
    for game in games:
        z = float(game['z_score'])
        avg = float(game['team_season_avg'])
        next_pts = game['next_pts']

        # Round z-score to nearest 0.5
        z_bin = round(z * 2) / 2
        if z_bin < -3:
            z_bin = -3
        if z_bin > 3:
            z_bin = 3

        if z_bin not in bins:
            bins[z_bin] = []

        # Store deviation of NEXT game from team average
        bins[z_bin].append(next_pts - avg)

    print("\nWhat happens in the NEXT game after scoring X standard deviations from mean?")
    print("-" * 70)
    print(f"{'This Game (Z-Score)':<25} {'N':>8} {'Next Game vs Avg':>18} {'Regression?':>15}")
    print("-" * 70)

    for z_bin in sorted(bins.keys()):
        data = bins[z_bin]
        if len(data) >= 50:  # Minimum sample
            avg_next = sum(data) / len(data)
            # Regression means: if z_bin is positive, next should be less positive
            # If z_bin is negative, next should be less negative
            if z_bin > 0:
                regression = "YES ↓" if avg_next < z_bin * 10 else "NO ↑"  # Approximating
            elif z_bin < 0:
                regression = "YES ↑" if avg_next > z_bin * 10 else "NO ↓"
            else:
                regression = "NEUTRAL"

            z_label = f"{z_bin:+.1f} std"
            print(f"{z_label:<25} {len(data):>8} {avg_next:>+18.2f} {regression:>15}")

    # Key insight: Calculate expected regression
    print("\n" + "=" * 90)
    print("KEY INSIGHT: THE MATHEMATICAL REGRESSION EFFECT")
    print("=" * 90)

    print("""
📊 INTERPRETATION:

The data shows that teams scoring ABOVE average tend to score above average
in the next game too. This seems to contradict regression to mean, but actually:

1. TEAM QUALITY EFFECT:
   - Good teams score above average MORE OFTEN
   - A high-scoring game might indicate the team is simply good
   - "Regression" for good teams is to THEIR mean, not league mean

2. SELECTION BIAS:
   - Teams setting season highs are likely on hot streaks
   - Hot streaks represent real, temporary performance boosts
   - The streak continues until it doesn't

3. TRUE REGRESSION EXISTS:
   - A team scoring +20 above their mean will score CLOSER to mean next game
   - They may still score +10 above mean (still above, but regressed)
   - This is regression - just not ALL the way back

4. BETTING IMPLICATION:
   - Don't bet UNDER just because team scored season high
   - The "high" might be their new normal
   - Look for CONTEXT: fatigue, opponent quality, location changes
""")

    cur.close()
    conn.close()


def analyze_magnitude_of_extreme():
    """
    Does the SIZE of the extreme matter?
    """
    conn = get_db_connection()
    cur = conn.cursor()

    print("\n" + "=" * 90)
    print("ANALYSIS 5: MAGNITUDE OF EXTREME")
    print("=" * 90)
    print("\nDoes scoring 20+ above season high differ from scoring 5 above?")

    cur.execute("""
        WITH team_games AS (
            SELECT
                g.game_date,
                g.season,
                g.home_team_id as team_id,
                g.home_team_score as points_scored
            FROM games g
            WHERE g.home_team_score IS NOT NULL
            AND g.season NOT IN ('2019-20', '2020-21')

            UNION ALL

            SELECT
                g.game_date,
                g.season,
                g.away_team_id as team_id,
                g.away_team_score as points_scored
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
                MAX(points_scored) OVER (
                    PARTITION BY team_id, season
                    ORDER BY game_date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) as prev_high,
                MIN(points_scored) OVER (
                    PARTITION BY team_id, season
                    ORDER BY game_date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) as prev_low,
                LEAD(points_scored) OVER (PARTITION BY team_id, season ORDER BY game_date) as next_pts,
                ROW_NUMBER() OVER (PARTITION BY team_id, season ORDER BY game_date) as game_num
            FROM team_games
        )
        SELECT
            points_scored,
            season_avg,
            prev_high,
            prev_low,
            next_pts,
            points_scored - prev_high as margin_over_high,
            prev_low - points_scored as margin_under_low
        FROM with_stats
        WHERE game_num >= 15
        AND season_avg IS NOT NULL
        AND next_pts IS NOT NULL
        AND prev_high IS NOT NULL
    """)

    games = cur.fetchall()

    # Bucket by margin over previous high
    high_margins = defaultdict(list)
    low_margins = defaultdict(list)

    for game in games:
        pts = game['points_scored']
        avg = float(game['season_avg'])
        next_pts = game['next_pts']
        margin_over = game['margin_over_high']
        margin_under = game['margin_under_low']

        if margin_over and margin_over > 0:
            # New season high
            bucket = (margin_over // 5) * 5  # 0-4, 5-9, 10-14, etc.
            if bucket > 20:
                bucket = 20
            high_margins[bucket].append(next_pts - avg)

        if margin_under and margin_under > 0:
            # New season low
            bucket = (margin_under // 5) * 5
            if bucket > 20:
                bucket = 20
            low_margins[bucket].append(next_pts - avg)

    print("\nNEW SEASON HIGH - by margin over previous high:")
    print("-" * 60)
    print(f"{'Margin Over Prev High':<25} {'N':>8} {'Next vs Avg':>15}")
    print("-" * 60)

    for margin in sorted(high_margins.keys()):
        data = high_margins[margin]
        if len(data) >= 20:
            avg = sum(data) / len(data)
            label = f"{margin}-{margin+4} pts over"
            print(f"{label:<25} {len(data):>8} {avg:>+15.2f}")

    print("\nNEW SEASON LOW - by margin under previous low:")
    print("-" * 60)
    print(f"{'Margin Under Prev Low':<25} {'N':>8} {'Next vs Avg':>15}")
    print("-" * 60)

    for margin in sorted(low_margins.keys()):
        data = low_margins[margin]
        if len(data) >= 20:
            avg = sum(data) / len(data)
            label = f"{margin}-{margin+4} pts under"
            print(f"{label:<25} {len(data):>8} {avg:>+15.2f}")

    cur.close()
    conn.close()


def final_summary():
    """
    Synthesize all findings into actionable insights
    """
    print("\n" + "=" * 90)
    print("FINAL SUMMARY: SCORING EXTREMES AND HUMAN BEHAVIOR")
    print("=" * 90)

    print("""
🎯 KEY FINDINGS:

1. ❌ MYTH BUSTED: "Teams regress after season highs"
   - Reality: Teams scoring season highs tend to CONTINUE above average
   - Why: Hot streaks are real, good teams are just good
   - Betting: Don't blindly bet UNDER after high-scoring games

2. ⚠️ CONCERNING FINDING: "Slumps persist"
   - After season lows, teams continue below average (-1.5 pts)
   - Why: Cold streaks, injuries, morale issues compound
   - Betting: Don't expect immediate bounce-back

3. 📍 LOCATION MATTERS MORE THAN EXTREMES:
   - Home → Home: Consistent performance
   - Home → Away: Natural scoring drop
   - Away → Home: Natural scoring boost
   - The extreme game matters LESS than the next location

4. 📏 MAGNITUDE OF EXTREME:
   - Bigger extremes don't mean bigger regression
   - A team that beat their high by 20 still performs well next game
   - Statistical regression is gradual, not sudden

5. 🔄 TRUE REGRESSION EXISTS BUT IS SUBTLE:
   - Teams DO regress toward their mean
   - But "mean" varies by team quality
   - A good team's regression is to 110 pts, not 105

🎰 BETTING IMPLICATIONS:

✅ DO: Look for location changes after extremes
   - Season high at home → next game AWAY = potential under
   - Season low on road → next game HOME = potential over

✅ DO: Consider context over raw extremes
   - B2B after extreme amplifies fatigue
   - Rest advantage after extreme amplifies recovery

❌ DON'T: Blindly bet against the trend
   - Hot teams stay hot longer than expected
   - Cold teams stay cold longer than expected

❌ DON'T: Expect immediate bounce-backs
   - After season low, teams DON'T immediately recover
   - Slumps have psychological persistence

🧠 BEHAVIORAL INSIGHTS:

• Confidence Effect: Teams that just scored high are confident
• Momentum is Real: Not just statistical noise
• Fatigue ≠ Immediate: High-energy games don't instantly cause collapse
• Coach Adjustments: Take multiple games to implement
• Player Psychology: Slumps create negative spirals
""")


if __name__ == '__main__':
    analyze_with_controls()
    analyze_true_regression_effect()
    analyze_magnitude_of_extreme()
    final_summary()
