from flask import Blueprint, request, jsonify
from app.services.search import (
    fetch_geodb_cities,
    fetch_country_details,
    fetch_unsplash_photo,
    geocode_location_osm
)

cities_bp = Blueprint('cities', __name__, url_prefix='/api/cities')

@cities_bp.route('', methods=['GET'])
def get_cities():
    """
    GET /api/cities?q=&country=&region=
    Search cities: first queries SQLite database, fallback/enhances via GeoDB, REST Countries & Unsplash.
    """
    q = request.args.get('q', '').strip()
    country = request.args.get('country', '').strip()
    region = request.args.get('region', '').strip()

    from app.models import db, City
    
    query = City.query
    if q:
        query = query.filter(City.name.ilike(f"%{q}%"))
    if country:
        query = query.filter(City.country.ilike(f"%{country}%"))
    if region:
        query = query.filter(City.region.ilike(f"%{region}%"))

    db_results = query.order_by(City.popularity.desc()).limit(20).all()
    results = [c.to_dict() for c in db_results]

    # If few results and query string provided, enrich using external APIs
    if len(results) < 3 and q:
        external_cities = fetch_geodb_cities(q, limit=5)
        for ext in external_cities:
            # Check if already exists in DB
            existing = City.query.filter_by(name=ext['name'], country=ext['country']).first()
            if not existing:
                country_meta = fetch_country_details(ext['country'])
                img_url = fetch_unsplash_photo(f"{ext['name']} {ext['country']}")
                
                new_city = City(
                    name=ext['name'],
                    country=ext['country'],
                    region=ext.get('region') or country_meta.get('subregion', ''),
                    lat=ext.get('lat'),
                    lng=ext.get('lng'),
                    popularity=ext.get('popularity', 1),
                    image_url=img_url
                )
                db.session.add(new_city)
                try:
                    db.session.commit()
                    results.append(new_city.to_dict())
                except Exception:
                    db.session.rollback()

    return jsonify(results), 200


@cities_bp.route('/<int:city_id>', methods=['GET'])
def get_city_detail(city_id):
    """
    GET /api/cities/:id
    Returns single city details along with its activities.
    """
    from app.models import db, City
    city = db.session.get(City, city_id)
    if not city:
        return jsonify({"error": "City not found"}), 404
    
    activities = [a.to_dict() for a in city.activities] if city.activities else []
    data = city.to_dict()
    data['activities'] = activities

    # Enrich country details via REST Countries API
    country_meta = fetch_country_details(city.country)
    data['country_info'] = country_meta

    return jsonify(data), 200


@cities_bp.route('/<int:city_id>/activities', methods=['POST'])
def create_city_activity(city_id):
    """
    POST /api/cities/:id/activities
    Creates a custom activity scoped to a specific city.
    Matches frontend api.ts: activitiesApi.createCustomActivity(cityId, data)
    """
    from app.models import db, City, Activity
    city = db.session.get(City, city_id)
    if not city:
        return jsonify({"error": "City not found"}), 404

    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({"error": "name is required"}), 400

    activity = Activity(
        name=name,
        category=data.get('category', 'Sightseeing'),
        cost_estimate=float(data.get('cost_estimate', data.get('estimated_cost', 0.0)) or 0.0),
        duration_hours=float(data.get('duration_hours', 1.0) or 1.0),
        city_id=city.id,
        description=data.get('description'),
        image_url=data.get('image_url')
    )
    db.session.add(activity)
    db.session.commit()
    return jsonify(activity.to_dict()), 201
