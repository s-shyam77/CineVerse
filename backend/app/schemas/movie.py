from typing import List, Optional, Any
import datetime
from pydantic import BaseModel
from app.schemas.genre import GenreResponse
from app.schemas.cast import CastResponse, CastCreate

class MovieBase(BaseModel):
    title: str
    description: str
    poster_url: str
    backdrop_url: str
    video_url: str
    trailer_url: Optional[str] = None
    trailer_key: Optional[str] = None
    embed_url: Optional[str] = None
    release_year: int
    duration: str
    rating: float = 7.5
    age_rating: str = "PG-13"
    type: str = "movie"  # 'movie' or 'series'
    director: Optional[str] = None
    is_featured: bool = False
    is_trending: bool = False

class MovieCreate(MovieBase):
    genre_ids: List[int] = []
    cast: List[CastCreate] = []

class MovieUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    video_url: Optional[str] = None
    trailer_url: Optional[str] = None
    trailer_key: Optional[str] = None
    embed_url: Optional[str] = None
    release_year: Optional[int] = None
    duration: Optional[str] = None
    rating: Optional[float] = None
    age_rating: Optional[str] = None
    type: Optional[str] = None
    director: Optional[str] = None
    is_featured: Optional[bool] = None
    is_trending: Optional[bool] = None
    genre_ids: Optional[List[int]] = None

class MovieSimpleResponse(MovieBase):
    id: Any
    genres: List[GenreResponse] = []
    created_at: Optional[Any] = None

    class Config:
        from_attributes = True

class MovieDetailResponse(MovieSimpleResponse):
    cast_members: List[CastResponse] = []
    is_in_watchlist: Optional[bool] = False
    watch_progress: Optional[float] = None

    class Config:
        from_attributes = True
