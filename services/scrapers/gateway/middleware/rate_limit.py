"""Rate limiting middleware."""

import time
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger("vexalyn.gateway.rate_limit")

# In-memory rate limit buckets: { key_hash: [timestamp, ...] }
_rate_buckets: dict[str, list[float]] = defaultdict(list)

# Default limits: requests per minute per key
DEFAULT_LIMIT = 60
DEFAULT_WINDOW = 60  # seconds


def check_rate_limit(key_id: str, limit: int = DEFAULT_LIMIT, window: int = DEFAULT_WINDOW) -> bool:
    """Check if a key has exceeded its rate limit. Returns True if allowed."""
    now = time.time()
    bucket = _rate_buckets[key_id]
    
    # Remove expired entries
    cutoff = now - window
    while bucket and bucket[0] < cutoff:
        bucket.pop(0)
    
    if len(bucket) >= limit:
        return False
    
    bucket.append(now)
    return True


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        # Skip for health and docs
        if path in ("/health", "/", "/docs", "/redoc", "/openapi.json"):
            return await call_next(request)
        
        # Get key from request state (set by AuthMiddleware)
        key_id = getattr(request.state, "api_key", None)
        if key_id:
            key_id = id(key_id)  # Use identity as key
        
        if not check_rate_limit(key_id or path):
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "error": {"code": "RATE_LIMITED", "message": "Rate limit exceeded. Try again later."},
                    "meta": {"request_id": getattr(request.state, "request_id", "")},
                },
            )
        
        response = await call_next(request)
        return response
