"""Iteration 5: PDF upload + itinerary_pdf_url on Trip."""
import os
import io
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
ADMIN_EMAIL = "admin@viajes.mx"
ADMIN_PASSWORD = "Aventura2026!"

MIN_PDF = b"%PDF-1.4\n%test pdf\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return s


# --- PDF upload ---
class TestPdfUpload:
    def test_upload_pdf_returns_id_and_url(self, admin_session):
        files = {"file": ("test.pdf", io.BytesIO(MIN_PDF), "application/pdf")}
        r = admin_session.post(f"{BASE_URL}/api/admin/upload", files=files)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and "url" in data
        assert data["url"] == f"/api/files/{data['id']}"
        # GET returns pdf content-type
        g = requests.get(f"{BASE_URL}{data['url']}")
        assert g.status_code == 200
        assert g.headers.get("content-type", "").startswith("application/pdf")
        assert g.content.startswith(b"%PDF")

    def test_upload_txt_rejected(self, admin_session):
        files = {"file": ("bad.txt", io.BytesIO(b"hello"), "text/plain")}
        r = admin_session.post(f"{BASE_URL}/api/admin/upload", files=files)
        assert r.status_code == 400

    def test_upload_image_still_works(self, admin_session):
        # 1x1 PNG
        png = bytes.fromhex(
            "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4"
            "890000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082"
        )
        files = {"file": ("t.png", io.BytesIO(png), "image/png")}
        r = admin_session.post(f"{BASE_URL}/api/admin/upload", files=files)
        assert r.status_code == 200
        assert r.json()["url"].startswith("/api/files/")

    def test_upload_requires_auth(self):
        files = {"file": ("test.pdf", io.BytesIO(MIN_PDF), "application/pdf")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files)
        assert r.status_code == 401


# --- itinerary_pdf_url field on Trip ---
class TestTripPdfField:
    @pytest.fixture
    def created_trip(self, admin_session):
        payload = {
            "title": f"TEST_PDF Trip {uuid.uuid4().hex[:6]}",
            "destination": "Test",
            "country": "México",
            "description": "test",
            "duration_days": 1,
            "start_date": "2026-06-01",
            "end_date": "2026-06-01",
            "price": 1000.0,
            "cover_image": "https://example.com/img.jpg",
            "itinerary_pdf_url": "/api/files/initial-pdf-id",
        }
        r = admin_session.post(f"{BASE_URL}/api/admin/trips", json=payload)
        assert r.status_code == 200, r.text
        trip = r.json()
        yield trip
        admin_session.delete(f"{BASE_URL}/api/admin/trips/{trip['id']}")

    def test_create_accepts_pdf_url(self, created_trip):
        assert created_trip["itinerary_pdf_url"] == "/api/files/initial-pdf-id"

    def test_get_returns_pdf_url(self, created_trip):
        r = requests.get(f"{BASE_URL}/api/trips/{created_trip['id']}")
        assert r.status_code == 200
        assert r.json()["itinerary_pdf_url"] == "/api/files/initial-pdf-id"

    def test_update_pdf_url(self, admin_session, created_trip):
        new_payload = {
            "title": created_trip["title"],
            "destination": created_trip["destination"],
            "country": created_trip["country"],
            "description": created_trip["description"],
            "duration_days": created_trip["duration_days"],
            "start_date": created_trip["start_date"],
            "end_date": created_trip["end_date"],
            "price": created_trip["price"],
            "cover_image": created_trip["cover_image"],
            "itinerary_pdf_url": "/api/files/updated-pdf-id",
        }
        r = admin_session.put(f"{BASE_URL}/api/admin/trips/{created_trip['id']}", json=new_payload)
        assert r.status_code == 200
        assert r.json()["itinerary_pdf_url"] == "/api/files/updated-pdf-id"
        # verify persisted
        g = requests.get(f"{BASE_URL}/api/trips/{created_trip['id']}")
        assert g.json()["itinerary_pdf_url"] == "/api/files/updated-pdf-id"

    def test_seed_trips_have_empty_pdf(self):
        r = requests.get(f"{BASE_URL}/api/trips")
        assert r.status_code == 200
        trips = r.json()
        for t in trips:
            assert "itinerary_pdf_url" in t
