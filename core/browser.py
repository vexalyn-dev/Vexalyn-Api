# core/browser.py
import asyncio
from playwright.async_api import async_playwright

async def get_page_content(url: str, wait_for: str = "auto"):
    """
    Mengambil HTML dari URL target - OPTIMIZED untuk speed.
    
    Optimizations:
    - Block gambar, font, dan media (tidak perlu untuk scraping)
    - Pakai domcontentloaded bukan load (lebih cepat)
    - Kurangi timeout dan delay seminimal mungkin
    - Nonaktifkan JavaScript execution yang tidak perlu
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
            ]
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={'width': 1280, 'height': 720},  # Lebih kecil = lebih ringan
            java_script_enabled=True,
        )

        # Block resource yang tidak perlu untuk scraping
        await context.route("**/*.{png,jpg,jpeg,gif,webp,svg,ico,woff,woff2,ttf,eot}", lambda route: route.abort())
        await context.route("**/{google-analytics,gtag,analytics,doubleclick,facebook,ads}**", lambda route: route.abort())

        page = await context.new_page()
        
        try:
            print(f"\n\033[96m[NAVIGATOR]\033[0m Loading: {url}")

            # Gunakan domcontentloaded — jauh lebih cepat dari 'load'
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)

            # Bypass landing page jika ada
            bypass_button = page.locator("a:has-text('Klik Menuju'), a:has-text('Click to'), button:has-text('Enter')")
            if await bypass_button.count() > 0:
                print("\033[93m[BYPASS]\033[0m Landing page detected, clicking...")
                await bypass_button.first.click()
                await page.wait_for_load_state("domcontentloaded", timeout=15000)

            # Tunggu element kunci saja (bukan semua gambar)
            try:
                await page.wait_for_selector("body", timeout=5000)
            except:
                pass

            # Ambil HTML langsung — tidak perlu scroll untuk data sidebar/list
            final_html = await page.content()
            await browser.close()
            
            print("\033[90m[NAVIGATOR]\033[0m Done.\033[0m")
            return final_html, None
            
        except Exception as e:
            try:
                await browser.close()
            except:
                pass
            return None, str(e)
