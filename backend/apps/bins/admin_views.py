"""Admin dashboard views with real-time metrics."""

from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Count, Q, Avg
from datetime import timedelta
from apps.bins.models import Bin, PickupRequest, PickupProof
from apps.users.models import User
from apps.notifications.models import Notification
from apps.payments.models import PaymentTransaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


def is_admin(user):
    """Check if user is admin."""
    return user.is_authenticated and user.role == User.UserRole.ADMIN


@login_required
@user_passes_test(is_admin)
def admin_dashboard(request):
    """Main admin dashboard with overview metrics."""
    # Get current stats
    now = timezone.now()
    today = now.date()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    # Basic counts
    total_users = User.objects.count()
    total_bins = Bin.objects.count()
    active_pickups = PickupRequest.objects.filter(
        status__in=[PickupRequest.PickupStatus.OPEN, PickupRequest.PickupStatus.ASSIGNED, PickupRequest.PickupStatus.IN_PROGRESS]
    ).count()

    # Recent activity
    new_users_today = User.objects.filter(date_joined__date=today).count()
    pickups_today = PickupRequest.objects.filter(created_at__date=today).count()
    completed_today = PickupRequest.objects.filter(
        status=PickupRequest.PickupStatus.COMPLETED,
        updated_at__date=today
    ).count()

    # Weekly trends
    weekly_pickups = PickupRequest.objects.filter(created_at__gte=week_ago).count()
    weekly_revenue = PaymentTransaction.objects.filter(
        transaction_type=PaymentTransaction.TransactionType.DEPOSIT,
        status=PaymentTransaction.TransactionStatus.COMPLETED,
        created_at__gte=week_ago
    ).aggregate(total=Avg('amount'))['total'] or 0

    context = {
        'total_users': total_users,
        'total_bins': total_bins,
        'active_pickups': active_pickups,
        'new_users_today': new_users_today,
        'pickups_today': pickups_today,
        'completed_today': completed_today,
        'weekly_pickups': weekly_pickups,
        'weekly_revenue': round(float(weekly_revenue), 2),
        'pending_verifications': PickupProof.objects.filter(
            status=PickupProof.VerificationStatus.PENDING
        ).count(),
        'unread_notifications': Notification.objects.filter(
            read_at__isnull=True,
            created_at__gte=week_ago
        ).count()
    }

    return render(request, 'admin/dashboard.html', context)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_metrics_api(request):
    """API endpoint for admin dashboard metrics."""
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=403)

    now = timezone.now()
    today = now.date()
    week_ago = now - timedelta(days=7)

    # User metrics
    user_stats = {
        'total': User.objects.count(),
        'customers': User.objects.filter(role=User.UserRole.CUSTOMER).count(),
        'workers': User.objects.filter(role=User.UserRole.WORKER).count(),
        'active_today': User.objects.filter(last_login__date=today).count(),
        'new_this_week': User.objects.filter(date_joined__gte=week_ago).count()
    }

    # Bin metrics
    bin_stats = {
        'total': Bin.objects.count(),
        'full': Bin.objects.filter(status=Bin.BinStatus.FULL).count(),
        'empty': Bin.objects.filter(status=Bin.BinStatus.EMPTY).count(),
        'out_of_order': Bin.objects.filter(status=Bin.BinStatus.OUT_OF_ORDER).count(),
        'avg_fill_level': Bin.objects.aggregate(avg=Avg('fill_level'))['avg'] or 0
    }

    # Pickup metrics
    pickup_stats = {
        'total': PickupRequest.objects.count(),
        'open': PickupRequest.objects.filter(status=PickupRequest.PickupStatus.OPEN).count(),
        'in_progress': PickupRequest.objects.filter(status=PickupRequest.PickupStatus.IN_PROGRESS).count(),
        'completed_today': PickupRequest.objects.filter(
            status=PickupRequest.PickupStatus.COMPLETED,
            updated_at__date=today
        ).count(),
        'completion_rate': _calculate_completion_rate()
    }

    # Payment metrics
    payment_stats = {
        'total_transactions': PaymentTransaction.objects.count(),
        'completed_transactions': PaymentTransaction.objects.filter(
            status=PaymentTransaction.TransactionStatus.COMPLETED
        ).count(),
        'failed_transactions': PaymentTransaction.objects.filter(
            status=PaymentTransaction.TransactionStatus.FAILED
        ).count(),
        'daily_revenue': _calculate_daily_revenue(today),
        'weekly_revenue': _calculate_weekly_revenue(week_ago)
    }

    # System health
    system_health = {
        'pending_verifications': PickupProof.objects.filter(
            status=PickupProof.VerificationStatus.PENDING
        ).count(),
        'failed_notifications': Notification.objects.filter(
            status=Notification.Status.FAILED,
            created_at__gte=week_ago
        ).count(),
        'active_issues': 0  # Placeholder for issue tracking
    }

    return Response({
        'users': user_stats,
        'bins': bin_stats,
        'pickups': pickup_stats,
        'payments': payment_stats,
        'system': system_health,
        'last_updated': now.isoformat()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_recent_activity(request):
    """Get recent system activity for admin dashboard."""
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=403)

    limit = int(request.GET.get('limit', 50))

    # Recent pickups
    recent_pickups = PickupRequest.objects.select_related('owner', 'worker', 'bin').order_by('-created_at')[:limit]

    # Recent users
    recent_users = User.objects.order_by('-date_joined')[:limit]

    # Recent notifications
    recent_notifications = Notification.objects.select_related('recipient').order_by('-created_at')[:limit]

    # Pending verifications
    pending_verifications = PickupProof.objects.filter(
        status=PickupProof.VerificationStatus.PENDING
    ).select_related('pickup__owner', 'captured_by').order_by('-created_at')[:limit]

    return Response({
        'recent_pickups': [
            {
                'id': p.id,
                'customer': p.owner.username if p.owner else 'Anonymous',
                'worker': p.worker.username if p.worker else 'Unassigned',
                'status': p.status,
                'created_at': p.created_at,
                'price': float(p.price) if p.price else 0
            }
            for p in recent_pickups
        ],
        'recent_users': [
            {
                'id': u.id,
                'username': u.username,
                'role': u.role,
                'date_joined': u.date_joined,
                'is_active': u.is_active
            }
            for u in recent_users
        ],
        'recent_notifications': [
            {
                'id': n.notification_id,
                'recipient': n.recipient.username,
                'type': n.notification_type,
                'title': n.title,
                'status': n.status,
                'created_at': n.created_at
            }
            for n in recent_notifications
        ],
        'pending_verifications': [
            {
                'id': pv.id,
                'pickup_id': pv.pickup_id,
                'customer': pv.pickup.owner.username if pv.pickup.owner else 'Anonymous',
                'worker': pv.captured_by.username,
                'type': pv.type,
                'created_at': pv.created_at
            }
            for pv in pending_verifications
        ]
    })


def _calculate_completion_rate():
    """Calculate pickup completion rate."""
    total_pickups = PickupRequest.objects.count()
    if total_pickups == 0:
        return 0

    completed = PickupRequest.objects.filter(status=PickupRequest.PickupStatus.COMPLETED).count()
    return round((completed / total_pickups) * 100, 2)


def _calculate_daily_revenue(date):
    """Calculate revenue for a specific date."""
    revenue = PaymentTransaction.objects.filter(
        transaction_type=PaymentTransaction.TransactionType.DEPOSIT,
        status=PaymentTransaction.TransactionStatus.COMPLETED,
        created_at__date=date
    ).aggregate(total=Avg('amount'))['total']
    return round(float(revenue or 0), 2)


def _calculate_weekly_revenue(start_date):
    """Calculate revenue for the past week."""
    revenue = PaymentTransaction.objects.filter(
        transaction_type=PaymentTransaction.TransactionType.DEPOSIT,
        status=PaymentTransaction.TransactionStatus.COMPLETED,
        created_at__gte=start_date
    ).aggregate(total=Avg('amount'))['total']
    return round(float(revenue or 0), 2)
