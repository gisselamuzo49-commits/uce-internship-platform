from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate  # Database migration support
from flask_mail import Mail        # Email service integration
from flask_cors import CORS        # Cross-Origin Resource Sharing

# Extension instances (initialized later in create_app)
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
mail = Mail()
cors = CORS()
