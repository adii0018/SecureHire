from pymongo import MongoClient
from django.conf import settings
from datetime import datetime

client = MongoClient(settings.MONGODB_URI)
db = client.get_database()
alerts_collection = db['alerts']

class AlertManager:
    @staticmethod
    def create_alert(session_code, participant_id, alert_type, risk_delta, metadata=None):
        alert = {
            'sessionCode': session_code,
            'participantId': participant_id,
            'alertType': alert_type,
            'riskDelta': risk_delta,
            'metadata': metadata or {},
            'timestamp': datetime.utcnow(),
        }
        alerts_collection.insert_one(alert)
        return alert

    @staticmethod
    def get_session_alerts(session_code):
        return list(alerts_collection.find({'sessionCode': session_code}).sort('timestamp', -1))
