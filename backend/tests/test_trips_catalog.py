"""Trips catalog tests: taxonomy migration, region, spots_left, admin CRUD."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://grupos-expedicion.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

NEW_TYPES = {"Clásico", "Explora", "Mochilero", "Infinitur 90°", "4 Elementos", "Altruismo", "Confort", "A la Carta"}
LEGACY = {"Aventura", "Bienestar", "Alturismo"}


@pytest.fixture(scope="module")
def trips():
    r = requests.get(f"{API}/trips", timeout=15)
    assert r.status_code == 200
    return r.json()


def test_trips_count_and_taxonomy(trips):
    assert len(trips) == 9, f"expected 9 trips, got {len(trips)}"
    for t in trips:
        assert t.get("trip_type") not in LEGACY, f"legacy type still present: {t.get('trip_type')}"
        assert t.get("trip_type") in NEW_TYPES, f"unknown type: {t.get('trip_type')}"
        assert t.get("region") in {"Nacional", "Internacional"}, f"bad region: {t.get('region')}"
        assert "spots_left" in t
        assert "_id" not in t


def test_trips_have_cover_images_reachable(trips):
    broken = []
    for t in trips:
        img = t.get("cover_image") or ""
        if img.startswith("http"):
            try:
                h = requests.head(img, timeout=10, allow_redirects=True)
                if h.status_code >= 400:
                    broken.append((t["title"], img, h.status_code))
            except Exception as e:
                broken.append((t["title"], img, str(e)))
    assert not broken, f"broken images: {broken}"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": "admin@viajes.mx", "password": "Aventura2026!"}, timeout=15)
    if r.status_code != 200:
        pytest.skip(f"admin login failed: {r.status_code} {r.text[:200]}")
    tok = r.json().get("access_token") or r.json().get("token")
    assert tok, f"no token in response: {r.json()}"
    return tok


def test_admin_create_soldout_and_delete(admin_token, trips):
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "title": "TEST_SinCupo_Playtest",
        "slug": "test-sincupo-playtest",
        "description": "Prueba automatizada de sin cupo",
        "trip_type": "Clásico",
        "region": "Nacional",
        "destination": "Prueba, México",
        "country": "México",
        "duration_days": 5,
        "start_date": "2026-12-01",
        "end_date": "2026-12-05",
        "price": 9999,
        "currency": "MXN",
        "spots_total": 10,
        "spots_left": 0,
        "cover_image": trips[0].get("cover_image", ""),
        "places": ["Prueba"],
        "highlights": ["Test"],
        "itinerary": [],
        "included": [],
        "not_included": [],
    }
    r = requests.post(f"{API}/admin/trips", json=payload, headers=headers, timeout=15)
    assert r.status_code in (200, 201), f"create failed: {r.status_code} {r.text[:300]}"
    created = r.json()
    tid = created.get("id") or created.get("_id")
    assert tid
    try:
        # verify persisted spots_left=0 & trip_type
        g = requests.get(f"{API}/trips/{tid}", timeout=15)
        assert g.status_code == 200
        got = g.json()
        assert got.get("spots_left") == 0
        assert got.get("trip_type") == "Clásico"
        assert got.get("region") == "Nacional"
    finally:
        d = requests.delete(f"{API}/admin/trips/{tid}", headers=headers, timeout=15)
        assert d.status_code in (200, 204), f"delete failed: {d.status_code} {d.text[:200]}"

    # ensure count back to 9
    final = requests.get(f"{API}/trips", timeout=15).json()
    assert len(final) == 9
