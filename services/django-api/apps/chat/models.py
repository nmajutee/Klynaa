"""Chat and messaging models for worker-owner communication."""

from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class ChatRoom(models.Model):
    """Chat room for a specific pickup request between worker and owner."""

    # Identification
    room_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    pickup_request = models.OneToOneField('bins.PickupRequest', on_delete=models.CASCADE, related_name='chat_room')

    # Participants
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_rooms_as_owner')
    worker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_rooms_as_worker')

    # Status
    is_active = models.BooleanField(default=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['room_id']),
            models.Index(fields=['pickup_request']),
            models.Index(fields=['worker', 'is_active']),
            models.Index(fields=['owner', 'is_active']),
        ]

    def __str__(self):
        return f"Chat: {self.owner.username} <-> {self.worker.username}"


class Message(models.Model):
    """Individual message in a chat room."""

    class MessageType(models.TextChoices):
        TEXT = 'text', 'Text Message'
        IMAGE = 'image', 'Image'
        QUICK_REPLY = 'quick_reply', 'Quick Reply'
        SYSTEM = 'system', 'System Message'
        STATUS_UPDATE = 'status_update', 'Status Update'

    # Identification
    message_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')

    # Content
    message_type = models.CharField(max_length=20, choices=MessageType.choices, default=MessageType.TEXT)
    content = models.TextField()
    image = models.ImageField(upload_to='chat_images/%Y/%m/%d/', null=True, blank=True)

    # Sender
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')

    # Metadata
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    # For offline support
    client_message_id = models.CharField(max_length=100, blank=True, help_text="Client-side message ID for deduplication")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['chat_room', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
            models.Index(fields=['message_id']),
            models.Index(fields=['client_message_id']),
            models.Index(fields=['is_read']),
        ]
        constraints = [
            # Ensure client message IDs are unique within a chat room
            models.UniqueConstraint(
                fields=['chat_room', 'client_message_id'],
                condition=models.Q(client_message_id__isnull=False),
                name='unique_client_message_per_room'
            )
        ]

    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}..."


class QuickReply(models.Model):
    """Predefined quick reply templates for workers."""

    # Content
    text = models.CharField(max_length=100)
    category = models.CharField(max_length=50, default='general')

    # Usage tracking
    usage_count = models.IntegerField(default=0)

    # Status
    is_active = models.BooleanField(default=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-usage_count', 'text']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['usage_count']),
        ]

    def __str__(self):
        return f"{self.category}: {self.text}"


class MessageReadReceipt(models.Model):
    """Track message read receipts for real-time chat."""

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='read_receipts')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_read_receipts')
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['message', 'user']
        indexes = [
            models.Index(fields=['message']),
            models.Index(fields=['user', 'read_at']),
        ]

    def __str__(self):
        return f"{self.user.username} read {self.message.message_id}"