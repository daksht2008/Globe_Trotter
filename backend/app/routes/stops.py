from datetime import date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Trip, Stop, City

stops_bp = Blueprint('stops', __name__)


def _parse_date(val):
    if not val:
        return None
    if isinstance(val, date):
        return val
    try:
        return date.fromisoformat(str(val)[:10])
    except Exception:
        return None


@stops_bp.route('/api/trips/<int:trip_id>/stops', methods=['GET'])
@jwt_required()
def list_trip_stops(trip_id):
    current_user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=int(current_user_id)).first()
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    return jsonify([s.to_nested_dict() for s in trip.stops]), 200


@stops_bp.route('/api/trips/<int:trip_id>/stops', methods=['POST'])
@jwt_required()
def add_trip_stop(trip_id):
    current_user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=int(current_user_id)).first()
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    data = request.get_json() or {}
    city_id = data.get('city_id')
    if not city_id:
        return jsonify({"error": "city_id is required"}), 400

    city = db.session.get(City, int(city_id))
    if not city:
        return jsonify({"error": "City not found"}), 404

    order_index = data.get('order_index')
    if order_index is None:
        order_index = len(trip.stops)

    stop = Stop(
        trip_id=trip.id,
        city_id=city.id,
        order_index=int(order_index),
        arrival_date=_parse_date(data.get('arrival_date')),
        departure_date=_parse_date(data.get('departure_date')),
        notes=data.get('notes')
    )
    db.session.add(stop)
    db.session.commit()
    return jsonify(stop.to_nested_dict()), 201


@stops_bp.route('/api/stops/<int:stop_id>', methods=['PUT'])
@jwt_required()
def update_stop(stop_id):
    current_user_id = get_jwt_identity()
    stop = db.session.get(Stop, stop_id)
    if not stop or stop.trip.user_id != int(current_user_id):
        return jsonify({"error": "Stop not found or unauthorized"}), 404

    data = request.get_json() or {}
    if 'city_id' in data:
        new_city = db.session.get(City, int(data['city_id']))
        if not new_city:
            return jsonify({"error": "City not found"}), 404
        stop.city_id = new_city.id
    if 'order_index' in data:
        stop.order_index = int(data['order_index'])
    if 'arrival_date' in data:
        stop.arrival_date = _parse_date(data['arrival_date'])
    if 'departure_date' in data:
        stop.departure_date = _parse_date(data['departure_date'])
    if 'notes' in data:
        stop.notes = data['notes']

    db.session.commit()
    return jsonify(stop.to_nested_dict()), 200


@stops_bp.route('/api/stops/<int:stop_id>', methods=['DELETE'])
@jwt_required()
def delete_stop(stop_id):
    current_user_id = get_jwt_identity()
    stop = db.session.get(Stop, stop_id)
    if not stop or stop.trip.user_id != int(current_user_id):
        return jsonify({"error": "Stop not found or unauthorized"}), 404

    trip_id = stop.trip_id
    db.session.delete(stop)
    db.session.flush()

    # Reindex remaining stops
    remaining = Stop.query.filter_by(trip_id=trip_id).order_by(Stop.order_index).all()
    for idx, s in enumerate(remaining):
        s.order_index = idx

    db.session.commit()
    return jsonify({"message": "Stop deleted successfully"}), 200


@stops_bp.route('/api/trips/<int:trip_id>/stops/reorder', methods=['PUT'])
@jwt_required()
def reorder_stops(trip_id):
    current_user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=int(current_user_id)).first()
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    data = request.get_json() or {}
    stop_ids = data.get('stop_ids', [])
    for idx, sid in enumerate(stop_ids):
        stop = Stop.query.filter_by(id=sid, trip_id=trip.id).first()
        if stop:
            stop.order_index = idx

    db.session.commit()
    return jsonify([s.to_nested_dict() for s in trip.stops]), 200

