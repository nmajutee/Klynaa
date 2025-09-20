"""
Enhanced API views with WebSocket integration for real-time updates.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import transaction
import logging

from apps.bins.models import PickupRequest, Bin
from apps.bins.pickup_scheduling import PickupSchedulingService
from apps.bins.route_optimization import RouteOptimizationService
from apps.bins.websocket_signals import (
    broadcast_pickup_update,
    broadcast_worker_update,
    broadcast_customer_notification
)

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_pickup_request_with_updates(request):
    """
    Create a new pickup request and broadcast real-time updates.
    """
    try:
        with transaction.atomic():
            # Create pickup request
            bin_id = request.data.get('bin_id')
            priority = request.data.get('priority', 'medium')
            notes = request.data.get('notes', '')

            bin_obj = get_object_or_404(Bin, id=bin_id)

            pickup_request = PickupRequest.objects.create(
                customer=request.user,
                bin=bin_obj,
                priority=priority,
                notes=notes,
                status='pending'
            )

            # Auto-assign pickup
            assignment_result = PickupSchedulingService.auto_assign_pickup(pickup_request)

            # Broadcast updates if assignment was successful
            if assignment_result['success'] and assignment_result.get('pickup'):
                pickup = assignment_result['pickup']

                # Notify customer
                broadcast_customer_notification(
                    customer_id=request.user.id,
                    notification_type='pickup_scheduled',
                    data={
                        'pickup_id': pickup.id,
                        'message': f"Your pickup has been scheduled",
                        'scheduled_time': pickup.scheduled_time.isoformat() if pickup.scheduled_time else None,
                        'worker_name': f"{pickup.worker.user.first_name} {pickup.worker.user.last_name}" if pickup.worker else None,
                        'timestamp': timezone.now().isoformat()
                    }
                )

                # Notify assigned worker
                if pickup.worker:
                    broadcast_worker_update(
                        worker_id=pickup.worker.id,
                        update_type='new_assignment',
                        data={
                            'pickup_id': pickup.id,
                            'message': f"New pickup assigned",
                            'customer_name': f"{request.user.first_name} {request.user.last_name}",
                            'bin_location': {
                                'lat': bin_obj.latitude,
                                'lng': bin_obj.longitude
                            },
                            'priority': priority,
                            'timestamp': timezone.now().isoformat()
                        }
                    )

            return Response({
                'success': True,
                'pickup_request': {
                    'id': pickup_request.id,
                    'status': pickup_request.status,
                    'priority': pickup_request.priority,
                    'created_at': pickup_request.created_at.isoformat()
                },
                'assignment': assignment_result
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Error creating pickup request: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_pickup_status_with_broadcast(request, pickup_id):
    """
    Update pickup status and broadcast real-time updates.
    """
    try:
        pickup = get_object_or_404(PickupRequest, id=pickup_id)

        # Check permissions
        if (request.user.is_staff or
            (hasattr(request.user, 'worker') and pickup.worker == request.user.worker) or
            pickup.customer == request.user):

            new_status = request.data.get('status')
            completion_notes = request.data.get('notes', '')

            old_status = pickup.status

            with transaction.atomic():
                pickup.status = new_status
                if new_status == 'completed':
                    pickup.completed_time = timezone.now()
                    if completion_notes:
                        pickup.notes = completion_notes
                pickup.save()

                # Broadcast status update
                broadcast_pickup_update(
                    pickup_id=pickup.id,
                    update_type='status_changed',
                    data={
                        'old_status': old_status,
                        'new_status': new_status,
                        'message': f"Pickup status changed from {old_status} to {new_status}",
                        'timestamp': timezone.now().isoformat(),
                        'updated_by': f"{request.user.first_name} {request.user.last_name}"
                    }
                )

                # Notify customer
                if pickup.customer:
                    broadcast_customer_notification(
                        customer_id=pickup.customer.id,
                        notification_type='status_update',
                        data={
                            'pickup_id': pickup.id,
                            'status': new_status,
                            'message': f"Your pickup is now {new_status.replace('_', ' ').title()}",
                            'timestamp': timezone.now().isoformat(),
                            'worker_name': f"{pickup.worker.user.first_name} {pickup.worker.user.last_name}" if pickup.worker else None
                        }
                    )

            return Response({
                'success': True,
                'pickup': {
                    'id': pickup.id,
                    'status': pickup.status,
                    'completed_time': pickup.completed_time.isoformat() if pickup.completed_time else None,
                    'updated_at': pickup.updated_at.isoformat()
                }
            })
        else:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)

    except Exception as e:
        logger.error(f"Error updating pickup status: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_worker_location_with_broadcast(request):
    """
    Update worker location and broadcast to relevant pickups.
    """
    try:
        if not hasattr(request.user, 'role') or request.user.role != 'worker':
            return Response({
                'success': False,
                'error': 'User is not a worker'
            }, status=status.HTTP_403_FORBIDDEN)

        worker = request.user
        lat = float(request.data.get('lat'))
        lng = float(request.data.get('lng'))

        with transaction.atomic():
            worker.latitude = lat
            worker.longitude = lng
            worker.save()

            # Broadcast location update to all active pickups
            active_pickups = PickupRequest.objects.filter(
                worker=worker,
                status__in=['assigned', 'in_progress']
            )

            for pickup in active_pickups:
                broadcast_pickup_update(
                    pickup_id=pickup.id,
                    update_type='worker_location_update',
                    data={
                        'worker_location': {
                            'lat': lat,
                            'lng': lng
                        },
                        'timestamp': timezone.now().isoformat(),
                        'worker_name': f"{worker.first_name} {worker.last_name}"
                    }
                )

                # Also notify customer
                if pickup.customer:
                    broadcast_customer_notification(
                        customer_id=pickup.customer.id,
                        notification_type='worker_location',
                        data={
                            'pickup_id': pickup.id,
                            'worker_location': {
                                'lat': lat,
                                'lng': lng
                            },
                            'message': f"Worker location updated",
                            'timestamp': timezone.now().isoformat(),
                            'worker_name': f"{worker.first_name} {worker.last_name}"
                        }
                    )

        return Response({
            'success': True,
            'location': {
                'lat': lat,
                'lng': lng,
                'updated_at': worker.updated_at.isoformat()
            },
            'active_pickups_notified': active_pickups.count()
        })

    except Exception as e:
        logger.error(f"Error updating worker location: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_route_with_updates(request):
    """
    Optimize worker route and broadcast updates.
    """
    try:
        if not hasattr(request.user, 'role') or request.user.role != 'worker':
            return Response({
                'success': False,
                'error': 'User is not a worker'
            }, status=status.HTTP_403_FORBIDDEN)

        worker = request.user

        # Get route optimization
        optimization_result = RouteOptimizationService.calculate_optimal_route(
            worker_location=(worker.latitude, worker.longitude),
            pickup_ids=request.data.get('pickup_ids', [])
        )

        if optimization_result['success']:
            # Broadcast route update to worker
            broadcast_worker_update(
                worker_id=worker.id,
                update_type='route_optimized',
                data={
                    'optimized_route': optimization_result.get('route', []),
                    'total_distance': optimization_result.get('total_distance'),
                    'estimated_time': optimization_result.get('estimated_time'),
                    'message': "Route optimized for maximum efficiency",
                    'timestamp': timezone.now().isoformat()
                }
            )

        return Response(optimization_result)

    except Exception as e:
        logger.error(f"Error optimizing route: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)