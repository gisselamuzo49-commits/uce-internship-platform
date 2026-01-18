from dataclasses import dataclass, field
from typing import Dict, Any
from flask_login import UserMixin
from datetime import datetime

@dataclass
class StudentDTO:
    id: int
    name: str
    email: str
    gpa: float
    department: str

@dataclass
class OpportunityDTO:
    id: str
    title: str
    company_name: str
    description: str
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class UserDTO(UserMixin):
    id: int
    email: str
    name: str
    role: str
    
    def get_id(self):
        return str(self.id)