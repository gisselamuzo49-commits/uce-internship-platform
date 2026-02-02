import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io
import textwrap
import datetime


# EMAIL SERVICES (SMTP)

def send_email_confirmation(to_email, student_name, company, date, time):
    """Sends interview/appointment confirmation email."""
    print(f"🚀 Enviando confirmación de cita a: {to_email}...", flush=True)

    try:
        # Create multipart email message
        msg = MIMEMultipart()
        msg['From'] = Config.SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "Confirmación de Entrevista - SIIU Conecta"

        # Email body (user-facing content in Spanish)
        body = f"""
        Hola {student_name},

        Tu entrevista ha sido agendada exitosamente.

        Empresa: {company}
        Fecha: {date}
        Hora: {time}

        Por favor, sé puntual y prepárate para tu entrevista.

        Atentamente,
        Sistema SIIU UCE
        """
        msg.attach(MIMEText(body, 'plain'))

        # Secure SMTP connection using TLS
        server = smtplib.SMTP('smtp.gmail.com', 587, timeout=30)
        server.starttls()
        server.login(Config.SMTP_EMAIL, Config.SMTP_PASSWORD)
        server.sendmail(Config.SMTP_EMAIL, to_email, msg.as_string())
        server.quit()

        print("✅ Correo de cita enviado.", flush=True)
        return True

    except Exception as e:
        print(f"❌ Error enviando correo cita: {e}", flush=True)
        return False


def send_welcome_email(to_email, student_name):
    """Sends welcome email after user registration."""
    print(f"🚀 Enviando bienvenida a: {to_email}...", flush=True)

    try:
        # Create multipart email message
        msg = MIMEMultipart()
        msg['From'] = Config.SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "¡Bienvenido a SIIU Conecta!"

        # Email body (user-facing content in Spanish)
        body = f"""
        Hola {student_name},

        ¡Tu cuenta ha sido creada exitosamente!

        Bienvenido a la Plataforma de Gestión de Pasantías / Vinculación con la Sociedad de la UCE.
        Ahora puedes:
        1. Completar tu perfil (Experiencia y Cursos).
        2. Subir tu solicitud de tutor.
        3. Postular a ofertas exclusivas.

        Atentamente,
        Coordinación de Vinculación con la Sociedad.
        """
        msg.attach(MIMEText(body, 'plain'))

        # Secure SMTP connection
        server = smtplib.SMTP('smtp.gmail.com', 587, timeout=30)
        server.starttls()
        server.login(Config.SMTP_EMAIL, Config.SMTP_PASSWORD)
        server.sendmail(Config.SMTP_EMAIL, to_email, msg.as_string())
        server.quit()

        print("✅ Correo de bienvenida enviado.", flush=True)
        return True

    except Exception as e:
        print(f"❌ Error enviando bienvenida: {e}", flush=True)
        return False


# PDF SERVICES (ReportLab)

def generate_student_cv_pdf(user, tutor_req):
    """Generates the student's CV in PDF format."""
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)

    # Header section
    p.setFont("Helvetica-Bold", 20)
    p.drawString(50, 750, user.name)
    p.setFont("Helvetica", 12)
    p.setFillColorRGB(0.4, 0.4, 0.4)
    p.drawString(50, 735, "Estudiante / Candidato")
    p.setFillColorRGB(0, 0, 0)
    p.drawString(50, 715, f"Email: {user.email}")
    p.setLineWidth(1)
    p.line(50, 700, 550, 700)

    y = 670

    # Work experience section
    p.setFont("Helvetica-Bold", 14)
    p.setFillColorRGB(0, 0, 0.5)
    p.drawString(50, y, "EXPERIENCIA LABORAL")
    p.setFillColorRGB(0, 0, 0)
    y -= 25

    if user.experiences:
        for exp in user.experiences:
            p.setFont("Helvetica-Bold", 12)
            p.drawString(60, y, f"{exp.role}")
            p.setFont("Helvetica-Oblique", 11)
            p.drawString(60, y - 15, f"{exp.company} | {exp.start_date} - {exp.end_date}")

            p.setFont("Helvetica", 10)
            # Handle long descriptions
            if exp.description:
                desc_lines = exp.description.split('\n')
                current_y = y - 30
                for line in desc_lines:
                    if len(line) > 90:
                        line = line[:90] + "..."
                    p.drawString(70, current_y, f"• {line}")
                    current_y -= 12
                y = current_y - 20
            else:
                y -= 35

            # Page break handling
            if y < 100:
                p.showPage()
                y = 750
    else:
        p.setFont("Helvetica-Oblique", 10)
        p.drawString(60, y, "Sin experiencia laboral registrada.")
        y -= 30

    # Education and courses section
    y -= 20
    if y < 100:
        p.showPage()
        y = 750

    p.setFont("Helvetica-Bold", 14)
    p.setFillColorRGB(0, 0, 0.5)
    p.drawString(50, y, "FORMACIÓN ACADÉMICA Y CURSOS")
    p.setFillColorRGB(0, 0, 0)
    y -= 25

    p.setFont("Helvetica", 11)
    if user.certifications:
        for cert in user.certifications:
            p.drawString(60, y, f"• {cert.title}")
            p.setFont("Helvetica-Oblique", 10)
            p.drawString(75, y - 12, f"{cert.institution} | {cert.year}")
            p.setFont("Helvetica", 11)
            y -= 30
            if y < 100:
                p.showPage()
                y = 750
    else:
        p.drawString(60, y, "Sin cursos registrados.")
        y -= 20

    # Internship status section
    y -= 30
    if y < 100:
        p.showPage()
        y = 750

    p.setFont("Helvetica-Bold", 14)
    p.setFillColorRGB(0, 0, 0.5)
    p.drawString(50, y, "ESTADO DE PRÁCTICAS")
    p.setFillColorRGB(0, 0, 0)
    y -= 25
    p.setFont("Helvetica", 11)

    if tutor_req and tutor_req.status == 'Aprobado':
        p.drawString(60, y, "Estado: APROBADO")
        p.drawString(60, y - 15, f"Tutor Académico Asignado: {tutor_req.tutor_name}")
    else:
        p.drawString(60, y, "Estado: Pendiente de asignación o no iniciado.")

    p.drawString(50, 50, "Generado automáticamente por SIIU Conecta")

    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer
