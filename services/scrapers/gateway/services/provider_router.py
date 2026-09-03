"""Provider routing — forwards requests to FastAPI scraper services."""

import httpx
import asyncio
from typing import Optional
import logging

logger = logging.getLogger("vexalyn.gateway.providers")

# Provider service URLs
_PROVIDER_URLS = {
    "anichin": "http://127.0.0.1:8001",
    "animexin": "http://127.0.0.1:8002",
}

# Default timeout for provider requests
_TIMEOUT = 30.0


async def proxy_to_provider(
    provider: str,
    path: str,
    method: str = "GET",
    params: Optional[dict] = None,
    json_body: Optional[dict] = None,
) -> dict:
    """Forward a request to a provider service and return the response."""
    base_url = _PROVIDER_URLS.get(provider)
    if not base_url:
        return {
            "success": False,
            "error": {"code": "PROVIDER_NOT_FOUND", "message": f"Provider '{provider}' not configured."},
            "meta": {},
        }, 503
    
    url = f"{base_url}{path}"
    
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            if method == "GET":
                resp = await client.get(url, params=params)
            elif method == "POST":
                resp = await client.post(url, params=params, json=json_body)
            else:
                return {"success": False, "error": {"code": "METHOD_NOT_ALLOWED", "message": f"Method {method} not supported."}, "meta": {}}, 405
            
            resp.raise_for_status()
            return {"success": True, "data": resp.json(), "meta": {"provider": provider}}, resp.status_code
            
    except httpx.TimeoutException:
        return {
            "success": False,
            "error": {"code": "PROVIDER_TIMEOUT", "message": f"Provider '{provider}' timed out."},
            "meta": {},
        }, 503
    except httpx.HTTPStatusError as e:
        return {
            "success": False,
            "error": {"code": "PROVIDER_ERROR", "message": f"Provider '{provider}' returned {e.response.status_code}."},
            "meta": {},
        }, e.response.status_code
    except Exception as e:
        logger.error("Provider proxy error: %s", str(e))
        return {
            "success": False,
            "error": {"code": "PROVIDER_ERROR", "message": "Failed to reach provider service."},
            "meta": {},
        }, 503
