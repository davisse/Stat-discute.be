#!/usr/bin/env python3
"""
Generate ML predictions for tonight's NBA games.

Usage:
    python predict_tonight.py          # Human-readable output
    python predict_tonight.py --json   # JSON output for API consumption
"""

import os
import sys
import logging
import warnings
import argparse
import json
import numpy as np
import pandas as pd
import psycopg2
from datetime import datetime

# Add parent for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.feature_engineering import FeatureEngineer
from ml.models.baseline import LogisticModel
from ml.models.gradient_boosting import XGBoostModel
from ml.data_loader import DataLoader

warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
CONFIDENCE_THRESHOLD = 0.58

def get_tonight_games():
    """Get tonight's games with betting lines."""
    conn = psycopg2.connect(
        host="localhost",
        database="nba_stats",
        user="chapirou",
        password=""
    )
    cur = conn.cursor()

    # Get main line for each game (closest to 1.90/1.90)
    cur.execute("""
        WITH all_lines AS (
            SELECT
                g.game_id,
                g.home_team_id,
                g.away_team_id,
                g.season,
                at.abbreviation || ' @ ' || ht.abbreviation as matchup,
                CAST(REGEXP_REPLACE(bm.market_name, '.*Total ([0-9.]+).*', '\\1') AS NUMERIC) as total_line,
                MAX(CASE WHEN bo.selection LIKE 'Over%%' THEN bo.odds_decimal END) as over_odds,
                MAX(CASE WHEN bo.selection LIKE 'Under%%' THEN bo.odds_decimal END) as under_odds
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            JOIN betting_events be ON g.game_id = be.game_id
            JOIN betting_markets bm ON be.event_id = bm.event_id
            JOIN betting_odds bo ON bm.market_id = bo.market_id
            WHERE g.game_date = CURRENT_DATE
            AND bm.market_name LIKE 'Game Game Total %%'
            AND bm.market_name NOT LIKE '%%Team Total%%'
            GROUP BY g.game_id, g.home_team_id, g.away_team_id, g.season, matchup, total_line
        ),
        ranked AS (
            SELECT *,
                ROW_NUMBER() OVER (PARTITION BY game_id ORDER BY ABS(over_odds - 1.90) + ABS(under_odds - 1.90)) as rn
            FROM all_lines
        )
        SELECT game_id, home_team_id, away_team_id, season, matchup, total_line, over_odds, under_odds
        FROM ranked
        WHERE rn = 1
        ORDER BY game_id
    """)

    games = []
    for row in cur.fetchall():
        games.append({
            'game_id': row[0],
            'home_team_id': row[1],
            'away_team_id': row[2],
            'season': row[3],
            'matchup': row[4],
            'total_line': float(row[5]),
            'over_odds': float(row[6]) if row[6] else 1.91,
            'under_odds': float(row[7]) if row[7] else 1.91
        })

    cur.close()
    conn.close()
    return games


def main():
    """Generate predictions for tonight."""
    # Parse arguments
    parser = argparse.ArgumentParser(description='Generate ML predictions for tonight\'s NBA games')
    parser.add_argument('--json', action='store_true', help='Output JSON instead of human-readable format')
    args = parser.parse_args()

    json_mode = args.json

    if not json_mode:
        print("\n" + "="*70)
        print("🏀 NBA TOTALS ML PREDICTIONS - " + datetime.now().strftime("%Y-%m-%d"))
        print("="*70)

    # Get tonight's games
    games = get_tonight_games()
    if not games:
        if json_mode:
            print(json.dumps({'error': 'No games with betting lines found for tonight', 'games': []}))
        else:
            print("\n❌ No games with betting lines found for tonight.")
        return

    if not json_mode:
        print(f"\n📋 Found {len(games)} games with betting lines:\n")
        for g in games:
            print(f"   {g['matchup']:15} | Line: {g['total_line']:.1f}")

    # Load training data (all historical data)
    if not json_mode:
        print("\n📊 Loading training data...")
    data_loader = DataLoader()

    # Get all available seasons
    available_seasons = data_loader.get_available_seasons()
    if not available_seasons:
        if json_mode:
            print(json.dumps({'error': 'No training data available', 'games': []}))
        else:
            print("❌ No training data available. Run capture_closing_lines.py and calculate_ou_results.py first.")
        return

    if not json_mode:
        print(f"   Available seasons: {', '.join(available_seasons)}")

    # Load all seasons
    X_train, y_train, game_info = data_loader.load_training_data(
        seasons=available_seasons,
        verbose=False
    )

    if len(X_train) == 0:
        if json_mode:
            print(json.dumps({'error': 'No training samples loaded', 'games': []}))
        else:
            print("❌ No training samples loaded")
        return

    feature_names = data_loader.get_feature_names()

    if not json_mode:
        print(f"   Training samples: {len(X_train)}")
        print(f"   Features: {len(feature_names)}")

    # Train Logistic Regression
    if not json_mode:
        print("\n🔧 Training Logistic Regression...")
    logistic = LogisticModel()
    logistic.fit(X_train, y_train, feature_names=feature_names)

    # Train XGBoost
    if not json_mode:
        print("🔧 Training XGBoost...")
    xgboost = XGBoostModel()
    xgboost.fit(X_train, y_train, feature_names=feature_names)

    # Generate features for tonight's games
    if not json_mode:
        print("\n📈 Generating predictions...\n")

    fe = FeatureEngineer()
    fe.connect()

    predictions = []

    for game in games:
        try:
            # Generate features
            gf = fe.generate_features(
                game_id=game['game_id'],
                game_date=datetime.now().strftime('%Y-%m-%d'),
                home_team_id=game['home_team_id'],
                away_team_id=game['away_team_id'],
                season=game['season']
            )

            if gf is None:
                logger.warning(f"No features generated for {game['matchup']}")
                continue

            features = gf.to_dict()
            if features is None or len(features) == 0:
                logger.warning(f"No features for {game['matchup']}")
                continue

            # Build feature vector in same order as training
            feature_vector = [features.get(name, 0.0) for name in feature_names]
            # Replace None/NaN with 0
            feature_vector = [0.0 if (v is None or (isinstance(v, float) and np.isnan(v))) else float(v) for v in feature_vector]
            X = np.array([feature_vector], dtype=np.float32)

            # Get predictions - predict_proba returns array of shape (n_samples, n_classes)
            log_proba = logistic.predict_proba(X)
            xgb_proba = xgboost.predict_proba(X)

            # Get probability of class 1 (OVER)
            log_prob = float(log_proba[0, 1]) if log_proba.ndim > 1 else float(log_proba[0])
            xgb_prob = float(xgb_proba[0, 1]) if xgb_proba.ndim > 1 else float(xgb_proba[0])

            # Average the models
            avg_prob = (log_prob + xgb_prob) / 2

            # Determine prediction
            confidence = max(avg_prob, 1 - avg_prob)
            prediction = 'OVER' if avg_prob > 0.5 else 'UNDER'

            odds = game['over_odds'] if prediction == 'OVER' else game['under_odds']
            ev = (confidence * (odds - 1)) - (1 - confidence)

            predictions.append({
                'gameId': game['game_id'],
                'matchup': game['matchup'],
                'line': game['total_line'],
                'prediction': prediction,
                'confidence': confidence,
                'probOver': avg_prob,
                'logisticProb': log_prob,
                'xgboostProb': xgb_prob,
                'overOdds': game['over_odds'],
                'underOdds': game['under_odds'],
                'odds': odds,
                'expectedValue': ev
            })

        except Exception as e:
            import traceback
            logger.error(f"Error processing {game['matchup']}: {e}")
            logger.error(traceback.format_exc())

    fe.close()

    # Sort predictions by confidence
    predictions = sorted(predictions, key=lambda x: -x['confidence'])

    # Filter high confidence
    high_conf = [p for p in predictions if p['confidence'] >= CONFIDENCE_THRESHOLD]

    # JSON output mode
    if json_mode:
        output = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'games': predictions,
            'highConfidencePicks': high_conf,
            'modelInfo': {
                'trainingSamples': len(X_train),
                'features': len(feature_names),
                'seasons': available_seasons,
                'confidenceThreshold': CONFIDENCE_THRESHOLD
            }
        }
        print(json.dumps(output))
        return

    # Human-readable output
    print("="*70)
    print("📊 ALL PREDICTIONS")
    print("="*70)
    print(f"{'Matchup':15} {'Line':>7} {'Pick':>6} {'Conf':>6} {'Log':>6} {'XGB':>6} {'Odds':>6}")
    print("-"*70)

    for p in predictions:
        print(f"{p['matchup']:15} {p['line']:>7.1f} {p['prediction']:>6} {p['confidence']*100:>5.1f}% "
              f"{p['logisticProb']*100:>5.1f}% {p['xgboostProb']*100:>5.1f}% {p['odds']:>6.2f}")

    print("\n" + "="*70)
    print(f"🎯 HIGH CONFIDENCE PICKS (≥{CONFIDENCE_THRESHOLD*100:.0f}%)")
    print("="*70)

    if high_conf:
        for p in high_conf:
            print(f"\n   {p['matchup']}")
            print(f"   Line: {p['line']:.1f}")
            print(f"   Pick: {p['prediction']} @ {p['odds']:.2f}")
            print(f"   Confidence: {p['confidence']*100:.1f}%")
            print(f"   Expected Value: {p['expectedValue']*100:+.1f}%")
    else:
        print("\n   No picks meet the confidence threshold.")
        print("   Consider the games above with highest confidence.")

    print("\n" + "="*70)
    print("⚠️  DISCLAIMER: This is for educational purposes only.")
    print("    Past performance does not guarantee future results.")
    print("="*70 + "\n")


if __name__ == '__main__':
    main()
