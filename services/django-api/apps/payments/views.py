"""Views for Payment models."""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import transaction, models
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import EscrowAccount, PaymentTransaction, UserWallet, WalletTransaction
from .serializers import (
    EscrowAccountSerializer, PaymentTransactionSerializer,
    UserWalletSerializer, WalletTransactionSerializer,
    InitiatePaymentSerializer, ProcessPaymentSerializer
)

User = get_user_model()


class EscrowAccountViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for EscrowAccount model (read-only)."""

    serializer_class = EscrowAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        base_qs = EscrowAccount.objects.select_related('pickup_request', 'payer', 'payee')
        if getattr(user, 'is_admin_user', False):
            return base_qs
        else:
            return base_qs.filter(
                models.Q(payer=user) | models.Q(payee=user)
            )


class PaymentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for PaymentTransaction model (read-only)."""

    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    ordering_fields = ['created_at', 'processed_at', 'amount']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        base_qs = PaymentTransaction.objects.select_related('escrow_account', 'initiated_by')
        if getattr(user, 'is_admin_user', False):
            return base_qs
        else:
            return base_qs.filter(initiated_by=user)

    @action(detail=False, methods=['post'])
    def initiate_payment(self, request):
        """Initiate a new payment."""
        serializer = InitiatePaymentSerializer(data=request.data)
        if serializer.is_valid():
            # Logic to initiate payment with provider
            # This would integrate with MTN Money, Orange Money, or Stripe
            return Response({'message': 'Payment initiated successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def webhook(self, request):
        """Handle payment provider webhooks."""
        serializer = ProcessPaymentSerializer(data=request.data)
        if serializer.is_valid():
            # Process webhook from payment provider
            # Update transaction status based on provider response
            return Response({'message': 'Webhook processed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserWalletViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for UserWallet model (read-only)."""

    serializer_class = UserWalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = UserWallet.objects.select_related('user')
        if getattr(user, 'is_admin_user', False):
            return base_qs
        else:
            return base_qs.filter(user=user)

    @action(detail=True, methods=['get'])
    def balance(self, request, pk=None):
        """Get wallet balance."""
        wallet = self.get_object()
        return Response({'balance': wallet.balance, 'currency': wallet.currency})

    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Get wallet transaction history."""
        wallet = self.get_object()
        transactions = wallet.transactions.all()[:50]  # Last 50 transactions
        serializer = WalletTransactionSerializer(transactions, many=True)
        return Response(serializer.data)


class WalletTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for WalletTransaction model (read-only)."""

    serializer_class = WalletTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['description', 'reference']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        base_qs = WalletTransaction.objects.select_related('wallet', 'wallet__user')
        if getattr(user, 'is_admin_user', False):
            return base_qs
        else:
            return base_qs.filter(wallet__user=user)
