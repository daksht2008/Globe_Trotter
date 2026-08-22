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
