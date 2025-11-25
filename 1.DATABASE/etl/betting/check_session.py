#!/usr/bin/env python3
"""
Pinnacle Session Health Check
Monitors session age and validity for automated workflows.

Exit Codes:
    0: Session valid and healthy
    1: Session missing or expired
    2: Session exists but validation failed (needs refresh)
"""

import sys
from datetime import datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from pinnacle_session import PinnacleSession


def main():
    """Check session health and report status."""
    session_file = 'pinnacle_session.json'

    # Check if session file exists
    if not Path(session_file).exists():
        print("❌ Session file not found")
        print(f"   Expected: {session_file}")
        print("   Run: python3 update_session.py")
        sys.exit(1)

    # Load session
    session = PinnacleSession(session_file=session_file)

    if not session.load_session():
        print("❌ Session expired or invalid")
        print("   Run: python3 update_session.py")
        sys.exit(1)

    # Check session age
    login_time_str = session.auth_data.get('login_time')
    if not login_time_str:
        print("⚠️ Session missing login_time")
        sys.exit(2)

    login_time = datetime.fromisoformat(login_time_str)
    age_hours = (datetime.now() - login_time).total_seconds() / 3600
    remaining_hours = session.SESSION_LIFETIME_HOURS - age_hours

    # Report status
    print(f"📊 Session Status Report")
    print(f"{'='*50}")
    print(f"  Session File: {session_file}")
    print(f"  Login Time: {login_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Age: {age_hours:.1f} hours")
    print(f"  Lifetime: {session.SESSION_LIFETIME_HOURS} hours")
    print(f"  Remaining: {remaining_hours:.1f} hours")

    if remaining_hours < 0:
        print(f"  Status: ❌ EXPIRED")
        print(f"{'='*50}")
        print("⚠️ Session has expired - please update credentials")
        sys.exit(1)
    elif remaining_hours < 0.5:  # Less than 30 minutes
        print(f"  Status: ⚠️ EXPIRING SOON")
        print(f"{'='*50}")
        print("⚠️ Session expires in less than 30 minutes")
        print("   Consider refreshing credentials now")
        sys.exit(2)
    elif remaining_hours < 1.0:  # Less than 1 hour
        print(f"  Status: ⚠️ WARNING")
        print(f"{'='*50}")
        print(f"⚠️ Session expires in {remaining_hours:.1f}h")
        print("   Plan to refresh credentials soon")
        sys.exit(0)
    else:
        print(f"  Status: ✅ HEALTHY")
        print(f"{'='*50}")
        print(f"✅ Session valid for {remaining_hours:.1f}h")
        sys.exit(0)


if __name__ == '__main__':
    main()
