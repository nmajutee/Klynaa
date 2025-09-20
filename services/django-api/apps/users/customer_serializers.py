"""
Customer-specific serializers for the Klynaa platform.
"""

from rest_framework import serializers
from decimal import Decimal
from django.utils import timezone

from apps.users.models import User
from apps.bins.models import Bin, PickupRequest
from apps.reviews.models import Review


class CustomerProfileSerializer(serializers.ModelSerializer):
    """Serializer for customer profile information."""

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'is_verified', 'latitude', 'longitude',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'username', 'email', 'date_joined', 'last_login']


class CustomerStatsSerializer(serializers.Serializer):
    """Serializer for customer dashboard statistics."""

    total_bins = serializers.IntegerField()
    active_bins = serializers.IntegerField()
    total_pickups = serializers.IntegerField()
    pending_pickups = serializers.IntegerField()
    completed_pickups = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2)
    this_month_pickups = serializers.IntegerField()
    average_rating_given = serializers.FloatField()


class BinSerializer(serializers.ModelSerializer):
    """Serializer for customer bins."""

    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    last_pickup_date = serializers.DateTimeField(source='last_pickup', read_only=True)
    fill_percentage = serializers.IntegerField(source='fill_level', read_only=True)

    class Meta:
        model = Bin
        fields = [
            'id', 'bin_id', 'label', 'latitude', 'longitude', 'address',
            'status', 'fill_level', 'capacity_liters', 'created_at', 'updated_at',
            'last_pickup', 'owner_name', 'last_pickup_date', 'fill_percentage'
        ]
        read_only_fields = [
            'id', 'bin_id', 'created_at', 'updated_at', 'owner_name',
            'last_pickup_date', 'fill_percentage'
        ]

    def create(self, validated_data):
        """Create a new bin with auto-generated bin_id."""
        if not validated_data.get('bin_id'):
            # Generate unique bin ID
            import uuid
            validated_data['bin_id'] = f"BIN-{uuid.uuid4().hex[:8].upper()}"

        return super().create(validated_data)


class WorkerSummarySerializer(serializers.ModelSerializer):
    """Simple serializer for worker information in pickup context."""

    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'full_name', 'phone_number', 'rating_average']
        read_only_fields = fields


class PickupRequestSerializer(serializers.ModelSerializer):
    """Serializer for pickup requests (customer view)."""

    bin_address = serializers.CharField(source='bin.address', read_only=True)
    bin_label = serializers.CharField(source='bin.label', read_only=True)
    worker_info = WorkerSummarySerializer(source='worker', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    can_cancel = serializers.SerializerMethodField()
    can_rate = serializers.SerializerMethodField()
    estimated_arrival = serializers.SerializerMethodField()

    class Meta:
        model = PickupRequest
        fields = [
            'id', 'bin', 'bin_address', 'bin_label', 'status', 'status_display',
            'created_at', 'accepted_at', 'picked_at', 'completed_at',
            'expected_fee', 'actual_fee', 'payment_method', 'payment_status',
            'notes', 'cancellation_reason', 'waste_type', 'estimated_weight_kg',
            'pickup_time_window_start', 'pickup_time_window_end',
            'worker_info', 'can_cancel', 'can_rate', 'estimated_arrival'
        ]
        read_only_fields = [
            'id', 'created_at', 'accepted_at', 'picked_at', 'completed_at',
            'bin_address', 'bin_label', 'worker_info', 'status_display',
            'can_cancel', 'can_rate', 'estimated_arrival'
        ]

    def get_can_cancel(self, obj):
        """Check if pickup can be cancelled."""
        return obj.status in ['open', 'accepted']

    def get_can_rate(self, obj):
        """Check if pickup can be rated."""
        return obj.status == 'completed' and obj.worker is not None

    def get_estimated_arrival(self, obj):
        """Get estimated arrival time if pickup is in progress."""
        if obj.status == 'accepted' and obj.accepted_at:
            # Simple estimation: 30 minutes from acceptance
            estimated = obj.accepted_at + timezone.timedelta(minutes=30)
            return estimated
        return None


class PickupRequestCreateSerializer(serializers.Serializer):
    """Serializer for creating new pickup requests."""

    bin_id = serializers.IntegerField()
    waste_type = serializers.CharField(max_length=50, default='general')
    estimated_weight_kg = serializers.DecimalField(
        max_digits=5, decimal_places=2,
        required=False, default=Decimal('5.0')
    )
    preferred_pickup_time = serializers.DateTimeField(required=False)
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(
        choices=[
            ('cash', 'Cash on Delivery'),
            ('mobile_money', 'Mobile Money'),
            ('card', 'Credit/Debit Card')
        ],
        default='mobile_money'
    )

    def validate_bin_id(self, value):
        """Validate that bin exists and belongs to user."""
        try:
            bin_obj = Bin.objects.get(id=value, owner=self.context['request'].user)
            return bin_obj
        except Bin.DoesNotExist:
            raise serializers.ValidationError("Bin not found or doesn't belong to you")

    def validate_preferred_pickup_time(self, value):
        """Validate pickup time is in the future."""
        if value and value <= timezone.now():
            raise serializers.ValidationError("Pickup time must be in the future")
        return value

    def create(self, validated_data):
        """Create pickup request."""
        bin_obj = validated_data.pop('bin_id')  # This is now a Bin object

        # Calculate estimated fee based on weight and waste type
        weight = validated_data.get('estimated_weight_kg', Decimal('5.0'))
        base_rate = Decimal('20.00')  # Base rate per kg
        waste_multiplier = {
            'organic': Decimal('1.0'),
            'plastic': Decimal('1.2'),
            'metal': Decimal('1.5'),
            'electronic': Decimal('2.0'),
            'general': Decimal('1.0')
        }

        multiplier = waste_multiplier.get(
            validated_data.get('waste_type', 'general'),
            Decimal('1.0')
        )
        expected_fee = weight * base_rate * multiplier

        # Set pickup time window
        preferred_time = validated_data.get('preferred_pickup_time')
        if preferred_time:
            pickup_start = preferred_time
            pickup_end = preferred_time + timezone.timedelta(hours=2)
        else:
            # Default: next day, 9 AM - 11 AM
            tomorrow = timezone.now().date() + timezone.timedelta(days=1)
            pickup_start = timezone.datetime.combine(
                tomorrow, timezone.time(9, 0)
            ).replace(tzinfo=timezone.get_current_timezone())
            pickup_end = pickup_start + timezone.timedelta(hours=2)

        pickup_request = PickupRequest.objects.create(
            bin=bin_obj,
            owner=self.context['request'].user,
            waste_type=validated_data.get('waste_type', 'general'),
            estimated_weight_kg=validated_data.get('estimated_weight_kg', Decimal('5.0')),
            expected_fee=expected_fee,
            payment_method=validated_data.get('payment_method', 'mobile_money'),
            notes=validated_data.get('notes', ''),
            pickup_time_window_start=pickup_start,
            pickup_time_window_end=pickup_end,
            status='open'
        )

        return pickup_request


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews."""

    class Meta:
        model = Review
        fields = ['rating', 'comment']

    def validate_rating(self, value):
        """Validate rating is between 1 and 5."""
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value


class PaymentMethodSerializer(serializers.Serializer):
    """Serializer for payment methods."""

    id = serializers.CharField()
    name = serializers.CharField()
    enabled = serializers.BooleanField()
    is_default = serializers.BooleanField(default=False)