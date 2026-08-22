from . import db

class Stop(db.Model):
    __tablename__ = 'stops'

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=False)
    city_id = db.Column(db.Integer, db.ForeignKey('cities.id'), nullable=False)
    order_index = db.Column(db.Integer, nullable=False, default=0)
    arrival_date = db.Column(db.Date, nullable=True)
    departure_date = db.Column(db.Date, nullable=True)
    notes = db.Column(db.Text, nullable=True)

    city = db.relationship('City', lazy=True)
    stop_activities = db.relationship('StopActivity', backref='stop', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_nested=False):
        data = {
            'id': self.id,
            'trip_id': self.trip_id,
            'city_id': self.city_id,
            'city': self.city.to_dict() if self.city else None,
            'order_index': self.order_index,
            'arrival_date': self.arrival_date.isoformat() if self.arrival_date else None,
            'departure_date': self.departure_date.isoformat() if self.departure_date else None,
            'notes': self.notes
        }
        if include_nested:
            data['activities'] = [sa.to_dict() for sa in self.stop_activities]
        return data
