"""Serializers for Bins and PickupRequest models."""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from decimal import Decimal
from .models import Bin, PickupRequest

User = get_user_model()


class BinSerializer(serializers.ModelSerializer):
    """Serializer for Bin model."""

    owner = serializers.StringRelatedField(read_only=True)
    needs_pickup = serializers.ReadOnlyField()

    class Meta:
        model = Bin
        fields = [
            'id', 'bin_id', 'label', 'owner',
            'latitude', 'longitude', 'address',
            'status', 'fill_level', 'capacity_liters',
            'needs_pickup', 'created_at', 'updated_at', 'last_pickup'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']


class BinStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating bin status and fill level."""

    class Meta:
        model = Bin
        fields = ['status', 'fill_level']


class PickupRequestSerializer(serializers.ModelSerializer):
    """Serializer for PickupRequest model."""

    bin_details = BinSerializer(source='bin', read_only=True)
    owner_details = serializers.StringRelatedField(source='owner', read_only=True)
    worker_details = serializers.StringRelatedField(source='worker', read_only=True)
    can_be_accepted = serializers.ReadOnlyField()
    can_be_delivered = serializers.ReadOnlyField()

    class Meta:
        model = PickupRequest
        fields = [
            'id', 'bin', 'bin_details', 'owner', 'owner_details',
            'worker', 'worker_details', 'status',
            'created_at', 'accepted_at', 'picked_at', 'completed_at',
            'expected_fee', 'actual_fee', 'payment_method', 'payment_status',
            'notes', 'cancellation_reason',
            'can_be_accepted', 'can_be_delivered'
        ]
        read_only_fields = [
            'id', 'owner', 'created_at', 'accepted_at', 'picked_at',
            'completed_at', 'actual_fee'
        ]


class AcceptPickupSerializer(serializers.Serializer):
    """Serializer for accepting pickup requests."""

    def validate(self, data):
        request = self.context['request']
        user = request.user
        pickup_request = self.instance

        if not user.is_worker:
            raise serializers.ValidationError("Only workers can accept pickup requests.")

        if not user.can_accept_pickups:
            raise serializers.ValidationError("Worker cannot accept more pickups.")

        if not pickup_request.can_be_accepted:
            raise serializers.ValidationError("This pickup request cannot be accepted.")

        return data


class UpdatePickupStatusSerializer(serializers.ModelSerializer):
    """Serializer for updating pickup status."""

    class Meta:
        model = PickupRequest
        fields = ['status']

    def validate_status(self, value):
        instance = self.instance
        current_status = instance.status

        # Define valid status transitions
        valid_transitions = {
            PickupRequest.PickupStatus.OPEN: [PickupRequest.PickupStatus.ACCEPTED, PickupRequest.PickupStatus.CANCELLED],
            PickupRequest.PickupStatus.ACCEPTED: [PickupRequest.PickupStatus.IN_PROGRESS, PickupRequest.PickupStatus.CANCELLED],
            PickupRequest.PickupStatus.IN_PROGRESS: [PickupRequest.PickupStatus.DELIVERED, PickupRequest.PickupStatus.CANCELLED],
            PickupRequest.PickupStatus.DELIVERED: [PickupRequest.PickupStatus.COMPLETED, PickupRequest.PickupStatus.DISPUTED],
            PickupRequest.PickupStatus.COMPLETED: [],  # Final state
            PickupRequest.PickupStatus.CANCELLED: [],  # Final state
            PickupRequest.PickupStatus.DISPUTED: [PickupRequest.PickupStatus.COMPLETED, PickupRequest.PickupStatus.CANCELLED],
        }

        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot transition from {current_status} to {value}"
            )

        return value
