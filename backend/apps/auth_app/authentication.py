from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.exceptions import AuthenticationFailed
from .models import UserManager


class MongoJWTAuthentication(JWTAuthentication):
    """
    Custom JWT auth that skips Django ORM user lookup.
    Validates the token and returns a simple dict-based user object.
    """

    def get_user(self, validated_token):
        user_id = validated_token.get('user_id')
        if not user_id:
            raise InvalidToken('Token contained no recognizable user identification')

        user = UserManager.get_by_id(user_id)
        if not user:
            raise AuthenticationFailed('User not found', code='user_not_found')

        # Return a lightweight wrapper so request.user works
        return MongoUser(user)


class MongoUser:
    """Minimal user object that satisfies DRF's is_authenticated check."""

    def __init__(self, user_doc):
        self._doc = user_doc
        self.id = str(user_doc['_id'])
        self.email = user_doc.get('email', '')
        self.is_active = user_doc.get('is_active', True)
        self.is_authenticated = True

    def __str__(self):
        return self.email
