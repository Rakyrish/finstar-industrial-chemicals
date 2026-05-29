import os
import sys
from pathlib import Path
import environ

# Initialize environ
env = environ.Env()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_DIR = BASE_DIR.parent

# Add 'apps' to python path to allow clean direct imports
sys.path.insert(0, os.path.join(BASE_DIR, 'apps'))

# Take environment variables from .env file if it exists
environ.Env.read_env(PROJECT_DIR / '.env')

SECRET_KEY = env('SECRET_KEY', default='django-insecure-finstar-chemical-precision-key-change-me')

DEBUG = env.bool('DEBUG', default=False)

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'])

API_BASE_URL = env('API_BASE_URL', default='')
OPENAI_API_KEY = env('OPENAI_API_KEY', default='')
RESEND_API_KEY = env('RESEND_API_KEY', default='')
SITE_URL = env('SITE_URL', default='')
COMPANY_EMAIL = env('COMPANY_EMAIL', default='')
COMPANY_NAME = env('COMPANY_NAME', default='Finstar Industrial Chemicals')
COMPANY_BRAND_NAME = env('COMPANY_BRAND_NAME', default='FINSTAR')
COMPANY_TAGLINE = env('COMPANY_TAGLINE', default='Industrial chemical supply for East Africa')
COMPANY_DESCRIPTION = env('COMPANY_DESCRIPTION', default='Supplier of industrial chemicals, solvents, acids, alkalis, and specialty raw materials.')
COMPANY_PHONE = env('COMPANY_PHONE', default=env('NEXT_PUBLIC_PHONE_NUMBER', default=''))
COMPANY_WHATSAPP_NUMBER = env('COMPANY_WHATSAPP_NUMBER', default=env('NEXT_PUBLIC_WHATSAPP_NUMBER', default=''))
COMPANY_ADDRESS = env('COMPANY_ADDRESS', default='')
COMPANY_ADDRESS_LINK = env('COMPANY_ADDRESS_LINK', default='')
COMPANY_WEEKDAY_HOURS = env('COMPANY_WEEKDAY_HOURS', default='8:00 AM - 5:00 PM')
COMPANY_SATURDAY_HOURS = env('COMPANY_SATURDAY_HOURS', default='8:30 AM - 1:00 PM')
COMPANY_HOLIDAY_HOURS = env('COMPANY_HOLIDAY_HOURS', default='Closed / Scheduled dispatch only')
COMPANY_FACEBOOK_URL = env('COMPANY_FACEBOOK_URL', default='')
COMPANY_LINKEDIN_URL = env('COMPANY_LINKEDIN_URL', default='')


INSTALLED_APPS = [
    'cloudinary_storage',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'cloudinary',
    
    # Third Party Apps
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
    
    # Local Apps
    'authentication.apps.AuthenticationConfig',
    'products.apps.ProductsConfig',
    'inventory.apps.InventoryConfig',
    'inquiries.apps.InquiriesConfig',
    'chatbot.apps.ChatbotConfig',
    'crm.apps.CrmConfig',
    'analytics.apps.AnalyticsConfig',
    'seo.apps.SeoConfig',
    'suppliers.apps.SuppliersConfig',
    'blog.apps.BlogConfig',
    'admin_api.apps.AdminApiConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'


# Database
# Override in local.py and production.py
if env.str('DATABASE_URL', default=''):
    DATABASES = {
        'default': env.db('DATABASE_URL')
    }
elif env.str('DB_NAME', default=''):
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



# Password validation
AUTH_PASSWORD_VALIDATORS = []


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

MEDIA_URL = 'media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'authentication.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
}


# OpenAPI / Spectacular configuration
SPECTACULAR_SETTINGS = {
    'TITLE': 'Finstar Industrial Chemicals API',
    'DESCRIPTION': 'Enterprise API service for industrial chemicals sourcing, inventory status sync, AI-chatbot, and quote wizard management.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# Cloudinary Integration
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': env('CLOUDINARY_CLOUD_NAME', default=''),
    'API_KEY': env('CLOUDINARY_API_KEY', default=''),
    'API_SECRET': env('CLOUDINARY_API_SECRET', default=''),
}
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
