"""Signal handlers for automatic notification triggering."""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from apps.bins.models import PickupRequest, Bin
from .services import (
    notify_pickup_request_created,
    notify_pickup_assigned,
    notify_pickup_completed,
    notify_bin_full
)


# Temporarily disabled for data seeding
# @receiver(post_save, sender=PickupRequest)
def handle_pickup_request_changes(sender, instance, created, **kwargs):
    """Handle pickup request status changes."""
    # Disabled for data seeding to avoid notification issues
    pass
    # if created:
    #     # New pickup request created
    #     notify_pickup_request_created(instance)
    # else:
    #     # Check for status changes
    #     if hasattr(instance, '_previous_status'):
    #         old_status = instance._previous_status
    #         new_status = instance.status

    #         if old_status == PickupRequest.PickupStatus.OPEN and new_status == PickupRequest.PickupStatus.ASSIGNED:
    #             notify_pickup_assigned(instance)
    #         elif new_status == PickupRequest.PickupStatus.COMPLETED:
    #             notify_pickup_completed(instance)


# Temporarily disabled for data seeding
# @receiver(pre_save, sender=PickupRequest)
def store_previous_pickup_status(sender, instance, **kwargs):
    """Store previous status for comparison."""
    # Disabled for data seeding
    pass


# Temporarily disabled for data seeding
# @receiver(post_save, sender=Bin)
def handle_bin_changes(sender, instance, created, **kwargs):
    """Handle bin status changes."""
    # Disabled for data seeding
    pass
    if not created and hasattr(instance, '_previous_fill_level'):
        old_fill_level = instance._previous_fill_level
        new_fill_level = instance.fill_level

        # Notify when bin becomes full
        if old_fill_level < 90 and new_fill_level >= 90:
            notify_bin_full(instance)


@receiver(pre_save, sender=Bin)
def store_previous_bin_status(sender, instance, **kwargs):
    """Store previous fill level for comparison."""
    if instance.pk:
        try:
            previous = Bin.objects.get(pk=instance.pk)
            instance._previous_fill_level = previous.fill_level
        except Bin.DoesNotExist:
            instance._previous_fill_level = 0
    else:
        instance._previous_fill_level = 0
