from .health import health_bp
from .auth import auth_bp
from .trips import trips_bp
from .stops import stops_bp
from .activities import activities_bp
from .cities import cities_bp
from .share import share_bp

def register_routes(app):
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(auth_bp)
    app.register_blueprint(trips_bp)
    app.register_blueprint(stops_bp)
    app.register_blueprint(activities_bp)
    app.register_blueprint(cities_bp)
    app.register_blueprint(share_bp)
