from . import db

class Activity(db.Model):
    __tablename__ = 'activities'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)  # sightseeing/food/adventure/culture/shopping
    cost_estimate = db.Column(db.Float, default=0.0)
    duration_hours = db.Column(db.Float, default=1.0)
    city_id = db.Column(db.Integer, db.ForeignKey('cities.id'), nullable=True)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'cost_estimate': self.cost_estimate,
            'duration_hours': self.duration_hours,
            'city_id': self.city_id,
            'city_name': self.city.name if self.city else None,
            'description': self.description,
            'image_url': self.image_url
        }
