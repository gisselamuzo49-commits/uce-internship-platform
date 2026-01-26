from flask import Blueprint, request, jsonify, make_response
from app.extensions import db
from app.models import User, TutorRequest, Application, Opportunity
from app.services import generate_student_cv_pdf, generate_memo_pdf
from flask_jwt_extended import jwt_required
import datetime

admin_bp = Blueprint('admin', __name__)

# --- 1. OBTENER SOLICITUDES DE TUTOR ---
@admin_bp.route('/api/admin/tutor-requests', methods=['GET'])
@jwt_required()
def get_all_requests():
    return jsonify([r.to_dict() for r in TutorRequest.query.all()]), 200

# --- 2. ACTUALIZAR SOLICITUD DE TUTOR (APROBAR/ASIGNAR) ---
@admin_bp.route('/api/admin/tutor-requests/<int:id>', methods=['PUT'])
@jwt_required()
def update_tutor_req(id):
    req = TutorRequest.query.get(id)
    if not req:
        return jsonify({'error': 'Solicitud no encontrada'}), 404
        
    req.status = request.json.get('status', req.status)
    req.tutor_name = request.json.get('tutor_name', req.tutor_name)
    db.session.commit()
    return jsonify({'message': 'Actualizado'}), 200

# --- 3. OBTENER POSTULACIONES DE EMPLEO (AQUÍ ESTÁ EL ARREGLO 🛠️) ---
@admin_bp.route('/api/admin/applications', methods=['GET'])
@jwt_required()
def admin_apps():
    applications = Application.query.all()
    results = []
    
    for app in applications:
        # Obtenemos los datos base del modelo
        app_data = app.to_dict()
        
        # 👇 ARREGLO CRÍTICO: 
        # Aseguramos que el student_id se envíe para que funcione el botón "Ver Perfil"
        app_data['student_id'] = app.student_id 
        
        results.append(app_data)

    return jsonify(results), 200

# --- 4. ACTUALIZAR ESTADO DE POSTULACIÓN (APROBAR/RECHAZAR) ---
@admin_bp.route('/api/applications/<int:id>', methods=['PUT'])
@jwt_required()
def update_app_status(id):
    ap = Application.query.get(id)
    if not ap:
        return jsonify({'error': 'Aplicación no encontrada'}), 404
        
    ap.status = request.json.get('status')
    db.session.commit()
    return jsonify({'message': 'Updated'}), 200

# --- 5. REPORTES PDF (CV ATS) ---
@admin_bp.route('/api/admin/export-pdf/<int:student_id>', methods=['GET'])
@jwt_required()
def export_pdf(student_id):
    user = User.query.get(student_id)
    if not user: return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Buscamos si tiene tutor aprobado para ponerlo en el PDF
    tutor_req = TutorRequest.query.filter_by(student_id=student_id, status='Aprobado').first()
    
    pdf_buffer = generate_student_cv_pdf(user, tutor_req)
    
    response = make_response(pdf_buffer.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    # Limpiamos el nombre para que no de error en la descarga
    safe_name = user.name.replace(" ", "_")
    response.headers['Content-Disposition'] = f'attachment; filename=cv_{safe_name}.pdf'
    return response

# --- 6. MEMORANDO DE ASIGNACIÓN (PDF) ---
@admin_bp.route('/api/admin/export-assignment/<int:request_id>', methods=['GET'])
@jwt_required()
def export_assignment_pdf(request_id):
    req = TutorRequest.query.get(request_id)
    if not req or req.status != 'Aprobado': 
        return jsonify({'error': 'Solicitud no aprobada o no encontrada'}), 400
        
    student = User.query.get(req.student_id)
    
    pdf_buffer = generate_memo_pdf(req, student.name, student.email)
    
    response = make_response(pdf_buffer.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=memo_asignacion.pdf'
    return response

# --- 7. REPORTE DIARIO (JSON/Excel data) ---
@admin_bp.route('/api/admin/daily-report', methods=['GET'])
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
            
            report_data.append({
                "fecha_aprobacion": app.date,
                "estudiante": student.name,
                "email": student.email,
                "empresa": opp.company,
                "cargo": opp.title,
                "documentacion_subida": "SÍ" if tutor_req else "NO",
                "estado_tutor": tutor_req.status if tutor_req else "Sin Solicitud"
            })
        return jsonify(report_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500