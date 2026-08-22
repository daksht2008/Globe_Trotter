from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pydantic import ValidationError
from app.utils.validators import TripCreateSchema
from app.services.search import fetch_unsplash_photo
from app.services.budget import calculate_trip_budget

trips_bp = Blueprint('trips', __name__, url_prefix='/api/trips')

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

    new_trip = Trip(
        user_id=int(current_user_id),
        name=payload.name,
        description=payload.description,
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
    if 'cover_url' in data:
        trip.cover_url = data['cover_url']
    if 'is_public' in data:
        trip.is_public = data['is_public']

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

