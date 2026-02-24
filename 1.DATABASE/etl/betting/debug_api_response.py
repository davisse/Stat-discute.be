#!/usr/bin/env python3
"""Debug script to see actual API response structure"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from pinnacle_session import PinnacleSession

session = PinnacleSession(session_file='pinnacle_session.json')

# Make raw API request
params = {
    'btg': '1',
    'cl': '1',
    'g': 'QQ==',
    'hle': 'false',
    'ic': 'false',
    'ice': 'false',
    'inl': 'false',
    'l': '1',
    'lg': '487',  # NBA league ID
    'sp': '4',     # Basketball sport ID
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

print("🔍 Making API request...")
response = session._make_request(session.API_BASE, params)

if response:
    print("\n✅ Response received!")
    print(f"\n📊 Top-level keys: {list(response.keys())}")

    # Show 'n' array structure if exists
    if 'n' in response:
        print(f"\n📋 'n' array exists with {len(response['n'])} items")
        print(f"   Structure: {type(response['n'])}")
        if response['n']:
            print(f"   First item type: {type(response['n'][0])}")
            print(f"   First item length: {len(response['n'][0]) if isinstance(response['n'][0], (list, dict)) else 'N/A'}")

            # Try to navigate the expected structure
            try:
                events_array = response['n'][0][2][0][2]
                print(f"\n✅ Successfully accessed response['n'][0][2][0][2]")
                print(f"   Found {len(events_array)} events")
                if events_array:
                    print(f"\n📝 First event structure:")
                    print(f"   Type: {type(events_array[0])}")
                    if isinstance(events_array[0], list):
                        print(f"   Length: {len(events_array[0])}")
                        print(f"   First 10 elements:")
                        for i, elem in enumerate(events_array[0][:10]):
                            print(f"     [{i}]: {elem} ({type(elem).__name__})")
            except (IndexError, KeyError, TypeError) as e:
                print(f"\n❌ Cannot access response['n'][0][2][0][2]: {e}")
                print(f"\n📄 Showing partial structure of 'n' array:")
                print(json.dumps(response['n'][:1], indent=2)[:2000])  # First 2000 chars

    # Show 'l' array structure if exists
    if 'l' in response:
        print(f"\n📋 'l' array exists with {len(response['l'])} items")

    # Save full response for inspection
    output_file = Path(__file__).parent / 'api_response_debug.json'
    with open(output_file, 'w') as f:
        json.dump(response, f, indent=2)
    print(f"\n💾 Full response saved to: {output_file}")

else:
    print("\n❌ No response received")
