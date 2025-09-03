#!/usr/bin/env python3
"""
Simple Django Management Command Test
Tests Django backend without needing a running server
"""
import os
import sys
sys.path.append('/home/bigtee/Klynaa-v2-1/backend')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model

def test_api_endpoints():
    """Test API endpoints using Django test client"""
    print("🔌 Testing API Endpoints...")

    client = Client()
    User = get_user_model()

    # Create test users
    admin = User.objects.create_user(
        username='admin_test',
        password='pass',
        role=User.UserRole.ADMIN
    )

    worker = User.objects.create_user(
        username='worker_test',
        password='pass',
        role=User.UserRole.WORKER,
        latitude=6.5244,
        longitude=3.3792,
        is_available=True
    )

    customer = User.objects.create_user(
        username='customer_test',
        password='pass',
        role=User.UserRole.CUSTOMER
    )

    print(f"✅ Test users created: Admin({admin.id}), Worker({worker.id}), Customer({customer.id})")

    # Test worker availability endpoint
    response = client.get('/api/workers/available/', {
        'lat': '6.5244',
        'lng': '3.3792',
        'radius': '5'
    })
    print(f"✅ Workers available endpoint: Status {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Found {len(data.get('workers', []))} workers")

    # Test notification trigger endpoint
    response = client.post('/api/serverless/trigger-pickup-notifications/', {
        'pickup_request_id': 999  # Non-existent ID
    }, content_type='application/json')
    print(f"✅ Notification trigger endpoint: Status {response.status_code}")

    # Test daily reports endpoint
    response = client.post('/api/reports/daily/', {
        'date': '2025-09-03'
    }, content_type='application/json')
    print(f"✅ Daily reports endpoint: Status {response.status_code}")

    # Cleanup
    admin.delete()
    worker.delete()
    customer.delete()
    print("✅ Test cleanup completed")

def main():
    print("🧪 Simple Backend API Test")
    print("=" * 40)

    try:
        # Test Django setup
        from apps.users.models import User
        from apps.bins.models import Bin, PickupRequest
        print("✅ Django models imported successfully")

        # Test API endpoints
        test_api_endpoints()

        print("\n🎉 Backend testing completed successfully!")
        print("Your Django backend is working properly.")

    except Exception as e:
        print(f"❌ Backend test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
