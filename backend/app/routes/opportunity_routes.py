from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Opportunity, Application, Appointment, User
from app.services import send_email_confirmation
from flask_jwt_extended import jwt_required, get_jwt_identity
import datetime

opp_bp = Blueprint('opportunity', __name__)

@opp_bp.route('/api/opportunities', methods=['GET', 'POST'])
def handle_opportunities():
    if request.method == 'POST':
        data = request.json
        new_opp = Opportunity(
            title=data['title'], company=data['company'], 
            description=data['description'], location=data.get('location', 'Quito'), 
            deadline=data.get('deadline'), vacancies=int(data.get('vacancies', 1)),
            type=data.get('type', 'hibrido'), salary=data.get('salary'),
            attributes=data.get('attributes')
        )
        db.session.add(new_opp)
        db.session.commit()
        return jsonify({'message': 'Created'}), 201
    return jsonify([o.to_dict() for o in Opportunity.query.all()]), 200

@opp_bp.route('/api/opportunities/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_opportunity(id):
    opp = Opportunity.query.get(id)
    if not opp: return jsonify({'error': 'Oferta no encontrada'}), 404
    # Borrar aplicaciones relacionadas primero
    Application.query.filter_by(opportunity_id=id).delete()
    db.session.delete(opp)
    db.session.commit()
    return jsonify({'message': 'Oferta eliminada'}), 200

@opp_bp.route('/api/applications', methods=['POST', 'GET'])
@jwt_required()
def handle_applications():
    user_id = int(get_jwt_identity())
    if request.method == 'POST':
        data = request.json
        opp_id = data.get('opportunity_id')
        opportunity = Opportunity.query.get(opp_id)
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        
        if opportunity.deadline and today > opportunity.deadline: return jsonify({'error': 'Caducado'}), 400
        # Verificar vacantes vs aplicaciones
        if len(opportunity.applications) >= opportunity.vacancies: return jsonify({'error': 'Lleno'}), 400
        
        new_app = Application(student_id=user_id, opportunity_id=int(opp_id), date=today)
        db.session.add(new_app); db.session.commit()
        return jsonify({'message': 'OK'}), 201
    
    return jsonify([a.to_dict() for a in Application.query.filter_by(student_id=user_id).all()]), 200

@opp_bp.route('/api/appointments', methods=['POST', 'GET'])
@jwt_required()
def handle_appointments():
    user_id = int(get_jwt_identity())
    if request.method == 'POST':
        data = request.json
        app_id = int(data['application_id'])
        db.session.add(Appointment(student_id=user_id, application_id=app_id, date=data['date'], time=data['time']))
        db.session.commit()
        
        # Enviar correo
        user = User.query.get(user_id)
        application = Application.query.get(app_id)
        company_name = application.opportunity.company if application else "la empresa"
        try: send_email_confirmation(user.email, user.name, company_name, data['date'], data['time'])
        except: pass
        
        return jsonify({'message': 'Scheduled'}), 201
    return jsonify([{'id': c.id, 'date': c.date, 'time': c.time} for c in Appointment.query.filter_by(student_id=user_id).all()]), 200