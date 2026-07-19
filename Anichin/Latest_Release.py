# Latest_Release.py
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
 [Module]          -> Latest Release Scraper (Latest_Release.py)
 [Target]          -> https://anichin.watch/ (Latest Release section)
 [Structure]       -> div.releases.latesthome > div.bixbox > article.bs
 [Developer]       -> Vexalyn Developer
 ================================================================"""
    print(f"{C_GREEN}{banner}{RESET}")


def _extract_series_url(episode_url: str) -> str:
    """Konversi URL episode ke URL halaman series."""
    clean = episode_url.rstrip('/')
    slug = re.sub(r'-episode-\d+(?:-subtitle[^/]*)?$', '', clean, flags=re.IGNORECASE)
    return slug.rstrip('/') + '/'


def _extract_series_title(a_tag) -> str:
    """Ambil clean series title dari div.tt text node."""
    tt_div = a_tag.find('div', class_='tt')
    if tt_div:
        for content in tt_div.contents:
            if isinstance(content, NavigableString):
                text = content.strip()
                if text and len(text) > 2:
                    return text
        h2 = tt_div.find('h2')
        if h2:
            h2.extract()
        return tt_div.get_text(strip=True)
    raw = a_tag.get('title', '').strip()
    raw = re.sub(r'\s*Episode\s+\d+.*$', '', raw, flags=re.IGNORECASE).strip()
    return raw


def _parse_articles_lr(container) -> list:
    """Parse semua article.bs dari container, return list of cards dengan key last_episode."""
    items = []
    seen_urls = set()
    articles = container.find_all('article', class_='bs')
    print(f"{C_CYAN}[DEBUG]{RESET} Latest Release: found {len(articles)} article.bs cards")

    for article in articles:
        try:
            a_tag = article.find('a', href=True)
            if not a_tag:
                continue

            episode_url = a_tag.get('href', '').strip()
            if not episode_url:
                continue

            series_url = _extract_series_url(episode_url)
            if series_url in seen_urls:
                continue

            title = _extract_series_title(a_tag)
            if not title or len(title) < 3:
                continue

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

            epx = a_tag.find('span', class_='epx') or a_tag.find('div', class_='epx')
            ep_text = epx.get_text(strip=True) if epx else ''
            ep_match = re.search(r'\d+', ep_text)
            last_episode = ep_match.group(0) if ep_match else 'N/A'

            typez = a_tag.find('div', class_='typez')
            content_type = typez.get_text(strip=True) if typez else 'Donghua'

            sb = a_tag.find('span', class_='sb')
            sub_dub = sb.get_text(strip=True) if sb else ''

            seen_urls.add(series_url)
            items.append({
                "title":        title,
                "url":          series_url,
                "thumbnail":    thumbnail,
                "last_episode": last_episode,
                "type":         content_type,
                "sub_dub":      sub_dub,
            })

        except Exception as e:
            print(f"{C_YELLOW}[WARN]{RESET} Skip card: {e}")
            continue

    return items


async def scrape_latest_release() -> dict:
    """
    Scrape Latest Release section dari Anichin homepage.

    Struktur target:
      div.bixbox.bbnofrm
        div.releases.latesthome  (heading 'Latest Release')
        div.listupd
          article.bs x20         <- semua cards

    Returns list of:
      {title, url (series page), thumbnail, total_episode (e.g. "Episode 208"), type, sub_dub}
    """
    url = "https://anichin.watch/"

    response = {
        "creator": "Vexalyn Developer",
        "statusCode": 200,
        "status": "success",
        "message": "Data fetched successfully",
        "ok": True,
        "section": "Latest Release",
        "view_all_url": "https://anichin.watch/anime/?order=update",
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

    # ── Step 1: Cari heading 'Latest Release' ─────────────────────────────────
    heading = None
    for tag in soup.find_all(['div', 'h2', 'h3', 'h4', 'h5']):
        text = tag.get_text(strip=True).lower()
        if 'latest release' in text and len(text) < 50:
            # Pastikan ini heading div (div.releases.latesthome), bukan container besar
            if tag.name == 'div' and tag.get('class') and 'releases' in tag.get('class', []):
                heading = tag
                break
            elif tag.name in ['h2', 'h3', 'h4', 'h5']:
                heading = tag
                break

    if not heading:
        print(f"{C_RED}[ERROR]{RESET} 'Latest Release' heading not found!")
        response.update({
            "statusCode": 404,
            "status": "not_found",
            "message": "Latest Release section not found. Website structure may have changed.",
            "ok": False,
        })
        return response

    print(f"{C_GREEN}[OK]{RESET} Found heading: '{heading.get_text(strip=True)[:40]}'")

    # ── Step 2: Dapatkan bixbox container ─────────────────────────────────────
    # div.releases.latesthome berada di dalam div.bixbox.bbnofrm
    if heading.name == 'div' and 'releases' in heading.get('class', []):
        bixbox = heading.parent  # div.bixbox.bbnofrm
    else:
        bixbox = heading.parent.parent

    print(f"{C_CYAN}[DEBUG]{RESET} bixbox classes: {bixbox.get('class')}")

    # Ambil view_all URL dari link di dalam heading
    vl_link = heading.find('a', class_='vl') or heading.find('a', string=lambda t: t and 'view all' in t.lower() if t else False)
    if not vl_link:
        vl_link = heading.find('a', href=True)
    if vl_link and vl_link.get('href'):
        response["view_all_url"] = vl_link['href']

    # ── Step 3: Parse semua article.bs di dalam bixbox ────────────────────────
    items = _parse_articles_lr(bixbox)

    response["total_data"] = len(items)
    response["data"] = items

    if len(items) == 0:
        response["message"] = "0 items found. Latest Release structure may have changed."
        print(f"{C_YELLOW}[WARN]{RESET} No items extracted!")
    else:
        print(f"{C_GREEN}[INFO]{RESET} Extracted {len(items)} Latest Release items")

    return response


async def main():
    start_time = time.time()

    print_banner()
    await loading_animation("Initializing Vexalyn Engine", 0.3)

    print(f"\n{C_GRAY}[*] Extracting Latest Release section...{RESET}")

    result = await scrape_latest_release()

    elapsed = time.time() - start_time
    sep = " " + ("─" * 61)
    print(f"{C_GRAY}{sep}{RESET}")

    if result['ok']:
        print(f"{C_GREEN}[SUCCESS]{RESET} Status Code  : {result['statusCode']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} Items Found  : {result['total_data']}")
        print(f"{C_GREEN}[SUCCESS]{RESET} View All     : {result['view_all_url']}")
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
