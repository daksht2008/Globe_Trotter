from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Stop, Activity, StopActivity

activities_bp = Blueprint('activities', __name__)

@activities_bp.route('/api/activities', methods=['GET'])
def search_activities():
    city_id = request.args.get('city_id', type=int)
    category = request.args.get('category')
    q = request.args.get('q', '').strip()

    query = Activity.query
    if city_id:
        query = query.filter((Activity.city_id == city_id) | (Activity.city_id.is_(None)))
    if category:
        query = query.filter(Activity.category.ilike(f"%{category}%"))
    if q:
        query = query.filter(Activity.name.ilike(f"%{q}%") | Activity.description.ilike(f"%{q}%"))

    activities = query.limit(50).all()
    return jsonify([a.to_dict() for a in activities]), 200


@activities_bp.route('/api/stops/<int:stop_id>/activities', methods=['POST'])
@jwt_required()
def add_stop_activity(stop_id):
    current_user_id = get_jwt_identity()
    stop = Stop.query.get(stop_id)
    if not stop or stop.trip.user_id != int(current_user_id):
        return jsonify({"error": "Stop not found or unauthorized"}), 404

    data = request.get_json() or {}
    activity_id = data.get('activity_id')
    if not activity_id:
        return jsonify({"error": "activity_id is required"}), 400

    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404

    existing = StopActivity.query.filter_by(stop_id=stop.id, activity_id=activity.id).first()
    if existing:
        return jsonify({"error": "Activity already added to this stop"}), 409

    sa = StopActivity(
        stop_id=stop.id,
        activity_id=activity.id,
        day_number=data.get('day_number'),
        time_slot=data.get('time_slot'),
        notes=data.get('notes')
    )
    db.session.add(sa)
    db.session.commit()
    return jsonify(sa.to_dict()), 201


@activities_bp.route('/api/stops/<int:stop_id>/activities/<int:act_id>', methods=['DELETE'])
@jwt_required()
def remove_stop_activity(stop_id, act_id):
    current_user_id = get_jwt_identity()
    stop = Stop.query.get(stop_id)
    if not stop or stop.trip.user_id != int(current_user_id):
        return jsonify({"error": "Stop not found or unauthorized"}), 404

    sa = StopActivity.query.filter_by(stop_id=stop.id, activity_id=act_id).first()
    if not sa:
        return jsonify({"error": "Activity not found on this stop"}), 404

    db.session.delete(sa)
    db.session.commit()
    return jsonify({"message": "Activity removed from stop successfully"}), 200

