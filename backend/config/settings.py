"""Minimal settings for the local camera debugging UI.

This settings module deliberately has no database, evidence logging, Pinata,
Firestore, or blockchain configuration. It is intended for local debugging
only until the production Django project is wired in.
"""

from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "border-surveillance-local-debug-only"
DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

ROOT_URLCONF = "config.urls"
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]
INSTALLED_APPS = []

TEMPLATES = []
WSGI_APPLICATION = "config.wsgi.application"

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
APPEND_SLASH = True
