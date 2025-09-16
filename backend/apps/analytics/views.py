from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import datetime, timedelta
import json
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Avg, Sum
from apps.users.models import User
from apps.reviews.models import Review
# Note: Using mock data for pickups since the model doesn't exist yet


@method_decorator(csrf_exempt, name='dispatch')
class DashboardOverviewView(View):
    """
    Worker-specific dashboard endpoint providing personal performance data
    GET /api/analytics/overview?worker_id=123&start=YYYY-MM-DD&end=YYYY-MM-DD&tz=UTC+1
    """
    
    def get(self, request):
        # Get worker ID from request (in real app, this would come from authentication)
        worker_id = request.GET.get('worker_id', 1)  # Default to worker 1 for demo
        
        # Parse date range parameters
        start_date = request.GET.get('start')
        end_date = request.GET.get('end')
        timezone_str = request.GET.get('tz', 'UTC')
        
        # Default to last 30 days if no dates provided
        if not start_date or not end_date:
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=30)
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Get worker-specific aggregated data
        kpis_data = self._get_worker_kpis_data(worker_id, start_date, end_date)
        charts_data = self._get_worker_charts_data(worker_id, start_date, end_date)
        donut_data = self._get_worker_donut_data(worker_id, start_date, end_date)
        scorecard_data = self._get_worker_scorecard_data(worker_id)
        reviews_data = self._get_worker_reviews_data(worker_id)
        
        response_data = {
            "kpis": kpis_data,
            "charts": charts_data,
            "donut": donut_data,
            "scorecard": scorecard_data,
            "reviews": reviews_data,
            "lastUpdated": timezone.now().isoformat()
        }
        
        return JsonResponse(response_data)
    
    def _get_worker_kpis_data(self, worker_id, start_date, end_date):
        """Calculate worker-specific KPI metrics for the dashboard"""
        
        # Mock worker earnings data - replace with actual DB queries from pickups
        # In real implementation: Pickup.objects.filter(worker_id=worker_id, date__range=[start_date, end_date]).aggregate(Sum('earnings'))
        total_earnings = 24500  # This month's earnings for worker
        last_month_earnings = 42800  # Last month for trend calculation
        trend_percent = ((total_earnings - last_month_earnings) / last_month_earnings) * 100 if last_month_earnings else 0
        
        # Mock worker pickup stats (replace when Pickup model exists)
        pending_pickups = 3  # Worker's pending assignments
        completed_pickups = 15  # Worker's completed pickups this period
        weekly_goal = 20  # Worker's weekly pickup goal
        weekly_completion_percent = (completed_pickups / weekly_goal) * 100 if weekly_goal else 0
        
        # Get worker's average rating from actual Review model
        try:
            # In real implementation: reviews for pickups assigned to this worker
            worker_reviews = Review.objects.filter(
                created_at__date__range=[start_date, end_date]
            )
            avg_rating = worker_reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
            reviews_count = worker_reviews.count()
        except:
            # Fallback to mock data if Review model has issues
            avg_rating = 4.8  # Worker's personal rating
            reviews_count = 12
        
        return {
            "totalEarnings": {
                "value": total_earnings,
                "currency": "XAF",
                "trendPercent": round(trend_percent, 1),
                "periodLabel": "This month"
            },
            "pendingPickups": {
                "count": pending_pickups,
                "nearby": max(0, pending_pickups - 1),  # Pickups near worker location
                "scheduled": min(1, pending_pickups)    # Scheduled pickups
            },
            "completedPickups": {
                "count": completed_pickups,
                "weeklyGoalPercent": min(100, weekly_completion_percent)  # Progress toward weekly goal
            },
            "averageRating": {
                "value": round(float(avg_rating), 1) if avg_rating else 4.8,
                "reviewsCount": reviews_count if 'reviews_count' in locals() else 12
            }
        }
    
    def _get_worker_charts_data(self, worker_id, start_date, end_date):
        """Generate worker-specific chart data for performance trending and pickup types"""
        
        date_labels = []
        current_date = start_date
        while current_date <= end_date:
            date_labels.append(current_date.strftime('%Y-%m-%d'))
            current_date += timedelta(days=1)
        
        # Mock worker performance trending data - replace with actual worker pickup/earnings data
        trending_data = {
            "labels": date_labels[-7:],  # Last 7 days
            "series": [
                {
                    "key": "pickups",
                    "label": "Daily Pickups",
                    "points": [3, 5, 4, 2, 6, 4, 5]  # Worker's daily pickup counts
                },
                {
                    "key": "earnings",
                    "label": "Daily Earnings (XAF)", 
                    "points": [1500, 2500, 2000, 1000, 3000, 2000, 2500]  # Scaled down for chart
                },
                {
                    "key": "efficiency",
                    "label": "Efficiency Score",
                    "points": [85, 92, 88, 75, 95, 87, 90]  # Worker performance score
                }
            ]
        }
        
        # Mock worker pickup types breakdown
        pickup_types_data = {
            "labels": ["Residential", "Commercial", "Industrial"],
            "series": [
                {
                    "label": "This Week",
                    "values": [8, 5, 2]  # Worker's pickup distribution by type
                },
                {
                    "label": "Last Week", 
                    "values": [7, 4, 3]  # Previous week comparison
                },
                {
                    "label": "Target",
                    "values": [10, 8, 4]  # Worker's targets for each type
                }
            ]
        }
        
        return {
            "trending": trending_data,
            "pickupTypes": pickup_types_data
        }
    
    def _get_worker_donut_data(self, worker_id, start_date, end_date):
        """Generate donut chart data for worker's waste type distribution"""
        return {
            "categories": [
                {"label": "Recyclable", "value": 45, "color": "#16A34A"},  # Worker's waste type breakdown
                {"label": "Organic", "value": 30, "color": "#059669"},
                {"label": "Hazardous", "value": 15, "color": "#DC2626"},
                {"label": "Mixed", "value": 10, "color": "#7C3AED"}
            ]
        }
    
    def _get_scorecard_data(self):
        """Generate ESG scorecard table data"""
    def _get_worker_scorecard_data(self, worker_id):
        """Generate worker's recent pickup performance scorecard"""
        
        # Mock worker pickup performance data - replace with actual Pickup model queries
        mock_rows = [
            {"id": "P001", "location": "123 Main St", "date": "2025-09-15", "wasteType": "Recyclable", "weight": 25.5, "earnings": 1500, "status": "completed", "rating": 5},
            {"id": "P002", "location": "456 Oak Ave", "date": "2025-09-14", "wasteType": "Organic", "weight": 18.2, "earnings": 1200, "status": "completed", "rating": 4},
            {"id": "P003", "location": "789 Pine Rd", "date": "2025-09-13", "wasteType": "Mixed", "weight": 30.0, "earnings": 1800, "status": "completed", "rating": 5},
            {"id": "P004", "location": "321 Cedar St", "date": "2025-09-12", "wasteType": "Hazardous", "weight": 12.8, "earnings": 2000, "status": "completed", "rating": 4},
            {"id": "P005", "location": "654 Elm Ave", "date": "2025-09-11", "wasteType": "Recyclable", "weight": 22.3, "earnings": 1300, "status": "in-progress", "rating": 0},
        ]
        
        return {
            "total": len(mock_rows),
            "page": 1,
            "pageSize": 10,
            "rows": mock_rows
        }
    
    def _get_worker_reviews_data(self, worker_id):
        """Generate worker's review distribution and recent reviews data"""
        
        try:
            # Get actual reviews for this worker's pickups
            # In real implementation: Review.objects.filter(pickup__worker_id=worker_id)
            reviews = Review.objects.all()[:5]  # Get last 5 for demo
            distribution = [1, 0, 1, 3, 8]  # Mock worker-specific distribution [1,2,3,4,5 stars]
            
            recent_reviews = []
            for review in reviews:
                if 1 <= review.rating <= 5:
                    distribution[int(review.rating) - 1] += 1
            
            # Get recent reviews
            recent_reviews = Review.objects.select_related('user').order_by('-created_at')[:5]
            recent_reviews = []
            for review in reviews:
                recent_reviews.append({
                    "id": f"r{review.id}",
                    "name": review.user.first_name + " " + review.user.last_name if review.user else "Anonymous",
                    "customerName": review.user.first_name + " " + review.user.last_name if review.user else "Anonymous Customer",
                    "rating": review.rating,
                    "text": review.comment[:100] + "..." if len(review.comment) > 100 else review.comment,
                    "comment": review.comment,
                    "date": review.created_at.strftime('%Y-%m-%d'),
                    "tags": ["Professional", "Punctual", "Efficient"]  # Mock worker-related tags
                })
        except:
            # Fallback to mock data if Review model has issues
            distribution = [1, 0, 1, 3, 8]  # Worker's rating distribution [1,2,3,4,5 stars]
            recent_reviews = [
                {
                    "id": "r1",
                    "name": "Marie Dubois",
                    "customerName": "Marie Dubois",
                    "rating": 5,
                    "text": "Excellent service! Very professional and punctual pickup.",
                    "comment": "Excellent service! Very professional and punctual pickup.",
                    "date": "2025-09-14",
                    "tags": ["Professional", "On Time"]
                }
            ]
        
        return {
            "distribution": distribution,
            "recent": recent_reviews
        }


@method_decorator(csrf_exempt, name='dispatch')
class DashboardKPIsView(View):
    """Individual KPIs endpoint for caching"""
    
    def get(self, request):
        # Get worker-specific KPI data
        from django.http import JsonResponse
        
        overview_view = DashboardOverviewView()
        kpis_data = overview_view._get_worker_kpis_data()
        
        return JsonResponse(kpis_data)


@method_decorator(csrf_exempt, name='dispatch')
class DashboardTrendingView(View):
    """Individual trending chart endpoint"""
    
    def get(self, request):
        # Get worker-specific chart data
        from django.http import JsonResponse
        
        overview_view = DashboardOverviewView()
        charts_data = overview_view._get_worker_charts_data()
        
        return JsonResponse(charts_data)


@method_decorator(csrf_exempt, name='dispatch')
class DashboardScorecardView(View):
    """Paginated scorecard table endpoint"""
    
    def get(self, request):
        from django.http import JsonResponse
        
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('pageSize', 10))
        
        overview_view = DashboardOverviewView()
        scorecard_data = overview_view._get_worker_donut_data()
        
        # Add pagination metadata (mock for now)
        response_data = {
            **scorecard_data,
            "pagination": {
                "page": page,
                "pageSize": page_size,
                "total": len(scorecard_data.get("data", [])),
                "totalPages": 1
            }
        }
        
        return JsonResponse(response_data)


@method_decorator(csrf_exempt, name='dispatch')
class DashboardReviewsView(View):
    """Recent reviews endpoint with limit"""
    
    def get(self, request):
        from django.http import JsonResponse
        
        limit = int(request.GET.get('limit', 5))
        
        overview_view = DashboardOverviewView()
        reviews_data = overview_view._get_worker_reviews_data()
        
        # Limit recent reviews based on request parameter
        if 'recent' in reviews_data:
            reviews_data['recent'] = reviews_data['recent'][:limit]
        
        return JsonResponse(reviews_data)