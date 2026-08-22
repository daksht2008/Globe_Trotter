from datetime import date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pydantic import ValidationError
from app.utils.validators import TripCreateSchema
from app.services.search import fetch_unsplash_photo
from app.services.budget import calculate_trip_budget

trips_bp = Blueprint('trips', __name__, url_prefix='/api/trips')


def _parse_date(val):
    if not val:
        return None
    if isinstance(val, date):
        return val
    try:
        return date.fromisoformat(str(val)[:10])
    except Exception:
        return None


@trips_bp.route('', methods=['GET'])
@jwt_required()
def get_user_trips():
    """
    GET /api/trips
    Returns list of trips owned by the authenticated user.
    """
    current_user_id = get_jwt_identity()
    from app.models import Trip
    
    user_trips = Trip.query.filter_by(user_id=int(current_user_id)).order_by(Trip.created_at.desc()).all()
    return jsonify([t.to_dict() for t in user_trips]), 200


@trips_bp.route('', methods=['POST'])
@jwt_required()
def create_trip():
    """
    POST /api/trips
    Creates a new trip for current authenticated user.
    Auto-fetches cover photo via Unsplash if cover_url not provided.
    """
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    try:
        payload = TripCreateSchema(**data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.errors()}), 400

    from app.models import db, Trip

    cover = payload.cover_url
    if not cover:
        cover = fetch_unsplash_photo(payload.name)

    start_date = _parse_date(payload.start_date)
    end_date = _parse_date(payload.end_date)
    if start_date and end_date and end_date < start_date:
        return jsonify({"error": "end_date must be on or after start_date"}), 400

    new_trip = Trip(
        user_id=int(current_user_id),
        name=payload.name,
        description=payload.description,
        start_date=start_date,
        end_date=end_date,
        cover_url=cover
    )
    
    db.session.add(new_trip)
    db.session.commit()

    return jsonify(new_trip.to_dict()), 201


@trips_bp.route('/<int:trip_id>', methods=['GET'])
@jwt_required()
def get_trip_detail(trip_id):
    """
    GET /api/trips/:id
    Returns full nested trip itinerary with stops and activities.
    """
    current_user_id = get_jwt_identity()
    from app.models import Trip
    
    trip = Trip.query.filter_by(id=trip_id, user_id=int(current_user_id)).first()
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    return jsonify(trip.to_nested_dict()), 200


@trips_bp.route('/<int:trip_id>', methods=['PUT'])
@jwt_required()
def update_trip(trip_id):
    """
    PUT /api/trips/:id
    Updates trip name, description, dates, or cover.
    """
    current_user_id = get_jwt_identity()
    from app.models import db, Trip
    
    trip = Trip.query.filter_by(id=trip_id, user_id=int(current_user_id)).first()
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    data = request.get_json() or {}
    if 'name' in data:
        trip.name = data['name']
    if 'description' in data:
        trip.description = data['description']
    if 'start_date' in data:
        trip.start_date = _parse_date(data['start_date'])
    if 'end_date' in data:
        trip.end_date = _parse_date(data['end_date'])
    if 'cover_url' in data:
        trip.cover_url = data['cover_url']
    if 'is_public' in data:
        trip.is_public = data['is_public']

    if trip.start_date and trip.end_date and trip.end_date < trip.start_date:
        return jsonify({"error": "end_date must be on or after start_date"}), 400

    db.session.commit()
    return jsonify(trip.to_dict()), 200


@trips_bp.route('/<int:trip_id>', methods=['DELETE'])
@jwt_required()
def delete_trip(trip_id):
    """
    DELETE /api/trips/:id
    Deletes trip and cascades to stops and activities.
    """
    current_user_id = get_jwt_identity()
    from app.models import db, Trip
    
    trip = Trip.query.filter_by(id=trip_id, user_id=int(current_user_id)).first()
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    db.session.delete(trip)
    db.session.commit()
    return jsonify({"message": "Trip deleted successfully"}), 200


@trips_bp.route('/<int:trip_id>/budget', methods=['GET'])
@jwt_required()
def get_trip_budget(trip_id):
    """
    GET /api/trips/:id/budget
    Returns budget calculation summary for the trip.
    """
    current_user_id = get_jwt_identity()
    from app.models import Trip
    
    trip = Trip.query.filter_by(id=trip_id, user_id=int(current_user_id)).first()
    if not trip:
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    budget_data = calculate_trip_budget(trip)
    return jsonify(budget_data), 200


@trips_bp.route('/<int:trip_id>/timeline', methods=['GET'])
@jwt_required()
def get_trip_timeline(trip_id):
    """
    GET /api/trips/:id/timeline
    Returns day-by-day schedule with activities grouped by time slot.
    Powers frontend calendar / itinerary timeline views.
    """
    current_user_id = get_jwt_identity()
    from app.models import Trip
    from datetime import timedelta

    trip = Trip.query.filter_by(id=trip_id, user_id=int(current_user_id)).first()
    if not trip:
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    stops = sorted(getattr(trip, 'stops', []), key=lambda s: (s.order_index or 0))

    # Build day-by-day timeline
    days = []
    current_date = trip.start_date
    num_days = 1
    if trip.start_date and trip.end_date:
        delta = (trip.end_date - trip.start_date).days + 1
        if delta > 0:
            num_days = delta

    for day_num in range(1, num_days + 1):
        day_date = None
        if current_date:
            day_date = str(current_date + timedelta(days=day_num - 1))

        day_slots = {"morning": [], "afternoon": [], "evening": []}
        day_activities = []

        for stop in stops:
            city_obj = getattr(stop, 'city', None)
            city_name = getattr(city_obj, 'name', f'Stop {stop.id}') if city_obj else f'Stop {stop.id}'

            for sa in getattr(stop, 'stop_activities', []):
                if sa.day_number and sa.day_number != day_num:
                    continue
                if not sa.day_number and day_num != 1:
                    continue

                act = getattr(sa, 'activity', None)
                if not act:
                    continue

                entry = {
                    "activity_id": act.id,
                    "name": getattr(act, 'name', 'Activity'),
                    "category": getattr(act, 'category', 'Sightseeing'),
                    "cost": float(getattr(act, 'cost_estimate', 0.0) or 0.0),
                    "duration_hours": float(getattr(act, 'duration_hours', 1.0) or 1.0),
                    "stop_id": stop.id,
                    "city": city_name,
                    "notes": sa.notes,
                    "time_slot": sa.time_slot or "morning"
                }

                slot = (sa.time_slot or "morning").lower()
                if slot in day_slots:
                    day_slots[slot].append(entry)
                else:
                    day_slots["morning"].append(entry)
                day_activities.append(entry)

        days.append({
            "day_number": day_num,
            "date": day_date,
            "slots": day_slots,
            "activity_count": len(day_activities)
        })

    return jsonify({
        "trip_id": trip.id,
        "trip_name": trip.name,
        "start_date": str(trip.start_date) if trip.start_date else None,
        "end_date": str(trip.end_date) if trip.end_date else None,
        "num_days": num_days,
        "days": days
    }), 200


