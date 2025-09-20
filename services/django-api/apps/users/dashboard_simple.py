"""Simple dashboard views for testing and debugging."""

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_overview_simple(request):
    """Simple dashboard endpoint for testing."""

    return JsonResponse({
        'success': True,
        'message': 'Dashboard API is working',
        'user': request.user.username,
        'role': request.user.role if hasattr(request.user, 'role') else 'unknown'
    })