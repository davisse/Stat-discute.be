#!/usr/bin/env python3
"""
Update Pinnacle Session from cURL Headers/Cookies
Run this script to initialize or refresh the session file from browser session.
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from pinnacle_session import PinnacleSession

def main():
    """Update session from cURL-extracted headers and cookies."""

    # Headers from cURL (critical authentication headers) - UPDATED 2025-11-23
    headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.ps3838.com/en/sports/basketball',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15',
        'X-App-Data': 'dpMs1=rb4iGmltP4X4okKDTjuL;directusToken=TwEdnphtyxsfMpXoJkCkWaPsL2KJJ3lo;BrowserSessionId=a7ae9755-758f-48e3-ad89-17bf8f0cf845;PCTR=1921636129645;_og=QQ%3D%3D;_ulp=KzhkT2JESFJ1US9xbC9rZkxDaHJZbEc2TEhEWVlkNTAxZHJzMWgxOXJIVTR0WjQ2aWtIYTRSOXNtTHJTbXpaWXxiMWE0MWE4MDM5OWU4NTI1MzU0MjczNjBlYWE2NzdmOA%3D%3D;custid=id%3DBR3CVLF018%26login%3D202511222348%26roundTrip%3D202511222348%26hash%3D1F3CA1688A656207BEF9862449CBE6D3;_userDefaultView=COMPACT;__prefs=W251bGwsMSwwLDAsMSwiNCwyOSwzMywxNSwzLDE3LDE5LDM0LDI2LDIyLDE4LDEyLDgsMzksMSwzMiwyLDYsOSwxMCwxMSwxNCwxNiwyMywyNCwyNywyOCwzMCwzMSwzNSwzNiw0MCw0MSw0Miw0Myw0NCw0NSw0Niw0Nyw0OCw0OSw1MCw1MSw1Miw1Myw1NCw3LDU3LDU4LDU1LDUsMTMsMjEsMzcsNTYsNTksNjAsNjEsNjIsNjMsNjQsNjUsMjAiLGZhbHNlLDAuMDAwMCxmYWxzZSx0cnVlLCJfMUxJTkUiLDAsbnVsbCx0cnVlLHRydWUsZmFsc2UsZmFsc2UsbnVsbCxudWxsLHRydWVd;pctag=5ae754ed-55fe-4b1e-a9bf-f1acb9b99652;lang=en_US',
        'X-Browser-Session-Id': 'a7ae9755-758f-48e3-ad89-17bf8f0cf845',
        'X-Custid': 'id=BR3CVLF018&login=202511222348&roundTrip=202511222348&hash=1F3CA1688A656207BEF9862449CBE6D3',
        'X-Lcu': 'AAAAAwAAAAAEWv5VAAABmq8LEf5xfSgDymwY4GXNPSx2RW5MUznsXp90IlJ7fn2VZQXPpw==',
        'X-SLID': '-1775063366',
        'X-U': 'AAAAAwAAAAAEWv5VAAABmq8LEf5xfSgDymwY4GXNPSx2RW5MUznsXp90IlJ7fn2VZQXPpw==',
        'Priority': 'u=3, i'
    }

    # Cookies from cURL (critical authentication cookies) - UPDATED 2025-11-23
    cookies = {
        'auth': 'true',
        'custid': 'id=BR3CVLF018&login=202511222348&roundTrip=202511222348&hash=1F3CA1688A656207BEF9862449CBE6D3',
        'u': 'AAAAAwAAAAAEWv5VAAABmq8LEf5xfSgDymwY4GXNPSx2RW5MUznsXp90IlJ7fn2VZQXPpw==',
        'lcu': 'AAAAAwAAAAAEWv5VAAABmq8LEf5xfSgDymwY4GXNPSx2RW5MUznsXp90IlJ7fn2VZQXPpw==',
        'BrowserSessionId': 'a7ae9755-758f-48e3-ad89-17bf8f0cf845',
        'SLID': '-1775063366',
        'pctag': '5ae754ed-55fe-4b1e-a9bf-f1acb9b99652',
        'lang': 'en_US',
        'skin': 'ps3838',
        'uoc': 'c5012c9fe34622fed9696382f2d7f4f7',
        '__prefs': 'W251bGwsMSwwLDAsMSwiNCwyOSwzMywxNSwzLDE3LDE5LDM0LDI2LDIyLDE4LDEyLDgsMzksMSwzMiwyLDYsOSwxMCwxMSwxNCwxNiwyMywyNCwyNywyOCwzMCwzMSwzNSwzNiw0MCw0MSw0Miw0Myw0NCw0NSw0Niw0Nyw0OCw0OSw1MCw1MSw1Miw1Myw1NCw3LDU3LDU4LDU1LDUsMTMsMjEsMzcsNTYsNTksNjAsNjEsNjIsNjMsNjQsNjUsMjAiLGZhbHNlLDAuMDAwMCxmYWxzZSx0cnVlLCJfMUxJTkUiLDAsbnVsbCx0cnVlLHRydWUsZmFsc2UsZmFsc2UsbnVsbCxudWxsLHRydWVd',
        'adformfrpid': '3438300878642094600',
        'displayMessPopUp': 'true',
        '_lastView': 'eyJicjNjdmxmMDE4IjoiQ09NUEFDVCJ9',
        'PCTR': '1921636129645',
        '_og': 'QQ==',
        '_ulp': 'KzhkT2JESFJ1US9xbC9rZkxDaHJZbEc2TEhEWVlkNTAxZHJzMWgxOXJIVTR0WjQ2aWtIYTRSOXNtTHJTbXpaWXxiMWE0MWE4MDM5OWU4NTI1MzU0MjczNjBlYWE2NzdmOA==',
        '_userDefaultView': 'COMPACT',
        '_apt': '9CCEA9oIXD',
        '_sig': 'Rcy1OakppTlRVd1lXRTRNekJqT0dFMFlROlhPbllYdUhiUjZzT3Z1YVNXTUMyb1FnTjA6MTAxODE1NzgyNDo3NjM4Njk2Nzc6Mi4xMS4wOjlDQ0VBOW9JWEQ%3D',
        'dpMs1': 'rb4iGmltP4X4okKDTjuL'
    }

    # Create session and update
    session = PinnacleSession(session_file='pinnacle_session.json')

    print("📋 Updating Pinnacle session from cURL headers/cookies...")
    session.update_from_curl_session(headers=headers, cookies=cookies)

    print("✅ Session credentials updated successfully!")
    print(f"📁 Session saved to: pinnacle_session.json")
    print("\n⚠️  Note: Session validation skipped - these credentials may be expired.")
    print("   To get fresh credentials:")
    print("   1. Open https://www.ps3838.com in your browser")
    print("   2. Log in to your account")
    print("   3. Open Developer Tools > Network tab")
    print("   4. Navigate to NBA betting page")
    print("   5. Copy the 'Copy as cURL' from any API request")
    print("   6. Update the headers/cookies in this script and run again")


if __name__ == '__main__':
    main()
