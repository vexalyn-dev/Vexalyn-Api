# home.py
import sys
import asyncio
import json
import time
import re
from bs4 import BeautifulSoup
from core.browser import get_page_content

# Set stdout encoding untuk Windows - PENTING: Hapus ini jika dipanggil dari FastAPI
# if sys.platform == 'win32':
#     import io
#     sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ANSI Colors - Cyber Punk Minimalist
C_GREEN = "\033[92m"
C_CYAN = "\033[96m"
C_WHITE = "\033[97m"
C_RED = "\033[91m"
C_GRAY = "\033[90m"
RESET = "\033[0m"

async def loading_animation(text: str, duration: float = 0.3):  # REDUCED: 2.0s -> 0.3s
    """Animasi terminal ala Vexalyn Developer (ASCII Safe) - OPTIMIZED."""
    chars = ["-", "\\", "|", "/"]
    end_time = time.time() + duration
    i = 0
    while time.time() < end_time:
        sys.stdout.write(f"\r{C_CYAN}[{chars[i % len(chars)]}]{RESET} {text}...")
        sys.stdout.flush()
        await asyncio.sleep(0.05)  # REDUCED: 0.1s -> 0.05s
        i += 1
    print(f"\r{C_GREEN}[OK]{RESET} {text} DONE.")
    sys.stdout.flush()

def print_banner():
    """Identitas Vexalyn Developer."""
    banner = r"""
$$\    $$\                              $$\                           $$$$$$$\                      
$$ |   $$ |                             $$ |                          $$  __$$\                     
$$ |   $$ | $$$$$$\  $$\   $$\ $$$$$$\  $$ |$$\   $$\ $$$$$$$\        $$ |  $$ | $$$$$$\ $$\    $$\ 
\$$\  $$  |$$  __$$\ \$$\ $$  |\____$$\ $$ |$$ |  $$ |$$  __$$\       $$ |  $$ |$$  __$$\\$$\  $$  |
 \$$\$$  / $$$$$$$$ | \$$$$  / $$$$$$$ |$$ |$$ |  $$ |$$ |  $$ |      $$ |  $$ |$$$$$$$$ |\$$\$$  / 
  \$$$  /  $$   ____| $$  $$< $$  __$$ |$$ |$$ |  $$ |$$ |  $$ |      $$ |  $$ |$$   ____| \$$$  /  
   \$  /   \$$$$$$$\ $$  /\$$\\$$$$$$$ |$$ |\$$$$$$$ |$$ |  $$ |      $$$$$$$  |\$$$$$$$\   \$  /   
    \_/     \_______|\__/  \__|\_______|\__| \____$$ |\__|  \__|      \_______/  \_______|   \_/    
                                            $$\   $$ |                                              
                                            \$$$$$$  |                                              
                                             \______/                                               
 ================================================================
 ANICHIN SCRAPER - Donghua Extraction Engine
 ================================================================
 [Module]          -> Home Scraper (home.py)
 [Target]          -> https://anichin.watch/
 [Developer]       -> Vexalyn Developer
 ================================================================"""
    print(f"{C_GREEN}{banner}{RESET}")

def extract_episode_number(text):
    """Extract episode number dari title atau text."""
    if not text:
        return "N/A"
    
    # Pattern untuk match "Episode 123" atau "EP 123" atau "Ep. 123"
    patterns = [
        r'[Ee]pisode\s+(\d+)',
        r'[Ee][Pp]\.?\s*(\d+)',
        r'[Ee]p\s+(\d+)',
        r'-\s*(\d+)\s*$',  # Untuk format "Series Name - 123"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return f"Episode {match.group(1)}"
    
    return "Full Series"

async def scrape_home_data():
    # URL yang benar dari screenshot user
    url = "https://anichin.watch/"
    html_content, error = await get_page_content(url)
    
    response = {
        "creator": "Vexalyn Developer",
        "statusCode": 200,
        "status": "success",
        "message": "Data fetched successfully",
        "ok": True,
        "total_data": 0,
        "data": []
    }
    
    if error:
        response["statusCode"] = 500
        response["status"] = "error"
        response["message"] = f"Failed to load home page: {error}"
        response["ok"] = False
        return response

    soup = BeautifulSoup(html_content, 'html.parser')

    page_title = soup.title.string.strip() if soup.title and soup.title.string else "No Title"
    print(f"{C_CYAN}[DEBUG-DOM]{RESET} Page captured: {C_WHITE}{page_title}{RESET}")

    # Extract data dari halaman
    extracted_data = []
    
    # Pattern 1: Cari semua <a> dengan href yang terlihat seperti post/series
    all_links = soup.find_all('a', href=True)
    print(f"{C_CYAN}[DEBUG-LINKS]{RESET} Total links found: {len(all_links)}")
    
    for a_tag in all_links:
        try:
            href = a_tag.get('href', '')
            title = a_tag.get('title') or a_tag.get_text(strip=True) or a_tag.get('aria-label', '')
            
            # Filter: harus ada href yang terlihat valid
            if not href or len(href) < 5:
                continue
            
            # Skip link yang jelek
            if any(skip in href.lower() for skip in ['#', 'javascript', 'genre', 'tag=', 'page=', 'wp-content', 'feed', 'wp-json', 'layarotaku']):
                continue
            
            # Cari gambar di dekat link
            img_tag = a_tag.find('img')
            if not img_tag:
                # Coba parent juga
                parent = a_tag.parent
                if parent:
                    img_tag = parent.find('img')
            
            thumb = None
            if img_tag:
                thumb = img_tag.get('data-src') or img_tag.get('src') or img_tag.get('data-lazy-src')
                if thumb and thumb.startswith('/'):
                    thumb = "https://anichin.watch" + thumb
            
            # Kalo ada gambar dan title yang valid, simpan
            if title and len(title) >= 5 and thumb and 'logo' not in thumb.lower():
                # Extract episode number dari title
                episode = extract_episode_number(title)
                
                extracted_data.append({
                    "title": title[:80],
                    "url": href,
                    "latest_episode": episode,
                    "thumbnail": thumb
                })
        except Exception as e:
            continue

    # Pattern 2: Cari dari struktur post/article jika pattern 1 tidak cukup
    if len(extracted_data) < 5:
        articles = soup.find_all(['article', 'div'], class_=lambda c: c and ('post' in c.lower() or 'product' in c.lower() or 'item' in c.lower()))
        
        for article in articles:
            try:
                a_tag = article.find('a', href=True)
                img_tag = article.find('img')
                
                if not a_tag or not img_tag:
                    continue
                
                href = a_tag.get('href', '')
                title = a_tag.get('title') or img_tag.get('alt') or a_tag.get_text(strip=True)
                thumb = img_tag.get('data-src') or img_tag.get('src') or img_tag.get('data-lazy-src')
                
                if not href or not title or len(title) < 5:
                    continue
                
                if thumb and thumb.startswith('/'):
                    thumb = "https://anichin.watch" + thumb
                
                # Extract episode
                episode = extract_episode_number(title)
                
                extracted_data.append({
                    "title": title[:80],
                    "url": href,
                    "latest_episode": episode,
                    "thumbnail": thumb
                })
            except Exception:
                continue

    # Filter duplikat dan data yang tidak valid
    seen_urls = set()
    unique_data = []
    for d in extracted_data:
        if d['url'] not in seen_urls and d.get('thumbnail') and 'logo' not in d['thumbnail'].lower():
            seen_urls.add(d['url'])
            unique_data.append(d)

    response["total_data"] = len(unique_data)
    response["data"] = unique_data

    if response["total_data"] == 0:
        response["message"] = "0 Data found. HTML structure may have changed."
        print(f"\n{C_CYAN}[DEBUG-STATS]{RESET} Total <a> tags: {len(all_links)}")
        print(f"{C_CYAN}[DEBUG-STATS]{RESET} Total extracted (before filter): {len(extracted_data)}")

    return response

async def main():
    """Entry point utama."""
    start_time = time.time()
    
    print_banner()
    await loading_animation("Initializing Vexalyn Engine", 1.0)
    await loading_animation("Bypassing Protections via Playwright", 1.0)
    
    print(f"\n{C_GRAY}[*] Processing payload hook onto target DOM structure...{RESET}")
    
    # Main scraping
    result = await scrape_home_data()
    
    # Print hasil
    elapsed = time.time() - start_time
    
    sep = " " + ("─" * 61)
    print(f"{C_GRAY}{sep}{RESET}")
    
    if result['ok']:
        print(f"{C_GREEN}[SUCCESS]{RESET} Status Code: {result['statusCode']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} Payload Size: {result['total_data']} items extracted")
        print(f"{C_GREEN}[SUCCESS]{RESET} Elapsed Time: {elapsed:.2f} seconds")
    else:
        print(f"{C_RED}[CRITICAL ERROR]{RESET} Execution aborted.")
        print(f"{C_RED}[REASON]{RESET} {result['message']}")
    
    print(f"{C_GRAY}{sep}{RESET}")
    
    # Print JSON dengan encoding yang aman untuk Windows
    try:
        json_output = json.dumps(result, indent=4, ensure_ascii=False)
        print(f"\n{C_WHITE}[RAW JSON DATA BUFFER]:{RESET}")
        print(json_output)
    except UnicodeEncodeError:
        # Fallback: gunakan ensure_ascii=True jika Unicode gagal
        json_output = json.dumps(result, indent=4, ensure_ascii=True)
        print(f"\n{C_WHITE}[RAW JSON DATA BUFFER]:{RESET}")
        print(json_output)
    
    print(f"{C_GRAY}{sep}{RESET}")
    print(f"{C_GRAY}[!] Operational complete. Vexalyn Scraper core closed safely.{RESET}")

if __name__ == "__main__":
    asyncio.run(main())
