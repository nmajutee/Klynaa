"""
Enhanced Worker Dashboard API views matching the specification.
Provides comprehensive worker functionality with mobile-first design considerations.
"""

from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Sum, Avg, F
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal
import json

from apps.bins.models import Bin, PickupRequest
from apps.payments.models import WorkerEarnings, PaymentTransaction
from apps.chat.models import ChatRoom, Message, QuickReply
from apps.reviews.models import Review
from .serializers import UserSerializer

try:
    from apps.bins.models import PickupProof
except ImportError:
    PickupProof = None

User = get_user_model()


class WorkerDashboardViewSet(viewsets.ViewSet):
    """
    Comprehensive Worker Dashboard API matching the specification.
    Provides overview cards, profile status, pickup management, and earnings.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_worker_status(self, worker):
        """Determine worker status with color code."""
        if not worker.is_active:
            return {'status': 'disabled', 'color': '🔴', 'label': 'Disabled'}
        elif not worker.is_verified:
            return {'status': 'verification_required', 'color': '🟡', 'label': 'Verification Required'}
        elif getattr(worker, 'is_available', True):
            return {'status': 'active', 'color': '🟢', 'label': 'Active'}
        else:
            return {'status': 'offline', 'color': '⚪', 'label': 'Offline'}

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """GET /api/users/worker/dashboard/overview/ - Dashboard overview cards."""
        worker = request.user

        # Profile & Status
        worker_status = self.get_worker_status(worker)
        profile_data = {
            'id': worker.id,
            'name': worker.get_full_name() or worker.username,
            'profile_picture': getattr(worker, 'profile_picture', None),
            'status': worker_status,
            'location': {
                'latitude': getattr(worker, 'latitude', None),
                'longitude': getattr(worker, 'longitude', None)
            }
        }

        # Calculate dashboard stats
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)

        # Pickup counts
        my_pickups = PickupRequest.objects.filter(worker=worker)
        pending_pickups = my_pickups.filter(status__in=['accepted', 'in_progress']).count()
        completed_pickups = my_pickups.filter(status='completed').count()

        # Earnings calculation (XAF - Central African Franc as per spec)
        earnings_qs = WorkerEarnings.objects.filter(worker=worker)
        total_earnings = earnings_qs.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        # Convert to XAF (assuming 1 USD = 600 XAF for example)
        total_earnings_xaf = total_earnings * Decimal('600')

        # Average rating
        reviews = Review.objects.filter(worker=worker)
        avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0
        total_reviews = reviews.count()

        # Overview cards data
        overview_cards = {
            'total_earnings': {
                'value': float(total_earnings_xaf),
                'currency': 'XAF',
                'formatted': f'{total_earnings_xaf:,.0f} XAF',
                'icon': '💰',
                'color': 'green'
            },
            'pending_pickups': {
                'value': pending_pickups,
                'label': 'Pending Pickups',
                'icon': '📋',
                'color': 'orange'
            },
            'completed_pickups': {
                'value': completed_pickups,
                'label': 'Completed Pickups',
                'icon': '✅',
                'color': 'green'
            },
            'average_rating': {
                'value': round(avg_rating, 1) if avg_rating else 0,
                'total_reviews': total_reviews,
                'formatted': f'{avg_rating:.1f} ⭐ ({total_reviews})' if avg_rating else 'No ratings',
                'icon': '⭐',
                'color': 'yellow'
            }
        }

        return Response({
            'profile': profile_data,
            'overview_cards': overview_cards,
            'quick_stats': {
                'completed_today': my_pickups.filter(
                    status='completed',
                    completed_at__date=today
                ).count(),
                'completed_this_week': my_pickups.filter(
                    status='completed',
                    completed_at__date__gte=week_start
                ).count(),
                'completed_this_month': my_pickups.filter(
                    status='completed',
                    completed_at__date__gte=month_start
                ).count(),
            }
        })

    @action(detail=False, methods=['get'])
    def pending_pickups(self, request):
        """GET /api/users/worker/dashboard/pending_pickups/ - Pending pickups list."""
        worker = request.user

        pending_pickups = PickupRequest.objects.filter(
            worker=worker,
            status__in=['accepted', 'in_progress']
        ).select_related('owner', 'bin').order_by('-created_at')

        pickups_data = []
        for pickup in pending_pickups:
            pickup_data = {
                'id': pickup.id,
                'owner_name': pickup.owner.get_full_name() or pickup.owner.username,
                'owner_phone': getattr(pickup.owner, 'phone_number', None),
                'location': {
                    'address': pickup.bin.address if pickup.bin else 'Location not specified',
                    'latitude': pickup.bin.latitude if pickup.bin else None,
                    'longitude': pickup.bin.longitude if pickup.bin else None,
                },
                'status': pickup.status,
                'status_display': pickup.get_status_display(),
                'time_date': pickup.created_at.isoformat(),
                'formatted_time': pickup.created_at.strftime('%d %b %Y, %I:%M %p'),
                'expected_fee': float(pickup.expected_fee),
                'waste_type': pickup.waste_type,
                'estimated_weight': float(pickup.estimated_weight_kg) if pickup.estimated_weight_kg else None,
                'notes': pickup.notes,
                'actions': {
                    'can_accept': pickup.status == 'open',
                    'can_decline': pickup.status in ['open', 'accepted'],
                    'can_start': pickup.status == 'accepted',
                    'can_complete': pickup.status == 'in_progress',
                    'can_report': True,
                    'can_chat': pickup.status in ['accepted', 'in_progress']
                }
            }
            pickups_data.append(pickup_data)

        return Response({
            'count': len(pickups_data),
            'pending_pickups': pickups_data
        })

    @action(detail=False, methods=['get'])
    def completed_pickups(self, request):
        """GET /api/users/worker/dashboard/completed_pickups/ - Completed pickups history."""
        worker = request.user
        page_size = int(request.query_params.get('page_size', 20))

        completed_pickups = PickupRequest.objects.filter(
            worker=worker,
            status='completed'
        ).select_related('owner', 'bin').order_by('-completed_at')[:page_size]

        pickups_data = []
        for pickup in completed_pickups:
            # Get review if exists
            try:
                review = Review.objects.get(worker=worker, pickup_request=pickup)
                rating_data = {
                    'rating': review.rating,
                    'comment': review.comment,
                    'created_at': review.created_at.isoformat()
                }
            except Review.DoesNotExist:
                rating_data = None

            pickup_data = {
                'id': pickup.id,
                'owner_name': pickup.owner.get_full_name() or pickup.owner.username,
                'location': pickup.bin.address if pickup.bin else 'Unknown location',
                'completed_date': pickup.completed_at.strftime('%d %b %Y'),
                'completed_time': pickup.completed_at.strftime('%I:%M %p'),
                'actual_fee': float(pickup.actual_fee) if pickup.actual_fee else float(pickup.expected_fee),
                'rating': rating_data,
                'waste_type': pickup.waste_type,
                'pickup_proof': {
                    'has_proof': hasattr(pickup, 'pickup_proof'),
                    'status': getattr(pickup.pickup_proof, 'status', None) if hasattr(pickup, 'pickup_proof') else None
                }
            }
            pickups_data.append(pickup_data)

        return Response({
            'count': len(pickups_data),
            'completed_pickups': pickups_data
        })

    @action(detail=False, methods=['get'])
    def available_pickups(self, request):
        """GET /api/users/worker/dashboard/available_pickups/ - Available bins for pickup."""
        worker = request.user

        # Get worker's location for distance calculation
        worker_lat = getattr(worker, 'latitude', None)
        worker_lng = getattr(worker, 'longitude', None)

        # Available pickups (not assigned to any worker)
        available_pickups = PickupRequest.objects.filter(
            status='open'
        ).select_related('owner', 'bin').order_by('-created_at')

        # If worker has location, filter by service radius (default 10km)
        service_radius = getattr(worker, 'service_radius_km', 10)

        pickups_data = []
        for pickup in available_pickups:
            if pickup.bin and pickup.bin.latitude and pickup.bin.longitude:
                # Calculate approximate distance if worker location is available
                distance_km = None
                if worker_lat and worker_lng:
                    # Simple distance calculation (not perfectly accurate but good enough)
                    lat_diff = abs(float(pickup.bin.latitude) - float(worker_lat))
                    lng_diff = abs(float(pickup.bin.longitude) - float(worker_lng))
                    # Rough distance in km (1 degree ≈ 111 km)
                    distance_km = ((lat_diff ** 2 + lng_diff ** 2) ** 0.5) * 111

                    # Skip if outside service radius
                    if distance_km > service_radius:
                        continue

                pickup_data = {
                    'id': pickup.id,
                    'owner_name': pickup.owner.get_full_name() or pickup.owner.username,
                    'location': {
                        'address': pickup.bin.address,
                        'latitude': float(pickup.bin.latitude),
                        'longitude': float(pickup.bin.longitude),
                        'distance_km': round(distance_km, 1) if distance_km else None
                    },
                    'expected_fee': float(pickup.expected_fee),
                    'waste_type': pickup.waste_type,
                    'estimated_weight': float(pickup.estimated_weight_kg) if pickup.estimated_weight_kg else None,
                    'created_at': pickup.created_at.isoformat(),
                    'formatted_time': pickup.created_at.strftime('%d %b %Y, %I:%M %p'),
                    'urgency': 'high' if pickup.created_at < timezone.now() - timedelta(hours=24) else 'normal',
                    'bin_status': pickup.bin.status,
                    'fill_level': pickup.bin.fill_level if hasattr(pickup.bin, 'fill_level') else None
                }
                pickups_data.append(pickup_data)

        # Sort by distance if available, then by time
        if worker_lat and worker_lng:
            pickups_data.sort(key=lambda x: (x['location']['distance_km'] or 999, x['created_at']))

        return Response({
            'count': len(pickups_data),
            'worker_location': {
                'latitude': worker_lat,
                'longitude': worker_lng,
                'service_radius_km': service_radius
            },
            'available_pickups': pickups_data[:50]  # Limit to 50 for mobile performance
        })

    @action(detail=False, methods=['patch'])
    def update_status(self, request):
        """PATCH /api/users/worker/dashboard/update_status/ - Toggle worker availability."""
        worker = request.user
        is_available = request.data.get('is_available')

        if is_available is not None:
            # Update worker availability (you may need to add this field to User model)
            if hasattr(worker, 'is_available'):
                worker.is_available = bool(is_available)
                worker.save()

        # Update location if provided
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')

        if latitude is not None and longitude is not None:
            worker.latitude = float(latitude)
            worker.longitude = float(longitude)
            worker.save()

        return Response({
            'status': self.get_worker_status(worker),
            'location': {
                'latitude': getattr(worker, 'latitude', None),
                'longitude': getattr(worker, 'longitude', None)
            },
            'updated_at': timezone.now().isoformat()
        })


class PickupActionViewSet(viewsets.ViewSet):
    """Handle pickup actions: accept, decline, start, complete, report."""
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """POST /api/users/worker/pickups/{id}/accept/ - Accept a pickup."""
        try:
            pickup = PickupRequest.objects.get(id=pk, status='open')
        except PickupRequest.DoesNotExist:
            return Response(
                {'error': 'Pickup not found or not available'},
                status=status.HTTP_404_NOT_FOUND
            )

        worker = request.user

        # Check if worker can accept more pickups
        current_pickups = PickupRequest.objects.filter(
            worker=worker,
            status__in=['accepted', 'in_progress']
        ).count()

        max_concurrent = getattr(worker, 'max_concurrent_pickups', 3)
        if current_pickups >= max_concurrent:
            return Response(
                {'error': f'You can only handle {max_concurrent} pickups at once'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Accept the pickup
        pickup.worker = worker
        pickup.status = 'accepted'
        pickup.accepted_at = timezone.now()
        pickup.save()

        # Create chat room for communication
        chat_room, created = ChatRoom.objects.get_or_create(
            pickup_request=pickup,
            defaults={
                'customer': pickup.owner,
                'worker': worker,
                'is_active': True
            }
        )

        return Response({
            'message': 'Pickup accepted successfully',
            'pickup_id': pickup.id,
            'chat_room_id': chat_room.id,
            'customer': {
                'name': pickup.owner.get_full_name() or pickup.owner.username,
                'phone': getattr(pickup.owner, 'phone_number', None)
            }
        })

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """POST /api/users/worker/pickups/{id}/decline/ - Decline a pickup."""
        try:
            pickup = PickupRequest.objects.get(
                Q(id=pk) & (Q(status='open') | Q(worker=request.user, status='accepted'))
            )
        except PickupRequest.DoesNotExist:
            return Response(
                {'error': 'Pickup not found or cannot be declined'},
                status=status.HTTP_404_NOT_FOUND
            )

        decline_reason = request.data.get('reason', 'No reason provided')

        # Reset pickup to open status
        pickup.worker = None
        pickup.status = 'open'
        pickup.accepted_at = None
        pickup.decline_reason = decline_reason
        pickup.save()

        return Response({'message': 'Pickup declined successfully'})

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """POST /api/users/worker/pickups/{id}/start/ - Start pickup (mark in progress)."""
        try:
            pickup = PickupRequest.objects.get(
                id=pk, worker=request.user, status='accepted'
            )
        except PickupRequest.DoesNotExist:
            return Response(
                {'error': 'Pickup not found or not in accepted state'},
                status=status.HTTP_404_NOT_FOUND
            )

        pickup.status = 'in_progress'
        pickup.picked_at = timezone.now()
        pickup.save()

        return Response({
            'message': 'Pickup started successfully',
            'status': 'in_progress',
            'started_at': pickup.picked_at.isoformat()
        })

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """POST /api/users/worker/pickups/{id}/complete/ - Complete pickup."""
        try:
            pickup = PickupRequest.objects.get(
                id=pk, worker=request.user, status='in_progress'
            )
        except PickupRequest.DoesNotExist:
            return Response(
                {'error': 'Pickup not found or not in progress'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get completion data
        actual_weight = request.data.get('actual_weight_kg')
        completion_notes = request.data.get('notes', '')

        # Calculate actual fee based on weight if provided
        if actual_weight:
            pickup.actual_weight_kg = Decimal(str(actual_weight))
            # Recalculate fee based on actual weight
            base_rate = Decimal('20.00')  # XAF per kg
            pickup.actual_fee = pickup.actual_weight_kg * base_rate
        else:
            pickup.actual_fee = pickup.expected_fee

        pickup.status = 'completed'
        pickup.completed_at = timezone.now()
        pickup.completion_notes = completion_notes
        pickup.save()

        # Create worker earnings record
        WorkerEarnings.objects.create(
            worker=request.user,
            pickup_request=pickup,
            base_amount=pickup.actual_fee,
            net_amount=pickup.actual_fee,
            status='pending',  # Pending payout
            earned_at=pickup.completed_at
        )

        return Response({
            'message': 'Pickup completed successfully',
            'actual_fee': float(pickup.actual_fee),
            'completed_at': pickup.completed_at.isoformat(),
            'earnings_added': True
        })

    @action(detail=True, methods=['post'])
    def report_issue(self, request, pk=None):
        """POST /api/users/worker/pickups/{id}/report_issue/ - Report issue with pickup."""
        try:
            pickup = PickupRequest.objects.get(id=pk, worker=request.user)
        except PickupRequest.DoesNotExist:
            return Response(
                {'error': 'Pickup not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        issue_type = request.data.get('issue_type', 'other')
        issue_description = request.data.get('description', '')

        # Create issue report (you may want to create a separate IssueReport model)
        pickup.status = 'disputed'
        pickup.dispute_reason = f"{issue_type}: {issue_description}"
        pickup.disputed_at = timezone.now()
        pickup.save()

        return Response({
            'message': 'Issue reported successfully',
            'status': 'disputed',
            'reported_at': pickup.disputed_at.isoformat()
        })


class WorkerEarningsView(APIView):
    """Handle worker earnings tracking and history."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """GET /api/users/worker/earnings/ - Get earnings data with filters."""
        worker = request.user
        filter_period = request.query_params.get('period', 'all')  # daily, weekly, monthly, all

        today = timezone.now().date()

        # Base queryset
        earnings_qs = WorkerEarnings.objects.filter(worker=worker)

        # Apply date filters
        if filter_period == 'daily':
            earnings_qs = earnings_qs.filter(earned_at__date=today)
        elif filter_period == 'weekly':
            week_start = today - timedelta(days=today.weekday())
            earnings_qs = earnings_qs.filter(earned_at__date__gte=week_start)
        elif filter_period == 'monthly':
            month_start = today.replace(day=1)
            earnings_qs = earnings_qs.filter(earned_at__date__gte=month_start)

        # Calculate totals
        totals = earnings_qs.aggregate(
            total_amount=Sum('net_amount'),
            pending_amount=Sum('net_amount', filter=Q(status='pending')),
            paid_amount=Sum('net_amount', filter=Q(status='paid'))
        )

        # Convert to XAF
        conversion_rate = Decimal('600')  # 1 USD = 600 XAF
        total_xaf = (totals['total_amount'] or 0) * conversion_rate
        pending_xaf = (totals['pending_amount'] or 0) * conversion_rate
        paid_xaf = (totals['paid_amount'] or 0) * conversion_rate

        # Transaction history
        transactions = []
        for earning in earnings_qs.select_related('pickup_request').order_by('-earned_at')[:20]:
            transactions.append({
                'id': earning.id,
                'pickup_id': earning.pickup_request.id,
                'amount': float(earning.net_amount),
                'amount_xaf': float(earning.net_amount * conversion_rate),
                'status': earning.status,
                'earned_at': earning.earned_at.isoformat(),
                'formatted_date': earning.earned_at.strftime('%d %b %Y, %I:%M %p'),
                'customer_name': earning.pickup_request.owner.get_full_name() or earning.pickup_request.owner.username,
                'location': earning.pickup_request.bin.address if earning.pickup_request.bin else 'Unknown',
                'payout_date': earning.payout_date.isoformat() if earning.payout_date else None
            })

        return Response({
            'period': filter_period,
            'summary': {
                'total_earnings': {
                    'usd': float(totals['total_amount'] or 0),
                    'xaf': float(total_xaf),
                    'formatted': f'{total_xaf:,.0f} XAF'
                },
                'pending_earnings': {
                    'usd': float(totals['pending_amount'] or 0),
                    'xaf': float(pending_xaf),
                    'formatted': f'{pending_xaf:,.0f} XAF'
                },
                'paid_earnings': {
                    'usd': float(totals['paid_amount'] or 0),
                    'xaf': float(paid_xaf),
                    'formatted': f'{paid_xaf:,.0f} XAF'
                }
            },
            'transactions': transactions,
            'can_request_payout': pending_xaf >= 10000  # Minimum 10,000 XAF for payout
        })

    def post(self, request):
        """POST /api/users/worker/earnings/ - Request payout."""
        worker = request.user

        # Calculate pending earnings
        pending_earnings = WorkerEarnings.objects.filter(
            worker=worker,
            status='pending'
        ).aggregate(total=Sum('net_amount'))['total'] or Decimal('0')

        conversion_rate = Decimal('600')
        pending_xaf = pending_earnings * conversion_rate

        # Minimum payout threshold
        min_payout = Decimal('10000')  # 10,000 XAF
        if pending_xaf < min_payout:
            return Response(
                {'error': f'Minimum payout amount is {min_payout:,.0f} XAF'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create payout request (you may want a separate PayoutRequest model)
        payout_method = request.data.get('method', 'mobile_money')
        payout_details = request.data.get('details', {})

        # For now, just mark earnings as requested
        WorkerEarnings.objects.filter(
            worker=worker,
            status='pending'
        ).update(
            status='payout_requested',
            payout_requested_at=timezone.now()
        )

        return Response({
            'message': 'Payout requested successfully',
            'amount_xaf': float(pending_xaf),
            'method': payout_method,
            'status': 'processing'
        })


class WorkerChatView(APIView):
    """Handle worker chat functionality."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, room_id):
        """GET /api/users/worker/chat/{room_id}/ - Get chat messages."""
        try:
            chat_room = ChatRoom.objects.get(
                id=room_id,
                worker=request.user,
                is_active=True
            )
        except ChatRoom.DoesNotExist:
            return Response(
                {'error': 'Chat room not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get messages
        messages = Message.objects.filter(
            chat_room=chat_room
        ).select_related('sender').order_by('created_at')

        messages_data = []
        for msg in messages:
            messages_data.append({
                'id': msg.id,
                'sender': {
                    'id': msg.sender.id,
                    'name': msg.sender.get_full_name() or msg.sender.username,
                    'is_worker': msg.sender == request.user
                },
                'message': msg.content,
                'image_url': msg.image.url if msg.image else None,
                'created_at': msg.created_at.isoformat(),
                'formatted_time': msg.created_at.strftime('%I:%M %p')
            })

        # Get quick replies
        quick_replies = QuickReply.objects.filter(is_active=True)
        quick_replies_data = [
            {'id': qr.id, 'text': qr.text}
            for qr in quick_replies
        ]

        return Response({
            'room_id': chat_room.id,
            'customer': {
                'name': chat_room.customer.get_full_name() or chat_room.customer.username,
                'phone': getattr(chat_room.customer, 'phone_number', None)
            },
            'pickup': {
                'id': chat_room.pickup_request.id,
                'status': chat_room.pickup_request.status,
                'location': chat_room.pickup_request.bin.address if chat_room.pickup_request.bin else None
            },
            'messages': messages_data,
            'quick_replies': quick_replies_data
        })

    def post(self, request, room_id):
        """POST /api/users/worker/chat/{room_id}/ - Send message."""
        try:
            chat_room = ChatRoom.objects.get(
                id=room_id,
                worker=request.user,
                is_active=True
            )
        except ChatRoom.DoesNotExist:
            return Response(
                {'error': 'Chat room not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        message_text = request.data.get('message', '').strip()
        image = request.FILES.get('image')

        if not message_text and not image:
            return Response(
                {'error': 'Message text or image required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create message
        message = Message.objects.create(
            chat_room=chat_room,
            sender=request.user,
            content=message_text,
            image=image
        )

        # Update chat room last activity
        chat_room.updated_at = timezone.now()
        chat_room.save()

        return Response({
            'message_id': message.id,
            'sent_at': message.created_at.isoformat(),
            'status': 'sent'
        })


# Quick replies management
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_quick_replies(request):
    """GET /api/users/worker/quick-replies/ - Get predefined quick replies."""
    quick_replies = QuickReply.objects.filter(is_active=True).order_by('order')

    replies_data = []
    for reply in quick_replies:
        replies_data.append({
            'id': reply.id,
            'text': reply.text,
            'category': getattr(reply, 'category', 'general')
        })

    # Add default quick replies if none exist
    if not replies_data:
        replies_data = [
            {'id': 1, 'text': 'On my way! 🚗', 'category': 'status'},
            {'id': 2, 'text': 'I have arrived 📍', 'category': 'status'},
            {'id': 3, 'text': 'Waste collected ✅', 'category': 'status'},
            {'id': 4, 'text': 'Running a few minutes late ⏰', 'category': 'status'},
            {'id': 5, 'text': 'Could you please bring the bin outside? 🗑️', 'category': 'request'},
            {'id': 6, 'text': 'Thank you for using our service! 🙏', 'category': 'courtesy'}
        ]

    return Response({'quick_replies': replies_data})


# ===== NEW ROUTE OPTIMIZATION VIEWS =====

class OptimizedPickupsView(APIView):
    """GET /api/v1/workers/optimized-pickups/ - Get optimized pickup recommendations."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from apps.bins.route_optimization import RouteOptimizationService
        from django.contrib.gis.geos import Point

        worker = request.user

        # Get parameters
        radius_km = float(request.GET.get('radius', 10.0))
        max_pickups = int(request.GET.get('max_pickups', 10))
        algorithm = request.GET.get('algorithm', 'nearest_neighbor')  # nearest_neighbor, greedy

        # Get worker location
        worker_lat = getattr(worker, 'latitude', None)
        worker_lng = getattr(worker, 'longitude', None)

        if not worker_lat or not worker_lng:
            return Response({
                'error': 'Worker location not available. Please update your location in settings.',
                'pickups': [],
                'route': {}
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            worker_location = Point(
                float(worker_lng),
                float(worker_lat),
                srid=4326
            )
        except (ValueError, TypeError):
            return Response({
                'error': 'Invalid worker location coordinates',
                'pickups': [],
                'route': {}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Find nearby available pickups
        nearby_pickups = RouteOptimizationService.find_nearest_available_pickups(
            worker_location,
            radius_km,
            max_pickups
        )

        # Calculate optimized route
        optimized_route = RouteOptimizationService.calculate_optimal_route(
            worker_location,
            nearby_pickups,
            algorithm
        )

        # Serialize pickup data
        pickup_data = []
        for route_item in optimized_route['route']:
            pickup = route_item['pickup']
            pickup_info = {
                'id': pickup.id,
                'bin_id': pickup.bin.bin_id,
                'address': pickup.bin.address,
                'latitude': float(pickup.bin.latitude),
                'longitude': float(pickup.bin.longitude),
                'expected_fee': float(pickup.expected_fee),
                'waste_type': pickup.waste_type,
                'status': pickup.status,
                'created_at': pickup.created_at.isoformat(),
                'estimated_weight_kg': float(pickup.estimated_weight_kg) if pickup.estimated_weight_kg else None,
                'distance_from_previous': route_item['distance_from_previous'],
                'route_order': optimized_route['pickup_order'].index(pickup.id) + 1,
                'notes': pickup.notes,
                'customer_name': pickup.owner.get_full_name() or pickup.owner.username,
                'customer_phone': getattr(pickup.owner, 'phone', None),
            }
            pickup_data.append(pickup_info)

        return Response({
            'worker_location': {
                'latitude': float(worker_lat),
                'longitude': float(worker_lng)
            },
            'search_params': {
                'radius_km': radius_km,
                'max_pickups': max_pickups,
                'algorithm': algorithm
            },
            'route_optimization': {
                'total_distance_km': optimized_route['total_distance_km'],
                'estimated_time_minutes': optimized_route['estimated_time_minutes'],
                'pickup_count': len(optimized_route['route']),
                'algorithm_used': optimized_route['algorithm_used'],
                'total_expected_earnings': sum(float(p['expected_fee']) for p in pickup_data)
            },
            'pickups': pickup_data
        })


class RouteOptimizationView(APIView):
    """POST /api/v1/workers/optimize-route/ - Optimize route for selected pickups."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from apps.bins.route_optimization import RouteOptimizationService
        from django.contrib.gis.geos import Point

        pickup_ids = request.data.get('pickup_ids', [])
        algorithm = request.data.get('algorithm', 'nearest_neighbor')

        if not pickup_ids:
            return Response({
                'error': 'No pickup IDs provided'
            }, status=status.HTTP_400_BAD_REQUEST)

        worker = request.user
        worker_lat = getattr(worker, 'latitude', None)
        worker_lng = getattr(worker, 'longitude', None)

        if not worker_lat or not worker_lng:
            return Response({
                'error': 'Worker location not available'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            worker_location = Point(
                float(worker_lng),
                float(worker_lat),
                srid=4326
            )
        except (ValueError, TypeError):
            return Response({
                'error': 'Invalid worker location coordinates'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get pickup requests
        pickups = PickupRequest.objects.filter(
            id__in=pickup_ids,
            status='open'
        ).select_related('bin', 'owner')

        if not pickups.exists():
            return Response({
                'error': 'No valid pickup requests found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Calculate optimized route
        optimized_route = RouteOptimizationService.calculate_optimal_route(
            worker_location,
            list(pickups),
            algorithm
        )

        return Response({
            'route_optimization': optimized_route,
            'worker_location': {
                'latitude': float(worker_lat),
                'longitude': float(worker_lng)
            }
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def batch_accept_optimized_route(request):
    """
    POST /api/v1/workers/batch-accept-route/
    Accept multiple pickups from an optimized route in one action.
    """
    pickup_ids = request.data.get('pickup_ids', [])

    if not pickup_ids:
        return Response({
            'error': 'No pickup IDs provided'
        }, status=status.HTTP_400_BAD_REQUEST)

    worker = request.user

    # Validate all pickups are available
    available_pickups = PickupRequest.objects.filter(
        id__in=pickup_ids,
        status='open'
    )

    if len(available_pickups) != len(pickup_ids):
        unavailable_ids = set(pickup_ids) - set(available_pickups.values_list('id', flat=True))
        return Response({
            'error': 'Some pickups are no longer available',
            'unavailable_pickup_ids': list(unavailable_ids)
        }, status=status.HTTP_400_BAD_REQUEST)

    # Accept all pickups
    accepted_pickups = []
    for pickup in available_pickups:
        pickup.worker = worker
        pickup.status = 'accepted'
        pickup.accepted_at = timezone.now()
        pickup.save()

        accepted_pickups.append({
            'id': pickup.id,
            'address': pickup.bin.address,
            'expected_fee': float(pickup.expected_fee),
            'waste_type': pickup.waste_type
        })

    return Response({
        'success': True,
        'accepted_pickups': accepted_pickups,
        'total_pickups': len(accepted_pickups),
        'total_expected_earnings': sum(p['expected_fee'] for p in accepted_pickups),
        'message': f'Successfully accepted {len(accepted_pickups)} pickups'
    })


# ===== PICKUP SCHEDULING VIEWS =====

class PickupSchedulingView(APIView):
    """POST /api/v1/workers/auto-assign-pickup/ - Auto-assign pickup to optimal worker."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from apps.bins.pickup_scheduling import PickupSchedulingService

        pickup_id = request.data.get('pickup_id')

        if not pickup_id:
            return Response({
                'error': 'pickup_id required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            pickup_request = PickupRequest.objects.select_related('bin', 'owner').get(
                id=pickup_id
            )
        except PickupRequest.DoesNotExist:
            return Response({
                'error': 'Pickup request not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Auto-assign the pickup
        assignment_result = PickupSchedulingService.auto_assign_pickup(pickup_request)

        if assignment_result['success']:
            return Response(assignment_result)
        else:
            return Response(assignment_result, status=status.HTTP_400_BAD_REQUEST)


class BatchSchedulingView(APIView):
    """POST /api/v1/workers/batch-schedule/ - Schedule multiple pickups across workers."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from apps.bins.pickup_scheduling import PickupSchedulingService

        pickup_ids = request.data.get('pickup_ids', [])

        if not pickup_ids:
            return Response({
                'error': 'pickup_ids array required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get pickup requests
        pickup_requests = PickupRequest.objects.filter(
            id__in=pickup_ids
        ).select_related('bin', 'owner')

        if not pickup_requests.exists():
            return Response({
                'error': 'No valid pickup requests found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Schedule the pickups
        scheduling_result = PickupSchedulingService.schedule_batch_pickups(list(pickup_requests))

        return Response(scheduling_result)


class WorkerScheduleView(APIView):
    """GET /api/v1/workers/{worker_id}/schedule/ - Get worker's schedule for a date."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, worker_id=None):
        from apps.bins.pickup_scheduling import PickupSchedulingService
        from datetime import datetime

        # Use current user if no worker_id specified, otherwise check permissions
        if worker_id is None:
            worker = request.user
        else:
            try:
                worker = User.objects.get(id=worker_id)
                # Only allow workers to see their own schedule unless admin
                if request.user != worker and not getattr(request.user, 'is_staff', False):
                    return Response({
                        'error': 'Permission denied'
                    }, status=status.HTTP_403_FORBIDDEN)
            except User.DoesNotExist:
                return Response({
                    'error': 'Worker not found'
                }, status=status.HTTP_404_NOT_FOUND)

        # Get date parameter
        date_str = request.GET.get('date', None)
        schedule_date = None
        if date_str:
            try:
                schedule_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({
                    'error': 'Invalid date format. Use YYYY-MM-DD'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Get worker schedule
        schedule = PickupSchedulingService.get_worker_schedule(worker, schedule_date)

        return Response(schedule)


class RouteReoptimizationView(APIView):
    """POST /api/v1/workers/reoptimize-route/ - Reoptimize worker's current route."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from apps.bins.pickup_scheduling import PickupSchedulingService

        worker = request.user

        # Reoptimize the worker's route
        optimization_result = PickupSchedulingService.reoptimize_worker_route(worker)

        if optimization_result['success']:
            return Response(optimization_result)
        else:
            return Response(optimization_result, status=status.HTTP_400_BAD_REQUEST)


class SchedulingAnalyticsView(APIView):
    """GET /api/v1/workers/scheduling-analytics/ - Get scheduling performance analytics."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from apps.bins.pickup_scheduling import PickupSchedulingService

        # Get scheduling analytics
        analytics = PickupSchedulingService.get_scheduling_analytics()

        return Response(analytics)