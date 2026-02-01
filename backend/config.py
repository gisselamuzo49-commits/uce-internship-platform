import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # --- BASE DE DATOS ---
    SQLALCHEMY_DATABASE_URI = 'postgresql://uce_user:uce_password@postgres_db:5432/uce_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # --- SEGURIDAD ---
    JWT_SECRET_KEY = 'super-secret-key-uce'
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads') 
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # --- GMAIL (Configuración Estricta) ---
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True  # IMPORTANTE: TLS debe ser True
    MAIL_USE_SSL = False # IMPORTANTE: SSL debe ser False para el puerto 587
    MAIL_DEBUG = True    # Esto te ayudará a ver errores detallados en la consola
    
    # Credenciales
    MAIL_USERNAME = "siiuconecta@gmail.com"
    MAIL_PASSWORD = "ypwkfoaeptqxjmpn" 
    
    # Remitente por defecto
    MAIL_DEFAULT_SENDER = ("SIIU Conecta", "siiuconecta@gmail.com")

    # Alias de compatibilidad (por si usas librerías viejas)
    SMTP_EMAIL = MAIL_USERNAME
    SMTP_PASSWORD = MAIL_PASSWORD