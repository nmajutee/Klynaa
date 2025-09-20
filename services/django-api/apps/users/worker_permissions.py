"""Custom permissions for worker dashboard endpoints."""
from rest_framework import permissions

class IsWorker(permissions.BasePermission):
    message = "You must be a worker to access this endpoint."
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'is_worker', False))
