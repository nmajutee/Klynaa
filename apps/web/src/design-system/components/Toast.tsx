import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';
import { Button } from './Button';

// Toast types and interfaces
export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// Toast Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast variants
const toastVariants = cva(
  'relative flex items-start space-x-3 p-4 rounded-lg shadow-lg border transition-all duration-300 transform',
  {
    variants: {
      type: {
        info: 'bg-white border-primary-200 text-primary-800',
        success: 'bg-white border-success-200 text-success-800',
        warning: 'bg-white border-warning-200 text-warning-800',
        error: 'bg-white border-error-200 text-error-800',
      },
      position: {
        'top-right': 'translate-x-0',
        'top-left': 'translate-x-0',
        'bottom-right': 'translate-x-0',
        'bottom-left': 'translate-x-0',
        'top-center': 'translate-x-0',
        'bottom-center': 'translate-x-0',
      },
    },
    defaultVariants: {
      type: 'info',
      position: 'top-right',
    },
  }
);

// Individual Toast Component
interface ToastItemProps extends VariantProps<typeof toastVariants> {
  toast: Toast;
  onRemove: (id: string) => void;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove, position }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast.persistent && toast.duration !== 0) {
      const duration = toast.duration || 5000;
      const timer = setTimeout(() => {
        handleRemove();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.persistent]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Icons.CheckCircle className="text-success-500 flex-shrink-0 mt-0.5" />;
      case 'warning':
        return <Icons.AlertTriangle className="text-warning-500 flex-shrink-0 mt-0.5" />;
      case 'error':
        return <Icons.XCircle className="text-error-500 flex-shrink-0 mt-0.5" />;
      default:
        return <Icons.Info className="text-primary-500 flex-shrink-0 mt-0.5" />;
    }
  };

  const getPositionClasses = () => {
    if (isRemoving) {
      switch (position) {
        case 'top-right':
        case 'bottom-right':
          return 'translate-x-full opacity-0';
        case 'top-left':
        case 'bottom-left':
          return '-translate-x-full opacity-0';
        case 'top-center':
          return '-translate-y-full opacity-0';
        case 'bottom-center':
          return 'translate-y-full opacity-0';
        default:
          return 'translate-x-full opacity-0';
      }
    }

    if (!isVisible) {
      switch (position) {
        case 'top-right':
        case 'bottom-right':
          return 'translate-x-full opacity-0';
        case 'top-left':
        case 'bottom-left':
          return '-translate-x-full opacity-0';
        case 'top-center':
          return '-translate-y-full opacity-0';
        case 'bottom-center':
          return 'translate-y-full opacity-0';
        default:
          return 'translate-x-full opacity-0';
      }
    }

    return 'translate-x-0 translate-y-0 opacity-100';
  };

  return (
    <div
      className={cn(
        toastVariants({ type: toast.type }),
        getPositionClasses(),
        'mb-2 max-w-sm w-full'
      )}
    >
      {getIcon()}

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm mb-1">
            {toast.title}
          </p>
        )}
        <p className="text-sm text-neutral-700">
          {toast.message}
        </p>

        {toast.action && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toast.action.onClick}
              className="text-xs p-1 h-auto"
            >
              {toast.action.label}
            </Button>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        className="p-1 h-auto text-neutral-400 hover:text-neutral-600"
      >
        <Icons.X size="sm" />
      </Button>
    </div>
  );
};

// Toast Container
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position,
}) => {
  const getContainerClasses = () => {
    const baseClasses = 'fixed z-50 pointer-events-none';

    switch (position) {
      case 'top-right':
        return cn(baseClasses, 'top-4 right-4');
      case 'top-left':
        return cn(baseClasses, 'top-4 left-4');
      case 'bottom-right':
        return cn(baseClasses, 'bottom-4 right-4');
      case 'bottom-left':
        return cn(baseClasses, 'bottom-4 left-4');
      case 'top-center':
        return cn(baseClasses, 'top-4 left-1/2 transform -translate-x-1/2');
      case 'bottom-center':
        return cn(baseClasses, 'bottom-4 left-1/2 transform -translate-x-1/2');
      default:
        return cn(baseClasses, 'top-4 right-4');
    }
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <div className={getContainerClasses()}>
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
            position={position}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

// Toast Provider
interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};

// Convenience hooks for different toast types
export const useToastActions = () => {
  const { addToast } = useToast();

  const showSuccess = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ ...options, message, type: 'success' });
  };

  const showError = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ ...options, message, type: 'error' });
  };

  const showWarning = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ ...options, message, type: 'warning' });
  };

  const showInfo = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ ...options, message, type: 'info' });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast: addToast,
  };
};

export default ToastProvider;