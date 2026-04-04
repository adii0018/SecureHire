import requests as http_requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


def _get_google_user_info_from_access_token(access_token):
    """Use Google's userinfo endpoint to get user info from an access_token."""
    resp = http_requests.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        headers={'Authorization': f'Bearer {access_token}'},
        timeout=10,
    )
    if resp.status_code != 200:
        raise ValueError(f'Failed to fetch Google user info: {resp.status_code}')
    return resp.json()


def _get_google_user_info_from_id_token(token):
    """Verify a Google ID token and return user info."""
    idinfo = id_token.verify_oauth2_token(
        token,
        google_requests.Request(),
        settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
    )
    return idinfo


def verify_google_token(token):
    """
    Auto-detect token type (access_token vs id_token) and return
    normalized user info dict.
    """
    # ID tokens are JWTs - they contain two dots
    if token.count('.') == 2:
        raw = _get_google_user_info_from_id_token(token)
    else:
        raw = _get_google_user_info_from_access_token(token)

    email = raw.get('email')
    if not email:
        raise ValueError('No email in Google response')

    return {
        'google_id': raw.get('sub'),
        'email': email,
        'first_name': raw.get('given_name', ''),
        'last_name': raw.get('family_name', ''),
        'email_verified': raw.get('email_verified', False),
    }


def get_or_create_google_user(google_info):
    """
    Get existing user by google_id or email, or create a new one.
    Returns (user, created) tuple.
    """
    email = google_info['email']
    google_id = google_info['google_id']

    # Try by google_id first
    if google_id:
        user = User.objects.filter(google_id=google_id).first()
        if user:
            return user, False

    # Try by email (user may have registered manually before)
    user = User.objects.filter(email=email).first()
    if user:
        if google_id and not user.google_id:
            user.google_id = google_id
            user.save(update_fields=['google_id'])
        return user, False

    # Create new user
    user = User.objects.create_user(
        username=email,
        email=email,
        first_name=google_info['first_name'],
        last_name=google_info['last_name'],
        google_id=google_id,
        password=None,
    )
    return user, True
