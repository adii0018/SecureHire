from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AlertManager

@api_view(['POST'])
def create_alert(request):
    session_code = request.data.get('sessionCode')
    participant_id = request.data.get('participantId')
    alert_type = request.data.get('alertType')
    risk_delta = request.data.get('riskDelta', 0)
    metadata = request.data.get('metadata', {})
    
    alert = AlertManager.create_alert(
        session_code=session_code,
        participant_id=participant_id,
        alert_type=alert_type,
        risk_delta=risk_delta,
        metadata=metadata
    )
    
    return Response({'success': True}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_session_alerts(request, session_code):
    alerts = AlertManager.get_session_alerts(session_code)
    # Convert ObjectId to string for JSON serialization
    for alert in alerts:
        alert['_id'] = str(alert['_id'])
    return Response(alerts)
