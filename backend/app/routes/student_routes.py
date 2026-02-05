from flask import Blueprint, request, jsonify, current_app, send_file
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import datetime

# Import models
from app.models import User, Experience, Certification, TutorRequest, Application, Opportunity, Appointment

# Important: Use get_file_from_r2 for PROXY file downloads
from app.services import send_email_confirmation, upload_file_to_r2, get_file_from_r2

student_bp = Blueprint('student', __name__)

# APPOINTMENT MANAGEMENT
@student_bp.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    try:
        user_id = int(get_jwt_identity())
        data = request.json
        app_id = data.get('application_id')
        
        if not app_id:
            last_app = Application.query.filter_by(student_id=user_id).order_by(Application.id.desc()).first()
            if last_app: app_id = last_app.id
            else: return jsonify({'error': 'No tienes postulaciones activas.'}), 400

        raw_date = data.get('date', '')
        clean_date = raw_date.split('T')[0] if 'T' in raw_date else raw_date
        clean_time = data.get('time', '09:00')

        new_appt = Appointment(
            student_id=user_id, application_id=app_id,
            date=clean_date, time=clean_time, status='Agendada'
        )
        db.session.add(new_appt)
        db.session.commit()

        user = User.query.get(user_id)
        application = Application.query.get(app_id)
        company_name = application.opportunity.company if (application and application.opportunity) else "Empresa"

        if user:
            send_email_confirmation(user.email, user.name, company_name, clean_date, clean_time)

        return jsonify({'message': 'Cita agendada correctamente'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_my_appointments():
    user_id = int(get_jwt_identity())
    appointments = Appointment.query.filter_by(student_id=user_id).all()
    return jsonify([appt.to_dict() for appt in appointments]), 200

# APPLICATION MANAGEMENT
@student_bp.route('/api/student/my-applications', methods=['GET'])
@jwt_required()
def get_my_applications():
    user_id = int(get_jwt_identity())
    apps = Application.query.filter_by(student_id=user_id).all()
    results = []
    for app in apps:
        data = app.to_dict()
        if app.opportunity:
            data['opportunity_title'] = app.opportunity.title
            data['company'] = app.opportunity.company
            data['location'] = app.opportunity.location
            data['type'] = app.opportunity.type
        results.append(data)
    return jsonify(results), 200

@student_bp.route('/api/applications', methods=['POST'])
@jwt_required()
def apply_to_opportunity():
    try:
        user_id = int(get_jwt_identity())
        data = request.json
        opp_id = data.get('opportunity_id')
        if not opp_id: return jsonify({'error': 'Falta ID oportunidad'}), 400

        if Application.query.filter_by(student_id=user_id, opportunity_id=opp_id).first():
            return jsonify({'error': 'Ya postulado'}), 400

        new_app = Application(
            student_id=user_id, opportunity_id=opp_id,
            status='Pendiente', date=datetime.datetime.utcnow()
        )
        db.session.add(new_app)
        db.session.commit()
        return jsonify({'message': 'Postulación exitosa', 'application_id': new_app.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# PROFILE AND DATA
@student_bp.route('/api/profile/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_profile(user_id):
    user = User.query.get(user_id)
    if not user: return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

@student_bp.route('/api/experience', methods=['POST'])
@jwt_required()
def add_experience():
    user_id = int(get_jwt_identity())
    data = request.json
    new_exp = Experience(
        company=data['company'], title=data['role'],
        start_date=data['start_date'], end_date=data.get('end_date'),
        description=data.get('description', ''), user_id=user_id
    )
    db.session.add(new_exp)
    db.session.commit()
    return jsonify({'message': 'Experience added'}), 201

@student_bp.route('/api/experience/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_experience(id):
    user_id = int(get_jwt_identity())
    exp = Experience.query.get(id)
    if exp and exp.user_id == user_id:
        db.session.delete(exp)
        db.session.commit()
        return jsonify({'message': 'Deleted'}), 200
    return jsonify({'error': 'Unauthorized'}), 403

@student_bp.route('/api/certifications', methods=['POST'])
@jwt_required()
def add_certification():
    user_id = int(get_jwt_identity())
    data = request.json
    new_cert = Certification(
        title=data['title'], institution=data['institution'],
        year=str(data.get('year', '2024')), user_id=user_id
    )
    db.session.add(new_cert)
    db.session.commit()
    return jsonify({'message': 'Certification added'}), 201

@student_bp.route('/api/certifications/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_certification(id):
    user_id = int(get_jwt_identity())
    cert = Certification.query.get(id)
    if cert and cert.user_id == user_id:
        db.session.delete(cert)
        db.session.commit()
        return jsonify({'message': 'Deleted'}), 200
    return jsonify({'error': 'Error'}), 403

# TUTOR REQUEST (R2 UPLOAD AND PROXY DOWNLOAD)
@student_bp.route('/api/tutor-requests', methods=['POST'])
@jwt_required()
def create_tutor_request():
    if 'file' not in request.files: return jsonify({'error': 'No file'}), 400
    file = request.files['file']
    user_id = int(get_jwt_identity())
    
    # Upload to R2
    r2_filename = upload_file_to_r2(file, folder="tutor_requests")
    
    if not r2_filename:
        return jsonify({'error': 'Error subiendo a la nube'}), 500
    
    new_req = TutorRequest(
        user_id=user_id, title=request.form.get('title', 'Solicitud Pasantía'),
        filename=r2_filename, date=datetime.datetime.utcnow()
    )
    db.session.add(new_req)
    db.session.commit()
    return jsonify({'message': 'Request sent'}), 201

@student_bp.route('/api/tutor-requests', methods=['GET'])
@jwt_required()
def get_my_requests():
    user_id = int(get_jwt_identity())
    reqs = TutorRequest.query.filter_by(user_id=user_id).all()
    return jsonify([r.to_dict() for r in reqs]), 200

@student_bp.route('/api/cv/<int:student_id>', methods=['GET'])
def get_cv(student_id):
    # Download file from R2 through backend (Proxy mode)
    # to avoid CORS and XML signature errors
    user = User.query.get(student_id)
    # Get filename from cv_filename field or use default name
    filename = getattr(user, 'cv_filename', None)
    
    if not filename:
        filename = f"cvs/cv_{student_id}.pdf" 

    # Backend downloads the file and serves it
    s3_file = get_file_from_r2(filename)
    
    if s3_file:
        return send_file(
            s3_file['Body'],
            mimetype=s3_file['ContentType'],
            as_attachment=False, # False to display in browser, True to force download
            download_name=filename.split('/')[-1]
        )
    else:
        return jsonify({'error': 'CV no encontrado en la nube'}), 404