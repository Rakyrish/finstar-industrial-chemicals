from .base import *

DEBUG = env.bool('DEBUG', default=True)

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])

# Dev Database configuration (uses PostgreSQL)
if env.str('DATABASE_URL', default=''):
    DATABASES = {
        'default': env.db('DATABASE_URL')
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': env.str('DB_ENGINE', default='django.db.backends.postgresql'),
            'NAME': env.str('DB_NAME'),
            'USER': env.str('DB_USER'),
            'PASSWORD': env.str('DB_PASSWORD'),
            'HOST': env.str('DB_HOST'),
            'PORT': env.str('DB_PORT'),
        }
    }

# CORS configuration
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])
CORS_ALLOW_CREDENTIALS = True

# Email backend console for debugging
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
