import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))  # Base directory of the project

class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql://uce_user:uce_password@postgres_db:5432/uce_db'  # Database connection
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Disable SQLAlchemy event system

    JWT_SECRET_KEY = 'super-secret-key-uce'  # JWT signing key
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')  # File upload directory
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)  # Token expiration time

    MAIL_SERVER = 'smtp.gmail.com'  # Gmail SMTP server
    MAIL_PORT = 587  # TLS port
    MAIL_USE_TLS = True  # Enable TLS
    MAIL_USE_SSL = False  # Disable SSL (not used with port 587)
    MAIL_DEBUG = True  # Enable mail debug logs

    MAIL_USERNAME = "siiuconecta@gmail.com"  # SMTP username
    MAIL_PASSWORD = "ypwkfoaeptqxjmpn"  # SMTP app password

    MAIL_DEFAULT_SENDER = ("SIIU Conecta", "siiuconecta@gmail.com")  # Default sender

    SMTP_EMAIL = MAIL_USERNAME  # Compatibility alias
    SMTP_PASSWORD = MAIL_PASSWORD  # Compatibility alias
