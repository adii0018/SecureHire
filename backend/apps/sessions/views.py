from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import SessionManager
from .serializers import SessionSerializer

@api_view(['POST'])
def create_session(request):
    mode = request.data.get('mode', 'interview')
    title = request.data.get('title', f'{mode.capitalize()} Session')
    config = request.data.get('config', {})
    
    session = SessionManager.create_session(
        host_id=str(request.user.id),
        mode=mode,
        title=title,
        config=config
    )
    
    return Response(SessionSerializer(session).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def list_sessions(request):
    sessions = SessionManager.get_user_sessions(str(request.user.id))
    return Response(SessionSerializer(sessions, many=True).data)

@api_view(['GET'])
def get_session(request, code):
    session = SessionManager.get_session(code)
    if not session:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(SessionSerializer(session).data)

@api_view(['PATCH'])
def update_session(request, code):
    session = SessionManager.get_session(code)
    if not session:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if session['hostId'] != str(request.user.id):
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    SessionManager.update_session(code, request.data)
    updated_session = SessionManager.get_session(code)
    return Response(SessionSerializer(updated_session).data)

@api_view(['DELETE'])
def delete_session(request, code):
    session = SessionManager.get_session(code)
    if not session:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if session['hostId'] != str(request.user.id):
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    SessionManager.delete_session(code)
    return Response(status=status.HTTP_204_NO_CONTENT)
