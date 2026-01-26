from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User
from app.services import send_welcome_email
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
import threading

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first(): 
        return jsonify({'error': 'Email ya registrado'}), 400
    
    role = 'admin' if User.query.count() == 0 else 'student'
    user = User(name=data['name'], email=data['email'], password=generate_password_hash(data['password']), role=role)
    db.session.add(user)
    db.session.commit()

    try:
        email_thread = threading.Thread(target=send_welcome_email, args=(user.email, user.name))
        email_thread.start()
    except Exception as e:
        print(f"Error iniciando hilo de correo: {e}")
    # ------------------------------
    
    return jsonify({'message': 'Usuario creado'}), 201
    
    # Intentar enviar correo (no bloqueante si falla)
    try: send_welcome_email(user.email, user.name)
    except: pass
    
    return jsonify({'message': 'Usuario creado'}), 201

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']): 
        return jsonify({'error': 'Credenciales incorrectas'}), 401
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict()}), 200

@auth_bp.route('/api/google-login', methods=['POST'])
def google_login():
    token = request.json.get('token')
    try:
        id_info = id_token.verify_oauth2_token(token, google_requests.Request())
        email = id_info['email']
        name = id_info['name']
        user = User.query.filter_by(email=email).first()
        if not user:
            dummy_password = generate_password_hash("google_" + os.urandom(8).hex())
            user = User(name=name, email=email, password=dummy_password, role='student')
            db.session.add(user)
            db.session.commit()
            try: send_welcome_email(email, name)
            except: pass
            
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'token': access_token, 'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400