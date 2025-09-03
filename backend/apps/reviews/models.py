"""Reviews and ratings for Klynaa system."""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Review(models.Model):
    """User reviews after pickup completion."""

    class ReviewType(models.TextChoices):
        WORKER_TO_CUSTOMER = 'worker_to_customer', 'Worker to Customer'
        CUSTOMER_TO_WORKER = 'customer_to_worker', 'Customer to Worker'

    # Relationships
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    pickup_request = models.ForeignKey('bins.PickupRequest', on_delete=models.CASCADE, related_name='reviews')

    # Review content
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5"
    )
    comment = models.TextField(help_text="Review comment")
    review_type = models.CharField(max_length=30, choices=ReviewType.choices)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['reviewer', 'pickup_request', 'review_type']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reviewed_user', 'rating']),
            models.Index(fields=['review_type']),
        ]

    def __str__(self):
        return f"{self.reviewer.username} → {self.reviewed_user.username} ({self.rating}★)"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update reviewed user's rating after saving
        self.reviewed_user.update_rating()


class Dispute(models.Model):
    """Disputes for pickup requests."""

    class DisputeStatus(models.TextChoices):
        OPEN = 'open', 'Open'
        INVESTIGATING = 'investigating', 'Under Investigation'
        RESOLVED = 'resolved', 'Resolved'
        CLOSED = 'closed', 'Closed'

    class DisputeType(models.TextChoices):
        PAYMENT = 'payment', 'Payment Issue'
        SERVICE = 'service', 'Service Quality'
        NO_SHOW = 'no_show', 'No Show'
        OTHER = 'other', 'Other'

    # Relationships
    pickup_request = models.OneToOneField('bins.PickupRequest', on_delete=models.CASCADE, related_name='dispute')
    filed_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='disputes_filed')
    against_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='disputes_against')

    # Dispute details
    dispute_type = models.CharField(max_length=20, choices=DisputeType.choices)
    description = models.TextField(help_text="Detailed description of the issue")
    status = models.CharField(max_length=20, choices=DisputeStatus.choices, default=DisputeStatus.OPEN)

    # Resolution
    resolution = models.TextField(blank=True, help_text="Admin resolution notes")
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='disputes_resolved')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['dispute_type']),
        ]

    def __str__(self):
        return f"Dispute #{self.id} - {self.pickup_request} ({self.get_status_display()})"
