from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import datetime
import io
import requests
import textwrap
from datetime import timedelta

# --- LIBRERÍAS DE GOOGLE ---
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# --- LIBRERÍAS PARA PDF ---
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# --- LIBRERÍAS PARA EMAIL ---
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://uce_user:uce_password@postgres_db:5432/uce_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key-uce'
app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'uploads')
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7) # Token dura 7 días

# 📧 CONFIGURACIÓN DEL CORREO
SMTP_EMAIL = "siiuconecta@gmail.com" 
SMTP_PASSWORD = "ypwkfoaeptqxjmpn"

db = SQLAlchemy(app)
jwt = JWTManager(app)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# ================= MODELOS =================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='student')
    certifications = db.relationship('Certification', backref='student', lazy=True, cascade="all, delete-orphan")
    experiences = db.relationship('Experience', backref='student', lazy=True, cascade="all, delete-orphan")
    tutor_requests = db.relationship('TutorRequest', backref='student', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'email': self.email, 'role': self.role, 
            'certifications': [c.to_dict() for c in self.certifications],
            'experiences': [e.to_dict() for e in self.experiences]
        }

class Experience(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.String(20), nullable=False)
    end_date = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text, nullable=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id, 'company': self.company, 'role': self.role,
            'start_date': self.start_date, 'end_date': self.end_date,
            'description': self.description
        }

class Certification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    year = db.Column(db.String(4), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    def to_dict(self): return {'id': self.id, 'title': self.title, 'institution': self.institution, 'year': self.year}

class Opportunity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100), default='Quito')
    deadline = db.Column(db.String(20), nullable=True)
    vacancies = db.Column(db.Integer, default=1) 
    def to_dict(self):
        return {
            'id': self.id, 
            'title': self.title, 
            'company': self.company, 
            'description': self.description, 
            'location': self.location, 
            'deadline': self.deadline, 
            'vacancies': self.vacancies, 
            'applicants_count': len(self.applications)
        }

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    opportunity_id = db.Column(db.Integer, db.ForeignKey('opportunity.id'), nullable=False)
    status = db.Column(db.String(20), default='Pendiente')
    date = db.Column(db.String(20), nullable=False)
    opportunity = db.relationship('Opportunity', backref='applications')
    def to_dict(self):
        student = User.query.get(self.student_id)
        return {'id': self.id, 'opportunity_title': self.opportunity.title, 'company': self.opportunity.company, 'status': self.status, 'date': self.date, 'student_id': self.student_id, 'student_name': student.name if student else "Desconocido"}

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    application_id = db.Column(db.Integer, db.ForeignKey('application.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(20), nullable=False)

class TutorRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    filename = db.Column(db.String(200), nullable=False) 
    status = db.Column(db.String(20), default='Pendiente') 
    tutor_name = db.Column(db.String(100), nullable=True) 
    date = db.Column(db.String(20), nullable=False)
    def to_dict(self):
        student = User.query.get(self.student_id)
        return {'id': self.id, 'student_name': student.name if student else "Desconocido", 'title': self.title, 'filename': self.filename, 'status': self.status, 'tutor_name': self.tutor_name, 'date': self.date}

# ================= CREACIÓN DE TABLAS =================
with app.app_context():
    db.create_all()
    print("✅ Base de datos inicializada correctamente.")

# ================= FUNCIONES DE CORREO =================

def send_email_confirmation(to_email, student_name, company, date, time):
    print(f"🚀 INICIANDO CORREO CITA A: {to_email}...") 
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "Confirmación de Entrevista - SIIU Conecta"

        body = f"""Hola {student_name},\n\nTu entrevista ha sido agendada con {company} para el {date} a las {time}.\n\nAtentamente,\nSistema UCE"""
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587, timeout=20) 
        server.starttls() 
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        server.quit()
        print(f"✅ Correo Cita Enviado.")
        return True
    except Exception as e:
        print(f"❌ Error Correo Cita: {e}")
        return False

def send_welcome_email(to_email, name):
    print(f"🚀 INICIANDO CORREO BIENVENIDA A: {to_email}...")
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "¡Bienvenido a SIIU Conecta!"

        body = f"""
        Hola {name},

        ¡Bienvenido a la Plataforma de Gestión de Pasantías de la UCE!
        
        Tu cuenta ha sido creada exitosamente.
        Ahora puedes ingresar, completar tu perfil y postular a las vacantes disponibles.

        Accede aquí: http://localhost:5173/

        Atentamente,
        Equipo SIIU Conecta
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587, timeout=20)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        server.quit()
        
        print(f"✅ Correo Bienvenida Enviado.")
        return True
    except Exception as e:
        print(f"❌ Error Correo Bienvenida: {e}")
        return False

# ================= RUTAS PRINCIPALES =================

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first(): return jsonify({'error': 'Email ya registrado'}), 400
    
    # 1. Crear Usuario
    role = 'admin' if User.query.count() == 0 else 'student'
    user = User(name=data['name'], email=data['email'], password=generate_password_hash(data['password']), role=role)
    db.session.add(user)
    db.session.commit()

    # 2. Enviar Correo de Bienvenida
    send_welcome_email(user.email, user.name)

    return jsonify({'message': 'Usuario creado'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']): return jsonify({'error': 'Credenciales incorrectas'}), 401
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict()}), 200

# GOOGLE LOGIN
@app.route('/api/google-login', methods=['POST'])
def google_login():
    token = request.json.get('token')
    try:
        id_info = id_token.verify_oauth2_token(token, google_requests.Request())
        email = id_info['email']
        name = id_info['name']
        user = User.query.filter_by(email=email).first()
        if not user:
            dummy_password = generate_password_hash("google_" + os.urandom(8).hex())
            user = User(name=name, email=email, password=dummy_password, role='student')
            db.session.add(user)
            db.session.commit()
            send_welcome_email(email, name)
            
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'token': access_token, 'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/user/update', methods=['PUT'])
@jwt_required()
def update_user():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.json
    if 'name' in data and data['name']: user.name = data['name']
    if 'password' in data and data['password']: user.password = generate_password_hash(data['password'])
    db.session.commit()
    return jsonify({'message': 'Perfil actualizado', 'user': user.to_dict()}), 200

@app.route('/api/profile/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_profile(user_id):
    user = User.query.get(user_id)
    if not user: return jsonify({'error': 'Usuario no encontrado'}), 404
    return jsonify(user.to_dict()), 200

# ================= RUTAS DE EXPERIENCIA =================
@app.route('/api/experience', methods=['POST'])
@jwt_required()
def add_experience():
    user_id = int(get_jwt_identity())
    data = request.json
    new_exp = Experience(
        company=data['company'], role=data['role'],
        start_date=data['start_date'], end_date=data['end_date'],
        description=data.get('description', ''), student_id=user_id
    )
    db.session.add(new_exp)
    db.session.commit()
    return jsonify({'message': 'Experiencia agregada'}), 201

@app.route('/api/experience/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_experience(id):
    user_id = int(get_jwt_identity())
    exp = Experience.query.get(id)
    if exp and exp.student_id == user_id:
        db.session.delete(exp)
        db.session.commit()
        return jsonify({'message': 'Eliminado'}), 200
    return jsonify({'error': 'No autorizado'}), 403

# ================= RUTAS DE CERTIFICACIONES =================
@app.route('/api/certifications', methods=['POST'])
@jwt_required()
def add_certification():
    user_id = int(get_jwt_identity())
    data = request.json
    new_cert = Certification(title=data['title'], institution=data['institution'], year=data.get('year', '2024'), student_id=user_id)
    db.session.add(new_cert)
    db.session.commit()
    return jsonify({'message': 'Certificación agregada'}), 201

@app.route('/api/certifications/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_certification(id):
    user_id = int(get_jwt_identity())
    cert = Certification.query.get(id)
    if cert and cert.student_id == user_id:
        db.session.delete(cert)
        db.session.commit()
        return jsonify({'message': 'Eliminado'}), 200
    return jsonify({'error': 'Error'}), 403

# ================= RUTAS TUTOR =================
@app.route('/api/tutor-requests', methods=['POST'])
@jwt_required()
def create_tutor_request():
    if 'file' not in request.files: return jsonify({'error': 'No file'}), 400
    file = request.files['file']
    title = request.form.get('title')
    user_id = int(get_jwt_identity())
    filename = secure_filename(f"tutor_{user_id}_{datetime.datetime.now().timestamp()}_{file.filename}")
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    new_req = TutorRequest(student_id=user_id, title=title, filename=filename, date=datetime.datetime.now().strftime("%Y-%m-%d"))
    db.session.add(new_req)
    db.session.commit()
    return jsonify({'message': 'Solicitud enviada'}), 201

@app.route('/api/tutor-requests', methods=['GET'])
@jwt_required()
def get_my_requests():
    user_id = int(get_jwt_identity())
    reqs = TutorRequest.query.filter_by(student_id=user_id).all()
    return jsonify([r.to_dict() for r in reqs]), 200

@app.route('/api/admin/tutor-requests', methods=['GET'])
@jwt_required()
def get_all_requests(): return jsonify([r.to_dict() for r in TutorRequest.query.all()]), 200

@app.route('/api/admin/tutor-requests/<int:id>', methods=['PUT'])
@jwt_required()
def update_tutor_req(id):
    req = TutorRequest.query.get(id)
    req.status = request.json.get('status', req.status)
    req.tutor_name = request.json.get('tutor_name', req.tutor_name)
    db.session.commit()
    return jsonify({'message': 'Actualizado'}), 200

@app.route('/api/uploads/<filename>', methods=['GET'])
def get_file(filename): return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/cv/<int:student_id>', methods=['GET'])
def get_cv(student_id):
    try: return send_from_directory(app.config['UPLOAD_FOLDER'], f"cv_{student_id}.pdf")
    except: return jsonify({'error': 'CV not found'}), 404

# ================= REPORTES Y PDFS =================

# --- RUTA NUEVA PARA REPORTE EXCEL (CRUCE DE DATOS) ---
@app.route('/api/admin/daily-report', methods=['GET'])
@jwt_required()
def daily_report():
    date_param = request.args.get('date', datetime.datetime.now().strftime("%Y-%m-%d"))
    try:
        apps = Application.query.filter_by(status='Aprobado', date=date_param).all()
        report_data = []
        for app in apps:
            student = User.query.get(app.student_id)
            opp = app.opportunity
            tutor_req = TutorRequest.query.filter_by(student_id=student.id).first()
            row = {
                "fecha_aprobacion": app.date,
                "estudiante": student.name,
                "email": student.email,
                "empresa": opp.company,
                "cargo": opp.title,
                "documentacion_subida": "SÍ" if tutor_req else "NO",
                "estado_tutor": tutor_req.status if tutor_req else "Sin Solicitud",
                "nombre_tutor": tutor_req.tutor_name if (tutor_req and tutor_req.tutor_name) else "Por asignar"
            }
            report_data.append(row)
        return jsonify(report_data), 200
    except Exception as e:
        print(f"Error reporte: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/export-pdf/<int:student_id>', methods=['GET'])
@jwt_required()
def export_pdf(student_id):
    user = User.query.get(student_id)
    if not user: return jsonify({'error': 'Usuario no encontrado'}), 404
    tutor_req = TutorRequest.query.filter_by(student_id=student_id, status='Aprobado').first()

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # ENCABEZADO
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
    
    # EXPERIENCIA
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
            p.drawString(60, y-15, f"{exp.company} | {exp.start_date} - {exp.end_date}")
            p.setFont("Helvetica", 10)
            desc_lines = exp.description.split('\n')
            current_y = y - 30
            for line in desc_lines:
                if len(line) > 90: line = line[:90] + "..."
                p.drawString(70, current_y, f"• {line}")
                current_y -= 12
            y = current_y - 20 
            if y < 100: p.showPage(); y = 750
    else:
        p.setFont("Helvetica-Oblique", 10)
        p.drawString(60, y, "Sin experiencia laboral registrada.")
        y -= 30

    # CURSOS
    y -= 20
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
            if y < 100: p.showPage(); y = 750
    else:
        p.drawString(60, y, "Sin cursos registrados.")
        y -= 20

    # PRÁCTICAS
    y -= 30
    p.setFont("Helvetica-Bold", 14)
    p.setFillColorRGB(0, 0, 0.5)
    p.drawString(50, y, "ESTADO DE PRÁCTICAS")
    p.setFillColorRGB(0, 0, 0)
    y -= 25
    p.setFont("Helvetica", 11)
    if tutor_req:
        p.drawString(60, y, f"Estado: APROBADO")
        p.drawString(60, y-15, f"Tutor Académico: {tutor_req.tutor_name}")
    else:
        p.drawString(60, y, "Estado: Pendiente de asignación.")
    
    p.showPage()
    p.save()
    buffer.seek(0)
    response = make_response(buffer.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    return response

@app.route('/api/admin/export-assignment/<int:request_id>', methods=['GET'])
@jwt_required()
def export_assignment_pdf(request_id):
    req = TutorRequest.query.get(request_id)
    if not req or req.status != 'Aprobado': return jsonify({'error': 'No aprobado'}), 400
    student = User.query.get(req.student_id)

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    p.setFont("Helvetica-Bold", 20)
    p.drawCentredString(300, 700, "MEMORANDO DE ASIGNACIÓN")
    p.setFont("Helvetica", 12)
    p.drawString(80, 650, f"FECHA:   {datetime.datetime.now().strftime('%Y-%m-%d')}")
    p.drawString(80, 630, f"PARA:     {req.tutor_name}")
    p.drawString(80, 610, f"ASUNTO: Asignación de Tutoría de Prácticas")
    p.setLineWidth(1)
    p.line(80, 590, 530, 590)
    
    text = f"""Por medio de la presente, se notifica la asignación formal como Tutor Académico del estudiante {student.name}, identificado con el correo {student.email}. El estudiante ha presentado la documentación requerida ('{req.title}'), la cual ha sido revisada y aprobada por la coordinación de vinculación. Se solicita iniciar el seguimiento de las prácticas pre-profesionales conforme al reglamento institucional vigente y reportar cualquier novedad."""
    
    text_object = p.beginText(80, 550)
    text_object.setFont("Helvetica", 12)
    wrapper = textwrap.TextWrapper(width=85) 
    paragraphs = text.split("\n")
    for paragraph in paragraphs:
        if paragraph.strip():
            lines = wrapper.wrap(text=paragraph)
            for line in lines: text_object.textLine(line)
            text_object.textLine("") 
    p.drawText(text_object)
    
    p.setFont("Helvetica-Bold", 12)
    p.drawCentredString(300, 300, "_________________________")
    p.drawCentredString(300, 280, "Coordinación de Vinculación")
    p.showPage()
    p.save()
    buffer.seek(0)
    response = make_response(buffer.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    return response

# ================= RUTAS APLICACIONES/OPORTUNIDADES (UNIFICADAS) =================

@app.route('/api/opportunities', methods=['GET', 'POST'])
def handle_opportunities():
    # 1. SI ES POST (CREAR)
    if request.method == 'POST':
        data = request.json
        new_opp = Opportunity(title=data['title'], company=data['company'], description=data['description'], location=data.get('location', 'Quito'), deadline=data.get('deadline'), vacancies=int(data.get('vacancies', 1)))
        db.session.add(new_opp)
        db.session.commit()
        return jsonify({'message': 'Created'}), 201
    
    # 2. SI ES GET (LEER) - PARA QUE EL CONTADOR FUNCIONE
    return jsonify([o.to_dict() for o in Opportunity.query.all()]), 200

@app.route('/api/opportunities/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_opportunity(id):
    opp = Opportunity.query.get(id)
    if not opp: return jsonify({'error': 'Oferta no encontrada'}), 404
    Application.query.filter_by(opportunity_id=id).delete()
    db.session.delete(opp)
    db.session.commit()
    return jsonify({'message': 'Oferta eliminada'}), 200

@app.route('/api/applications', methods=['POST', 'GET'])
@jwt_required()
def handle_applications():
    user_id = int(get_jwt_identity())
    if request.method == 'POST':
        data = request.json
        opp_id = data.get('opportunity_id')
        opportunity = Opportunity.query.get(opp_id)
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        if opportunity.deadline and today > opportunity.deadline: return jsonify({'error': 'Caducado'}), 400
        if len(opportunity.applications) >= opportunity.vacancies: return jsonify({'error': 'Lleno'}), 400
        new_app = Application(student_id=user_id, opportunity_id=int(opp_id), date=today)
        db.session.add(new_app); db.session.commit()
        return jsonify({'message': 'OK'}), 201
    return jsonify([a.to_dict() for a in Application.query.filter_by(student_id=user_id).all()]), 200

@app.route('/api/admin/applications', methods=['GET'])
@jwt_required()
def admin_apps(): return jsonify([a.to_dict() for a in Application.query.all()]), 200

@app.route('/api/applications/<int:id>', methods=['PUT'])
@jwt_required()
def update_status(id):
    ap = Application.query.get(id)
    ap.status = request.json.get('status')
    db.session.commit()
    return jsonify({'message': 'Updated'}), 200

@app.route('/api/appointments', methods=['POST', 'GET'])
@jwt_required()
def handle_appointments():
    user_id = int(get_jwt_identity())
    if request.method == 'POST':
        data = request.json
        app_id = int(data['application_id'])
        db.session.add(Appointment(student_id=user_id, application_id=app_id, date=data['date'], time=data['time']))
        db.session.commit()
        user = User.query.get(user_id)
        application = Application.query.get(app_id)
        company_name = application.opportunity.company if application else "la empresa"
        send_email_confirmation(user.email, user.name, company_name, data['date'], data['time'])
        return jsonify({'message': 'Scheduled'}), 201
    return jsonify([{'id': c.id, 'date': c.date, 'time': c.time} for c in Appointment.query.filter_by(student_id=user_id).all()]), 200

if __name__ == '__main__':
    with app.app_context(): db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)