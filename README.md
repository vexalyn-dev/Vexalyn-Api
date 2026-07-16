# Vexalyn REST API

Platform API terpercaya untuk developer. Integrasi mudah dengan dokumentasi lengkap dan performa tinggi.

## 🚀 Features

- ✅ **4 Endpoints** dari Anichin (Home, Search, Genres, Ongoing Series)
- ✅ **24/7 Uptime** dengan monitoring berkelanjutan
- ✅ **Zero Rate Limit** - bebas testing dan production
- ✅ **Cloudflare Bypass** otomatis
- ✅ **Format JSON** clean dan konsisten
- ✅ **Google OAuth** authentication (optional)
- ✅ **Swagger UI** dokumentasi interaktif

## 📦 Installation

1. **Clone repository:**
```bash
git clone <repository-url>
cd Scraping_Anichin
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

| Method | Endpoint | Description | Response Time |
|--------|----------|-------------|---------------|
| GET | `/anichin/home` | Homepage feed | ~12s |
| GET | `/anichin/search?q={query}` | Search donghua | ~10s |
| GET | `/anichin/genres` | List all genres | ~12s |
| GET | `/anichin/ongoing-series` | Ongoing series list | ~35s |

### Developer Info

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vexalyn` | Developer & project info |

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
