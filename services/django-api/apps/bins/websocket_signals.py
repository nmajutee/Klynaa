"""
Real-time WebSocket broadcasting utilities for pickup and worker updates.
"""
import json
import logging
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from apps.bins.models import PickupRequest
from django.contrib.auth import get_user_model

User = get_user_model()

logger = logging.getLogger(__name__)
channel_layer = get_channel_layer()


def broadcast_pickup_update(pickup_id, update_type, data):
    """
    Broadcast pickup update to WebSocket consumers.

    Args:
        pickup_id: ID of the pickup
        update_type: Type of update ('status_change', 'worker_assigned', etc.)
        data: Update data to broadcast
    """
    if not channel_layer:
        logger.warning("Channel layer not configured - WebSocket updates disabled")
        return

    try:
        room_group_name = f'pickup_{pickup_id}'
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'pickup_update',
                'data': {
                    'update_type': update_type,
                    'pickup_id': pickup_id,
                    'timestamp': data.get('timestamp'),
                    **data
                }
            }
        )
        logger.info(f"Broadcasted pickup update: {update_type} for pickup {pickup_id}")
    except Exception as e:
        logger.error(f"Error broadcasting pickup update: {e}")


def broadcast_worker_update(worker_id, update_type, data):
    """
    Broadcast worker update to WebSocket consumers.

    Args:
        worker_id: ID of the worker
        update_type: Type of update ('location_change', 'status_change', etc.)
        data: Update data to broadcast
    """
    if not channel_layer:
        logger.warning("Channel layer not configured - WebSocket updates disabled")
        return

    try:
        room_group_name = f'worker_{worker_id}'
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'route_update' if update_type == 'location_change' else 'pickup_assignment',
                'data': {
                    'update_type': update_type,
                    'worker_id': worker_id,
                    'timestamp': data.get('timestamp'),
                    **data
                }
            }
        )
        logger.info(f"Broadcasted worker update: {update_type} for worker {worker_id}")
    except Exception as e:
        logger.error(f"Error broadcasting worker update: {e}")


def broadcast_customer_notification(customer_id, notification_type, data):
    """
    Broadcast notification to customer WebSocket consumers.

    Args:
        customer_id: ID of the customer
        notification_type: Type of notification
        data: Notification data to broadcast
    """
    if not channel_layer:
        logger.warning("Channel layer not configured - WebSocket updates disabled")
        return

    try:
        room_group_name = f'customer_{customer_id}'
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'pickup_notification',
                'data': {
                    'notification_type': notification_type,
                    'customer_id': customer_id,
                    'timestamp': data.get('timestamp'),
                    **data
                }
            }
        )
        logger.info(f"Broadcasted customer notification: {notification_type} for customer {customer_id}")
    except Exception as e:
        logger.error(f"Error broadcasting customer notification: {e}")


# Django signals for automatic WebSocket updates
@receiver(post_save, sender=PickupRequest)
def pickup_status_changed(sender, instance, created, **kwargs):
    """
    Trigger WebSocket updates when pickup status changes.
    """
    if created:
        update_type = 'pickup_created'
        message = f"New pickup created"
    else:
        # Check if status changed
        if hasattr(instance, '_previous_status') and instance._previous_status != instance.status:
            update_type = 'status_changed'
            message = f"Pickup status changed to {instance.status.replace('_', ' ').title()}"
        else:
            update_type = 'pickup_updated'
            message = f"Pickup information updated"

    # Broadcast to pickup consumers
    broadcast_pickup_update(
        pickup_id=instance.id,
        update_type=update_type,
        data={
            'status': instance.status,
            'message': message,
            'timestamp': instance.updated_at.isoformat(),
            'worker_id': instance.worker_id if instance.worker else None,
            'customer_id': instance.customer_id if instance.customer else None
        }
    )

    # Notify customer if applicable
    if instance.customer_id:
        broadcast_customer_notification(
            customer_id=instance.customer_id,
            notification_type=update_type,
            data={
                'pickup_id': instance.id,
                'status': instance.status,
                'message': message,
                'timestamp': instance.updated_at.isoformat(),
                'worker_name': f"{instance.worker.user.first_name} {instance.worker.user.last_name}" if instance.worker else None
            }
        )

    # Notify worker if applicable
    if instance.worker_id:
        broadcast_worker_update(
            worker_id=instance.worker_id,
            update_type='assignment_updated',
            data={
                'pickup_id': instance.id,
                'status': instance.status,
                'message': message,
                'timestamp': instance.updated_at.isoformat()
            }
        )


@receiver(pre_save, sender=PickupRequest)
def track_pickup_status_change(sender, instance, **kwargs):
    """
    Track previous status before save to detect changes.
    """
    if instance.pk:
        try:
            previous = PickupRequest.objects.get(pk=instance.pk)
            instance._previous_status = previous.status
        except PickupRequest.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None


@receiver(post_save, sender=User)
def worker_status_changed(sender, instance, created, **kwargs):
    """
    Trigger WebSocket updates when user (worker) status or location changes.
    """
    # Only handle worker users
    if instance.role != 'worker':
        return

    if created:
        update_type = 'worker_created'
        message = f"Worker profile created"
    else:
        # Check for location or status changes
        update_type = 'worker_updated'
        message = f"Worker information updated"

    broadcast_worker_update(
        worker_id=instance.id,
        update_type=update_type,
        data={
            'is_active': instance.is_available,
            'current_location': {
                'lat': instance.latitude,
                'lng': instance.longitude
            } if instance.latitude and instance.longitude else None,
            'message': message,
            'timestamp': instance.updated_at.isoformat()
        }
    )