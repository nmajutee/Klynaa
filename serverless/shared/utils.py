"""
Shared utilities for serverless functions
"""
import os
import requests
import json
from typing import Dict, Any, Optional
from decouple import config

class DjangoAPIClient:
    """Client for communicating with Django backend"""

    def __init__(self):
        self.base_url = config('DJANGO_API_URL', default='http://localhost:8001')
        self.api_key = config('DJANGO_API_KEY', default='')
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Api-Key {self.api_key}' if self.api_key else ''
        }

    def get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Make GET request to Django API"""
        try:
            response = requests.get(
                f"{self.base_url}{endpoint}",
                params=params,
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Django API GET error: {e}")
            raise

    def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make POST request to Django API"""
        try:
            response = requests.post(
                f"{self.base_url}{endpoint}",
                json=data,
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Django API POST error: {e}")
            raise

    def patch(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make PATCH request to Django API"""
        try:
            response = requests.patch(
                f"{self.base_url}{endpoint}",
                json=data,
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Django API PATCH error: {e}")
            raise

def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Create standardized lambda response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body)
    }

def extract_event_data(event: Dict[str, Any]) -> Dict[str, Any]:
    """Extract and parse data from lambda event"""
    try:
        # Handle API Gateway event
        if 'body' in event:
            if isinstance(event['body'], str):
                return json.loads(event['body'])
            return event['body']

        # Handle direct invocation or SNS/SQS events
        return event
    except (json.JSONDecodeError, TypeError) as e:
        print(f"Event parsing error: {e}")
        return {}

def log_function_start(function_name: str, event_data: Dict[str, Any]):
    """Log function start with sanitized event data"""
    sanitized_data = {k: v for k, v in event_data.items() if k not in ['password', 'token', 'api_key']}
    print(f"[{function_name}] Starting with data: {sanitized_data}")

def log_function_end(function_name: str, success: bool, message: str = ""):
    """Log function completion"""
    status = "SUCCESS" if success else "ERROR"
    print(f"[{function_name}] {status}: {message}")
