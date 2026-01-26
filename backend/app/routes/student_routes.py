from flask import Blueprint, request, jsonify, current_app, send_from_directory
from app.extensions import db
# 👇 IMPORTANTE: Agregamos 'Application' aquí
from app.models import User, Experience, Certification, TutorRequest, Application
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import datetime

student_bp = Blueprint('student', __name__)

# --- RUTA NUEVA: MIS POSTULACIONES (La que soluciona el problema) ---
@student_bp.route('/api/student/my-applications', methods=['GET'])
@jwt_required()
def get_my_applications():
    user_id = int(get_jwt_identity())
    
    # Buscamos en la BD solo las postulaciones de este usuario
    apps = Application.query.filter_by(student_id=user_id).all()
    
    results = []
    for app in apps:
        data = app.to_dict()
        # Aseguramos que vengan datos de la empresa para mostrar bonito en el frontend
        if app.opportunity:
            data['company'] = app.opportunity.company
            data['opportunity_title'] = app.opportunity.title
        results.append(data)
        
    return jsonify(results), 200

# --- PERFIL ---
@student_bp.route('/api/profile/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_profile(user_id):
    user = User.query.get(user_id)
    if not user: return jsonify({'error': 'Usuario no encontrado'}), 404
    return jsonify(user.to_dict()), 200

@student_bp.route('/api/user/update', methods=['PUT'])
@jwt_required()
def update_user():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.json
    if 'name' in data and data['name']: user.name = data['name']
    if 'password' in data and data['password']: 
        from werkzeug.security import generate_password_hash
        user.password = generate_password_hash(data['password'])
    db.session.commit()
    return jsonify({'message': 'Perfil actualizado', 'user': user.to_dict()}), 200

# --- EXPERIENCIA ---
@student_bp.route('/api/experience', methods=['POST'])
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

@student_bp.route('/api/experience/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_experience(id):
    user_id = int(get_jwt_identity())
    exp = Experience.query.get(id)
    if exp and exp.student_id == user_id:
        db.session.delete(exp)
        db.session.commit()
        return jsonify({'message': 'Eliminado'}), 200
    return jsonify({'error': 'No autorizado'}), 403

# --- CERTIFICACIONES ---
@student_bp.route('/api/certifications', methods=['POST'])
@jwt_required()
def add_certification():
    user_id = int(get_jwt_identity())
    data = request.json
    new_cert = Certification(title=data['title'], institution=data['institution'], year=data.get('year', '2024'), student_id=user_id)
    db.session.add(new_cert)
    db.session.commit()
    return jsonify({'message': 'Certificación agregada'}), 201

@student_bp.route('/api/certifications/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_certification(id):
    user_id = int(get_jwt_identity())
    cert = Certification.query.get(id)
    if cert and cert.student_id == user_id:
        db.session.delete(cert)
        db.session.commit()
        return jsonify({'message': 'Eliminado'}), 200
    return jsonify({'error': 'Error'}), 403

# --- TUTORÍA Y ARCHIVOS ---
@student_bp.route('/api/tutor-requests', methods=['POST'])
@jwt_required()
def create_tutor_request():
    if 'file' not in request.files: return jsonify({'error': 'No file'}), 400
    file = request.files['file']
    user_id = int(get_jwt_identity())
    filename = secure_filename(f"tutor_{user_id}_{datetime.datetime.now().timestamp()}_{file.filename}")
    file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
    
    new_req = TutorRequest(
        student_id=user_id, title=request.form.get('title'), 
        filename=filename, date=datetime.datetime.now().strftime("%Y-%m-%d")
    )
    db.session.add(new_req)
    db.session.commit()
    return jsonify({'message': 'Solicitud enviada'}), 201

@student_bp.route('/api/tutor-requests', methods=['GET'])
@jwt_required()
def get_my_requests():
    user_id = int(get_jwt_identity())
    reqs = TutorRequest.query.filter_by(student_id=user_id).all()
    return jsonify([r.to_dict() for r in reqs]), 200

# Descarga de Archivos
@student_bp.route('/api/uploads/<filename>', methods=['GET'])
def get_file(filename): 
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@student_bp.route('/api/cv/<int:student_id>', methods=['GET'])
def get_cv(student_id):
    try: return send_from_directory(current_app.config['UPLOAD_FOLDER'], f"cv_{student_id}.pdf")
    except: return jsonify({'error': 'CV not found'}), 404