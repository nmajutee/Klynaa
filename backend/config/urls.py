from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from apps.frontend_views import frontend_app, api_status


def health(_request):
    return JsonResponse({"status": "ok"})


def api_root(_request):
    return JsonResponse({
        "message": "Klynaa API v2",
        "endpoints": {
            "health": "/api/health/",
            "admin": "/admin/",
            "register": "/api/users/register/",
            "auth": "/api/users/token/",
            "user_profile": "/api/users/me/",
            "bins": "/api/bins/",
            "pickups": "/api/pickups/",
            "worker_dashboard": "/api/v1/workers/me/",
            "worker_pickups": "/api/v1/pickups/",
            "worker_earnings": "/api/v1/workers/{id}/transactions/",
            "serverless": "/api/serverless/",
            "reports": "/api/reports/",
            "analytics": "/api/analytics/",
        }
    })


urlpatterns = [
    path("", api_root),  # Root endpoint
    path("frontend/", frontend_app),  # Simple frontend
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/status/", api_status),  # Frontend API status
    path("api/users/", include("apps.users.urls")),
    path("api/v1/", include("apps.users.worker_urls")),
    path("api/", include("apps.bins.urls")),
    path("api/", include("apps.reviews.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/", include("apps.notifications.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
