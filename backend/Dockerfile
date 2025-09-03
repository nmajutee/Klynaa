# Backend: Django
FROM python:3.11-slim as base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/base.txt /tmp/base.txt
COPY requirements/dev.txt /tmp/dev.txt
RUN pip install --no-cache-dir -r /tmp/dev.txt

COPY . /app
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
