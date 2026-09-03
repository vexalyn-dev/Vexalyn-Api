"""Provider registry for donghua scrapers."""

from typing import Type
from .anichin.provider import AnichinProvider
from .animexin.provider import AnimexinProvider

_PROVIDER_MAP: dict[str, Type] = {
    "anichin": AnichinProvider,
    "animexin": AnimexinProvider,
}


def get_provider(slug: str):
    cls = _PROVIDER_MAP.get(slug)
    if not cls:
        available = list(_PROVIDER_MAP.keys())
        raise ValueError(f"Unknown provider '{slug}'. Available: {available}")
    return cls


def list_providers() -> list[dict]:
    return [
        {"slug": p.slug, "name": p.name, "base_url": p.base_url, "category": p.category}
        for p in _PROVIDER_MAP.values()
    ]
