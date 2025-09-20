from django.urls import path
from . import views

urlpatterns = [
    path('overview/', views.DashboardOverviewView.as_view(), name='dashboard_overview'),
    path('kpis/', views.DashboardKPIsView.as_view(), name='dashboard_kpis'),
    path('trending/', views.DashboardTrendingView.as_view(), name='dashboard_trending'),
    path('scorecard/', views.DashboardScorecardView.as_view(), name='dashboard_scorecard'),
    path('reviews/', views.DashboardReviewsView.as_view(), name='dashboard_reviews'),
]