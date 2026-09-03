# animexin/core/browser.py
import requests
import asyncio

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://animexin.dev/"
}

async def get_page_content(url: str):
    """Fungsi helper async untuk mengambil konten HTML dari Animexin"""
    def _fetch():
        try:
            response = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
            if response.status_code == 200:
                return response.text
            return None
        except Exception:
            return None

    return await asyncio.to_thread(_fetch)