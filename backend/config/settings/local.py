from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Dev Database override to keep SQLite simple, but fallback to postgres if configured
DATABASES = {
    'default': env.db('DATABASE_URL', default='sqlite:///' + os.path.join(BASE_DIR, 'db.sqlite3'))
}

# CORS configuration
CORS_ALLOW_ALL_ORIGINS = True

# Email backend console for debugging
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
