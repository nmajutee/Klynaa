"""URLs for notifications app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationViewSet, NotificationChannelViewSet,
    NotificationPreferenceViewSet, TestNotificationViewSet
)

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'channels', NotificationChannelViewSet, basename='notification-channel')
router.register(r'preferences', NotificationPreferenceViewSet, basename='notification-preference')
router.register(r'test', TestNotificationViewSet, basename='test-notification')

urlpatterns = [
    path('', include(router.urls)),
]
