#!/usr/bin/env python3
"""
Backtest Integrated Totals Model with Enhanced Factors

Integrates:
- Defense stats (Defensive Rating)
- Shooting profiles (Three-heavy vs Mid-heavy, Scoring Variance)
- Hustle stats (Hustle Intensity Score)

Validates against historical game results with opening line focus.
"""

import os
import sys
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict
import psycopg2
from dotenv import load_dotenv

# Load environment
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))


@dataclass
class BacktestResult:
    """Single game backtest result"""
    game_id: str
    game_date: str
    matchup: str
    line: float
    line_type: str  # 'opening' or 'closing'
    model_projection: float
    adjustments: Dict[str, float]
    signal: str
    actual_total: int
    line_result: str
    bet_result: Optional[str]
    edge: float


def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )


def get_completed_games(cur, season: str = '2025-26') -> list:
    """Get all completed games with scores for backtesting"""
    cur.execute("""
        SELECT
            g.game_id,
            g.game_date,
            ht.abbreviation as home_team,
            at.abbreviation as away_team,
            g.home_team_id,
            g.away_team_id,
            g.home_team_score,
            g.away_team_score,
            g.home_team_score + g.away_team_score as actual_total
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE g.season = %s
          AND g.game_status = 'Final'
          AND g.home_team_score IS NOT NULL
          AND g.away_team_score IS NOT NULL
        ORDER BY g.game_date
    """, (season,))
    return cur.fetchall()


def get_opening_line(cur, game_id: str) -> Optional[float]:
    """Get opening total line for a game"""
    cur.execute("""
        SELECT bo.handicap
        FROM betting_odds bo
        JOIN betting_markets bm ON bo.market_id = bm.market_id
        JOIN betting_events be ON bm.event_id = be.event_id
        WHERE be.game_id = %s
          AND bm.market_type = 'total'
          AND bo.selection = 'Over'
          AND bo.handicap IS NOT NULL
          AND bo.is_closing_line = FALSE
        LIMIT 1
    """, (game_id,))
    result = cur.fetchone()
    return float(result[0]) if result and result[0] else None


def get_closing_line(cur, game_id: str) -> Optional[float]:
    """Get closing total line for a game"""
    # Try betting_lines first
    cur.execute("""
        SELECT total FROM betting_lines
        WHERE game_id = %s AND total IS NOT NULL
        ORDER BY is_closing_line DESC, recorded_at DESC
        LIMIT 1
    """, (game_id,))
    result = cur.fetchone()
    if result and result[0]:
        return float(result[0])

    # Try betting_odds
    cur.execute("""
        SELECT bo.handicap
        FROM betting_odds bo
        JOIN betting_markets bm ON bo.market_id = bm.market_id
        JOIN betting_events be ON bm.event_id = be.event_id
        WHERE be.game_id = %s
          AND bm.market_type = 'total'
          AND bo.selection = 'Over'
          AND bo.handicap IS NOT NULL
        ORDER BY bo.is_closing_line DESC
        LIMIT 1
    """, (game_id,))
    result = cur.fetchone()
    return float(result[0]) if result and result[0] else None


def get_team_averages(cur, team_abbr: str, before_date: str, season: str) -> dict:
    """Get team scoring averages before a specific date"""
    cur.execute("""
        SELECT
            AVG(CASE WHEN ht.abbreviation = %s THEN g.home_team_score
                     WHEN at.abbreviation = %s THEN g.away_team_score END) as team_ppg,
            AVG(CASE WHEN ht.abbreviation = %s THEN g.away_team_score
                     WHEN at.abbreviation = %s THEN g.home_team_score END) as opp_ppg
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE g.season = %s
          AND g.game_status = 'Final'
          AND g.game_date < %s
          AND (ht.abbreviation = %s OR at.abbreviation = %s)
    """, (team_abbr, team_abbr, team_abbr, team_abbr, season, before_date, team_abbr, team_abbr))
    result = cur.fetchone()
    return {
        'ppg': float(result[0]) if result[0] else 110.0,
        'opp_ppg': float(result[1]) if result[1] else 110.0
    }


def get_defense_stats(cur, team_id: int, season: str) -> dict:
    """Get team defensive stats from team_defense_stats or estimate from games"""
    # First try to get from advanced stats/calculated data
    # Since we only have season-level data in the new tables, we use league averages
    # For historical backtesting, calculate from game results

    cur.execute("""
        SELECT
            AVG(opponent_score) as opp_ppg,
            COUNT(*) as games
        FROM (
            SELECT
                CASE WHEN g.home_team_id = %s THEN g.away_team_score
                     ELSE g.home_team_score END as opponent_score
            FROM games g
            WHERE g.season = %s
              AND g.game_status = 'Final'
              AND (g.home_team_id = %s OR g.away_team_id = %s)
        ) subq
    """, (team_id, season, team_id, team_id))
    result = cur.fetchone()

    opp_ppg = float(result[0]) if result and result[0] else 112.0
    games = result[1] if result else 0

    # Estimate defensive rating (points allowed per 100 possessions)
    # Simple estimation: DEF_RATING ~= OPP_PPG * (100 / avg_possessions)
    # Avg possessions ~= 100, so DEF_RATING ~= OPP_PPG
    def_rating = opp_ppg

    # Classify defense tier
    if def_rating <= 108.0:
        tier = 'elite'
    elif def_rating <= 112.0:
        tier = 'good'
    elif def_rating <= 116.0:
        tier = 'average'
    else:
        tier = 'poor'

    return {
        'def_rating': def_rating,
        'opp_ppg': opp_ppg,
        'tier': tier,
        'games': games
    }


def get_shooting_profile(cur, team_id: int, season: str) -> dict:
    """Get team shooting profile from team_shooting_averages"""
    cur.execute("""
        SELECT shot_profile, scoring_variance, avg_three_freq
        FROM team_shooting_averages
        WHERE team_id = %s AND season = %s
    """, (team_id, season))
    result = cur.fetchone()

    if result:
        return {
            'profile': result[0],
            'variance': float(result[1]) if result[1] else 10.0,
            'three_freq': float(result[2]) if result[2] else 0.35
        }

    # Default if not found
    return {
        'profile': 'balanced',
        'variance': 10.0,
        'three_freq': 0.35
    }


def get_hustle_stats(cur, team_id: int, season: str) -> dict:
    """Get team hustle stats from team_hustle_averages"""
    cur.execute("""
        SELECT hustle_intensity_score, hustle_tier, avg_deflections, avg_contested_shots
        FROM team_hustle_averages
        WHERE team_id = %s AND season = %s
    """, (team_id, season))
    result = cur.fetchone()

    if result:
        return {
            'intensity_score': float(result[0]) if result[0] else 50.0,
            'tier': result[1] or 'medium',
            'deflections': float(result[2]) if result[2] else 16.0,
            'contested_shots': float(result[3]) if result[3] else 55.0
        }

    # Default if not found
    return {
        'intensity_score': 50.0,
        'tier': 'medium',
        'deflections': 16.0,
        'contested_shots': 55.0
    }


def calculate_integrated_projection(cur, home_team: str, away_team: str,
                                     home_team_id: int, away_team_id: int,
                                     game_date: str, season: str) -> tuple:
    """
    Calculate model projection using integrated enhanced factors

    Factors:
    1. Base scoring (team PPG + opponent PPG allowed)
    2. Pace adjustment (combined PPG)
    3. Defense matchup (DEF_RATING differential)
    4. Shooting profile (variance, three-heavy impact)
    5. Hustle intensity (defensive effort indicator)
    6. Home court advantage

    Returns (projection, adjustments_dict, signal)
    """
    # Get base team stats
    home_stats = get_team_averages(cur, home_team, game_date, season)
    away_stats = get_team_averages(cur, away_team, game_date, season)

    # Get enhanced stats (use current season data if available)
    home_defense = get_defense_stats(cur, home_team_id, season)
    away_defense = get_defense_stats(cur, away_team_id, season)
    home_shooting = get_shooting_profile(cur, home_team_id, '2025-26')  # Current season profiles
    away_shooting = get_shooting_profile(cur, away_team_id, '2025-26')
    home_hustle = get_hustle_stats(cur, home_team_id, '2025-26')
    away_hustle = get_hustle_stats(cur, away_team_id, '2025-26')

    # Initialize adjustments tracking
    adjustments = {}

    # 1. BASE PROJECTION
    home_expected = (home_stats['ppg'] + away_stats['opp_ppg']) / 2
    away_expected = (away_stats['ppg'] + home_stats['opp_ppg']) / 2
    base_projection = home_expected + away_expected
    adjustments['base'] = 0.0

    total_adjustment = 0.0

    # 2. PACE ADJUSTMENT
    combined_pace = home_stats['ppg'] + away_stats['ppg']
    if combined_pace > 230:
        pace_adj = 2.5
    elif combined_pace > 220:
        pace_adj = 1.0
    elif combined_pace < 210:
        pace_adj = -2.0
    elif combined_pace < 215:
        pace_adj = -1.0
    else:
        pace_adj = 0.0
    adjustments['pace'] = pace_adj
    total_adjustment += pace_adj

    # 3. DEFENSE MATCHUP ADJUSTMENT
    # Elite defense vs poor offense = UNDER, Poor defense vs elite offense = OVER
    avg_def_rating = (home_defense['def_rating'] + away_defense['def_rating']) / 2
    league_avg_def = 112.0

    # Positive if defenses are worse than average (more points expected)
    # Negative if defenses are better than average (fewer points expected)
    def_adj = (avg_def_rating - league_avg_def) * 0.3  # 0.3 pts per point of def rating
    adjustments['defense'] = def_adj
    total_adjustment += def_adj

    # 4. SHOOTING PROFILE ADJUSTMENT
    # Three-heavy matchups have higher variance - trust the line less
    # If both teams are three-heavy, increase uncertainty
    home_variance = home_shooting['variance']
    away_variance = away_shooting['variance']
    combined_variance = (home_variance + away_variance) / 2

    # High variance teams: more scoring variance, slight OVER bias
    if combined_variance > 11.5:
        var_adj = 1.0
    elif combined_variance < 9.5:
        var_adj = -0.5
    else:
        var_adj = 0.0
    adjustments['shooting_variance'] = var_adj
    total_adjustment += var_adj

    # 5. HUSTLE INTENSITY ADJUSTMENT
    # High hustle = better defense = UNDER tendency
    avg_hustle = (home_hustle['intensity_score'] + away_hustle['intensity_score']) / 2
    league_avg_hustle = 55.0

    # Negative if hustle is above average (fewer points expected)
    hustle_adj = (league_avg_hustle - avg_hustle) * 0.1
    adjustments['hustle'] = hustle_adj
    total_adjustment += hustle_adj

    # 6. HOME COURT ADJUSTMENT
    home_adj = 1.5
    adjustments['home_court'] = home_adj
    total_adjustment += home_adj

    # 7. HIGH SCORER BOOST
    if home_stats['ppg'] > 115 or away_stats['ppg'] > 115:
        scorer_adj = 1.5
    else:
        scorer_adj = 0.0
    adjustments['high_scorer'] = scorer_adj
    total_adjustment += scorer_adj

    # FINAL PROJECTION
    final_projection = base_projection + total_adjustment
    adjustments['total'] = total_adjustment

    # GENERATE SIGNAL
    # Use total adjustment as edge indicator
    # Larger adjustments = stronger signal
    if total_adjustment >= 5.0:
        signal = 'OVER'
    elif total_adjustment >= 3.0:
        signal = 'LEAN_OVER'
    elif total_adjustment <= -5.0:
        signal = 'UNDER'
    elif total_adjustment <= -3.0:
        signal = 'LEAN_UNDER'
    else:
        signal = 'HOLD'

    return final_projection, adjustments, signal


def run_backtest(season: str = '2022-23', use_opening_lines: bool = True) -> list:
    """Run backtest on all completed games"""
    conn = get_db_connection()
    cur = conn.cursor()

    games = get_completed_games(cur, season)
    results = []
    skipped_no_lines = 0

    print(f"\n{'='*70}")
    print(f"INTEGRATED TOTALS MODEL BACKTEST - {season} SEASON")
    print(f"Line Type: {'Opening' if use_opening_lines else 'Closing'}")
    print(f"{'='*70}")
    print(f"\nAnalyzing {len(games)} completed games...")

    for game in games:
        game_id, game_date, home_team, away_team, home_team_id, away_team_id, \
            home_score, away_score, actual_total = game
        matchup = f"{away_team} @ {home_team}"

        # Get line (prefer opening if requested)
        if use_opening_lines:
            line = get_opening_line(cur, game_id)
            line_type = 'opening'
            if not line:
                line = get_closing_line(cur, game_id)
                line_type = 'closing'
        else:
            line = get_closing_line(cur, game_id)
            line_type = 'closing'

        if not line:
            skipped_no_lines += 1
            continue

        # Calculate integrated model projection
        projection, adjustments, signal = calculate_integrated_projection(
            cur, home_team, away_team, home_team_id, away_team_id,
            str(game_date), season
        )

        # Determine line result
        if actual_total > line:
            line_result = 'OVER'
        elif actual_total < line:
            line_result = 'UNDER'
        else:
            line_result = 'PUSH'

        # Determine bet result
        if signal == 'HOLD':
            bet_result = 'NO_BET'
        elif signal in ['OVER', 'LEAN_OVER']:
            if line_result == 'OVER':
                bet_result = 'WIN'
            elif line_result == 'UNDER':
                bet_result = 'LOSS'
            else:
                bet_result = 'PUSH'
        else:
            if line_result == 'UNDER':
                bet_result = 'WIN'
            elif line_result == 'OVER':
                bet_result = 'LOSS'
            else:
                bet_result = 'PUSH'

        edge = projection - line

        results.append(BacktestResult(
            game_id=game_id,
            game_date=str(game_date),
            matchup=matchup,
            line=line,
            line_type=line_type,
            model_projection=projection,
            adjustments=adjustments,
            signal=signal,
            actual_total=actual_total,
            line_result=line_result,
            bet_result=bet_result,
            edge=edge
        ))

    cur.close()
    conn.close()

    if skipped_no_lines > 0:
        print(f"  (Skipped {skipped_no_lines} games without betting lines)")

    return results


def analyze_results(results: list):
    """Analyze backtest results and print summary"""
    if not results:
        print("\n⚠️ No results to analyze")
        return

    print(f"\n{'='*70}")
    print("INTEGRATED MODEL RESULTS")
    print(f"{'='*70}")

    # 1. Overall Model Accuracy
    print(f"\n📊 MODEL ACCURACY ({len(results)} games)")
    print("-" * 50)

    errors = [abs(r.model_projection - r.actual_total) for r in results]
    mae = sum(errors) / len(errors)

    line_errors = [abs(r.line - r.actual_total) for r in results]
    line_mae = sum(line_errors) / len(line_errors)

    print(f"  Model MAE:  {mae:.2f} pts")
    print(f"  Line MAE:   {line_mae:.2f} pts")
    print(f"  Difference: {line_mae - mae:+.2f} pts {'(Model Better)' if mae < line_mae else '(Line Better)'}")

    # 2. Betting Performance
    print(f"\n💰 BETTING PERFORMANCE")
    print("-" * 50)

    bets = [r for r in results if r.bet_result != 'NO_BET']
    wins = sum(1 for r in bets if r.bet_result == 'WIN')
    losses = sum(1 for r in bets if r.bet_result == 'LOSS')
    pushes = sum(1 for r in bets if r.bet_result == 'PUSH')

    if bets:
        win_rate = wins / (wins + losses) * 100 if (wins + losses) > 0 else 0
        print(f"  Total Bets:  {len(bets)}")
        print(f"  Record:      {wins}W-{losses}L-{pushes}P")
        print(f"  Win Rate:    {win_rate:.1f}%")

        profit = wins * 100 - losses * 110
        roi = profit / (len(bets) * 110) * 100
        print(f"  Profit/Loss: ${profit:+.0f}")
        print(f"  ROI:         {roi:+.1f}%")

        status = '✅ PROFITABLE' if win_rate > 52.4 else '🟡 BREAK-EVEN' if win_rate >= 50 else '❌ LOSING'
        print(f"  Status:      {status}")

    # 3. Signal Performance
    print(f"\n📈 SIGNAL BREAKDOWN")
    print("-" * 50)

    for signal in ['OVER', 'LEAN_OVER', 'LEAN_UNDER', 'UNDER', 'HOLD']:
        signal_results = [r for r in results if r.signal == signal]
        if signal_results:
            signal_bets = [r for r in signal_results if r.bet_result != 'NO_BET']
            signal_wins = sum(1 for r in signal_bets if r.bet_result == 'WIN')
            signal_losses = sum(1 for r in signal_bets if r.bet_result == 'LOSS')
            wr = signal_wins / (signal_wins + signal_losses) * 100 if (signal_wins + signal_losses) > 0 else 0

            emoji = '🟢' if wr > 52.4 else '🔴' if wr < 47.6 else '🟡'
            print(f"  {signal:12} {len(signal_results):3} games | {signal_wins:2}W-{signal_losses:2}L | {wr:5.1f}% {emoji}")

    # 4. Factor Contribution Analysis
    print(f"\n🔬 FACTOR ANALYSIS (Avg Adjustments)")
    print("-" * 50)

    factors = ['pace', 'defense', 'shooting_variance', 'hustle', 'home_court', 'high_scorer']
    for factor in factors:
        avg_adj = sum(r.adjustments.get(factor, 0) for r in results) / len(results)
        # Analyze factor performance for winning vs losing bets
        winning_bets = [r for r in bets if r.bet_result == 'WIN']
        losing_bets = [r for r in bets if r.bet_result == 'LOSS']

        win_avg = sum(abs(r.adjustments.get(factor, 0)) for r in winning_bets) / len(winning_bets) if winning_bets else 0
        loss_avg = sum(abs(r.adjustments.get(factor, 0)) for r in losing_bets) / len(losing_bets) if losing_bets else 0

        indicator = '↑' if win_avg > loss_avg else '↓' if loss_avg > win_avg else '='
        print(f"  {factor:18} avg: {avg_adj:+.2f} | wins: {win_avg:.2f} vs losses: {loss_avg:.2f} {indicator}")

    return win_rate if bets else 0


def main():
    """Main entry point"""
    seasons = ['2022-23', '2021-22', '2020-21', '2019-20']

    print("=" * 70)
    print("INTEGRATED TOTALS MODEL - MULTI-SEASON BACKTEST")
    print("Factors: Defense + Shooting + Hustle + Pace + Home Court")
    print("=" * 70)

    all_results = {'opening': [], 'closing': []}

    for season in seasons:
        print(f"\n{'='*70}")
        print(f"SEASON: {season}")
        print(f"{'='*70}")

        # Test with opening lines
        results_open = run_backtest(season, use_opening_lines=True)
        wr_open = analyze_results(results_open)
        all_results['opening'].extend(results_open)

    # Aggregate results
    print(f"\n{'='*70}")
    print("AGGREGATE RESULTS (All Seasons)")
    print(f"{'='*70}")

    for line_type in ['opening']:
        results = all_results[line_type]
        if not results:
            continue

        bets = [r for r in results if r.bet_result != 'NO_BET']
        wins = sum(1 for r in bets if r.bet_result == 'WIN')
        losses = sum(1 for r in bets if r.bet_result == 'LOSS')

        if bets:
            win_rate = wins / (wins + losses) * 100
            profit = wins * 100 - losses * 110
            roi = profit / (len(bets) * 110) * 100

            print(f"\n{line_type.upper()} LINES ({len(bets)} bets):")
            print(f"  Record:   {wins}W-{losses}L = {win_rate:.1f}%")
            print(f"  ROI:      {roi:+.1f}%")
            print(f"  Status:   {'✅ PROFITABLE' if win_rate > 52.4 else '🟡 BREAK-EVEN' if win_rate >= 50 else '❌ LOSING'}")

    print(f"\n{'='*70}")
    print("✅ Multi-season backtest completed!")
    print("=" * 70)


if __name__ == '__main__':
    main()
