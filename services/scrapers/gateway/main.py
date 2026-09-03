"""Gateway entry point — independent from UI."""

import sys
import os

# Add gateway to path
_gateway_dir = os.path.dirname(os.path.abspath(__file__))
if _gateway_dir not in sys.path:
    sys.path.insert(0, _gateway_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.logging import setup_logging
from auth.api_key import AuthMiddleware
from routers.donghua import router as donghua_router

setup_logging()

app = FastAPI(
    title="VEXALYN API Gateway",
    description="Unified API gateway for anime, donghua, and manga data.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuthMiddleware)


@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok"}


@app.get("/", tags=["system"])
async def root():
    return {
        "service": "VEXALYN API Gateway",
        "version": "0.1.0",
        "base_path": "/v1",
        "endpoints": {
            "donghua": "/v1/donghua",
            "anime": "/v1/anime",
            "manga": "/v1/manga",
        },
    }


app.include_router(donghua_router, prefix="/v1/donghua", tags=["Donghua"])
