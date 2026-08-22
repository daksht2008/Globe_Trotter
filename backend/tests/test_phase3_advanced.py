"""
Phase 3 - Advanced Features Test Suite
Tests: advanced filtering, custom activities, timeline, budget dual keys,
       share/revoke, city activity creation.
"""
import pytest


# ── helpers ─────────────────────────────────────────────────────────────────
def _signup(client, email="p3@test.com"):
    res = client.post("/api/auth/signup", json={
        "email": email, "password": "secret12", "name": "Phase3 Tester",
    })
    return res.get_json()["token"]


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


def _create_trip(client, headers, name="Phase3 Trip",
                 start="2026-09-01", end="2026-09-05"):
    return client.post("/api/trips", json={
        "name": name, "start_date": start, "end_date": end
    }, headers=headers)


def _add_stop(client, headers, trip_id, city_id):
    return client.post(f"/api/trips/{trip_id}/stops", json={
        "city_id": city_id
    }, headers=headers)


# ── 1. Advanced Activity Filtering ──────────────────────────────────────────
class TestAdvancedFiltering:
    def test_filter_by_category(self, client):
        res = client.get("/api/activities?category=Culture")
        assert res.status_code == 200
        data = res.get_json()
        assert isinstance(data, list)

    def test_filter_by_max_cost(self, client):
        res = client.get("/api/activities?max_cost=50")
        assert res.status_code == 200
        data = res.get_json()
        for a in data:
            assert a["cost_estimate"] <= 50

    def test_filter_by_min_cost(self, client):
        res = client.get("/api/activities?min_cost=10")
        assert res.status_code == 200
        data = res.get_json()
        for a in data:
            assert a["cost_estimate"] >= 10

    def test_filter_by_cost_range(self, client):
        res = client.get("/api/activities?min_cost=5&max_cost=100")
        assert res.status_code == 200
        data = res.get_json()
        for a in data:
            assert 5 <= a["cost_estimate"] <= 100

    def test_filter_by_max_duration(self, client):
        res = client.get("/api/activities?max_duration=3")
        assert res.status_code == 200
        data = res.get_json()
        for a in data:
            assert a["duration_hours"] <= 3

    def test_sort_by_cost_asc(self, client):
        res = client.get("/api/activities?sort_by=cost_asc")
        assert res.status_code == 200
        data = res.get_json()
        costs = [a["cost_estimate"] for a in data]
        assert costs == sorted(costs)

    def test_sort_by_cost_desc(self, client):
        res = client.get("/api/activities?sort_by=cost_desc")
        assert res.status_code == 200
        data = res.get_json()
        costs = [a["cost_estimate"] for a in data]
        assert costs == sorted(costs, reverse=True)

    def test_limit_parameter(self, client):
        res = client.get("/api/activities?limit=2")
        assert res.status_code == 200
        assert len(res.get_json()) <= 2

    def test_search_query(self, client):
        res = client.get("/api/activities?q=tour")
        assert res.status_code == 200


# ── 2. Custom Activity Creation ─────────────────────────────────────────────
class TestCustomActivities:
    def test_create_custom_activity_via_api(self, client, auth):
        res = client.post("/api/activities", json={
            "name": "Custom Kayaking",
            "category": "Adventure",
            "cost_estimate": 45.0,
            "duration_hours": 2.5,
            "description": "Kayaking through mangroves"
        }, headers=auth)
        assert res.status_code == 201
        data = res.get_json()
        assert data["name"] == "Custom Kayaking"
        assert data["category"] == "Adventure"
        assert data["cost_estimate"] == 45.0

    def test_create_activity_missing_name(self, client, auth):
        res = client.post("/api/activities", json={
            "category": "Adventure"
        }, headers=auth)
        assert res.status_code == 400

    def test_create_city_activity(self, client, city_id):
        res = client.post(f"/api/cities/{city_id}/activities", json={
            "name": "City Walking Tour",
            "category": "Culture",
            "cost_estimate": 15.0,
            "duration_hours": 3.0
        })
        assert res.status_code == 201
        data = res.get_json()
        assert data["city_id"] == city_id
        assert data["name"] == "City Walking Tour"

    def test_create_city_activity_invalid_city(self, client):
        res = client.post("/api/cities/99999/activities", json={
            "name": "Ghost Tour"
        })
        assert res.status_code == 404


# ── 3. Direct Activity Attachment (URL path style) ──────────────────────────
class TestActivityAttachment:
    def test_attach_activity_via_path(self, client, auth, city_id, activity_id):
        trip_res = _create_trip(client, _auth(_signup(client, "attach@test.com")))
        token2 = _signup(client, "attach2@test.com")
        # use the original auth user
        trip_res = _create_trip(client, auth)
        trip_id = trip_res.get_json()["id"]
        stop_res = _add_stop(client, auth, trip_id, city_id)
        stop_id = stop_res.get_json()["id"]

        # Attach via POST /api/stops/:stop_id/activities/:activity_id
        res = client.post(
            f"/api/stops/{stop_id}/activities/{activity_id}",
            json={},
            headers=auth
        )
        assert res.status_code == 201

    def test_attach_activity_via_body(self, client, auth, city_id, activity_id):
        trip_res = _create_trip(client, auth, name="Body Attach Trip")
        trip_id = trip_res.get_json()["id"]
        stop_res = _add_stop(client, auth, trip_id, city_id)
        stop_id = stop_res.get_json()["id"]

        # Attach via POST /api/stops/:stop_id/activities with body
        res = client.post(
            f"/api/stops/{stop_id}/activities",
            json={"activity_id": activity_id, "day_number": 1, "time_slot": "morning"},
            headers=auth
        )
        assert res.status_code == 201
        data = res.get_json()
        assert data["day_number"] == 1
        assert data["time_slot"] == "morning"


# ── 4. Enhanced Budget Response ─────────────────────────────────────────────
class TestBudgetDualKeys:
    def test_budget_has_frontend_keys(self, client, auth, city_id, activity_id):
        trip_res = _create_trip(client, auth, name="Budget Keys Trip")
        trip_id = trip_res.get_json()["id"]
        stop_res = _add_stop(client, auth, trip_id, city_id)
        stop_id = stop_res.get_json()["id"]

        # Add activity to stop
        client.post(f"/api/stops/{stop_id}/activities",
                     json={"activity_id": activity_id}, headers=auth)

        res = client.get(f"/api/trips/{trip_id}/budget", headers=auth)
        assert res.status_code == 200
        data = res.get_json()

        # Backend keys
        assert "total_cost" in data
        assert "by_stop" in data
        assert "by_category" in data
        assert "avg_per_day" in data
        assert "num_days" in data

        # Frontend keys
        assert "total_estimated_cost_usd" in data
        assert "stops_breakdown" in data
        assert "categories" in data
        assert "currency" in data

        # stops_breakdown items have activity_count
        for sb in data["stops_breakdown"]:
            assert "activity_count" in sb
            assert "cost_usd" in sb
            assert "city" in sb

    def test_budget_empty_trip(self, client, auth):
        trip_res = _create_trip(client, auth, name="Empty Budget Trip")
        trip_id = trip_res.get_json()["id"]
        res = client.get(f"/api/trips/{trip_id}/budget", headers=auth)
        assert res.status_code == 200
        data = res.get_json()
        assert data["total_cost"] == 0.0
        assert data["total_estimated_cost_usd"] == 0.0


# ── 5. Trip Timeline ────────────────────────────────────────────────────────
class TestTripTimeline:
    def test_timeline_structure(self, client, auth, city_id, activity_id):
        trip_res = _create_trip(client, auth, name="Timeline Trip",
                                start="2026-09-10", end="2026-09-12")
        trip_id = trip_res.get_json()["id"]
        stop_res = _add_stop(client, auth, trip_id, city_id)
        stop_id = stop_res.get_json()["id"]

        client.post(f"/api/stops/{stop_id}/activities",
                     json={"activity_id": activity_id, "day_number": 1,
                           "time_slot": "morning"},
                     headers=auth)

        res = client.get(f"/api/trips/{trip_id}/timeline", headers=auth)
        assert res.status_code == 200
        data = res.get_json()

        assert data["trip_id"] == trip_id
        assert data["num_days"] == 3  # Sep 10-12
        assert len(data["days"]) == 3

        day1 = data["days"][0]
        assert day1["day_number"] == 1
        assert day1["date"] == "2026-09-10"
        assert "slots" in day1
        assert "morning" in day1["slots"]
        assert "afternoon" in day1["slots"]
        assert "evening" in day1["slots"]
        assert day1["activity_count"] >= 1

    def test_timeline_unauthorized(self, client, auth):
        res = client.get("/api/trips/99999/timeline", headers=auth)
        assert res.status_code == 404


# ── 6. Share & Revoke ───────────────────────────────────────────────────────
class TestShareRevoke:
    def test_share_creates_token(self, client, auth):
        trip_res = _create_trip(client, auth, name="Share Trip")
        trip_id = trip_res.get_json()["id"]

        res = client.post(f"/api/trips/{trip_id}/share", headers=auth)
        assert res.status_code == 200
        data = res.get_json()
        assert "share_token" in data
        assert "share_url" in data
        assert "url" in data
        assert data["is_public"] is True

    def test_share_idempotent(self, client, auth):
        trip_res = _create_trip(client, auth, name="Idempotent Share Trip")
        trip_id = trip_res.get_json()["id"]

        r1 = client.post(f"/api/trips/{trip_id}/share", headers=auth)
        r2 = client.post(f"/api/trips/{trip_id}/share", headers=auth)
        assert r1.get_json()["share_token"] == r2.get_json()["share_token"]

    def test_public_view(self, client, auth):
        trip_res = _create_trip(client, auth, name="Public View Trip")
        trip_id = trip_res.get_json()["id"]

        share_res = client.post(f"/api/trips/{trip_id}/share", headers=auth)
        token = share_res.get_json()["share_token"]

        # Unauthenticated public access
        res = client.get(f"/api/share/{token}")
        assert res.status_code == 200
        data = res.get_json()
        assert data["name"] == "Public View Trip"

    def test_revoke_share(self, client, auth):
        trip_res = _create_trip(client, auth, name="Revoke Trip")
        trip_id = trip_res.get_json()["id"]

        client.post(f"/api/trips/{trip_id}/share", headers=auth)
        share_res = client.post(f"/api/trips/{trip_id}/share", headers=auth)
        token = share_res.get_json()["share_token"]

        # Revoke
        revoke_res = client.delete(f"/api/trips/{trip_id}/share", headers=auth)
        assert revoke_res.status_code == 200
        assert revoke_res.get_json()["is_public"] is False

        # Public view should now 404
        res = client.get(f"/api/share/{token}")
        assert res.status_code == 404

    def test_invalid_share_token(self, client):
        res = client.get("/api/share/nonexistent_token_abc")
        assert res.status_code == 404
