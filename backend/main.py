from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
import os
import threading
import datetime

# --- LIBRERÍAS DE GOOGLE ---
try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
except ImportError:
    print("⚠️ Warning: Google Auth libraries not found.")

app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN (No requiere cambios manuales) ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///uce_internship.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key-uce'
app.config['UPLOAD_FOLDER'] = 'uploads'

# --- CONFIGURACIÓN EMAIL (Opcional - Requiere App Password de 16 letras) ---
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'tucorreo@gmail.com' 
app.config['MAIL_PASSWORD'] = 'tu_clave_16_letras' 
app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']

db = SQLAlchemy(app)
jwt = JWTManager(app)
mail = Mail(app)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# --- MODELOS DE BASE DE DATOS ---

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='student')
    certifications = db.relationship('Certification', backref='student', lazy=True, cascade="all, delete-orphan")
    applications = db.relationship('Application', backref='student', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'email': self.email, 'role': self.role,
            'certifications': [c.to_dict() for c in self.certifications]
        }

class Certification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    year = db.Column(db.String(4), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'institution': self.institution, 'year': self.year}

class Opportunity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'company': self.company, 'description': self.description}

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    opportunity_id = db.Column(db.Integer, db.ForeignKey('opportunity.id'), nullable=False)
    status = db.Column(db.String(20), default='Pendiente')
    date = db.Column(db.String(20), nullable=False)
    opportunity = db.relationship('Opportunity', backref='applications')
    def to_dict(self):
        return {'id': self.id, 'opportunity_title': self.opportunity.title, 'status': self.status, 'date': self.date, 'student_id': self.student_id}

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    application_id = db.Column(db.Integer, db.ForeignKey('application.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(20), nullable=False)

# --- RUTAS DE AUTENTICACIÓN ---

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Credenciales incorrectas'}), 401
    return jsonify({'token': create_access_token(identity=str(user.id)), 'user': user.to_dict()}), 200

@app.route('/api/google-login', methods=['POST'])
def google_login():
    try:
        token = request.json.get('token')
        CLIENT_ID = "282229570814-h2f8ok7uh91tddg8eltu6cfeeqi5u9j8.apps.googleusercontent.com"
        id_info = id_token.verify_oauth2_token(token, google_requests.Request(), audience=CLIENT_ID)
        user = User.query.filter_by(email=id_info['email']).first()
        if not user:
            user = User(name=id_info['name'], email=id_info['email'], password=generate_password_hash("google_pw"), role='student')
            db.session.add(user)
            db.session.commit()
        return jsonify({'token': create_access_token(identity=str(user.id)), 'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# --- RUTAS DE PERFIL Y CERTIFICACIONES ---

@app.route('/api/certifications', methods=['POST'])
@jwt_required()
def add_certification():
    try:
        user_id = get_jwt_identity()
        data = request.json
        new_cert = Certification(title=data['title'], institution=data['institution'], year=str(data['year']), student_id=int(user_id))
        db.session.add(new_cert)
        db.session.commit()
        all_certs = Certification.query.filter_by(student_id=int(user_id)).all()
        return jsonify({'certifications': [c.to_dict() for c in all_certs]}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/certifications/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_certification(id):
    cert = Certification.query.get(id)
    if cert:
        db.session.delete(cert)
        db.session.commit()
    return jsonify({'message': 'Deleted'}), 200

@app.route('/api/profile/<int:id>', methods=['GET'])
@jwt_required()
def get_profile(id):
    user = User.query.get(id)
    return jsonify(user.to_dict()) if user else (jsonify({'error': 'Not found'}), 404)

# --- RUTAS DE OPORTUNIDADES Y GESTIÓN ---

@app.route('/api/opportunities', methods=['GET', 'POST'])
def handle_opportunities():
    if request.method == 'POST':
        data = request.json
        new_opp = Opportunity(title=data['title'], company=data['company'], description=data['description'])
        db.session.add(new_opp)
        db.session.commit()
        return jsonify({'message': 'Created'}), 201
    return jsonify([o.to_dict() for o in Opportunity.query.all()]), 200

@app.route('/api/applications', methods=['POST', 'GET'])
@jwt_required()
def handle_applications():
    user_id = get_jwt_identity()
    if request.method == 'POST':
        data = request.json
        opp_id = data.get('opportunity_id') or data.get('id')
        new_app = Application(student_id=int(user_id), opportunity_id=int(opp_id), date=datetime.datetime.now().strftime("%Y-%m-%d"))
        db.session.add(new_app)
        db.session.commit()
        return jsonify({'message': 'OK'}), 201
    return jsonify([a.to_dict() for a in Application.query.all()]), 200

@app.route('/api/applications/<int:id>', methods=['PUT'])
@jwt_required()
def update_status(id):
    ap = Application.query.get(id)
    if ap:
        ap.status = request.json.get('status')
        db.session.commit()
    return jsonify({'message': 'Updated'}), 200

@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    try:
        data = request.json
        new_apt = Appointment(student_id=int(get_jwt_identity()), application_id=int(data['application_id']), date=data['date'], time=data['time'])
        db.session.add(new_apt)
        db.session.commit()
        return jsonify({'message': 'Scheduled'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/cv/<int:student_id>', methods=['GET'])
def get_cv(student_id):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], f"cv_{student_id}.pdf")
    except:
        return jsonify({'error': 'CV not found'}), 404

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)