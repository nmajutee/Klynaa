"""
Generate sample data for development testing.
Run: python manage.py seed_data
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = "Create sample data for development"

    def add_arguments(self, parser):
        parser.add_argument(
            "--users",
            type=int,
            default=5,
            help="Number of sample users to create",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        users_count = options["users"]

        # Create sample users
        users_created = 0
        for i in range(users_count):
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
            self.stdout.write("✓ Created admin user (admin/admin123)")

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Created {users_created} sample users for development"
            )
        )
        self.stdout.write("Sample users login with password: dev123")
