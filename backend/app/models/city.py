from . import db

class City(db.Model):
    __tablename__ = 'cities'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    country = db.Column(db.String(100), nullable=False, index=True)
    region = db.Column(db.String(100), nullable=True)
    cost_index = db.Column(db.Float, default=1.0)
    popularity = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(500), nullable=True)
    lat = db.Column(db.Float, nullable=True)
    lng = db.Column(db.Float, nullable=True)

    activities = db.relationship('Activity', backref='city', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'country': self.country,
            'region': self.region,
            'cost_index': self.cost_index,
            'popularity': self.popularity,
            'image_url': self.image_url,
            'lat': self.lat,
            'lng': self.lng
        }
