#!/usr/bin/env python3
"""
Simple Python web server to serve static frontend files
This allows serving the frontend without Node.js
"""
import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP Request Handler with CORS support for API calls"""

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def serve_frontend(port=3000):
    """Start the frontend server"""

    # Change to the current directory
    os.chdir(Path(__file__).parent)

    print(f"🌐 Starting Klynaa Frontend Server on port {port}...")
    print(f"📁 Serving from: {os.getcwd()}")

    try:
        with socketserver.TCPServer(("", port), CORSHTTPRequestHandler) as httpd:
            print(f"✅ Frontend server running at: http://localhost:{port}")
            print("📄 Available files:")
            print(f"   - Main App: http://localhost:{port}/klynaa_webapp.html")
            print(f"   - API Test: http://localhost:{port}/frontend_test.html")
            print("\n🔗 Backend Services:")
            print("   - Django API: http://localhost:8000")
            print("   - AI Service: http://localhost:8001")
            print("\n💡 Press Ctrl+C to stop the server")

            # Try to open browser
            try:
                webbrowser.open(f'http://localhost:{port}/klynaa_webapp.html')
            except:
                pass

            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except OSError as e:
        if e.errno == 48:  # Port already in use
            print(f"❌ Port {port} is already in use. Try a different port:")
            print(f"   python frontend_server.py {port + 1}")
        else:
            print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    port = 3000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("❌ Invalid port number. Using default port 3000")

    serve_frontend(port)
