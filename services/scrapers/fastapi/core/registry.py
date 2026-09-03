"""Provider registry — discover and instantiate providers."""

import importlib
from typing import Type

from core.provider import BaseProvider
from core.errors import VexalynException

_REGISTRY: dict[str, Type[BaseProvider]] = {}


def register(provider_cls: Type[BaseProvider]) -> Type[BaseProvider]:
    """Decorator to register a provider class."""
    _REGISTRY[provider_cls.slug] = provider_cls
    return provider_cls


def get_provider(slug: str) -> Type[BaseProvider]:
    """Get a registered provider class by slug."""
    cls = _REGISTRY.get(slug)
    if cls is None:
        available = list(_REGISTRY.keys())
        raise VexalynException(
            f"Provider '{slug}' not found. Available: {available}",
            code=404,
        )
    return cls


def get_all_providers() -> dict[str, Type[BaseProvider]]:
    return dict(_REGISTRY)


def ensure_providers_loaded() -> None:
    """Explicitly import all provider modules to trigger @register decorators."""
    _load_provider_module("anichin.provider")
    _load_provider_module("animexin.provider")
    # Future providers added here:
    # _load_provider_module("anime.provider")
    # _load_provider_module("manga.provider")


def _load_provider_module(module_name: str) -> None:
    """Import a provider module, catching and logging any errors."""
    try:
        importlib.import_module(module_name)
    except Exception as e:
        print(f"[vexalyn] Warning: Failed to load provider {module_name}: {e}")
