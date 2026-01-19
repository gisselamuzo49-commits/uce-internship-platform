import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import time
import secrets # Para generar contraseñas aleatorias a usuarios de Google

# Librerías de Email
from flask_mail import Mail, Message
# Librerías de Google
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

app = Flask(__name__)

# --- CONFIGURACIÓN ---
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://uce_user:uce_password@uce_postgres:5432/uce_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'clave-super-secreta-uce-2024' 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['UPLOAD_FOLDER'] = 'uploads'

# --- CONFIGURACIÓN EMAIL (Pon tus datos reales aquí) ---
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'tu_correo@gmail.com' 
app.config['MAIL_PASSWORD'] = 'tu_contraseña_aplicacion'
app.config['MAIL_DEFAULT_SENDER'] = 'tu_correo@gmail.com'

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

db = SQLAlchemy(app)
jwt = JWTManager(app)
mail = Mail(app)

# ==========================================
# MODELOS (Incluye Appointments y Certifications)
# ==========================================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='student')
    certifications = db.relationship('Certification', backref='user', lazy=True)
    def to_dict(self): return {'id': self.id, 'name': self.name, 'email': self.email, 'role': self.role, 'certifications': [c.to_dict() for c in self.certifications]}

class Certification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    year = db.Column(db.String(10), nullable=False)
    def to_dict(self): return {'id': self.id, 'title': self.title, 'institution': self.institution, 'year': self.year}

class Opportunity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(100), nullable=True)
    def to_dict(self): return {'id': self.id, 'title': self.title, 'company': self.company, 'description': self.description, 'location': self.location}

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    opportunity_title = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='Pendiente')
    date = db.Column(db.String(50), default=datetime.now().strftime("%Y-%m-%d"))
    def to_dict(self): return {'id': self.id, 'student_id': self.student_id, 'opportunity_title': self.opportunity_title, 'status': self.status, 'date': self.date}

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    application_id = db.Column(db.Integer, db.ForeignKey('application.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='Programada')
    def to_dict(self): return {'id': self.id, 'date': self.date, 'time': self.time, 'status': self.status, 'application_id': self.application_id}

# ==========================================
# RUTAS (Endpoints)
# ==========================================

# 🟢 NUEVA RUTA: LOGIN CON GOOGLE
@app.route('/api/google-login', methods=['POST'])
def google_login():
    token = request.json.get('token')
    
    # ¡IMPORTANTE! PEGA AQUÍ TU CLIENT ID DE GOOGLE CLOUD
    GOOGLE_CLIENT_ID = "282229570814-h2f8ok7uh91tddg8eltu6cfeeqi5u9j8.apps.googleusercontent.com" 

    try:
        # 1. Validar token con Google
        id_info = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        email = id_info['email']
        name = id_info.get('name', 'Usuario Google')

        # 2. Buscar si el usuario ya existe
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # 3. Si no existe, lo creamos
            random_pass = secrets.token_hex(16) # Contraseña segura aleatoria
            hashed_pass = generate_password_hash(random_pass, method='scrypt')
            
            user = User(
                name=name, 
                email=email, 
                password=hashed_pass, 
                role='student' # Rol por defecto
            )
            db.session.add(user)
            db.session.commit()

        # 4. Generar Token JWT (Igual que el login normal)
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'token': access_token, 'user': user.to_dict()}), 200

    except ValueError:
        return jsonify({'error': 'Token de Google inválido'}), 401
    except Exception as e:
        print("Error Google:", e)
        return jsonify({'error': 'Error interno'}), 500

# --- RUTAS EXISTENTES ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first(): return jsonify({'error': 'Email ya registrado'}), 400
    hashed_password = generate_password_hash(data['password'], method='scrypt')
    new_user = User(name=data['name'], email=data['email'], password=hashed_password, role='admin' if 'admin' in data['email'] else 'student')
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Usuario creado'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    try: db.create_all() # Auto-reparación
    except: pass
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'token': access_token, 'user': user.to_dict()}), 200
    return jsonify({'error': 'Credenciales inválidas'}), 401

@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    current_user_id = get_jwt_identity()
    data = request.json
    existing = Appointment.query.filter_by(application_id=data['application_id']).first()
    if existing: return jsonify({'error': 'Ya tienes una cita'}), 400
    new_app = Appointment(student_id=int(current_user_id), application_id=int(data['application_id']), date=data['date'], time=data['time'])
    db.session.add(new_app)
    db.session.commit()
    try: # Enviar correo
        user = User.query.get(int(current_user_id))
        msg = Message("Confirmación Entrevista UCE", recipients=[user.email])
        msg.body = f"Hola {user.name},\nTu entrevista es el {data['date']} a las {data['time']}."
        mail.send(msg)
    except: pass
    return jsonify({'message': 'Cita agendada'}), 201

@app.route('/api/profile', methods=['PUT'])

@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    if not user: return jsonify({'error': 'Usuario no encontrado'}), 404
    data = request.json
    if 'name' in data: user.name = data['name']
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first(): return jsonify({'error': 'Email ocupado'}), 400
        user.email = data['email']
    if 'password' in data and data['password']: user.password = generate_password_hash(data['password'], method='scrypt')
    db.session.commit()
    return jsonify({'message': 'Perfil actualizado', 'user': user.to_dict()}), 200
# --- ESTA ES LA RUTA QUE TE FALTA PARA EL OJITO ---
@app.route('/api/profile/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_profile(user_id):
    # Buscar el usuario por su ID
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    # Devolver sus datos al Admin
    return jsonify(user.to_dict()), 200
@app.route('/api/certifications', methods=['POST'])
@jwt_required()
def add_certification():
    current_user_id = get_jwt_identity()
    data = request.json
    new_cert = Certification(user_id=int(current_user_id), title=data['title'], institution=data['institution'], year=data['year'])
    db.session.add(new_cert)
    db.session.commit()
    user = User.query.get(int(current_user_id))
    return jsonify({'message': 'Agregado', 'certifications': [c.to_dict() for c in user.certifications]}), 201

@app.route('/api/certifications/<int:cert_id>', methods=['DELETE'])
@jwt_required()
def delete_certification(cert_id):
    cert = Certification.query.get(cert_id)
    if not cert: return jsonify({'error': 'No encontrado'}), 404
    db.session.delete(cert)
    db.session.commit()
    return jsonify({'message': 'Eliminado'}), 200

@app.route('/api/applications', methods=['GET', 'POST'])
@jwt_required()
def applications():
    current_user_id = get_jwt_identity()
    if request.method == 'POST':
        data = request.json
        new_app = Application(student_id=int(current_user_id), opportunity_title=data['opportunity_title'])
        db.session.add(new_app)
        db.session.commit()
        return jsonify({'message': 'Postulación enviada'}), 201
    apps = Application.query.all()
    return jsonify([app.to_dict() for app in apps]), 200

@app.route('/api/opportunities', methods=['GET', 'POST'])
def opportunities():
    if request.method == 'POST':
        data = request.json
        new_op = Opportunity(title=data['title'], company=data['company'], description=data.get('description', ''), location=data.get('location', 'Quito'))
        db.session.add(new_op)
        db.session.commit()
        return jsonify({'message': 'Oportunidad creada'}), 201
    ops = Opportunity.query.all()
    return jsonify([op.to_dict() for op in ops]), 200

@app.route('/api/applications/<int:app_id>', methods=['PUT'])
@jwt_required()
def update_application_status(app_id):
    data = request.json
    app_obj = Application.query.get(app_id)
    if not app_obj: return jsonify({'error': 'No encontrada'}), 404
    app_obj.status = data.get('status')
    db.session.commit()
    return jsonify({'message': 'Estado actualizado'}), 200

@app.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    if user.role == 'admin': citas = Appointment.query.all()
    else: citas = Appointment.query.filter_by(student_id=int(current_user_id)).all()
    return jsonify([c.to_dict() for c in citas]), 200

@app.route('/api/upload-cv', methods=['POST'])
@jwt_required()
def upload_cv():
    current_user_id = get_jwt_identity()
    if 'file' not in request.files: return jsonify({'error': 'No file'}), 400
    file = request.files['file']
    filename = f"cv_{current_user_id}.pdf"
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return jsonify({'message': 'CV guardado'}), 200

@app.route('/api/cv/<int:user_id>', methods=['GET'])
def get_cv(user_id):
    filename = f"cv_{user_id}.pdf"
    try: return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except: return jsonify({'error': 'CV no encontrado'}), 404

# INICIALIZACIÓN SEGURA
with app.app_context():
    try: db.create_all(); print("✅ Tablas Sincronizadas")
    except Exception as e: print("Esperando DB:", e)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)