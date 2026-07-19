# Ongoing_Series.py
import sys
import asyncio
import json
import time
import re
from bs4 import BeautifulSoup
from core.browser import get_page_content

# ANSI Colors - Cyber Punk Minimalist
C_GREEN = "\033[92m"
C_CYAN = "\033[96m"
C_WHITE = "\033[97m"
C_RED = "\033[91m"
C_YELLOW = "\033[93m"
C_GRAY = "\033[90m"
RESET = "\033[0m"

async def loading_animation(text: str, duration: float = 0.3):
    """Animasi terminal ala Vexalyn Developer (ASCII Safe) - OPTIMIZED."""
    chars = ["-", "\\", "|", "/"]
    end_time = time.time() + duration
    i = 0
    while time.time() < end_time:
        sys.stdout.write(f"\r{C_CYAN}[{chars[i % len(chars)]}]{RESET} {text}...")
        sys.stdout.flush()
        await asyncio.sleep(0.05)
        i += 1
    print(f"\r{C_GREEN}[OK]{RESET} {text} DONE.")
    sys.stdout.flush()

def print_banner():
    """Banner untuk ongoing series scraper."""
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
 ONGOING SERIES SCRAPER - Extract Active Series
 ================================================================
 [Module]          -> Ongoing Series Scraper (Ongoing_Series.py)
 [Target]          -> Ongoing Series Section
 [Developer]       -> Vexalyn Developer
 ================================================================"""
    print(f"{C_GREEN}{banner}{RESET}")

def extract_episode_number(text):
    """Extract episode number dari title atau text."""
    if not text:
        return "N/A"
    
    patterns = [
        r'[Ee]pisode\s+(\d+)',
        r'[Ee][Pp]\.?\s*(\d+)',
        r'[Ee]p\s+(\d+)',
        r'-\s*(\d+)\s*$',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return f"Episode {match.group(1)}"
    
    return "Full Series"

def extract_rating(item_soup):
    """Extract rating dari element."""
    rating_div = item_soup.find('div', class_='rating')
    if rating_div:
        rating_text = rating_div.get_text(strip=True)
        return rating_text if rating_text else "N/A"
    return "N/A"

async def scrape_ongoing_series():
    """
    Scrape daftar ongoing series dari sidebar.
    Returns:
        Dictionary dengan list ongoing series (target: 25 items)
    """
    url = "https://anichin.watch/"
    
    response = {
        "creator": "Vexalyn Developer",
        "statusCode": 200,
        "status": "success",
        "message": "Ongoing series fetched successfully",
        "ok": True,
        "total_data": 0,
        "data": []
    }
    
    html_content, error = await get_page_content(url)
    if error:
        response["statusCode"] = 500
        response["status"] = "error"
        response["message"] = f"Failed to load ongoing series: {error}"
        response["ok"] = False
        return response

    soup = BeautifulSoup(html_content, 'html.parser')

    page_title = soup.title.string.strip() if soup.title and soup.title.string else "No Title"
    print(f"{C_CYAN}[DEBUG-DOM]{RESET} Page captured: {C_WHITE}{page_title}{RESET}")

    ongoing_series = []
    
    # Direct pattern: Cari div dengan class "ongoingseries" (sudah divalidasi dari debug HTML)
    ongoing_div = soup.find('div', class_='ongoingseries')
    
    if ongoing_div:
        list_items = ongoing_div.find_all('li')
        print(f"{C_CYAN}[DEBUG-ONGOING]{RESET} Found {len(list_items)} items in ongoingseries div")
        
        for item in list_items:
            try:
                a_tag = item.find('a', href=True)
                if not a_tag:
                    continue
                
                href = a_tag.get('href', '')
                title_full = a_tag.get('title', '').strip()
                
                if not href or not title_full:
                    continue
                
                # Extract episode dari <span class="r">
                episode_span = a_tag.find('span', class_='r')
                episode = episode_span.get_text(strip=True) if episode_span else "N/A"
                ep_match = re.search(r'\d+', episode)
                total_episode = f"Episode {ep_match.group(0)}" if ep_match else episode
                
                # Extract title bersih dari <span class="l"> (tanpa icon)
                title_span = a_tag.find('span', class_='l')
                if title_span:
                    # Remove icon element
                    for icon in title_span.find_all('i'):
                        icon.decompose()
                    title = title_span.get_text(strip=True)
                else:
                    title = title_full
                
                # Ongoing series tanpa thumbnail (simple & fast)
                ongoing_series.append({
                    "title": title,
                    "url": href,
                    "total_episode": total_episode,
                    "status": "Ongoing"
                })
            except Exception as e:
                print(f"{C_RED}[ERROR]{RESET} Failed to parse item: {e}")
                continue
    else:
        print(f"{C_RED}[ERROR]{RESET} 'ongoingseries' div not found!")
    
    # Tidak perlu filter duplikat karena data sudah dari single source
    response["total_data"] = len(ongoing_series)
    response["data"] = ongoing_series
    
    if response["total_data"] == 0:
        response["message"] = "No ongoing series found. Website structure may have changed."
        print(f"\n{C_RED}[WARNING]{RESET} No ongoing series detected.")
    else:
        print(f"\n{C_GREEN}[INFO]{RESET} Successfully extracted {response['total_data']} ongoing series")
    
    return response

async def main():
    """Entry point untuk testing ongoing series scraper."""
    start_time = time.time()
    
    print_banner()
    await loading_animation("Initializing Vexalyn Ongoing Series Engine", 0.5)
    await loading_animation("Bypassing Protections via Playwright", 0.5)
    
    print(f"\n{C_GRAY}[*] Extracting ongoing series from target DOM...{RESET}")
    
    # Main scraping
    result = await scrape_ongoing_series()
    
    # Print hasil
    elapsed = time.time() - start_time
    
    sep = " " + ("-" * 61)  # Ganti dash Unicode dengan ASCII
    print(f"{C_GRAY}{sep}{RESET}")
    
    if result['ok']:
        print(f"{C_GREEN}[SUCCESS]{RESET} Status Code: {result['statusCode']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} Series Found: {result['total_data']} items")
        print(f"{C_GREEN}[SUCCESS]{RESET} Elapsed Time: {elapsed:.2f} seconds")
    else:
        print(f"{C_RED}[CRITICAL ERROR]{RESET} Ongoing series extraction failed.")
        print(f"{C_RED}[REASON]{RESET} {result['message']}")
    
    print(f"{C_GRAY}{sep}{RESET}")
    
    # Print JSON
    try:
        json_output = json.dumps(result, indent=4, ensure_ascii=False)
        print(f"\n{C_WHITE}[RAW JSON DATA BUFFER]:{RESET}")
        print(json_output)
    except UnicodeEncodeError:
        json_output = json.dumps(result, indent=4, ensure_ascii=True)
        print(f"\n{C_WHITE}[RAW JSON DATA BUFFER]:{RESET}")
        print(json_output)
    
    print(f"{C_GRAY}{sep}{RESET}")
    print(f"{C_GRAY}[!] Ongoing series extraction complete. Vexalyn Scraper core closed safely.{RESET}")

if __name__ == "__main__":
    asyncio.run(main())
