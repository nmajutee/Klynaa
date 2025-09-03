"""
Notification service integrations
"""
import json
import firebase_admin
from firebase_admin import credentials, messaging
from typing import List, Dict, Any, Optional
from decouple import config

class NotificationService:
    """Abstract notification service"""

    def send_notification(self, user_tokens: List[str], title: str, body: str, data: Dict[str, Any] = None):
        raise NotImplementedError

class FirebaseNotificationService(NotificationService):
    """Firebase Cloud Messaging notification service"""

    def __init__(self):
        # Initialize Firebase Admin SDK
        if not firebase_admin._apps:
            # In production, use service account key
            # For now, we'll use the server key approach
            self.server_key = config('FIREBASE_SERVER_KEY', default='')

    def send_notification(self, user_tokens: List[str], title: str, body: str, data: Dict[str, Any] = None):
        """Send push notification via Firebase"""
        if not user_tokens:
            return {"success": False, "error": "No user tokens provided"}

        try:
            # Create the message
            message_data = data or {}

            notification = messaging.Notification(
                title=title,
                body=body
            )

            # Send to multiple tokens
            messages = []
            for token in user_tokens:
                messages.append(messaging.Message(
                    notification=notification,
                    data={k: str(v) for k, v in message_data.items()},  # FCM requires string values
                    token=token
                ))

            # Send batch
            response = messaging.send_all(messages)

            return {
                "success": True,
                "success_count": response.success_count,
                "failure_count": response.failure_count,
                "responses": [
                    {
                        "success": resp.success,
                        "message_id": resp.message_id if resp.success else None,
                        "error": str(resp.exception) if not resp.success else None
                    }
                    for resp in response.responses
                ]
            }

        except Exception as e:
            print(f"Firebase notification error: {e}")
            return {"success": False, "error": str(e)}

class SNSNotificationService(NotificationService):
    """AWS SNS notification service"""

    def __init__(self):
        import boto3
        self.sns_client = boto3.client('sns')

    def send_notification(self, user_tokens: List[str], title: str, body: str, data: Dict[str, Any] = None):
        """Send push notification via AWS SNS"""
        try:
            # For SNS, we'd need to publish to platform endpoints
            # This is a simplified implementation
            message = {
                "default": body,
                "APNS": json.dumps({
                    "aps": {
                        "alert": {"title": title, "body": body},
                        "sound": "default"
                    },
                    "data": data or {}
                }),
                "GCM": json.dumps({
                    "notification": {"title": title, "body": body},
                    "data": data or {}
                })
            }

            results = []
            for token in user_tokens:
                try:
                    response = self.sns_client.publish(
                        TargetArn=token,  # Should be SNS endpoint ARN
                        Message=json.dumps(message),
                        MessageStructure='json'
                    )
                    results.append({"success": True, "message_id": response['MessageId']})
                except Exception as e:
                    results.append({"success": False, "error": str(e)})

            return {
                "success": True,
                "results": results
            }

        except Exception as e:
            print(f"SNS notification error: {e}")
            return {"success": False, "error": str(e)}

def get_notification_service() -> NotificationService:
    """Factory function to get configured notification service"""
    service_type = config('NOTIFICATION_SERVICE', default='firebase').lower()

    if service_type == 'firebase':
        return FirebaseNotificationService()
    elif service_type == 'sns':
        return SNSNotificationService()
    else:
        raise ValueError(f"Unsupported notification service: {service_type}")

# Notification templates
NOTIFICATION_TEMPLATES = {
    'pickup_requested': {
        'title': 'New Pickup Available! 🗂️',
        'body': 'A bin needs pickup in your area. Tap to accept and earn money!'
    },
    'pickup_accepted': {
        'title': 'Pickup Accepted ✅',
        'body': 'A worker is on their way to collect your bin!'
    },
    'pickup_in_progress': {
        'title': 'Pickup In Progress 🚛',
        'body': 'Your bin is being collected now.'
    },
    'pickup_delivered': {
        'title': 'Bin Delivered! 📦',
        'body': 'Your bin has been delivered to the waste facility. Please confirm to complete the order.'
    },
    'pickup_completed': {
        'title': 'Order Completed! 🎉',
        'body': 'Thank you for using Klynaa! Payment has been processed.'
    },
    'payment_released': {
        'title': 'Payment Received! 💰',
        'body': 'Your earnings have been released to your account.'
    },
    'payment_failed': {
        'title': 'Payment Issue ⚠️',
        'body': 'There was an issue processing your payment. Please check your payment method.'
    }
}
