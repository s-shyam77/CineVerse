from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.connection import get_db
from app.models.watchlist import Watchlist
from app.models.movie import Movie
from app.models.user import User
from app.schemas.watchlist import WatchlistResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/watchlist", tags=["Watchlist"])

@router.get("", response_model=List[WatchlistResponse])
def get_user_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Watchlist)
        .filter(Watchlist.user_id == current_user.id)
        .order_by(desc(Watchlist.created_at))
        .all()
    )

@router.post("/{movie_id}", status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    movie_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify movie exists
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found"
        )

    # Check if already added
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.movie_id == movie_id
    ).first()
    if existing:
        return {"message": "Already in watchlist", "is_in_watchlist": True}

    watchlist_item = Watchlist(user_id=current_user.id, movie_id=movie_id)
    db.add(watchlist_item)
    db.commit()
    return {"message": "Added to watchlist successfully", "is_in_watchlist": True}

@router.delete("/{movie_id}", status_code=status.HTTP_200_OK)
def remove_from_watchlist(
    movie_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.movie_id == movie_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not in watchlist"
        )

    db.delete(item)
    db.commit()
    return {"message": "Removed from watchlist", "is_in_watchlist": False}
