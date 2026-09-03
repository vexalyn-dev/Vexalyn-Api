"""Anichin provider — wraps existing scraper modules with normalization."""

import sys
import os
import asyncio
from typing import Any
import importlib

_anichin_path = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "Donghua", "Anichin"))
if _anichin_path not in sys.path:
    sys.path.insert(0, _anichin_path)

from core.schemas import ApiResponse
from core.exceptions import ProviderError, ApiUnavailable, ValidationError
from .normalize import (
    normalize_home, normalize_search, normalize_detail,
    normalize_latest, normalize_popular, normalize_stream,
    normalize_genres, normalize_az_list,
)


class AnichinProvider:
    name = "Anichin"
    slug = "anichin"
    base_url = "https://anichin.moe"
    category = "donghua"

    async def home(self) -> ApiResponse:
        try:
            from home import scrape_homepage
            result = await scrape_homepage()
            return await normalize_home(result)
        except Exception as e:
            if "cloudflare" in str(e).lower() or "403" in str(getattr(e, 'code', '')):
                raise ApiUnavailable("Anichin is blocked by Cloudflare. Try again later.")
            raise ProviderError(f"Home scrape failed: {e}")

    async def search(self, query: str) -> ApiResponse:
        if not query or not query.strip():
            raise ValidationError("Query parameter is required and cannot be empty.")
        try:
            from search import scrape_search
            result = await scrape_search(query.strip())
            return await normalize_search(result, query.strip())
        except Exception as e:
            raise ProviderError(f"Search failed: {e}")

    async def detail(self, slug: str) -> ApiResponse:
        if not slug or not slug.strip():
            raise ValidationError("Slug parameter is required.")
        try:
            from detail import scrape_detail
            result = await scrape_detail(slug.strip())
            return await normalize_detail(result)
        except Exception as e:
            raise ProviderError(f"Detail failed: {e}")

    async def latest(self, page: int = 1) -> ApiResponse:
        if page < 1:
            raise ValidationError("Page must be >= 1.")
        try:
            from latest import scrape_latest_series
            result = await scrape_latest_series(page)
            return await normalize_latest(result)
        except Exception as e:
            raise ProviderError(f"Latest failed: {e}")

    async def popular(self) -> ApiResponse:
        try:
            from popular import scrape_popular_donghua
            result = await scrape_popular_donghua("all")
            return await normalize_popular(result)
        except Exception as e:
            raise ProviderError(f"Popular failed: {e}")

    async def stream(self, slug: str) -> ApiResponse:
        if not slug or not slug.strip():
            raise ValidationError("Slug parameter is required for stream.")
        try:
            from stream import main as stream_main
            # stream.py uses input() — we need to call the resolver directly
            from stream import resolve_episode_url_stable
            url = await resolve_episode_url_stable(slug.strip())
            if not url:
                return ApiResponse(success=False, error={"code": "NOT_FOUND", "message": f"Episode '{slug}' not found"}, meta={"provider": "anichin"})
            return ApiResponse(
                success=True,
                data={"title": slug, "url": url, "servers": [], "iframe_url": None},
                meta={"provider": "anichin", "slug": slug},
            )
        except Exception as e:
            raise ProviderError(f"Stream failed: {e}")

    async def genres(self) -> ApiResponse:
        try:
            from genre import scrape_all_genres
            result = await scrape_all_genres()
            return await normalize_genres(result)
        except Exception as e:
            raise ProviderError(f"Genres failed: {e}")

    async def az_list(self, show: str = "", page: int = 1) -> ApiResponse:
        if page < 1:
            raise ValidationError("Page must be >= 1.")
        try:
            from az_list import scrape_az_list
            result = await scrape_az_list(show.strip(), page)
            return await normalize_az_list(result)
        except Exception as e:
            raise ProviderError(f"AZ list failed: {e}")

    async def filter(self, params: dict) -> ApiResponse:
        """Unified filter endpoint combining multiple filter parameters."""
        try:
            from filter import scrape_unified_filter
            result = await scrape_unified_filter(params)
            items = []
            for item in result.get("data", []):
                items.append({
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "thumbnail": item.get("thumbnail", ""),
                    "episode": item.get("episode", ""),
                    "type": item.get("type", "Donghua"),
                    "status": item.get("status", ""),
                    "label": item.get("label", "Sub"),
                })
            return ApiResponse(
                success=result.get("status") == "success",
                data=items,
                meta={"provider": "anichin", "filters": params},
            )
        except Exception as e:
            raise ProviderError(f"Filter failed: {e}")

    async def schedule(self) -> ApiResponse:
        try:
            from schedule import main as schedule_main
            # schedule.py has complex main with input() — skip for now
            return ApiResponse(
                success=False,
                error={"code": "NOT_IMPLEMENTED", "message": "Schedule endpoint not yet available"},
                meta={"provider": "anichin"},
            )
        except Exception as e:
            raise ProviderError(f"Schedule failed: {e}")

    async def studio(self) -> ApiResponse:
        try:
            from studio import scrape_all_studios
            result = await scrape_all_studios()
            data = result.get("data", [])
            return ApiResponse(success=True, data=data, meta={"provider": "anichin"})
        except Exception as e:
            raise ProviderError(f"Studio failed: {e}")

    async def status(self) -> ApiResponse:
        try:
            from status import scrape_all_status
            result = await scrape_all_status()
            data = result.get("data", [])
            return ApiResponse(success=True, data=data, meta={"provider": "anichin"})
        except Exception as e:
            raise ProviderError(f"Status failed: {e}")

    async def season(self) -> ApiResponse:
        try:
            from season import scrape_all_seasons
            result = await scrape_all_seasons()
            data = result.get("data", [])
            return ApiResponse(success=True, data=data, meta={"provider": "anichin"})
        except Exception as e:
            raise ProviderError(f"Season failed: {e}")

    async def type_list(self) -> ApiResponse:
        try:
            from type import scrape_type_list
            result = await scrape_type_list()
            data = result.get("data", [])
            return ApiResponse(success=True, data=data, meta={"provider": "anichin"})
        except Exception as e:
            raise ProviderError(f"Type list failed: {e}")

    async def sub(self) -> ApiResponse:
        try:
            from sub import scrape_all_subs
            result = await scrape_all_subs()
            data = result.get("data", [])
            return ApiResponse(success=True, data=data, meta={"provider": "anichin"})
        except Exception as e:
            raise ProviderError(f"Sub/Dub failed: {e}")

    async def orderby(self) -> ApiResponse:
        try:
            from orderby import scrape_all_orderby
            result = await scrape_all_orderby()
            data = result.get("data", [])
            return ApiResponse(success=True, data=data, meta={"provider": "anichin"})
        except Exception as e:
            raise ProviderError(f"Orderby failed: {e}")
