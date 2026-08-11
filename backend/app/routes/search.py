from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.database.connection import get_db
from app.models.movie import Movie
from app.models.genre import Genre
from app.models.cast import MovieCast
from app.schemas.movie import MovieSimpleResponse
from app.services import tmdb_service

router = APIRouter(prefix="/api/search", tags=["Search"])

@router.get("", response_model=List[MovieSimpleResponse])
def search_media(
    q: str = Query(..., min_length=1, description="Search query string"),
    type: Optional[str] = Query(None, description="Optional 'movie' or 'series' filter"),
    genre: Optional[str] = Query(None, description="Optional genre slug"),
    limit: int = Query(30, ge=1, le=50),
    db: Session = Depends(get_db)
):
    query_text = q.strip()
    if not query_text:
        return []

    # 1. First, search live TMDB database
    tmdb_results = tmdb_service.search_tmdb(query_text, media_type=type, limit=limit)
    if tmdb_results:
        return tmdb_results

    # 2. Local database fallback
    query_str = f"%{query_text}%"
    query = db.query(Movie).outerjoin(Movie.genres).outerjoin(Movie.cast_members).filter(
        or_(
            Movie.title.ilike(query_str),
            Movie.description.ilike(query_str),
            Movie.director.ilike(query_str),
            Genre.name.ilike(query_str),
            MovieCast.name.ilike(query_str),
            MovieCast.character.ilike(query_str)
        )
    ).distinct()

    if type:
        query = query.filter(Movie.type == type)
    if genre:
        query = query.filter(Genre.slug == genre.lower())

    return query.order_by(desc(Movie.rating)).limit(limit).all()
