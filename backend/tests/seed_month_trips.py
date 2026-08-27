"""Seed/cleanup helper: creates TEST_ trips in future months to exercise MonthCarousel arrows."""
import os
import sys
import requests
from dotenv import dotenv_values

BASE = (os.environ.get("REACT_APP_BACKEND_URL") or dotenv_values("/app/frontend/.env")["REACT_APP_BACKEND_URL"]).rstrip("/")
EMAIL = "admin@viajes.mx"
PASSWORD = "Aventura2026!"

MONTHS = [("2026-12-05", "2026-12-10"), ("2027-01-10", "2027-01-15"),
          ("2027-02-08", "2027-02-13"), ("2027-03-12", "2027-03-17")]


def client():
    s = requests.Session()
    r = s.post(f"{BASE}/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
    assert r.status_code == 200, (r.status_code, r.text[:300])
    return s


def create():
    s = client()
    ids = []
    for start, end in MONTHS:
        payload = {
            "title": f"TEST_Viaje {start[:7]}", "destination": "TEST Destino", "country": "México",
            "description": "TEST seed trip", "duration_days": 5, "start_date": start, "end_date": end,
            "price": 9999, "cover_image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        }
        r = s.post(f"{BASE}/api/admin/trips", json=payload)
        assert r.status_code in (200, 201), (r.status_code, r.text[:300])
        ids.append(r.json()["id"])
    print("\n".join(ids))


def cleanup():
    s = client()
    trips = s.get(f"{BASE}/api/trips").json()
    for t in trips:
        if t["title"].startswith("TEST_"):
            r = s.delete(f"{BASE}/api/admin/trips/{t['id']}")
            print("deleted", t["id"], r.status_code)


if __name__ == "__main__":
    (create if sys.argv[1] == "create" else cleanup)()
