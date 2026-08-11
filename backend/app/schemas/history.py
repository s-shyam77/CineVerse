import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.movie import MovieSimpleResponse

class HistorySave(BaseModel):
    movie_id: int
    progress: float  # Current seconds in video
    duration: float  # Total duration in seconds

class HistoryResponse(BaseModel):
    id: int
    user_id: int
    movie_id: int
    progress: float
    duration: float
    last_watched: datetime.datetime
    movie: MovieSimpleResponse

    class Config:
        from_attributes = True
