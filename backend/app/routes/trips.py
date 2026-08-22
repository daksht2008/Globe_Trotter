from flask import Blueprint, jsonify

trips_bp = Blueprint('trips', __name__, url_prefix='/api/trips')

@trips_bp.route('', methods=['GET'])
def list_trips():
    return jsonify({"message": "List trips endpoint stub (Phase 2)"}), 501

@trips_bp.route('', methods=['POST'])
def create_trip():
    return jsonify({"message": "Create trip endpoint stub (Phase 2)"}), 501

@trips_bp.route('/<int:trip_id>', methods=['GET'])
def get_trip(trip_id):
    return jsonify({"message": f"Get trip {trip_id} endpoint stub (Phase 2)"}), 501

@trips_bp.route('/<int:trip_id>', methods=['PUT'])
def update_trip(trip_id):
    return jsonify({"message": f"Update trip {trip_id} endpoint stub (Phase 2)"}), 501

@trips_bp.route('/<int:trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    return jsonify({"message": f"Delete trip {trip_id} endpoint stub (Phase 2)"}), 501

@trips_bp.route('/<int:trip_id>/budget', methods=['GET'])
def get_trip_budget(trip_id):
    return jsonify({"message": f"Trip {trip_id} budget endpoint stub (Phase 3)"}), 501
