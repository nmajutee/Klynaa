"""
Simple views for WebSocket testing.
"""
from django.shortcuts import render
from django.http import HttpResponse


def websocket_test_page(request):
    """Serve WebSocket test page."""
    return render(request, 'websocket_test.html')


def websocket_test_simple(request):
    """Serve simple WebSocket test page without authentication."""
    return render(request, 'websocket_test_simple.html')


def worker_dashboard(request):
    """Serve worker dashboard page."""
    return render(request, 'worker_dashboard.html')


def websocket_status(request):
    """Simple status endpoint for WebSocket testing."""
    return HttpResponse("WebSocket endpoints are ready for testing!", content_type="text/plain")