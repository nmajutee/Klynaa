"""URLs for reviews app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet, DisputeViewSet

router = DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'disputes', DisputeViewSet, basename='dispute')

urlpatterns = [
    path('', include(router.urls)),
]
