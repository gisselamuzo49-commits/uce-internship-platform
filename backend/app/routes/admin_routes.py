from flask import Blueprint, request, jsonify, current_app, send_file
from werkzeug.utils import secure_filename
import os
import datetime
import traceback
from app.extensions import db
from app.models import User, Application, Opportunity, TutorRequest, Appointment, Experience, Certification
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

# Important: Use get_file_from_r2 for PROXY file downloads
from app.services import upload_file_to_r2, get_file_from_r2

admin_bp = Blueprint('admin', __name__)

def check_admin(user_id):
    """Check if user has admin privileges"""
    user = User.query.get(user_id)
    if not user or user.role != 'admin': return False
    return True


# STATISTICS AND DASHBOARD
@admin_bp.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    # Retrieve admin dashboard statistics
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403

    students = User.query.filter_by(role='student').count()
    apps = Application.query.count()
    pending_apps = Application.query.filter_by(status='Pendiente').count()
    opps = Opportunity.query.count()

    # Query tutor workload
    tutor_query = db.session.query(
        TutorRequest.assigned_tutor, func.count(TutorRequest.id)
    ).filter(
        TutorRequest.status == 'Aprobado', TutorRequest.assigned_tutor != None
    ).group_by(TutorRequest.assigned_tutor).all()
    tutor_workload = [{"name": t[0], "estudiantes": t[1]} for t in tutor_query]

    # Activity trend for last 7 days
    activity_trend = []
    today = datetime.datetime.utcnow().date()
    for i in range(6, -1, -1):
        target_date = today - datetime.timedelta(days=i)
        count = Application.query.filter(func.date(Application.date) == target_date).count()
        activity_trend.append({"fecha": target_date.strftime('%d/%m'), "postulaciones": count})

    # Tutor request stats
    tr_total = TutorRequest.query.count()
    tr_pending = TutorRequest.query.filter_by(status='Pendiente').count()
    tr_approved = TutorRequest.query.filter_by(status='Aprobado').count()
    tr_avales = TutorRequest.query.filter(TutorRequest.memo_filename != None).count()

    return jsonify({
        'students': students, 'applications': apps, 'pending': pending_apps,
        'opportunities': opps, 'tutor_workload': tutor_workload, 'activity_trend': activity_trend,
        'total': tr_total, 'pendientes': tr_pending, 'aprobadas': tr_approved, 'avales': tr_avales
    }), 200


# OPPORTUNITIES MANAGEMENT

@admin_bp.route('/api/opportunities', methods=['POST'])
@jwt_required()
def create_opportunity():
    # Create a new opportunity
    if not check_admin(int(get_jwt_identity())): return jsonify({'error': 'No autorizado'}), 403
    data = request.json
    try:
        new_opp = Opportunity(
            title=data['title'], company=data['company'], description=data['description'],
            location=data['location'], deadline=data['deadline'], vacancies=data.get('vacancies', 1),
            type=data.get('type', 'pasantia')
        )
        db.session.add(new_opp)
        db.session.commit()
        return jsonify({'message': 'Creada', 'opportunity': new_opp.to_dict()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/api/opportunities/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_opportunity(id):
    # Update or delete an opportunity
    if not check_admin(int(get_jwt_identity())): return jsonify({'error': 'No autorizado'}), 403
    opp = Opportunity.query.get(id)
    if not opp: return jsonify({'error': 'No encontrada'}), 404

    if request.method == 'DELETE':
        db.session.delete(opp)
        db.session.commit()
        return jsonify({'message': 'Eliminada'}), 200
    
    data = request.json
    opp.title = data.get('title', opp.title)
    opp.company = data.get('company', opp.company)
    opp.description = data.get('description', opp.description)
    opp.location = data.get('location', opp.location)
    opp.deadline = data.get('deadline', opp.deadline)
    opp.vacancies = data.get('vacancies', opp.vacancies)
    opp.type = data.get('type', opp.type)
    db.session.commit()
    return jsonify({'message': 'Actualizada'}), 200

# APPLICATIONS MANAGEMENT (ADMIN)

@admin_bp.route('/api/admin/applications', methods=['GET'])
@jwt_required()
def get_all_applications():
    # Fetch all student applications
    if not check_admin(int(get_jwt_identity())): return jsonify({'error': 'No autorizado'}), 403
    apps = Application.query.order_by(Application.date.desc()).all()
    results = []
    for app in apps:
        data = app.to_dict()
        data['student_id'] = app.student_id
        if app.student_user:
            data['student_name'] = app.student_user.name
            data['student_email'] = app.student_user.email
        if app.opportunity:
            data['opportunity_title'] = app.opportunity.title
            data['type'] = app.opportunity.type
        results.append(data)
    return jsonify(results), 200

@admin_bp.route('/api/admin/applications/<int:id>/status', methods=['PUT'])
@jwt_required()
def update_application_status(id):
    # Update application status
    if not check_admin(int(get_jwt_identity())): return jsonify({'error': 'No autorizado'}), 403
    app = Application.query.get(id)
    if not app: return jsonify({'error': 'No encontrado'}), 404
    
    new_status = request.json.get('status')
    if new_status == 'Aprobado' and app.status != 'Aprobado':
        # Use Ecuador timezone (UTC-5) for approval date
        ecuador_tz = datetime.timezone(datetime.timedelta(hours=-5))
        app.approval_date = datetime.datetime.now(ecuador_tz).replace(tzinfo=None)
    
    app.status = new_status
    db.session.commit()
    return jsonify({'message': 'Actualizado'}), 200

# TUTOR REQUESTS MANAGEMENT

@admin_bp.route('/api/admin/tutor-requests', methods=['GET'])
@jwt_required()
def get_all_tutor_requests():
    # Fetch all tutor requests
    if not check_admin(int(get_jwt_identity())): return jsonify({'error': 'No autorizado'}), 403
    reqs = TutorRequest.query.order_by(TutorRequest.date.desc()).all()
    results = []
    for r in reqs:
        d = r.to_dict()
        if r.student_user:
            d['student_name'] = r.student_user.name
            d['student_email'] = r.student_user.email
            d['student_id'] = r.user_id
        results.append(d)
    return jsonify(results), 200

@admin_bp.route('/api/admin/tutor-requests/<int:id>/status', methods=['PUT'])
@jwt_required()
def update_tutor_status(id):
    # Update tutor request status and assignment
    if not check_admin(int(get_jwt_identity())): return jsonify({'error': 'No autorizado'}), 403
    data = request.json
    req = TutorRequest.query.get(id)
    if req:
        req.status = data.get('status')
        if 'tutor_name' in data: req.assigned_tutor = data['tutor_name']
        if 'tutor_email' in data: req.tutor_email = data['tutor_email']
        db.session.commit()
        return jsonify({'message': 'Actualizado'}), 200
    return jsonify({'error': 'No encontrado'}), 404

@admin_bp.route('/api/admin/tutor-requests/<int:id>/upload-memo', methods=['POST'])
@jwt_required()
def upload_tutor_memo(id):
    # Upload tutor memo document to Cloudflare R2
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403
    
    if 'file' not in request.files: return jsonify({'error': 'No se envió archivo'}), 400
    file = request.files['file']
    
    req_tutor = TutorRequest.query.get(id)
    if not req_tutor: return jsonify({'error': 'Solicitud no encontrada'}), 404

    try:
        # Upload to R2
        r2_filename = upload_file_to_r2(file, folder="memos_admin")
        if not r2_filename: return jsonify({'error': 'Fallo la subida a Cloudflare'}), 500

        req_tutor.memo_filename = r2_filename
        db.session.commit()
        return jsonify({'message': 'Memo subido', 'filename': r2_filename}), 200
    except Exception as e:
        print(f"❌ Error uploading memo: {str(e)}", flush=True)
        return jsonify({'error': 'Error al guardar el archivo'}), 500

@admin_bp.route('/api/admin/students/<int:id>', methods=['GET'])
@jwt_required()
def get_student_profile(id):
    # Fetch student profile with experiences and certifications
    if not check_admin(int(get_jwt_identity())): return jsonify({'error': 'No autorizado'}), 403
    student = User.query.get(id)
    if not student: return jsonify({'error': 'No encontrado'}), 404
    response = student.to_dict()
    response['experiences'] = [e.to_dict() for e in Experience.query.filter_by(user_id=id).all()]
    response['certifications'] = [c.to_dict() for c in Certification.query.filter_by(user_id=id).all()]
    return jsonify(response), 200

@admin_bp.route('/api/admin/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    # Fetch all student appointments
    if not check_admin(int(get_jwt_identity())): return jsonify({'error': 'No autorizado'}), 403
    appts = Appointment.query.order_by(Appointment.date.desc()).all()
    results = []
    for a in appts:
        d = a.to_dict()
        if a.student_user:
            d['student_name'] = a.student_user.name
            d['student_email'] = a.student_user.email
        results.append(d)
    return jsonify(results), 200

# UNIVERSAL FILE DOWNLOAD (PROXY MODE)
@admin_bp.route('/api/uploads/<path:filename>', methods=['GET'])
def download_file(filename):
    # Download file from Cloudflare R2 through backend (Proxy mode)
    # to avoid CORS and XML signature errors
    s3_file = get_file_from_r2(filename)
    
    if s3_file:
        return send_file(
            s3_file['Body'],
            mimetype=s3_file['ContentType'],
            as_attachment=False, 
            download_name=filename.split('/')[-1]
        )
    else:
        return jsonify({'error': 'Archivo no encontrado en la nube'}), 404

@admin_bp.route('/api/admin/daily-report', methods=['GET'])
@jwt_required()
def daily_report():
    # Generate daily internship report with student and tutor information
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403
    try:
        date_str = request.args.get('date')
        # Filter by approval_date instead of creation date
        query = Application.query.filter_by(status='Aprobado').order_by(Application.approval_date.asc())
        
        if date_str: 
            # Cast to date to match YYYY-MM-DD
            query = query.filter(func.date(Application.approval_date) == date_str)
            
        apps = query.all()
        report_data = []
        student_requests_map = {}
        
        for app in apps:
            student = app.student_user
            opp = app.opportunity
            doc_ready = False
            if student:
                # Check if student has uploaded documentation
                tiene_cv = getattr(student, 'cv_filename', None)
                tiene_exp = Experience.query.filter_by(user_id=student.id).first()
                tiene_cert = Certification.query.filter_by(user_id=student.id).first()
                if tiene_cv or tiene_exp or tiene_cert: doc_ready = True

            tutor_req = None
            if app.student_id:
                sid = app.student_id
                if sid not in student_requests_map:
                    reqs = TutorRequest.query.filter_by(user_id=sid).order_by(TutorRequest.id.asc()).all()
                    student_requests_map[sid] = reqs
                student_apps = Application.query.filter_by(student_id=sid).order_by(Application.id.asc()).all()
                try:
                    app_index = next(i for i, a in enumerate(student_apps) if a.id == app.id)
                    student_reqs_list = student_requests_map[sid]
                    if app_index < len(student_reqs_list): tutor_req = student_reqs_list[app_index]
                except: tutor_req = None

            student_name = student.name if student else 'Usuario Eliminado'
            nombre_tutor = getattr(tutor_req, 'assigned_tutor', None) if tutor_req else None
            estado_tutor = getattr(tutor_req, 'status', 'Sin Solicitud') if tutor_req else 'Sin Solicitud'

            item = {
                'fecha_aprobacion': app.approval_date.strftime('%Y-%m-%d') if app.approval_date else 'N/A',
                'estudiante': f"{student_name} ({app.status})",
                'email': student.email if student else 'N/A',
                'empresa': opp.company if opp else 'N/A',
                'cargo': opp.title if opp else 'N/A',
                'documentacion_subida': 'SÍ' if doc_ready else 'NO',
                'estado_tutor': estado_tutor,
                'nombre_tutor': nombre_tutor if nombre_tutor else 'Por Asignar'
            }
            report_data.append(item)
        report_data.reverse()
        return jsonify(report_data), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': 'Internal error'}), 500