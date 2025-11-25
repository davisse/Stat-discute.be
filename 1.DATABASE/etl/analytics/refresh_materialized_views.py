#!/usr/bin/env python3
"""
Refresh Materialized Views
Refresh all materialized views for analytics performance
"""

import os
import sys
import psycopg2
import time
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'config', '.env'))

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )

def refresh_materialized_views():
    """Refresh all materialized views"""
    print("=" * 80)
    print("🔄 REFRESHING MATERIALIZED VIEWS")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    materialized_views = [
        'mv_team_current_form',
        'mv_top_player_averages',
        'mv_head_to_head_history'
    ]

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        results = {}

        for view_name in materialized_views:
            print(f"🔄 Refreshing {view_name}...")
            start_time = time.time()

            try:
                # Refresh materialized view (use CONCURRENTLY only if unique index exists)
                # For now, use regular refresh since unique indexes may not exist yet
                cur.execute(f"REFRESH MATERIALIZED VIEW {view_name}")
                conn.commit()

                duration = time.time() - start_time
                results[view_name] = {'status': 'success', 'duration': duration}

                # Get row count
                cur.execute(f"SELECT COUNT(*) FROM {view_name}")
                row_count = cur.fetchone()[0]

                print(f"  ✅ Refreshed in {duration:.2f}s ({row_count} rows)")

            except Exception as e:
                duration = time.time() - start_time
                results[view_name] = {'status': 'error', 'duration': duration, 'error': str(e)}
                print(f"  ❌ Error: {e}")
                conn.rollback()

        print(f"\n📊 Refresh Summary:")
        for view_name, result in results.items():
            status_icon = "✅" if result['status'] == 'success' else "❌"
            print(f"  {status_icon} {view_name}: {result['duration']:.2f}s")

        # Log refresh to database
        for view_name, result in results.items():
            try:
                cur.execute("""
                    INSERT INTO data_refresh_log (
                        table_name, refresh_type, refresh_status,
                        refresh_duration_seconds, error_message, completed_at
                    )
                    VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                """, (
                    view_name,
                    'materialized_view',
                    result['status'],
                    result['duration'],
                    result.get('error')
                ))
                conn.commit()
            except Exception as e:
                print(f"  ⚠️  Could not log refresh for {view_name}: {e}")

        cur.close()
        conn.close()

        all_success = all(r['status'] == 'success' for r in results.values())

        if all_success:
            print("\n✅ All materialized views refreshed successfully!")
        else:
            print("\n⚠️  Some materialized views failed to refresh")

        return all_success

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = refresh_materialized_views()
    sys.exit(0 if success else 1)
