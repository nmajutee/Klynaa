"""Serializers for notification models."""

from rest_framework import serializers
from .models import Notification, NotificationChannel, NotificationPreference, NotificationDelivery


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""

    class Meta:
        model = Notification
        fields = [
            'notification_id', 'notification_type', 'priority', 'title', 'message',
            'action_url', 'status', 'sent_at', 'delivered_at', 'read_at',
            'created_at', 'metadata'
        ]
        read_only_fields = ['notification_id', 'created_at']


class NotificationChannelSerializer(serializers.ModelSerializer):
    """Serializer for NotificationChannel model."""

    class Meta:
        model = NotificationChannel
        fields = [
            'id', 'channel_type', 'identifier', 'is_active', 'verified', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'verified']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for NotificationPreference model."""

    class Meta:
        model = NotificationPreference
        fields = [
            'enable_push', 'enable_email', 'enable_sms', 'enable_in_app',
            'pickup_notifications', 'payment_notifications', 'system_alerts',
            'marketing_notifications', 'quiet_hours_enabled', 'quiet_start_time',
            'quiet_end_time', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class NotificationDeliverySerializer(serializers.ModelSerializer):
    """Serializer for NotificationDelivery model."""
    channel = NotificationChannelSerializer(read_only=True)

    class Meta:
        model = NotificationDelivery
        fields = [
            'id', 'channel', 'attempted_at', 'delivered_at', 'failed_at',
            'error_message', 'provider_id'
        ]
        read_only_fields = ['id']
