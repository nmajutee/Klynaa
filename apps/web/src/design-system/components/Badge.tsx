import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Badge Component
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        success: 'border-transparent bg-success-500 text-white hover:bg-success-600',
        warning: 'border-transparent bg-warning-500 text-white hover:bg-warning-600',
        danger: 'border-transparent bg-danger-500 text-white hover:bg-danger-600',
        info: 'border-transparent bg-info-500 text-white hover:bg-info-600',
        outline: 'border-neutral-200 text-neutral-900 hover:bg-neutral-50',
        ghost: 'border-transparent text-neutral-600 hover:bg-neutral-100',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
        xl: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  size,
  icon,
  dismissible = false,
  onDismiss,
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-offset-1"
        >
          <Icons.X className="h-2 w-2" />
          <span className="sr-only">Dismiss</span>
        </button>
      )}
    </div>
  );
};

// Status Indicator Component
const statusVariants = cva(
  'inline-flex items-center gap-1.5 text-sm font-medium',
  {
    variants: {
      variant: {
        dot: '',
        badge: 'px-2 py-1 rounded-full',
        pill: 'px-3 py-1 rounded-full border',
      },
      status: {
        online: 'text-success-700',
        offline: 'text-neutral-500',
        away: 'text-warning-600',
        busy: 'text-danger-600',
        active: 'text-success-600',
        inactive: 'text-neutral-500',
        pending: 'text-warning-600',
        completed: 'text-success-600',
        failed: 'text-danger-600',
        cancelled: 'text-neutral-500',
      },
    },
    compoundVariants: [
      {
        variant: 'badge',
        status: 'online',
        class: 'bg-success-50 text-success-700',
      },
      {
        variant: 'badge',
        status: 'offline',
        class: 'bg-neutral-50 text-neutral-600',
      },
      {
        variant: 'badge',
        status: 'away',
        class: 'bg-warning-50 text-warning-700',
      },
      {
        variant: 'badge',
        status: 'busy',
        class: 'bg-danger-50 text-danger-700',
      },
      {
        variant: 'pill',
        status: 'active',
        class: 'border-success-200 bg-success-50 text-success-700',
      },
      {
        variant: 'pill',
        status: 'inactive',
        class: 'border-neutral-200 bg-neutral-50 text-neutral-600',
      },
    ],
    defaultVariants: {
      variant: 'dot',
      status: 'active',
    },
  }
);

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusVariants> {
  label?: string;
  showDot?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  variant,
  status,
  label,
  showDot = true,
  className,
  children,
  ...props
}) => {
  const getDotColor = () => {
    switch (status) {
      case 'online':
      case 'active':
      case 'completed':
        return 'bg-success-500';
      case 'offline':
      case 'inactive':
      case 'cancelled':
        return 'bg-neutral-400';
      case 'away':
      case 'pending':
        return 'bg-warning-500';
      case 'busy':
      case 'failed':
        return 'bg-danger-500';
      default:
        return 'bg-neutral-400';
    }
  };

  return (
    <div className={cn(statusVariants({ variant, status }), className)} {...props}>
      {showDot && variant === 'dot' && (
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            getDotColor()
          )}
        />
      )}
      {label || children}
    </div>
  );
};

// Priority Label Component
const priorityVariants = cva(
  'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
  {
    variants: {
      priority: {
        low: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
        medium: 'bg-warning-100 text-warning-700 border border-warning-200',
        high: 'bg-danger-100 text-danger-700 border border-danger-200',
        critical: 'bg-danger-500 text-white border border-danger-600',
      },
    },
    defaultVariants: {
      priority: 'medium',
    },
  }
);

export interface PriorityLabelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof priorityVariants> {
  showIcon?: boolean;
}

export const PriorityLabel: React.FC<PriorityLabelProps> = ({
  priority,
  showIcon = true,
  className,
  children,
  ...props
}) => {
  const getPriorityIcon = () => {
    switch (priority) {
      case 'low':
        return <Icons.ChevronDown className="h-3 w-3" />;
      case 'medium':
        return <Icons.ChevronRight className="h-3 w-3" />;
      case 'high':
        return <Icons.ChevronUp className="h-3 w-3" />;
      case 'critical':
        return <Icons.AlertTriangle className="h-3 w-3" />;
      default:
        return <Icons.ChevronRight className="h-3 w-3" />;
    }
  };

  const getPriorityText = () => {
    switch (priority) {
      case 'low':
        return 'Low Priority';
      case 'medium':
        return 'Medium Priority';
      case 'high':
        return 'High Priority';
      case 'critical':
        return 'Critical';
      default:
        return 'Medium Priority';
    }
  };

  return (
    <div className={cn(priorityVariants({ priority }), className)} {...props}>
      {showIcon && getPriorityIcon()}
      {children || getPriorityText()}
    </div>
  );
};

// Notification Badge Component (with count)
export interface NotificationBadgeProps {
  count?: number;
  max?: number;
  showZero?: boolean;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
  children: React.ReactNode;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  max = 99,
  showZero = false,
  variant = 'danger',
  size = 'md',
  position = 'top-right',
  className,
  children,
}) => {
  const shouldShow = count > 0 || showZero;
  const displayCount = count > max ? `${max}+` : count.toString();

  const badgeClasses = cn(
    'absolute flex items-center justify-center rounded-full text-white text-xs font-bold border-2 border-white',
    {
      // Variant styles
      'bg-danger-500': variant === 'danger',
      'bg-warning-500': variant === 'warning',
      'bg-success-500': variant === 'success',
      'bg-primary-500': variant === 'default',

      // Size styles
      'h-4 w-4 text-xs min-w-[1rem]': size === 'sm',
      'h-5 w-5 text-xs min-w-[1.25rem]': size === 'md',
      'h-6 w-6 text-sm min-w-[1.5rem]': size === 'lg',

      // Position styles
      '-top-1 -right-1': position === 'top-right',
      '-top-1 -left-1': position === 'top-left',
      '-bottom-1 -right-1': position === 'bottom-right',
      '-bottom-1 -left-1': position === 'bottom-left',
    }
  );

  return (
    <div className={cn('relative inline-block', className)}>
      {children}
      {shouldShow && (
        <span className={badgeClasses}>
          {count <= max ? count : `${max}+`}
        </span>
      )}
    </div>
  );
};

// Tag Component (for categorization)
const tagVariants = cva(
  'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
        primary: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
        success: 'bg-success-100 text-success-700 hover:bg-success-200',
        warning: 'bg-warning-100 text-warning-700 hover:bg-warning-200',
        danger: 'bg-danger-100 text-danger-700 hover:bg-danger-200',
        info: 'bg-info-100 text-info-700 hover:bg-info-200',
      },
      interactive: {
        true: 'cursor-pointer',
        false: 'cursor-default',
      },
    },
    defaultVariants: {
      variant: 'default',
      interactive: false,
    },
  }
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({
  variant,
  interactive,
  removable = false,
  onRemove,
  icon,
  className,
  children,
  onClick,
  ...props
}) => {
  return (
    <span
      className={cn(
        tagVariants({ variant, interactive: interactive || !!onClick }),
        className
      )}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 flex-shrink-0 rounded-sm hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-offset-1"
        >
          <Icons.X className="h-3 w-3" />
          <span className="sr-only">Remove</span>
        </button>
      )}
    </span>
  );
};

export default Badge;