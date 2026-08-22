import pytest
import json
from app import create_app
from app.models import db, User, Trip, City, Stop, Activity, StopActivity

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.app_context():
        db.create_all()
        # Seed a test city and activity
        c = City(name="Tokyo", country="Japan", region="Asia", cost_index=1.3, popularity=95)
        db.session.add(c)
        db.session.commit()
        act = Activity(name="Shibuya Crossing", category="Sightseeing", cost_estimate=0, city_id=c.id)
        db.session.add(act)
        db.session.commit()
        yield app.test_client()
        db.drop_all()

def test_auth_and_password_hashing(client):
    # 1. Signup
    res = client.post('/api/auth/signup', json={
        "email": "daksh@example.com",
        "password": "securepassword123",
        "name": "Daksh Thakkar"
    })
    assert res.status_code == 201
    data = res.get_json()
    assert "token" in data
    assert data["user"]["email"] == "daksh@example.com"

    # Verify Password Hashing in DB (never plaintext)
    user = User.query.filter_by(email="daksh@example.com").first()
    assert user is not None
    assert user.password_hash != "securepassword123"
    assert user.password_hash.startswith(("scrypt:", "pbkdf2:"))

    # 2. Duplicate email check
    res_dup = client.post('/api/auth/signup', json={
        "email": "daksh@example.com",
        "password": "password456",
        "name": "Daksh Duplicate"
    })
    assert res_dup.status_code == 409

    # 3. Invalid inputs
    res_short = client.post('/api/auth/signup', json={
        "email": "short@example.com",
        "password": "123", # too short
        "name": "Short"
    })
    assert res_short.status_code == 400

    # 4. Login correct
    res_login = client.post('/api/auth/login', json={
        "email": "daksh@example.com",
        "password": "securepassword123"
    })
    assert res_login.status_code == 200
    token = res_login.get_json()["token"]

    # 5. Login wrong password
    res_wrong = client.post('/api/auth/login', json={
        "email": "daksh@example.com",
        "password": "wrongpassword"
    })
    assert res_wrong.status_code == 401

    # 6. /me endpoint
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get('/api/auth/me', headers=headers)
    assert res_me.status_code == 200
    assert res_me.get_json()["user"]["name"] == "Daksh Thakkar"

def test_trips_stops_cascade_and_isolation(client):
    # Register User 1
    res1 = client.post('/api/auth/signup', json={
        "email": "user1@example.com",
        "password": "password123",
        "name": "User One"
    })
    token1 = res1.get_json()["token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # Register User 2
    res2 = client.post('/api/auth/signup', json={
        "email": "user2@example.com",
        "password": "password123",
        "name": "User Two"
    })
    token2 = res2.get_json()["token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # User 1 creates trip
    res_trip = client.post('/api/trips', headers=headers1, json={
        "name": "Japan Adventure",
        "description": "2 weeks in Tokyo & Kyoto",
        "start_date": "2026-10-01",
        "end_date": "2026-10-14"
    })
    assert res_trip.status_code == 201
    trip_id = res_trip.get_json()["id"]

    # User Isolation: User 2 should NOT see User 1's trips
    res_u2_trips = client.get('/api/trips', headers=headers2)
    assert len(res_u2_trips.get_json()) == 0

    # User 1 sees their trip
    res_u1_trips = client.get('/api/trips', headers=headers1)
    assert len(res_u1_trips.get_json()) == 1

    # Add stop to trip
    res_stop = client.post(f'/api/trips/{trip_id}/stops', headers=headers1, json={
        "city_id": 1,
        "notes": "Stay in Shinjuku"
    })
    assert res_stop.status_code == 201
    stop_id = res_stop.get_json()["id"]

    # Add activity to stop
    res_act = client.post(f'/api/stops/{stop_id}/activities', headers=headers1, json={
        "activity_id": 1,
        "day_number": 1,
        "time_slot": "morning"
    })
    assert res_act.status_code == 201

    # Full nested trip query
    res_nested = client.get(f'/api/trips/{trip_id}', headers=headers1)
    assert res_nested.status_code == 200
    nested_data = res_nested.get_json()
    assert len(nested_data["stops"]) == 1
    assert len(nested_data["stops"][0]["activities"]) == 1

    # Test Cascade Deletion: Deleting Trip must delete stops & stop_activities
    res_del = client.delete(f'/api/trips/{trip_id}', headers=headers1)
    assert res_del.status_code == 200
    assert Trip.query.count() == 0
    assert Stop.query.count() == 0
    assert StopActivity.query.count() == 0


def test_budget_share_cities_and_reorder(client):
    # 1. Health check
    res_health = client.get('/api/health')
    assert res_health.status_code == 200
    assert res_health.get_json()["status"] == "healthy"

    # 2. Cities search and detail
    res_cities = client.get('/api/cities?q=Tokyo')
    assert res_cities.status_code == 200
    cities = res_cities.get_json()
    assert len(cities) >= 1
    tokyo_id = cities[0]["id"]

    res_city = client.get(f'/api/cities/{tokyo_id}')
    assert res_city.status_code == 200
    city_data = res_city.get_json()
    assert city_data["name"] == "Tokyo"
    assert "activities" in city_data
    assert len(city_data["activities"]) >= 1

    # 3. Auth
    res_auth = client.post('/api/auth/signup', json={
        "email": "traveler@example.com",
        "password": "mypassword123",
        "name": "Traveler One"
    })
    token = res_auth.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 4. Create Trip with Dates
    res_trip = client.post('/api/trips', headers=headers, json={
        "name": "Japan Grand Tour",
        "description": "Tokyo exploration",
        "start_date": "2026-11-01",
        "end_date": "2026-11-10"
    })
    assert res_trip.status_code == 201
    trip_data = res_trip.get_json()
    assert trip_data["start_date"] == "2026-11-01"
    assert trip_data["end_date"] == "2026-11-10"
    trip_id = trip_data["id"]

    # 5. Add Stop and Activity
    res_stop1 = client.post(f'/api/trips/{trip_id}/stops', headers=headers, json={"city_id": tokyo_id})
    stop1_id = res_stop1.get_json()["id"]

    res_act = client.post(f'/api/stops/{stop1_id}/activities', headers=headers, json={
        "activity_id": 1,
        "day_number": 1,
        "time_slot": "morning"
    })
    assert res_act.status_code == 201

    # 6. Budget Endpoint
    res_budget = client.get(f'/api/trips/{trip_id}/budget', headers=headers)
    assert res_budget.status_code == 200
    bdata = res_budget.get_json()
    assert "total_cost" in bdata
    assert "by_stop" in bdata
    assert "by_category" in bdata
    assert bdata["num_days"] == 10

    # 7. Share Flow
    res_share = client.post(f'/api/trips/{trip_id}/share', headers=headers)
    assert res_share.status_code == 200
    share_token = res_share.get_json()["share_token"]
    assert share_token is not None

    # Public access without auth
    res_pub = client.get(f'/api/share/{share_token}')
    assert res_pub.status_code == 200
    pub_data = res_pub.get_json()
    assert pub_data["name"] == "Japan Grand Tour"
    assert len(pub_data["stops"]) == 1

    # 8. Reorder stops
    res_stop2 = client.post(f'/api/trips/{trip_id}/stops', headers=headers, json={"city_id": tokyo_id})
    stop2_id = res_stop2.get_json()["id"]
    res_reorder = client.put(f'/api/trips/{trip_id}/stops/reorder', headers=headers, json={
        "stop_ids": [stop2_id, stop1_id]
    })
    assert res_reorder.status_code == 200
    ordered = res_reorder.get_json()
    assert ordered[0]["id"] == stop2_id
    assert ordered[1]["id"] == stop1_id

