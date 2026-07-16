"""
Vexalyn Anichin Scraper - REST API
FastAPI server untuk expose scraper functions
"""

import sys
import asyncio

# Fix asyncio event loop untuk Windows (support subprocess Playwright)
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Initialize FastAPI app
app = FastAPI(
    title="Anichin API",
    description="REST API BY VEXALYN DEV",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - allow semua origin untuk testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint - Anichin API Info"""
    return {
        "creator": "vexalyndev",
        "project": "Anichin Scraper API",
        "version": "1.0.0",
        "description": "REST API Anichin Donghua Scraper",
        "endpoints": {
            "homepage": "/api/home - Get latest donghua from homepage",
            "search": "/api/search?q=keyword - Search donghua by keyword",
            "genres": "/api/genres - Get all available genres"
        },
        "documentation": "/docs",
        "status": "online"
    }

@app.get("/vexalyn")
async def vexalyn_dev():
    """Vexalyn endpoint"""
    return {
        "creator": "vexalyndev",
        "project": "Anichin Scraper API",
        "version": "1.0.0",
        "description": "REST API Anichin - Donghua",
        "endpoints": {
            "homepage": "/api/home - Get latest donghua from homepage",
            "search": "/api/search?q=keyword - Search donghua by keyword",
            "genres": "/api/genres - Get all available genres"
        },
        "documentation": "/docs",
        "status": "online"
    }

@app.get("/api/home")
async def api_home():
    """Get homepage donghua list"""
    try:
        from Home import scrape_home_data
        result = await scrape_home_data()
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load home page: {str(e)}")

@app.get("/api/search")
async def api_search(q: str = Query(..., description="Search keyword", min_length=1)):
    """Search donghua by keyword"""
    try:
        from Search import scrape_search
        result = await scrape_search(q)
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Search feature failed: {str(e)}")

@app.get("/api/genres")
async def api_genres():
    """Get all available genres"""
    try:
        from Genres import scrape_genres
        result = await scrape_genres()
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load genres: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,  # Pass app object directly, bukan string
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
