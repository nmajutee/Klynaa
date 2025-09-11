"""Bin and Pickup models for Klynaa."""

from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal
import uuid
import qrcode
import io
import base64
from django.core.files.base import ContentFile

User = get_user_model()


class Bin(models.Model):
    """Smart trash bin owned by customers."""

    class BinStatus(models.TextChoices):
        EMPTY = 'empty', 'Empty'
        PARTIAL = 'partial', 'Partially Full'
        FULL = 'full', 'Full'
        PENDING = 'pending', 'Pickup Pending'

    # Ownership and identification
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bins', null=True, blank=True)
    bin_id = models.CharField(max_length=20, unique=True, help_text="Physical bin identifier")
    qr_code_uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, help_text="Unique QR code identifier")
    qr_code_image = models.ImageField(upload_to='qr_codes/', blank=True, null=True, help_text="Generated QR code image")
    label = models.CharField(max_length=100, default="Smart Bin", help_text="User-friendly name")

    # Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6, default=Decimal('0.000000'))
    longitude = models.DecimalField(max_digits=9, decimal_places=6, default=Decimal('0.000000'))
    address = models.TextField(default="Address not set", help_text="Human-readable address")    # Status and capacity
    status = models.CharField(max_length=20, choices=BinStatus.choices, default=BinStatus.EMPTY)
    fill_level = models.IntegerField(default=0, help_text="Fill percentage 0-100")
    capacity_liters = models.IntegerField(default=120)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_pickup = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['owner', 'status']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(fill_level__gte=0) & models.Q(fill_level__lte=100),
                name='fill_level_range'
            ),
        ]

    def __str__(self):
        return f"{self.label} ({self.bin_id}) - {self.get_status_display()}"

    @property
    def needs_pickup(self):
        return self.status == self.BinStatus.FULL

    def generate_qr_code(self):
        """Generate QR code for this bin."""
        if not self.qr_code_uuid:
            self.qr_code_uuid = uuid.uuid4()

        qr_data = f"klynaa://bin/{self.qr_code_uuid}"
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)

        filename = f"qr_{self.qr_code_uuid}.png"
        self.qr_code_image.save(filename, ContentFile(buffer.getvalue()), save=False)
        buffer.close()

    def save(self, *args, **kwargs):
        """Override save to generate QR code if needed."""
        if not self.qr_code_image:
            self.generate_qr_code()
        super().save(*args, **kwargs)


class PickupRequest(models.Model):
    """Pickup order/request following Fiverr-like lifecycle."""

    class PickupStatus(models.TextChoices):
        OPEN = 'open', 'Open'
        ACCEPTED = 'accepted', 'Accepted'
        IN_PROGRESS = 'in_progress', 'In Progress'
        DELIVERED = 'delivered', 'Delivered'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        DISPUTED = 'disputed', 'Disputed'

    class PaymentMethod(models.TextChoices):
        CASH = 'cash', 'Cash'
        MOBILE_MONEY = 'mobile_money', 'Mobile Money'
        CARD = 'card', 'Card'

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ESCROWED = 'escrowed', 'Escrowed'
        PAID = 'paid', 'Paid'
        REFUNDED = 'refunded', 'Refunded'
        DISPUTED = 'disputed', 'Disputed'
        PENDING_CASH = 'pending_cash', 'Pending Cash Collection'
        COLLECTED_CASH = 'collected_cash', 'Cash Collected'

    # Core relationships
    bin = models.ForeignKey(Bin, on_delete=models.CASCADE, related_name='pickup_requests')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pickup_requests_as_owner')
    worker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pickup_requests_as_worker', null=True, blank=True)

    # Status and lifecycle
    status = models.CharField(max_length=20, choices=PickupStatus.choices, default=PickupStatus.OPEN)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    picked_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Payment
    expected_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('10.00'))
    actual_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.MOBILE_MONEY)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)

    # Notes and additional info
    notes = models.TextField(blank=True, help_text="Special instructions")
    cancellation_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['worker', 'status']),
            models.Index(fields=['owner', 'status']),
            models.Index(fields=['payment_status']),
            models.Index(fields=['created_at']),
        ]
        constraints = [
            # Ensure only one active pickup per bin
            models.UniqueConstraint(
                fields=['bin'],
                condition=models.Q(status__in=['open', 'accepted', 'in_progress']),
                name='unique_active_pickup_per_bin'
            ),
        ]

    def __str__(self):
        return f"Week {self.week_start} - {self.total_pickups} pickups"


class PickupProof(models.Model):
    """Photo proof for pickup verification."""

    class ProofType(models.TextChoices):
        BEFORE = 'before', 'Before'
        AFTER = 'after', 'After'

    class VerificationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    pickup = models.ForeignKey(PickupRequest, on_delete=models.CASCADE, related_name='proofs')
    type = models.CharField(max_length=10, choices=ProofType.choices)
    image = models.ImageField(upload_to='pickup_proofs/%Y/%m/%d/')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    captured_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='captured_proofs')
    status = models.CharField(max_length=10, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    notes = models.TextField(blank=True)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_proofs')
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['type']),
            models.Index(fields=['pickup', 'status']),
        ]

    def __str__(self):
        return f"{self.get_type_display()} proof for Pickup #{self.pickup_id}"

    @property
    def can_be_accepted(self):
        return self.status == self.PickupStatus.OPEN and self.worker is None

    @property
    def can_be_delivered(self):
        """Worker can mark delivered only if payment is secured."""
        payment_secured = self.payment_status in [
            self.PaymentStatus.ESCROWED,
            self.PaymentStatus.COLLECTED_CASH
        ]
        return self.status == self.PickupStatus.IN_PROGRESS and payment_secured


# Serverless Integration Models

class NotificationLog(models.Model):
    """Log for notifications sent by serverless functions."""

    pickup = models.ForeignKey(PickupRequest, on_delete=models.CASCADE, null=True, blank=True)
    payment_id = models.IntegerField(null=True, blank=True)
    user_ids = models.JSONField(default=list)
    notification_type = models.CharField(max_length=50)
    title = models.CharField(max_length=200)
    body = models.TextField()
    success = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict)
    sent_by = models.CharField(max_length=50, default='serverless')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['success']),
        ]


class GeoLog(models.Model):
    """Log for geographic operations by serverless functions."""

    pickup = models.ForeignKey(PickupRequest, on_delete=models.CASCADE, null=True, blank=True)
    center_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    center_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    radius_km = models.DecimalField(max_digits=5, decimal_places=2)
    workers_found = models.IntegerField(default=0)
    workers_notified = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict)
    processed_by = models.CharField(max_length=50, default='serverless')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['center_latitude', 'center_longitude']),
        ]


class EscrowLog(models.Model):
    """Log for escrow operations by serverless functions."""

    pickup = models.ForeignKey(PickupRequest, on_delete=models.CASCADE, null=True, blank=True)
    payment_id = models.IntegerField(null=True, blank=True)
    action = models.CharField(max_length=20)  # 'release', 'hold', 'refund'
    reason = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    processed_by = models.CharField(max_length=50, default='serverless')
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action']),
            models.Index(fields=['created_at']),
            models.Index(fields=['payment_id']),
        ]


class DailyReport(models.Model):
    """Daily reports generated by serverless functions."""

    date = models.DateField(unique=True)
    summary = models.JSONField(default=dict)
    earnings_data = models.JSONField(default=dict)
    pickups_data = models.JSONField(default=dict)
    worker_performance_data = models.JSONField(default=dict)
    generated_by = models.CharField(max_length=50, default='serverless')
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['created_at']),
        ]


class WeeklyAnalytics(models.Model):
    """Weekly analytics generated by serverless functions."""

    week_start = models.DateField()
    week_end = models.DateField()
    data = models.JSONField(default=dict)
    trends = models.JSONField(default=dict)
    insights = models.JSONField(default=list)
    top_performers = models.JSONField(default=list)
    generated_by = models.CharField(max_length=50, default='serverless')
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-week_start']
        indexes = [
            models.Index(fields=['week_start', 'week_end']),
            models.Index(fields=['created_at']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['week_start', 'week_end'],
                name='unique_weekly_analytics'
            ),
        ]