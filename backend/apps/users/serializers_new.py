"""Serializers for User model."""

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with role-based fields."""

    is_worker = serializers.ReadOnlyField()
    is_customer = serializers.ReadOnlyField()
    is_admin_user = serializers.ReadOnlyField()
    can_accept_pickups = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'latitude', 'longitude', 'rating_average', 'rating_count',
            'wallet_balance', 'is_available', 'pending_pickups_count', 'service_radius_km',
            'is_worker', 'is_customer', 'is_admin_user', 'can_accept_pickups',
            'date_joined', 'last_login'
        ]
        read_only_fields = [
            'id', 'date_joined', 'last_login', 'rating_average', 'rating_count',
            'wallet_balance', 'pending_pickups_count'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile updates."""

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'latitude', 'longitude'
        ]


class WorkerProfileSerializer(serializers.ModelSerializer):
    """Serializer for worker-specific profile updates."""

    class Meta:
        model = User
        fields = [
            'is_available', 'service_radius_km'
        ]

    def validate(self, data):
        if not self.instance.is_worker:
            raise serializers.ValidationError("Only workers can update these fields.")
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'latitude', 'longitude'
        ]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
