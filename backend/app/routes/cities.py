from flask import Blueprint, jsonify

cities_bp = Blueprint('cities', __name__, url_prefix='/api/cities')

@cities_bp.route('', methods=['GET'])
def list_cities():
    return jsonify({"message": "List cities endpoint stub"}), 501

@cities_bp.route('/<int:city_id>', methods=['GET'])
def get_city(city_id):
    return jsonify({"message": f"Get city {city_id} endpoint stub"}), 501
