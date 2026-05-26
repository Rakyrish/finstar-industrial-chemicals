from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer, RefreshSerializer, UserProfileSerializer
from .utils import ACCESS_TOKEN_TTL_MINUTES, create_token_pair, decode_jwt, is_admin_user, token_payload_for_user


def _get_token_from_request(request, cookie_name: str):
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ', 1)[1].strip()

    return request.COOKIES.get(cookie_name)


def _issue_auth_response(user):
    token_pair = create_token_pair(user)
    profile = UserProfileSerializer(user).data
    return {
        **token_pair,
        'token_type': 'Bearer',
        'user': profile,
    }


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        return Response(_issue_auth_response(user), status=status.HTTP_200_OK)


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RefreshSerializer(data=request.data)
        if not serializer.is_valid():
            refresh_token = _get_token_from_request(request, 'finstar_admin_refresh')
            if not refresh_token:
                return Response({'detail': 'Refresh token required.'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            refresh_token = serializer.validated_data['refresh']

        try:
            payload = decode_jwt(refresh_token)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_401_UNAUTHORIZED)

        if payload.get('token_type') != 'refresh':
            return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)

        user_model = get_user_model()
        try:
            user = user_model.objects.get(pk=payload.get('user_id'))
        except user_model.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not is_admin_user(user):
            return Response({'detail': 'You do not have access to the admin dashboard.'}, status=status.HTTP_403_FORBIDDEN)

        return Response(_issue_auth_response(user), status=status.HTTP_200_OK)


class MeView(APIView):
    def get(self, request):
        token = _get_token_from_request(request, 'finstar_admin_access')
        if not token:
            return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            payload = decode_jwt(token)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_401_UNAUTHORIZED)

        if payload.get('token_type') != 'access':
            return Response({'detail': 'Invalid access token.'}, status=status.HTTP_401_UNAUTHORIZED)

        user_model = get_user_model()
        try:
            user = user_model.objects.get(pk=payload.get('user_id'))
        except user_model.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not is_admin_user(user):
            return Response({'detail': 'You do not have access to the admin dashboard.'}, status=status.HTTP_403_FORBIDDEN)

        return Response({
            'authenticated': True,
            'user': UserProfileSerializer(user).data,
            'access_expires_in': max(0, int(payload.get('exp', 0) - timezone.now().timestamp())),
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    def post(self, request):
        return Response({'success': True, 'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
