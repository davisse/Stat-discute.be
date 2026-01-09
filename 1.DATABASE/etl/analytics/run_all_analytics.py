#!/usr/bin/env python3
"""
Run All Analytics
Execute all analytics calculations in the correct order
"""

import os
import sys
import subprocess
from datetime import datetime

# Get the directory containing this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def run_script(script_name):
    """Run a Python script and return success status"""
    script_path = os.path.join(SCRIPT_DIR, script_name)

    print(f"\n{'=' * 80}")
    print(f"Running: {script_name}")
    print(f"{'=' * 80}\n")

    try:
        result = subprocess.run(
            ['python3', script_path],
            capture_output=False,
            text=True,
            check=True
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Script {script_name} failed with exit code {e.returncode}")
        return False
    except Exception as e:
        print(f"\n❌ Error running {script_name}: {e}")
        return False

def main():
    """Run all analytics scripts in order"""
    print("=" * 80)
    print("🚀 RUNNING ALL ANALYTICS CALCULATIONS")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    start_time = datetime.now()

    scripts = [
        'calculate_team_stats.py',
        'calculate_advanced_stats.py',
        'populate_ortg_drtg.py',       # Player ORTG/DRTG (needs team_game_stats + player_advanced_stats)
        'calculate_standings.py',
        'calculate_period_stats.py',  # Quarter & half averages
        'generate_team_analysis.py',  # French narrative analysis (after standings)
        'refresh_materialized_views.py'
    ]

    results = {}

    for script in scripts:
        success = run_script(script)
        results[script] = success

        if not success:
            print(f"\n⚠️  Stopping execution due to failure in {script}")
            break

    end_time = datetime.now()
    duration = end_time - start_time

    print("\n" + "=" * 80)
    print("📊 ANALYTICS RUN SUMMARY")
    print("=" * 80)

    for script, success in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"  {status}: {script}")

    print(f"\n⏱️  Total duration: {duration}")
    print(f"Completed at: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80 + "\n")

    all_success = all(results.values())

    if all_success:
        print("✅ All analytics calculations completed successfully!")
    else:
        print("❌ Some analytics calculations failed")

    return 0 if all_success else 1

if __name__ == '__main__':
    sys.exit(main())
