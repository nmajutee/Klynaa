import React, { Component, ErrorInfo, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Empty State Component
const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center p-8',
  {
    variants: {
      size: {
        sm: 'py-6 px-4',
        md: 'py-8 px-6',
        lg: 'py-12 px-8',
        xl: 'py-16 px-10',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  title: string;
  description?: string;
  icon?: React.ComponentType<any>;
  illustration?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  size,
  title,
  description,
  icon: Icon,
  illustration,
  action,
  secondaryAction,
  className,
  ...props
}) => {
  return (
    <div className={cn(emptyStateVariants({ size }), className)} {...props}>
      {/* Icon or Illustration */}
      <div className="mb-4">
        {illustration ? (
          illustration
        ) : Icon ? (
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-neutral-100">
            <Icon className="h-6 w-6 text-neutral-400" />
          </div>
        ) : (
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-neutral-100">
            <Icons.Search className="h-6 w-6 text-neutral-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-neutral-600 max-w-sm">
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                action.variant === 'secondary'
                  ? 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500'
                  : 'bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              )}
            >
              {action.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 rounded-md transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    resetError: () => void;
    errorInfo?: ErrorInfo;
  }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;
  private prevResetKeys: Array<string | number> = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.prevResetKeys = props.resetKeys || [];
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== this.prevResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    this.prevResetKeys = resetKeys || [];
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
      });
    }, 0);
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError) {
      if (Fallback) {
        return (
          <Fallback
            error={error}
            resetError={this.resetErrorBoundary}
            errorInfo={errorInfo}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={error}
          resetError={this.resetErrorBoundary}
          errorInfo={errorInfo}
        />
      );
    }

    return children;
  }
}

// Default Error Fallback Component
interface DefaultErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  errorInfo?: ErrorInfo;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-danger-100">
          <Icons.AlertTriangle className="h-6 w-6 text-danger-500" />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-neutral-600 max-w-md">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm font-medium text-neutral-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-danger-600 bg-danger-50 p-3 rounded-md overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>

      <button
        onClick={resetError}
        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
};

// No Data Component
export interface NoDataProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<any>;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const NoData: React.FC<NoDataProps> = ({
  title = "No data available",
  description = "There's nothing to display at the moment.",
  icon: Icon = Icons.Search,
  action,
  className,
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={Icon}
      action={action}
      size="md"
      className={className}
    />
  );
};

// Loading Fallback Component
export interface LoadingFallbackProps {
  title?: string;
  description?: string;
  variant?: 'spinner' | 'skeleton' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  title = "Loading...",
  description,
  variant = 'spinner',
  size = 'md',
  className,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-6 px-4';
      case 'md':
        return 'py-8 px-6';
      case 'lg':
        return 'py-12 px-8';
      default:
        return 'py-8 px-6';
    }
  };

  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'h-6 w-6';
      case 'md':
        return 'h-8 w-8';
      case 'lg':
        return 'h-10 w-10';
      default:
        return 'h-8 w-8';
    }
  };

  const renderContent = () => {
    switch (variant) {
      case 'spinner':
        return (
          <>
            <div className="mb-4">
              <div className={cn('animate-spin text-primary-600 mx-auto', getSpinnerSize())}>
                <Icons.Settings className="h-full w-full" />
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
              {description && (
                <p className="text-sm text-neutral-600 mt-2 max-w-sm">{description}</p>
              )}
            </div>
          </>
        );

      case 'skeleton':
        return (
          <div className="w-full max-w-md mx-auto space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto mb-3"></div>
              <div className="h-3 bg-neutral-200 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-3 bg-neutral-200 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        );

      case 'pulse':
        return (
          <div className="w-full max-w-sm mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-12 w-12 bg-neutral-200 rounded-full mx-auto"></div>
              <div className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', getSizeClasses(), className)}>
      {renderContent()}
    </div>
  );
};

// Network Error Component
export interface NetworkErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  title = "Connection Error",
  description = "Unable to connect to the server. Please check your internet connection and try again.",
  onRetry,
  className,
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={Icons.AlertTriangle}
      action={
        onRetry
          ? {
              label: "Try Again",
              onClick: onRetry,
            }
          : undefined
      }
      className={className}
    />
  );
};

// Not Found Component
export interface NotFoundProps {
  title?: string;
  description?: string;
  onGoHome?: () => void;
  className?: string;
}

export const NotFound: React.FC<NotFoundProps> = ({
  title = "Page Not Found",
  description = "The page you're looking for doesn't exist or has been moved.",
  onGoHome,
  className,
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={Icons.Search}
      action={
        onGoHome
          ? {
              label: "Go Home",
              onClick: onGoHome,
            }
          : undefined
      }
      size="lg"
      className={className}
    />
  );
};

// Access Denied Component
export interface AccessDeniedProps {
  title?: string;
  description?: string;
  onGoBack?: () => void;
  className?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = "Access Denied",
  description = "You don't have permission to view this page. Please contact an administrator if you think this is an error.",
  onGoBack,
  className,
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={Icons.XCircle}
      action={
        onGoBack
          ? {
              label: "Go Back",
              onClick: onGoBack,
            }
          : undefined
      }
      className={className}
    />
  );
};

// Maintenance Mode Component
export interface MaintenanceModeProps {
  title?: string;
  description?: string;
  estimatedTime?: string;
  className?: string;
}

export const MaintenanceMode: React.FC<MaintenanceModeProps> = ({
  title = "Under Maintenance",
  description = "We're currently performing scheduled maintenance to improve your experience.",
  estimatedTime,
  className,
}) => {
  return (
    <EmptyState
      title={title}
      description={
        estimatedTime
          ? `${description} Expected completion: ${estimatedTime}`
          : description
      }
      icon={Icons.Settings}
      size="lg"
      className={className}
    />
  );
};

export default EmptyState;