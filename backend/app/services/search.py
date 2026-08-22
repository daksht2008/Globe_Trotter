import os
import requests
from flask import current_app

def fetch_geodb_cities(query: str, limit: int = 10) -> list:
    """
    Search cities using GeoDB Cities API (RapidAPI free tier).
    Returns list of dicts with city, country, region, lat, lng, population.
    """
    api_key = current_app.config.get('RAPIDAPI_KEY') or os.getenv('RAPIDAPI_KEY', '')
    if not api_key or not query:
        return []
    
    url = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities"
    headers = {
        "X-RapidAPI-Key": api_key,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
    }
    params = {
        "namePrefix": query,
        "limit": limit,
        "sort": "-population"
    }
    try:
        response = requests.get(url, headers=headers, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json().get("data", [])
            return [
                {
                    "name": item.get("city"),
                    "country": item.get("country"),
                    "region": item.get("region"),
                    "lat": item.get("latitude"),
                    "lng": item.get("longitude"),
                    "popularity": (item.get("population") or 0) // 100000
                }
                for item in data
            ]
    except Exception as e:
        current_app.logger.error(f"GeoDB Cities API Error: {e}")
    return []


def fetch_country_details(country_name: str) -> dict:
    """
    Fetch country metadata (currency, flag, capital, subregion) via REST Countries API.
    """
    if not country_name:
        return {}
    url = f"https://restcountries.com/v3.1/name/{country_name}?fullText=false"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()[0]
            currencies = list(data.get("currencies", {}).keys())
            return {
                "flag": data.get("flag", ""),
                "currency": currencies[0] if currencies else "USD",
                "subregion": data.get("subregion", ""),
                "capital": data.get("capital", [""])[0] if data.get("capital") else ""
            }
    except Exception as e:
        current_app.logger.error(f"REST Countries API Error: {e}")
    return {}


def fetch_unsplash_photo(query: str, fallback_category: str = "city travel") -> str:
    """
    Fetch high-res photo URL from Unsplash API for cities, activities, or cover photos.
    """
    access_key = current_app.config.get('UNSPLASH_ACCESS_KEY') or os.getenv('UNSPLASH_ACCESS_KEY', '')
    fallback_url = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
    
    if not access_key or not query:
        return fallback_url
        
    url = "https://api.unsplash.com/search/photos"
    headers = {"Authorization": f"Client-ID {access_key}"}
    params = {
        "query": f"{query} {fallback_category}",
        "per_page": 1,
        "orientation": "landscape"
    }
    try:
        response = requests.get(url, headers=headers, params=params, timeout=5)
        if response.status_code == 200:
            results = response.json().get("results", [])
            if results:
                return results[0]["urls"]["regular"]
    except Exception as e:
        current_app.logger.error(f"Unsplash API Error: {e}")
    return fallback_url


def geocode_location_osm(location_name: str) -> tuple:
    """
    Free geocoding lookup (latitude, longitude) via OpenStreetMap Nominatim API.
    Returns (lat, lng) or (None, None).
    """
    if not location_name:
        return None, None
        
    url = "https://nominatim.openstreetmap.org/search"
    headers = {"User-Agent": "GlobeTrotterApp/1.0"}
    params = {
        "q": location_name,
        "format": "json",
        "limit": 1
    }
    try:
        response = requests.get(url, headers=headers, params=params, timeout=5)
        if response.status_code == 200 and response.json():
            item = response.json()[0]
            return float(item["lat"]), float(item["lon"])
    except Exception as e:
        current_app.logger.error(f"OpenStreetMap Geocoding Error: {e}")
    return None, None
