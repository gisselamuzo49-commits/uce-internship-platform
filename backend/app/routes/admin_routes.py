# ==============================================================================
# CORE IMPORTS
# ==============================================================================
# Blueprint: used to group admin-related routes
# request / jsonify: HTTP request and response handling
# current_app: access to global Flask app configuration
# send_from_directory: serve uploaded files securely
from flask import Blueprint, request, jsonify, current_app, send_from_directory

# Utility to sanitize uploaded file names and prevent path traversal
from werkzeug.utils import secure_filename

# Standard library imports
import os
import datetime
import traceback

# Database instance (SQLAlchemy)
from app.extensions import db

# Application domain models
from app.models import (
    User,
    Application,
    Opportunity,
    TutorRequest,
    Appointment,
    Experience,
    Certification
)

# JWT authentication utilities
from flask_jwt_extended import jwt_required, get_jwt_identity

# SQL helper functions (aggregations, date filtering)
from sqlalchemy import func


# ==============================================================================
# ADMIN BLUEPRINT
# ==============================================================================
# Blueprint that encapsulates all administrator-only endpoints
admin_bp = Blueprint('admin', __name__)


# ==============================================================================
# AUXILIARY AUTHORIZATION MIDDLEWARE
# ==============================================================================
def check_admin(user_id):
    """
    Checks whether the given user exists and has ADMIN role.

    Args:
        user_id (int): ID extracted from JWT token

    Returns:
        bool: True if user is admin, False otherwise
    """
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return False
    return True


# ==============================================================================
# 1. STATISTICS (ADMIN DASHBOARD + ADMIN PROFILE)
# ==============================================================================
@admin_bp.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    """
    Returns aggregated statistics used by:
    - Admin dashboard
    - Admin profile management metrics
    """
    current_user_id = int(get_jwt_identity())

    # Authorization validation
    if not check_admin(current_user_id):
        return jsonify({'error': 'No autorizado'}), 403

    # --------------------------------------------------------------------------
    # BASE DASHBOARD METRICS
    # --------------------------------------------------------------------------
    students = User.query.filter_by(role='student').count()
    apps = Application.query.count()
    pending_apps = Application.query.filter_by(status='Pendiente').count()
    opps = Opportunity.query.count()

    # --------------------------------------------------------------------------
    # TUTOR WORKLOAD DISTRIBUTION
    # --------------------------------------------------------------------------
    tutor_query = db.session.query(
        TutorRequest.assigned_tutor,
        func.count(TutorRequest.id)
    ).filter(
        TutorRequest.status == 'Aprobado',
        TutorRequest.assigned_tutor != None
    ).group_by(TutorRequest.assigned_tutor).all()

    tutor_workload = [
        {"name": t[0], "estudiantes": t[1]}
        for t in tutor_query
    ]

    # --------------------------------------------------------------------------
    # APPLICATION ACTIVITY TREND (LAST 7 DAYS)
    # --------------------------------------------------------------------------
    activity_trend = []
    today = datetime.datetime.utcnow().date()

    for i in range(6, -1, -1):
        target_date = today - datetime.timedelta(days=i)
        count = Application.query.filter(
            func.date(Application.date) == target_date
        ).count()

        activity_trend.append({
            "fecha": target_date.strftime('%d/%m'),
            "postulaciones": count
        })

    # --------------------------------------------------------------------------
    # TUTOR REQUEST MANAGEMENT METRICS (ADMIN PROFILE)
    # --------------------------------------------------------------------------
    tr_total = TutorRequest.query.count()
    tr_pending = TutorRequest.query.filter_by(status='Pendiente').count()
    tr_approved = TutorRequest.query.filter_by(status='Aprobado').count()
    tr_avales = TutorRequest.query.filter(
        TutorRequest.memo_filename != None
    ).count()

    return jsonify({
        # Dashboard metrics
        'students': students,
        'applications': apps,
        'pending': pending_apps,
        'opportunities': opps,
        'tutor_workload': tutor_workload,
        'activity_trend': activity_trend,

        # Admin profile metrics
        'total': tr_total,
        'pendientes': tr_pending,
        'aprobadas': tr_approved,
        'avales': tr_avales
    }), 200


# ==============================================================================
# 2. OPPORTUNITY MANAGEMENT
# ==============================================================================
@admin_bp.route('/api/opportunities', methods=['POST'])
@jwt_required()
def create_opportunity():
    """
    Creates a new opportunity (job or internship).
    """
    if not check_admin(int(get_jwt_identity())):
        return jsonify({'error': 'No autorizado'}), 403

    data = request.json

    try:
        new_opp = Opportunity(
            title=data['title'],
            company=data['company'],
            description=data['description'],
            location=data['location'],
            deadline=data['deadline'],
            vacancies=data.get('vacancies', 1),
            type=data.get('type', 'pasantia')
        )

        db.session.add(new_opp)
        db.session.commit()

        return jsonify({'message': 'Creada', 'opportunity': new_opp.to_dict()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/api/opportunities/<int:id>', methods=['PUT'])
@jwt_required()
def update_opportunity(id):
    """
    Updates an existing opportunity.
    """
    if not check_admin(int(get_jwt_identity())):
        return jsonify({'error': 'No autorizado'}), 403

    data = request.json
    opp = Opportunity.query.get(id)

    if not opp:
        return jsonify({'error': 'No encontrada'}), 404

    # Partial update to avoid overwriting existing values
    opp.title = data.get('title', opp.title)
    opp.company = data.get('company', opp.company)
    opp.description = data.get('description', opp.description)
    opp.location = data.get('location', opp.location)
    opp.deadline = data.get('deadline', opp.deadline)
    opp.vacancies = data.get('vacancies', opp.vacancies)
    opp.type = data.get('type', opp.type)

    db.session.commit()
    return jsonify({'message': 'Actualizada'}), 200


@admin_bp.route('/api/opportunities/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_opportunity(id):
    """
    Deletes an opportunity by ID.
    """
    if not check_admin(int(get_jwt_identity())):
        return jsonify({'error': 'No autorizado'}), 403

    opp = Opportunity.query.get(id)
    if opp:
        db.session.delete(opp)
        db.session.commit()
        return jsonify({'message': 'Eliminada'}), 200

    return jsonify({'error': 'No encontrada'}), 404


# ==============================================================================
# 3. APPLICATION MANAGEMENT
# ==============================================================================
@admin_bp.route('/api/admin/applications', methods=['GET'])
@jwt_required()
def get_all_applications():
    """
    Retrieves all applications with related student and opportunity data.
    """
    if not check_admin(int(get_jwt_identity())):
        return jsonify({'error': 'No autorizado'}), 403

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
    """
    Updates the status of an application.
    """
    if not check_admin(int(get_jwt_identity())):
        return jsonify({'error': 'No autorizado'}), 403

    app = Application.query.get(id)
    if not app:
        return jsonify({'error': 'No encontrado'}), 404

    app.status = request.json.get('status')
    db.session.commit()
    return jsonify({'message': 'Actualizado'}), 200


# ==============================================================================
# 4. TUTOR REQUEST MANAGEMENT (LIST, UPDATE, UPLOAD MEMO)
# ==============================================================================
@admin_bp.route('/api/admin/tutor-requests', methods=['GET'])
@jwt_required()
def get_all_tutor_requests():
    """
    Retrieves all tutor requests with related student information.
    """
    if not check_admin(int(get_jwt_identity())):
        return jsonify({'error': 'No autorizado'}), 403

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
    """
    Updates tutor request status and assigns tutor information.
    """
    if not check_admin(int(get_jwt_identity())):
        return jsonify({'error': 'No autorizado'}), 403

    data = request.json
    req = TutorRequest.query.get(id)

    if req:
        req.status = data.get('status')
        if 'tutor_name' in data:
            req.assigned_tutor = data['tutor_name']
        if 'tutor_email' in data:
            req.tutor_email = data['tutor_email']

        db.session.commit()
        return jsonify({'message': 'Actualizado'}), 200

    return jsonify({'error': 'No encontrado'}), 404


# ==============================================================================
# UPLOAD TUTOR ASSIGNMENT MEMO
# ==============================================================================
@admin_bp.route('/api/admin/tutor-requests/<int:id>/upload-memo', methods=['POST'])
@jwt_required()
def upload_tutor_memo(id):
    """
    Uploads and associates a memo document to a tutor request.
    """
    current_user_id = int(get_jwt_identity())

    if not check_admin(current_user_id):
        return jsonify({'error': 'No autorizado'}), 403

    if 'file' not in request.files:
        return jsonify({'error': 'No se envió archivo'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nombre de archivo vacío'}), 400

    req_tutor = TutorRequest.query.get(id)
    if not req_tutor:
        return jsonify({'error': 'Solicitud no encontrada'}), 404

    try:
        # Generate a unique and safe filename
        filename = secure_filename(file.filename)
        unique_filename = f"memo_{req_tutor.id}_{filename}"

        save_path = os.path.join(
            current_app.config['UPLOAD_FOLDER'],
            unique_filename
        )

        file.save(save_path)

        # Persist memo reference in database
        req_tutor.memo_filename = unique_filename
        db.session.commit()

        return jsonify({'message': 'Memo subido', 'filename': unique_filename}), 200

    except Exception as e:
        print(f"❌ Error uploading memo: {str(e)}", flush=True)
        return jsonify({'error': 'Error al guardar el archivo'}), 500


# ==============================================================================
# 5. STUDENT PROFILE (ADMIN VIEW)
# ==============================================================================
@admin_bp.route('/api/admin/students/<int:id>', methods=['GET'])
@jwt_required()
def get_student_profile(id):
    """
    Retrieves full student profile including experience and certifications.
    """
    if not check_admin(int(get_jwt_identity())):
        return jsonify({'error': 'No autorizado'}), 403

    student = User.query.get(id)
    if not student:
        return jsonify({'error': 'No encontrado'}), 404

    response = student.to_dict()
    response['experiences'] = [
        e.to_dict() for e in Experience.query.filter_by(user_id=id).all()
    ]
    response['certifications'] = [
        c.to_dict() for c in Certification.query.filter_by(user_id=id).all()
    ]

    return jsonify(response), 200


# ==============================================================================
# 6. APPOINTMENTS
# ==============================================================================
@admin_bp.route('/api/admin/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    """
    Retrieves all scheduled appointments.
    """
    if not check_admin(int(get_jwt_identity())):
        return jsonify({'error': 'No autorizado'}), 403

    appts = Appointment.query.order_by(Appointment.date.desc()).all()
    results = []

    for a in appts:
        d = a.to_dict()
        if a.student_user:
            d['student_name'] = a.student_user.name
            d['student_email'] = a.student_user.email
        results.append(d)

    return jsonify(results), 200


# ==============================================================================
# 7. FILE DOWNLOAD (CVs AND MEMOS)
# ==============================================================================
@admin_bp.route('/api/uploads/<filename>', methods=['GET'])
def download_file(filename):
    """
    Serves uploaded files (CVs, memos).
    """
    try:
        return send_from_directory(
            current_app.config['UPLOAD_FOLDER'],
            filename
        )
    except:
        return jsonify({'error': 'No encontrado'}), 404


# ==============================================================================
# 8. SYNCHRONIZED DAILY REPORT
# ==============================================================================
@admin_bp.route('/api/admin/daily-report', methods=['GET'])
@jwt_required()
def daily_report():
    """
    Generates a synchronized report that matches applications
    with tutor requests using positional logic.
    """
    current_user_id = int(get_jwt_identity())

    if not check_admin(current_user_id):
        return jsonify({'error': 'No autorizado'}), 403

    try:
        # Optional date filter
        date_str = request.args.get('date')
        query = Application.query.order_by(Application.date.asc())

        if date_str:
            query = query.filter(func.date(Application.date) == date_str)

        apps = query.all()
        report_data = []

        # Cache student tutor requests to avoid redundant queries
        student_requests_map = {}

        for app in apps:
            student = app.student_user
            opp = app.opportunity

            # Documentation validation
            doc_ready = False
            if student:
                tiene_cv = getattr(student, 'cv_filename', None)
                tiene_exp = Experience.query.filter_by(user_id=student.id).first()
                tiene_cert = Certification.query.filter_by(user_id=student.id).first()
                if tiene_cv or tiene_exp or tiene_cert:
                    doc_ready = True

            # Tutor matching logic (positional)
            tutor_req = None
            if app.student_id:
                sid = app.student_id

                if sid not in student_requests_map:
                    reqs = TutorRequest.query.filter_by(
                        user_id=sid
                    ).order_by(TutorRequest.id.asc()).all()
                    student_requests_map[sid] = reqs

                student_apps = Application.query.filter_by(
                    student_id=sid
                ).order_by(Application.id.asc()).all()

                try:
                    app_index = next(
                        i for i, a in enumerate(student_apps)
                        if a.id == app.id
                    )

                    student_reqs_list = student_requests_map[sid]
                    if app_index < len(student_reqs_list):
                        tutor_req = student_reqs_list[app_index]

                except Exception:
                    tutor_req = None

            # Safe value extraction
            student_name = student.name if student else 'Usuario Eliminado'
            student_email = student.email if student else 'N/A'
            company = opp.company if opp else 'N/A'
            cargo = opp.title if opp else 'N/A'

            nombre_tutor = (
                getattr(tutor_req, 'assigned_tutor', None)
                if tutor_req else None
            )
            estado_tutor = (
                getattr(tutor_req, 'status', 'Sin Solicitud')
                if tutor_req else 'Sin Solicitud'
            )

            item = {
                'fecha_aprobacion': app.date.strftime('%Y-%m-%d'),
                'estudiante': f"{student_name} ({app.status})",
                'email': student_email,
                'empresa': company,
                'cargo': cargo,
                'documentacion_subida': 'SÍ' if doc_ready else 'NO',
                'estado_tutor': estado_tutor,
                'nombre_tutor': nombre_tutor if nombre_tutor else 'Por Asignar'
            }

            report_data.append(item)

        # Reverse list to show most recent records first
        report_data.reverse()
        return jsonify(report_data), 200

    except Exception as e:
        traceback.print_exc()
        print(f"❌ REPORT ERROR: {str(e)}", flush=True)
        return jsonify({'error': 'Error interno'}), 500
