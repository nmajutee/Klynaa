"""Views for Bins and PickupRequest models."""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction, models
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Bin, PickupRequest
from .serializers import (
    BinSerializer, BinStatusUpdateSerializer, PickupRequestSerializer,
    AcceptPickupSerializer, UpdatePickupStatusSerializer
)

User = get_user_model()


class BinViewSet(viewsets.ModelViewSet):
    """ViewSet for Bin model."""

    serializer_class = BinSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['label', 'bin_id', 'address']
    ordering_fields = ['created_at', 'updated_at', 'fill_level']
    ordering = ['-updated_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_user:
            return Bin.objects.all()
        elif user.is_customer:
            return Bin.objects.filter(owner=user)
        else:  # Workers can see all bins
            return Bin.objects.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def needs_pickup(self, request):
        """Get bins that need pickup."""
        bins = self.get_queryset().filter(status=Bin.BinStatus.FULL)
        serializer = self.get_serializer(bins, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update bin status and fill level (for IoT sensors)."""
        bin_obj = self.get_object()
        serializer = BinStatusUpdateSerializer(bin_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # Auto-create pickup request if bin is full
            if bin_obj.status == Bin.BinStatus.FULL and bin_obj.needs_pickup:
                self._create_pickup_request_if_needed(bin_obj)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get bin statistics."""
        queryset = self.get_queryset()
        stats = {
            'total_bins': queryset.count(),
            'empty_bins': queryset.filter(status=Bin.BinStatus.EMPTY).count(),
            'partial_bins': queryset.filter(status=Bin.BinStatus.PARTIAL).count(),
            'full_bins': queryset.filter(status=Bin.BinStatus.FULL).count(),
            'pending_pickup': queryset.filter(status=Bin.BinStatus.PENDING).count(),
        }
        return Response(stats)

    def _create_pickup_request_if_needed(self, bin_obj):
        """Create pickup request if none exists for full bin."""
        existing_request = PickupRequest.objects.filter(
            bin=bin_obj,
            status__in=[PickupRequest.PickupStatus.OPEN, PickupRequest.PickupStatus.ACCEPTED]
        ).first()

        if not existing_request:
            PickupRequest.objects.create(
                bin=bin_obj,
                owner=bin_obj.owner,
                expected_fee=10.00  # Default fee
            )


class PickupRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for PickupRequest model."""

    serializer_class = PickupRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['bin__label', 'bin__bin_id', 'notes']
    ordering_fields = ['created_at', 'accepted_at', 'completed_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_user:
            return PickupRequest.objects.all()
        elif user.is_customer:
            return PickupRequest.objects.filter(owner=user)
        elif user.is_worker:
            return PickupRequest.objects.filter(
                models.Q(worker=user) | models.Q(status=PickupRequest.PickupStatus.OPEN)
            )
        return PickupRequest.objects.none()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a pickup request (workers only)."""
        pickup_request = self.get_object()
        serializer = AcceptPickupSerializer(pickup_request, data={}, context={'request': request})

        if serializer.is_valid():
            with transaction.atomic():
                # Lock the pickup request to prevent race conditions
                pickup_request = PickupRequest.objects.select_for_update().get(pk=pk)

                if not pickup_request.can_be_accepted:
                    return Response(
                        {'error': 'Pickup request cannot be accepted'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Accept the pickup
                pickup_request.worker = request.user
                pickup_request.status = PickupRequest.PickupStatus.ACCEPTED
                pickup_request.accepted_at = timezone.now()
                pickup_request.save()

                # Update worker's pending count
                request.user.pending_pickups_count += 1
                request.user.save(update_fields=['pending_pickups_count'])

                # Update bin status
                pickup_request.bin.status = Bin.BinStatus.PENDING
                pickup_request.bin.save(update_fields=['status'])

            return Response({'message': 'Pickup request accepted successfully'})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update pickup status with proper state transitions."""
        pickup_request = self.get_object()
        serializer = UpdatePickupStatusSerializer(pickup_request, data=request.data, partial=True)

        if serializer.is_valid():
            new_status = serializer.validated_data['status']

            with transaction.atomic():
                pickup_request.status = new_status

                # Update timestamps based on status
                if new_status == PickupRequest.PickupStatus.IN_PROGRESS:
                    pickup_request.picked_at = timezone.now()
                elif new_status == PickupRequest.PickupStatus.COMPLETED:
                    pickup_request.completed_at = timezone.now()
                    # Update bin status and worker count
                    pickup_request.bin.status = Bin.BinStatus.EMPTY
                    pickup_request.bin.last_pickup = timezone.now()
                    pickup_request.bin.save()

                    if pickup_request.worker:
                        pickup_request.worker.pending_pickups_count -= 1
                        pickup_request.worker.save(update_fields=['pending_pickups_count'])

                pickup_request.save()

            return Response(PickupRequestSerializer(pickup_request).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available pickup requests for workers."""
        if not request.user.is_worker:
            return Response({'error': 'Only workers can view available pickups'},
                          status=status.HTTP_403_FORBIDDEN)

        pickups = PickupRequest.objects.filter(status=PickupRequest.PickupStatus.OPEN)
        serializer = self.get_serializer(pickups, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_pickups(self, request):
        """Get current user's pickup requests."""
        user = request.user
        if user.is_customer:
            pickups = PickupRequest.objects.filter(owner=user)
        elif user.is_worker:
            pickups = PickupRequest.objects.filter(worker=user)
        else:
            pickups = PickupRequest.objects.all()

        serializer = self.get_serializer(pickups, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get pickup request statistics."""
        queryset = self.get_queryset()
        stats = {
            'total_requests': queryset.count(),
            'open_requests': queryset.filter(status=PickupRequest.PickupStatus.OPEN).count(),
            'accepted_requests': queryset.filter(status=PickupRequest.PickupStatus.ACCEPTED).count(),
            'in_progress': queryset.filter(status=PickupRequest.PickupStatus.IN_PROGRESS).count(),
            'completed_requests': queryset.filter(status=PickupRequest.PickupStatus.COMPLETED).count(),
        }
        return Response(stats)
