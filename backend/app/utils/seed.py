from faker import Faker
from ..models import db, City, Activity

fake = Faker()

CITIES_DATA = [
    # Europe
    {"name": "Paris", "country": "France", "region": "Europe", "cost_index": 1.4, "popularity": 99, "lat": 48.8566, "lng": 2.3522, "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800"},
    {"name": "Rome", "country": "Italy", "region": "Europe", "cost_index": 1.2, "popularity": 98, "lat": 41.9028, "lng": 12.4964, "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800"},
    {"name": "Florence", "country": "Italy", "region": "Europe", "cost_index": 1.15, "popularity": 93, "lat": 43.7696, "lng": 11.2558, "image_url": "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=800"},
    {"name": "Venice", "country": "Italy", "region": "Europe", "cost_index": 1.35, "popularity": 94, "lat": 45.4408, "lng": 12.3155, "image_url": "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800"},
    {"name": "Milan", "country": "Italy", "region": "Europe", "cost_index": 1.3, "popularity": 90, "lat": 45.4642, "lng": 9.1900, "image_url": "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800"},
    {"name": "Barcelona", "country": "Spain", "region": "Europe", "cost_index": 1.1, "popularity": 96, "lat": 41.3879, "lng": 2.1699, "image_url": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800"},
    {"name": "Madrid", "country": "Spain", "region": "Europe", "cost_index": 1.05, "popularity": 91, "lat": 40.4168, "lng": -3.7038, "image_url": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800"},
    {"name": "London", "country": "United Kingdom", "region": "Europe", "cost_index": 1.5, "popularity": 97, "lat": 51.5074, "lng": -0.1278, "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800"},
    {"name": "Amsterdam", "country": "Netherlands", "region": "Europe", "cost_index": 1.3, "popularity": 92, "lat": 52.3676, "lng": 4.9041, "image_url": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800"},
    {"name": "Berlin", "country": "Germany", "region": "Europe", "cost_index": 1.1, "popularity": 88, "lat": 52.5200, "lng": 13.4050, "image_url": "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800"},
    {"name": "Munich", "country": "Germany", "region": "Europe", "cost_index": 1.25, "popularity": 87, "lat": 48.1351, "lng": 11.5820, "image_url": "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800"},
    {"name": "Vienna", "country": "Austria", "region": "Europe", "cost_index": 1.2, "popularity": 89, "lat": 48.2082, "lng": 16.3738, "image_url": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800"},
    {"name": "Prague", "country": "Czech Republic", "region": "Europe", "cost_index": 0.9, "popularity": 90, "lat": 50.0755, "lng": 14.4378, "image_url": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800"},
    {"name": "Lisbon", "country": "Portugal", "region": "Europe", "cost_index": 0.95, "popularity": 92, "lat": 38.7223, "lng": -9.1393, "image_url": "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=800"},
    {"name": "Athens", "country": "Greece", "region": "Europe", "cost_index": 0.9, "popularity": 89, "lat": 37.9838, "lng": 23.7275, "image_url": "https://images.unsplash.com/photo-1503152394-c571994fd383?w=800"},
    {"name": "Zurich", "country": "Switzerland", "region": "Europe", "cost_index": 1.8, "popularity": 88, "lat": 47.3769, "lng": 8.5417, "image_url": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800"},

    # India
    {"name": "Mumbai", "country": "India", "region": "Asia", "cost_index": 0.55, "popularity": 97, "lat": 19.0760, "lng": 72.8777, "image_url": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800"},
    {"name": "Delhi", "country": "India", "region": "Asia", "cost_index": 0.5, "popularity": 96, "lat": 28.7041, "lng": 77.1025, "image_url": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800"},
    {"name": "Bengaluru", "country": "India", "region": "Asia", "cost_index": 0.52, "popularity": 93, "lat": 12.9716, "lng": 77.5946, "image_url": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800"},
    {"name": "Jaipur", "country": "India", "region": "Asia", "cost_index": 0.45, "popularity": 95, "lat": 26.9124, "lng": 75.7873, "image_url": "https://images.unsplash.com/photo-1603258849062-f153a702b881?w=800"},
    {"name": "Goa", "country": "India", "region": "Asia", "cost_index": 0.6, "popularity": 96, "lat": 15.2993, "lng": 74.1240, "image_url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800"},
    {"name": "Agra", "country": "India", "region": "Asia", "cost_index": 0.45, "popularity": 95, "lat": 27.1767, "lng": 78.0081, "image_url": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800"},
    {"name": "Kolkata", "country": "India", "region": "Asia", "cost_index": 0.42, "popularity": 88, "lat": 22.5726, "lng": 88.3639, "image_url": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800"},
    {"name": "Varanasi", "country": "India", "region": "Asia", "cost_index": 0.4, "popularity": 91, "lat": 25.3176, "lng": 82.9739, "image_url": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800"},
    {"name": "Udaipur", "country": "India", "region": "Asia", "cost_index": 0.5, "popularity": 92, "lat": 24.5854, "lng": 73.7125, "image_url": "https://images.unsplash.com/photo-1615836245337-f5b9b230ad6f?w=800"},
    {"name": "Kochi", "country": "India", "region": "Asia", "cost_index": 0.48, "popularity": 87, "lat": 9.9312, "lng": 76.2673, "image_url": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800"},

    # Asia & Middle East
    {"name": "Tokyo", "country": "Japan", "region": "Asia", "cost_index": 1.3, "popularity": 99, "lat": 35.6762, "lng": 139.6503, "image_url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800"},
    {"name": "Kyoto", "country": "Japan", "region": "Asia", "cost_index": 1.15, "popularity": 91, "lat": 35.0116, "lng": 135.7681, "image_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800"},
    {"name": "Osaka", "country": "Japan", "region": "Asia", "cost_index": 1.1, "popularity": 89, "lat": 34.6937, "lng": 135.5023, "image_url": "https://images.unsplash.com/photo-1590559899731-a3f07b743759?w=800"},
    {"name": "Bangkok", "country": "Thailand", "region": "Asia", "cost_index": 0.7, "popularity": 94, "lat": 13.7563, "lng": 100.5018, "image_url": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800"},
    {"name": "Phuket", "country": "Thailand", "region": "Asia", "cost_index": 0.75, "popularity": 92, "lat": 7.8804, "lng": 98.3923, "image_url": "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800"},
    {"name": "Singapore", "country": "Singapore", "region": "Asia", "cost_index": 1.45, "popularity": 95, "lat": 1.3521, "lng": 103.8198, "image_url": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800"},
    {"name": "Seoul", "country": "South Korea", "region": "Asia", "cost_index": 1.2, "popularity": 93, "lat": 37.5665, "lng": 126.9780, "image_url": "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800"},
    {"name": "Dubai", "country": "United Arab Emirates", "region": "Middle East", "cost_index": 1.4, "popularity": 95, "lat": 25.2048, "lng": 55.2708, "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800"},
    {"name": "Istanbul", "country": "Turkey", "region": "Europe/Asia", "cost_index": 0.75, "popularity": 91, "lat": 41.0082, "lng": 28.9784, "image_url": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800"},
    {"name": "Bali", "country": "Indonesia", "region": "Asia", "cost_index": 0.65, "popularity": 96, "lat": -8.4095, "lng": 115.1889, "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800"},

    # Americas
    {"name": "New York", "country": "United States", "region": "North America", "cost_index": 1.6, "popularity": 98, "lat": 40.7128, "lng": -74.0060, "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800"},
    {"name": "San Francisco", "country": "United States", "region": "North America", "cost_index": 1.55, "popularity": 91, "lat": 37.7749, "lng": -122.4194, "image_url": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800"},
    {"name": "Los Angeles", "country": "United States", "region": "North America", "cost_index": 1.5, "popularity": 92, "lat": 34.0522, "lng": -118.2437, "image_url": "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800"},
    {"name": "Toronto", "country": "Canada", "region": "North America", "cost_index": 1.25, "popularity": 88, "lat": 43.6532, "lng": -79.3832, "image_url": "https://images.unsplash.com/photo-1507992781348-310259076fa0?w=800"},
    {"name": "Vancouver", "country": "Canada", "region": "North America", "cost_index": 1.3, "popularity": 87, "lat": 49.2827, "lng": -123.1207, "image_url": "https://images.unsplash.com/photo-1559511260-66a65e0982d5?w=800"},
    {"name": "Rio de Janeiro", "country": "Brazil", "region": "South America", "cost_index": 0.8, "popularity": 86, "lat": -22.9068, "lng": -43.1729, "image_url": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800"},

    # Oceania & Africa
    {"name": "Sydney", "country": "Australia", "region": "Oceania", "cost_index": 1.35, "popularity": 92, "lat": -33.8688, "lng": 151.2093, "image_url": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800"},
    {"name": "Melbourne", "country": "Australia", "region": "Oceania", "cost_index": 1.3, "popularity": 88, "lat": -37.8136, "lng": 144.9631, "image_url": "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800"},
    {"name": "Auckland", "country": "New Zealand", "region": "Oceania", "cost_index": 1.25, "popularity": 85, "lat": -36.8485, "lng": 174.7633, "image_url": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800"},
    {"name": "Cape Town", "country": "South Africa", "region": "Africa", "cost_index": 0.75, "popularity": 86, "lat": -33.9249, "lng": 18.4241, "image_url": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800"},
    {"name": "Cairo", "country": "Egypt", "region": "Africa", "cost_index": 0.6, "popularity": 87, "lat": 30.0444, "lng": 31.2357, "image_url": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800"}
]

ACTIVITIES_SEED = [
    # Paris
    ("Eiffel Tower Summit Tour", "sightseeing", 45.0, 2.5, "Paris", "Panoramic views of Paris from the iconic landmark.", "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600"),
    ("Louvre Museum Guided Walk", "culture", 35.0, 3.0, "Paris", "Marvel at the Mona Lisa and world-renowned classical art.", "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600"),
    ("Seine River Dinner Cruise", "food", 85.0, 2.0, "Paris", "Gourmet French cuisine gliding past illuminated monuments.", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600"),
    ("Montmartre Art & Bakery Walk", "food", 30.0, 2.5, "Paris", "Taste warm baguettes, macarons, and explore bohemian streets.", "https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=600"),
    
    # Tokyo
    ("Shibuya Crossing & Izakaya Crawl", "food", 50.0, 3.0, "Tokyo", "Experience world's busiest crossing followed by local yakitori.", "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600"),
    ("teamLab Borderless Digital Art", "culture", 38.0, 2.5, "Tokyo", "Immersive projection mapping and futuristic art installations.", "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600"),
    ("Senso-ji & Asakusa Traditional Walk", "culture", 0.0, 2.0, "Tokyo", "Tokyo's oldest Buddhist temple and vibrant souvenir street.", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600"),

    # Rome & Florence
    ("Colosseum & Roman Forum Tour", "culture", 40.0, 3.0, "Rome", "Skip-the-line guided exploration of gladiatorial arena.", "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600"),
    ("Vatican Museums & Sistine Chapel", "culture", 48.0, 3.5, "Rome", "Michelangelo's ceiling masterpiece and St. Peter's Basilica.", "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=600"),
    ("Uffizi Gallery Renaissance Tour", "culture", 32.0, 2.5, "Florence", "Botticelli's Birth of Venus and Da Vinci masterpieces.", "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=600"),
    ("Duomo Florence Dome Climb", "sightseeing", 25.0, 2.0, "Florence", "Brunelleschi's magnificent cupola overlooking Tuscany.", "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=600"),

    # India
    ("Gateway of India & Colaba Street Walk", "sightseeing", 10.0, 2.5, "Mumbai", "Iconic basalt arch monument overlooking Mumbai harbour.", "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600"),
    ("Red Fort & Chandni Chowk Food Tour", "food", 20.0, 3.0, "Delhi", "Mughal architecture and delicious parathas in Old Delhi.", "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600"),
    ("Taj Mahal Sunrise Guided Visit", "culture", 25.0, 3.0, "Agra", "Ivory-white marble mausoleum on the Yamuna riverbank.", "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600"),
    ("Amber Fort & Hawa Mahal Palace", "culture", 15.0, 3.0, "Jaipur", "Opulent royal palaces and pink sandstone honeycomb facade.", "https://images.unsplash.com/photo-1603258849062-f153a702b881?w=600"),
    ("Ganga Aarti Boat Experience", "culture", 12.0, 2.0, "Varanasi", "Mesmerizing evening prayer rituals along the holy Dashashwamedh Ghat.", "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600"),
    ("Goa Sunset Beach & Shack Hopping", "adventure", 18.0, 3.5, "Goa", "Golden sands, fresh seafood, and live coastal music.", "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600"),

    # General
    ("Local Farmers & Artisan Market", "shopping", 10.0, 2.0, None, "Browse handmade crafts, regional spices, and organic snacks.", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600"),
    ("Sunset Photography Walk", "sightseeing", 0.0, 1.5, None, "Capture golden hour light across picturesque historic alleys.", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600"),
    ("Cooking Masterclass with Local Chef", "food", 60.0, 3.5, None, "Hands-on preparation of regional signature 3-course dinner.", "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600")
]

def seed_database():
    """Idempotently seed cities and activities."""
    added_cities = 0
    for c in CITIES_DATA:
        existing = City.query.filter_by(name=c["name"], country=c["country"]).first()
        if not existing:
            city = City(
                name=c["name"],
                country=c["country"],
                region=c.get("region"),
                cost_index=c.get("cost_index", 1.0),
                popularity=c.get("popularity", 50),
                image_url=c.get("image_url"),
                lat=c.get("lat"),
                lng=c.get("lng")
            )
            db.session.add(city)
            added_cities += 1
    
    if added_cities > 0:
        db.session.commit()
        print(f"[OK] Seeded/updated {added_cities} new cities in database.")
    else:
        print(f"[*] All {len(CITIES_DATA)} base cities already up-to-date in database.")

    added_acts = 0
    city_lookup = {c.name: c.id for c in City.query.all()}
    for name, category, cost, duration, city_name, desc, img in ACTIVITIES_SEED:
        city_id = city_lookup.get(city_name) if city_name else None
        existing_act = Activity.query.filter_by(name=name).first()
        if not existing_act:
            activity = Activity(
                name=name,
                category=category,
                cost_estimate=cost,
                duration_hours=duration,
                city_id=city_id,
                description=desc,
                image_url=img
            )
            db.session.add(activity)
            added_acts += 1

    if added_acts > 0:
        db.session.commit()
        print(f"[OK] Seeded {added_acts} new activities.")
    else:
        print(f"[*] Activities up-to-date.")
