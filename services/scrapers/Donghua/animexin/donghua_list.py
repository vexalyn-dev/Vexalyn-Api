# donghua_list.py
import sys
import asyncio
import json
import time
import re
from bs4 import BeautifulSoup
from core.browser import get_page_content

# ANSI Colors - Tema Pink, Ungu, Biru
C_PURPLE = "\033[35m"  # Ungu gelap
C_PINK = "\033[95m"    # Magenta / Pink terang
C_BLUE = "\033[94m"    # Biru terang
C_CYAN = "\033[96m"    # Biru Cyan
C_RED = "\033[91m"     # Merah (buat error)
RESET = "\033[0m"

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
    print(f" {C_PINK}[Module]{RESET}                -> Animexin Donghua List Scraper Core (Clean Title & Endpoint Fix)")
    print(f" {C_PINK}[Target Endpoint]{RESET}       -> https://animexin.dev/anime/")
    print(f" {C_PINK}[Developer]{RESET}             -> Vexalyn Developer")
    print("─" * 125)

def clean_title_and_episode(raw_title: str):
    """Membersihkan judul dari kata 'Episode X', 'Indonesia, English Sub', dan duplikasi judul"""
    if not raw_title:
        return "Unknown Title"
    
    # Hapus bagian "Episode X ..." atau "Sub" di belakang judul
    cleaned = re.sub(r'\s+Episode\s+\d+.*$', '', raw_title, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s+Indonesia,\s+English\s+Sub.*$', '', cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip()
    
    # Cek duplikasi string (jika judul tertulis dua kali lipat)
    length = len(cleaned)
    if length > 0 and length % 2 == 0:
        mid = length // 2
        if cleaned[:mid] == cleaned[mid:]:
            cleaned = cleaned[:mid]
            
    return cleaned.strip()

async def scrape_donghua_list(page: int = 1):
    # Target endpoint direktori anime asli Animexin dengan pagination query ?page=X
    if page > 1:
        target_url = f"https://animexin.dev/anime/?page={page}"
    else:
        target_url = "https://animexin.dev/anime/"

    t_start = time.time()
    
    html_content = await get_page_content(target_url)
    elapsed = round(time.time() - t_start, 2)
    
    status_code = 200 if html_content else 403
    
    response = {
        "creator": "Vexalyn Developer",
        "page": page,
        "target_url": target_url,
        "statusCode": status_code,
        "status": "success" if status_code == 200 else "error",
        "message": f"Mantap! Berhasil menarik data list anime Animexin halaman {page}." if status_code == 200 else f"Gagal mengambil halaman anime (Status Code: {status_code})",
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
            
            # Bersihkan judul dari nomor episode
            title = clean_title_and_episode(raw_title)
            
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

            items.append({
                "title": title,
                "url": link,
                "thumbnail": thumbnail,
                "type": dtype,
                "status": status_text,
                "label": sub_text
            })

        response["total_items"] = len(items)
        response["data"] = items

    except Exception as e:
        response["statusCode"] = 500
        response["status"] = "error"
        response["message"] = f"Waduh ada error saat parsing list anime Animexin: {str(e)}"
        response["ok"] = False

    return response

async def main():
    print_banner()
    
    print(f"\n{C_PINK}[?]{RESET} {C_BLUE}Masukkan Nomor Halaman (Page) List Anime:{RESET}")
    page_input = input(f" {C_PURPLE}╰─ Nomor Halaman [default: 1]:{RESET} ").strip()
    
    try:
        page = int(page_input) if page_input else 1
        if page < 1:
            page = 1
    except ValueError:
        page = 1

    print()
    await loading_animation("Menghubungkan ke Direktori Anime Animexin", 0.3)
    await loading_animation(f"Mengambil payload data halaman ke-{page}", 0.4)
    
    print(f"\n{C_PINK}[*]{RESET} {C_BLUE}Processing Animexin anime list extraction...{RESET}")
    
    start_time = time.time()
    result = await scrape_donghua_list(page)
    execution_time = round(time.time() - start_time, 2)
    
    print(f" {C_PURPLE}──────────────────────────────────────────────────────────────────────{RESET}")
    print(f"{C_PINK}[SUCCESS]{RESET} {C_BLUE}Page Target:{RESET} {C_CYAN}Page {result['page']}{RESET}")
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