"""Normalize Anichin scraper output into public API shapes."""

import sys
import os
from typing import Any, Optional

_anichin_path = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "Donghua", "Anichin"))
if _anichin_path not in sys.path:
    sys.path.insert(0, _anichin_path)

from core.schemas import (
    NormalizedItem, NormalizedSection, NormalizedDetail,
    NormalizedStream, NormalizedSearch, ApiResponse,
)
from core.exceptions import ProviderError, ApiUnavailable, ValidationError


async def _call(func, *args, **kwargs):
    """Call a scraper function and normalize errors."""
    try:
        result = await func(*args, **kwargs)
        return result
    except Exception as e:
        raise ProviderError(f"Anichin provider error: {e}")


async def normalize_home(result: dict) -> ApiResponse:
    """Normalize home/scrape_homepage output."""
    sections = []
    for sec in result.get("sections", []):
        items = []
        for item in sec.get("data", []):
            items.append(NormalizedItem(
                title=item.get("title", ""),
                url=item.get("url", ""),
                thumbnail=item.get("thumbnail", ""),
                episode=item.get("episode", ""),
                type=item.get("type", ""),
                status=item.get("status", ""),
                label=item.get("label", ""),
            ))
        sections.append(NormalizedSection(
            section_name=sec.get("section_name", ""),
            total_items=sec.get("total_items", len(items)),
            data=items,
        ))
    return ApiResponse(
        success=result.get("status") == "success",
        data=sections,
        meta={"provider": "anichin", "sections": len(sections)},
    )


async def normalize_search(result: dict, query: str) -> ApiResponse:
    """Normalize search/scrape_search output."""
    data = []
    for item in result.get("data", []):
        data.append(NormalizedItem(
            title=item.get("title", ""),
            url=item.get("url", ""),
            thumbnail=item.get("thumbnail", ""),
            episode=item.get("episode", ""),
            type=item.get("type", "Donghua"),
            status=item.get("status", ""),
            label=item.get("label", "Sub"),
        ))
    return ApiResponse(
        success=result.get("status") == "success",
        data=NormalizedSearch(query=query, total_data=result.get("total_data", len(data)), data=data),
        meta={"provider": "anichin", "query": query},
    )


async def normalize_detail(result: dict) -> ApiResponse:
    """Normalize detail/scrape_detail output."""
    d = result.get("data", {})
    return ApiResponse(
        success=result.get("status") == "success",
        data=NormalizedDetail(
            title=d.get("title", ""),
            url=d.get("url", ""),
            rating=d.get("rating"),
            thumbnail=d.get("thumbnail", ""),
            genres=d.get("genres", []),
            status=d.get("status", "N/A"),
            studio=d.get("studio", "N/A"),
            duration=d.get("duration", "N/A"),
            country=d.get("country", "N/A"),
            episodes=d.get("episodes", "N/A"),
            network=d.get("network", "N/A"),
            release_date=d.get("release_date", "N/A"),
            season=d.get("season", "N/A"),
            type=d.get("type", "N/A"),
            subber=d.get("subber", "N/A"),
            synopsis=d.get("synopsis", ""),
        ),
        meta={"provider": "anichin"},
    )


async def normalize_latest(result: dict) -> ApiResponse:
    """Normalize latest/scrape_latest_series output."""
    items = []
    for item in result.get("data", []):
        items.append(NormalizedItem(
            title=item.get("title", ""),
            url=item.get("url", ""),
            thumbnail=item.get("thumbnail", ""),
            episode=item.get("episode", ""),
            type=item.get("type", "Donghua"),
            status=item.get("status", ""),
            label=item.get("label", "Sub"),
        ))
    return ApiResponse(
        success=result.get("status") == "success",
        data=items,
        meta={"provider": "anichin"},
    )


async def normalize_popular(result: dict) -> ApiResponse:
    """Normalize popular/scrape_popular_donghua output."""
    items = []
    for item in result.get("data", []):
        items.append(NormalizedItem(
            title=item.get("title", ""),
            url=item.get("url", ""),
            thumbnail=item.get("thumbnail", ""),
            episode=item.get("episode", ""),
            type=item.get("type", "Donghua"),
            status=item.get("status", ""),
            label=item.get("label", "Sub"),
        ))
    return ApiResponse(
        success=result.get("status") == "success",
        data=items,
        meta={"provider": "anichin"},
    )


async def normalize_stream(result: dict) -> ApiResponse:
    """Normalize stream endpoint output."""
    d = result.get("data", {})
    return ApiResponse(
        success=True,
        data=NormalizedStream(
            title=d.get("title", ""),
            url=d.get("url", ""),
            selected_server=d.get("selected_server", ""),
            iframe_url=d.get("iframe_url"),
            download_links=d.get("download_links", []),
            servers=d.get("servers", []),
        ),
        meta={"provider": "anichin"},
    )


async def normalize_genres(result: dict) -> ApiResponse:
    """Normalize genre output."""
    from genre import scrape_all_genres
    raw = await _call(scrape_all_genres)
    data = []
    for g in raw.get("data", []):
        data.append({
            "name": g.get("name", g.get("title", "")),
            "slug": g.get("slug", g.get("name", "")).lower().replace(" ", "-"),
            "count": g.get("count", 0),
        })
    return ApiResponse(success=True, data=data, meta={"provider": "anichin"})


async def normalize_az_list(result: dict) -> ApiResponse:
    """Normalize A-Z list output."""
    items = []
    for item in result.get("data", []):
        items.append(NormalizedItem(
            title=item.get("title", ""),
            url=item.get("url", ""),
            thumbnail=item.get("thumbnail", ""),
            episode=item.get("episode", ""),
            type=item.get("type", "Donghua"),
            status=item.get("status", ""),
            label=item.get("label", "Sub"),
        ))
    return ApiResponse(
        success=result.get("status") == "success",
        data=items,
        meta={"provider": "anichin"},
    )
