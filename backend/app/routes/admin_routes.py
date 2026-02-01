from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
import os
from app.extensions import db
from app.models import User, Application, Opportunity, TutorRequest, Appointment, Experience, Certification
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
import datetime
import traceback

admin_bp = Blueprint('admin', __name__)

# --- Middleware auxiliar ---
def check_admin(user_id):
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return False
    return True

# ==============================================================================
# 1. ESTADÍSTICAS (DASHBOARD)
# ==============================================================================
@admin_bp.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403

    students = User.query.filter_by(role='student').count()
    apps = Application.query.count()
    pending = Application.query.filter_by(status='Pendiente').count()
    opps = Opportunity.query.count()

    # Carga de Tutores
    tutor_query = db.session.query(
        TutorRequest.assigned_tutor, 
        func.count(TutorRequest.id)
    ).filter(
        TutorRequest.status == 'Aprobado',
        TutorRequest.assigned_tutor != None
    ).group_by(TutorRequest.assigned_tutor).all()
    
    tutor_workload = [{"name": t[0], "estudiantes": t[1]} for t in tutor_query]

    # Tendencia
    activity_trend = []
    today = datetime.datetime.utcnow().date()
    for i in range(6, -1, -1):
        target_date = today - datetime.timedelta(days=i)
        count = Application.query.filter(func.date(Application.date) == target_date).count()
        activity_trend.append({"fecha": target_date.strftime('%d/%m'), "postulaciones": count})

    return jsonify({
        'students': students, 'applications': apps, 'pending': pending, 'opportunities': opps,
        'tutor_workload': tutor_workload, 'activity_trend': activity_trend
    }), 200

# ==============================================================================
# 2. OPORTUNIDADES
# ==============================================================================
@admin_bp.route('/api/opportunities', methods=['POST'])
@jwt_required()
def create_opportunity():
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
    except Exception as e: return jsonify({'error': str(e)}), 500

@admin_bp.route('/api/opportunities/<int:id>', methods=['PUT'])
@jwt_required()
def update_opportunity(id):
    if not check_admin(int(get_jwt_identity())): return jsonify({'error': 'No autorizado'}), 403
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
    if not check_admin(int(get_jwt_identity())): return jsonify({'error': 'No autorizado'}), 403
    opp = Opportunity.query.get(id)
    if opp:
        db.session.delete(opp)
        db.session.commit()
        return jsonify({'message': 'Eliminada'}), 200
    return jsonify({'error': 'No encontrada'}), 404

# ==============================================================================
# 3. APLICACIONES
# ==============================================================================
@admin_bp.route('/api/admin/applications', methods=['GET'])
@jwt_required()
def get_all_applications():
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
    if not check_admin(int(get_jwt_identity())): return jsonify({'error': 'No autorizado'}), 403
    app = Application.query.get(id)
    if not app: return jsonify({'error': 'No encontrado'}), 404
    app.status = request.json.get('status')
    db.session.commit()
    return jsonify({'message': 'Actualizado'}), 200

# ==============================================================================
# 4. TUTORÍAS (LISTAR, ACTUALIZAR Y SUBIR MEMO)
# ==============================================================================
@admin_bp.route('/api/admin/tutor-requests', methods=['GET'])
@jwt_required()
def get_all_tutor_requests():
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

# --- NUEVA RUTA: SUBIR MEMO DE ASIGNACIÓN ---
@admin_bp.route('/api/admin/tutor-requests/<int:id>/upload-memo', methods=['POST'])
@jwt_required()
def upload_tutor_memo(id):
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403

    if 'file' not in request.files: return jsonify({'error': 'No se envió archivo'}), 400
    
    file = request.files['file']
    if file.filename == '': return jsonify({'error': 'Nombre de archivo vacío'}), 400

    req_tutor = TutorRequest.query.get(id)
    if not req_tutor: return jsonify({'error': 'Solicitud no encontrada'}), 404

    try:
        # Guardar archivo con nombre único
        filename = secure_filename(file.filename)
        unique_filename = f"memo_{req_tutor.id}_{filename}"
        
        save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(save_path)

        # Actualizar base de datos
        req_tutor.memo_filename = unique_filename
        db.session.commit()

        return jsonify({'message': 'Memo subido', 'filename': unique_filename}), 200

    except Exception as e:
        print(f"❌ Error subiendo memo: {str(e)}", flush=True)
        return jsonify({'error': 'Error al guardar el archivo'}), 500

# ==============================================================================
# 5. PERFIL ESTUDIANTE
# ==============================================================================
@admin_bp.route('/api/admin/students/<int:id>', methods=['GET'])
@jwt_required()
def get_student_profile(id):
    if not check_admin(int(get_jwt_identity())): return jsonify({'error': 'No autorizado'}), 403
    student = User.query.get(id)
    if not student: return jsonify({'error': 'No encontrado'}), 404
    response = student.to_dict()
    response['experiences'] = [e.to_dict() for e in Experience.query.filter_by(user_id=id).all()]
    response['certifications'] = [c.to_dict() for c in Certification.query.filter_by(user_id=id).all()]
    return jsonify(response), 200

# ==============================================================================
# 6. CITAS
# ==============================================================================
@admin_bp.route('/api/admin/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
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

# ==============================================================================
# 7. ARCHIVOS (SIRVE PARA CV Y PARA MEMOS)
# ==============================================================================
@admin_bp.route('/api/uploads/<filename>', methods=['GET'])
def download_file(filename):
    try: return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
    except: return jsonify({'error': 'No encontrado'}), 404

# ==============================================================================
# 8. REPORTE SINCRONIZADO (FIX: EMPAREJAMIENTO CORRECTO + DOC INTELIGENTE)
# ==============================================================================
@admin_bp.route('/api/admin/daily-report', methods=['GET'])
@jwt_required()
def daily_report():
    current_user_id = int(get_jwt_identity())
    if not check_admin(current_user_id): return jsonify({'error': 'No autorizado'}), 403

    try:
        # 1. Filtro opcional de fecha
        date_str = request.args.get('date') 
        query = Application.query.order_by(Application.date.asc()) # Ordenamos por antigüedad (Viejo -> Nuevo)
        
        if date_str:
            query = query.filter(func.date(Application.date) == date_str)
        
        apps = query.all()
        
        report_data = []
        
        # === CACHÉ DE SOLICITUDES ===
        student_requests_map = {}

        for app in apps:
            student = app.student_user
            opp = app.opportunity
            
            # 1. VALIDACIÓN DOCUMENTACIÓN (Perfil Lleno o Archivo)
            doc_ready = False
            if student:
                tiene_cv = getattr(student, 'cv_filename', None)
                tiene_exp = Experience.query.filter_by(user_id=student.id).first()
                tiene_cert = Certification.query.filter_by(user_id=student.id).first()
                if tiene_cv or tiene_exp or tiene_cert: doc_ready = True

            # 2. MATCHING DE TUTOR (Lógica "Por Turnos/Posición")
            tutor_req = None
            if app.student_id:
                sid = app.student_id
                
                # Si es la primera vez que vemos a este alumno en el bucle, cargamos SUS solicitudes
                if sid not in student_requests_map:
                    # Traemos TODAS sus solicitudes ordenadas por ID/Fecha (más vieja a más nueva)
                    reqs = TutorRequest.query.filter_by(user_id=sid).order_by(TutorRequest.id.asc()).all()
                    student_requests_map[sid] = reqs
                
                # Paso A: Averiguamos qué número de postulación es esta para el estudiante
                student_apps = Application.query.filter_by(student_id=sid).order_by(Application.id.asc()).all()
                
                try:
                    # Buscamos el índice: "Esta app es la número X"
                    app_index = next(i for i, a in enumerate(student_apps) if a.id == app.id)
                    
                    # Paso B: Buscamos la solicitud de tutor número X
                    student_reqs_list = student_requests_map[sid]
                    if app_index < len(student_reqs_list):
                        tutor_req = student_reqs_list[app_index]
                        
                except Exception:
                    tutor_req = None

            # --- DATOS SEGUROS ---
            student_name = student.name if student else 'Usuario Eliminado'
            student_email = student.email if student else 'N/A'
            company = opp.company if opp else 'N/A'
            cargo = opp.title if opp else 'N/A'
            
            nombre_tutor = getattr(tutor_req, 'assigned_tutor', None) if tutor_req else None
            estado_tutor = getattr(tutor_req, 'status', 'Sin Solicitud') if tutor_req else 'Sin Solicitud'
            
            # (Opcional) Si quieres ver si tiene memo en el reporte:
            # tiene_memo = 'SÍ' if (tutor_req and tutor_req.memo_filename) else 'NO'

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
        
        # Revertimos el orden para que en la tabla salga el más reciente arriba
        report_data.reverse()
        return jsonify(report_data), 200

    except Exception as e:
        traceback.print_exc()
        print(f"❌ ERROR REPORTE: {str(e)}", flush=True)
        return jsonify({'error': 'Error interno'}), 500