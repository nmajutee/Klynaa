import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from apps.bins.models import PickupRequest

logger = logging.getLogger(__name__)
User = get_user_model()


class PickupConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time pickup status updates.
    Handles pickup progress, worker assignments, and status changes.
    """

    async def connect(self):
        self.pickup_id = self.scope['url_route']['kwargs']['pickup_id']
        self.room_group_name = f'pickup_{self.pickup_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send initial pickup status
        pickup_data = await self.get_pickup_data()
        if pickup_data:
            await self.send(text_data=json.dumps({
                'type': 'pickup_status',
                'data': pickup_data
            }))

        logger.info(f"WebSocket connected for pickup {self.pickup_id}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected for pickup {self.pickup_id}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')

            if message_type == 'get_status':
                # Send current pickup status
                pickup_data = await self.get_pickup_data()
                if pickup_data:
                    await self.send(text_data=json.dumps({
                        'type': 'pickup_status',
                        'data': pickup_data
                    }))

            elif message_type == 'update_location' and self.scope['user'].is_authenticated:
                # Update worker location (if user is worker)
                location_data = text_data_json.get('data', {})
                await self.update_worker_location(location_data)

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {e}")

    # Receive message from room group
    async def pickup_update(self, event):
        """Send pickup update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'pickup_update',
            'data': event['data']
        }))

    async def worker_location_update(self, event):
        """Send worker location update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'worker_location',
            'data': event['data']
        }))

    async def pickup_status_change(self, event):
        """Send pickup status change to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'status_change',
            'data': event['data']
        }))

    @database_sync_to_async
    def get_pickup_data(self):
        """Get current pickup data from database"""
        try:
            pickup = PickupRequest.objects.select_related(
                'customer', 'worker', 'bin'
            ).get(id=self.pickup_id)

            return {
                'id': pickup.id,
                'status': pickup.status,
                'scheduled_time': pickup.scheduled_time.isoformat() if pickup.scheduled_time else None,
                'completed_time': pickup.completed_time.isoformat() if pickup.completed_time else None,
                'customer': {
                    'id': pickup.customer.id,
                    'name': f"{pickup.customer.first_name} {pickup.customer.last_name}",
                } if pickup.customer else None,
                'worker': {
                    'id': pickup.worker.id,
                    'name': f"{pickup.worker.user.first_name} {pickup.worker.user.last_name}",
                    'location': {
                        'lat': pickup.worker.current_latitude,
                        'lng': pickup.worker.current_longitude
                    } if pickup.worker.current_latitude and pickup.worker.current_longitude else None
                } if pickup.worker else None,
                'bin': {
                    'id': pickup.bin.id,
                    'location': {
                        'lat': pickup.bin.latitude,
                        'lng': pickup.bin.longitude
                    }
                } if pickup.bin else None
            }
        except PickupRequest.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error getting pickup data: {e}")
            return None

    @database_sync_to_async
    def update_worker_location(self, location_data):
        """Update worker location if user is the assigned worker"""
        try:
            if not self.scope['user'].is_authenticated:
                return

            pickup = PickupRequest.objects.get(id=self.pickup_id)
            if pickup.worker and pickup.worker.user_id == self.scope['user'].id:
                # Update worker location
                pickup.worker.current_latitude = location_data.get('lat')
                pickup.worker.current_longitude = location_data.get('lng')
                pickup.worker.save()

                # Broadcast location update to all pickup consumers
                return {
                    'worker_id': pickup.worker.id,
                    'location': {
                        'lat': pickup.worker.current_latitude,
                        'lng': pickup.worker.current_longitude
                    }
                }
        except Exception as e:
            logger.error(f"Error updating worker location: {e}")
            return None


class CustomerConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for customer notifications and pickup updates.
    """

    async def connect(self):
        self.customer_id = self.scope['url_route']['kwargs']['customer_id']
        self.room_group_name = f'customer_{self.customer_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(f"WebSocket connected for customer {self.customer_id}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected for customer {self.customer_id}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')

            if message_type == 'get_notifications':
                # Send pending notifications
                notifications = await self.get_customer_notifications()
                await self.send(text_data=json.dumps({
                    'type': 'notifications',
                    'data': notifications
                }))

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")
        except Exception as e:
            logger.error(f"Error handling customer WebSocket message: {e}")

    # Receive message from room group
    async def pickup_notification(self, event):
        """Send pickup notification to customer"""
        await self.send(text_data=json.dumps({
            'type': 'pickup_notification',
            'data': event['data']
        }))

    async def status_update(self, event):
        """Send status update notification to customer"""
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'data': event['data']
        }))

    @database_sync_to_async
    def get_customer_notifications(self):
        """Get recent notifications for customer"""
        try:
            # Get customer's recent pickups
            pickups = PickupRequest.objects.filter(
                customer_id=self.customer_id
            ).select_related('worker', 'bin').order_by('-created_at')[:10]

            notifications = []
            for pickup in pickups:
                notifications.append({
                    'id': pickup.id,
                    'type': 'pickup_update',
                    'status': pickup.status,
                    'message': f"Pickup {pickup.status.replace('_', ' ').title()}",
                    'timestamp': pickup.updated_at.isoformat(),
                    'worker': f"{pickup.worker.user.first_name} {pickup.worker.user.last_name}" if pickup.worker else None
                })

            return notifications
        except Exception as e:
            logger.error(f"Error getting customer notifications: {e}")
            return []