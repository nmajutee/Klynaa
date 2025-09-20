"""URL patterns for Worker Dashboard API."""

from django.urls import path
from .worker_views import (
    WorkerDashboardStatsView, WorkerStatusToggleView, AvailablePickupsView,
    PickupAcceptView, PickupDeclineView, PickupCollectView, PickupDropoffView,
    WorkerEarningsView, WorkerPayoutRequestView, ChatMessageView, QuickRepliesView
)
from .enhanced_worker_views import (
    OptimizedPickupsView, RouteOptimizationView, batch_accept_optimized_route,
    PickupSchedulingView, BatchSchedulingView, WorkerScheduleView,
    RouteReoptimizationView, SchedulingAnalyticsView
)

# Worker Dashboard API URLs (matches specification)
urlpatterns = [
    # Worker profile and stats
    path('workers/me/', WorkerDashboardStatsView.as_view(), name='worker_dashboard_stats'),
    path('workers/me/status/', WorkerStatusToggleView.as_view(), name='worker_status_toggle'),

    # Pickup management
    path('pickups/', AvailablePickupsView.as_view(), name='available_pickups'),
    path('pickups/<uuid:pickup_id>/accept/', PickupAcceptView.as_view(), name='pickup_accept'),
    path('pickups/<uuid:pickup_id>/decline/', PickupDeclineView.as_view(), name='pickup_decline'),
    path('pickups/<uuid:pickup_id>/collect/', PickupCollectView.as_view(), name='pickup_collect'),
    path('pickups/<uuid:pickup_id>/dropoff/', PickupDropoffView.as_view(), name='pickup_dropoff'),

    # Route optimization endpoints
    path('workers/optimized-pickups/', OptimizedPickupsView.as_view(), name='optimized_pickups'),
    path('workers/optimize-route/', RouteOptimizationView.as_view(), name='optimize_route'),
    path('workers/batch-accept-route/', batch_accept_optimized_route, name='batch_accept_route'),

    # Pickup scheduling endpoints
    path('workers/auto-assign-pickup/', PickupSchedulingView.as_view(), name='auto_assign_pickup'),
    path('workers/batch-schedule/', BatchSchedulingView.as_view(), name='batch_schedule'),
    path('workers/<int:worker_id>/schedule/', WorkerScheduleView.as_view(), name='worker_schedule'),
    path('workers/schedule/', WorkerScheduleView.as_view(), name='my_schedule'),
    path('workers/reoptimize-route/', RouteReoptimizationView.as_view(), name='reoptimize_route'),
    path('workers/scheduling-analytics/', SchedulingAnalyticsView.as_view(), name='scheduling_analytics'),

    # Earnings and transactions
    path('workers/<int:worker_id>/transactions/', WorkerEarningsView.as_view(), name='worker_earnings'),
    path('workers/<int:worker_id>/payout-request/', WorkerPayoutRequestView.as_view(), name='worker_payout_request'),

    # Chat
    path('chat/<uuid:task_id>/message/', ChatMessageView.as_view(), name='chat_messages'),

    # Quick replies
    path('quick-replies/', QuickRepliesView.as_view(), name='quick_replies'),
]