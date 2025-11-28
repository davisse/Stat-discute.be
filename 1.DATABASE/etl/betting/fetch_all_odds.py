#!/usr/bin/env python3
"""
Fetch All NBA Betting Odds
Runs both Pinnacle and Scooore/Kambi scrapers to get comprehensive odds coverage.

Usage:
    python fetch_all_odds.py

This script fetches:
- Pinnacle: Main lines (spread, total, moneyline) + player props (if session valid)
- Scooore/Kambi: Main lines + player props + alternative lines

Output is stored in the database and can be queried via unified views:
- v_unified_player_props
- v_unified_alternative_lines
- v_best_player_prop_odds
"""

import subprocess
import sys
import logging
from datetime import datetime
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).parent


def run_scraper(script_name: str, args: list = None) -> bool:
    """Run a scraper script and return success status."""
    script_path = SCRIPT_DIR / script_name
    cmd = [sys.executable, str(script_path)] + (args or [])

    logger.info(f"{'='*60}")
    logger.info(f"Running {script_name}...")
    logger.info(f"{'='*60}")

    try:
        result = subprocess.run(
            cmd,
            cwd=str(SCRIPT_DIR),
            capture_output=False,
            timeout=300  # 5 minute timeout
        )
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        logger.error(f"Timeout running {script_name}")
        return False
    except Exception as e:
        logger.error(f"Error running {script_name}: {e}")
        return False


def main():
    start_time = datetime.now()

    print(f"""
╔══════════════════════════════════════════════════════════════╗
║              NBA BETTING ODDS - MULTI-BOOKMAKER              ║
║                    {start_time.strftime('%Y-%m-%d %H:%M:%S')}                      ║
╠══════════════════════════════════════════════════════════════╣
║  Fetching odds from:                                         ║
║    • Pinnacle (ps3838.com) - Sharp lines                     ║
║    • Scooore/Kambi - Belgian market + player props           ║
╚══════════════════════════════════════════════════════════════╝
""")

    results = {}

    # Run Scooore/Kambi first (more reliable for player props)
    results['scooore'] = run_scraper('fetch_scooore_odds.py', ['--db', '--full'])

    # Run Pinnacle
    results['pinnacle'] = run_scraper('fetch_pinnacle_odds.py')

    # Summary
    elapsed = (datetime.now() - start_time).total_seconds()

    print(f"""
╔══════════════════════════════════════════════════════════════╗
║                         SUMMARY                              ║
╠══════════════════════════════════════════════════════════════╣
║  Scooore/Kambi: {'✅ Success' if results['scooore'] else '❌ Failed'}                                   ║
║  Pinnacle:      {'✅ Success' if results['pinnacle'] else '❌ Failed'}                                   ║
║                                                              ║
║  Time elapsed:  {elapsed:.1f}s                                       ║
╠══════════════════════════════════════════════════════════════╣
║  Query unified odds with:                                    ║
║    SELECT * FROM v_unified_player_props WHERE game_date = CURRENT_DATE;   ║
║    SELECT * FROM v_best_player_prop_odds WHERE game_date = CURRENT_DATE;  ║
╚══════════════════════════════════════════════════════════════╝
""")

    # Exit with error if any scraper failed
    if not all(results.values()):
        sys.exit(1)


if __name__ == '__main__':
    main()
