import sys
import os

backend_path = os.path.dirname(__file__)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("[TEST] 1. Testing Health Endpoint...")
    res = client.get("/api/health")
    assert res.status_code == 200
    print("   -> OK: Health check passed")

    print("[TEST] 2. Testing Movie Catalog...")
    res = client.get("/api/movies")
    assert res.status_code == 200
    movies = res.json()
    assert len(movies) >= 20
    print(f"   -> OK: Found {len(movies)} movies in catalog")

    print("[TEST] 3. Testing Genres Endpoint...")
    res = client.get("/api/genres")
    assert res.status_code == 200
    genres = res.json()
    assert len(genres) >= 8
    print(f"   -> OK: Found {len(genres)} genres")

    print("[TEST] 4. Testing Search Query...")
    res = client.get("/api/search?q=Horizon")
    assert res.status_code == 200
    search_results = res.json()
    assert len(search_results) >= 1
    print(f"   -> OK: Search returned {len(search_results)} match(es)")

    print("[TEST] 5. Testing Demo User Login...")
    res = client.post("/api/auth/login", json={"email": "user@cineverse.com", "password": "User@12345"})
    assert res.status_code == 200
    user_token = res.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    print("   -> OK: User login successful")

    print("[TEST] 6. Testing Watchlist Retrieval...")
    res = client.get("/api/watchlist", headers=user_headers)
    assert res.status_code == 200
    print(f"   -> OK: User watchlist contains {len(res.json())} item(s)")

    print("[TEST] 7. Testing Watch History Sync...")
    sample_movie_id = movies[0]["id"]
    res = client.post("/api/history", headers=user_headers, json={
        "movie_id": sample_movie_id,
        "progress": 300.0,
        "duration": 7200.0
    })
    assert res.status_code == 200
    print("   -> OK: Watch history progress saved")

    print("[TEST] 8. Testing Admin Login & Dashboard Stats...")
    res = client.post("/api/auth/login", json={"email": "admin@cineverse.com", "password": "Admin@12345"})
    assert res.status_code == 200
    admin_token = res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    res = client.get("/api/admin/stats", headers=admin_headers)
    assert res.status_code == 200
    stats = res.json()
    print(f"   -> OK: Admin stats verified: {stats}")

    print("\n[ALL TESTS PASSED SUCCESSFULLY! 100% FUNCTIONAL]")

if __name__ == "__main__":
    run_tests()
