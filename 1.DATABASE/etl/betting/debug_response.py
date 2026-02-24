#!/usr/bin/env python3
"""Debug script to see raw API response"""

import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from pinnacle_session import PinnacleSession

def main():
    session = PinnacleSession(session_file='pinnacle_session.json')

    # Make the request
    print("🔍 Making request to Pinnacle API...")
    response = session._make_request(session.API_BASE, params={
        'btg': '1',
        'cl': '3',
        'g': 'QQ==',
        'hle': 'false',  # Changed from true to get all events
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
        '_': '1763871103899',
        'withCredentials': 'true',
    })

    if response is None:
        print("❌ No response received")
        return

    # Save raw response
    with open('debug_response.json', 'w') as f:
        json.dump(response, f, indent=2)
    print(f"✅ Response saved to debug_response.json")

    # Show structure
    print(f"\n📊 Response keys: {list(response.keys())}")

    if 'hle' in response:
        print(f"   hle type: {type(response['hle'])}")
        if response['hle']:
            print(f"   hle length: {len(response['hle'])}")
            if len(response['hle']) > 0:
                print(f"   hle[0] type: {type(response['hle'][0])}")
                if isinstance(response['hle'][0], list) and len(response['hle'][0]) > 2:
                    print(f"   hle[0] length: {len(response['hle'][0])}")
                    print(f"   hle[0][2] type: {type(response['hle'][0][2])}")
        else:
            print("   hle is empty or null")

    if 'e' in response:
        print(f"   e type: {type(response['e'])}")
        print(f"   e value: {response['e']}")

if __name__ == '__main__':
    main()
