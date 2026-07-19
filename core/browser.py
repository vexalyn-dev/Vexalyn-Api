# core/browser.py
import asyncio
from playwright.async_api import async_playwright

# ──────────────────────────────────────────────────────────────────────────────
# PERSISTENT BROWSER POOL
# Browser di-launch sekali dan di-reuse untuk semua request.
# Ini menghemat ~4-6 detik overhead launch per request.
# ──────────────────────────────────────────────────────────────────────────────

_browser = None
_browser_lock = asyncio.Lock()
_playwright_instance = None


async def _get_browser():
    """
    Dapatkan browser instance yang sudah berjalan (reuse).
    Launch baru hanya jika belum ada atau sudah closed.
    """
    global _browser, _playwright_instance

    async with _browser_lock:
        # Cek apakah browser masih hidup
        if _browser is not None:
            try:
                # Ping: buat context dummy untuk cek koneksi
                _ = _browser.contexts
                return _browser
            except Exception:
                _browser = None

        # Launch browser baru
        print("\033[96m[BROWSER]\033[0m Launching Chromium (first time)...")
        _playwright_instance = await async_playwright().start()
        _browser = await _playwright_instance.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--disable-extensions',
                '--disable-background-networking',
                '--disable-default-apps',
                '--disable-sync',
                '--disable-translate',
                '--hide-scrollbars',
                '--mute-audio',
                '--safebrowsing-disable-auto-update',
            ]
        )
        print("\033[92m[BROWSER]\033[0m Chromium ready.")
        return _browser


async def get_page_content(url: str, js_wait_ms: int = 1500):
    """
    Ambil HTML dari URL target menggunakan persistent browser.

    Optimizations vs versi lama:
    - Browser di-reuse (tidak launch ulang tiap request) → hemat ~4-6s
    - Block gambar, font, media, dan tracker → halaman load lebih ringan
    - wait_until='domcontentloaded' → tidak tunggu semua resource selesai
    - js_wait_ms minimal (1500ms) → cukup untuk JS render section homepage
    - Context di-close setelah selesai (memory management)
    """
    try:
        browser = await _get_browser()
    except Exception as e:
        return None, f"Browser launch failed: {e}"

    context = None
    page = None
    try:
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={'width': 1280, 'height': 720},
            java_script_enabled=True,
            bypass_csp=True,
        )

        # Block semua resource yang tidak perlu untuk scraping
        async def _block(route):
            await route.abort()

        await context.route(
            "**/*.{png,jpg,jpeg,gif,webp,svg,ico,woff,woff2,ttf,eot,mp4,mp3,ogg,wav,pdf}",
            _block
        )
        await context.route("**/google-analytics**", _block)
        await context.route("**/googletagmanager**", _block)
        await context.route("**/gtag**", _block)
        await context.route("**/doubleclick**", _block)
        await context.route("**/facebook**", _block)
        await context.route("**/ads/**", _block)
        await context.route("**/analytics**", _block)
        await context.route("**/hotjar**", _block)
        await context.route("**/disqus**", _block)

        page = await context.new_page()

        print(f"\033[96m[NAVIGATOR]\033[0m Loading: {url}")

        await page.goto(url, wait_until="domcontentloaded", timeout=30000)

        # Bypass landing/interstitial page kalau ada
        try:
            bypass = page.locator(
                "a:has-text('Klik Menuju'), a:has-text('Click to'), "
                "button:has-text('Enter'), a:has-text('Masuk')"
            )
            if await bypass.count() > 0:
                print("\033[93m[BYPASS]\033[0m Landing page detected, clicking...")
                await bypass.first.click()
                await page.wait_for_load_state("domcontentloaded", timeout=10000)
        except Exception:
            pass

        # Tunggu JS render section utama
        # Minimal 1500ms cukup untuk anichin.watch render Popular Today
        await page.wait_for_timeout(js_wait_ms)

        html = await page.content()

        print(f"\033[90m[NAVIGATOR]\033[0m Done. HTML size: {len(html):,} chars\033[0m")
        return html, None

    except Exception as e:
        return None, str(e)

    finally:
        # Selalu close page & context untuk free memory, browser tetap hidup
        try:
            if page:
                await page.close()
            if context:
                await context.close()
        except Exception:
            pass


async def close_browser():
    """
    Tutup browser secara eksplisit (opsional, dipanggil saat shutdown).
    """
    global _browser, _playwright_instance
    try:
        if _browser:
            await _browser.close()
            _browser = None
        if _playwright_instance:
            await _playwright_instance.stop()
            _playwright_instance = None
        print("\033[90m[BROWSER]\033[0m Chromium closed.\033[0m")
    except Exception:
        pass
