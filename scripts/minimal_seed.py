#!/usr/bin/env python3
"""
Ultra Simple Data Creation for Dashboard Demo
Just creates the absolute minimum data needed for the dashboard to display
"""

import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/home/dev/Klynaa/backend')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

print("🎯 Creating minimal data for dashboard demo...")

# Create one worker with good stats
worker = User.objects.create(
    username="demo_worker",
    email="demo@klynaa.com",
    first_name="Demo",
    last_name="Worker",
    phone_number="+254700000001",
    role=User.UserRole.WORKER,
    is_verified=True,
    latitude=Decimal('-1.2921'),
    longitude=Decimal('36.8219'),
    rating_average=Decimal('4.8'),
    rating_count=127,
    wallet_balance=Decimal('15750.00'),
    is_available=True
)

print(f"✅ Created demo worker: {worker.get_full_name()}")
print(f"   Rating: {worker.rating_average}★ ({worker.rating_count} reviews)")
print(f"   Balance: KES {worker.wallet_balance}")

print("\n🎉 Demo data created successfully!")
print("📊 Your dashboard should now display:")
print("   • Worker profile with good rating")
print("   • Realistic wallet balance")
print("   • Professional statistics")
print("\n🚀 Check your dashboard at http://localhost:3000/worker/dashboard")