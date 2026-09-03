"""Base provider interface for all scraper providers."""

from abc import ABC, abstractmethod
from typing import Any


class BaseProvider(ABC):
    """All scraper providers must implement this interface."""

    name: str = ""
    slug: str = ""
    base_url: str = ""
    category: str = "donghua"

    @abstractmethod
    async def scrape_home(self) -> dict[str, Any]:
        """Fetch homepage content."""

    @abstractmethod
    async def scrape_search(self, query: str) -> dict[str, Any]:
        """Search for content."""

    @abstractmethod
    async def scrape_detail(self, slug: str) -> dict[str, Any]:
        """Fetch detail page for a title."""

    @abstractmethod
    async def scrape_latest(self, page: int = 1) -> dict[str, Any]:
        """Fetch latest updates."""

    @abstractmethod
    async def scrape_popular(self) -> dict[str, Any]:
        """Fetch popular content."""

    @abstractmethod
    async def scrape_stream(self, slug: str) -> dict[str, Any]:
        """Resolve stream URLs for an episode."""

    @abstractmethod
    async def scrape_genres(self) -> dict[str, Any]:
        """List all genres."""

    @abstractmethod
    async def scrape_az_list(self, show_param: str = "", page: int = 1) -> dict[str, Any]:
        """A-Z listing."""
