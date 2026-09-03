"""Structured logging."""

import logging
import sys


def setup_logging(level: int = logging.INFO) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    )
    logger = logging.getLogger("vexalyn.gateway")
    logger.setLevel(level)
    logger.addHandler(handler)

    for noisy in ("uvicorn", "uvicorn.error", "httpx"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
