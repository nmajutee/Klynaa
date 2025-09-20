import React from 'react';
import { Avatar } from '@klynaa/ui';

export interface UserAvatarProps {
  user: {
    id: string;
    name: string;
    email?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showName = false,
  className,
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar
        name={user.name}
        size={size}
      />
      {showName && (
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.name}
          </p>
          {user.email && (
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          )}
        </div>
      )}
    </div>
  );
};