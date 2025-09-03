from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CustomerProfile, WorkerProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer for all user types."""

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone_number', 'is_profile_complete',
            'date_joined', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date_joined', 'created_at', 'updated_at']


class CustomerProfileSerializer(serializers.ModelSerializer):
    """Serializer for customer profile information."""

    class Meta:
        model = CustomerProfile
        fields = [
            'address', 'city', 'postal_code', 'subscription_plan',
            'is_payment_verified', 'preferred_pickup_time',
            'token_balance', 'wallet_address', 'created_at', 'updated_at'
        ]
        read_only_fields = ['token_balance', 'is_payment_verified', 'created_at', 'updated_at']


class WorkerProfileSerializer(serializers.ModelSerializer):
    """Serializer for worker profile information."""

    class Meta:
        model = WorkerProfile
        fields = [
            'employee_id', 'assigned_zone', 'vehicle_type', 'vehicle_registration',
            'is_on_duty', 'shift_start', 'shift_end', 'total_pickups', 'rating',
            'emergency_contact_name', 'emergency_contact_phone', 'created_at', 'updated_at'
        ]
        read_only_fields = ['total_pickups', 'rating', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Registration serializer with role-based profile creation."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'user_type', 'phone_number'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)

        # Create appropriate profile based on user type
        if user.user_type == User.UserType.CUSTOMER:
            CustomerProfile.objects.create(user=user)
        elif user.user_type == User.UserType.WORKER:
            # Worker profiles require admin approval, so we create basic profile
            WorkerProfile.objects.create(
                user=user,
                employee_id=f"W{user.id:05d}"  # Auto-generate employee ID
            )

        return user


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user serializer with nested profile data."""

    customer_profile = CustomerProfileSerializer(read_only=True)
    worker_profile = WorkerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone_number', 'is_profile_complete',
            'date_joined', 'created_at', 'updated_at',
            'customer_profile', 'worker_profile'
        ]
        read_only_fields = ['id', 'date_joined', 'created_at', 'updated_at']
        fields = ["id", "username", "email", "first_name", "last_name"]
