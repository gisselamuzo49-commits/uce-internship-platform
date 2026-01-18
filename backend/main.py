import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://uce_user:uce_password@uce_postgres:5432/uce_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key'

# Configuración de carpeta para CVs
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db = SQLAlchemy(app)
jwt = JWTManager(app)

# --- MODELOS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='student')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role
        }

class Opportunity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'description': self.description,
            'location': self.location
        }

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    opportunity_title = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='Pendiente')
    date = db.Column(db.String(50), default=datetime.now().strftime("%Y-%m-%d"))

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'opportunity_title': self.opportunity_title,
            'status': self.status,
            'date': self.date
        }

# --- RUTAS DE AUTENTICACIÓN ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email ya registrado'}), 400
    
    hashed_password = generate_password_hash(data['password'], method='scrypt')
    new_user = User(
        name=data['name'], 
        email=data['email'], 
        password=hashed_password,
        role='admin' if 'admin' in data['email'] else 'student'
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Usuario creado'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({'token': access_token, 'user': user.to_dict()}), 200
    
    return jsonify({'error': 'Credenciales inválidas'}), 401

# --- RUTAS PRINCIPALES ---
@app.route('/api/opportunities', methods=['GET', 'POST'])
@jwt_required()
def opportunities():
    if request.method == 'POST':
        data = request.json
        new_op = Opportunity(
            title=data['title'],
            company=data['company'],
            description=data.get('description', ''),
            location=data.get('location', 'Quito')
        )
        db.session.add(new_op)
        db.session.commit()
        return jsonify({'message': 'Oportunidad creada'}), 201
    
    ops = Opportunity.query.all()
    return jsonify([op.to_dict() for op in ops]), 200

@app.route('/api/applications', methods=['GET', 'POST'])
@jwt_required()
def applications():
    current_user_id = get_jwt_identity()

    if request.method == 'POST':
        data = request.json
        new_app = Application(
            student_id=current_user_id,
            opportunity_title=data['opportunity_title']
        )
        db.session.add(new_app)
        db.session.commit()
        return jsonify({'message': 'Postulación enviada'}), 201
    
    apps = Application.query.all()
    return jsonify([app.to_dict() for app in apps]), 200

# Ruta para que el Admin apruebe/rechace
@app.route('/api/applications/<int:app_id>', methods=['PUT'])
@jwt_required()
def update_application_status(app_id):
    data = request.json
    new_status = data.get('status')
    
    application = Application.query.get(app_id)
    if not application:
        return jsonify({'error': 'No encontrada'}), 404
        
    application.status = new_status
    db.session.commit()
    return jsonify({'message': 'Estado actualizado'}), 200

# --- RUTAS DE CV (ARCHIVOS) ---
@app.route('/api/upload-cv', methods=['POST'])
@jwt_required()
def upload_cv():
    current_user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return jsonify({'error': 'No se envió archivo'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nombre de archivo vacío'}), 400

    # Guardamos siempre con el ID del usuario: cv_1.pdf, cv_25.pdf
    filename = f"cv_{current_user_id}.pdf"
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    
    return jsonify({'message': 'CV guardado correctamente'}), 200

@app.route('/api/cv/<int:user_id>', methods=['GET'])
def get_cv(user_id):
    filename = f"cv_{user_id}.pdf"
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except FileNotFoundError:
        return jsonify({'error': 'CV no encontrado'}), 404

# --- INICIALIZAR ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5001, debug=True)