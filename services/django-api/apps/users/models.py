"""User models for Klynaa application.

Supports three user types:
- Admin: System administrators
- Worker: Waste collection workers
- Customer: Bin owners
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from decimal import Decimal


class User(AbstractUser):
    """Extended user model for Klynaa with role-based access."""

    class UserRole(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        WORKER = 'worker', 'Worker'
        CUSTOMER = 'customer', 'Customer'

    # Contact and profile
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.CUSTOMER)
    is_verified = models.BooleanField(default=False, help_text="Email verification status")

    # Location (stored as lat/lng for simplicity)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Ratings and reputation
    rating_average = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('0.00'))
    rating_count = models.IntegerField(default=0)

    # Wallet and payments
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    # Worker-specific fields
    is_available = models.BooleanField(default=True, help_text="Worker availability status")
    pending_pickups_count = models.IntegerField(default=0, help_text="Number of active pickups for worker")
    service_radius_km = models.IntegerField(default=5, help_text="Service radius in kilometers")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['is_available', 'pending_pickups_count']),
        ]

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_worker(self):
        return self.role == self.UserRole.WORKER

    @property
    def is_customer(self):
        return self.role == self.UserRole.CUSTOMER

    @property
    def is_admin_user(self):
        return self.role == self.UserRole.ADMIN

    @property
    def average_rating(self):
        """Alias for rating_average to match API expectations."""
        return self.rating_average

    @property
    def completed_pickups(self):
        """Calculate completed pickups count."""
        if hasattr(self, '_completed_pickups'):
            return self._completed_pickups
        return 0

    @property
    def total_earnings(self):
        """Calculate total earnings from completed pickups."""
        if hasattr(self, '_total_earnings'):
            return self._total_earnings
        return 0

    @property
    def can_accept_pickups(self):
        """Check if worker can accept more pickups (max 3)."""
        return self.is_worker and self.is_available and self.pending_pickups_count < 3

    def update_rating(self):
        """Update user's rating based on all reviews."""
        from apps.reviews.models import Review
        reviews = Review.objects.filter(reviewed_user=self)
        if reviews.exists():
            total_rating = sum(review.rating for review in reviews)
            self.rating_count = reviews.count()
            self.rating_average = total_rating / self.rating_count
            self.save(update_fields=['rating_average', 'rating_count'])
        else:
            self.rating_count = 0
            self.rating_average = 0.0
            self.save(update_fields=['rating_average', 'rating_count'])
