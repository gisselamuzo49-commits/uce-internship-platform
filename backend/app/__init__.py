from flask import Flask
from config import Config
from app.extensions import db, jwt, cors

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar extensiones
    db.init_app(app)
    jwt.init_app(app)
    
    # 👇 CAMBIO CLAVE AQUÍ PARA ARREGLAR "FAILED TO FETCH"
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Importar Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.student_routes import student_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.opportunity_routes import opp_bp 
    
    # Registrar Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(opp_bp) 

    # Crear tablas
    with app.app_context():
        db.create_all()

    return app