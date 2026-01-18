from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from werkzeug.security import check_password_hash
from app.dao.interfaces import StudentDAO, UserDAO, GenericDAO
from app.models.sql import StudentModel, ApplicationModel, UserModel
from app.dto.models import StudentDTO, UserDTO

class PostgresStudentDAO(StudentDAO):
    def __init__(self, session: Session):
        self.session = session

    def create(self, data: Dict[str, Any]) -> StudentDTO:
        student = StudentModel(**data)
        self.session.add(student)
        self.session.commit()
        return self._map_to_dto(student)

    def get_all(self) -> List[Dict[str, Any]]:
        students = self.session.query(StudentModel).all()
        return [{"id": s.id, "name": s.name, "email": s.email, "gpa": s.gpa, "department": s.department} for s in students]

    def get(self, id: Any) -> Optional[StudentDTO]: return None
    def update(self, id, data): return False
    def delete(self, id): return False

    def _map_to_dto(self, s: StudentModel) -> StudentDTO:
        return StudentDTO(id=s.id, name=s.name, email=s.email, gpa=s.gpa, department=s.department)

class PostgresUserDAO(UserDAO):
    def __init__(self, session: Session):
        self.session = session

    def get_by_email(self, email: str) -> Optional[UserDTO]:
        user = self.session.query(UserModel).filter_by(email=email).first()
        if not user: return None
        return self._map_to_dto(user)

    def validate_login(self, email: str, password: str) -> Optional[UserDTO]:
        user = self.session.query(UserModel).filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            return self._map_to_dto(user)
        return None

    def create(self, data: Dict[str, Any]) -> UserDTO:
        user = UserModel(**data)
        self.session.add(user)
        self.session.commit()
        return self._map_to_dto(user)

    def get(self, id: Any) -> Optional[UserDTO]:
        user = self.session.query(UserModel).filter_by(id=int(id)).first()
        if user: return self._map_to_dto(user)
        return None

    def get_all(self): return []
    def update(self, id, data): return False
    def delete(self, id): return False

    def _map_to_dto(self, u: UserModel) -> UserDTO:
        return UserDTO(id=u.id, email=u.email, name=u.name, role=u.role)

class PostgresApplicationDAO(GenericDAO):
    def __init__(self, session: Session):
        self.session = session

    def create(self, data: Dict[str, Any]) -> Any:
        existing = self.session.query(ApplicationModel).filter_by(
            user_id=data['user_id'], opportunity_id=data['opportunity_id']
        ).first()
        if existing:
            raise ValueError("Ya has enviado una postulación a esta oportunidad.")
        
        app = ApplicationModel(**data)
        self.session.add(app)
        self.session.commit()
        return app.id

    def get_all(self) -> List[Dict[str, Any]]:
        apps = self.session.query(ApplicationModel).order_by(ApplicationModel.created_at.desc()).all()
        result = []
        for app in apps:
            u_info = f"{app.user.name} ({app.user.email})" if app.user else "Usuario Desconocido"
            result.append({
                "id": app.id,
                "student": u_info,
                "opportunity_id": app.opportunity_id,
                "status": app.status,
                "created_at": app.created_at.strftime("%Y-%m-%d %H:%M")
            })
        return result

    def get_by_user_id(self, user_id: int) -> List[Dict[str, Any]]:
        apps = self.session.query(ApplicationModel).filter_by(user_id=user_id).order_by(ApplicationModel.created_at.desc()).all()
        return [{"id": a.id, "opportunity_id": a.opportunity_id, "status": a.status, "created_at": a.created_at.strftime("%Y-%m-%d")} for a in apps]

    def update(self, id: Any, data: Dict[str, Any]) -> bool:
        try:
            r = self.session.query(ApplicationModel).filter_by(id=int(id)).update(data)
            self.session.commit()
            return r > 0
        except:
            self.session.rollback()
            return False

    def get(self, id): return None
    def delete(self, id): return False