"""
Intelligent Pickup Scheduling System.

This service handles automatic worker assignment, pickup scheduling,
and real-time status updates for the waste management system.
"""

from django.utils import timezone
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.db import transaction
from django.db.models import Q, Count, Avg
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple, TYPE_CHECKING
from decimal import Decimal
import logging

from apps.bins.models import PickupRequest, Bin
from apps.bins.route_optimization import RouteOptimizationService
from apps.bins.websocket_signals import broadcast_pickup_update, broadcast_worker_update, broadcast_customer_notification
from django.contrib.auth import get_user_model

if TYPE_CHECKING:
    from django.contrib.auth.models import AbstractUser

User = get_user_model()
logger = logging.getLogger(__name__)


class PickupSchedulingService:
    """Service for intelligent pickup scheduling and worker assignment."""

    @staticmethod
    def auto_assign_pickup(pickup_request: PickupRequest) -> Dict:
        """
        Automatically assign the best available worker to a pickup request.

        Args:
            pickup_request: The pickup request to assign

        Returns:
            Dictionary with assignment result and worker details
        """
        if pickup_request.status != 'open':
            return {
                'success': False,
                'error': 'Pickup request is not available for assignment',
                'current_status': pickup_request.status
            }

        # Find optimal worker using route optimization
        optimal_worker = RouteOptimizationService.assign_optimal_worker(pickup_request)

        if not optimal_worker:
            return {
                'success': False,
                'error': 'No suitable worker found',
                'factors_considered': [
                    'worker_availability',
                    'distance_from_pickup',
                    'service_radius',
                    'current_workload',
                    'worker_rating'
                ]
            }

        # Calculate assignment score and details
        worker_location = None
        distance_km = None
        if hasattr(optimal_worker, 'latitude') and hasattr(optimal_worker, 'longitude'):
            if optimal_worker.latitude and optimal_worker.longitude:
                worker_location = Point(
                    float(optimal_worker.longitude),
                    float(optimal_worker.latitude),
                    srid=4326
                )
                pickup_location = Point(
                    float(pickup_request.bin.longitude),
                    float(pickup_request.bin.latitude),
                    srid=4326
                )
                distance_km = pickup_location.distance(worker_location) * 111

        # Assign the pickup
        with transaction.atomic():
            pickup_request.worker = optimal_worker
            pickup_request.status = 'accepted'
            pickup_request.accepted_at = timezone.now()

            # Estimate pickup completion time
            travel_time_minutes = (distance_km / 30) * 60 if distance_km else 30  # 30 km/h average
            pickup_time_minutes = 15  # Average pickup time
            estimated_completion = timezone.now() + timedelta(
                minutes=travel_time_minutes + pickup_time_minutes
            )

            pickup_request.pickup_time_window_start = timezone.now()
            pickup_request.pickup_time_window_end = estimated_completion
            pickup_request.save()

        logger.info(f"Auto-assigned pickup {pickup_request.id} to worker {optimal_worker.id}")

        return {
            'success': True,
            'pickup_id': pickup_request.id,
            'assigned_worker': {
                'id': optimal_worker.id,
                'name': optimal_worker.get_full_name() or optimal_worker.username,
                'email': optimal_worker.email,
                'phone': getattr(optimal_worker, 'phone', None),
                'rating': getattr(optimal_worker, 'average_rating', None),
                'distance_km': round(distance_km, 2) if distance_km else None,
                'estimated_arrival_minutes': round(travel_time_minutes) if distance_km else None
            },
            'estimated_completion': estimated_completion.isoformat(),
            'assignment_score': {
                'distance_score': max(0, 10 - distance_km) if distance_km else 5,
                'availability_score': PickupSchedulingService._calculate_availability_score(optimal_worker),
                'rating_score': float(getattr(optimal_worker, 'average_rating', 4.0))
            }
        }

    @staticmethod
    def _calculate_availability_score(worker: 'AbstractUser') -> float:
        """Calculate worker availability score based on current workload."""
        active_pickups = PickupRequest.objects.filter(
            worker=worker,
            status__in=['accepted', 'in_progress']
        ).count()

        # Score decreases as workload increases
        return max(0, 10 - active_pickups * 2)

    @staticmethod
    def schedule_batch_pickups(pickup_requests: List[PickupRequest]) -> Dict:
        """
        Schedule multiple pickup requests optimally across available workers.

        Args:
            pickup_requests: List of pickup requests to schedule

        Returns:
            Dictionary with batch scheduling results
        """
        results = {
            'total_pickups': len(pickup_requests),
            'assigned_pickups': 0,
            'unassigned_pickups': 0,
            'assignments': [],
            'errors': []
        }

        for pickup_request in pickup_requests:
            if pickup_request.status != 'open':
                results['errors'].append({
                    'pickup_id': pickup_request.id,
                    'error': f'Pickup not available (status: {pickup_request.status})'
                })
                continue

            assignment_result = PickupSchedulingService.auto_assign_pickup(pickup_request)

            if assignment_result['success']:
                results['assigned_pickups'] += 1
                results['assignments'].append({
                    'pickup_id': pickup_request.id,
                    'worker_id': assignment_result['assigned_worker']['id'],
                    'worker_name': assignment_result['assigned_worker']['name'],
                    'estimated_completion': assignment_result['estimated_completion']
                })
            else:
                results['unassigned_pickups'] += 1
                results['errors'].append({
                    'pickup_id': pickup_request.id,
                    'error': assignment_result.get('error', 'Assignment failed')
                })

        logger.info(f"Batch scheduling completed: {results['assigned_pickups']}/{results['total_pickups']} assigned")
        return results

    @staticmethod
    def get_worker_schedule(worker: 'AbstractUser', date: Optional[datetime] = None) -> Dict:
        """
        Get a worker's schedule for a specific date.

        Args:
            worker: Worker user object
            date: Date to get schedule for (defaults to today)

        Returns:
            Dictionary with worker's schedule information
        """
        if date is None:
            date = timezone.now().date()

        # Get pickups for the specified date
        pickups = PickupRequest.objects.filter(
            worker=worker,
            accepted_at__date=date
        ).select_related('bin', 'owner').order_by('pickup_time_window_start')

        schedule_items = []
        total_earnings = Decimal('0.00')
        total_distance = 0.0

        worker_location = None
        if hasattr(worker, 'latitude') and hasattr(worker, 'longitude'):
            if worker.latitude and worker.longitude:
                worker_location = Point(
                    float(worker.longitude),
                    float(worker.latitude),
                    srid=4326
                )

        previous_location = worker_location

        for pickup in pickups:
            pickup_location = None
            distance_from_previous = 0

            if pickup.bin.latitude and pickup.bin.longitude:
                pickup_location = Point(
                    float(pickup.bin.longitude),
                    float(pickup.bin.latitude),
                    srid=4326
                )

                if previous_location:
                    distance_from_previous = pickup_location.distance(previous_location) * 111

            schedule_items.append({
                'pickup_id': pickup.id,
                'status': pickup.status,
                'address': pickup.bin.address,
                'customer_name': pickup.owner.get_full_name() or pickup.owner.username,
                'customer_phone': getattr(pickup.owner, 'phone', None),
                'expected_fee': float(pickup.expected_fee),
                'waste_type': pickup.waste_type,
                'estimated_weight_kg': float(pickup.estimated_weight_kg) if pickup.estimated_weight_kg else None,
                'time_window_start': pickup.pickup_time_window_start.isoformat() if pickup.pickup_time_window_start else None,
                'time_window_end': pickup.pickup_time_window_end.isoformat() if pickup.pickup_time_window_end else None,
                'distance_from_previous_km': round(distance_from_previous, 2),
                'coordinates': {
                    'latitude': float(pickup.bin.latitude),
                    'longitude': float(pickup.bin.longitude)
                },
                'notes': pickup.notes
            })

            total_earnings += pickup.expected_fee
            total_distance += distance_from_previous
            previous_location = pickup_location

        # Calculate schedule efficiency
        efficiency_score = 0
        if schedule_items:
            avg_distance_between_stops = total_distance / max(len(schedule_items) - 1, 1)
            efficiency_score = max(0, 10 - avg_distance_between_stops)  # Better score for shorter distances

        return {
            'worker': {
                'id': worker.id,
                'name': worker.get_full_name() or worker.username,
                'email': worker.email,
                'current_location': {
                    'latitude': float(worker.latitude) if worker.latitude else None,
                    'longitude': float(worker.longitude) if worker.longitude else None
                } if worker_location else None
            },
            'schedule_date': date.isoformat(),
            'schedule_items': schedule_items,
            'summary': {
                'total_pickups': len(schedule_items),
                'completed_pickups': len([item for item in schedule_items if item['status'] == 'completed']),
                'pending_pickups': len([item for item in schedule_items if item['status'] in ['accepted', 'in_progress']]),
                'total_expected_earnings': float(total_earnings),
                'total_route_distance_km': round(total_distance, 2),
                'efficiency_score': round(efficiency_score, 1),
                'estimated_total_time_hours': round((total_distance / 30 + len(schedule_items) * 0.25), 1)  # Travel + pickup time
            }
        }

    @staticmethod
    def reoptimize_worker_route(worker: 'AbstractUser') -> Dict:
        """
        Reoptimize a worker's current route based on accepted pickups.

        Args:
            worker: Worker user object

        Returns:
            Dictionary with optimized route information
        """
        # Get accepted pickups for today
        today = timezone.now().date()
        accepted_pickups = PickupRequest.objects.filter(
            worker=worker,
            status='accepted',
            accepted_at__date=today
        ).select_related('bin', 'owner')

        if not accepted_pickups.exists():
            return {
                'success': False,
                'message': 'No accepted pickups found for optimization'
            }

        # Get worker location
        worker_location = None
        if hasattr(worker, 'latitude') and hasattr(worker, 'longitude'):
            if worker.latitude and worker.longitude:
                worker_location = Point(
                    float(worker.longitude),
                    float(worker.latitude),
                    srid=4326
                )

        if not worker_location:
            return {
                'success': False,
                'message': 'Worker location not available for route optimization'
            }

        # Calculate optimized route
        optimized_route = RouteOptimizationService.calculate_optimal_route(
            worker_location,
            list(accepted_pickups),
            'nearest_neighbor'
        )

        # Update pickup time windows based on optimized route
        current_time = timezone.now()

        with transaction.atomic():
            for i, route_item in enumerate(optimized_route['route']):
                pickup = route_item['pickup']

                # Calculate estimated arrival time
                cumulative_time = 0
                for j in range(i + 1):
                    cumulative_time += optimized_route['route'][j]['distance_from_previous'] / 30 * 60  # Travel time in minutes
                    if j > 0:
                        cumulative_time += 15  # Add pickup time for previous stops

                estimated_arrival = current_time + timedelta(minutes=cumulative_time)
                estimated_completion = estimated_arrival + timedelta(minutes=15)  # 15 min pickup time

                pickup.pickup_time_window_start = estimated_arrival
                pickup.pickup_time_window_end = estimated_completion
                pickup.save()

        return {
            'success': True,
            'optimized_route': optimized_route,
            'updated_pickups': len(optimized_route['route']),
            'total_optimization_savings': {
                'distance_km_saved': 0,  # Could calculate vs original route
                'time_minutes_saved': 0   # Could calculate vs original route
            }
        }

    @staticmethod
    def get_scheduling_analytics() -> Dict:
        """
        Get analytics about pickup scheduling performance.

        Returns:
            Dictionary with scheduling analytics
        """
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)

        # Get scheduling metrics
        total_pickups = PickupRequest.objects.filter(created_at__date__gte=week_ago).count()
        assigned_pickups = PickupRequest.objects.filter(
            created_at__date__gte=week_ago,
            worker__isnull=False
        ).count()

        completed_pickups = PickupRequest.objects.filter(
            created_at__date__gte=week_ago,
            status='completed'
        ).count()

        # Calculate average assignment time
        from django.db.models import F

        pickup_requests_with_delay = PickupRequest.objects.filter(
            created_at__date__gte=week_ago,
            accepted_at__isnull=False
        ).annotate(
            assignment_delay_seconds=F('accepted_at') - F('created_at')
        )

        avg_assignment_time = None
        if pickup_requests_with_delay.exists():
            total_delay = 0
            count = 0
            for pickup in pickup_requests_with_delay:
                if pickup.accepted_at and pickup.created_at:
                    delay_seconds = (pickup.accepted_at - pickup.created_at).total_seconds()
                    total_delay += delay_seconds
                    count += 1

            if count > 0:
                avg_assignment_time = total_delay / count

        # Worker utilization
        active_workers = User.objects.filter(
            user_type='worker',
            is_active=True,
            pickup_requests_as_worker__created_at__date__gte=week_ago
        ).distinct().count()

        return {
            'period': f'{week_ago} to {today}',
            'pickup_metrics': {
                'total_requests': total_pickups,
                'assigned_requests': assigned_pickups,
                'completed_requests': completed_pickups,
                'assignment_rate': round(assigned_pickups / max(total_pickups, 1) * 100, 1),
                'completion_rate': round(completed_pickups / max(assigned_pickups, 1) * 100, 1)
            },
            'timing_metrics': {
                'average_assignment_time_minutes': round(avg_assignment_time / 60, 1) if avg_assignment_time else None,
                'target_assignment_time_minutes': 15  # Target: assign within 15 minutes
            },
            'worker_metrics': {
                'active_workers': active_workers,
                'average_pickups_per_worker': round(assigned_pickups / max(active_workers, 1), 1)
            },
            'recommendations': PickupSchedulingService._generate_recommendations(
                total_pickups, assigned_pickups, completed_pickups, active_workers
            )
        }

    @staticmethod
    def _generate_recommendations(total_pickups: int, assigned_pickups: int,
                                completed_pickups: int, active_workers: int) -> List[str]:
        """Generate recommendations based on scheduling metrics."""
        recommendations = []

        assignment_rate = assigned_pickups / max(total_pickups, 1) * 100
        completion_rate = completed_pickups / max(assigned_pickups, 1) * 100

        if assignment_rate < 80:
            recommendations.append("Consider recruiting more workers to improve assignment rates")

        if completion_rate < 90:
            recommendations.append("Review worker training or incentives to improve completion rates")

        if active_workers > 0 and assigned_pickups / active_workers > 10:
            recommendations.append("Workers may be overloaded - consider hiring additional staff")

        if not recommendations:
            recommendations.append("Scheduling performance is optimal")

        return recommendations