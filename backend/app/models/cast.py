from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class MovieCast(Base):
    __tablename__ = "movie_cast"

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    character = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)

    # Relationships
    movie = relationship("Movie", back_populates="cast_members")
