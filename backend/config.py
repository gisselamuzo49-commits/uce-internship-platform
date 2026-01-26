import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql://uce_user:uce_password@postgres_db:5432/uce_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'super-secret-key-uce'
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Configuración de Correo
    SMTP_EMAIL = "siiuconecta@gmail.com"
    SMTP_PASSWORD = "ypwkfoaeptqxjmpn"
    