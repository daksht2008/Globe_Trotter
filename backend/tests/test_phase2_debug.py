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
