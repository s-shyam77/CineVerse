from .auth import router as auth_router
from .movies import router as movies_router
from .genres import router as genres_router
from .search import router as search_router
from .watchlist import router as watchlist_router
from .history import router as history_router
from .users import router as users_router
from .admin import router as admin_router

__all__ = [
    "auth_router",
    "movies_router",
    "genres_router",
    "search_router",
    "watchlist_router",
    "history_router",
    "users_router",
    "admin_router",
]
