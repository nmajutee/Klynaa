"""Payment models for Klynaa escrow system."""

from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal
import uuid

User = get_user_model()


class EscrowAccount(models.Model):
    """Escrow account to hold payments until service completion."""

    class AccountStatus(models.TextChoices):
        ACTIVE = 'active', 'Active'
        LOCKED = 'locked', 'Locked'
        CLOSED = 'closed', 'Closed'

    # Account identification
    account_id = models.UUIDField(default=uuid.uuid4, unique=True)
    pickup_request = models.OneToOneField('bins.PickupRequest', on_delete=models.CASCADE, related_name='escrow_account')

    # Parties
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='escrow_accounts_as_payer')
    payee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='escrow_accounts_as_payee')

    # Amount and status
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=AccountStatus.choices, default=AccountStatus.ACTIVE)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    locked_at = models.DateTimeField(null=True, blank=True)
    released_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['payer', 'status']),
        ]

    def __str__(self):
        return f"Escrow {self.account_id} - ${self.amount} ({self.get_status_display()})"


class PaymentTransaction(models.Model):
    """Individual payment transactions (deposits, releases, refunds)."""

    class TransactionType(models.TextChoices):
        DEPOSIT = 'deposit', 'Deposit to Escrow'
        RELEASE = 'release', 'Release from Escrow'
        REFUND = 'refund', 'Refund to Payer'
        FEE = 'fee', 'Platform Fee'

    class TransactionStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        CANCELLED = 'cancelled', 'Cancelled'

    class PaymentProvider(models.TextChoices):
        MTN_MONEY = 'mtn_money', 'MTN Mobile Money'
        ORANGE_MONEY = 'orange_money', 'Orange Money'
        STRIPE = 'stripe', 'Stripe'
        CASH = 'cash', 'Cash'
        WALLET = 'wallet', 'Klynaa Wallet'

    # Transaction identification
    transaction_id = models.UUIDField(default=uuid.uuid4, unique=True)
    escrow_account = models.ForeignKey(EscrowAccount, on_delete=models.CASCADE, related_name='transactions')

    # Transaction details
    transaction_type = models.CharField(max_length=20, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='XAF')  # Central African Franc

    # Payment provider details
    provider = models.CharField(max_length=20, choices=PaymentProvider.choices)
    provider_transaction_id = models.CharField(max_length=100, blank=True)
    provider_reference = models.CharField(max_length=100, blank=True)

    # Status and processing
    status = models.CharField(max_length=20, choices=TransactionStatus.choices, default=TransactionStatus.PENDING)

    # User and metadata
    initiated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_transactions')
    notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    # Webhook data
    webhook_data = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['provider', 'provider_transaction_id']),
            models.Index(fields=['transaction_type']),
        ]

    def __str__(self):
        return f"{self.get_transaction_type_display()} - ${self.amount} ({self.get_status_display()})"


class UserWallet(models.Model):
    """User wallet for holding funds."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    currency = models.CharField(max_length=3, default='XAF')

    # Security
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(balance__gte=0),
                name='positive_balance'
            ),
        ]

    def __str__(self):
        return f"{self.user.username} Wallet - ${self.balance}"


class WalletTransaction(models.Model):
    """Wallet transaction history."""

    class TransactionType(models.TextChoices):
        CREDIT = 'credit', 'Credit'
        DEBIT = 'debit', 'Debit'

    wallet = models.ForeignKey(UserWallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200)
    reference = models.CharField(max_length=100, blank=True)

    # Balance tracking
    balance_before = models.DecimalField(max_digits=10, decimal_places=2)
    balance_after = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['wallet', 'created_at']),
            models.Index(fields=['transaction_type']),
        ]

    def __str__(self):
        return f"{self.wallet.user.username} - {self.get_transaction_type_display()} ${self.amount}"
