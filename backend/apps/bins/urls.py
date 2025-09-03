"""URLs for bins app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BinViewSet, PickupRequestViewSet, ServerlessIntegrationViewSet,
    ReportsViewSet, AnalyticsViewSet, WorkersViewSet, UsersViewSet, CleanupViewSet
)

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

urlpatterns = [
    path('', include(router.urls)),
    # Explicit hyphenated aliases for serverless clients that use dashes
    path('serverless/trigger-pickup-notifications/', ServerlessIntegrationViewSet.as_view({'post': 'trigger_pickup_notifications'})),
    path('serverless/process-escrow-release/', ServerlessIntegrationViewSet.as_view({'post': 'process_escrow_release'})),
    path('serverless/log-notification/', ServerlessIntegrationViewSet.as_view({'post': 'log_notification'})),
    path('serverless/log-geo-event/', ServerlessIntegrationViewSet.as_view({'post': 'log_geo_event'})),
    path('serverless/log-escrow-event/', ServerlessIntegrationViewSet.as_view({'post': 'log_escrow_event'})),

    # Hyphenated report endpoints
    path('reports/daily-stats/', ReportsViewSet.as_view({'get': 'daily_stats'})),
    path('reports/earnings/', ReportsViewSet.as_view({'get': 'earnings'})),
    path('reports/save-daily-report/', ReportsViewSet.as_view({'post': 'save_daily_report'})),

    # Hyphenated analytics endpoints
    path('analytics/weekly/', AnalyticsViewSet.as_view({'get': 'weekly'})),
    path('analytics/top-performers/', AnalyticsViewSet.as_view({'get': 'top_performers'})),
]
