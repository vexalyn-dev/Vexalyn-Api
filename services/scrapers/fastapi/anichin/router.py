"""Anichin FastAPI router."""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from core.registry import get_provider
from core.errors import VexalynException
from core.schemas import ApiResponse

router = APIRouter()


class SearchRequest(BaseModel):
    query: str


class DetailRequest(BaseModel):
    slug: str


class LatestRequest(BaseModel):
    page: int = Query(default=1, ge=1, le=100)


class StreamRequest(BaseModel):
    slug: str


@router.get("/", tags=["overview"])
async def anichin_index():
    return {
        "provider": "anichin",
        "base_url": "https://anichin.moe",
        "category": "donghua",
        "endpoints": [
            "GET /home",
            "GET /search?query=",
            "GET /detail/{slug}",
            "GET /latest?page=1",
            "GET /popular",
            "GET /stream?slug=",
            "GET /genres",
            "GET /az-list?show=&page=1",
        ],
    }


@router.get("/home", response_model=ApiResponse, tags=["home"])
async def get_home():
    provider = get_provider("anichin")()
    try:
        result = await provider.scrape_home()
        return ApiResponse(
            statusCode=result.get("statusCode", 200),
            status=result.get("status", "success"),
            message=result.get("message", ""),
            data=result.get("data"),
            meta={"provider": "anichin", "category": "donghua"},
        )
    except Exception as e:
        raise VexalynException(f"Failed to scrape home: {e}", code=502)


@router.get("/search", response_model=ApiResponse, tags=["search"])
async def search(query: str = Query(..., min_length=1, max_length=200)):
    provider = get_provider("anichin")()
    try:
        result = await provider.scrape_search(query)
        return ApiResponse(
            statusCode=result.get("statusCode", 200),
            status=result.get("status", "success"),
            message=result.get("message", ""),
            data=result.get("data"),
            meta={"provider": "anichin", "query": query},
        )
    except Exception as e:
        raise VexalynException(f"Search failed: {e}", code=502)


@router.get("/detail/{slug}", response_model=ApiResponse, tags=["detail"])
async def detail(slug: str):
    provider = get_provider("anichin")()
    try:
        result = await provider.scrape_detail(slug)
        return ApiResponse(
            statusCode=result.get("statusCode", 200),
            status=result.get("status", "success"),
            message=result.get("message", ""),
            data=result.get("data"),
            meta={"provider": "anichin", "slug": slug},
        )
    except Exception as e:
        raise VexalynException(f"Detail failed: {e}", code=502)


@router.get("/latest", response_model=ApiResponse, tags=["latest"])
async def latest(page: int = Query(default=1, ge=1, le=100)):
    provider = get_provider("anichin")()
    try:
        result = await provider.scrape_latest(page)
        return ApiResponse(
            statusCode=result.get("statusCode", 200),
            status=result.get("status", "success"),
            message=result.get("message", ""),
            data=result.get("data"),
            meta={"provider": "anichin", "page": page},
        )
    except Exception as e:
        raise VexalynException(f"Latest failed: {e}", code=502)


@router.get("/popular", response_model=ApiResponse, tags=["popular"])
async def popular():
    provider = get_provider("anichin")()
    try:
        result = await provider.scrape_popular()
        return ApiResponse(
            statusCode=result.get("statusCode", 200),
            status=result.get("status", "success"),
            message=result.get("message", ""),
            data=result.get("data"),
            meta={"provider": "anichin"},
        )
    except Exception as e:
        raise VexalynException(f"Popular failed: {e}", code=502)


@router.get("/stream", response_model=ApiResponse, tags=["stream"])
async def stream(slug: str = Query(..., min_length=1)):
    provider = get_provider("anichin")()
    try:
        result = await provider.scrape_stream(slug)
        return ApiResponse(
            statusCode=result.get("statusCode", 200),
            status=result.get("status", "success"),
            message=result.get("message", ""),
            data=result.get("data"),
            meta={"provider": "anichin", "slug": slug},
        )
    except Exception as e:
        raise VexalynException(f"Stream failed: {e}", code=502)


@router.get("/genres", response_model=ApiResponse, tags=["genres"])
async def genres():
    provider = get_provider("anichin")()
    try:
        result = await provider.scrape_genres()
        return ApiResponse(
            statusCode=result.get("statusCode", 200),
            status=result.get("status", "success"),
            message=result.get("message", ""),
            data=result.get("data"),
            meta={"provider": "anichin"},
        )
    except Exception as e:
        raise VexalynException(f"Genres failed: {e}", code=502)


@router.get("/az-list", response_model=ApiResponse, tags=["alphabetical"])
async def az_list(
    show: str = Query(default="", max_length=100),
    page: int = Query(default=1, ge=1, le=100),
):
    provider = get_provider("anichin")()
    try:
        result = await provider.scrape_az_list(show, page)
        return ApiResponse(
            statusCode=result.get("statusCode", 200),
            status=result.get("status", "success"),
            message=result.get("message", ""),
            data=result.get("data"),
            meta={"provider": "anichin", "show": show, "page": page},
        )
    except Exception as e:
        raise VexalynException(f"AZ list failed: {e}", code=502)
