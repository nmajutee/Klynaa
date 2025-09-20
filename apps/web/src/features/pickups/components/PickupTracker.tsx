import React from 'react';
import { usePickup, useStartPickup, useCompletePickup } from '@klynaa/api';
import { Card, Badge, Button, Icon } from '@klynaa/ui';

export interface PickupTrackerProps {
  pickupId: string;
  className?: string;
  showControls?: boolean;
}

export const PickupTracker: React.FC<PickupTrackerProps> = ({
  pickupId,
  className,
  showControls = false,
}) => {
  const { data: pickup, isLoading } = usePickup(pickupId);
  const startPickup = useStartPickup();
  const completePickup = useCompletePickup();

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        </div>
      </Card>
    );
  }

  if (!pickup) {
    return (
      <Card className={className}>
        <p className="text-red-600">Pickup not found</p>
      </Card>
    );
  }

  const handleStart = async () => {
    try {
      await startPickup.mutateAsync(pickup.id);
    } catch (error) {
      console.error('Failed to start pickup:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await completePickup.mutateAsync({
        id: pickup.id,
        data: {
          notes: 'Completed via tracker',
        },
      });
    } catch (error) {
      console.error('Failed to complete pickup:', error);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { color: 'default', icon: 'info', label: 'Scheduled' };
      case 'assigned':
        return { color: 'warning', icon: 'user', label: 'Assigned' };
      case 'in_progress':
        return { color: 'warning', icon: 'pickup', label: 'In Progress' };
      case 'completed':
        return { color: 'success', icon: 'check', label: 'Completed' };
      case 'cancelled':
        return { color: 'error', icon: 'close', label: 'Cancelled' };
      default:
        return { color: 'default', icon: 'info', label: status };
    }
  };

  const statusConfig = getStatusConfig(pickup.status);

  return (
    <Card className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Pickup Tracking</h3>
          <Badge variant={statusConfig.color as any}>
            <Icon name={statusConfig.icon} size="sm" className="mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Location</h4>
            <p className="text-gray-600">{pickup.bin.location.address}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-1">Scheduled Time</h4>
            <p className="text-gray-600">
              {new Date(pickup.scheduledTime).toLocaleString()}
            </p>
          </div>

          {pickup.worker && (
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Worker</h4>
              <p className="text-gray-600">{pickup.worker.name}</p>
              <p className="text-sm text-gray-500">{pickup.worker.phone}</p>
            </div>
          )}

          <div>
            <h4 className="font-medium text-gray-900 mb-1">Priority</h4>
            <Badge variant={pickup.priority === 'urgent' ? 'error' : 'default'}>
              {pickup.priority.charAt(0).toUpperCase() + pickup.priority.slice(1)}
            </Badge>
          </div>
        </div>

        {pickup.notes && (
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
            <p className="text-gray-600 text-sm">{pickup.notes}</p>
          </div>
        )}

        {showControls && pickup.worker && (
          <div className="flex gap-2 pt-4 border-t">
            {pickup.status === 'assigned' && (
              <Button
                onClick={handleStart}
                disabled={startPickup.isPending}
                className="flex-1"
              >
                {startPickup.isPending ? 'Starting...' : 'Start Pickup'}
              </Button>
            )}
            {pickup.status === 'in_progress' && (
              <Button
                onClick={handleComplete}
                disabled={completePickup.isPending}
                variant="outline"
                className="flex-1"
              >
                {completePickup.isPending ? 'Completing...' : 'Complete Pickup'}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};