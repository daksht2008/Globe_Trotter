from . import db

class StopActivity(db.Model):
    __tablename__ = 'stop_activities'
    __table_args__ = (
        db.UniqueConstraint('stop_id', 'activity_id', name='uq_stop_activity'),
    )

    id = db.Column(db.Integer, primary_key=True)
    stop_id = db.Column(db.Integer, db.ForeignKey('stops.id'), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id'), nullable=False)
    day_number = db.Column(db.Integer, nullable=True)
    time_slot = db.Column(db.String(20), nullable=True)  # morning / afternoon / evening
    notes = db.Column(db.Text, nullable=True)

    activity = db.relationship('Activity', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'stop_id': self.stop_id,
            'activity_id': self.activity_id,
            'day_number': self.day_number,
            'time_slot': self.time_slot,
            'notes': self.notes,
            'activity': self.activity.to_dict() if self.activity else None
        }
