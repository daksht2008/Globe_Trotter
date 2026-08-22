import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-prod')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-key-change-in-prod')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', f"sqlite:///{os.path.join(BASE_DIR, '..', 'instance', 'app.db')}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # External APIs
    RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY', '')
    UNSPLASH_ACCESS_KEY = os.getenv('UNSPLASH_ACCESS_KEY', '')
