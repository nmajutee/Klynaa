"""URL patterns for Worker Dashboard API."""

from django.urls import path
from .worker_views import (
    WorkerDashboardStatsView, WorkerStatusToggleView, AvailablePickupsView,
    PickupAcceptView, PickupDeclineView, PickupCollectView, PickupDropoffView,
    WorkerEarningsView, WorkerPayoutRequestView, ChatMessageView, QuickRepliesView
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

    # Earnings and transactions
    path('workers/<int:worker_id>/transactions/', WorkerEarningsView.as_view(), name='worker_earnings'),
    path('workers/<int:worker_id>/payout-request/', WorkerPayoutRequestView.as_view(), name='worker_payout_request'),

    # Chat
    path('chat/<uuid:task_id>/message/', ChatMessageView.as_view(), name='chat_messages'),

    # Quick replies
    path('quick-replies/', QuickRepliesView.as_view(), name='quick_replies'),
]