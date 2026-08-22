from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from pydantic import ValidationError
from app.utils.validators import SignupSchema, LoginSchema

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    POST /api/auth/signup
    Registers a new user and returns JWT token.
    """
    data = request.get_json() or {}
    try:
        payload = SignupSchema(**data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.errors()}), 400

    # Lazy import model inside route to ensure compatibility
    from app.models import db, User
    
    if User.query.filter_by(email=payload.email).first():
        return jsonify({"error": "User with this email already exists"}), 409

    pwd_hash = generate_password_hash(payload.password)
    user = User(email=payload.email, password_hash=pwd_hash, name=payload.name)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"user": user.to_dict(), "token": token}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    POST /api/auth/login
    Authenticates user and returns JWT token.
    """
    data = request.get_json() or {}
    try:
        payload = LoginSchema(**data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.errors()}), 400

    from app.models import User
    user = User.query.filter_by(email=payload.email).first()

    if not user or not check_password_hash(user.password_hash, payload.password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"user": user.to_dict(), "token": token}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    """
    GET /api/auth/me
    Returns current authenticated user details.
    """
    current_user_id = get_jwt_identity()
    from app.models import db, User
    user = db.session.get(User, int(current_user_id))
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify({"user": user.to_dict()}), 200
