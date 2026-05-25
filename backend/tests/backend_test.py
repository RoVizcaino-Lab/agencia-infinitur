"""Backend API tests for Senderos Auténticos travel agency."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://grupos-expedicion.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@viajes.mx")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Aventura2026!")


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("token"), "No token returned"
    assert data.get("role") == "admin"
    return data["token"]


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# --- Public endpoints ---
class TestPublic:
    def test_root(self):
        r = requests.get(f"{BASE_URL}/api/", timeout=15)
        assert r.status_code == 200

    def test_list_trips(self):
        r = requests.get(f"{BASE_URL}/api/trips", timeout=15)
        assert r.status_code == 200
        trips = r.json()
        assert isinstance(trips, list) and len(trips) >= 1
        assert "id" in trips[0] and "title" in trips[0]

    def test_filter_trips_by_country(self):
        r = requests.get(f"{BASE_URL}/api/trips?country=México", timeout=15)
        assert r.status_code == 200
        trips = r.json()
        assert all(t["country"] == "México" for t in trips)

    def test_get_trip_by_id(self):
        trips = requests.get(f"{BASE_URL}/api/trips", timeout=15).json()
        tid = trips[0]["id"]
        r = requests.get(f"{BASE_URL}/api/trips/{tid}", timeout=15)
        assert r.status_code == 200
        assert r.json()["id"] == tid

    def test_get_trip_404(self):
        r = requests.get(f"{BASE_URL}/api/trips/does-not-exist", timeout=15)
        assert r.status_code == 404

    def test_gallery(self):
        r = requests.get(f"{BASE_URL}/api/gallery", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_testimonials(self):
        r = requests.get(f"{BASE_URL}/api/testimonials", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_reservation_public(self):
        trips = requests.get(f"{BASE_URL}/api/trips", timeout=15).json()
        payload = {
            "trip_id": trips[0]["id"],
            "name": "TEST_Reserva",
            "email": "test_reserva@example.com",
            "phone": "+5215555555555",
            "people": 2,
            "message": "TEST reservation",
        }
        r = requests.post(f"{BASE_URL}/api/reservations", json=payload, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["trip_id"] == payload["trip_id"]
        assert d["status"] == "nuevo"
        assert d["trip_title"]


# --- Auth ---
class TestAuth:
    def test_bad_login(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_login_ok(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 20

    def test_me_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/auth/me", timeout=15)
        assert r.status_code == 401

    def test_me_with_bearer(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_admin_endpoints_require_auth(self):
        for path in ["/api/admin/trips", "/api/admin/reservations"]:
            r = requests.get(f"{BASE_URL}{path}", timeout=15)
            assert r.status_code == 401, f"{path} did not require auth"


# --- Admin CRUD ---
class TestAdminCRUD:
    def test_trip_crud(self, auth_headers):
        payload = {
            "title": "TEST_Viaje",
            "destination": "TEST",
            "country": "México",
            "description": "TEST",
            "duration_days": 2,
            "start_date": "2026-09-01",
            "end_date": "2026-09-02",
            "price": 1000,
            "cover_image": "https://example.com/x.jpg",
        }
        r = requests.post(f"{BASE_URL}/api/admin/trips", headers=auth_headers, json=payload, timeout=15)
        assert r.status_code == 200, r.text
        tid = r.json()["id"]
        # GET via public
        g = requests.get(f"{BASE_URL}/api/trips/{tid}", timeout=15)
        assert g.status_code == 200 and g.json()["title"] == "TEST_Viaje"
        # UPDATE
        payload["title"] = "TEST_Viaje_Updated"
        u = requests.put(f"{BASE_URL}/api/admin/trips/{tid}", headers=auth_headers, json=payload, timeout=15)
        assert u.status_code == 200 and u.json()["title"] == "TEST_Viaje_Updated"
        # DELETE
        d = requests.delete(f"{BASE_URL}/api/admin/trips/{tid}", headers=auth_headers, timeout=15)
        assert d.status_code == 200
        # Verify gone
        g2 = requests.get(f"{BASE_URL}/api/trips/{tid}", timeout=15)
        assert g2.status_code == 404

    def test_reservation_status_update(self, auth_headers):
        trips = requests.get(f"{BASE_URL}/api/trips", timeout=15).json()
        rv = requests.post(f"{BASE_URL}/api/reservations", json={
            "trip_id": trips[0]["id"], "name": "TEST_Status", "email": "t@t.com",
            "phone": "+52", "people": 1, "message": ""}, timeout=15).json()
        rid = rv["id"]
        u = requests.put(f"{BASE_URL}/api/admin/reservations/{rid}", headers=auth_headers,
                         json={"status": "contactado"}, timeout=15)
        assert u.status_code == 200
        all_res = requests.get(f"{BASE_URL}/api/admin/reservations", headers=auth_headers, timeout=15).json()
        match = [x for x in all_res if x["id"] == rid]
        assert match and match[0]["status"] == "contactado"
        requests.delete(f"{BASE_URL}/api/admin/reservations/{rid}", headers=auth_headers, timeout=15)

    def test_gallery_crud(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/admin/gallery", headers=auth_headers,
                          json={"url": "https://example.com/p.jpg", "caption": "TEST", "location": "TEST"}, timeout=15)
        assert r.status_code == 200
        pid = r.json()["id"]
        d = requests.delete(f"{BASE_URL}/api/admin/gallery/{pid}", headers=auth_headers, timeout=15)
        assert d.status_code == 200

    def test_testimonial_crud(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/admin/testimonials", headers=auth_headers,
                          json={"author": "TEST_Author", "location": "TEST", "text": "TEST text", "rating": 5}, timeout=15)
        assert r.status_code == 200
        tid = r.json()["id"]
        d = requests.delete(f"{BASE_URL}/api/admin/testimonials/{tid}", headers=auth_headers, timeout=15)
        assert d.status_code == 200
