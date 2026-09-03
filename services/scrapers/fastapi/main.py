"""
VEXALYN Scraper Services — FastAPI entry point.

This is the single application initialization file.
All routers, providers, and middleware are imported here.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.errors import VexalynException, exception_handler
from core.logging import setup_logging
from anichin.router import router as anichin_router
from animexin.router import router as animexin_router

setup_logging()

app = FastAPI(
    title="VEXALYN Scraper Services",
    description="FastAPI services wrapping Anichin and Animexin scraper providers.",
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

app.exception_handler(VexalynException)(exception_handler)


@app.get("/health", tags=["system"])
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/", tags=["system"])
async def root():
    """Root endpoint — lists available API namespaces."""
    return {
        "service": "VEXALYN Scraper Services",
        "version": "0.1.0",
        "endpoints": {
            "anichin": "/v1/anichin",
            "animexin": "/v1/animexin",
        },
    }


app.include_router(anichin_router, prefix="/v1/anichin", tags=["Anichin"])
app.include_router(animexin_router, prefix="/v1/animexin", tags=["Animexin"])
