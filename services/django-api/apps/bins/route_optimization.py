"""
Advanced Route Optimization Service using PostGIS.

This service provides intelligent route planning, worker assignment,
and real-time optimization for waste collection pickups.
"""

from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.contrib.gis.db.models.functions import Distance
from django.db import models
from django.utils import timezone
from decimal import Decimal
from typing import List, Dict, Tuple, Optional
import math

from apps.bins.models import PickupRequest, Bin
from apps.users.models import User


class RouteOptimizationService:
    """Service for optimizing pickup routes using PostGIS geospatial queries."""

    @staticmethod
    def find_nearest_available_pickups(
        worker_location: Point,
        radius_km: float = 10.0,
        max_pickups: int = 10
    ) -> List[PickupRequest]:
        """
        Find nearest available pickup requests using PostGIS spatial queries.

        Args:
            worker_location: Worker's current location as PostGIS Point
            radius_km: Search radius in kilometers
            max_pickups: Maximum number of pickups to return

        Returns:
            List of PickupRequest objects ordered by distance
        """
        # Use PostGIS to find pickups within radius, ordered by distance
        pickups = PickupRequest.objects.filter(
            status='open',
            bin__location__distance_lte=(worker_location, D(km=radius_km))
        ).annotate(
            distance=Distance('bin__location', worker_location)
        ).select_related('bin', 'owner').order_by('distance')[:max_pickups]

        return list(pickups)

    @staticmethod
    def calculate_optimal_route(
        worker_location: Point,
        pickup_requests: List[PickupRequest],
        algorithm: str = 'nearest_neighbor'
    ) -> Dict:
        """
        Calculate optimal route through multiple pickup points.

        Args:
            worker_location: Starting point for the route
            pickup_requests: List of pickup requests to visit
            algorithm: Algorithm to use ('nearest_neighbor', 'genetic', 'greedy')

        Returns:
            Dictionary with optimized route information
        """
        if not pickup_requests:
            return {
                'route': [],
                'total_distance_km': 0,
                'estimated_time_minutes': 0,
                'pickup_order': []
            }

        if algorithm == 'nearest_neighbor':
            return RouteOptimizationService._nearest_neighbor_route(
                worker_location, pickup_requests
            )
        elif algorithm == 'greedy':
            return RouteOptimizationService._greedy_route(
                worker_location, pickup_requests
            )
        else:
            # Default to nearest neighbor
            return RouteOptimizationService._nearest_neighbor_route(
                worker_location, pickup_requests
            )

    @staticmethod
    def _nearest_neighbor_route(
        start_point: Point,
        pickups: List[PickupRequest]
    ) -> Dict:
        """
        Implement nearest neighbor traveling salesman approximation.
        """
        if not pickups:
            return {
                'route': [],
                'total_distance_km': 0,
                'estimated_time_minutes': 0,
                'pickup_order': []
            }

        # Convert pickups to points with IDs
        pickup_points = []
        for pickup in pickups:
            if pickup.bin.latitude and pickup.bin.longitude:
                point = Point(
                    float(pickup.bin.longitude),
                    float(pickup.bin.latitude),
                    srid=4326
                )
                pickup_points.append({
                    'id': pickup.id,
                    'pickup': pickup,
                    'point': point,
                    'visited': False
                })

        route = []
        current_point = start_point
        total_distance = 0

        while any(not p['visited'] for p in pickup_points):
            # Find nearest unvisited point
            nearest_pickup = None
            min_distance = float('inf')

            for pickup_data in pickup_points:
                if pickup_data['visited']:
                    continue

                # Use PostGIS distance calculation
                distance = current_point.distance(pickup_data['point'])
                distance_km = distance * 111  # Rough conversion to km

                if distance_km < min_distance:
                    min_distance = distance_km
                    nearest_pickup = pickup_data

            if nearest_pickup:
                nearest_pickup['visited'] = True
                route.append({
                    'pickup_id': nearest_pickup['id'],
                    'pickup': nearest_pickup['pickup'],
                    'distance_from_previous': min_distance,
                    'coordinates': {
                        'latitude': nearest_pickup['point'].y,
                        'longitude': nearest_pickup['point'].x
                    }
                })
                current_point = nearest_pickup['point']
                total_distance += min_distance

        # Estimate time (assuming 30 km/h average speed + 10 minutes per pickup)
        travel_time = (total_distance / 30) * 60  # minutes
        pickup_time = len(route) * 10  # 10 minutes per pickup
        total_time = travel_time + pickup_time

        return {
            'route': route,
            'total_distance_km': round(total_distance, 2),
            'estimated_time_minutes': round(total_time),
            'pickup_order': [r['pickup_id'] for r in route],
            'algorithm_used': 'nearest_neighbor'
        }

    @staticmethod
    def _greedy_route(
        start_point: Point,
        pickups: List[PickupRequest]
    ) -> Dict:
        """
        Implement greedy algorithm considering pickup priority and rewards.
        """
        pickup_scores = []

        for pickup in pickups:
            if pickup.bin.latitude and pickup.bin.longitude:
                point = Point(
                    float(pickup.bin.longitude),
                    float(pickup.bin.latitude),
                    srid=4326
                )
                distance = start_point.distance(point) * 111  # km

                # Calculate score based on distance, fee, and urgency
                fee_score = float(pickup.expected_fee) / 10  # Normalize fee
                distance_penalty = distance / 10  # Penalty for distance

                # Urgency bonus (older requests get higher priority)
                hours_old = (timezone.now() - pickup.created_at).total_seconds() / 3600
                urgency_bonus = min(hours_old / 24, 2)  # Max 2 point bonus for 24+ hour old requests

                score = fee_score + urgency_bonus - distance_penalty

                pickup_scores.append({
                    'pickup': pickup,
                    'point': point,
                    'score': score,
                    'distance_km': distance
                })

        # Sort by score (highest first)
        pickup_scores.sort(key=lambda x: x['score'], reverse=True)

        # Build route from highest scoring pickups
        route = []
        total_distance = 0
        current_point = start_point

        for pickup_data in pickup_scores:
            distance_from_current = current_point.distance(pickup_data['point']) * 111
            route.append({
                'pickup_id': pickup_data['pickup'].id,
                'pickup': pickup_data['pickup'],
                'distance_from_previous': distance_from_current,
                'score': pickup_data['score'],
                'coordinates': {
                    'latitude': pickup_data['point'].y,
                    'longitude': pickup_data['point'].x
                }
            })
            current_point = pickup_data['point']
            total_distance += distance_from_current

        # Estimate time
        travel_time = (total_distance / 30) * 60
        pickup_time = len(route) * 10
        total_time = travel_time + pickup_time

        return {
            'route': route,
            'total_distance_km': round(total_distance, 2),
            'estimated_time_minutes': round(total_time),
            'pickup_order': [r['pickup_id'] for r in route],
            'algorithm_used': 'greedy'
        }

    @staticmethod
    def assign_optimal_worker(pickup_request: PickupRequest) -> Optional[User]:
        """
        Find the best available worker for a pickup request using spatial queries.

        Args:
            pickup_request: The pickup request to assign

        Returns:
            User object of the best worker, or None if no suitable worker found
        """
        if not pickup_request.bin.latitude or not pickup_request.bin.longitude:
            return None

        pickup_location = Point(
            float(pickup_request.bin.longitude),
            float(pickup_request.bin.latitude),
            srid=4326
        )

        # Find workers with location data who are available
        available_workers = User.objects.filter(
            user_type='worker',
            is_active=True,
            # Add any additional availability filters here
        ).exclude(
            latitude__isnull=True,
            longitude__isnull=True
        )

        best_worker = None
        best_score = 0

        for worker in available_workers:
            try:
                worker_location = Point(
                    float(worker.longitude),
                    float(worker.latitude),
                    srid=4326
                )

                # Calculate distance
                distance_km = pickup_location.distance(worker_location) * 111

                # Check if within service radius
                service_radius = getattr(worker, 'service_radius_km', 10)
                if distance_km > service_radius:
                    continue

                # Calculate worker score based on multiple factors
                distance_score = max(0, 10 - distance_km)  # Closer is better

                # Add rating score if available
                rating_score = getattr(worker, 'average_rating', 4.0)

                # Add availability score (fewer active pickups is better)
                active_pickups = PickupRequest.objects.filter(
                    worker=worker,
                    status__in=['accepted', 'in_progress']
                ).count()
                availability_score = max(0, 5 - active_pickups)

                total_score = distance_score + rating_score + availability_score

                if total_score > best_score:
                    best_score = total_score
                    best_worker = worker

            except (ValueError, TypeError):
                continue  # Skip workers with invalid coordinates

        return best_worker

    @staticmethod
    def get_worker_service_area(worker: User, buffer_km: float = None) -> Optional[Point]:
        """
        Get a worker's service area as a PostGIS geometry.

        Args:
            worker: Worker user object
            buffer_km: Service radius in kilometers (uses worker's setting if None)

        Returns:
            PostGIS Point with buffer representing service area
        """
        if not hasattr(worker, 'latitude') or not hasattr(worker, 'longitude'):
            return None

        if not worker.latitude or not worker.longitude:
            return None

        try:
            worker_point = Point(
                float(worker.longitude),
                float(worker.latitude),
                srid=4326
            )
            return worker_point
        except (ValueError, TypeError):
            return None

    @staticmethod
    def analyze_coverage_gaps() -> Dict:
        """
        Analyze areas with poor worker coverage using PostGIS spatial analysis.

        Returns:
            Dictionary with coverage analysis and recommendations
        """
        # Get all bins
        bins = Bin.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False
        )

        # Get all workers with location
        workers = User.objects.filter(
            user_type='worker',
            is_active=True,
            latitude__isnull=False,
            longitude__isnull=False
        )

        uncovered_bins = []
        coverage_stats = {
            'total_bins': bins.count(),
            'total_workers': workers.count(),
            'uncovered_bins': 0,
            'average_coverage_radius': 0,
            'recommendations': []
        }

        for bin_obj in bins:
            bin_location = Point(
                float(bin_obj.longitude),
                float(bin_obj.latitude),
                srid=4326
            )

            # Check if any worker covers this bin
            covered = False
            for worker in workers:
                try:
                    worker_location = Point(
                        float(worker.longitude),
                        float(worker.latitude),
                        srid=4326
                    )

                    distance_km = bin_location.distance(worker_location) * 111
                    service_radius = getattr(worker, 'service_radius_km', 10)

                    if distance_km <= service_radius:
                        covered = True
                        break

                except (ValueError, TypeError):
                    continue

            if not covered:
                uncovered_bins.append({
                    'bin_id': bin_obj.id,
                    'address': bin_obj.address,
                    'latitude': float(bin_obj.latitude),
                    'longitude': float(bin_obj.longitude)
                })

        coverage_stats['uncovered_bins'] = len(uncovered_bins)
        coverage_stats['uncovered_bin_details'] = uncovered_bins

        # Generate recommendations
        if uncovered_bins:
            coverage_stats['recommendations'].append(
                f"Consider recruiting workers near {len(uncovered_bins)} uncovered bin locations"
            )

        return coverage_stats