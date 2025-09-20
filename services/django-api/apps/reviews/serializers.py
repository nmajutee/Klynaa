"""Serializers for Reviews and Disputes."""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Review, Dispute

User = get_user_model()


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model."""

    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)
    reviewed_user_name = serializers.CharField(source='reviewed_user.username', read_only=True)
    pickup_request_id = serializers.IntegerField(source='pickup_request.id', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'reviewer', 'reviewer_name', 'reviewed_user', 'reviewed_user_name',
            'pickup_request', 'pickup_request_id', 'rating', 'comment',
            'review_type', 'created_at'
        ]
        read_only_fields = ['id', 'reviewer', 'created_at']

    def validate(self, data):
        request = self.context['request']
        user = request.user
        pickup_request = data.get('pickup_request')

        # Ensure user is part of the pickup request
        if pickup_request.owner != user and pickup_request.worker != user:
            raise serializers.ValidationError("You can only review users from your pickup requests.")

        # Ensure pickup is completed
        if pickup_request.status != pickup_request.PickupStatus.COMPLETED:
            raise serializers.ValidationError("Can only review after pickup is completed.")

        # Set appropriate review type and reviewed user
        if user == pickup_request.owner:
            data['review_type'] = Review.ReviewType.CUSTOMER_TO_WORKER
            data['reviewed_user'] = pickup_request.worker
        else:
            data['review_type'] = Review.ReviewType.WORKER_TO_CUSTOMER
            data['reviewed_user'] = pickup_request.owner

        return data

    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)


class DisputeSerializer(serializers.ModelSerializer):
    """Serializer for Dispute model."""

    filed_by_name = serializers.CharField(source='filed_by.username', read_only=True)
    against_user_name = serializers.CharField(source='against_user.username', read_only=True)
    pickup_request_id = serializers.IntegerField(source='pickup_request.id', read_only=True)

    class Meta:
        model = Dispute
        fields = [
            'id', 'pickup_request', 'pickup_request_id', 'filed_by', 'filed_by_name',
            'against_user', 'against_user_name', 'dispute_type', 'description',
            'status', 'resolution', 'resolved_by', 'created_at', 'resolved_at'
        ]
        read_only_fields = [
            'id', 'filed_by', 'status', 'resolution', 'resolved_by',
            'created_at', 'resolved_at'
        ]

    def validate(self, data):
        request = self.context['request']
        user = request.user
        pickup_request = data.get('pickup_request')

        # Ensure user is part of the pickup request
        if pickup_request.owner != user and pickup_request.worker != user:
            raise serializers.ValidationError("You can only dispute your own pickup requests.")

        # Set against_user
        if user == pickup_request.owner:
            data['against_user'] = pickup_request.worker
        else:
            data['against_user'] = pickup_request.owner

        return data

    def create(self, validated_data):
        validated_data['filed_by'] = self.context['request'].user
        return super().create(validated_data)
