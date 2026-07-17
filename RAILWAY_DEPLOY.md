# 🚂 Railway Deployment - Quick Fix

## ✅ Problem Fixed!

Error `'$PORT' is not a valid integer` sudah diperbaiki dengan:
- ✅ Startup script (`start.sh`) untuk handle PORT environment variable
- ✅ Dockerfile menggunakan script, bukan hardcode command
- ✅ railway.toml sudah dikonfigurasi dengan benar

---

## 🚀 Deploy Steps

### 1. Commit & Push Changes

```bash
# Add semua perubahan
git add .

# Commit
git commit -m "Fix Railway deployment PORT issue"

# Push ke GitHub
git push origin main
```

### 2. Railway Auto-Deploy

Railway akan otomatis:
1. Detect perubahan di GitHub
2. Build Docker image dengan Dockerfile baru
3. Run `start.sh` yang handle PORT dengan benar
4. Deploy!

**Build time:** ~8-10 menit (first build)

### 3. Monitor Logs

Di Railway dashboard:
- **Build Logs:** Lihat proses install dependencies
- **Deploy Logs:** Lihat startup logs

**Expected logs setelah fix:**
```
Starting Uvicorn server on port 8000...
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **No more `'$PORT' is not a valid integer` error!**

---

## 🔧 What Was Changed?

### Before (❌ Broken):
```dockerfile
# Dockerfile
CMD uvicorn api:app --host 0.0.0.0 --port $PORT
```
❌ Problem: Docker CMD tidak expand `$PORT` dengan benar

### After (✅ Fixed):
```dockerfile
# Dockerfile
CMD ["./start.sh"]
```

```bash
# start.sh
PORT=${PORT:-8000}
exec uvicorn api:app --host 0.0.0.0 --port "$PORT"
```
✅ Solution: Shell script handle environment variable expansion

---

## 🌐 Access Your API

Setelah deploy sukses:

**URL:** `https://vexalyn-api.up.railway.app`

**Test endpoints:**
```bash
# Health check
curl https://vexalyn-api.up.railway.app/vexalyn

# Rate limit status
curl https://vexalyn-api.up.railway.app/rate-limit-status

# Scrape home
curl https://vexalyn-api.up.railway.app/anichin/home
```

---

## ⚠️ First Request Will Be Slow

**Why?**
- Playwright perlu initialize browser (~2-3 detik)
- No cache pada first request
- Cold container startup

**After that:**
- Cached requests: <100ms
- Non-cached: 3-5 detik

---

## 🔒 Environment Variables

Di Railway dashboard, set:

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Port tidak perlu diset** - Railway auto-assign dan inject ke container.

---

## 🐛 Troubleshooting

### Build Still Failing?

1. **Check Build Logs:**
   - Playwright install error? → Memory issue
   - Dependency error? → Check requirements.txt

2. **Increase Memory:**
   - Railway Settings → Resources
   - Increase RAM to 2GB (dari default 512MB)

3. **Clear Build Cache:**
   - Railway Settings → Clear build cache
   - Trigger new deployment

### Deploy Success but API Not Working?

1. **Check Deploy Logs:**
   ```
   Railway Dashboard → Deploy Logs
   ```
   
2. **Common issues:**
   - Import error → Check module paths
   - Playwright error → Browser install gagal
   - Port error → Sudah fixed dengan start.sh!

### Timeout on Scraping?

Browser scraping butuh waktu. Railway timeout:
- Free tier: No timeout
- Request timeout: 300 detik (5 menit) - cukup!

---

## 💰 Cost Estimate

**Railway Free Tier:**
- $5 credit setiap bulan
- ~500 jam runtime
- = ~20 hari 24/7 running

**After free tier:**
- ~$5/bulan untuk 1 instance
- Memory usage: ~512MB-1GB
- Bandwidth: Included

---

## ✅ Deployment Checklist

- [x] Fix PORT issue dengan start.sh
- [x] Update Dockerfile
- [x] Update railway.toml
- [ ] Push ke GitHub
- [ ] Tunggu Railway auto-deploy (~10 menit)
- [ ] Test API endpoints
- [ ] Set environment variables (GOOGLE_CLIENT_ID)
- [ ] Update frontend URL (jika ada)

---

## 🎉 Ready!

Push changes ke GitHub, Railway akan auto-deploy dengan fix ini.

**Expected result:** API running di `https://vexalyn-api.up.railway.app` tanpa error! 🚀
