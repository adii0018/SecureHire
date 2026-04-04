from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.exceptions import AuthenticationFailed
from .models import UserManager


class MongoJWTAuthentication(JWTAuthentication):
    """Custom JWT auth that loads user from MongoDB instead of Django ORM."""

    def get_user(self, validated_token):
        try:
            user_id = validated_token.get('user_id')
            if not user_id:
                raise InvalidToken('Token has no user_id')

            user = UserManager.get_by_id(user_id)
            if not user:
                raise AuthenticationFailed('User not found')

            if not user.get('is_active', True):
                raise AuthenticationFailed('Account is disabled')

            # Return a simple object that DRF can work with
            return MongoUser(user)
        except TokenError as e:
            raise InvalidToken(e.args[0])


class MongoUser:
    """Minimal user object to satisfy DRF's authentication contract."""

    def __init__(self, user_doc):
        self._doc = user_doc
        self.id = str(user_doc['_id'])
        self.email = user_doc.get('email', '')
        self.is_active = user_doc.get('is_active', True)
        self.is_authenticated = True
        self.is_staff = user_doc.get('is_staff', False)

    def __str__(self):
        return self.email
