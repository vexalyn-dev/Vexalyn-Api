"""Anichin provider implementation.

Wraps existing Anichin scraper modules without modifying their logic.
"""

import sys
import os
import asyncio
from typing import Any

# Ensure existing scraper modules are importable
_anichin_path = os.path.join(os.path.dirname(__file__), "..", "..", "Donghua", "Anichin")
_anichin_path = os.path.normpath(_anichin_path)
if _anichin_path not in sys.path:
    sys.path.insert(0, _anichin_path)

from core.provider import BaseProvider
from core.registry import register


@register
class AnichinProvider(BaseProvider):
    name = "Anichin"
    slug = "anichin"
    base_url = "https://anichin.moe"
    category = "donghua"

    async def scrape_home(self) -> dict[str, Any]:
        from home import scrape_homepage
        result = await scrape_homepage()
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("sections", []),
            "meta": {"provider": "anichin", "elapsed_ms": 0},
        }

    async def scrape_search(self, query: str) -> dict[str, Any]:
        from search import scrape_search
        result = await scrape_search(query)
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("data", []),
            "meta": {"provider": "anichin", "total_data": result.get("total_data", 0)},
        }

    async def scrape_detail(self, slug: str) -> dict[str, Any]:
        from detail import scrape_detail
        result = await scrape_detail(slug)
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("data", {}),
            "meta": {"provider": "anichin"},
        }

    async def scrape_latest(self, page: int = 1) -> dict[str, Any]:
        from latest import scrape_latest_series
        result = await scrape_latest_series(page)
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("data", []),
            "meta": {"provider": "anichin"},
        }

    async def scrape_popular(self) -> dict[str, Any]:
        from popular import scrape_popular_donghua
        result = await scrape_popular_donghua("all")
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("data", []),
            "meta": {"provider": "anichin"},
        }

    async def scrape_stream(self, slug: str) -> dict[str, Any]:
        from stream import resolve_episode_url_stable
        url = await resolve_episode_url_stable(slug)
        if not url:
            return {"statusCode": 404, "status": "error", "message": "Episode not found", "data": {}}
        return {
            "statusCode": 200,
            "status": "success",
            "message": f"Stream resolved for {slug}",
            "data": {"url": url},
            "meta": {"provider": "anichin"},
        }

    async def scrape_genres(self) -> dict[str, Any]:
        from genre import scrape_all_genres
        result = await scrape_all_genres()
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("data", []),
            "meta": {"provider": "anichin"},
        }

    async def scrape_az_list(self, show_param: str = "", page: int = 1) -> dict[str, Any]:
        from az_list import scrape_az_list
        result = await scrape_az_list(show_param, page)
        return {
            "statusCode": result.get("statusCode", 200),
            "status": result.get("status", "success"),
            "message": result.get("message", ""),
            "data": result.get("data", []),
            "meta": {"provider": "anichin"},
        }
