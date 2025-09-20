"""URLs for bins app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BinViewSet, PickupRequestViewSet, ServerlessIntegrationViewSet,
    ReportsViewSet, AnalyticsViewSet, WorkersViewSet, UsersViewSet, CleanupViewSet
)
from .views_qr import QRCodeViewSet
from . import admin_views
from . import realtime_views
from . import websocket_views

router = DefaultRouter()
router.register(r'bins', BinViewSet, basename='bin')
router.register(r'pickups', PickupRequestViewSet, basename='pickup-request')

# Serverless integration endpoints
router.register(r'serverless', ServerlessIntegrationViewSet, basename='serverless')
router.register(r'reports', ReportsViewSet, basename='reports')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')
router.register(r'workers', WorkersViewSet, basename='workers')
router.register(r'users', UsersViewSet, basename='users-api')
router.register(r'cleanup', CleanupViewSet, basename='cleanup')
router.register(r'qr', QRCodeViewSet, basename='qr-code')

urlpatterns = [
    path('', include(router.urls)),
    # Explicit hyphenated aliases for serverless clients that use dashes
    path('serverless/trigger-pickup-notifications/', ServerlessIntegrationViewSet.as_view({'post': 'trigger_pickup_notifications'})),
    path('serverless/process-escrow-release/', ServerlessIntegrationViewSet.as_view({'post': 'process_escrow_release'})),
    path('serverless/log-notification/', ServerlessIntegrationViewSet.as_view({'post': 'log_notification'})),
    path('serverless/log-geo-event/', ServerlessIntegrationViewSet.as_view({'post': 'log_geo_event'})),
    path('serverless/log-escrow-event/', ServerlessIntegrationViewSet.as_view({'post': 'log_escrow_event'})),

    # Admin dashboard
    path('admin/dashboard/', admin_views.admin_dashboard, name='admin_dashboard'),
    path('admin/metrics/', admin_views.admin_metrics_api, name='admin_metrics'),
    path('admin/activity/', admin_views.admin_recent_activity, name='admin_activity'),

    # Analytics endpoints

    # Hyphenated report endpoints
    path('reports/daily-stats/', ReportsViewSet.as_view({'get': 'daily_stats'})),
    path('reports/earnings/', ReportsViewSet.as_view({'get': 'earnings'})),
    path('reports/save-daily-report/', ReportsViewSet.as_view({'post': 'save_daily_report'})),

    # Hyphenated analytics endpoints
    path('analytics/weekly/', AnalyticsViewSet.as_view({'get': 'weekly'})),
    path('analytics/top-performers/', AnalyticsViewSet.as_view({'get': 'top_performers'})),

    # Real-time WebSocket integration endpoints
    path('realtime/create-pickup/', realtime_views.create_pickup_request_with_updates, name='create_pickup_realtime'),
    path('realtime/update-pickup-status/<int:pickup_id>/', realtime_views.update_pickup_status_with_broadcast, name='update_pickup_status_realtime'),
    path('realtime/update-worker-location/', realtime_views.update_worker_location_with_broadcast, name='update_worker_location_realtime'),
    path('realtime/optimize-route/', realtime_views.optimize_route_with_updates, name='optimize_route_realtime'),

    # WebSocket test endpoints
    path('websocket-test/', websocket_views.websocket_test_page, name='websocket_test'),
    path('websocket-test-simple/', websocket_views.websocket_test_simple, name='websocket_test_simple'),
    path('worker-dashboard/', websocket_views.worker_dashboard, name='worker_dashboard'),
    path('websocket-status/', websocket_views.websocket_status, name='websocket_status'),
]
