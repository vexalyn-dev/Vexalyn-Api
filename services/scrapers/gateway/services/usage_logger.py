"""Usage logging service."""

import logging
import time
from typing import Optional

logger = logging.getLogger("vexalyn.gateway.usage")


class UsageLogger:
    """Logs API requests for analytics and billing."""
    
    def __init__(self):
        self._logs: list[dict] = []
    
    def log(
        self,
        request_id: str,
        key_id: str,
        method: str,
        path: str,
        status_code: int,
        latency_ms: int,
        provider: str = "",
        category: str = "",
    ) -> None:
        entry = {
            "request_id": request_id,
            "key_id": key_id,
            "method": method,
            "path": path,
            "status_code": status_code,
            "latency_ms": latency_ms,
            "provider": provider,
            "category": category,
            "timestamp": time.time(),
        }
        self._logs.append(entry)
        logger.info(
            "Request %s: %s %s → %d (%dms)",
            request_id[:12],
            method,
            path,
            status_code,
            latency_ms,
        )
    
    def get_logs(self, limit: int = 100) -> list[dict]:
        return self._logs[-limit:]


usage_logger = UsageLogger()
