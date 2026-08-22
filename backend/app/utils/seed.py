from faker import Faker
from ..models import db, City, Activity

fake = Faker()

CITIES_DATA = [
    {"name": "Paris", "country": "France", "region": "Europe", "cost_index": 1.4, "popularity": 98, "lat": 48.8566, "lng": 2.3522, "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800"},
    {"name": "Tokyo", "country": "Japan", "region": "Asia", "cost_index": 1.3, "popularity": 99, "lat": 35.6762, "lng": 139.6503, "image_url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800"},
    {"name": "New York", "country": "United States", "region": "North America", "cost_index": 1.6, "popularity": 96, "lat": 40.7128, "lng": -74.0060, "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800"},
    {"name": "Rome", "country": "Italy", "region": "Europe", "cost_index": 1.2, "popularity": 94, "lat": 41.9028, "lng": 12.4964, "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800"},
    {"name": "Barcelona", "country": "Spain", "region": "Europe", "cost_index": 1.1, "popularity": 92, "lat": 41.3879, "lng": 2.16992, "image_url": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800"},
    {"name": "London", "country": "United Kingdom", "region": "Europe", "cost_index": 1.5, "popularity": 97, "lat": 51.5074, "lng": -0.1278, "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800"},
    {"name": "Dubai", "country": "United Arab Emirates", "region": "Middle East", "cost_index": 1.4, "popularity": 90, "lat": 25.2048, "lng": 55.2708, "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800"},
    {"name": "Bangkok", "country": "Thailand", "region": "Asia", "cost_index": 0.7, "popularity": 91, "lat": 13.7563, "lng": 100.5018, "image_url": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800"},
    {"name": "Sydney", "country": "Australia", "region": "Oceania", "cost_index": 1.35, "popularity": 88, "lat": -33.8688, "lng": 151.2093, "image_url": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800"},
    {"name": "Amsterdam", "country": "Netherlands", "region": "Europe", "cost_index": 1.3, "popularity": 89, "lat": 52.3676, "lng": 4.9041, "image_url": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800"},
    {"name": "Singapore", "country": "Singapore", "region": "Asia", "cost_index": 1.45, "popularity": 93, "lat": 1.3521, "lng": 103.8198, "image_url": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800"},
    {"name": "Kyoto", "country": "Japan", "region": "Asia", "cost_index": 1.15, "popularity": 87, "lat": 35.0116, "lng": 135.7681, "image_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800"},
    {"name": "Berlin", "country": "Germany", "region": "Europe", "cost_index": 1.1, "popularity": 86, "lat": 52.5200, "lng": 13.4050, "image_url": "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800"},
    {"name": "Rio de Janeiro", "country": "Brazil", "region": "South America", "cost_index": 0.8, "popularity": 83, "lat": -22.9068, "lng": -43.1729, "image_url": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800"},
    {"name": "Cairo", "country": "Egypt", "region": "Africa", "cost_index": 0.6, "popularity": 81, "lat": 30.0444, "lng": 31.2357, "image_url": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800"},
    {"name": "Cape Town", "country": "South Africa", "region": "Africa", "cost_index": 0.75, "popularity": 82, "lat": -33.9249, "lng": 18.4241, "image_url": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800"},
    {"name": "Prague", "country": "Czech Republic", "region": "Europe", "cost_index": 0.9, "popularity": 85, "lat": 50.0755, "lng": 14.4378, "image_url": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800"},
    {"name": "Seoul", "country": "South Korea", "region": "Asia", "cost_index": 1.2, "popularity": 91, "lat": 37.5665, "lng": 126.9780, "image_url": "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800"},
    {"name": "Istanbul", "country": "Turkey", "region": "Europe/Asia", "cost_index": 0.75, "popularity": 88, "lat": 41.0082, "lng": 28.9784, "image_url": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800"},
    {"name": "San Francisco", "country": "United States", "region": "North America", "cost_index": 1.55, "popularity": 89, "lat": 37.7749, "lng": -122.4194, "image_url": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800"}
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
    ("Akihabara Tech & Anime Exploration", "shopping", 20.0, 3.0, "Tokyo", "Explore multi-level retro electronics and hobby shops.", "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600"),

    # New York
    ("Central Park Bike Tour", "adventure", 25.0, 2.0, "New York", "Cycle through lush paths, Bethesda Fountain, and Bow Bridge.", "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600"),
    ("Broadway Musical Experience", "culture", 120.0, 3.0, "New York", "World-class musical theater performance in Times Square.", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600"),
    ("Statue of Liberty & Ellis Island", "sightseeing", 32.0, 4.0, "New York", "Ferry to Liberty Island with audio guide and pedestal access.", "https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=600"),
    ("Chelsea Market & High Line Stroll", "food", 40.0, 2.5, "New York", "Artisanal food hall delicacies along elevated urban park.", "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=600"),

    # Rome
    ("Colosseum & Roman Forum Tour", "culture", 40.0, 3.0, "Rome", "Skip-the-line guided exploration of gladiatorial arena.", "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600"),
    ("Vatican Museums & Sistine Chapel", "culture", 48.0, 3.5, "Rome", "Michelangelo's ceiling masterpiece and St. Peter's Basilica.", "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=600"),
    ("Trastevere Food & Wine Walking Tour", "food", 65.0, 3.0, "Rome", "Authentic cacio e pepe, supplì, and crisp local vino.", "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=600"),

    # Barcelona
    ("Sagrada Familia Guided Discovery", "culture", 35.0, 2.0, "Barcelona", "Gaudi's soaring basilica with rainbow stained glass.", "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600"),
    ("Park Güell Panoramic Visit", "sightseeing", 15.0, 2.0, "Barcelona", "Whimsical mosaic lizards and Mediterranean city vistas.", "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600"),
    ("Tapas Crawl in Gothic Quarter", "food", 45.0, 2.5, "Barcelona", "Patatas bravas, jamón ibérico, and vermouth tasting.", "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600"),

    # London
    ("Tower of London & Crown Jewels", "culture", 38.0, 2.5, "London", "Centuries of royal history and the sparkling Crown Jewels.", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600"),
    ("London Eye Sunset Flight", "sightseeing", 42.0, 1.0, "London", "Giant observation wheel with 360-degree skyline views.", "https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600"),
    ("Borough Market Gastronomy Walk", "food", 30.0, 2.0, "London", "Artisanal cheeses, hot pastries, and world street food.", "https://images.unsplash.com/photo-1534081333815-ae5019106622?w=600"),

    # Dubai
    ("Burj Khalifa Level 148 Observation", "sightseeing", 95.0, 2.0, "Dubai", "Stand atop the world's tallest skyscraper.", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600"),
    ("Desert Safari with Dune Bashing & BBQ", "adventure", 70.0, 6.0, "Dubai", "4x4 thrill ride, sandboarding, and Bedouin camp banquet.", "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=600"),
    ("Dubai Mall Gold & Spice Souk Tour", "shopping", 10.0, 3.0, "Dubai", "From futuristic luxury malls to fragrant traditional souks.", "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600"),

    # Bangkok
    ("Grand Palace & Emerald Buddha", "culture", 18.0, 2.5, "Bangkok", "Opulent royal residence and sacred Buddhist shrine.", "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600"),
    ("Chinatown Street Food Night Tour", "food", 25.0, 3.0, "Bangkok", "Michelin-recommended pad thai, satay, and mango sticky rice.", "https://images.unsplash.com/photo-1563492065599-3580f7752006?w=600"),
    ("Floating Market & Longtail Boat", "adventure", 35.0, 4.0, "Bangkok", "Navigate canals lined with wooden vendor boats.", "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600"),

    # Sydney
    ("Sydney Opera House Backstage Tour", "culture", 40.0, 2.0, "Sydney", "Architectural secrets and concert halls of the harbor icon.", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600"),
    ("Bondi to Coogee Coastal Walk", "adventure", 0.0, 3.0, "Sydney", "Breathtaking clifftop trail above crashing ocean waves.", "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=600"),
    ("Sydney Harbour Kayak Adventure", "adventure", 55.0, 2.5, "Sydney", "Paddle under the Harbour Bridge at sunrise.", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"),

    # Amsterdam
    ("Rijksmuseum & Van Gogh Masterpieces", "culture", 42.0, 3.0, "Amsterdam", "Rembrandt's Night Watch and Van Gogh's Sunflowers.", "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600"),
    ("Canal Ring Historic Cruise", "sightseeing", 22.0, 1.5, "Amsterdam", "UNESCO World Heritage waterways and 17th-century mansions.", "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=600"),
    ("Jordaan Vintage Boutique Hunting", "shopping", 15.0, 2.5, "Amsterdam", "Quaint canalside fashion boutiques and art galleries.", "https://images.unsplash.com/photo-1584003564911-a7a321c84e1c?w=600"),

    # Singapore
    ("Gardens by the Bay & Supertree Observatory", "sightseeing", 28.0, 2.5, "Singapore", "Futuristic botanical conservatories and glowing vertical gardens.", "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600"),
    ("Marina Bay Sands SkyPark Deck", "sightseeing", 32.0, 1.5, "Singapore", "57-floor rooftop observation deck with panoramic city skyline.", "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=600"),
    ("Hawker Center Feast (Lau Pa Sat)", "food", 20.0, 2.0, "Singapore", "Hainanese chicken rice, satay skewers, and laksa.", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600"),

    # Kyoto
    ("Fushimi Inari 10,000 Torii Shrine Hike", "culture", 0.0, 3.0, "Kyoto", "Walk beneath vibrant vermilion gates winding up Mount Inari.", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600"),
    ("Arashiyama Bamboo Grove & Monkey Park", "adventure", 12.0, 2.5, "Kyoto", "Towering green bamboo stalks and mountain summit view.", "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600"),
    ("Traditional Tea Ceremony in Gion", "culture", 35.0, 1.5, "Kyoto", "Authentic matcha preparation in a historic wooden teahouse.", "https://images.unsplash.com/photo-1578637387939-43c525550085?w=600"),

    # Berlin
    ("Museum Island & Pergamon Tour", "culture", 25.0, 3.0, "Berlin", "Treasures of antiquity in a UNESCO museum ensemble.", "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600"),
    ("Berlin Wall Memorial & Street Art", "culture", 0.0, 2.5, "Berlin", "East Side Gallery open-air murals and Cold War history.", "https://images.unsplash.com/photo-1587330979470-3595ac045ab0?w=600"),

    # Rio de Janeiro
    ("Christ the Redeemer by Cog Train", "sightseeing", 35.0, 3.0, "Rio de Janeiro", "Iconic Corcovado mountain peak over Guanabara Bay.", "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600"),
    ("Sugarloaf Mountain Cable Car", "adventure", 30.0, 2.5, "Rio de Janeiro", "Sunset cable car ascent above Copacabana and Ipanema.", "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=600"),

    # Cape Town
    ("Table Mountain Aerial Cableway", "adventure", 28.0, 2.5, "Cape Town", "Ascend the flat-topped natural wonder for oceanic panoramas.", "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600"),
    ("Boulders Beach Penguin Sanctuary", "adventure", 18.0, 2.0, "Cape Town", "Stroll wooden boardwalks right beside African penguin colonies.", "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600"),

    # Prague
    ("Prague Castle & St. Vitus Cathedral", "culture", 20.0, 3.0, "Prague", "Largest ancient castle complex overlooking the Vltava River.", "https://images.unsplash.com/photo-1541849546-216549ae216d?w=600"),
    ("Old Town Square & Medieval Beer Hall", "food", 25.0, 2.5, "Prague", "Astronomical Clock chime and traditional Czech pilsner.", "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600"),

    # Generic / Multi-city Activities
    ("Local Farmers & Artisan Flea Market", "shopping", 10.0, 2.0, None, "Browse handmade crafts, regional spices, and organic snacks.", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600"),
    ("Sunset Photography Walk", "sightseeing", 0.0, 1.5, None, "Capture golden hour light across picturesque historic alleys.", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600"),
    ("Cooking Masterclass with Local Chef", "food", 60.0, 3.5, None, "Hands-on preparation of regional signature 3-course dinner.", "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600"),
    ("Guided Cycling Architecture Trail", "adventure", 25.0, 2.5, None, "Pedal across bridges and architectural landmarks.", "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600"),
    ("Historic Walking Ghost & Legends Tour", "culture", 18.0, 2.0, None, "Spooky tales and folklore under lantern-lit cobblestones.", "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600")
]

def seed_database():
    """Idempotently seed cities and activities."""
    city_count = City.query.count()
    if city_count == 0:
        print("[+] Seeding cities...")
        city_objs = {}
        for c in CITIES_DATA:
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
            city_objs[c["name"]] = city
        db.session.commit()
        print(f"[OK] Seeded {len(city_objs)} cities.")
    else:
        print(f"[*] Cities already seeded ({city_count} found).")

    act_count = Activity.query.count()
    if act_count == 0:
        print("[+] Seeding activities...")
        city_lookup = {c.name: c.id for c in City.query.all()}
        for name, category, cost, duration, city_name, desc, img in ACTIVITIES_SEED:
            city_id = city_lookup.get(city_name) if city_name else None
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
        db.session.commit()
        print(f"[OK] Seeded {len(ACTIVITIES_SEED)} activities.")
    else:
        print(f"[*] Activities already seeded ({act_count} found).")

