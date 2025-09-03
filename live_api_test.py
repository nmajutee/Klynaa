#!/usr/bin/env python3
"""
Klynaa Backend Live API Testing
Tests all endpoints against the running server
"""
import json
import subprocess
import time

def run_curl(url, method="GET", data=None, headers=None):
    """Run curl command and return response"""
    cmd = ["curl", "-s"]

    if method != "GET":
        cmd.extend(["-X", method])

    if headers:
        for header in headers:
            cmd.extend(["-H", header])

    if data:
        cmd.extend(["-d", json.dumps(data)])

    cmd.append(url)

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        return result.stdout.strip()
    except Exception as e:
        return f"Error: {e}"

def test_endpoints():
    """Test all Klynaa API endpoints"""
    base_url = "http://localhost:8000"

    print("🧪 Testing Klynaa Backend API Endpoints")
    print("=" * 50)

    # Test cases: (name, method, endpoint, data, expected_in_response)
    tests = [
        ("API Root", "GET", "/api/", None, "Klynaa API v2"),
        ("Health Check", "GET", "/api/health/", None, "ok"),
        ("Workers Available (Empty)", "GET", "/api/workers/available/?lat=6.5244&lng=3.3792", None, "workers"),
        ("Serverless Notification (Missing ID)", "POST", "/api/serverless/trigger-pickup-notifications/", {"pickup_request_id": 999}, "error"),
        ("Daily Report (Missing Summary)", "POST", "/api/reports/save-daily-report/", {"date": "2025-09-03"}, "error"),
        ("Weekly Analytics", "POST", "/api/analytics/weekly/", {"week": "2025-09-01"}, None),
        ("Top Performers", "GET", "/api/analytics/top-performers/", None, None),
        ("User Cleanup", "POST", "/api/users/cleanup/", {"days": 30}, None),
    ]

    results = []

    for name, method, endpoint, data, expected in tests:
        print(f"\n🔍 Testing: {name}")
        print(f"   {method} {endpoint}")

        headers = ["Content-Type: application/json"] if data else None
        response = run_curl(f"{base_url}{endpoint}", method, data, headers)

        # Check if response looks like JSON
        try:
            json_response = json.loads(response)
            print(f"   ✅ Status: Valid JSON response")
            print(f"   📄 Response: {json.dumps(json_response, indent=2)[:200]}...")

            if expected and expected in response:
                print(f"   ✅ Expected content found: '{expected}'")
                results.append(True)
            elif expected:
                print(f"   ⚠️  Expected content not found: '{expected}'")
                results.append(False)
            else:
                print(f"   ✅ Endpoint responding (no specific expectation)")
                results.append(True)

        except json.JSONDecodeError:
            if "404" in response or "The current path" in response:
                print(f"   ❌ 404 Not Found - Endpoint may not be configured")
                results.append(False)
            elif response:
                print(f"   ⚠️  Non-JSON response (may be HTML): {response[:100]}...")
                results.append(False)
            else:
                print(f"   ❌ Empty response")
                results.append(False)

    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"✅ Passing: {sum(results)}/{len(results)}")
    print(f"❌ Failing: {len(results) - sum(results)}/{len(results)}")

    if sum(results) >= len(results) * 0.8:  # 80% success rate
        print("\n🎉 Backend is working well! Most endpoints are responding correctly.")
    else:
        print("\n⚠️  Some endpoints need attention. Check the details above.")

    return results

def check_server_running():
    """Check if Django server is running"""
    response = run_curl("http://localhost:8000/api/health/")
    if "ok" in response:
        print("✅ Django server is running on localhost:8000")
        return True
    else:
        print("❌ Django server not responding. Start it with:")
        print("   cd backend && python manage.py runserver")
        return False

def main():
    print("🚀 Klynaa Backend Live Testing Suite")
    print(f"⏰ Testing at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)

    if not check_server_running():
        return

    test_endpoints()

    print("\n💡 Tips:")
    print("   • Make sure your Django server is running")
    print("   • Add test data to see more realistic responses")
    print("   • Check Django logs for any error details")

if __name__ == "__main__":
    main()
