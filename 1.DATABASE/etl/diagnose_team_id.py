#!/usr/bin/env python3
"""
Diagnostic script to check team_id assignment from NBA API
Examines a specific game to see what team_ids are being returned
"""

import requests
import json

# Headers for NBA API
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Accept': '*/*',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
}

# Fetch player game logs
url = 'https://stats.nba.com/stats/leaguegamelog'
params = {
    'Counter': '1000',
    'DateFrom': '2025-11-19',  # Specific game date we identified
    'DateTo': '2025-11-19',
    'Direction': 'DESC',
    'LeagueID': '00',
    'PlayerOrTeam': 'P',
    'Season': '2025-26',
    'SeasonType': 'Regular Season',
    'Sorter': 'DATE'
}

print("🔍 Fetching data for 2025-11-19 games...")
response = requests.get(url, params=params, headers=headers, timeout=30)
data = response.json()

result_set = data['resultSets'][0]
headers_list = result_set['headers']
rows = result_set['rowSet']

print(f"\n✅ Found {len(rows)} player stat records")
print(f"\n📋 Headers: {headers_list}\n")

# Find the MIN vs WAS game (game_id: 0022500259)
target_game = '0022500259'

print(f"🎯 Analyzing game {target_game} (MIN @ WAS):\n")

was_team_id = 1610612764
min_team_id = 1610612750

was_players = []
min_players = []
wrong_team = []

for row in rows:
    stat = dict(zip(headers_list, row))

    if stat['GAME_ID'] == target_game:
        player_name = stat['PLAYER_NAME']
        team_id = stat['TEAM_ID']
        team_abbr = stat['TEAM_ABBREVIATION']
        matchup = stat['MATCHUP']

        if team_id == was_team_id:
            was_players.append((player_name, team_abbr, matchup))
        elif team_id == min_team_id:
            min_players.append((player_name, team_abbr, matchup))
        else:
            wrong_team.append((player_name, team_id, team_abbr, matchup))

print(f"🟦 WAS team_id ({was_team_id}) - {len(was_players)} players:")
for name, abbr, matchup in was_players[:10]:
    print(f"   • {name} ({abbr}) - {matchup}")

print(f"\n🟩 MIN team_id ({min_team_id}) - {len(min_players)} players:")
for name, abbr, matchup in min_players[:10]:
    print(f"   • {name} ({abbr}) - {matchup}")

if wrong_team:
    print(f"\n⚠️  Other team_ids - {len(wrong_team)} players:")
    for name, tid, abbr, matchup in wrong_team:
        print(f"   • {name} (team_id: {tid}, abbr: {abbr}) - {matchup}")
