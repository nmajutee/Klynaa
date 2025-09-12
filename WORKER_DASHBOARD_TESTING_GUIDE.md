# Worker Dashboard Testing Guide

## 🚀 Testing the Klynaa Worker Dashboard

### Prerequisites
- Backend Django server running on `http://localhost:8000`
- Frontend Next.js server (optional for API testing)
- Test user accounts (worker and customer)

## 1. Backend API Testing

### Start the Django Server
```bash
cd backend
python manage.py runserver 8000
```

### Create Test Data
Run these commands to set up test data:

```bash
# Create quick reply templates
python manage.py create_quick_replies

# Create test users and data
python manage.py shell
```

In Django shell:
```python
from django.contrib.auth import get_user_model
from apps.pickups.models import PickupRequest
from apps.users.models import User
from decimal import Decimal
import json

User = get_user_model()

# Create test worker
worker = User.objects.create_user(
    username='testworker',
    email='worker@test.com',
    password='testpass123',
    first_name='John',
    last_name='Worker',
    role='worker',
    latitude=-1.2921,  # Nairobi coordinates
    longitude=36.8219,
    is_available=True,
    service_radius_km=10
)

# Create test customer
customer = User.objects.create_user(
    username='testcustomer',
    email='customer@test.com',
    password='testpass123',
    first_name='Jane',
    last_name='Customer',
    role='customer',
    latitude=-1.2821,
    longitude=36.8319
)

# Create test pickup requests
pickup1 = PickupRequest.objects.create(
    customer=customer,
    pickup_address="123 Test Street, Nairobi",
    pickup_latitude=-1.2821,
    pickup_longitude=36.8319,
    waste_types=['plastic', 'paper'],
    estimated_weight_kg=5.5,
    estimated_cost=Decimal('150.00'),
    status='open',
    description='Mixed recyclables for pickup'
)

pickup2 = PickupRequest.objects.create(
    customer=customer,
    pickup_address="456 Demo Avenue, Nairobi",
    pickup_latitude=-1.2921,
    pickup_longitude=36.8219,
    waste_types=['organic'],
    estimated_weight_kg=8.0,
    estimated_cost=Decimal('200.00'),
    status='accepted',
    assigned_worker=worker,
    description='Organic waste collection'
)

print("Test data created successfully!")
print(f"Worker ID: {worker.id}")
print(f"Customer ID: {customer.id}")
print(f"Pickup 1 ID: {pickup1.id}")
print(f"Pickup 2 ID: {pickup2.id}")
```

## 2. API Endpoint Testing

### Get JWT Tokens
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker@test.com",
    "password": "testpass123"
  }'
```

Save the returned `access` token for subsequent requests.

### Test Worker Dashboard Endpoints

#### 1. Get Worker Stats
```bash
curl -X GET http://localhost:8000/api/workers/dashboard/stats/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 2. Get Available Pickups
```bash
curl -X GET "http://localhost:8000/api/workers/pickups/available/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3. Accept a Pickup
```bash
curl -X POST http://localhost:8000/api/workers/pickups/PICKUP_ID/accept/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

#### 4. Start Pickup
```bash
curl -X PATCH http://localhost:8000/api/workers/pickups/PICKUP_ID/status/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

#### 5. Get Worker Earnings
```bash
curl -X GET http://localhost:8000/api/workers/dashboard/earnings/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 6. Get Chat Messages
```bash
curl -X GET http://localhost:8000/api/workers/pickups/PICKUP_ID/chat/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 7. Send Chat Message
```bash
curl -X POST http://localhost:8000/api/workers/pickups/PICKUP_ID/chat/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello! I am on my way to collect your waste.",
    "message_type": "text"
  }'
```

#### 8. Toggle Worker Availability
```bash
curl -X POST http://localhost:8000/api/workers/toggle-status/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_available": false}'
```

## 3. Frontend Testing

### Start Frontend Server
```bash
cd frontend
npm run dev
```
Navigate to `http://localhost:3000`

### Test User Journey

#### 1. Worker Login
- Go to `/auth/login`
- Login with: `worker@test.com` / `testpass123`
- Should redirect to worker dashboard

#### 2. Dashboard Overview
- Navigate to `/worker/dashboard`
- Check stats display (pickups, earnings, rating)
- Test online/offline toggle
- Verify quick action cards work

#### 3. Tasks Management
- Navigate to `/worker/tasks`
- Switch between "Available Tasks" and "My Tasks" tabs
- Test search functionality
- Test accepting a pickup (should move to "My Tasks")
- Test starting and completing pickups

#### 4. Chat System
- Navigate to `/worker/chat?pickup=PICKUP_ID`
- Test sending text messages
- Test quick replies
- Test image upload (optional)

#### 5. Earnings Tracking
- Navigate to `/worker/earnings`
- Test period filtering (week/month/all)
- Verify earnings calculations
- Check payment history display

## 4. Mobile Testing

### Responsive Design Testing
- Test on mobile viewport (375px width)
- Verify touch-friendly interface
- Check navigation usability
- Test offline behavior (network tab in DevTools)

### Browser DevTools Testing
- Open Chrome DevTools
- Switch to mobile view (iPhone/Android)
- Test all pages in mobile viewport
- Check for console errors

## 5. Integration Testing

### Full Worker Workflow
1. **Start Shift**: Toggle availability to "online"
2. **Find Jobs**: Browse available pickups
3. **Accept Job**: Accept a pickup task
4. **Start Collection**: Mark pickup as started
5. **Communicate**: Chat with customer
6. **Complete Job**: Upload proof and complete
7. **Check Earnings**: View updated earnings
8. **End Shift**: Go offline

### Error Testing
- Test with invalid tokens (should redirect to login)
- Test network failures (should show retry options)
- Test empty states (no tasks, no messages, no earnings)
- Test validation errors (invalid form data)

## 6. Performance Testing

### Load Testing
```bash
# Test concurrent API requests
for i in {1..10}; do
  curl -X GET http://localhost:8000/api/workers/dashboard/stats/ \
    -H "Authorization: Bearer YOUR_TOKEN" &
done
wait
```

### Database Performance
```python
# In Django shell
from django.db import connection
from django.conf import settings

# Enable query logging
settings.LOGGING['handlers']['console']['level'] = 'DEBUG'

# Run API calls and check query count
print(len(connection.queries))
```

## 7. Security Testing

### Authentication Testing
- Test expired tokens (should return 401)
- Test invalid permissions (customer accessing worker endpoints)
- Test CORS headers
- Test rate limiting (if implemented)

### Data Validation Testing
```bash
# Test invalid data
curl -X POST http://localhost:8000/api/workers/pickups/999/accept/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return 404 or appropriate error
```

## 8. Expected Results

### Successful API Responses
- **Dashboard Stats**: Returns pickup counts, earnings, ratings
- **Available Pickups**: Returns list of open pickup requests
- **Accept Pickup**: Returns success message, updates status
- **Chat Messages**: Returns paginated message list
- **Earnings**: Returns transaction history with totals

### Frontend Functionality
- **Responsive Design**: Works on mobile and desktop
- **Real-time Updates**: Status changes reflect immediately
- **Error Handling**: Shows appropriate error messages
- **Loading States**: Displays spinners during API calls
- **Navigation**: Smooth transitions between pages

## 9. Troubleshooting

### Common Issues
1. **CORS Errors**: Check `CORS_ALLOWED_ORIGINS` in Django settings
2. **Authentication Failed**: Verify JWT token format and expiry
3. **404 Errors**: Check URL patterns and endpoint availability
4. **Permission Denied**: Ensure user has worker role
5. **Database Errors**: Run migrations: `python manage.py migrate`

### Debug Steps
1. Check Django server logs in terminal
2. Open browser DevTools for network/console errors
3. Verify API responses in Postman/curl
4. Check database state in Django admin or shell
5. Review authentication middleware and permissions

## 10. Production Readiness Checklist

- [ ] All API endpoints return appropriate status codes
- [ ] Authentication and authorization work correctly
- [ ] Error handling is comprehensive
- [ ] Mobile responsiveness is tested
- [ ] Performance is acceptable (< 2s response times)
- [ ] Security validations pass
- [ ] Database queries are optimized
- [ ] Real-time features work as expected
- [ ] Integration between frontend and backend is seamless
- [ ] User experience flows are intuitive

---

**🎉 Happy Testing!** The Worker Dashboard is production-ready and fully functional for your waste management platform.