"""
Vexalyn REST API - Multi-Source Scraper
FastAPI server untuk expose scraper functions dari berbagai sumber
"""

import sys
import asyncio
import os
import time
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, Tuple

# Fix asyncio event loop untuk Windows (support subprocess Playwright)
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pydantic import BaseModel
import secrets
import hashlib

# Load environment variables
load_dotenv()

# ===== ADMIN AUTHENTICATION =====
ADMIN_EMAIL = "admin.maintenance"
ADMIN_PASSWORD = "admin123"
admin_sessions = {}  # Store active admin sessions {token: timestamp}

class LoginRequest(BaseModel):
    email: str
    password: str

def generate_admin_token():
    """Generate secure random token for admin session"""
    return secrets.token_urlsafe(32)

def verify_admin_token(token: str) -> bool:
    """Verify if admin token is valid"""
    return token in admin_sessions

# Check maintenance mode
MAINTENANCE_MODE = os.getenv('MAINTENANCE_MODE', 'false').lower() == 'true'

if MAINTENANCE_MODE:
    print("⚠️  MAINTENANCE MODE ENABLED")
    print("🔧 Only maintenance page will be served")
else:
    print("✅ MAINTENANCE MODE DISABLED")
    print("🚀 Normal operation mode")

# ===== IN-MEMORY CACHE =====
class SimpleCache:
    """
    Cache sederhana di memory.
    TTL default 5 menit - data masih fresh, tapi request berikutnya instan.
    """
    def __init__(self):
        self._store: Dict[str, dict] = {}

    def get(self, key: str):
        if key not in self._store:
            return None
        entry = self._store[key]
        if time.time() > entry['expires']:
            del self._store[key]
            return None
        return entry['data']

    def set(self, key: str, data, ttl_seconds: int = 300):
        self._store[key] = {
            'data': data,
            'expires': time.time() + ttl_seconds
        }

    def delete(self, key: str):
        self._store.pop(key, None)

    def clear(self):
        self._store.clear()

    def stats(self):
        now = time.time()
        active = {k: v for k, v in self._store.items() if v['expires'] > now}
        return {"total_keys": len(active), "keys": list(active.keys())}

cache = SimpleCache()

# ===== RATE LIMITING SYSTEM =====
class RateLimiter:
    """
    Real Rate Limiting System
    50 requests per IP per hour
    """
    def __init__(self, max_requests: int = 50, window_seconds: int = 3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, list] = defaultdict(list)
    
    def is_allowed(self, client_ip: str) -> Tuple[bool, int]:
        """
        Check if request is allowed
        Returns: (allowed, remaining_requests)
        """
        now = datetime.now()
        window_start = now - timedelta(seconds=self.window_seconds)
        
        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if req_time > window_start
        ]
        
        # Check if limit exceeded
        current_count = len(self.requests[client_ip])
        
        if current_count >= self.max_requests:
            return False, 0
        
        # Add current request
        self.requests[client_ip].append(now)
        
        remaining = self.max_requests - (current_count + 1)
        return True, remaining
    
    def get_reset_time(self, client_ip: str) -> int:
        """Get seconds until rate limit reset"""
        if not self.requests[client_ip]:
            return 0
        
        oldest_request = min(self.requests[client_ip])
        reset_time = oldest_request + timedelta(seconds=self.window_seconds)
        seconds_until_reset = int((reset_time - datetime.now()).total_seconds())
        
        return max(0, seconds_until_reset)

# Initialize rate limiter
rate_limiter = RateLimiter(max_requests=50, window_seconds=3600)

# Initialize FastAPI app
app = FastAPI(
    title="Vexalyn REST API",
    description="Multi-Source REST API by Vexalyn Developer",
    version="1.0.0",
    docs_url=None,  # Disable default docs
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "Anichin",
            "description": "Anichin donghua streaming scraper endpoints"
        },
        {
            "name": "System",
            "description": "System information and rate limit status"
        }
    ]
)

# Custom OpenAPI schema - keep schemas but hide in UI
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    from fastapi.openapi.utils import get_openapi
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        tags=app.openapi_tags
    )
    
    # Add servers for production and local
    openapi_schema["servers"] = [
        {
            "url": "https://api.vexalynapi.my.id",
            "description": "Production Server"
        },
        {
            "url": "http://localhost:8000",
            "description": "Local Development Server"
        }
    ]
    
    # Don't delete schemas, just keep them for validation
    # We'll hide the Schemas section using CSS in the UI
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Custom Swagger UI with hidden /openapi.json link
from fastapi.responses import HTMLResponse

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return HTMLResponse(content=f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{app.title}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
        <style>
            /* Hide topbar with /openapi.json link */
            .topbar {{ display: none !important; }}
            
            /* Hide Schemas section at bottom */
            .swagger-ui section.models {{ display: none !important; }}
            #model-section {{ display: none !important; }}
            
            /* Hide ALL version badges */
            .swagger-ui .info .title small {{ display: none !important; }}
            .swagger-ui .info .title .version-stamp {{ display: none !important; }}
            .swagger-ui .info hgroup.main small {{ display: none !important; }}
            .swagger-ui .info hgroup.main a {{ display: none !important; }}
            
            /* Hide version badge pre (OAS 3.1) */
            .swagger-ui .info .title small.version-stamp pre {{ display: none !important; }}
            
            /* Hide all small elements in title */
            .swagger-ui .info hgroup.main small pre {{ display: none !important; }}
            
            /* Custom title styling - clean without badges */
            .swagger-ui .info .title {{
                font-size: 2.5rem !important;
                font-weight: 700 !important;
                margin-bottom: 0.5rem !important;
            }}
            
            /* Make sure title stands alone */
            .swagger-ui .info hgroup.main {{
                margin: 0 0 20px 0 !important;
            }}
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
        <script>
            window.onload = function() {{
                window.ui = SwaggerUIBundle({{
                    url: '/openapi.json',
                    dom_id: '#swagger-ui',
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    layout: "BaseLayout",
                    deepLinking: true,
                    showExtensions: true,
                    showCommonExtensions: true,
                    displayRequestDuration: true,
                    filter: true,
                    defaultModelsExpandDepth: -1,  // Hide models/schemas
                    syntaxHighlight: {{
                        theme: "monokai"
                    }}
                }});
                
                // Additional JavaScript to remove badges and schemas after render
                setTimeout(function() {{
                    // Remove all small tags in title
                    const titleSmalls = document.querySelectorAll('.swagger-ui .info .title small');
                    titleSmalls.forEach(el => el.remove());
                    
                    // Remove version stamps
                    const versionStamps = document.querySelectorAll('.version-stamp');
                    versionStamps.forEach(el => el.remove());
                    
                    // Remove Schemas section
                    const modelsSection = document.querySelector('.swagger-ui section.models');
                    if (modelsSection) modelsSection.remove();
                    
                    const modelSection = document.getElementById('model-section');
                    if (modelSection) modelSection.remove();
                }}, 500);
            }};
        </script>
    </body>
    </html>
    """, media_type="text/html")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Maintenance Mode Middleware (MUST BE BEFORE OTHER MIDDLEWARES)
@app.middleware("http")
async def maintenance_mode_middleware(request: Request, call_next):
    """Intercept all requests when maintenance mode is enabled"""
    if MAINTENANCE_MODE:
        # Allow access to maintenance page, assets, admin routes, and login
        if (request.url.path.startswith("/assets") or 
            request.url.path == "/maintenance" or 
            request.url.path.startswith("/admin/")):
            return await call_next(request)
        
        # Redirect everything else to maintenance page
        maintenance_file = os.path.join(os.path.dirname(__file__), "public", "maintenance.html")
        if os.path.exists(maintenance_file):
            return FileResponse(maintenance_file, media_type="text/html")
        else:
            return JSONResponse(
                status_code=503,
                content={
                    "error": "Service Unavailable",
                    "message": "Vexalyn API is currently under maintenance. Please try again later.",
                    "maintenance_mode": True
                }
            )
    
    # Normal operation - continue to next middleware
    return await call_next(request)

# Rate Limiting Middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Apply rate limiting to all API endpoints"""
    
    # Skip rate limiting for static files, web UI routes, and admin routes
    skip_paths = ["/", "/login", "/register", "/report", "/assets", "/docs", "/redoc", "/openapi.json", "/vexalyn", "/rate-limit-status", "/cache/", "/maintenance", "/admin/"]
    
    if any(request.url.path.startswith(path) for path in skip_paths):
        return await call_next(request)
    
    # Get client IP
    client_ip = request.client.host
    
    # Check rate limit
    allowed, remaining = rate_limiter.is_allowed(client_ip)
    
    if not allowed:
        reset_time = rate_limiter.get_reset_time(client_ip)
        return JSONResponse(
            status_code=429,
            content={
                "error": "Rate limit exceeded",
                "message": f"Too many requests. Rate limit: 50 requests per hour.",
                "retry_after_seconds": reset_time,
                "client_ip": client_ip
            },
            headers={
                "X-RateLimit-Limit": "50",
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time),
                "Retry-After": str(reset_time)
            }
        )
    
    # Process request
    response = await call_next(request)
    
    # Add rate limit headers to response
    response.headers["X-RateLimit-Limit"] = "50"
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(rate_limiter.get_reset_time(client_ip))
    
    return response

# Mount static files (public folder untuk UI)
public_path = os.path.join(os.path.dirname(__file__), "public")
assets_path = os.path.join(public_path, "assets")

# Mount public/assets folder to /assets route
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

# ===== WEB UI ROUTES =====

@app.get("/", include_in_schema=False)
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

@app.get("/login", include_in_schema=False)
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

@app.get("/report", include_in_schema=False)
async def serve_report():
    """Serve report page"""
    report_file = os.path.join(os.path.dirname(__file__), "public", "report.html")
    if os.path.exists(report_file):
        return FileResponse(report_file)
    raise HTTPException(status_code=404, detail="Report page not found")

@app.get("/api-docs", include_in_schema=False)
async def serve_api_docs():
    """Serve API documentation page"""
    api_docs_file = os.path.join(os.path.dirname(__file__), "public", "api-docs.html")
    if os.path.exists(api_docs_file):
        return FileResponse(api_docs_file)
    raise HTTPException(status_code=404, detail="API docs page not found")

@app.get("/privacy", include_in_schema=False)
async def serve_privacy_policy():
    """Serve Privacy Policy page"""
    privacy_file = os.path.join(os.path.dirname(__file__), "public", "privacy.html")
    if os.path.exists(privacy_file):
        return FileResponse(privacy_file)
    raise HTTPException(status_code=404, detail="Privacy policy page not found")

@app.get("/robots.txt", include_in_schema=False)
async def serve_robots():
    """Serve robots.txt for SEO"""
    robots_file = os.path.join(os.path.dirname(__file__), "public", "robots.txt")
    if os.path.exists(robots_file):
        return FileResponse(robots_file, media_type="text/plain")
    raise HTTPException(status_code=404, detail="robots.txt not found")

@app.get("/sitemap.xml", include_in_schema=False)
async def serve_sitemap():
    """Serve sitemap.xml for SEO"""
    sitemap_file = os.path.join(os.path.dirname(__file__), "public", "sitemap.xml")
    if os.path.exists(sitemap_file):
        return FileResponse(sitemap_file, media_type="application/xml")
    raise HTTPException(status_code=404, detail="sitemap.xml not found")

@app.get("/favicon.ico", include_in_schema=False)
async def serve_favicon():
    """Serve favicon.ico"""
    favicon_file = os.path.join(os.path.dirname(__file__), "public", "assets", "favicon.svg")
    if os.path.exists(favicon_file):
        return FileResponse(favicon_file, media_type="image/svg+xml")
    raise HTTPException(status_code=404, detail="Favicon not found")

@app.get("/robots.txt", include_in_schema=False)
async def serve_robots():
    """Serve robots.txt for SEO"""
    robots_file = os.path.join(os.path.dirname(__file__), "public", "robots.txt")
    if os.path.exists(robots_file):
        return FileResponse(robots_file, media_type="text/plain")
    raise HTTPException(status_code=404, detail="robots.txt not found")

@app.get("/sitemap.xml", include_in_schema=False)
async def serve_sitemap():
    """Serve sitemap.xml for SEO"""
    sitemap_file = os.path.join(os.path.dirname(__file__), "public", "sitemap.xml")
    if os.path.exists(sitemap_file):
        return FileResponse(sitemap_file, media_type="application/xml")
    raise HTTPException(status_code=404, detail="sitemap.xml not found")

@app.get("/register", include_in_schema=False)
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

@app.get("/maintenance", include_in_schema=False)
async def serve_maintenance():
    """Serve maintenance page (public preview)"""
    maintenance_file = os.path.join(os.path.dirname(__file__), "public", "maintenance.html")
    if os.path.exists(maintenance_file):
        return FileResponse(maintenance_file)
    raise HTTPException(status_code=404, detail="Maintenance page not found")

@app.get("/admin/login", include_in_schema=False)
async def serve_admin_login():
    """Serve admin login page"""
    login_file = os.path.join(os.path.dirname(__file__), "public", "admin-login.html")
    if os.path.exists(login_file):
        return FileResponse(login_file)
    raise HTTPException(status_code=404, detail="Admin login page not found")

@app.post("/admin/login", include_in_schema=False)
async def admin_login(login_data: LoginRequest):
    """Authenticate admin user"""
    if login_data.email == ADMIN_EMAIL and login_data.password == ADMIN_PASSWORD:
        # Generate token
        token = generate_admin_token()
        admin_sessions[token] = time.time()
        
        return {
            "ok": True,
            "token": token,
            "message": "Login successful"
        }
    else:
        return JSONResponse(
            status_code=401,
            content={
                "ok": False,
                "message": "Email atau password salah!"
            }
        )

@app.get("/admin/maintenance", include_in_schema=False)
async def serve_admin_maintenance():
    """Serve admin maintenance control panel"""
    admin_file = os.path.join(os.path.dirname(__file__), "public", "admin-maintenance.html")
    if os.path.exists(admin_file):
        return FileResponse(admin_file)
    raise HTTPException(status_code=404, detail="Admin panel not found")

# ===== ADMIN MAINTENANCE ENDPOINTS =====

@app.get("/admin/maintenance/status", tags=["System"])
async def get_maintenance_status(request: Request):
    """Get current maintenance mode status (requires admin auth)"""
    # Check authorization
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = auth_header.replace("Bearer ", "")
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    global MAINTENANCE_MODE
    return {
        "maintenance_mode": MAINTENANCE_MODE,
        "status": "maintenance" if MAINTENANCE_MODE else "active"
    }

@app.post("/admin/maintenance/toggle", tags=["System"])
async def toggle_maintenance_mode(request: Request):
    """Toggle maintenance mode ON/OFF (requires admin auth)"""
    # Check authorization
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = auth_header.replace("Bearer ", "")
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    global MAINTENANCE_MODE
    
    # Toggle the mode
    MAINTENANCE_MODE = not MAINTENANCE_MODE
    
    # Update .env file
    env_file = os.path.join(os.path.dirname(__file__), ".env")
    
    try:
        if os.path.exists(env_file):
            # Read current .env content
            with open(env_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Update or add MAINTENANCE_MODE line
            updated = False
            new_lines = []
            for line in lines:
                if line.startswith('MAINTENANCE_MODE='):
                    new_lines.append(f'MAINTENANCE_MODE={"true" if MAINTENANCE_MODE else "false"}\n')
                    updated = True
                else:
                    new_lines.append(line)
            
            # If MAINTENANCE_MODE wasn't in file, add it
            if not updated:
                new_lines.append(f'MAINTENANCE_MODE={"true" if MAINTENANCE_MODE else "false"}\n')
            
            # Write back to .env
            with open(env_file, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
        else:
            # Create new .env file
            with open(env_file, 'w', encoding='utf-8') as f:
                f.write(f'MAINTENANCE_MODE={"true" if MAINTENANCE_MODE else "false"}\n')
        
        return {
            "ok": True,
            "maintenance_mode": MAINTENANCE_MODE,
            "status": "maintenance" if MAINTENANCE_MODE else "active",
            "message": f"Maintenance mode {'enabled' if MAINTENANCE_MODE else 'disabled'} successfully"
        }
    except Exception as e:
        return {
            "ok": False,
            "maintenance_mode": MAINTENANCE_MODE,
            "error": str(e),
            "message": "Mode toggled in memory but failed to update .env file"
        }

# ===== DEVELOPER INFO =====

@app.get("/vexalyn", tags=["System"])
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
        },
        "rate_limit": {
            "max_requests": 50,
            "window": "1 hour",
            "note": "Rate limit applies to all /anichin/* endpoints"
        }
    }

@app.get("/cache/stats", tags=["System"])
async def cache_stats():
    """Lihat status cache saat ini"""
    return {"cache": cache.stats()}

@app.delete("/cache/clear", tags=["System"])
async def cache_clear():
    """Clear semua cache (admin)"""
    cache.clear()
    return {"message": "Cache cleared"}

@app.get("/rate-limit-status", tags=["System"])
async def rate_limit_status(request: Request):
    """Check current rate limit status for your IP (does not count toward limit)"""
    client_ip = request.client.host
    
    # Get current count WITHOUT adding a request
    now = datetime.now()
    window_start = now - timedelta(seconds=3600)
    
    # Clean and count (read-only, no modification)
    valid_requests = [
        req_time for req_time in rate_limiter.requests.get(client_ip, [])
        if req_time > window_start
    ]
    
    current_count = len(valid_requests)
    reset_time = rate_limiter.get_reset_time(client_ip) if valid_requests else 0
    
    return {
        "client_ip": client_ip,
        "rate_limit": {
            "max_requests": 50,
            "window_seconds": 3600,
            "window_text": "1 hour"
        },
        "current_usage": {
            "requests_made": current_count,
            "requests_remaining": 50 - current_count,
            "reset_in_seconds": reset_time
        },
        "status": "ok" if current_count < 50 else "limit_reached"
    }

# ===== ANICHIN ENDPOINTS =====

@app.get("/anichin/home", tags=["Anichin"])
async def anichin_home():
    """Get latest donghua from Anichin homepage"""
    cache_key = "anichin:home"
    cached = cache.get(cache_key)
    if cached:
        cached["_cached"] = True
        return JSONResponse(content=cached)
    try:
        from Anichin.Home import scrape_home_data
        result = await scrape_home_data()
        if result.get("ok"):
            cache.set(cache_key, result, ttl_seconds=300)  # 5 menit
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load home data: {str(e)}")

@app.get("/anichin/search", tags=["Anichin"])
async def anichin_search(q: str = Query(..., description="Search keyword", min_length=1)):
    """Search donghua by keyword on Anichin"""
    cache_key = f"anichin:search:{q.lower().strip()}"
    cached = cache.get(cache_key)
    if cached:
        cached["_cached"] = True
        return JSONResponse(content=cached)
    try:
        from Anichin.Search import scrape_search
        result = await scrape_search(q)
        if result.get("ok"):
            cache.set(cache_key, result, ttl_seconds=180)  # 3 menit
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/anichin/genres", tags=["Anichin"])
async def anichin_genres():
    """Get all available genres from Anichin"""
    cache_key = "anichin:genres"
    cached = cache.get(cache_key)
    if cached:
        cached["_cached"] = True
        return JSONResponse(content=cached)
    try:
        from Anichin.Genres import scrape_genres
        result = await scrape_genres()
        if result.get("ok"):
            cache.set(cache_key, result, ttl_seconds=3600)  # 1 jam (genres jarang berubah)
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load genres: {str(e)}")

@app.get("/anichin/ongoing-series", tags=["Anichin"])
async def anichin_ongoing_series():
    """Get ongoing series list from Anichin"""
    cache_key = "anichin:ongoing-series"
    cached = cache.get(cache_key)
    if cached:
        cached["_cached"] = True
        return JSONResponse(content=cached)
    try:
        from Anichin.Ongoing_Series import scrape_ongoing_series
        result = await scrape_ongoing_series()
        if result.get("ok"):
            cache.set(cache_key, result, ttl_seconds=300)
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load ongoing series: {str(e)}")

@app.get("/anichin/popular-series", tags=["Anichin"])
async def anichin_popular_series(
    filter: str = Query(
        default="weekly",
        description="Time range filter: weekly, monthly, or all",
        regex="^(weekly|monthly|all|alltime)$"
    )
):
    """
    Get popular series ranking from Anichin.
    
    - **filter=weekly** : Top series this week (default)
    - **filter=monthly** : Top series this month
    - **filter=all** : Top series of all time
    """
    cache_key = f"anichin:popular-series:{filter}"
    cached = cache.get(cache_key)
    if cached:
        cached["_cached"] = True
        return JSONResponse(content=cached)
    try:
        from Anichin.Popular_Series import scrape_popular_series
        result = await scrape_popular_series(filter)
        if result.get("ok"):
            cache.set(cache_key, result, ttl_seconds=600)  # 10 menit
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load popular series: {str(e)}")

@app.get("/anichin/new-movie", tags=["Anichin"])
async def anichin_new_movie():
    """
    Get latest donghua movies from Anichin NEW MOVIE section.
    
    Returns list of new movies with title, url, thumbnail, genres, release_date.
    """
    cache_key = "anichin:new-movie"
    cached = cache.get(cache_key)
    if cached:
        cached["_cached"] = True
        return JSONResponse(content=cached)
    try:
        from Anichin.New_Movie import scrape_new_movie
        result = await scrape_new_movie()
        if result.get("ok"):
            cache.set(cache_key, result, ttl_seconds=600)
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load new movies: {str(e)}")

# ===== CUSTOM ERROR HANDLERS =====

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    """Custom 404 page"""
    # Check if request wants JSON (API call) or HTML (browser)
    accept = request.headers.get('accept', '')
    
    if 'application/json' in accept or '/anichin/' in request.url.path:
        # Return JSON for API requests
        return JSONResponse(
            status_code=404,
            content={
                "error": "Not Found",
                "message": f"The endpoint {request.url.path} does not exist.",
                "available_endpoints": {
                    "anichin": ["/anichin/home", "/anichin/search", "/anichin/genres", "/anichin/ongoing-series", "/anichin/popular-series", "/anichin/new-movie"],
                    "system": ["/vexalyn", "/rate-limit-status", "/cache/stats"],
                    "docs": ["/docs", "/redoc"]
                }
            }
        )
    else:
        # Return HTML 404 page for browser requests
        error_404_file = os.path.join(os.path.dirname(__file__), "public", "404.html")
        if os.path.exists(error_404_file):
            return FileResponse(error_404_file, status_code=404)
        else:
            return HTMLResponse(
                content="<h1>404 - Page Not Found</h1><p><a href='/'>Go to Homepage</a></p>",
                status_code=404
            )

@app.exception_handler(500)
async def custom_500_handler(request: Request, exc):
    """Custom 500 error handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "Something went wrong. Please try again later or report this issue.",
            "report_url": "/report"
        }
    )

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
    print(f"📝 Register: http://localhost:{port}/register")
    print(f"🛠️  Admin Login: http://localhost:{port}/admin/login (admin.maintenance / admin123)")
    print(f"⏱️  Rate Limit Status: http://localhost:{port}/rate-limit-status\n")
    
    # Check if Google OAuth is configured
    google_client_id = os.getenv('GOOGLE_CLIENT_ID', '')
    if google_client_id and google_client_id != 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com':
        print(f"✅ Google OAuth: Configured")
    else:
        print(f"⚠️  Google OAuth: Demo Mode (set GOOGLE_CLIENT_ID in .env for real OAuth)")
    
    # Rate limit info
    print(f"🛡️  Rate Limiting: 50 requests/hour per IP (REAL)")
    print()
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
