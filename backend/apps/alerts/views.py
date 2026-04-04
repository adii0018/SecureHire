from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import AlertManager


def _serialize_alert(alert):
    alert['_id'] = str(alert['_id'])
    if alert.get('timestamp'):
        alert['timestamp'] = alert['timestamp'].isoformat()
    return alert


@api_view(['POST'])
def create_alert(request):
    session_code = request.data.get('sessionCode')
    participant_id = request.data.get('participantId', '')
    alert_type = request.data.get('alertType')
    risk_delta = request.data.get('riskDelta', 5)
    metadata = request.data.get('metadata', {})

    if not session_code or not alert_type:
        return Response({'message': 'sessionCode and alertType are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        AlertManager.create_alert(
            session_code=session_code,
            participant_id=participant_id,
            alert_type=alert_type,
            risk_delta=risk_delta,
            metadata=metadata,
        )
        return Response({'success': True}, status=status.HTTP_201_CREATED)
    except Exception:
        return Response({'message': 'Failed to create alert'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_session_alerts(request, session_code):
    try:
        alerts = AlertManager.get_session_alerts(session_code)
        return Response([_serialize_alert(a) for a in alerts])
    except Exception:
        return Response({'message': 'Failed to fetch alerts'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
