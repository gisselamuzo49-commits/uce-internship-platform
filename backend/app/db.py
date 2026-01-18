from flask_sqlalchemy import SQLAlchemy

# Inicializamos el objeto de la base de datos
db = SQLAlchemy()

def init_db(app):
    # Inicializa la app con la configuración de DB
    db.init_app(app)
    
    # Crea las tablas si no existen (dentro del contexto de la app)
    with app.app_context():
        db.create_all()