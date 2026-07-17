# 🚀 Deployment Guide - Anichin API

## ❌ Platform Yang TIDAK Support:

### Vercel / Netlify Functions
**Alasan:**
- ❌ Tidak support Playwright/browser automation
- ❌ Timeout terlalu pendek (10-60 detik)
- ❌ Binary size limit (50MB) terlalu kecil
- ❌ Serverless = cold start + no persistent state
- ❌ Rate limiter & cache tidak berfungsi

---

## ✅ Platform Yang Support:

### 1. Railway.app (RECOMMENDED) ⭐

**Pros:**
- ✅ Free tier: 500 jam/bulan ($5 credit)
- ✅ Support Docker & Playwright
- ✅ Persistent instance (no cold start)
- ✅ Auto-deploy dari GitHub
- ✅ Environment variables
- ✅ Custom domains
- ✅ Auto-scaling

**Steps:**

#### A. Preparation
```bash
# 1. Push ke GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

#### B. Deploy via Railway
1. **Sign up:** https://railway.app/ (login with GitHub)
2. **New Project** → **Deploy from GitHub repo**
3. **Select repository:** `Scraping_Anichin`
4. **Configure:**
   - Builder: **Docker**
   - Dockerfile Path: `Dockerfile`
5. **Environment Variables:**
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   PORT=8000
   ```
6. **Deploy!**

#### C. Monitor
- Railway dashboard akan show logs
- Tunggu ~5-10 menit untuk first build
- Setelah selesai, dapat URL: `https://anichin-scraper.up.railway.app`

**Cost Estimate:**
- Free tier: 500 jam/bulan = ~20 hari 24/7
- Setelah itu: ~$5/bulan untuk 1 instance

---

### 2. Render.com

**Pros:**
- ✅ Free tier: 750 jam/bulan
- ✅ Support Docker
- ✅ Auto-deploy dari GitHub
- ✅ SSL certificate gratis

**Cons:**
- ⚠️ Instance sleep setelah 15 menit idle
- ⚠️ Cold start ~30 detik
- ⚠️ Performa lebih lambat dari Railway

**Steps:**

1. **Sign up:** https://render.com/
2. **New** → **Web Service**
3. **Connect repository**
4. **Configure:**
   - Name: `anichin-api`
   - Environment: **Docker**
   - Plan: **Free**
5. **Environment Variables:**
   ```
   GOOGLE_CLIENT_ID=your-client-id
   ```
6. **Create Web Service**

**URL:** `https://anichin-api.onrender.com`

---

### 3. Fly.io

**Pros:**
- ✅ Free tier: 3 shared CPU VMs
- ✅ Global deployment (multi-region)
- ✅ Auto-scale to zero (hemat cost)

**Steps:**

#### A. Install Fly CLI
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Verify
flyctl version
```

#### B. Login & Deploy
```bash
# Login
flyctl auth login

# Launch (dari folder project)
flyctl launch
# Jawab pertanyaan:
# - App name: anichin-scraper
# - Region: Singapore (sin)
# - Setup Postgres: NO
# - Deploy now: YES

# Set environment variables
flyctl secrets set GOOGLE_CLIENT_ID=your-client-id

# Deploy
flyctl deploy
```

**URL:** `https://anichin-scraper.fly.dev`

---

### 4. VPS (DigitalOcean, Linode, Vultr)

**Pros:**
- ✅ Full control
- ✅ No platform limitations
- ✅ Predictable cost

**Cons:**
- ⚠️ Manual setup required
- ⚠️ Need to manage server

**Steps:**

#### A. Create VPS
- Provider: DigitalOcean / Vultr / Linode
- Plan: $5-6/bulan (1GB RAM)
- OS: Ubuntu 22.04 LTS

#### B. Setup Server
```bash
# SSH ke server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Clone repo
git clone https://github.com/USERNAME/REPO.git
cd REPO

# Create .env file
nano .env
# Paste:
# GOOGLE_CLIENT_ID=your-client-id

# Build & Run
docker-compose up -d --build
```

#### C. Setup Nginx (Optional - untuk custom domain)
```bash
# Install Nginx
apt install nginx -y

# Configure
nano /etc/nginx/sites-available/anichin-api

# Paste:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Enable
ln -s /etc/nginx/sites-available/anichin-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Install SSL (optional)
apt install certbot python3-certbot-nginx -y
certbot --nginx -d api.yourdomain.com
```

---

## 🔧 Docker Compose (Local Testing)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
    restart: unless-stopped
```

**Test locally:**
```bash
docker-compose up --build
```

---

## 📊 Platform Comparison

| Platform | Free Tier | Cold Start | Playwright | Cost/mo | Best For |
|----------|-----------|------------|------------|---------|----------|
| **Railway** | 500h | ❌ No | ✅ Yes | $5+ | Production ⭐ |
| **Render** | 750h | ⚠️ 30s | ✅ Yes | Free | Testing |
| **Fly.io** | 3 VMs | ⚠️ 10s | ✅ Yes | Free | Global |
| **VPS** | - | ❌ No | ✅ Yes | $5+ | Full Control |
| **Vercel** | Unlimited | ⚠️ Yes | ❌ No | - | ❌ Not Compatible |

---

## 🚀 Recommended: Railway.app

**Kenapa Railway?**
1. ✅ Paling simple setup (connect GitHub → auto deploy)
2. ✅ No cold start (instance always running)
3. ✅ Built-in monitoring & logs
4. ✅ Auto-restart on crash
5. ✅ Environment variables management
6. ✅ Custom domains support
7. ✅ Affordable ($5/bulan setelah free tier)

**Deployment Time:**
- First build: ~8-10 menit
- Subsequent deploys: ~3-5 menit
- Auto-deploy on git push

---

## 🔒 Environment Variables

Semua platform butuh environment variable ini:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Optional (jika pakai custom port):**
```env
PORT=8000
```

---

## 📝 Post-Deployment Checklist

- [ ] Cek API response: `https://your-app.railway.app/vexalyn`
- [ ] Test scraping: `https://your-app.railway.app/anichin/home`
- [ ] Test rate limiter: `https://your-app.railway.app/rate-limit-status`
- [ ] Update API URL di frontend (jika ada)
- [ ] Setup custom domain (optional)
- [ ] Enable monitoring/alerts

---

## 🐛 Troubleshooting

### Build Failed
```bash
# Cek logs di Railway dashboard
# Common issues:
# - Playwright install gagal → increase memory
# - Dependencies conflict → update requirements.txt
```

### Timeout on Scraping
```bash
# Increase timeout di browser.py
# Atau optimize scraping logic
```

### Rate Limiter Not Working
```bash
# Railway/Render: working ✅ (persistent instance)
# Vercel: not working ❌ (serverless)
```

---

## 💡 Tips

1. **Use Railway for production** (best performance)
2. **Use Render for testing** (sleep on idle = save money)
3. **Avoid Vercel/Netlify** (not compatible dengan Playwright)
4. **Monitor memory usage** (scraping bisa memory-intensive)
5. **Setup health check** endpoint untuk monitoring

---

**Ready to deploy? Start with Railway! 🚀**
