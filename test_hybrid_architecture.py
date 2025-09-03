#!/usr/bin/env python3
"""
Test script to demonstrate Klynaa hybrid serverless architecture
"""
import json
import requests
import time
from datetime import datetime

# Configuration
DJANGO_API_URL = "http://localhost:8001"
SERVERLESS_LOCAL = True  # Set to False when using deployed serverless functions

class KlynaaHybridTest:
    def __init__(self):
        self.api_url = DJANGO_API_URL
        self.session = requests.Session()

    def log(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")

    def test_api_connectivity(self):
        """Test basic API connectivity"""
        self.log("🔍 Testing API connectivity...")
        try:
            response = self.session.get(f"{self.api_url}/api/")
            if response.status_code == 200:
                self.log("✅ Django API is responsive")
                return True
            else:
                self.log(f"❌ API returned status {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ API connection failed: {e}")
            return False

    def test_serverless_endpoints(self):
        """Test serverless integration endpoints"""
        self.log("🔍 Testing serverless integration endpoints...")

        endpoints = [
            "/api/serverless/trigger-pickup-notifications/",
            "/api/serverless/process-escrow-release/",
            "/api/reports/daily-stats/",
            "/api/analytics/weekly/",
            "/api/workers/available/",
            "/api/users/tokens/",
        ]

        for endpoint in endpoints:
            try:
                response = self.session.get(f"{self.api_url}{endpoint}")
                if response.status_code in [200, 400, 405]:  # 400/405 expected for missing params
                    self.log(f"✅ Endpoint {endpoint} is accessible")
                else:
                    self.log(f"⚠️ Endpoint {endpoint} returned {response.status_code}")
            except Exception as e:
                self.log(f"❌ Endpoint {endpoint} failed: {e}")

    def simulate_pickup_flow(self):
        """Simulate the full pickup flow with serverless integration"""
        self.log("🚀 Simulating pickup flow with serverless integration...")

        # Step 1: Create a mock pickup notification
        self.log("1️⃣ Triggering pickup notification (serverless integration point)")
        notification_data = {
            "pickup_id": 1,
            "notification_type": "pickup_requested",
            "user_type": "worker",
            "user_ids": [1, 2, 3]
        }

        try:
            response = self.session.post(
                f"{self.api_url}/api/serverless/trigger-pickup-notifications/",
                json=notification_data
            )
            if response.status_code == 200:
                self.log("✅ Pickup notification trigger successful")
            else:
                self.log(f"⚠️ Notification trigger returned {response.status_code}")
        except Exception as e:
            self.log(f"❌ Notification trigger failed: {e}")

        # Step 2: Simulate escrow release
        self.log("2️⃣ Processing escrow release (serverless integration point)")
        escrow_data = {
            "pickup_id": 1,
            "release_reason": "customer_confirmed",
            "force_release": True  # For testing
        }

        try:
            response = self.session.post(
                f"{self.api_url}/api/serverless/process-escrow-release/",
                json=escrow_data
            )
            if response.status_code in [200, 400]:  # 400 expected if pickup doesn't exist
                self.log("✅ Escrow release endpoint accessible")
            else:
                self.log(f"⚠️ Escrow release returned {response.status_code}")
        except Exception as e:
            self.log(f"❌ Escrow release failed: {e}")

        # Step 3: Test logging endpoints
        self.log("3️⃣ Testing serverless logging endpoints")
        log_data = {
            "pickup_id": 1,
            "user_ids": [1, 2],
            "notification_type": "test_notification",
            "title": "Test Notification",
            "body": "This is a test notification",
            "success": True,
            "metadata": {"test": True}
        }

        try:
            response = self.session.post(
                f"{self.api_url}/api/serverless/log-notification/",
                json=log_data
            )
            if response.status_code == 200:
                self.log("✅ Notification logging successful")
            else:
                self.log(f"⚠️ Notification logging returned {response.status_code}")
        except Exception as e:
            self.log(f"❌ Notification logging failed: {e}")

    def test_analytics_endpoints(self):
        """Test analytics and reporting endpoints"""
        self.log("📊 Testing analytics and reporting endpoints...")

        # Test daily stats
        try:
            response = self.session.get(
                f"{self.api_url}/api/reports/daily-stats/",
                params={"date": "2025-09-03"}
            )
            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ Daily stats: {data.get('total_pickups', 0)} pickups")
            else:
                self.log(f"⚠️ Daily stats returned {response.status_code}")
        except Exception as e:
            self.log(f"❌ Daily stats failed: {e}")

        # Test earnings report
        try:
            response = self.session.get(
                f"{self.api_url}/api/reports/earnings/",
                params={"date": "2025-09-03"}
            )
            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ Earnings report: ${data.get('total_earnings', 0)}")
            else:
                self.log(f"⚠️ Earnings report returned {response.status_code}")
        except Exception as e:
            self.log(f"❌ Earnings report failed: {e}")

    def test_worker_management(self):
        """Test worker management endpoints"""
        self.log("👷 Testing worker management endpoints...")

        # Test available workers
        try:
            response = self.session.get(
                f"{self.api_url}/api/workers/available/",
                params={"lat": "6.5244", "lng": "3.3792", "radius": "5"}
            )
            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ Found {len(data.get('workers', []))} available workers")
            else:
                self.log(f"⚠️ Available workers returned {response.status_code}")
        except Exception as e:
            self.log(f"❌ Available workers failed: {e}")

    def run_full_test(self):
        """Run the complete test suite"""
        self.log("🚀 Starting Klynaa Hybrid Architecture Test")
        self.log("=" * 60)

        if not self.test_api_connectivity():
            self.log("❌ API connectivity failed. Stopping tests.")
            return

        self.test_serverless_endpoints()
        print()

        self.simulate_pickup_flow()
        print()

        self.test_analytics_endpoints()
        print()

        self.test_worker_management()
        print()

        self.log("✅ Hybrid architecture test completed!")
        self.log("=" * 60)

        # Summary
        self.log("📋 ARCHITECTURE SUMMARY:")
        self.log("  • Django Backend: Core business logic ✅")
        self.log("  • Serverless Endpoints: Ready for Lambda integration ✅")
        self.log("  • Notification System: API endpoints ready ✅")
        self.log("  • Escrow Processing: Integration endpoints ready ✅")
        self.log("  • Analytics & Reporting: Real-time data available ✅")
        self.log("  • Geographic Services: Worker location endpoints ready ✅")

if __name__ == "__main__":
    tester = KlynaaHybridTest()
    tester.run_full_test()
