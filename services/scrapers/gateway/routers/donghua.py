"""Donghua API routes — public facing endpoints with provider routing."""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
import time
import logging

from core.schemas import ApiResponse
from core.exceptions import (
    ProviderError, ApiUnavailable, ValidationError,
    AuthenticationError,
)
from core.request_id import generate_request_id
from providers.registry import get_provider, list_providers

logger = logging.getLogger("vexalyn.donghua")

router = APIRouter()


def _wrap(provider_method, **kwargs):
    """Call a provider method and wrap exceptions into API responses."""
    async def _inner():
        start = time.time()
        rid = generate_request_id()
        try:
            result = await provider_method(**kwargs)
            elapsed = int((time.time() - start) * 1000)
            result.meta["request_id"] = rid
            result.meta["elapsed_ms"] = elapsed
            return result
        except ValidationError as e:
            elapsed = int((time.time() - start) * 1000)
            return ApiResponse(
                success=False,
                error={"code": e.code, "message": e.message},
                meta={"request_id": rid, "elapsed_ms": elapsed},
            )
        except ApiUnavailable as e:
            elapsed = int((time.time() - start) * 1000)
            return ApiResponse(
                success=False,
                error={"code": e.code, "message": e.message},
                meta={"request_id": rid, "elapsed_ms": elapsed},
            )
        except ProviderError as e:
            elapsed = int((time.time() - start) * 1000)
            return ApiResponse(
                success=False,
                error={"code": e.code, "message": e.message},
                meta={"request_id": rid, "elapsed_ms": elapsed},
            )
    return _inner


# ---------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------

@router.get("/", tags=["overview"])
async def donghua_index():
    """Donghua API overview with available endpoints and providers."""
    return {
        "service": "VEXALYN Donghua API",
        "version": "0.1.0",
        "providers": list_providers(),
        "endpoints": [
            "GET  /home",
            "GET  /search?query=&provider=",
            "GET  /detail?slug=&provider=",
            "GET  /latest?page=&provider=",
            "GET  /popular?provider=",
            "GET  /stream?slug=&provider=",
            "GET  /genres?provider=",
            "GET  /az-list?show=&page=&provider=",
            "GET  /filter?provider=&params={}",
            "GET  /schedule?provider=",
            "GET  /studio?provider=",
            "GET  /status?provider=",
            "GET  /season?provider=",
            "GET  /type?provider=",
            "GET  /sub?provider=",
            "GET  /orderby?provider=",
        ],
    }


# ---------------------------------------------------------------------------
# Home
# ---------------------------------------------------------------------------

@router.get("/home", tags=["home"])
async def home(provider: str = Query("anichin", regex="^(anichin|animexin)$")):
    """Homepage content from a provider."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.home)()


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------

@router.get("/search", tags=["search"])
async def search(
    query: str = Query(..., min_length=1, max_length=200),
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """Search donghua by keyword."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.search, query=query)()


# ---------------------------------------------------------------------------
# Detail
# ---------------------------------------------------------------------------

@router.get("/detail", tags=["detail"])
async def detail(
    slug: str = Query(..., min_length=1),
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """Get detailed info about a donghua title."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.detail, slug=slug)()


# ---------------------------------------------------------------------------
# Latest
# ---------------------------------------------------------------------------

@router.get("/latest", tags=["latest"])
async def latest(
    page: int = Query(default=1, ge=1, le=100),
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """Latest donghua updates."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.latest, page=page)()


# ---------------------------------------------------------------------------
# Popular
# ---------------------------------------------------------------------------

@router.get("/popular", tags=["popular"])
async def popular(
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """Popular donghua."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.popular)()


# ---------------------------------------------------------------------------
# Stream
# ---------------------------------------------------------------------------

@router.get("/stream", tags=["stream"])
async def stream(
    slug: str = Query(..., min_length=1),
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """Resolve stream URL for an episode."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.stream, slug=slug)()


# ---------------------------------------------------------------------------
# Genres
# ---------------------------------------------------------------------------

@router.get("/genres", tags=["genres"])
async def genres(
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """List all genres."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.genres)()


# ---------------------------------------------------------------------------
# A-Z List
# ---------------------------------------------------------------------------

@router.get("/az-list", tags=["alphabetical"])
async def az_list(
    show: str = Query(default="", max_length=100),
    page: int = Query(default=1, ge=1, le=100),
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """A-Z alphabetical listing."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.az_list, show=show, page=page)()


# ---------------------------------------------------------------------------
# Filter (unified)
# ---------------------------------------------------------------------------

@router.get("/filter", tags=["filter"])
async def filter(
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
    genre: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    type_val: Optional[str] = Query(default=None, alias="type"),
    season: Optional[str] = Query(default=None),
    studio: Optional[str] = Query(default=None),
    sub_dub: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1, le=100),
):
    """Unified filter endpoint — combines multiple filter parameters."""
    cls = get_provider(provider)
    p = cls()
    params = {}
    if genre:
        params["genre"] = genre
    if status:
        params["status"] = status
    if type_val:
        params["type"] = type_val
    if season:
        params["season"] = season
    if studio:
        params["studio"] = studio
    if sub_dub:
        params["sub_dub"] = sub_dub
    params["page"] = page

    return await _wrap(p.filter, params=params)()


# ---------------------------------------------------------------------------
# Schedule
# ---------------------------------------------------------------------------

@router.get("/schedule", tags=["schedule"])
async def schedule(
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """Release schedule."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.schedule)()


# ---------------------------------------------------------------------------
# Studio
# ---------------------------------------------------------------------------

@router.get("/studio", tags=["studio"])
async def studio(
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """List all studios."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.studio)()


# ---------------------------------------------------------------------------
# Status
# ---------------------------------------------------------------------------

@router.get("/status", tags=["status"])
async def status(
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """List all statuses (Ongoing, Completed, etc.)."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.status)()


# ---------------------------------------------------------------------------
# Season
# ---------------------------------------------------------------------------

@router.get("/season", tags=["season"])
async def season(
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """List all seasons."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.season)()


# ---------------------------------------------------------------------------
# Type
# ---------------------------------------------------------------------------

@router.get("/type", tags=["type"])
async def type_list(
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """List all types (TV, Movie, OVA, etc.)."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.type_list)()


# ---------------------------------------------------------------------------
# Sub/Dub
# ---------------------------------------------------------------------------

@router.get("/sub", tags=["sub-dub"])
async def sub(
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """List Sub and Dub content."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.sub)()


# ---------------------------------------------------------------------------
# Orderby
# ---------------------------------------------------------------------------

@router.get("/orderby", tags=["orderby"])
async def orderby(
    provider: str = Query("anichin", regex="^(anichin|animexin)$"),
):
    """List orderby options."""
    cls = get_provider(provider)
    p = cls()
    return await _wrap(p.orderby)()
