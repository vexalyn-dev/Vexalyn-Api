# search.py
import sys
import asyncio
import json
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
from core.browser import get_page_content

# ANSI Colors - Tema Pink, Ungu, Biru
C_PURPLE = "\033[35m"  # Ungu gelap
C_PINK = "\033[95m"    # Magenta / Pink terang
C_BLUE = "\033[94m"    # Biru terang
C_CYAN = "\033[96m"    # Biru Cyan
C_RED = "\033[91m"     # Merah (buat error)
RESET = "\033[0m"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://animexin.dev/"
}

async def loading_animation(text: str, duration: float = 0.8):
    chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    end_time = time.time() + duration
    i = 0
    while time.time() < end_time:
        sys.stdout.write(f"\r{C_PINK}[{chars[i % len(chars)]}]{RESET} {C_BLUE}{text}{RESET}...")
        sys.stdout.flush()
        await asyncio.sleep(0.1)
        i += 1
    sys.stdout.write(f"\r{C_PURPLE}[✓]{RESET} {C_BLUE}{text}{RESET} {C_PINK}DONE.{RESET}\n")
    sys.stdout.flush()

def print_banner():
    banner = r"""
 █████╗ ███╗   ██╗██╗███╗   ███╗███████╗██╗  ██╗██╗███╗   ██╗
██╔══██╗████╗  ██║██║████╗ ████║██╔════╝╚██╗██╔╝██║████╗  ██║
███████║██╔██╗ ██║██║██╔████╔██║█████╗   ╚███╔╝ ██║██╔██╗ ██║
██╔══██║██║╚██╗██║██║██║╚██╔╝██║██╔══╝   ██╔██╗ ██║██║╚██╗██║
██║  ██║██║ ╚████║██║██║ ╚═╝ ██║███████╗██╔╝ ██╗██║██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
    """
    print(f"{C_PURPLE}{banner}{RESET}")
    print("─" * 125)
    print(f" {C_PINK}[Module]{RESET}                -> Animexin Search Scraper Core (No Pagination)")
    print(f" {C_PINK}[Target Endpoint]{RESET}       -> https://animexin.dev/?s=")
    print(f" {C_PINK}[Developer]{RESET}             -> Vexalyn Developer")
    print("─" * 125)

def clean_duplicated_title(title: str) -> str:
    if not title:
        return "Unknown Title"
    length = len(title)
    if length % 2 == 0:
        mid = length // 2
        if title[:mid] == title[mid:]:
            return title[:mid]
    return title

async def scrape_search(query: str):
    encoded_query = quote(query)
    target_url = f"https://animexin.dev/?s={encoded_query}"

    t_start = time.time()
    
    html_content = await get_page_content(target_url)
    elapsed = round(time.time() - t_start, 2)
    
    status_code = 200 if html_content else 500
    
    response = {
        "creator": "Vexalyn Developer",
        "keyword": query,
        "target_url": target_url,
        "statusCode": status_code,
        "status": "success" if status_code == 200 else "error",
        "message": f"Mantap! Berhasil mencari anime dengan keyword '{query}'." if status_code == 200 else f"Gagal melakukan pencarian untuk '{query}'.",
        "ok": status_code == 200,
        "elapsed_time": f"{elapsed} seconds",
        "total_items": 0,
        "data": []
    }

    if status_code != 200 or not html_content:
        response["ok"] = False
        return response

    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        cards = soup.select('article.bs, .listupd article.bs, div[class*="venz"] article.bs')

        items = []
        for card in cards:
            a_tag = card.select_one('a.tip, a')
            if not a_tag or not a_tag.get('href'):
                continue
                
            link = a_tag.get('href')
            if not link.startswith("http"):
                link = f"https://animexin.dev{link}" if link.startswith('/') else f"https://animexin.dev/{link}"
            
            raw_title = a_tag.get('title') or ""
            if not raw_title:
                title_el = card.select_one('.tt, h2, h3, .title, .entry-title')
                raw_title = title_el.text.strip() if title_el else "Unknown Title"
            
            title = clean_duplicated_title(raw_title)
            
            img_el = card.select_one('img')
            thumbnail = ""
            if img_el:
                thumbnail = img_el.get('data-src') or img_el.get('src') or ""

            type_el = card.select_one('.typez, .type, .lplez')
            dtype = type_el.text.strip() if type_el else "Anime"

            status_el = card.select_one('.status')
            status_text = status_el.text.strip() if status_el else "Ongoing"

            sub_el = card.select_one('.bt span.sb, .sub')
            sub_text = sub_el.text.strip() if sub_el else "Sub"

            ep_el = card.select_one('.epx, .episode')
            episode_text = ep_el.text.strip() if ep_el else "Latest"

            items.append({
                "title": title,
                "url": link,
                "thumbnail": thumbnail,
                "type": dtype,
                "status": status_text,
                "label": sub_text,
                "episode": episode_text
            })

        response["total_items"] = len(items)
        response["data"] = items

    except Exception as e:
        response["statusCode"] = 500
        response["status"] = "error"
        response["message"] = f"Waduh ada error saat parsing hasil search Animexin: {str(e)}"
        response["ok"] = False

    return response

async def main():
    print_banner()
    
    print(f"\n{C_PINK}[?]{RESET} {C_BLUE}Masukkan Keyword Pencarian Anime:{RESET}")
    query_input = input(f" {C_PURPLE}╰─ Keyword [default: Perfect World]:{RESET} ").strip()
    
    if not query_input:
        query = "Perfect World"
    else:
        query = query_input

    print()
    await loading_animation(f"Mencari anime dengan keyword '{query}'", 0.3)
    
    print(f"\n{C_PINK}[*]{RESET} {C_BLUE}Processing Animexin search payload extraction...{RESET}")
    
    start_time = time.time()
    result = await scrape_search(query)
    execution_time = round(time.time() - start_time, 2)
    
    print(f" {C_PURPLE}──────────────────────────────────────────────────────────────────────{RESET}")
    print(f"{C_PINK}[SUCCESS]{RESET} {C_BLUE}Keyword:{RESET} {C_CYAN}{result['keyword']}{RESET}")
    print(f"{C_PINK}[SUCCESS]{RESET} {C_BLUE}Status Code:{RESET} {C_CYAN}{result['statusCode']}{RESET}")
    print(f"{C_PINK}[SUCCESS]{RESET} {C_BLUE}Total Items:{RESET} {C_CYAN}{result['total_items']} items found{RESET}")
    print(f"{C_PINK}[SUCCESS]{RESET} {C_BLUE}Elapsed Time:{RESET} {C_CYAN}{execution_time} seconds{RESET}")
    print(f" {C_PURPLE}──────────────────────────────────────────────────────────────────────{RESET}")
    
    print(f"{C_PINK}[RAW JSON DATA BUFFER]:{RESET}")
    print(f"{C_CYAN}{json.dumps(result, indent=4, ensure_ascii=False)}{RESET}")
    
    print(f"{C_PURPLE} ──────────────────────────────────────────────────────────────────────{RESET}")
    print(f"{C_PINK}[!] Operational complete. Vexalyn Scraper core closed safely.{RESET}\n")

if __name__ == "__main__":
    asyncio.run(main())