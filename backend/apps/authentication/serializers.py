from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers

from .utils import is_admin_user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        request = self.context.get('request')
        user = authenticate(
            request=request,
            username=attrs.get('username'),
            password=attrs.get('password'),
        )

        if not user:
            raise serializers.ValidationError('Invalid username or password.')

        if not user.is_active:
            raise serializers.ValidationError('This account is inactive.')

        if not is_admin_user(user):
            raise serializers.ValidationError('You do not have access to the admin dashboard.')

        attrs['user'] = user
        return attrs


class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class UserProfileSerializer(serializers.ModelSerializer):
    groups = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    displayName = serializers.SerializerMethodField()
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    isStaff = serializers.BooleanField(source='is_staff')
    isSuperuser = serializers.BooleanField(source='is_superuser')
    accessLevel = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'firstName',
            'lastName',
            'isStaff',
            'isSuperuser',
            'groups',
            'permissions',
            'displayName',
            'accessLevel',
        ]

    def get_groups(self, obj):
        return [{
            'id': group.id,
            'name': group.name,
        } for group in obj.groups.all()]

    def get_permissions(self, obj):
        return [{
            'codename': permission.split('.')[-1],
            'name': permission,
        } for permission in obj.get_all_permissions()]

    def get_displayName(self, obj):
        full_name = obj.get_full_name().strip()
        return full_name or obj.username

    def get_accessLevel(self, obj):
        return 'superuser' if obj.is_superuser else 'staff'
