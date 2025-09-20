"""
WebSocket Load Testing Suite for Klynaa Real-time System

Tests concurrent WebSocket connections, message broadcasting,
and system performance under load.
"""

import asyncio
import json
import time
import statistics
from datetime import datetime
from typing import List, Dict, Any
import websockets
from websockets.exceptions import ConnectionClosed, InvalidURI


class WebSocketLoadTester:
    def __init__(self, base_url: str = "ws://localhost:8003"):
        self.base_url = base_url
        self.results = []

    async def connect_and_test(
        self,
        endpoint: str,
        connection_id: int,
        duration: int = 10,
        message_interval: float = 1.0
    ) -> Dict[str, Any]:
        """Connect to WebSocket endpoint and send test messages"""
        uri = f"{self.base_url}{endpoint}"
        result = {
            'connection_id': connection_id,
            'endpoint': endpoint,
            'connected': False,
            'messages_sent': 0,
            'messages_received': 0,
            'connection_time': 0,
            'total_duration': 0,
            'errors': []
        }

        start_time = time.time()

        try:
            # Attempt connection
            connect_start = time.time()
            async with websockets.connect(uri) as websocket:
                connect_end = time.time()
                result['connected'] = True
                result['connection_time'] = connect_end - connect_start

                print(f"📱 Connection {connection_id} to {endpoint} established")

                # Send messages for specified duration
                end_time = start_time + duration

                while time.time() < end_time:
                    try:
                        # Send test message
                        message = {
                            'type': 'load_test',
                            'connection_id': connection_id,
                            'timestamp': datetime.now().isoformat(),
                            'message_number': result['messages_sent'] + 1
                        }

                        await websocket.send(json.dumps(message))
                        result['messages_sent'] += 1

                        # Try to receive any responses (non-blocking)
                        try:
                            response = await asyncio.wait_for(
                                websocket.recv(), timeout=0.1
                            )
                            result['messages_received'] += 1
                        except asyncio.TimeoutError:
                            pass  # No response, continue

                        await asyncio.sleep(message_interval)

                    except ConnectionClosed:
                        result['errors'].append("Connection closed during testing")
                        break

        except Exception as e:
            result['errors'].append(f"{type(e).__name__}: {str(e)}")

        finally:
            result['total_duration'] = time.time() - start_time

        return result

    async def concurrent_connection_test(
        self,
        endpoint: str,
        num_connections: int = 10,
        duration: int = 30,
        message_interval: float = 1.0
    ) -> List[Dict[str, Any]]:
        """Test multiple concurrent connections to a single endpoint"""
        print(f"\n🚀 Starting concurrent test: {num_connections} connections to {endpoint}")

        tasks = []
        for i in range(num_connections):
            task = self.connect_and_test(
                endpoint, i, duration, message_interval
            )
            tasks.append(task)

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Filter out exceptions and log them
        valid_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"❌ Connection {i} failed: {result}")
            else:
                valid_results.append(result)

        return valid_results

    async def mixed_endpoint_test(
        self,
        endpoints: List[str],
        connections_per_endpoint: int = 5,
        duration: int = 20
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Test multiple endpoints simultaneously"""
        print(f"\n🌟 Starting mixed endpoint test with {connections_per_endpoint} connections each")

        all_tasks = []
        endpoint_tasks = {}

        for endpoint in endpoints:
            tasks = []
            for i in range(connections_per_endpoint):
                task = self.connect_and_test(endpoint, i, duration)
                tasks.append(task)

            endpoint_tasks[endpoint] = tasks
            all_tasks.extend(tasks)

        # Run all tasks concurrently
        all_results = await asyncio.gather(*all_tasks, return_exceptions=True)

        # Group results by endpoint
        results_by_endpoint = {}
        task_index = 0

        for endpoint in endpoints:
            endpoint_results = []
            for _ in range(connections_per_endpoint):
                result = all_results[task_index]
                if not isinstance(result, Exception):
                    endpoint_results.append(result)
                task_index += 1

            results_by_endpoint[endpoint] = endpoint_results

        return results_by_endpoint

    def analyze_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze test results and generate statistics"""
        if not results:
            return {"error": "No valid results to analyze"}

        successful_connections = [r for r in results if r['connected']]

        analysis = {
            'total_connections_attempted': len(results),
            'successful_connections': len(successful_connections),
            'connection_success_rate': len(successful_connections) / len(results) * 100,
            'total_messages_sent': sum(r['messages_sent'] for r in results),
            'total_messages_received': sum(r['messages_received'] for r in results),
            'total_errors': sum(len(r['errors']) for r in results),
        }

        if successful_connections:
            connection_times = [r['connection_time'] for r in successful_connections]
            durations = [r['total_duration'] for r in successful_connections]

            analysis.update({
                'avg_connection_time': statistics.mean(connection_times),
                'min_connection_time': min(connection_times),
                'max_connection_time': max(connection_times),
                'avg_test_duration': statistics.mean(durations),
                'message_rate': analysis['total_messages_sent'] / sum(durations) if sum(durations) > 0 else 0,
            })

        return analysis

    def print_analysis(self, analysis: Dict[str, Any], title: str = "Test Results"):
        """Pretty print test analysis"""
        print(f"\n📊 {title}")
        print("=" * 50)

        if "error" in analysis:
            print(f"❌ {analysis['error']}")
            return

        print(f"🔗 Total Connections: {analysis['total_connections_attempted']}")
        print(f"✅ Successful: {analysis['successful_connections']} ({analysis['connection_success_rate']:.1f}%)")
        print(f"📤 Messages Sent: {analysis['total_messages_sent']}")
        print(f"📥 Messages Received: {analysis['total_messages_received']}")
        print(f"❌ Total Errors: {analysis['total_errors']}")

        if 'avg_connection_time' in analysis:
            print(f"⏱️  Avg Connection Time: {analysis['avg_connection_time']:.3f}s")
            print(f"⚡ Message Rate: {analysis['message_rate']:.2f} msg/s")


async def run_websocket_load_tests():
    """Run comprehensive WebSocket load tests"""
    tester = WebSocketLoadTester()

    print("🧪 Klynaa WebSocket Load Testing Suite")
    print("====================================")

    # Test 1: Single endpoint with increasing load
    print("\n📈 Test 1: Pickup Endpoint Load Test")
    for num_connections in [5, 10, 20]:
        results = await tester.concurrent_connection_test(
            '/ws/pickup/loadtest/',
            num_connections=num_connections,
            duration=15,
            message_interval=2.0
        )
        analysis = tester.analyze_results(results)
        tester.print_analysis(analysis, f"Pickup - {num_connections} Connections")

    # Test 2: All endpoints simultaneously
    print("\n🌐 Test 2: Mixed Endpoint Test")
    endpoints = ['/ws/pickup/test/', '/ws/worker/1/', '/ws/customer/1/']
    mixed_results = await tester.mixed_endpoint_test(
        endpoints,
        connections_per_endpoint=8,
        duration=20
    )

    for endpoint, results in mixed_results.items():
        analysis = tester.analyze_results(results)
        tester.print_analysis(analysis, f"Endpoint: {endpoint}")

    # Test 3: High-frequency messaging
    print("\n⚡ Test 3: High-Frequency Messaging")
    results = await tester.concurrent_connection_test(
        '/ws/worker/loadtest/',
        num_connections=15,
        duration=10,
        message_interval=0.2  # 5 messages per second
    )
    analysis = tester.analyze_results(results)
    tester.print_analysis(analysis, "High-Frequency Worker Updates")

    print("\n🏁 Load Testing Complete!")


if __name__ == "__main__":
    asyncio.run(run_websocket_load_tests())