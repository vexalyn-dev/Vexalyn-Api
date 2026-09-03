"""Normalize Animexin scraper output into public API shapes."""

import sys
import os
from typing import Any

_animexin_path = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "Donghua", "Animexin"))
if _animexin_path not in sys.path:
    sys.path.insert(0, _animexin_path)

from core.schemas import ApiResponse
from core.exceptions import ProviderError, ApiUnavailable, ValidationError


def _to_item(item_dict: dict) -> dict:
    return {
        "title": item_dict.get("title", ""),
        "url": item_dict.get("url", ""),
        "thumbnail": item_dict.get("thumbnail", ""),
        "episode": item_dict.get("episode", ""),
        "type": item_dict.get("type", "Donghua"),
        "status": item_dict.get("status", ""),
        "label": item_dict.get("label", "Sub"),
    }


async def normalize_home(result: dict) -> ApiResponse:
    """Normalize animexin home output."""
    sections_data = result.get("sections", {})
    sections = []
    for key, sec in sections_data.items():
        items = [_to_item(i) for i in sec.get("items", [])]
        sections.append({
            "section_name": sec.get("section_name", key),
            "total_items": sec.get("total_items", len(items)),
            "data": items,
        })
    return ApiResponse(
        success=result.get("status") == "success",
        data=sections,
        meta={"provider": "animexin"},
    )


async def normalize_search(result: dict, query: str) -> ApiResponse:
    """Normalize animexin search output."""
    data = [_to_item(i) for i in result.get("data", [])]
    return ApiResponse(
        success=result.get("status") == "success",
        data={"query": query, "total_data": result.get("total_items", len(data)), "data": data},
        meta={"provider": "animexin", "query": query},
    )


async def normalize_detail(result: dict) -> ApiResponse:
    """Normalize animexin detail output."""
    d = result.get("data", {})
    return ApiResponse(
        success=result.get("status") == "success",
        data={
            "title": d.get("title", ""),
            "url": d.get("url", ""),
            "rating": d.get("rating"),
            "thumbnail": d.get("thumbnail", ""),
            "genres": d.get("genres", []),
            "synopsis": d.get("synopsis", ""),
            "status": d.get("status", "N/A"),
            "studio": d.get("studio", "N/A"),
            "episodes": d.get("episodes", "N/A"),
        },
        meta={"provider": "animexin"},
    )


async def normalize_az_list(result: dict) -> ApiResponse:
    """Normalize animexin az_list output."""
    data = [_to_item(i) for i in result.get("data", [])]
    return ApiResponse(
        success=result.get("status") == "success",
        data=data,
        meta={"provider": "animexin"},
    )
