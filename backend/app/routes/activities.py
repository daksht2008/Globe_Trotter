from flask import Blueprint, jsonify

activities_bp = Blueprint('activities', __name__)

@activities_bp.route('/api/activities', methods=['GET'])
def search_activities():
    return jsonify({"message": "Search activities endpoint stub"}), 501

@activities_bp.route('/api/stops/<int:stop_id>/activities', methods=['POST'])
def add_stop_activity(stop_id):
    return jsonify({"message": f"Add activity to stop {stop_id} stub"}), 501

@activities_bp.route('/api/stops/<int:stop_id>/activities/<int:act_id>', methods=['DELETE'])
def remove_stop_activity(stop_id, act_id):
    return jsonify({"message": f"Remove activity {act_id} from stop {stop_id} stub"}), 501
