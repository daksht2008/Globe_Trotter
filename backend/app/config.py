import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
INSTANCE_DIR = BASE_DIR / 'instance'
INSTANCE_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(BASE_DIR / '.env')

def get_database_uri():
    uri = os.getenv('DATABASE_URI')
    if not uri or 'instance/app.db' in uri:
        return f"sqlite:///{(INSTANCE_DIR / 'app.db').resolve().as_posix()}"
    return uri

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-prod')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-key-change-in-prod')
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PORT = int(os.getenv('PORT', 5000))
    
    # External APIs
    RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY', '')
    UNSPLASH_ACCESS_KEY = os.getenv('UNSPLASH_ACCESS_KEY', '')

