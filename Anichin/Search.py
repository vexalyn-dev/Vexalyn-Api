# search.py
import sys
import asyncio
import json
import time
import re
import urllib.parse
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
C_YELLOW = "\033[93m"
C_GRAY = "\033[90m"
RESET = "\033[0m"

async def loading_animation(text: str, duration: float = 0.3):  # REDUCED: 1.0s -> 0.3s
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

def print_banner(query: str):
    """Banner untuk search scraper."""
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
 ANICHIN SCRAPER - Search Engine
 ================================================================
 [Module]          -> Search Scraper (search.py)
 [Target]          -> https://anichin.watch/
 [Search Query]    -> "{}"
 [Developer]       -> Vexalyn Developer
 ================================================================""".format(query)
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

def extract_status(item_soup):
    """Extract status (Ongoing/Completed) dari element."""
    # Pattern 1: Cari di div.bt > span.epx
    bt_div = item_soup.find('div', class_='bt')
    if bt_div:
        epx_span = bt_div.find('span', class_='epx')
        if epx_span:
            text = epx_span.get_text(strip=True)
            if text:
                return text
    
    # Pattern 2: Fallback - cari dari berbagai class yang mungkin
    status_candidates = [
        item_soup.find('div', class_=lambda c: c and 'status' in c.lower()),
        item_soup.find('span', class_=lambda c: c and 'status' in c.lower()),
        item_soup.find('div', class_=lambda c: c and 'badge' in c.lower()),
    ]
    
    for candidate in status_candidates:
        if candidate:
            text = candidate.get_text(strip=True)
            if text:
                return text
    
    return "N/A"

async def scrape_search(query: str):
    """
    Scrape hasil pencarian dari Anichin.
    Args:
        query: Kata kunci pencarian
    Returns:
        Dictionary dengan hasil scraping
    """
    encoded_query = urllib.parse.quote(query)
    url = f"https://anichin.watch/?s={encoded_query}"
    
    response = {
        "creator": "Vexalyn Developer",
        "statusCode": 200,
        "status": "success",
        "message": f"Search results for: '{query}'",
        "ok": True,
        "query": query,
        "total_data": 0,
        "data": []
    }
    
    html_content, error = await get_page_content(url)
    if error:
        response["statusCode"] = 500
        response["status"] = "error"
        response["message"] = f"Search feature failed: {error}"
        response["ok"] = False
        return response

    soup = BeautifulSoup(html_content, 'html.parser')

    page_title = soup.title.string.strip() if soup.title and soup.title.string else "No Title"
    print(f"{C_CYAN}[DEBUG-DOM]{RESET} Page captured: {C_WHITE}{page_title}{RESET}")

    search_results = []
    
    # Multiple patterns untuk cari hasil search
    # Pattern 1: Cari article/div dengan class yang umum untuk search results
    items = (
        soup.find_all('article', class_=lambda c: c and ('post' in c.lower() or 'entry' in c.lower())) or
        soup.find_all('div', class_=lambda c: c and ('post' in c.lower() or 'item' in c.lower() or 'result' in c.lower()))
    )
    
    print(f"{C_CYAN}[DEBUG-SEARCH]{RESET} Found {len(items)} potential results")
    
    for item in items:
        try:
            # Cari link dan title
            a_tag = item.find('a', href=True)
            if not a_tag:
                continue
            
            link = a_tag.get('href', '')
            if not link or len(link) < 5:
                continue
            
            # Skip link yang tidak valid
            if any(skip in link.lower() for skip in ['#', 'javascript', 'wp-content', 'feed', 'wp-json']):
                continue
            
            # Extract title dari berbagai sumber
            title = (
                a_tag.get('title') or
                item.find('h2').get_text(strip=True) if item.find('h2') else None or
                item.find('h3').get_text(strip=True) if item.find('h3') else None or
                a_tag.get_text(strip=True)
            )
            
            if not title or len(title) < 3:
                continue
            
            # Extract thumbnail
            img_tag = item.find('img')
            thumb = None
            if img_tag:
                thumb = img_tag.get('data-src') or img_tag.get('src') or img_tag.get('data-lazy-src')
                if thumb and thumb.startswith('/'):
                    thumb = "https://anichin.watch" + thumb
            
            # Skip jika tidak ada thumbnail valid
            if not thumb or 'logo' in thumb.lower():
                continue
            
            # Extract episode number
            episode = extract_episode_number(title)
            
            # Extract status
            status = extract_status(item)
            
            search_results.append({
                "title": title[:80],
                "url": link,
                "latest_episode": episode,
                "status": status,
                "thumbnail": thumb
            })
        except Exception as e:
            continue
    
    # Pattern 2: Jika pattern 1 gagal, cari dari semua link dengan gambar
    if len(search_results) < 1:
        print(f"{C_YELLOW}[FALLBACK]{RESET} Using fallback search pattern...")
        all_links = soup.find_all('a', href=True)
        
        for a_tag in all_links:
            try:
                href = a_tag.get('href', '')
                title = a_tag.get('title') or a_tag.get_text(strip=True)
                
                if not href or len(href) < 5 or not title or len(title) < 3:
                    continue
                
                # Filter: harus mengandung keyword pencarian
                if query.lower() not in title.lower():
                    continue
                
                # Skip link yang jelek
                if any(skip in href.lower() for skip in ['#', 'javascript', 'genre', 'tag=', 'page=', 'wp-content', 'feed', 'wp-json']):
                    continue
                
                # Cari gambar
                img_tag = a_tag.find('img')
                if not img_tag:
                    parent = a_tag.parent
                    if parent:
                        img_tag = parent.find('img')
                
                if not img_tag:
                    continue
                
                thumb = img_tag.get('data-src') or img_tag.get('src') or img_tag.get('data-lazy-src')
                if thumb and thumb.startswith('/'):
                    thumb = "https://anichin.watch" + thumb
                
                if not thumb or 'logo' in thumb.lower():
                    continue
                
                episode = extract_episode_number(title)
                
                search_results.append({
                    "title": title[:80],
                    "url": href,
                    "latest_episode": episode,
                    "status": "N/A",
                    "thumbnail": thumb
                })
            except Exception:
                continue
    
    # Filter duplikat
    seen_urls = set()
    unique_results = []
    for result in search_results:
        if result['url'] not in seen_urls:
            seen_urls.add(result['url'])
            unique_results.append(result)
    
    response["total_data"] = len(unique_results)
    response["data"] = unique_results
    
    if response["total_data"] == 0:
        response["message"] = f"No results found for: '{query}'. Try different keywords."
        print(f"\n{C_YELLOW}[SEARCH]{RESET} No results found for query: {query}")
    
    return response

async def main():
    """Entry point untuk testing search scraper."""
    # Jika tidak ada argument, return None (untuk digunakan sebagai module)
    if len(sys.argv) < 2:
        # Jangan print error jika dipanggil sebagai module/import
        if __name__ == "__main__":
            print(f"{C_RED}[ERROR]{RESET} Usage: python search.py <query>")
            print(f"{C_YELLOW}[EXAMPLE]{RESET} python search.py \"martial master\"")
            sys.exit(1)
        return None
    
    query = " ".join(sys.argv[1:])
    start_time = time.time()
    
    print_banner(query)
    await loading_animation("Initializing Vexalyn Search Engine", 0.8)
    await loading_animation("Bypassing Protections via Playwright", 0.8)
    
    print(f"\n{C_GRAY}[*] Processing search query: {C_WHITE}{query}{RESET}")
    
    # Main search
    result = await scrape_search(query)
    
    # Print hasil
    elapsed = time.time() - start_time
    
    sep = " " + ("─" * 61)
    print(f"{C_GRAY}{sep}{RESET}")
    
    if result['ok']:
        print(f"{C_GREEN}[SUCCESS]{RESET} Status Code: {result['statusCode']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} Results Found: {result['total_data']} items")
        print(f"{C_GREEN}[SUCCESS]{RESET} Elapsed Time: {elapsed:.2f} seconds")
    else:
        print(f"{C_RED}[CRITICAL ERROR]{RESET} Search failed.")
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
    print(f"{C_GRAY}[!] Search operation complete. Vexalyn Scraper core closed safely.{RESET}")

if __name__ == "__main__":
    asyncio.run(main())
