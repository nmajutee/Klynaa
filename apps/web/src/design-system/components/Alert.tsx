import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Alert Component
const alertVariants = cva(
  'relative w-full rounded-md border p-4 flex items-start space-x-3',
  {
    variants: {
      variant: {
        default: 'border-neutral-200 bg-neutral-50 text-neutral-900',
        success: 'border-success-200 bg-success-50 text-success-900',
        warning: 'border-warning-200 bg-warning-50 text-warning-900',
        danger: 'border-danger-200 bg-danger-50 text-danger-900',
        info: 'border-primary-200 bg-primary-50 text-primary-900',
      },
      size: {
        sm: 'text-sm p-3',
        md: 'text-sm p-4',
        lg: 'text-base p-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  variant,
  size,
  title,
  description,
  dismissible = false,
  onDismiss,
  action,
  icon = true,
  children,
  className,
  ...props
}) => {
  const [visible, setVisible] = useState(true);

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return Icons.CheckCircle;
      case 'warning':
        return Icons.AlertTriangle;
      case 'danger':
        return Icons.XCircle;
      case 'info':
        return Icons.Info;
      default:
        return Icons.Info;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-success-500';
      case 'warning':
        return 'text-warning-500';
      case 'danger':
        return 'text-danger-500';
      case 'info':
        return 'text-primary-500';
      default:
        return 'text-neutral-500';
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  const IconComponent = getIcon();

  return (
    <div className={cn(alertVariants({ variant, size }), className)} {...props}>
      {icon && (
        <div className="flex-shrink-0">
          <IconComponent className={cn('h-5 w-5', getIconColor())} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-sm font-medium mb-1">{title}</h3>
        )}
        {description && (
          <p className="text-sm opacity-90">{description}</p>
        )}
        {children && (
          <div className="mt-2">{children}</div>
        )}

        {action && (
          <div className="mt-3">
            <button
              onClick={action.onClick}
              className="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>

      {dismissible && (
        <div className="flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="inline-flex p-1 rounded-md hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
          >
            <Icons.X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// Banner Component
const bannerVariants = cva(
  'relative w-full flex items-center justify-between p-4 text-sm',
  {
    variants: {
      variant: {
        default: 'bg-neutral-900 text-white',
        primary: 'bg-primary-600 text-white',
        success: 'bg-success-600 text-white',
        warning: 'bg-warning-600 text-white',
        danger: 'bg-danger-600 text-white',
      },
      position: {
        top: 'fixed top-0 left-0 right-0 z-50',
        bottom: 'fixed bottom-0 left-0 right-0 z-50',
        relative: 'relative',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'relative',
    },
  }
);

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export const Banner: React.FC<BannerProps> = ({
  variant,
  position,
  message,
  dismissible = false,
  onDismiss,
  action,
  icon,
  className,
  ...props
}) => {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <div className={cn(bannerVariants({ variant, position }), className)} {...props}>
      <div className="flex items-center space-x-3">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <span className="font-medium">{message}</span>
      </div>

      <div className="flex items-center space-x-3">
        {action && (
          <button
            onClick={action.onClick}
            className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
          >
            {action.label}
          </button>
        )}

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="inline-flex p-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <Icons.X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Notification Context and Provider
export interface NotificationData {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: NotificationData[];
  addNotification: (notification: Omit<NotificationData, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationData = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration if not persistent
    if (!notification.persistent && newNotification.duration! > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Component
export interface NotificationProps extends NotificationData {
  onDismiss?: (id: string) => void;
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  id,
  title,
  message,
  type,
  persistent = false,
  action,
  onDismiss,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return Icons.CheckCircle;
      case 'warning':
        return Icons.AlertTriangle;
      case 'danger':
        return Icons.XCircle;
      case 'info':
        return Icons.Info;
      default:
        return Icons.Info;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-white',
          border: 'border-success-200',
          icon: 'text-success-500',
          title: 'text-success-900',
          message: 'text-success-700',
        };
      case 'warning':
        return {
          bg: 'bg-white',
          border: 'border-warning-200',
          icon: 'text-warning-500',
          title: 'text-warning-900',
          message: 'text-warning-700',
        };
      case 'danger':
        return {
          bg: 'bg-white',
          border: 'border-danger-200',
          icon: 'text-danger-500',
          title: 'text-danger-900',
          message: 'text-danger-700',
        };
      case 'info':
        return {
          bg: 'bg-white',
          border: 'border-primary-200',
          icon: 'text-primary-500',
          title: 'text-primary-900',
          message: 'text-primary-700',
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-neutral-200',
          icon: 'text-neutral-500',
          title: 'text-neutral-900',
          message: 'text-neutral-700',
        };
    }
  };

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.(id);
    }, 300);
  };

  if (!isVisible) return null;

  const IconComponent = getIcon();
  const colors = getColors();

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300',
        colors.bg,
        colors.border,
        isLeaving
          ? 'translate-x-full opacity-0'
          : 'translate-x-0 opacity-100',
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className={cn('h-5 w-5', colors.icon)} />
          </div>

          <div className="ml-3 w-0 flex-1">
            <p className={cn('text-sm font-medium', colors.title)}>
              {title}
            </p>
            {message && (
              <p className={cn('mt-1 text-sm', colors.message)}>
                {message}
              </p>
            )}

            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className={cn(
                    'text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded',
                    colors.title
                  )}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>

          <div className="ml-4 flex flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="inline-flex rounded-md text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
            >
              <Icons.X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Container
export const NotificationContainer: React.FC<{
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}> = ({
  position = 'top-right',
  className,
}) => {
  const { notifications, removeNotification } = useNotifications();

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-right':
        return 'top-0 right-0';
      case 'top-center':
        return 'top-0 left-1/2 transform -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-right':
        return 'bottom-0 right-0';
      case 'bottom-center':
        return 'bottom-0 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-0 right-0';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col space-y-4 p-6 pointer-events-none',
        getPositionClasses(),
        className
      )}
    >
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          {...notification}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
};

// Call-to-Action Component
export interface CallToActionProps {
  title: string;
  description?: string;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const ctaVariants = cva(
  'w-full rounded-lg border p-6 text-center',
  {
    variants: {
      variant: {
        default: 'border-neutral-200 bg-neutral-50',
        primary: 'border-primary-200 bg-primary-50',
        success: 'border-success-200 bg-success-50',
        warning: 'border-warning-200 bg-warning-50',
        danger: 'border-danger-200 bg-danger-50',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export const CallToAction: React.FC<CallToActionProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = 'default',
  size = 'md',
  dismissible = false,
  onDismiss,
  icon,
  className,
}) => {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <div className={cn(ctaVariants({ variant, size }), className)}>
      {dismissible && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleDismiss}
            className="text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 rounded"
          >
            <Icons.X className="h-4 w-4" />
          </button>
        </div>
      )}

      {icon && (
        <div className="flex justify-center mb-4">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-neutral-600 mb-6">
          {description}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={primaryAction.onClick}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          {primaryAction.label}
        </button>

        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;