from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, UserSerializer
from .authentication import verify_google_token, get_or_create_google_user


def _jwt_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        'user': UserSerializer(user).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(_jwt_response(user), status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(username=email, password=password)
    if user:
        return Response(_jwt_response(user))

    return Response(
        {'message': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Accepts a Google ID token from the frontend,
    verifies it, and returns JWT tokens.
    Works for both login and registration.
    """
    token = request.data.get('credential') or request.data.get('token')
    if not token:
        return Response(
            {'message': 'Google token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        google_info = verify_google_token(token)
    except ValueError as e:
        return Response(
            {'message': f'Invalid Google token: {str(e)}'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not google_info.get('email_verified'):
        return Response(
            {'message': 'Google email is not verified'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user, created = get_or_create_google_user(google_info)
    response_data = _jwt_response(user)
    response_data['created'] = created  # frontend ko pata chale naya account bana ya nahi

    return Response(
        response_data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    try:
        user_id = request.user.id if request.user and request.user.is_authenticated else None
        if not user_id:
            return Response({'message': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        user = UserManager.get_by_id(user_id)
        if not user:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(UserManager.format_user(user))
    except Exception:
        return Response({'message': 'Something went wrong'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
