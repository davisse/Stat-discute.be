#!/usr/bin/env python3
"""
Quick session refresh for Pinnacle using requests.
Reads credentials and performs login to get fresh cookies.
"""
import requests
import json
from pathlib import Path
from datetime import datetime

# Read credentials
creds_file = Path(__file__).parent.parent.parent.parent / '.credentials-ps3838'
with open(creds_file, 'r') as f:
    lines = f.readlines()
    creds = {}
    for line in lines:
        if '=' in line:
            key, val = line.strip().split('=', 1)
            creds[key] = val

login = creds.get('login')
password = creds.get('pwd')

print(f"Logging in as {login}...")

# Create session
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://www.ps3838.com',
    'Referer': 'https://www.ps3838.com/',
})

# First, load the homepage to get initial cookies
print("Loading homepage...")
resp = session.get('https://www.ps3838.com/')
print(f"Homepage: {resp.status_code}")

# Try to get login page
print("Loading login page...")
resp = session.get('https://www.ps3838.com/en/account/sign-in')
print(f"Login page: {resp.status_code}")

# Try login endpoint
print("Attempting login...")
login_url = 'https://www.ps3838.com/member-auth/v2/login'
login_data = {
    'login': login,
    'password': password,
    'captcha': '',
    'rememberMe': True
}

resp = session.post(login_url, json=login_data)
print(f"Login response: {resp.status_code}")
print(f"Login response: {resp.text[:500] if resp.text else 'empty'}")

# Print all cookies
print("\n=== All Cookies ===")
for cookie in session.cookies:
    print(f"{cookie.name}: {cookie.value[:50]}..." if len(cookie.value) > 50 else f"{cookie.name}: {cookie.value}")

# Try the sports API to validate
print("\n=== Testing API ===")
api_url = 'https://www.ps3838.com/sports-service/sv/compact/events'
params = {
    'btg': '1',
    'cl': '1',
    'g': 'QQ==',
    'hle': 'false',
    'ic': 'false',
    'ice': 'false',
    'inl': 'false',
    'l': '1',
    'lg': '487',
    'sp': '4',
    'tm': '0',
    'o': '1',
    'ot': '1',
    'pimo': '0,1,2',
    'pn': '-1',
    'pv': '1',
    'v': '0',
    'locale': 'en_US',
    'withCredentials': 'true',
}

resp = session.get(api_url, params=params)
print(f"API response: {resp.status_code}")

if resp.status_code == 200:
    data = resp.json()
    if data.get('n'):
        print(f"✅ Found events in API response")
    else:
        print("⚠️ No events in API response")

# Save session if login was successful
if 'auth' in [c.name for c in session.cookies]:
    print("\n=== Saving Session ===")
    session_data = {
        'login_time': datetime.now().isoformat(),
        'cookies': {c.name: c.value for c in session.cookies},
        'headers': dict(session.headers)
    }

    # Add X- headers from cookies
    cookies_dict = session_data['cookies']
    if 'custid' in cookies_dict:
        session_data['headers']['X-Custid'] = cookies_dict['custid']
    if 'u' in cookies_dict:
        session_data['headers']['X-U'] = cookies_dict['u']
    if 'lcu' in cookies_dict:
        session_data['headers']['X-Lcu'] = cookies_dict['lcu']
    if 'BrowserSessionId' in cookies_dict:
        session_data['headers']['X-Browser-Session-Id'] = cookies_dict['BrowserSessionId']
    if 'SLID' in cookies_dict:
        session_data['headers']['X-SLID'] = cookies_dict['SLID']

    session_file = Path(__file__).parent / 'pinnacle_session.json'
    with open(session_file, 'w') as f:
        json.dump(session_data, f, indent=2)

    print(f"✅ Session saved to {session_file}")
else:
    print("❌ Login failed - no auth cookie found")
