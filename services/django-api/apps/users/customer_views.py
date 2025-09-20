"""
Customer-specific views for the Klynaa platform.
Handles customer registration, pickup requests, tracking, and payments.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Avg
from django.utils import timezone
from decimal import Decimal
import json

from apps.users.models import User
from apps.bins.models import Bin, PickupRequest
from apps.payments.models import WorkerEarnings
from apps.reviews.models import Review
from .customer_serializers import (
    CustomerProfileSerializer,
    PickupRequestCreateSerializer,
    PickupRequestSerializer,
    BinSerializer,
    CustomerStatsSerializer
)
from .customer_permissions import IsCustomer


class CustomerDashboardViewSet(viewsets.ViewSet):
    """Customer dashboard statistics and overview."""
    permission_classes = [IsAuthenticated, IsCustomer]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get customer dashboard statistics."""
        customer = request.user

        # Get customer's bins
        bins = Bin.objects.filter(owner=customer)

        # Get pickup requests
        pickup_requests = PickupRequest.objects.filter(owner=customer)

        # Calculate statistics
        stats = {
            'total_bins': bins.count(),
            'active_bins': bins.filter(status='active').count(),
            'total_pickups': pickup_requests.count(),
            'pending_pickups': pickup_requests.filter(status='open').count(),
            'completed_pickups': pickup_requests.filter(status='completed').count(),
            'total_spent': pickup_requests.filter(
                status='completed'
            ).aggregate(
                total=Count('actual_fee')
            )['total'] or Decimal('0.00'),
            'this_month_pickups': pickup_requests.filter(
                created_at__gte=timezone.now().replace(day=1)
            ).count(),
            'average_rating_given': Review.objects.filter(
                reviewer=customer
            ).aggregate(avg=Avg('rating'))['avg'] or 0.0,
        }

        serializer = CustomerStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        """Get recent customer activity."""
        customer = request.user

        # Get recent pickup requests
        recent_pickups = PickupRequest.objects.filter(
            owner=customer
        ).order_by('-created_at')[:10]

        serializer = PickupRequestSerializer(recent_pickups, many=True)
        return Response(serializer.data)


class CustomerPickupViewSet(viewsets.ModelViewSet):
    """Customer pickup request management."""
    permission_classes = [IsAuthenticated, IsCustomer]
    serializer_class = PickupRequestSerializer

    def get_queryset(self):
        """Filter pickup requests for current customer."""
        return PickupRequest.objects.filter(
            owner=self.request.user
        ).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        """Create a new pickup request."""
        serializer = PickupRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create pickup request
        pickup_request = serializer.save(
            owner=request.user,
            status='open'
        )

        # Return the created pickup with full details
        response_serializer = PickupRequestSerializer(pickup_request)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a pickup request."""
        pickup_request = self.get_object()

        if pickup_request.status not in ['open', 'accepted']:
            return Response(
                {'error': 'Cannot cancel pickup in current status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cancellation_reason = request.data.get('reason', '')
        pickup_request.status = 'cancelled'
        pickup_request.cancellation_reason = cancellation_reason
        pickup_request.save()

        return Response({'message': 'Pickup cancelled successfully'})

    @action(detail=True, methods=['post'])
    def rate_worker(self, request, pk=None):
        """Rate the worker for a completed pickup."""
        pickup_request = self.get_object()

        if pickup_request.status != 'completed':
            return Response(
                {'error': 'Can only rate completed pickups'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not pickup_request.worker:
            return Response(
                {'error': 'No worker assigned to this pickup'},
                status=status.HTTP_400_BAD_REQUEST
            )

        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not rating or not (1 <= int(rating) <= 5):
            return Response(
                {'error': 'Rating must be between 1 and 5'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create or update review
        review, created = Review.objects.get_or_create(
            pickup=pickup_request,
            reviewer=request.user,
            reviewee=pickup_request.worker,
            defaults={
                'rating': rating,
                'comment': comment
            }
        )

        if not created:
            review.rating = rating
            review.comment = comment
            review.save()

        return Response({'message': 'Rating submitted successfully'})

    @action(detail=False, methods=['get'])
    def nearby_workers(self, request):
        """Get nearby available workers."""
        lat = request.query_params.get('latitude')
        lng = request.query_params.get('longitude')

        if not lat or not lng:
            return Response(
                {'error': 'Latitude and longitude required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get available workers within 10km radius (simplified)
        available_workers = User.objects.filter(
            role='worker',
            is_available=True,
            latitude__isnull=False,
            longitude__isnull=False
        )

        # TODO: Add proper distance calculation and filtering

        serializer = CustomerProfileSerializer(available_workers, many=True)
        return Response(serializer.data)


class CustomerBinViewSet(viewsets.ModelViewSet):
    """Customer bin management."""
    permission_classes = [IsAuthenticated, IsCustomer]
    serializer_class = BinSerializer

    def get_queryset(self):
        """Filter bins for current customer."""
        return Bin.objects.filter(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        """Register a new bin."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create bin for current user
        bin_obj = serializer.save(owner=request.user)

        return Response(
            BinSerializer(bin_obj).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def report_full(self, request, pk=None):
        """Report bin as full and request pickup."""
        bin_obj = self.get_object()

        # Update bin status
        bin_obj.status = 'full'
        bin_obj.fill_level = 100
        bin_obj.save()

        # Create automatic pickup request
        pickup_request = PickupRequest.objects.create(
            bin=bin_obj,
            owner=request.user,
            waste_type=request.data.get('waste_type', 'general'),
            estimated_weight_kg=request.data.get('estimated_weight', 5.0),
            expected_fee=Decimal('100.00'),  # Default fee
            notes=f"Automatic pickup request for full bin {bin_obj.bin_id}"
        )

        return Response({
            'message': 'Bin reported as full and pickup requested',
            'pickup_request_id': pickup_request.id
        })

    @action(detail=True, methods=['get'])
    def pickup_history(self, request, pk=None):
        """Get pickup history for a specific bin."""
        bin_obj = self.get_object()

        pickups = PickupRequest.objects.filter(
            bin=bin_obj
        ).order_by('-created_at')

        serializer = PickupRequestSerializer(pickups, many=True)
        return Response(serializer.data)


class CustomerProfileViewSet(viewsets.ViewSet):
    """Customer profile management."""
    permission_classes = [IsAuthenticated, IsCustomer]

    def retrieve(self, request):
        """Get customer profile."""
        serializer = CustomerProfileSerializer(request.user)
        return Response(serializer.data)

    def update(self, request):
        """Update customer profile."""
        serializer = CustomerProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_location(self, request):
        """Update customer location."""
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        address = request.data.get('address', '')

        if not latitude or not longitude:
            return Response(
                {'error': 'Latitude and longitude required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user
        user.latitude = latitude
        user.longitude = longitude
        if address:
            # You might want to add an address field to User model
            pass
        user.save()

        return Response({'message': 'Location updated successfully'})

    @action(detail=False, methods=['get'])
    def payment_methods(self, request):
        """Get customer payment methods."""
        # TODO: Integrate with payment service
        return Response({
            'methods': [
                {'id': 'mpesa', 'name': 'M-Pesa', 'enabled': True},
                {'id': 'cash', 'name': 'Cash on Delivery', 'enabled': True},
                {'id': 'card', 'name': 'Credit/Debit Card', 'enabled': False}
            ]
        })

    @action(detail=False, methods=['post'])
    def add_payment_method(self, request):
        """Add a new payment method."""
        # TODO: Integrate with payment service
        method_type = request.data.get('type')
        method_data = request.data.get('data', {})

        return Response({
            'message': f'Payment method {method_type} added successfully'
        })