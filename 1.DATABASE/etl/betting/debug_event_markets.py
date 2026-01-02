#!/usr/bin/env python3
"""Debug script to see detailed event markets response for DET @ LAC"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from pinnacle_session import PinnacleSession

session = PinnacleSession(session_file='pinnacle_session.json')

# First get events list to find DET @ LAC
events = session.get_upcoming_events()

print(f"📋 Found {len(events)} events\n")

det_lac_event = None
for event in events:
    print(f"  {event['game_name']} - Event ID: {event['event_id']}")
    # Look for Pistons or Lakers
    if 'Pistons' in event.get('home_team', '') or 'Pistons' in event.get('away_team', ''):
        det_lac_event = event
    if 'Lakers' in event.get('home_team', '') or 'Lakers' in event.get('away_team', ''):
        det_lac_event = event

if not det_lac_event:
    print("\n❌ No DET @ LAC game found. Using first event instead.")
    det_lac_event = events[0] if events else None

if det_lac_event:
    print(f"\n📈 Fetching detailed markets for: {det_lac_event['game_name']} (ID: {det_lac_event['event_id']})")

    # Fetch detailed markets
    response = session.get_event_markets(det_lac_event['event_id'])

    if response:
        # Save full response
        output_file = Path(__file__).parent / 'event_markets_debug.json'
        with open(output_file, 'w') as f:
            json.dump(response, f, indent=2)
        print(f"💾 Full response saved to: {output_file}")

        # Try to find the totals markets
        print("\n🔍 Looking for Game Total markets...")

        # Navigate the structure
        try:
            if 'n' in response and response['n']:
                # Navigate to events
                nba_data = response['n'][0][2][0][2]
                if nba_data:
                    event_data = nba_data[0]
                    markets = event_data[8]  # Markets dict

                    print(f"\n📊 Markets keys: {list(markets.keys())}")

                    # Check full game markets (key '0')
                    if '0' in markets:
                        full_game = markets['0']
                        print(f"\n📋 Full game market structure:")
                        print(f"   Type: {type(full_game)}")
                        print(f"   Length: {len(full_game)}")

                        # Index 1 should be totals
                        if len(full_game) > 1:
                            totals = full_game[1]
                            print(f"\n🎯 Totals (index 1):")
                            print(f"   Type: {type(totals)}")
                            print(f"   Length: {len(totals) if isinstance(totals, list) else 'N/A'}")

                            if isinstance(totals, list) and totals:
                                print(f"\n📊 ALL TOTALS LINES:")
                                for i, line_data in enumerate(totals):
                                    if isinstance(line_data, list) and len(line_data) >= 4:
                                        line = line_data[0] if isinstance(line_data[0], str) else line_data[1]
                                        over_odds = line_data[2]
                                        under_odds = line_data[3]
                                        print(f"   [{i}] Line: {line}, Over: {over_odds}, Under: {under_odds}")

                        # Also check index 3 for game totals (based on parser)
                        if len(full_game) > 3:
                            game_totals_3 = full_game[3]
                            print(f"\n🎯 Index 3 data:")
                            print(f"   Type: {type(game_totals_3)}")
                            print(f"   Value: {game_totals_3}")

        except (IndexError, KeyError, TypeError) as e:
            print(f"\n❌ Error navigating structure: {e}")
            print("\nShowing raw 'n' structure (first 5000 chars):")
            print(json.dumps(response.get('n', [])[:1], indent=2)[:5000])
    else:
        print("❌ No response received")
else:
    print("❌ No events found")
