from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate  # <--- ESTO ES LO QUE FALTA
from flask_mail import Mail        # <--- Y ESTO
from flask_cors import CORS

# Inicializamos las instancias
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate() # <--- IMPORTANTE
mail = Mail()       # <--- IMPORTANTE
cors = CORS()