"""
Dashboard API views for aggregated worker dashboard data.
Provides KPIs, charts, and widget data for the comprehensive dashboard.
"""

from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.contrib.auth import get_user_model
from apps.bins.models import PickupRequest
from apps.reviews.models import Review
from apps.payments.models import PaymentTransaction, WorkerEarnings

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_overview(request):
    """
    Comprehensive dashboard overview endpoint.
    Returns KPIs, charts, and widget data for worker dashboard.

    Query params:
    - start: YYYY-MM-DD start date
    - end: YYYY-MM-DD end date
    - tz: timezone (default UTC)
    """
    user = request.user
    if user.role != 'worker':
        return Response({'error': 'Access denied. Worker role required.'}, status=403)

    # Parse date range
    start_date = request.GET.get('start')
    end_date = request.GET.get('end')

    if start_date and end_date:
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_dt = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
    else:
        # Default to last 30 days
        end_dt = timezone.now().date()
        start_dt = end_dt - timedelta(days=30)

    # Build response data
    data = {
        'kpis': get_kpis(user, start_dt, end_dt),
        'charts': get_charts_data(user, start_dt, end_dt),
        'donut': get_carbon_analysis(user, start_dt, end_dt),
        'scorecard': get_scorecard_data(user, start_dt, end_dt),
        'reviews': get_reviews_data(user),
        'lastUpdated': timezone.now().isoformat()
    }

    return Response(data)

def get_kpis(user, start_date, end_date):
    """Calculate KPI metrics for the worker."""

    # Total earnings
    earnings = WorkerEarnings.objects.filter(
        worker=user,
        earned_at__date__range=[start_date, end_date]
    ).aggregate(total=Sum('net_amount'))['total'] or 0

    # Previous period for trend calculation
    period_days = (end_date - start_date).days
    prev_start = start_date - timedelta(days=period_days)
    prev_end = start_date - timedelta(days=1)

    prev_earnings = WorkerEarnings.objects.filter(
        worker=user,
        earned_at__date__range=[prev_start, prev_end]
    ).aggregate(total=Sum('net_amount'))['total'] or 0

    earnings_trend = 0
    if prev_earnings > 0:
        earnings_trend = ((earnings - prev_earnings) / prev_earnings) * 100

    # Pickups data
    pending_pickups = PickupRequest.objects.filter(
        worker=user,
        status__in=['assigned', 'in_progress']
    ).count()

    completed_pickups = PickupRequest.objects.filter(
        worker=user,
        status='completed',
        completed_at__date__range=[start_date, end_date]
    ).count()

    # Weekly goal calculation (assume 10 pickups per week)
    weekly_goal = 10
    weeks_in_period = max(1, (end_date - start_date).days / 7)
    expected_pickups = int(weekly_goal * weeks_in_period)
    goal_percent = (completed_pickups / expected_pickups * 100) if expected_pickups > 0 else 0

    # Average rating
    rating_data = Review.objects.filter(
        reviewed_user=user
    ).aggregate(
        avg_rating=Avg('rating'),
        count=Count('id')
    )

    return {
        'totalEarnings': {
            'value': float(earnings),
            'currency': 'XAF',
            'trendPercent': round(earnings_trend, 1),
            'periodLabel': f'{start_date} to {end_date}'
        },
        'pendingPickups': {
            'count': pending_pickups,
            'nearby': pending_pickups,  # Simplified for now
            'scheduled': 0
        },
        'completedPickups': {
            'count': completed_pickups,
            'weeklyGoalPercent': min(100, round(goal_percent))
        },
        'averageRating': {
            'value': round(rating_data['avg_rating'] or 0, 1),
            'reviewsCount': rating_data['count'] or 0
        }
    }

def get_charts_data(user, start_date, end_date):
    """Generate chart data for trending and rating agencies."""

    # Generate daily data points for the period
    current_date = start_date
    labels = []
    environmental_points = []
    social_points = []
    governance_points = []

    while current_date <= end_date:
        labels.append(current_date.strftime('%Y-%m-%d'))

        # Mock ESG data based on actual pickups (simplified)
        daily_pickups = PickupRequest.objects.filter(
            worker=user,
            completed_at__date=current_date
        ).count()

        # Convert pickup count to ESG scores (mock calculation)
        env_score = min(100, 60 + (daily_pickups * 5))
        social_score = min(100, 50 + (daily_pickups * 7))
        gov_score = min(100, 40 + (daily_pickups * 3))

        environmental_points.append(env_score)
        social_points.append(social_score)
        governance_points.append(gov_score)

        current_date += timedelta(days=1)

    trending_chart = {
        'labels': labels,
        'series': [
            {
                'key': 'environmental',
                'label': 'Environmental',
                'points': environmental_points,
                'color': '#16A34A'
            },
            {
                'key': 'social',
                'label': 'Social',
                'points': social_points,
                'color': '#1E88E5'
            },
            {
                'key': 'governance',
                'label': 'Governance',
                'points': governance_points,
                'color': '#7C3AED'
            }
        ]
    }

    # Rating agencies mock data
    rating_agencies = {
        'labels': ['Performance', 'Reliability', 'Customer Service'],
        'series': [
            {
                'label': 'Excellent',
                'values': [30, 25, 35],
                'color': '#10B981'
            },
            {
                'label': 'Good',
                'values': [20, 30, 25],
                'color': '#F59E0B'
            },
            {
                'label': 'Average',
                'values': [10, 15, 10],
                'color': '#EF4444'
            }
        ]
    }

    return {
        'trending': trending_chart,
        'ratingAgencies': rating_agencies
    }

def get_carbon_analysis(user, start_date, end_date):
    """Generate carbon emission analysis data."""

    # Mock categories based on pickup types
    total_pickups = PickupRequest.objects.filter(
        worker=user,
        completed_at__date__range=[start_date, end_date]
    ).count()

    # Distribute across categories (mock data)
    categories = [
        {'label': 'Household Waste', 'value': int(total_pickups * 0.6), 'color': '#16A34A'},
        {'label': 'Recyclables', 'value': int(total_pickups * 0.3), 'color': '#1E88E5'},
        {'label': 'Organic Waste', 'value': int(total_pickups * 0.1), 'color': '#F59E0B'}
    ]

    return {'categories': categories}

def get_scorecard_data(user, start_date, end_date):
    """Generate scorecard table data for recent pickups."""

    pickups = PickupRequest.objects.filter(
        worker=user,
        completed_at__date__range=[start_date, end_date]
    ).select_related('owner', 'bin').order_by('-completed_at')[:10]

    rows = []
    for pickup in pickups:
        # Mock scorecard calculation
        sentiment = round(pickup.owner.rating_average * 20 - 50, 1) if pickup.owner.rating_average else 0
        mentions = pickup.id * 42  # Mock mentions
        impact_score = sentiment * 10 + (100 if pickup.status == 'completed' else -50)

        rows.append({
            'id': str(pickup.id),
            'company': f'{pickup.owner.first_name} {pickup.owner.last_name}',
            'sentiment': sentiment,
            'mentions': mentions,
            'impactScore': round(impact_score, 1)
        })

    return {
        'total': len(rows),
        'page': 1,
        'pageSize': 10,
        'rows': rows
    }

def get_reviews_data(user):
    """Get reviews distribution and recent reviews."""

    reviews = Review.objects.filter(reviewed_user=user).order_by('-created_at')

    # Distribution by rating (1-5 stars)
    distribution = [0, 0, 0, 0, 0]  # [5-star, 4-star, 3-star, 2-star, 1-star]
    for review in reviews:
        rating_idx = int(review.rating) - 1
        if 0 <= rating_idx < 5:
            distribution[4 - rating_idx] += 1  # Reverse order for display

    # Recent reviews
    recent = []
    for review in reviews[:5]:
        recent.append({
            'id': str(review.id),
            'name': f'{review.reviewer.first_name} {review.reviewer.last_name}',
            'rating': review.rating,
            'text': review.comment[:100] + '...' if len(review.comment) > 100 else review.comment,
            'date': review.created_at.strftime('%Y-%m-%d'),
            'tags': ['Professional', 'On Time'] if review.rating >= 4 else ['Needs Improvement']
        })

    return {
        'distribution': distribution,
        'recent': recent
    }