from flask import Blueprint, jsonify

share_bp = Blueprint('share', __name__)

@share_bp.route('/api/trips/<int:trip_id>/share', methods=['POST'])
def generate_share_link(trip_id):
    return jsonify({"message": f"Share trip {trip_id} endpoint stub"}), 501

@share_bp.route('/api/share/<string:token>', methods=['GET'])
def get_shared_trip(token):
    return jsonify({"message": f"Get shared trip {token} endpoint stub"}), 501
