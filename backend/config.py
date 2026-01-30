import os
from datetime import timedelta

# Al estar en la raíz (backend/), basedir es la carpeta backend
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Base de datos
    SQLALCHEMY_DATABASE_URI = 'postgresql://uce_user:uce_password@postgres_db:5432/uce_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Seguridad
    JWT_SECRET_KEY = 'super-secret-key-uce'
    # Ajuste: Como estamos en backend/, la carpeta uploads está aquí mismo
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads') 
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # --- GMAIL ---
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    
    MAIL_USERNAME = "siiuconecta@gmail.com"
    MAIL_PASSWORD = "ypwkfoaeptqxjmpn" 
    
    MAIL_DEFAULT_SENDER = ("SIIU Conecta", "siiuconecta@gmail.com")

    # --- CORRECCIÓN: ALIAS PARA EVITAR EL ERROR 'Config has no attribute SMTP_EMAIL' ---
    SMTP_EMAIL = MAIL_USERNAME
    SMTP_PASSWORD = MAIL_PASSWORD