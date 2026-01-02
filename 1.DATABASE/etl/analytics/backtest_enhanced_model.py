#!/usr/bin/env python3
"""
Backtest Enhanced Totals Model on 2025-26 Season Data

Validates the enhanced model's predictions against actual game results.
Calculates accuracy metrics, signal performance, and ROI simulation.
"""

import os
import sys
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional
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
    closing_line: float
    model_projection: float
    model_adjustment: float
    signal: str  # OVER, UNDER, LEAN_OVER, LEAN_UNDER, HOLD
    actual_total: int
    line_result: str  # OVER, UNDER, PUSH
    bet_result: Optional[str]  # WIN, LOSS, PUSH, NO_BET
    edge: float  # model_projection - closing_line


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


def get_closing_line(cur, game_id: str) -> Optional[float]:
    """Get closing total line for a game from multiple sources"""
    # Try betting_lines table first (2025-26 data)
    cur.execute("""
        SELECT total
        FROM betting_lines
        WHERE game_id = %s AND total IS NOT NULL
        ORDER BY is_closing_line DESC, recorded_at DESC
        LIMIT 1
    """, (game_id,))
    result = cur.fetchone()
    if result and result[0]:
        return float(result[0])

    # Try betting_odds via betting_events/betting_markets (historical data)
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
    if result and result[0]:
        return float(result[0])

    return None


def get_opening_line(cur, game_id: str) -> Optional[float]:
    """Get opening total line for a game"""
    # Try betting_odds with is_closing_line = False
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
    if result and result[0]:
        return float(result[0])
    return None


def get_lines(cur, game_id: str) -> tuple:
    """Get both opening and closing lines for a game"""
    return get_opening_line(cur, game_id), get_closing_line(cur, game_id)


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


def calculate_model_projection(cur, home_team: str, away_team: str, 
                                game_date: str, season: str) -> tuple:
    """
    Calculate model projection using simplified enhanced factors
    Returns (projection, adjustment, signal)
    """
    # Get team averages before game date
    home_stats = get_team_averages(cur, home_team, game_date, season)
    away_stats = get_team_averages(cur, away_team, game_date, season)
    
    # Base projection from team averages
    home_expected = (home_stats['ppg'] + away_stats['opp_ppg']) / 2
    away_expected = (away_stats['ppg'] + home_stats['opp_ppg']) / 2
    base_projection = home_expected + away_expected
    
    # Apply simplified adjustments
    adjustment = 0.0
    
    # 1. Pace adjustment (based on combined PPG)
    combined_pace = home_stats['ppg'] + away_stats['ppg']
    if combined_pace > 230:
        adjustment += 2.0  # High pace teams
    elif combined_pace < 210:
        adjustment -= 2.0  # Slow pace teams
    
    # 2. Home court adjustment
    adjustment += 1.5  # Home teams typically score slightly more
    
    # 3. Scoring variance (high scorers more likely to hit over)
    if home_stats['ppg'] > 115 or away_stats['ppg'] > 115:
        adjustment += 1.5
    
    # Final projection
    final_projection = base_projection + adjustment
    
    # Generate signal based on edge
    edge = adjustment  # Simplified: adjustment is our edge indicator
    if edge >= 5.0:
        signal = 'OVER'
    elif edge >= 2.5:
        signal = 'LEAN_OVER'
    elif edge <= -5.0:
        signal = 'UNDER'
    elif edge <= -2.5:
        signal = 'LEAN_UNDER'
    else:
        signal = 'HOLD'
    
    return final_projection, adjustment, signal


def run_backtest(season: str = '2025-26') -> list:
    """Run backtest on all completed games"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    games = get_completed_games(cur, season)
    results = []
    
    print(f"\n{'='*70}")
    print(f"BACKTESTING ENHANCED TOTALS MODEL - {season} SEASON")
    print(f"{'='*70}")
    print(f"\nAnalyzing {len(games)} completed games...")
    
    for game in games:
        game_id, game_date, home_team, away_team, home_score, away_score, actual_total = game
        matchup = f"{away_team} @ {home_team}"
        
        # Get closing line
        closing_line = get_closing_line(cur, game_id)
        if not closing_line:
            continue  # Skip games without lines
        
        # Calculate model projection
        projection, adjustment, signal = calculate_model_projection(
            cur, home_team, away_team, str(game_date), season
        )
        
        # Determine line result
        if actual_total > closing_line:
            line_result = 'OVER'
        elif actual_total < closing_line:
            line_result = 'UNDER'
        else:
            line_result = 'PUSH'
        
        # Determine bet result based on signal
        if signal == 'HOLD':
            bet_result = 'NO_BET'
        elif signal in ['OVER', 'LEAN_OVER']:
            if line_result == 'OVER':
                bet_result = 'WIN'
            elif line_result == 'UNDER':
                bet_result = 'LOSS'
            else:
                bet_result = 'PUSH'
        else:  # UNDER or LEAN_UNDER
            if line_result == 'UNDER':
                bet_result = 'WIN'
            elif line_result == 'OVER':
                bet_result = 'LOSS'
            else:
                bet_result = 'PUSH'
        
        edge = projection - closing_line
        
        results.append(BacktestResult(
            game_id=game_id,
            game_date=str(game_date),
            matchup=matchup,
            closing_line=closing_line,
            model_projection=projection,
            model_adjustment=adjustment,
            signal=signal,
            actual_total=actual_total,
            line_result=line_result,
            bet_result=bet_result,
            edge=edge
        ))
    
    cur.close()
    conn.close()
    
    return results


def analyze_results(results: list):
    """Analyze backtest results and print summary"""
    if not results:
        print("\n⚠️ No results to analyze (no games with betting lines found)")
        return
    
    print(f"\n{'='*70}")
    print("BACKTEST RESULTS ANALYSIS")
    print(f"{'='*70}")
    
    # 1. Overall Model Accuracy
    print(f"\n📊 MODEL ACCURACY ({len(results)} games with lines)")
    print("-" * 50)
    
    errors = [abs(r.model_projection - r.actual_total) for r in results]
    mae = sum(errors) / len(errors)
    
    line_errors = [abs(r.closing_line - r.actual_total) for r in results]
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
        print(f"  Wins:        {wins}")
        print(f"  Losses:      {losses}")
        print(f"  Pushes:      {pushes}")
        print(f"  Win Rate:    {win_rate:.1f}%")
        
        # ROI Simulation (-110 odds)
        profit = wins * 100 - losses * 110  # Win $100, lose $110
        roi = profit / (len(bets) * 110) * 100
        print(f"  Profit/Loss: ${profit:+.0f} (per $110 unit)")
        print(f"  ROI:         {roi:+.1f}%")
    
    # 3. Signal Performance Breakdown
    print(f"\n📈 SIGNAL PERFORMANCE BREAKDOWN")
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
    
    # 4. Edge Size Analysis
    print(f"\n📐 EDGE SIZE ANALYSIS")
    print("-" * 50)
    
    edge_buckets = [
        ("Large Edge (>5 pts)", lambda r: abs(r.edge) > 5),
        ("Medium Edge (2-5 pts)", lambda r: 2 <= abs(r.edge) <= 5),
        ("Small Edge (<2 pts)", lambda r: abs(r.edge) < 2),
    ]
    
    for bucket_name, bucket_filter in edge_buckets:
        bucket_results = [r for r in results if bucket_filter(r) and r.bet_result != 'NO_BET']
        if bucket_results:
            bucket_wins = sum(1 for r in bucket_results if r.bet_result == 'WIN')
            bucket_losses = sum(1 for r in bucket_results if r.bet_result == 'LOSS')
            wr = bucket_wins / (bucket_wins + bucket_losses) * 100 if (bucket_wins + bucket_losses) > 0 else 0
            emoji = '🟢' if wr > 52.4 else '🔴' if wr < 47.6 else '🟡'
            print(f"  {bucket_name:22} {len(bucket_results):3} bets | {bucket_wins:2}W-{bucket_losses:2}L | {wr:5.1f}% {emoji}")
    
    # 5. Recent Performance (last 20 games)
    print(f"\n📅 RECENT PERFORMANCE (Last 20 Games)")
    print("-" * 50)
    
    recent = sorted(results, key=lambda r: r.game_date, reverse=True)[:20]
    recent_bets = [r for r in recent if r.bet_result != 'NO_BET']
    recent_wins = sum(1 for r in recent_bets if r.bet_result == 'WIN')
    recent_losses = sum(1 for r in recent_bets if r.bet_result == 'LOSS')
    
    if recent_bets:
        recent_wr = recent_wins / (recent_wins + recent_losses) * 100 if (recent_wins + recent_losses) > 0 else 0
        print(f"  Recent Bets: {len(recent_bets)}")
        print(f"  Win Rate:    {recent_wr:.1f}%")
        
        # Show last 10 bets
        print(f"\n  Last 10 Betting Decisions:")
        for r in recent_bets[:10]:
            result_emoji = '✅' if r.bet_result == 'WIN' else '❌' if r.bet_result == 'LOSS' else '➖'
            print(f"    {result_emoji} {r.game_date} {r.matchup:15} | {r.signal:10} | "
                  f"Line:{r.closing_line:.1f} Actual:{r.actual_total}")
    
    # 6. Break-even analysis
    print(f"\n⚖️ BREAK-EVEN ANALYSIS")
    print("-" * 50)
    print(f"  Break-even at -110: 52.4%")
    if bets:
        print(f"  Current Win Rate:   {win_rate:.1f}%")
        print(f"  Status: {'✅ PROFITABLE' if win_rate > 52.4 else '❌ NOT PROFITABLE' if win_rate < 47.6 else '🟡 BREAK-EVEN ZONE'}")


def main():
    """Main entry point"""
    import sys

    # Allow season argument from command line
    season = sys.argv[1] if len(sys.argv) > 1 else '2022-23'

    print("=" * 70)
    print("ENHANCED TOTALS MODEL BACKTEST")
    print("=" * 70)

    results = run_backtest(season)
    analyze_results(results)

    print(f"\n{'='*70}")
    print("✅ Backtest completed!")
    print("=" * 70)


if __name__ == '__main__':
    main()
