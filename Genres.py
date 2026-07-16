# Genres.py
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
    """Banner untuk genres scraper."""
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
 ANICHIN SCRAPER - Genre List Extractor
 ================================================================
 [Module]          -> Genres Scraper (Genres.py)
 [Target]          -> https://anichin.watch/
 [Developer]       -> Vexalyn Developer
 ================================================================"""
    print(f"{C_GREEN}{banner}{RESET}")

async def scrape_genres():
    """
    Scrape daftar genre dari Anichin.
    Returns:
        Dictionary dengan list genre beserta URL dan count
    """
    url = "https://anichin.watch/"
    
    response = {
        "creator": "Vexalyn Developer",
        "statusCode": 200,
        "status": "success",
        "message": "Genre list fetched successfully",
        "ok": True,
        "total_genres": 0,
        "data": []
    }
    
    html_content, error = await get_page_content(url)
    if error:
        response["statusCode"] = 500
        response["status"] = "error"
        response["message"] = f"Failed to load genres: {error}"
        response["ok"] = False
        return response

    soup = BeautifulSoup(html_content, 'html.parser')

    page_title = soup.title.string.strip() if soup.title and soup.title.string else "No Title"
    print(f"{C_CYAN}[DEBUG-DOM]{RESET} Page captured: {C_WHITE}{page_title}{RESET}")

    genres = []
    
    # Pattern 1: Cari di menu navigasi - biasanya ada dropdown/list genre
    genre_containers = (
        soup.find_all('ul', class_=lambda c: c and 'genre' in c.lower()) +
        soup.find_all('div', class_=lambda c: c and 'genre' in c.lower()) +
        soup.find_all('ul', id=lambda i: i and 'genre' in i.lower()) +
        soup.find_all('div', id=lambda i: i and 'genre' in i.lower())
    )
    
    print(f"{C_CYAN}[DEBUG-GENRE]{RESET} Found {len(genre_containers)} potential genre containers")
    
    for container in genre_containers:
        links = container.find_all('a', href=True)
        for a_tag in links:
            try:
                href = a_tag.get('href', '')
                full_text = a_tag.get_text(strip=True)
                
                if not href or 'genre' not in href.lower():
                    continue
                
                if not full_text or len(full_text) < 2:
                    continue
                
                # Extract count dari text yang ada dalam kurung
                count_text = "0"
                name = full_text
                
                # Pattern 1: "Action (123)" format
                match = re.search(r'^(.+?)\s*\((\d+)\)\s*$', full_text)
                if match:
                    name = match.group(1).strip()
                    count_text = match.group(2)
                else:
                    # Pattern 2: Cari span dengan class count
                    count_span = a_tag.find('span', class_=lambda c: c and 'count' in c.lower())
                    if count_span:
                        count_num = re.search(r'(\d+)', count_span.get_text())
                        if count_num:
                            count_text = count_num.group(1)
                            # Remove count span dari name
                            name = a_tag.get_text(strip=True).replace(count_span.get_text(strip=True), '').strip()
                
                genres.append({
                    "name": name,
                    "url": href
                })
            except Exception:
                continue
    
    # Pattern 2: Fallback - cari semua link yang mengandung "/genre/" di URL
    if len(genres) < 5:
        print(f"{C_YELLOW}[FALLBACK]{RESET} Using fallback genre detection...")
        all_links = soup.find_all('a', href=True)
        
        for a_tag in all_links:
            try:
                href = a_tag.get('href', '')
                full_text = a_tag.get_text(strip=True)
                
                if '/genre/' not in href.lower():
                    continue
                
                if not full_text or len(full_text) < 2 or len(full_text) > 40:
                    continue
                
                # Extract name dan count
                count_text = "0"
                name = full_text
                
                match = re.search(r'^(.+?)\s*\((\d+)\)\s*$', full_text)
                if match:
                    name = match.group(1).strip()
                    count_text = match.group(2)
                
                genres.append({
                    "name": name,
                    "url": href
                })
            except Exception:
                continue
    
    # Pattern 3: Cari dari tag cloud atau widget
    if len(genres) < 5:
        print(f"{C_YELLOW}[FALLBACK2]{RESET} Checking tag clouds and widgets...")
        widgets = soup.find_all(['div', 'aside'], class_=lambda c: c and ('widget' in c.lower() or 'tag' in c.lower()))
        
        for widget in widgets:
            links = widget.find_all('a', href=True)
            for a_tag in links:
                try:
                    href = a_tag.get('href', '')
                    full_text = a_tag.get_text(strip=True)
                    
                    if '/genre/' not in href.lower() and 'genre' not in href.lower():
                        continue
                    
                    if not full_text or len(full_text) < 2 or len(full_text) > 40:
                        continue
                    
                    count_text = "0"
                    name = full_text
                    
                    match = re.search(r'^(.+?)\s*\((\d+)\)\s*$', full_text)
                    if match:
                        name = match.group(1).strip()
                        count_text = match.group(2)
                    
                    genres.append({
                        "name": name,
                        "url": href,
                        "count": count_text
                    })
                except Exception:
                    continue
    
    # Filter duplikat berdasarkan URL
    seen_urls = set()
    unique_genres = []
    for genre in genres:
        if genre['url'] not in seen_urls:
            seen_urls.add(genre['url'])
            unique_genres.append(genre)
    
    # Sort by name
    unique_genres.sort(key=lambda x: x['name'].lower())
    
    response["total_genres"] = len(unique_genres)
    response["data"] = unique_genres
    
    if response["total_genres"] == 0:
        response["message"] = "No genres found. Website structure may have changed."
        print(f"\n{C_RED}[WARNING]{RESET} No genres detected. Manual inspection needed.")
    
    return response

async def main():
    """Entry point untuk testing genres scraper."""
    start_time = time.time()
    
    print_banner()
    await loading_animation("Initializing Vexalyn Genre Engine", 0.5)
    await loading_animation("Bypassing Protections via Playwright", 0.5)
    
    print(f"\n{C_GRAY}[*] Extracting genre taxonomy from target DOM...{RESET}")
    
    # Main scraping
    result = await scrape_genres()
    
    # Print hasil
    elapsed = time.time() - start_time
    
    sep = " " + ("─" * 61)
    print(f"{C_GRAY}{sep}{RESET}")
    
    if result['ok']:
        print(f"{C_GREEN}[SUCCESS]{RESET} Status Code: {result['statusCode']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} Genres Found: {result['total_genres']} items")
        print(f"{C_GREEN}[SUCCESS]{RESET} Elapsed Time: {elapsed:.2f} seconds")
    else:
        print(f"{C_RED}[CRITICAL ERROR]{RESET} Genre extraction failed.")
        print(f"{C_RED}[REASON]{RESET} {result['message']}")
    
    print(f"{C_GRAY}{sep}{RESET}")
    
    # Print JSON dengan encoding yang aman untuk Windows
    try:
        json_output = json.dumps(result, indent=4, ensure_ascii=False)
        print(f"\n{C_WHITE}[RAW JSON DATA BUFFER]:{RESET}")
        print(json_output)
    except UnicodeEncodeError:
        json_output = json.dumps(result, indent=4, ensure_ascii=True)
        print(f"\n{C_WHITE}[RAW JSON DATA BUFFER]:{RESET}")
        print(json_output)
    
    print(f"{C_GRAY}{sep}{RESET}")
    print(f"{C_GRAY}[!] Genre extraction complete. Vexalyn Scraper core closed safely.{RESET}")

if __name__ == "__main__":
    asyncio.run(main())
