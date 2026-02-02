from app.extensions import db
from datetime import datetime

# ==============================================================================
# 1. USUARIO (ESTUDIANTE / ADMIN)
# ==============================================================================
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='student') # 'student' o 'admin'

    # --- RELACIONES ---
    # cascade="all, delete-orphan" asegura que si borras al usuario, se borren sus datos
    applications = db.relationship('Application', backref='student_user', lazy=True, cascade="all, delete-orphan")
    experiences = db.relationship('Experience', backref='student_user', lazy=True, cascade="all, delete-orphan")
    certifications = db.relationship('Certification', backref='student_user', lazy=True, cascade="all, delete-orphan")
    tutor_requests = db.relationship('TutorRequest', backref='student_user', lazy=True, cascade="all, delete-orphan")
    appointments = db.relationship('Appointment', backref='student_user', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id, 
            'name': self.name, 
            'email': self.email, 
            'role': self.role,
            # Importante: Serializamos las listas para el Frontend
            'experiences': [exp.to_dict() for exp in self.experiences],
            'certifications': [cert.to_dict() for cert in self.certifications]
        }

# ==============================================================================
# 2. EXPERIENCIA LABORAL
# ==============================================================================
class Experience(db.Model):
    __tablename__ = 'experiences'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False) # En frontend se usa como 'role'
    company = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.String(20), nullable=False)
    end_date = db.Column(db.String(20), nullable=True)
    description = db.Column(db.Text, nullable=True)

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

# ==============================================================================
# 3. CERTIFICACIONES Y CURSOS
# ==============================================================================
class Certification(db.Model):
    __tablename__ = 'certifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    year = db.Column(db.String(10), nullable=False)

    def to_dict(self):
        return {
            'id': self.id, 
            'title': self.title, 
            'institution': self.institution, 
            'year': self.year,
            'user_id': self.user_id
        }

# ==============================================================================
# 4. SOLICITUDES DE TUTORÍA (FORMALIZACIÓN) - ¡MODIFICADO!
# ==============================================================================
class TutorRequest(db.Model):
    __tablename__ = 'tutor_requests'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=True)
    filename = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='Pendiente')
    memo_filename = db.Column(db.String(255), nullable=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 👇 Datos del Tutor Asignado
    assigned_tutor = db.Column(db.String(100), nullable=True)
    # 👇 NUEVO CAMPO CORREO:
    tutor_email = db.Column(db.String(150), nullable=True) 

    def to_dict(self):
        return {
            'id': self.id, 
            'title': self.title, 
            'filename': self.filename, 
            'status': self.status, 
            'date': self.date.strftime('%Y-%m-%d'),
            'assigned_tutor': self.assigned_tutor,
            'tutor_email': self.tutor_email, # <-- Agregado al diccionario
            'memo_filename': self.memo_filename
        }

# ==============================================================================
# 5. OPORTUNIDADES (OFERTAS)
# ==============================================================================
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
    
    applications = db.relationship('Application', backref='opportunity', lazy=True, cascade="all, delete-orphan")

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

# ==============================================================================
# 6. APLICACIONES (POSTULACIONES)
# ==============================================================================
class Application(db.Model):
    __tablename__ = 'applications'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    opportunity_id = db.Column(db.Integer, db.ForeignKey('opportunities.id'), nullable=False)
    status = db.Column(db.String(20), default='Pendiente')
    date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con la cita (1 a 1)
    appointment = db.relationship('Appointment', backref='application', uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id, 
            'student_id': self.student_id, 
            'opportunity_id': self.opportunity_id, 
            'status': self.status, 
            'date': self.date.strftime('%Y-%m-%d')
        }

# ==============================================================================
# 7. CITAS / ENTREVISTAS
# ==============================================================================
class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), default='Agendada')

    def to_dict(self):
        return {
            'id': self.id,
            'application_id': self.application_id,
            'date': self.date,
            'time': self.time,
            'status': self.status,
            'opportunity_title': self.application.opportunity.title if self.application and self.application.opportunity else 'Desconocido'
        }