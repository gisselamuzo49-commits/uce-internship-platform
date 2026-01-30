from flask import Flask
from flask_cors import CORS
from app.extensions import db, jwt, migrate, mail
# Importamos la configuración
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ------------------------------------------------------------
    # 1. INICIALIZAR EXTENSIONES
    # ------------------------------------------------------------
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    
    # 👇 CORRECCIÓN DE CORS (IMPORTANTE)
    # Esto permite Credenciales (Cookies/Tokens) y Headers de Autorización
    CORS(app, 
         resources={r"/*": {"origins": "*"}}, 
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"])

    # ------------------------------------------------------------
    # 2. REGISTRAR BLUEPRINTS (RUTAS)
    # ------------------------------------------------------------
    
    # A) Autenticación (Login/Registro)
    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp)

    # B) Oportunidades (Empleos/Pasantías)
    from app.routes.opportunity_routes import opportunity_bp 
    app.register_blueprint(opportunity_bp)

    # C) Estudiantes (Perfil, Mis Postulaciones)
    from app.routes.student_routes import student_bp
    app.register_blueprint(student_bp)

    # D) Administrador
    from app.routes.admin_routes import admin_bp
    app.register_blueprint(admin_bp)

    return app