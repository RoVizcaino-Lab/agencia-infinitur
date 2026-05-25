"""Iteration 3 tests: FAQ CRUD, image upload, file serve, seed counts."""
import io
import os
import struct
import zlib

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://grupos-expedicion.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@viajes.mx")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Aventura2026!")


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200
    return r.json()["token"]


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


def make_png_bytes() -> bytes:
    """Build minimal 1x1 red PNG without Pillow."""
    sig = b"\x89PNG\r\n\x1a\n"

    def chunk(typ: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(typ + data) & 0xffffffff
        return struct.pack(">I", len(data)) + typ + data + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)  # 1x1, 8bpp, RGB
    raw = b"\x00\xff\x00\x00"  # filter + 1 red pixel
    idat = zlib.compress(raw)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


# --- Seed regression ---
class TestSeedCounts:
    def test_trips_count_ge_9(self):
        trips = requests.get(f"{BASE_URL}/api/trips", timeout=15).json()
        assert len(trips) >= 9, f"expected >=9 trips, got {len(trips)}"

    def test_gallery_count_ge_12(self):
        g = requests.get(f"{BASE_URL}/api/gallery", timeout=15).json()
        assert len(g) >= 12, f"expected >=12 gallery photos, got {len(g)}"


# --- FAQ ---
class TestFAQ:
    def test_public_faq_returns_8(self):
        r = requests.get(f"{BASE_URL}/api/faq", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 8
        # ordered
        orders = [i["order"] for i in items]
        assert orders == sorted(orders)
        assert all("question" in i and "answer" in i and "id" in i for i in items)

    def test_admin_faq_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/admin/faq",
                          json={"question": "x", "answer": "y", "order": 99}, timeout=15)
        assert r.status_code == 401
        r2 = requests.delete(f"{BASE_URL}/api/admin/faq/nonexistent", timeout=15)
        assert r2.status_code == 401

    def test_faq_crud(self, auth_headers):
        payload = {"question": "TEST_Q?", "answer": "TEST_A.", "order": 999}
        r = requests.post(f"{BASE_URL}/api/admin/faq", headers=auth_headers, json=payload, timeout=15)
        assert r.status_code == 200, r.text
        fid = r.json()["id"]
        assert r.json()["question"] == "TEST_Q?"

        # Update
        upd = {"question": "TEST_Q_UPD?", "answer": "TEST_A_UPD.", "order": 999}
        u = requests.put(f"{BASE_URL}/api/admin/faq/{fid}", headers=auth_headers, json=upd, timeout=15)
        assert u.status_code == 200
        assert u.json()["question"] == "TEST_Q_UPD?"

        # Verify via public list
        all_items = requests.get(f"{BASE_URL}/api/faq", timeout=15).json()
        match = [i for i in all_items if i["id"] == fid]
        assert match and match[0]["answer"] == "TEST_A_UPD."

        # Delete
        d = requests.delete(f"{BASE_URL}/api/admin/faq/{fid}", headers=auth_headers, timeout=15)
        assert d.status_code == 200
        all_items2 = requests.get(f"{BASE_URL}/api/faq", timeout=15).json()
        assert not any(i["id"] == fid for i in all_items2)


# --- Upload & file serving ---
class TestUpload:
    def test_upload_requires_auth(self):
        files = {"file": ("a.png", b"\x89PNG\r\n", "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, timeout=20)
        assert r.status_code == 401

    def test_upload_rejects_non_image(self, auth_headers):
        files = {"file": ("malicious.exe", b"MZ\x90\x00", "application/octet-stream")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", headers=auth_headers, files=files, timeout=20)
        assert r.status_code == 400
        assert "Formato" in r.text or "permitido" in r.text

    def test_upload_image_and_serve(self, auth_headers):
        png = make_png_bytes()
        files = {"file": ("TEST_pixel.png", png, "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", headers=auth_headers, files=files, timeout=60)
        if r.status_code == 500 and "Storage" in r.text:
            pytest.skip("Storage not initialised (EMERGENT_LLM_KEY missing) — skipping upload roundtrip")
        assert r.status_code == 200, r.text
        body = r.json()
        assert "id" in body and "url" in body
        assert body["url"].startswith("/api/files/")
        file_id = body["id"]

        # Fetch
        g = requests.get(f"{BASE_URL}/api/files/{file_id}", timeout=30)
        assert g.status_code == 200
        assert g.headers.get("Content-Type", "").startswith("image/")
        assert len(g.content) > 0

    def test_upload_too_large(self, auth_headers):
        # 9 MB of zeros with .png extension
        big = b"\x00" * (9 * 1024 * 1024)
        files = {"file": ("TEST_big.png", big, "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", headers=auth_headers, files=files, timeout=60)
        # 400 expected; some proxies may surface 413
        assert r.status_code in (400, 413), f"unexpected {r.status_code}: {r.text[:200]}"

    def test_serve_404(self):
        r = requests.get(f"{BASE_URL}/api/files/does-not-exist", timeout=15)
        assert r.status_code == 404
