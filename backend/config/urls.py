from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


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
    # Note: Do not override the /api/ prefix with a static root view here.
    # Individual app routes are included below so serverless endpoints and
    # app APIs are reachable at /api/...
    path("api/health/", health),
    path("api/users/", include("apps.users.urls")),
    path("api/", include("apps.bins.urls")),
    path("api/", include("apps.reviews.urls")),
    path("api/payments/", include("apps.payments.urls")),
]
