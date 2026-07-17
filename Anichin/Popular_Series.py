# Popular_Series.py
import sys
import asyncio
import json
import time
from bs4 import BeautifulSoup
from core.browser import get_page_content

# ANSI Colors
C_GREEN = "\033[92m"
C_CYAN = "\033[96m"
C_WHITE = "\033[97m"
C_RED = "\033[91m"
C_YELLOW = "\033[93m"
C_GRAY = "\033[90m"
RESET = "\033[0m"

# Valid filter values
VALID_RANGES = {
    "weekly": "wpop-weekly",
    "monthly": "wpop-monthly",
    "all": "wpop-alltime",
    "alltime": "wpop-alltime"
}

async def loading_animation(text: str, duration: float = 0.3):
    """Animasi terminal ala Vexalyn Developer."""
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
    """Banner untuk popular series scraper."""
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
 POPULAR SERIES SCRAPER - Weekly / Monthly / All Time Rankings
 ================================================================
 [Module]          -> Popular Series Scraper (Popular_Series.py)
 [Target]          -> Popular Series Section (Sidebar)
 [Filter]          -> weekly | monthly | all
 [Developer]       -> Vexalyn Developer
 ================================================================"""
    print(f"{C_GREEN}{banner}{RESET}")

def parse_popular_items(soup: BeautifulSoup, css_class: str) -> list:
    """
    Parse list items dari div dengan class tertentu.
    
    Struktur HTML:
    div.serieslist.pop.wpop.{css_class}
      ul
        li
          div.ctr          -> rank number
          div.imgseries
            a > img        -> thumbnail
          div.leftseries
            h4 > a         -> title + url
            span > a       -> genres
            div.numscore   -> rating
    """
    container = soup.find('div', class_=['serieslist', 'pop', 'wpop', css_class])
    if not container:
        # Fallback: cari dengan partial class match
        container = soup.find('div', class_=lambda c: c and css_class in c if c else False)
    
    if not container:
        print(f"{C_RED}[ERROR]{RESET} Container '{css_class}' not found!")
        return []
    
    items = []
    list_items = container.find('ul').find_all('li') if container.find('ul') else []
    
    print(f"{C_CYAN}[DEBUG]{RESET} Found {len(list_items)} items in '{css_class}'")
    
    for li in list_items:
        try:
            # === Rank ===
            ctr_div = li.find('div', class_='ctr')
            rank = int(ctr_div.get_text(strip=True)) if ctr_div else 0
            
            # === Title & URL ===
            leftseries = li.find('div', class_='leftseries')
            if not leftseries:
                continue
            
            title_tag = leftseries.find('h4')
            a_tag = title_tag.find('a') if title_tag else None
            if not a_tag:
                continue
            
            title = a_tag.get_text(strip=True)
            url = a_tag.get('href', '').strip()
            series_id = a_tag.get('rel', [''])[0] if a_tag.get('rel') else ''
            
            # === Thumbnail ===
            img_div = li.find('div', class_='imgseries')
            img_tag = img_div.find('img') if img_div else None
            thumbnail = ''
            if img_tag:
                # Ambil src, data-src, atau data-lazy-src (lazy loading)
                thumbnail = (
                    img_tag.get('src') or
                    img_tag.get('data-src') or
                    img_tag.get('data-lazy-src') or
                    ''
                )
            
            # === Genres ===
            genres = []
            genre_span = leftseries.find('span')
            if genre_span:
                genre_links = genre_span.find_all('a', rel='tag')
                genres = [g.get_text(strip=True) for g in genre_links]
            
            # === Rating ===
            numscore = leftseries.find('div', class_='numscore')
            rating = numscore.get_text(strip=True) if numscore else 'N/A'
            
            # === Rating bar (percentage) ===
            rtb_span = leftseries.find('span', style=lambda s: s and 'width' in s if s else False)
            rating_percent = ''
            if rtb_span:
                style = rtb_span.get('style', '')
                # Extract "width:88.3%"
                import re
                match = re.search(r'width\s*:\s*([\d.]+)%', style)
                rating_percent = match.group(1) + '%' if match else ''
            
            items.append({
                "rank": rank,
                "title": title,
                "url": url,
                "thumbnail": thumbnail,
                "genres": genres,
                "rating": rating,
                "rating_percent": rating_percent
            })
            
        except Exception as e:
            print(f"{C_RED}[ERROR]{RESET} Failed to parse item: {e}")
            continue
    
    return items

async def scrape_popular_series(range_filter: str = "weekly"):
    """
    Scrape popular series dari anichin.watch.
    
    Args:
        range_filter: "weekly", "monthly", atau "all" / "alltime"
    
    Returns:
        Dictionary dengan rank, title, url, thumbnail, genres, rating
    """
    # Normalize filter
    range_filter = range_filter.lower().strip()
    if range_filter not in VALID_RANGES:
        return {
            "creator": "Vexalyn Developer",
            "statusCode": 400,
            "status": "error",
            "message": f"Invalid range filter '{range_filter}'. Use: weekly, monthly, or all",
            "ok": False,
            "filter": range_filter,
            "total_data": 0,
            "data": []
        }
    
    css_class = VALID_RANGES[range_filter]
    # Normalize ke display label
    range_label = "All Time" if range_filter in ("all", "alltime") else range_filter.capitalize()
    
    response = {
        "creator": "Vexalyn Developer",
        "statusCode": 200,
        "status": "success",
        "message": f"Popular series ({range_label}) fetched successfully",
        "ok": True,
        "filter": range_label,
        "total_data": 0,
        "data": []
    }
    
    url = "https://anichin.watch/"
    html_content, error = await get_page_content(url)
    
    if error:
        response["statusCode"] = 500
        response["status"] = "error"
        response["message"] = f"Failed to load page: {error}"
        response["ok"] = False
        return response
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    page_title = soup.title.string.strip() if soup.title and soup.title.string else "No Title"
    print(f"{C_CYAN}[DEBUG-DOM]{RESET} Page: {C_WHITE}{page_title}{RESET}")
    
    # Verifikasi container popular series ada
    wpop_container = soup.find('div', id='wpop-items')
    if not wpop_container:
        print(f"{C_RED}[ERROR]{RESET} #wpop-items container not found!")
        response["statusCode"] = 500
        response["status"] = "error"
        response["message"] = "Popular series section not found. Website structure may have changed."
        response["ok"] = False
        return response
    
    print(f"{C_GREEN}[OK]{RESET} Found #wpop-items container")
    
    # Parse items
    items = parse_popular_items(wpop_container, css_class)
    
    response["total_data"] = len(items)
    response["data"] = items
    
    if len(items) == 0:
        response["message"] = f"No popular series found for filter '{range_label}'."
        print(f"\n{C_YELLOW}[WARNING]{RESET} No items extracted for '{css_class}'")
    else:
        print(f"\n{C_GREEN}[INFO]{RESET} Successfully extracted {len(items)} popular series ({range_label})")
    
    return response

async def main():
    """Entry point untuk testing popular series scraper."""
    import sys
    
    # Ambil filter dari argument atau default weekly
    range_filter = sys.argv[1] if len(sys.argv) > 1 else "weekly"
    
    start_time = time.time()
    
    print_banner()
    await loading_animation("Initializing Vexalyn Popular Series Engine", 0.5)
    await loading_animation(f"Target filter: {range_filter.upper()}", 0.3)
    
    print(f"\n{C_GRAY}[*] Extracting popular series from DOM...{RESET}")
    
    result = await scrape_popular_series(range_filter)
    
    elapsed = time.time() - start_time
    sep = " " + ("-" * 61)
    
    print(f"{C_GRAY}{sep}{RESET}")
    
    if result['ok']:
        print(f"{C_GREEN}[SUCCESS]{RESET} Status Code : {result['statusCode']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} Filter      : {result['filter']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} Items Found : {result['total_data']} series")
        print(f"{C_GREEN}[SUCCESS]{RESET} Elapsed     : {elapsed:.2f} seconds")
    else:
        print(f"{C_RED}[FAILED]{RESET} {result['message']}")
    
    print(f"{C_GRAY}{sep}{RESET}")
    
    # Print JSON output
    try:
        json_output = json.dumps(result, indent=4, ensure_ascii=False)
        print(f"\n{C_WHITE}[RAW JSON DATA BUFFER]:{RESET}")
        print(json_output)
    except UnicodeEncodeError:
        json_output = json.dumps(result, indent=4, ensure_ascii=True)
        print(f"\n{C_WHITE}[RAW JSON DATA BUFFER]:{RESET}")
        print(json_output)
    
    print(f"{C_GRAY}{sep}{RESET}")
    print(f"{C_GRAY}[!] Popular series extraction complete.{RESET}")

if __name__ == "__main__":
    asyncio.run(main())
