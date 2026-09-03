"""Animexin provider implementation.

Wraps existing Animexin scraper modules without modifying their logic.
"""

import sys
import os
from typing import Any

# Ensure existing scraper modules are importable
_animexin_path = os.path.join(os.path.dirname(__file__), "..", "..", "Donghua", "Animexin")
_animexin_path = os.path.normpath(_animexin_path)
if _animexin_path not in sys.path:
    sys.path.insert(0, _animexin_path)

from core.provider import BaseProvider
from core.registry import register


@register
class AnimexinProvider(BaseProvider):
    name = "Animexin"
    slug = "animexin"
    base_url = "https://animexin.dev"
    category = "donghua"

    async def scrape_home(self) -> dict[str, Any]:
        from home import scrape_home
        result = await scrape_home()
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("sections", {}),
            "meta": {"provider": "animexin", "elapsed_ms": 0},
        }

    async def scrape_search(self, query: str) -> dict[str, Any]:
        from search import scrape_search
        result = await scrape_search(query)
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("data", []),
            "meta": {"provider": "animexin", "keyword": query},
        }

    async def scrape_detail(self, slug: str) -> dict[str, Any]:
        from detail import scrape_detail
        result = await scrape_detail(slug)
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("data", {}),
            "meta": {"provider": "animexin", "slug": slug},
        }

    async def scrape_latest(self, page: int = 1) -> dict[str, Any]:
        # Animexin doesn't have a dedicated latest module; reuse search with empty query
        from search import scrape_search
        result = await scrape_search("")
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("data", []),
            "meta": {"provider": "animexin", "page": page},
        }

    async def scrape_popular(self) -> dict[str, Any]:
        from home import scrape_home
        result = await scrape_home()
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("sections", {}),
            "meta": {"provider": "animexin"},
        }

    async def scrape_stream(self, slug: str) -> dict[str, Any]:
        return {
            "statusCode": 501,
            "status": "error",
            "message": "Stream endpoint not yet implemented for Animexin",
            "data": None,
            "meta": {"provider": "animexin"},
        }

    async def scrape_genres(self) -> dict[str, Any]:
        from genre import scrape_genres
        result = await scrape_genres()
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("data", []),
            "meta": {"provider": "animexin"},
        }

    async def scrape_az_list(self, show_param: str = "", page: int = 1) -> dict[str, Any]:
        from az_list import scrape_az_list
        result = await scrape_az_list(show_param, page)
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("data", []),
            "meta": {"provider": "animexin", "show": show_param, "page": page},
        }
