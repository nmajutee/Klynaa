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
            'role', 'phone_number', 'is_verified', 'latitude', 'longitude',
            'rating_average', 'rating_count', 'wallet_balance', 'is_available',
            'pending_pickups_count', 'service_radius_km', 'is_worker', 'is_customer',
            'is_admin_user', 'can_accept_pickups', 'date_joined', 'last_login'
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


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with username and email fields."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number', 'role',
            'latitude', 'longitude'
        ]

    def validate(self, data):
        """Validate password confirmation and unique fields."""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Password confirmation does not match.'
            })
        return data

    def validate_email(self, value):
        """Check if email is unique."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        """Check if username is unique."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        """Create new user with hashed password."""
        # Remove password_confirm as it's not needed for user creation
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            **validated_data
        )
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



