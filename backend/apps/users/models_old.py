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

    user_type = models.CharField(
        max_length=10,
        choices=UserType.choices,
        default=UserType.CUSTOMER,
        help_text="User role in the TrashBee system"
    )

    # Contact information
    phone_number = models.CharField(max_length=20, blank=True)

    # Profile completion
    is_profile_complete = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

    @property
    def is_admin(self):
        return self.user_type == self.UserType.ADMIN

    @property
    def is_worker(self):
        return self.user_type == self.UserType.WORKER

    @property
    def is_customer(self):
        return self.user_type == self.UserType.CUSTOMER


class CustomerProfile(models.Model):
    """Extended profile for customers (bin owners)."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')

    # Address information
    address = models.TextField(help_text="Primary address")
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)

    # Subscription details
    subscription_plan = models.CharField(
        max_length=20,
        choices=[
            ('basic', 'Basic Plan'),
            ('premium', 'Premium Plan'),
            ('enterprise', 'Enterprise Plan'),
        ],
        default='basic'
    )

    # Billing
    is_payment_verified = models.BooleanField(default=False)

    # Preferences
    preferred_pickup_time = models.CharField(
        max_length=20,
        choices=[
            ('morning', 'Morning (6AM-12PM)'),
            ('afternoon', 'Afternoon (12PM-6PM)'),
            ('evening', 'Evening (6PM-10PM)'),
        ],
        default='morning'
    )

    # TrashBee tokens (blockchain integration)
    token_balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    wallet_address = models.CharField(max_length=42, blank=True, help_text="Ethereum wallet address")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Customer Profile: {self.user.username}"


class WorkerProfile(models.Model):
    """Extended profile for collection workers."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='worker_profile')

    # Worker identification
    employee_id = models.CharField(max_length=20, unique=True)

    # Work details
    assigned_zone = models.CharField(max_length=100, help_text="Geographic work zone")
    vehicle_type = models.CharField(
        max_length=20,
        choices=[
            ('truck', 'Collection Truck'),
            ('van', 'Collection Van'),
            ('bike', 'E-Bike'),
            ('cart', 'Push Cart'),
        ],
        default='truck'
    )
    vehicle_registration = models.CharField(max_length=20, blank=True)

    # Work status
    is_on_duty = models.BooleanField(default=False)
    shift_start = models.TimeField(null=True, blank=True)
    shift_end = models.TimeField(null=True, blank=True)

    # Performance metrics
    total_pickups = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('5.00'), help_text="Average rating from customers")

    # Emergency contact
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Worker: {self.user.username} ({self.employee_id})"
