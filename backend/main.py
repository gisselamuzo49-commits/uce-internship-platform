import os
import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token, 
    jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from app.db import db, init_db 

app = Flask(__name__)

# --- CONFIGURACIÓN ---
app.config['SECRET_KEY'] = 'siiu_uce_super_secret'
app.config['JWT_SECRET_KEY'] = 'jwt_secret_token_uce'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes=30)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(days=7)

# Conexión a PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://uce_user:uce_password@postgres:5432/uce_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, supports_credentials=True, resources={
    r"/api/*": {"origins": ["http://localhost:5173"]}
})

jwt = JWTManager(app)

# ---------------------------------------------------------
# 1. DEFINIMOS LOS MODELOS PRIMERO (Para que SQLAlchemy los vea)
# ---------------------------------------------------------

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='student')

class Opportunity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.String(50)) 

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, nullable=False)
    opportunity_title = db.Column(db.String(150), nullable=False)
    status = db.Column(db.String(50), default='Pendiente')
    date = db.Column(db.String(20))

# ---------------------------------------------------------
# 2. AHORA SÍ INICIALIZAMOS LA DB (Ya conoce los modelos)
# ---------------------------------------------------------
init_db(app)

# ---------------------------------------------------------
# 3. CREAR ADMIN POR DEFECTO
# ---------------------------------------------------------
with app.app_context():
    # Solo creamos el admin si la tabla existe y no hay admin
    try:
        if not User.query.filter_by(email="admin@uce.edu.ec").first():
            admin = User(
                name="Admin UCE",
                email="admin@uce.edu.ec",
                password=generate_password_hash("admin123"),
                role="admin"
            )
            db.session.add(admin)
            db.session.commit()
            print("--- ADMIN POR DEFECTO CREADO ---")
    except Exception as e:
        print(f"Error al crear admin (puede ser normal si es el primer inicio): {e}")

# --- RUTAS ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'El correo ya está registrado'}), 400

    new_user = User(
        name=data.get('name'),
        email=email,
        password=generate_password_hash(data.get('password')),
        role="student"
    )
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'Usuario registrado'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if user and check_password_hash(user.password, password):
        return jsonify({
            'user': {'id': user.id, 'email': user.email, 'role': user.role, 'name': user.name},
            'access_token': create_access_token(identity=str(user.id)),
            'refresh_token': create_refresh_token(identity=str(user.id))
        }), 200
        
    return jsonify({'error': 'Credenciales incorrectas'}), 401

@app.route('/api/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    return jsonify(access_token=create_access_token(identity=identity)), 200

# --- RUTAS DE OPORTUNIDADES (SQL) ---
@app.route('/api/opportunities', methods=['GET', 'POST'])
@jwt_required()
def handle_opportunities():
    if request.method == 'POST':
        data = request.json
        new_op = Opportunity(
            title=data.get('title'),
            company=data.get('company'),
            location=data.get('location'),
            description=data.get('description'),
            created_by=get_jwt_identity()
        )
        db.session.add(new_op)
        db.session.commit()
        return jsonify({'message': 'Oportunidad creada'}), 201
    
    ops = Opportunity.query.all()
    output = []
    for op in ops:
        output.append({
            "id": op.id,
            "title": op.title,
            "company": op.company,
            "location": op.location,
            "description": op.description
        })
    return jsonify(output), 200

@app.route('/api/applications', methods=['GET', 'POST'])
@jwt_required()
def handle_applications():
    if request.method == 'POST':
        data = request.json
        new_app = Application(
            student_id=get_jwt_identity(),
            opportunity_title=data.get('opportunity_title'),
            date=datetime.datetime.now().strftime("%d/%m/%Y")
        )
        db.session.add(new_app)
        db.session.commit()
        return jsonify({'message': 'Postulación exitosa'}), 201
    
    apps = Application.query.all()
    output = []
    for a in apps:
        output.append({
            "id": a.id,
            "student_id": a.student_id,
            "opportunity_title": a.opportunity_title,
            "status": a.status,
            "date": a.date
        })
    return jsonify(output), 200
# --- NUEVA RUTA: ACTUALIZAR ESTADO (APROBAR/RECHAZAR) ---
@app.route('/api/applications/<int:app_id>', methods=['PUT'])
@jwt_required()
def update_application_status(app_id):
    try:
        data = request.json
        new_status = data.get('status') # Esperamos "Aprobado" o "Rechazado"
        
        # Buscar la postulación por ID
        application = Application.query.get(app_id)
        
        if not application:
            return jsonify({'error': 'Postulación no encontrada'}), 404
            
        # Actualizar el estado en la BD
        application.status = new_status
        db.session.commit()
        
        return jsonify({'message': f'Estado actualizado a {new_status}', 'id': app_id}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)