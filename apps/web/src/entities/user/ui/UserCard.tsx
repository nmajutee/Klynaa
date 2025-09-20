import React from 'react';
import { Card, Badge } from '@klynaa/ui';
import { UserAvatar } from './UserAvatar';

export interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'worker' | 'admin';
    phone?: string;
    address?: string;
  };
  onClick?: () => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onClick,
  className,
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'worker': return 'warning';
      case 'customer': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <UserAvatar user={user} showName />
          <Badge variant={getRoleColor(user.role) as any}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </div>

        {user.phone && (
          <div>
            <p className="text-sm text-gray-600">{user.phone}</p>
          </div>
        )}

        {user.address && (
          <div>
            <p className="text-sm text-gray-500 truncate">
              {user.address}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};