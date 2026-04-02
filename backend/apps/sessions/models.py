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
        return session

    @staticmethod
    def get_session(code):
        return sessions_collection.find_one({'code': code})

    @staticmethod
    def get_user_sessions(host_id):
        return list(sessions_collection.find({'hostId': host_id}).sort('createdAt', -1))

    @staticmethod
    def update_session(code, updates):
        sessions_collection.update_one({'code': code}, {'$set': updates})

    @staticmethod
    def delete_session(code):
        sessions_collection.delete_one({'code': code})
