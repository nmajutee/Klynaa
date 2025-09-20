import React from 'react';
import { useBins } from '@klynaa/api';
import { DataTable, Card, Badge, Button } from '@klynaa/ui';

export interface BinListProps {
  className?: string;
  onBinSelect?: (binId: string) => void;
}

export const BinList: React.FC<BinListProps> = ({ className, onBinSelect }) => {
  const { data: binsData, isLoading, error } = useBins();

  if (error) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load bins</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const columns = [
    {
      key: 'type',
      header: 'Type',
      render: (value: string) => (
        <Badge variant={value === 'recyclable' ? 'success' : 'default'}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (location: any) => location.address || 'Unknown',
    },
    {
      key: 'currentLevel',
      header: 'Level',
      render: (level: number) => `${level}%`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (status: string) => (
        <Badge
          variant={status === 'active' ? 'success' :
                  status === 'full' ? 'warning' :
                  status === 'maintenance' ? 'error' : 'default'}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <Card className={className}>
      <DataTable
        data={binsData?.results || []}
        columns={columns}
        loading={isLoading}
        emptyMessage="No bins found"
        onRowClick={(bin) => onBinSelect?.(bin.id)}
      />
    </Card>
  );
};