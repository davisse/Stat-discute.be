#!/usr/bin/env python3
"""
Sync NBA Venues
Populate venues table with arena information for each team
"""

import os
import sys
import psycopg2
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

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

def get_venues_data():
    """
    Manual venue data for NBA teams (2024-25 season)
    NBA API doesn't have a direct venue endpoint
    """
    return [
        {'team_abbr': 'ATL', 'venue_name': 'State Farm Arena', 'city': 'Atlanta', 'state': 'Georgia', 'capacity': 16600, 'year_opened': 1999},
        {'team_abbr': 'BOS', 'venue_name': 'TD Garden', 'city': 'Boston', 'state': 'Massachusetts', 'capacity': 19156, 'year_opened': 1995},
        {'team_abbr': 'BKN', 'venue_name': 'Barclays Center', 'city': 'Brooklyn', 'state': 'New York', 'capacity': 17732, 'year_opened': 2012},
        {'team_abbr': 'CHA', 'venue_name': 'Spectrum Center', 'city': 'Charlotte', 'state': 'North Carolina', 'capacity': 19077, 'year_opened': 2005},
        {'team_abbr': 'CHI', 'venue_name': 'United Center', 'city': 'Chicago', 'state': 'Illinois', 'capacity': 20917, 'year_opened': 1994},
        {'team_abbr': 'CLE', 'venue_name': 'Rocket Mortgage FieldHouse', 'city': 'Cleveland', 'state': 'Ohio', 'capacity': 19432, 'year_opened': 1994},
        {'team_abbr': 'DAL', 'venue_name': 'American Airlines Center', 'city': 'Dallas', 'state': 'Texas', 'capacity': 19200, 'year_opened': 2001},
        {'team_abbr': 'DEN', 'venue_name': 'Ball Arena', 'city': 'Denver', 'state': 'Colorado', 'capacity': 19520, 'year_opened': 1999},
        {'team_abbr': 'DET', 'venue_name': 'Little Caesars Arena', 'city': 'Detroit', 'state': 'Michigan', 'capacity': 20491, 'year_opened': 2017},
        {'team_abbr': 'GSW', 'venue_name': 'Chase Center', 'city': 'San Francisco', 'state': 'California', 'capacity': 18064, 'year_opened': 2019},
        {'team_abbr': 'HOU', 'venue_name': 'Toyota Center', 'city': 'Houston', 'state': 'Texas', 'capacity': 18055, 'year_opened': 2003},
        {'team_abbr': 'IND', 'venue_name': 'Gainbridge Fieldhouse', 'city': 'Indianapolis', 'state': 'Indiana', 'capacity': 17923, 'year_opened': 1999},
        {'team_abbr': 'LAC', 'venue_name': 'Intuit Dome', 'city': 'Inglewood', 'state': 'California', 'capacity': 18000, 'year_opened': 2024},
        {'team_abbr': 'LAL', 'venue_name': 'Crypto.com Arena', 'city': 'Los Angeles', 'state': 'California', 'capacity': 19068, 'year_opened': 1999},
        {'team_abbr': 'MEM', 'venue_name': 'FedExForum', 'city': 'Memphis', 'state': 'Tennessee', 'capacity': 18119, 'year_opened': 2004},
        {'team_abbr': 'MIA', 'venue_name': 'Kaseya Center', 'city': 'Miami', 'state': 'Florida', 'capacity': 19600, 'year_opened': 1999},
        {'team_abbr': 'MIL', 'venue_name': 'Fiserv Forum', 'city': 'Milwaukee', 'state': 'Wisconsin', 'capacity': 17341, 'year_opened': 2018},
        {'team_abbr': 'MIN', 'venue_name': 'Target Center', 'city': 'Minneapolis', 'state': 'Minnesota', 'capacity': 18978, 'year_opened': 1990},
        {'team_abbr': 'NOP', 'venue_name': 'Smoothie King Center', 'city': 'New Orleans', 'state': 'Louisiana', 'capacity': 16867, 'year_opened': 1999},
        {'team_abbr': 'NYK', 'venue_name': 'Madison Square Garden', 'city': 'New York', 'state': 'New York', 'capacity': 19812, 'year_opened': 1968},
        {'team_abbr': 'OKC', 'venue_name': 'Paycom Center', 'city': 'Oklahoma City', 'state': 'Oklahoma', 'capacity': 18203, 'year_opened': 2002},
        {'team_abbr': 'ORL', 'venue_name': 'Kia Center', 'city': 'Orlando', 'state': 'Florida', 'capacity': 18846, 'year_opened': 2010},
        {'team_abbr': 'PHI', 'venue_name': 'Wells Fargo Center', 'city': 'Philadelphia', 'state': 'Pennsylvania', 'capacity': 20478, 'year_opened': 1996},
        {'team_abbr': 'PHX', 'venue_name': 'Footprint Center', 'city': 'Phoenix', 'state': 'Arizona', 'capacity': 18055, 'year_opened': 1992},
        {'team_abbr': 'POR', 'venue_name': 'Moda Center', 'city': 'Portland', 'state': 'Oregon', 'capacity': 19393, 'year_opened': 1995},
        {'team_abbr': 'SAC', 'venue_name': 'Golden 1 Center', 'city': 'Sacramento', 'state': 'California', 'capacity': 17608, 'year_opened': 2016},
        {'team_abbr': 'SAS', 'venue_name': 'Frost Bank Center', 'city': 'San Antonio', 'state': 'Texas', 'capacity': 18418, 'year_opened': 2002},
        {'team_abbr': 'TOR', 'venue_name': 'Scotiabank Arena', 'city': 'Toronto', 'state': 'Ontario', 'capacity': 19800, 'year_opened': 1999},
        {'team_abbr': 'UTA', 'venue_name': 'Delta Center', 'city': 'Salt Lake City', 'state': 'Utah', 'capacity': 18306, 'year_opened': 1991},
        {'team_abbr': 'WAS', 'venue_name': 'Capital One Arena', 'city': 'Washington', 'state': 'District of Columbia', 'capacity': 20356, 'year_opened': 1997},
    ]

def sync_venues():
    """Insert or update venues in database"""
    print("=" * 80)
    print("🏟️  SYNCING NBA VENUES")
    print("=" * 80)

    try:
        venues_data = get_venues_data()
        print(f"✅ Loaded {len(venues_data)} venue records")

        conn = get_db_connection()
        cur = conn.cursor()

        # First, get team IDs from abbreviations
        cur.execute("SELECT team_id, abbreviation FROM teams")
        team_lookup = {abbr: team_id for team_id, abbr in cur.fetchall()}

        inserted = 0
        updated = 0

        for venue in venues_data:
            team_id = team_lookup.get(venue['team_abbr'])

            if not team_id:
                print(f"  ⚠️  Team not found for {venue['team_abbr']}, skipping {venue['venue_name']}")
                continue

            # Check if venue exists for this team
            cur.execute("SELECT venue_id FROM venues WHERE team_id = %s AND is_active = true", (team_id,))
            existing_venue = cur.fetchone()

            if existing_venue:
                # Update existing venue
                cur.execute("""
                    UPDATE venues
                    SET venue_name = %s,
                        city = %s,
                        state = %s,
                        country = %s,
                        capacity = %s,
                        year_opened = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE venue_id = %s
                """, (
                    venue['venue_name'],
                    venue['city'],
                    venue['state'],
                    'USA' if venue['team_abbr'] != 'TOR' else 'Canada',
                    venue['capacity'],
                    venue['year_opened'],
                    existing_venue[0]
                ))
                updated += 1
            else:
                # Insert new venue
                cur.execute("""
                    INSERT INTO venues (venue_name, city, state, country, capacity, year_opened, team_id, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    venue['venue_name'],
                    venue['city'],
                    venue['state'],
                    'USA' if venue['team_abbr'] != 'TOR' else 'Canada',
                    venue['capacity'],
                    venue['year_opened'],
                    team_id,
                    True
                ))
                inserted += 1

        conn.commit()

        print(f"\n📊 Venues Sync Summary:")
        print(f"  • Venues inserted: {inserted}")
        print(f"  • Venues updated: {updated}")
        print(f"  • Total venues: {len(venues_data)}")

        # Verify all teams have venues
        cur.execute("""
            SELECT t.abbreviation, v.venue_name
            FROM teams t
            JOIN venues v ON t.team_id = v.team_id
            WHERE v.is_active = true
            ORDER BY t.abbreviation
        """)

        venues_by_team = cur.fetchall()
        print(f"\n✅ Teams with venues: {len(venues_by_team)}/30")

        if len(venues_by_team) < 30:
            print("\n⚠️  Missing venues for some teams")

        cur.close()
        conn.close()

        print("\n✅ Venues sync completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = sync_venues()
    sys.exit(0 if success else 1)
