import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io
import textwrap
import datetime

# ==========================================
# 📧 SERVICIOS DE CORREO (SMTP)
# ==========================================

def send_email_confirmation(to_email, student_name, company, date, time):
    """Envía correo de confirmación de cita/entrevista."""
    print(f"🚀 Enviando confirmación de cita a: {to_email}...", flush=True)
    
    try:
        msg = MIMEMultipart()
        msg['From'] = Config.SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "Confirmación de Entrevista - SIIU Conecta"

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

        # Conexión Segura
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
    """Envía correo de bienvenida al registrarse."""
    print(f"🚀 Enviando bienvenida a: {to_email}...", flush=True)
    
    try:
        msg = MIMEMultipart()
        msg['From'] = Config.SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "¡Bienvenido a SIIU Conecta!"

        body = f"""
        Hola {student_name},
        
        ¡Tu cuenta ha sido creada exitosamente!
        
        Bienvenido a la Plataforma de Gestión de Pasantías de la UCE.
        Ahora puedes:
        1. Completar tu perfil (Experiencia y Cursos).
        2. Subir tu solicitud de tutor.
        3. Postular a ofertas exclusivas.
        
        Atentamente,
        Coordinación de Vinculación con la Sociedad.
        """
        msg.attach(MIMEText(body, 'plain'))

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


# ==========================================
# 📄 SERVICIOS DE PDF (ReportLab)
# ==========================================

def generate_student_cv_pdf(user, tutor_req):
    """Genera el CV del estudiante en formato PDF."""
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # --- ENCABEZADO ---
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
    
    # --- EXPERIENCIA LABORAL ---
    p.setFont("Helvetica-Bold", 14)
    p.setFillColorRGB(0, 0, 0.5) # Azul oscuro
    p.drawString(50, y, "EXPERIENCIA LABORAL")
    p.setFillColorRGB(0, 0, 0)
    y -= 25
    
    if user.experiences:
        for exp in user.experiences:
            p.setFont("Helvetica-Bold", 12)
            p.drawString(60, y, f"{exp.role}")
            p.setFont("Helvetica-Oblique", 11)
            p.drawString(60, y-15, f"{exp.company} | {exp.start_date} - {exp.end_date}")
            
            p.setFont("Helvetica", 10)
            # Manejo de líneas largas en la descripción
            if exp.description:
                desc_lines = exp.description.split('\n')
                current_y = y - 30
                for line in desc_lines:
                    if len(line) > 90: line = line[:90] + "..."
                    p.drawString(70, current_y, f"• {line}")
                    current_y -= 12
                y = current_y - 20
            else:
                y -= 35

            # Salto de página si se acaba el espacio
            if y < 100: 
                p.showPage()
                y = 750
    else:
        p.setFont("Helvetica-Oblique", 10)
        p.drawString(60, y, "Sin experiencia laboral registrada.")
        y -= 30

    # --- CURSOS / FORMACIÓN ---
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
            p.drawString(75, y-12, f"{cert.institution} | {cert.year}")
            p.setFont("Helvetica", 11)
            y -= 30
            if y < 100: 
                p.showPage()
                y = 750
    else:
        p.drawString(60, y, "Sin cursos registrados.")
        y -= 20

    # --- ESTADO DE PRÁCTICAS ---
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
        p.drawString(60, y, f"Estado: APROBADO")
        p.drawString(60, y-15, f"Tutor Académico Asignado: {tutor_req.tutor_name}")
    else:
        p.drawString(60, y, "Estado: Pendiente de asignación o no iniciado.")
    
    p.drawString(50, 50, "Generado automáticamente por SIIU Conecta")
    
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer

def generate_memo_pdf(req, student_name, student_email):
    """Genera el Memorando de Asignación de Tutor."""
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # 1. ENCABEZADO
    p.setFont("Helvetica-Bold", 20)
    p.drawCentredString(300, 700, "MEMORANDO DE ASIGNACIÓN")
    
    p.setFont("Helvetica", 12)
    today = datetime.datetime.now().strftime('%Y-%m-%d')
    
    p.drawString(80, 650, f"FECHA:   {today}")
    p.drawString(80, 630, f"PARA:     {req.tutor_name}")
    p.drawString(80, 610, f"ASUNTO: Asignación de Tutoría de Prácticas")
    
    p.setLineWidth(1)
    p.line(80, 590, 530, 590)
    
    # 2. CUERPO DEL TEXTO (Con TextWrap para que no se salga del margen)
    text = f"""
    Por medio de la presente, se notifica la asignación formal como Tutor Académico del estudiante {student_name}, identificado con el correo institucional {student_email}.
    
    El estudiante ha presentado la documentación requerida ('{req.title}'), la cual ha sido revisada y aprobada por la coordinación de vinculación.
    
    Se solicita iniciar el seguimiento de las prácticas pre-profesionales conforme al reglamento institucional vigente y reportar cualquier novedad a esta coordinación en los plazos establecidos.
    """
    
    text_object = p.beginText(80, 550)
    text_object.setFont("Helvetica", 12)
    text_object.setLeading(15) # Interlineado
    
    wrapper = textwrap.TextWrapper(width=75) 
    
    paragraphs = text.split("\n")
    for paragraph in paragraphs:
        if paragraph.strip():
            lines = wrapper.wrap(text=paragraph.strip())
            for line in lines: 
                text_object.textLine(line)
            text_object.textLine("") # Espacio entre párrafos
            
    p.drawText(text_object)
    
    # 3. FIRMA
    p.setFont("Helvetica-Bold", 12)
    p.drawCentredString(300, 200, "_________________________")
    p.drawCentredString(300, 180,       "SUBDECANATO")
    p.drawCentredString(300, 160, "Facultad de Ingenieria  - UCE")

    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer