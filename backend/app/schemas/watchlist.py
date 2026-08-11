import datetime
from pydantic import BaseModel
from app.schemas.movie import MovieSimpleResponse

class WatchlistAdd(BaseModel):
    movie_id: int

class WatchlistResponse(BaseModel):
    id: int
    user_id: int
    movie_id: int
    created_at: datetime.datetime
    movie: MovieSimpleResponse

    class Config:
        from_attributes = True
