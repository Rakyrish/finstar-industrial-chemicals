"""
Centralized settings entry-point for Finstar Industrial Chemicals backend.

This module re-exports the active environment settings so that any tool or
script that does `from config.settings import *` gets the full configuration
without needing to know about the modular settings structure.

Environment selection:
  DJANGO_SETTINGS_MODULE=config.settings.local       (default for dev)
  DJANGO_SETTINGS_MODULE=config.settings.production  (production)
  DJANGO_SETTINGS_MODULE=config.settings.docker      (Docker/CI)

All environment variables are loaded from the root-level .env file via
django-environ inside config/settings/base.py.
"""

import os

# Determine active settings module — default to local development
_active = os.environ.get('DJANGO_SETTINGS_MODULE', 'config.settings.local')

if _active == 'config.settings.production':
    from config.settings.production import *  # noqa: F401, F403
elif _active == 'config.settings.docker':
    from config.settings.docker import *  # noqa: F401, F403
else:
    from config.settings.local import *  # noqa: F401, F403

# ─── Centralized application constants ────────────────────────────────────────
# These are available as django.conf.settings.* throughout the application.
# All values are read from environment variables inside settings/base.py.

__all__ = [
    # Core
    'SECRET_KEY', 'DEBUG', 'ALLOWED_HOSTS', 'INSTALLED_APPS', 'MIDDLEWARE',

    # APIs
    'API_BASE_URL', 'OPENAI_API_KEY', 'RESEND_API_KEY', 'SITE_URL',

    # Company
    'COMPANY_EMAIL', 'COMPANY_NAME', 'COMPANY_BRAND_NAME',
    'COMPANY_TAGLINE', 'COMPANY_DESCRIPTION',
    'COMPANY_PHONE', 'COMPANY_WHATSAPP_NUMBER',
    'COMPANY_ADDRESS', 'COMPANY_ADDRESS_LINK',
    'COMPANY_WEEKDAY_HOURS', 'COMPANY_SATURDAY_HOURS', 'COMPANY_HOLIDAY_HOURS',
    'COMPANY_FACEBOOK_URL', 'COMPANY_LINKEDIN_URL',

    # Cloudinary
    'CLOUDINARY_STORAGE', 'DEFAULT_FILE_STORAGE',

    # Database
    'DATABASES',

    # REST Framework
    'REST_FRAMEWORK', 'SPECTACULAR_SETTINGS',
]
