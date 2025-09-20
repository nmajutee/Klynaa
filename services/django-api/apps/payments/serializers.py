"""Serializers for Payment models."""

from decimal import Decimal
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import EscrowAccount, PaymentTransaction, UserWallet, WalletTransaction

User = get_user_model()


class EscrowAccountSerializer(serializers.ModelSerializer):
    """Serializer for EscrowAccount model."""

    payer_name = serializers.CharField(source='payer.username', read_only=True)
    payee_name = serializers.CharField(source='payee.username', read_only=True)
    pickup_request_id = serializers.IntegerField(source='pickup_request.id', read_only=True)

    class Meta:
        model = EscrowAccount
        fields = [
            'id', 'account_id', 'pickup_request', 'pickup_request_id',
            'payer', 'payer_name', 'payee', 'payee_name',
            'amount', 'status', 'created_at', 'locked_at', 'released_at'
        ]
        read_only_fields = [
            'id', 'account_id', 'payer', 'payee', 'status',
            'created_at', 'locked_at', 'released_at'
        ]


class PaymentTransactionSerializer(serializers.ModelSerializer):
    """Serializer for PaymentTransaction model."""

    escrow_account_id = serializers.UUIDField(source='escrow_account.account_id', read_only=True)
    initiated_by_name = serializers.CharField(source='initiated_by.username', read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'transaction_id', 'escrow_account', 'escrow_account_id',
            'transaction_type', 'amount', 'currency', 'provider',
            'provider_transaction_id', 'provider_reference', 'status',
            'initiated_by', 'initiated_by_name', 'notes',
            'created_at', 'processed_at'
        ]
        read_only_fields = [
            'id', 'transaction_id', 'initiated_by', 'status',
            'processed_at', 'created_at'
        ]


class UserWalletSerializer(serializers.ModelSerializer):
    """Serializer for UserWallet model."""

    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserWallet
        fields = [
            'id', 'user', 'user_name', 'balance', 'currency',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'balance', 'created_at', 'updated_at'
        ]


class WalletTransactionSerializer(serializers.ModelSerializer):
    """Serializer for WalletTransaction model."""

    wallet_user = serializers.CharField(source='wallet.user.username', read_only=True)

    class Meta:
        model = WalletTransaction
        fields = [
            'id', 'wallet', 'wallet_user', 'transaction_type',
            'amount', 'description', 'reference',
            'balance_before', 'balance_after', 'created_at'
        ]
        read_only_fields = [
            'id', 'balance_before', 'balance_after', 'created_at'
        ]


class InitiatePaymentSerializer(serializers.Serializer):
    """Serializer for initiating payments."""

    pickup_request_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=PaymentTransaction.PaymentProvider.choices)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))

    def validate_pickup_request_id(self, value):
        from apps.bins.models import PickupRequest
        try:
            pickup_request = PickupRequest.objects.get(id=value)
            if pickup_request.payment_status != PickupRequest.PaymentStatus.PENDING:
                raise serializers.ValidationError("Payment already processed for this request.")
            return value
        except PickupRequest.DoesNotExist:
            raise serializers.ValidationError("Pickup request not found.")


class ProcessPaymentSerializer(serializers.Serializer):
    """Serializer for processing payment webhooks."""

    transaction_id = serializers.UUIDField()
    provider_transaction_id = serializers.CharField(max_length=100)
    status = serializers.ChoiceField(choices=PaymentTransaction.TransactionStatus.choices)
    provider_data = serializers.JSONField(required=False)
