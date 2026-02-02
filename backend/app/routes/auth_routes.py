from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User
# Importamos send_welcome_email de forma segura
try:
    from app.services import send_welcome_email
except ImportError:
    send_welcome_email = None

from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    # 1. Validación
    if User.query.filter_by(email=data['email']).first(): 
        return jsonify({'error': 'Email ya registrado'}), 400
    
    # 2. Asignar rol
    role = 'admin' if User.query.count() == 0 else 'student'
    
    try:
        # 3. Crear Usuario
        user = User(
            name=data['name'], 
            email=data['email'], 
            password=generate_password_hash(data['password']), 
            role=role
        )
        db.session.add(user)
        db.session.commit() # <--- ¡Usuario Guardado en BD!

        # 4. Intentar enviar correo (BLINDADO)
        # Esto asegura que si el correo falla, el registro NO se rompa
        if send_welcome_email:
            try:
                print(f"🚀 Intentando enviar correo a {user.email}...", flush=True)
                send_welcome_email(user.email, user.name)
                print("✅ Correo enviado con éxito.", flush=True)
            except Exception as email_error:
                # Solo imprimimos el error, NO cancelamos la respuesta
                print(f"⚠️ EL USUARIO SE CREÓ, PERO EL CORREO FALLÓ: {str(email_error)}", flush=True)
        
        # 5. Responder Éxito siempre
        return jsonify({'message': 'Usuario creado exitosamente', 'role': role}), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error fatal en base de datos: {e}", flush=True)
        return jsonify({'error': 'Error interno del servidor'}), 500

# ... (El resto de tus rutas login y google-login siguen igual) ...
@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']): 
        return jsonify({'error': 'Credenciales incorrectas'}), 401
    
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict()}), 200