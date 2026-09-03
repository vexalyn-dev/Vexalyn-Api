# detail.py
import sys
import asyncio
import json
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote, urlparse
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
  █████╗ ███╗   ██║██║███╗   ███╗███████╗██╗  ██╗██╗███╗   ██║
██╔══██╗████╗  ██║██║████╗ ████║██╔════╝╚██╗██╔╝██║████╗  ██║
███████║██╔██╗ ██║██║██╔████╔██║█████╗   ╚███╔╝ ██║██╔██╗ ██║
██╔══██║██║╚██╗██║██║██║╚██╔╝██║██╔══╝   ██╔██╗ ██║██║╚██╗██║
██║  ██║██║ ╚████║██║██║ ╚═╝ ██║███████╗██╔╝ ██╗██║██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝   ╚═╝
    """
    print(f"{C_PURPLE}{banner}{RESET}")
    print("─" * 125)
    print(f" {C_PINK}[Module]{RESET}                -> Animexin Detail Scraper Core (Strict Main Genres Fix)")
    print(f" {C_PINK}[Target Endpoint]{RESET}       -> https://animexin.dev/...")
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

def extract_indo_synopsis(raw_text: str) -> str:
    if not raw_text:
        return "No synopsis available."
    if "Indonesia" in raw_text:
        parts = raw_text.split("Indonesia", 1)
        if len(parts) > 1:
            indo_text = parts[1].strip()
            if indo_text.startswith(":") or indo_text.startswith("-"):
                indo_text = indo_text[1:].strip()
            return indo_text
    return raw_text

async def resolve_url_from_input(user_input: str) -> str:
    parsed = urlparse(user_input)
    if parsed.scheme and parsed.netloc:
        return user_input
    
    slug = user_input.strip().lower().replace(":", "").replace(" - ", "-").replace(" ", "-")
    direct_url = f"https://animexin.dev/{slug}/"
    
    check_html = await get_page_content(direct_url)
    if check_html:
        return direct_url
        
    search_url = f"https://animexin.dev/?s={quote(user_input)}"
    search_html = await get_page_content(search_url)
    if search_html:
        soup = BeautifulSoup(search_html, 'html.parser')
        first_result = soup.select_one('article.bs a.tip, .listupd article.bs a')
        if first_result and first_result.get('href'):
            return first_result.get('href')
            
    return direct_url

async def scrape_detail(url_input: str):
    target_url = await resolve_url_from_input(url_input)
    t_start = time.time()
    
    html_content = await get_page_content(target_url)
    elapsed = round(time.time() - t_start, 2)
    
    status_code = 200 if html_content else 500
    
    response = {
        "creator": "Vexalyn Developer",
        "target_url": target_url,
        "statusCode": status_code,
        "status": "success" if status_code == 200 else "error",
        "message": "Mantap! Berhasil menarik data detail anime Animexin." if status_code == 200 else "Gagal mengambil halaman detail anime.",
        "ok": status_code == 200,
        "elapsed_time": f"{elapsed} seconds",
        "data": {}
    }

    if status_code != 200 or not html_content:
        response["ok"] = False
        return response

    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Judul Utama
        h1_el = soup.select_one('h1.entry-title, .infox h1, h1')
        raw_title = h1_el.text.strip() if h1_el else "Unknown Title"
        title = clean_duplicated_title(raw_title)

        # Poster / Thumbnail
        img_el = soup.select_one('.thumb img, .poster img, .ts-post-image')
        thumbnail = ""
        if img_el:
            thumbnail = img_el.get('data-src') or img_el.get('src') or ""

        # Rating
        rating_el = soup.select_one('.rating .num, .mscrs .rt, span[itemprop="ratingValue"], .rt-mscrs, .rating strong, div[class*="rating"] i, .akor span')
        if rating_el:
            rating = rating_el.text.strip()
        else:
            score_el = soup.select_one('div[class*="rating"] span, .account-rating, .point')
            rating = score_el.text.strip() if score_el else "N/A"

        # Sinopsis (Bahasa Indonesia Only)
        synopsis_els = soup.select('.entry-content p, .desc p, .synopsis p')
        raw_synopsis = " ".join([p.text.strip() for p in synopsis_els]) if synopsis_els else "No synopsis available."
        synopsis = extract_indo_synopsis(raw_synopsis)

        # Info Detail (Bersih dari key sampah)
        ignored_keys = {"fansub", "posted_by", "released_on", "updated_on", "posted by", "released on", "updated on"}
        info_data = {}
        info_rows = soup.select('.info-content .spe span, .spe span, .lexicon span')
        for row in info_rows:
            text = row.text.strip()
            if ":" in text:
                parts = text.split(":", 1)
                raw_key = parts[0].strip()
                key = raw_key.lower().replace(" ", "_")
                val = parts[1].strip()
                
                if raw_key.lower() in ignored_keys or key in ignored_keys:
                    continue
                
                info_data[key] = val

        # Genre List (Strict: Hanya ambil dari kontainer informasi utama / .infox / .genxinf, hindari sidebar)
        genres = []
        main_content_area = soup.select_one('.infox, .entry-content, .main-info')
        if main_content_area:
            genre_links = main_content_area.select('a[href*="/genres/"]')
        else:
            genre_links = soup.select('.genxinf a, .genres a')

        for g in genre_links:
            g_text = g.text.strip()
            if g_text and g_text.lower() != "genres" and g_text not in genres:
                genres.append(g_text)

        response["data"] = {
            "title": title,
            "thumbnail": thumbnail,
            "rating": rating,
            "genres": genres if genres else ["Action", "Fantasy"],
            "synopsis": synopsis,
            "info": info_data
        }

    except Exception as e:
        response["statusCode"] = 500
        response["status"] = "error"
        response["message"] = f"Waduh ada error saat parsing detail Animexin: {str(e)}"
        response["ok"] = False

    return response

async def main():
    print_banner()
    
    print(f"\n{C_PINK}[?]{RESET} {C_BLUE}Masukkan URL atau Judul Detail Anime Animexin:{RESET}")
    url_input = input(f" {C_PURPLE}╰─ URL / Judul [default: Renegade Immortal Movie...]:{RESET} ").strip()
    
    if not url_input:
        target_input = "https://animexin.dev/renegade-immortal-movie-battle-of-the-gods/"
    else:
        target_input = url_input

    print()
    await loading_animation("Menghubungkan ke Halaman Detail Animexin", 0.3)
    await loading_animation("Mengambil genre utama secara akurat", 0.4)
    
    print(f"\n{C_PINK}[*]{RESET} {C_BLUE}Processing Animexin detail extraction...{RESET}")
    
    start_time = time.time()
    result = await scrape_detail(target_input)
    execution_time = round(time.time() - start_time, 2)
    
    print(f" {C_PURPLE}──────────────────────────────────────────────────────────────────────{RESET}")
    print(f"{C_PINK}[SUCCESS]{RESET} {C_BLUE}Target URL:{RESET} {C_CYAN}{result['target_url']}{RESET}")
    print(f"{C_PINK}[SUCCESS]{RESET} {C_BLUE}Status Code:{RESET} {C_CYAN}{result['statusCode']}{RESET}")
    print(f"{C_PINK}[SUCCESS]{RESET} {C_BLUE}Elapsed Time:{RESET} {C_CYAN}{execution_time} seconds{RESET}")
    print(f" {C_PURPLE}──────────────────────────────────────────────────────────────────────{RESET}")
    
    print(f"{C_PINK}[RAW JSON DATA BUFFER]:{RESET}")
    print(f"{C_CYAN}{json.dumps(result, indent=4, ensure_ascii=False)}{RESET}")
    
    print(f"{C_PURPLE} ──────────────────────────────────────────────────────────────────────{RESET}")
    print(f"{C_PINK}[!] Operational complete. Vexalyn Scraper core closed safely.{RESET}\n")

if __name__ == "__main__":
    asyncio.run(main())