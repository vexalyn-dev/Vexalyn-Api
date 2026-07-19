# populer_today.py
import sys
import asyncio
import json
import time
import re
from bs4 import BeautifulSoup
from core.browser import get_page_content

# ANSI Colors
C_GREEN = "\033[92m"
C_CYAN  = "\033[96m"
C_WHITE = "\033[97m"
C_RED   = "\033[91m"
C_YELLOW= "\033[93m"
C_GRAY  = "\033[90m"
RESET   = "\033[0m"

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
    \_/     \_______|\__/  \__|\_______|\__| \____$$ |\__|  \__|      \_______/  \_______|   \_/    
                                            $$\   $$ |                                              
                                            \$$$$$$  |                                              
                                             \______/                                               
 ================================================================
 ANICHIN SCRAPER - Donghua Extraction Engine
 ================================================================
 [Module]          -> Popular Today Scraper (populer_today.py)
 [Target]          -> https://anichin.watch/ (Popular Today section)
 [Structure]       -> div.bixbox.bbnofrm > div.listupd.normal > div.excstf
 [Developer]       -> Vexalyn Developer
 ================================================================"""
    print(f"{C_GREEN}{banner}{RESET}")


def _extract_series_url(episode_url: str) -> str:
    """
    Konversi URL episode ke URL halaman series.

    Contoh:
      https://anichin.watch/battle-through-the-heavens-season-5-episode-208-subtitle-indonesia/
      → https://anichin.watch/battle-through-the-heavens-season-5/

    Pattern: hapus '-episode-{N}-subtitle-indonesia' dari slug.
    """
    # Hapus trailing slash lalu ambil slug
    clean = episode_url.rstrip('/')
    # Pattern: -episode-{angka}-subtitle-{apapun} di akhir slug
    slug = re.sub(r'-episode-\d+(?:-subtitle[^/]*)?$', '', clean, flags=re.IGNORECASE)
    # Pastikan trailing slash
    return slug.rstrip('/') + '/'


def _extract_series_title(a_tag) -> str:
    """
    Ambil clean series title dari div.tt (teks langsung, bukan dari h2).

    Struktur:
      div.tt
        "Battle Through the Heavens Season 5"   ← teks langsung (series title)
        h2  "...Episode 208 Subtitle Indonesia" ← kita skip ini
    """
    tt_div = a_tag.find('div', class_='tt')
    if tt_div:
        # Ambil text node langsung (bukan dari h2 child)
        for content in tt_div.contents:
            if isinstance(content, str):
                text = content.strip()
                if text and len(text) > 2:
                    return text
        # Fallback: teks penuh tt_div tanpa h2
        h2 = tt_div.find('h2')
        if h2:
            h2.decompose()
        return tt_div.get_text(strip=True)

    # Fallback: dari a[title], hapus "Episode N Subtitle Indonesia"
    raw = a_tag.get('title', '').strip()
    raw = re.sub(r'\s*Episode\s+\d+.*$', '', raw, flags=re.IGNORECASE).strip()
    return raw


def _parse_excstf(excstf_div) -> list:
    """
    Parse semua card dari div.excstf.

    Struktur nyata:
      div.excstf
        article.bs
          div.bsx
            a.tip[href=episode_url, rel=post_id, title=full_episode_title]
              div.limit
                div.typez.Donghua
                div.bt
                  span.epx       ← "Ep 208"
                  span.sb.Sub    ← "Sub" / "Dub"
                img[src, alt]
              div.tt
                "Series Title"   ← clean series title (text node)
                h2               ← full episode title (skip)
    """
    items = []
    seen_series = set()

    # Setiap card adalah article.bs
    articles = excstf_div.find_all('article', class_='bs')
    # Fallback kalau tidak ada article
    if not articles:
        articles = excstf_div.find_all('div', class_='bsx')

    print(f"{C_CYAN}[DEBUG]{RESET} Found {len(articles)} cards in excstf")

    for article in articles:
        try:
            a_tag = article.find('a', href=True)
            if not a_tag:
                continue

            episode_url = a_tag.get('href', '').strip()
            if not episode_url:
                continue

            # --- Series URL (clean, tanpa episode) ---
            series_url = _extract_series_url(episode_url)

            # Skip duplikat series
            if series_url in seen_series:
                continue

            # --- Series title (clean, tanpa "Episode N Subtitle Indonesia") ---
            title = _extract_series_title(a_tag)
            if not title or len(title) < 3:
                continue

            # --- Thumbnail ---
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

            # --- Episode number only (angka saja, bukan "Ep 208") ---
            epx = a_tag.find('span', class_='epx')
            ep_text = epx.get_text(strip=True) if epx else ''
            # Extract angka saja: "Ep 208" → "208"
            ep_match = re.search(r'\d+', ep_text)
            episode = ep_match.group(0) if ep_match else ep_text or 'N/A'

            # --- Type badge ---
            typez = a_tag.find('div', class_='typez')
            content_type = typez.get_text(strip=True) if typez else 'Donghua'

            # --- Sub/Dub ---
            sb = a_tag.find('span', class_='sb')
            sub_dub = sb.get_text(strip=True) if sb else ''

            # --- Episode number/text ---
            total_episode = f"Episode {episode}" if episode != 'N/A' else 'N/A'

            seen_series.add(series_url)
            items.append({
                "title": title,
                "url": series_url,
                "thumbnail": thumbnail,
                "total_episode": total_episode,
                "type": content_type,
                "sub_dub": sub_dub,
            })

        except Exception as e:
            print(f"{C_YELLOW}[WARN]{RESET} Skip card: {e}")
            continue

    return items


async def scrape_popular_today() -> dict:
    """
    Scrape Popular Today section dari Anichin homepage.

    Struktur target:
      div.bixbox.bbnofrm
        div.releases.hothome  (heading 'Popular Today')
        div.listupd.normal
          div.excstf          ← semua cards di sini
    """
    url = "https://anichin.watch/"

    response = {
        "creator": "Vexalyn Developer",
        "statusCode": 200,
        "status": "success",
        "message": "Data fetched successfully",
        "ok": True,
        "section": "Popular Today",
        "total_data": 0,
        "data": []
    }

    html_content, error = await get_page_content(url)

    if error:
        response.update({
            "statusCode": 500,
            "status": "error",
            "message": f"Failed to load page: {error}",
            "ok": False,
        })
        return response

    soup = BeautifulSoup(html_content, 'html.parser')

    page_title = soup.title.string.strip() if soup.title and soup.title.string else "No Title"
    print(f"{C_CYAN}[DEBUG-DOM]{RESET} Page: {C_WHITE}{page_title}{RESET}")

    # ── Step 1: Cari heading 'Popular Today' ──────────────────────────────────
    heading = None
    for h in soup.find_all(['h2', 'h3', 'h4', 'h5']):
        if 'popular today' in h.get_text(strip=True).lower():
            heading = h
            break

    if not heading:
        print(f"{C_RED}[ERROR]{RESET} 'Popular Today' heading not found!")
        response.update({
            "statusCode": 404,
            "status": "not_found",
            "message": "Popular Today section not found. Website structure may have changed.",
            "ok": False,
        })
        return response

    print(f"{C_GREEN}[OK]{RESET} Found heading: '{heading.get_text(strip=True)}'")

    # ── Step 2: Naik ke div.bixbox, cari div.listupd ──────────────────────────
    # heading -> div.releases.hothome -> div.bixbox.bbnofrm
    bixbox = heading.parent.parent
    print(f"{C_CYAN}[DEBUG]{RESET} bixbox classes: {bixbox.get('class')}")

    listupd = bixbox.find('div', class_='listupd')
    if not listupd:
        # Fallback: cari sibling dari heading's parent
        releases_div = heading.parent
        listupd = releases_div.find_next_sibling('div', class_='listupd')

    if not listupd:
        print(f"{C_RED}[ERROR]{RESET} div.listupd not found inside bixbox!")
        response.update({
            "statusCode": 404,
            "status": "not_found",
            "message": "Popular Today list container not found.",
            "ok": False,
        })
        return response

    print(f"{C_CYAN}[DEBUG]{RESET} listupd classes: {listupd.get('class')}")

    # ── Step 3: Cari div.excstf di dalam listupd ──────────────────────────────
    excstf = listupd.find('div', class_='excstf')
    if not excstf:
        # Fallback langsung parse listupd
        excstf = listupd

    print(f"{C_CYAN}[DEBUG]{RESET} excstf classes: {excstf.get('class')}")

    # ── Step 4: Parse semua cards ──────────────────────────────────────────────
    items = _parse_excstf(excstf)

    response["total_data"] = len(items)
    response["data"] = items

    if len(items) == 0:
        response["message"] = "0 items found. Popular Today structure may have changed."
        print(f"{C_YELLOW}[WARN]{RESET} No items extracted!")
    else:
        print(f"{C_GREEN}[INFO]{RESET} Extracted {len(items)} Popular Today items")

    return response


async def main():
    start_time = time.time()

    print_banner()
    await loading_animation("Initializing Vexalyn Engine", 0.3)

    print(f"\n{C_GRAY}[*] Extracting Popular Today section...{RESET}")

    result = await scrape_popular_today()

    elapsed = time.time() - start_time
    sep = " " + ("─" * 61)
    print(f"{C_GRAY}{sep}{RESET}")

    if result['ok']:
        print(f"{C_GREEN}[SUCCESS]{RESET} Status Code  : {result['statusCode']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} Items Found  : {result['total_data']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} Elapsed Time : {elapsed:.2f}s")
    else:
        print(f"{C_RED}[FAILED]{RESET} {result['message']}")

    print(f"{C_GRAY}{sep}{RESET}")

    try:
        print(f"\n{C_WHITE}[RAW JSON DATA BUFFER]:{RESET}")
        print(json.dumps(result, indent=4, ensure_ascii=False))
    except UnicodeEncodeError:
        print(json.dumps(result, indent=4, ensure_ascii=True))

    print(f"{C_GRAY}{sep}{RESET}")
    print(f"{C_GRAY}[!] Complete. Vexalyn Scraper closed safely.{RESET}")


if __name__ == "__main__":
    asyncio.run(main())
