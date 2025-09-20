from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MeView, RegisterView, CustomTokenObtainPairView
from .dashboard_views import dashboard_overview
from .dashboard_simple import dashboard_overview_simple
from .worker_views import (
    WorkerDashboardStatsView,
    WorkerStatusToggleView,
    AvailablePickupsView,
    PickupAcceptView,
    PickupDeclineView,
    PickupCollectView,
    PickupDropoffView,
    WorkerEarningsView,
    WorkerPayoutRequestView,
    ChatMessageView
)
from .enhanced_worker_views import (
    WorkerDashboardViewSet,
    PickupActionViewSet,
    WorkerEarningsView as EnhancedWorkerEarningsView,
    WorkerChatView,
    get_quick_replies
)
from .customer_views import (
    CustomerDashboardViewSet,
    CustomerPickupViewSet,
    CustomerBinViewSet,
    CustomerProfileViewSet
)

# API routers
customer_router = DefaultRouter()
customer_router.register(r'dashboard', CustomerDashboardViewSet, basename='customer-dashboard')
customer_router.register(r'pickups', CustomerPickupViewSet, basename='customer-pickups')
customer_router.register(r'bins', CustomerBinViewSet, basename='customer-bins')
customer_router.register(r'profile', CustomerProfileViewSet, basename='customer-profile')

# Enhanced Worker API router
worker_router = DefaultRouter()
worker_router.register(r'dashboard', WorkerDashboardViewSet, basename='worker-dashboard')
worker_router.register(r'pickups', PickupActionViewSet, basename='worker-pickup-actions')

urlpatterns = [
    # Authentication endpoints
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),

    # Enhanced Worker API endpoints (NEW - matches specification)
    path("worker/", include(worker_router.urls)),
    path("worker/earnings/", EnhancedWorkerEarningsView.as_view(), name="enhanced-worker-earnings"),
    path("worker/chat/<int:room_id>/", WorkerChatView.as_view(), name="enhanced-worker-chat"),
    path("worker/quick-replies/", get_quick_replies, name="worker-quick-replies"),

    # Legacy Worker API endpoints (KEEP for compatibility)
    path("worker/dashboard/", WorkerDashboardStatsView.as_view(), name="worker-dashboard"),
    path("worker/status/", WorkerStatusToggleView.as_view(), name="worker-status"),
    path("worker/pickups/available/", AvailablePickupsView.as_view(), name="worker-available-pickups"),
    path("worker/pickups/<int:pickup_id>/accept/", PickupAcceptView.as_view(), name="worker-accept-pickup"),
    path("worker/pickups/<int:pickup_id>/decline/", PickupDeclineView.as_view(), name="worker-decline-pickup"),
    path("worker/pickups/<int:pickup_id>/collect/", PickupCollectView.as_view(), name="worker-collect-pickup"),
    path("worker/pickups/<int:pickup_id>/dropoff/", PickupDropoffView.as_view(), name="worker-dropoff-pickup"),
    path("worker/earnings/", WorkerEarningsView.as_view(), name="worker-earnings"),
    path("worker/payout/<int:worker_id>/", WorkerPayoutRequestView.as_view(), name="worker-payout"),
    path("worker/chat/<int:room_id>/", ChatMessageView.as_view(), name="worker-chat"),

    # Dashboard API endpoints
    path("dashboard/overview/", dashboard_overview, name="dashboard-overview"),
    path("dashboard/simple/", dashboard_overview_simple, name="dashboard-simple"),

    # Customer API endpoints
    path("customer/", include(customer_router.urls)),
]