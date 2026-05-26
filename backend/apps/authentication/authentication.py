from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from .utils import decode_jwt

User = get_user_model()

class JWTAuthentication(BaseAuthentication):
    """
    Custom authentication class for Django REST Framework.
    Supports authenticating users using JWT tokens supplied either via the:
      1. 'Authorization: Bearer <token>' header
      2. 'finstar_admin_access' cookie (set by the frontend)
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        token = None

        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1].strip()
        else:
            token = request.COOKIES.get('finstar_admin_access')

        if not token:
            return None

        try:
            payload = decode_jwt(token)
        except ValueError as exc:
            raise AuthenticationFailed(str(exc))

        if payload.get('token_type') != 'access':
            raise AuthenticationFailed('Invalid token type.')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('User ID not found in token payload.')

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found.')

        if not user.is_active:
            raise AuthenticationFailed('User is inactive.')

        return (user, token)
