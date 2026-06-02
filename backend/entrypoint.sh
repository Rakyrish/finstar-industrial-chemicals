#!/bin/sh
set -e

python <<'PY'
import os
import socket
import time

host = os.environ.get("DB_HOST", "db")
port = int(os.environ.get("DB_PORT", "5432"))
timeout = int(os.environ.get("DB_WAIT_TIMEOUT", "60"))
deadline = time.time() + timeout

while True:
    try:
        with socket.create_connection((host, port), timeout=2):
            print(f"PostgreSQL is available at {host}:{port}")
            break
    except OSError as exc:
        if time.time() >= deadline:
            raise SystemExit(f"PostgreSQL did not become available at {host}:{port}: {exc}")
        print(f"Waiting for PostgreSQL at {host}:{port}...")
        time.sleep(2)
PY

if [ "${DJANGO_COLLECTSTATIC:-1}" = "1" ]; then
    python manage.py collectstatic --noinput
fi

if [ "${DJANGO_MIGRATE:-1}" = "1" ]; then
    python manage.py migrate --noinput
fi

exec "$@"
