from app.routes.auth import auth_bp
from app.routes.cities import cities_bp
from app.routes.share import share_bp
from app.routes.trips import trips_bp
from app.routes.stops import stops_bp
from app.routes.activities import activities_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(cities_bp)
    app.register_blueprint(share_bp)
    app.register_blueprint(trips_bp)
    app.register_blueprint(stops_bp)
    app.register_blueprint(activities_bp)

