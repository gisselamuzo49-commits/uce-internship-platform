import boto3
import os
import smtplib
import threading
from werkzeug.utils import secure_filename
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config
from botocore.client import Config as BotoConfig

# Cloudflare R2 file storage service
def get_r2_client():
    return boto3.client(
        's3',
        endpoint_url=os.environ.get('R2_ENDPOINT_URL'),
        aws_access_key_id=os.environ.get('R2_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('R2_SECRET_ACCESS_KEY'),
        config=BotoConfig(signature_version='s3v4')
    )

def upload_file_to_r2(file_obj, folder="uploads"):
    try:
        if not file_obj: return None
        filename = secure_filename(file_obj.filename)
        object_name = f"{folder}/{filename}"
        print(f"☁️ Subiendo {filename} a R2 ({folder})...", flush=True)
        
        s3 = get_r2_client()
        bucket_name = os.environ.get('R2_BUCKET_NAME', 'uce-uploads')
        
        s3.upload_fileobj(
            file_obj, bucket_name, object_name,
            ExtraArgs={'ContentType': file_obj.content_type}
        )
        print(f"✅ Archivo subido exitosamente: {object_name}", flush=True)
        return object_name
    except Exception as e:
        print(f"❌ Error critico subiendo a R2: {str(e)}", flush=True)
        return None

def get_file_from_r2(filename):
    try:
        s3 = get_r2_client()
        bucket_name = os.environ.get('R2_BUCKET_NAME', 'uce-uploads')
        file_obj = s3.get_object(Bucket=bucket_name, Key=filename)
        return file_obj
    except Exception as e:
        print(f"❌ Error descargando de R2: {str(e)}", flush=True)
        return None

# Email service (SMTP)
def _send_email_thread(to_email, subject, body):
    try:
        print(f"📧 Intentando enviar correo a {to_email}...", flush=True)
        msg = MIMEMultipart()
        msg['From'] = Config.SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        server = smtplib.SMTP(Config.MAIL_SERVER, Config.MAIL_PORT, timeout=60)
        server.starttls()
        server.login(Config.SMTP_EMAIL, Config.SMTP_PASSWORD)
        server.sendmail(Config.SMTP_EMAIL, to_email, msg.as_string())
        server.quit()
        print(f"✅ Correo enviado a {to_email}", flush=True)
    except Exception as e:
        print(f"❌ Error enviando correo: {str(e)}", flush=True)

def send_email_confirmation(to_email, student_name, company, date, time):
    subject = "Cita Agendada - Plataforma UCE"
    body = f"Hola {student_name},\n\nTu cita con {company} ha sido confirmada para el {date} a las {time}.\n\nExitos!"
    threading.Thread(target=_send_email_thread, args=(to_email, subject, body)).start()
    return True

def send_welcome_email(to_email, username):
    subject = "Bienvenido a la Plataforma de Pasantias UCE"
    body = f"""
    Hola {username},

    Gracias por registrarte en la Plataforma de Gestion de Pasantias de la UCE.
    Tu cuenta ha sido creada exitosamente.

    Ya puedes iniciar sesion y completar tu perfil.

    Saludos,
    Equipo de Vinculacion UCE
    """
    threading.Thread(target=_send_email_thread, args=(to_email, subject, body)).start()
    return True