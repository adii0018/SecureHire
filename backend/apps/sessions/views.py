from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from datetime import datetime
from .models import SessionManager
from .serializers import SessionSerializer


def _get_user_id(request):
    return request.auth.get('user_id') if request.auth else None


@api_view(['POST'])
def create_session(request):
    user_id = _get_user_id(request)
    if not user_id:
        return Response({'message': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    mode = request.data.get('mode', 'interview')
    title = request.data.get('title', f'{mode.capitalize()} Session')
    config = request.data.get('config', {})

    try:
        session = SessionManager.create_session(
            host_id=user_id,
            mode=mode,
            title=title,
            config=config,
        )
        return Response(SessionSerializer(session).data, status=status.HTTP_201_CREATED)
    except Exception:
        return Response({'message': 'Failed to create session'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def list_sessions(request):
    user_id = _get_user_id(request)
    if not user_id:
        return Response({'message': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        sessions = SessionManager.get_user_sessions(user_id)
        return Response(SessionSerializer(sessions, many=True).data)
    except Exception:
        return Response({'message': 'Failed to fetch sessions'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_session(request, code):
    session = SessionManager.get_session(code)
    if not session:
        return Response({'message': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(SessionSerializer(session).data)


@api_view(['PATCH'])
def update_session(request, code):
    user_id = _get_user_id(request)
    session = SessionManager.get_session(code)
    if not session:
        return Response({'message': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    if session['hostId'] != user_id:
        return Response({'message': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    SessionManager.update_session(code, request.data)
    return Response(SessionSerializer(SessionManager.get_session(code)).data)


@api_view(['POST'])
def end_session(request, code):
    user_id = _get_user_id(request)
    session = SessionManager.get_session(code)
    if not session:
        return Response({'message': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    if session['hostId'] != user_id:
        return Response({'message': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    SessionManager.update_session(code, {'status': 'ended', 'endedAt': datetime.utcnow()})
    return Response({'success': True})


@api_view(['DELETE'])
def delete_session(request, code):
    user_id = _get_user_id(request)
    session = SessionManager.get_session(code)
    if not session:
        return Response({'message': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    if session['hostId'] != user_id:
        return Response({'message': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    SessionManager.delete_session(code)
    return Response(status=status.HTTP_204_NO_CONTENT)
