# 🎬 CINEVERSE — 100% Free Full-Stack Streaming Platform

CineVerse is a modern, high-performance, original streaming web application built with **React**, **Tailwind CSS**, **FastAPI**, and **SQLAlchemy**. It delivers an immersive, dark cinematic streaming experience with ₹0 development and operational cost using genuinely free and open-source technologies.

---

## 🌟 Key Features

- 🌌 **Original Cinematic Aesthetic**: Custom glowing neon and purple accents, glassmorphic blurred navigation bars, fluid micro-animations, and rich responsive movie cards.
- 🎬 **Extensive Content Catalog**: Movies, TV series, genres, cast information, director metadata, and ratings.
- 🔍 **Real-Time Live Search**: Instant debounced search querying titles, synopses, directors, and genres.
- 🎥 **HTML5 Cinema Video Player**:
  - Keyboard shortcuts (`Space` to play/pause, `←`/`→` to skip 10s, `M` to mute, `F` for fullscreen, `↑`/`↓` for volume).
  - Playback speed selection (`0.5x` to `2.0x`).
  - Automatic watch progress synchronization to backend history every 10s.
  - Resume watching from previous position.
- 🔐 **Authentication & Security**:
  - Secure bcrypt password hashing.
  - JWT (JSON Web Tokens) session authentication.
  - Role-based access control (User vs. Admin).
  - 1-Click quick login buttons for demo accounts.
- ⭐ **Personal Watchlist & History**:
  - Add/remove titles to personal list.
  - "Continue Watching" row on homepage.
  - Watch history management with progress timestamps and clear-all option.
- 🛡️ **Full Admin Dashboard**:
  - Real-time platform statistics (Users, Movies, Series, Stream sessions).
  - Complete catalog CRUD (Add new title with custom video stream URL, edit metadata, delete).
  - User directory with administrator promotion/demotion privileges.
- 🆓 **100% Free & Legal**:
  - Zero paid dependencies, zero paid APIs.
  - Public domain and Creative Commons video demonstration streams (Blender Open Projects: Sintel, Big Buck Bunny, Tears of Steel).
  - Local database storage (PostgreSQL ready + instant SQLite local zero-config fallback).

---

## 🏗️ Project Structure

```
CineVerse/
├── frontend/                     # React + Vite + Tailwind CSS Frontend
│   ├── public/                   # Public assets and original SVG logo
│   ├── src/
│   │   ├── components/           # Navbar, Footer, HeroBanner, MovieCard, VideoPlayer, Modal, etc.
│   │   ├── context/              # AuthContext, ToastContext
│   │   ├── layouts/              # MainLayout wrapper
│   │   ├── pages/                # Home, Movies, Series, Genres, Search, Watch, Auth, Admin
│   │   ├── services/             # Axios API client with JWT interceptor
│   │   ├── App.jsx               # React Router routes
│   │   ├── index.css             # Tailwind styling & glassmorphism
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # FastAPI Python Backend
│   ├── app/
│   │   ├── database/             # SQLAlchemy connection & session handling
│   │   ├── models/               # User, Movie, Genre, MovieCast, Watchlist, WatchHistory
│   │   ├── routes/               # Auth, Movies, Genres, Search, Watchlist, History, Users, Admin
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── utils/                # Password hashing, JWT token creation, auth dependencies
│   │   └── main.py               # FastAPI entrypoint & CORS
│   ├── requirements.txt
│   └── .env.example
│
├── database/
│   └── seed.py                   # 25+ Movies, Series, Genres, Cast, and Demo accounts seeder
│
├── docker-compose.yml            # Optional local PostgreSQL container
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start Guide (₹0 Cost Setup)

### 1. Prerequisites
- **Python 3.10+** (Installed)
- **Node.js 18+** & **npm** (Installed)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd CineVerse/backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables (Default runs local zero-config SQLite `sqlite:///./cineverse.db`):
   ```bash
   copy .env.example .env
   ```
5. Seed the database with 25+ rich movies, series, cast, and test accounts:
   ```bash
   python ../database/seed.py
   ```
6. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *FastAPI Interactive API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)*

---

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd CineVerse/frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   copy .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser at **`http://localhost:5173`**.

---

## 🔑 Default Demo Accounts

The seed system creates pre-configured accounts for instant testing:

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@cineverse.com` | `Admin@12345` | Full Catalog CRUD, User Management, Admin Analytics |
| **Demo User** | `user@cineverse.com` | `User@12345` | Watchlist, Watch History, Custom Profile |

*(You can also use the 1-Click quick login buttons on the Sign In page).*

---

## 📡 REST API Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and receive JWT access token | No |
| `GET` | `/api/auth/me` | Get current user profile | Yes |
| `GET` | `/api/movies` | List movies & series with filters | No |
| `GET` | `/api/movies/featured` | Get featured hero items | No |
| `GET` | `/api/movies/trending` | Get trending titles | No |
| `GET` | `/api/movies/{id}` | Get single movie metadata & cast | Optional |
| `GET` | `/api/movies/{id}/similar` | Get recommended similar titles | No |
| `GET` | `/api/search` | Search titles, genres, directors | No |
| `GET` | `/api/genres` | List all available genres | No |
| `GET` | `/api/watchlist` | Get current user's saved watchlist | Yes |
| `POST` | `/api/watchlist/{id}` | Add title to watchlist | Yes |
| `DELETE` | `/api/watchlist/{id}` | Remove title from watchlist | Yes |
| `GET` | `/api/history` | Get playback history & progress | Yes |
| `POST` | `/api/history` | Record playback progress | Yes |
| `DELETE` | `/api/history/{id}` | Delete history item | Yes |
| `GET` | `/api/admin/stats` | View platform statistics | Admin |
| `GET` | `/api/admin/movies` | Admin movie catalog list | Admin |
| `POST` | `/api/admin/movies` | Add new movie or series | Admin |
| `PUT` | `/api/admin/movies/{id}` | Update movie metadata | Admin |
| `DELETE` | `/api/admin/movies/{id}` | Delete movie from catalog | Admin |
| `GET` | `/api/admin/users` | List all users | Admin |
| `PUT` | `/api/admin/users/{id}/role` | Promote/demote user role | Admin |

---

## 🚢 Optional PostgreSQL Setup

If you wish to use PostgreSQL locally instead of SQLite:
1. Start PostgreSQL (or run `docker compose up -d`).
2. Update `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/cineverse
   ```
3. Run `python database/seed.py`.

---

## 📄 License
Open source and free for educational and portfolio demonstration.
