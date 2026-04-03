from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
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

    email = serializer.validated_data['email']
    if UserManager.get_by_email(email):
        return Response({'message': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    user = UserManager.create_user(
        name=serializer.validated_data['name'],
        email=email,
        password=serializer.validated_data['password'],
    )

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

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    user = UserManager.get_by_email(email)
    if not user or not UserManager.check_password(user, password):
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.get('is_active', True):
        return Response({'message': 'Account is disabled'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = make_tokens_for_user(user)
    return Response({
        'user': UserManager.format_user(user),
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    user_id = request.auth.get('user_id')
    user = UserManager.get_by_id(user_id)
    if not user:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(UserManager.format_user(user))
