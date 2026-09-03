"""Animexin provider — wraps existing scraper modules with normalization."""

import sys
import os
from typing import Any

_animexin_path = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "Donghua", "Animexin"))
if _animexin_path not in sys.path:
    sys.path.insert(0, _animexin_path)

from core.schemas import ApiResponse
from core.exceptions import ProviderError, ApiUnavailable, ValidationError
from .normalize import (
    normalize_home, normalize_search, normalize_detail, normalize_az_list,
)


class AnimexinProvider:
    name = "Animexin"
    slug = "animexin"
    base_url = "https://animexin.dev"
    category = "donghua"

    async def home(self) -> ApiResponse:
        try:
            from home import scrape_home
            result = await scrape_home()
            return await normalize_home(result)
        except Exception as e:
            if "cloudflare" in str(e).lower():
                raise ApiUnavailable("Animexin is temporarily unavailable.")
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
            from donghua_list import scrape_donghua_list
            result = await scrape_donghua_list(page)
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
            return ApiResponse(success=True, data=items, meta={"provider": "animexin", "page": page})
        except Exception as e:
            raise ProviderError(f"Latest failed: {e}")

    async def popular(self) -> ApiResponse:
        try:
            from donghua_list import scrape_donghua_list
            result = await scrape_donghua_list(1)
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
            return ApiResponse(success=True, data=items, meta={"provider": "animexin"})
        except Exception as e:
            raise ProviderError(f"Popular failed: {e}")

    async def stream(self, slug: str) -> ApiResponse:
        return ApiResponse(
            success=False,
            error={"code": "NOT_IMPLEMENTED", "message": "Stream endpoint not available for Animexin"},
            meta={"provider": "animexin"},
        )

    async def genres(self) -> ApiResponse:
        try:
            from genre import scrape_genres
            result = await scrape_genres()
            data = []
            for g in result.get("data", []):
                data.append({
                    "name": g.get("name", g.get("title", "")),
                    "slug": g.get("slug", g.get("name", "")).lower().replace(" ", "-"),
                    "count": g.get("count", 0),
                })
            return ApiResponse(success=True, data=data, meta={"provider": "animexin"})
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
        return ApiResponse(
            success=False,
            error={"code": "NOT_IMPLEMENTED", "message": "Filter endpoint not available for Animexin"},
            meta={"provider": "animexin"},
        )

    async def schedule(self) -> ApiResponse:
        return ApiResponse(
            success=False,
            error={"code": "NOT_IMPLEMENTED", "message": "Schedule endpoint not available for Animexin"},
            meta={"provider": "animexin"},
        )

    async def studio(self) -> ApiResponse:
        return ApiResponse(
            success=False,
            error={"code": "NOT_IMPLEMENTED", "message": "Studio endpoint not available for Animexin"},
            meta={"provider": "animexin"},
        )

    async def status(self) -> ApiResponse:
        return ApiResponse(
            success=False,
            error={"code": "NOT_IMPLEMENTED", "message": "Status endpoint not available for Animexin"},
            meta={"provider": "animexin"},
        )

    async def season(self) -> ApiResponse:
        return ApiResponse(
            success=False,
            error={"code": "NOT_IMPLEMENTED", "message": "Season endpoint not available for Animexin"},
            meta={"provider": "animexin"},
        )

    async def type_list(self) -> ApiResponse:
        return ApiResponse(
            success=False,
            error={"code": "NOT_IMPLEMENTED", "message": "Type endpoint not available for Animexin"},
            meta={"provider": "animexin"},
        )

    async def sub(self) -> ApiResponse:
        return ApiResponse(
            success=False,
            error={"code": "NOT_IMPLEMENTED", "message": "Sub/Dub endpoint not available for Animexin"},
            meta={"provider": "animexin"},
        )

    async def orderby(self) -> ApiResponse:
        return ApiResponse(
            success=False,
            error={"code": "NOT_IMPLEMENTED", "message": "Orderby endpoint not available for Animexin"},
            meta={"provider": "animexin"},
        )
