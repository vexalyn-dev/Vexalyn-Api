# core/browser.py
import asyncio
from playwright.async_api import async_playwright

async def get_page_content(url: str):
    """
    Mengambil HTML mentah dari URL target.
    Dilengkapi sistem Auto-Click Bypass Landing Page + Aggressive Scrolling.
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)  # Production mode
        # Gunakan resolusi layar PC standar biar gak dicurigai bot mobile
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={'width': 1920, 'height': 1080}
        )
        page = await context.new_page()
        
        try:
            print(f"\n\033[96m[NAVIGATOR]\033[0m Membuka URL: {url}")
            # 1. Buka URL target dengan wait yang lebih panjang
            await page.goto(url, wait_until="load", timeout=90000)

            # 2. Lacak Tombol Bypass (Mencari elemen <a> yang punya teks 'Klik Menuju')
            await page.wait_for_timeout(500)  # REDUCED: 2000ms -> 500ms
            bypass_button = page.locator("a:has-text('Klik Menuju'), a:has-text('Click to'), button:has-text('Enter')")
            
            if await bypass_button.count() > 0:
                print("\n\033[93m[BYPASS SYSTEM]\033[0m Landing Page Terdeteksi!")
                print("\033[93m[BYPASS SYSTEM]\033[0m Mengeksekusi Auto-Click untuk memaksa masuk...")
                # Klik paksa tombolnya biar langsung masuk ke web asli
                await bypass_button.first.click()
                # Tunggu halaman new load
                await page.wait_for_load_state("load", timeout=90000)
                await page.wait_for_timeout(1000)  # REDUCED: 3000ms -> 1000ms
                print("\033[93m[BYPASS SYSTEM]\033[0m Berhasil bypass, masuk ke halaman utama.")
            else:
                print("\n\033[90m[BYPASS SYSTEM]\033[0m Aman, tidak ada Landing Page.\033[0m")

            # 3. Tunggu elemen konten muncul (tunggu ada gambar poster donghua)
            print("\033[96m[NAVIGATOR]\033[0m Menunggu konten JS selesai render...")
            try:
                # Tunggu minimal ada 5 gambar ter-load (indicator konten sudah muncul)
                await page.wait_for_selector("img", timeout=8000)  # REDUCED: 15000ms -> 8000ms
                await page.wait_for_timeout(1000)  # REDUCED: 5000ms -> 1000ms
            except:
                print("\033[93m[WARNING]\033[0m Gambar tidak terdeteksi, lanjut paksa...")
            
            # 4. Aggressive scrolling untuk trigger lazy-load
            print("\033[96m[NAVIGATOR]\033[0m Scrolling untuk trigger lazy-load...")
            for i in range(3):  # REDUCED: 5 scrolls -> 3 scrolls
                await page.evaluate(f"window.scrollBy(0, 1000)")
                await page.wait_for_timeout(300)  # REDUCED: 800ms -> 300ms
            
            # Scroll back ke atas
            await page.evaluate("window.scrollTo(0, 0)")
            await page.wait_for_timeout(500)  # REDUCED: 2000ms -> 500ms

            # Ambil HTML finalnya dengan retry
            print("\033[96m[NAVIGATOR]\033[0m Mengambil HTML final...")
            final_html = None
            for retry in range(3):
                try:
                    final_html = await page.content()
                    if final_html:
                        break
                except:
                    await page.wait_for_timeout(500)
            
            if not final_html:
                raise Exception("Failed to get page content after retries")
            
            await browser.close()
            
            return final_html, None
            
        except Exception as e:
            await browser.close()
            return None, str(e)