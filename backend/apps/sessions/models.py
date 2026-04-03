from pymongo import MongoClient
from django.conf import settings
import random
import string
from datetime import datetime

client = MongoClient(settings.MONGODB_URI)
db = client.get_database()
sessions_collection = db['sessions']

def generate_unique_code():
    """Generate a unique 6-character session code"""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if not sessions_collection.find_one({'code': code}):
            return code

class SessionManager:
    @staticmethod
    def create_session(host_id, mode, title, config):
        code = generate_unique_code()
        session = {
            'code': code,
            'title': title,
            'mode': mode,
            'hostId': host_id,
            'participants': [],
            'config': config,
            'status': 'waiting',
            'startedAt': None,
            'endedAt': None,
            'createdAt': datetime.utcnow(),
        }
        sessions_collection.insert_one(session)
        session.pop('_id', None)  # remove ObjectId — not JSON serializable
        return session

    @staticmethod
    def get_session(code):
        doc = sessions_collection.find_one({'code': code})
        if doc:
            doc.pop('_id', None)
        return doc

    @staticmethod
    def get_user_sessions(host_id):
        docs = list(sessions_collection.find({'hostId': host_id}).sort('createdAt', -1))
        for doc in docs:
            doc.pop('_id', None)
        return docs

    @staticmethod
    def update_session(code, updates):
        sessions_collection.update_one({'code': code}, {'$set': updates})

    @staticmethod
    def delete_session(code):
        sessions_collection.delete_one({'code': code})
