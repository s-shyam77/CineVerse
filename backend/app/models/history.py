import datetime
from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.connection import Base

class WatchHistory(Base):
    __tablename__ = "watch_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=False, index=True)
    progress = Column(Float, default=0.0)  # Progress in seconds (or percentage)
    duration = Column(Float, default=0.0)  # Total duration in seconds
    last_watched = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "movie_id", name="unique_user_movie_history"),
    )

    # Relationships
    user = relationship("User", back_populates="history_items")
    movie = relationship("Movie", back_populates="history_entries")
