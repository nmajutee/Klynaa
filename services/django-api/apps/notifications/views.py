"""Notification API views."""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Notification, NotificationChannel, NotificationPreference
from .services import NotificationService
from .serializers import (
    NotificationSerializer, NotificationChannelSerializer,
    NotificationPreferenceSerializer
)


class NotificationViewSet(viewsets.ModelViewSet):
    """API for managing notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications for current user."""
        notifications = self.get_queryset().filter(read_at__isnull=True)
        serializer = self.get_serializer(notifications, many=True)
        return Response({
            'count': notifications.count(),
            'notifications': serializer.data
        })

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read."""
        notification = self.get_object()
        notification.read_at = timezone.now()
        notification.save()

        return Response({
            'success': True,
            'message': 'Notification marked as read'
        })

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read."""
        updated = self.get_queryset().filter(read_at__isnull=True).update(
            read_at=timezone.now()
        )

        return Response({
            'success': True,
            'message': f'{updated} notifications marked as read'
        })

    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """Clear all notifications for user."""
        deleted_count = self.get_queryset().count()
        self.get_queryset().delete()

        return Response({
            'success': True,
            'message': f'{deleted_count} notifications cleared'
        })


class NotificationChannelViewSet(viewsets.ModelViewSet):
    """API for managing notification channels."""
    serializer_class = NotificationChannelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NotificationChannel.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a notification channel."""
        channel = self.get_object()

        # Mock verification - in real implementation, send verification code
        channel.verified = True
        channel.save()

        return Response({
            'success': True,
            'message': f'{channel.get_channel_type_display()} channel verified'
        })

    @action(detail=False, methods=['post'])
    def register_device(self, request):
        """Register device for push notifications."""
        device_token = request.data.get('device_token')
        platform = request.data.get('platform')  # 'ios' or 'android'

        if not device_token:
            return Response(
                {'error': 'device_token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        channel, created = NotificationChannel.objects.get_or_create(
            user=request.user,
            channel_type=NotificationChannel.ChannelType.PUSH,
            identifier=device_token,
            defaults={'verified': True}
        )

        if not created:
            channel.is_active = True
            channel.save()

        return Response({
            'success': True,
            'message': 'Device registered for push notifications',
            'channel_id': channel.id
        })


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """API for managing notification preferences."""
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NotificationPreference.objects.filter(user=self.request.user)

    def get_object(self):
        """Get or create notification preferences for user."""
        preferences, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preferences

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current user's notification preferences."""
        preferences = self.get_object()
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_preferences(self, request):
        """Update notification preferences."""
        preferences = self.get_object()
        serializer = self.get_serializer(preferences, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Preferences updated successfully',
                'preferences': serializer.data
            })

        return Response(
            {'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class TestNotificationViewSet(viewsets.ViewSet):
    """Test notification endpoints for development."""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def send_test(self, request):
        """Send test notification to current user."""
        notification_type = request.data.get('type', 'system_alert')
        title = request.data.get('title', 'Test Notification')
        message = request.data.get('message', 'This is a test notification from Klynaa.')

        notification = NotificationService.create_notification(
            recipient=request.user,
            notification_type=notification_type,
            title=title,
            message=message,
            priority='normal'
        )

        return Response({
            'success': True,
            'message': 'Test notification sent',
            'notification_id': notification.notification_id
        })
