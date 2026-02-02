from flask import Flask
from flask_cors import CORS
from app.extensions import db, jwt, migrate, mail
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 1. INICIALIZAR EXTENSIONES
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app) # <--- Aquí se conecta Flask-Mail con tu Config
    
    # Diagnóstico visual en consola
    print(f"📧 Sistema de Correo Iniciado con: {app.config['MAIL_USERNAME']}", flush=True)

    # Configuración CORS
    CORS(app, 
         resources={r"/*": {"origins": "*"}}, 
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"])

    # 2. REGISTRAR BLUEPRINTS
    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp)

    from app.routes.opportunity_routes import opportunity_bp 
    app.register_blueprint(opportunity_bp)

    from app.routes.student_routes import student_bp
    app.register_blueprint(student_bp)

    from app.routes.admin_routes import admin_bp
    app.register_blueprint(admin_bp)

    return app