from pymongo import MongoClient, ASCENDING
from django.conf import settings
from datetime import datetime
import bcrypt
from bson import ObjectId

client = MongoClient(settings.MONGODB_URI)
db = client.get_database()
users_collection = db['users']

# Unique index on email
users_collection.create_index([('email', ASCENDING)], unique=True)


class UserManager:
    @staticmethod
    def create_user(name, email, password):
        name_parts = name.strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user = {
            'email': email.lower().strip(),
            'first_name': first_name,
            'last_name': last_name,
            'password': hashed.decode('utf-8'),
            'google_id': None,
            'is_active': True,
            'is_staff': False,
            'created_at': datetime.utcnow(),
        }
        result = users_collection.insert_one(user)
        user['_id'] = result.inserted_id
        return user

    @staticmethod
    def get_by_email(email):
        return users_collection.find_one({'email': email.lower().strip()})

    @staticmethod
    def get_by_id(user_id):
        try:
            return users_collection.find_one({'_id': ObjectId(user_id)})
        except Exception:
            return None

    @staticmethod
    def check_password(user_doc, password):
        stored = user_doc.get('password')
        if not stored:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), stored.encode('utf-8'))

    @staticmethod
    def format_user(user_doc):
        """Return serializable user dict"""
        return {
            'id': str(user_doc['_id']),
            'email': user_doc.get('email', ''),
            'first_name': user_doc.get('first_name', ''),
            'last_name': user_doc.get('last_name', ''),
            'is_active': user_doc.get('is_active', True),
        }
