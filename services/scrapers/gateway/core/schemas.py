"""Normalized response schemas for the public API."""

from pydantic import BaseModel, Field
from typing import Any, Optional, List


class NormalizedItem(BaseModel):
    """Unified item shape across all providers."""
    title: str
    url: str
    thumbnail: str = ""
    episode: str = ""
    type: str = ""
    status: str = ""
    label: str = ""  # Sub/Dub
    rating: Optional[str] = None
    genres: List[str] = Field(default_factory=list)
    synopsis: str = ""


class NormalizedSection(BaseModel):
    section_name: str
    total_items: int
    data: List[NormalizedItem] = Field(default_factory=list)


class NormalizedDetail(BaseModel):
    title: str
    url: str
    rating: Optional[str] = None
    thumbnail: str = ""
    genres: List[str] = Field(default_factory=list)
    status: str = ""
    studio: str = ""
    duration: str = ""
    country: str = ""
    episodes: str = ""
    network: str = ""
    release_date: str = ""
    season: str = ""
    type: str = ""
    subber: str = ""
    synopsis: str = ""


class NormalizedStream(BaseModel):
    title: str
    url: str
    selected_server: str = ""
    iframe_url: Optional[str] = None
    download_links: List[dict] = Field(default_factory=list)
    servers: List[str] = Field(default_factory=list)


class NormalizedSearch(BaseModel):
    query: str
    total_data: int = 0
    data: List[NormalizedItem] = Field(default_factory=list)


class NormalizedGenre(BaseModel):
    name: str
    slug: str
    count: int = 0


class ApiResponse(BaseModel):
    success: bool = True
    data: Optional[Any] = None
    error: Optional[dict] = None
    meta: dict = Field(default_factory=dict)
