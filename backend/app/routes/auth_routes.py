# AUTHENTICATION ROUTES

from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
import os

# Google OAuth imports (kept for future OAuth implementation)
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Safe import of email service
# Attempts to import the email function. If it fails, the system continues without emails.

try:
    from app.services import send_welcome_email
except ImportError:
    print("⚠️ Warning: Could not import send_welcome_email from services.py", flush=True)
    send_welcome_email = None

# AUTH BLUEPRINT
auth_bp = Blueprint('auth', __name__)

# USER REGISTRATION
@auth_bp.route('/api/register', methods=['POST'])
def register():
    """
    User registration endpoint.
    - First user becomes ADMIN
    - Subsequent users are STUDENT
    - Sends welcome email asynchronously if configured
    """
    try:
        data = request.json
        
        # Validation: Check for duplicate emails
        if User.query.filter_by(email=data['email']).first(): 
            return jsonify({'error': 'Email ya registrado'}), 400
        
        # Auto-assign role: first user is admin
        role = 'admin' if User.query.count() == 0 else 'student'
        
        # Create user with password hash
        user = User(
            name=data['name'], 
            email=data['email'], 
            password=generate_password_hash(data['password']), 
            role=role
        )

        db.session.add(user)
        db.session.commit() # User saved to database

        # Send welcome email asynchronously (fail-safe)
        # If email fails, user is still created in the database
        if send_welcome_email:
            try:
                # Function uses threading internally (services.py), non-blocking
                send_welcome_email(user.email, user.name)
            except Exception as email_error:
                # Log error but don't fail the registration
                print(f"⚠️ User created, but email failed: {str(email_error)}", flush=True)
        
        # Success response
        return jsonify({
            'message': 'Usuario creado exitosamente',
            'role': role
        }), 201

    except Exception as e:
        # Database rollback to prevent data corruption
        db.session.rollback()
        print(f"❌ Fatal error in registration: {e}", flush=True)
        return jsonify({'error': 'Error interno del servidor'}), 500

# USER LOGIN
@auth_bp.route('/api/login', methods=['POST'])
def login():
    """
    User authentication endpoint. Returns JWT token on success.
    """
    try:
        data = request.json

        # Look up user by email
        user = User.query.filter_by(email=data['email']).first()

        # Verify password
        if not user or not check_password_hash(user.password, data['password']): 
            return jsonify({'error': 'Credenciales incorrectas'}), 401
        
        # Generate JWT token (convert ID to string for compatibility)
        token = create_access_token(identity=str(user.id))

        # Return token and user info
        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        print(f"❌ Error in login: {e}", flush=True)
        return jsonify({'error': 'Error interno en login'}), 500

# GOOGLE LOGIN
@auth_bp.route('/api/google-login', methods=['POST'])
def google_login():
    """
    Google OAuth login endpoint.
    - Verifies Google token
    - Creates user if doesn't exist
    - Logs in if exists
    """
    try:
        data = request.json
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token no proporcionado'}), 400

        # Verify Google Token
        # You should replace CLIENT_ID with your actual Google Client ID from console
        try:
            id_info = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                clock_skew_in_seconds=10
            )
        except ValueError as e:
            return jsonify({'error': 'Token inválido'}), 401

        email = id_info.get('email')
        name = id_info.get('name')
        
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Create new user automatically
            # Check if it's the first user (Admin)
            role = 'admin' if User.query.count() == 0 else 'student'
            
            # Create random password for Google users (they won't use it)
            import secrets
            random_password = secrets.token_hex(16)
            
            user = User(
                name=name,
                email=email,
                password=generate_password_hash(random_password),
                role=role
            )
            db.session.add(user)
            db.session.commit()
            
            # Send welcome email
            if send_welcome_email:
                try:
                    send_welcome_email(user.email, user.name)
                except:
                    pass

        # Generate JWT
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'token': access_token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        print(f"❌ Error in Google Login: {e}", flush=True)
        return jsonify({'error': str(e)}), 500