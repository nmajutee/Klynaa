import React from 'react';
import { Card, Badge, Icon } from '@klynaa/ui';
import { BinStatusBadge } from './BinStatusBadge';

export interface BinCardProps {
  bin: {
    id: string;
    type: 'general' | 'recyclable' | 'organic' | 'hazardous';
    location: {
      address: string;
    };
    capacity: number;
    currentLevel: number;
    status: 'active' | 'inactive' | 'full' | 'maintenance';
  };
  onClick?: () => void;
  className?: string;
}

export const BinCard: React.FC<BinCardProps> = ({
  bin,
  onClick,
  className,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recyclable': return 'info';
      case 'organic': return 'check';
      case 'hazardous': return 'warning';
      default: return 'bin';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recyclable': return 'text-blue-600';
      case 'organic': return 'text-green-600';
      case 'hazardous': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon
              name={getTypeIcon(bin.type)}
              className={getTypeColor(bin.type)}
            />
            <h3 className="font-medium">
              {bin.type.charAt(0).toUpperCase() + bin.type.slice(1)}
            </h3>
          </div>
          <BinStatusBadge status={bin.status} />
        </div>

        <p className="text-sm text-gray-600 truncate">
          {bin.location.address}
        </p>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Capacity</span>
            <span className="text-sm font-medium">{bin.currentLevel}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                bin.currentLevel > 80 ? 'bg-red-500' :
                bin.currentLevel > 60 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${bin.currentLevel}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-gray-500">
          {bin.capacity}L total capacity
        </div>
      </div>
    </Card>
  );
};