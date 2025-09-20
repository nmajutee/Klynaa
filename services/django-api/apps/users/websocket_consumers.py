import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from apps.bins.models import PickupRequest
from apps.bins.pickup_scheduling import PickupSchedulingService

logger = logging.getLogger(__name__)
User = get_user_model()


class WorkerConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for worker dashboard with real-time updates.
    Handles pickup assignments, route updates, and location tracking.
    """

    async def connect(self):
        self.worker_id = self.scope['url_route']['kwargs']['worker_id']
        self.room_group_name = f'worker_{self.worker_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send initial worker data
        worker_data = await self.get_worker_data()
        if worker_data:
            await self.send(text_data=json.dumps({
                'type': 'worker_status',
                'data': worker_data
            }))

        logger.info(f"WebSocket connected for worker {self.worker_id}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected for worker {self.worker_id}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            data = text_data_json.get('data', {})

            if message_type == 'update_location':
                # Update worker location
                await self.update_worker_location(data)

            elif message_type == 'update_status':
                # Update worker availability status
                await self.update_worker_status(data)

            elif message_type == 'accept_pickup':
                # Accept a pickup assignment
                await self.accept_pickup_assignment(data)

            elif message_type == 'complete_pickup':
                # Mark pickup as completed
                await self.complete_pickup(data)

            elif message_type == 'get_assignments':
                # Get current pickup assignments
                assignments = await self.get_pickup_assignments()
                await self.send(text_data=json.dumps({
                    'type': 'assignments',
                    'data': assignments
                }))

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")
        except Exception as e:
            logger.error(f"Error handling worker WebSocket message: {e}")

    # Receive message from room group
    async def pickup_assignment(self, event):
        """Send new pickup assignment to worker"""
        await self.send(text_data=json.dumps({
            'type': 'new_assignment',
            'data': event['data']
        }))

    async def route_update(self, event):
        """Send route optimization update to worker"""
        await self.send(text_data=json.dumps({
            'type': 'route_update',
            'data': event['data']
        }))

    async def pickup_cancelled(self, event):
        """Notify worker of pickup cancellation"""
        await self.send(text_data=json.dumps({
            'type': 'pickup_cancelled',
            'data': event['data']
        }))

    @database_sync_to_async
    def get_worker_data(self):
        """Get current worker data from database"""
        try:
            worker = User.objects.get(id=self.worker_id, role='worker')

            # Get active pickups
            active_pickups = PickupRequest.objects.filter(
                worker=worker,
                status__in=['assigned', 'in_progress']
            ).count()

            return {
                'id': worker.id,
                'name': f"{worker.first_name} {worker.last_name}",
                'email': worker.email,
                'phone': worker.phone_number,
                'is_active': worker.is_available,
                'current_location': {
                    'lat': worker.latitude,
                    'lng': worker.longitude
                } if worker.latitude and worker.longitude else None,
                'active_pickups': active_pickups,
                'service_radius': worker.service_radius_km
            }
        except User.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error getting worker data: {e}")
            return None

    @database_sync_to_async
    def update_worker_location(self, location_data):
        """Update worker's current location"""
        try:
            worker = User.objects.get(id=self.worker_id, role='worker')
            lat = float(location_data.get('lat', 0))
            lng = float(location_data.get('lng', 0))

            worker.latitude = lat
            worker.longitude = lng
            worker.save()

            # Broadcast location update to relevant pickup consumers
            active_pickups = PickupRequest.objects.filter(
                worker=worker,
                status__in=['assigned', 'in_progress']
            )

            for pickup in active_pickups:
                # Send location update to pickup consumers
                pickup_group = f'pickup_{pickup.id}'
                # Note: This would be handled by the group send in a real implementation

            return {
                'worker_id': worker.id,
                'location': {'lat': lat, 'lng': lng},
                'timestamp': worker.updated_at.isoformat()
            }
        except Exception as e:
            logger.error(f"Error updating worker location: {e}")
            return None

    @database_sync_to_async
    def update_worker_status(self, status_data):
        """Update worker availability status"""
        try:
            worker = User.objects.get(id=self.worker_id, role='worker')
            worker.is_available = status_data.get('is_active', worker.is_available)
            worker.save()

            return {
                'worker_id': worker.id,
                'is_active': worker.is_available,
                'timestamp': worker.updated_at.isoformat()
            }
        except Exception as e:
            logger.error(f"Error updating worker status: {e}")
            return None

    @database_sync_to_async
    def accept_pickup_assignment(self, assignment_data):
        """Accept a pickup assignment"""
        try:
            pickup_id = assignment_data.get('pickup_id')
            pickup = PickupRequest.objects.get(id=pickup_id)

            if pickup.worker_id == self.worker_id and pickup.status == 'assigned':
                pickup.status = 'in_progress'
                pickup.save()

                return {
                    'pickup_id': pickup.id,
                    'status': pickup.status,
                    'accepted_at': pickup.updated_at.isoformat()
                }
        except Exception as e:
            logger.error(f"Error accepting pickup assignment: {e}")
            return None

    @database_sync_to_async
    def complete_pickup(self, completion_data):
        """Mark pickup as completed"""
        try:
            pickup_id = completion_data.get('pickup_id')
            pickup = PickupRequest.objects.get(id=pickup_id)

            if pickup.worker_id == self.worker_id:
                pickup.status = 'completed'
                pickup.completed_time = completion_data.get('completed_time')
                pickup.save()

                return {
                    'pickup_id': pickup.id,
                    'status': pickup.status,
                    'completed_at': pickup.completed_time.isoformat() if pickup.completed_time else None
                }
        except Exception as e:
            logger.error(f"Error completing pickup: {e}")
            return None

    @database_sync_to_async
    def get_pickup_assignments(self):
        """Get current pickup assignments for worker"""
        try:
            assignments = PickupRequest.objects.filter(
                worker_id=self.worker_id,
                status__in=['assigned', 'in_progress']
            ).select_related('customer', 'bin').order_by('scheduled_time')

            assignment_list = []
            for pickup in assignments:
                assignment_list.append({
                    'id': pickup.id,
                    'status': pickup.status,
                    'scheduled_time': pickup.scheduled_time.isoformat() if pickup.scheduled_time else None,
                    'customer': {
                        'name': f"{pickup.customer.first_name} {pickup.customer.last_name}",
                        'phone': pickup.customer.email  # Assuming email field
                    } if pickup.customer else None,
                    'bin': {
                        'id': pickup.bin.id,
                        'location': {
                            'lat': pickup.bin.latitude,
                            'lng': pickup.bin.longitude
                        },
                        'address': f"{pickup.bin.address}" if hasattr(pickup.bin, 'address') else 'Location'
                    } if pickup.bin else None
                })

            return assignment_list
        except Exception as e:
            logger.error(f"Error getting pickup assignments: {e}")
            return []