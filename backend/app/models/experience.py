from app.db import db
from datetime import datetime

class Experience(db.Model):
    __tablename__ = 'experiences'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    period = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    # Relación con el usuario que creaste antes
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'date': self.period,
            'user_id': self.user_id
        }