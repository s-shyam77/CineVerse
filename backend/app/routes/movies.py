from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.connection import get_db
from app.models.movie import Movie
from app.models.genre import Genre
from app.models.watchlist import Watchlist
from app.models.history import WatchHistory
from app.models.user import User
from app.schemas.movie import MovieSimpleResponse, MovieDetailResponse
from app.utils.security import get_optional_user
from app.services import tmdb_service

router = APIRouter(prefix="/api/movies", tags=["Movies & TV Series"])

@router.get("", response_model=List[MovieSimpleResponse])
def get_movies(
    type: Optional[str] = Query(None, description="Filter by 'movie' or 'series'"),
    genre: Optional[str] = Query(None, description="Filter by genre slug or name"),
    featured: Optional[bool] = Query(None, description="Filter by featured status"),
    trending: Optional[bool] = Query(None, description="Filter by trending status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    # 1. Check if specific genre requested
    if genre:
        genre_lower = genre.lower().strip()
        if genre_lower in ["anime", "animation"]:
            anime_items = tmdb_service.get_anime_series(limit=limit)
            if anime_items:
                return anime_items
        elif genre_lower in ["action"]:
            action_items = tmdb_service.get_action_movies(limit=limit)
            if action_items:
                return action_items
        elif genre_lower in ["sci-fi", "scifi", "science-fiction"]:
            scifi_items = tmdb_service.get_scifi_movies(limit=limit)
            if scifi_items:
                return scifi_items

    # 2. Check if type requested
    if type == "movie":
        popular_movies = tmdb_service.get_popular_movies(limit=limit)
        if popular_movies:
            return popular_movies
    elif type in ["series", "tv"]:
        popular_series = tmdb_service.get_popular_series(limit=limit)
        if popular_series:
            return popular_series

    # 3. If trending requested
    if trending:
        trend_items = tmdb_service.get_trending(limit=limit)
        if trend_items:
            return trend_items

    # 4. Fallback or query local DB
    query = db.query(Movie)
    if type:
        query = query.filter(Movie.type == type)
    if featured is not None:
        query = query.filter(Movie.is_featured == featured)
    if trending is not None:
        query = query.filter(Movie.is_trending == trending)
    if genre:
        query = query.join(Movie.genres).filter(
            (Genre.slug == genre.lower()) | (Genre.name.ilike(f"%{genre}%"))
        )

    local_movies = query.order_by(desc(Movie.rating), desc(Movie.release_year)).offset(offset).limit(limit).all()
    if local_movies:
        return local_movies

    # If local DB empty, return trending from TMDB
    return tmdb_service.get_trending(limit=limit)

@router.get("/featured", response_model=List[MovieSimpleResponse])
def get_featured_items(limit: int = Query(6, ge=1, le=20), db: Session = Depends(get_db)):
    tmdb_featured = tmdb_service.get_featured(limit=limit)
    if tmdb_featured:
        return tmdb_featured
    return db.query(Movie).filter(Movie.is_featured == True).order_by(desc(Movie.rating)).limit(limit).all()

@router.get("/trending", response_model=List[MovieSimpleResponse])
def get_trending_items(limit: int = Query(15, ge=1, le=30), db: Session = Depends(get_db)):
    tmdb_trend = tmdb_service.get_trending(limit=limit)
    if tmdb_trend:
        return tmdb_trend
    return db.query(Movie).filter(Movie.is_trending == True).order_by(desc(Movie.rating)).limit(limit).all()

@router.get("/top-rated", response_model=List[MovieSimpleResponse])
def get_top_rated_items(limit: int = Query(15, ge=1, le=30)):
    return tmdb_service.get_top_rated(limit=limit)

@router.get("/anime", response_model=List[MovieSimpleResponse])
def get_anime_catalog(limit: int = Query(20, ge=1, le=40)):
    return tmdb_service.get_anime_series(limit=limit)

@router.get("/{movie_id}", response_model=MovieDetailResponse)
def get_movie_by_id(
    movie_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    # 1. Try fetching from TMDB live service first
    tmdb_item = tmdb_service.get_media_details(movie_id)
    if tmdb_item:
        is_in_watchlist = False
        watch_progress = 0.0
        if current_user:
            watchlist_entry = db.query(Watchlist).filter(
                Watchlist.user_id == current_user.id,
                Watchlist.movie_id == movie_id
            ).first()
            is_in_watchlist = watchlist_entry is not None

            history_entry = db.query(WatchHistory).filter(
                WatchHistory.user_id == current_user.id,
                WatchHistory.movie_id == movie_id
            ).first()
            if history_entry:
                watch_progress = history_entry.progress

        tmdb_item["is_in_watchlist"] = is_in_watchlist
        tmdb_item["watch_progress"] = watch_progress
        return tmdb_item

    # 2. Try fetching from local database
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie or series not found"
        )

    is_in_watchlist = False
    watch_progress = 0.0

    if current_user:
        watchlist_entry = db.query(Watchlist).filter(
            Watchlist.user_id == current_user.id,
            Watchlist.movie_id == movie_id
        ).first()
        is_in_watchlist = watchlist_entry is not None

        history_entry = db.query(WatchHistory).filter(
            WatchHistory.user_id == current_user.id,
            WatchHistory.movie_id == movie_id
        ).first()
        if history_entry:
            watch_progress = history_entry.progress

    result = MovieDetailResponse.model_validate(movie)
    result.is_in_watchlist = is_in_watchlist
    result.watch_progress = watch_progress
    return result

@router.get("/{movie_id}/similar", response_model=List[MovieSimpleResponse])
def get_similar_movies(movie_id: int, limit: int = Query(6, ge=1, le=12), db: Session = Depends(get_db)):
    # 1. Try TMDB similar
    tmdb_similar = tmdb_service.get_similar_media(movie_id, limit=limit)
    if tmdb_similar:
        return tmdb_similar

    # 2. Local fallback
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if movie:
        genre_ids = [g.id for g in movie.genres]
        if genre_ids:
            return (
                db.query(Movie)
                .join(Movie.genres)
                .filter(Genre.id.in_(genre_ids), Movie.id != movie_id)
                .distinct()
                .order_by(desc(Movie.rating))
                .limit(limit)
                .all()
            )
    return db.query(Movie).filter(Movie.id != movie_id).limit(limit).all()
