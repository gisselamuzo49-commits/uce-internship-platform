from app.extensions import db
from datetime import datetime


# User model for students and admins
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='student')  # 'student' or 'admin'

    # Delete related records when user is deleted (cascade)
    applications = db.relationship(
        'Application',
        backref='student_user',
        lazy=True,
        cascade="all, delete-orphan"
    )

    experiences = db.relationship(
        'Experience',
        backref='student_user',
        lazy=True,
        cascade="all, delete-orphan"
    )

    certifications = db.relationship(
        'Certification',
        backref='student_user',
        lazy=True,
        cascade="all, delete-orphan"
    )

    tutor_requests = db.relationship(
        'TutorRequest',
        backref='student_user',
        lazy=True,
        cascade="all, delete-orphan"
    )

    appointments = db.relationship(
        'Appointment',
        backref='student_user',
        lazy=True,
        cascade="all, delete-orphan"
    )

    # Convert user object to dictionary
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'experiences': [exp.to_dict() for exp in self.experiences],
            'certifications': [cert.to_dict() for cert in self.certifications]
        }


# Work experience model
class Experience(db.Model):
    __tablename__ = 'experiences'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.String(20), nullable=False)
    end_date = db.Column(db.String(20), nullable=True)
    description = db.Column(db.Text, nullable=True)

    # Serialize experience data
    def to_dict(self):
        return {
            'id': self.id,
            'role': self.title,
            'company': self.company,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'description': self.description,
            'user_id': self.user_id
        }


# Certifications and courses model
class Certification(db.Model):
    __tablename__ = 'certifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    year = db.Column(db.String(10), nullable=False)

    # Serialize certification data
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'institution': self.institution,
            'year': self.year,
            'user_id': self.user_id
        }


# Tutor request model (formalization process)
class TutorRequest(db.Model):
    __tablename__ = 'tutor_requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=True)
    filename = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='Pendiente')
    memo_filename = db.Column(db.String(255), nullable=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    assigned_tutor = db.Column(db.String(100), nullable=True)
    tutor_email = db.Column(db.String(150), nullable=True)

    # Serialize tutor request data
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'filename': self.filename,
            'status': self.status,
            'date': self.date.strftime('%Y-%m-%d'),
            'assigned_tutor': self.assigned_tutor,
            'tutor_email': self.tutor_email,
            'memo_filename': self.memo_filename
        }


# Opportunities model (job/internship offers)
class Opportunity(db.Model):
    __tablename__ = 'opportunities'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    deadline = db.Column(db.String(20), nullable=False)
    vacancies = db.Column(db.Integer, default=1)
    type = db.Column(db.String(50), default='pasantia')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Delete related applications when opportunity is deleted
    applications = db.relationship(
        'Application',
        backref='opportunity',
        lazy=True,
        cascade="all, delete-orphan"
    )

    # Serialize opportunity data
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'description': self.description,
            'location': self.location,
            'deadline': self.deadline,
            'vacancies': self.vacancies,
            'type': self.type,
            'created_at': self.created_at.strftime('%Y-%m-%d')
        }


# Application model (student applications to opportunities)
class Application(db.Model):
    __tablename__ = 'applications'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    opportunity_id = db.Column(db.Integer, db.ForeignKey('opportunities.id'), nullable=False)
    status = db.Column(db.String(20), default='Pendiente')
    date = db.Column(db.DateTime, default=datetime.utcnow)
    approval_date = db.Column(db.DateTime, nullable=True)

    # One-to-one relationship with appointment
    appointment = db.relationship(
        'Appointment',
        backref='application',
        uselist=False,
        cascade="all, delete-orphan"
    )

    # Serialize application data
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'opportunity_id': self.opportunity_id,
            'status': self.status,
            'date': self.date.strftime('%Y-%m-%d')
        }


# Appointment/interview model
class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), default='Agendada')

    # Serialize appointment data
    def to_dict(self):
        return {
            'id': self.id,
            'application_id': self.application_id,
            'date': self.date,
            'time': self.time,
            'status': self.status,
            'opportunity_title': (
                self.application.opportunity.title
                if self.application and self.application.opportunity
                else 'Desconocido'
            )
        }
