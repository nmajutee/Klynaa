"""
Geographic and Location-based Lambda Functions
"""
import json
import math
from typing import Dict, Any, List, Tuple
from shared.utils import (
    DjangoAPIClient,
    create_response,
    extract_event_data,
    log_function_start,
    log_function_end
)

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    Returns distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))

    # Radius of earth in kilometers
    r = 6371
    return c * r

def notify_nearby_workers(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Find and notify workers within a specified radius of a pickup request

    Expected payload:
    {
        "pickup_id": 123,
        "latitude": 6.5244,
        "longitude": 3.3792,
        "radius_km": 5,
        "max_workers": 10,
        "priority_workers": [1, 2, 3]  // Optional: workers to notify first
    }
    """
    function_name = "notify_nearby_workers"

    try:
        data = extract_event_data(event)
        log_function_start(function_name, data)

        pickup_id = data.get('pickup_id')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        radius_km = data.get('radius_km', 5)
        max_workers = data.get('max_workers', 10)
        priority_workers = data.get('priority_workers', [])

        if not all([pickup_id, latitude, longitude]):
            return create_response(400, {
                'error': 'pickup_id, latitude, and longitude are required'
            })

        django_client = DjangoAPIClient()

        # Get pickup details to ensure it's still available
        pickup_response = django_client.get(f'/api/pickups/{pickup_id}/')
        pickup = pickup_response

        if pickup.get('status') != 'OPEN':
            return create_response(400, {
                'error': 'Pickup is no longer available',
                'current_status': pickup.get('status')
            })

        # Get all available workers
        workers_response = django_client.get('/api/workers/available/')
        all_workers = workers_response.get('workers', [])

        if not all_workers:
            log_function_end(function_name, True, "No available workers found")
            return create_response(200, {
                'message': 'No available workers found',
                'notified_workers': []
            })

        # Calculate distances and filter by radius
        nearby_workers = []
        for worker in all_workers:
            worker_lat = worker.get('latitude')
            worker_lng = worker.get('longitude')

            if worker_lat is None or worker_lng is None:
                continue  # Skip workers without location

            distance = haversine_distance(latitude, longitude, worker_lat, worker_lng)

            if distance <= radius_km:
                worker['distance_km'] = round(distance, 2)
                nearby_workers.append(worker)

        if not nearby_workers:
            log_function_end(function_name, True, f"No workers found within {radius_km}km radius")
            return create_response(200, {
                'message': f'No workers found within {radius_km}km radius',
                'notified_workers': []
            })

        # Sort workers by distance and prioritize if specified
        def worker_sort_key(worker):
            # Priority workers get negative distance (sorted first)
            if worker['id'] in priority_workers:
                return -1000 + worker['distance_km']
            return worker['distance_km']

        nearby_workers.sort(key=worker_sort_key)

        # Limit to max_workers
        workers_to_notify = nearby_workers[:max_workers]

        # Send notifications
        notification_results = []

        for worker in workers_to_notify:
            try:
                # Get worker's device tokens
                tokens_response = django_client.post('/api/users/tokens/', {
                    'user_ids': [worker['id']]
                })
                worker_tokens = tokens_response.get('tokens', [])

                if worker_tokens:
                    # Prepare notification data
                    notification_data = {
                        'pickup_id': pickup_id,
                        'notification_type': 'pickup_requested',
                        'user_type': 'worker',
                        'user_ids': [worker['id']]
                    }

                    # Call notification function
                    from functions.notifications import send_pickup_notification
                    notification_event = {'body': json.dumps(notification_data)}
                    result = send_pickup_notification(notification_event, None)

                    notification_results.append({
                        'worker_id': worker['id'],
                        'worker_name': f"{worker.get('first_name', '')} {worker.get('last_name', '')}".strip(),
                        'distance_km': worker['distance_km'],
                        'notification_sent': result.get('statusCode') == 200,
                        'result': result
                    })
                else:
                    notification_results.append({
                        'worker_id': worker['id'],
                        'worker_name': f"{worker.get('first_name', '')} {worker.get('last_name', '')}".strip(),
                        'distance_km': worker['distance_km'],
                        'notification_sent': False,
                        'result': 'No device tokens found'
                    })

            except Exception as e:
                notification_results.append({
                    'worker_id': worker['id'],
                    'distance_km': worker.get('distance_km'),
                    'notification_sent': False,
                    'result': f'Error: {str(e)}'
                })

        # Log the geographic notification
        django_client.post('/api/geo-logs/', {
            'pickup_id': pickup_id,
            'center_latitude': latitude,
            'center_longitude': longitude,
            'radius_km': radius_km,
            'workers_found': len(nearby_workers),
            'workers_notified': len([r for r in notification_results if r.get('notification_sent')]),
            'metadata': {
                'max_workers': max_workers,
                'priority_workers': priority_workers,
                'lambda_request_id': context.aws_request_id if context else 'local'
            }
        })

        successful_notifications = len([r for r in notification_results if r.get('notification_sent')])

        log_function_end(function_name, True,
                        f"Notified {successful_notifications}/{len(workers_to_notify)} workers")

        return create_response(200, {
            'message': f'Processed {len(workers_to_notify)} nearby workers',
            'pickup_id': pickup_id,
            'radius_km': radius_km,
            'total_workers_in_radius': len(nearby_workers),
            'workers_notified': successful_notifications,
            'notification_results': notification_results
        })

    except Exception as e:
        log_function_end(function_name, False, str(e))
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })

def calculate_service_areas(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Calculate and update service areas for all active workers
    This can be run as a scheduled task to optimize worker coverage

    Expected payload:
    {
        "update_database": true,
        "min_coverage_radius": 2,  // Minimum service radius in km
        "max_coverage_radius": 10  // Maximum service radius in km
    }
    """
    function_name = "calculate_service_areas"

    try:
        data = extract_event_data(event)
        log_function_start(function_name, data)

        update_database = data.get('update_database', False)
        min_radius = data.get('min_coverage_radius', 2)
        max_radius = data.get('max_coverage_radius', 10)

        django_client = DjangoAPIClient()

        # Get all active workers with location data
        workers_response = django_client.get('/api/workers/?has_location=true')
        workers = workers_response.get('workers', [])

        if not workers:
            return create_response(200, {
                'message': 'No workers with location data found'
            })

        # Get all bins to analyze coverage
        bins_response = django_client.get('/api/bins/')
        bins = bins_response.get('bins', [])

        coverage_analysis = []

        for worker in workers:
            worker_lat = worker.get('latitude')
            worker_lng = worker.get('longitude')

            if not worker_lat or not worker_lng:
                continue

            # Calculate distances to all bins
            bin_distances = []
            for bin_item in bins:
                bin_lat = bin_item.get('latitude')
                bin_lng = bin_item.get('longitude')

                if bin_lat and bin_lng:
                    distance = haversine_distance(worker_lat, worker_lng, bin_lat, bin_lng)
                    bin_distances.append(distance)

            if bin_distances:
                # Calculate optimal service radius based on bin density
                bin_distances.sort()

                # Find radius that covers reasonable number of bins but not too many
                target_bins = min(20, len(bin_distances) // 2)  # Cover up to 20 bins or half available
                optimal_radius = min(max_radius, max(min_radius, bin_distances[target_bins - 1] if target_bins > 0 else min_radius))

                bins_in_radius = len([d for d in bin_distances if d <= optimal_radius])

                coverage_info = {
                    'worker_id': worker['id'],
                    'current_radius': worker.get('service_radius_km', 5),
                    'optimal_radius': round(optimal_radius, 2),
                    'bins_in_optimal_radius': bins_in_radius,
                    'closest_bin_km': round(min(bin_distances), 2) if bin_distances else None,
                    'coverage_efficiency': bins_in_radius / optimal_radius if optimal_radius > 0 else 0
                }

                coverage_analysis.append(coverage_info)

                # Update worker's service radius if requested
                if update_database and abs(coverage_info['optimal_radius'] - coverage_info['current_radius']) > 0.5:
                    try:
                        django_client.patch(f'/api/workers/{worker["id"]}/', {
                            'service_radius_km': coverage_info['optimal_radius']
                        })
                        coverage_info['updated'] = True
                    except Exception as e:
                        coverage_info['update_error'] = str(e)
                        coverage_info['updated'] = False

        log_function_end(function_name, True, f"Analyzed {len(coverage_analysis)} workers")

        return create_response(200, {
            'message': f'Service area analysis completed for {len(coverage_analysis)} workers',
            'coverage_analysis': coverage_analysis,
            'summary': {
                'total_workers_analyzed': len(coverage_analysis),
                'workers_updated': len([c for c in coverage_analysis if c.get('updated')]),
                'average_optimal_radius': round(sum(c['optimal_radius'] for c in coverage_analysis) / len(coverage_analysis), 2) if coverage_analysis else 0
            }
        })

    except Exception as e:
        log_function_end(function_name, False, str(e))
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })
