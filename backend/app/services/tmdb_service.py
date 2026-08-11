import os
import requests
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "deb848e5838d61d70845d8186f942da8")
BASE_URL = "https://api.themoviedb.org/3"
IMAGE_POSTER_BASE = "https://image.tmdb.org/t/p/w500"
IMAGE_BACKDROP_BASE = "https://image.tmdb.org/t/p/original"

FALLBACK_POSTER = "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop"
FALLBACK_BACKDROP = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop"
SAMPLE_VIDEO_STREAM = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

GENRE_MAP = {
    28: {"id": 1, "name": "Action", "slug": "action"},
    12: {"id": 5, "name": "Adventure", "slug": "adventure"},
    16: {"id": 7, "name": "Animation", "slug": "animation"},
    35: {"id": 8, "name": "Comedy", "slug": "comedy"},
    80: {"id": 10, "name": "Crime", "slug": "crime"},
    99: {"id": 11, "name": "Documentary", "slug": "documentary"},
    18: {"id": 3, "name": "Drama", "slug": "drama"},
    10751: {"id": 12, "name": "Family", "slug": "family"},
    14: {"id": 6, "name": "Fantasy", "slug": "fantasy"},
    36: {"id": 13, "name": "History", "slug": "history"},
    27: {"id": 14, "name": "Horror", "slug": "horror"},
    10402: {"id": 15, "name": "Music", "slug": "music"},
    9648: {"id": 9, "name": "Mystery", "slug": "mystery"},
    10749: {"id": 16, "name": "Romance", "slug": "romance"},
    878: {"id": 2, "name": "Sci-Fi", "slug": "sci-fi"},
    10770: {"id": 17, "name": "TV Movie", "slug": "tv-movie"},
    53: {"id": 4, "name": "Thriller", "slug": "thriller"},
    10752: {"id": 18, "name": "War", "slug": "war"},
    37: {"id": 19, "name": "Western", "slug": "western"},
    10759: {"id": 20, "name": "Action & Adventure", "slug": "action-adventure"},
    10765: {"id": 21, "name": "Sci-Fi & Fantasy", "slug": "sci-fi-fantasy"},
}

def _format_item(item: Dict[str, Any], default_type: str = "movie") -> Dict[str, Any]:
    media_type = item.get("media_type", default_type)
    if media_type not in ["movie", "series", "tv"]:
        media_type = default_type
    if media_type == "tv":
        media_type = "series"

    title = item.get("title") or item.get("name") or "Untitled"
    overview = item.get("overview") or f"Experience the incredible universe of {title} on CineVerse."
    
    poster_path = item.get("poster_path")
    poster_url = f"{IMAGE_POSTER_BASE}{poster_path}" if poster_path else FALLBACK_POSTER

    backdrop_path = item.get("backdrop_path")
    backdrop_url = f"{IMAGE_BACKDROP_BASE}{backdrop_path}" if backdrop_path else (poster_url if poster_path else FALLBACK_BACKDROP)

    release_date = item.get("release_date") or item.get("first_air_date") or "2024"
    try:
        release_year = int(release_date.split("-")[0])
    except Exception:
        release_year = 2024

    vote_avg = round(float(item.get("vote_average", 7.5)), 1)
    if vote_avg == 0.0:
        vote_avg = 7.8

    # Extract genres
    genres = []
    genre_ids = item.get("genre_ids") or []
    if "genres" in item and isinstance(item["genres"], list):
        for g in item["genres"]:
            genres.append({
                "id": g.get("id", 1),
                "name": g.get("name", "Action"),
                "slug": g.get("name", "action").lower().replace(" ", "-")
            })
    else:
        for gid in genre_ids:
            if gid in GENRE_MAP:
                genres.append(GENRE_MAP[gid])
    
    if not genres:
        genres = [{"id": 1, "name": "Action", "slug": "action"}]

    duration = "2h 15m" if media_type == "movie" else f"{item.get('number_of_seasons', 1)} Season(s)"
    if "runtime" in item and item["runtime"]:
        hrs = item["runtime"] // 60
        mins = item["runtime"] % 60
        duration = f"{hrs}h {mins}m" if hrs > 0 else f"{mins}m"

    # Find trailer key if videos are appended
    trailer_key = None
    videos = item.get("videos", {}).get("results", [])
    for v in videos:
        if v.get("site") == "YouTube" and v.get("type") in ["Trailer", "Teaser", "Clip"]:
            trailer_key = v.get("key")
            break

    # Cast members
    cast_members = []
    credits = item.get("credits", {})
    for c in credits.get("cast", [])[:8]:
        profile_path = c.get("profile_path")
        cast_members.append({
            "id": c.get("id", 0),
            "movie_id": item.get("id"),
            "name": c.get("name", "Actor"),
            "character": c.get("character", ""),
            "image_url": f"{IMAGE_POSTER_BASE}{profile_path}" if profile_path else None
        })

    # Director
    director = None
    for crew in credits.get("crew", []):
        if crew.get("job") == "Director":
            director = crew.get("name")
            break

    return {
        "id": item.get("id"),
        "title": title,
        "description": overview,
        "poster_url": poster_url,
        "backdrop_url": backdrop_url,
        "video_url": SAMPLE_VIDEO_STREAM,
        "trailer_key": trailer_key,
        "trailer_url": f"https://www.youtube.com/watch?v={trailer_key}" if trailer_key else None,
        "embed_url": f"https://www.youtube.com/embed/{trailer_key}?autoplay=1&enablejsapi=1" if trailer_key else None,
        "release_year": release_year,
        "duration": duration,
        "rating": vote_avg,
        "age_rating": "PG-13" if media_type == "movie" else "TV-14",
        "type": media_type,
        "director": director,
        "is_featured": item.get("vote_average", 0) >= 8.0,
        "is_trending": True,
        "genres": genres,
        "cast_members": cast_members,
        "created_at": "2024-01-01T00:00:00"
    }

def _get_local_fallback_movies(limit: int = 20, genre_slug: Optional[str] = None, media_type: Optional[str] = None) -> List[Dict[str, Any]]:
    try:
        from app.database.connection import SessionLocal
        from app.models.movie import Movie
        from app.models.genre import Genre
        from sqlalchemy import desc
        db = SessionLocal()
        query = db.query(Movie)
        if media_type:
            query = query.filter(Movie.type == media_type)
        if genre_slug:
            query = query.join(Movie.genres).filter(Genre.slug == genre_slug)
        local_items = query.order_by(desc(Movie.rating)).limit(limit).all()
        result = []
        for m in local_items:
            result.append({
                "id": m.id,
                "title": m.title,
                "description": m.description,
                "poster_url": m.poster_url,
                "backdrop_url": m.backdrop_url,
                "video_url": m.video_url,
                "trailer_key": "QTtUdN2k0Bo",
                "trailer_url": "https://www.youtube.com/watch?v=QTtUdN2k0Bo",
                "embed_url": "https://www.youtube.com/embed/QTtUdN2k0Bo?autoplay=1",
                "release_year": m.release_year,
                "duration": m.duration,
                "rating": m.rating,
                "age_rating": m.age_rating,
                "type": m.type,
                "director": m.director,
                "is_featured": m.is_featured,
                "is_trending": m.is_trending,
                "genres": [{"id": g.id, "name": g.name, "slug": g.slug} for g in m.genres],
                "cast_members": [{"name": c.name, "character": c.character, "image_url": c.image_url} for c in m.cast_members],
                "created_at": "2024-01-01T00:00:00"
            })
        db.close()
        return result
    except Exception as e:
        print(f"[LOCAL DB FALLBACK ERROR]: {e}")
        return []

def get_trending(limit: int = 20) -> List[Dict[str, Any]]:
    try:
        url = f"{BASE_URL}/trending/all/week?api_key={TMDB_API_KEY}"
        res = requests.get(url, timeout=6)
        if res.status_code == 200:
            results = res.json().get("results", [])
            if results:
                return [_format_item(i) for i in results[:limit]]
        print(f"[TMDB WARNING] get_trending status code: {res.status_code}")
    except Exception as e:
        print(f"[TMDB ERROR] get_trending failed ({e}), using local database fallback")
    return _get_local_fallback_movies(limit=limit)

def get_featured(limit: int = 6) -> List[Dict[str, Any]]:
    try:
        trending = get_trending(15)
        featured = [i for i in trending if i.get("backdrop_url") and i.get("backdrop_url") != FALLBACK_BACKDROP]
        if featured:
            return featured[:limit]
    except Exception as e:
        print(f"[TMDB ERROR] get_featured: {e}")
    return _get_local_fallback_movies(limit=limit)

def get_popular_movies(limit: int = 20) -> List[Dict[str, Any]]:
    try:
        url = f"{BASE_URL}/movie/popular?api_key={TMDB_API_KEY}"
        res = requests.get(url, timeout=6)
        if res.status_code == 200:
            results = res.json().get("results", [])
            if results:
                return [_format_item(i, default_type="movie") for i in results[:limit]]
    except Exception as e:
        print(f"[TMDB ERROR] get_popular_movies ({e}), falling back to local DB")
    return _get_local_fallback_movies(limit=limit, media_type="movie")

def get_popular_series(limit: int = 20) -> List[Dict[str, Any]]:
    try:
        url = f"{BASE_URL}/tv/popular?api_key={TMDB_API_KEY}"
        res = requests.get(url, timeout=6)
        if res.status_code == 200:
            results = res.json().get("results", [])
            if results:
                return [_format_item(i, default_type="series") for i in results[:limit]]
    except Exception as e:
        print(f"[TMDB ERROR] get_popular_series ({e}), falling back to local DB")
    return _get_local_fallback_movies(limit=limit, media_type="series")

def get_top_rated(limit: int = 20) -> List[Dict[str, Any]]:
    try:
        url = f"{BASE_URL}/movie/top_rated?api_key={TMDB_API_KEY}"
        res = requests.get(url, timeout=6)
        if res.status_code == 200:
            results = res.json().get("results", [])
            if results:
                return [_format_item(i, default_type="movie") for i in results[:limit]]
    except Exception as e:
        print(f"[TMDB ERROR] get_top_rated ({e}), falling back to local DB")
    return _get_local_fallback_movies(limit=limit)

def get_action_movies(limit: int = 20) -> List[Dict[str, Any]]:
    try:
        url = f"{BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&with_genres=28&sort_by=popularity.desc"
        res = requests.get(url, timeout=6)
        if res.status_code == 200:
            results = res.json().get("results", [])
            if results:
                return [_format_item(i, default_type="movie") for i in results[:limit]]
    except Exception as e:
        print(f"[TMDB ERROR] get_action_movies ({e}), falling back to local DB")
    return _get_local_fallback_movies(limit=limit, genre_slug="action")

def get_scifi_movies(limit: int = 20) -> List[Dict[str, Any]]:
    try:
        url = f"{BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&with_genres=878&sort_by=popularity.desc"
        res = requests.get(url, timeout=6)
        if res.status_code == 200:
            results = res.json().get("results", [])
            if results:
                return [_format_item(i, default_type="movie") for i in results[:limit]]
    except Exception as e:
        print(f"[TMDB ERROR] get_scifi_movies ({e}), falling back to local DB")
    return _get_local_fallback_movies(limit=limit, genre_slug="sci-fi")

def get_anime_series(limit: int = 20) -> List[Dict[str, Any]]:
    """Fetch dedicated anime series including top anime titles like Solo Leveling, Attack on Titan, Naruto, etc."""
    items = []
    try:
        famous_anime = ["Solo Leveling", "Attack on Titan", "Naruto", "Jujutsu Kaisen", "Demon Slayer", "One Piece", "Death Note", "Chainsaw Man", "Bleach"]
        for query in famous_anime[:5]:
            search_url = f"{BASE_URL}/search/tv?api_key={TMDB_API_KEY}&query={query}"
            res = requests.get(search_url, timeout=4)
            if res.status_code == 200:
                res_list = res.json().get("results", [])
                if res_list:
                    formatted = _format_item(res_list[0], default_type="series")
                    if not any(g.get("name") == "Animation" for g in formatted["genres"]):
                        formatted["genres"].insert(0, {"id": 7, "name": "Animation", "slug": "animation"})
                    items.append(formatted)

        discover_url = f"{BASE_URL}/discover/tv?api_key={TMDB_API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc"
        res2 = requests.get(discover_url, timeout=6)
        if res2.status_code == 200:
            for item in res2.json().get("results", []):
                formatted = _format_item(item, default_type="series")
                if not any(it["id"] == formatted["id"] for it in items):
                    items.append(formatted)

        if items:
            return items[:limit]
    except Exception as e:
        print(f"[TMDB ERROR] get_anime_series ({e}), falling back to local anime")
    
    local_anime = _get_local_fallback_movies(limit=limit, genre_slug="anime")
    return local_anime if local_anime else _get_local_fallback_movies(limit=limit)

def search_tmdb(query: str, media_type: Optional[str] = None, limit: int = 30) -> List[Dict[str, Any]]:
    try:
        url = f"{BASE_URL}/search/multi?api_key={TMDB_API_KEY}&query={requests.utils.quote(query)}&include_adult=false"
        res = requests.get(url, timeout=6)
        if res.status_code == 200:
            results = res.json().get("results", [])
            formatted_list = []
            for r in results:
                m_type = r.get("media_type")
                if m_type in ["movie", "tv"]:
                    if media_type and media_type != "all":
                        target_type = "series" if media_type == "series" else "movie"
                        curr_type = "series" if m_type == "tv" else "movie"
                        if curr_type != target_type:
                            continue
                    formatted_list.append(_format_item(r, default_type="movie" if m_type == "movie" else "series"))
            if formatted_list:
                return formatted_list[:limit]
    except Exception as e:
        print(f"[TMDB ERROR] search_tmdb for '{query}' failed: {e}")
    return []

def get_media_details(media_id: int, media_type: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Try fetching details as movie first, then TV if 404, with videos & credits appended."""
    try:
        types_to_try = [media_type] if media_type in ["movie", "tv", "series"] else ["movie", "tv"]
        for m_type in types_to_try:
            endpoint = "tv" if m_type in ["tv", "series"] else "movie"
            url = f"{BASE_URL}/{endpoint}/{media_id}?api_key={TMDB_API_KEY}&append_to_response=credits,videos,similar"
            res = requests.get(url, timeout=6)
            if res.status_code == 200:
                data = res.json()
                data["media_type"] = "series" if endpoint == "tv" else "movie"
                return _format_item(data, default_type=data["media_type"])
    except Exception as e:
        print(f"[TMDB ERROR] get_media_details: {e}")
    return None

def get_similar_media(media_id: int, media_type: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    try:
        endpoint = "tv" if media_type in ["tv", "series"] else "movie"
        url = f"{BASE_URL}/{endpoint}/{media_id}/similar?api_key={TMDB_API_KEY}"
        res = requests.get(url, timeout=6)
        if res.status_code == 200:
            results = res.json().get("results", [])
            return [_format_item(i, default_type=endpoint) for i in results[:limit]]
    except Exception as e:
        print(f"[TMDB ERROR] get_similar_media: {e}")
    return []
