# 🎬 Vexalyn Anichin Scraper

> Professional Donghua scraping engine untuk Anichin.watch dengan Playwright bypass protection

## 📋 Features

✅ **Home Page Scraper** - Extract latest donghua dari halaman utama  
✅ **Search Engine** - Cari donghua berdasarkan keyword  
✅ **Episode Detection** - Auto-extract episode number dari title  
✅ **Cloudflare Bypass** - Automatic landing page detection & bypass  
✅ **Lazy Load Handler** - Aggressive scrolling untuk trigger lazy-load images  
✅ **Clean Data** - Filter spam, duplikat, dan invalid data  
✅ **Debug Mode** - Save HTML snapshot untuk debugging  

---

## 🚀 Installation

### Requirements:
- Python 3.10+
- Playwright browser drivers

### Install Dependencies:

```bash
pip install playwright beautifulsoup4
playwright install chromium
```

---

## 📖 Usage

### 1️⃣ Home Page Scraper

Extract donghua terbaru dari halaman utama:

```bash
python home.py
```

**Output Example:**
```json
{
    "creator": "Vexalyn Developer",
    "statusCode": 200,
    "status": "success",
    "total_data": 38,
    "data": [
        {
            "title": "Renegade Immortal Episode 149 Subtitle Indonesia",
            "url": "https://anichin.watch/renegade-immortal-episode-149-subtitle-indonesia/",
            "latest_episode": "Episode 149",
            "thumbnail": "https://i2.wp.com/anichin.watch/wp-content/uploads/2023/09/Renegade-Immortal.png?resize=247,350"
        },
        {
            "title": "Martial Master Episode 674 Subtitle Indonesia",
            "url": "https://anichin.watch/martial-master-episode-674-subtitle-indonesia/",
            "latest_episode": "Episode 674",
            "thumbnail": "https://anichin.watch/wp-content/uploads/2023/08/Wushen-Zhuzai.webp"
        }
    ]
}
```

---

### 2️⃣ Search Scraper

Cari donghua berdasarkan keyword:

```bash
python search.py "martial master"
python search.py "immortal"
python search.py "god emperor"
```

**Output Example:**
```json
{
    "creator": "Vexalyn Developer",
    "statusCode": 200,
    "status": "success",
    "query": "martial master",
    "total_data": 1,
    "data": [
        {
            "title": "Martial Master",
            "url": "https://anichin.watch/donghua/martial-master/",
            "latest_episode": "Full Series",
            "status": "Completed",
            "thumbnail": "https://anichin.watch/wp-content/uploads/2023/08/Wushen-Zhuzai.webp"
        }
    ]
}
```

---

## 🔧 Configuration

### Target URL
Default target: `https://anichin.watch/`

Untuk mengubah target, edit di file:
- `home.py` → line 46
- `search.py` → line 106

### Timeout & Wait Time
Edit di `core/browser.py`:
- `wait_for_load_state`: Line 30 (default: 90s)
- `wait_for_selector`: Line 35 (default: 15s)
- `scroll_delay`: Line 42-47 (default: 800ms per scroll)

---

## 📁 Project Structure

```
Scraping_Anichin/
│
├── core/
│   ├── __init__.py           # Core package init
│   └── browser.py            # Playwright browser handler + bypass logic
│
├── home.py                   # Home page scraper (main)
├── search.py                 # Search scraper
├── debug_anichin.html        # Debug HTML snapshot (auto-generated)
├── debug_search.html         # Search debug snapshot (auto-generated)
└── README.md                 # This file
```

---

## 🛡️ Bypass Protection Features

### Automatic Landing Page Detection
Scraper otomatis mendeteksi landing page countdown dan melakukan auto-click untuk bypass:

```python
bypass_button = page.locator("a:has-text('Klik Menuju'), a:has-text('Click to'), button:has-text('Enter')")
if await bypass_button.count() > 0:
    await bypass_button.first.click()
```

### Lazy Load Handler
Aggressive scrolling untuk memuat semua gambar:

```python
for i in range(5):
    await page.evaluate(f"window.scrollBy(0, 1000)")
    await page.wait_for_timeout(800)
```

---

## 🐛 Debugging

### Enable Debug Mode
Debug HTML otomatis disimpan ke:
- `debug_anichin.html` (home scraper) - Auto-generated
- `debug_search.html` (search scraper) - Auto-generated

**Note:** File HTML debug tidak di-commit ke repository (ada di `.gitignore`)

### Check Browser Visibility
Edit `core/browser.py` line 16:
```python
# Headless mode (production)
browser = await p.chromium.launch(headless=True)

# Visible mode (debugging)
browser = await p.chromium.launch(headless=False)
```

---

## 📊 Data Structure

### Home Scraper Response:
```typescript
{
    creator: string,
    statusCode: number,
    status: "success" | "error",
    message: string,
    ok: boolean,
    total_data: number,
    data: Array<{
        title: string,           // Judul donghua + episode
        url: string,             // URL detail page
        latest_episode: string,  // "Episode 123" | "Full Series"
        thumbnail: string        // Image URL
    }>
}
```

### Search Response:
```typescript
{
    creator: string,
    statusCode: number,
    status: "success" | "error",
    message: string,
    ok: boolean,
    query: string,              // Search keyword
    total_data: number,
    data: Array<{
        title: string,
        url: string,
        latest_episode: string,
        status: string,          // "Ongoing" | "Completed" | "N/A"
        thumbnail: string
    }>
}
```

---

## ⚡ Performance

- **Home Scraper**: ~20-25 seconds
- **Search Scraper**: ~20-25 seconds
- **Average Data**: 30-40 items per scrape

---

## 🚨 Error Handling

### Common Errors:

**1. Timeout Error**
```
Solution: Tingkatkan timeout di browser.py line 30
await page.goto(url, wait_until="load", timeout=120000)
```

**2. No Data Extracted**
```
Solution: Check debug HTML file dan update selector di home.py/search.py
```

**3. Encoding Error (Windows)**
```
Solution: Sudah diatasi dengan ASCII-safe characters di banner
```

---

## 📝 License

Created by **Vexalyn Developer**  
For educational purposes only.

---

## 🤝 Contributing

Contributions are welcome! Untuk bug reports atau feature requests:
1. Check debug HTML files
2. Test dengan berbagai keywords
3. Document expected vs actual behavior

---

## 📞 Support

Jika ada masalah:
1. ✅ Check debug HTML files first
2. ✅ Test dengan URL yang berbeda
3. ✅ Enable headless=False untuk visual debugging
4. ✅ Check selector patterns di BeautifulSoup section

---

**Happy Scraping! 🎬**
