import React from 'react';
import { usePickups } from '@klynaa/api';
import { DataTable, Card, Badge, Button } from '@klynaa/ui';

export interface PickupListProps {
  className?: string;
  workerId?: string;
  customerId?: string;
  onPickupSelect?: (pickupId: string) => void;
}

export const PickupList: React.FC<PickupListProps> = ({
  className,
  workerId,
  customerId,
  onPickupSelect
}) => {
  const { data: pickupsData, isLoading, error } = usePickups({
    workerId,
    customerId,
  });

  if (error) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load pickups</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      default: return 'default';
    }
  };

  const columns = [
    {
      key: 'bin',
      header: 'Location',
      render: (bin: any) => bin?.location?.address || 'Unknown',
    },
    {
      key: 'status',
      header: 'Status',
      render: (status: string) => (
        <Badge variant={getStatusVariant(status)}>
          {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (priority: string) => (
        <Badge variant={getPriorityVariant(priority)}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'scheduledTime',
      header: 'Scheduled',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      key: 'worker',
      header: 'Worker',
      render: (worker: any) => worker?.name || 'Unassigned',
    },
  ];

  return (
    <Card className={className}>
      <DataTable
        data={pickupsData?.results || []}
        columns={columns}
        loading={isLoading}
        emptyMessage="No pickups found"
        onRowClick={(pickup) => onPickupSelect?.(pickup.id)}
      />
    </Card>
  );
};