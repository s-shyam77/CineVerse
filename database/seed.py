import os
import sys
import datetime

# Add backend directory to path so models and database can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.database.connection import SessionLocal, engine, Base
from app.models.user import User
from app.models.genre import Genre
from app.models.movie import Movie
from app.models.cast import MovieCast
from app.models.watchlist import Watchlist
from app.models.history import WatchHistory
from app.utils.security import get_password_hash

# Reliable, legal, free public domain video links (Blender Open Projects & Test streams)
VIDEO_STREAM_1 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
VIDEO_STREAM_2 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
VIDEO_STREAM_3 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
VIDEO_STREAM_4 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
VIDEO_STREAM_5 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
VIDEO_STREAM_6 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
VIDEO_STREAM_7 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"

GENRES_DATA = [
    {"name": "Action", "slug": "action"},
    {"name": "Sci-Fi", "slug": "sci-fi"},
    {"name": "Drama", "slug": "drama"},
    {"name": "Thriller", "slug": "thriller"},
    {"name": "Adventure", "slug": "adventure"},
    {"name": "Fantasy", "slug": "fantasy"},
    {"name": "Animation", "slug": "animation"},
    {"name": "Comedy", "slug": "comedy"},
    {"name": "Mystery", "slug": "mystery"},
    {"name": "Crime", "slug": "crime"},
    {"name": "Superhero", "slug": "superhero"},
]

POPULAR_MEDIA_CATALOG = [
    # 1. Spider-Man: Into the Spider-Verse
    {
        "title": "Spider-Man: Into the Spider-Verse",
        "description": "Teen Miles Morales becomes the new Spider-Man and joins other Spider-Heroes from parallel dimensions to stop a threat to all reality.",
        "poster_url": "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_1,
        "release_year": 2018,
        "duration": "1h 57m",
        "rating": 8.7,
        "age_rating": "PG",
        "type": "movie",
        "director": "Bob Persichetti, Peter Ramsey",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Animation", "Action", "Adventure", "Sci-Fi", "Superhero"],
        "cast": [
            {"name": "Shameik Moore", "character": "Miles Morales / Spider-Man", "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"},
            {"name": "Jake Johnson", "character": "Peter B. Parker", "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop"},
            {"name": "Hailee Steinfeld", "character": "Gwen Stacy / Spider-Woman", "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 2. Spider-Man: No Way Home
    {
        "title": "Spider-Man: No Way Home",
        "description": "With Spider-Man's identity now revealed, Peter Parker asks Doctor Strange for help, but an errant spell tears open the multiverse, unleashing dangerous villains.",
        "poster_url": "https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_6,
        "release_year": 2021,
        "duration": "2h 28m",
        "rating": 8.3,
        "age_rating": "PG-13",
        "type": "movie",
        "director": "Jon Watts",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Action", "Adventure", "Sci-Fi", "Superhero"],
        "cast": [
            {"name": "Tom Holland", "character": "Peter Parker / Spider-Man", "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop"},
            {"name": "Zendaya", "character": "MJ", "image_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop"},
            {"name": "Benedict Cumberbatch", "character": "Doctor Stephen Strange", "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 3. The Dark Knight (Batman)
    {
        "title": "The Dark Knight (Batman)",
        "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        "poster_url": "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_5,
        "release_year": 2008,
        "duration": "2h 32m",
        "rating": 9.0,
        "age_rating": "PG-13",
        "type": "movie",
        "director": "Christopher Nolan",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Action", "Crime", "Drama", "Thriller", "Superhero"],
        "cast": [
            {"name": "Christian Bale", "character": "Bruce Wayne / Batman", "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop"},
            {"name": "Heath Ledger", "character": "Joker", "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"},
            {"name": "Gary Oldman", "character": "Jim Gordon", "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 4. Batman Begins
    {
        "title": "Batman Begins",
        "description": "After training with his mentor, Bruce Wayne inherits Gotham City and begins his crusade to free the crime-ridden city from the corruption of the League of Shadows.",
        "poster_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_3,
        "release_year": 2005,
        "duration": "2h 20m",
        "rating": 8.2,
        "age_rating": "PG-13",
        "type": "movie",
        "director": "Christopher Nolan",
        "is_featured": False,
        "is_trending": True,
        "genres": ["Action", "Crime", "Drama", "Superhero"],
        "cast": [
            {"name": "Christian Bale", "character": "Bruce Wayne / Batman", "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop"},
            {"name": "Michael Caine", "character": "Alfred Pennyworth", "image_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 5. Inception
    {
        "title": "Inception",
        "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.",
        "poster_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_6,
        "release_year": 2010,
        "duration": "2h 28m",
        "rating": 8.8,
        "age_rating": "PG-13",
        "type": "movie",
        "director": "Christopher Nolan",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Action", "Sci-Fi", "Adventure", "Thriller"],
        "cast": [
            {"name": "Leonardo DiCaprio", "character": "Dom Cobb", "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop"},
            {"name": "Joseph Gordon-Levitt", "character": "Arthur", "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop"},
            {"name": "Elliot Page", "character": "Ariadne", "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 6. Avengers: Endgame
    {
        "title": "Avengers: Endgame",
        "description": "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
        "poster_url": "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_4,
        "release_year": 2019,
        "duration": "3h 01m",
        "rating": 8.4,
        "age_rating": "PG-13",
        "type": "movie",
        "director": "Anthony Russo, Joe Russo",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Action", "Adventure", "Sci-Fi", "Drama", "Superhero"],
        "cast": [
            {"name": "Robert Downey Jr.", "character": "Tony Stark / Iron Man", "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"},
            {"name": "Chris Evans", "character": "Steve Rogers / Captain America", "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop"},
            {"name": "Scarlett Johansson", "character": "Natasha Romanoff / Black Widow", "image_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 7. Avengers: Infinity War
    {
        "title": "Avengers: Infinity War",
        "description": "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.",
        "poster_url": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_2,
        "release_year": 2018,
        "duration": "2h 29m",
        "rating": 8.4,
        "age_rating": "PG-13",
        "type": "movie",
        "director": "Anthony Russo, Joe Russo",
        "is_featured": False,
        "is_trending": True,
        "genres": ["Action", "Adventure", "Sci-Fi", "Superhero"],
        "cast": [
            {"name": "Robert Downey Jr.", "character": "Tony Stark / Iron Man", "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"},
            {"name": "Chris Hemsworth", "character": "Thor", "image_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 8. Interstellar
    {
        "title": "Interstellar",
        "description": "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
        "poster_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_7,
        "release_year": 2014,
        "duration": "2h 49m",
        "rating": 8.7,
        "age_rating": "PG-13",
        "type": "movie",
        "director": "Christopher Nolan",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Adventure", "Drama", "Sci-Fi"],
        "cast": [
            {"name": "Matthew McConaughey", "character": "Cooper", "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop"},
            {"name": "Anne Hathaway", "character": "Brand", "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"},
            {"name": "Jessica Chastain", "character": "Murph", "image_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 9. Stranger Things
    {
        "title": "Stranger Things",
        "description": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
        "poster_url": "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_1,
        "release_year": 2016,
        "duration": "4 Seasons",
        "rating": 8.7,
        "age_rating": "TV-14",
        "type": "series",
        "director": "The Duffer Brothers",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Drama", "Fantasy", "Horror", "Mystery", "Sci-Fi"],
        "cast": [
            {"name": "Millie Bobby Brown", "character": "Eleven", "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"},
            {"name": "Finn Wolfhard", "character": "Mike Wheeler", "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 10. Breaking Bad
    {
        "title": "Breaking Bad",
        "description": "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's future.",
        "poster_url": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_5,
        "release_year": 2008,
        "duration": "5 Seasons",
        "rating": 9.5,
        "age_rating": "TV-MA",
        "type": "series",
        "director": "Vince Gilligan",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Crime", "Drama", "Thriller"],
        "cast": [
            {"name": "Bryan Cranston", "character": "Walter White", "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"},
            {"name": "Aaron Paul", "character": "Jesse Pinkman", "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 11. Arcane
    {
        "title": "Arcane",
        "description": "Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions-and the power that will tear them apart.",
        "poster_url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_6,
        "release_year": 2021,
        "duration": "2 Seasons",
        "rating": 9.0,
        "age_rating": "TV-14",
        "type": "series",
        "director": "Pascal Charrue, Arnaud Delord",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Animation", "Action", "Adventure", "Fantasy", "Sci-Fi"],
        "cast": [
            {"name": "Hailee Steinfeld", "character": "Vi", "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"},
            {"name": "Ella Purnell", "character": "Jinx", "image_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 12. Cyberpunk: Edgerunners
    {
        "title": "Cyberpunk: Edgerunners",
        "description": "A street kid trying to survive in a technology and body modification-obsessed city of the future. Having everything to lose, he chooses to stay alive by becoming an edgerunner.",
        "poster_url": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_1,
        "release_year": 2022,
        "duration": "1 Season",
        "rating": 8.3,
        "age_rating": "TV-MA",
        "type": "series",
        "director": "Hiroyuki Imaishi",
        "is_featured": False,
        "is_trending": True,
        "genres": ["Animation", "Action", "Sci-Fi"],
        "cast": [
            {"name": "KENN", "character": "David Martinez", "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 13. Dune: Part Two
    {
        "title": "Dune: Part Two",
        "description": "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.",
        "poster_url": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_6,
        "release_year": 2024,
        "duration": "2h 46m",
        "rating": 8.6,
        "age_rating": "PG-13",
        "type": "movie",
        "director": "Denis Villeneuve",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Action", "Adventure", "Drama", "Sci-Fi"],
        "cast": [
            {"name": "Timothée Chalamet", "character": "Paul Atreides", "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop"},
            {"name": "Zendaya", "character": "Chani", "image_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 14. Oppenheimer
    {
        "title": "Oppenheimer",
        "description": "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
        "poster_url": "https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_3,
        "release_year": 2023,
        "duration": "3h 00m",
        "rating": 8.9,
        "age_rating": "R",
        "type": "movie",
        "director": "Christopher Nolan",
        "is_featured": False,
        "is_trending": True,
        "genres": ["Biography", "Drama", "History"],
        "cast": [
            {"name": "Cillian Murphy", "character": "J. Robert Oppenheimer", "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"},
            {"name": "Emily Blunt", "character": "Kitty Oppenheimer", "image_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 15. The Matrix
    {
        "title": "The Matrix",
        "description": "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
        "poster_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_6,
        "release_year": 1999,
        "duration": "2h 16m",
        "rating": 8.7,
        "age_rating": "R",
        "type": "movie",
        "director": "Lana Wachowski, Lilly Wachowski",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Action", "Sci-Fi"],
        "cast": [
            {"name": "Keanu Reeves", "character": "Neo", "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop"},
            {"name": "Laurence Fishburne", "character": "Morpheus", "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 16. John Wick: Chapter 4
    {
        "title": "John Wick: Chapter 4",
        "description": "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.",
        "poster_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_4,
        "release_year": 2023,
        "duration": "2h 49m",
        "rating": 7.7,
        "age_rating": "R",
        "type": "movie",
        "director": "Chad Stahelski",
        "is_featured": False,
        "is_trending": True,
        "genres": ["Action", "Crime", "Thriller"],
        "cast": [
            {"name": "Keanu Reeves", "character": "John Wick", "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop"},
            {"name": "Donnie Yen", "character": "Caine", "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 17. The Mandalorian
    {
        "title": "The Mandalorian",
        "description": "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
        "poster_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_2,
        "release_year": 2019,
        "duration": "3 Seasons",
        "rating": 8.7,
        "age_rating": "TV-14",
        "type": "series",
        "director": "Jon Favreau",
        "is_featured": False,
        "is_trending": True,
        "genres": ["Action", "Adventure", "Fantasy", "Sci-Fi"],
        "cast": [
            {"name": "Pedro Pascal", "character": "The Mandalorian / Din Djarin", "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 18. Quantum Horizon
    {
        "title": "Quantum Horizon",
        "description": "When an astrophysics team accidentally opens a singularity beneath an Antarctic research station, temporal anomalies begin rewriting humanity's history in real time.",
        "poster_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_6,
        "release_year": 2024,
        "duration": "2h 24m",
        "rating": 8.9,
        "age_rating": "PG-13",
        "type": "movie",
        "director": "Elena Vance",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Sci-Fi", "Action", "Thriller"],
        "cast": [
            {"name": "Marcus Vance", "character": "Dr. Ronald Hayes", "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"},
            {"name": "Sarah Lin", "character": "Commander Eva Reyes", "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 19. Neon Syndicate
    {
        "title": "Neon Syndicate",
        "description": "In a rain-slicked cyberpunk metropolis, a rogue cyber-detective uncovers a conspiracy tying synthetic consciousness implants to the city's ruling oligarchs.",
        "poster_url": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_1,
        "release_year": 2023,
        "duration": "4 Seasons",
        "rating": 9.1,
        "age_rating": "TV-MA",
        "type": "series",
        "director": "Kenji Takahashi",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Sci-Fi", "Crime", "Action"],
        "cast": [
            {"name": "Ren Tanaka", "character": "Jax Mercer", "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop"}
        ]
    },
    # 20. Game of Thrones
    {
        "title": "Game of Thrones",
        "description": "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
        "poster_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop",
        "video_url": VIDEO_STREAM_5,
        "release_year": 2011,
        "duration": "8 Seasons",
        "rating": 9.2,
        "age_rating": "TV-MA",
        "type": "series",
        "director": "David Benioff, D.B. Weiss",
        "is_featured": True,
        "is_trending": True,
        "genres": ["Action", "Adventure", "Drama", "Fantasy"],
        "cast": [
            {"name": "Emilia Clarke", "character": "Daenerys Targaryen", "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"},
            {"name": "Kit Harington", "character": "Jon Snow", "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"}
        ]
    }
]

def seed_database():
    print("[INFO] Initializing CineVerse Database Seeding...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Genres
        print("[INFO] Seeding Genres...")
        genre_map = {}
        for g_data in GENRES_DATA:
            existing_genre = db.query(Genre).filter(Genre.slug == g_data["slug"]).first()
            if not existing_genre:
                genre = Genre(name=g_data["name"], slug=g_data["slug"])
                db.add(genre)
                db.flush()
                genre_map[g_data["name"]] = genre
            else:
                genre_map[g_data["name"]] = existing_genre
        db.commit()

        # 2. Seed Users (Admin & Demo User)
        print("[INFO] Seeding Users...")
        admin_email = "admin@cineverse.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                name="CineVerse Admin",
                email=admin_email,
                password_hash=get_password_hash("Admin@12345"),
                avatar="avatar_1",
                role="admin"
            )
            db.add(admin)

        user_email = "user@cineverse.com"
        demo_user = db.query(User).filter(User.email == user_email).first()
        if not demo_user:
            demo_user = User(
                name="Alex Walker",
                email=user_email,
                password_hash=get_password_hash("User@12345"),
                avatar="avatar_2",
                role="user"
            )
            db.add(demo_user)
        db.commit()
        db.refresh(admin)
        db.refresh(demo_user)

        # 3. Seed Movies & Series
        print("[INFO] Seeding Movies, Series, and Cast...")
        created_movies = []
        for m_data in POPULAR_MEDIA_CATALOG:
            existing_movie = db.query(Movie).filter(Movie.title == m_data["title"]).first()
            if not existing_movie:
                movie = Movie(
                    title=m_data["title"],
                    description=m_data["description"],
                    poster_url=m_data["poster_url"],
                    backdrop_url=m_data["backdrop_url"],
                    video_url=m_data["video_url"],
                    release_year=m_data["release_year"],
                    duration=m_data["duration"],
                    rating=m_data["rating"],
                    age_rating=m_data["age_rating"],
                    type=m_data["type"],
                    director=m_data["director"],
                    is_featured=m_data["is_featured"],
                    is_trending=m_data["is_trending"]
                )

                # Link Genres
                for g_name in m_data.get("genres", []):
                    if g_name in genre_map:
                        movie.genres.append(genre_map[g_name])

                db.add(movie)
                db.flush()

                # Add Cast
                for c_data in m_data.get("cast", []):
                    cast_member = MovieCast(
                        movie_id=movie.id,
                        name=c_data["name"],
                        character=c_data.get("character"),
                        image_url=c_data.get("image_url")
                    )
                    db.add(cast_member)

                created_movies.append(movie)
            else:
                created_movies.append(existing_movie)

        db.commit()

        # 4. Seed Watchlist & History for Demo User
        print("[INFO] Seeding Initial Watchlist & Watch History...")
        if created_movies and demo_user:
            sample_watchlist_ids = [m.id for m in created_movies[:4]]
            for m_id in sample_watchlist_ids:
                if not db.query(Watchlist).filter(Watchlist.user_id == demo_user.id, Watchlist.movie_id == m_id).first():
                    db.add(Watchlist(user_id=demo_user.id, movie_id=m_id))

            if len(created_movies) >= 2:
                if not db.query(WatchHistory).filter(WatchHistory.user_id == demo_user.id, WatchHistory.movie_id == created_movies[0].id).first():
                    db.add(WatchHistory(
                        user_id=demo_user.id,
                        movie_id=created_movies[0].id,
                        progress=1250.0,
                        duration=7020.0,
                        last_watched=datetime.datetime.now(datetime.timezone.utc)
                    ))

                if not db.query(WatchHistory).filter(WatchHistory.user_id == demo_user.id, WatchHistory.movie_id == created_movies[1].id).first():
                    db.add(WatchHistory(
                        user_id=demo_user.id,
                        movie_id=created_movies[1].id,
                        progress=2400.0,
                        duration=8880.0,
                        last_watched=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=3)
                    ))

        db.commit()
        print(f"[SUCCESS] CineVerse Database Populated with {len(POPULAR_MEDIA_CATALOG)} Top Blockbusters and Series!")

    except Exception as e:
        print(f"[ERROR] Error during database seeding: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
