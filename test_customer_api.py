#!/usr/bin/env python
"""
Test script for Customer Dashboard API endpoints
"""
import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_customer_dashboard():
    """Test customer dashboard endpoint"""
    print("Testing Customer Dashboard API...")

    # Test customer dashboard stats
    try:
        response = requests.get(f"{BASE_URL}/api/users/customer/dashboard/")
        print(f"Dashboard Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Customer Dashboard endpoint working")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Dashboard error: {response.text}")
    except Exception as e:
        print(f"❌ Dashboard request failed: {e}")

def test_customer_pickups():
    """Test customer pickups endpoints"""
    print("\nTesting Customer Pickups API...")

    # Test list pickups
    try:
        response = requests.get(f"{BASE_URL}/api/users/customer/pickups/")
        print(f"Pickups List Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Customer Pickups list endpoint working")
            data = response.json()
            print(f"Pickups count: {data.get('count', 0)}")
        else:
            print(f"❌ Pickups error: {response.text}")
    except Exception as e:
        print(f"❌ Pickups request failed: {e}")

def test_customer_bins():
    """Test customer bins endpoints"""
    print("\nTesting Customer Bins API...")

    # Test list bins
    try:
        response = requests.get(f"{BASE_URL}/api/users/customer/bins/")
        print(f"Bins List Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Customer Bins list endpoint working")
            data = response.json()
            print(f"Bins count: {data.get('count', 0)}")
        else:
            print(f"❌ Bins error: {response.text}")
    except Exception as e:
        print(f"❌ Bins request failed: {e}")

def test_customer_profile():
    """Test customer profile endpoints"""
    print("\nTesting Customer Profile API...")

    # Test profile endpoint
    try:
        response = requests.get(f"{BASE_URL}/api/users/customer/profile/")
        print(f"Profile Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Customer Profile endpoint working")
            print(f"Profile data: {response.json()}")
        else:
            print(f"❌ Profile error: {response.text}")
    except Exception as e:
        print(f"❌ Profile request failed: {e}")

def test_health_check():
    """Test basic health check"""
    print("Testing Backend Health...")

    try:
        response = requests.get(f"{BASE_URL}/health/")
        print(f"Health Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Backend is healthy")
            print(f"Health data: {response.json()}")
        else:
            print(f"❌ Health check error: {response.text}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")

if __name__ == "__main__":
    print("🧪 Customer Dashboard API Testing")
    print("=" * 40)

    # First check if backend is running
    test_health_check()

    # Test all customer endpoints
    test_customer_dashboard()
    test_customer_pickups()
    test_customer_bins()
    test_customer_profile()

    print("\n" + "=" * 40)
    print("✅ API Testing Complete!")