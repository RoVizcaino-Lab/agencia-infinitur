"""FAQ category feature tests (bug fix verification)"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://grupos-expedicion.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@viajes.mx"
ADMIN_PASSWORD = "Aventura2026!"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return s


def test_faq_list_all():
    r = requests.get(f"{BASE_URL}/api/faq")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    # every item should have a category
    for it in data:
        assert "category" in it
        assert "_id" not in it


def test_faq_filter_reservar():
    r = requests.get(f"{BASE_URL}/api/faq", params={"category": "reservar"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 5
    assert all(x["category"] == "reservar" for x in data)


def test_faq_filter_politicas():
    r = requests.get(f"{BASE_URL}/api/faq", params={"category": "politicas"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 6
    assert all(x["category"] == "politicas" for x in data)


def test_faq_filter_unknown_returns_empty():
    r = requests.get(f"{BASE_URL}/api/faq", params={"category": "does_not_exist"})
    assert r.status_code == 200
    assert r.json() == []


def test_faq_admin_create_update_delete_with_category(session):
    # CREATE
    payload = {
        "question": "TEST_QA_pytest pregunta",
        "answer": "TEST_QA_pytest respuesta",
        "order": 99,
        "category": "reservar",
    }
    r = session.post(f"{BASE_URL}/api/admin/faq", json=payload)
    assert r.status_code == 200, r.text
    created = r.json()
    assert created["category"] == "reservar"
    fid = created["id"]

    # Verify GET filter includes it
    r = requests.get(f"{BASE_URL}/api/faq", params={"category": "reservar"})
    assert any(x["id"] == fid for x in r.json())

    # UPDATE - change category
    upd = dict(payload)
    upd["question"] = "TEST_QA_pytest updated"
    upd["category"] = "politicas"
    r = session.put(f"{BASE_URL}/api/admin/faq/{fid}", json=upd)
    assert r.status_code == 200
    assert r.json()["category"] == "politicas"
    assert r.json()["question"] == "TEST_QA_pytest updated"

    # verify moved to politicas
    r = requests.get(f"{BASE_URL}/api/faq", params={"category": "politicas"})
    assert any(x["id"] == fid for x in r.json())
    r = requests.get(f"{BASE_URL}/api/faq", params={"category": "reservar"})
    assert not any(x["id"] == fid for x in r.json())

    # DELETE
    r = session.delete(f"{BASE_URL}/api/admin/faq/{fid}")
    assert r.status_code == 200

    # Confirm gone
    r = requests.get(f"{BASE_URL}/api/faq")
    assert not any(x["id"] == fid for x in r.json())


def test_public_endpoints_healthy():
    for path in ["/api/trips", "/api/gallery", "/api/videos", "/api/testimonials"]:
        r = requests.get(f"{BASE_URL}{path}")
        assert r.status_code == 200, f"{path} -> {r.status_code}"
