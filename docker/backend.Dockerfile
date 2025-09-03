# Backend: Django
FROM python:3.11-slim as base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements/base.txt /tmp/requirements/base.txt
COPY backend/requirements/dev.txt /tmp/requirements/dev.txt
RUN pip install --no-cache-dir -r /tmp/requirements/dev.txt

COPY backend /app

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
