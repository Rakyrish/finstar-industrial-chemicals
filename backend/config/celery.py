"""
Celery application entry point for Finstar Industrial Chemicals.
Start worker:  celery -A config worker --loglevel=info
Start beat:    celery -A config beat --loglevel=info
"""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')

app = Celery('finstar')

# Load configuration from Django settings (CELERY_ prefix)
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all installed apps
app.autodiscover_tasks()
