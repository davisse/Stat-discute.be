#!/usr/bin/env python3
"""
Test script pour vérifier l'accès Pinnacle avec authentification complète.
Utilise les cookies/headers de votre session cURL active.

Usage: python3 test_authenticated_request.py
"""

import requests
import json
from datetime import datetime

# Headers complets de votre session cURL
HEADERS = {
    'Accept': 'application/json, text/plain, */*',
    'Sec-Fetch-Site': 'same-origin',
    'Accept-Language': 'fr-FR,fr;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Sec-Fetch-Mode': 'cors',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15',
    'Referer': 'https://www.ps3838.com/en/sports/basketball',
    'Sec-Fetch-Dest': 'empty',
    'X-Browser-Session-Id': 'a7ae9755-758f-48e3-ad89-17bf8f0cf845',
    'X-SLID': '-1775063366',
    'Priority': 'u=3, i',
    'X-Custid': 'id=BR3CVLF018&login=202511222348&roundTrip=202511222348&hash=1F3CA1688A656207BEF9862449CBE6D3',
    'X-U': 'AAAAAwAAAAAEWv5VAAABmq8LEf5xfSgDymwY4GXNPSx2RW5MUznsXp90IlJ7fn2VZQXPpw==',
    'X-Lcu': 'AAAAAwAAAAAEWv5VAAABmq8LEf5xfSgDymwY4GXNPSx2RW5MUznsXp90IlJ7fn2VZQXPpw==',
    'X-App-Data': 'dpMs1=rb4iGmltP4X4okKDTjuL;directusToken=TwEdnphtyxsfMpXoJkCkWaPsL2KJJ3lo;BrowserSessionId=a7ae9755-758f-48e3-ad89-17bf8f0cf845;PCTR=1921636129645;_og=QQ%3D%3D;_ulp=KzhkT2JESFJ1US9xbC9rZkxDaHJZbEc2TEhEWVlkNTAxZHJzMWgxOXJIVTR0WjQ2aWtIYTRSOXNtTHJTbXpaWXxiMWE0MWE4MDM5OWU4NTI1MzU0MjczNjBlYWE2NzdmOA%3D%3D;custid=id%3DBR3CVLF018%26login%3D202511222348%26roundTrip%3D202511222348%26hash%3D1F3CA1688A656207BEF9862449CBE6D3;_userDefaultView=COMPACT;__prefs=W251bGwsMSwxLDAsMSwiNCwyOSwzMywxNSwzLDE3LDE5LDM0LDI2LDIyLDE4LDEyLDgsMzksMSwzMiwyLDYsOSwxMCwxMSwxNCwxNiwyMywyNCwyNywyOCwzMCwzMSwzNSwzNiw0MCw0MSw0Miw0Myw0NCw0NSw0Niw0Nyw0OCw0OSw1MCw1MSw1Miw1Myw1NCw3LDU3LDU4LDU1LDUsMTMsMjEsMzcsNTYsNTksNjAsNjEsNjIsNjMsNjQsNjUsMjAiLGZhbHNlLDAuMDAwMCxmYWxzZSx0cnVlLCJfM0xJTkVTIiwwLG51bGwsdHJ1ZSx0cnVlLGZhbHNlLGZhbHNlLG51bGwsbnVsbCx0cnVlXQ%3D%3D;pctag=5ae754ed-55fe-4b1e-a9bf-f1acb9b99652;lang=en_US',
}

# Cookies complets de votre session
COOKIES = {
    'displayMessPopUp': 'true',
    '_lastView': 'eyJicjNjdmxmMDE4IjoiQ09NUEFDVCJ9',
    'adformfrpid': '3438300878642094600',
    'BrowserSessionId': 'a7ae9755-758f-48e3-ad89-17bf8f0cf845',
    'PCTR': '1921636129645',
    'SLID': '-1775063366',
    '__prefs': 'W251bGwsMSwxLDAsMSwiNCwyOSwzMywxNSwzLDE3LDE5LDM0LDI2LDIyLDE4LDEyLDgsMzksMSwzMiwyLDYsOSwxMCwxMSwxNCwxNiwyMywyNCwyNywyOCwzMCwzMSwzNSwzNiw0MCw0MSw0Miw0Myw0NCw0NSw0Niw0Nyw0OCw0OSw1MCw1MSw1Miw1Myw1NCw3LDU3LDU4LDU1LDUsMTMsMjEsMzcsNTYsNTksNjAsNjEsNjIsNjMsNjQsNjUsMjAiLGZhbHNlLDAuMDAwMCxmYWxzZSx0cnVlLCJfM0xJTkVTIiwwLG51bGwsdHJ1ZSx0cnVlLGZhbHNlLGZhbHNlLG51bGwsbnVsbCx0cnVlXQ==',
    '_og': 'QQ==',
    '_ulp': 'KzhkT2JESFJ1US9xbC9rZkxDaHJZbEc2TEhEWVlkNTAxZHJzMWgxOXJIVTR0WjQ2aWtIYTRSOXNtTHJTbXpaWXxiMWE0MWE4MDM5OWU4NTI1MzU0MjczNjBlYWE2NzdmOA==',
    '_userDefaultView': 'COMPACT',
    'auth': 'true',
    'custid': 'id=BR3CVLF018&login=202511222348&roundTrip=202511222348&hash=1F3CA1688A656207BEF9862449CBE6D3',
    'lcu': 'AAAAAwAAAAAEWv5VAAABmq8LEf5xfSgDymwY4GXNPSx2RW5MUznsXp90IlJ7fn2VZQXPpw==',
    'pctag': '5ae754ed-55fe-4b1e-a9bf-f1acb9b99652',
    'u': 'AAAAAwAAAAAEWv5VAAABmq8LEf5xfSgDymwY4GXNPSx2RW5MUznsXp90IlJ7fn2VZQXPpw==',
    'uoc': 'c5012c9fe34622fed9696382f2d7f4f7',
    '_apt': '9CCEA9oIXD',
    '_sig': 'Rcy1OakppTlRVd1lXRTRNekJqT0dFMFlROlhPbllYdUhiUjZzT3Z1YVNXTUMyb1FnTjA6MTAxODE1NzgyNDo3NjM4Njk2Nzc6Mi4xMS4wOjlDQ0VBOW9JWEQ=',
    'lang': 'en_US',
    'skin': 'ps3838',
    'dpMs1': 'rb4iGmltP4X4okKDTjuL',
}

def test_api_access(tm_value=0):
    """
    Test l'accès API Pinnacle avec différentes valeurs de tm.

    Args:
        tm_value: Valeur du paramètre tm (0=today?, 1=tomorrow?)
    """
    # URL de base
    base_url = 'https://www.ps3838.com/sports-service/sv/compact/events'

    # Paramètres (basés sur votre cURL)
    params = {
        'btg': '1',
        'c': '',
        'cl': '3',
        'd': '',
        'ec': '',
        'ev': '',
        'g': 'QQ==',
        'hle': 'true',
        'ic': 'false',
        'ice': 'false',
        'inl': 'false',
        'l': '3',
        'lang': '',
        'lg': '487',  # NBA
        'lv': '',
        'me': '0',
        'mk': '0',
        'more': 'false',
        'o': '1',
        'ot': '1',
        'pa': '0',
        'pimo': '0,1,2',
        'pn': '-1',
        'pv': '1',
        'sp': '4',  # Basketball
        'tm': str(tm_value),
        'v': '0',
        'locale': 'en_US',
        'withCredentials': 'true',
        '_': str(int(datetime.now().timestamp() * 1000)),  # Cache buster
    }

    print(f"\n{'='*60}")
    print(f"🔍 Test avec tm={tm_value}")
    print(f"{'='*60}\n")

    try:
        response = requests.get(
            base_url,
            params=params,
            headers=HEADERS,
            cookies=COOKIES,
            timeout=10
        )

        print(f"Status Code: {response.status_code}")
        print(f"Response Size: {len(response.text)} bytes")

        if response.status_code == 200:
            data = response.json()

            # Sauvegarder la réponse complète d'abord
            filename = f'pinnacle_response_tm{tm_value}.json'
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"\n💾 Réponse complète sauvegardée dans: {filename}")

            # Extraire les événements NBA
            # Structure réelle: data['hle'][0][2][0][2] contient la liste des événements
            events = []
            try:
                if 'hle' in data and data['hle']:
                    # Navigation dans la structure imbriquée
                    # hle[0] = Basketball
                    # hle[0][2] = Leagues array
                    # hle[0][2][0] = NBA league
                    # hle[0][2][0][2] = Events array
                    nba_events = data['hle'][0][2][0][2]
                    print(f"✅ Trouvé {len(nba_events)} événements NBA")

                    # Afficher les événements
                    for i, event in enumerate(nba_events):
                        if isinstance(event, list) and len(event) > 4:
                            event_id = event[0]
                            home_team = event[1]
                            away_team = event[2]
                            start_timestamp = event[4]

                            # Convertir timestamp
                            start_time = datetime.fromtimestamp(start_timestamp / 1000)

                            print(f"\n📋 Match {i+1}:")
                            print(f"   Event ID: {event_id}")
                            print(f"   Équipes: {away_team} @ {home_team}")
                            print(f"   Date: {start_time}")

                            events.append({
                                'event_id': event_id,
                                'home_team': home_team,
                                'away_team': away_team,
                                'start_time': start_time,
                            })
            except (KeyError, IndexError, TypeError) as e:
                print(f"⚠️ Erreur parsing structure JSON: {e}")
                print(f"Structure disponible: {list(data.keys())}")

            return events

        elif response.status_code == 401:
            print("❌ 401 Unauthorized - Session expirée ou cookies invalides")
        elif response.status_code == 403:
            print("❌ 403 Forbidden - Accès refusé (peut-être headers manquants)")
        else:
            print(f"⚠️ Statut inattendu: {response.status_code}")
            print(f"Réponse: {response.text[:500]}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur réseau: {e}")
    except json.JSONDecodeError as e:
        print(f"❌ Erreur JSON: {e}")
        print(f"Réponse brute: {response.text[:500]}")

    return []


def main():
    """Test avec différentes valeurs de tm."""
    print("🏀 Test d'accès Pinnacle NBA API avec authentification")
    print(f"Timestamp: {datetime.now()}")

    # Test tm=0 (aujourd'hui/upcoming?)
    events_tm0 = test_api_access(tm_value=0)

    # Test tm=1 (demain?)
    events_tm1 = test_api_access(tm_value=1)

    # Comparaison
    print(f"\n{'='*60}")
    print("📊 RÉSUMÉ")
    print(f"{'='*60}")
    print(f"tm=0: {len(events_tm0)} matchs trouvés")
    print(f"tm=1: {len(events_tm1)} matchs trouvés")

    if events_tm0 and events_tm1:
        print("\n🔍 Comparaison des dates:")
        if events_tm0:
            print(f"tm=0 premier match: {events_tm0[0]['start_time']}")
        if events_tm1:
            print(f"tm=1 premier match: {events_tm1[0]['start_time']}")


if __name__ == '__main__':
    main()
