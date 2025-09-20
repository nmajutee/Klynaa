import React from 'react';
import { Card, Badge, Icon } from '@klynaa/ui';

export interface BinStatusCardProps {
  status: 'active' | 'inactive' | 'full' | 'maintenance';
  count: number;
  className?: string;
  onClick?: () => void;
}

export const BinStatusCard: React.FC<BinStatusCardProps> = ({
  status,
  count,
  className,
  onClick,
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'success', icon: 'check', label: 'Active' };
      case 'full':
        return { color: 'warning', icon: 'warning', label: 'Full' };
      case 'maintenance':
        return { color: 'error', icon: 'settings', label: 'Maintenance' };
      default:
        return { color: 'default', icon: 'bin', label: 'Inactive' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <Badge variant={config.color as any}>
            {config.label}
          </Badge>
          <p className="text-2xl font-bold mt-2">{count}</p>
        </div>
        <Icon name={config.icon} size="lg" className="text-gray-400" />
      </div>
    </Card>
  );
};