#!/usr/bin/env python3
"""
Create sample data for TrashBee development.
Run: python scripts/seed_data.py
"""

import os
import sys
from pathlib import Path

# Add Django setup
sys.path.append(str(Path(__file__).parent.parent / "backend"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

@transaction.atomic
def create_sample_data():
    """Create sample users and data for development."""

    print("🌱 Creating sample data for development...")

    # Create sample users
    users_created = 0
    for i in range(5):
        username = f"user{i+1}"
        email = f"user{i+1}@klynaa.com"

        if not User.objects.filter(username=username).exists():
            User.objects.create_user(
                username=username,
                email=email,
                password="dev123",  # Simple dev password
                first_name=f"User {i+1}",
                last_name="Test"
            )
            users_created += 1

    # Create admin user if not exists
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser(
            username="admin",
            email="admin@klynaa.com",
            password="admin123"
        )
        print("✓ Created admin user (admin/admin123)")

    print(f"✓ Created {users_created} sample users")
    print("📝 Sample users login with password: dev123")
    print("🔐 Admin login: admin/admin123")

    return True

if __name__ == "__main__":
    create_sample_data()
