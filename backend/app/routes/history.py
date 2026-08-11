from typing import List
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.connection import get_db
from app.models.history import WatchHistory
from app.models.movie import Movie
from app.models.user import User
from app.schemas.history import HistorySave, HistoryResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/history", tags=["Watch History"])

@router.get("", response_model=List[HistoryResponse])
def get_watch_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(WatchHistory)
        .filter(WatchHistory.user_id == current_user.id)
        .order_by(desc(WatchHistory.last_watched))
        .limit(limit)
        .all()
    )

@router.post("", response_model=HistoryResponse)
def save_or_update_progress(
    data: HistorySave,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    movie = db.query(Movie).filter(Movie.id == data.movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found"
        )

    entry = db.query(WatchHistory).filter(
        WatchHistory.user_id == current_user.id,
        WatchHistory.movie_id == data.movie_id
    ).first()

    if entry:
        entry.progress = data.progress
        entry.duration = data.duration
        entry.last_watched = datetime.datetime.utcnow()
    else:
        entry = WatchHistory(
            user_id=current_user.id,
            movie_id=data.movie_id,
            progress=data.progress,
            duration=data.duration,
            last_watched=datetime.datetime.utcnow()
        )
        db.add(entry)

    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{movie_id}", status_code=status.HTTP_200_OK)
def remove_history_item(
    movie_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(WatchHistory).filter(
        WatchHistory.user_id == current_user.id,
        WatchHistory.movie_id == movie_id
    ).first()

    if entry:
        db.delete(entry)
        db.commit()

    return {"message": "History item removed successfully"}

@router.delete("", status_code=status.HTTP_200_OK)
def clear_all_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(WatchHistory).filter(WatchHistory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Watch history cleared successfully"}
