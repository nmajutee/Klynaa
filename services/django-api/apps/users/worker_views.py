"""Worker Dashboard API views."""

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.bins.models import PickupRequest, PickupProof
from apps.payments.models import WorkerEarnings
from apps.chat.models import ChatRoom, Message, QuickReply
from .worker_serializers import (
    WorkerProfileSerializer, PickupTaskSerializer, PickupTaskDetailSerializer,
    ProofUploadSerializer, WorkerEarningsSerializer, EarningsSummarySerializer,
    MessageSerializer, QuickReplySerializer, WorkerStatsSerializer
)
from .worker_permissions import IsWorker

User = get_user_model()


class WorkerDashboardStatsView(APIView):
    """GET /api/v1/workers/me - Worker dashboard overview."""
    permission_classes = [permissions.IsAuthenticated, IsWorker]

    def get(self, request):
        worker = request.user
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())

        # Calculate stats
        total_pickups = PickupRequest.objects.filter(worker=worker, status='completed').count()
        completed_today = PickupRequest.objects.filter(
            worker=worker,
            status='completed',
            completed_at__date=today
        ).count()

        completed_this_week = PickupRequest.objects.filter(
            worker=worker,
            status='completed',
            completed_at__date__gte=week_start
        ).count()

        # Earnings
        earnings_qs = WorkerEarnings.objects.filter(worker=worker)
        total_earnings = earnings_qs.aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')
        pending_earnings = earnings_qs.filter(status='pending').aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')
        today_earnings = earnings_qs.filter(earned_at__date=today).aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')

        # Active pickups
        active_pickups = PickupRequest.objects.filter(
            worker=worker,
            status__in=['accepted', 'in_progress']
        ).count()

        # Available pickups nearby (within service radius)
        available_nearby = PickupRequest.objects.filter(
            status='open',
            bin__latitude__isnull=False,
            bin__longitude__isnull=False
        ).count()  # Simplified for now

        completion_rate = (completed_this_week / max(1, completed_this_week + active_pickups)) * 100

        stats_data = {
            'total_pickups': total_pickups,
            'completed_today': completed_today,
            'completed_this_week': completed_this_week,
            'completion_rate': round(completion_rate, 1),
            'average_rating': float(worker.rating_average),
            'total_earnings': total_earnings,
            'pending_earnings': pending_earnings,
            'today_earnings': today_earnings,
            'current_status': 'ACTIVE' if worker.is_available else 'OFFLINE',
            'active_pickups': active_pickups,
            'available_pickups_nearby': available_nearby,
        }

        serializer = WorkerStatsSerializer(stats_data)
        return Response(serializer.data)


class WorkerStatusToggleView(APIView):
    """PATCH /api/v1/workers/me/status - Toggle worker availability."""
    permission_classes = [permissions.IsAuthenticated, IsWorker]

    def patch(self, request):
        worker = request.user
        new_status = request.data.get('is_available')

        if new_status is not None:
            worker.is_available = new_status
            worker.save(update_fields=['is_available'])

            return Response({
                'is_available': worker.is_available,
                'status': 'ACTIVE' if worker.is_available else 'OFFLINE',
                'message': f'Status updated to {"Active" if worker.is_available else "Offline"}'
            })

        return Response({'error': 'is_available field is required'}, status=status.HTTP_400_BAD_REQUEST)


class AvailablePickupsView(generics.ListAPIView):
    """GET /api/v1/pickups?status=pending - List available pickups."""
    serializer_class = PickupTaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorker]

    def get_queryset(self):
        worker = self.request.user

        # Base queryset for open pickups
        queryset = PickupRequest.objects.filter(
            status='open',
            worker__isnull=True
        ).select_related('owner', 'bin').prefetch_related('proofs')

        # Apply filters
        bbox = self.request.query_params.get('bbox')
        if bbox:
            # Parse bbox: "min_lat,min_lng,max_lat,max_lng"
            try:
                min_lat, min_lng, max_lat, max_lng = map(float, bbox.split(','))
                queryset = queryset.filter(
                    bin__latitude__gte=min_lat,
                    bin__latitude__lte=max_lat,
                    bin__longitude__gte=min_lng,
                    bin__longitude__lte=max_lng
                )
            except ValueError:
                pass

        # Add computed fields
        for pickup in queryset:
            pickup.can_accept = worker.can_accept_pickups
            pickup.distance_km = 0.0  # TODO: Calculate actual distance

        return queryset.order_by('created_at')


class PickupAcceptView(APIView):
    """POST /api/v1/pickups/:id/accept - Accept a pickup task."""
    permission_classes = [permissions.IsAuthenticated, IsWorker]

    def post(self, request, pickup_id):
        worker = request.user

        if not worker.can_accept_pickups:
            return Response({
                'error': 'Cannot accept more pickups. Complete existing tasks or change availability.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            pickup = PickupRequest.objects.select_for_update().get(id=pickup_id)
        except PickupRequest.DoesNotExist:
            return Response({'error': 'Pickup not found'}, status=status.HTTP_404_NOT_FOUND)

        if pickup.status != 'open' or pickup.worker is not None:
            return Response({'error': 'Pickup is no longer available'}, status=status.HTTP_409_CONFLICT)

        # Accept the pickup
        pickup.worker = worker
        pickup.status = 'accepted'
        pickup.accepted_at = timezone.now()
        pickup.save()

        # Update worker pickup count
        worker.pending_pickups_count = PickupRequest.objects.filter(
            worker=worker,
            status__in=['accepted', 'in_progress']
        ).count()
        worker.save(update_fields=['pending_pickups_count'])

        # Create chat room
        ChatRoom.objects.get_or_create(
            pickup_request=pickup,
            defaults={
                'owner': pickup.owner,
                'worker': worker
            }
        )

        serializer = PickupTaskDetailSerializer(pickup)
        return Response({
            'pickup': serializer.data,
            'message': 'Pickup accepted successfully'
        }, status=status.HTTP_200_OK)


class PickupDeclineView(APIView):
    """POST /api/v1/pickups/:id/decline - Decline a pickup task."""
    permission_classes = [permissions.IsAuthenticated, IsWorker]

    def post(self, request, pickup_id):
        # For now, just return success (decline is implicit by not accepting)
        return Response({'message': 'Pickup declined'})


class PickupCollectView(APIView):
    """POST /api/v1/pickups/:id/collect - Mark pickup as collected with proof."""
    permission_classes = [permissions.IsAuthenticated, IsWorker]

    def post(self, request, pickup_id):
        worker = request.user

        try:
            pickup = PickupRequest.objects.get(id=pickup_id, worker=worker)
        except PickupRequest.DoesNotExist:
            return Response({'error': 'Pickup not found'}, status=status.HTTP_404_NOT_FOUND)

        if pickup.status not in ['accepted', 'in_progress']:
            return Response({'error': 'Invalid pickup status'}, status=status.HTTP_400_BAD_REQUEST)

        # Create proof upload
        proof_serializer = ProofUploadSerializer(
            data=request.data,
            context={'request': request, 'pickup': pickup}
        )

        if proof_serializer.is_valid():
            proof = proof_serializer.save()

            # Update pickup status
            pickup.status = 'in_progress'
            pickup.picked_at = timezone.now()
            pickup.save()

            return Response({
                'message': 'Pickup collected successfully',
                'proof_id': proof.id,
                'next_step': 'Navigate to drop-off location'
            }, status=status.HTTP_201_CREATED)

        return Response(proof_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PickupDropoffView(APIView):
    """POST /api/v1/pickups/:id/dropoff - Complete pickup with drop-off proof."""
    permission_classes = [permissions.IsAuthenticated, IsWorker]

    def post(self, request, pickup_id):
        worker = request.user

        try:
            pickup = PickupRequest.objects.get(id=pickup_id, worker=worker)
        except PickupRequest.DoesNotExist:
            return Response({'error': 'Pickup not found'}, status=status.HTTP_404_NOT_FOUND)

        if pickup.status != 'in_progress':
            return Response({'error': 'Pickup must be collected first'}, status=status.HTTP_400_BAD_REQUEST)

        # Create drop-off proof
        data = request.data.copy()
        data['type'] = 'dropoff'

        proof_serializer = ProofUploadSerializer(
            data=data,
            context={'request': request, 'pickup': pickup}
        )

        if proof_serializer.is_valid():
            proof = proof_serializer.save()

            # Complete the pickup
            pickup.status = 'completed'
            pickup.completed_at = timezone.now()
            pickup.dropoff_latitude = data.get('latitude')
            pickup.dropoff_longitude = data.get('longitude')
            pickup.save()

            # Create earnings record
            WorkerEarnings.objects.create(
                worker=worker,
                pickup_request=pickup,
                base_amount=pickup.expected_fee,
                platform_fee=pickup.expected_fee * Decimal('0.10'),  # 10% platform fee
            )

            # Update worker stats
            worker.pending_pickups_count = PickupRequest.objects.filter(
                worker=worker,
                status__in=['accepted', 'in_progress']
            ).count()
            worker.save(update_fields=['pending_pickups_count'])

            return Response({
                'message': 'Pickup completed successfully',
                'earnings_pending': True,
                'proof_id': proof.id
            }, status=status.HTTP_201_CREATED)

        return Response(proof_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WorkerEarningsView(generics.ListAPIView):
    """GET /api/v1/workers/:id/transactions - Worker earnings history."""
    serializer_class = WorkerEarningsSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorker]

    def get_queryset(self):
        worker = self.request.user
        return WorkerEarnings.objects.filter(worker=worker).order_by('-earned_at')


class WorkerPayoutRequestView(APIView):
    """POST /api/v1/workers/:id/payout-request - Request payout."""
    permission_classes = [permissions.IsAuthenticated, IsWorker]

    def post(self, request, worker_id):
        worker = request.user

        if str(worker.id) != str(worker_id):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Get pending earnings
        pending_earnings = WorkerEarnings.objects.filter(
            worker=worker,
            status='pending'
        )

        if not pending_earnings.exists():
            return Response({'error': 'No pending earnings available'}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = pending_earnings.aggregate(total=Sum('net_amount'))['total']

        # Mark as payout requested (simplified)
        pending_earnings.update(status='paid', paid_at=timezone.now())

        return Response({
            'message': 'Payout requested successfully',
            'amount': total_amount,
            'transaction_count': pending_earnings.count()
        })


class ChatMessageView(generics.ListCreateAPIView):
    """GET/POST /api/v1/chat/:task_id/message - Chat messages for a pickup."""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs['task_id']
        user = self.request.user

        try:
            pickup = PickupRequest.objects.get(id=task_id)
            chat_room = pickup.chat_room

            # Verify user is participant
            if user not in [chat_room.owner, chat_room.worker]:
                return Message.objects.none()

            return chat_room.messages.all().order_by('created_at')
        except (PickupRequest.DoesNotExist, ChatRoom.DoesNotExist):
            return Message.objects.none()

    def perform_create(self, serializer):
        task_id = self.kwargs['task_id']
        pickup = PickupRequest.objects.get(id=task_id)
        chat_room = pickup.chat_room

        serializer.save(
            sender=self.request.user,
            chat_room=chat_room
        )


class QuickRepliesView(generics.ListAPIView):
    """GET /api/v1/quick-replies - Quick reply templates."""
    serializer_class = QuickReplySerializer
    permission_classes = [permissions.IsAuthenticated, IsWorker]

    def get_queryset(self):
        return QuickReply.objects.filter(is_active=True)