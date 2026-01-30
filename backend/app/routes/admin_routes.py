from flask import Blueprint, request, jsonify, current_app, send_from_directory
from app.extensions import db
from app.models import User, Application, Opportunity, TutorRequest, Appointment, Experience, Certification
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func 
import datetime

admin_bp = Blueprint('admin', __name__)

# Middleware auxiliar para validar rol de administrador
def check_admin(user_id):
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return False
    return True

# ==============================================================================
# 1. DASHBOARD / ESTADÍSTICAS (ACTUALIZADO PARA GRÁFICAS)
# ==============================================================================
@admin_bp.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): 
        return jsonify({'error': 'No autorizado'}), 403

    # Estadísticas básicas para StatCards
    students_count = User.query.filter_by(role='student').count()
    apps_count = Application.query.count()
    pending_count = Application.query.filter_by(status='Pendiente').count()
    opps_count = Opportunity.query.count()

    # DATOS PARA GRÁFICA 4: CARGA DE TRABAJO DE TUTORES
    tutor_query = db.session.query(
        TutorRequest.assigned_tutor, 
        func.count(TutorRequest.id)
    ).filter(
        TutorRequest.status == 'Aprobado',
        TutorRequest.assigned_tutor != None
    ).group_by(TutorRequest.assigned_tutor).all()
    
    tutor_workload = [{"name": t[0], "estudiantes": t[1]} for t in tutor_query]

    # DATOS PARA GRÁFICA 5: TENDENCIA DE ACTIVIDAD (Últimos 7 días)
    activity_trend = []
    today = datetime.datetime.utcnow().date()
    for i in range(6, -1, -1):
        target_date = today - datetime.timedelta(days=i)
        count = Application.query.filter(func.date(Application.date) == target_date).count()
        activity_trend.append({
            "fecha": target_date.strftime('%d/%m'),
            "postulaciones": count
        })

    return jsonify({
        'students': students_count,
        'applications': apps_count,
        'pending': pending_count,
        'opportunities': opps_count,
        'tutor_workload': tutor_workload,
        'activity_trend': activity_trend
    }), 200

# ==============================================================================
# 2. GESTIÓN DE OPORTUNIDADES (OFERTAS)
# ==============================================================================
@admin_bp.route('/api/opportunities', methods=['POST'])
@jwt_required()
def create_opportunity():
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403
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

@admin_bp.route('/api/opportunities/<int:id>', methods=['PUT'])
@jwt_required()
def update_opportunity(id):
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403
    data = request.json
    opp = Opportunity.query.get(id)
    if not opp: return jsonify({'error': 'No encontrada'}), 404

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
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403
    opp = Opportunity.query.get(id)
    if opp:
        db.session.delete(opp)
        db.session.commit()
        return jsonify({'message': 'Eliminada'}), 200
    return jsonify({'error': 'No encontrada'}), 404

# ==============================================================================
# 3. GESTIÓN DE APLICACIONES (POSTULACIONES)
# ==============================================================================
@admin_bp.route('/api/admin/applications', methods=['GET'])
@jwt_required()
def get_all_applications():
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403
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
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403
    data = request.json
    app = Application.query.get(id)
    if not app: return jsonify({'error': 'No encontrado'}), 404
    app.status = data.get('status')
    db.session.commit()
    return jsonify({'message': 'Actualizado'}), 200

# ==============================================================================
# 4. GESTIÓN DE TUTORÍAS (FORMALIZACIÓN CON NOMBRE Y CORREO)
# ==============================================================================
@admin_bp.route('/api/admin/tutor-requests', methods=['GET'])
@jwt_required()
def get_all_tutor_requests():
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403
    reqs = TutorRequest.query.order_by(TutorRequest.date.desc()).all()
    results = []
    for r in reqs:
        d = r.to_dict()
        if r.student_user: 
            d['student_name'] = r.student_user.name
            d['student_id'] = r.user_id 
            d['student_email'] = r.student_user.email
        results.append(d)
    return jsonify(results), 200

@admin_bp.route('/api/admin/tutor-requests/<int:id>/status', methods=['PUT'])
@jwt_required()
def update_tutor_status(id):
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403
    data = request.json
    req = TutorRequest.query.get(id)
    if req:
        req.status = data.get('status')
        if 'tutor_name' in data:
            req.assigned_tutor = data['tutor_name']
        if 'tutor_email' in data:
            req.tutor_email = data['tutor_email']
        db.session.commit()
        return jsonify({'message': 'Estado y Tutor actualizados'}), 200
    return jsonify({'error': 'No encontrado'}), 404

# ==============================================================================
# 5. PERFIL DETALLADO DEL ESTUDIANTE (MODAL Y GENERACIÓN DE CV)
# ==============================================================================
@admin_bp.route('/api/admin/students/<int:id>', methods=['GET'])
@jwt_required()
def get_student_profile_detailed(id):
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403

    student = User.query.get(id)
    if not student: return jsonify({'error': 'Estudiante no encontrado'}), 404

    experiences = Experience.query.filter_by(user_id=id).all()
    certifications = Certification.query.filter_by(user_id=id).all()

    response = student.to_dict()
    response['experiences'] = [exp.to_dict() for exp in experiences]
    response['certifications'] = [cert.to_dict() for cert in certifications]

    return jsonify(response), 200

# ==============================================================================
# 6. GESTIÓN DE CITAS / ENTREVISTAS
# ==============================================================================
@admin_bp.route('/api/admin/appointments', methods=['GET'])
@jwt_required()
def get_all_appointments_admin():
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403
    appts = Appointment.query.order_by(Appointment.date.desc(), Appointment.time.asc()).all()
    results = []
    for apt in appts:
        data = apt.to_dict()
        if apt.student_user:
            data['student_name'] = apt.student_user.name
            data['student_email'] = apt.student_user.email
        results.append(data)
    return jsonify(results), 200

# ==============================================================================
# 7. DESCARGA DE ARCHIVOS
# ==============================================================================
@admin_bp.route('/api/uploads/<filename>', methods=['GET'])
def download_file(filename):
    try:
        return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
    except Exception:
        return jsonify({'error': 'Archivo no encontrado'}), 404