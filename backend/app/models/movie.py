import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database.connection import Base
from app.models.genre import movie_genres

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    poster_url = Column(String(500), nullable=False)
    backdrop_url = Column(String(500), nullable=False)
    video_url = Column(String(500), nullable=False)
    trailer_url = Column(String(500), nullable=True)
    release_year = Column(Integer, nullable=False)
    duration = Column(String(50), nullable=False)  # e.g., "2h 15m" or "3 Seasons"
    rating = Column(Float, default=7.5)  # e.g., 8.8
    age_rating = Column(String(20), default="PG-13")
    type = Column(String(20), default="movie", index=True)  # 'movie' or 'series'
    director = Column(String(100), nullable=True)
    is_featured = Column(Boolean, default=False)
    is_trending = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    genres = relationship("Genre", secondary=movie_genres, back_populates="movies")
    cast_members = relationship("MovieCast", back_populates="movie", cascade="all, delete-orphan")
    watchlist_entries = relationship("Watchlist", back_populates="movie", cascade="all, delete-orphan")
    history_entries = relationship("WatchHistory", back_populates="movie", cascade="all, delete-orphan")
