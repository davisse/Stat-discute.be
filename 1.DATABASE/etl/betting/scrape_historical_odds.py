#!/usr/bin/env python3
"""
Scrape historical NBA betting data from sportsbookreviewsonline.com
Saves to JSON file for import into database.
"""

import requests
from bs4 import BeautifulSoup
import json
import os

def scrape_nba_odds_2022_23():
    """Scrape 2022-23 NBA odds from sportsbookreviewsonline.com"""

    url = "https://www.sportsbookreviewsonline.com/scoresoddsarchives/nba-odds-2022-23/"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }

    print(f"Fetching {url}...")
    response = requests.get(url, headers=headers)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')

    # Find the main data table
    table = soup.find('table')
    if not table:
        print("No table found!")
        return []

    rows = table.find_all('tr')
    print(f"Found {len(rows)} rows")

    data = []
    for row in rows:
        cells = row.find_all('td')
        if len(cells) < 13:
            continue

        # Extract cell values
        record = {
            'date': cells[0].get_text(strip=True),
            'rot': cells[1].get_text(strip=True),
            'vh': cells[2].get_text(strip=True),
            'team': cells[3].get_text(strip=True),
            'q1': cells[4].get_text(strip=True),
            'q2': cells[5].get_text(strip=True),
            'q3': cells[6].get_text(strip=True),
            'q4': cells[7].get_text(strip=True),
            'final': cells[8].get_text(strip=True),
            'open': cells[9].get_text(strip=True),
            'close': cells[10].get_text(strip=True),
            'ml': cells[11].get_text(strip=True),
            'h2': cells[12].get_text(strip=True) if len(cells) > 12 else ''
        }

        # Skip header rows or empty rows
        if record['date'] and record['date'] != 'Date' and record['final']:
            data.append(record)

    return data


def main():
    # Scrape the data
    data = scrape_nba_odds_2022_23()

    if not data:
        print("No data extracted!")
        return

    print(f"Extracted {len(data)} game rows")

    # Save to JSON file
    output_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    output_path = os.path.join(output_dir, 'data', 'odds', 'nba_odds_2022_23_raw.json')

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"Saved to {output_path}")

    # Show sample
    print("\nFirst 4 records:")
    for rec in data[:4]:
        print(f"  {rec['date']} {rec['vh']} {rec['team']}: {rec['final']} (close: {rec['close']})")

    print(f"\nLast 4 records:")
    for rec in data[-4:]:
        print(f"  {rec['date']} {rec['vh']} {rec['team']}: {rec['final']} (close: {rec['close']})")


if __name__ == '__main__':
    main()
