from typing import Dict, Any, List, Optional
from pymongo.collection import Collection
from bson.objectid import ObjectId
from app.dao.interfaces import OpportunityDAO
from app.dto.models import OpportunityDTO

class MongoOpportunityDAO(OpportunityDAO):
    def __init__(self, db):
        self.collection: Collection = db['opportunities']

    def create(self, data: Dict[str, Any]) -> str:
        existing = self.collection.find_one({
            "title": {"$regex": f"^{data.get('title')}$", "$options": "i"},
            "company_name": {"$regex": f"^{data.get('company_name')}$", "$options": "i"}
        })
        if existing:
            raise ValueError(f"Oferta duplicada: {data.get('title')} en {data.get('company_name')}")
        
        res = self.collection.insert_one(data)
        return str(res.inserted_id)

    def get_all(self) -> List[Dict[str, Any]]:
        cursor = self.collection.find({})
        results = []
        for doc in cursor:
            doc['id'] = str(doc.pop('_id'))
            results.append(doc)
        return results

    def get(self, id: Any) -> Optional[OpportunityDTO]:
        try: oid = ObjectId(id)
        except: return None
        doc = self.collection.find_one({"_id": oid})
        if not doc: return None
        return OpportunityDTO(
            id=str(doc['_id']), 
            title=doc.get('title'), 
            company_name=doc.get('company_name'), 
            description=doc.get('description'), 
            metadata=doc.get('requirements', {})
        )

    def update(self, id, data): return False
    def delete(self, id): return False