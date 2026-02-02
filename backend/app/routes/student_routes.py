from flask import Blueprint, request, jsonify, current_app, send_from_directory
from app.extensions import db
# Required models
from app.models import User, Experience, Certification, TutorRequest, Application, Opportunity
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
# Appointment model
from app.models import User, Experience, Certification, TutorRequest, Application, Opportunity, Appointment
import os
import datetime

student_bp = Blueprint('student', __name__)

@student_bp.route('/api/student/my-applications', methods=['GET'])
@jwt_required()
def get_my_applications():
    try:
        user_id = int(get_jwt_identity())  # Authenticated user ID
        
        # Fetch student applications
        apps = Application.query.filter_by(student_id=user_id).all()
        
        results = []
        for app in apps:
            data = app.to_dict()
            
            # Add opportunity info
            if app.opportunity:
                data['opportunity_title'] = app.opportunity.title
                data['company'] = app.opportunity.company
                data['location'] = app.opportunity.location
                data['type'] = app.opportunity.type
            
            results.append(data)
            
        return jsonify(results), 200
    except Exception as e:
        print(f"Error in my-applications: {e}")
        return jsonify({'error': 'Internal error'}), 500

@student_bp.route('/api/applications', methods=['POST'])
@jwt_required()
def apply_to_opportunity():
    try:
        user_id = int(get_jwt_identity())
        data = request.json
        opp_id = data.get('opportunity_id')

        if not opp_id:
            return jsonify({'error': 'Opportunity ID missing'}), 400

        # Check opportunity exists
        opportunity = Opportunity.query.get(opp_id)
        if not opportunity:
            return jsonify({'error': 'Opportunity does not exist'}), 404

        # Avoid duplicate applications
        existing_app = Application.query.filter_by(student_id=user_id, opportunity_id=opp_id).first()
        if existing_app:
            return jsonify({'error': 'Already applied'}), 400

        # Create application
        new_app = Application(
            student_id=user_id,
            opportunity_id=opp_id,
            status='Pendiente',
            date=datetime.datetime.now()
        )
        
        db.session.add(new_app)
        db.session.commit()

        return jsonify({'message': 'Application successful', 'application': new_app.to_dict()}), 201

    except Exception as e:
        print(f"Apply error: {e}")
        db.session.rollback()  # Safety rollback
        return jsonify({'error': 'Internal server error'}), 500

@student_bp.route('/api/profile/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

@student_bp.route('/api/experience', methods=['POST'])
@jwt_required()
def add_experience():
    user_id = int(get_jwt_identity())
    data = request.json
    
    new_exp = Experience(
        company=data['company'],
        title=data['role'],  # Frontend uses "role"
        start_date=data['start_date'],
        end_date=data['end_date'],
        description=data.get('description', ''),
        user_id=user_id
    )
    db.session.add(new_exp)
    db.session.commit()
    return jsonify({'message': 'Experience added'}), 201

@student_bp.route('/api/experience/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_experience(id):
    user_id = int(get_jwt_identity())
    exp = Experience.query.get(id)
    
    # Only owner can delete
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
        title=data['title'],
        institution=data['institution'],
        year=data.get('year', '2024'),
        user_id=user_id
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

@student_bp.route('/api/tutor-requests', methods=['POST'])
@jwt_required()
def create_tutor_request():
    if 'file' not in request.files:
        return jsonify({'error': 'No file'}), 400

    file = request.files['file']
    user_id = int(get_jwt_identity())
    
    filename = secure_filename(f"tutor_{user_id}_{datetime.datetime.now().timestamp()}_{file.filename}")
    
    # Ensure upload folder exists
    if not os.path.exists(current_app.config['UPLOAD_FOLDER']):
        os.makedirs(current_app.config['UPLOAD_FOLDER'])
        
    file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
    
    new_req = TutorRequest(
        user_id=user_id,
        title=request.form.get('title', 'No title'),
        filename=filename,
        date=datetime.datetime.now()
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

@student_bp.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    try:
        user_id = int(get_jwt_identity())
        data = request.json
        
        app_id = data.get('application_id')
        date = data.get('date')
        time = data.get('time')

        if not app_id or not date or not time:
            return jsonify({'error': 'Missing data'}), 400

        # Validate ownership
        application = Application.query.get(app_id)
        if not application or application.student_id != user_id:
            return jsonify({'error': 'Invalid application'}), 403
            
        # Only approved applications
        if application.status != 'Aprobado':
             return jsonify({'error': 'Application not approved'}), 400

        new_appointment = Appointment(
            application_id=app_id,
            student_id=user_id,
            date=date,
            time=time,
            status='Agendada'
        )
        
        db.session.add(new_appointment)
        db.session.commit()
        
        return jsonify({'message': 'Appointment scheduled', 'appointment': new_appointment.to_dict()}), 201

    except Exception as e:
        print(f"Appointment error: {e}")
        return jsonify({'error': 'Internal error'}), 500

@student_bp.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_my_appointments():
    try:
        user_id = int(get_jwt_identity())
        appointments = Appointment.query.filter_by(student_id=user_id).all()
        return jsonify([appt.to_dict() for appt in appointments]), 200
    except Exception as e:
        print(f"Fetch appointments error: {e}")
        return jsonify({'error': 'Internal error'}), 500

@student_bp.route('/api/cv/<int:student_id>', methods=['GET'])
def get_cv(student_id):
    try:
        # Expected filename: cv_{student_id}.pdf
        return send_from_directory(
            current_app.config['UPLOAD_FOLDER'],
            f"cv_{student_id}.pdf"
        )
    except:
        return jsonify({'error': 'CV not found'}), 404
