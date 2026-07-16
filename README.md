# 🚀 Vexalyn REST API

<div align="center">

![Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-00a393.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**REST API Platform untuk Berbagai Kebutuhan Data**

Platform API yang cepat, andal, dan mudah digunakan dengan berbagai endpoint untuk berbagai sumber data.

[Dokumentasi](#-dokumentasi) • [Instalasi](#-instalasi) • [Endpoints](#-endpoints) • [Demo](#-demo)

</div>

---

## 📋 Daftar Isi

- [Tentang Project](#-tentang-project)
- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Instalasi](#-instalasi)
- [Penggunaan](#-penggunaan)
- [Endpoints](#-endpoints)
- [Dokumentasi](#-dokumentasi)
- [Developer](#-developer)
- [Lisensi & Peringatan](#-lisensi--peringatan)

---

## 🎯 Tentang Project

**Vexalyn Anichin API** adalah REST API yang dirancang khusus untuk melakukan scraping data anime dari website [Anichin.watch](https://anichin.watch/). API ini dibangun dengan teknologi modern dan menggunakan Playwright untuk bypass proteksi Cloudflare secara otomatis.

### Mengapa Menggunakan API dari web Ini?

- ✅ **Cepat & Efisien** - Response time rata-rata < 12 detik
- ✅ **Bypass Cloudflare** - Otomatis menangani proteksi anti-bot
- ✅ **Format JSON Rapi** - Struktur data yang konsisten dan mudah diparsing
- ✅ **Dokumentasi Lengkap** - Swagger UI interaktif untuk testing
- ✅ **Gratis & Open Source** - Bebas digunakan untuk project pribadi

---

## ✨ Fitur Utama

### 🎬 Scraping Homepage
Ambil daftar anime terbaru dari homepage Anichin dengan metadata lengkap (title, episode, thumbnail, URL).

### 🔍 Search Engine
Cari anime berdasarkan keyword dengan hasil yang akurat dan cepat.

### 🎭 Database Genre
Akses 46+ genre anime yang tersedia di Anichin untuk filtering konten.

### 🔄 Auto-Bypass Cloudflare
Sistem otomatis untuk melewati proteksi Cloudflare tanpa perlu konfigurasi manual.

### 📊 Response Terstruktur
Semua data dikembalikan dalam format JSON yang konsisten dan mudah diintegrasikan.

### 🌐 Web Documentation
Dokumentasi interaktif berbasis HTML dengan desain modern dan cyberpunk theme.

---

## 🛠️ Teknologi

Project ini dibangun menggunakan teknologi berikut:

| Teknologi | Versi | Deskripsi |
|-----------|-------|-----------|
| **Python** | 3.9+ | Bahasa pemrograman utama |
| **FastAPI** | 0.104+ | Framework web modern untuk API |
| **Playwright** | 1.40+ | Browser automation untuk scraping |
| **BeautifulSoup4** | 4.12+ | HTML parsing dan data extraction |
| **Uvicorn** | 0.24+ | ASGI server untuk production |

---

## 📦 Instalasi

### Persyaratan Sistem

- Python 3.9 atau lebih tinggi
- pip (Python package manager)
- Koneksi internet stabil

### Langkah Instalasi

1. **Clone Repository**
```bash
git clone https://github.com/VexalynDev/Scraping_Anichin.git
cd Scraping_Anichin
```

2. **Buat Virtual Environment (Opsional tapi Direkomendasikan)**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

4. **Install Playwright Browsers**
```bash
playwright install chromium
```

---

## 🚀 Penggunaan

### Menjalankan Server

Jalankan server API dengan perintah berikut:

```bash
python api.py
```

Server akan berjalan di **http://localhost:8000**

### Akses Dokumentasi

Setelah server berjalan, buka browser dan akses:

- **Web Documentation**: http://localhost:8000/docs/index.html
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🔌 Endpoints

### 1. Root Endpoint
```http
GET /
```
**Deskripsi**: Informasi dasar API

**Response Time**: < 1s

**Example Response**:
```json
{
  "message": "Welcome to Vexalyn Anichin Scraper API",
  "version": "1.0.0",
  "endpoints": {
    "home": "/api/home",
    "search": "/api/search",
    "genres": "/api/genres",
    "docs": "/docs"
  }
}
```

---

### 2. Home Feed
```http
GET /api/home
```
**Deskripsi**: Ambil daftar anime terbaru dari homepage Anichin

**Response Time**: ~12s

**Example Response**:
```json
{
  "status": "success",
  "data": [
    {
      "title": "One Piece Episode 1087",
      "episode": "Episode 1087",
      "image": "https://anichin.watch/image.jpg",
      "url": "https://anichin.watch/anime/one-piece-1087"
    }
  ],
  "total": 24,
  "scraped_at": "2026-07-16T10:30:00"
}
```

---

### 3. Search Anime
```http
GET /api/search?query={keyword}
```
**Deskripsi**: Cari anime berdasarkan keyword

**Parameters**:
- `query` (required): Keyword pencarian

**Response Time**: ~10s

**Example Request**:
```http
GET /api/search?query=naruto
```

**Example Response**:
```json
{
  "status": "success",
  "query": "naruto",
  "data": [
    {
      "title": "Naruto Shippuden",
      "image": "https://anichin.watch/naruto.jpg",
      "url": "https://anichin.watch/anime/naruto-shippuden"
    }
  ],
  "total": 8,
  "scraped_at": "2026-07-16T10:32:00"
}
```

---

### 4. Genres List
```http
GET /api/genres
```
**Deskripsi**: Ambil daftar semua genre yang tersedia

**Response Time**: ~12s

**Example Response**:
```json
{
  "status": "success",
  "data": [
    {
      "name": "Action",
      "url": "https://anichin.watch/genre/action"
    },
    {
      "name": "Adventure",
      "url": "https://anichin.watch/genre/adventure"
    }
  ],
  "total": 46,
  "scraped_at": "2026-07-16T10:35:00"
}
```

---

## 📚 Dokumentasi

### Web Documentation

API ini dilengkapi dengan dokumentasi web interaktif yang dapat diakses di `/docs/index.html`. Fitur dokumentasi meliputi:

- 🎨 **Desain Modern Cyberpunk** - UI yang elegan dan futuristik
- 📱 **Responsive Design** - Kompatibel di semua device
- 🔗 **Live Testing** - Test endpoint langsung dari browser
- 📊 **Example Responses** - Contoh response untuk setiap endpoint
- ⚡ **Performance Stats** - Informasi response time real-time

### Swagger UI

Untuk testing interaktif, gunakan Swagger UI di `/docs`:

1. Buka http://localhost:8000/docs
2. Pilih endpoint yang ingin dicoba
3. Klik "Try it out"
4. Input parameter (jika ada)
5. Klik "Execute"
6. Lihat response langsung

---

## 👨‍💻 Developer

<div align="center">

### **VexalynDev**

[![GitHub](https://img.shields.io/badge/GitHub-VexalynDev-181717?style=for-the-badge&logo=github)](https://github.com/VexalynDev)
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?style=for-the-badge&logo=gmail)](mailto:vexalyndev@gmail.com)

**Full-Stack Developer | API Specialist | Web Scraping Expert**

</div>

Project ini dikembangkan dan dimaintain oleh **VexalynDev** dengan fokus pada performance, reliability, dan user experience. Jika ada pertanyaan atau saran, silakan hubungi melalui:

- 📧 Email: vexalyndev@gmail.com
- 🐙 GitHub: [@VexalynDev](https://github.com/VexalynDev)
- 💬 Discord: VexalynDev#0001

---

## ⚠️ Lisensi & Peringatan

### 📜 Lisensi

Project ini menggunakan **MIT License** - Anda bebas menggunakan, memodifikasi, dan mendistribusikan code ini untuk **keperluan pribadi dan edukasi**.

### 🚫 PERINGATAN PENTING

```
⚠️ DILARANG KERAS UNTUK DIPERJUALBELIKAN ⚠️

Project ini dibuat untuk tujuan edukasi dan penggunaan pribadi.
DILARANG menjual, mengkomersialkan, atau mendistribusikan ulang
API ini dalam bentuk apapun dengan tujuan profit.

Pelanggaran akan dikenakan tindakan hukum sesuai undang-undang
yang berlaku terkait hak cipta dan kekayaan intelektual.
```

### ✅ Boleh Dilakukan

- ✅ Menggunakan untuk project pribadi
- ✅ Menggunakan untuk pembelajaran
- ✅ Memodifikasi sesuai kebutuhan
- ✅ Fork dan kontribusi ke project
- ✅ Sharing pengetahuan secara gratis

### ❌ TIDAK Boleh Dilakukan

- ❌ Menjual API atau source code
- ❌ Mengkomersialkan dalam bentuk apapun
- ❌ Claim sebagai karya sendiri
- ❌ Menghilangkan credit developer
- ❌ Mendistribusikan ulang dengan tujuan profit

### 📖 Disclaimer

- API ini melakukan scraping dari website pihak ketiga (Anichin.watch)
- Developer tidak bertanggung jawab atas penyalahgunaan API
- Gunakan dengan bijak dan hormati terms of service website target
- Scraping berlebihan dapat menyebabkan IP banned
- Data yang diambil adalah property dari website sumber

---

## 🤝 Kontribusi

Kontribusi selalu diterima! Jika Anda ingin berkontribusi:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## 📝 Changelog

### Version 1.0.0 (2026-07-16)
- ✨ Initial release
- ✨ Home feed scraper
- ✨ Search functionality
- ✨ Genres database
- ✨ Auto Cloudflare bypass
- ✨ Web documentation
- ✨ Swagger UI integration
- ⚡ Optimized response time (~12s avg)

---

## 🙏 Acknowledgments

Terima kasih kepada:

- **Anichin.watch** - Sumber data anime
- **FastAPI** - Framework yang luar biasa
- **Playwright** - Browser automation yang powerful
- **Python Community** - Dukungan dan resources

---

<div align="center">

### ⭐ Jika project ini membantu, berikan star!

**Made with ❤️ by VexalynDev**

© 2026 VexalynDev. All Rights Reserved.

</div>
