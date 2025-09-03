"""
SQLite database optimization utilities.
Applied automatically when using SQLite in development.
"""

from django.db import connection
from django.core.management.base import BaseCommand


def optimize_sqlite_connection():
    """Apply SQLite optimizations to the current connection."""
    if "sqlite" not in connection.settings_dict["ENGINE"]:
        return

    with connection.cursor() as cursor:
        # Enable WAL mode for better concurrency
        cursor.execute("PRAGMA journal_mode=WAL;")
        # Faster sync for development
        cursor.execute("PRAGMA synchronous=NORMAL;")
        # Increase cache size
        cursor.execute("PRAGMA cache_size=1000;")
        # Use memory for temp storage
        cursor.execute("PRAGMA temp_store=MEMORY;")
        # Enable foreign keys
        cursor.execute("PRAGMA foreign_keys=1;")


class Command(BaseCommand):
    help = "Optimize SQLite database for development"

    def handle(self, *args, **options):
        if "sqlite" not in connection.settings_dict["ENGINE"]:
            self.stdout.write(
                self.style.WARNING("This command is only for SQLite databases")
            )
            return

        with connection.cursor() as cursor:
            # Apply optimizations
            optimizations = [
                ("PRAGMA journal_mode=WAL;", "WAL journaling mode"),
                ("PRAGMA synchronous=NORMAL;", "Normal synchronous mode"),
                ("PRAGMA cache_size=1000;", "Cache size to 1000 pages"),
                ("PRAGMA temp_store=MEMORY;", "Memory temp storage"),
                ("PRAGMA foreign_keys=1;", "Foreign key constraints"),
                ("PRAGMA optimize;", "General optimization"),
                ("VACUUM;", "Database cleanup"),
            ]

            for pragma, description in optimizations:
                try:
                    cursor.execute(pragma)
                    self.stdout.write(f"✓ {description}")
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"✗ Failed {description}: {e}")
                    )

        self.stdout.write(
            self.style.SUCCESS("✓ SQLite database optimized for development!")
        )
