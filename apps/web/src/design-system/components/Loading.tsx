import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Loading Spinner
const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    color: {
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      current: 'text-current',
      white: 'text-white',
      neutral: 'text-neutral-600',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

export interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size,
  color,
  className,
}) => {
  return (
    <Icons.Settings
      className={cn(spinnerVariants({ size, color }), className)}
    />
  );
};

// Loading Dots
export interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  color = 'text-primary-600',
  className,
}) => {
  const dotSizes = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            dotSizes[size],
            color
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

// Loading Bar
export interface LoadingBarProps {
  progress?: number;
  indeterminate?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({
  progress = 0,
  indeterminate = false,
  color = 'primary',
  size = 'md',
  className,
}) => {
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colors = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600',
  };

  return (
    <div className={cn('w-full bg-neutral-200 rounded-full overflow-hidden', heights[size], className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300 ease-out',
          colors[color],
          indeterminate && 'animate-pulse'
        )}
        style={{
          width: indeterminate ? '100%' : `${Math.max(0, Math.min(100, progress))}%`,
        }}
      />
    </div>
  );
};

// Loading Overlay
export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  spinner?: React.ReactNode;
  message?: string;
  blur?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  spinner,
  message = 'Loading...',
  blur = true,
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10',
            blur && 'backdrop-blur-sm'
          )}
        >
          {spinner || <LoadingSpinner size="lg" />}
          {message && (
            <p className="mt-4 text-sm text-neutral-600">{message}</p>
          )}
        </div>
      )}
    </div>
  );
};

// Skeleton Components
const skeletonVariants = cva('animate-pulse bg-neutral-200 rounded', {
  variants: {
    variant: {
      text: 'h-4',
      title: 'h-6',
      subtitle: 'h-5',
      button: 'h-10',
      avatar: 'rounded-full',
      card: 'h-32',
      rectangle: '',
      circle: 'rounded-full',
    },
  },
  defaultVariants: {
    variant: 'text',
  },
});

export interface SkeletonProps extends VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant,
  width,
  height,
  className,
}) => {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

// Skeleton Text (multiple lines)
export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
};

// Skeleton Avatar
export interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <Skeleton
      variant="circle"
      className={cn(sizes[size], className)}
    />
  );
};

// Skeleton Card
export interface SkeletonCardProps {
  showAvatar?: boolean;
  showImage?: boolean;
  lines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = false,
  showImage = false,
  lines = 3,
  className,
}) => {
  return (
    <div className={cn('p-6 border border-neutral-200 rounded-lg', className)}>
      {showImage && (
        <Skeleton variant="rectangle" className="w-full h-48 mb-4" />
      )}

      {showAvatar && (
        <div className="flex items-center space-x-3 mb-4">
          <SkeletonAvatar />
          <div className="flex-1">
            <Skeleton variant="title" className="w-1/3 mb-2" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        </div>
      )}

      <Skeleton variant="title" className="w-3/4 mb-3" />
      <SkeletonText lines={lines} />

      <div className="flex items-center justify-between mt-4">
        <Skeleton variant="button" className="w-20" />
        <Skeleton variant="button" className="w-16" />
      </div>
    </div>
  );
};

// Skeleton Table
export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}) => {
  return (
    <div className={cn('border border-neutral-200 rounded-lg overflow-hidden', className)}>
      {showHeader && (
        <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, i) => (
              <Skeleton key={i} variant="text" className="h-4" />
            ))}
          </div>
        </div>
      )}

      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4 border-b border-neutral-200 last:border-b-0">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton key={colIndex} variant="text" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton List
export interface SkeletonListProps {
  items?: number;
  showAvatar?: boolean;
  showIcon?: boolean;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  showAvatar = false,
  showIcon = false,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex items-center space-x-3">
          {showAvatar && <SkeletonAvatar size="sm" />}
          {showIcon && <Skeleton variant="rectangle" className="w-4 h-4" />}
          <div className="flex-1">
            <Skeleton variant="text" className="w-3/4 mb-1" />
            <Skeleton variant="text" className="w-1/2 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Progress Circle
export interface ProgressCircleProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  size = 'md',
  color = 'primary',
  showLabel = false,
  className,
}) => {
  const sizes = {
    sm: { size: 40, strokeWidth: 3 },
    md: { size: 60, strokeWidth: 4 },
    lg: { size: 80, strokeWidth: 5 },
  };

  const colors = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
  };

  const { size: circleSize, strokeWidth } = sizes[size];
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        className="transform -rotate-90"
        width={circleSize}
        height={circleSize}
      >
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-neutral-200"
        />
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-300', colors[color])}
        />
      </svg>

      {showLabel && (
        <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

// Pulse Loading Effect
export interface PulseProps {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  isLoading = false,
  className,
}) => {
  return (
    <div className={cn(isLoading && 'animate-pulse', className)}>
      {children}
    </div>
  );
};

export default LoadingSpinner;