from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail
import os
import datetime
import io

# --- LIBRERÍAS PDF ---
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors

# --- LIBRERÍAS DE GOOGLE ---
try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
except ImportError:
    print("⚠️ Warning: Google Auth libraries not found.")

app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'uce_internship.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key-uce'
app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'uploads')

# --- CONFIGURACIÓN EMAIL ---
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'tu_correo@gmail.com'
app.config['MAIL_PASSWORD'] = 'tu_app_password'
app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']

db = SQLAlchemy(app)
jwt = JWTManager(app)
mail = Mail(app)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# --- MODELOS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='student')
    certifications = db.relationship('Certification', backref='student', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'email': self.email, 'role': self.role,
            'certifications': [c.to_dict() for c in self.certifications]
        }

class Certification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    year = db.Column(db.String(4), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'institution': self.institution, 'year': self.year}

class Opportunity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100), default='Quito')
    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'company': self.company, 'description': self.description, 'location': self.location}

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    opportunity_id = db.Column(db.Integer, db.ForeignKey('opportunity.id'), nullable=False)
    status = db.Column(db.String(20), default='Pendiente')
    date = db.Column(db.String(20), nullable=False)
    opportunity = db.relationship('Opportunity', backref='applications')
    
    def to_dict(self):
        student = User.query.get(self.student_id)
        return {
            'id': self.id, 
            'opportunity_title': self.opportunity.title, 
            'company': self.opportunity.company,
            'status': self.status, 
            'date': self.date, 
            'student_id': self.student_id,
            'student_name': student.name if student else "Desconocido"
        }

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    application_id = db.Column(db.Integer, db.ForeignKey('application.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(20), nullable=False)

# --- RUTAS ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email ya registrado'}), 400
    role = 'admin' if User.query.count() == 0 else 'student'
    user = User(name=data['name'], email=data['email'], password=generate_password_hash(data['password']), role=role)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Usuario creado'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Credenciales incorrectas'}), 401
    
    # --- CAMBIO CRÍTICO: Identity ahora es STRING, no diccionario ---
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict()}), 200

@app.route('/api/google-login', methods=['POST'])
def google_login():
    try:
        token = request.json.get('token')
        # Reemplaza con tu CLIENT_ID real
        CLIENT_ID = "282229570814-h2f8ok7uh91tddg8eltu6cfeeqi5u9j8.apps.googleusercontent.com"
        id_info = id_token.verify_oauth2_token(token, google_requests.Request(), audience=CLIENT_ID)
        user = User.query.filter_by(email=id_info['email']).first()
        
        if not user:
            user = User(name=id_info['name'], email=id_info['email'], password=generate_password_hash("google_pw"), role='student')
            db.session.add(user)
            db.session.commit()
            
        # --- CAMBIO CRÍTICO: Identity ahora es STRING ---
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'token': access_token, 'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# --- RUTAS PROTEGIDAS (Adaptadas a String ID) ---

@app.route('/api/certifications', methods=['POST'])
@jwt_required()
def add_certification():
    try:
        user_id = int(get_jwt_identity()) # Convertimos string a int
        data = request.json
        new_cert = Certification(
            title=data['title'], 
            institution=data['institution'], 
            year=str(data['year']), 
            student_id=user_id
        )
        db.session.add(new_cert)
        db.session.commit()
        all_certs = Certification.query.filter_by(student_id=user_id).all()
        return jsonify({'certifications': [c.to_dict() for c in all_certs]}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/certifications/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_certification(id):
    cert = Certification.query.get(id)
    if cert:
        db.session.delete(cert)
        db.session.commit()
    return jsonify({'message': 'Deleted'}), 200

@app.route('/api/profile/<int:id>', methods=['GET'])
@jwt_required()
def get_profile(id):
    user = User.query.get(id)
    return jsonify(user.to_dict()) if user else (jsonify({'error': 'Not found'}), 404)

@app.route('/api/opportunities', methods=['GET', 'POST'])
def handle_opportunities():
    if request.method == 'POST':
        data = request.json
        new_opp = Opportunity(
            title=data['title'], 
            company=data['company'], 
            description=data['description'],
            location=data.get('location', 'Quito')
        )
        db.session.add(new_opp)
        db.session.commit()
        return jsonify({'message': 'Created'}), 201
    return jsonify([o.to_dict() for o in Opportunity.query.all()]), 200

@app.route('/api/applications', methods=['POST', 'GET'])
@jwt_required()
def handle_applications():
    user_id = int(get_jwt_identity()) # Convertimos string a int
    
    if request.method == 'POST':
        data = request.json
        opp_id = data.get('opportunity_id') or data.get('id')
        new_app = Application(
            student_id=user_id,
            opportunity_id=int(opp_id), 
            date=datetime.datetime.now().strftime("%Y-%m-%d")
        )
        db.session.add(new_app)
        db.session.commit()
        return jsonify({'message': 'OK'}), 201
    
    apps = Application.query.filter_by(student_id=user_id).all()
    return jsonify([a.to_dict() for a in apps]), 200

@app.route('/api/admin/applications', methods=['GET'])
@jwt_required()
def admin_apps():
    return jsonify([a.to_dict() for a in Application.query.all()]), 200

@app.route('/api/applications/<int:id>', methods=['PUT'])
@jwt_required()
def update_status(id):
    ap = Application.query.get(id)
    if ap:
        ap.status = request.json.get('status')
        db.session.commit()
    return jsonify({'message': 'Updated'}), 200

@app.route('/api/appointments', methods=['POST', 'GET'])
@jwt_required()
def handle_appointments():
    user_id = int(get_jwt_identity()) # Convertimos string a int
    if request.method == 'POST':
        data = request.json
        new_apt = Appointment(
            student_id=user_id,
            application_id=int(data['application_id']), 
            date=data['date'], 
            time=data['time']
        )
        db.session.add(new_apt)
        db.session.commit()
        return jsonify({'message': 'Scheduled'}), 201
    
    citas = Appointment.query.filter_by(student_id=user_id).all()
    return jsonify([{'id': c.id, 'date': c.date, 'time': c.time} for c in citas]), 200

# --- PDF ROUTE ---
@app.route('/api/admin/export-pdf/<int:student_id>', methods=['GET'])
@jwt_required()
def export_student_report(student_id):
    try:
        student = User.query.get(student_id)
        if not student:
            return jsonify({'error': 'Estudiante no encontrado'}), 404
        
        apps = Application.query.filter_by(student_id=student_id).all()
        certs = Certification.query.filter_by(student_id=student_id).all()

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Encabezado
        c.setFont("Helvetica-Bold", 18)
        c.drawString(50, height - 50, "Universidad Central del Ecuador")
        c.line(50, height - 60, width - 50, height - 60)
        
        # Datos
        c.setFont("Helvetica", 12)
        c.drawString(50, height - 90, f"Estudiante: {student.name}")
        c.drawString(50, height - 105, f"Email: {student.email}")
        
        y = height - 140
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "Historial de Postulaciones")
        y -= 25
        
        if not apps:
             c.setFont("Helvetica", 10)
             c.drawString(50, y, "Sin postulaciones.")
        else:
            for app in apps:
                opp = Opportunity.query.get(app.opportunity_id)
                title = opp.title if opp else "Oferta Eliminada"
                c.setFont("Helvetica-Bold", 10)
                c.drawString(50, y, f"- {title}")
                c.setFont("Helvetica", 10)
                c.drawString(300, y, f"Estado: {app.status} | Fecha: {app.date}")
                y -= 20
            
        c.save()
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name=f"Reporte_{student.name}.pdf", mimetype='application/pdf')

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/cv/<int:student_id>', methods=['GET'])
def get_cv(student_id):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], f"cv_{student_id}.pdf")
    except:
        return jsonify({'error': 'CV not found'}), 404

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)