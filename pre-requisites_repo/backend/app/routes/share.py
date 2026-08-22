import uuid
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

share_bp = Blueprint('share', __name__, url_prefix='/api')

@share_bp.route('/trips/<int:trip_id>/share', methods=['POST'])
@jwt_required()
def share_trip(trip_id):
    """
    POST /api/trips/:id/share
    Generates a share token and makes trip public.
    """
    current_user_id = get_jwt_identity()
    from app.models import db, Trip
    
    trip = Trip.query.filter_by(id=trip_id, user_id=int(current_user_id)).first()
    if not trip:
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    if not trip.share_token:
        trip.share_token = uuid.uuid4().hex[:12]
    
    trip.is_public = True
    db.session.commit()

    return jsonify({
        "share_token": trip.share_token,
        "url": f"/share/{trip.share_token}"
    }), 200


@share_bp.route('/share/<string:token>', methods=['GET'])
def get_shared_trip(token):
    """
    GET /api/share/:token
    Public (unauthenticated) access to view a shared trip.
    """
    from app.models import Trip
    trip = Trip.query.filter_by(share_token=token, is_public=True).first()
    
    if not trip:
        return jsonify({"error": "Shared trip not found or link has expired"}), 404

    # Return full nested trip details
    return jsonify(trip.to_nested_dict() if hasattr(trip, 'to_nested_dict') else trip.to_dict()), 200
