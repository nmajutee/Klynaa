"""URLs for payments app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EscrowAccountViewSet, PaymentTransactionViewSet,
    UserWalletViewSet, WalletTransactionViewSet
)

router = DefaultRouter()
router.register(r'escrow-accounts', EscrowAccountViewSet, basename='escrow-account')
router.register(r'transactions', PaymentTransactionViewSet, basename='payment-transaction')
router.register(r'wallets', UserWalletViewSet, basename='user-wallet')
router.register(r'wallet-transactions', WalletTransactionViewSet, basename='wallet-transaction')

urlpatterns = [
    path('', include(router.urls)),
]
