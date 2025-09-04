"""Views for Bins and PickupRequest models."""

from typing import TYPE_CHECKING
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

if TYPE_CHECKING:
    from apps.users.models import User as UserType
else:
    UserType = None

User = get_user_model()  # type: ignore[misc]

# Role constants for safe access
user_role_enum = getattr(User, 'UserRole', None)
WORKER_ROLE = getattr(user_role_enum, 'WORKER', 'worker') if user_role_enum else 'worker'
ADMIN_ROLE = getattr(user_role_enum, 'ADMIN', 'admin') if user_role_enum else 'admin'
CUSTOMER_ROLE = getattr(user_role_enum, 'CUSTOMER', 'customer') if user_role_enum else 'customer'


def safe_user_attr(user, attr, default=0):
    """Safely get user attribute with fallback."""
    return getattr(user, attr, default) if hasattr(user, attr) else default


def safe_user_attr_set(user, attr, value):
    """Safely set user attribute if it exists."""
    if hasattr(user, attr):
        setattr(user, attr, value)


class ServerlessAPIKeyPermission(permissions.BasePermission):
    """Allow access only when API key matches or when no key configured (development)."""

    def has_permission(self, request, view):
        from django.conf import settings
        api_key = getattr(settings, 'SERVERLESS_API_KEY', None)
        if not api_key:
            # No API key configured — allow for local development
            return True
        provided = request.headers.get('X-Api-Key') or request.META.get('HTTP_X_API_KEY') or request.query_params.get('api_key')
        return provided == api_key


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
        base_qs = Bin.objects.select_related('owner')
        if getattr(user, 'is_admin_user', False):
            return base_qs
        elif getattr(user, 'is_customer', False):
            return base_qs.filter(owner=user)
        else:  # Workers can see all bins
            return base_qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def needs_pickup(self, request):
        """Get bins that need pickup."""
        bins = self.get_queryset().filter(status=Bin.BinStatus.FULL)
        serializer = self.get_serializer(bins, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def request_pickup(self, request, pk=None):
        """Trigger pickup request for bin (Bin Owner action)."""
        bin_obj = self.get_object()

        # Check if user owns this bin
        if bin_obj.owner != request.user:
            return Response(
                {'error': 'You can only request pickup for your own bins'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if there's already an active pickup request
        existing_request = PickupRequest.objects.filter(
            bin=bin_obj,
            status__in=[PickupRequest.PickupStatus.OPEN, PickupRequest.PickupStatus.ACCEPTED, PickupRequest.PickupStatus.IN_PROGRESS]
        ).first()

        if existing_request:
            return Response(
                {'error': 'There is already an active pickup request for this bin'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create pickup request
        pickup_request = PickupRequest.objects.create(
            bin=bin_obj,
            owner=bin_obj.owner,
            expected_fee=10.00,  # Default fee - could be dynamic based on bin size
            payment_method=request.data.get('payment_method', PickupRequest.PaymentMethod.MOBILE_MONEY)
        )

        # Update bin status to FULL if not already
        if bin_obj.status != Bin.BinStatus.FULL:
            bin_obj.status = Bin.BinStatus.FULL
            bin_obj.fill_level = 100
            bin_obj.save(update_fields=['status', 'fill_level'])

        return Response({
            'message': 'Pickup request created successfully',
            'pickup_request_id': pickup_request.id,
            'expected_fee': pickup_request.expected_fee
        })

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
        base_qs = (
            PickupRequest.objects
            .select_related('bin', 'owner', 'worker')
        )
        if getattr(user, 'is_admin_user', False):
            return base_qs
        elif getattr(user, 'is_customer', False):
            return base_qs.filter(owner=user)
        elif getattr(user, 'is_worker', False):
            return base_qs.filter(
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

    @action(detail=True, methods=['post'])
    def mark_delivered(self, request, pk=None):
        """Mark pickup as delivered (Worker action with cash confirmation)."""
        pickup_request = self.get_object()

        # Check if user is the assigned worker
        if pickup_request.worker != request.user:
            return Response(
                {'error': 'Only the assigned worker can mark delivery'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if pickup is in progress
        if pickup_request.status != PickupRequest.PickupStatus.IN_PROGRESS:
            return Response(
                {'error': 'Pickup must be in progress to mark as delivered'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Update pickup status
            pickup_request.status = PickupRequest.PickupStatus.DELIVERED
            pickup_request.save()

            # Handle payment based on method
            if pickup_request.payment_method == PickupRequest.PaymentMethod.CASH:
                # For cash payments, worker confirms collection
                pickup_request.payment_status = PickupRequest.PaymentStatus.COLLECTED_CASH
                pickup_request.actual_fee = pickup_request.expected_fee
            else:
                # For electronic payments, release escrow
                pickup_request.payment_status = PickupRequest.PaymentStatus.PAID
                # TODO: Integrate with escrow release logic

            pickup_request.save()

            # Update bin status
            pickup_request.bin.status = Bin.BinStatus.EMPTY
            pickup_request.bin.fill_level = 0
            pickup_request.bin.last_pickup = timezone.now()
            pickup_request.bin.save()

        return Response({
            'message': 'Pickup marked as delivered successfully',
            'payment_status': pickup_request.payment_status,
            'requires_customer_confirmation': pickup_request.payment_method == PickupRequest.PaymentMethod.CASH
        })

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
                        current_count = safe_user_attr(pickup_request.worker, 'pending_pickups_count', 0)
                        safe_user_attr_set(pickup_request.worker, 'pending_pickups_count', current_count - 1)
                        pickup_request.worker.save(update_fields=['pending_pickups_count'] if hasattr(pickup_request.worker, 'pending_pickups_count') else [])

                pickup_request.save()

            return Response(PickupRequestSerializer(pickup_request).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """Confirm cash payment received (Customer action)."""
        pickup_request = self.get_object()

        # Check if user is the bin owner
        if pickup_request.owner != request.user:
            return Response(
                {'error': 'Only the bin owner can confirm payment'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if pickup is delivered and payment is cash
        if pickup_request.status != PickupRequest.PickupStatus.DELIVERED:
            return Response(
                {'error': 'Pickup must be delivered to confirm payment'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if pickup_request.payment_method != PickupRequest.PaymentMethod.CASH:
            return Response(
                {'error': 'Payment confirmation only needed for cash payments'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Mark pickup as completed
            pickup_request.status = PickupRequest.PickupStatus.COMPLETED
            pickup_request.completed_at = timezone.now()
            pickup_request.payment_status = PickupRequest.PaymentStatus.PAID
            pickup_request.save()

            # Update worker's pending count
            if pickup_request.worker:
                current_count = safe_user_attr(pickup_request.worker, 'pending_pickups_count', 0)
                safe_user_attr_set(pickup_request.worker, 'pending_pickups_count', current_count - 1)
                pickup_request.worker.save(update_fields=['pending_pickups_count'] if hasattr(pickup_request.worker, 'pending_pickups_count') else [])

        return Response({
            'message': 'Payment confirmed and pickup completed',
            'can_leave_review': True
        })

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available pickup requests for workers within their service radius."""
        if not request.user.is_worker:
            return Response({'error': 'Only workers can view available pickups'},
                          status=status.HTTP_403_FORBIDDEN)

        user = request.user

        # Check if worker can accept more pickups
        if not user.can_accept_pickups:
            return Response({
                'message': 'You have reached the maximum number of pending pickups (3)',
                'pending_count': user.pending_pickups_count,
                'is_available': user.is_available
            })

        # Get all open pickup requests
        pickups = PickupRequest.objects.filter(
            status=PickupRequest.PickupStatus.OPEN
        ).select_related('bin', 'owner')

        # Filter by geographic radius if worker has location set
        if user.latitude and user.longitude and user.service_radius_km:
            # Simple distance filtering (for production, use PostGIS for better performance)
            from decimal import Decimal
            import math

            filtered_pickups = []
            for pickup in pickups:
                if pickup.bin.latitude and pickup.bin.longitude:
                    # Calculate approximate distance using Haversine formula
                    lat1, lon1 = float(user.latitude), float(user.longitude)
                    lat2, lon2 = float(pickup.bin.latitude), float(pickup.bin.longitude)

                    # Convert to radians
                    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

                    # Haversine formula
                    dlat = lat2 - lat1
                    dlon = lon2 - lon1
                    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
                    c = 2 * math.asin(math.sqrt(a))
                    r = 6371  # Radius of earth in kilometers
                    distance = c * r

                    if distance <= user.service_radius_km:
                        filtered_pickups.append(pickup)

            pickups = filtered_pickups

        serializer = self.get_serializer(pickups, many=True)
        return Response({
            'available_pickups': serializer.data,
            'worker_status': {
                'pending_count': user.pending_pickups_count,
                'max_pickups': 3,
                'can_accept_more': user.can_accept_pickups,
                'service_radius_km': user.service_radius_km
            }
        })

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
    def dashboard(self, request):
        """Get personalized dashboard data based on user role."""
        user = request.user

        if user.is_customer:
            # Customer dashboard
            my_bins = Bin.objects.filter(owner=user)
            my_pickups = PickupRequest.objects.filter(owner=user)

            dashboard_data = {
                'user_type': 'customer',
                'bins': {
                    'total': my_bins.count(),
                    'full': my_bins.filter(status=Bin.BinStatus.FULL).count(),
                    'pending_pickup': my_bins.filter(status=Bin.BinStatus.PENDING).count(),
                },
                'pickups': {
                    'total': my_pickups.count(),
                    'active': my_pickups.filter(status__in=[
                        PickupRequest.PickupStatus.OPEN,
                        PickupRequest.PickupStatus.ACCEPTED,
                        PickupRequest.PickupStatus.IN_PROGRESS
                    ]).count(),
                    'completed_this_month': my_pickups.filter(
                        status=PickupRequest.PickupStatus.COMPLETED,
                        completed_at__month=timezone.now().month
                    ).count(),
                },
                'recent_pickups': PickupRequestSerializer(
                    my_pickups.order_by('-created_at')[:5], many=True
                ).data
            }

        elif user.is_worker:
            # Worker dashboard
            my_pickups = PickupRequest.objects.filter(worker=user)
            available_nearby = PickupRequest.objects.filter(status=PickupRequest.PickupStatus.OPEN)

            dashboard_data = {
                'user_type': 'worker',
                'status': {
                    'is_available': user.is_available,
                    'pending_pickups': user.pending_pickups_count,
                    'can_accept_more': user.can_accept_pickups,
                    'service_radius_km': user.service_radius_km,
                },
                'pickups': {
                    'total_completed': my_pickups.filter(status=PickupRequest.PickupStatus.COMPLETED).count(),
                    'pending': my_pickups.filter(status__in=[
                        PickupRequest.PickupStatus.ACCEPTED,
                        PickupRequest.PickupStatus.IN_PROGRESS
                    ]).count(),
                    'available_nearby': available_nearby.count(),
                },
                'earnings': {
                    'this_month': sum(
                        pickup.actual_fee or pickup.expected_fee for pickup in my_pickups.filter(
                            status=PickupRequest.PickupStatus.COMPLETED,
                            completed_at__month=timezone.now().month
                        )
                    ),
                    'total': sum(
                        pickup.actual_fee or pickup.expected_fee for pickup in my_pickups.filter(
                            status=PickupRequest.PickupStatus.COMPLETED
                        )
                    ),
                },
                'recent_pickups': PickupRequestSerializer(
                    my_pickups.order_by('-created_at')[:5], many=True
                ).data
            }

        else:
            # Admin dashboard
            all_pickups = PickupRequest.objects.all()
            all_bins = Bin.objects.all()
            all_users = User.objects.all()

            dashboard_data = {
                'user_type': 'admin',
                'platform_stats': {
                    'total_users': all_users.count(),
                    'active_workers': all_users.filter(role=WORKER_ROLE, is_available=True).count(),
                    'total_bins': all_bins.count(),
                    'total_pickups': all_pickups.count(),
                },
                'recent_activity': {
                    'open_pickups': all_pickups.filter(status=PickupRequest.PickupStatus.OPEN).count(),
                    'disputed_pickups': all_pickups.filter(status=PickupRequest.PickupStatus.DISPUTED).count(),
                    'completed_today': all_pickups.filter(
                        status=PickupRequest.PickupStatus.COMPLETED,
                        completed_at__date=timezone.now().date()
                    ).count(),
                }
            }

        return Response(dashboard_data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a pickup request with proper cancellation rules."""
        pickup_request = self.get_object()
        user = request.user

        # Check permissions
        if pickup_request.owner != user and pickup_request.worker != user and not user.is_admin_user:
            return Response(
                {'error': 'You can only cancel your own pickup requests'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if cancellation is allowed
        if pickup_request.status in [PickupRequest.PickupStatus.COMPLETED, PickupRequest.PickupStatus.CANCELLED]:
            return Response(
                {'error': 'Cannot cancel completed or already cancelled pickup'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Determine cancellation rules based on status
        cancellation_reason = request.data.get('reason', '')
        can_cancel = False

        if pickup_request.status == PickupRequest.PickupStatus.OPEN:
            # Can be cancelled by owner anytime when open
            can_cancel = pickup_request.owner == user
        elif pickup_request.status == PickupRequest.PickupStatus.ACCEPTED:
            # Can be cancelled by worker or owner with reason
            can_cancel = pickup_request.worker == user or pickup_request.owner == user
        elif pickup_request.status == PickupRequest.PickupStatus.IN_PROGRESS:
            # Can only be cancelled by admin or with strong justification
            can_cancel = user.is_admin_user

        if not can_cancel:
            return Response(
                {'error': 'Cancellation not allowed at this stage'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Update pickup status
            pickup_request.status = PickupRequest.PickupStatus.CANCELLED
            pickup_request.cancellation_reason = cancellation_reason
            pickup_request.save()

            # Reset bin status if needed
            if pickup_request.bin.status == Bin.BinStatus.PENDING:
                pickup_request.bin.status = Bin.BinStatus.FULL
                pickup_request.bin.save()

            # Update worker's pending count if worker was assigned
            if pickup_request.worker:
                pickup_request.worker.pending_pickups_count -= 1
                pickup_request.worker.save(update_fields=['pending_pickups_count'])

            # Handle refund logic
            refund_issued = False
            if pickup_request.payment_status == PickupRequest.PaymentStatus.ESCROWED:
                # Issue refund for escrowed payments
                pickup_request.payment_status = PickupRequest.PaymentStatus.REFUNDED
                refund_issued = True
                # TODO: Integrate with payment provider for actual refund

            pickup_request.save()

        return Response({
            'message': 'Pickup request cancelled successfully',
            'refund_issued': refund_issued,
            'reason': cancellation_reason
        })

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


# Serverless Integration ViewSets

class ServerlessIntegrationViewSet(viewsets.ViewSet):
    """ViewSet for serverless function integrations."""

    permission_classes = [permissions.AllowAny]  # Will use API key authentication

    @action(detail=False, methods=['post'])
    def trigger_pickup_notifications(self, request):
        """Trigger notifications for new pickup requests (called by serverless)."""
        pickup_id = request.data.get('pickup_id')
        if not pickup_id:
            return Response({'error': 'pickup_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pickup = PickupRequest.objects.get(id=pickup_id)
            # This endpoint is called by serverless functions after pickup creation
            # The actual notification logic is handled by the serverless function
            return Response({'message': 'Notification trigger acknowledged', 'pickup_id': pickup_id})
        except PickupRequest.DoesNotExist:
            return Response({'error': 'Pickup not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def process_escrow_release(self, request):
        """Process escrow release (called by serverless functions)."""
        pickup_id = request.data.get('pickup_id')
        release_reason = request.data.get('release_reason', 'auto_release')
        force_release = request.data.get('force_release', False)

        if not pickup_id:
            return Response({'error': 'pickup_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pickup = PickupRequest.objects.get(id=pickup_id)

            with transaction.atomic():
                if pickup.status not in [PickupRequest.PickupStatus.DELIVERED, PickupRequest.PickupStatus.COMPLETED]:
                    if not force_release:
                        return Response({'error': 'Pickup not ready for escrow release'}, status=status.HTTP_400_BAD_REQUEST)

                # Update payment status
                pickup.payment_status = PickupRequest.PaymentStatus.PAID
                pickup.status = PickupRequest.PickupStatus.COMPLETED
                pickup.completed_at = timezone.now()
                pickup.save()

                # Update worker's pending count
                if pickup.worker:
                    current_count = safe_user_attr(pickup.worker, 'pending_pickups_count', 0)
                    safe_user_attr_set(pickup.worker, 'pending_pickups_count', current_count - 1)  # type: ignore[misc]
                    pickup.worker.save(update_fields=['pending_pickups_count'])

                return Response({
                    'success': True,
                    'message': 'Escrow released successfully',
                    'pickup_id': pickup_id,
                    'release_reason': release_reason
                })

        except PickupRequest.DoesNotExist:
            return Response({'error': 'Pickup not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def log_notification(self, request):
        """Log notification events from serverless functions."""
        from .models import NotificationLog

        try:
            NotificationLog.objects.create(
                pickup_id=request.data.get('pickup_id'),
                user_ids=request.data.get('user_ids', []),
                notification_type=request.data.get('notification_type'),
                title=request.data.get('title'),
                body=request.data.get('body'),
                success=request.data.get('success', False),
                metadata=request.data.get('metadata', {}),
                sent_by='serverless'
            )
            return Response({'message': 'Notification logged successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def log_geo_event(self, request):
        """Log geographic events from serverless functions."""
        from .models import GeoLog

        try:
            GeoLog.objects.create(
                pickup_id=request.data.get('pickup_id'),
                center_latitude=request.data.get('center_latitude'),
                center_longitude=request.data.get('center_longitude'),
                radius_km=request.data.get('radius_km'),
                workers_found=request.data.get('workers_found', 0),
                workers_notified=request.data.get('workers_notified', 0),
                metadata=request.data.get('metadata', {}),
                processed_by='serverless'
            )
            return Response({'message': 'Geo event logged successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def log_escrow_event(self, request):
        """Log escrow events from serverless functions."""
        from .models import EscrowLog

        try:
            EscrowLog.objects.create(
                pickup_id=request.data.get('pickup_id'),
                payment_id=request.data.get('payment_id'),
                action=request.data.get('action'),
                reason=request.data.get('reason'),
                amount=request.data.get('amount'),
                processed_by=request.data.get('processed_by', 'serverless'),
                metadata=request.data.get('metadata', {})
            )
            return Response({'message': 'Escrow event logged successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReportsViewSet(viewsets.ViewSet):
    """ViewSet for report generation (used by serverless functions)."""

    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def daily_stats(self, request):
        """Get daily statistics for reports."""
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'date parameter required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from datetime import datetime
            target_date = datetime.fromisoformat(date_str).date()

            stats = {
                'date': date_str,
                'total_pickups': PickupRequest.objects.filter(created_at__date=target_date).count(),
                'completed_pickups': PickupRequest.objects.filter(
                    completed_at__date=target_date,
                    status=PickupRequest.PickupStatus.COMPLETED
                ).count(),
                'active_workers': User.objects.filter(
                    role=WORKER_ROLE,
                    is_available=True
                ).count(),
                'active_bins': Bin.objects.filter(status__in=[Bin.BinStatus.FULL, Bin.BinStatus.PENDING]).count(),
                'completion_rate': 0
            }

            if stats['total_pickups'] > 0:
                stats['completion_rate'] = (stats['completed_pickups'] / stats['total_pickups']) * 100

            return Response(stats)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def earnings(self, request):
        """Get earnings data for reports."""
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'date parameter required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from datetime import datetime
            target_date = datetime.fromisoformat(date_str).date()

            completed_pickups = PickupRequest.objects.filter(
                completed_at__date=target_date,
                status=PickupRequest.PickupStatus.COMPLETED
            )

            total_earnings = sum(
                pickup.actual_fee or pickup.expected_fee
                for pickup in completed_pickups
            )

            earnings_by_worker = {}
            for pickup in completed_pickups:
                if pickup.worker:
                    worker_id = getattr(pickup.worker, 'id', None)  # type: ignore[misc]
                    earnings_by_worker[worker_id] = earnings_by_worker.get(worker_id, 0) + (pickup.actual_fee or pickup.expected_fee)

            return Response({
                'date': date_str,
                'total_earnings': total_earnings,
                'completed_pickups_count': completed_pickups.count(),
                'average_earning_per_pickup': total_earnings / completed_pickups.count() if completed_pickups.count() > 0 else 0,
                'earnings_by_worker': earnings_by_worker
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def save_daily_report(self, request):
        """Save daily report data."""
        from .models import DailyReport

        try:
            report = DailyReport.objects.create(
                date=request.data['date'],
                summary=request.data['summary'],
                earnings_data=request.data['earnings'],
                pickups_data=request.data['pickups'],
                worker_performance_data=request.data['worker_performance'],
                generated_by=request.data.get('generated_by', 'serverless'),
                metadata=request.data.get('metadata', {})
            )
            return Response({'id': getattr(report, 'id', None), 'message': 'Daily report saved successfully'})  # type: ignore[misc]
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AnalyticsViewSet(viewsets.ViewSet):
    """ViewSet for analytics data (used by serverless functions)."""

    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def weekly(self, request):
        """Get weekly analytics data."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response({'error': 'start_date and end_date parameters required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from datetime import datetime
            start = datetime.fromisoformat(start_date).date()
            end = datetime.fromisoformat(end_date).date()

            pickups = PickupRequest.objects.filter(created_at__date__range=[start, end])
            completed_pickups = pickups.filter(status=PickupRequest.PickupStatus.COMPLETED)

            # Calculate daily pickups
            daily_pickups = []
            current_date = start
            while current_date <= end:
                count = pickups.filter(created_at__date=current_date).count()
                daily_pickups.append(count)
                current_date = current_date.replace(day=current_date.day + 1)

            total_earnings = sum(
                pickup.actual_fee or pickup.expected_fee
                for pickup in completed_pickups
            )

            return Response({
                'start_date': start_date,
                'end_date': end_date,
                'total_pickups': pickups.count(),
                'completed_pickups': completed_pickups.count(),
                'total_earnings': total_earnings,
                'daily_pickups': daily_pickups,
                'average_rating': completed_pickups.aggregate(models.Avg('rating'))['rating__avg'] or 0
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def top_performers(self, request):
        """Get top performing workers."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response({'error': 'start_date and end_date parameters required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from datetime import datetime
            start = datetime.fromisoformat(start_date).date()
            end = datetime.fromisoformat(end_date).date()

            # Get workers with completed pickups in date range
            workers_data = User.objects.filter(
                role=WORKER_ROLE,
                pickup_requests_worker__status=PickupRequest.PickupStatus.COMPLETED,
                pickup_requests_worker__completed_at__date__range=[start, end]
            ).annotate(
                completed_pickups=models.Count('pickup_requests_worker'),
                total_earnings=models.Sum(
                    models.Case(
                        models.When(pickup_requests_worker__actual_fee__isnull=False, then='pickup_requests_worker__actual_fee'),
                        default='pickup_requests_worker__expected_fee'
                    )
                ),
                average_rating=models.Avg('pickup_requests_worker__rating')
            ).order_by('-completed_pickups')[:10]

            top_performers = []
            for worker in workers_data:
                top_performers.append({
                    'worker_id': safe_user_attr(worker, 'id'),  # type: ignore[misc]
                    'name': f"{worker.first_name} {worker.last_name}",
                    'completed_pickups': safe_user_attr(worker, 'completed_pickups'),  # type: ignore[misc]
                    'total_earnings': safe_user_attr(worker, 'total_earnings') or 0,  # type: ignore[misc]
                    'average_rating': safe_user_attr(worker, 'average_rating') or 0  # type: ignore[misc]
                })

            return Response({
                'start_date': start_date,
                'end_date': end_date,
                'top_performers': top_performers
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def save_weekly_analytics(self, request):
        """Save weekly analytics data."""
        from .models import WeeklyAnalytics

        try:
            analytics = WeeklyAnalytics.objects.create(
                week_start=request.data['week_start'],
                week_end=request.data['week_end'],
                data=request.data['data'],
                trends=request.data['trends'],
                insights=request.data['insights'],
                top_performers=request.data['top_performers'],
                generated_by=request.data.get('generated_by', 'serverless'),
                metadata=request.data.get('metadata', {})
            )
            return Response({'id': getattr(analytics, 'id', None), 'message': 'Weekly analytics saved successfully'})  # type: ignore[misc]
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WorkersViewSet(viewsets.ViewSet):
    """ViewSet for worker-related operations (used by serverless functions)."""

    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available workers for notifications."""
        latitude = request.query_params.get('lat')
        longitude = request.query_params.get('lng')
        radius = request.query_params.get('radius', 5)

        if not latitude or not longitude:
            return Response({'error': 'lat and lng parameters required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            try:
                lat, lng, radius_km = float(latitude), float(longitude), float(radius)
            except ValueError:
                return Response({'error': 'lat, lng and radius must be numeric'}, status=status.HTTP_400_BAD_REQUEST)

            # Get workers who can accept more pickups
            available_workers = User.objects.filter(
                role=WORKER_ROLE,
                is_available=True,
                pending_pickups_count__lt=3
            )

            # Filter by location if coordinates provided
            workers_data = []
            for worker in available_workers:
                # Skip if worker has no valid coordinates
                if not safe_user_attr(worker, 'latitude') or not safe_user_attr(worker, 'longitude'):  # type: ignore[misc]
                    continue

                try:
                    # Calculate distance (simplified - use PostGIS for production)
                    import math
                    lat1, lon1 = math.radians(lat), math.radians(lng)
                    lat2, lon2 = math.radians(float(safe_user_attr(worker, 'latitude', 0))), math.radians(float(safe_user_attr(worker, 'longitude', 0)))  # type: ignore[misc]

                    dlat = lat2 - lat1
                    dlon = lon2 - lon1
                    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
                    c = 2 * math.asin(math.sqrt(a))
                    distance = c * 6371  # Earth radius in km

                except Exception:
                    # Skip workers with invalid coordinate formats
                    continue

                if distance <= radius_km:
                    workers_data.append({
                        'id': safe_user_attr(worker, 'id'),  # type: ignore[misc]
                        'first_name': worker.first_name,
                        'last_name': worker.last_name,
                        'latitude': safe_user_attr(worker, 'latitude'),  # type: ignore[misc]
                        'longitude': safe_user_attr(worker, 'longitude'),  # type: ignore[misc]
                        'service_radius_km': safe_user_attr(worker, 'service_radius_km', 5),  # type: ignore[misc]
                        'pending_pickups_count': safe_user_attr(worker, 'pending_pickups_count', 0),  # type: ignore[misc]
                        'distance_km': round(distance, 2)
                    })

            return Response({'workers': workers_data})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['patch'])
    def update_service_radius(self, request, pk=None):
        """Update worker's service radius."""
        try:
            worker = User.objects.get(id=pk, role=WORKER_ROLE)
            new_radius = request.data.get('service_radius_km')

            if new_radius is not None:
                safe_user_attr_set(worker, 'service_radius_km', new_radius)  # type: ignore[misc]
                worker.save(update_fields=['service_radius_km'] if hasattr(worker, 'service_radius_km') else [])

            return Response({'message': 'Service radius updated successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Worker not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UsersViewSet(viewsets.ViewSet):
    """ViewSet for user-related operations (used by serverless functions)."""

    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def tokens(self, request):
        """Get device tokens for users."""
        user_ids = request.data.get('user_ids', [])
        if not user_ids:
            return Response({'error': 'user_ids required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # In a real implementation, you'd have a DeviceToken model
            # For now, return mock data structure
            tokens = []
            for user_id in user_ids:
                # Mock token generation - replace with actual device token retrieval
                tokens.append(f"mock_token_{user_id}")

            return Response({'tokens': tokens})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def admins(self, request):
        """Get admin users for notifications."""
        try:
            admins = User.objects.filter(role=ADMIN_ROLE).values(
                'id', 'first_name', 'last_name', 'email'
            )
            return Response({'admins': list(admins)})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CleanupViewSet(viewsets.ViewSet):
    """ViewSet for cleanup operations (used by serverless functions)."""

    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def cleanup(self, request):
        """Clean up old data based on type and retention period."""
        data_type = request.data.get('data_type')
        retention_days = request.data.get('retention_days', 30)

        if not data_type:
            return Response({'error': 'data_type required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from datetime import timedelta
            from django.utils import timezone

            cutoff_date = timezone.now() - timedelta(days=retention_days)
            deleted_count = 0

            if data_type == 'notification_logs':
                from .models import NotificationLog
                deleted_count = NotificationLog.objects.filter(created_at__lt=cutoff_date).delete()[0]
            elif data_type == 'geo_logs':
                from .models import GeoLog
                deleted_count = GeoLog.objects.filter(created_at__lt=cutoff_date).delete()[0]
            elif data_type == 'escrow_logs':
                from .models import EscrowLog
                deleted_count = EscrowLog.objects.filter(created_at__lt=cutoff_date).delete()[0]
            elif data_type == 'api_logs':
                # Assuming you have API logging
                deleted_count = 0  # Placeholder
            elif data_type == 'temp_files':
                # Clean up temporary files
                deleted_count = 0  # Placeholder

            return Response({
                'message': f'Cleaned up {deleted_count} {data_type} records',
                'data_type': data_type,
                'retention_days': retention_days,
                'deleted_count': deleted_count
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
