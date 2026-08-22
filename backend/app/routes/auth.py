from flask import Blueprint, jsonify

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    return jsonify({"message": "Auth signup endpoint stub (Phase 2)"}), 501

@auth_bp.route('/login', methods=['POST'])
def login():
    return jsonify({"message": "Auth login endpoint stub (Phase 2)"}), 501

@auth_bp.route('/me', methods=['GET'])
def get_me():
    return jsonify({"message": "Auth me endpoint stub (Phase 2)"}), 501
