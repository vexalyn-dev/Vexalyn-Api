# Vexalyn REST API

Platform API terpercaya untuk developer. Integrasi mudah dengan dokumentasi lengkap dan performa tinggi.

## 🚀 Features

- ✅ **6 Endpoints** dari Anichin (Home, Search, Genres, Ongoing Series, Popular Series, New Movie)
- ✅ **24/7 Uptime** dengan monitoring berkelanjutan
- ✅ **Rate Limit 50/jam** per IP - real tracking system
- ✅ **In-Memory Caching** dengan TTL dinamis (3s-3600s response)
- ✅ **Cloudflare Bypass** otomatis
- ✅ **Format JSON** clean dan konsisten
- ✅ **Report System** dengan EmailJS integration
- ✅ **Swagger UI** dokumentasi interaktif

## 📦 Installation

1. **Clone repository:**
```bash
git clone https://github.com/vexalyn-dev/Vexalyn-Api.git
cd Vexalyn-Api
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Install Playwright browsers:**
```bash
playwright install chromium
```

4. **Setup environment variables:**
```bash
# Copy .env.example to .env
copy .env.example .env

# Edit .env and configure your settings (optional)
```

## ⚙️ Configuration

### Google OAuth Setup (Optional)

Jika ingin menggunakan Google Sign-In yang real (bukan demo mode):

1. **Buka [Google Cloud Console](https://console.cloud.google.com)**
2. **Buat project baru** atau pilih existing project
3. **Enable Google+ API** di APIs & Services
4. **Buat OAuth 2.0 Client ID:**
   - Go to: `APIs & Services` → `Credentials`
   - Click: `Create Credentials` → `OAuth 2.0 Client ID`
   - Application type: `Web application`
   - Authorized JavaScript origins: `http://localhost:8000`
   - Authorized redirect URIs: `http://localhost:8000`
5. **Copy Client ID** yang dihasilkan
6. **Paste ke file `.env`:**
```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

**Note:** Tanpa setup ini, login/register akan menggunakan **demo mode** yang tetap functional untuk testing.

## 🏃 Running the Server

```bash
python api.py
```

Server akan berjalan di:
- 🌐 Homepage: http://localhost:8000/
- 📚 API Docs: http://localhost:8000/docs
- 🔐 Login: http://localhost:8000/login
- 📝 Register: http://localhost:8000/register

## 📡 API Endpoints

### Anichin Endpoints

| Method | Endpoint | Description | Cache TTL | First Load | Cached |
|--------|----------|-------------|-----------|------------|--------|
| GET | `/anichin/home` | Homepage feed | 5 min | ~3-5s | <100ms |
| GET | `/anichin/search?q={query}` | Search donghua | 3 min | ~3-5s | <100ms |
| GET | `/anichin/genres` | List all genres | 1 hour | ~3-5s | <100ms |
| GET | `/anichin/ongoing-series` | Ongoing series | 5 min | ~3-5s | <100ms |
| GET | `/anichin/popular-series?filter={weekly\|monthly\|all}` | Popular series | 10 min | ~3-5s | <100ms |
| GET | `/anichin/new-movie` | New movie releases | 10 min | ~3-5s | <100ms |

### System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rate-limit-status` | Check your rate limit status |
| GET | `/cache/stats` | View cache statistics |
| DELETE | `/cache/clear` | Clear all cache (admin) |
| GET | `/vexalyn` | Developer & project info |

## 🔒 Rate Limiting

**REAL Implementation - Bukan Pajangan!**

Sistem rate limiting otomatis diterapkan ke semua API endpoints:

### Limit
- **50 requests per jam** per IP address
- Window: 1 jam (3600 detik)
- Reset otomatis setelah 1 jam

### Cara Kerja
1. Setiap request, sistem tracking IP address dan timestamp
2. Request lama (>1 jam) otomatis dihapus dari history
3. Jika sudah 50 request dalam 1 jam → error 429
4. Headers otomatis ditambahkan di setiap response:
   ```
   X-RateLimit-Limit: 50
   X-RateLimit-Remaining: 45
   X-RateLimit-Reset: 3456
   ```

### Response Ketika Limit Tercapai
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Rate limit: 50 requests per hour.",
  "retry_after_seconds": 3456,
  "client_ip": "127.0.0.1"
}
```
Status Code: **429 Too Many Requests**

### Cek Status Rate Limit
```bash
GET /rate-limit-status
```

Response:
```json
{
  "client_ip": "127.0.0.1",
  "limit": 50,
  "used": 12,
  "remaining": 38,
  "reset_in_seconds": 3245,
  "window": "1 hour"
}
```

### Testing
Jalankan test script:
```bash
python test_rate_limit.py
```

### Catatan Penting
- ✅ Halaman UI (`/`, `/docs`, `/login`, `/register`) tidak kena rate limit
- ✅ Rate limit per IP, bukan global
- ✅ Reset otomatis setelah 1 jam dari request pertama
- ✅ Headers rate limit ada di setiap response

## 📊 Performance & Caching

### In-Memory Cache System
- **First Request:** ~3-5 detik (scraping real-time)
- **Cached Request:** <100ms (instant dari memory)
- **TTL Berbeda per Endpoint:**
  - Home: 5 menit (konten sering update)
  - Search: 3 menit (hasil search dinamis)
  - Genres: 1 jam (jarang berubah)
  - Ongoing Series: 5 menit
  - Popular Series: 10 menit
  - New Movie: 10 menit

### Cache Management
```bash
# Lihat cache stats
GET /cache/stats

# Clear semua cache
DELETE /cache/clear
```

### Browser Optimization
- Wait strategy: `domcontentloaded` (2-3s lebih cepat)
- Resource blocking: images, fonts, media, analytics
- Viewport: 1280x720
- Chrome flags: `--disable-gpu`, `--no-sandbox`

## 🐛 Report System

Lapor bug atau request fitur melalui:
- **Web Form:** http://localhost:8000/report.html
- **Email:** vioatmajaya@gmail.com

Kategori laporan:
- 🐛 Bug Report
- ⚡ Performance Issue
- 🔌 API Error/Tidak Berfungsi
- ✨ Request Fitur Baru
- ⏱️ Rate Limit Issue
- 📝 Lainnya

## 📖 Usage Example

### JavaScript/Fetch
```javascript
// Search donghua
fetch('http://localhost:8000/anichin/search?q=renegade')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Python/Requests
```python
import requests

# Get home feed
response = requests.get('http://localhost:8000/anichin/home')
data = response.json()
print(data)
```

### cURL
```bash
# Get genres
curl http://localhost:8000/anichin/genres
```

## 🎨 Project Structure

```
Scraping_Anichin/
├── Anichin/              # Anichin scraper modules
│   ├── Home.py
│   ├── Search.py
│   ├── Genres.py
│   ├── Ongoing_Series.py
│   └── __init__.py
├── public/               # Frontend HTML pages
│   ├── index.html       # Homepage
│   ├── login.html       # Login page
│   └── register.html    # Register page
├── core/                 # Core scraping engine
│   └── browser.py       # Playwright wrapper
├── api.py               # FastAPI server
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## 🛠️ Technology Stack

- **Backend:** FastAPI, Uvicorn
- **Scraping:** Playwright, BeautifulSoup4
- **Auth:** Google OAuth 2.0
- **Frontend:** Vanilla HTML/CSS/JS with Neobrutalism design

## 🔒 Security

- ✅ `.env` file for sensitive data (ignored by git)
- ✅ CORS middleware configured
- ✅ Google OAuth for authentication
- ✅ No API keys required for endpoints

## 📝 License

© 2026 Vexalyn Developer. All rights reserved.

## 👨‍💻 Developer

**Vexalyn Developer**
- Email: vioatmajaya@gmail.com
- GitHub: [@vexalyn-dev](https://github.com/vexalyn-dev)
- Website: [vexalyndev.my.id](https://vexalyndev.my.id)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Support

Give a ⭐️ if this project helped you!
