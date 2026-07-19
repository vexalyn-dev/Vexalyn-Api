# Recommendation.py
import sys
import asyncio
import json
import re
import time
from bs4 import BeautifulSoup, NavigableString
from core.browser import get_page_content

# ANSI Colors
C_GREEN  = "\033[92m"
C_CYAN   = "\033[96m"
C_WHITE  = "\033[97m"
C_RED    = "\033[91m"
C_YELLOW = "\033[93m"
C_GRAY   = "\033[90m"
RESET    = "\033[0m"

# Tab genre mapping — sesuai tab yang tampil di UI Anichin
VALID_GENRES = {
    "fantasy":      "Fantasy",
    "music":        "Music",
    "mythology":    "Mythology",
    "space":        "Space",
    "supernatural": "Supernatural",
}


async def loading_animation(text: str, duration: float = 0.3):
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
    banner = r"""
$$\    $$\                              $$\                           $$$$$$$\                      
$$ |   $$ |                             $$ |                          $$  __$$\                     
$$ |   $$ | $$$$$$\  $$\   $$\ $$$$$$\  $$ |$$\   $$\ $$$$$$$\        $$ |  $$ | $$$$$$\ $$\    $$\ 
\$$\  $$  |$$  __$$\ \$$\ $$  |\____$$\ $$ |$$ |  $$ |$$  __$$\       $$ |  $$ |$$  __$$\\$$\  $$  |
 \$$\$$  / $$$$$$$$ | \$$$$  / $$$$$$$ |$$ |$$ |  $$ |$$ |  $$ |      $$ |  $$ |$$$$$$$$ |\$$\$$  / 
  \$$$  /  $$   ____| $$  $$< $$  __$$ |$$ |$$ |  $$ |$$ |  $$ |      $$ |  $$ |$$   ____| \$$$  /  
   \$  /   \$$$$$$$\ $$  /\$$\\$$$$$$$ |$$ |\$$$$$$$ |$$ |  $$ |      $$$$$$$  |\$$$$$$$\   \$  /   
    \_/     \_______|\__/  \__|\________|\_|  \____$$ |\__|  \__|      \_______/  \_______|   \_/    
                                            $$\   $$ |                                              
                                            \$$$$$$  |                                              
                                             \______/                                               
 ================================================================
 RECOMMENDATION SCRAPER - Genre Tab Filtering
 ================================================================
 [Module]          -> Recommendation Scraper (Recommendation.py)
 [Target]          -> Recommendation section (genre tabs)
 [Genres]          -> fantasy | music | mythology | space | supernatural
 [Developer]       -> Vexalyn Developer
 ================================================================"""
    print(f"{C_GREEN}{banner}{RESET}")


def _parse_recommendation_items(soup: BeautifulSoup, genre_label: str) -> list:
    """
    Parse kartu donghua dari tab Recommendation yang sesuai genre.

    Struktur HTML recommendation section:
      div.bixbox (mengandung heading 'Recommendation')
        div.releases.rechead
          ul.genre-tabs
            li  -> tab per genre
        div.listupd
          div.tab-content[data-id=genre_slug]
            article.bs
              div.bsx > a > ...
    """
    items = []
    seen_urls = set()

    # Cari section heading Recommendation
    rec_section = None
    for tag in soup.find_all(['div', 'h2', 'h3', 'h4', 'h5', 'span']):
        text = tag.get_text(strip=True).lower()
        if 'recommendation' in text and len(text) < 30:
            rec_section = tag
            break

    if not rec_section:
        print(f"{C_RED}[ERROR]{RESET} Recommendation section heading not found!")
        return []

    print(f"{C_GREEN}[OK]{RESET} Found heading: '{rec_section.get_text(strip=True)[:40]}'")

    # Naik ke container bixbox
    container = rec_section
    for _ in range(5):
        container = container.parent
        articles = container.find_all('article', class_='bs')
        if len(articles) >= 3:
            break

    # Cari tab content yang cocok dengan genre
    # Tab content biasanya punya data-id atau class yang menyertakan nama genre
    genre_lower = genre_label.lower()

    # Strategy 1: Cari div dengan class/data-id yang mengandung genre name
    tab_content = None
    for div in container.find_all('div'):
        div_id    = (div.get('id') or '').lower()
        div_class = ' '.join(div.get('class') or []).lower()
        div_data  = (div.get('data-id') or div.get('data-tab') or '').lower()

        if genre_lower in div_id or genre_lower in div_class or genre_lower in div_data:
            articles_inside = div.find_all('article', class_='bs')
            if articles_inside:
                tab_content = div
                print(f"{C_GREEN}[OK]{RESET} Tab content found via id/class/data-id")
                break

    # Strategy 2: Fallback - cari berdasarkan anchor links genre di tab nav
    if not tab_content:
        for a_tag in container.find_all('a', href=True):
            href = a_tag.get('href', '').lower()
            text = a_tag.get_text(strip=True).lower()
            if genre_lower in href or genre_lower in text:
                # Ikuti ID target dari href
                target_id = href.lstrip('#')
                if target_id:
                    found = soup.find(id=target_id)
                    if found and found.find('article', class_='bs'):
                        tab_content = found
                        print(f"{C_GREEN}[OK]{RESET} Tab content found via anchor href #{target_id}")
                        break

    # Strategy 3: Fallback — genre tab biasanya urutan di ul.series-tab
    # Cari semua div.tab-content dalam container, ambil sesuai urutan genre
    if not tab_content:
        genre_order = list(VALID_GENRES.keys())
        genre_idx   = genre_order.index(genre_lower) if genre_lower in genre_order else 0
        tab_divs    = [d for d in container.find_all('div') if d.find('article', class_='bs')]
        if tab_divs and genre_idx < len(tab_divs):
            tab_content = tab_divs[genre_idx]
            print(f"{C_YELLOW}[FALLBACK]{RESET} Using positional tab index {genre_idx}")

    if not tab_content:
        # Last resort: ambil semua article.bs dalam container
        print(f"{C_YELLOW}[FALLBACK]{RESET} Showing all articles in recommendation section")
        tab_content = container

    articles = tab_content.find_all('article', class_='bs')
    print(f"{C_CYAN}[DEBUG]{RESET} Recommendation [{genre_label}]: found {len(articles)} cards")

    for article in articles:
        try:
            a_tag = article.find('a', href=True)
            if not a_tag:
                continue

            episode_url = a_tag.get('href', '').strip()
            if not episode_url:
                continue

            # Series URL
            clean = episode_url.rstrip('/')
            series_url = re.sub(r'-episode-\d+(?:-subtitle[^/]*)?$', '', clean, flags=re.IGNORECASE).rstrip('/') + '/'
            if series_url in seen_urls:
                continue

            # Title
            tt_div = a_tag.find('div', class_='tt')
            title = ''
            if tt_div:
                for content in tt_div.contents:
                    if isinstance(content, NavigableString):
                        t = content.strip()
                        if t and len(t) > 2:
                            title = t
                            break
                if not title:
                    h2 = tt_div.find('h2')
                    if h2:
                        h2.extract()
                    title = tt_div.get_text(strip=True)
            if not title:
                raw = a_tag.get('title', '').strip()
                title = re.sub(r'\s*Episode\s+\d+.*$', '', raw, flags=re.IGNORECASE).strip()
            if not title or len(title) < 3:
                continue

            # Thumbnail
            img_tag = a_tag.find('img')
            thumbnail = ''
            if img_tag:
                thumbnail = (
                    img_tag.get('src') or
                    img_tag.get('data-src') or
                    img_tag.get('data-lazy-src') or
                    ''
                )
                if thumbnail.startswith('/'):
                    thumbnail = 'https://anichin.watch' + thumbnail
            if not thumbnail or 'logo' in thumbnail.lower():
                continue

            # Status (Ongoing / Completed / Upcoming)
            status = 'N/A'
            for tag in a_tag.find_all(['span', 'div']):
                t = tag.get_text(strip=True).lower()
                if t in ['ongoing', 'completed', 'upcoming']:
                    status = t.capitalize()
                    break

            # Type
            typez = a_tag.find('div', class_='typez')
            content_type = typez.get_text(strip=True) if typez else 'Donghua'

            # Sub/Dub
            sb = a_tag.find('span', class_='sb')
            sub_dub = sb.get_text(strip=True) if sb else ''

            seen_urls.add(series_url)
            items.append({
                "title":         title,
                "url":           series_url,
                "thumbnail":     thumbnail,
                "status":        status,
                "type":          content_type,
                "sub_dub":       sub_dub,
            })

        except Exception as e:
            print(f"{C_YELLOW}[WARN]{RESET} Skip card: {e}")
            continue

    return items


async def scrape_recommendation(genre: str = "fantasy") -> dict:
    """
    Scrape Recommendation section dari Anichin homepage.

    Args:
        genre: Salah satu dari fantasy, music, mythology, space, supernatural

    Returns:
        Dictionary dengan list donghua rekomendasi sesuai genre tab.
    """
    genre = genre.lower().strip()

    if genre not in VALID_GENRES:
        return {
            "creator":    "Vexalyn Developer",
            "statusCode": 400,
            "status":     "error",
            "message":    f"Invalid genre '{genre}'. Use: {', '.join(VALID_GENRES.keys())}",
            "ok":         False,
            "genre":      genre,
            "total_data": 0,
            "data":       []
        }

    genre_label = VALID_GENRES[genre]

    response = {
        "creator":    "Vexalyn Developer",
        "statusCode": 200,
        "status":     "success",
        "message":    f"Recommendation [{genre_label}] fetched successfully",
        "ok":         True,
        "genre":      genre_label,
        "total_data": 0,
        "data":       []
    }

    html_content, error = await get_page_content("https://anichin.watch/", js_wait_ms=1200)

    if error:
        response.update({
            "statusCode": 500,
            "status":     "error",
            "message":    f"Failed to load page: {error}",
            "ok":         False,
        })
        return response

    soup = BeautifulSoup(html_content, 'html.parser')
    page_title = soup.title.string.strip() if soup.title and soup.title.string else "No Title"
    print(f"{C_CYAN}[DEBUG-DOM]{RESET} Page: {C_WHITE}{page_title}{RESET}")

    items = _parse_recommendation_items(soup, genre_label)

    response["total_data"] = len(items)
    response["data"]       = items

    if len(items) == 0:
        response["message"] = f"No recommendation found for genre '{genre_label}'. Structure may have changed."
        print(f"{C_YELLOW}[WARN]{RESET} No items extracted!")
    else:
        print(f"{C_GREEN}[INFO]{RESET} Extracted {len(items)} recommendation items [{genre_label}]")

    return response


async def main():
    import sys
    genre = sys.argv[1] if len(sys.argv) > 1 else "fantasy"
    start_time = time.time()

    print_banner()
    await loading_animation(f"Loading recommendation: {genre.upper()}", 0.3)

    result = await scrape_recommendation(genre)

    elapsed = time.time() - start_time
    sep = " " + ("-" * 61)
    print(f"{C_GRAY}{sep}{RESET}")

    if result['ok']:
        print(f"{C_GREEN}[SUCCESS]{RESET} Genre      : {result['genre']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} Items Found: {result['total_data']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} Elapsed    : {elapsed:.2f}s")
    else:
        print(f"{C_RED}[FAILED]{RESET} {result['message']}")

    print(f"{C_GRAY}{sep}{RESET}")
    try:
        print(json.dumps(result, indent=4, ensure_ascii=False))
    except UnicodeEncodeError:
        print(json.dumps(result, indent=4, ensure_ascii=True))
    print(f"{C_GRAY}{sep}{RESET}")


if __name__ == "__main__":
    asyncio.run(main())
