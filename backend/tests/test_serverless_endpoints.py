from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from apps.bins.models import Bin, PickupRequest

User = get_user_model()

class ServerlessEndpointsTest(TestCase):
    def setUp(self):
        self.client = Client()
        # Create users
        self.admin = User.objects.create_user(username='admin', password='pass', role=User.UserRole.ADMIN)
        self.worker = User.objects.create_user(username='worker', password='pass', role=User.UserRole.WORKER, latitude=6.5244, longitude=3.3792, is_available=True)
        self.customer = User.objects.create_user(username='customer', password='pass', role=User.UserRole.CUSTOMER)

    def test_workers_available_requires_lat_lng(self):
        resp = self.client.get('/api/workers/available/')
        self.assertEqual(resp.status_code, 400)

    def test_workers_available_returns_workers(self):
        resp = self.client.get('/api/workers/available/', {'lat': '6.5244', 'lng': '3.3792', 'radius': '5'})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('workers', data)

    def test_trigger_pickup_notifications_404_for_missing(self):
        resp = self.client.post('/api/serverless/trigger-pickup-notifications/', {})
        # No pickup_id provided, but endpoint should return 400 or 404 depending on implementation
        self.assertIn(resp.status_code, (400, 404))
