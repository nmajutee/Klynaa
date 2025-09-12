from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MeView, RegisterView, CustomTokenObtainPairView
from .worker_views import (
    WorkerDashboardViewSet,
    PickupManagementViewSet,
    ChatViewSet,
    EarningsViewSet,
    WorkerStatusView
)
from .customer_views import (
    CustomerDashboardViewSet,
    CustomerPickupViewSet,
    CustomerBinViewSet,
    CustomerProfileViewSet
)

# Worker API router
worker_router = DefaultRouter()
worker_router.register(r'dashboard', WorkerDashboardViewSet, basename='worker-dashboard')
worker_router.register(r'pickups', PickupManagementViewSet, basename='worker-pickups')
worker_router.register(r'chat', ChatViewSet, basename='worker-chat')
worker_router.register(r'earnings', EarningsViewSet, basename='worker-earnings')

# Customer API router
customer_router = DefaultRouter()
customer_router.register(r'dashboard', CustomerDashboardViewSet, basename='customer-dashboard')
customer_router.register(r'pickups', CustomerPickupViewSet, basename='customer-pickups')
customer_router.register(r'bins', CustomerBinViewSet, basename='customer-bins')
customer_router.register(r'profile', CustomerProfileViewSet, basename='customer-profile')

urlpatterns = [
    # Authentication endpoints
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),

    # Worker API endpoints
    path("worker/", include(worker_router.urls)),
    path("worker/status/", WorkerStatusView.as_view(), name="worker-status"),

    # Customer API endpoints
    path("customer/", include(customer_router.urls)),
]
