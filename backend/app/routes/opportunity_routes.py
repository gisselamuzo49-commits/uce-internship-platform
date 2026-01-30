from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Opportunity, Application, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

opportunity_bp = Blueprint('opportunity', __name__)

# ------------------------------------------------------------------
# 1. RUTAS PÚBLICAS / GENERALES (Ver ofertas)
# ------------------------------------------------------------------

@opportunity_bp.route('/api/opportunities', methods=['GET'])
def get_opportunities():
    try:
        # Ordenar por fecha de creación descendente (las nuevas primero)
        opps = Opportunity.query.order_by(Opportunity.created_at.desc()).all()
        return jsonify([opp.to_dict() for opp in opps]), 200
    except Exception as e:
        print(f"Error obteniendo oportunidades: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@opportunity_bp.route('/api/opportunities/<int:id>', methods=['GET'])
def get_opportunity_detail(id):
    opp = Opportunity.query.get(id)
    if not opp:
        return jsonify({'error': 'Oportunidad no encontrada'}), 404
    return jsonify(opp.to_dict()), 200

# ------------------------------------------------------------------
# 2. RUTAS DE ESTUDIANTE (Postularse)
# ------------------------------------------------------------------

@opportunity_bp.route('/api/opportunities/<int:id>/apply', methods=['POST'])
@jwt_required()
def apply_opportunity(id):
    user_id = int(get_jwt_identity())
    
    # 1. Verificar si la oferta existe
    opp = Opportunity.query.get(id)
    if not opp:
        return jsonify({'error': 'Oportunidad no encontrada'}), 404
        
    # 2. Verificar si ya se postuló
    existing_app = Application.query.filter_by(student_id=user_id, opportunity_id=id).first()
    if existing_app:
        return jsonify({'error': 'Ya te has postulado a esta oferta'}), 400
        
    # 3. Crear postulación
    new_app = Application(
        student_id=user_id,
        opportunity_id=id,
        status='Pendiente',
        date=datetime.now()
    )
    
    db.session.add(new_app)
    db.session.commit()
    
    return jsonify({'message': 'Postulación exitosa'}), 201

# ------------------------------------------------------------------
# 3. RUTAS DE ADMINISTRADOR (Gestión Completa)
# ------------------------------------------------------------------

# A) CREAR NUEVA OFERTA
@opportunity_bp.route('/api/opportunities', methods=['POST'])
@jwt_required()
def create_opportunity():
    data = request.json
    try:
        # Convertir string de fecha a objeto fecha
        deadline_date = datetime.strptime(data['deadline'], '%Y-%m-%d')
        
        new_opp = Opportunity(
            title=data['title'],
            company=data['company'],
            description=data['description'],
            location=data['location'],
            deadline=deadline_date,
            vacancies=int(data.get('vacancies', 1)),
            type=data.get('type', 'pasantia') # 'pasantia' o 'vinculacion'
        )
        
        db.session.add(new_opp)
        db.session.commit()
        return jsonify({'message': 'Oportunidad creada con éxito', 'opportunity': new_opp.to_dict()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# B) BORRAR OFERTA (Y sus postulaciones en cascada)
@opportunity_bp.route('/api/opportunities/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_opportunity(id):
    # Verificación opcional de rol admin
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'admin':
        return jsonify({'error': 'No autorizado'}), 403

    opp = Opportunity.query.get(id)
    if not opp:
        return jsonify({'error': 'Oportunidad no encontrada'}), 404
        
    db.session.delete(opp)
    db.session.commit()
    return jsonify({'message': 'Oportunidad eliminada correctamente'}), 200

# C) VER POSTULANTES DE UNA OFERTA ESPECÍFICA (Para el Modal del Dashboard)
@opportunity_bp.route('/api/opportunities/<int:id>/applications', methods=['GET'])
@jwt_required()
def get_opportunity_applicants(id):
    # Verificar oferta
    opp = Opportunity.query.get(id)
    if not opp:
        return jsonify({'error': 'Oferta no encontrada'}), 404
        
    # Obtener postulaciones de esta oferta
    apps = Application.query.filter_by(opportunity_id=id).all()
    
    results = []
    for app in apps:
        student = User.query.get(app.student_id)
        if student:
            results.append({
                'id': app.id,               # ID de la postulación (para aprobar/rechazar)
                'student_id': student.id,   # ID del estudiante (para descargar CV)
                'student_name': student.name,
                'student_email': student.email,
                'status': app.status,
                'date': app.date.strftime('%Y-%m-%d')
            })
            
    return jsonify(results), 200

# D) CAMBIAR ESTADO DE POSTULACIÓN (Aprobar / Rechazar)
@opportunity_bp.route('/api/applications/<int:id>/status', methods=['PUT'])
@jwt_required()
def update_application_status(id):
    data = request.json
    new_status = data.get('status') # Esperamos 'Aprobado' o 'Rechazado'
    
    app = Application.query.get(id)
    if not app:
        return jsonify({'error': 'Postulación no encontrada'}), 404
        
    app.status = new_status
    db.session.commit()
    
    return jsonify({'message': f'Estado actualizado a {new_status}'}), 200