import asyncio
import json
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from datetime import datetime

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.goto("https://www.ps3838.com/sports-service/sv/compact/events?btg=1&c=&cl=3&d=&ec=&ev=&g=&hle=false&ic=false&ice=false&inl=false&l=3&lang=&lg=487&lv=&me=0&mk=1&more=false&o=1&ot=1&pa=0&pimo=0,1,2&pn=-1&pv=1&sp=4&tm=0&v=0&locale=en_US&_=1761230631978&withCredentials=true")
        
        content = await page.content()
        soup = BeautifulSoup(content, 'html.parser')
        pre_tag = soup.find('pre')
        json_data = json.loads(pre_tag.string)
        
        print(json.dumps(json_data, indent=4))

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
