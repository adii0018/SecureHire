from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import UserManager
from .serializers import RegisterSerializer, LoginSerializer


def make_tokens_for_user(user_doc):
    """Create JWT tokens manually without Django ORM user."""
    token = RefreshToken()
    token['user_id'] = str(user_doc['_id'])
    token['email'] = user_doc.get('email', '')
    return token


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email'].lower().strip()

    if UserManager.get_by_email(email):
        return Response({'message': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = UserManager.create_user(
            name=serializer.validated_data['name'],
            email=email,
            password=serializer.validated_data['password'],
        )
    except Exception:
        return Response({'message': 'Registration failed. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    refresh = make_tokens_for_user(user)
    return Response({
        'user': UserManager.format_user(user),
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email'].lower().strip()
    password = serializer.validated_data['password']

    try:
        user = UserManager.get_by_email(email)
    except Exception:
        return Response({'message': 'Something went wrong. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if not user:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.get('is_active', True):
        return Response({'message': 'Account is disabled'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        password_valid = UserManager.check_password(user, password)
    except Exception:
        return Response({'message': 'Something went wrong. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if not password_valid:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = make_tokens_for_user(user)
    return Response({
        'user': UserManager.format_user(user),
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'message': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        return Response({'access': str(token.access_token)})
    except TokenError:
        return Response({'message': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    try:
        user_id = request.auth.get('user_id') if request.auth else None
        if not user_id:
            return Response({'message': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        user = UserManager.get_by_id(user_id)
        if not user:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(UserManager.format_user(user))
    except Exception:
        return Response({'message': 'Something went wrong'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
