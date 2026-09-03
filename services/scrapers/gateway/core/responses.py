"""Standardized response envelopes."""

from typing import Any, Optional, Dict


def success_response(
    data: Any = None,
    message: str = "OK",
    request_id: str = "",
    meta: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    body: Dict[str, Any] = {
        "success": True,
        "data": data,
        "message": message,
        "meta": {"request_id": request_id, **(meta or {})},
    }
    return body


def error_response(
    message: str,
    code: str = "INTERNAL_ERROR",
    status_code: int = 500,
    request_id: str = "",
    details: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    body: Dict[str, Any] = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
        },
        "meta": {"request_id": request_id},
    }
    if details:
        body["error"]["details"] = details
    return body, status_code
