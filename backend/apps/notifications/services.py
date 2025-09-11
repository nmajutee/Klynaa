"""Notification service for sending real-time updates."""

from django.utils import timezone
from django.template import Template, Context
from django.conf import settings
import logging
from .models import Notification, NotificationChannel, NotificationDelivery, NotificationTemplate
from typing import Dict, Any, List, Optional
try:
    import requests
except ImportError:
    requests = None
import json

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for creating and sending notifications."""

    @classmethod
    def create_notification(
        cls,
        recipient,
        notification_type: str,
        context: Dict[str, Any] = None,
        priority: str = 'normal',
        pickup_request=None,
        bin_obj=None,
        **kwargs
    ) -> Notification:
        """Create a new notification from template."""
        context = context or {}

        try:
            template = NotificationTemplate.objects.get(
                notification_type=notification_type,
                enabled=True
            )
        except NotificationTemplate.DoesNotExist:
            # Fallback to basic notification
            return cls._create_basic_notification(
                recipient=recipient,
                notification_type=notification_type,
                title=kwargs.get('title', 'Klynaa Notification'),
                message=kwargs.get('message', 'You have a new notification'),
                priority=priority,
                pickup_request=pickup_request,
                bin_obj=bin_obj
            )

        # Render templates with context
        title = cls._render_template(template.title_template, context)
        message = cls._render_template(template.message_template, context)

        notification = Notification.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            priority=priority or template.default_priority,
            title=title,
            message=message,
            pickup_request=pickup_request,
            bin=bin_obj,
            action_url=kwargs.get('action_url'),
            metadata=kwargs.get('metadata', {})
        )

        # Auto-send if not scheduled
        if not kwargs.get('scheduled_for'):
            cls.send_notification(notification)

        return notification

    @classmethod
    def _create_basic_notification(cls, **kwargs) -> Notification:
        """Create basic notification without template."""
        return Notification.objects.create(**kwargs)

    @classmethod
    def _render_template(cls, template_str: str, context: Dict[str, Any]) -> str:
        """Render Django template string with context."""
        template = Template(template_str)
        return template.render(Context(context))

    @classmethod
    def send_notification(cls, notification: Notification) -> bool:
        """Send notification through all user's active channels."""
        channels = NotificationChannel.objects.filter(
            user=notification.recipient,
            is_active=True
        )

        if not channels.exists():
            logger.warning(f"No active channels for user {notification.recipient.username}")
            notification.status = Notification.Status.FAILED
            notification.save()
            return False

        success = False
        for channel in channels:
            try:
                delivered = cls._send_via_channel(notification, channel)
                if delivered:
                    success = True
            except Exception as e:
                logger.error(f"Failed to send via {channel.channel_type}: {str(e)}")

        # Update notification status
        if success:
            notification.status = Notification.Status.SENT
            notification.sent_at = timezone.now()
        else:
            notification.status = Notification.Status.FAILED

        notification.save()
        return success

    @classmethod
    def _send_via_channel(cls, notification: Notification, channel: NotificationChannel) -> bool:
        """Send notification via specific channel."""
        delivery = NotificationDelivery.objects.create(
            notification=notification,
            channel=channel
        )

        try:
            if channel.channel_type == NotificationChannel.ChannelType.PUSH:
                success = cls._send_push_notification(notification, channel, delivery)
            elif channel.channel_type == NotificationChannel.ChannelType.EMAIL:
                success = cls._send_email_notification(notification, channel, delivery)
            elif channel.channel_type == NotificationChannel.ChannelType.SMS:
                success = cls._send_sms_notification(notification, channel, delivery)
            elif channel.channel_type == NotificationChannel.ChannelType.IN_APP:
                success = cls._send_in_app_notification(notification, channel, delivery)
            else:
                success = False

            if success:
                delivery.delivered_at = timezone.now()
            else:
                delivery.failed_at = timezone.now()

            delivery.save()
            return success

        except Exception as e:
            delivery.failed_at = timezone.now()
            delivery.error_message = str(e)
            delivery.save()
            logger.error(f"Channel delivery failed: {str(e)}")
            return False

    @classmethod
    def _send_push_notification(cls, notification: Notification, channel: NotificationChannel, delivery: NotificationDelivery) -> bool:
        """Send push notification (placeholder for FCM/APNS integration)."""
        # This would integrate with Firebase Cloud Messaging or Apple Push Notification Service
        logger.info(f"PUSH: {notification.title} -> {channel.identifier}")

        # Mock implementation - replace with actual push service
        delivery.provider_response = {
            'mock': True,
            'message': 'Push notification sent successfully',
            'device_token': channel.identifier
        }
        return True

    @classmethod
    def _send_email_notification(cls, notification: Notification, channel: NotificationChannel, delivery: NotificationDelivery) -> bool:
        """Send email notification."""
        try:
            # Mock email sending - replace with actual email service
            logger.info(f"EMAIL: {notification.title} -> {channel.identifier}")

            delivery.provider_response = {
                'mock': True,
                'message': 'Email sent successfully',
                'recipient': channel.identifier
            }
            return True

        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return False

    @classmethod
    def _send_sms_notification(cls, notification: Notification, channel: NotificationChannel, delivery: NotificationDelivery) -> bool:
        """Send SMS notification."""
        try:
            # Mock SMS sending - replace with Twilio or similar
            logger.info(f"SMS: {notification.title} -> {channel.identifier}")

            delivery.provider_response = {
                'mock': True,
                'message': 'SMS sent successfully',
                'phone': channel.identifier
            }
            return True

        except Exception as e:
            logger.error(f"SMS sending failed: {str(e)}")
            return False

    @classmethod
    def _send_in_app_notification(cls, notification: Notification, channel: NotificationChannel, delivery: NotificationDelivery) -> bool:
        """Send in-app notification (WebSocket or similar)."""
        try:
            # This would send via WebSocket to connected clients
            logger.info(f"IN-APP: {notification.title} -> {channel.identifier}")

            delivery.provider_response = {
                'mock': True,
                'message': 'In-app notification delivered',
                'user_id': notification.recipient.id
            }
            return True

        except Exception as e:
            logger.error(f"In-app notification failed: {str(e)}")
            return False


# Convenience functions for common notifications
def notify_pickup_request_created(pickup_request):
    """Notify workers about new pickup request."""
    from apps.users.models import User

    workers = User.objects.filter(
        role=User.UserRole.WORKER,
        is_active=True
    )

    context = {
        'pickup_request': pickup_request,
        'bin': pickup_request.bin,
        'customer': pickup_request.owner,
        'address': pickup_request.bin.address,
        'price': pickup_request.price
    }

    for worker in workers:
        NotificationService.create_notification(
            recipient=worker,
            notification_type='pickup_request',
            context=context,
            pickup_request=pickup_request,
            bin_obj=pickup_request.bin,
            priority='normal'
        )


def notify_pickup_assigned(pickup_request):
    """Notify customer that their pickup was assigned."""
    context = {
        'pickup_request': pickup_request,
        'worker': pickup_request.worker,
        'bin': pickup_request.bin
    }

    NotificationService.create_notification(
        recipient=pickup_request.owner,
        notification_type='pickup_assigned',
        context=context,
        pickup_request=pickup_request,
        bin_obj=pickup_request.bin,
        priority='high'
    )


def notify_pickup_completed(pickup_request):
    """Notify customer that pickup was completed."""
    context = {
        'pickup_request': pickup_request,
        'worker': pickup_request.worker,
        'bin': pickup_request.bin
    }

    NotificationService.create_notification(
        recipient=pickup_request.owner,
        notification_type='pickup_completed',
        context=context,
        pickup_request=pickup_request,
        bin_obj=pickup_request.bin,
        priority='high'
    )


def notify_bin_full(bin_obj):
    """Notify bin owner that bin is full."""
    context = {
        'bin': bin_obj,
        'fill_level': bin_obj.fill_level
    }

    NotificationService.create_notification(
        recipient=bin_obj.owner,
        notification_type='bin_full',
        context=context,
        bin_obj=bin_obj,
        priority='high'
    )
