from app.dao.interfaces import AbstractDAOFactory, StudentDAO, OpportunityDAO, ApplicationDAO, UserDAO
from app.dao.postgres_impl import PostgresStudentDAO, PostgresApplicationDAO, PostgresUserDAO
from app.dao.mongo_impl import MongoOpportunityDAO
from app.db import SessionLocal, get_mongo_db

class UCEFactory(AbstractDAOFactory):
    def __init__(self):
        self._sql_session = SessionLocal()
        self._mongo_db = get_mongo_db()

    def get_student_dao(self) -> StudentDAO: return PostgresStudentDAO(self._sql_session)
    def get_opportunity_dao(self) -> OpportunityDAO: return MongoOpportunityDAO(self._mongo_db)
    def get_application_dao(self) -> ApplicationDAO: return PostgresApplicationDAO(self._sql_session)
    def get_user_dao(self) -> UserDAO: return PostgresUserDAO(self._sql_session)

    def close(self): self._sql_session.close()
    def __enter__(self): return self
    def __exit__(self, exc_type, exc_val, exc_tb): self.close()