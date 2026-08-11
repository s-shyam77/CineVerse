from .auth import LoginRequest, RegisterRequest
from .genre import GenreBase, GenreCreate, GenreResponse
from .cast import CastBase, CastCreate, CastResponse
from .movie import MovieBase, MovieCreate, MovieUpdate, MovieSimpleResponse, MovieDetailResponse
from .user import UserBase, UserCreate, UserUpdate, UserResponse, TokenResponse
from .watchlist import WatchlistAdd, WatchlistResponse
from .history import HistorySave, HistoryResponse

__all__ = [
    "LoginRequest", "RegisterRequest",
    "GenreBase", "GenreCreate", "GenreResponse",
    "CastBase", "CastCreate", "CastResponse",
    "MovieBase", "MovieCreate", "MovieUpdate", "MovieSimpleResponse", "MovieDetailResponse",
    "UserBase", "UserCreate", "UserUpdate", "UserResponse", "TokenResponse",
    "WatchlistAdd", "WatchlistResponse",
    "HistorySave", "HistoryResponse"
]
