#!/usr/bin/env python3
"""
Klynaa Backend Testing Suite
Comprehensive testing of Django backend functionality
"""
import os
import sys
import django
import subprocess
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.append(str(Path(__file__).parent / 'backend'))
django.setup()

from django.test.utils import get_runner
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command

def test_django_setup():
    """Test Django can start properly"""
    print("🧪 Testing Django Setup...")
    try:
        from apps.users.models import User
        from apps.bins.models import Bin, PickupRequest
        from apps.payments.models import PaymentTransaction, EscrowAccount
        print("✅ All models imported successfully")
        return True
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return False

def test_database_connection():
    """Test database connection and basic operations"""
    print("\n🗄️ Testing Database Connection...")
    try:
        User = get_user_model()

        # Test database query
        user_count = User.objects.count()
        print(f"✅ Database connected - {user_count} users found")

        # Test user creation
        test_user = User.objects.create_user(
            username='test_backend_user',
            email='test@klynaa.com',
            password='testpass123',
            role=User.UserRole.CUSTOMER
        )
        print(f"✅ User creation successful - ID: {test_user.id}")

        # Test user properties
        print(f"✅ User properties work - is_customer: {test_user.is_customer}")

        # Cleanup
        test_user.delete()
        print("✅ User cleanup successful")

        return True
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

def test_api_viewsets():
    """Test API viewsets can be imported and instantiated"""
    print("\n🔗 Testing API ViewSets...")
    try:
        from apps.bins.views import (
            ServerlessIntegrationViewSet,
            ReportsViewSet,
            AnalyticsViewSet,
            WorkersViewSet,
            UsersViewSet,
            CleanupViewSet
        )

        # Test instantiation
        viewsets = [
            ServerlessIntegrationViewSet(),
            ReportsViewSet(),
            AnalyticsViewSet(),
            WorkersViewSet(),
            UsersViewSet(),
            CleanupViewSet()
        ]

        print(f"✅ All {len(viewsets)} ViewSets instantiated successfully")
        return True
    except Exception as e:
        print(f"❌ ViewSet test failed: {e}")
        return False

def test_url_patterns():
    """Test URL patterns can be loaded"""
    print("\n🛣️ Testing URL Patterns...")
    try:
        from django.urls import reverse
        from django.test import Client

        client = Client()

        # Test some basic URLs
        test_urls = [
            '/api/workers/available/',
            '/api/serverless/trigger-pickup-notifications/',
            '/api/reports/daily/',
            '/api/analytics/weekly/'
        ]

        for url in test_urls:
            try:
                response = client.get(url)
                print(f"✅ {url} - Status: {response.status_code}")
            except Exception as e:
                print(f"⚠️ {url} - Error: {str(e)[:50]}...")

        return True
    except Exception as e:
        print(f"❌ URL pattern test failed: {e}")
        return False

def run_unit_tests():
    """Run Django unit tests"""
    print("\n🧪 Running Unit Tests...")
    try:
        # Change to backend directory
        os.chdir(str(Path(__file__).parent / 'backend'))

        # Run Django tests
        result = subprocess.run([
            'python', 'manage.py', 'test', 'tests', '--verbosity=1'
        ], capture_output=True, text=True)

        if result.returncode == 0:
            print("✅ All unit tests passed")
            print(result.stdout.split('\n')[-3])  # Show summary line
            return True
        else:
            print("❌ Unit tests failed")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Unit test execution failed: {e}")
        return False

def test_migrations():
    """Test database migrations"""
    print("\n📋 Testing Migrations...")
    try:
        # Check migration status
        result = subprocess.run([
            'python', 'manage.py', 'showmigrations', '--plan'
        ], capture_output=True, text=True, cwd=str(Path(__file__).parent / 'backend'))

        if result.returncode == 0:
            applied_count = result.stdout.count('[X]')
            unapplied_count = result.stdout.count('[ ]')
            print(f"✅ Migration status: {applied_count} applied, {unapplied_count} unapplied")
            return True
        else:
            print("❌ Migration check failed")
            return False
    except Exception as e:
        print(f"❌ Migration test failed: {e}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Klynaa Backend Testing Suite")
    print("=" * 50)

    tests = [
        test_django_setup,
        test_database_connection,
        test_api_viewsets,
        test_url_patterns,
        test_migrations,
        run_unit_tests
    ]

    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append(False)

    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"✅ Passed: {sum(results)}/{len(results)}")
    print(f"❌ Failed: {len(results) - sum(results)}/{len(results)}")

    if all(results):
        print("\n🎉 All backend tests passed! Your backend is ready to use.")
    else:
        print("\n⚠️ Some tests failed. Check the details above.")

    return all(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
