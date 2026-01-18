from abc import ABC, abstractmethod
from typing import Any, List, Optional, Dict

class GenericDAO(ABC):
    @abstractmethod
    def create(self, data: Dict[str, Any]) -> Any: pass
    @abstractmethod
    def get(self, id: Any) -> Optional[Any]: pass
    @abstractmethod
    def update(self, id: Any, data: Dict[str, Any]) -> bool: pass
    @abstractmethod
    def delete(self, id: Any) -> bool: pass
    @abstractmethod
    def get_all(self) -> List[Dict[str, Any]]: pass

class StudentDAO(GenericDAO): pass
class OpportunityDAO(GenericDAO): pass
class ApplicationDAO(GenericDAO): pass

class UserDAO(GenericDAO):
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[Any]: pass
    @abstractmethod
    def validate_login(self, email: str, password: str) -> Optional[Any]: pass

class AbstractDAOFactory(ABC):
    @abstractmethod
    def get_student_dao(self) -> StudentDAO: pass
    @abstractmethod
    def get_opportunity_dao(self) -> OpportunityDAO: pass
    @abstractmethod
    def get_application_dao(self) -> ApplicationDAO: pass
    @abstractmethod
    def get_user_dao(self) -> UserDAO: pass