from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.genre import Genre
from app.schemas.genre import GenreResponse
from app.schemas.movie import MovieSimpleResponse
from app.services import tmdb_service

router = APIRouter(prefix="/api/genres", tags=["Genres"])

STANDARD_GENRES = [
    {"id": 1, "name": "Action", "slug": "action"},
    {"id": 7, "name": "Anime", "slug": "anime"},
    {"id": 2, "name": "Sci-Fi", "slug": "sci-fi"},
    {"id": 3, "name": "Drama", "slug": "drama"},
    {"id": 4, "name": "Thriller", "slug": "thriller"},
    {"id": 5, "name": "Adventure", "slug": "adventure"},
    {"id": 6, "name": "Fantasy", "slug": "fantasy"},
    {"id": 8, "name": "Comedy", "slug": "comedy"},
    {"id": 9, "name": "Mystery", "slug": "mystery"},
    {"id": 10, "name": "Crime", "slug": "crime"},
    {"id": 14, "name": "Horror", "slug": "horror"},
]

@router.get("", response_model=List[GenreResponse])
def get_all_genres(db: Session = Depends(get_db)):
    db_genres = db.query(Genre).order_by(Genre.name).all()
    if db_genres and len(db_genres) >= 8:
        return db_genres
    return STANDARD_GENRES

@router.get("/{genre_id}/movies", response_model=List[MovieSimpleResponse])
def get_movies_by_genre(genre_id: int, db: Session = Depends(get_db)):
    genre = db.query(Genre).filter(Genre.id == genre_id).first()
    if genre and genre.movies:
        return genre.movies
    
    # Fallback to TMDB
    if genre_id == 7:
        return tmdb_service.get_anime_series(20)
    elif genre_id == 1:
        return tmdb_service.get_action_movies(20)
    elif genre_id == 2:
        return tmdb_service.get_scifi_movies(20)

    return tmdb_service.get_trending(20)
