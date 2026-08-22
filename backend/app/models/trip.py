from datetime import datetime, timezone
import uuid
from . import db

class Trip(db.Model):
    __tablename__ = 'trips'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    is_public = db.Column(db.Boolean, default=False)
    share_token = db.Column(db.String(64), unique=True, nullable=True, index=True)
    cover_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    stops = db.relationship('Stop', backref='trip', lazy=True, cascade='all, delete-orphan', order_by='Stop.order_index')

    def generate_share_token(self):
        if not self.share_token:
            self.share_token = uuid.uuid4().hex
        return self.share_token

    def to_dict(self, include_nested=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_public': self.is_public,
            'share_token': self.share_token,
            'cover_url': self.cover_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'stops_count': len(self.stops)
        }
        if include_nested:
            data['stops'] = [s.to_dict(include_nested=True) for s in self.stops]
        return data
