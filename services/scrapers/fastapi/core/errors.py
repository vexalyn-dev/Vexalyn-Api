"""Core exception and error handling."""

from fastapi import Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("vexalyn")


class VexalynException(Exception):
    """Base exception for all VEXALYN service errors."""

    def __init__(
        self,
        message: str,
        code: int = 500,
        details: dict | None = None,
    ):
        self.message = message
        self.code = code
        self.details = details or {}


class NotFoundError(VexalynException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, code=status.HTTP_404_NOT_FOUND)


class RateLimitError(VexalynException):
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(message, code=status.HTTP_429_TOO_MANY_REQUESTS)


class ProviderError(VexalynException):
    def __init__(self, message: str = "Provider error", provider: str = ""):
        super().__init__(message, code=status.HTTP_502_BAD_GATEWAY)
        self.provider = provider


def exception_handler(request: Request, exc: VexalynException) -> JSONResponse:
    """Return a consistent error envelope without stack traces."""
    logger.warning(
        "Vexalyn error: %s (code=%d) path=%s",
        exc.message,
        exc.code,
        request.url.path,
    )
    body: dict = {
        "statusCode": exc.code,
        "status": "error",
        "message": exc.message,
        "data": None,
    }
    if exc.details:
        body["details"] = exc.details
    return JSONResponse(status_code=exc.code, content=body)
