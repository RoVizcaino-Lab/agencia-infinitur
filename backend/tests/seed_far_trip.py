"""Seed/cleanup helper: creates ONE TEST_ trip ~7 months out (2027-03-15) to exercise
MonthCarousel gap-filling ("Próximamente") + arrows. Usage: python seed_far_trip.py create|cleanup
"""
import os
import sys
import requests
from dotenv import dotenv_values

BASE = (os.environ.get("REACT_APP_BACKEND_URL") or dotenv_values("/app/frontend/.env")["REACT_APP_BACKEND_URL"]).rstrip("/")
EMAIL = "admin@viajes.mx"
PASSWORD = "Aventura2026!"


def client():
    s = requests.Session()
    r = s.post(f"{BASE}/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
    assert r.status_code == 200, (r.status_code, r.text[:300])
    return s


def create():
    s = client()
    payload = {
        "title": "TEST_Viaje Lejano 2027-03", "destination": "TEST Destino", "country": "México",
        "description": "TEST seed trip far future", "duration_days": 5,
        "start_date": "2027-03-15", "end_date": "2027-03-20", "price": 9999,
        "cover_image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    }
    r = s.post(f"{BASE}/api/admin/trips", json=payload)
    assert r.status_code in (200, 201), (r.status_code, r.text[:300])
    print("created", r.json()["id"])


def cleanup():
    s = client()
    trips = s.get(f"{BASE}/api/trips").json()
    for t in trips:
        if t["title"].startswith("TEST_"):
            r = s.delete(f"{BASE}/api/admin/trips/{t['id']}")
            print("deleted", t["id"], r.status_code)
    print("remaining", len(s.get(f"{BASE}/api/trips").json()))


if __name__ == "__main__":
    (create if sys.argv[1] == "create" else cleanup)()
