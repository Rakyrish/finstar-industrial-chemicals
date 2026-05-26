import base64
import hmac
import json
import hashlib
from datetime import datetime, timedelta, timezone

from django.conf import settings

ACCESS_TOKEN_TTL_MINUTES = 60
REFRESH_TOKEN_TTL_DAYS = 7


def _base64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode('utf-8').rstrip('=')


def _base64url_decode(value: str) -> bytes:
    padding = '=' * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def _sign(message: str) -> str:
    digest = hmac.new(
        settings.SECRET_KEY.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256,
    ).digest()
    return _base64url_encode(digest)


def create_jwt(payload: dict) -> str:
    header = {'alg': 'HS256', 'typ': 'JWT'}
    header_part = _base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_part = _base64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    signature = _sign(f'{header_part}.{payload_part}')
    return f'{header_part}.{payload_part}.{signature}'


def decode_jwt(token: str, verify_exp: bool = True) -> dict:
    header_part, payload_part, signature = token.split('.')
    expected_signature = _sign(f'{header_part}.{payload_part}')

    if not hmac.compare_digest(signature, expected_signature):
        raise ValueError('Invalid token signature')

    payload = json.loads(_base64url_decode(payload_part))

    if verify_exp:
        expires_at = payload.get('exp')
        if expires_at is None:
            raise ValueError('Missing token expiry')

        now = datetime.now(timezone.utc).timestamp()
        if float(expires_at) <= now:
            raise ValueError('Token expired')

    return payload


def token_payload_for_user(user, token_type: str, expires_in_seconds: int) -> dict:
    now = datetime.now(timezone.utc)
    groups = list(user.groups.values_list('name', flat=True))
    permissions = list(user.get_all_permissions())

    return {
        'token_type': token_type,
        'iat': int(now.timestamp()),
        'exp': int((now + timedelta(seconds=expires_in_seconds)).timestamp()),
        'sub': str(user.pk),
        'user_id': user.pk,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'groups': groups,
        'permissions': permissions,
    }


def create_token_pair(user) -> dict:
    access_payload = token_payload_for_user(user, 'access', ACCESS_TOKEN_TTL_MINUTES * 60)
    refresh_payload = token_payload_for_user(user, 'refresh', REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60)

    return {
        'access': create_jwt(access_payload),
        'refresh': create_jwt(refresh_payload),
        'access_expires_in': ACCESS_TOKEN_TTL_MINUTES * 60,
        'refresh_expires_in': REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
    }


def is_admin_user(user) -> bool:
    return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))
