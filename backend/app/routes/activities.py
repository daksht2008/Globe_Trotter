from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Stop, Activity, StopActivity, City

activities_bp = Blueprint('activities', __name__)


@activities_bp.route('/api/activities', methods=['GET'])
def search_activities():
    """
    GET /api/activities?city_id=&category=&q=&min_cost=&max_cost=&max_duration=&sort_by=&limit=
    Advanced activity filtering and discovery.
    """
    city_id = request.args.get('city_id', type=int)
    category = request.args.get('category')
    q = request.args.get('q', '').strip()
    min_cost = request.args.get('min_cost', type=float)
    max_cost = request.args.get('max_cost', type=float)
    max_duration = request.args.get('max_duration', type=float)
    sort_by = request.args.get('sort_by', '').strip().lower()
    limit = request.args.get('limit', default=50, type=int)

    query = Activity.query
    if city_id:
        query = query.filter((Activity.city_id == city_id) | (Activity.city_id.is_(None)))
    if category:
        query = query.filter(Activity.category.ilike(f"%{category}%"))
    if q:
        query = query.filter(Activity.name.ilike(f"%{q}%") | Activity.description.ilike(f"%{q}%"))
    if min_cost is not None:
        query = query.filter(Activity.cost_estimate >= min_cost)
    if max_cost is not None:
        query = query.filter(Activity.cost_estimate <= max_cost)
    if max_duration is not None:
        query = query.filter(Activity.duration_hours <= max_duration)

    if sort_by == 'cost_asc':
        query = query.order_by(Activity.cost_estimate.asc())
    elif sort_by == 'cost_desc':
        query = query.order_by(Activity.cost_estimate.desc())
    elif sort_by == 'duration_asc':
        query = query.order_by(Activity.duration_hours.asc())
    elif sort_by == 'duration_desc':
        query = query.order_by(Activity.duration_hours.desc())

    activities = query.limit(limit).all()
    return jsonify([a.to_dict() for a in activities]), 200


@activities_bp.route('/api/activities', methods=['POST'])
@jwt_required()
def create_custom_activity():
    """
    POST /api/activities
    Creates a new custom user activity.
    """
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({"error": "name is required"}), 400

    city_id = data.get('city_id')
    if city_id:
        city = db.session.get(City, int(city_id))
        if not city:
            return jsonify({"error": "City not found"}), 404

    activity = Activity(
        name=name,
        category=data.get('category', 'Sightseeing'),
        cost_estimate=float(data.get('cost_estimate', data.get('estimated_cost', 0.0)) or 0.0),
        duration_hours=float(data.get('duration_hours', 1.0) or 1.0),
        city_id=int(city_id) if city_id else None,
        description=data.get('description'),
        image_url=data.get('image_url')
    )
    db.session.add(activity)
    db.session.commit()
    return jsonify(activity.to_dict()), 201


@activities_bp.route('/api/stops/<int:stop_id>/activities', methods=['POST'])
@activities_bp.route('/api/stops/<int:stop_id>/activities/<int:activity_id>', methods=['POST'])
@jwt_required()
def add_stop_activity(stop_id, activity_id=None):
    """
    POST /api/stops/:id/activities OR POST /api/stops/:id/activities/:activity_id
    Assigns an activity to a stop with optional day_number, time_slot, notes.
    """
    current_user_id = get_jwt_identity()
    stop = db.session.get(Stop, stop_id)
    if not stop or stop.trip.user_id != int(current_user_id):
        return jsonify({"error": "Stop not found or unauthorized"}), 404

    data = request.get_json() or {}
    act_id = activity_id or data.get('activity_id')
    if not act_id:
        return jsonify({"error": "activity_id is required"}), 400

    activity = db.session.get(Activity, int(act_id))
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
    stop = db.session.get(Stop, stop_id)
    if not stop or stop.trip.user_id != int(current_user_id):
        return jsonify({"error": "Stop not found or unauthorized"}), 404

    sa = StopActivity.query.filter_by(stop_id=stop.id, activity_id=act_id).first()
    if not sa:
        return jsonify({"error": "Activity not found on this stop"}), 404

    db.session.delete(sa)
    db.session.commit()
    return jsonify({"message": "Activity removed from stop successfully"}), 200


