from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import datetime
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'uce_internship.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key-uce'
app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'uploads')

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
    tutor_requests = db.relationship('TutorRequest', backref='student', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'email': self.email, 'role': self.role, 'certifications': [c.to_dict() for c in self.certifications]}

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
    # --- NUEVO CAMPO: LÍMITE DE VACANTES ---
    vacancies = db.Column(db.Integer, default=1) 

    def to_dict(self):
        return {
            'id': self.id, 'title': self.title, 'company': self.company, 
            'description': self.description, 'location': self.location, 
            'deadline': self.deadline,
            'vacancies': self.vacancies, # Enviamos el límite
            'applicants_count': len(self.applications) # Enviamos cuántos van
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

# ================= RUTAS =================

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first(): return jsonify({'error': 'Email ya registrado'}), 400
    role = 'admin' if User.query.count() == 0 else 'student'
    user = User(name=data['name'], email=data['email'], password=generate_password_hash(data['password']), role=role)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Usuario creado'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']): return jsonify({'error': 'Credenciales incorrectas'}), 401
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict()}), 200

@app.route('/api/user/update', methods=['PUT'])
@jwt_required()
def update_user():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user: return jsonify({'error': 'Usuario no encontrado'}), 404
    data = request.json
    if 'name' in data and data['name']: user.name = data['name']
    if 'password' in data and data['password']: user.password = generate_password_hash(data['password'])
    db.session.commit()
    return jsonify({'message': 'Perfil actualizado', 'user': user.to_dict()}), 200

@app.route('/api/profile/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_profile(user_id):
    user = User.query.get(user_id)
    return jsonify(user.to_dict()), 200

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
def get_all_requests():
    reqs = TutorRequest.query.all()
    return jsonify([r.to_dict() for r in reqs]), 200

@app.route('/api/admin/tutor-requests/<int:id>', methods=['PUT'])
@jwt_required()
def update_tutor_req(id):
    req = TutorRequest.query.get(id)
    if not req: return jsonify({'error': 'No encontrado'}), 404
    data = request.json
    req.status = data.get('status', req.status)
    req.tutor_name = data.get('tutor_name', req.tutor_name)
    db.session.commit()
    return jsonify({'message': 'Actualizado'}), 200

@app.route('/api/uploads/<filename>', methods=['GET'])
def get_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/upload-cv', methods=['POST'])
@jwt_required()
def upload_cv():
    if 'file' not in request.files: return jsonify({'error': 'No file'}), 400
    file = request.files['file']
    user_id = get_jwt_identity()
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], f"cv_{user_id}.pdf"))
    return jsonify({'message': 'CV subido'}), 200

@app.route('/api/cv/<int:student_id>', methods=['GET'])
def get_cv(student_id):
    try: return send_from_directory(app.config['UPLOAD_FOLDER'], f"cv_{student_id}.pdf")
    except: return jsonify({'error': 'CV not found'}), 404

@app.route('/api/admin/export-pdf/<int:student_id>', methods=['GET'])
@jwt_required()
def export_pdf(student_id):
    user = User.query.get(student_id)
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    p.drawString(100, 750, f"Reporte: {user.name} ({user.email})")
    p.showPage()
    p.save()
    buffer.seek(0)
    response = make_response(buffer.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    return response

# --- OPORTUNIDADES CON VALIDACIÓN ---
@app.route('/api/opportunities', methods=['GET', 'POST'])
def handle_opportunities():
    if request.method == 'POST':
        data = request.json
        # Guardamos también las vacantes (vacancies)
        new_opp = Opportunity(
            title=data['title'], company=data['company'], 
            description=data['description'], location=data.get('location', 'Quito'), 
            deadline=data.get('deadline'), 
            vacancies=int(data.get('vacancies', 1)) # Nuevo campo
        )
        db.session.add(new_opp)
        db.session.commit()
        return jsonify({'message': 'Created'}), 201
    return jsonify([o.to_dict() for o in Opportunity.query.all()]), 200

# --- APLICACIONES CON VALIDACIÓN DE FECHA Y CUPOS ---
@app.route('/api/applications', methods=['POST', 'GET'])
@jwt_required()
def handle_applications():
    user_id = int(get_jwt_identity())
    
    if request.method == 'POST':
        data = request.json
        opp_id = data.get('opportunity_id')
        opportunity = Opportunity.query.get(opp_id)
        
        # 1. VALIDAR FECHA
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        if opportunity.deadline and today > opportunity.deadline:
            return jsonify({'error': 'Caducado'}), 400
        
        # 2. VALIDAR CUPOS (VACANTES)
        current_applicants = len(opportunity.applications)
        if current_applicants >= opportunity.vacancies:
            return jsonify({'error': 'Lleno'}), 400

        new_app = Application(student_id=user_id, opportunity_id=int(opp_id), date=today)
        db.session.add(new_app)
        db.session.commit()
        return jsonify({'message': 'OK'}), 201

    apps = Application.query.filter_by(student_id=user_id).all()
    return jsonify([a.to_dict() for a in apps]), 200

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
        db.session.add(Appointment(student_id=user_id, application_id=int(data['application_id']), date=data['date'], time=data['time']))
        db.session.commit()
        return jsonify({'message': 'Scheduled'}), 201
    citas = Appointment.query.filter_by(student_id=user_id).all()
    return jsonify([{'id': c.id, 'date': c.date, 'time': c.time} for c in citas]), 200

if __name__ == '__main__':
    with app.app_context(): db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)