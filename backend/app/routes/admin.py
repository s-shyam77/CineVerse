from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.connection import get_db
from app.models.user import User
from app.models.movie import Movie
from app.models.genre import Genre
from app.models.cast import MovieCast
from app.models.watchlist import Watchlist
from app.models.history import WatchHistory
from app.schemas.user import UserResponse
from app.schemas.movie import MovieSimpleResponse, MovieCreate, MovieUpdate
from app.utils.security import get_admin_user

router = APIRouter(prefix="/api/admin", tags=["Admin Management"], dependencies=[Depends(get_admin_user)])

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    total_movies = db.query(func.count(Movie.id)).filter(Movie.type == "movie").scalar()
    total_series = db.query(func.count(Movie.id)).filter(Movie.type == "series").scalar()
    total_watchlist_items = db.query(func.count(Watchlist.id)).scalar()
    total_plays = db.query(func.count(WatchHistory.id)).scalar()

    return {
        "total_users": total_users,
        "total_movies": total_movies,
        "total_series": total_series,
        "total_watchlist_items": total_watchlist_items,
        "total_plays": total_plays
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id).all()

@router.put("/users/{user_id}/role")
def update_user_role(user_id: int, role: str, db: Session = Depends(get_db)):
    if role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'user' or 'admin'"
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    user.role = role
    db.commit()
    return {"message": f"User role updated to {role}", "user": user}

@router.get("/movies", response_model=List[MovieSimpleResponse])
def admin_get_movies(db: Session = Depends(get_db)):
    return db.query(Movie).order_by(Movie.id.desc()).all()

@router.post("/movies", response_model=MovieSimpleResponse, status_code=status.HTTP_201_CREATED)
def admin_create_movie(data: MovieCreate, db: Session = Depends(get_db)):
    new_movie = Movie(
        title=data.title,
        description=data.description,
        poster_url=data.poster_url,
        backdrop_url=data.backdrop_url,
        video_url=data.video_url,
        trailer_url=data.trailer_url,
        release_year=data.release_year,
        duration=data.duration,
        rating=data.rating,
        age_rating=data.age_rating,
        type=data.type,
        director=data.director,
        is_featured=data.is_featured,
        is_trending=data.is_trending
    )

    if data.genre_ids:
        genres = db.query(Genre).filter(Genre.id.in_(data.genre_ids)).all()
        new_movie.genres = genres

    db.add(new_movie)
    db.commit()
    db.refresh(new_movie)

    # Add cast members if any
    for cast_item in data.cast:
        cast_entry = MovieCast(
            movie_id=new_movie.id,
            name=cast_item.name,
            character=cast_item.character,
            image_url=cast_item.image_url
        )
        db.add(cast_entry)
    
    db.commit()
    db.refresh(new_movie)
    return new_movie

@router.put("/movies/{movie_id}", response_model=MovieSimpleResponse)
def admin_update_movie(movie_id: int, data: MovieUpdate, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found"
        )

    for field, val in data.model_dump(exclude_unset=True).items():
        if field == "genre_ids":
            genres = db.query(Genre).filter(Genre.id.in_(val)).all()
            movie.genres = genres
        else:
            setattr(movie, field, val)

    db.commit()
    db.refresh(movie)
    return movie

@router.delete("/movies/{movie_id}", status_code=status.HTTP_200_OK)
def admin_delete_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found"
        )

    db.delete(movie)
    db.commit()
    return {"message": "Movie deleted successfully"}
