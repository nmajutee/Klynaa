import React from 'react';
import { Badge } from '@klynaa/ui';

export interface BinStatusBadgeProps {
  status: 'active' | 'inactive' | 'full' | 'maintenance';
  className?: string;
}

export const BinStatusBadge: React.FC<BinStatusBadgeProps> = ({
  status,
  className,
}) => {
  const getVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'full': return 'warning';
      case 'maintenance': return 'error';
      default: return 'default';
    }
  };

  return (
    <Badge variant={getVariant(status) as any} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};