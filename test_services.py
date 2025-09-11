#!/usr/bin/env python3
"""
Test script to verify all services are running correctly.
"""
import requests
import json
import time

def test_backend():
    """Test Django backend service."""
    try:
        print("🔍 Testing Backend Service...")

        # Test health endpoint
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"✅ Health endpoint: {response.status_code} - {response.json()}")

        # Test API root
        response = requests.get("http://localhost:8000/api/", timeout=5)
        print(f"✅ API root: {response.status_code}")

        # Test admin (should redirect to login)
        response = requests.get("http://localhost:8000/admin/", timeout=5)
        print(f"✅ Admin interface: {response.status_code}")

        return True
    except Exception as e:
        print(f"❌ Backend test failed: {e}")
        return False

def test_ai_service():
    """Test AI service."""
    try:
        print("\n🤖 Testing AI Service...")

        # Test health endpoint
        response = requests.get("http://localhost:8001/health", timeout=5)
        print(f"✅ Health endpoint: {response.status_code} - {response.json()}")

        # Test root endpoint
        response = requests.get("http://localhost:8001/", timeout=5)
        print(f"✅ Root endpoint: {response.status_code}")

        return True
    except Exception as e:
        print(f"❌ AI service test failed: {e}")
        return False

def main():
    """Run all service tests."""
    print("🧪 Klynaa Services Test Suite")
    print("=" * 40)

    backend_ok = test_backend()
    ai_ok = test_ai_service()

    print("\n📊 Test Results:")
    print(f"Backend: {'✅ PASS' if backend_ok else '❌ FAIL'}")
    print(f"AI Service: {'✅ PASS' if ai_ok else '❌ FAIL'}")

    if backend_ok and ai_ok:
        print("\n🎉 All services are running correctly!")
        return 0
    else:
        print("\n⚠️  Some services need attention.")
        return 1

if __name__ == "__main__":
    exit(main())
