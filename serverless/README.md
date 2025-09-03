# Klynaa Hybrid Serverless Architecture

## Overview
This directory contains the serverless layer for Klynaa, designed to handle async tasks, notifications, and analytics while keeping core business logic in Django.

## Architecture Components

### 1. Core Functions (`functions/`)
- **notifications.py**: Push notifications to users
- **escrow.py**: Automated escrow release and payment processing
- **geo.py**: Geographic worker notifications and service area optimization
- **scheduler.py**: Daily reports, weekly analytics, and data cleanup

### 2. Shared Utilities (`shared/`)
- **utils.py**: Common utilities for Django API communication
- **notifications.py**: Notification service integrations (Firebase, SNS)

### 3. Configuration
- **serverless.yml**: AWS Lambda deployment configuration
- **requirements.txt**: Python dependencies

## Integration with Django Backend

### API Endpoints for Serverless
The Django backend provides API endpoints for serverless functions:

```
/api/serverless/          # Serverless integration endpoints
/api/reports/             # Report generation endpoints
/api/analytics/           # Analytics data endpoints
/api/workers/             # Worker management endpoints
/api/users/               # User token and admin endpoints
/api/cleanup/             # Data cleanup endpoints
```

### Event Flow

1. **Pickup Request Created** → Django creates pickup → Triggers serverless notification
2. **Worker Accepts** → Django updates status → Serverless notifies customer
3. **Pickup Delivered** → Django marks delivered → Serverless processes escrow release
4. **Daily Schedule** → Serverless generates reports → Sends to admins

## Deployment

### Prerequisites
```bash
npm install -g serverless
pip install -r requirements.txt
```

### Environment Variables
```bash
export DJANGO_API_URL="https://your-django-api.com"
export DJANGO_API_KEY="your-api-key"
export FIREBASE_SERVER_KEY="your-firebase-key"
export NOTIFICATION_SERVICE="firebase"  # or "sns"
```

### Deploy to AWS
```bash
serverless deploy --stage production
```

### Local Testing
```bash
# Test notification function
serverless invoke local --function sendPickupNotification --data '{"pickup_id": 1, "notification_type": "pickup_requested", "user_type": "worker"}'

# Test escrow release
serverless invoke local --function processEscrowRelease --data '{"pickup_id": 1, "release_reason": "customer_confirmed"}'
```

## Monitoring and Logging

All functions log to CloudWatch with structured logging:
- Function start/end events
- Error handling with context
- Performance metrics
- Integration success/failure rates

## Scaling Considerations

- Functions auto-scale based on demand
- Database connections pooled through Django API
- Notification batching for high-volume events
- Geographic calculations optimized for performance

## Security

- API key authentication for Django communication
- Function-level IAM roles
- No direct database access from serverless functions
- Sensitive data handled through environment variables
