"""Notification models for real-time updates."""

from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class NotificationChannel(models.Model):
    """Notification delivery channels for users."""

    class ChannelType(models.TextChoices):
        PUSH = 'push', 'Push Notification'
        EMAIL = 'email', 'Email'
        SMS = 'sms', 'SMS'
        IN_APP = 'in_app', 'In-App'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_channels')
    channel_type = models.CharField(max_length=10, choices=ChannelType.choices)
    identifier = models.CharField(max_length=255, help_text="Email, phone, or device token")
    is_active = models.BooleanField(default=True)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'channel_type', 'identifier']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['channel_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_channel_type_display()}: {self.identifier}"


class Notification(models.Model):
    """Individual notification record."""

    class NotificationType(models.TextChoices):
        PICKUP_REQUEST = 'pickup_request', 'New Pickup Request'
        PICKUP_ASSIGNED = 'pickup_assigned', 'Pickup Assigned'
        PICKUP_STARTED = 'pickup_started', 'Pickup Started'
        PICKUP_COMPLETED = 'pickup_completed', 'Pickup Completed'
        PAYMENT_RECEIVED = 'payment_received', 'Payment Received'
        PAYMENT_RELEASED = 'payment_released', 'Payment Released'
        BIN_FULL = 'bin_full', 'Bin Full'
        SYSTEM_ALERT = 'system_alert', 'System Alert'
        REVIEW_REQUEST = 'review_request', 'Review Request'

    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        NORMAL = 'normal', 'Normal'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SENT = 'sent', 'Sent'
        DELIVERED = 'delivered', 'Delivered'
        FAILED = 'failed', 'Failed'
        READ = 'read', 'Read'

    notification_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.NORMAL)

    # Content
    title = models.CharField(max_length=100)
    message = models.TextField()
    action_url = models.URLField(blank=True, null=True, help_text="Deep link or web URL")

    # Related objects
    pickup_request = models.ForeignKey('bins.PickupRequest', on_delete=models.CASCADE, null=True, blank=True)
    bin = models.ForeignKey('bins.Bin', on_delete=models.CASCADE, null=True, blank=True)

    # Delivery tracking
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    scheduled_for = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'status']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['priority', 'status']),
            models.Index(fields=['scheduled_for']),
        ]

    def __str__(self):
        return f"{self.title} -> {self.recipient.username} ({self.get_status_display()})"


class NotificationDelivery(models.Model):
    """Track delivery attempts across different channels."""

    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='deliveries')
    channel = models.ForeignKey(NotificationChannel, on_delete=models.CASCADE)

    # Delivery status
    attempted_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    # Provider response
    provider_id = models.CharField(max_length=100, blank=True, help_text="Provider message/notification ID")
    provider_response = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-attempted_at']
        indexes = [
            models.Index(fields=['notification', 'channel']),
            models.Index(fields=['attempted_at']),
        ]

    def __str__(self):
        status = "Delivered" if self.delivered_at else "Failed" if self.failed_at else "Pending"
        return f"{self.notification.title} via {self.channel.get_channel_type_display()} - {status}"


class NotificationTemplate(models.Model):
    """Templates for different notification types."""

    notification_type = models.CharField(
        max_length=20,
        choices=Notification.NotificationType.choices,
        unique=True
    )

    # Templates for different channels
    title_template = models.CharField(max_length=100)
    message_template = models.TextField()
    email_subject_template = models.CharField(max_length=200, blank=True)
    email_body_template = models.TextField(blank=True)
    sms_template = models.CharField(max_length=160, blank=True)

    # Configuration
    enabled = models.BooleanField(default=True)
    default_priority = models.CharField(
        max_length=10,
        choices=Notification.Priority.choices,
        default=Notification.Priority.NORMAL
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Template: {self.get_notification_type_display()}"


class NotificationPreference(models.Model):
    """User preferences for notification delivery."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')

    # Channel preferences
    enable_push = models.BooleanField(default=True)
    enable_email = models.BooleanField(default=True)
    enable_sms = models.BooleanField(default=False)
    enable_in_app = models.BooleanField(default=True)

    # Notification type preferences
    pickup_notifications = models.BooleanField(default=True)
    payment_notifications = models.BooleanField(default=True)
    system_alerts = models.BooleanField(default=True)
    marketing_notifications = models.BooleanField(default=False)

    # Quiet hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_start_time = models.TimeField(null=True, blank=True)
    quiet_end_time = models.TimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Notification preferences for {self.user.username}"
