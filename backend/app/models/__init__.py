from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .city import City
from .activity import Activity
from .trip import Trip
from .stop import Stop
from .stop_activity import StopActivity

__all__ = ['db', 'User', 'City', 'Activity', 'Trip', 'Stop', 'StopActivity']
