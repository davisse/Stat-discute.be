#!/usr/bin/env python3
"""
Save ML totals predictions to database and update results.

Usage:
    python save_predictions.py              # Save tonight's predictions
    python save_predictions.py --update     # Update results for past predictions
    python save_predictions.py --history    # Show prediction history
"""

import os
import sys
import json
import argparse
from datetime import datetime, timedelta
from typing import Optional

import psycopg2
from psycopg2.extras import execute_values

# Add parent directory for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        port=os.environ.get('DB_PORT', '5432'),
        dbname=os.environ.get('DB_NAME', 'nba_stats'),
        user=os.environ.get('DB_USER', 'chapirou'),
        password=os.environ.get('DB_PASSWORD', '')
    )


def save_predictions(predictions: dict) -> int:
    """Save predictions to database. Returns count of saved predictions."""
    conn = get_db_connection()
    cur = conn.cursor()

    prediction_date = datetime.strptime(predictions['date'], '%Y-%m-%d').date()
    threshold = predictions['modelInfo']['confidenceThreshold']

    saved = 0
    for game in predictions['games']:
        # Check if prediction already exists
        cur.execute("""
            SELECT id FROM ml_totals_predictions
            WHERE game_id = %s AND prediction_date = %s
        """, (game['gameId'], prediction_date))

        if cur.fetchone():
            # Update existing prediction
            cur.execute("""
                UPDATE ml_totals_predictions SET
                    line = %s,
                    prediction = %s,
                    confidence = %s,
                    logistic_prob = %s,
                    xgboost_prob = %s,
                    ensemble_prob = %s,
                    expected_value = %s,
                    odds = %s,
                    is_high_confidence = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE game_id = %s AND prediction_date = %s
            """, (
                game['line'],
                game['prediction'],
                game['confidence'],
                game['logisticProb'],
                game['xgboostProb'],
                (game['logisticProb'] + game['xgboostProb']) / 2,  # ensemble
                game['expectedValue'],
                game['odds'],
                game['confidence'] >= threshold,
                game['gameId'],
                prediction_date
            ))
        else:
            # Insert new prediction
            cur.execute("""
                INSERT INTO ml_totals_predictions
                (game_id, prediction_date, line, prediction, confidence,
                 logistic_prob, xgboost_prob, ensemble_prob, expected_value, odds, is_high_confidence)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                game['gameId'],
                prediction_date,
                game['line'],
                game['prediction'],
                game['confidence'],
                game['logisticProb'],
                game['xgboostProb'],
                (game['logisticProb'] + game['xgboostProb']) / 2,
                game['expectedValue'],
                game['odds'],
                game['confidence'] >= threshold
            ))
        saved += 1

    conn.commit()
    cur.close()
    conn.close()
    return saved


def update_results() -> dict:
    """Update results for predictions where games have been played."""
    conn = get_db_connection()
    cur = conn.cursor()

    # Find predictions without results where game has scores
    cur.execute("""
        SELECT p.id, p.game_id, p.line, p.prediction,
               g.home_team_score + g.away_team_score as actual_total
        FROM ml_totals_predictions p
        JOIN games g ON p.game_id = g.game_id
        WHERE p.result IS NULL
        AND g.home_team_score IS NOT NULL
        AND g.away_team_score IS NOT NULL
    """)

    results = {'updated': 0, 'wins': 0, 'losses': 0, 'pushes': 0}

    for row in cur.fetchall():
        pred_id, game_id, line, prediction, actual_total = row

        # Determine result
        if actual_total == line:
            result = 'PUSH'
            results['pushes'] += 1
        elif prediction == 'OVER':
            result = 'WIN' if actual_total > line else 'LOSS'
        else:  # UNDER
            result = 'WIN' if actual_total < line else 'LOSS'

        if result == 'WIN':
            results['wins'] += 1
        elif result == 'LOSS':
            results['losses'] += 1

        # Update prediction
        cur.execute("""
            UPDATE ml_totals_predictions
            SET actual_total = %s, result = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (actual_total, result, pred_id))
        results['updated'] += 1

    conn.commit()
    cur.close()
    conn.close()
    return results


def get_history(days: int = 7) -> dict:
    """Get prediction history for the last N days."""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            p.prediction_date,
            at.abbreviation || ' @ ' || ht.abbreviation as matchup,
            p.prediction,
            p.line,
            p.confidence,
            p.is_high_confidence,
            p.actual_total,
            p.result,
            p.expected_value,
            p.odds
        FROM ml_totals_predictions p
        JOIN games g ON p.game_id = g.game_id
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE p.prediction_date >= CURRENT_DATE - %s
        ORDER BY p.prediction_date DESC, p.confidence DESC
    """, (days,))

    predictions = []
    for row in cur.fetchall():
        predictions.append({
            'date': row[0].isoformat(),
            'matchup': row[1],
            'prediction': row[2],
            'line': float(row[3]),
            'confidence': float(row[4]),
            'is_high_confidence': row[5],
            'actual_total': row[6],
            'result': row[7],
            'expected_value': float(row[8]) if row[8] else None,
            'odds': float(row[9]) if row[9] else None
        })

    # Calculate summary stats
    cur.execute("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN result = 'WIN' THEN 1 ELSE 0 END) as wins,
            SUM(CASE WHEN result = 'LOSS' THEN 1 ELSE 0 END) as losses,
            SUM(CASE WHEN result = 'PUSH' THEN 1 ELSE 0 END) as pushes,
            SUM(CASE WHEN is_high_confidence AND result = 'WIN' THEN 1 ELSE 0 END) as hc_wins,
            SUM(CASE WHEN is_high_confidence AND result = 'LOSS' THEN 1 ELSE 0 END) as hc_losses
        FROM ml_totals_predictions
        WHERE prediction_date >= CURRENT_DATE - %s
        AND result IS NOT NULL
    """, (days,))

    stats = cur.fetchone()

    cur.close()
    conn.close()

    return {
        'predictions': predictions,
        'summary': {
            'total': stats[0] or 0,
            'wins': stats[1] or 0,
            'losses': stats[2] or 0,
            'pushes': stats[3] or 0,
            'hc_wins': stats[4] or 0,
            'hc_losses': stats[5] or 0
        }
    }


def main():
    parser = argparse.ArgumentParser(description='Save ML predictions to database')
    parser.add_argument('--update', action='store_true', help='Update results for past predictions')
    parser.add_argument('--history', action='store_true', help='Show prediction history')
    parser.add_argument('--days', type=int, default=7, help='Days of history to show')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    args = parser.parse_args()

    if args.update:
        results = update_results()
        if args.json:
            print(json.dumps(results))
        else:
            print(f"✅ Updated {results['updated']} predictions")
            print(f"   Wins: {results['wins']} | Losses: {results['losses']} | Pushes: {results['pushes']}")

    elif args.history:
        history = get_history(args.days)
        if args.json:
            print(json.dumps(history))
        else:
            print(f"\n📊 PREDICTION HISTORY (Last {args.days} days)")
            print("=" * 80)

            summary = history['summary']
            if summary['total'] > 0:
                win_pct = summary['wins'] / (summary['wins'] + summary['losses']) * 100 if (summary['wins'] + summary['losses']) > 0 else 0
                print(f"Overall: {summary['wins']}-{summary['losses']}-{summary['pushes']} ({win_pct:.1f}%)")

                hc_total = summary['hc_wins'] + summary['hc_losses']
                if hc_total > 0:
                    hc_pct = summary['hc_wins'] / hc_total * 100
                    print(f"High Confidence: {summary['hc_wins']}-{summary['hc_losses']} ({hc_pct:.1f}%)")

            print("\n" + "-" * 80)
            print(f"{'DATE':<12} {'MATCHUP':<12} {'PICK':<6} {'LINE':>7} {'CONF':>7} {'ACTUAL':>7} {'RESULT':>7}")
            print("-" * 80)

            for p in history['predictions']:
                hc = '🔥' if p['is_high_confidence'] else '  '
                actual = str(p['actual_total']) if p['actual_total'] else '-'
                result = p['result'] or '-'
                result_emoji = '✅' if result == 'WIN' else '❌' if result == 'LOSS' else '➖' if result == 'PUSH' else ''
                print(f"{p['date']:<12} {p['matchup']:<12} {p['prediction']:<6} {p['line']:>7.1f} {p['confidence']*100:>6.1f}% {actual:>7} {result_emoji}{result:>6} {hc}")

    else:
        # Save tonight's predictions
        # Run predict_tonight.py as subprocess
        import subprocess

        script_dir = os.path.dirname(os.path.abspath(__file__))
        venv_python = os.path.join(script_dir, 'venv', 'bin', 'python')
        predict_script = os.path.join(script_dir, 'predict_tonight.py')

        result = subprocess.run(
            [venv_python, predict_script, '--json'],
            capture_output=True,
            text=True,
            cwd=script_dir,
            env={**os.environ, 'PYTHONPATH': os.path.dirname(script_dir)}
        )

        if result.returncode != 0:
            print(f"❌ Error running predictions: {result.stderr}")
            sys.exit(1)

        try:
            predictions = json.loads(result.stdout.strip())
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing predictions JSON: {e}")
            print(f"   Output: {result.stdout[:500]}")
            sys.exit(1)

        if 'error' in predictions:
            print(f"❌ Error: {predictions['error']}")
            sys.exit(1)

        saved = save_predictions(predictions)

        if args.json:
            print(json.dumps({'saved': saved, 'date': predictions['date'], 'games': len(predictions['games'])}))
        else:
            print(f"✅ Saved {saved} predictions for {predictions['date']}")
            print(f"   High confidence picks: {len(predictions['highConfidencePicks'])}")


if __name__ == '__main__':
    main()
