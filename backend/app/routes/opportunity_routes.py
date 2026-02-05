from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Opportunity, Application, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

# Blueprint for opportunity-related routes
opportunity_bp = Blueprint('opportunity', __name__)

# ---------------- PUBLIC ROUTES (View opportunities) ----------------

@opportunity_bp.route('/api/opportunities', methods=['GET'])
def get_opportunities():
    try:
        # Get all opportunities ordered by newest first
        opps = Opportunity.query.order_by(Opportunity.created_at.desc()).all()
        return jsonify([opp.to_dict() for opp in opps]), 200
    except Exception as e:
        print(f"Error fetching opportunities: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@opportunity_bp.route('/api/opportunities/<int:id>', methods=['GET'])
def get_opportunity_detail(id):
    # Get opportunity by ID
    opp = Opportunity.query.get(id)
    if not opp:
        return jsonify({'error': 'Opportunity not found'}), 404
    return jsonify(opp.to_dict()), 200

# ---------------- STUDENT ROUTES (Apply to opportunities) ----------------

@opportunity_bp.route('/api/opportunities/<int:id>/apply', methods=['POST'])
@jwt_required()
def apply_opportunity(id):
    user_id = int(get_jwt_identity())  # Authenticated student ID
    
    # Check if opportunity exists
    opp = Opportunity.query.get(id)
    if not opp:
        return jsonify({'error': 'Opportunity not found'}), 404
        
    # Prevent duplicate applications
    existing_app = Application.query.filter_by(
        student_id=user_id,
        opportunity_id=id
    ).first()
    if existing_app:
        return jsonify({'error': 'You already applied to this opportunity'}), 400
        
    # Create new application
    new_app = Application(
        student_id=user_id,
        opportunity_id=id,
        status='Pendiente',
        date=datetime.now()
    )
    
    db.session.add(new_app)
    db.session.commit()
    
    return jsonify({'message': 'Application submitted successfully'}), 201

# ---------------- ADMIN ROUTES (Full management) ----------------

@opportunity_bp.route('/api/opportunities', methods=['POST'])
@jwt_required()
def create_opportunity():
    data = request.json
    try:
        # Parse deadline date
        deadline_date = datetime.strptime(data['deadline'], '%Y-%m-%d')
        
        new_opp = Opportunity(
            title=data['title'],
            company=data['company'],
            description=data['description'],
            location=data['location'],
            deadline=deadline_date,
            vacancies=int(data.get('vacancies', 1)),
            type=data.get('type', 'pasantia')  
        )
        
        db.session.add(new_opp)
        db.session.commit()
        return jsonify({
            'message': 'Opportunity created successfully',
            'opportunity': new_opp.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@opportunity_bp.route('/api/opportunities/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_opportunity(id):
    # Admin role verification
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    opp = Opportunity.query.get(id)
    if not opp:
        return jsonify({'error': 'Opportunity not found'}), 404
        
    db.session.delete(opp)
    db.session.commit()
    return jsonify({'message': 'Opportunity deleted successfully'}), 200

@opportunity_bp.route('/api/opportunities/<int:id>/applications', methods=['GET'])
@jwt_required()
def get_opportunity_applicants(id):
    # Check opportunity existence
    opp = Opportunity.query.get(id)
    if not opp:
        return jsonify({'error': 'Opportunity not found'}), 404
        
    # Fetch applications for this opportunity
    apps = Application.query.filter_by(opportunity_id=id).all()
    
    results = []
    for app in apps:
        student = User.query.get(app.student_id)
        if student:
            results.append({
                'id': app.id,
                'student_id': student.id,
                'student_name': student.name,
                'student_email': student.email,
                'status': app.status,
                'date': app.date.strftime('%Y-%m-%d')
            })
            
    return jsonify(results), 200

@opportunity_bp.route('/api/applications/<int:id>/status', methods=['PUT'])
@jwt_required()
def update_application_status(id):
    data = request.json
    new_status = data.get('status')  
    app = Application.query.get(id)
    if not app:
        return jsonify({'error': 'Application not found'}), 404
        
    app.status = new_status
    db.session.commit()
    
    return jsonify({'message': f'Status updated to {new_status}'}), 200
