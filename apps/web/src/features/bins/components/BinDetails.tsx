import React from 'react';
import { useBin } from '@klynaa/api';
import { Card, Badge, Button, Icon } from '@klynaa/ui';

export interface BinDetailsProps {
  binId: string;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const BinDetails: React.FC<BinDetailsProps> = ({
  binId,
  className,
  onEdit,
  onDelete
}) => {
  const { data: bin, isLoading, error } = useBin(binId);

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (error || !bin) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load bin details</p>
        </div>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'full': return 'warning';
      case 'maintenance': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card className={className}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {bin.type.charAt(0).toUpperCase() + bin.type.slice(1)} Bin
            </h2>
            <Badge variant={getStatusColor(bin.status)}>
              {bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}
            </Badge>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Icon name="edit" className="mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                <Icon name="delete" className="mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Location</h3>
            <p className="text-gray-600">{bin.location.address}</p>
            <p className="text-sm text-gray-500">
              {bin.location.latitude.toFixed(6)}, {bin.location.longitude.toFixed(6)}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-1">Capacity</h3>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-3 mr-2">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${bin.currentLevel}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                {bin.currentLevel}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {bin.capacity}L capacity
            </p>
          </div>

          {bin.lastEmptied && (
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Last Emptied</h3>
              <p className="text-gray-600">
                {new Date(bin.lastEmptied).toLocaleDateString()}
              </p>
            </div>
          )}

          <div>
            <h3 className="font-medium text-gray-900 mb-1">QR Code</h3>
            {bin.qrCode ? (
              <p className="text-gray-600">Available</p>
            ) : (
              <p className="text-gray-500">Not generated</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};