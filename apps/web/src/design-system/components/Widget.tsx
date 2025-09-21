import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';
import { Button } from './Button';
import { Card } from './Card';

// Base Widget Component
const widgetVariants = cva(
  'bg-white rounded-lg border border-neutral-200 overflow-hidden',
  {
    variants: {
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      variant: {
        default: 'shadow-sm',
        elevated: 'shadow-md',
        flat: 'shadow-none',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface WidgetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof widgetVariants> {
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<any>;
  actions?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  loading?: boolean;
}

export const Widget: React.FC<WidgetProps> = ({
  title,
  subtitle,
  icon: IconComponent,
  actions,
  collapsible = false,
  defaultCollapsed = false,
  loading = false,
  size,
  variant,
  className,
  children,
  ...props
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className={cn(widgetVariants({ size, variant }), className)} {...props}>
      {(title || subtitle || IconComponent || actions || collapsible) && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
          <div className="flex items-center space-x-3">
            {IconComponent && (
              <div className="flex-shrink-0">
                <IconComponent className="h-5 w-5 text-neutral-600" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {actions}
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <Icons.ChevronDown size="sm" />
                ) : (
                  <Icons.ChevronUp size="sm" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="animate-spin">
                <Icons.Settings className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
};

// Stats Widget
export interface StatsWidgetProps {
  stats: Array<{
    id: string;
    label: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: React.ComponentType<any>;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  }>;
  layout?: 'horizontal' | 'vertical' | 'grid';
  className?: string;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({
  stats,
  layout = 'horizontal',
  className,
}) => {
  const layouts = {
    horizontal: 'flex divide-x divide-neutral-200',
    vertical: 'space-y-4',
    grid: 'grid grid-cols-2 gap-4',
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-success-600';
    if (change < 0) return 'text-error-600';
    return 'text-neutral-500';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <Icons.ChevronUp size="xs" />;
    if (change < 0) return <Icons.ChevronDown size="xs" />;
    return null;
  };

  return (
    <Widget className={className}>
      <div className={layouts[layout]}>
        {stats.map((stat, index) => (
          <div
            key={stat.id}
            className={cn(
              layout === 'horizontal' && 'flex-1 px-4 first:pl-0 last:pr-0',
              'text-center'
            )}
          >
            {stat.icon && (
              <div className="flex justify-center mb-2">
                <stat.icon className={cn(
                  'h-8 w-8',
                  stat.color === 'primary' && 'text-primary-600',
                  stat.color === 'secondary' && 'text-secondary-600',
                  stat.color === 'success' && 'text-success-600',
                  stat.color === 'warning' && 'text-warning-600',
                  stat.color === 'error' && 'text-error-600',
                  !stat.color && 'text-neutral-600'
                )} />
              </div>
            )}

            <div className="text-3xl font-bold text-neutral-900 mb-1">
              {stat.value}
            </div>

            <div className="text-sm text-neutral-600 mb-2">
              {stat.label}
            </div>

            {stat.change !== undefined && (
              <div className={cn('flex items-center justify-center text-xs', getChangeColor(stat.change))}>
                {getChangeIcon(stat.change)}
                <span className="ml-1">
                  {Math.abs(stat.change)}%
                  {stat.changeLabel && ` ${stat.changeLabel}`}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Widget>
  );
};

// Chart Widget (placeholder for chart library integration)
export interface ChartWidgetProps {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area';
  data: any;
  height?: number;
  loading?: boolean;
  className?: string;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  type,
  data,
  height = 300,
  loading = false,
  className,
}) => {
  return (
    <Widget
      title={title}
      loading={loading}
      className={className}
      icon={Icons.Dashboard}
    >
      <div
        className="w-full bg-neutral-50 rounded-md flex items-center justify-center border-2 border-dashed border-neutral-200"
        style={{ height }}
      >
        <div className="text-center text-neutral-500">
          <Icons.Dashboard className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">
            {type.charAt(0).toUpperCase() + type.slice(1)} Chart
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Chart library integration needed
          </p>
        </div>
      </div>
    </Widget>
  );
};

// Activity Feed Widget
export interface ActivityItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  icon?: React.ComponentType<any>;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  showAvatars?: boolean;
  maxItems?: number;
  className?: string;
}

export const ActivityFeedWidget: React.FC<ActivityFeedProps> = ({
  items,
  showAvatars = true,
  maxItems = 10,
  className,
}) => {
  const displayItems = items.slice(0, maxItems);

  const getTypeColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success': return 'text-success-600 bg-success-100';
      case 'warning': return 'text-warning-600 bg-warning-100';
      case 'error': return 'text-error-600 bg-error-100';
      default: return 'text-primary-600 bg-primary-100';
    }
  };

  const getTypeIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success': return Icons.CheckCircle;
      case 'warning': return Icons.AlertTriangle;
      case 'error': return Icons.XCircle;
      default: return Icons.Info;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Widget
      title="Activity Feed"
      icon={Icons.Bell}
      className={className}
    >
      <div className="space-y-4">
        {displayItems.map((item) => {
          const TypeIcon = item.icon || getTypeIcon(item.type);

          return (
            <div key={item.id} className="flex space-x-3">
              <div className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                getTypeColor(item.type)
              )}>
                <TypeIcon size="sm" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-sm text-neutral-600 mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.user && (
                      <p className="text-xs text-neutral-500 mt-1">
                        by {item.user.name}
                      </p>
                    )}
                  </div>

                  <span className="text-xs text-neutral-500 whitespace-nowrap ml-2">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>
              </div>

              {showAvatars && item.user?.avatar && (
                <img
                  className="w-6 h-6 rounded-full"
                  src={item.user.avatar}
                  alt={item.user.name}
                />
              )}
            </div>
          );
        })}
      </div>

      {items.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <Button variant="ghost" size="sm" className="w-full">
            View all activities
          </Button>
        </div>
      )}
    </Widget>
  );
};

// Quick Actions Widget
export interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export interface QuickActionsProps {
  actions: QuickAction[];
  layout?: 'grid' | 'list';
  className?: string;
}

export const QuickActionsWidget: React.FC<QuickActionsProps> = ({
  actions,
  layout = 'grid',
  className,
}) => {
  return (
    <Widget
      title="Quick Actions"
      icon={Icons.Settings}
      className={className}
    >
      <div className={cn(
        layout === 'grid'
          ? 'grid grid-cols-2 gap-3'
          : 'space-y-2'
      )}>
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            className={cn(
              'justify-start h-auto p-4',
              layout === 'list' && 'w-full'
            )}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            <action.icon className={cn(
              'h-5 w-5 mr-3',
              action.color === 'primary' && 'text-primary-600',
              action.color === 'secondary' && 'text-secondary-600',
              action.color === 'success' && 'text-success-600',
              action.color === 'warning' && 'text-warning-600',
              action.color === 'error' && 'text-error-600'
            )} />
            <div className="text-left">
              <div className="font-medium">{action.label}</div>
              {action.description && (
                <div className="text-xs text-neutral-500 mt-1">
                  {action.description}
                </div>
              )}
            </div>
          </Button>
        ))}
      </div>
    </Widget>
  );
};

// Progress Widget
export interface ProgressItem {
  id: string;
  label: string;
  value: number;
  max: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showValue?: boolean;
}

export interface ProgressWidgetProps {
  title: string;
  items: ProgressItem[];
  className?: string;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  title,
  items,
  className,
}) => {
  const getProgressColor = (color?: ProgressItem['color']) => {
    switch (color) {
      case 'secondary': return 'bg-secondary-600';
      case 'success': return 'bg-success-600';
      case 'warning': return 'bg-warning-600';
      case 'error': return 'bg-error-600';
      default: return 'bg-primary-600';
    }
  };

  return (
    <Widget
      title={title}
      icon={Icons.Dashboard}
      className={className}
    >
      <div className="space-y-4">
        {items.map((item) => {
          const percentage = Math.round((item.value / item.max) * 100);

          return (
            <div key={item.id}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-neutral-900">
                  {item.label}
                </span>
                {item.showValue !== false && (
                  <span className="text-sm text-neutral-600">
                    {item.value}/{item.max} ({percentage}%)
                  </span>
                )}
              </div>

              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className={cn('h-2 rounded-full transition-all duration-300', getProgressColor(item.color))}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Widget>
  );
};

// Notification Widget
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export interface NotificationWidgetProps {
  notifications: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  maxItems?: number;
  className?: string;
}

export const NotificationWidget: React.FC<NotificationWidgetProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  maxItems = 5,
  className,
}) => {
  const displayNotifications = notifications.slice(0, maxItems);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeStyles = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success': return 'border-l-success-500 bg-success-50';
      case 'warning': return 'border-l-warning-500 bg-warning-50';
      case 'error': return 'border-l-error-500 bg-error-50';
      default: return 'border-l-primary-500 bg-primary-50';
    }
  };

  return (
    <Widget
      title="Notifications"
      icon={Icons.Bell}
      actions={
        unreadCount > 0 && onMarkAllAsRead && (
          <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
            Mark all as read
          </Button>
        )
      }
      className={className}
    >
      <div className="space-y-3">
        {displayNotifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              'p-3 rounded-md border-l-4 transition-colors',
              getTypeStyles(notification.type),
              !notification.read && 'ring-1 ring-neutral-200'
            )}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-neutral-900">
                  {notification.title}
                  {!notification.read && (
                    <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full inline-block" />
                  )}
                </h4>
                <p className="text-sm text-neutral-600 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  {notification.timestamp.toLocaleString()}
                </p>
              </div>

              {onMarkAsRead && !notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="ml-2"
                >
                  <Icons.CheckCircle size="sm" />
                </Button>
              )}
            </div>

            {notification.actions && notification.actions.length > 0 && (
              <div className="flex space-x-2 mt-3">
                {notification.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant === 'primary' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {notifications.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <Button variant="ghost" size="sm" className="w-full">
            View all notifications ({notifications.length - maxItems} more)
          </Button>
        </div>
      )}
    </Widget>
  );
};

export default Widget;