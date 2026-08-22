from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config
from app.models import db

jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    # Register Blueprints
    from app.routes import register_routes
    register_routes(app)

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({"status": "healthy", "service": "GlobeTrotter Backend"}), 200

    return app
