"""
Escrow Processing Lambda Functions
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

def process_escrow_release(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Process escrow release after pickup completion

    This function is triggered when:
    1. Customer confirms delivery (for cash payments)
    2. Automatic release after 24 hours (for electronic payments)
    3. Admin resolves dispute in favor of worker

    Expected payload:
    {
        "pickup_id": 123,
        "release_reason": "customer_confirmed|auto_release|admin_resolved",
        "force_release": false  // Admin override
    }
    """
    function_name = "process_escrow_release"

    try:
        data = extract_event_data(event)
        log_function_start(function_name, data)

        pickup_id = data.get('pickup_id')
        release_reason = data.get('release_reason', 'auto_release')
        force_release = data.get('force_release', False)

        if not pickup_id:
            return create_response(400, {
                'error': 'pickup_id is required'
            })

        django_client = DjangoAPIClient()

        # Get pickup details
        pickup_response = django_client.get(f'/api/pickups/{pickup_id}/')
        pickup = pickup_response

        # Validate pickup status
        if pickup.get('status') not in ['DELIVERED', 'COMPLETED'] and not force_release:
            return create_response(400, {
                'error': 'Pickup must be in DELIVERED status for escrow release',
                'current_status': pickup.get('status')
            })

        # Get payment details
        payment_id = pickup.get('payment', {}).get('id')
        if not payment_id:
            return create_response(400, {
                'error': 'No payment found for this pickup'
            })

        payment_response = django_client.get(f'/api/payments/{payment_id}/')
        payment = payment_response

        # Check if payment is in escrow
        if payment.get('status') not in ['ESCROWED', 'PENDING']:
            return create_response(400, {
                'error': 'Payment is not in escrow status',
                'current_status': payment.get('status')
            })

        # Process the release
        release_result = django_client.post(f'/api/payments/{payment_id}/release/', {
            'release_reason': release_reason,
            'force_release': force_release,
            'processed_by': 'serverless'
        })

        if not release_result.get('success'):
            return create_response(400, {
                'error': 'Failed to release escrow',
                'details': release_result.get('error')
            })

        # Update pickup status to COMPLETED if not already
        if pickup.get('status') != 'COMPLETED':
            django_client.patch(f'/api/pickups/{pickup_id}/', {
                'status': 'COMPLETED'
            })

        # Trigger payment notification to worker
        worker_id = pickup.get('worker', {}).get('id')
        if worker_id:
            # This could be a direct call or another lambda invocation
            try:
                notification_data = {
                    'payment_id': payment_id,
                    'notification_type': 'payment_released',
                    'user_id': worker_id
                }

                # If running locally, call the notification function directly
                from functions.notifications import send_payment_notification
                notification_event = {'body': json.dumps(notification_data)}
                send_payment_notification(notification_event, None)

            except Exception as e:
                # Log but don't fail the escrow release
                print(f"Failed to send payment notification: {e}")

        # Log the escrow release
        django_client.post('/api/escrow-logs/', {
            'pickup_id': pickup_id,
            'payment_id': payment_id,
            'action': 'release',
            'reason': release_reason,
            'amount': payment.get('amount'),
            'processed_by': 'serverless',
            'metadata': {
                'lambda_request_id': context.aws_request_id if context else 'local',
                'release_result': release_result
            }
        })

        log_function_end(function_name, True, f"Escrow released for pickup {pickup_id}")
        return create_response(200, {
            'message': 'Escrow released successfully',
            'pickup_id': pickup_id,
            'payment_id': payment_id,
            'amount': payment.get('amount'),
            'release_reason': release_reason
        })

    except Exception as e:
        log_function_end(function_name, False, str(e))
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })

def process_escrow_hold(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Process escrow hold (freeze payment due to dispute)

    Expected payload:
    {
        "pickup_id": 123,
        "hold_reason": "customer_dispute|quality_issue|delivery_issue",
        "hold_duration_hours": 72  // Optional, default 72 hours
    }
    """
    function_name = "process_escrow_hold"

    try:
        data = extract_event_data(event)
        log_function_start(function_name, data)

        pickup_id = data.get('pickup_id')
        hold_reason = data.get('hold_reason')
        hold_duration_hours = data.get('hold_duration_hours', 72)

        if not pickup_id or not hold_reason:
            return create_response(400, {
                'error': 'pickup_id and hold_reason are required'
            })

        django_client = DjangoAPIClient()

        # Get pickup and payment details
        pickup_response = django_client.get(f'/api/pickups/{pickup_id}/')
        pickup = pickup_response

        payment_id = pickup.get('payment', {}).get('id')
        if not payment_id:
            return create_response(400, {
                'error': 'No payment found for this pickup'
            })

        # Process the hold
        hold_result = django_client.post(f'/api/payments/{payment_id}/hold/', {
            'hold_reason': hold_reason,
            'hold_duration_hours': hold_duration_hours,
            'processed_by': 'serverless'
        })

        if not hold_result.get('success'):
            return create_response(400, {
                'error': 'Failed to hold escrow',
                'details': hold_result.get('error')
            })

        # Notify both customer and worker about the hold
        customer_id = pickup.get('bin', {}).get('owner', {}).get('id')
        worker_id = pickup.get('worker', {}).get('id')

        for user_id in [customer_id, worker_id]:
            if user_id:
                try:
                    notification_data = {
                        'pickup_id': pickup_id,
                        'notification_type': 'payment_held',
                        'user_id': user_id,
                        'hold_reason': hold_reason
                    }
                    # Send notification (implementation depends on your setup)
                    print(f"Would send hold notification to user {user_id}")
                except Exception as e:
                    print(f"Failed to send hold notification to user {user_id}: {e}")

        # Log the escrow hold
        django_client.post('/api/escrow-logs/', {
            'pickup_id': pickup_id,
            'payment_id': payment_id,
            'action': 'hold',
            'reason': hold_reason,
            'processed_by': 'serverless',
            'metadata': {
                'hold_duration_hours': hold_duration_hours,
                'lambda_request_id': context.aws_request_id if context else 'local'
            }
        })

        log_function_end(function_name, True, f"Escrow held for pickup {pickup_id}")
        return create_response(200, {
            'message': 'Escrow held successfully',
            'pickup_id': pickup_id,
            'payment_id': payment_id,
            'hold_reason': hold_reason,
            'hold_duration_hours': hold_duration_hours
        })

    except Exception as e:
        log_function_end(function_name, False, str(e))
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })
