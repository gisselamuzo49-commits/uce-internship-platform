import os

class Config:
    # Secret key for session management
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev_key_12345'

    # Database configuration (PostgreSQL)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://uce_user:uce_password@uce_postgres:5432/uce_db'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Email configuration (SMTP)
    SMTP_EMAIL = 'siiuconecta@gmail.com'
    SMTP_PASSWORD = 'ypwkfoaeptqxjmpn'
    
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True

    # Upload folder path (inside Docker container)
    UPLOAD_FOLDER = '/app/uploads'