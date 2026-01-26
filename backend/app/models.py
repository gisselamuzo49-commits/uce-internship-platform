from app.extensions import db
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime

# 1. MODELO DE USUARIO (Fusionado)
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='student')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relaciones
    certifications = db.relationship('Certification', backref='student', lazy=True, cascade="all, delete-orphan")
    experiences = db.relationship('Experience', backref='student', lazy=True, cascade="all, delete-orphan")
    tutor_requests = db.relationship('TutorRequest', backref='student', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id, 
            'name': self.name, 
            'email': self.email, 
            'role': self.role, 
            'certifications': [c.to_dict() for c in self.certifications],
            'experiences': [e.to_dict() for e in self.experiences],
            # 👇 AQUÍ ESTABA EL ERROR: Faltaba enviar esto al frontend 👇
            'tutor_requests': [tr.to_dict() for tr in self.tutor_requests]
        }
# 2. MODELO DE EXPERIENCIA (Fusionado)
class Experience(db.Model):
    __tablename__ = 'experiences'

    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    
    # Mantenemos start_date y end_date porque es más preciso que "period"
    start_date = db.Column(db.String(20), nullable=False)
    end_date = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id, 'company': self.company, 'role': self.role, 
            'start_date': self.start_date, 'end_date': self.end_date, 
            'description': self.description
        }

# 3. MODELO DE CERTIFICACIONES (Igual al anterior)
class Certification(db.Model):
    __tablename__ = 'certifications'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    year = db.Column(db.String(4), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    def to_dict(self): return {'id': self.id, 'title': self.title, 'institution': self.institution, 'year': self.year}

# 4. MODELO DE OPORTUNIDADES (Fusionado con tus campos nuevos: salary, type)
class Opportunity(db.Model):
    __tablename__ = 'opportunities'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100), default='Quito')
    
    # --- TUS CAMPOS NUEVOS ---
    type = db.Column(db.String(50), default='hibrido') # presencial, remoto, hibrido
    salary = db.Column(db.String(50), nullable=True)
    # -------------------------

    deadline = db.Column(db.String(20), nullable=True)
    vacancies = db.Column(db.Integer, default=1)
    attributes = db.Column(JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'title': self.title, 'company': self.company, 
            'description': self.description, 'location': self.location, 
            'type': self.type, 'salary': self.salary, # <--- Agregados al JSON
            'deadline': self.deadline, 'vacancies': self.vacancies,
            'attributes': self.attributes
        }

# 5. MODELO DE APLICACIONES (Postulaciones)
class Application(db.Model):
    __tablename__ = 'applications'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    opportunity_id = db.Column(db.Integer, db.ForeignKey('opportunities.id'), nullable=False)
    status = db.Column(db.String(20), default='Pendiente')
    date = db.Column(db.String(20), nullable=False)
    
    # Relaciones para poder acceder a los datos
    opportunity = db.relationship('Opportunity', backref='applications')
    
    def to_dict(self):
        student = User.query.get(self.student_id)
        return {
            'id': self.id, 
            'opportunity_title': self.opportunity.title, 
            'company': self.opportunity.company, 
            'status': self.status, 
            'date': self.date, 
            'student_name': student.name if student else "Desconocido"
        }

# 6. MODELO DE CITAS (Entrevistas)
class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(20), nullable=False)

# 7. MODELO DE SOLICITUD DE TUTOR (Formalización)
class TutorRequest(db.Model):
    __tablename__ = 'tutor_requests'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    filename = db.Column(db.String(200), nullable=False) 
    status = db.Column(db.String(20), default='Pendiente') 
    tutor_name = db.Column(db.String(100), nullable=True) 
    date = db.Column(db.String(20), nullable=False)
    
    def to_dict(self):
        student = User.query.get(self.student_id)
        return {
            'id': self.id, 
            'student_name': student.name if student else "Desconocido", 
            'title': self.title, 
            'filename': self.filename, 
            'status': self.status, 
            'tutor_name': self.tutor_name, 
            'date': self.date
        }