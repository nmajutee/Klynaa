"""User models for TrashBee application.

Supports three user types:
- Admin: System administrators
- Worker: Waste collection workers
- Customer: Bin owners
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from decimal import Decimal


class User(AbstractUser):
    """Extended user model for TrashBee v2 with role-based access."""

    class UserRole(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        WORKER = 'worker', 'Worker'
        CUSTOMER = 'customer', 'Customer'

    # Contact and profile
    phone_number = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.CUSTOMER)

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
    def can_accept_pickups(self):
        """Check if worker can accept more pickups (max 3)."""
        return self.is_worker and self.is_available and self.pending_pickups_count < 3

    def update_rating(self, new_rating):
        """Update user's average rating with new rating."""
        total_points = self.rating_average * self.rating_count + new_rating
        self.rating_count += 1
        self.rating_average = total_points / self.rating_count
        self.save(update_fields=['rating_average', 'rating_count'])
