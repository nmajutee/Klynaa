#!/usr/bin/env python
"""
Quick test setup script for Klynaa Worker Dashboard
Run this to create test data for testing the worker dashboard functionality
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from apps.bins.models import PickupRequest, Bin
from apps.chat.models import QuickReply
from decimal import Decimal

User = get_user_model()

def create_test_data():
    print("🚀 Setting up Klynaa Worker Dashboard Test Data...")

    # Create test worker
    worker, created = User.objects.get_or_create(
        email='worker@test.com',
        defaults={
            'username': 'testworker',
            'first_name': 'John',
            'last_name': 'Worker',
            'role': 'worker',
            'latitude': -1.2921,  # Nairobi coordinates
            'longitude': 36.8219,
            'is_available': True,
            'service_radius_km': 10,
            'is_verified': True
        }
    )

    if created:
        worker.set_password('testpass123')
        worker.save()
        print(f"✅ Created worker: {worker.email}")
    else:
        print(f"✅ Worker already exists: {worker.email}")

    # Create test customer
    customer, created = User.objects.get_or_create(
        email='customer@test.com',
        defaults={
            'username': 'testcustomer',
            'first_name': 'Jane',
            'last_name': 'Customer',
            'role': 'customer',
            'latitude': -1.2821,
            'longitude': 36.8319,
            'is_verified': True
        }
    )

    if created:
        customer.set_password('testpass123')
        customer.save()
        print(f"✅ Created customer: {customer.email}")
    else:
        print(f"✅ Customer already exists: {customer.email}")

    # Create test bins
    bin1, created = Bin.objects.get_or_create(
        owner=customer,
        address="123 Test Street, Nairobi",
        defaults={
            'bin_id': 'BIN001',
            'label': 'Household Bin',
            'fill_level': 80,
            'latitude': Decimal('-1.2821'),
            'longitude': Decimal('36.8319'),
            'status': 'full',
            'capacity_liters': 120
        }
    )

    if created:
        print(f"✅ Created bin: {bin1.address}")

    bin2, created = Bin.objects.get_or_create(
        owner=customer,
        address="456 Demo Avenue, Nairobi",
        defaults={
            'bin_id': 'BIN002',
            'label': 'Commercial Bin',
            'fill_level': 90,
            'latitude': Decimal('-1.2921'),
            'longitude': Decimal('36.8219'),
            'status': 'full',
            'capacity_liters': 240
        }
    )

    if created:
        print(f"✅ Created bin: {bin2.address}")

    # Create test pickup requests
    pickup1, created = PickupRequest.objects.get_or_create(
        bin=bin1,
        owner=customer,
        defaults={
            'waste_type': 'plastic',
            'estimated_weight_kg': 5.5,
            'expected_fee': Decimal('150.00'),
            'status': 'open',
            'notes': 'Mixed recyclables for pickup - Test Data'
        }
    )

    if created:
        print(f"✅ Created pickup request: #{pickup1.id}")
    else:
        print(f"✅ Pickup request already exists: #{pickup1.id}")

    pickup2, created = PickupRequest.objects.get_or_create(
        bin=bin2,
        owner=customer,
        defaults={
            'waste_type': 'organic',
            'estimated_weight_kg': 8.0,
            'expected_fee': Decimal('200.00'),
            'status': 'accepted',
            'worker': worker,
            'notes': 'Organic waste collection - Test Data'
        }
    )

    if created:
        print(f"✅ Created accepted pickup: #{pickup2.id}")
    else:
        print(f"✅ Accepted pickup already exists: #{pickup2.id}")

    # Create some quick replies if they don't exist
    quick_replies_data = [
        {"category": "arrival", "text": "I'm on my way!", "is_active": True},
        {"category": "arrival", "text": "Running 5 minutes late", "is_active": True},
        {"category": "collection", "text": "I'm here for pickup", "is_active": True},
        {"category": "completion", "text": "Pickup completed successfully", "is_active": True},
        {"category": "instructions", "text": "Please prepare the waste for collection", "is_active": True},
        {"category": "courtesy", "text": "Thank you!", "is_active": True},
    ]

    for reply_data in quick_replies_data:
        reply, created = QuickReply.objects.get_or_create(
            text=reply_data['text'],
            defaults=reply_data
        )
        if created:
            print(f"✅ Created quick reply: {reply.text}")

    print("\n🎉 Test data setup complete!")
    print("\n📋 Test Accounts:")
    print(f"   Worker: worker@test.com / testpass123")
    print(f"   Customer: customer@test.com / testpass123")
    print("\n📍 Test Pickups Created:")
    print(f"   Available Pickup: #{pickup1.id} - {pickup1.bin.address}")
    print(f"   Accepted Pickup: #{pickup2.id} - {pickup2.bin.address}")
    print("\n🚀 Ready to test! Run the following:")
    print("   1. python manage.py runserver 8000")
    print("   2. Navigate to http://localhost:8000/admin (create superuser if needed)")
    print("   3. Test API endpoints or start frontend server")

if __name__ == "__main__":
    create_test_data()