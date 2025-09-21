import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';
import { Badge } from './Badge';

// Avatar Component
const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-neutral-100 font-medium text-neutral-600',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
        '3xl': 'h-24 w-24 text-3xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
  initials?: string;
  fallback?: React.ReactNode;
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  notification?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  size,
  src,
  alt,
  name,
  initials,
  fallback,
  status,
  showStatus = false,
  notification,
  className,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName?: string): string => {
    if (initials) return initials;
    if (!fullName) return '??';

    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-success-500';
      case 'offline':
        return 'bg-neutral-400';
      case 'away':
        return 'bg-warning-500';
      case 'busy':
        return 'bg-danger-500';
      default:
        return 'bg-neutral-400';
    }
  };

  const getStatusSize = () => {
    switch (size) {
      case 'xs':
        return 'h-2 w-2';
      case 'sm':
        return 'h-2.5 w-2.5';
      case 'md':
        return 'h-3 w-3';
      case 'lg':
        return 'h-3.5 w-3.5';
      case 'xl':
        return 'h-4 w-4';
      case '2xl':
        return 'h-5 w-5';
      case '3xl':
        return 'h-6 w-6';
      default:
        return 'h-3 w-3';
    }
  };

  return (
    <div className={cn(avatarVariants({ size }), className)} {...props}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : fallback ? (
        fallback
      ) : (
        <span className="select-none">
          {getInitials(name)}
        </span>
      )}

      {/* Status Indicator */}
      {showStatus && status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full border-2 border-white',
            getStatusColor(),
            getStatusSize()
          )}
        />
      )}

      {/* Notification Badge */}
      {notification !== undefined && notification > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger-500 text-xs font-bold text-white">
          {notification > 99 ? '99+' : notification}
        </span>
      )}
    </div>
  );
};

// Avatar Group Component
export interface AvatarGroupProps {
  users: Array<{
    id: string;
    name: string;
    src?: string;
    status?: 'online' | 'offline' | 'away' | 'busy';
  }>;
  max?: number;
  size?: VariantProps<typeof avatarVariants>['size'];
  showStatus?: boolean;
  className?: string;
  onViewAll?: () => void;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 4,
  size = 'md',
  showStatus = false,
  className,
  onViewAll,
}) => {
  const displayUsers = users.slice(0, max);
  const remainingCount = Math.max(0, users.length - max);

  const getOverlapClass = () => {
    switch (size) {
      case 'xs':
        return '-ml-1';
      case 'sm':
        return '-ml-1.5';
      case 'md':
        return '-ml-2';
      case 'lg':
        return '-ml-2.5';
      case 'xl':
        return '-ml-3';
      case '2xl':
        return '-ml-4';
      case '3xl':
        return '-ml-5';
      default:
        return '-ml-2';
    }
  };

  return (
    <div className={cn('flex items-center', className)}>
      {displayUsers.map((user, index) => (
        <Avatar
          key={user.id}
          name={user.name}
          src={user.src}
          size={size}
          status={user.status}
          showStatus={showStatus}
          className={cn(
            'border-2 border-white',
            index > 0 && getOverlapClass()
          )}
          style={{ zIndex: displayUsers.length - index }}
        />
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            avatarVariants({ size }),
            'border-2 border-white bg-neutral-200 text-neutral-600 cursor-pointer hover:bg-neutral-300 transition-colors',
            getOverlapClass()
          )}
          onClick={onViewAll}
          style={{ zIndex: 0 }}
        >
          <span className="text-xs font-semibold">+{remainingCount}</span>
        </div>
      )}
    </div>
  );
};

// Profile Card Component
export interface ProfileCardProps {
  user: {
    id: string;
    name: string;
    email?: string;
    role?: string;
    department?: string;
    location?: string;
    avatar?: string;
    status?: 'online' | 'offline' | 'away' | 'busy';
    bio?: string;
    joinDate?: string;
    completedPickups?: number;
    rating?: number;
  };
  variant?: 'compact' | 'full';
  showActions?: boolean;
  onEdit?: () => void;
  onMessage?: () => void;
  onCall?: () => void;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  variant = 'full',
  showActions = true,
  onEdit,
  onMessage,
  onCall,
  className,
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icons.CheckCircle
        key={i}
        className={cn(
          'h-4 w-4',
          i < rating ? 'text-warning-400 fill-current' : 'text-neutral-300'
        )}
      />
    ));
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-3 p-3 rounded-lg border bg-white', className)}>
        <Avatar
          name={user.name}
          src={user.avatar}
          size="md"
          status={user.status}
          showStatus
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate">
            {user.name}
          </p>
          <p className="text-sm text-neutral-500 truncate">
            {user.role || user.email}
          </p>
        </div>
        {showActions && (
          <div className="flex space-x-1">
            {onMessage && (
              <button
                onClick={onMessage}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                <Icons.Plus className="h-4 w-4" />
              </button>
            )}
            {onCall && (
              <button
                onClick={onCall}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                <Icons.Settings className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg border p-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Avatar
            name={user.name}
            src={user.avatar}
            size="xl"
            status={user.status}
            showStatus
          />
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {user.name}
            </h3>
            {user.role && (
              <p className="text-sm text-neutral-600">{user.role}</p>
            )}
            {user.department && (
              <p className="text-xs text-neutral-500">{user.department}</p>
            )}
          </div>
        </div>
        {showActions && onEdit && (
          <button
            onClick={onEdit}
            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-md hover:bg-neutral-100"
          >
            <Icons.Edit className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {user.email && (
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <Icons.User className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
        )}
        {user.location && (
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <Icons.MapPin className="h-4 w-4" />
            <span>{user.location}</span>
          </div>
        )}
        {user.joinDate && (
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <Icons.Calendar className="h-4 w-4" />
            <span>Joined {user.joinDate}</span>
          </div>
        )}
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="mb-4">
          <p className="text-sm text-neutral-700">{user.bio}</p>
        </div>
      )}

      {/* Stats */}
      {(user.completedPickups !== undefined || user.rating !== undefined) && (
        <div className="flex items-center justify-between mb-4 p-3 bg-neutral-50 rounded-md">
          {user.completedPickups !== undefined && (
            <div className="text-center">
              <p className="text-lg font-semibold text-neutral-900">
                {user.completedPickups}
              </p>
              <p className="text-xs text-neutral-500">Pickups</p>
            </div>
          )}
          {user.rating !== undefined && (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                {renderStars(Math.round(user.rating))}
              </div>
              <p className="text-xs text-neutral-500">{user.rating} Rating</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (onMessage || onCall) && (
        <div className="flex space-x-2">
          {onMessage && (
            <button
              onClick={onMessage}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
            >
              <Icons.Plus className="h-4 w-4" />
              <span>Message</span>
            </button>
          )}
          {onCall && (
            <button
              onClick={onCall}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
            >
              <Icons.Settings className="h-4 w-4" />
              <span>Call</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// User Menu Component
export interface UserMenuProps {
  user: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onProfile,
  onSettings,
  onLogout,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-md hover:bg-neutral-100 transition-colors"
      >
        <Avatar
          name={user.name}
          src={user.avatar}
          size="sm"
        />
        <div className="text-left">
          <p className="text-sm font-medium text-neutral-900">{user.name}</p>
          {user.role && (
            <p className="text-xs text-neutral-500">{user.role}</p>
          )}
        </div>
        <Icons.ChevronDown className="h-4 w-4 text-neutral-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border z-20">
            <div className="py-1">
              {onProfile && (
                <button
                  onClick={() => {
                    onProfile();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  <Icons.User className="h-4 w-4" />
                  <span>View Profile</span>
                </button>
              )}
              {onSettings && (
                <button
                  onClick={() => {
                    onSettings();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  <Icons.Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              )}
              {onLogout && (
                <>
                  <div className="border-t border-neutral-100 my-1" />
                  <button
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    <Icons.Logout className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Avatar;