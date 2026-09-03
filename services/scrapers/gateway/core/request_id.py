"""Request ID generation."""

import uuid
import time


def generate_request_id(prefix: str = "req") -> str:
    """Generate a unique request ID: req_<timestamp>_<uuid>."""
    ts = int(time.time() * 1000)
    short_uuid = uuid.uuid4().hex[:8]
    return f"{prefix}_{ts}_{short_uuid}"
