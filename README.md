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

**Vexalyn REST API** adalah platform REST API yang dirancang untuk menyediakan berbagai endpoint data dari berbagai sumber. Saat ini, API ini menyediakan endpoint untuk scraping data donghua/anime dan akan terus berkembang dengan menambahkan endpoint lainnya di masa depan.

API ini dibangun dengan teknologi modern dan menggunakan Playwright untuk bypass proteksi Cloudflare secara otomatis.

### Mengapa Menggunakan API Ini?

- ✅ **Cepat & Efisien** - Response time rata-rata < 12 detik
- ✅ **Multi-Source** - Mendukung berbagai sumber data (dan terus bertambah)
- ✅ **Bypass Cloudflare** - Otomatis menangani proteksi anti-bot
- ✅ **Format JSON Rapi** - Struktur data yang konsisten dan mudah diparsing
- ✅ **Dokumentasi Lengkap** - Swagger UI interaktif untuk testing
- ✅ **Gratis & Open Source** - Bebas digunakan untuk project pribadi
- ✅ **Scalable** - Mudah menambahkan endpoint baru

---

## ✨ Fitur Utama

### 🌐 Multi-Source Data
Mendukung berbagai sumber data dengan endpoint yang berbeda-beda. Saat ini tersedia endpoint untuk donghua/anime, dan akan terus berkembang.

### 🎬 Data Scraping
Ambil data dari berbagai website dengan metadata lengkap (title, episode, thumbnail, URL, dan lainnya).

### 🔍 Search Functionality
Cari data berdasarkan keyword dengan hasil yang akurat dan cepat.

### 🔄 Auto-Bypass Cloudflare
Sistem otomatis untuk melewati proteksi Cloudflare tanpa perlu konfigurasi manual.

### 📊 Response Terstruktur
Semua data dikembalikan dalam format JSON yang konsisten dan mudah diintegrasikan.

### 🌐 Web Documentation
Dokumentasi interaktif berbasis HTML dengan desain modern, playful, dan neobrutalism theme dengan warna-warna pastel yang eye-friendly.

### 🔌 Easy Integration
API yang mudah diintegrasikan dengan berbagai platform dan bahasa pemrograman.

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
git clone https://github.com/vexalyn-dev/Vexalyn-Api.git
cd Vexalyn-Api
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

### 📌 Donghua/Anime Endpoints

API endpoint untuk data donghua dan anime:

#### 1. Root Endpoint
```http
GET /
```
**Deskripsi**: Informasi dasar API

**Response Time**: < 1s

**Example Response**:
```json
{
  "creator": "Vexalyn Developer",
  "statusCode": 200,
  "status": "success",
  "message": "Welcome to Vexalyn REST API",
  "ok": true,
  "version": "1.0.0",
  "available_sources": ["donghua"],
  "endpoints": {
    "home": "/api/home - Get latest donghua from homepage",
    "search": "/api/search?q=keyword - Search donghua by keyword",
    "genres": "/api/genres - Get all available genres"
  },
  "documentation": "/docs",
  "status": "online"
}
```

---

#### 2. Home Feed
```http
GET /api/home
```
**Deskripsi**: Ambil daftar donghua/anime terbaru dari homepage

**Response Time**: ~12s

**Example Response**:
```json
{
  "creator": "Vexalyn Developer",
  "statusCode": 200,
  "status": "success",
  "message": "Data fetched successfully",
  "ok": true,
  "total_data": 24,
  "data": [
    {
      "title": "Perfect World Episode 214",
      "url": "https://example.com/anime/perfect-world-214",
      "latest_episode": "Episode 214",
      "thumbnail": "https://example.com/uploads/perfect-world.jpg"
    },
    {
      "title": "Battle Through The Heavens Season 6 Episode 12",
      "url": "https://example.com/anime/btth-s6-12",
      "latest_episode": "Episode 12",
      "thumbnail": "https://example.com/uploads/btth-s6.jpg"
    }
  ]
}
```

---

#### 3. Search Donghua/Anime
```http
GET /api/search?q={keyword}
```
**Deskripsi**: Cari donghua/anime berdasarkan keyword

**Parameters**:
- `q` (required): Keyword pencarian

**Response Time**: ~10s

**Example Request**:
```http
GET /api/search?q=martial
```

**Example Response**:
```json
{
  "creator": "Vexalyn Developer",
  "statusCode": 200,
  "status": "success",
  "message": "Search results for: 'martial'",
  "ok": true,
  "query": "martial",
  "total_data": 12,
  "data": [
    {
      "title": "Martial Master Season 4",
      "url": "https://example.com/anime/martial-master-s4",
      "latest_episode": "Episode 8",
      "status": "Ongoing",
      "thumbnail": "https://example.com/uploads/martial-master.jpg"
    },
    {
      "title": "Martial Universe Season 3",
      "url": "https://example.com/anime/martial-universe-s3",
      "latest_episode": "Full Series",
      "status": "Completed",
      "thumbnail": "https://example.com/uploads/martial-universe.jpg"
    }
  ]
}
```

---

#### 4. Genres List
```http
GET /api/genres
```
**Deskripsi**: Ambil daftar semua genre yang tersedia

**Response Time**: ~12s

**Example Response**:
```json
{
  "creator": "Vexalyn Developer",
  "statusCode": 200,
  "status": "success",
  "message": "Genre list fetched successfully",
  "ok": true,
  "total_genres": 46,
  "data": [
    {
      "name": "Action",
      "url": "https://example.com/genre/action"
    },
    {
      "name": "Adventure",
      "url": "https://example.com/genre/adventure"
    },
    {
      "name": "Comedy",
      "url": "https://example.com/genre/comedy"
    },
    {
      "name": "Drama",
      "url": "https://example.com/genre/drama"
    },
    {
      "name": "Fantasy",
      "url": "https://example.com/genre/fantasy"
    }
  ]
}
```

---

### 📌 Coming Soon

Endpoint lainnya akan segera ditambahkan! Stay tuned untuk update selanjutnya.

---

## 📚 Dokumentasi

### Web Documentation

API ini dilengkapi dengan dokumentasi web interaktif yang dapat diakses di `/docs/index.html`. Fitur dokumentasi meliputi:

- 🎨 **Desain Modern Neobrutalism** - UI playful dengan warna pastel yang eye-friendly
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

[![GitHub](https://img.shields.io/badge/GitHub-vexalyn--dev-181717?style=for-the-badge&logo=github)](https://github.com/vexalyn-dev)
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?style=for-the-badge&logo=gmail)](mailto:vioatmajaya@gmail.com)

**Full-Stack Developer | Hanya Pemula | Web Scraping Expert**

</div>

Project ini dikembangkan dan dimaintain oleh **VexalynDev** dengan fokus pada performance, reliability, dan user experience. Jika ada pertanyaan atau saran, silakan hubungi melalui:

- 📧 Email: vioatmajaya@gmail.com
- 🐙 GitHub: [@vexalyn-dev](https://github.com/vexalyn-dev)
- 💬 Website: https://vexalyndev.my.id

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

- API ini dapat melakukan scraping dari berbagai website pihak ketiga
- Developer tidak bertanggung jawab atas penyalahgunaan API
- Gunakan dengan bijak dan hormati terms of service website target
- Scraping berlebihan dapat menyebabkan IP banned
- Data yang diambil adalah property dari website sumber
- Pastikan mematuhi aturan hukum dan etika dalam penggunaan data

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
- ✨ Endpoints: Home feed, Search, Genres
- ✨ Auto Cloudflare bypass
- ✨ Web documentation dengan modern neobrutalism theme
- ✨ Swagger UI integration
- ⚡ Optimized response time (~12s avg)
- 🔄 Scalable architecture untuk menambah endpoint baru

---

## 🙏 Acknowledgments

Terima kasih kepada:

- **Sumber Data** - Website yang menyediakan konten
- **FastAPI** - Framework yang luar biasa
- **Playwright** - Browser automation yang powerful
- **Python Community** - Dukungan dan resources
- **Open Source Community** - Inspirasi dan kontribusi

---

<div align="center">

### ⭐ Jika project ini membantu, berikan star!

**Made with ❤️ by VexalynDev**

© 2026 VexalynDev. All Rights Reserved.

</div>
