"""Views for Reviews and Disputes."""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Review, Dispute
from .serializers import ReviewSerializer, DisputeSerializer

User = get_user_model()


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for Review model."""

    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['comment']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_user:
            return Review.objects.all()
        else:
            # Users can see reviews they gave or received
            return Review.objects.filter(
                models.Q(reviewer=user) | models.Q(reviewed_user=user)
            )

    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        """Get reviews for current user."""
        reviews = Review.objects.filter(reviewed_user=request.user)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def given_reviews(self, request):
        """Get reviews given by current user."""
        reviews = Review.objects.filter(reviewer=request.user)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)


class DisputeViewSet(viewsets.ModelViewSet):
    """ViewSet for Dispute model."""

    serializer_class = DisputeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['description']
    ordering_fields = ['created_at', 'resolved_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_user:
            return Dispute.objects.all()
        else:
            # Users can see disputes they filed or are involved in
            return Dispute.objects.filter(
                models.Q(filed_by=user) | models.Q(against_user=user)
            )

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def resolve(self, request, pk=None):
        """Resolve a dispute (admin only)."""
        dispute = self.get_object()
        resolution = request.data.get('resolution', '')

        if not resolution:
            return Response(
                {'error': 'Resolution text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        dispute.status = Dispute.DisputeStatus.RESOLVED
        dispute.resolution = resolution
        dispute.resolved_by = request.user
        dispute.resolved_at = timezone.now()
        dispute.save()

        return Response({'message': 'Dispute resolved successfully'})

    @action(detail=False, methods=['get'])
    def my_disputes(self, request):
        """Get disputes filed by current user."""
        disputes = Dispute.objects.filter(filed_by=request.user)
        serializer = self.get_serializer(disputes, many=True)
        return Response(serializer.data)
