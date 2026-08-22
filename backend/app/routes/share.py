import uuid
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Trip

share_bp = Blueprint("share", __name__, url_prefix="/api")


@share_bp.route("/trips/<int:trip_id>/share", methods=["POST"])
@jwt_required()
def share_trip(trip_id):
    """
    POST /api/trips/:id/share
    Generates a unique share token and sets the trip visibility to public.
    Phase 3 - Advanced Features Implementation
    """
    current_user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=int(current_user_id)).first()

    if not trip:
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    if not trip.share_token:
        trip.share_token = uuid.uuid4().hex[:16]

    trip.is_public = True
    db.session.commit()

    return jsonify({
        "share_token": trip.share_token,
        "share_url": f"/share/{trip.share_token}",
        "url": f"/share/{trip.share_token}",
        "is_public": trip.is_public
    }), 200


@share_bp.route("/trips/<int:trip_id>/share", methods=["DELETE"])
@jwt_required()
def revoke_share_trip(trip_id):
    """
    DELETE /api/trips/:id/share
    Revokes public sharing, setting is_public = False.
    """
    current_user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=int(current_user_id)).first()

    if not trip:
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    trip.is_public = False
    db.session.commit()

    return jsonify({
        "message": "Trip sharing revoked",
        "is_public": False
    }), 200


@share_bp.route("/share/<string:token>", methods=["GET"])
def get_shared_trip(token):
    """
    GET /api/share/:token
    Public, unauthenticated endpoint to view a shared itinerary by token.
    """
    trip = Trip.query.filter_by(share_token=token, is_public=True).first()

    if not trip:
        return jsonify({"error": "Shared trip not found or link has expired"}), 404

    if hasattr(trip, "to_nested_dict"):
        return jsonify(trip.to_nested_dict()), 200
    return jsonify(trip.to_dict()), 200

