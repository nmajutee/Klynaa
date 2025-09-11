"""
Django views to serve static frontend content
This allows serving a simple frontend directly from Django
"""
from django.http import HttpResponse
from django.template import Template, Context
from django.views.decorators.csrf import csrf_exempt
import json

def frontend_app(request):
    """Serve the main frontend application"""

    html_template = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Klynaa - Waste Management</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
        <style>
            .klynaa-gradient { background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%); }
        </style>
    </head>
    <body class="bg-gray-50">
        <nav class="klynaa-gradient text-white shadow-lg">
            <div class="container mx-auto px-6 py-4">
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-bold">🌱 Klynaa</h1>
                    <div class="space-x-4">
                        <a href="/admin/" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">Admin</a>
                        <a href="/api/" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">API</a>
                    </div>
                </div>
            </div>
        </nav>

        <main class="container mx-auto px-6 py-8">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold text-gray-800 mb-4">Django-Served Frontend</h2>
                <p class="text-xl text-gray-600">Simple frontend served directly from Django backend</p>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
                <div class="bg-white p-6 rounded-xl shadow-lg">
                    <h3 class="text-xl font-semibold mb-4">🔗 Backend Status</h3>
                    <div id="backend-status" class="mb-4">
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded">Online</span>
                    </div>
                    <button onclick="testAPI()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Test API
                    </button>
                    <div id="api-result" class="mt-4"></div>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-lg">
                    <h3 class="text-xl font-semibold mb-4">📊 Quick Links</h3>
                    <div class="space-y-2">
                        <a href="/admin/" class="block bg-gray-100 p-3 rounded hover:bg-gray-200 transition">
                            Django Admin Panel
                        </a>
                        <a href="/api/" class="block bg-gray-100 p-3 rounded hover:bg-gray-200 transition">
                            API Root
                        </a>
                        <a href="/api/bins/" class="block bg-gray-100 p-3 rounded hover:bg-gray-200 transition">
                            Bins API
                        </a>
                        <a href="http://localhost:8001/docs" target="_blank" class="block bg-gray-100 p-3 rounded hover:bg-gray-200 transition">
                            AI Service Docs
                        </a>
                    </div>
                </div>
            </div>
        </main>

        <script>
            async function testAPI() {
                const resultDiv = document.getElementById('api-result');
                resultDiv.innerHTML = 'Testing...';

                try {
                    const response = await axios.get('/api/bins/');
                    resultDiv.innerHTML = `
                        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            ✅ API working! Found ${response.data.results?.length || 0} bins.
                        </div>
                    `;
                } catch (error) {
                    resultDiv.innerHTML = `
                        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            ❌ API Error: ${error.message}
                        </div>
                    `;
                }
            }
        </script>
    </body>
    </html>
    """

    return HttpResponse(html_template)

@csrf_exempt
def api_status(request):
    """Simple API status endpoint"""
    return HttpResponse(json.dumps({
        "status": "ok",
        "message": "Django frontend integration working",
        "frontend_served": True
    }), content_type='application/json')
