#!/usr/bin/env python3
"""
Save current authenticated session from browser cookies
Extracted from live ps3838.com authenticated browser session
"""

import sys
from pathlib import Path

# Add parent directory to path to import PinnacleSession
sys.path.insert(0, str(Path(__file__).parent))

from pinnacle_session import PinnacleSession

# Cookies extracted from authenticated browser (2025-11-23 14:07)
cookies = {
    "_sig": "Kcy1Nell3TURNNE1EQXlPVFEyTUdVNVlROmg1bXdQS2haeEw1bXJwZjQxTm5acXFHWTU6OTcyODIxODI1Ojc2MTI0MDMzMDoyLjExLjA6OUNDRUE5b0lYRA==",
    "_apt": "9CCEA9oIXD",
    "skin": "ps3838",
    "lang": "en_US",
    "_vid": "79e26b3280daf0d7715ac3cca694c220",
    "dpMs1": "rb4iGmltP4X4okKDTjuL",
    "PCTR": "1921669566523",
    "custid": "id",
    "BrowserSessionId": "cae55aea-7bed-440f-be25-7a4f107ea9a0",
    "_og": "QQ",
    "_userDefaultView": "COMPACT",
    "auth": "true",
    "__prefs": "W251bGwsMSwwLDAsMSwiNCwyOSwzMywxNSwzLDE3LDE5LDM0LDI2LDIyLDE4LDEyLDgsMzksMSwzMiwyLDYsOSwxMCwxMSwxNCwxNiwyMywyNCwyNywyOCwzMCwzMSwzNSwzNiw0MCw0MSw0Miw0Myw0NCw0NSw0Niw0Nyw0OCw0OSw1MCw1MSw1Miw1Myw1NCw3LDU3LDU4LDU1LDUsMTMsMjEsMzcsNTYsNTksNjAsNjEsNjIsNjMsNjQsNjUsMjAiLGZhbHNlLDAuMDAwMCxmYWxzZSx0cnVlLCJfMUxJTkUiLDAsbnVsbCx0cnVlLHRydWUsZmFsc2UsZmFsc2UsbnVsbCxudWxsLHRydWVd",
    "_lastView": "eyJicjNjdmxmMDE4IjoiQ09NUEFDVCJ9",
    "displayMessPopUp": "true"
}

# Standard headers for ps3838.com API requests
headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.ps3838.com/en/sports/basketball',
    'Origin': 'https://www.ps3838.com',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin'
}

# Add session-specific headers from cookies
if 'custid' in cookies:
    headers['X-Custid'] = cookies['custid']
if 'BrowserSessionId' in cookies:
    headers['X-Browser-Session-Id'] = cookies['BrowserSessionId']

print("🔐 Saving authenticated session...")
print(f"   Cookies: {len(cookies)} items")
print(f"   Headers: {len(headers)} items")
print(f"   Auth status: {cookies.get('auth', 'unknown')}")
print(f"   Browser Session ID: {cookies.get('BrowserSessionId', 'unknown')}")

# Create and save session using absolute path
session_file = Path(__file__).parent / 'pinnacle_session.json'
session = PinnacleSession(session_file=str(session_file))
session.update_from_curl_session(headers=headers, cookies=cookies)

print("\n✅ Session saved to pinnacle_session.json")
print("\n🧪 Testing session validity...")

if session.validate_session():
    print("✅ Session is valid and ready to use!")
    print("\n📊 You can now run:")
    print("   python3 fetch_pinnacle_odds.py")
else:
    print("❌ Session validation failed")
    print("   Please check the session file and try again")
