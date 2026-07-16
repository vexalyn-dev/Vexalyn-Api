"""
Vexalyn REST API - Multi-Source Scraper
FastAPI server untuk expose scraper functions dari berbagai sumber
"""

import sys
import asyncio
import os
from pathlib import Path

# Fix asyncio event loop untuk Windows (support subprocess Playwright)
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Vexalyn REST API",
    description="Multi-Source REST API by Vexalyn Developer",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (public folder untuk UI)
public_path = os.path.join(os.path.dirname(__file__), "public")
if os.path.exists(public_path):
    app.mount("/assets", StaticFiles(directory=public_path), name="assets")

# ===== WEB UI ROUTES =====

@app.get("/")
async def serve_index():
    """Serve main index/homepage"""
    index_file = os.path.join(os.path.dirname(__file__), "public", "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return JSONResponse(content={
        "creator": "vexalyndev",
        "project": "Vexalyn REST API",
        "version": "1.0.0",
        "status": "online",
        "message": "Web UI not found. API is running.",
        "endpoints": {
            "anichin": "/anichin/*"
        }
    })

@app.get("/login")
async def serve_login():
    """Serve login page with Google Client ID injected"""
    login_file = os.path.join(os.path.dirname(__file__), "public", "login.html")
    if os.path.exists(login_file):
        with open(login_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Inject Google Client ID from .env
        google_client_id = os.getenv('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com')
        html_content = html_content.replace('YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', google_client_id)
        
        # Set demo mode to false if real Client ID exists
        if google_client_id != 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com':
            html_content = html_content.replace('const demoMode = true;', 'const demoMode = false;')
        
        return HTMLResponse(content=html_content)
    raise HTTPException(status_code=404, detail="Login page not found")

@app.get("/register")
async def serve_register():
    """Serve register page with Google Client ID injected"""
    register_file = os.path.join(os.path.dirname(__file__), "public", "register.html")
    if os.path.exists(register_file):
        with open(register_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Inject Google Client ID from .env
        google_client_id = os.getenv('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com')
        html_content = html_content.replace('YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', google_client_id)
        
        # Set demo mode to false if real Client ID exists
        if google_client_id != 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com':
            html_content = html_content.replace('const demoMode = true;', 'const demoMode = false;')
        
        return HTMLResponse(content=html_content)
    raise HTTPException(status_code=404, detail="Register page not found")

# ===== DEVELOPER INFO =====

@app.get("/vexalyn")
async def vexalyn_info():
    """Developer & Project info"""
    return {
        "developer": "Vexalyn Developer",
        "github": "https://github.com/vexalyn-dev",
        "email": "vioatmajaya@gmail.com",
        "website": "https://vexalyndev.my.id",
        "project": {
            "name": "Vexalyn REST API",
            "version": "1.0.0",
            "description": "Multi-source data scraping REST API",
            "sources": ["anichin"]
        }
    }

# ===== ANICHIN ENDPOINTS =====

@app.get("/anichin/home")
async def anichin_home():
    """Get latest donghua from Anichin homepage"""
    try:
        from Anichin.Home import scrape_home_data
        result = await scrape_home_data()
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load home data: {str(e)}")

@app.get("/anichin/search")
async def anichin_search(q: str = Query(..., description="Search keyword", min_length=1)):
    """Search donghua by keyword on Anichin"""
    try:
        from Anichin.Search import scrape_search
        result = await scrape_search(q)
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/anichin/genres")
async def anichin_genres():
    """Get all available genres from Anichin"""
    try:
        from Anichin.Genres import scrape_genres
        result = await scrape_genres()
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load genres: {str(e)}")

@app.get("/anichin/ongoing-series")
async def anichin_ongoing_series():
    """Get ongoing series list from Anichin"""
    try:
        from Anichin.Ongoing_Series import scrape_ongoing_series
        result = await scrape_ongoing_series()
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load ongoing series: {str(e)}")

# ===== SERVER START =====

if __name__ == "__main__":
    import uvicorn
    
    # Get host and port from environment or use defaults
    host = os.getenv('API_HOST', '0.0.0.0')
    port = int(os.getenv('API_PORT', 8000))
    
    print(f"\n🚀 Starting Vexalyn API Server...")
    print(f"📍 Server: http://localhost:{port}")
    print(f"📚 Docs: http://localhost:{port}/docs")
    print(f"🔐 Login: http://localhost:{port}/login")
    print(f"📝 Register: http://localhost:{port}/register\n")
    
    # Check if Google OAuth is configured
    google_client_id = os.getenv('GOOGLE_CLIENT_ID', '')
    if google_client_id and google_client_id != 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com':
        print(f"✅ Google OAuth: Configured")
    else:
        print(f"⚠️  Google OAuth: Demo Mode (set GOOGLE_CLIENT_ID in .env for real OAuth)")
    print()
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
