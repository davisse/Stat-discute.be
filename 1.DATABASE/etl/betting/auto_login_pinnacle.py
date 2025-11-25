#!/usr/bin/env python3
"""
Automatic Pinnacle Login and Session Creation
Uses Playwright to automate login and extract fresh cookies/headers.

Reads credentials from .credentials-ps3838 file.
"""

import asyncio
import json
import logging
import sys
from pathlib import Path
from datetime import datetime

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("❌ Playwright not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"])
    subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
    from playwright.async_api import async_playwright

from pinnacle_session import PinnacleSession

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def read_credentials():
    """Read credentials from .credentials-ps3838 file."""
    creds_file = Path(__file__).parent.parent.parent / '.credentials-ps3838'

    if not creds_file.exists():
        logger.error(f"❌ Credentials file not found: {creds_file}")
        return None, None

    try:
        with open(creds_file, 'r') as f:
            lines = f.readlines()

        login = None
        password = None

        for line in lines:
            line = line.strip()
            if line.startswith('login='):
                login = line.split('=', 1)[1]
            elif line.startswith('pwd='):
                password = line.split('=', 1)[1]

        if not login or not password:
            logger.error("❌ Invalid credentials format. Expected 'login=...' and 'pwd=...'")
            return None, None

        logger.info(f"✅ Credentials loaded for user: {login}")
        return login, password

    except Exception as e:
        logger.error(f"❌ Error reading credentials: {e}")
        return None, None


async def login_and_extract_session(login: str, password: str):
    """
    Use Playwright to log in to Pinnacle and extract session data.

    Args:
        login: Pinnacle username
        password: Pinnacle password

    Returns:
        Tuple of (headers_dict, cookies_dict) or (None, None) on failure
    """
    logger.info("🌐 Starting browser automation...")

    async with async_playwright() as p:
        # Launch browser (headless=False to see what's happening)
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 720},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()

        try:
            # Navigate to Pinnacle login page
            logger.info("📄 Navigating to ps3838.com...")
            await page.goto('https://www.ps3838.com', wait_until='networkidle')

            # Wait a bit for page to load
            await asyncio.sleep(2)

            # Click login button (adjust selector if needed)
            logger.info("🔍 Looking for login button...")
            try:
                # Try different possible selectors for login button
                login_selectors = [
                    'button:has-text("Log in")',
                    'button:has-text("Login")',
                    'a:has-text("Log in")',
                    'a:has-text("Login")',
                    '[data-test="login-button"]',
                    '.login-button',
                    '#login-button'
                ]

                login_clicked = False
                for selector in login_selectors:
                    try:
                        await page.click(selector, timeout=2000)
                        login_clicked = True
                        logger.info(f"✅ Clicked login button with selector: {selector}")
                        break
                    except:
                        continue

                if not login_clicked:
                    logger.warning("⚠️ Could not find login button, trying direct login page...")
                    await page.goto('https://www.ps3838.com/en/account/sign-in', wait_until='networkidle')

            except Exception as e:
                logger.warning(f"⚠️ Login button click failed: {e}")

            await asyncio.sleep(2)

            # Fill in credentials
            logger.info("📝 Filling in credentials...")

            # Username field
            username_selectors = [
                'input[name="login"]',
                'input[name="username"]',
                'input[type="text"]',
                'input[placeholder*="Username"]',
                'input[placeholder*="username"]',
                '#username',
                '#login'
            ]

            username_filled = False
            for selector in username_selectors:
                try:
                    await page.fill(selector, login, timeout=2000)
                    username_filled = True
                    logger.info(f"✅ Filled username with selector: {selector}")
                    break
                except:
                    continue

            if not username_filled:
                logger.error("❌ Could not find username field")
                await page.screenshot(path='pinnacle_login_error.png')
                return None, None

            # Password field
            password_selectors = [
                'input[name="password"]',
                'input[type="password"]',
                'input[placeholder*="Password"]',
                'input[placeholder*="password"]',
                '#password'
            ]

            password_filled = False
            for selector in password_selectors:
                try:
                    await page.fill(selector, password, timeout=2000)
                    password_filled = True
                    logger.info(f"✅ Filled password with selector: {selector}")
                    break
                except:
                    continue

            if not password_filled:
                logger.error("❌ Could not find password field")
                await page.screenshot(path='pinnacle_login_error.png')
                return None, None

            await asyncio.sleep(1)

            # Submit login form
            logger.info("🚀 Submitting login form...")
            submit_selectors = [
                'button[type="submit"]',
                'button:has-text("Log in")',
                'button:has-text("Sign in")',
                'input[type="submit"]',
                'button:has-text("Login")'
            ]

            submit_clicked = False
            for selector in submit_selectors:
                try:
                    await page.click(selector, timeout=2000)
                    submit_clicked = True
                    logger.info(f"✅ Clicked submit with selector: {selector}")
                    break
                except:
                    continue

            if not submit_clicked:
                logger.error("❌ Could not find submit button")
                await page.screenshot(path='pinnacle_login_error.png')
                return None, None

            # Wait for navigation after login
            logger.info("⏳ Waiting for login to complete...")
            await asyncio.sleep(5)

            # Check if login was successful (URL should change or we should see account info)
            current_url = page.url
            logger.info(f"📍 Current URL: {current_url}")

            # Navigate to NBA betting page to trigger API calls
            logger.info("🏀 Navigating to NBA betting page...")
            await page.goto('https://www.ps3838.com/en/sports/basketball/nba', wait_until='networkidle')
            await asyncio.sleep(3)

            # Extract cookies
            cookies = await context.cookies()
            cookies_dict = {cookie['name']: cookie['value'] for cookie in cookies}
            logger.info(f"✅ Extracted {len(cookies_dict)} cookies")

            # Extract headers from a request
            # We'll capture the next API request to get headers
            headers_dict = {}

            async def capture_request(request):
                nonlocal headers_dict
                if 'ps3838.com/sports-service' in request.url:
                    headers_dict = dict(request.headers)
                    logger.info(f"✅ Captured headers from API request")

            page.on('request', capture_request)

            # Trigger an API request by interacting with the page
            await page.reload()
            await asyncio.sleep(3)

            # Take a screenshot to verify we're logged in
            await page.screenshot(path='pinnacle_logged_in.png')
            logger.info("📸 Screenshot saved: pinnacle_logged_in.png")

            # If we didn't capture headers from API request, use default headers
            if not headers_dict:
                logger.warning("⚠️ No API request captured, using default headers")
                headers_dict = {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.ps3838.com/en/sports/basketball/nba',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }

            # Add custom headers that are session-specific
            if 'custid' in cookies_dict:
                headers_dict['X-Custid'] = cookies_dict['custid']
            if 'u' in cookies_dict:
                headers_dict['X-U'] = cookies_dict['u']
            if 'lcu' in cookies_dict:
                headers_dict['X-Lcu'] = cookies_dict['lcu']
            if 'BrowserSessionId' in cookies_dict:
                headers_dict['X-Browser-Session-Id'] = cookies_dict['BrowserSessionId']
            if 'SLID' in cookies_dict:
                headers_dict['X-SLID'] = cookies_dict['SLID']

            logger.info(f"✅ Session data extracted successfully!")
            return headers_dict, cookies_dict

        except Exception as e:
            logger.error(f"❌ Error during login: {e}")
            await page.screenshot(path='pinnacle_error.png')
            logger.info("📸 Error screenshot saved: pinnacle_error.png")
            return None, None

        finally:
            await browser.close()


async def main():
    """Main execution flow."""
    logger.info("="*60)
    logger.info("🏀 Pinnacle Automatic Login & Session Creator")
    logger.info("="*60)

    # Read credentials
    login, password = read_credentials()
    if not login or not password:
        logger.error("❌ Failed to load credentials")
        return 1

    # Perform automated login
    headers, cookies = await login_and_extract_session(login, password)

    if not headers or not cookies:
        logger.error("❌ Failed to extract session data")
        return 1

    # Save session using PinnacleSession
    logger.info("💾 Saving session to pinnacle_session.json...")
    session = PinnacleSession(session_file='pinnacle_session.json')
    session.update_from_curl_session(headers=headers, cookies=cookies)

    # Validate the session
    logger.info("✅ Testing session validity...")
    if session.validate_session():
        logger.info("🎉 Session is valid and ready to use!")
        logger.info("="*60)
        logger.info("Next steps:")
        logger.info("  python3 fetch_pinnacle_odds.py")
        logger.info("="*60)
        return 0
    else:
        logger.error("❌ Session validation failed")
        logger.info("Please check the screenshots (pinnacle_*.png) to debug")
        return 1


if __name__ == '__main__':
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
