import pytest
from app import create_app
from app.models import db, City, Activity
from app.utils.seed import seed_database


class TestConfig:
    TESTING = True
    SECRET_KEY = "test"
    JWT_SECRET_KEY = "test-jwt-secret-key-32-chars-min"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False


@pytest.fixture
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        seed_database()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth(client):
    res = client.post("/api/auth/signup", json={
        "email": "dev2@test.com", "password": "secret12", "name": "Dev Two",
    })
    token = res.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def city_id(app):
    with app.app_context():
        return City.query.first().id


@pytest.fixture
def activity_id(app):
    with app.app_context():
        return Activity.query.first().id
