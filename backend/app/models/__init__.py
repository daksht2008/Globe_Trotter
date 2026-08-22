from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    trips = db.relationship('Trip', backref='user', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Trip(db.Model):
    __tablename__ = 'trips'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    is_public = db.Column(db.Boolean, default=False)
    share_token = db.Column(db.String(64), unique=True, nullable=True)
    cover_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    stops = db.relationship('Stop', backref='trip', lazy='joined', order_by="Stop.order_index", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "is_public": self.is_public,
            "share_token": self.share_token,
            "cover_url": self.cover_url,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    def to_nested_dict(self):
        d = self.to_dict()
        d["stops"] = [s.to_nested_dict() for s in self.stops] if self.stops else []
        return d


class City(db.Model):
    __tablename__ = 'cities'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    region = db.Column(db.String(100), nullable=True)
    cost_index = db.Column(db.Float, default=1.0)
    popularity = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(500), nullable=True)
    lat = db.Column(db.Float, nullable=True)
    lng = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "country": self.country,
            "region": self.region,
            "cost_index": self.cost_index,
            "popularity": self.popularity,
            "image_url": self.image_url,
            "lat": self.lat,
            "lng": self.lng
        }


class Stop(db.Model):
    __tablename__ = 'stops'
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=False)
    city_id = db.Column(db.Integer, db.ForeignKey('cities.id'), nullable=False)
    order_index = db.Column(db.Integer, nullable=False, default=0)
    arrival_date = db.Column(db.Date, nullable=True)
    departure_date = db.Column(db.Date, nullable=True)
    notes = db.Column(db.Text, nullable=True)

    city = db.relationship('City', lazy='joined')
    stop_activities = db.relationship('StopActivity', backref='stop', lazy='joined', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "trip_id": self.trip_id,
            "city_id": self.city_id,
            "order_index": self.order_index,
            "arrival_date": self.arrival_date.isoformat() if self.arrival_date else None,
            "departure_date": self.departure_date.isoformat() if self.departure_date else None,
            "notes": self.notes
        }

    def to_nested_dict(self):
        d = self.to_dict()
        d["city"] = self.city.to_dict() if self.city else None
        d["activities"] = [sa.to_dict() for sa in self.stop_activities] if self.stop_activities else []
        return d


class Activity(db.Model):
    __tablename__ = 'activities'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    cost_estimate = db.Column(db.Float, default=0.0)
    duration_hours = db.Column(db.Float, default=1.0)
    city_id = db.Column(db.Integer, db.ForeignKey('cities.id'), nullable=True)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "cost_estimate": self.cost_estimate,
            "duration_hours": self.duration_hours,
            "city_id": self.city_id,
            "description": self.description,
            "image_url": self.image_url
        }


class StopActivity(db.Model):
    __tablename__ = 'stop_activities'
    id = db.Column(db.Integer, primary_key=True)
    stop_id = db.Column(db.Integer, db.ForeignKey('stops.id'), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id'), nullable=False)
    day_number = db.Column(db.Integer, nullable=True)
    time_slot = db.Column(db.String(20), nullable=True)
    notes = db.Column(db.Text, nullable=True)

    activity = db.relationship('Activity', lazy='joined')

    def to_dict(self):
        return {
            "id": self.id,
            "stop_id": self.stop_id,
            "activity_id": self.activity_id,
            "day_number": self.day_number,
            "time_slot": self.time_slot,
            "notes": self.notes,
            "activity": self.activity.to_dict() if self.activity else None
        }
