#!/usr/bin/env python3
"""
Pinnacle Session Extractor
==========================
Interactive script to create pinnacle_session.json from browser cookies.

Usage:
    1. Log into https://www.ps3838.com in your browser
    2. Open DevTools (F12) > Application > Cookies > www.ps3838.com
    3. Run this script and paste the required values
    4. Upload to production: ./scripts/update_pinnacle_session.sh
"""

import json
from datetime import datetime
from pathlib import Path


def main():
    print("=" * 60)
    print(" Pinnacle Session Extractor")
    print("=" * 60)
    print()
    print("Prerequisites:")
    print("1. Log into https://www.ps3838.com in your browser")
    print("2. Open DevTools (F12) > Application > Cookies")
    print("3. Find cookies for www.ps3838.com")
    print()
    print("-" * 60)
    print()

    # Required cookies
    print("Enter the following cookie values from your browser:")
    print("(Press Enter to skip optional cookies)")
    print()

    cookies = {}

    # Essential cookies
    essential_cookies = ['auth', 'custid', 'JSESSIONID']
    for cookie_name in essential_cookies:
        value = input(f"  {cookie_name}: ").strip()
        if value:
            cookies[cookie_name] = value

    # Optional but helpful cookies
    optional_cookies = ['locale', 'odds_format', 'timezone']
    print()
    print("Optional cookies (press Enter to skip):")
    for cookie_name in optional_cookies:
        value = input(f"  {cookie_name}: ").strip()
        if value:
            cookies[cookie_name] = value

    if not cookies.get('auth') and not cookies.get('custid'):
        print()
        print("⚠️  Warning: Missing essential cookies (auth, custid)")
        print("   The session may not work without these.")
        print()

    # Headers (usually not needed but can be helpful)
    print()
    print("Headers (usually auto-detected, press Enter to skip):")
    headers = {}

    x_custid = input("  X-Custid (if available): ").strip()
    if x_custid:
        headers['X-Custid'] = x_custid

    x_u = input("  X-U (if available): ").strip()
    if x_u:
        headers['X-U'] = x_u

    # Create session data
    session_data = {
        'login_time': datetime.now().isoformat(),
        'cookies': cookies,
        'headers': headers,
    }

    # Save to file
    output_file = Path(__file__).parent / 'pinnacle_session.json'

    print()
    print("-" * 60)
    print()

    # Show preview
    print("Session data preview:")
    print(json.dumps(session_data, indent=2))
    print()

    confirm = input(f"Save to {output_file}? (Y/n): ").strip().lower()
    if confirm in ('', 'y', 'yes'):
        with open(output_file, 'w') as f:
            json.dump(session_data, f, indent=2)
        output_file.chmod(0o600)  # Restrict permissions

        print()
        print(f"✅ Session saved to: {output_file}")
        print()
        print("Next steps:")
        print("1. Test locally: python3 fetch_pinnacle_odds.py --dry-run")
        print("2. Upload to production: ./scripts/update_pinnacle_session.sh")
    else:
        print("Cancelled.")


if __name__ == '__main__':
    main()
