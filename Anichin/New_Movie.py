# New_Movie.py
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
    """Banner untuk new movie scraper."""
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
 NEW MOVIE SCRAPER - Latest Donghua Movies
 ================================================================
 [Module]          -> New Movie Scraper (New_Movie.py)
 [Target]          -> NEW MOVIE Section (Sidebar)
 [Data]            -> title, url, thumbnail, genres, date
 [Developer]       -> Vexalyn Developer
 ================================================================"""
    print(f"{C_GREEN}{banner}{RESET}")


async def scrape_new_movie():
    """
    Scrape daftar new movie dari sidebar anichin.watch.

    Struktur HTML:
    div.section
      div.releases
        h3 > span : "NEW MOVIE"
        a.vl      : link "View All"
      div.serieslist
        ul
          li
            div.imgseries > a > img  : thumbnail
            div.leftseries
              h4 > a                 : title + url
              span (1st)             : genres
              span (2nd)             : release date

    Returns:
        Dictionary dengan list new movies lengkap
    """
    url = "https://anichin.watch/"

    response = {
        "creator": "Vexalyn Developer",
        "statusCode": 200,
        "status": "success",
        "message": "New movies fetched successfully",
        "ok": True,
        "view_all_url": "https://anichin.watch/anime/?status=&type=Movie&order=update",
        "total_data": 0,
        "data": []
    }

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

    # Cari section yang berisi heading "NEW MOVIE"
    new_movie_section = None
    for sec in soup.find_all('div', class_='section'):
        h3 = sec.find('h3')
        if h3 and 'NEW MOVIE' in h3.get_text(strip=True).upper():
            new_movie_section = sec
            break

    if not new_movie_section:
        print(f"{C_RED}[ERROR]{RESET} NEW MOVIE section not found!")
        response["statusCode"] = 500
        response["status"] = "error"
        response["message"] = "NEW MOVIE section not found. Website structure may have changed."
        response["ok"] = False
        return response

    print(f"{C_GREEN}[OK]{RESET} Found NEW MOVIE section")

    # Ambil "View All" URL kalau ada
    vl_link = new_movie_section.find('a', class_='vl')
    if vl_link and vl_link.get('href'):
        response["view_all_url"] = vl_link['href']

    # Cari serieslist
    serieslist = new_movie_section.find('div', class_='serieslist')
    if not serieslist:
        print(f"{C_RED}[ERROR]{RESET} serieslist not found inside NEW MOVIE section!")
        response["statusCode"] = 500
        response["status"] = "error"
        response["message"] = "Could not find movie list container."
        response["ok"] = False
        return response

    list_items = serieslist.find('ul').find_all('li') if serieslist.find('ul') else []
    print(f"{C_CYAN}[DEBUG]{RESET} Found {len(list_items)} movie items")

    movies = []
    for li in list_items:
        try:
            # === Thumbnail ===
            img_div = li.find('div', class_='imgseries')
            img_tag = img_div.find('img') if img_div else None
            thumbnail = ''
            if img_tag:
                thumbnail = (
                    img_tag.get('src') or
                    img_tag.get('data-src') or
                    img_tag.get('data-lazy-src') or
                    ''
                )

            # === Title & URL ===
            leftseries = li.find('div', class_='leftseries')
            if not leftseries:
                continue

            h4 = leftseries.find('h4')
            a_tag = h4.find('a') if h4 else None
            if not a_tag:
                continue

            title = a_tag.get_text(strip=True)
            url_item = a_tag.get('href', '').strip()

            # === Genres & Date ===
            # Ada 2 <span>: pertama genres, kedua tanggal
            spans = leftseries.find_all('span', recursive=False)

            genres = []
            release_date = ''

            for span in spans:
                # Span genres punya <b>Genres</b> di dalamnya
                b_tag = span.find('b')
                if b_tag and 'genres' in b_tag.get_text(strip=True).lower():
                    genre_links = span.find_all('a', rel='tag')
                    genres = [g.get_text(strip=True) for g in genre_links]
                else:
                    # Span tanggal: plain text tanpa child tag <a>
                    text = span.get_text(strip=True)
                    if text and not span.find('a'):
                        release_date = text

            movies.append({
                "title": title,
                "url": url_item,
                "thumbnail": thumbnail,
                "genres": genres,
                "release_date": release_date,
                "type": "Movie"
            })

        except Exception as e:
            print(f"{C_RED}[ERROR]{RESET} Failed to parse item: {e}")
            continue

    response["total_data"] = len(movies)
    response["data"] = movies

    if len(movies) == 0:
        response["message"] = "No new movies found. Website structure may have changed."
        print(f"\n{C_YELLOW}[WARNING]{RESET} No movies extracted!")
    else:
        print(f"\n{C_GREEN}[INFO]{RESET} Successfully extracted {len(movies)} new movies")

    return response


async def main():
    """Entry point untuk testing new movie scraper."""
    start_time = time.time()

    print_banner()
    await loading_animation("Initializing Vexalyn New Movie Engine", 0.5)
    await loading_animation("Bypassing Protections via Playwright", 0.3)

    print(f"\n{C_GRAY}[*] Extracting new movies from DOM...{RESET}")

    result = await scrape_new_movie()

    elapsed = time.time() - start_time
    sep = " " + ("-" * 61)

    print(f"{C_GRAY}{sep}{RESET}")

    if result['ok']:
        print(f"{C_GREEN}[SUCCESS]{RESET} Status Code  : {result['statusCode']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} Movies Found : {result['total_data']} items")
        print(f"{C_GREEN}[SUCCESS]{RESET} View All     : {result['view_all_url']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} Elapsed      : {elapsed:.2f} seconds")
    else:
        print(f"{C_RED}[FAILED]{RESET} {result['message']}")

    print(f"{C_GRAY}{sep}{RESET}")

    try:
        json_output = json.dumps(result, indent=4, ensure_ascii=False)
        print(f"\n{C_WHITE}[RAW JSON DATA BUFFER]:{RESET}")
        print(json_output)
    except UnicodeEncodeError:
        json_output = json.dumps(result, indent=4, ensure_ascii=True)
        print(f"\n{C_WHITE}[RAW JSON DATA BUFFER]:{RESET}")
        print(json_output)

    print(f"{C_GRAY}{sep}{RESET}")
    print(f"{C_GRAY}[!] New movie extraction complete. Vexalyn Scraper closed safely.{RESET}")


if __name__ == "__main__":
    asyncio.run(main())
