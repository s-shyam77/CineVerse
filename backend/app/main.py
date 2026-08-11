import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from app.database.connection import Base, engine
from app.routes import (
    auth_router,
    movies_router,
    genres_router,
    search_router,
    watchlist_router,
    history_router,
    users_router,
    admin_router,
)

load_dotenv()

# Automatically create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CineVerse API",
    description="Backend REST API for CineVerse - Free Full-Stack Streaming Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Robust CORS Configuration: Allow all origins so any device, mobile IP, LAN, or cloud host works seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HTTPException handler
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Generic exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[UNHANDLED ERROR] {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Include Routers
app.include_router(auth_router)
app.include_router(movies_router)
app.include_router(genres_router)
app.include_router(search_router)
app.include_router(watchlist_router)
app.include_router(history_router)
app.include_router(users_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "name": "CineVerse Streaming Platform API",
        "status": "healthy",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "CineVerse API"}
