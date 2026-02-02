# ==============================================================================
# AUTHENTICATION ROUTES
# ==============================================================================

# Flask core utilities
# Blueprint: route grouping
# request: incoming HTTP data
# jsonify: JSON responses
from flask import Blueprint, request, jsonify

# Database session
from app.extensions import db

# User model
from app.models import User

# ------------------------------------------------------------------------------
# Safe import for email service
# If the email service is not available, the system continues working normally
# ------------------------------------------------------------------------------
try:
    from app.services import send_welcome_email
except ImportError:
    # If the service cannot be imported, disable email sending
    send_welcome_email = None

# Password hashing utilities
from werkzeug.security import generate_password_hash, check_password_hash

# JWT token creation
from flask_jwt_extended import create_access_token

# Google OAuth verification libraries
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Environment variables access
import os


# ==============================================================================
# AUTH BLUEPRINT
# ==============================================================================
auth_bp = Blueprint('auth', __name__)


# ==============================================================================
# USER REGISTRATION
# ==============================================================================
@auth_bp.route('/api/register', methods=['POST'])
def register():
    """
    Registers a new user in the system.
    - The first registered user is assigned ADMIN role
    - All subsequent users are assigned STUDENT role
    - Email sending is optional and non-blocking
    """
    data = request.json
    
    # --------------------------------------------------------------------------
    # 1. EMAIL VALIDATION
    # Prevents duplicate user accounts
    # --------------------------------------------------------------------------
    if User.query.filter_by(email=data['email']).first(): 
        return jsonify({'error': 'Email ya registrado'}), 400
    
    # --------------------------------------------------------------------------
    # 2. ROLE ASSIGNMENT
    # The very first user becomes ADMIN automatically
    # --------------------------------------------------------------------------
    role = 'admin' if User.query.count() == 0 else 'student'
    
    try:
        # ----------------------------------------------------------------------
        # 3. USER CREATION
        # Password is securely hashed before storing
        # ----------------------------------------------------------------------
        user = User(
            name=data['name'], 
            email=data['email'], 
            password=generate_password_hash(data['password']), 
            role=role
        )

        db.session.add(user)
        db.session.commit()  # <-- User is persisted in the database

        # ----------------------------------------------------------------------
        # 4. OPTIONAL WELCOME EMAIL (FAIL-SAFE)
        # If email sending fails, user creation is NOT affected
        # ----------------------------------------------------------------------
        if send_welcome_email:
            try:
                print(f"🚀 Attempting to send welcome email to {user.email}...", flush=True)
                send_welcome_email(user.email, user.name)
                print("✅ Welcome email sent successfully.", flush=True)
            except Exception as email_error:
                # Email failure is logged but does not interrupt the flow
                print(
                    f"⚠️ USER CREATED, BUT EMAIL FAILED: {str(email_error)}",
                    flush=True
                )
        
        # ----------------------------------------------------------------------
        # 5. SUCCESS RESPONSE
        # Registration succeeds regardless of email result
        # ----------------------------------------------------------------------
        return jsonify({
            'message': 'Usuario creado exitosamente',
            'role': role
        }), 201

    except Exception as e:
        # ----------------------------------------------------------------------
        # DATABASE ERROR HANDLING
        # Ensures database consistency on failure
        # ----------------------------------------------------------------------
        db.session.rollback()
        print(f"❌ Fatal database error: {e}", flush=True)
        return jsonify({'error': 'Error interno del servidor'}), 500


# ==============================================================================
# USER LOGIN
# ==============================================================================
@auth_bp.route('/api/login', methods=['POST'])
def login():
    """
    Authenticates a user using email and password.
    Returns a JWT token if credentials are valid.
    """
    data = request.json

    # Retrieve user by email
    user = User.query.filter_by(email=data['email']).first()

    # Validate credentials
    if not user or not check_password_hash(user.password, data['password']): 
        return jsonify({'error': 'Credenciales incorrectas'}), 401
    
    # Generate JWT token using user ID as identity
    token = create_access_token(identity=str(user.id))

    # Return token and user information
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200
