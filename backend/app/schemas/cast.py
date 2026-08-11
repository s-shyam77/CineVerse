from typing import Optional
from pydantic import BaseModel

class CastBase(BaseModel):
    name: str
    character: Optional[str] = None
    image_url: Optional[str] = None

class CastCreate(CastBase):
    pass

class CastResponse(CastBase):
    id: int
    movie_id: int

    class Config:
        from_attributes = True
