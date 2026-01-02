#!/usr/bin/env python3
"""
Daily Totals Pipeline Orchestrator
Execute all totals analytics in the correct order

Workflow:
1. Fetch period scores for yesterday's completed games
2. Capture closing lines for today's games
3. Calculate O/U results for completed games
4. Update ats_performance
5. Generate fresh projections for upcoming games
6. Identify value bets
"""

import os
import sys
import subprocess
from datetime import datetime, timedelta
from typing import List, Tuple

# Get the directory containing this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ANALYTICS_DIR = os.path.join(SCRIPT_DIR, 'analytics')
BETTING_DIR = os.path.join(SCRIPT_DIR, 'betting')


def run_script(script_path: str, args: List[str] = None) -> Tuple[bool, str]:
    """
    Run a Python script and return success status with output
    Returns: (success, output)
    """
    script_name = os.path.basename(script_path)

    print(f"\n{'=' * 80}")
    print(f"Running: {script_name}")
    if args:
        print(f"Arguments: {' '.join(args)}")
    print(f"{'=' * 80}\n")

    try:
        cmd = ['python3', script_path]
        if args:
            cmd.extend(args)

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=False
        )

        # Print output
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)

        if result.returncode == 0:
            return True, result.stdout
        else:
            print(f"\n❌ Script {script_name} failed with exit code {result.returncode}")
            return False, result.stderr

    except Exception as e:
        print(f"\n❌ Error running {script_name}: {e}")
        return False, str(e)


def main():
    """Run daily totals analytics pipeline"""
    print("=" * 80)
    print("🚀 DAILY TOTALS ANALYTICS PIPELINE")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    start_time = datetime.now()
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    today = datetime.now().strftime('%Y-%m-%d')

    # Pipeline steps with dependencies
    steps = []

    # Step 1: Fetch period scores for yesterday's completed games
    # Note: This script may need to be created or may already exist
    period_scores_script = os.path.join(SCRIPT_DIR, 'fetch_period_scores.py')
    if os.path.exists(period_scores_script):
        steps.append({
            'name': 'Fetch Period Scores (Yesterday)',
            'script': period_scores_script,
            'args': [yesterday],
            'required': False  # Optional if script exists
        })
    else:
        print(f"⚠️  Period scores script not found: {period_scores_script}")
        print("    Skipping period scores fetch...\n")

    # Step 2: Capture closing lines for today's games
    # Note: This may be integrated into fetch_pinnacle_odds.py
    closing_lines_script = os.path.join(BETTING_DIR, 'capture_closing_lines.py')
    if os.path.exists(closing_lines_script):
        steps.append({
            'name': 'Capture Closing Lines (Today)',
            'script': closing_lines_script,
            'args': [today],
            'required': False
        })
    else:
        print(f"⚠️  Closing lines script not found: {closing_lines_script}")
        print("    Note: This should be part of fetch_pinnacle_odds.py\n")

    # Step 3: Calculate O/U results for completed games
    ou_results_script = os.path.join(BETTING_DIR, 'calculate_ou_results.py')
    if os.path.exists(ou_results_script):
        steps.append({
            'name': 'Calculate O/U Results',
            'script': ou_results_script,
            'args': None,
            'required': False
        })
    else:
        print(f"⚠️  O/U results script not found: {ou_results_script}")
        print("    Skipping O/U results calculation...\n")

    # Step 4: Update ats_performance
    ats_update_script = os.path.join(BETTING_DIR, 'update_ats_performance.py')
    if os.path.exists(ats_update_script):
        steps.append({
            'name': 'Update ATS Performance',
            'script': ats_update_script,
            'args': None,
            'required': False
        })
    else:
        print(f"⚠️  ATS performance script not found: {ats_update_script}")
        print("    Skipping ATS performance update...\n")

    # Step 5: Calculate period statistics
    period_stats_script = os.path.join(ANALYTICS_DIR, 'calculate_period_stats.py')
    if os.path.exists(period_stats_script):
        steps.append({
            'name': 'Calculate Period Statistics',
            'script': period_stats_script,
            'args': None,
            'required': False
        })

    # Step 6: Generate totals projections for upcoming games
    projections_script = os.path.join(ANALYTICS_DIR, 'calculate_totals_projections.py')
    steps.append({
        'name': 'Generate Totals Projections (Next 7 days)',
        'script': projections_script,
        'args': None,  # No date = next 7 days
        'required': True
    })

    # Step 7: Identify value bets
    value_bets_script = os.path.join(ANALYTICS_DIR, 'identify_value_bets.py')
    steps.append({
        'name': 'Identify Value Bets (Next 3 days)',
        'script': value_bets_script,
        'args': None,  # No date = next 3 days
        'required': True
    })

    # Step 8: Generate situational trends analysis
    trends_script = os.path.join(ANALYTICS_DIR, 'generate_situational_trends.py')
    steps.append({
        'name': 'Generate Situational Trends',
        'script': trends_script,
        'args': None,  # No season = current season
        'required': False
    })

    # Execute pipeline
    results = {}
    failed_required = False

    for step in steps:
        if not os.path.exists(step['script']):
            if step['required']:
                print(f"\n❌ REQUIRED SCRIPT MISSING: {step['script']}")
                failed_required = True
                results[step['name']] = False
            else:
                print(f"\n⚠️  Optional script not found, skipping: {step['name']}")
                results[step['name']] = None
            continue

        success, output = run_script(step['script'], step['args'])
        results[step['name']] = success

        if not success and step['required']:
            print(f"\n⚠️  Required step failed: {step['name']}")
            failed_required = True
            # Continue with remaining steps (don't stop on failure)

    end_time = datetime.now()
    duration = end_time - start_time

    # Print summary
    print("\n" + "=" * 80)
    print("📊 DAILY TOTALS PIPELINE SUMMARY")
    print("=" * 80)

    for step_name, success in results.items():
        if success is None:
            status = "⏭️  SKIPPED"
        elif success:
            status = "✅ SUCCESS"
        else:
            status = "❌ FAILED"
        print(f"  {status}: {step_name}")

    print(f"\n⏱️  Total duration: {duration}")
    print(f"Completed at: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80 + "\n")

    # Final status
    successful = sum(1 for v in results.values() if v is True)
    total = len([v for v in results.values() if v is not None])

    if failed_required:
        print("❌ Pipeline completed with required step failures")
        return 1
    elif successful == total:
        print("✅ All pipeline steps completed successfully!")
        return 0
    else:
        print(f"⚠️  Pipeline completed: {successful}/{total} steps successful")
        return 0  # Don't fail if only optional steps failed


if __name__ == '__main__':
    sys.exit(main())
