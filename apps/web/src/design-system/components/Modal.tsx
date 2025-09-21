import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';
import { Button } from './Button';
import { Heading, Text } from './Typography';

// Modal Backdrop
const backdropVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center',
  {
    variants: {
      blur: {
        none: 'bg-black/50',
        sm: 'bg-black/50 backdrop-blur-sm',
        md: 'bg-black/50 backdrop-blur',
        lg: 'bg-black/50 backdrop-blur-lg',
      },
    },
    defaultVariants: {
      blur: 'sm',
    },
  }
);

// Modal Container
const modalVariants = cva(
  'relative bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden transition-all',
  {
    variants: {
      size: {
        xs: 'w-full max-w-xs',
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
        xl: 'w-full max-w-xl',
        '2xl': 'w-full max-w-2xl',
        '3xl': 'w-full max-w-3xl',
        '4xl': 'w-full max-w-4xl',
        full: 'w-full h-full max-w-none max-h-none rounded-none',
      },
      position: {
        center: 'mx-4',
        top: 'mx-4 mt-16',
        bottom: 'mx-4 mb-16',
      },
    },
    defaultVariants: {
      size: 'md',
      position: 'center',
    },
  }
);

// Hook for managing modal state
export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return { isOpen, open, close, toggle };
};

// Modal Context for compound component pattern
const ModalContext = React.createContext<{
  close: () => void;
}>({
  close: () => {},
});

export const useModalContext = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('Modal compound components must be used within a Modal');
  }
  return context;
};

// Main Modal Component
export interface ModalProps
  extends VariantProps<typeof modalVariants>,
    VariantProps<typeof backdropVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  className?: string;
  backdropClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size,
  position,
  blur,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  preventScroll = true,
  className,
  backdropClassName,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll
  useEffect(() => {
    if (!preventScroll || !isOpen) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, preventScroll]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <ModalContext.Provider value={{ close: onClose }}>
      <div
        className={cn(backdropVariants({ blur }), backdropClassName)}
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className={cn(modalVariants({ size, position }), className)}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body
  );
};

// Modal Header
export interface ModalHeaderProps {
  children: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  showCloseButton = true,
  className,
}) => {
  const { close } = useModalContext();

  return (
    <div className={cn('px-6 py-4 border-b border-neutral-200', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">{children}</div>
        {showCloseButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={close}
            className="ml-4"
          >
            <Icons.X size="sm" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Modal Body
export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className,
  scrollable = true,
}) => {
  return (
    <div
      className={cn(
        'px-6 py-4',
        scrollable && 'overflow-y-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

// Modal Footer
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('px-6 py-4 border-t border-neutral-200 flex justify-end space-x-3', className)}>
      {children}
    </div>
  );
};

// Confirmation Modal (specialized modal)
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader showCloseButton={false}>
        <Heading level={3}>{title}</Heading>
      </ModalHeader>

      <ModalBody>
        <Text variant="body">{message}</Text>
      </ModalBody>

      <ModalFooter>
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// Alert Modal (informational modal)
export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  actionText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  actionText = 'OK',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <Icons.CheckCircle className="text-success-600" />;
      case 'warning': return <Icons.AlertTriangle className="text-warning-600" />;
      case 'error': return <Icons.XCircle className="text-error-600" />;
      default: return <Icons.Info className="text-primary-600" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader showCloseButton={false}>
        <div className="flex items-center space-x-3">
          {getIcon()}
          <Heading level={3}>{title}</Heading>
        </div>
      </ModalHeader>

      <ModalBody>
        <Text variant="body">{message}</Text>
      </ModalBody>

      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          {actionText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default Modal;