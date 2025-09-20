"""
Custom permissions for customer-specific views.
"""

from rest_framework import permissions
from apps.bins.models import Bin, PickupRequest


class IsCustomer(permissions.BasePermission):
    """
    Permission to only allow customers to access customer views.
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'customer'
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions only to the owner of the object
        return obj.owner == request.user


class IsBinOwner(permissions.BasePermission):
    """
    Permission to check if user owns the bin.
    """

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        return False


class IsPickupRequestOwner(permissions.BasePermission):
    """
    Permission to check if user owns the pickup request.
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, PickupRequest):
            return obj.owner == request.user
        return False


class CanCancelPickup(permissions.BasePermission):
    """
    Permission to check if pickup can be cancelled.
    """

    def has_object_permission(self, request, view, obj):
        if not isinstance(obj, PickupRequest):
            return False

        # Only owner can cancel
        if obj.owner != request.user:
            return False

        # Can only cancel if status is 'open' or 'accepted'
        return obj.status in ['open', 'accepted']


class CanRateWorker(permissions.BasePermission):
    """
    Permission to check if customer can rate the worker.
    """

    def has_object_permission(self, request, view, obj):
        if not isinstance(obj, PickupRequest):
            return False

        # Only owner can rate
        if obj.owner != request.user:
            return False

        # Can only rate completed pickups with assigned worker
        return (
            obj.status == 'completed' and
            obj.worker is not None
        )