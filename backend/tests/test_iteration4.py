"""Iteration 4: validate new Trip fields (trip_type, region, places, pricing_tiers, itinerary_pdf_url)
and that the _migrate_trip_fields backfill at startup populated legacy trips."""
import os
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://grupos-expedicion.preview.emergentagent.com").rstrip("/")

VALID_TYPES = {"Clásico", "Explora", "Aventura", "Bienestar", "Mochilero", "Confort", "Alturismo"}
VALID_REGIONS = {"Nacional", "Internacional"}


class TestTripFieldsMigration:
    def test_all_trips_have_new_fields_after_migration(self):
        r = requests.get(f"{BASE_URL}/api/trips", timeout=20)
        assert r.status_code == 200
        trips = r.json()
        assert len(trips) >= 1, "no trips seeded"
        for t in trips:
            # New fields must exist
            assert "trip_type" in t, f"trip {t.get('id')} missing trip_type"
            assert "region" in t, f"trip {t.get('id')} missing region"
            assert "places" in t and isinstance(t["places"], list)
            assert "pricing_tiers" in t and isinstance(t["pricing_tiers"], list)
            assert "itinerary_pdf_url" in t
            assert t["trip_type"] in VALID_TYPES, f"bad trip_type {t['trip_type']}"
            assert t["region"] in VALID_REGIONS, f"bad region {t['region']}"

    def test_region_matches_country(self):
        trips = requests.get(f"{BASE_URL}/api/trips", timeout=20).json()
        for t in trips:
            expected = "Nacional" if t["country"] == "México" else "Internacional"
            assert t["region"] == expected, f"trip {t['title']} region={t['region']} country={t['country']}"

    def test_pricing_tiers_backfilled(self):
        """Migration should produce 3 tiers from base price for legacy trips."""
        trips = requests.get(f"{BASE_URL}/api/trips", timeout=20).json()
        for t in trips:
            tiers = t["pricing_tiers"]
            assert len(tiers) >= 1, f"trip {t['title']} has no pricing tiers"
            for tier in tiers:
                assert "label" in tier and "price" in tier
                assert isinstance(tier["price"], (int, float))

    def test_get_single_trip_includes_new_fields(self):
        trips = requests.get(f"{BASE_URL}/api/trips", timeout=20).json()
        tid = trips[0]["id"]
        r = requests.get(f"{BASE_URL}/api/trips/{tid}", timeout=20)
        assert r.status_code == 200
        d = r.json()
        for field in ("trip_type", "region", "places", "pricing_tiers", "itinerary_pdf_url"):
            assert field in d


class TestReservationStillWorks:
    def test_post_reservation(self):
        trips = requests.get(f"{BASE_URL}/api/trips", timeout=20).json()
        payload = {
            "trip_id": trips[0]["id"],
            "name": "TEST_Iter4",
            "email": "iter4@test.com",
            "phone": "+5215512345678",
            "people": 2,
            "message": "TEST iter4 reservation",
        }
        r = requests.post(f"{BASE_URL}/api/reservations", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["trip_title"]
        assert d["status"] == "nuevo"


class TestLegacyRoutesFrontend:
    """These are frontend routes, but make sure backend /api/trips/:id is what TripDetail consumes."""
    def test_trip_detail_endpoint_shape(self):
        trips = requests.get(f"{BASE_URL}/api/trips", timeout=20).json()
        # Pick a trip with at least 1 pricing tier
        candidates = [t for t in trips if t.get("pricing_tiers")]
        assert candidates, "no trip has pricing_tiers"
        t = candidates[0]
        r = requests.get(f"{BASE_URL}/api/trips/{t['id']}", timeout=20)
        assert r.status_code == 200
        d = r.json()
        # Required by TripDetail page
        for f in ("title", "country", "region", "trip_type", "pricing_tiers", "itinerary", "included", "spots_left", "group_max"):
            assert f in d, f"missing {f}"
