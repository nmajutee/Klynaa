"""Serializers for Worker Dashboard API endpoints."""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.bins.models import PickupRequest, PickupProof, Bin
from apps.payments.models import WorkerEarnings, PaymentTransaction
from apps.chat.models import ChatRoom, Message, QuickReply
from apps.reviews.models import Review

User = get_user_model()


class WorkerProfileSerializer(serializers.ModelSerializer):
    """Serializer for worker profile with dashboard-specific fields."""

    total_earnings = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    pending_earnings = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    completed_today = serializers.IntegerField(read_only=True)
    completion_rate = serializers.FloatField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'phone_number',
            'is_available', 'latitude', 'longitude', 'rating_average', 'rating_count',
            'wallet_balance', 'pending_pickups_count', 'service_radius_km',
            'total_earnings', 'pending_earnings', 'completed_today', 'completion_rate',
            'last_active'
        ]
        read_only_fields = ['id', 'username', 'rating_average', 'rating_count', 'wallet_balance']


class PickupTaskSerializer(serializers.ModelSerializer):
    """Serializer for pickup tasks in worker dashboard."""

    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    owner_phone = serializers.CharField(source='owner.phone_number', read_only=True)
    bin_address = serializers.CharField(source='bin.address', read_only=True)
    bin_latitude = serializers.DecimalField(source='bin.latitude', max_digits=9, decimal_places=6, read_only=True)
    bin_longitude = serializers.DecimalField(source='bin.longitude', max_digits=9, decimal_places=6, read_only=True)
    distance_km = serializers.FloatField(read_only=True)
    can_accept = serializers.BooleanField(read_only=True)
    time_window = serializers.SerializerMethodField()

    class Meta:
        model = PickupRequest
        fields = [
            'id', 'status', 'waste_type', 'estimated_weight_kg', 'expected_fee',
            'owner_name', 'owner_phone', 'bin_address', 'bin_latitude', 'bin_longitude',
            'distance_km', 'can_accept', 'time_window', 'notes',
            'created_at', 'accepted_at', 'picked_at', 'completed_at',
            'pickup_time_window_start', 'pickup_time_window_end'
        ]
        read_only_fields = ['id', 'created_at', 'accepted_at', 'picked_at', 'completed_at']

    def get_time_window(self, obj):
        """Format pickup time window."""
        if obj.pickup_time_window_start and obj.pickup_time_window_end:
            return {
                'start': obj.pickup_time_window_start.isoformat(),
                'end': obj.pickup_time_window_end.isoformat(),
            }
        return None


class PickupTaskDetailSerializer(PickupTaskSerializer):
    """Detailed serializer with chat room and proof info."""

    chat_room_id = serializers.UUIDField(source='chat_room.room_id', read_only=True)
    proofs = serializers.SerializerMethodField()

    class Meta(PickupTaskSerializer.Meta):
        fields = PickupTaskSerializer.Meta.fields + ['chat_room_id', 'proofs']

    def get_proofs(self, obj):
        """Get pickup proofs."""
        proofs = obj.proofs.all()
        return [{
            'id': proof.id,
            'type': proof.type,
            'image_url': proof.image.url if proof.image else None,
            'status': proof.status,
            'created_at': proof.created_at.isoformat()
        } for proof in proofs]


class ProofUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading pickup/dropoff proof."""

    class Meta:
        model = PickupProof
        fields = ['type', 'image', 'latitude', 'longitude', 'notes']

    def create(self, validated_data):
        """Create proof with automatic AI verification trigger."""
        validated_data['captured_by'] = self.context['request'].user
        validated_data['pickup'] = self.context['pickup']
        return super().create(validated_data)


class WorkerEarningsSerializer(serializers.ModelSerializer):
    """Serializer for worker earnings."""

    pickup_id = serializers.CharField(source='pickup_request.id', read_only=True)
    pickup_date = serializers.DateTimeField(source='pickup_request.completed_at', read_only=True)
    owner_name = serializers.CharField(source='pickup_request.owner.get_full_name', read_only=True)

    class Meta:
        model = WorkerEarnings
        fields = [
            'id', 'pickup_id', 'pickup_date', 'owner_name',
            'base_amount', 'bonus_amount', 'platform_fee', 'net_amount',
            'status', 'payout_method', 'payout_reference',
            'earned_at', 'paid_at'
        ]
        read_only_fields = ['id', 'net_amount', 'earned_at', 'paid_at']


class EarningsSummarySerializer(serializers.Serializer):
    """Serializer for earnings summary data."""

    total_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    paid_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    this_week_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    this_month_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_pickups = serializers.IntegerField()
    completed_today = serializers.IntegerField()
    average_per_pickup = serializers.DecimalField(max_digits=10, decimal_places=2)


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages."""

    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    is_own_message = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'message_id', 'message_type', 'content', 'image', 'sender_name',
            'is_own_message', 'is_read', 'created_at', 'client_message_id'
        ]
        read_only_fields = ['message_id', 'sender_name', 'is_own_message', 'created_at']

    def get_is_own_message(self, obj):
        """Check if message was sent by current user."""
        request = self.context.get('request')
        return request and obj.sender == request.user

    def create(self, validated_data):
        """Create message with sender from request."""
        validated_data['sender'] = self.context['request'].user
        validated_data['chat_room'] = self.context['chat_room']
        return super().create(validated_data)


class QuickReplySerializer(serializers.ModelSerializer):
    """Serializer for quick reply templates."""

    class Meta:
        model = QuickReply
        fields = ['id', 'text', 'category', 'usage_count']
        read_only_fields = ['id', 'usage_count']


class WorkerStatsSerializer(serializers.Serializer):
    """Serializer for worker dashboard stats."""

    # Performance metrics
    total_pickups = serializers.IntegerField()
    completed_today = serializers.IntegerField()
    completed_this_week = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    average_rating = serializers.FloatField()

    # Earnings
    total_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    today_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)

    # Status
    current_status = serializers.CharField()
    active_pickups = serializers.IntegerField()
    available_pickups_nearby = serializers.IntegerField()