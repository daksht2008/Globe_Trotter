def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.get_json()["status"] == "healthy"


def _trip(client, auth, name="Europe Loop"):
    res = client.post("/api/trips", json={"name": name}, headers=auth)
    assert res.status_code == 201
    return res.get_json()["id"]


def _stop(client, auth, trip_id, city_id):
    res = client.post(f"/api/trips/{trip_id}/stops", json={"city_id": city_id}, headers=auth)
    assert res.status_code == 201
    return res.get_json()


def test_trip_nested_detail(client, auth, city_id, activity_id):
    trip_id = _trip(client, auth)
    stop = _stop(client, auth, trip_id, city_id)
    client.post(
        f"/api/stops/{stop['id']}/activities",
        json={"activity_id": activity_id, "time_slot": "morning"},
        headers=auth,
    )
    res = client.get(f"/api/trips/{trip_id}", headers=auth)
    body = res.get_json()
    assert res.status_code == 200
    assert body["name"] == "Europe Loop"
    assert len(body["stops"]) == 1
    assert body["stops"][0]["activities"][0]["activity_id"] == activity_id


def test_trip_update_and_delete(client, auth):
    trip_id = _trip(client, auth)
    res = client.put(f"/api/trips/{trip_id}", json={"name": "Updated"}, headers=auth)
    assert res.status_code == 200 and res.get_json()["name"] == "Updated"
    res = client.delete(f"/api/trips/{trip_id}", headers=auth)
    assert res.status_code in (200, 204)
    assert client.get(f"/api/trips/{trip_id}", headers=auth).status_code == 404


def test_stops_crud_reorder_reindex(client, auth, city_id):
    trip_id = _trip(client, auth)
    a = _stop(client, auth, trip_id, city_id)
    b = _stop(client, auth, trip_id, city_id)
    assert a["order_index"] == 0 and b["order_index"] == 1
    res = client.put(
        f"/api/trips/{trip_id}/stops/reorder",
        json={"stop_ids": [b["id"], a["id"]]},
        headers=auth,
    )
    ids = [s["id"] for s in res.get_json()]
    assert ids == [b["id"], a["id"]]
    client.delete(f"/api/stops/{b['id']}", headers=auth)
    remaining = client.get(f"/api/trips/{trip_id}/stops", headers=auth).get_json()
    assert len(remaining) == 1 and remaining[0]["order_index"] == 0


def test_invalid_city_and_foreign_trip(client, auth, city_id):
    trip_id = _trip(client, auth)
    assert client.post(
        f"/api/trips/{trip_id}/stops", json={"city_id": 99999}, headers=auth
    ).status_code == 404
    other = client.post("/api/auth/signup", json={
        "email": "other@test.com", "password": "secret12", "name": "Other",
    }).get_json()["token"]
    headers = {"Authorization": f"Bearer {other}"}
    assert client.get(f"/api/trips/{trip_id}", headers=headers).status_code == 404
    assert client.post(
        f"/api/trips/{trip_id}/stops", json={"city_id": city_id}, headers=headers
    ).status_code == 404


def test_activity_search_assign_duplicate(client, auth, city_id, activity_id):
    res = client.get(f"/api/activities?city_id={city_id}")
    assert res.status_code == 200 and isinstance(res.get_json(), list)
    trip_id = _trip(client, auth)
    stop = _stop(client, auth, trip_id, city_id)
    first = client.post(
        f"/api/stops/{stop['id']}/activities",
        json={"activity_id": activity_id},
        headers=auth,
    )
    assert first.status_code == 201
    dup = client.post(
        f"/api/stops/{stop['id']}/activities",
        json={"activity_id": activity_id},
        headers=auth,
    )
    assert dup.status_code == 409
    gone = client.delete(
        f"/api/stops/{stop['id']}/activities/{activity_id}", headers=auth
    )
    assert gone.status_code in (200, 204)


def test_cities_search(client):
    res = client.get("/api/cities")
    assert res.status_code == 200
    cities = res.get_json()
    assert isinstance(cities, list)
    assert len(cities) > 0


def test_city_detail(client, city_id):
    res = client.get(f"/api/cities/{city_id}")
    assert res.status_code == 200
    body = res.get_json()
    assert "name" in body
    assert "activities" in body

