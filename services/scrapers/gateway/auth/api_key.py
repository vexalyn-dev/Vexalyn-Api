"""API key authentication middleware."""

import hashlib
import hmac
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging

from core.request_id import generate_request_id

logger = logging.getLogger("vexalyn.gateway.auth")

# In-memory key store — replace with database lookup in production
# Format: { raw_prefix: { "hash": bcrypt_hash, "status": "active", "permissions": [...] } }
_API_KEYS: dict[str, dict] = {}


def register_api_key(raw_key: str, hashed_key: str, permissions: list[str], expires_at=None) -> None:
    """Register an API key in the in-memory store."""
    prefix = raw_key.split("_")[0] + "_" + raw_key.split("_")[1]
    _API_KEYS[prefix] = {
        "hash": hashed_key,
        "raw_key": raw_key,
        "permissions": permissions,
        "status": "active",
        "expires_at": expires_at,
    }


def verify_api_key(authorization: str) -> dict | None:
    """Verify a Bearer token against registered keys.
    
    Returns key info dict or None if invalid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization[len("Bearer "):]
    parts = token.split("_")
    if len(parts) < 3:
        return None
    
    prefix = "_".join(parts[:2])
    key_data = _API_KEYS.get(prefix)
    if not key_data:
        return None
    
    if key_data["status"] != "active":
        return None
    
    # Verify hash (in production, use bcrypt.compare)
    if not hmac.compare_digest(key_data["hash"], hashlib.sha256(token.encode()).hexdigest()):
        return None
    
    return key_data


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        # Skip auth for health, root, and docs
        if path in ("/health", "/", "/docs", "/redoc", "/openapi.json"):
            return await call_next(request)
        
        # Allow public read endpoints (index pages)
        if path in ("/v1/donghua/", "/v1/anime/", "/v1/manga/"):
            return await call_next(request)
        
        auth_header = request.headers.get("Authorization", "")
        key_data = verify_api_key(auth_header)
        
        if not key_data:
            return JSONResponse(
                status_code=401,
                content={
                    "success": False,
                    "error": {"code": "INVALID_API_KEY", "message": "Invalid or missing API key."},
                    "meta": {"request_id": generate_request_id()},
                },
            )
        
        # Attach key info to request state
        request.state.api_key = key_data
        request.state.request_id = generate_request_id()
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request.state.request_id
        return response
