"""Pydantic response schemas shared across providers."""

from pydantic import BaseModel, Field
from typing import Any, Optional, Generic, TypeVar


T = TypeVar("T")


class Meta(BaseModel):
    provider: str = ""
    category: str = ""
    elapsed_ms: int = 0


class ApiResponse(BaseModel, Generic[T]):
    """Standard envelope for all API responses."""

    statusCode: int = 200
    status: str = "success"
    message: str = "OK"
    data: Optional[T] = None
    meta: Meta = Field(default_factory=Meta)


class ErrorResponse(BaseModel):
    statusCode: int = 500
    status: str = "error"
    message: str = "An error occurred"
    details: Optional[dict] = None


class AnimeItem(BaseModel):
    title: str = Field(..., description="Title of the anime/donghua")
    url: str = Field(..., description="Detail page URL")
    thumbnail: str = Field("", description="Poster/thumbnail URL")
    episode: str = Field("", description="Latest episode")
    type: str = Field("", description="Type: TV, Movie, OVA, etc.")
    status: str = Field("", description="Ongoing / Completed")
    label: str = Field("", description="Sub / Dub")


class SectionItem(BaseModel):
    section_name: str
    total_items: int
    data: list[AnimeItem] = Field(default_factory=list)
