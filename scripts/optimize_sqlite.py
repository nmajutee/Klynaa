#!/usr/bin/env python3
"""
SQLite optimization script for TrashBee development.
Run: python scripts/optimize_sqlite.py
"""

import os
import sys
import sqlite3
from pathlib import Path

# Add Django setup
sys.path.append(str(Path(__file__).parent.parent / "backend"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.conf import settings

def optimize_sqlite():
    """Optimize SQLite database for development performance."""
    db_path = settings.DATABASES["default"]["NAME"]

    if not Path(db_path).exists():
        print("❌ SQLite database not found. Run migrations first.")
        return False

    print(f"🔧 Optimizing SQLite database: {db_path}")

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

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
            cursor.execute(pragma)
            print(f"✓ {description}")

        conn.commit()
        conn.close()

        print("✅ SQLite database optimized for development!")
        return True

    except Exception as e:
        print(f"❌ Optimization failed: {e}")
        return False

if __name__ == "__main__":
    optimize_sqlite()
