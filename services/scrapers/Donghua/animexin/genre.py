# genre.py
import sys
import asyncio
import json
import time
import requests
from bs4 import BeautifulSoup
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
    print(f" {C_PINK}[Module]{RESET}                -> Animexin Genres List Scraper Core (Fixed)")
    print(f" {C_PINK}[Target Endpoint]{RESET}       -> https://animexin.dev/genres/")
    print(f" {C_PINK}[Developer]{RESET}             -> Vexalyn Developer")
    print("─" * 125)

async def scrape_genres():
    target_url = "https://animexin.dev/genres/"
    t_start = time.time()
    
    html_content = await get_page_content(target_url)
    elapsed = round(time.time() - t_start, 2)
    
    status_code = 200 if html_content else 500
    
    response = {
        "creator": "Vexalyn Developer",
        "target_url": target_url,
        "statusCode": status_code,
        "status": "success" if status_code == 200 else "error",
        "message": "Mantap! Berhasil menarik data list genre Animexin." if status_code == 200 else "Gagal mengambil halaman genres Animexin.",
        "ok": status_code == 200,
        "elapsed_time": f"{elapsed} seconds",
        "total_genres": 0,
        "data": []
    }

    if status_code != 200 or not html_content:
        response["ok"] = False
        return response

    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Perluasan selector CSS khusus halaman genres Animexin
        genre_boxes = soup.select('.taxdesc ul li a, .genres-list li a, .filter-dropdown ul li a, .tagcloud a, div[class*="genre"] a')
        
        if not genre_boxes:
            genre_boxes = soup.select('a[href*="/genres/"]')

        items = []
        for box in genre_boxes:
            link = box.get('href')
            if not link:
                continue
                
            if not link.startswith("http"):
                link = f"https://animexin.dev{link}" if link.startswith('/') else f"https://animexin.dev/{link}"
            
            full_text = box.text.strip()
            if not full_text or full_text.lower() == "genres":
                continue
            
            count = "N/A"
            genre_name = full_text
            
            for sub in box.select('span, i, em, small'):
                sub_text = sub.text.strip()
                if sub_text.isdigit():
                    count = sub_text
                    genre_name = genre_name.replace(sub_text, "").strip()

            items.append({
                "genre": genre_name,
                "total_shows": count,
                "url": link
            })

        seen_urls = set()
        unique_items = []
        for itm in items:
            if itm["url"] not in seen_urls and itm["url"] != "https://animexin.dev/genres/":
                seen_urls.add(itm["url"])
                unique_items.append(itm)

        response["total_genres"] = len(unique_items)
        response["data"] = unique_items

    except Exception as e:
        response["statusCode"] = 500
        response["status"] = "error"
        response["message"] = f"Waduh ada error saat parsing genres Animexin: {str(e)}"
        response["ok"] = False

    return response

async def main():
    print_banner()
    
    print()
    await loading_animation("Menghubungkan ke Halaman Genres Animexin", 0.3)
    await loading_animation("Mengambil daftar genre dan total anime", 0.4)
    
    print(f"\n{C_PINK}[*]{RESET} {C_BLUE}Processing Animexin genres extraction...{RESET}")
    
    start_time = time.time()
    result = await scrape_genres()
    execution_time = round(time.time() - start_time, 2)
    
    print(f" {C_PURPLE}──────────────────────────────────────────────────────────────────────{RESET}")
    print(f"{C_PINK}[SUCCESS]{RESET} {C_BLUE}Target Endpoint:{RESET} {C_CYAN}{result['target_url']}{RESET}")
    print(f"{C_PINK}[SUCCESS]{RESET} {C_BLUE}Status Code:{RESET} {C_CYAN}{result['statusCode']}{RESET}")
    print(f"{C_PINK}[SUCCESS]{RESET} {C_BLUE}Total Genres:{RESET} {C_CYAN}{result['total_genres']} genres found{RESET}")
    print(f"{C_PINK}[SUCCESS]{RESET} {C_BLUE}Elapsed Time:{RESET} {C_CYAN}{execution_time} seconds{RESET}")
    print(f" {C_PURPLE}──────────────────────────────────────────────────────────────────────{RESET}")
    
    print(f"{C_PINK}[RAW JSON DATA BUFFER]:{RESET}")
    print(f"{C_CYAN}{json.dumps(result, indent=4, ensure_ascii=False)}{RESET}")
    
    print(f"{C_PURPLE} ──────────────────────────────────────────────────────────────────────{RESET}")
    print(f"{C_PINK}[!] Operational complete. Vexalyn Scraper core closed safely.{RESET}\n")

if __name__ == "__main__":
    asyncio.run(main())