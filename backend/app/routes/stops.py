from flask import Blueprint, jsonify

stops_bp = Blueprint('stops', __name__)

@stops_bp.route('/api/trips/<int:trip_id>/stops', methods=['GET'])
def list_trip_stops(trip_id):
    return jsonify({"message": f"List stops for trip {trip_id} stub"}), 501

@stops_bp.route('/api/trips/<int:trip_id>/stops', methods=['POST'])
def add_trip_stop(trip_id):
    return jsonify({"message": f"Add stop to trip {trip_id} stub"}), 501

@stops_bp.route('/api/stops/<int:stop_id>', methods=['PUT'])
def update_stop(stop_id):
    return jsonify({"message": f"Update stop {stop_id} stub"}), 501

@stops_bp.route('/api/stops/<int:stop_id>', methods=['DELETE'])
def delete_stop(stop_id):
    return jsonify({"message": f"Delete stop {stop_id} stub"}), 501

@stops_bp.route('/api/trips/<int:trip_id>/stops/reorder', methods=['PUT'])
def reorder_stops(trip_id):
    return jsonify({"message": f"Reorder stops for trip {trip_id} stub"}), 501
