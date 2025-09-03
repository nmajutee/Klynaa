"""
Notification Lambda Functions
"""
import json
from typing import Dict, Any
from shared.utils import (
    DjangoAPIClient,
    create_response,
    extract_event_data,
    log_function_start,
    log_function_end
)
from shared.notifications import get_notification_service, NOTIFICATION_TEMPLATES

def send_pickup_notification(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Send pickup-related notifications to workers or customers

    Expected payload:
    {
        "pickup_id": 123,
        "notification_type": "pickup_requested|pickup_accepted|pickup_in_progress|pickup_delivered|pickup_completed",
        "user_type": "worker|customer",
        "user_ids": [1, 2, 3] // Optional, if not provided, will fetch from pickup
    }
    """
    function_name = "send_pickup_notification"

    try:
        data = extract_event_data(event)
        log_function_start(function_name, data)

        pickup_id = data.get('pickup_id')
        notification_type = data.get('notification_type')
        user_type = data.get('user_type')
        user_ids = data.get('user_ids', [])

        if not pickup_id or not notification_type:
            return create_response(400, {
                'error': 'pickup_id and notification_type are required'
            })

        # Initialize services
        django_client = DjangoAPIClient()
        notification_service = get_notification_service()

        # Get pickup details from Django
        pickup_response = django_client.get(f'/api/pickups/{pickup_id}/')
        pickup = pickup_response

        # Determine target users if not provided
        if not user_ids:
            if user_type == 'customer':
                user_ids = [pickup['bin']['owner']['id']]
            elif user_type == 'worker' and notification_type == 'pickup_requested':
                # Get nearby workers
                nearby_response = django_client.post('/api/bins/available/', {
                    'lat': pickup['bin']['latitude'],
                    'lng': pickup['bin']['longitude'],
                    'radius': 5  # 5km radius
                })
                user_ids = [worker['id'] for worker in nearby_response.get('workers', [])]
            elif user_type == 'worker' and pickup.get('worker'):
                user_ids = [pickup['worker']['id']]

        if not user_ids:
            log_function_end(function_name, True, "No users to notify")
            return create_response(200, {'message': 'No users to notify'})

        # Get user tokens from Django
        tokens_response = django_client.post('/api/users/tokens/', {
            'user_ids': user_ids
        })
        user_tokens = tokens_response.get('tokens', [])

        if not user_tokens:
            log_function_end(function_name, True, "No valid device tokens found")
            return create_response(200, {'message': 'No valid device tokens found'})

        # Get notification template
        template = NOTIFICATION_TEMPLATES.get(notification_type)
        if not template:
            return create_response(400, {
                'error': f'Unknown notification type: {notification_type}'
            })

        # Customize message with pickup details
        title = template['title']
        body = template['body']

        # Add contextual data
        notification_data = {
            'pickup_id': str(pickup_id),
            'notification_type': notification_type,
            'bin_label': pickup['bin'].get('label', 'Smart Bin'),
            'location': f"{pickup['bin'].get('latitude', 0)},{pickup['bin'].get('longitude', 0)}"
        }

        if pickup.get('worker'):
            notification_data['worker_name'] = pickup['worker'].get('first_name', 'Worker')

        # Send notification
        result = notification_service.send_notification(
            user_tokens=user_tokens,
            title=title,
            body=body,
            data=notification_data
        )

        # Log notification in Django
        django_client.post('/api/notifications/', {
            'pickup_id': pickup_id,
            'user_ids': user_ids,
            'notification_type': notification_type,
            'title': title,
            'body': body,
            'success': result.get('success', False),
            'metadata': result
        })

        log_function_end(function_name, True, f"Notification sent to {len(user_tokens)} devices")
        return create_response(200, {
            'message': 'Notification sent successfully',
            'result': result
        })

    except Exception as e:
        log_function_end(function_name, False, str(e))
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })

def send_payment_notification(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Send payment-related notifications

    Expected payload:
    {
        "payment_id": 123,
        "notification_type": "payment_released|payment_failed|payment_pending",
        "user_id": 456
    }
    """
    function_name = "send_payment_notification"

    try:
        data = extract_event_data(event)
        log_function_start(function_name, data)

        payment_id = data.get('payment_id')
        notification_type = data.get('notification_type')
        user_id = data.get('user_id')

        if not payment_id or not notification_type or not user_id:
            return create_response(400, {
                'error': 'payment_id, notification_type, and user_id are required'
            })

        # Initialize services
        django_client = DjangoAPIClient()
        notification_service = get_notification_service()

        # Get payment details
        payment_response = django_client.get(f'/api/payments/{payment_id}/')
        payment = payment_response

        # Get user tokens
        tokens_response = django_client.post('/api/users/tokens/', {
            'user_ids': [user_id]
        })
        user_tokens = tokens_response.get('tokens', [])

        if not user_tokens:
            log_function_end(function_name, True, "No valid device tokens found")
            return create_response(200, {'message': 'No valid device tokens found'})

        # Get notification template
        template = NOTIFICATION_TEMPLATES.get(notification_type)
        if not template:
            return create_response(400, {
                'error': f'Unknown notification type: {notification_type}'
            })

        title = template['title']
        body = template['body']

        # Add payment context
        if notification_type == 'payment_released':
            body = f"Your earnings of ${payment.get('amount', 0):.2f} have been released!"
        elif notification_type == 'payment_failed':
            body = f"Payment of ${payment.get('amount', 0):.2f} failed. Please update your payment method."

        notification_data = {
            'payment_id': str(payment_id),
            'notification_type': notification_type,
            'amount': str(payment.get('amount', 0)),
            'currency': payment.get('currency', 'USD')
        }

        # Send notification
        result = notification_service.send_notification(
            user_tokens=user_tokens,
            title=title,
            body=body,
            data=notification_data
        )

        # Log notification
        django_client.post('/api/notifications/', {
            'payment_id': payment_id,
            'user_ids': [user_id],
            'notification_type': notification_type,
            'title': title,
            'body': body,
            'success': result.get('success', False),
            'metadata': result
        })

        log_function_end(function_name, True, "Payment notification sent")
        return create_response(200, {
            'message': 'Payment notification sent successfully',
            'result': result
        })

    except Exception as e:
        log_function_end(function_name, False, str(e))
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })
