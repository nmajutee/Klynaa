from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static


def health(_request):
    return JsonResponse({"status": "ok"})


def api_root(_request):
    return JsonResponse({
        "message": "Klynaa API v2",
        "endpoints": {
            "health": "/api/health/",
            "admin": "/admin/",
            "auth": "/api/users/token/",
            "user_profile": "/api/users/me/",
            "bins": "/api/bins/",
            "pickups": "/api/pickups/",
            "serverless": "/api/serverless/",
            "reports": "/api/reports/",
            "analytics": "/api/analytics/",
        }
    })


urlpatterns = [
    path("", api_root),  # Root endpoint
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/users/", include("apps.users.urls")),
    path("api/", include("apps.bins.urls")),
    path("api/", include("apps.reviews.urls")),
    path("api/payments/", include("apps.payments.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
